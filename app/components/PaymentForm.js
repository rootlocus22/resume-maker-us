"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { event } from "../lib/gtag";

const PaymentForm = ({ isOpen, onClose, userId, billingCycle: propBillingCycle }) => {
  const [couponApplied, setCouponApplied] = useState(false);
  const [billingCycle, setBillingCycle] = useState(propBillingCycle || "monthly");
  const [paymentDetails, setPaymentDetails] = useState({ name: "", email: "", phone: "" });
  const [userCurrency, setUserCurrency] = useState("INR");
  const [isLoading, setIsLoading] = useState(false);
  const [userAgent, setUserAgent] = useState("");

  // Updated prices for India
  const prices = {
    monthly: { INR: 30000, USD: 500 }, // ₹300
    quarterly: { INR: 80000, USD: 1200 }, // ₹800 (approx 3 months)
    yearly: { INR: 300000, USD: 1200 }, // ₹3000
  };

  const displayPrices = {
    monthly: { INR: 300, USD: 5 },
    quarterly: { INR: 800, USD: 12 },
    yearly: { INR: 3000, USD: 12 },
  };

  const discount = 0.2; // 20% off with coupon

  // Stripe Checkout: No client-side script loading needed

  // Function to send emails via API
  const sendEmail = (templateId, additionalData = {}) => {
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId,
        userId,
        data: {
          ...additionalData,
          amount: couponApplied
            ? (displayPrices[billingCycle][userCurrency] * (1 - discount)).toFixed(0)
            : displayPrices[billingCycle][userCurrency].toFixed(0),
          currency: userCurrency,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(`${templateId} email sent:`, data);
        // Optional: toast.success(`${templateId} email sent! Check your inbox.`);
      })
      .catch((err) => {
        console.error(`Failed to send ${templateId} email:`, err);
        // toast.error(`Failed to send ${templateId} email.`);
      });
  };

  // Capture user agent on mount
  useEffect(() => {
    if (isOpen) {
      setUserAgent(navigator.userAgent || "Unknown");
    }
  }, [isOpen]);

  // Sync billing cycle from prop
  useEffect(() => {
    if (propBillingCycle) {
      setBillingCycle(propBillingCycle);
    }
  }, [propBillingCycle]);

  // Set user details from auth
  useEffect(() => {
    if (userId && auth.currentUser) {
      setPaymentDetails({
        name: auth.currentUser.displayName || "",
        email: auth.currentUser.email || "",
        phone: "",
      });
    }
  }, [userId]);

  // Log payment attempt to Firestore
  const logPaymentAttempt = async (status, orderId, paymentId, signature, error, cancellationReason) => {
    try {
      const logData = {
        userId,
        userInfo: {
          name: paymentDetails.name,
          email: paymentDetails.email,
          phone: paymentDetails.phone || "Not provided",
        },
        userAgent,
        billingCycle,
        currency: userCurrency,
        amount: couponApplied
          ? Math.round(prices[billingCycle][userCurrency] * (1 - discount))
          : prices[billingCycle][userCurrency],
        status,
        orderId: orderId || "Not created",
        paymentId: paymentId || "Not available",
        signature: signature || "Not available",
        error: error ? error.message : null,
        cancellationReason: cancellationReason || null,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "payment_logs"), logData);
    } catch (error) {
      console.error("Failed to log payment attempt:", error);
    }
  };

  if (!isOpen) return null;

  const handleApplyCoupon = () => {
    setCouponApplied(!couponApplied);
  };

  const handleBillingToggle = (cycle) => {
    setBillingCycle(cycle);
  };

  const handlePaymentSubmit = async () => {
    const { email, phone, name } = paymentDetails;

    // Require only name and email, phone is optional
    if (!name || !email || !email.includes("@")) {
      toast.error("Please provide a valid name and email.");
      await logPaymentAttempt("failed", null, null, null, new Error("Invalid name or email"), null);
      return;
    }
    if (!userId) {
      toast.error("Please sign in before proceeding with payment.");
      await logPaymentAttempt("failed", null, null, null, new Error("User not signed in"), null);
      onClose();
      return;
    }

    // Validate phone only if provided
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      toast.error("Invalid phone format. Use e.g., +15551234567 or leave blank.");
      await logPaymentAttempt("failed", null, null, null, new Error("Invalid phone format"), null);
      return;
    }

    setIsLoading(true);

    try {
      const basePrice = prices[billingCycle][userCurrency];
      const finalPrice = couponApplied ? Math.round(basePrice * (1 - discount)) : basePrice;

      // Determine plan
      const planToSet = "premium";
      const planBillingCycle = billingCycle === "yearly" ? "sixMonth" : billingCycle;

      // Create Stripe Checkout Session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalPrice,
          currency: userCurrency,
          planId: planBillingCycle,
          userId,
          paymentDetails: { name, email, phone },
          billingCycle: planBillingCycle,
          planToSet,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session.");
      }

      const { url } = await response.json();

      await logPaymentAttempt("initiated", null, null, null, null, null);
      event({
        action: "payment_initiated",
        category: "Payment",
        label: "StripeCheckout",
        value: finalPrice / 100,
      });

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      await logPaymentAttempt("failed", null, null, null, error, null);
      console.error("Payment error:", error);
      toast.error(`Payment failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary p-4 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mx-auto text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mt-2">
            Secure Your Premium Access
          </h2>
          <p className="text-white/90 text-xs mt-1">
            Unlock unlimited AI-powered features—no auto-deductions!
          </p>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-6">
          <div className="bg-slate-100 border-l-4 border-primary p-2 rounded-r-lg flex items-center gap-2">
            <span className="text-primary text-sm">🎉</span>
            <p className="text-xs text-primary">
              {couponApplied ? (
                <span>
                  <strong>Coupon Applied:</strong> PREMIUM20 - 20% off applied!
                </span>
              ) : (
                <span>
                  <strong>Have a Coupon?</strong>{" "}
                  <button onClick={handleApplyCoupon} className="text-primary underline hover:text-gray-900">
                    Apply PREMIUM20 for 20% off
                  </button>
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              onClick={() => handleBillingToggle("monthly")}
              className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${billingCycle === "monthly"
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Monthly
              <span className="block text-[10px] mt-0.5 opacity-90">
                {(couponApplied ? displayPrices.monthly[userCurrency] * (1 - discount) : displayPrices.monthly[userCurrency]).toFixed(0)} {userCurrency}
              </span>
            </button>

            <button
              onClick={() => handleBillingToggle("quarterly")}
              className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${billingCycle === "quarterly"
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Quarterly
              <span className="block text-[10px] mt-0.5 opacity-90">
                {(couponApplied ? displayPrices.quarterly[userCurrency] * (1 - discount) : displayPrices.quarterly[userCurrency]).toFixed(0)} {userCurrency}
              </span>
            </button>

            <button
              onClick={() => handleBillingToggle("yearly")}
              className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${billingCycle === "yearly"
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Yearly
              <span className="block text-[10px] mt-0.5 opacity-90">
                {(couponApplied ? displayPrices.yearly[userCurrency] * (1 - discount) : displayPrices.yearly[userCurrency]).toFixed(0)} {userCurrency}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={paymentDetails.name}
              onChange={(e) => setPaymentDetails((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none placeholder-gray-400 text-sm"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={paymentDetails.email}
              onChange={(e) => setPaymentDetails((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none placeholder-gray-400 text-sm"
            />
            <input
              type="tel"
              placeholder="Phone (optional, e.g., +1 555-123-4567)"
              value={paymentDetails.phone}
              onChange={(e) => setPaymentDetails((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none placeholder-gray-400 text-sm"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-primary font-semibold">What You'll Unlock:</p>
            <ul className="mt-2 space-y-2 text-xs text-primary">
              {[
                "Unlimited PDF Downloads",
                "15+ Premium Templates",
                "Custom Colors & Fonts",
                "AI Interview Coach",
                "AI Resume Suggestions",
                "Upload Resume & Generate in 1 Min with AI",
                "Priority Support",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-primary flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-primary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Secure payment powered by Stripe
            </p>
          </div>
        </div>

        {/* Fixed Payment Button */}
        <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
          <button
            onClick={handlePaymentSubmit}
            className="w-full bg-gradient-to-r from-primary to-primary text-white py-3 rounded-lg hover:from-gray-900 hover:to-gray-900 transition-all font-semibold disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : couponApplied
                ? `Pay Now with PREMIUM20`
                : `Pay Now (${userCurrency === 'INR' ?
                  (billingCycle === "yearly" ? `₹${displayPrices.yearly.INR}` : billingCycle === "quarterly" ? `₹${displayPrices.quarterly.INR}` : `₹${displayPrices.monthly.INR}`)
                  : (billingCycle === "yearly" ? `$${displayPrices.yearly.USD}` : billingCycle === "quarterly" ? `$${displayPrices.quarterly.USD}` : `$${displayPrices.monthly.USD}`)
                })`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;