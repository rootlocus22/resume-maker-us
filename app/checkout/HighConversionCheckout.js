"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { event } from "../lib/gtag";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Shield, Zap, BadgeCheck, Lock, ArrowLeft, Sparkles, Users, Bell, X,
  BookOpen, Bot, DollarSign, Star, Trophy, Clock, Target, TrendingUp, Award,
  MessageCircle, Phone, Mail, Heart, Gift, Rocket, Crown, AlertCircle, ChevronRight,
  PlayCircle, FileText, BarChart3, Briefcase, GraduationCap, ThumbsUp, Timer,
  Percent, ArrowRight, Eye, Download, Palette, FileUp, Gauge
} from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { onAuthStateChanged } from "firebase/auth";
import { PLAN_CONFIG, getPlanConfig, getOriginalPrice, getDiscountedPrice, getDiscountPercentage, isDiscountEnabled } from "../lib/planConfig";
import { useIsAndroidUser } from "../lib/deviceDetection";

// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Stripe Checkout: No client-side script loading needed

function isMobileIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Success stories data for social proof
const successStories = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    story: "Got 3 interview calls in 2 weeks using ExpertResume's AI suggestions. Landed a senior role!",
    increase: "300% more interviews",
    verified: true
  },
  {
    name: "James Wilson",
    role: "Product Manager at Amazon",
    story: "The ATS score feature helped me optimize my resume. Landed my dream job in just 1 month!",
    increase: "45% salary jump",
    verified: true
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist at Microsoft",
    story: "Job-specific templates made all the difference. Got offers from 5 companies!",
    increase: "5 job offers",
    verified: true
  }
];

// Feature benefits with emotional impact
const featureBenefits = [
  {
    icon: <Target className="w-6 h-6 text-[#0B1F3B]" />,
    title: "ATS Score Optimization",
    benefit: "Get past the robots, reach human recruiters",
    impact: "3x more interview calls",
    description: "Real-time ATS score shows exactly what recruiters' systems see"
  },
  {
    icon: <Bot className="w-6 h-6 text-[#0B1F3B]" />,
    title: "AI-Powered Suggestions",
    benefit: "Professional writer in your pocket",
    impact: "Save 10+ hours of writing",
    description: "AI analyzes your experience and suggests powerful improvements"
  },
  {
    icon: <Briefcase className="w-6 h-6 text-[#0B1F3B]" />,
    title: "Job-Specific Templates",
    benefit: "Stand out in your industry",
    impact: "50% higher response rates",
    description: "Templates designed by industry experts for maximum impact"
  },
  {
    icon: <MessageCircle className="w-6 h-6 text-orange-500" />,
    title: "Interview Gyani",
    benefit: "Ace every interview with confidence",
    impact: "85% interview success rate",
    description: "Practice with ExpertResume AI, get personalized feedback, land the job"
  },
  {
    icon: <DollarSign className="w-6 h-6 text-yellow-500" />,
    title: "Salary Analyzer",
    benefit: "Negotiate like a pro, earn what you deserve",
    impact: "Average 23% salary increase",
    description: "Know your market value and negotiate with confidence"
  },
  {
    icon: <Eye className="w-6 h-6 text-teal-500" />,
    title: "Live Preview",
    benefit: "See changes instantly, perfect every detail",
    impact: "Zero formatting issues",
    description: "What you see is exactly what recruiters get"
  }
];

// Urgency factors
const urgencyFactors = [
  "🔥 2,847 people upgraded this week",
  "⏰ Limited time: 30% off expires in 2 hours",
  "🚀 Join 15,000+ successful professionals",
  "💼 Average user gets 3x more interviews"
];

