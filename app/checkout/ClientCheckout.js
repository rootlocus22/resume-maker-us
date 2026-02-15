"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDoc, increment } from "firebase/firestore";
import toast from "react-hot-toast";
import { event, GOOGLE_ADS_ID } from "../lib/gtag";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Shield, Zap, BadgeCheck, Lock, ArrowLeft, Sparkles, Users, Bell, X,
  BookOpen, Bot, DollarSign, Star, Trophy, Clock, Target, TrendingUp, Award,
  MessageCircle, Phone, Mail, Heart, Gift, Rocket, Crown, AlertCircle, ChevronRight, ChevronDown,
  PlayCircle, FileText, BarChart3, Briefcase, GraduationCap, ThumbsUp, ArrowRight,
  CreditCard, Download, File, MessageSquare, Upload, Brain, Edit, Move, Tag, Info, XCircle
} from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { onAuthStateChanged } from "firebase/auth";
import { validateReferralCode, getReferralCodeDetails, REFERRAL_CODES } from "../lib/referralCodes";
import { getEffectivePricing, formatPrice, getSupportedCurrencies } from "../lib/globalPricing";
import CurrencySwitcher from "../components/CurrencySwitcher";
import CouponField from "../components/CouponField";
import AddonInfoTooltip from "../components/AddonInfoTooltip";
import { PLAN_CONFIG, ADDON_CONFIG, getPlanConfig, getOriginalPrice, getDiscountedPrice, getDiscountPercentage, isDiscountEnabled, getCouponCode } from "../lib/planConfig";
import { useIsAndroidUser } from "../lib/deviceDetection";
// Removed PostPurchaseUpsellModal as add-ons are now bundled

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Stripe Checkout: No client-side script loading needed.
// Payment is handled via server-side Checkout Sessions with redirect.

