"use client";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { event } from "../lib/gtag";
import Confetti from "react-confetti";
import { CheckCircle, Rocket, Zap, BadgeCheck, Sparkles, ArrowRight, Target, FileText, Brain, TrendingUp, DollarSign, Upload, Star, ArrowUp, Star as StarIcon, Crown, Users } from "lucide-react";

export default function WelcomePremium({ plan, billingCycle, source, amount, currency, orderId, email: userEmail, phone: userPhone, name: userName, hasApplyPro }) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Track welcome page view
    event({
      action: "welcome_page_view",
      category: "Engagement",
      label: plan === "interview_gyani" ? "InterviewGyaniPremium" : (billingCycle === "yearly" ? "YearlyPremium" : billingCycle === "sixMonth" ? "SixMonthPremium" : billingCycle === "quarterly" ? "QuarterlyPremium" : billingCycle === "trial" ? "TrialPremium" : billingCycle === "oneDay" ? "OneDayPremium" : billingCycle === "basic" ? "BasicPremium" : "MonthlyPremium"),
      value: plan === "interview_gyani" ? 499 : (billingCycle === "yearly" ? 3000 : billingCycle === "sixMonth" ? 1800 : billingCycle === "quarterly" ? 699 : billingCycle === "trial" ? 99 : billingCycle === "oneDay" ? 99 : billingCycle === "basic" ? 99 : amount ? parseFloat(amount) : 300),
    });

    // Google Ads Conversion Tracking with Enhanced Conversions (in-page)
    if (typeof window !== "undefined" && window.gtag && amount && currency && orderId) {
      // Helper: normalize and SHA-256 hash
      const sha256 = async (value) => {
        if (!value) return undefined;
        const normalized = String(value).trim().toLowerCase();
        const data = new TextEncoder().encode(normalized);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      };

      (async () => {
        try {
          // Use params from checkout (preferred) or fallback to auth
          const user = auth?.currentUser || null;
          const email = userEmail || user?.email || null;
          const phone = userPhone || user?.phoneNumber || null;
          const fullName = userName || user?.displayName || null;

          console.log('Enhanced Conversions Data:', { email, phone, fullName }); // Debug

          const hashedEmail = email ? await sha256(email) : undefined;
          const normalizedPhone = phone ? phone.replace(/[^\d]/g, "") : undefined;
          const hashedPhone = normalizedPhone ? await sha256(normalizedPhone) : undefined;

          // Hash first name and last name separately for better matching
          let hashedFirstName, hashedLastName;
          if (fullName) {
            const nameParts = fullName.trim().split(/\s+/);
            if (nameParts.length > 0) {
              hashedFirstName = await sha256(nameParts[0]);
            }
            if (nameParts.length > 1) {
              hashedLastName = await sha256(nameParts[nameParts.length - 1]);
            }
          }

          // Set in-page Enhanced Conversions user_data (only hashed values)
          const userData = {};
          if (hashedEmail) userData.sha256_email_address = hashedEmail;
          if (hashedPhone) userData.sha256_phone_number = hashedPhone;
          if (hashedFirstName) userData.sha256_first_name = hashedFirstName;
          if (hashedLastName) userData.sha256_last_name = hashedLastName;

          if (Object.keys(userData).length > 0) {
            window.gtag("set", "user_data", userData);
            console.log('Enhanced Conversions user_data set:', Object.keys(userData)); // Debug
          } else {
            console.warn('No Enhanced Conversions data available');
          }
        } catch (e) {
          console.error("Enhanced Conversions user_data set failed:", e);
        }
      })();

      // **Minimal Change: Dynamic variables from server-side code**
      const conversionValue = parseFloat(amount); // e.g., 719, 559, 399
      const transactionID = orderId; // e.g., 'T-123456'
      const currencyCode = currency.toUpperCase(); // 'INR' or 'USD'

      // Send page_view with transaction data to satisfy Google Tag requirements
      window.gtag('event', 'page_view', {
        'transaction_id': transactionID,
        'value': conversionValue,
        'currency': currencyCode,
        'page_path': '/welcome-premium',
        'page_title': 'Premium Purchase Complete'
      });

      // Event snippet for PurchaseComplete conversion page (in-page EC)
      window.gtag('event', 'conversion', {
        'send_to': 'AW-844459331/DQZcCNnIxqsbEMPa1ZID',
        'value': conversionValue,
        'currency': currencyCode,
        'transaction_id': transactionID,
        'allow_enhanced_conversions': true
      });

      // Also send standard ecommerce purchase event for GA4
      window.gtag('event', 'purchase', {
        'transaction_id': transactionID,
        'value': conversionValue,
        'currency': currencyCode,
        'items': [{
          'item_id': `resume_${billingCycle}`,
          'item_name': `Resume Premium ${billingCycle}`,
          'item_category': 'Subscription',
          'price': conversionValue,
          'quantity': 1
        }]
      });

      // Log conversion tracking for debugging
      console.log('Google Ads Conversion Tracked:', {
        value: conversionValue,
        currency: currencyCode,
        transaction_id: transactionID,
        plan: plan,
        billingCycle: billingCycle
      });
    }

    // Hide confetti after 5 seconds
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);

    return () => {
      clearTimeout(confettiTimer);
    };
  }, [billingCycle, amount, currency, orderId, plan, source, userEmail, userPhone, userName]);

  const features = [
    ...(plan !== "interview_gyani" ? [
      { icon: <Sparkles size={18} />, text: "AI Boost Feature - Smart Resume Enhancement" },
      { icon: <Brain size={18} />, text: "AI Generated Bullet Points" },
      { icon: <Upload size={18} />, text: "1-Min Upload Resume with AI Parsing" },
      { icon: <FileText size={18} />, text: "One Pager Resume Creator" },
      { icon: <TrendingUp size={18} />, text: "Detailed ATS Analysis & Scoring" },
      { icon: <BadgeCheck size={18} />, text: "AI Resume Suggestions" },
    ] : []),
    // Advanced features only for Pro plans
    ...(plan === "interview_gyani" ? [
      { icon: <CheckCircle size={18} />, text: "20 Full Mock Interview Sessions" },
      { icon: <Brain size={18} />, text: "Resume-Aware AI Senior Interviewer" },
      { icon: <Target size={18} />, text: "Real-time AI Performance Evaluation" },
      { icon: <FileText size={18} />, text: "Personalized Readiness Score Reports" },
      { icon: <Sparkles size={18} />, text: "Deep AI Answer Feedback & Suggestions" },
      { icon: <TrendingUp size={18} />, text: "Industry-Specific Question Packs" },
    ] : (billingCycle === "monthly" || billingCycle === "sixMonth" || billingCycle === "yearly" || billingCycle === "quarterly" ? [
      { icon: <Target size={18} />, text: "JD-Based Resume Builder" },
      { icon: <DollarSign size={18} />, text: "Salary Analyzer Tool" },
      { icon: <CheckCircle size={18} />, text: "Interview Gyani" },
    ] : [])),
    ...(hasApplyPro ? [
      { icon: <Zap size={18} />, text: "Apply Pro Engine (Active)" },
      { icon: <Rocket size={18} />, text: "Automated Job Applications" }
    ] : []),
    ...(plan === "interview_gyani" ? [] : (plan === "oneDay" ? [
      { icon: <Zap size={18} />, text: "1 Resume Download (Upgrade for More)" }
    ] : plan === "basic" ? [
      { icon: <Zap size={18} />, text: "5 Resume Downloads (Upgrade for More)" }
    ] : [
      { icon: <Zap size={18} />, text: "Unlimited Resume Downloads" }
    ])),
    ...(plan === "interview_gyani" ? [
      { icon: <Zap size={18} />, text: "24/7 Email & Chat Support" },
      { icon: <Target size={18} />, text: "Job-Specific Prep Logic" }
    ] : (billingCycle === "yearly" ? [
      { icon: <Rocket size={18} />, text: "Unlimited AI Enhancement" },
      { icon: <Star size={18} />, text: "Priority Support & Updates" }
    ] : billingCycle === "sixMonth" ? [
      { icon: <Rocket size={18} />, text: "Extended AI Enhancement" },
      { icon: <Star size={18} />, text: "6-Month Feature Access" }
    ] : billingCycle === "quarterly" ? [
      { icon: <Rocket size={18} />, text: "3-Month AI Enhancement" },
      { icon: <Star size={18} />, text: "Perfect Balance of Value & Features" }
    ] : billingCycle === "trial" ? [
      { icon: <Rocket size={18} />, text: "AI Enhancement (Trial Limits)" },
      { icon: <Sparkles size={18} />, text: "Full Feature Access for 7 Days" }
    ] : plan === "basic" ? [
      { icon: <Rocket size={18} />, text: "Basic AI Enhancement" },
      { icon: <ArrowUp size={18} />, text: "Upgrade to Premium for More Features" }
    ] : [
      { icon: <Rocket size={18} />, text: "AI Enhancement (Monthly Limits)" },
      { icon: <Zap size={18} />, text: "Monthly Feature Updates" }
    ])),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-100 flex items-center justify-center py-4 px-2 sm:py-6 sm:px-4 lg:py-8 lg:px-6 relative overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating sparkles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            initial={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -20, -40],
              x: [0, Math.random() * 20 - 10, Math.random() * 40 - 20],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          >
            <StarIcon
              size={12 + Math.random() * 8}
              className="text-yellow-400 drop-shadow-lg"
            />
          </motion.div>
        ))}

        {/* Floating bubbles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 opacity-30"
            initial={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              opacity: 0,
            }}
            animate={{
              y: [0, -30, -60],
              x: [0, Math.random() * 40 - 20],
              opacity: [0, 0.3, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={300}
            gravity={0.2}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-10 text-center relative overflow-hidden border border-blue-100 mx-2"
      >
        {/* Enhanced Decorative corner elements */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-t-4 border-l-4 border-blue-300 rounded-tl-3xl"
        ></motion.div>
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 border-t-4 border-r-4 border-blue-300 rounded-tr-3xl"
        ></motion.div>
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-b-4 border-l-4 border-blue-300 rounded-bl-3xl"
        ></motion.div>
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 border-b-4 border-r-4 border-blue-300 rounded-br-3xl"
        ></motion.div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.4 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg relative"
          >
            <BadgeCheck size={32} className="sm:w-10 sm:h-10 text-white" />
            {/* Pulsing ring effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight ${plan === "oneDay" || plan === "basic"
              ? "text-gray-800"
              : "bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"
              }`}
          >
            {plan === "interview_gyani" ? "🎉 Welcome to Interview Simulation  Pro! 🎉" :
              (plan === "oneDay" || plan === "basic"
                ? "Welcome to ExpertResume!"
                : "🎉 Welcome to ExpertResume Elite! 🎉")
            }
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm sm:text-base lg:text-lg text-gray-600 mt-2 sm:mt-3 max-w-md mx-auto leading-relaxed"
          >
            {plan === "interview_gyani"
              ? "You've unlocked the ultimate interview edge. Practice with a Senior AI Interviewer, get real-time feedback, and master your dream job interview."
              : (plan === "oneDay"
                ? "You've got 24 hours and 1 download to create your perfect resume! Upgrade to Pro for unlimited downloads and advanced AI features."
                : plan === "basic"
                  ? "You've got 7 days and 5 downloads to build your career! Upgrade to Pro for unlimited downloads and advanced AI features."
                  : "You've joined the elite! Experience the full power of AI-driven career success with unlimited access to premium features.")
            }
          </motion.p>
        </div>

        {/* Profile Slot Welcome Content */}
        {plan === "profile_slot" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="p-6 rounded-xl mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg"
          >
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-3 bg-white rounded-full shadow-md">
                <Users size={32} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Profile Slot Added Successfully!
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
                  You have successfully unlocked an additional profile slot. You can now create and manage a resume for another person independently.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-100 w-full max-w-md mt-2">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">What's Next?</h3>
                <ul className="text-left space-y-3">
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                    <span>Go to your Account Dashboard</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                    <span>Click on "Add New Profile" (if available) or manage existing ones</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                    <span>Download unlimited resumes for this new profile</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => router.push('/account?tab=profiles')}
                className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
              >
                Manage Profiles <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Original Plan Confirmation - Different experiences for basic vs premium */
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className={`p-3 sm:p-4 lg:p-5 rounded-xl mb-6 sm:mb-8 ${plan === "oneDay"
              ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg"
              : plan === "basic"
                ? "bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 shadow-lg"
                : billingCycle === "yearly"
                  ? "bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 shadow-2xl ring-2 ring-purple-100"
                  : billingCycle === "sixMonth"
                    ? "bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 shadow-2xl ring-2 ring-purple-100"
                    : billingCycle === "quarterly"
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 shadow-2xl ring-2 ring-blue-100"
                      : billingCycle === "monthly"
                        ? "bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 shadow-2xl ring-2 ring-blue-100"
                        : billingCycle === "trial"
                          ? "bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200"
                          : "bg-blue-50 border border-blue-100"
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, type: "spring", bounce: 0.3 }}
                className={`p-2 rounded-full ${plan === "basic"
                  ? "bg-green-100 text-green-600"
                  : plan === "interview_gyani"
                    ? "bg-purple-100 text-purple-600"
                    : billingCycle === "yearly"
                      ? "bg-blue-100 text-blue-600"
                      : billingCycle === "quarterly"
                        ? "bg-blue-100 text-blue-600"
                        : billingCycle === "trial"
                          ? "bg-teal-100 text-teal-600"
                          : "bg-indigo-100 text-indigo-600"
                  }`}
              >
                {plan === "interview_gyani" ? <Sparkles size={18} className="sm:w-5 sm:h-5" /> :
                  plan === "oneDay" ? <Zap size={18} className="sm:w-5 sm:h-5" /> :
                    plan === "basic" ? <CheckCircle size={18} className="sm:w-5 sm:h-5" /> :
                      billingCycle === "yearly" ? <Rocket size={18} className="sm:w-5 sm:h-5" /> :
                        billingCycle === "sixMonth" ? <Star size={18} className="sm:w-5 sm:h-5" /> :
                          billingCycle === "quarterly" ? <Crown size={18} className="sm:w-5 sm:h-5" /> :
                            billingCycle === "monthly" ? <Crown size={18} className="sm:w-5 sm:h-5" /> :
                              billingCycle === "trial" ? <Sparkles size={18} className="sm:w-5 sm:h-5" /> :
                                <Zap size={18} className="sm:w-5 sm:h-5" />}
              </motion.div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {plan === "interview_gyani" ? "Interview Gyani Pro Plan" :
                  plan === "oneDay" ? "Quick Start Plan" :
                    plan === "basic" ? "Starter Plan" :
                      billingCycle === "yearly" ? "Yearly Elite Plan" :
                        billingCycle === "sixMonth" ? "Pro 6-Month Plan" :
                          billingCycle === "quarterly" ? "Pro Quarterly Plan" :
                            billingCycle === "monthly" ? "Pro Monthly Plan" :
                              billingCycle === "trial" ? "7-Day Trial Plan" :
                                "Monthly Boost Plan"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {plan === "interview_gyani"
                ? "🤖 20 Full Sessions • Resume-Aware AI • Real-time Feedback • Readiness Reports"
                : (plan === "oneDay"
                  ? "⏰ 24 hours • 1 download • Upgrade to Pro for unlimited downloads & advanced features"
                  : plan === "basic"
                    ? "🚀 7 days • 5 downloads • Upgrade to Pro for unlimited downloads & advanced features"
                    : `✨ Elite access for ${billingCycle === "yearly" ? "1 year" : billingCycle === "sixMonth" ? "6 months" : billingCycle === "quarterly" ? "3 months" : billingCycle === "monthly" ? "1 month" : billingCycle === "trial" ? "7 days" : "1 day"} • Unlimited Downloads ${hasApplyPro ? "• Apply Pro Active " : ""}• ${billingCycle === "yearly" ? "Ultimate value" : billingCycle === "sixMonth" ? "Premium experience" : billingCycle === "quarterly" ? "Perfect balance" : billingCycle === "monthly" ? "Professional tier" : billingCycle === "trial" ? "Try risk-free" : "Quick start"}`)
              }
            </p>
          </motion.div>
        )}

        {/* Value Highlights (Hide for profile_slot) */}
        {plan !== "profile_slot" && (
          <motion.div
            /* ... existing Value Highlights code ... */
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-8 sm:mb-10"
          >
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4"
            >
              {plan === "basic" ? "Your Basic Plan Features:" : "Your Complete Premium Toolkit:"}
            </motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.05, duration: 0.5 }}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg text-left list-none hover:bg-gray-100 transition-colors duration-200"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1 + index * 0.05, type: "spring", bounce: 0.3 }}
                    className="flex-shrink-0 text-blue-600"
                  >
                    {feature.icon}
                  </motion.span>
                  <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{feature.text}</span>
                </motion.li>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hide other upsells for profile_slot */}
        {plan !== "profile_slot" && (
          /* ... existing Upgrade Prompt and Royal Experience code ... */
          <>
            {(plan === "oneDay" || plan === "basic") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="mb-8 sm:mb-10"
              >
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4 sm:p-6 shadow-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Crown className="text-orange-600" size={24} />
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800">Unlock Your Full Potential!</h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 mb-4">
                      {plan === "oneDay"
                        ? "You have 24 hours and 1 download! Upgrade to Pro for unlimited downloads, JD Builder, Interview Simulation  & Salary Analyzer."
                        : "You have 7 days and 5 downloads! Upgrade to Pro for unlimited downloads, JD Builder, Interview Simulation  & Salary Analyzer."
                      }
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                        <Crown className="text-purple-600 mx-auto mb-2" size={20} />
                        <p className="text-xs font-semibold text-gray-800">JD Builder</p>
                        <p className="text-xs text-gray-600">Match any job</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                        <Sparkles className="text-purple-600 mx-auto mb-2" size={20} />
                        <p className="text-xs font-semibold text-gray-800">Interview Gyani</p>
                        <p className="text-xs text-gray-600">Ace interviews</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                        <DollarSign className="text-purple-600 mx-auto mb-2" size={20} />
                        <p className="text-xs font-semibold text-gray-800">Salary Analyzer</p>
                        <p className="text-xs text-gray-600">Get paid more</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/checkout?billingCycle=monthly`)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                    >
                      Upgrade to Pro Monthly
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {(billingCycle === "monthly" || billingCycle === "sixMonth" || billingCycle === "yearly" || billingCycle === "quarterly") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="mb-8 sm:mb-10"
              >
                <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 border-2 border-purple-300 rounded-xl p-4 sm:p-6 shadow-2xl ring-2 ring-purple-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Crown className="text-purple-600" size={28} />
                      <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Elite Member Benefits</h3>
                      <Crown className="text-purple-600" size={28} />
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 mb-4">
                      You're now part of our elite community! Enjoy exclusive features and priority support.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-white/80 rounded-lg border border-purple-200">
                        <Star className="text-yellow-500 mx-auto mb-2" size={24} />
                        <p className="text-sm font-bold text-gray-800">Priority Support</p>
                        <p className="text-xs text-gray-600">24/7 assistance</p>
                      </div>
                      <div className="text-center p-4 bg-white/80 rounded-lg border border-purple-200">
                        <TrendingUp className="text-green-500 mx-auto mb-2" size={24} />
                        <p className="text-sm font-bold text-gray-800">Advanced Analytics</p>
                        <p className="text-xs text-gray-600">Track your success</p>
                      </div>
                    </div>
                    <div className="text-xs text-purple-700 font-medium">
                      ✨ Welcome to the elite tier! Your career transformation starts now.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="space-y-3 sm:space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (plan === "interview_gyani") {
                router.push("/interview-gyani");
                return;
              }
              const targetUrl = source === "job-description-resume-builder" ? "/job-description-resume-builder" : "/resume-builder";
              router.push(targetUrl);
            }}
            className="w-full max-w-xs mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {plan === "interview_gyani" ? "Start Mock Interview Now" :
              (source === "job-description-resume-builder" ? "Continue with Job-Specific Resume" : "Start Building Your Resume")}
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight size={16} className="sm:w-4 sm:h-5" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-gray-100"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.6, type: "spring", bounce: 0.3 }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"
            >
              <span className="text-xs sm:text-sm font-bold">AS</span>
            </motion.div>
            <div className="text-left">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.7, duration: 0.6 }}
                className="text-xs sm:text-sm text-gray-700 italic leading-relaxed"
              >
                {plan === "interview_gyani"
                  ? '"The AI Senior Interviewer identified gaps in my resume projects that I never noticed. Cracked my Google interview!"'
                  : '"The JD-based resume builder and ATS analysis got me 5 interviews in 1 week!"'}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="text-xs text-gray-500"
              >
                {plan === "interview_gyani" ? "Ryan C., SDE-2 • Interview Simulation  Pro" : "David P., San Francisco • Premium Member"}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}