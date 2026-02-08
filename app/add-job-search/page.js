"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  CheckCircle, Briefcase, Target, Bell, TrendingUp, Sparkles, ArrowRight, Crown,
  Shield, Lock, Zap, Users, Bot, CreditCard, BarChart3, ChevronRight, AlertCircle,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AuthProtection from "../components/AuthProtection";
import { formatPrice } from "../lib/globalPricing";
import { useLocation } from "../context/LocationContext";
import { event } from "../lib/gtag";

const AddJobSearchContent = () => {
  const { user, isPremium } = useAuth();
  const { currency } = useLocation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasJobSearch, setHasJobSearch] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [step, setStep] = useState(1); // 1: Select Duration, 2: Payment
  const [paymentDetails, setPaymentDetails] = useState({ name: "", email: "", phone: "" });
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes

  useEffect(() => {
    if (user) {
      checkJobSearchAccess();
      // Pre-fill user details
      setPaymentDetails({
        name: user.displayName || "",
        email: user.email || "",
        phone: user.phoneNumber || ""
      });

      // Track page view
      event({
        action: "addon_page_view",
        category: "JobSearch",
        label: "AddJobSearchPage",
      });
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stripe Checkout: No client-side script loading needed

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const checkJobSearchAccess = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setHasJobSearch(userData.hasJobTrackerFeature || false);
      }
    } catch (error) {
      console.error("Error checking Job Search access:", error);
    } finally {
      setLoading(false);
    }
  };

  const pricingOptions = [
    {
      duration: 'monthly',
      label: '1 Month',
      price: currency === 'USD' ? 250 : 20000,
      displayPrice: currency === 'USD' ? '$2.50' : '₹200',
      perMonth: currency === 'USD' ? '$2.50' : '₹200',
      badge: null,
      description: '30-Day Access'
    },
    {
      duration: 'quarterly',
      label: '3 Months',
      price: currency === 'USD' ? 600 : 60000,
      displayPrice: currency === 'USD' ? '$6.00' : '₹600',
      perMonth: currency === 'USD' ? '$2.00' : '₹200',
      badge: 'SAVE 17%',
      savings: currency === 'USD' ? 150 : 15000,
      description: '90-Day Access'
    },
    {
      duration: 'sixMonth',
      label: '6 Months',
      price: currency === 'USD' ? 1000 : 100000,
      displayPrice: currency === 'USD' ? '$10.00' : '₹1000',
      perMonth: currency === 'USD' ? '$1.67' : '₹167',
      badge: 'BEST VALUE',
      savings: currency === 'USD' ? 500 : 50000,
      description: '180-Day Access'
    }
  ];

  const selectedOption = pricingOptions.find(opt => opt.duration === selectedDuration);

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);

    // Track duration selection
    event({
      action: "addon_duration_selected",
      category: "JobSearch",
      label: duration,
      value: pricingOptions.find(opt => opt.duration === duration)?.price || 0,
    });
  };

  const handleStepChange = (newStep, stepLabel) => {
    setStep(newStep);

    // Track step navigation
    event({
      action: `addon_step_${newStep}`,
      category: "JobSearch",
      label: stepLabel,
    });
  };

  const handlePaymentSubmit = async () => {
    const { email, name, phone } = paymentDetails;
    if (!name || !email || !email.includes("@")) {
      toast.error("Please provide a valid name and email.");

      // Track validation error
      event({
        action: "addon_form_validation_failed",
        category: "JobSearch",
        label: "PaymentDetails",
      });
      return;
    }

    setIsPaymentProcessing(true);

    try {
      const finalAmount = selectedOption.price;

      // Track payment initiated
      event({
        action: "addon_payment_initiated",
        category: "JobSearch",
        label: selectedDuration,
        value: finalAmount,
      });

      // Create Stripe Checkout Session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          currency: currency,
          planId: null,
          userId: user.uid,
          paymentDetails: { name, email, phone },
          billingCycle: selectedDuration,
          planToSet: "jobSearchAddon",
          isJobTrackerOnly: true,
          jobTrackerDuration: selectedDuration === 'sixMonth' ? '6months' : selectedDuration === 'quarterly' ? '3months' : '1month',
          origin: typeof window !== "undefined" ? window.location.origin : "",
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session.");
      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setIsPaymentProcessing(false);

      // Track payment error
      event({
        action: "addon_payment_error",
        category: "Payment",
        label: error.message || "Unknown Error",
      });
    }
  };

  if (!isPremium) {
    // Track non-premium access attempt
    if (user) {
      event({
        action: "addon_access_denied",
        category: "JobSearch",
        label: "NonPremiumUser",
      });
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <Crown className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be a premium member to add the AI Job Search feature.
          </p>
          <button
            onClick={() => {
              event({
                action: "addon_upgrade_click",
                category: "JobSearch",
                label: "ViewPremiumPlans",
              });
              router.push('/pricing');
            }}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            View Premium Plans
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (hasJobSearch) {
    // Track already subscribed user visit
    useEffect(() => {
      if (hasJobSearch) {
        event({
          action: "addon_already_active",
          category: "JobSearch",
          label: "ExistingSubscriber",
        });
      }
    }, [hasJobSearch]);

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Already Active!</h2>
          <p className="text-gray-600 mb-6">
            You already have access to the AI Job Search feature.
          </p>
          <button
            onClick={() => {
              event({
                action: "addon_go_to_jobs",
                category: "JobSearch",
                label: "ExistingSubscriber",
              });
              router.push('/jobs-nearby');
            }}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Go to Job Search
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-5xl mx-auto pb-16 pt-4">
        {/* Flow Indicator */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
            <div className={`flex items-center gap-1 ${step >= 1 ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</span>
              <span className="text-xs">Choose Duration</span>
            </div>
            <ChevronRight size={12} className="text-gray-400" />
            <div className={`flex items-center gap-1 ${step >= 2 ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</span>
              <span className="text-xs">Complete Payment</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-4 md:p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 0% 50%, white 2px, transparent 2px), radial-gradient(circle at 100% 50%, white 2px, transparent 2px)`,
                backgroundSize: '40px 40px',
                animation: 'pulse 4s infinite'
              }}></div>
            </div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.h1
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg sm:text-xl md:text-2xl font-bold"
                    >
                      {step === 1 && "Add AI Job Search to Your Plan"}
                      {step === 2 && "Complete Your Purchase"}
                    </motion.h1>
                    <div className="ml-auto bg-white/10 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0">
                      <Zap size={12} className="animate-pulse" />
                      <span className="hidden sm:inline">Limited Time: {formatTime(countdown)}</span>
                      <span className="sm:hidden">{formatTime(countdown)}</span>
                    </div>
                  </div>
                  <p className="text-blue-100 text-xs sm:text-sm mb-2">
                    {step === 1 && "Land your dream job faster with AI-powered job matching"}
                    {step === 2 && "Secure checkout - instant activation after payment"}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-blue-100 px-2 py-1 rounded-full border border-white/20">
                      <Shield className="mr-1" size={12} />
                      <span>Secure</span>
                    </div>
                    <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-blue-100 px-2 py-1 rounded-full border border-white/20">
                      <span className="mr-1">🔒</span>
                      <span>No Auto-Renewal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 lg:p-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Select Duration */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="space-y-4"
                >
                  {/* Features */}
                  <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-6 border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      What You Get:
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 bg-white/60 p-3 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">20+ AI-Matched Jobs</h4>
                          <p className="text-xs text-gray-600">Curated opportunities based on your profile</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-white/60 p-3 rounded-lg">
                        <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">Application Tracking</h4>
                          <p className="text-xs text-gray-600">Track all applications in one place</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-white/60 p-3 rounded-lg">
                        <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">Real-Time Alerts</h4>
                          <p className="text-xs text-gray-600">Get notified of new opportunities</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-white/60 p-3 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">Job Status Management</h4>
                          <p className="text-xs text-gray-600">Organize saved, applied, interview jobs</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Options */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Your Duration:</h3>
                    <div className="grid sm:grid-cols-3 gap-3 md:gap-4">
                      {pricingOptions.map((option) => (
                        <motion.div
                          key={option.duration}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDurationSelect(option.duration)}
                          className={`relative bg-white rounded-xl p-4 md:p-5 cursor-pointer transition-all duration-300 ${selectedDuration === option.duration
                              ? 'border-2 border-blue-600 shadow-xl ring-2 ring-blue-100'
                              : 'border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg'
                            }`}
                        >
                          {option.badge && (
                            <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-lg ${option.badge === 'BEST VALUE'
                                ? 'bg-purple-600'
                                : 'bg-green-600'
                              }`}>
                              {option.badge}
                            </div>
                          )}
                          {selectedDuration === option.duration && (
                            <div className="absolute -top-2.5 right-3 bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-lg">
                              ✓ Selected
                            </div>
                          )}
                          <div className="text-center mt-2">
                            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2">{option.label}</h4>
                            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{option.displayPrice}</div>
                            <p className="text-xs md:text-sm text-gray-600 mb-2">{option.perMonth}/month</p>
                            <p className="text-xs text-gray-500">{option.description}</p>
                            {option.savings && (
                              <div className="mt-2 bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full inline-block">
                                Save {formatPrice(option.savings, currency)}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleStepChange(2, "ContinueToPayment")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Payment */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="space-y-4"
                >
                  {/* Payment Summary */}
                  <div className="bg-white p-4 md:p-5 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="text-base md:text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <BarChart3 className="text-blue-500" size={18} />
                      Your Investment Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="font-medium text-gray-700">Add-on:</span>
                        <span className="font-bold text-blue-800">
                          AI Job Search ({selectedOption.label})
                        </span>
                      </div>

                      <div className="flex justify-between text-sm md:text-base">
                        <span className="font-medium text-gray-700">Total Price:</span>
                        <span className="text-gray-800">{formatPrice(selectedOption.price, currency)}</span>
                      </div>

                      {currency === "INR" && (
                        <div className="flex justify-between items-center py-1 px-2 bg-emerald-50 rounded text-[10px] font-bold text-emerald-700 uppercase tracking-wider border border-emerald-100 mb-1">
                          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> No Hidden Fees</span>
                          <span>GST Included</span>
                        </div>
                      )}

                      <div className="border-t border-blue-200 pt-3 mt-3">
                        <div className="flex justify-between text-lg md:text-xl font-bold">
                          <span className="text-blue-800">Total:</span>
                          <span className="text-blue-600">
                            {formatPrice(selectedOption.price, currency)}
                          </span>
                        </div>
                        {selectedOption.savings && (
                          <div className="text-xs md:text-sm text-green-600 font-medium mt-1.5">
                            🎉 You save {formatPrice(selectedOption.savings, currency)} vs monthly!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="bg-white p-4 md:p-5 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="text-base md:text-lg font-bold text-blue-800 mb-3">Your Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={paymentDetails.name}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={paymentDetails.email}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                        <input
                          type="tel"
                          value={paymentDetails.phone}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, phone: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-2">
                      <Lock className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
                      <div className="text-xs text-blue-700">
                        <strong>Secure Payment:</strong> Your data is encrypted and safe. No auto-renewal - you decide when to continue.
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                    <button
                      onClick={() => handleStepChange(1, "BackToDuration")}
                      disabled={isPaymentProcessing}
                      className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handlePaymentSubmit}
                      disabled={isPaymentProcessing}
                      className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPaymentProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Secure Payment - {selectedOption.displayPrice}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Payment Info */}
                  <div className="flex items-center justify-center gap-3 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <CreditCard size={14} className="text-blue-500" />
                    <span className="font-medium">Secure payments via Stripe • Cards & More</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="bg-white p-3 rounded-xl shadow-sm text-center">
            <Shield className="text-blue-500 mx-auto mb-1.5" size={18} />
            <p className="font-semibold text-xs">Secure Payment</p>
            <p className="text-xs text-gray-600 mt-0.5">256-bit Encryption</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm text-center">
            <Bot className="text-blue-500 mx-auto mb-1.5" size={18} />
            <p className="font-semibold text-xs">AI Powered</p>
            <p className="text-xs text-gray-600 mt-0.5">Smart Job Matching</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm text-center">
            <Users className="text-blue-500 mx-auto mb-1.5" size={18} />
            <p className="font-semibold text-xs">15,000+ Users</p>
            <p className="text-xs text-gray-600 mt-0.5">Trusted Worldwide</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm text-center">
            <Zap className="text-yellow-500 mx-auto mb-1.5" size={18} />
            <p className="font-semibold text-xs">Instant Access</p>
            <p className="text-xs text-gray-600 mt-0.5">Activate in Seconds</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function AddJobSearchPage() {
  return (
    <AuthProtection>
      <AddJobSearchContent />
    </AuthProtection>
  );
}
