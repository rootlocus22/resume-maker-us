"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle, CheckCircle2, ChevronDown, ArrowRight, Crown, BookOpen,
  BadgeCheck, Bot, DollarSign, Shield, Rocket, Award, TrendingUp, Clock,
  ThumbsUp, Sparkles, Zap, FileText, Target, AlertTriangle, Phone,
  Users, Upload, Brain, Edit, Move, Briefcase, Gift
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import Testimonial from "../components/Testimonials";
import toast from "react-hot-toast";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getEffectivePricing, formatPrice as formatGlobalPrice, getSupportedCurrencies } from "../lib/globalPricing";
import CurrencySwitcher from "../components/CurrencySwitcher";
import { PLAN_CONFIG, getDownloadLimitMessage, getPlanConfig, getOriginalPrice, getDiscountedPrice, getDiscountPercentage, isDiscountEnabled } from "../lib/planConfig";
import ProUpgradeBanner from "../components/ProUpgradeBanner";
import FlashSaleBanner from "../components/FlashSaleBanner";
import { useIsAndroidUser } from "../lib/deviceDetection";
import dynamic from 'next/dynamic';



export const getCurrencyAndPriceByCountry = (currency, isAndroidDevice = false) => {
  const pricing = getEffectivePricing(currency, isAndroidDevice);
  const config = {
    currency: currency,
    basicPrice: pricing.basic,
    monthlyPrice: pricing.monthly,
    quarterlyPrice: pricing.quarterly,
    sixMonthPrice: pricing.sixMonth,
    professionalPrice: pricing.professional,
    trialPrice: pricing.trial || (currency === 'INR' ? 4900 : 500),
    basicBasePrice: pricing.basic,
    monthlyBasePrice: pricing.monthly,
    quarterlyBasePrice: pricing.quarterly,
    sixMonthBasePrice: pricing.sixMonth,
    professionalBasePrice: pricing.professional,
    trialBasePrice: pricing.trial || (currency === 'INR' ? 4900 : 500),
    // Anchor prices for strikethrough - Pulled from config
    basicAnchorPrice: PLAN_CONFIG.basic.anchorPrice[currency] || (pricing.basic * 3),
    monthlyAnchorPrice: PLAN_CONFIG.monthly.anchorPrice[currency] || (pricing.monthly * 2),
    quarterlyAnchorPrice: PLAN_CONFIG.quarterly.anchorPrice[currency] || (pricing.quarterly * 2),
    sixMonthAnchorPrice: PLAN_CONFIG.sixMonth.anchorPrice[currency] || (pricing.sixMonth * 2),
    competitors: currency === 'INR' ? {
      interviewCake: 2499,
      leetCode: 1999,
      topResume: 8999,
      average: (2499 + 1999 + 8999) / 3 // ₹4,832
    } : {
      interviewCake: 39,
      leetCode: 35,
      topResume: 149,
      average: (39 + 35 + 149) / 3 // $74.33
    },
  };
  return config;
};