export default function HighConversionCheckout({ initialBillingCycle = "oneDay" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency, isLoadingGeo } = useLocation();
  const { isAndroid } = useIsAndroidUser();
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle);
  const [paymentDetails, setPaymentDetails] = useState({ name: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(2 * 60 * 60); // 2 hours
  const [currentUrgencyIndex, setCurrentUrgencyIndex] = useState(0);
  const [showSuccessStories, setShowSuccessStories] = useState(false);
  const [selectedStory, setSelectedStory] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);
  const [isIOSMobile, setIsIOSMobile] = useState(false);
  const userId = auth.currentUser?.uid;

  // New pricing structure - no device bias
  const prices = {
    oneDay: { INR: 4900, USD: 99 },     // ₹49 / $0.99
    basic: { INR: 19900, USD: 499 },    // ₹199 / $4.99
    monthly: { INR: 49900, USD: 999 },  // ₹499 / $9.99
    sixMonth: { INR: 89900, USD: 1999 }, // ₹899 / $19.99
  };

  const discountedPrices = {
    oneDay: { INR: 4900, USD: 99 },      // No discount
    basic: { INR: 19900, USD: 499 },     // No discount
    monthly: { INR: 34930, USD: 699 },   // 30% off
    sixMonth: { INR: 62930, USD: 1399 }, // 30% off  
  };

  useEffect(() => {
    setIsIOSMobile(isMobileIOS());

    // Handle URL parameters - no device bias
    const cycle = searchParams.get("billingCycle");
    if (cycle && ["oneDay", "basic", "monthly", "sixMonth"].includes(cycle)) {
      setBillingCycle(cycle);
    }

    // Initialize user data
    if (userId && auth.currentUser) {
      setPaymentDetails({
        name: auth.currentUser.displayName || "",
        email: auth.currentUser.email || "",
        phone: "",
      });
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Rotate urgency messages
    const urgencyTimer = setInterval(() => {
      setCurrentUrgencyIndex((prev) => (prev + 1) % urgencyFactors.length);
    }, 4000);

    // Rotate success stories
    const storyTimer = setInterval(() => {
      setSelectedStory((prev) => (prev + 1) % successStories.length);
    }, 6000);

    return () => {
      clearInterval(timer);
      clearInterval(urgencyTimer);
      clearInterval(storyTimer);
    };
  }, [userId, searchParams]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthLoading(false);
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (authLoading || isLoadingGeo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B1F3B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized checkout...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? `${hours}h ${mins}m ${secs}s` : `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const formatPrice = (price, currency) => {
    const symbols = { INR: "₹", USD: "$" };
    const priceInUnits = price / 100;
    if (currency === "USD") {
      return `${symbols[currency]}${priceInUnits.toFixed(2)}`;
    }
    return `${symbols[currency]}${Math.round(priceInUnits).toLocaleString("en-IN")}`;
  };

  const calculateSavings = (originalPrice, discountedPrice) => {
    return originalPrice - discountedPrice;
  };

  const handlePaymentSubmit = async () => {
    const { email, name } = paymentDetails;
    if (!name || !email || !email.includes("@")) {
      toast.error("Please provide a valid name and email.");
      return;
    }

    setIsLoading(true);
    try {
      const finalPrice = (billingCycle === "oneDay" || billingCycle === "basic") ? prices[billingCycle][currency] : discountedPrices[billingCycle][currency];

      const isDiscounted = billingCycle === "monthly" || billingCycle === "sixMonth";
      const isSpecialOneDay = billingCycle === "oneDay" && currency === "INR";

      let planToSet = "premium";
      if (billingCycle === "basic") planToSet = "basic";
      else if (billingCycle === "oneDay") planToSet = "oneDay";
      else if (billingCycle === "interview_gyani") planToSet = "interview_gyani";

      // Create Stripe Checkout Session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalPrice,
          currency: currency,
          planId: billingCycle,
          couponCode: isSpecialOneDay ? "SAVE75" : (isDiscounted ? "SAVE30" : null),
          userId,
          paymentDetails: {
            name: paymentDetails.name || name || "",
            email: paymentDetails.email || email || "",
            phone: paymentDetails.phone || "",
          },
          billingCycle,
          planToSet,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session.");
      const { url } = await response.json();

      event({ action: "payment_initiated_optimized", category: "Payment", label: billingCycle, value: finalPrice });

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      toast.error(`Payment failed: ${error.message}`);
      event({ action: "payment_error_optimized", category: "Payment", label: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-50">
      {/* Floating Urgent Banner */}


      {/* Success Stories Modal */}
      <AnimatePresence>
        {showSuccessStories && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setShowSuccessStories(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {successStories[selectedStory].name}
                </h3>
                <p className="text-[#0B1F3B] font-medium mb-3">
                  {successStories[selectedStory].role}
                </p>
                <p className="text-gray-600 mb-4">
                  "{successStories[selectedStory].story}"
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                  <p className="text-[#0B1F3B] font-semibold">
                    🚀 {successStories[selectedStory].increase}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <BadgeCheck className="w-4 h-4 text-[#0B1F3B]" />
                  <span>Verified Success Story</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section with Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center bg-slate-100 text-[#0B1F3B] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Trophy className="mr-2 w-4 h-4" />
              <span className="animate-pulse">{urgencyFactors[currentUrgencyIndex]}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] bg-clip-text text-transparent">
                Transform Your Career
              </span>
              <br />
              <span className="text-gray-800">in Just 30 Minutes</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join 15,000+ professionals who landed their dream jobs using our AI-powered resume builder.
              <span className="font-semibold text-[#0B1F3B]"> Get 3x more interviews guaranteed!</span>
            </p>

            {/* Social Proof Ticker */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-8 max-w-2xl mx-auto">
              <motion.div
                key={selectedStory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {successStories[selectedStory].name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-gray-800 font-medium">
                    "{successStories[selectedStory].story}"
                  </p>
                  <p className="text-sm text-gray-500">
                    - {successStories[selectedStory].name}, {successStories[selectedStory].role}
                  </p>
                </div>
                <div className="text-[#0B1F3B] font-bold text-sm">
                  {successStories[selectedStory].increase}
                </div>
              </motion.div>
            </div>

            <button
              onClick={() => setShowSuccessStories(true)}
              className="text-[#0B1F3B] hover:text-[#071429] font-medium text-sm flex items-center gap-1 mx-auto"
            >
              <PlayCircle className="w-4 h-4" />
              See more success stories
            </button>
          </motion.div>

          {/* Main Checkout Container */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Features & Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* What You're Getting */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-[#0B1F3B]" />
                  What You're Getting Today
                </h2>

                <div className="space-y-4">
                  {featureBenefits.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-[#0B1F3B] font-medium text-sm mb-1">
                          {feature.benefit}
                        </p>
                        <p className="text-gray-600 text-sm mb-2">
                          {feature.description}
                        </p>
                        <div className="inline-flex items-center bg-slate-100 text-[#0B1F3B] px-2 py-1 rounded-full text-xs font-medium">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {feature.impact}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trust Signals */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#0B1F3B]" />
                  Why 15,000+ Professionals Trust Us
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-[#0B1F3B]">98%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-[#0B1F3B]">3x</div>
                    <div className="text-sm text-gray-600">More Interviews</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-[#0B1F3B]">24h</div>
                    <div className="text-sm text-gray-600">Support Response</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-600">4.9★</div>
                    <div className="text-sm text-gray-600">User Rating</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-gray-800">30-Day Money-Back Guarantee</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Not happy? Get a full refund, no questions asked. We're that confident you'll love it!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Checkout Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Plan Selection */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  Choose Your Success Plan
                </h2>

                <div className="space-y-4">
                  {/* 6-Month Plan - Best Value */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setBillingCycle("sixMonth")}
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${billingCycle === "sixMonth"
                      ? "border-[#0B1F3B] bg-slate-50 shadow-lg"
                      : "border-gray-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white px-4 py-1 rounded-full text-xs font-bold">
                        BEST VALUE - SAVE 30%
                      </div>
                    </div>

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Pro 6-Month</h3>
                        <p className="text-sm text-gray-600">Best value for career growth</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(prices.sixMonth[currency], currency)}
                        </div>
                        <div className="text-2xl font-bold text-[#0B1F3B]">
                          {formatPrice(discountedPrices.sixMonth[currency], currency)}
                        </div>
                        <div className="text-sm text-gray-600">(180 days)</div>
                      </div>
                    </div>

                    <div className="bg-slate-100 text-[#0B1F3B] px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                      💰 Save {formatPrice(calculateSavings(prices.sixMonth[currency], discountedPrices.sixMonth[currency]), currency)} today!
                    </div>

                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>Unlimited Downloads</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>JD Builder</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>Interview Gyani</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>Salary Analyzer</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Monthly Plan */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setBillingCycle("monthly")}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${billingCycle === "monthly"
                      ? "border-[#0B1F3B] bg-slate-50 shadow-lg"
                      : "border-gray-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Pro Monthly</h3>
                        <p className="text-sm text-gray-600">Perfect for immediate job search</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(prices.monthly[currency], currency)}
                        </div>
                        <div className="text-2xl font-bold text-[#0B1F3B]">
                          {formatPrice(discountedPrices.monthly[currency], currency)}
                        </div>
                        <div className="text-sm text-gray-600">(30 days)</div>
                      </div>
                    </div>

                    <div className="bg-slate-100 text-[#0B1F3B] px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                      🚀 Start job hunting immediately
                    </div>

                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>Unlimited Downloads</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>JD Builder</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>Interview Gyani</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>Salary Analyzer</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Basic Plan */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setBillingCycle("basic")}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${billingCycle === "basic"
                      ? "border-[#0B1F3B] bg-slate-50 shadow-lg"
                      : "border-gray-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Starter Plan</h3>
                        <p className="text-sm text-gray-600">Get started quickly</p>
                      </div>
                      <div className="text-right">
                        {isDiscountEnabled() && getDiscountPercentage("basic") > 0 && (
                          <div className="text-sm text-gray-500 line-through mb-1">
                            {formatPrice(getOriginalPrice("basic", currency), currency)}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-[#0B1F3B]">
                          {isDiscountEnabled() && getDiscountPercentage("basic") > 0
                            ? formatPrice(getDiscountedPrice("basic", currency), currency)
                            : formatPrice(prices.basic[currency], currency)
                          }
                        </div>
                        <div className="text-sm text-gray-600">({getPlanConfig("basic").duration} days)</div>
                      </div>
                    </div>

                    <div className="bg-slate-100 text-[#0B1F3B] px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                      📝 Perfect to get started
                    </div>

                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>5 Downloads</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>50+ Templates</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>AI Enhancement</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                        <span>ATS Optimizer</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* One Day Plan - Only for Android users */}
                  {isAndroid && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setBillingCycle("oneDay")}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${billingCycle === "oneDay"
                        ? "border-[#0B1F3B] bg-slate-50 shadow-lg"
                        : "border-gray-200 hover:border-slate-300"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Quick Start</h3>
                          <p className="text-sm text-gray-600">Quick & affordable</p>
                        </div>
                        <div className="text-right">
                          {isDiscountEnabled() && getDiscountPercentage("oneDay") > 0 && (
                            <div className="text-sm text-gray-500 line-through mb-1">
                              {formatPrice(getOriginalPrice("oneDay", currency), currency)}
                            </div>
                          )}
                          <div className="text-2xl font-bold text-[#0B1F3B]">
                            {isDiscountEnabled() && getDiscountPercentage("oneDay") > 0
                              ? formatPrice(getDiscountedPrice("oneDay", currency), currency)
                              : formatPrice(prices.oneDay[currency], currency)
                            }
                          </div>
                          <div className="text-sm text-gray-600">({getPlanConfig("oneDay").duration} days)</div>
                        </div>
                      </div>

                      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                        ⚡ Quick access
                      </div>

                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                          <span>{PLAN_CONFIG.oneDay.downloads} Downloads</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                          <span>50+ Templates</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                          <span>AI Enhancement</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#0B1F3B]" />
                          <span>ATS Optimizer</span>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Payment Form */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#0B1F3B]" />
                  Secure Checkout
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.name}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3B] focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={paymentDetails.email}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3B] focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={paymentDetails.phone}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3B] focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Plan:</span>
                      <span className="font-medium">
                        {billingCycle === "sixMonth" ? "Pro 6-Month" :
                          billingCycle === "monthly" ? "Pro Monthly" :
                            billingCycle === "basic" ? "Starter Plan" : "Quick Start"}
                      </span>
                    </div>
                    {(billingCycle === "monthly" || billingCycle === "sixMonth") && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Original Price:</span>
                          <span className="line-through text-gray-500">
                            {formatPrice(prices[billingCycle][currency], currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-[#0B1F3B]">
                          <span>Flash Sale Discount (30%):</span>
                          <span>-{formatPrice(calculateSavings(prices[billingCycle][currency], discountedPrices[billingCycle][currency]), currency)}</span>
                        </div>
                      </>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-[#0B1F3B]">
                          {formatPrice(
                            (billingCycle === "oneDay" || billingCycle === "basic")
                              ? prices[billingCycle][currency]
                              : discountedPrices[billingCycle][currency],
                            currency
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-[#0B1F3B]">
                      <Bell className="w-4 h-4" />
                      <span className="font-medium">No Auto-Renewal!</span>
                    </div>
                    <p className="text-xs text-[#0B1F3B] mt-1">
                      We'll remind you before billing.
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePaymentSubmit}
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-[#071429] hover:to-[#071429] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      Complete Secure Payment
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </motion.button>

                {/* Trust Badges */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>256-bit Encryption</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    <span>Stripe Protected</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Still Have Questions? We're Here to Help!
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-[#0B1F3B]" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Live Chat</h4>
                  <p className="text-sm text-gray-600 mb-3">Get instant answers to your questions</p>
                  <a
                    href="https://wa.me/918431256903"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0B1F3B] hover:text-[#071429] font-medium text-sm"
                  >
                    Start Chat →
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-[#0B1F3B]" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Email Support</h4>
                  <p className="text-sm text-gray-600 mb-3">24-hour response guaranteed</p>
                  <a
                    href="mailto:support@expertresume.us"
                    className="text-[#0B1F3B] hover:text-[#071429] font-medium text-sm"
                  >
                    Send Email →
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PlayCircle className="w-6 h-6 text-[#0B1F3B]" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Video Tutorial</h4>
                  <p className="text-sm text-gray-600 mb-3">See how it works in action</p>
                  <a
                    href="https://expertresume.us/demo-video.mp4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0B1F3B] hover:text-[#071429] font-medium text-sm"
                  >
                    Watch Demo →
                  </a>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 to-slate-50 rounded-xl border border-slate-200">
                <p className="text-gray-700 font-medium">
                  💡 <strong>Pro Tip:</strong> 87% of our users who upgrade today get their first interview within 2 weeks!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 