export default function ClientCheckout({
  initialBillingCycle = "quarterly", // Default to Quarterly plan (Best Value)
}) {
  const router = useRouter();
  const { isAndroid } = useIsAndroidUser();
  const searchParams = useSearchParams();
  const { currency: contextCurrency, isLoadingGeo } = useLocation();

  // Check if Job Search add-on is requested (for existing premium users only)
  // This should ONLY be true when buying ONLY the job tracker (no plan/billingCycle)
  const billingCycleParam = searchParams.get('billingCycle');

  // Standalone Add-on Mode Detection
  const addonParam = searchParams.get('addon'); // 'job_search', 'interview_kit', 'apply_pro'
  const isStandaloneAddon = !!addonParam && !!ADDON_CONFIG[addonParam];

  // No longer using isAddonOnlyPurchase as add-ons are bundled

  const isJobTrackerOnlyPurchase = !billingCycleParam && (
    searchParams.get('addJobTracker') === 'true' ||
    (typeof window !== 'undefined' && sessionStorage.getItem('addJobTrackerFeature') === 'true')
  );

  // Get job search duration and amount from URL params (for standalone job search purchases)
  const jobTrackerDuration = searchParams.get('duration'); // '1month', '3months', '6months'
  const jobTrackerAmount = searchParams.get('amount'); // Amount in INR

  // US product: USD only
  const effectiveCurrency = 'USD';

  const initialStepParam = searchParams.get('step');
  const billingCycleParamRaw = searchParams.get('billingCycle');
  // Auto-forward to step 2 if billingCycle is provided (and step not explicitly set to 1)
  const defaultStep = initialStepParam
    ? parseInt(initialStepParam)
    : (billingCycleParamRaw ? 2 : 1);
  const [step, setStep] = useState(defaultStep);
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle);
  const [couponCode, setCouponCode] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState(0);

  // Standalone Add-on: Force relevant toggle on and others off if standalone
  const includeJobSearchParam = searchParams.get('includeJobSearch') || searchParams.get('includeJobTracker');
  const [includeJobTracker, setIncludeJobTracker] = useState(
    isStandaloneAddon ? addonParam === 'job_search' : (includeJobSearchParam === 'true')
  );

  const includeInterviewKitParam = searchParams.get('includeInterviewKit');
  const [includeInterviewKit, setIncludeInterviewKit] = useState(
    isStandaloneAddon ? addonParam === 'interview_kit' : (includeInterviewKitParam === 'true' ? true : false)
  );

  const includeApplyProParam = searchParams.get('includeApplyPro');
  const [includeApplyPro, setIncludeApplyPro] = useState(
    isStandaloneAddon ? addonParam === 'apply_pro' : (includeApplyProParam === 'true')
  );

  // Auto-switch addon toggles if user switches main addon in standalone mode (not common but robust)
  useEffect(() => {
    if (isStandaloneAddon) {
      setIncludeJobTracker(addonParam === 'job_search');
      setIncludeInterviewKit(addonParam === 'interview_kit');
      setIncludeApplyPro(addonParam === 'apply_pro');
    }
  }, [addonParam, isStandaloneAddon]);

  // Global backup for coupon code to prevent loss during payment flow
  const [globalCouponCode, setGlobalCouponCode] = useState("");

  // Payment processing state
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'processing', 'success', 'failed', 'cancelled'

  // Track coupon code changes and update global backup
  useEffect(() => {
    if (couponCode) {
      setGlobalCouponCode(couponCode);
    }
  }, [couponCode]);

  // Discount auto-apply removed - now gamified in step 2

  // oneDay plan can now have discount applied (removed restriction)

  const [couponError, setCouponError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({ name: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [userAgent, setUserAgent] = useState("");
  const [userId, setUserId] = useState(null); // Changed from const to state variable
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // New state for exit discount
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralDiscountApplied, setReferralDiscountApplied] = useState(false);
  const [hasStoredReferralCode, setHasStoredReferralCode] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false); // Checkout Pivot: Phase 2 Retry Mechanism


  // Handle currency change
  const handleCurrencyChange = (newCurrency) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('currency', newCurrency);
    window.history.replaceState({}, '', currentUrl.toString());
  };

  // Handle coupon application
  const handleCouponApplied = (coupon) => {
    setSelectedDiscount(coupon.discount);
    setCouponCode(coupon.code);
    toast.success(`🎉 Coupon ${coupon.code} applied! ${coupon.discount * 100}% OFF!`);
    event({ action: "coupon_applied", category: "Checkout", label: coupon.code, value: coupon.discount });
  };

  const handleCouponRemoved = () => {
    setSelectedDiscount(0);
    setCouponCode("");
    toast.success("Coupon removed successfully");
  };

  // Update mobile device detection on mount and resize
  useEffect(() => {
    function updateMobile() {
      setIsMobileDevice(window.innerWidth < 768);
    }
    updateMobile();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateMobile);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateMobile);
      }
    };
  }, []);

  // Device detection effect for Android
  useEffect(() => {
    const detectAndroid = () => {
      if (typeof window !== "undefined" && navigator.userAgent) {
        const isAndroid = /Android/i.test(navigator.userAgent);
        setIsAndroidDevice(isAndroid);
      }
    };

    detectAndroid();
  }, []);

  // Handle referral code discount
  useEffect(() => {
    if (typeof window !== "undefined" && !referralDiscountApplied) {
      const storedReferralCode = localStorage.getItem('referralCode');

      if (storedReferralCode) {
        const validation = validateReferralCode(storedReferralCode, billingCycle);

        if (validation.isValid) {
          const codeDetails = validation.codeDetails;
          setReferralCode(storedReferralCode);

          // Apply discount based on referral code configuration
          setSelectedDiscount(codeDetails.discountPercentage);
          setCouponCode(storedReferralCode);
          setCouponError("");
          setReferralDiscountApplied(true);

          // Show success message
          toast.success(`🎉 Referral code ${storedReferralCode} applied! ${codeDetails.discountPercentage * 100}% OFF!`);

          // Track the application
          event({
            action: "referral_discount_applied",
            category: "Checkout",
            label: storedReferralCode,
            value: billingCycle === 'monthly' ? (pricing.monthly / 100) * codeDetails.discountPercentage : (pricing.yearly / 100) * codeDetails.discountPercentage
          });
        }
      }
    }
  }, [billingCycle, referralDiscountApplied]);






  // Check for stored referral code on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedReferralCode = localStorage.getItem('referralCode');
      setHasStoredReferralCode(!!storedReferralCode);

      // Listen for storage changes
      const handleStorageChange = (e) => {
        if (e.key === 'referralCode') {
          setHasStoredReferralCode(!!e.newValue);
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  // Job Search addon pricing (in paise for INR, cents for USD)
  // Job Search addon pricing - derived from planConfig
  // Job Search addon pricing - Bundled in Pro plans
  const getJobTrackerPrice = (cycle) => {
    return 0;
  };

  // Interview Kit addon pricing - Bundled in 6-Month plan
  const getInterviewKitPrice = (cycle) => {
    return 0;
  };

  // Plan definitions with hierarchy for upgrades - NEW PRICING STRUCTURE
  const pricing = useMemo(() => {
    return getEffectivePricing(effectiveCurrency);
  }, [effectiveCurrency]);

  // Memoize plan definitions to ensure stable reference
  const planDefinitions = useMemo(() => ({

    basic: {
      name: "Starter (Trial Pack)",
      originalPrice: pricing.basic / 100, // ₹49
      anchorPrice: PLAN_CONFIG.basic.anchorPrice[effectiveCurrency] / 100,
      duration: getPlanConfig("basic").duration,
      planType: 'basic',
      hierarchy: 2, // Second tier
      downloads: getPlanConfig("basic").downloads,
      canAddJobTracker: false, // Job search not available for basic
      canAddInterviewKit: false // Interview Kit not available for basic
    },
    monthly: {
      name: "Pro (Job Seeker's Choice)",
      originalPrice: pricing.monthly / 100, // ₹299
      anchorPrice: PLAN_CONFIG.monthly.anchorPrice[effectiveCurrency] / 100,
      duration: 30,
      planType: 'monthly',
      hierarchy: 3, // Third tier
      downloads: 'unlimited',
      hasAdvancedFeatures: true, // JD Builder, AI Interview, Salary Analyzer, AI Career Coach
      canAddJobTracker: true,
      jobTrackerPrice: getJobTrackerPrice('monthly') / 100, // Display price
      canAddInterviewKit: true,
      interviewKitPrice: getInterviewKitPrice('monthly') / 100
    },
    quarterly: {
      name: "Expert (Career Growth Bundle)",
      originalPrice: pricing.quarterly / 100, // ₹399
      anchorPrice: PLAN_CONFIG.quarterly.anchorPrice[effectiveCurrency] / 100,
      duration: 90,
      planType: 'quarterly',
      hierarchy: 3.5, // Between monthly and sixMonth
      downloads: 'unlimited',
      hasAdvancedFeatures: true, // JD Builder, AI Interview, Salary Analyzer, AI Career Coach
      canAddJobTracker: true,
      jobTrackerPrice: getJobTrackerPrice('quarterly') / 100, // Display price
      canAddInterviewKit: true,
      interviewKitPrice: getInterviewKitPrice('quarterly') / 100
    },
    sixMonth: {
      name: "Ultimate (Complete Success Kit)",
      originalPrice: pricing.sixMonth / 100, // ₹499
      anchorPrice: PLAN_CONFIG.sixMonth.anchorPrice[effectiveCurrency] / 100,
      duration: 180,
      planType: 'sixMonth',
      hierarchy: 4, // Highest tier
      downloads: 'unlimited',
      hasAdvancedFeatures: true, // JD Builder, AI Interview, Salary Analyzer, AI Career Coach
      canAddJobTracker: true,
      jobTrackerPrice: getJobTrackerPrice('sixMonth') / 100, // Display price
      canAddInterviewKit: true,
      interviewKitPrice: getInterviewKitPrice('sixMonth') / 100
    },
    interview_gyani: {
      name: "AI Interview Pro",
      originalPrice: pricing.interview_gyani / 100,
      duration: 30,
      planType: 'interview_gyani',
      hierarchy: 5,
      downloads: 0,
    }
  }), [pricing]); // Depend on pricing which includes currency changes

  // State for user's current plan
  const [userCurrentPlan, setUserCurrentPlan] = useState(null);
  const [userPlanExpiry, setUserPlanExpiry] = useState(null);

  // Fetch user's current plan data
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (userId && auth.currentUser) {
        try {
          const userRef = doc(db, "users", userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserCurrentPlan(userData.plan || null);
            setUserPlanExpiry(userData.premium_expiry || null);
          }
        } catch (error) {
          console.error("Error fetching user plan:", error);
        }
      }
    };

    fetchUserPlan();
  }, [userId]);

  // Create plans array for display with upgrade logic - NO MEMOIZATION (like PricingClient)
  // This ensures it re-renders on every state change including includeJobTracker
  // CONVERSION PIVOT: Filter to only show Starter (basic), Quarterly, and 6-Month plans
  let allPlansArray = Object.entries(planDefinitions)
    .filter(([key]) => ['basic', 'quarterly', 'sixMonth', 'interview_gyani'].includes(key))
    .map(([billingCycle, plan]) => ({ ...plan, billingCycle }));

  // Add disabled state to current plan (don't filter, just mark as disabled)
  if (userCurrentPlan && userCurrentPlan !== "free" && userCurrentPlan !== "anonymous") {
    const currentPlanHierarchy = planDefinitions[userCurrentPlan]?.hierarchy || 0;

    // Mark current plan as disabled instead of filtering it out
    allPlansArray = allPlansArray.map(plan => ({
      ...plan,
      isCurrentPlan: plan.billingCycle === userCurrentPlan,
      isDisabled: plan.billingCycle === userCurrentPlan
    }));
  }

  // State for Pro Plan internal selection (Enhancv Style)
  const [proBillingCycle, setProBillingCycle] = useState('quarterly');

  // Sync proBillingCycle with main billingCycle when not basic
  useEffect(() => {
    if (billingCycle !== 'basic') {
      setProBillingCycle(billingCycle);
    }
  }, [billingCycle]);

  // Handle Pro Tab Change
  const handleProTabChange = (cycle) => {
    setProBillingCycle(cycle);
    setBillingCycle(cycle); // Update main billing cycle state
  };

  // Add-on Config for Standalone Display
  const currentAddonConfig = isStandaloneAddon ? ADDON_CONFIG[addonParam] : null;
  const AddonIcon = currentAddonConfig ? {
    job_search: Target,
    interview_kit: Zap,
    apply_pro: Sparkles,
    profile_slot: Users
  }[addonParam] : null;


  const plans = allPlansArray;

  // DISABLE DISCOUNT FEATURES
  const DISCOUNT_FEATURE_ENABLED = true;

  // Centralized Pricing Logic - Extracted for use across layout columns
  // isAddonOnlyPurchase = user already paid for plan (from PostPurchaseUpsellModal), only charging for addons
  const basePlanPrice = isStandaloneAddon ? 0 : pricing[billingCycle];

  // Bundling Logic:
  // Quarterly: Includes Job Search
  // SixMonth: Includes Job Search + Interview Kit + Apply Pro (if applicable)
  const isJobSearchIncluded = ['quarterly', 'sixMonth'].includes(billingCycle);
  const isInterviewKitIncluded = ['quarterly', 'sixMonth'].includes(billingCycle);

  // Addon Price Logic:
  // Only charge if NOT bundled and NOT standalone (unless specifically selected for standalone)
  // Since we are removing add-on checkboxes, we generally assume they are NOT added for Monthly unless bundled.

  const jobTrackerAddonPrice = 0; // Always 0 for plans now as it is bundled or not available
  const interviewKitAddonPrice = 0; // Always 0 for plans now
  const applyProAddonPrice = 0; // Now bundled for free
  // Profile slot price: Use ADDON_CONFIG price for standalone purchases, otherwise 0
  const profileSlotPrice = useMemo(() => {
    if (isStandaloneAddon && addonParam === 'profile_slot') {
      // Ensure we have a valid currency (fallback to INR if not set)
      const currency = effectiveCurrency || contextCurrency || 'INR';
      const price = ADDON_CONFIG.profile_slot?.price[currency];
      console.log('🔍 Profile Slot Price Calculation:', {
        isStandaloneAddon,
        addonParam,
        effectiveCurrency,
        contextCurrency,
        currency,
        price,
        availableCurrencies: Object.keys(ADDON_CONFIG.profile_slot?.price || {}),
        config: ADDON_CONFIG.profile_slot
      });
      return price || 0;
    }
    return 0;
  }, [isStandaloneAddon, addonParam, effectiveCurrency, contextCurrency]);

  // Update State to reflect bundled features (for logging/email)
  useEffect(() => {
    if (isStandaloneAddon) return; // Don't auto-bundle items in standalone mode

    if (['quarterly', 'sixMonth'].includes(billingCycle)) {
      setIncludeJobTracker(true);
      setIncludeInterviewKit(true);
      setIncludeApplyPro(true);
    } else if (billingCycle === 'monthly') {
      setIncludeJobTracker(true); // Monthly gets 1 tool: AI Job Search
      setIncludeInterviewKit(false);
      setIncludeApplyPro(false);
    } else {
      // Basic or other plans
      setIncludeJobTracker(false);
      setIncludeInterviewKit(false);
      setIncludeApplyPro(false);
    }
  }, [billingCycle, isStandaloneAddon]);


  // 1. Subtotal (Base plan + add-ons)
  const subtotalBase = basePlanPrice + jobTrackerAddonPrice + interviewKitAddonPrice + applyProAddonPrice + profileSlotPrice;

  // 2. Flat Discount (Applied on TOTAL order - base + addons)
  // Discounts only enabled when add-ons are added
  const addonsTotal = jobTrackerAddonPrice + interviewKitAddonPrice + applyProAddonPrice + profileSlotPrice;
  const discountAmount = selectedDiscount
    ? Math.round(subtotalBase * selectedDiscount)
    : 0;

  // 3. Taxable Amount (after discount)
  const taxableAmount = subtotalBase - discountAmount;

  // 4. GST (18% on Taxable Amount) - Only for INR
  // GST removed for INR - Sachet Strategy (All-Inclusive)
  const gstAmount = 0;

  // 5. Final Total (Rounded to nearest Rupee)
  const finalTotal = Math.round((taxableAmount + gstAmount) / 100) * 100;

  // Debug logging for profile slot purchases
  if (isStandaloneAddon && addonParam === 'profile_slot') {
    console.log('🔍 Profile Slot Purchase Debug:', {
      isStandaloneAddon,
      addonParam,
      profileSlotPrice,
      basePlanPrice,
      subtotalBase,
      discountAmount,
      taxableAmount,
      gstAmount,
      finalTotal,
      effectiveCurrency,
      'ADDON_CONFIG.profile_slot': ADDON_CONFIG.profile_slot
    });
  }

  // Calculate original total (before discount) including GST for better savings display
  const originalSubtotal = basePlanPrice + addonsTotal;
  // GST removed for consistency in savings logic
  const originalGST = 0;
  const originalTotalWithGST = originalSubtotal + originalGST;
  const totalSavings = discountAmount;

  // Remove all discount/coupon UI and logic if feature is off
  const discountOptions = DISCOUNT_FEATURE_ENABLED ? [
    { code: "SAVE10", value: 0.10, label: "10% OFF", maxUses: 1000 },
    { code: "SAVE15", value: 0.15, label: "15% OFF", maxUses: 500 },
    { code: "SAVE20", value: 0.20, label: "20% OFF", maxUses: 200 },
    { code: "YOGESH10", value: 0.10, label: "10% OFF - Yogesh", maxUses: 500, hidden: true },
    { code: "YOGESH20", value: 0.20, label: "20% OFF - Yogesh", maxUses: 500, hidden: true },
    { code: "YOGESH30", value: 0.30, label: "30% OFF - Yogesh", maxUses: 500, hidden: true },
    { code: "AVINASH10", value: 0.10, label: "10% OFF - Avinash", maxUses: 500, hidden: true },
    { code: "AVINASH20", value: 0.20, label: "20% OFF - Avinash", maxUses: 500, hidden: true },
    { code: "AVINASH30", value: 0.30, label: "30% OFF - Avinash", maxUses: 500, hidden: true },
  ] : [];

  useEffect(() => {
    // Handle URL query parameters for billingCycle ONCE on mount
    const cycle = searchParams.get("billingCycle");

    // Billing cycle validation - no device bias
    const isValidCycle = (requestedCycle) => {
      if (!requestedCycle || !["basic", "monthly", "quarterly", "sixMonth", "interview_gyani"].includes(requestedCycle)) {
        return false;
      }
      return true;
    };

    if (isValidCycle(cycle)) {
      setBillingCycle(cycle);
    } else {
      // Default to Quarterly plan (Best Value)
      const defaultCycle = "quarterly";
      setBillingCycle(defaultCycle);
    }

    // Initialize user data and timers
    setUserAgent(typeof window !== "undefined" ? navigator.userAgent || "Unknown" : "Unknown");
    if (userId && auth.currentUser) {
      setPaymentDetails({
        name: auth.currentUser.displayName || "",
        email: auth.currentUser.email || "",
        phone: "",
      });
    }
    // Detect small screen size
    const handleResize = () => {
      setIsSmallScreen(typeof window !== "undefined" && window.innerHeight < 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [userId, router, searchParams, isAndroidDevice]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthLoading(false);
      if (user) {
        setUserId(user.uid); // Update userId when user is authenticated
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Helper function to get current plan name
  const getCurrentPlanName = () => {
    // Otherwise use the regular plan names
    return planDefinitions[billingCycle]?.name ||
      (billingCycle === "yearly" ? "Annual Pro" :
        billingCycle === "sixMonth" ? "6-Month Pro" :
          billingCycle === "quarterly" ? "Quarterly Pro" :
            "Monthly Pro");
  };




  const validateCoupon = async (fromPopup = false, overrideCode = null) => {
    const codeToValidate = (overrideCode || couponCode || '').toUpperCase();

    // Mapping RESOLUTION2026 to SAVE20 as per user request (convert it)
    let effectiveCode = codeToValidate;
    if (codeToValidate === 'RESOLUTION2026') {
      effectiveCode = 'SAVE20';
    }

    // Allow SAVE10, SAVE15, SAVE20 coupons for plans when discount is enabled
    if (isDiscountEnabled() && ["SAVE10", "SAVE15", "SAVE20"].includes(effectiveCode)) {
      const discountMap = { "SAVE10": 0.10, "SAVE15": 0.15, "SAVE20": 0.20 };
      const discountPercentage = discountMap[effectiveCode] * 100;
      if (discountPercentage > 0) {
        setCouponError("");
        setSelectedDiscount(discountMap[effectiveCode]);
        setCouponCode(effectiveCode);
        toast.success(`🎉 ${codeToValidate} applied! ${discountPercentage}% OFF!`);
        event({ action: "coupon_applied", category: "Checkout", label: codeToValidate, value: discountMap[codeToValidate] });
        return true;
      }
    }

    // Only allow other coupons for monthly and yearly plans
    if (billingCycle === "basic") {
      setCouponError("Coupons are only available for Pro Monthly and Pro Yearly plans.");
      setSelectedDiscount(0);
      event({ action: "coupon_failed", category: "Checkout", label: `${billingCycle} Plan` });
      return false;
    }

    // Check for regular coupons first
    const coupon = discountOptions.find((d) => d.code === codeToValidate);
    if (coupon) {


      try {
        const couponRef = collection(db, "coupon_uses");
        await addDoc(couponRef, {
          code: codeToValidate,
          userId,
          email: paymentDetails.email,
          timestamp: serverTimestamp(),
        });
        setCouponError("");
        setSelectedDiscount(coupon.value);
        setCouponCode(codeToValidate);

        // Store coupon code in sessionStorage as backup
        if (typeof window !== "undefined") {
          sessionStorage.setItem('appliedCouponCode', codeToValidate);
          sessionStorage.setItem('appliedDiscount', coupon.value.toString());
        }

        toast.success(`${coupon.label} applied!`);
        event({ action: "coupon_applied", category: "Checkout", label: codeToValidate, value: coupon.value });
        return true;
      } catch (error) {
        setCouponError("Coupon limit reached or already used.");
        setSelectedDiscount(0);
        toast.error("Coupon limit reached or already used.");
        event({ action: "coupon_failed", category: "Checkout", label: codeToValidate });
        return false;
      }
    }

    // Check for popup-specific coupons
    if (fromPopup && codeToValidate === "SAVE10") {
      setCouponError("");
      setSelectedDiscount(0.20);
      return true;
    }

    // Check for referral code last (only if not a regular coupon)
    const validation = validateReferralCode(codeToValidate, billingCycle);
    if (validation.isValid) {
      const codeDetails = validation.codeDetails;
      setCouponError("");
      setSelectedDiscount(codeDetails.discountPercentage);
      setReferralCode(codeToValidate);
      setReferralDiscountApplied(true);
      toast.success(`🎉 Referral code ${codeToValidate} applied! ${codeDetails.discountPercentage * 100}% OFF!`);
      event({ action: "referral_code_applied", category: "Checkout", label: codeToValidate, value: codeDetails.discountPercentage });
      return true;
    } else if (validation.error) {
      setCouponError(validation.error);
      setSelectedDiscount(0);
      event({ action: "referral_code_failed", category: "Checkout", label: `${billingCycle} Plan` });
      return false;
    }

    // If we get here, it's an invalid code
    setCouponError("Invalid coupon code.");
    setSelectedDiscount(0);
    event({ action: "coupon_failed", category: "Checkout", label: codeToValidate });
    return false;
  };

  const sendEmail = (templateId, additionalData = {}) => {
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId,
        userId,
        data: {
          ...additionalData,
          amount: billingCycle === "trial" ? pricing[billingCycle] : selectedDiscount
            ? Math.round((pricing[billingCycle] / 100) * (1 - selectedDiscount)) * 100
            : pricing[billingCycle],
          currency: effectiveCurrency,
          billingCycle: billingCycle, // Add billing cycle for email templates
          noAutoDeduction: "🔒 No Auto-Deduction! You'll receive a payment reminder before your next billing date. Pay only when you decide.",
        },
      }),
    }).catch((err) => console.error(`Failed to send ${templateId} email:`, err));
  };

  const logPaymentAttempt = async (status, orderId, paymentId, signature, error, cancellationReason, overrideCouponCode = null, overrideDiscount = null) => {
    // Use override values if provided, otherwise use current state
    const effectiveCouponCode = overrideCouponCode || couponCode;
    const effectiveDiscount = overrideDiscount || selectedDiscount;

    // Determine the actual coupon code that was applied
    let appliedCouponCode = null;
    if (effectiveCouponCode && effectiveCouponCode.trim()) {
      appliedCouponCode = effectiveCouponCode.trim();
    } else if (effectiveDiscount > 0) {
      // If no coupon code but discount exists, try to identify the source
      if (referralCode && referralDiscountApplied) {
        appliedCouponCode = `REFERRAL_${referralCode}`;
      } else if (effectiveDiscount === 0.1) {
        appliedCouponCode = 'SAVE10';
      } else if (effectiveDiscount === 0.2) {
        appliedCouponCode = 'YOGESH20_OR_AVINASH20';
      } else if (effectiveDiscount === 0.3) {
        appliedCouponCode = 'YOGESH30_OR_AVINASH30';
      }
    }

    // If still no coupon code but we have a discount, try to infer from the discount amount
    if (!appliedCouponCode && effectiveDiscount > 0) {
      if (effectiveDiscount === 0.1) {
        appliedCouponCode = 'INFERRED_SAVE10';
      } else if (effectiveDiscount === 0.2) {
        appliedCouponCode = 'INFERRED_YOGESH20_OR_AVINASH20';
      } else if (effectiveDiscount === 0.3) {
        appliedCouponCode = 'INFERRED_YOGESH30_OR_AVINASH30';
      }
    }

    // Get referrer data from localStorage
    let referrerData = null;
    if (typeof window !== 'undefined') {
      try {
        const storedReferrer = localStorage.getItem('expertresume_referrer');
        if (storedReferrer) {
          referrerData = JSON.parse(storedReferrer);
        }
      } catch (e) {
        console.error('Error parsing referrer data:', e);
      }
    }

    try {
      // Use the pre-calculated final total and component prices from the render scope
      // to ensure absolute consistency between what we charge and what we log.

      const paymentLogData = {
        userId,
        userInfo: paymentDetails,
        userAgent,
        billingCycle: isStandaloneAddon && addonParam === 'profile_slot' ? "Lifetime" : billingCycle,
        currency: effectiveCurrency,
        amount: finalTotal, // Use the actual final total charged
        baseAmount: basePlanPrice,
        jobSearchAddon: (includeJobTracker || (isStandaloneAddon && addonParam === 'job_search')) && !isJobTrackerOnlyPurchase,
        jobSearchAddonAmount: jobTrackerAddonPrice,
        interviewKitAddon: (includeInterviewKit || (isStandaloneAddon && addonParam === 'interview_kit')) && !isJobTrackerOnlyPurchase,
        interviewKitAddonAmount: interviewKitAddonPrice,
        applyProAddon: (includeApplyPro || (isStandaloneAddon && addonParam === 'apply_pro')),
        applyProAddonAmount: applyProAddonPrice,
        profileSlotAddon: (isStandaloneAddon && addonParam === 'profile_slot'),
        profileSlotAmount: profileSlotPrice,
        discount: selectedDiscount,
        discountAmount: discountAmount,
        taxableAmount: taxableAmount,
        gstAmount: gstAmount,
        status,
        orderId: orderId || "Not created",
        paymentId: paymentId || "Not available",
        signature: signature || "Not available",
        error: error ? error.message : null,
        cancellationReason: cancellationReason || null,
        referredBy: referralCode || null,
        referralDiscount: referralDiscountApplied ? selectedDiscount : 0,
        // Referrer tracking data
        acquisitionSource: referrerData?.source || 'unknown',
        acquisitionMedium: referrerData?.medium || 'unknown',
        acquisitionCampaign: referrerData?.campaign || null,
        acquisitionTerm: referrerData?.term || null,
        acquisitionContent: referrerData?.content || null,
        acquisitionReferrerUrl: referrerData?.referrerUrl || null,
        acquisitionLandingPage: referrerData?.landingPage || null,
        acquisitionTimestamp: referrerData?.timestamp || null,
        gclid: referrerData?.gclid || null, // Google Ads Click ID
        fbclid: referrerData?.fbclid || null, // Facebook Ads Click ID
        timestamp: serverTimestamp(),
      };

      // Explicitly add couponCode field
      if (appliedCouponCode) {
        paymentLogData.couponCode = appliedCouponCode;
      } else {
        paymentLogData.couponCode = null; // Explicitly set to null
      }

      // Use server-side API for logging to bypass client-side rules and ensure robustness
      const response = await fetch('/api/payment-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentLogData)
      });

      if (response.ok) {
        console.log('✅ Payment logged successfully via API');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to log payment via API:', errorData.error);
      }
    } catch (error) {
      console.error("Failed to log payment attempt:", error);
    }
  };

  const handlePaymentSubmit = async () => {
    const { email, name } = paymentDetails;
    if (!name || !email || !email.includes("@")) {
      toast.error("Please provide a valid name and email.");
      await logPaymentAttempt("failed", null, null, null, new Error("Invalid input"), null);
      event({ action: "form_validation_failed", category: "Checkout", label: "Step 2" });
      return;
    }
    if (!userId) {
      toast.error("Please sign in first.");
      router.push("/login");
      event({ action: "unauthenticated_checkout_attempt", category: "Checkout", label: "Step 2" });
      return;
    }

    setIsLoading(true);

    // Capture coupon code at payment initiation
    let capturedCouponCode = couponCode || globalCouponCode;
    let capturedDiscount = selectedDiscount;

    if (typeof window !== "undefined" && (!capturedCouponCode || !capturedDiscount)) {
      const storedCouponCode = sessionStorage.getItem('appliedCouponCode');
      const storedDiscount = sessionStorage.getItem('appliedDiscount');
      if (storedCouponCode && storedDiscount) {
        capturedCouponCode = capturedCouponCode || storedCouponCode;
        capturedDiscount = capturedDiscount || parseFloat(storedDiscount);
      }
    }

    try {
      // Use global consistent total
      const finalAmount = finalTotal;

      console.log('💳 Stripe Payment (Using Global Total):', {
        finalAmount,
        currency: effectiveCurrency
      });

      // Validate amount
      if (!finalAmount || finalAmount <= 0 || isNaN(finalAmount)) {
        toast.error("Invalid payment amount. Please refresh and try again.");
        console.error("Invalid finalAmount:", finalAmount);
        await logPaymentAttempt("failed", null, null, null, new Error("Invalid amount"), null);
        setIsLoading(false);
        return;
      }

      if (!effectiveCurrency) {
        toast.error("Currency not detected. Please refresh and try again.");
        await logPaymentAttempt("failed", null, null, null, new Error("Missing currency"), null);
        setIsLoading(false);
        return;
      }

      // Determine planToSet for metadata
      let planToSet;
      if (isJobTrackerOnlyPurchase && jobTrackerDuration) {
        planToSet = "jobSearchAddon";
      } else if (billingCycle === "oneDay") {
        planToSet = "oneDay";
      } else if (billingCycle === "basic") {
        planToSet = "basic";
      } else if (billingCycle === "monthly" || billingCycle === "quarterly" || billingCycle === "sixMonth") {
        planToSet = "premium";
      } else if (billingCycle === "interview_gyani") {
        planToSet = "interview_gyani";
      }

      // Set payment processing state
      setIsPaymentProcessing(true);
      setPaymentStatus('processing');

      let referrerData = null;
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("expertresume_referrer");
          if (stored) referrerData = JSON.parse(stored);
        } catch (_) {}
      }

      // Create Stripe Checkout Session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          currency: effectiveCurrency,
          planId: isStandaloneAddon ? null : billingCycle,
          couponCode: capturedCouponCode,
          addons: isStandaloneAddon ? [addonParam] : [],
          userId,
          paymentDetails: {
            name: paymentDetails.name || "",
            email: paymentDetails.email || "",
            phone: paymentDetails.phone || "",
          },
          billingCycle,
          planToSet,
          includeJobTracker: includeJobTracker && ['monthly', 'quarterly', 'sixMonth'].includes(billingCycle),
          includeInterviewKit: includeInterviewKit && ['monthly', 'quarterly', 'sixMonth'].includes(billingCycle),
          includeApplyPro: includeApplyPro && ['quarterly', 'sixMonth'].includes(billingCycle),
          referralCode: referralCode || null,
          referralDiscountApplied,
          selectedDiscount: capturedDiscount,
          isStandaloneAddon,
          addonParam,
          isJobTrackerOnly: isJobTrackerOnlyPurchase,
          jobTrackerDuration,
          profileName: searchParams.get('profileName') || '',
          profileEmail: searchParams.get('profileEmail') || '',
          profilePhone: searchParams.get('profilePhone') || '',
          origin: typeof window !== "undefined" ? window.location.origin : "",
          referrerData: referrerData || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session.");
      }

      const { url } = await response.json();

      // Log payment initiation
      await logPaymentAttempt("initiated", null, null, null, null, null, capturedCouponCode, capturedDiscount);
      event({ action: "payment_initiated", category: "Payment", label: "StripeCheckout", value: finalAmount });

      // Clean up sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem('appliedCouponCode');
        sessionStorage.removeItem('appliedDiscount');
        sessionStorage.removeItem('addJobTrackerFeature');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;

    } catch (error) {
      setIsPaymentProcessing(false);
      setPaymentStatus('failed');

      await logPaymentAttempt("failed", null, null, null, error, null);
      toast.error(`Payment failed: ${error.message}`);
      event({ action: "payment_error", category: "Payment", label: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (targetStep, tabName) => {
    if (step === targetStep) return;
    if (billingCycle) {
      setStep(targetStep);
      event({ action: `tab_click_${tabName.toLowerCase()}`, category: "Checkout", label: `Step ${step}` });
    } else {
      toast.error("Please select a plan first.");
      event({ action: `tab_click_no_plan_${tabName.toLowerCase()}`, category: "Checkout", label: `Step ${step}` });
      document.querySelectorAll(".plan-card").forEach((el) => el.classList.add("animate-pulse"));
      setTimeout(() => {
        document.querySelectorAll(".plan-card").forEach((el) => el.classList.remove("animate-pulse"));
      }, 2000);
    }
  };

  if (isLoadingGeo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading pricing...</p>
      </div>
    );
  }

  // Show payment processing page
  if (isPaymentProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            {/* Payment Processing Animation */}
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto relative">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>

                {/* Inner pulsing circle */}
                <div className="absolute inset-2 rounded-full bg-accent/10 animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 bg-primary rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Processing Your Payment
              </h2>
              <p className="text-gray-600">
                Please don't close this page while we process your payment...
              </p>
            </div>

            {/* Plan Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Plan:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {(() => {
                    if (isStandaloneAddon && addonParam && ADDON_CONFIG[addonParam]) {
                      return ADDON_CONFIG[addonParam].name;
                    }
                    return billingCycle === "oneDay" ? "Quick Start" :
                      billingCycle === "basic" ? "Starter Plan" :
                        billingCycle === "monthly" ? "Pro Monthly" :
                          billingCycle === "quarterly" ? "Pro Quarterly" :
                            billingCycle === "sixMonth" ? "Pro 6-Month" :
                              billingCycle === "yearly" ? "Pro Yearly" : "Pro Plan";
                  })()}
                  {includeJobTracker && ['monthly', 'quarterly', 'sixMonth'].includes(billingCycle) && (
                    <span className="ml-2 text-xs text-primary font-semibold">+ Job Search</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="text-sm font-semibold text-green-600">
                  {(() => {
                    if (isStandaloneAddon && addonParam && ADDON_CONFIG[addonParam]) {
                      return formatPrice(
                        ADDON_CONFIG[addonParam]?.price?.[effectiveCurrency]?.[proBillingCycle] ||
                        ADDON_CONFIG[addonParam]?.price?.[effectiveCurrency] || 0,
                        effectiveCurrency
                      );
                    }

                    const basePlanPrice = billingCycle === "trial" ? pricing[billingCycle] :
                      selectedDiscount
                        ? Math.round((pricing[billingCycle] / 100) * (1 - selectedDiscount)) * 100
                        : pricing[billingCycle];

                    // Features are now bundled (0 extra cost)
                    const jobTrackerAddonPrice = 0;
                    const interviewKitAddonPrice = 0;
                    const applyProAddonPrice = 0;

                    const finalAmount = basePlanPrice + jobTrackerAddonPrice + interviewKitAddonPrice + applyProAddonPrice;

                    return formatPrice(finalAmount, effectiveCurrency);
                  })()}
                </span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                  <CheckCircle size={12} className="text-white" />
                </div>
                <span className="text-gray-700">Payment initiated</span>
              </div>

              <div className="flex items-center text-sm">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mr-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
                <span className="text-gray-700">Processing payment...</span>
              </div>

              <div className="flex items-center text-sm">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-500">Activating your plan</span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Please keep this page open until payment is complete
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating success particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 30}s`,
              animationDuration: `${20 + Math.random() * 15}s`
            }}
          >
            <div className="w-1 h-1 bg-accent/20 rounded-full opacity-30"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10  px-4 sm:px-6 lg:px-8 scroll-smooth overscroll-contain">



        <div className="max-w-6xl mx-auto pb-16 pt-4">
          {/* Compact Flow Indicator - 2 Steps */}
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-accent/20">
              <div className={`flex items-center gap-1 ${step >= 1 ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'}`}>1</span>
                <span className="text-xs sm:text-sm">Plan & Details</span>
              </div>
              <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
              <div className={`flex items-center gap-1 ${step >= 2 ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'}`}>2</span>
                <span className="text-xs sm:text-sm">Review & Pay</span>
              </div>
            </div>
          </div>

          {/* === COMPARISON TABLE (Hide in Standalone Mode) === */}
          {!isStandaloneAddon && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent px-4 py-3 md:px-5 md:py-4 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <motion.h1
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-base sm:text-lg md:text-xl font-bold truncate"
                        >
                          {step === 1 && "Choose Plan & Details"}
                          {step === 2 && "Review & Payment"}
                        </motion.h1>
                        <div className="hidden sm:flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Zap size={10} className="animate-pulse" />
                          <span>Hiring Season Offer Active</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white/80 text-xs truncate">
                          {step === 1 && "Select plan and enter details"}
                          {step === 2 && "Review order and complete payment"}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded-full">
                            <Shield size={10} className="mr-0.5" />
                            <span>Secure</span>
                          </div>
                          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded-full">
                            <span>🔒</span>
                            <span className="ml-0.5">No Auto-Deduction</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <div className="bg-white/10 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Zap size={10} className="animate-pulse" />
                        <span>Hiring Season Offer Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          <div className="p-3 md:p-4 lg:p-5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="space-y-3 md:space-y-4"
                >
                  {/* ENHANCV-STYLE 2-COLUMN LAYOUT */}
                  {/* === PLAN SELECTION GRID === */}
                  {/* If Standalone Addon: Show Single Hero Card. Else: Show Starter + Pro Grid */}

                  {isStandaloneAddon && currentAddonConfig ? (
                    <div className="max-w-3xl mx-auto mb-8">
                      <motion.div
                        className="flex flex-col border-2 rounded-2xl p-6 border-primary bg-white ring-4 ring-primary/5 shadow-2xl relative z-10 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-accent/10 rounded-xl">
                              {AddonIcon && <AddonIcon className="w-8 h-8 text-primary" />}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Power-Up</div>
                              <h2 className="text-2xl font-bold text-gray-900">{currentAddonConfig.name}</h2>
                              <p className="text-gray-500 text-sm hidden md:block">{currentAddonConfig.description}</p>
                            </div>
                          </div>
                          {/* Desktop Tabs */}
                          {/* Desktop Tabs - Only if addon has multiple cycles */}
                          {currentAddonConfig.applicableCycles && (
                            <div className="hidden md:flex bg-gray-100 p-1.5 rounded-xl self-start md:self-center">
                              {currentAddonConfig.applicableCycles.map((cycle) => {
                                const cyclePrice = ADDON_CONFIG[addonParam].price[effectiveCurrency][cycle];
                                // Prevent division by zero or errors if price is missing
                                if (!cyclePrice) return null;

                                const monthlyPrice = Math.round(cyclePrice / (cycle === 'monthly' ? 1 : cycle === 'quarterly' ? 3 : 6));
                                return (
                                  <button
                                    key={cycle}
                                    onClick={() => handleProTabChange(cycle)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${proBillingCycle === cycle
                                      ? 'bg-white text-primary shadow-sm'
                                      : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                  >
                                    {cycle === 'monthly' ? 'Monthly' : cycle === 'quarterly' ? 'Quarterly' : '6 Months'}
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          {/* Lifetime Badge for One-Time Addons */}
                          {!currentAddonConfig.applicableCycles && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm">
                              Lifetime Validity
                            </div>
                          )}
                        </div>

                        {/* Mobile Dropdown */}
                        <div className="md:hidden mb-6">
                          <div className="relative">
                            <select
                              value={proBillingCycle}
                              onChange={(e) => handleProTabChange(e.target.value)}
                              className="w-full appearance-none bg-primary/5 border border-accent/20 text-primary text-base font-bold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                              <option value="monthly">Monthly Plan</option>
                              <option value="quarterly">Quarterly Plan (Best Value)</option>
                              <option value="sixMonth">6-Month Plan</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-primary">
                              <ChevronDown size={20} />
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          {currentAddonConfig.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-gray-700 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Pricing Display */}
                        <div className="mt-auto bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <span className="block text-xs uppercase font-bold text-gray-500 tracking-wider">Total Price</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-gray-900">
                                {formatPrice(
                                  currentAddonConfig.applicableCycles
                                    ? (ADDON_CONFIG[addonParam]?.price?.[effectiveCurrency]?.[proBillingCycle] || 0)
                                    : (ADDON_CONFIG[addonParam]?.price?.[effectiveCurrency] || 0),
                                  effectiveCurrency
                                )}
                              </span>
                              <span className="text-sm font-medium text-gray-500">
                                {currentAddonConfig.applicableCycles
                                  ? (proBillingCycle === 'monthly' ? '/mo' : proBillingCycle === 'quarterly' ? '/qtr' : '/6mo')
                                  : '/ lifetime'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded inline-block mb-1">
                              {proBillingCycle === 'quarterly' ? 'Most Popular' : proBillingCycle === 'sixMonth' ? 'Best Value' : 'Standard'}
                            </div>
                            <p className="text-xs text-gray-500">One-time payment</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 items-center">


                      {/* LEFT CARD: STARTER PLAN (DECOY) */}
                      <motion.div
                        className={`flex flex-col border rounded-xl p-5 ${billingCycle === 'basic' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'} transition-all cursor-pointer relative overflow-hidden opacity-90 hover:opacity-100 h-fit max-w-[320px] mx-auto`}
                        onClick={() => setBillingCycle('basic')}
                      >
                        {billingCycle === 'basic' && (
                          <div className="absolute top-0 right-0 bg-gray-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                            Selected
                          </div>
                        )}
                        <div className="mb-3">
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                            Basic
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">Starter (Trial Pack)</h3>
                        <div className="flex flex-col mb-4">
                          {PLAN_CONFIG.basic.anchorPrice?.[effectiveCurrency] > PLAN_CONFIG.basic.price?.[effectiveCurrency] && (
                            <span className="text-sm font-bold text-gray-400 line-through leading-none mb-1">
                              {formatPrice(PLAN_CONFIG.basic.anchorPrice?.[effectiveCurrency], effectiveCurrency)}
                            </span>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-gray-700">
                              {formatPrice(PLAN_CONFIG.basic.price?.[effectiveCurrency], effectiveCurrency)}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">/ 7 days</span>
                          </div>
                        </div>
                        {/* End of pricing flex container and price-col div */}

                        {/* UPSSELL / EDUCATION BLOCK */}
                        <div className="bg-primary/5 border border-accent/20 rounded-lg p-3 mb-4">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle size={14} className="text-primary mt-0.5 shrink-0" />
                            <p className="text-[10px] text-primary font-medium leading-tight">
                              <strong>Reality Check:</strong> 87% of users upgrade to Pro within 48h to access the full toolkit.
                            </p>
                          </div>
                          <div className="h-px bg-accent/20 my-2"></div>
                          <p className="text-[10px] text-primary leading-tight mb-2">
                            Starter is great for testing, but to <strong>land a high-paying job</strong>, you need the tools included in Pro:
                          </p>
                          <ul className="space-y-1">
                            <li className="flex items-center gap-1.5 text-[10px] text-gray-600">
                              <XCircle size={10} className="text-gray-400" />
                              <span>AI Job Search (Missing)</span>
                            </li>
                            <li className="flex items-center gap-1.5 text-[10px] text-gray-600">
                              <XCircle size={10} className="text-gray-400" />
                              <span>Interview Prep Kit (Missing)</span>
                            </li>
                            <li className="flex items-center gap-1.5 text-[10px] text-gray-600">
                              <XCircle size={10} className="text-gray-400" />
                              <span>Apply Pro Engine (Missing)</span>
                            </li>
                          </ul>
                        </div>
                        <p className="text-xs text-gray-500 mb-6 leading-relaxed">Good for a single resume download if you're in a hurry.</p>

                        <ul className="space-y-2 mb-6 flex-1">
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
                            <span>{getPlanConfig("basic").downloads} PDF Downloads</span>
                          </li>
                          <li className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
                            <span>Basic Templates</span>
                          </li>
                        </ul>

                        <button className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all ${billingCycle === 'basic' ? 'bg-gray-100 text-gray-500 border border-gray-200 shadow-none' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          {billingCycle === 'basic' ? 'Plan Selected' : 'Choose Starter'}
                        </button>
                      </motion.div>

                      {/* RIGHT CARD: PROFESSIONAL PLANS (Enhancv Style with Tabs) */}
                      <motion.div
                        className={`flex flex-col border-2 rounded-2xl p-6 ${billingCycle !== 'basic' ? 'border-green-600 bg-white ring-4 ring-green-50 shadow-2xl relative z-10' : 'border-gray-200 bg-white hover:border-green-200 hover:shadow-lg'} transition-all cursor-pointer relative overflow-hidden`}
                        onClick={() => {
                          if (billingCycle === 'basic') setBillingCycle(proBillingCycle);
                        }}
                        whileHover={{ y: -2 }}
                      >
                        {billingCycle !== 'basic' && (
                          <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                            Selected
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                            <Crown size={12} fill="currentColor" /> Pro
                          </span>
                          {proBillingCycle === 'quarterly' && <span className="text-green-600 text-xs font-bold">Best Value</span>}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          {proBillingCycle === 'monthly' ? "Pro (Job Seeker's Choice)" :
                            proBillingCycle === 'quarterly' ? 'Expert (Career Growth Bundle)' :
                              'Ultimate (Complete Success Kit)'}
                        </h3>

                        {/* INTERNAL TABS */}
                        {/* INTERNAL TABS (RESPONSIVE) */}
                        {/* DESKTOP: Original Tabs */}
                        <div className="hidden md:flex p-1 bg-gray-100 rounded-lg mb-6 self-start w-auto">
                          {[
                            { id: 'monthly', label: 'Monthly' },
                            { id: 'quarterly', label: 'Quarterly', discount: 'Save 25%' },
                            { id: 'sixMonth', label: '6-Months', discount: 'Save 40%' }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProTabChange(tab.id);
                              }}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${proBillingCycle === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                              {tab.label}
                              {tab.discount && (
                                <span className={`text-[10px] px-1 rounded ${proBillingCycle === tab.id ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                  {tab.discount}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* MOBILE: Enhancv-Style Dropdown */}
                        <div className="md:hidden mb-6 relative z-20">
                          <div className="relative">
                            <select
                              value={proBillingCycle}
                              onChange={(e) => handleProTabChange(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full appearance-none bg-orange-100 border-2 border-orange-200 text-gray-900 text-sm font-bold py-3 pl-4 pr-10 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 cursor-pointer"
                            >
                              <option value="monthly">Pro Monthly</option>
                              <option value="quarterly">Pro Quarterly (Save 25%)</option>
                              <option value="sixMonth">Pro Semi-Annual (Save 40%)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-orange-500">
                              <ChevronDown size={20} />
                            </div>
                          </div>
                          {/* Discount Badge Floating */}
                          {proBillingCycle !== 'monthly' && (
                            <div className="absolute -top-3 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-30 pointer-events-none">
                              {proBillingCycle === 'quarterly' ? 'SAVE 25%' : 'SAVE 40%'}
                            </div>
                          )}
                        </div>

                        {/* DYNAMIC PRICE DISPLAY */}
                        <div className="flex flex-col mb-2">
                          {planDefinitions[proBillingCycle].anchorPrice > 0 && planDefinitions[proBillingCycle].anchorPrice !== planDefinitions[proBillingCycle].originalPrice && (
                            <span className="text-sm font-bold text-gray-400 line-through leading-none mb-1">
                              {formatPrice(planDefinitions[proBillingCycle].anchorPrice * 100, effectiveCurrency)}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="text-3xl font-bold text-gray-900">
                              {formatPrice(pricing[proBillingCycle], effectiveCurrency)}
                            </span>
                            <span className="text-xs text-gray-500 font-medium self-end mb-1">
                              {proBillingCycle === 'monthly' ? '/ 30 days' :
                                proBillingCycle === 'quarterly' ? '/ 90 days' : '/ 180 days'}
                            </span>
                          </div>
                          <p className="text-[10px] text-green-700 font-medium mt-1.5 leading-tight">
                            Designed to help you apply smarter, get more callbacks, and crack interviews faster.
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 mb-6">
                          {proBillingCycle === 'quarterly' ? 'One-time payment. Valid for 90 days. No auto-renewal.' :
                            proBillingCycle === 'sixMonth' ? 'One-time payment. Valid for 180 days. No auto-renewal.' : 'One-time payment. Valid for 30 days. No auto-renewal.'}
                        </div>

                        {/* UNIFIED FEATURE LIST (Single Column - Larger Fonts) */}
                        <div className="mb-8">
                          <div className="border border-gray-100 bg-gray-50/50 px-4 py-3 rounded-xl">
                            <ul className="space-y-2 w-full">
                              <li className="flex items-start gap-2 text-sm text-gray-900 font-bold leading-snug">
                                <CheckCircle size={14} className="text-green-600 mt-0.5 shrink-0" />
                                <span>Unlimited PDF Downloads</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-gray-900 font-bold leading-snug">
                                <CheckCircle size={14} className="text-green-600 mt-0.5 shrink-0" />
                                <span>AI Resume Checker (ATS Score)</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-gray-800 leading-snug">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                <span>50+ Premium Templates</span>
                              </li>

                              <li className="flex items-start gap-2 text-sm text-gray-800 leading-snug">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                <span>AI Cover Letter Builder</span>
                              </li>
                              {/* Dynamic Premium Features */}
                              <li className={`flex items-start gap-2 text-sm leading-snug ${['quarterly', 'sixMonth'].includes(proBillingCycle) ? 'text-primary font-bold' : 'text-gray-400 opacity-70'}`}>
                                {['quarterly', 'sixMonth'].includes(proBillingCycle) ? (
                                  <CheckCircle size={14} className="text-primary mt-0.5 shrink-0" />
                                ) : (
                                  <XCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                )}
                                <span>
                                  AI Job Search Pro
                                  {proBillingCycle === 'sixMonth' && <span className="text-xs font-normal ml-1 text-primary">(Unlimited)</span>}
                                  {proBillingCycle === 'quarterly' && <span className="text-xs font-normal ml-1 text-primary">(100+ Jobs/Day)</span>}
                                  {proBillingCycle === 'monthly' && <span className="text-xs font-normal ml-1">(Not Included)</span>}
                                </span>
                              </li>

                              <li className={`flex items-start gap-2 text-sm leading-snug ${['quarterly', 'sixMonth'].includes(proBillingCycle) ? 'text-primary font-bold' : 'text-gray-400 opacity-70'}`}>
                                {['quarterly', 'sixMonth'].includes(proBillingCycle) ? (
                                  <CheckCircle size={14} className="text-primary mt-0.5 shrink-0" />
                                ) : (
                                  <XCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                )}
                                <span>
                                  Interview Prep Kit
                                  {proBillingCycle === 'monthly' && <span className="text-xs font-normal ml-1">(Not Included)</span>}
                                </span>
                              </li>

                              <li className={`flex items-start gap-2 text-sm leading-snug ${['quarterly', 'sixMonth'].includes(proBillingCycle) ? 'text-primary font-bold' : 'text-gray-400 opacity-70'}`}>
                                {['quarterly', 'sixMonth'].includes(proBillingCycle) ? (
                                  <CheckCircle size={14} className="text-primary mt-0.5 shrink-0" />
                                ) : (
                                  <XCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                )}
                                <span>
                                  Apply Pro Engine
                                  {proBillingCycle === 'monthly' && <span className="text-xs font-normal ml-1">(Not Included)</span>}
                                </span>
                              </li>

                              <li className={`flex items-start gap-2 text-sm leading-snug ${['quarterly', 'sixMonth'].includes(proBillingCycle) ? 'text-primary font-bold' : 'text-gray-400 opacity-70'}`}>
                                {['quarterly', 'sixMonth'].includes(proBillingCycle) ? (
                                  <CheckCircle size={14} className="text-primary mt-0.5 shrink-0" />
                                ) : (
                                  <XCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                )}
                                <span>
                                  Interview Simulation  Pro
                                  {proBillingCycle === 'monthly' && <span className="text-xs font-normal ml-1">(Not Included)</span>}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${billingCycle !== 'basic' ? 'bg-green-600 text-white shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] transform duration-200' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-600 hover:text-green-600'}`}>
                          {billingCycle !== 'basic' ? 'Unlock Expert Access' : 'Choose Professional'}
                        </button>
                      </motion.div>
                    </div>
                  )}

                  {
                    plans.length === 0 && userCurrentPlan && userCurrentPlan !== "free" && userCurrentPlan !== "anonymous" && (
                      <div className="text-center py-12">
                        <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-md">
                          <Crown className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                          <h3 className="text-xl font-bold text-gray-800 mb-3">You're at the Top!</h3>
                          <p className="text-gray-600 mb-6 text-base">
                            Your {userCurrentPlan === "oneDay" ? "Quick Start" : userCurrentPlan === "basic" ? "Starter" : userCurrentPlan === "monthly" ? "Monthly" : "6-Month"} plan is our premium tier. Enjoy the full power!
                          </p>
                          <button
                            onClick={() => router.push('/account')}
                            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold"
                          >
                            View My Dashboard
                          </button>
                        </div>
                        <div className="bg-white rounded p-2 border border-accent/20">
                          <p className="text-[10px] text-primary">Original Price</p>
                          <p className="text-sm font-medium line-through text-gray-400">{formatPrice(originalTotalWithGST, effectiveCurrency)}</p>
                        </div>
                        <div className="bg-accent/10 rounded p-2 border border-accent/20">
                          <p className="text-[10px] text-primary">You Save</p>
                          <p className="text-base font-bold text-primary">{formatPrice(totalSavings, effectiveCurrency)}</p>
                        </div>
                      </div>
                    )}

                  {/* Transparent Savings Blue Card - Mobile Only (Restored) */}
                  {selectedDiscount > 0 && (
                    <div className="block lg:hidden bg-gradient-to-br from-primary to-accent rounded-lg p-5 border border-accent shadow-md mb-4 text-white">
                      <div className="flex justify-between items-start mb-4 border-b border-accent/30 pb-3">
                        <div>
                          <p className="text-white/80 text-sm font-medium">Total Savings</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-yellow-400 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                              {Math.round(selectedDiscount * 100)}% OFF
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white/80 text-xs">Original Price</p>
                          <p className="text-lg font-medium text-white/80 line-through opacity-80">
                            {formatPrice(originalTotalWithGST, effectiveCurrency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-white/80 text-xs mb-1">You Save</p>
                          <p className="text-xl font-bold text-yellow-300">
                            {formatPrice(totalSavings, effectiveCurrency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/80 text-xs mb-1">Total Amount</p>
                          <div className="flex flex-col items-end">
                            {effectiveCurrency === "INR" && (
                              <div className="flex items-center gap-2 mb-2 bg-emerald-500/20 px-2 py-1 rounded border border-emerald-400/30">
                                <BadgeCheck size={14} className="text-emerald-300" />
                                <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">No Hidden Fees</span>
                              </div>
                            )}
                            <p className="text-3xl font-bold text-white leading-none">
                              {formatPrice(finalTotal, effectiveCurrency)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-accent/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-primary/30 px-2 py-1 rounded">
                          <Trophy className="text-yellow-300 w-3 h-3" />
                          <span className="text-white/90 text-[10px] font-semibold">
                            Saved {formatPrice(totalSavings, effectiveCurrency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Lock className="text-white/80 w-3 h-3" />
                          <span className="text-white/80 text-[10px]">Secure Payment</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transparent Savings Blue Card - Unified for Desktop & Mobile - NOW DESKTOP ONLY */}
                  {selectedDiscount > 0 && (
                    <div className="hidden lg:block bg-gradient-to-br from-primary to-accent rounded-lg p-5 border border-accent shadow-md mb-4 text-white">
                      <div className="flex justify-between items-start mb-4 border-b border-accent/30 pb-3">
                        <div>
                          <p className="text-white/80 text-sm font-medium">Total Pocket Savings</p>
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="text-[10px] text-white/80">
                              Includes: {formatPrice(discountAmount, effectiveCurrency)} Plan + {formatPrice(totalSavings - discountAmount, effectiveCurrency)} Tax
                            </span>
                            <span className="bg-yellow-400 text-primary text-xs font-bold px-2 py-0.5 rounded-full w-fit">
                              {Math.round(selectedDiscount * 100)}% OFF
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white/80 text-xs">Original Price</p>
                          <p className="text-lg font-medium text-white/80 line-through opacity-80">
                            {formatPrice(originalTotalWithGST, effectiveCurrency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-white/80 text-xs mb-1">You Save</p>
                          <p className="text-xl font-bold text-yellow-300">
                            {formatPrice(totalSavings, effectiveCurrency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/80 text-xs mb-1">Total Amount</p>
                          <div className="flex flex-col items-end">
                            {effectiveCurrency === "INR" && (
                              <div className="flex items-center gap-2 mb-2 bg-emerald-500/20 px-2 py-1 rounded border border-emerald-400/30">
                                <BadgeCheck size={14} className="text-emerald-300" />
                                <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">No Hidden Fees</span>
                              </div>
                            )}
                            <p className="text-3xl font-bold text-white leading-none">
                              {formatPrice(finalTotal, effectiveCurrency)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-accent/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-primary/30 px-2 py-1 rounded">
                          <Trophy className="text-yellow-300 w-3 h-3" />
                          <span className="text-white/90 text-[10px] font-semibold">
                            Saved {formatPrice(totalSavings, effectiveCurrency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Lock className="text-white/80 w-3 h-3" />
                          <span className="text-white/80 text-[10px]">Secure Payment</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback Card when no discount (Standard Green) - NOW DESKTOP & MOBILE */}
                  {selectedDiscount === 0 && (
                    <div className="block bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg p-5 border border-green-500 shadow-md mb-4">
                      <div className="block">
                        <p className="text-green-100 text-sm font-medium mb-1.5">Total Amount to Pay</p>
                        <div className="flex items-end gap-2.5">
                          {effectiveCurrency === "INR" ? (
                            <div className="flex flex-col items-start w-full">
                              <div className="flex justify-between w-full text-green-100 text-sm mb-2 opacity-90">
                                <span>Total (All-Inclusive)</span>
                                <span>{formatPrice(finalTotal, effectiveCurrency)}</span>
                              </div>
                              <div className="h-px w-full bg-green-400/30 mb-2"></div>
                              <div className="flex justify-between w-full items-end">
                                <div className="flex items-center gap-1.5 bg-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
                                  <BadgeCheck size={12} /> No Hidden Fees
                                </div>
                                <p className="text-3xl sm:text-4xl font-bold text-white leading-none">
                                  {formatPrice(finalTotal, effectiveCurrency)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-3xl sm:text-4xl font-bold text-white leading-none">
                              {formatPrice(finalTotal, effectiveCurrency)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-500/30 flex items-center justify-center gap-1.5">
                        <Lock className="text-green-200 w-3 h-3" />
                        <span className="text-green-100 text-[10px]">Secure Payment • 256-bit SSL</span>
                      </div>
                    </div>
                  )}

                  {/* FEATURES PREVIEW - MOBILE ONLY (Moved here to sit at the end) */}
                  <div className="lg:hidden bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="text-primary" size={18} />
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">What You Get</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Updated Key Features */}
                      <div className="flex items-center gap-2.5 p-2.5 bg-primary/5 rounded-md">
                        <FileText className="text-primary flex-shrink-0" size={16} />
                        <span className="text-sm font-semibold text-gray-900">50+ Pro Templates</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-primary/5 rounded-md">
                        <Download className="text-primary flex-shrink-0" size={16} />
                        <span className="text-sm font-semibold text-gray-900">
                          {billingCycle === "basic" ? `${PLAN_CONFIG.basic.downloads} Downloads` : "Unlimited Downloads"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-sky-50 rounded-md">
                        <Target className="text-sky-600 flex-shrink-0" size={16} />
                        <span className="text-sm font-semibold text-gray-900">Smart JD Matcher</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-primary/5 rounded-md">
                        <BarChart3 className="text-primary flex-shrink-0" size={16} />
                        <span className="text-sm font-semibold text-gray-900">ATS Score Optimizer</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-primary/5 rounded-md">
                        <MessageSquare className="text-primary flex-shrink-0" size={16} />
                        <span className="text-sm font-semibold text-gray-900">AI Interview Coach</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-cyan-50 rounded-md">
                        <DollarSign className="text-cyan-600 flex-shrink-0" size={16} />
                        <span className="text-sm font-semibold text-gray-900">Salary Analyzer Tool</span>
                      </div>
                      {includeJobTracker && ['monthly', 'quarterly', 'sixMonth'].includes(billingCycle) && (
                        <div className="flex items-center gap-2.5 p-2.5 bg-accent/10 rounded-md border border-accent/30">
                          <Briefcase className="text-primary flex-shrink-0" size={16} />
                          <span className="text-sm font-bold text-primary">AI Job Search</span>
                        </div>
                      )}
                      {includeInterviewKit && ['monthly', 'quarterly', 'sixMonth'].includes(billingCycle) && (
                        <div className="flex items-center gap-2.5 p-2.5 bg-accent/10 rounded-md border border-accent/30">
                          <Brain className="text-primary flex-shrink-0" size={16} />
                          <span className="text-sm font-bold text-primary">Interview Prep Kit</span>
                        </div>
                      )}
                      {includeApplyPro && ['quarterly', 'sixMonth'].includes(billingCycle) && (
                        <div className="flex items-center gap-2.5 p-2.5 bg-accent/10 rounded-md border border-accent/30">
                          <Zap className="text-primary flex-shrink-0" size={16} />
                          <span className="text-sm font-bold text-primary">Apply Pro Engine</span>
                        </div>
                      )}
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <Bell className="text-primary" size={12} />
                      <span><strong>No auto-renewal</strong> • You're in control</span>
                    </div>
                  </div>

                </motion.div >
              )
              }

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                      <button
                        onClick={() => {
                          if (!referralDiscountApplied) {
                            setSelectedDiscount(0);
                            setCouponCode("");
                          }
                          setStep(1);
                        }}
                        className="text-sm text-primary font-semibold hover:text-primary"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4">
                      {/* Base Plan Item - Hide for addon-only purchases (user already paid for plan) */}
                      {/* Removed isAddonOnlyPurchase check */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isStandaloneAddon ? 'bg-accent/10' : 'bg-green-100'}`}>
                            {isStandaloneAddon && AddonIcon ? (
                              <AddonIcon className="text-primary w-5 h-5" />
                            ) : (
                              <Crown className="text-green-600 w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {isStandaloneAddon ? currentAddonConfig?.name : (
                                planDefinitions[billingCycle]?.name || 'Professional Plan'
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {billingCycle === 'basic' ? '7 Days Access' :
                                billingCycle === 'monthly' ? '30 Days Access' :
                                  billingCycle === 'quarterly' ? '90 Days Access' :
                                    billingCycle === 'sixMonth' ? '180 Days Access' :
                                      billingCycle === 'interview_gyani' ? '30 Days Access' : 'Custom Plan'}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">
                          {isStandaloneAddon ? (
                            formatPrice(
                              typeof ADDON_CONFIG[addonParam].price[effectiveCurrency] === 'object'
                                ? ADDON_CONFIG[addonParam].price[effectiveCurrency][proBillingCycle]
                                : ADDON_CONFIG[addonParam].price[effectiveCurrency],
                              effectiveCurrency
                            )
                          ) : (
                            formatPrice(pricing[billingCycle], effectiveCurrency)
                          )}
                        </p>
                      </div>


                      {/* Add-ons (Show for both regular and addon-only purchases) */}
                      {!isStandaloneAddon && (
                        <>
                          {includeJobTracker && ['monthly', 'quarterly', 'sixMonth'].includes(billingCycle) && !isJobTrackerOnlyPurchase && (
                            <div className={`flex justify-between items-center pl-10 sm:pl-12`}>
                              <div className={"text-sm text-gray-600"}>
                                + AI Job Search
                              </div>
                              {isJobSearchIncluded ? (
                                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                  <Gift size={10} /> FREE GIFT
                                </div>
                              ) : (
                                <p className="font-semibold text-gray-900">{formatPrice(getJobTrackerPrice(billingCycle), effectiveCurrency)}</p>
                              )}
                            </div>
                          )}

                          {includeInterviewKit && ['monthly', 'quarterly', 'sixMonth'].includes(billingCycle) && !isJobTrackerOnlyPurchase && (
                            <div className={`flex justify-between items-center pl-10 sm:pl-12`}>
                              <div className={"text-sm text-gray-600"}>
                                + Interview Prep Kit
                              </div>
                              {isInterviewKitIncluded ? (
                                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                  <Gift size={10} /> FREE GIFT
                                </div>
                              ) : (
                                <p className="font-semibold text-gray-900">{formatPrice(getInterviewKitPrice(billingCycle), effectiveCurrency)}</p>
                              )}
                            </div>
                          )}

                          {includeApplyPro && ['quarterly', 'sixMonth'].includes(billingCycle) && (
                            <div className={`flex justify-between items-center pl-10 sm:pl-12`}>
                              <div className={"text-sm text-gray-600"}>
                                + Apply Pro Engine
                              </div>
                              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                <Gift size={10} /> FREE GIFT
                              </div>
                            </div>
                          )}

                          {['quarterly', 'sixMonth'].includes(billingCycle) && (
                            <div className={`flex justify-between items-center pl-10 sm:pl-12`}>
                              <div className={"text-sm text-gray-600"}>
                                + Interview Simulation  Pro
                              </div>
                              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                <Gift size={10} /> FREE GIFT
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Divider */}
                      <div className="h-px bg-gray-100 my-4"></div>

                      {/* Manual Offer Application Card */}
                      {!isStandaloneAddon && !referralDiscountApplied && (
                        (() => {
                          let offerCode = '';
                          let offerDiscount = 0;
                          let offerLabel = '';

                          if (billingCycle === 'sixMonth') {
                            offerCode = 'SAVE20';
                            offerDiscount = 0.20;
                            offerLabel = '20% OFF';
                          } else if (billingCycle === 'quarterly') {
                            offerCode = 'SAVE15';
                            offerDiscount = 0.15;
                            offerLabel = '15% OFF';
                          } else if (billingCycle === 'monthly') {
                            offerCode = 'SAVE10';
                            offerDiscount = 0.10;
                            offerLabel = '10% OFF';
                          }

                          if (offerCode) {
                            const isApplied = couponCode === offerCode;
                            return (
                              <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                  <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm border border-green-100 flex-shrink-0">
                                    <Tag className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">Special Offer!</p>
                                    <p className="text-[10px] sm:text-xs text-green-700 font-medium leading-tight truncate">Get extra {offerLabel} with this plan</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    if (isApplied) {
                                      handleCouponRemoved();
                                    } else {
                                      handleCouponApplied({ code: offerCode, discount: offerDiscount });
                                    }
                                  }}
                                  className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${isApplied
                                    ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                  {isApplied ? 'Applied ✓' : `Apply ${offerCode}`}
                                </button>
                              </div>
                            );
                          }
                          return null;
                        })()
                      )}

                      {/* Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span>{formatPrice(taxableAmount, effectiveCurrency)}</span>
                        </div>

                        {selectedDiscount > 0 && (
                          <div className="flex justify-between text-sm text-green-600 font-medium">
                            <span>Discount ({Math.round(selectedDiscount * 100)}% OFF)</span>
                            <span>-{formatPrice(discountAmount, effectiveCurrency)}</span>
                          </div>
                        )}

                        {effectiveCurrency === "INR" && (
                          <div className="flex justify-between items-center py-1.5 px-2 bg-emerald-50 rounded text-[10px] font-bold text-emerald-700 uppercase tracking-wider border border-emerald-100 mb-2">
                            <span className="flex items-center gap-1"><BadgeCheck size={12} /> No Hidden Fees</span>
                            <span>GST Included</span>
                          </div>
                        )}

                        <div className="flex justify-between items-end pt-2 border-t border-gray-100 mt-2">
                          <span className="font-bold text-gray-900">Total to Pay</span>
                          <span className="text-2xl font-black text-primary">
                            {formatPrice(finalTotal, effectiveCurrency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection Placeholder - Can be expanded */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="text-primary" size={24} />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Secure Payment Gateway</p>
                        <p className="text-xs text-gray-500">Encrypted & Safe. Cards, Apple Pay, Google Pay.</p>
                      </div>
                    </div>
                    <Lock size={16} className="text-green-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence >
          </div >
        </div >

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm text-center">
            <Shield className="text-primary mx-auto mb-1.5 md:mb-2" size={18} />
            <p className="font-semibold text-xs md:text-sm">Secure Payment</p>
            <p className="text-xs text-gray-600 mt-1">256-bit Encryption</p>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm text-center">
            <Bot className="text-primary mx-auto mb-1.5 md:mb-2" size={18} />
            <p className="font-semibold text-xs md:text-sm">AI Powered</p>
            <p className="text-xs text-gray-600 mt-1">Cutting-Edge Tech</p>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm text-center">
            <Users className="text-primary mx-auto mb-1.5 md:mb-2" size={18} />
            <p className="font-semibold text-xs md:text-sm">15,000+ Users</p>
            <p className="text-xs text-gray-600 mt-1">Trusted Worldwide</p>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm text-center">
            <Zap className="text-yellow-500 mx-auto mb-1.5 md:mb-2" size={18} />
            <p className="font-semibold text-xs md:text-sm">Instant Access</p>
            <p className="text-xs text-gray-600 mt-1">Start in Seconds</p>
          </div>
        </motion.div>

        {/* Floating Sticky Bottom Buttons - Space Optimized */}
        <AnimatePresence>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2.5 md:p-3 shadow-lg"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between gap-2 md:gap-3">
                {/* Back Button - Fixed size on desktop, Hidden for addon-only purchases */}
                {step > 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (step === 2) {
                        if (!referralDiscountApplied) {
                          setSelectedDiscount(0);
                          setCouponCode("");
                        }
                        setStep(1);
                        event({ action: "back_to_plan", category: "Checkout", label: "Floating Button" });
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg md:rounded-lg font-medium transition-all text-xs md:text-xs w-auto md:w-[100px] justify-center"
                  >
                    <ArrowLeft size={14} className="md:w-3.5 md:h-3.5" />
                    <span>Back</span>
                  </motion.button>
                ) : (
                  <div className="w-auto md:w-[100px]"></div>
                )}

                {/* Primary Action Button - Fixed size on desktop, better labels */}
                {(() => {
                  // Calculate final total for Step 2 button label
                  let buttonLabel = "";
                  let buttonSubLabel = "";

                  if (step === 2 && billingCycle) {
                    // Reuse the centralized finalTotal calculated in the main component scope
                    // This ensures consistency across all displays (Order Summary, Total, Pay Button)
                    const currentTotal = finalTotal;

                    const days = billingCycle === "sixMonth" ? "180 Days" :
                      billingCycle === "quarterly" ? "90 Days" :
                        billingCycle === "monthly" ? "30 Days" :
                          billingCycle === "basic" ? "7 Days" : "";

                    buttonLabel = `Pay ${formatPrice(currentTotal, effectiveCurrency)}`;
                    buttonSubLabel = days;
                  } else if (step === 1) {
                    buttonLabel = "Continue";
                    buttonSubLabel = "Review Order";
                  }

                  return (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (step === 1) {
                          // Validate plan is selected before proceeding
                          if (!billingCycle) {
                            toast.error("Please select a plan");
                            return;
                          }
                          setStep(2);
                          event({ action: "proceed_to_review", category: "Checkout", label: "Floating Button" });
                        } else if (step === 2) {
                          handlePaymentSubmit();
                        }
                      }}
                      disabled={isLoading}
                      className={`flex-1 md:flex-none md:w-[280px] px-3 sm:px-4 md:px-4 py-2.5 md:py-2.5 text-white rounded-lg md:rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs md:text-sm flex items-center justify-center gap-1.5 ${step === 2
                        ? "bg-gradient-to-r from-primary to-accent hover:opacity-95 border border-accent"
                        : "bg-gradient-to-r from-primary to-accent hover:opacity-95 border border-accent"
                        }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-1.5">
                          <div className="animate-spin rounded-full h-3 w-3 md:h-3.5 md:w-3.5 border-b-2 border-white"></div>
                          <span className="text-[10px] md:text-xs">Processing...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 w-full justify-center">
                          {step === 2 && <Lock size={14} className="md:w-3.5 md:h-3.5" />}
                          <span className="flex flex-col items-center gap-0.5">
                            <span className="font-bold text-xs md:text-sm leading-tight">{buttonLabel}</span>
                            {buttonSubLabel && (
                              <span className="text-[10px] md:text-[10px] opacity-90 font-normal leading-tight">{buttonSubLabel}</span>
                            )}
                          </span>
                          {step === 1 && <ArrowRight size={14} className="md:w-3.5 md:h-3.5" />}
                          {step === 2 && <Rocket size={14} className="md:w-3.5 md:h-3.5" />}
                        </span>
                      )}
                    </motion.button>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div >


      {/* Payment Retry Modal */}
      < AnimatePresence >
        {showRetryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-orange-500"></div>
              <button
                onClick={() => setShowRetryModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <AlertCircle className="text-red-500" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed?</h3>
                <p className="text-gray-600 text-sm">
                  Don't worry, no money was deducted. Retry with a different payment method.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowRetryModal(false);
                    handlePaymentSubmit();
                  }}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard size={18} />
                  <span>Retry Payment</span>
                </button>
                <button
                  onClick={() => {
                    setShowRetryModal(false);
                    window.open('https://api.whatsapp.com/send?phone=918384042813&text=Hi,%20I%20need%20help%20with%20payment', '_blank');
                  }}
                  className="w-full py-3 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  <span>Chat with Support</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )
        }
      </AnimatePresence >
    </div >
  );
}