export default function Pricing() {
  const { user, isPremium } = useAuth();
  const { currency, isLoadingGeo, switchCurrency } = useLocation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState(null);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [userCurrentPlan, setUserCurrentPlan] = useState(null);
  const [userPlanExpiry, setUserPlanExpiry] = useState(null);
  const { isAndroid } = useIsAndroidUser();

  // Modals state

  // State for Pro Plan internal selection (Enhancv Style) - Default to quarterly for best value
  const [proBillingCycle, setProBillingCycle] = useState('quarterly');

  // Handle Pro Tab Change
  const handleProTabChange = (cycle) => {
    setProBillingCycle(cycle);
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('currency', newCurrency);
    window.history.replaceState({}, '', currentUrl.toString());
  };

  // Device detection effect
  useEffect(() => {
    const detectAndroid = () => {
      if (typeof window !== "undefined" && navigator.userAgent) {
        const isAndroid = /Android/i.test(navigator.userAgent);
        setIsAndroidDevice(isAndroid);
        console.log('🔍 Device Detection:', {
          userAgent: navigator.userAgent,
          isAndroid: isAndroid
        });
      }
    };

    detectAndroid();
  }, []);


  // Fetch user's current plan data and payment logs
  useEffect(() => {
    const fetchUserPlanAndPaymentLogs = async () => {
      if (user && user.uid) {
        try {
          // Fetch user data
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserCurrentPlan(userData.plan || null);
            setUserPlanExpiry(userData.premium_expiry || null);

            // If user is on premium plan, fetch billing cycle from payment logs API
            if (userData.plan === "premium") {
              try {
                console.log('🔍 Fetching payment logs for premium user:', user.uid);
                const response = await fetch(`/api/payment-logs?userId=${user.uid}`);
                console.log('🔍 Payment logs API response status:', response.status);

                if (response.ok) {
                  const paymentData = await response.json();
                  console.log('🔍 Payment Logs API Response:', paymentData);
                  console.log('🔍 Payment Logs API Response type:', typeof paymentData);
                  console.log('🔍 Payment Logs API Response keys:', Object.keys(paymentData));

                  // Check if paymentData has the expected structure
                  if (paymentData && typeof paymentData === 'object') {
                    console.log('🔍 Payment data is object, checking for transactions property');

                    // First check for transactions array (the actual structure from API)
                    if (paymentData.transactions) {
                      console.log('🔍 transactions property found:', paymentData.transactions);
                      console.log('🔍 transactions type:', typeof paymentData.transactions);
                      console.log('🔍 transactions length:', Array.isArray(paymentData.transactions) ? paymentData.transactions.length : 'Not an array');

                      if (Array.isArray(paymentData.transactions) && paymentData.transactions.length > 0) {
                        // Find the most recent SUCCESSFUL payment to determine current billing cycle
                        const successfulPayments = paymentData.transactions.filter(tx => tx.status === 'success');
                        console.log('🔍 Successful payments found:', successfulPayments.length);

                        if (successfulPayments.length > 0) {
                          // Sort by timestamp to get the most recent successful payment
                          const sortedPayments = successfulPayments.sort((a, b) =>
                            new Date(b.timestamp) - new Date(a.timestamp)
                          );

                          const latestSuccessfulPayment = sortedPayments[0];
                          console.log('🔍 Latest Successful Payment:', latestSuccessfulPayment);
                          console.log('🔍 Latest Successful Payment billingCycle:', latestSuccessfulPayment.billingCycle);
                          console.log('🔍 Latest Successful Payment timestamp:', latestSuccessfulPayment.timestamp);

                          if (latestSuccessfulPayment.billingCycle) {
                            // Update the user's current plan to include billing cycle info
                            const newPlan = `${userData.plan}_${latestSuccessfulPayment.billingCycle}`;
                            setUserCurrentPlan(newPlan);
                            console.log('✅ Billing Cycle Detected from successful payment:', latestSuccessfulPayment.billingCycle);
                            console.log('✅ New userCurrentPlan set to:', newPlan);
                          } else {
                            console.log('⚠️ No billing cycle found in successful payment');
                            console.log('⚠️ Successful payment keys:', Object.keys(latestSuccessfulPayment));
                          }
                        } else {
                          console.log('⚠️ No successful payments found in transactions');
                          console.log('⚠️ All transaction statuses:', paymentData.transactions.map(tx => ({ id: tx.id, status: tx.status, billingCycle: tx.billingCycle })));
                        }
                      } else {
                        console.log('⚠️ transactions array is empty or not an array');
                        console.log('⚠️ transactions value:', paymentData.transactions);
                      }
                    } else if (paymentData.paymentLogs) {
                      // Fallback to paymentLogs structure if it exists
                      console.log('🔍 paymentLogs property found (fallback):', paymentData.paymentLogs);
                      console.log('🔍 paymentLogs type:', typeof paymentData.paymentLogs);
                      console.log('🔍 paymentLogs length:', Array.isArray(paymentData.paymentLogs) ? paymentData.paymentLogs.length : 'Not an array');

                      if (Array.isArray(paymentData.paymentLogs) && paymentData.paymentLogs.length > 0) {
                        // Get the latest payment log
                        const latestPayment = paymentData.paymentLogs[0];
                        console.log('🔍 Latest Payment Log (fallback):', latestPayment);
                        console.log('🔍 Latest Payment Log billingCycle:', latestPayment.billingCycle);

                        if (latestPayment.billingCycle) {
                          const newPlan = `${userData.plan}_${latestPayment.billingCycle}`;
                          setUserCurrentPlan(newPlan);
                          console.log('✅ Billing Cycle Detected from payment logs (fallback):', latestPayment.billingCycle);
                          console.log('✅ New userCurrentPlan set to:', newPlan);
                        }
                      }
                    } else {
                      console.log('⚠️ No transactions or paymentLogs property found in response');
                      console.log('⚠️ Available properties:', Object.keys(paymentData));
                    }
                  } else {
                    console.log('⚠️ Payment data is not an object or is null/undefined');
                    console.log('⚠️ Payment data value:', paymentData);
                  }
                } else {
                  console.error('❌ Payment logs API error:', response.status);
                  const errorText = await response.text();
                  console.error('❌ Payment logs API error text:', errorText);
                }
              } catch (apiError) {
                console.error("Error fetching payment logs from API:", apiError);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user plan:", error);
        }
      }
    };

    fetchUserPlanAndPaymentLogs();
  }, [user]);

  // Remove billingCycle state and related logic
  // Remove the billing toggle UI
  // Remove yearly pricing references
  // Keep only monthly pricing display
  useEffect(() => {
    const cycle = searchParams.get("billingCycle");
    if (cycle === "basic" || cycle === "monthly" || cycle === "quarterly" || cycle === "sixMonth") {
      // setBillingCycle(cycle); // This line is removed
    }
  }, [searchParams]);

  // Fetch user data to check download limits
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    } else {
      setUserData(null);
    }
  }, [user]);


  const {
    currency: selectedCurrency,
    basicPrice,
    monthlyPrice,
    quarterlyPrice,
    sixMonthPrice,
    professionalPrice,
    trialPrice,
    basicBasePrice,
    monthlyBasePrice,
    quarterlyBasePrice,
    sixMonthBasePrice,
    professionalBasePrice,
    trialBasePrice,
    // Anchor prices
    basicAnchorPrice,
    monthlyAnchorPrice,
    quarterlyAnchorPrice,
    sixMonthAnchorPrice,
    competitors,
  } = getCurrencyAndPriceByCountry(currency, isAndroidDevice);

  const formatPrice = (price, currency) => {
    return formatGlobalPrice(price, currency);
  };

  const handleCheckoutClick = (e, billingCycle, currency) => {
    if (user && !isPremium) {
      e.preventDefault();
      router.push(`/checkout?billingCycle=${billingCycle}&currency=${currency}`);
      if (typeof window !== "undefined" && window.clarity) {
        window.clarity("set", "event", "checkout_click");
      }
    }
  };

  // Check if basic plan user has reached download limit
  const checkBasicPlanDownloadLimit = (userData) => {
    console.log('🔍 Pricing: Checking download limit:', {
      userData: !!userData,
      user: !!user,
      plan: userData?.plan,
      downloadCount: userData?.pdf_download_count || 0,
      premium_expiry: userData?.premium_expiry
    });

    if (!userData || !user) {
      console.log('🔍 Pricing: No userData or user, returning false');
      return false;
    }

    // Only check Basic Plan users (not Premium users)
    // Premium users have unlimited downloads
    if (userData.plan === "premium" || userData.plan === "monthly" || userData.plan === "sixMonth") {
      console.log('🔍 Pricing: User has premium plan, no download limit');
      return false;
    }

    // Check if user has Basic Plan
    if (userData.plan !== "basic") {
      console.log('🔍 Pricing: User not on basic plan, returning false');
      return false;
    }

    // Check if plan has expired
    if (userData.premium_expiry) {
      const expiryDate = new Date(userData.premium_expiry);
      const now = new Date();
      const isExpired = now > expiryDate;

      if (isExpired) {
        console.log('🔍 Pricing: Plan expired, user needs to upgrade');
        return true;
      }
    }

    // Check download count for Basic Plan users (download limit from config)
    const downloadCount = userData.pdf_download_count || 0;
    const planType = "basic";
    const hasReachedLimit = downloadCount >= getPlanConfig(planType).downloads;

    console.log('🔍 Pricing: Download limit check result:', {
      downloadCount,
      hasReachedLimit,
      plan: userData.plan,
      planType,
      limit: getPlanConfig(planType).downloads
    });

    return hasReachedLimit;
  };

  // Handle plan button click with upgrade logic
  const handlePlanClick = (e, planBillingCycle) => {
    e.preventDefault();

    console.log('🎯 Pricing: Plan click debug:', {
      user: !!user,
      isPremium,
      userData: userData ? {
        plan: userData.plan,
        pdf_download_count: userData.pdf_download_count,
        premium_expiry: userData.premium_expiry
      } : null,
      planBillingCycle,
      userCurrentBillingCycle
    });

    // If user is not logged in, redirect to login with checkout intent
    if (!user) {
      console.log('🎯 Pricing: Anonymous user - redirecting to login with checkout intent');
      router.push(`/login?redirect=checkout&billingCycle=${planBillingCycle}&currency=${currency}&step=2`);
      if (typeof window !== "undefined" && window.clarity) {
        window.clarity("set", "event", "checkout_click");
      }
      return;
    }

    // Check if user has exceeded download limits first (for basic plan users)
    if (userData) {
      const hasReachedLimit = checkBasicPlanDownloadLimit(userData);
      console.log('🎯 Pricing: Download limit check:', hasReachedLimit);

      if (hasReachedLimit) {
        console.log('🎯 Pricing: Redirecting to checkout - download limit reached');
        const planType = "basic";
        toast.error(getDownloadLimitMessage(planType, false));
        router.push(`/checkout?billingCycle=${planBillingCycle}&currency=${currency}`);
        return;
      }
    }

    // If user is logged in, use upgrade logic
    if (user && userCurrentBillingCycle) {
      const currentPlanHierarchy = planHierarchy[userCurrentBillingCycle] || 0;
      const requestedPlanHierarchy = planHierarchy[planBillingCycle] || 0;

      console.log('🎯 Pricing: Upgrade logic check:', {
        currentPlanHierarchy,
        requestedPlanHierarchy,
        isUpgrade: requestedPlanHierarchy > currentPlanHierarchy,
        redirectsToResumeBuilder: requestedPlanHierarchy <= currentPlanHierarchy
      });

      if (requestedPlanHierarchy <= currentPlanHierarchy) {
        // Same or lower tier plan - redirect to resume builder
        console.log('🎯 Pricing: Redirecting to resume builder - same/lower tier plan');
        router.push("/resume-builder");
        return;
      } else {
        // Higher tier plan - go to checkout for upgrade
        console.log('🎯 Pricing: Redirecting to checkout - upgrade plan');
        router.push(`/checkout?billingCycle=${planBillingCycle}&currency=${currency}`);
        if (typeof window !== "undefined" && window.clarity) {
          window.clarity("set", "event", "checkout_click");
        }
        return;
      }
    }

    // Fallback for users without billing cycle info - go to checkout
    if (user && !userCurrentBillingCycle) {
      console.log('🎯 Pricing: Redirecting to checkout - no billing cycle info (fallback)');
      router.push(`/checkout?billingCycle=${planBillingCycle}&currency=${currency}`);
      if (typeof window !== "undefined" && window.clarity) {
        window.clarity("set", "event", "checkout_click");
      }
      return;
    }

    // For non-premium users, go to checkout
    if (user && !isPremium) {
      console.log('🎯 Pricing: Redirecting to checkout - non-premium user');
      router.push(`/checkout?billingCycle=${planBillingCycle}&currency=${currency}`);
      if (typeof window !== "undefined" && window.clarity) {
        window.clarity("set", "event", "checkout_click");
      }
    }
  };

  // Plan hierarchy for upgrade logic
  const planHierarchy = {
    basic: 1,
    monthly: 2,
    quarterly: 2.5,
    sixMonth: 3
  };

  // Map user's current plan to billing cycle for proper hierarchy comparison
  // ONLY use payment logs as source of truth - no fallback logic
  const getUserBillingCycle = (userPlan) => {
    if (!userPlan || userPlan === "free" || userPlan === "anonymous") return null;

    // Check if userPlan contains billing cycle info (e.g., "premium_monthly")
    if (userPlan.includes('_')) {
      const parts = userPlan.split('_');
      if (parts.length === 2 && parts[0] === "premium") {
        return parts[1]; // Return the billing cycle part from payment logs
      }
    }

    // If user is on "premium" plan but no billing cycle info from payment logs
    // DO NOT fallback to expiry date logic - this means payment logs API failed
    if (userPlan === "premium") {
      console.warn('⚠️ User on premium plan but no billing cycle from payment logs - API may have failed');
      return null; // Return null instead of guessing
    }

    // Direct mapping for other plans (basic, etc.)
    return userPlan;
  };

  // Get user's current billing cycle for hierarchy comparison
  const userCurrentBillingCycle = getUserBillingCycle(userCurrentPlan);

  // Debug logging
  console.log('🔍 User Plan Debug:', {
    userCurrentPlan,
    userCurrentBillingCycle,
    userPlanExpiry,
    planHierarchy: planHierarchy
  });

  // Smart checkout URL function with upgrade logic
  const getCheckoutUrl = (billingCycle) => {
    // If user is not logged in, always go to checkout
    if (!user) {
      return `/checkout?billingCycle=${billingCycle}&currency=${currency}&step=2`;
    }

    // If user is logged in, check if this is an upgrade
    if (userCurrentBillingCycle) {
      const currentPlanHierarchy = planHierarchy[userCurrentBillingCycle] || 0;
      const requestedPlanHierarchy = planHierarchy[billingCycle] || 0;

      console.log(`🔍 getCheckoutUrl: ${billingCycle}`, {
        userCurrentPlan,
        userCurrentBillingCycle,
        currentPlanHierarchy,
        requestedPlanHierarchy,
        isUpgrade: requestedPlanHierarchy > currentPlanHierarchy
      });

      // If requested plan is the same tier, redirect to resume builder
      if (requestedPlanHierarchy === currentPlanHierarchy) {
        return "/resume-builder";
      }

      // If requested plan is lower tier, also redirect to resume builder (downgrade)
      if (requestedPlanHierarchy < currentPlanHierarchy) {
        return "/resume-builder";
      }

      // If requested plan is higher tier, go to checkout
      return `/checkout?billingCycle=${billingCycle}&currency=${currency}&step=2`;
    }

    // Default case: go to checkout
    return `/checkout?billingCycle=${billingCycle}&currency=${currency}&step=2`;
  };

  // Define all plans
  const allPlans = [

    {
      name: PLAN_CONFIG.basic.name,
      price: basicPrice,
      anchorPrice: basicAnchorPrice,
      billing: `${PLAN_CONFIG.basic.duration}-day access`,
      billingCycle: "basic",
      description: PLAN_CONFIG.basic.description,
      badge: PLAN_CONFIG.basic.badge,
      badgeColor: PLAN_CONFIG.basic.badgeColor,
      features: [
        { icon: <CheckCircle size={18} />, text: `${PLAN_CONFIG.basic.downloads} Resume Downloads (${PLAN_CONFIG.basic.duration} days)` },
        { icon: <BadgeCheck size={18} />, text: "AI Suggestions" },
        { icon: <Zap size={18} />, text: "50+ Premium Templates" },
        { icon: <DollarSign size={18} />, text: "ATS Score Checker" },
        { icon: <CheckCircle size={18} />, text: "Custom Colors" },
        { icon: <FileText size={18} />, text: "One Pager Resume Creator" },
        { icon: <Brain size={18} />, text: "AI Bullet Points Generator" },
        { icon: <Sparkles size={18} />, text: "AI Boost Full Resume" },
        { icon: <Edit size={18} />, text: "Advanced Resume Editor" },
        { icon: <Move size={18} />, text: "Drag & Drop (Desktop Only)" },
        { icon: <FileText size={18} />, text: "AI-Powered Cover Letter Builder" },
        { text: "Email Support", icon: <CheckCircle size={18} className="text-emerald-600" /> },
      ],
      cta: "Get Started",
      href: user && !isPremium ? getCheckoutUrl("basic") : "/signup",
      isBasicPlan: true,
      highlighted: true,
      className: "ring-2 ring-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50",
      isUpgrade: userCurrentBillingCycle && planHierarchy.basic > (planHierarchy[userCurrentBillingCycle] || 0),
      redirectsToResumeBuilder: userCurrentBillingCycle && planHierarchy.basic === (planHierarchy[userCurrentBillingCycle] || 0),
    },
    {
      name: PLAN_CONFIG.monthly.name,
      price: monthlyPrice,
      anchorPrice: monthlyAnchorPrice,
      billing: `${PLAN_CONFIG.monthly.duration}-day access`,
      billingCycle: "monthly",
      description: PLAN_CONFIG.monthly.description,
      badge: PLAN_CONFIG.monthly.badge,
      badgeColor: PLAN_CONFIG.monthly.badgeColor,
      features: [
        { icon: <Crown size={18} className="text-purple-600" />, text: "JD Builder - Tailor to Any Job", isPremium: true, isHighlighted: true, tooltip: { title: "Tailored Resume", description: "Our AI builds a specific resume for every single job you apply to. It analyzes the job description references and optimizes your resume to match the keywords and skills required." } },
        { icon: <Sparkles size={18} className="text-purple-600" />, text: "ExpertResume GPT", isPremium: true, isHighlighted: true },
        { icon: <DollarSign size={18} className="text-purple-600" />, text: "Salary Analyzer", isPremium: true, isHighlighted: true },
        { icon: <Rocket size={18} className="text-teal-600" />, text: "AI Career Coach - 6 Month Roadmap", isPremium: true, isHighlighted: true },
        { icon: <Zap size={18} />, text: "Unlimited Downloads", isHighlighted: true },
        { icon: <Phone size={18} className="text-green-600" />, text: "24/7 Email & Chat Support", isPremium: true, isHighlighted: true },
        { icon: <Users size={18} className="text-emerald-600" />, text: "Personalized Career Guidance", isPremium: true, isHighlighted: true },
        { icon: <Upload size={18} className="text-purple-600" />, text: "AI Upload Resume (1-Min)", isPremium: true, isHighlighted: true },
        { icon: <Crown size={18} className="text-yellow-600" />, text: "Priority Support", isPremium: true, isHighlighted: true },
        { icon: <Rocket size={18} className="text-orange-600" />, text: "Advanced Analytics", isPremium: true, isHighlighted: true },
        { icon: <CheckCircle size={18} className="text-gray-400" />, text: "All Starter Plan Features" },
      ],
      cta: user && !isPremium ? "Go Pro" : "Get Started",
      href: user && !isPremium ? getCheckoutUrl("monthly") : "/signup",
      highlighted: false,
      className: "",
      isUpgrade: userCurrentBillingCycle && planHierarchy.monthly > (planHierarchy[userCurrentBillingCycle] || 0),
      redirectsToResumeBuilder: userCurrentBillingCycle && planHierarchy.monthly === (planHierarchy[userCurrentBillingCycle] || 0),
    },
    {
      name: PLAN_CONFIG.quarterly.name,
      price: quarterlyPrice,
      anchorPrice: quarterlyAnchorPrice,
      billing: `${PLAN_CONFIG.quarterly.duration}-day access`,
      billingCycle: "quarterly",
      description: PLAN_CONFIG.quarterly.description,
      badge: PLAN_CONFIG.quarterly.badge,
      badgeColor: PLAN_CONFIG.quarterly.badgeColor,
      features: [
        { icon: <Crown size={18} className="text-purple-600" />, text: "JD Builder - Tailor to Any Job", isPremium: true, isHighlighted: true, tooltip: { title: "Tailored Resume", description: "Our AI builds a specific resume for every single job you apply to. It analyzes the job description references and optimizes your resume to match the keywords and skills required." } },
        { icon: <Sparkles size={18} className="text-purple-600" />, text: "ExpertResume GPT", isPremium: true, isHighlighted: true },
        { icon: <DollarSign size={18} className="text-purple-600" />, text: "Salary Analyzer", isPremium: true, isHighlighted: true },
        { icon: <Rocket size={18} className="text-teal-600" />, text: "AI Career Coach - 3 Month Roadmap", isPremium: true, isHighlighted: true },
        { icon: <Zap size={18} />, text: "Unlimited Downloads for 3 Months", isHighlighted: true },
        { icon: <Phone size={18} className="text-green-600" />, text: "24/7 Email & Chat Support", isPremium: true, isHighlighted: true },
        { icon: <Users size={18} className="text-emerald-600" />, text: "Personalized Career Guidance", isPremium: true, isHighlighted: true },
        { icon: <Upload size={18} className="text-purple-600" />, text: "AI Upload Resume (1-Min)", isPremium: true, isHighlighted: true },
        { icon: <Crown size={18} className="text-yellow-600" />, text: "Priority Support", isPremium: true, isHighlighted: true },
        { icon: <Rocket size={18} className="text-orange-600" />, text: "Advanced Analytics", isPremium: true, isHighlighted: true },
        { icon: <CheckCircle size={18} className="text-gray-400" />, text: "All Starter Plan Features" },
      ],
      cta: user && !isPremium ? "Go Pro" : "Get Started",
      href: user && !isPremium ? getCheckoutUrl("quarterly") : "/signup",
      highlighted: false,
      className: "ring-2 ring-emerald-500",
      isUpgrade: userCurrentBillingCycle && planHierarchy.quarterly > (planHierarchy[userCurrentBillingCycle] || 0),
      redirectsToResumeBuilder: userCurrentBillingCycle && planHierarchy.quarterly === (planHierarchy[userCurrentBillingCycle] || 0),
    },
    {
      name: PLAN_CONFIG.sixMonth.name,
      price: sixMonthPrice,
      anchorPrice: sixMonthAnchorPrice,
      billing: `${PLAN_CONFIG.sixMonth.duration}-day access`,
      billingCycle: "sixMonth",
      description: PLAN_CONFIG.sixMonth.description,
      badge: PLAN_CONFIG.sixMonth.badge,
      badgeColor: PLAN_CONFIG.sixMonth.badgeColor,
      features: [
        { icon: <Crown size={18} className="text-purple-600" />, text: "JD Builder - Tailor to Any Job", isPremium: true, isHighlighted: true, tooltip: { title: "Tailored Resume", description: "Our AI builds a specific resume for every single job you apply to. It analyzes the job description references and optimizes your resume to match the keywords and skills required." } },
        { icon: <Sparkles size={18} className="text-purple-600" />, text: "ExpertResume GPT", isPremium: true, isHighlighted: true },
        { icon: <DollarSign size={18} className="text-purple-600" />, text: "Salary Analyzer", isPremium: true, isHighlighted: true },
        { icon: <Rocket size={18} className="text-teal-600" />, text: "AI Career Coach - 6 Month Roadmap", isPremium: true, isHighlighted: true },
        { icon: <Zap size={18} />, text: "Unlimited Downloads for 6 Months", isHighlighted: true },
        { icon: <Phone size={18} className="text-green-600" />, text: "24/7 Email & Chat Support", isPremium: true, isHighlighted: true },
        { icon: <Users size={18} className="text-emerald-600" />, text: "Personalized Career Guidance", isPremium: true, isHighlighted: true },
        { icon: <Upload size={18} className="text-purple-600" />, text: "AI Upload Resume (1-Min)", isPremium: true, isHighlighted: true },
        { icon: <Crown size={18} className="text-yellow-600" />, text: "Priority Support", isPremium: true, isHighlighted: true },
        { icon: <Rocket size={18} className="text-orange-600" />, text: "Advanced Analytics", isPremium: true, isHighlighted: true },
        { icon: <CheckCircle size={18} className="text-gray-400" />, text: "All Starter Plan Features" },
      ],
      cta: user && !isPremium ? "Go Pro" : "Get Started",
      href: user && !isPremium ? getCheckoutUrl("sixMonth") : "/signup",
      highlighted: false,
      className: "ring-2 ring-purple-500",
      isUpgrade: userCurrentBillingCycle && planHierarchy.sixMonth > (planHierarchy[userCurrentBillingCycle] || 0),
      redirectsToResumeBuilder: userCurrentBillingCycle && planHierarchy.sixMonth === (planHierarchy[userCurrentBillingCycle] || 0),
    },
  ];

  // Filter plans based on device - show all remaining plans to everyone - EXCLUDING apply_pro for core grid
  const plansWithHighlight = allPlans
    .filter(p => p.billingCycle !== 'apply_pro')
    .map(plan => ({
      ...plan,
      highlighted: plan.billingCycle === "basic" // Highlight the starter plan
    }));

  console.log('🔍 Pricing Plans:', {
    isAndroidDevice,
    totalPlans: allPlans.length,
    filteredPlans: plansWithHighlight.length,
    plansShown: plansWithHighlight.map(p => p.name),
    userCurrentPlan,
    planHierarchy: planHierarchy
  });

  // Debug upgrade logic for each plan
  plansWithHighlight.forEach(plan => {
    if (userCurrentBillingCycle) {
      const currentHierarchy = planHierarchy[userCurrentBillingCycle] || 0;
      const requestedHierarchy = planHierarchy[plan.billingCycle] || 0;
      console.log(`🔍 Plan ${plan.name} (${plan.billingCycle}):`, {
        userCurrentPlan,
        userCurrentBillingCycle,
        currentHierarchy,
        requestedHierarchy,
        isUpgrade: requestedHierarchy > currentHierarchy,
        redirectsToResumeBuilder: requestedHierarchy <= currentHierarchy
      });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6">

        {/* Pro Upgrade Banner - Only for basic plan users */}
        <ProUpgradeBanner userSubscription={userData} />
      </div>

      <div className="">
        {/* Structured Data */}
        <script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: "ExpertResume",
              image: "https://expertresume.us/ExpertResume.png",
              url: "https://expertresume.us",
              description:
                `ExpertResume offers AI-powered resume building, job-specific templates, ATS score checker, AI interview trainer, and salary analyzer. Free or upgrade for ${formatPrice(basicPrice, currency)} (7 days), ${formatPrice(monthlyPrice, currency)} (30 days) or ${formatPrice(sixMonthPrice, currency)} (6 months).`,
              brand: {
                "@type": "Brand",
                name: "Vendax Systems LLC",
              },
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: currency,
                  name: "Free Plan",
                  description: "Access resume editor, ATS score checker, and AI suggestions for free.",
                  url: "https://expertresume.us/pricing",
                },
                {
                  "@type": "Offer",
                  price: (monthlyPrice / 100).toFixed(2),
                  priceCurrency: currency,
                  priceValidUntil: "2026-12-31",
                  name: "Premium Monthly",
                  description: `Unlock all features for ${formatPrice(monthlyPrice, currency)} (30 days), including job-specific templates and AI interview trainer.`,
                  url: "https://expertresume.us/pricing",
                },
                {
                  "@type": "Offer",
                  price: (quarterlyPrice / 100).toFixed(2),
                  priceCurrency: currency,
                  priceValidUntil: "2026-12-31",
                  name: "Expert Quarterly",
                  description: `Unlock all features for ${formatPrice(quarterlyPrice, currency)} (90 days).`,
                  url: "https://expertresume.us/pricing",
                },
                {
                  "@type": "Offer",
                  price: (sixMonthPrice / 100).toFixed(2),
                  priceCurrency: currency,
                  priceValidUntil: "2026-12-31",
                  name: "Pro 6-Month",
                  description: `Get all premium features for ${formatPrice(sixMonthPrice, currency)} (6 months).`,
                  url: "https://expertresume.us/pricing",
                },
              ],
            }),
          }}
        />

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-4">

          <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3">
            <Rocket className="mr-2" size={14} /> Trusted by 15,000+ professionals
          </div>

          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            {isLoadingGeo ? "Loading pricing..." :
              `Start free or go Premium from just ${formatPrice(basicPrice, currency)}. Premium features include JD-Match, AI-Bullet Points, and Interview prep.`
            }
          </p>

          {/* Flash Sale Banner */}
          <FlashSaleBanner />

          {/* Resume Service Banner */}
          <div className="max-w-2xl mx-auto mb-6 px-4">
            <Link
              href="/book-resume-service"
              className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 flex-shrink-0" />
              <span className="relative z-10 text-center leading-tight">
                <span className="hidden sm:inline">Avoid the Hassle - Book Our Resume Experts</span>
                <span className="sm:hidden">Done-for-You Resume</span>
              </span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300 relative z-10 flex-shrink-0" />
            </Link>
            <p className="mt-3 text-xs sm:text-sm text-gray-600 text-center">
              Prefer concierge support? Let our specialists build your resume, LinkedIn, and interview pitch end-to-end.
            </p>
          </div>

          {/* Upgrade message for logged-in users */}
          {user && userCurrentBillingCycle && (
            <div className="max-w-2xl mx-auto p-2 bg-emerald-50 border border-emerald-200 rounded-lg mb-3">
              <div className="flex items-center justify-center gap-2 text-emerald-800">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">
                  You're on <strong>{userCurrentBillingCycle === "basic" ? "Starter" : userCurrentBillingCycle === "monthly" ? "Monthly" : userCurrentBillingCycle === "quarterly" ? "Quarterly" : "6-Month"}</strong> plan. Choose upgrade or current plan.
                </span>
              </div>
            </div>
          )}

          {/* No Auto-Deduction Trust Message */}
          <div className="inline-flex items-center bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-4 border border-emerald-200">
            <CheckCircle className="mr-2" size={16} />
            <span>🔒 <strong>No Auto-Deduction</strong> - You control payments</span>
          </div>

          {/* Currency Switcher - HIDDEN for USD-only pricing */}
          {false && typeof window !== 'undefined' && (window.location.hostname === 'expertresume.com' || window.location.hostname.endsWith('.expertresume.com')) && (
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Currency:</span>
                  <CurrencySwitcher variant="compact" showLabel={false} onCurrencyChange={handleCurrencyChange} />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modals Triggers and Layout Adjustments */}

        {/* Recommendation Trigger & "Browse Plans" Header merged for clean layout */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                Choose Your Plan
              </h2>
            </div>
          </div>
        </div>



        {/* Pricing Section */}
        {!isLoadingGeo && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            {/* 2-COLUMN LAYOUT: STARTER (DECOY) vs PROFESSIONAL (HERO) */}
            <div className="max-w-5xl mx-auto">
              {(() => {
                // Get the plans
                const starterPlan = allPlans.find(p => p.billingCycle === 'basic');
                const proPlan = allPlans.find(p => p.billingCycle === proBillingCycle) || allPlans.find(p => p.billingCycle === 'quarterly');

                if (!starterPlan || !proPlan) return null;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">

                    {/* LEFT CARD: STARTER PLAN (DECOY) */}
                    <div className="order-2 md:order-1 flex">
                      <div className="w-full bg-white rounded-2xl border border-gray-200 p-8 hover:border-gray-300 transition-all duration-300 flex flex-col justify-between h-full">
                        <div>
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Starter (Trial Pack)</h3>
                            <p className="text-sm text-gray-500 text-balance">The "Sachet Deal" - Perfect for a quick download.</p>
                          </div>

                          <div className="flex flex-col mb-6">
                            {basicAnchorPrice > 0 && basicAnchorPrice !== basicPrice && (
                              <span className="text-sm font-bold text-gray-400 line-through leading-none mb-1">
                                {formatPrice(basicAnchorPrice, currency)}
                              </span>
                            )}
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold text-gray-900">{formatPrice(starterPlan.price, currency)}</span>
                              <span className="text-sm text-gray-500 font-medium">/ 7 days</span>
                            </div>
                          </div>

                          <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3 text-sm text-gray-600">
                              <CheckCircle size={18} className="text-gray-400 mt-0.5 shrink-0" />
                              <span>{getPlanConfig("basic").downloads} PDF Downloads</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-600">
                              <CheckCircle size={18} className="text-gray-400 mt-0.5 shrink-0" />
                              <span>50+ Premium Templates</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-600">
                              <CheckCircle size={18} className="text-gray-400 mt-0.5 shrink-0" />
                              <span>AI Suggestions & ATS Checker</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-600">
                              <CheckCircle size={18} className="text-gray-400 mt-0.5 shrink-0" />
                              <span>AI Bullet Points & Cover Letter Builder</span>
                            </li>
                          </ul>
                        </div>

                        <button
                          onClick={(e) => handlePlanClick(e, 'basic')}
                          className="w-full py-3 rounded-lg font-bold text-sm bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-all duration-200"
                        >
                          Choose Starter
                        </button>
                      </div>
                    </div>

                    {/* RIGHT CARD: PROFESSIONAL PLAN (HERO) */}
                    <div className="order-1 md:order-2 flex">
                      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-green-900/10 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between h-full transform md:-translate-y-2">
                        {/* Selected Badge */}
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[11px] uppercase font-bold px-4 py-1.5 rounded-bl-xl shadow-sm tracking-wider">
                          Most Popular
                        </div>

                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-100/50 rounded-lg">
                              <Crown size={24} className="text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">Professional Plan</h3>
                              <p className="text-sm text-gray-500">Everything you need to get hired.</p>
                            </div>
                          </div>

                          {/* RESPONSIVE SELECTION: TABS (Desktop) / DROPDOWN (Mobile) */}

                          {/* DESKTOP: Internal Tabs */}
                          <div className="hidden md:flex p-1 bg-gray-50 border border-gray-100 rounded-xl mb-8 self-center w-full">
                            {[
                              { id: 'monthly', label: 'Monthly' },
                              { id: 'quarterly', label: 'Quarterly', discount: '-25%' },
                              { id: 'sixMonth', label: '6-Months', discount: '-40%' }
                            ].map(tab => (
                              <button
                                key={tab.id}
                                onClick={() => handleProTabChange(tab.id)}
                                className={`flex-1 px-2 py-2.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 ${proBillingCycle === tab.id ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                              >
                                {tab.label}
                                {tab.discount && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${proBillingCycle === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
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
                                className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm font-bold py-4 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              >
                                <option value="monthly">Pro Monthly</option>
                                <option value="quarterly">Pro Quarterly (Save 25%)</option>
                                <option value="sixMonth">Pro Semi-Annual (Save 40%)</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-emerald-600">
                                <ChevronDown size={20} />
                              </div>
                            </div>
                          </div>

                          {/* DYNAMIC PRICE DISPLAY */}
                          <div className="flex flex-col mb-1">
                            <div className="flex items-baseline gap-3">
                              <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                                {formatPrice(proPlan.price, currency)}
                              </span>
                              <div className="flex flex-col items-start leading-tight">
                                {proPlan.anchorPrice > 0 && proPlan.anchorPrice !== proPlan.price && (
                                  <span className="text-sm font-bold text-gray-400 strike-through line-through">
                                    {formatPrice(proPlan.anchorPrice, currency)}
                                  </span>
                                )}
                                <span className="text-sm font-bold text-gray-500">
                                  {proBillingCycle === 'monthly' ? '/ 30 days' :
                                    proBillingCycle === 'quarterly' ? '/ 90 days' : '/ 180 days'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-8">
                            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                              One-time payment
                            </div>
                            <div className="text-xs text-gray-400 font-medium">
                              No auto-renewal
                            </div>
                          </div>

                          {/* FEATURES LIST - WALL OF VALUE */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8">
                            {[
                              "Unlimited PDF Downloads",
                              "AI Resume Checker (ATS Score)",
                              "Access to All Premium Templates",
                              "Smart Bullet Points Generator",
                              "Real-time Content Analysis",
                              "Unlimited Resumes & Cover Letters",
                              "AI Cover Letter Builder",
                              "Shareable Live Resume Link"
                            ].map((feature, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="mt-0.5 p-0.5 rounded-full bg-emerald-100/50 shrink-0">
                                  <CheckCircle size={14} className="text-emerald-600" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium leading-snug">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={(e) => handlePlanClick(e, proBillingCycle)}
                          className="w-full py-4 rounded-xl font-bold text-base bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          Get Started Now <ArrowRight size={18} />
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium">
                          <Shield size={12} /> 100% Money-back guarantee • <span className="text-emerald-600">Secure Checkout</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Compact Additional info under cards */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-xs mb-3 flex items-center justify-center gap-2">
                  <Shield size={14} className="text-gray-400" />
                  <strong>No Auto-Renewal</strong> • All plans are one-time payments
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ADD-ONS TEASER */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Zap className="text-emerald-600 w-5 h-5" />
              Supercharge your plan with AI Add-ons
            </h3>
            <p className="text-sm text-gray-600">
              Customize your Pro plan with **AI Job Search**, **AI Interview Kit**, and **Apply Pro Engine** during checkout.
            </p>
          </div>
        </div>


        {/* Value Comparison Section */}
        {!isLoadingGeo && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">
              Unbeatable Value Compared to Competitors
            </h2>
            <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
              Get 7 premium career tools for less than the cost of one standalone service, tailored for your job market.
            </p>
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">Standalone Cost ({currency})</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">ExpertResume Premium</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">AI Resume Builder</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {currency === "INR" ? "₹2,000–₹5,000" : "$25–$60"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium text-center">✓ Included</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Job-Specific Templates</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {currency === "INR" ? "₹1,500–₹3,000" : "$20–$40"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium text-center">✓ Included</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">AI Interview Trainer</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {currency === "INR" ? "₹2,500–₹5,000" : "$30–$60"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium text-center">✓ Included</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ATS Score Checker</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {currency === "INR" ? "₹1,000–₹2,000" : "$15–$25"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium text-center">✓ Free</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Salary Analyzer</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {currency === "INR" ? "₹1,500–₹3,000" : "$20–$40"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium text-center">✓ Included</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">One-Pager Resume</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {currency === "INR" ? "₹2,000–₹4,000" : "$25–$50"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium text-center">✓ Included</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">AI-Powered Cover Letter Builder</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {currency === "INR" ? "₹1,500–₹3,000" : "$20–$40"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium text-center">✓ Included</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">JD-Based Cover Letter Builder</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {currency === "INR" ? "₹2,000–₹4,000" : "$25–$50"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium text-center">✓ Included</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Value</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {currency === "INR" ? "₹14,000–₹29,000" : "$180–$365"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-bold text-center">
                      {formatPrice(monthlyPrice, currency)} (30 days)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg">
              <BadgeCheck className="text-emerald-600" size={20} />
              <span className="text-sm font-medium">15,000+ Successful Resumes</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg">
              <ThumbsUp className="text-emerald-600" size={20} />
              <span className="text-sm font-medium">97% Customer Satisfaction</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg">
              <Clock className="text-emerald-600" size={20} />
              <span className="text-sm font-medium">3x More Interviews</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg">
              <Award className="text-emerald-600" size={20} />
              <span className="text-sm font-medium">Jobseekers First Choice</span>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <Testimonial />
        </div>

        {/* ROI Calculator */}
        {!isLoadingGeo && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">
                Maximize Your Career ROI
              </h2>
              <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                ExpertResume users see a 5–15x return through faster job placement and higher salaries.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Without ExpertResume</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Time to Find Job</p>
                      <p className="text-xl font-semibold">3–6 months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Salary Increase</p>
                      <p className="text-xl font-semibold">10–15%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Career Prep Cost</p>
                      <p className="text-xl font-semibold">
                        {currency === "INR" ? "₹8,500–₹18,000" : "$110–$225"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-lg border-2 border-emerald-500 relative">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                    WITH EXPERTRESUME
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-4">With ExpertResume</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Time to Find Job</p>
                      <p className="text-xl font-semibold text-emerald-600">1–3 months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Salary Increase</p>
                      <p className="text-xl font-semibold text-emerald-600">20–35%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Cost</p>
                      <p className="text-xl font-semibold">{formatPrice(sixMonthPrice, currency)}/6-months</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Your Potential Gain</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Time Saved</p>
                      <p className="text-xl font-semibold text-emerald-600">2–4 months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Additional Salary</p>
                      <p className="text-xl font-semibold text-emerald-600">
                        {currency === "INR" ? "₹2–5L/year" : "$25K–$60K/year"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Net Benefit</p>
                      <p className="text-xl font-semibold text-emerald-600">5–15x ROI</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link
                  href={user && !isPremium ? `/checkout?billingCycle=monthly&currency=${currency}` : "/signup"}
                  onClick={(e) => handleCheckoutClick(e, "monthly", currency)}
                  className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-full font-semibold text-base hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Earning More Today
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {!isLoadingGeo && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <FAQItem
                question="What's included in the Premium plan?"
                answer={`The Premium plan (${formatPrice(basicPrice, currency)} for 7 days, ${formatPrice(monthlyPrice, currency)} for 30 days, ${formatPrice(quarterlyPrice, currency)} for 90 days, or ${formatPrice(sixMonthPrice, currency)} for 6 months) includes job-specific templates, watermark-free PDF exports, AI interview trainer, AI boost across your resume, salary analyzer, and All Starter Plan Features like the resume editor, ATS score checker, and AI suggestions.`}
              />
              <FAQItem
                question="Can I use ExpertResume for free?"
                answer="Yes! Our free plan offers a resume editor, real-time preview, custom colors, AI problem solver, AI suggestions, and ATS score checker, no signup required. Upgrade to Premium for advanced features."
              />
              <FAQItem
                question="How does the salary analyzer work?"
                answer="The AI-powered salary analyzer evaluates your role, experience, and location to provide market-rate estimates and negotiation tips, helping you secure 20–35% higher salaries."
              />
              <FAQItem
                question="Do you charge automatically or have auto-deduction?"
                answer="No, we never charge automatically or use auto-deduction. All payments are manual and require your explicit consent. You control when and what you pay, and you are not charged any automatic charges. Your payment security and transparency are our top priorities."
              />
            </div>
          </div>
        )}

        {/* Final CTA */}
        {!isLoadingGeo && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Join 15,000+ professionals and unlock your full potential with ExpertResume's AI-powered tools.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href={user && !isPremium ? `/checkout?billingCycle=monthly&currency=${currency}` : "/signup"}
                  onClick={(e) => handleCheckoutClick(e, "monthly", currency)}
                  className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold text-base hover:bg-emerald-50 transition-all duration-300 shadow-lg"
                >
                  Go Premium Now
                </Link>
                <Link
                  href="/resume-builder"
                  className="inline-block border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-base hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                >
                  Try Free
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
        <ChevronDown
          className={`h-5 w-5 text-emerald-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="mt-2 text-gray-600 text-sm">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}