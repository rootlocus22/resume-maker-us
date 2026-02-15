"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { event } from "../lib/gtag";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Shield, Zap, BadgeCheck, Lock, ArrowLeft, Sparkles, Users, Bell, X, BookOpen, Bot, DollarSign } from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { onAuthStateChanged } from "firebase/auth";

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    } else {
      resolve(true);
    }
  });
};

// Utility to detect mobile iOS
function isMobileIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function ClientCheckout({ initialBillingCycle = "monthly" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency, isLoadingGeo } = useLocation();
  const [step, setStep] = useState(1);
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle);
  const [couponCode, setCouponCode] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({ name: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [userAgent, setUserAgent] = useState("");
  const userId = auth.currentUser?.uid;
  const [countdown, setCountdown] = useState(15 * 60);
  const [popupCountdown, setPopupCountdown] = useState(24 * 60 * 60); // 24 hours
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [popupTrigger, setPopupTrigger] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isIOSMobile, setIsIOSMobile] = useState(false); // default false
  const [authLoading, setAuthLoading] = useState(true);

  // Update isIOSMobile on mount and on user agent changes
  useEffect(() => {
    function updateIOS() {
      setIsIOSMobile(isMobileIOS());
    }
    updateIOS();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateIOS);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateIOS);
      }
    };
  }, []);

  // If iOS and billingCycle is trial, force to monthly
  useEffect(() => {
    if (isIOSMobile && billingCycle === "trial") {
      setBillingCycle("monthly");
    }
  }, [isIOSMobile, billingCycle]);

  // Pricing: GST-inclusive for INR (18%), no GST for USD
  const prices = {
    basic: { INR: 14900, USD: 1200 },
    monthly: { INR: 29900, USD: 2400 }, // ₹299, $24
    yearly: { INR: 299900, USD: 24000 }, // ₹2,999, $240
    trial: { INR: 4900, USD: 500 },
  };

  const basePrices = {
    monthly: { INR: 33800, USD: 3000 }, // ₹338, $30
    yearly: { INR: 338900, USD: 30000 }, // ₹3,389, $300
    trial: { INR: 8389, USD: 500 }, // ₹83.89, $1.50
  };

  const gstAmounts = {
    monthly: { INR: 6100, USD: 0 }, // ₹61, $0
    yearly: { INR: 61000, USD: 0 }, // ₹610, $0
    trial: { INR: 1511, USD: 0 }, // ₹15.11, $0
  };

  // Feature flag for discount/coupon logic
  const DISCOUNT_FEATURE_ENABLED = true;

  // Remove all discount/coupon UI and logic if feature is off
  const discountOptions = DISCOUNT_FEATURE_ENABLED ? [
    { code: "SAVE5", value: 0.05, label: "5% OFF", maxUses: 100 },
    { code: "SAVE10", value: 0.10, label: "10% OFF", maxUses: 50 },
    { code: "SAVE15", value: 0.15, label: "15% OFF", maxUses: 25 },
   /*  { code: "SAVE30", value: 0.30, label: "30% OFF", maxUses: 500 }, */
  ] : [];

  useEffect(() => {
    // Handle URL query parameters for billingCycle ONCE on mount
    const cycle = searchParams.get("billingCycle");
    if (cycle && ["monthly", "yearly", "trial"].includes(cycle)) {
      setBillingCycle(cycle);
    } else {
      setBillingCycle("monthly"); // Default to monthly if not found or invalid
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
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      setPopupCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Detect small screen size
    const handleResize = () => {
      setIsSmallScreen(typeof window !== "undefined" && window.innerHeight < 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Inactivity detection (10s)
    let inactivityTimeout;
    const handleActivity = debounce(() => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        if (typeof window !== "undefined" && !sessionStorage.getItem("exitPopupShown")) {
          setTimeout(() => {
            setShowExitPopup(true);
            setPopupTrigger("inactivity");
            sessionStorage.setItem("exitPopupShown", "true");
            event({ action: "exit_intent_popup_viewed", category: "Checkout", label: "inactivity_trigger" });
            logDebugEvent("inactivity_trigger", "Popup shown due to 10s inactivity");
          }, 500);
        }
      }, 10000);
    }, 200);

    // Navigation and tab-close detection
    const handleMouseOut = (e) => {
      if (typeof window !== "undefined" && sessionStorage.getItem("exitPopupShown")) return;
      if (e.clientY <= 50 || e.relatedTarget === null) {
        setTimeout(() => {
          setShowExitPopup(true);
          setPopupTrigger("tab_close");
          sessionStorage.setItem("exitPopupShown", "true");
          event({ action: "exit_intent_popup_viewed", category: "Checkout", label: "tab_close_trigger" });
          logDebugEvent("tab_close_trigger", "Popup shown due to mouse out");
        }, 500);
      }
    };

    const handleVisibilityChange = () => {
      if (typeof window !== "undefined" && document.visibilityState === "hidden" && !sessionStorage.getItem("exitPopupShown")) {
        setTimeout(() => {
          setShowExitPopup(true);
          setPopupTrigger("tab_close");
          sessionStorage.setItem("exitPopupShown", "true");
          event({ action: "exit_intent_popup_viewed", category: "Checkout", label: "tab_close_trigger" });
          logDebugEvent("tab_close_trigger", "Popup shown due to visibility change");
        }, 500);
      }
    };

    const handleNavigation = (e) => {
      if (typeof window !== "undefined" && sessionStorage.getItem("exitPopupShown")) return;
      const target = e.target.closest("[href], [data-href], button:not([type='submit'])");
      if (target && (target.getAttribute("href") || target.getAttribute("data-href") || target.onclick)) {
        e.preventDefault();
        const href = target.getAttribute("href") || target.getAttribute("data-href") || window.location.pathname;
        setTimeout(() => {
          setShowExitPopup(true);
          setPopupTrigger("navigation");
          sessionStorage.setItem("exitPopupShown", "true");
          sessionStorage.setItem("pendingNavigation", href);
          event({ action: "exit_intent_popup_viewed", category: "Checkout", label: "navigation_trigger" });
          logDebugEvent("navigation_trigger", `Popup shown due to navigation to ${href}`);
        }, 500);
      }
    };

    // Log debug events to Firestore
    const logDebugEvent = async (eventType, message) => {
      try {
        await addDoc(collection(db, "debug_logs"), {
          eventType,
          message,
          userId: userId || "unknown",
          userAgent,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("Failed to log debug event:", error);
      }
    };

    // Add event listeners
    window.addEventListener("click", handleActivity);
    window.addEventListener("click", handleNavigation);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial inactivity trigger
    handleActivity();

    return () => {
      clearInterval(timer);
      clearTimeout(inactivityTimeout);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("click", handleNavigation);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [userId, router, searchParams]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthLoading(false);
      if (!user) {
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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const formatPrice = (price, currency) => {
    const symbols = { INR: "₹", USD: "$" };
    const priceInUnits = price / 100; // Convert paise/cents to rupees/dollars
    if (currency === "USD") {
      return `${symbols[currency]}${priceInUnits.toFixed(2)}`;
    }
    return `${symbols[currency]}${Math.round(priceInUnits).toLocaleString("en-IN")}`; // Round to whole number for INR
  };

  const validateCoupon = async (fromPopup = false) => {
    if (billingCycle === "trial") {
      setCouponError("Coupons are not applicable for the Trial plan.");
      setSelectedDiscount(0);
      event({ action: "coupon_failed", category: "Checkout", label: "Trial Plan" });
      return false;
    }

    const coupon = discountOptions.find((d) => d.code === couponCode.toUpperCase());
    if (!coupon && !fromPopup) {
      setCouponError("Invalid coupon code.");
      setSelectedDiscount(0);
      event({ action: "coupon_failed", category: "Checkout", label: couponCode });
      return false;
    }
    if (!coupon && fromPopup && couponCode.toUpperCase() === "SAVE30") {
      setCouponError("");
      setSelectedDiscount(0.30);
      return true;
    }

    try {
      const couponRef = collection(db, "coupon_uses");
      await addDoc(couponRef, {
        code: couponCode,
        userId,
        email: paymentDetails.email,
        timestamp: serverTimestamp(),
      });
      setCouponError("");
      setSelectedDiscount(coupon ? coupon.value : 0.30);
      toast.success(`${coupon ? coupon.label : "30% OFF"} applied!`);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      event({ action: fromPopup ? "coupon_applied_SAVE30" : "coupon_applied", category: "Checkout", label: couponCode, value: coupon ? coupon.value : 0.30 });
      return true;
    } catch (error) {
      setCouponError("Coupon limit reached or already used.");
      setSelectedDiscount(0);
      toast.error("Coupon limit reached or already used.");
      event({ action: "coupon_failed", category: "Checkout", label: couponCode });
      return false;
    }
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
          amount: billingCycle === "trial" ? prices[billingCycle][currency] : selectedDiscount
            ? Math.round((prices[billingCycle][currency] / 100) * (1 - selectedDiscount)) * 100
            : prices[billingCycle][currency],
          currency: currency,
          noAutoDeduction: "No Auto-Deduction! You'll receive a payment reminder before your next billing date.",
        },
      }),
    }).catch((err) => console.error(`Failed to send ${templateId} email:`, err));
  };

  const logPaymentAttempt = async (status, orderId, paymentId, signature, error, cancellationReason) => {
    try {
      await addDoc(collection(db, "payment_logs"), {
        userId,
        userInfo: paymentDetails,
        userAgent,
        billingCycle,
        currency: currency,
        amount: billingCycle === "trial" ? prices[billingCycle][currency] : selectedDiscount
          ? Math.round((prices[billingCycle][currency] / 100) * (1 - selectedDiscount)) * 100
          : prices[billingCycle][currency],
        discount: billingCycle === "trial" ? 0 : selectedDiscount,
        status,
        orderId: orderId || "Not created",
        paymentId: paymentId || "Not available",
        signature: signature || "Not available",
        error: error ? error.message : null,
        cancellationReason: cancellationReason || null,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to log payment attempt:", error);
    }
  };

  const handlePaymentSubmit = async () => {
    const { email, name } = paymentDetails;
    if (!name || !email || !email.includes("@")) {
      toast.error("Please provide a valid name and email.");
      await logPaymentAttempt("failed", null, null, null, new Error("Invalid input"), null);
      event({ action: "form_validation_failed", category: "Checkout", label: "Step 3" });
      return;
    }
    if (!userId) {
      toast.error("Please sign in first.");
      router.push("/login");
      event({ action: "unauthenticated_checkout_attempt", category: "Checkout", label: "Step 3" });
      return;
    }

    setIsLoading(true);
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) throw new Error("Failed to load payment gateway.");

      // Calculate the final price with proper rounding
      let finalPrice;
      if (billingCycle === "trial") {
        finalPrice = prices[billingCycle][currency]; // No discount for trial
      } else if (selectedDiscount) {
        const priceInRupees = prices[billingCycle][currency] / 100; // Convert to rupees/currency unit
        const discountedPriceInRupees = priceInRupees * (1 - selectedDiscount); // Apply discount
        const roundedPriceInRupees = Math.round(discountedPriceInRupees); // Round to whole number
        finalPrice = roundedPriceInRupees * 100; // Convert back to paise/cents
      } else {
        finalPrice = prices[billingCycle][currency]; // No discount
      }

      // Log the price for debugging
      console.log(`Final price passed to Razorpay: ${finalPrice} (${currency})`);

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalPrice, currency: currency }),
      });
      if (!response.ok) throw new Error("Failed to create order.");
      const { order_id } = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: finalPrice, // Razorpay expects amount in paise/cents
        currency: currency, // INR or USD
        name: "ExpertResume",
        description: billingCycle === "yearly" ? "1-Year Premium Access" : billingCycle === "trial" ? "7-Day Premium Trial" : "1-Month Premium Access",
        order_id,
        handler: async (response) => {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
          await logPaymentAttempt("success", razorpay_order_id, razorpay_payment_id, razorpay_signature, null, null);

          // Google Ads Conversion Tracking for all 3 plans
          if (typeof window !== "undefined" && window.gtag) {
            if (billingCycle === "trial") {
              window.gtag('event', 'conversion', {
                'send_to': 'AW-844459331/4xc-COvyytQaEMPa1ZID',
                'value': 99.0,
                'currency': 'INR',
                'transaction_id': razorpay_order_id || ''
              });
            } else if (billingCycle === "monthly") {
              window.gtag('event', 'conversion', {
                'send_to': 'AW-844459331/KuJJCO7yytQaEMPa1ZID',
                'value': 299.0,
                'currency': 'INR',
                'transaction_id': razorpay_order_id || ''
              });
            } else if (billingCycle === "yearly") {
              window.gtag('event', 'conversion', {
                'send_to': 'AW-844459331/wPQxCPHyytQaEMPa1ZID',
                'value': 2999.0,
                'currency': 'INR',
                'transaction_id': razorpay_order_id || ''
              });
            }
          }

          const expiryDate = new Date();
          if (billingCycle === "yearly") {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          } else if (billingCycle === "monthly") {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          } else {
            expiryDate.setDate(expiryDate.getDate() + 7); // 7-day trial
          }

          await updateDoc(doc(db, "users", userId), {
            plan: "premium",
            premium_expiry: expiryDate.toISOString(),
            preview_count: 0,
            template_change_count: 0,
            currency: currency,
          });

          sendEmail("paymentComplete", { amount: finalPrice });
          toast.success(`Payment successful! Welcome to Premium!`);
          event({
            action: couponCode === "SAVE30" && billingCycle !== "trial" ? "payment_success_with_SAVE30" : "payment_success",
            category: "Payment",
            label: billingCycle,
            value: finalPrice,
          });
          
          // Build URL with enhanced conversion data
          const purchaseAmount = (finalPrice / 100).toFixed(2);
          const params = new URLSearchParams({
            plan: 'premium',
            billingCycle: billingCycle,
            amount: purchaseAmount,
            currency: currency,
            orderId: razorpay_order_id,
            email: email || '',
            phone: paymentDetails.phone || '',
            name: name || ''
          });
          
          router.push(`/welcome-premium?${params.toString()}`);
        },
        prefill: { name, email, contact: paymentDetails.phone || "" },
        theme: { color: "#9333ea" },
        modal: {
          ondismiss: async (reason) => {
            const cancellationReason = reason === "timeout" ? "Payment timed out" : "User cancelled payment";
            await logPaymentAttempt("cancelled", order_id, null, null, null, cancellationReason);
            sendEmail("paymentIncomplete");
            toast.error("Payment cancelled.");
            event({ action: "payment_cancelled", category: "Payment", label: cancellationReason });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response) => {
        await logPaymentAttempt("failed", order_id, response.error.metadata?.payment_id, null, new Error(response.error.description), response.error.reason);
        sendEmail("paymentIncomplete");
        toast.error(`Payment failed: ${response.error.description}`);
        event({ action: "payment_failed", category: "Payment", label: response.error.reason });
      });

      rzp.open();
      event({ action: "payment_initiated", category: "Payment", label: "RazorpayOpen", value: finalPrice });
    } catch (error) {
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

  // Define plans with visibility classes (move inside component to always use latest isIOSMobile)
  const plans = [
    {
      name: "Annual Plan",
      billingCycle: "yearly",
      className: "", // Always visible
    },
    {
      name: "Monthly Plan",
      billingCycle: "monthly",
      className: "", // Always visible
    },
    // Hide 7-Day Trial for iOS mobile
    ...(!isIOSMobile
      ? [
          {
            name: "7-Day Trial",
            billingCycle: "trial",
            className: "block md:hidden", // Show on mobile, hide on PC
          },
        ]
      : []),
  ];

  if (isLoadingGeo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading pricing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8 scroll-smooth overscroll-contain">
      {/* Exit-Intent Pop-up */}
      <AnimatePresence>
      {/*   {showExitPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center relative">
              <button
                onClick={() => {
                  setShowExitPopup(false);
                  const href = typeof window !== "undefined" ? sessionStorage.getItem("pendingNavigation") : null;
                  if (href) {
                    router.push(href);
                    sessionStorage.removeItem("pendingNavigation");
                  }
                  event({ action: "exit_intent_popup_closed", category: "Checkout", label: popupTrigger });
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <Sparkles size={32} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Don't Miss Out!</h3>
              <p className="text-sm text-gray-600 mb-4">
                {billingCycle === "trial" ? (
                  "Discounts available on Premium plans! Upgrade to Monthly or Yearly for exclusive offers."
                ) : DISCOUNT_FEATURE_ENABLED ? (
                  <>
                    Get <span className="font-semibold text-primary">30% OFF</span> your Career Pro plan with code{" "}
                    <span className="font-bold">SAVE30</span>. Offer expires in {formatTime(popupCountdown)}!
                  </>
                ) : null}
              </p>
              {DISCOUNT_FEATURE_ENABLED && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    if (billingCycle === "trial") {
                      setShowExitPopup(false);
                      sessionStorage.removeItem("pendingNavigation");
                      return;
                    }
                    setCouponCode("SAVE30");
                    setShowExitPopup(false);
                    setStep(2);
                    await validateCoupon(true);
                    sessionStorage.removeItem("pendingNavigation");
                    event({ action: "coupon_applied_SAVE30", category: "Checkout", label: popupTrigger });
                  }}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white py-2 rounded-lg font-semibold hover:opacity-95 transition-all text-sm sm:text-base"
                >
                  {billingCycle === "trial" ? "Explore Premium Plans" : "Apply 30% Off Now"}
                </motion.button>
              )}
              <p className="text-xs text-gray-500 mt-4">
                Trusted by 15,000+ professionals • No auto-deduction
              </p>
            </div>
          </motion.div>
        )} */}
      </AnimatePresence>

      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="confetti">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full absolute"
                  initial={{ y: 0, x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000), opacity: 1 }}
                  animate={{
                    y: typeof window !== "undefined" ? window.innerHeight : 1000,
                    x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                    opacity: 0,
                    rotate: 360,
                  }}
                  transition={{
                    duration: 2,
                    ease: "linear",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 bg-white rounded-lg shadow-sm p-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent p-6 sm:p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-3xl font-bold mb-2"
                >
                  {step === 1 && "Choose Your Plan"}
                  {step === 2 && "Enter Your Details"}
                  {step === 3 && "Complete Your Purchase"}
                </motion.h1>
                <p className="text-white/80">
                  {step === 1 && "Select the plan that fits your career goals"}
                  {step === 2 && "We'll use this for your receipt and account"}
                  {step === 3 && "You're moments away from premium access!"}
                </p>
              </div>
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                <Zap size={14} className="mr-1" />
                {formatTime(countdown)}
              </div>
            </div>
          </div>

          <div className="sm:hidden px-6 py-3 bg-primary/5 border-b border-accent/20">
            <div className="flex justify-between items-center text-sm text-primary font-medium">
              <span
                className={step >= 1 ? "text-primary cursor-pointer" : "text-primary/30"}
                onClick={() => handleTabClick(1, "Plan")}
              >
                Plan
              </span>
              <span
                className={step >= 2 ? "text-primary cursor-pointer" : "text-primary/30"}
                onClick={() => handleTabClick(2, "Details")}
              >
                Details
              </span>
              <span
                className={step >= 3 ? "text-primary cursor-pointer" : "text-primary/30"}
                onClick={() => handleTabClick(3, "Payment")}
              >
                Payment
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map((plan) => (
                      <motion.div
                        key={plan.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setBillingCycle(plan.billingCycle);
                          event({ action: `select_${plan.billingCycle}_plan`, category: "Checkout", label: "Step 1" });
                          if (isSmallScreen) {
                            setTimeout(() => {
                              setStep(2);
                              event({ action: "auto_advance_to_details", category: "Checkout", label: "Small Screen" });
                            }, 500);
                          }
                        }}
                        className={`plan-card relative p-4 rounded-xl border-2 ${plan.className} ${
                          billingCycle === plan.billingCycle
                            ? "border-4 border-accent bg-accent/10 shadow-md"
                            : "border-gray-200 hover:border-accent/30"
                        } cursor-pointer transition-all`}
                      >
                        {billingCycle === plan.billingCycle && (
                          <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                            {plan.name === "Annual Plan" ? "RECOMMENDED" : "TRY NOW"}
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                            <p className="text-xs text-gray-600">
                              {plan.name === "Annual Plan" ? "Billed yearly (Save 16%)" : plan.name === "7-Day Trial" ? "Billed once" : "Billed monthly"}
                            </p>
                          </div>
                          {plan.name === "Annual Plan" && (
                            <div className="bg-accent/10 text-primary px-2 py-1 rounded text-xs font-bold">
                              BEST VALUE
                            </div>
                          )}
                        </div>
                        <div className="my-3">
                          <span className="text-2xl font-bold text-primary">{formatPrice(prices[plan.billingCycle][currency], currency)}</span>
                          <span className="text-gray-500 text-xs ml-1">
                            {plan.name === "Annual Plan" ? " (1 year)" : plan.name === "7-Day Trial" ? " (7 days)" : " (30 days)"}
                          </span>
                          {currency === "INR" && <p className="text-gray-500 text-xs mt-1">incl. GST</p>}
                          {currency === "USD" && billingCycle !== "trial" && (
                            <p className="text-primary text-xs mt-1">Up to 30% off at checkout</p>
                          )}
                        </div>
                        <ul className="space-y-2 text-xs text-gray-700">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={14} />
                            <span>Job-Specific Templates</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={14} />
                            <span>Watermark-Free PDF Exports</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={14} />
                            <span>{plan.name === "Annual Plan" ? "AI Interview Trainer (Extended)" : "AI Interview Trainer"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={14} />
                            <span>Salary Analyzer</span>
                          </li>
                        </ul>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-primary/5 p-3 rounded-lg border border-accent/20">
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="text-primary mt-0.5 flex-shrink-0" size={16} />
                      <div>
                        <h4 className="font-semibold text-primary text-sm">Annual members see better results</h4>
                        <p className="text-xs text-primary">
                          Annual users get 3x more interviews and higher salaries.
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setStep(2);
                      event({ action: "proceed_to_details", category: "Checkout", label: "Step 1" });
                    }}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg font-bold shadow-md hover:opacity-95 transition-all animate-pulse md:animate-none md:static fixed bottom-4 left-4 right-4 z-10"
                  >
                    Continue to Billing
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-3"
                >
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={paymentDetails.name}
                        onChange={(e) => setPaymentDetails((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={paymentDetails.email}
                        onChange={(e) => setPaymentDetails((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={paymentDetails.phone}
                        onChange={(e) => setPaymentDetails((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>

                    {billingCycle !== "trial" && DISCOUNT_FEATURE_ENABLED && (
                      <div className="bg-gradient-to-r from-primary/5 to-primary/5 p-3 rounded-lg border border-accent/20">
                        <h3 className="text-xs font-semibold text-primary mb-2 flex items-center gap-2">
                          <Sparkles size={14} /> Have a coupon code?
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Enter coupon code (e.g., SAVE15)"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                          <button
                            onClick={() => validateCoupon(false)}
                            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap text-xs"
                          >
                            Apply Coupon
                          </button>
                        </div>
                        {couponError && <p className="text-red-600 text-xs mt-2">{couponError}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {discountOptions
                            .filter((option) => option.code !== "SAVE30")
                            .map((option) => (
                              <button
                                key={option.code}
                                onClick={() => {
                                  setCouponCode(option.code);
                                  event({ action: "select_coupon", category: "Checkout", label: option.code });
                                }}
                                className="text-xs bg-white border border-accent/20 text-primary px-2 py-1 rounded-full hover:bg-primary/5 transition-colors"
                              >
                                {option.label}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      onClick={() => {
                        setStep(1);
                        event({ action: "back_to_plan", category: "Checkout", label: "Step 2" });
                      }}
                      className="flex items-center justify-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors text-xs"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setStep(3);
                        event({ action: "proceed_to_payment", category: "Checkout", label: "Step 2" });
                      }}
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg font-bold shadow-md hover:opacity-95 transition-all animate-pulse md:animate-none md:static fixed bottom-4 left-4 right-4 z-10"
                    >
                      Review Order
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-3"
                >
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium">
                          {billingCycle === "yearly" ? "Annual Premium" : billingCycle === "trial" ? "7-Day Trial" : "Monthly Premium"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Base Price:</span>
                        <span>{formatPrice(basePrices[billingCycle][currency], currency)}</span>
                      </div>
                      {currency === "INR" && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">GST (18%):</span>
                          <span>{formatPrice(gstAmounts[billingCycle][currency], currency)}</span>
                        </div>
                      )}
                      {selectedDiscount > 0 && billingCycle !== "trial" && (
                        <div className="flex justify-between text-primary text-xs">
                          <span>Discount ({selectedDiscount * 100}%):</span>
                          <span>-{formatPrice(prices[billingCycle][currency] * selectedDiscount, currency)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-base">
                          <span>Total:</span>
                          <span className="text-primary">
                            {formatPrice(
                              billingCycle === "trial" ? prices[billingCycle][currency] : selectedDiscount
                                ? Math.round((prices[billingCycle][currency] / 100) * (1 - selectedDiscount)) * 100
                                : prices[billingCycle][currency],
                              currency
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 bg-primary/5 p-2 rounded-lg border border-accent/20">
                      <div className="flex items-start gap-2">
                        <Bell className="text-primary mt-0.5 flex-shrink-0" size={14} />
                        <p className="text-xs text-primary">
                          <strong>No Auto-Deduction!</strong> You'll receive a payment reminder before your next billing date.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-xl border border-accent/20">
                    <h3 className="text-base font-semibold text-primary mb-2 flex items-center gap-2">
                      <BadgeCheck size={18} /> What You're Getting
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={14} />
                        <span>Job-Specific Templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={14} />
                        <span>Watermark-Free PDF Exports</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={14} />
                        <span>AI Interview Trainer with personalized feedback</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={14} />
                        <span>Salary Analyzer</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      onClick={() => {
                        setStep(2);
                        event({ action: "back_to_details", category: "Checkout", label: "Step 3" });
                      }}
                      className="flex items-center justify-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors text-xs"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePaymentSubmit}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg font-bold shadow-md hover:opacity-95 transition-all animate-pulse md:animate-none md:static fixed bottom-4 left-4 right-4 z-10 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth iam="4" />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Lock size={16} /> Pay Securely
                        </span>
                      )}
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-3">
                    <Lock size={12} className="text-gray-400" />
                    <span>Payments securely processed by Razorpay</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm text-center">
            <div className="text-primary flex justify-center mb-1">
              <Shield size={20} />
            </div>
            <p className="text-xs font-medium text-gray-700">Secure Payment</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm text-center">
            <div className="text-primary flex justify-center mb-1">
              <BadgeCheck size={20} />
            </div>
                            <p className="text-xs font-medium text-gray-700">AI Powered</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm text-center">
            <div className="text-primary flex justify-center mb-1">
              <Users size={20} />
            </div>
            <p className="text-xs font-medium text-gray-700">15,000+ Members</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm text-center">
            <div className="text-yellow-500 flex justify-center mb-1">
              <Zap size={20} />
            </div>
            <p className="text-xs font-medium text-gray-700">Instant Access</p>
          </div>
        </div>
      </div>
    </div>
  );
}