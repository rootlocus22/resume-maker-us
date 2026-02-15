"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { event, trackGoogleAdsConversion } from "../../lib/gtag";
import { GOOGLE_ADS_CONVERSION_PURCHASE } from "../../lib/appConfig";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [sessionData, setSessionData] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verifySession = async () => {
      try {
        const res = await fetch(`/api/verify-stripe-session?session_id=${sessionId}`);
        const data = await res.json();

        if (res.ok && data.status === "paid") {
          setSessionData(data);
          setStatus("success");

          // Fire analytics events
          const rawAmount = (data.amount || 0) / 100;
          event({
            action: data.isStandaloneAddon ? "addon_payment_success" : "payment_success",
            category: "Payment",
            label: data.billingCycle || data.addonParam || "unknown",
            value: data.amount,
          });

          // Google Ads Purchase conversion – signal engineering: exact value ($14/$25/$45/$60 tiers), plan, enhanced conversions
          trackGoogleAdsConversion({
            conversionLabel: GOOGLE_ADS_CONVERSION_PURCHASE,
            value: rawAmount,
            currency: "USD",
            transactionId: sessionId,
            billingCycle: data.billingCycle || null,
            customerEmail: data.customerEmail || null,
          });

          // GA4 purchase event – richer signals for audiences and analytics
          if (typeof window !== "undefined" && window.gtag) {
            window.gtag("event", "purchase", {
              transaction_id: sessionId,
              value: rawAmount,
              currency: "USD",
              items: [{
                item_id: data.billingCycle || "subscription",
                item_name: `ExpertResume ${data.billingCycle || "Premium"}`,
                item_category: "Subscription",
                price: rawAmount,
                quantity: 1,
              }],
            });
          }
        } else {
          // If not yet fulfilled, retry a few times (webhook may be processing)
          throw new Error(data.error || "Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        // Retry logic - webhook might not have fired yet
        setTimeout(async () => {
          try {
            const retryRes = await fetch(`/api/verify-stripe-session?session_id=${sessionId}`);
            const retryData = await retryRes.json();
            if (retryRes.ok && retryData.status === "paid") {
              setSessionData(retryData);
              setStatus("success");
            } else {
              setStatus("error");
            }
          } catch {
            setStatus("error");
          }
        }, 3000);
      }
    };

    verifySession();
  }, [sessionId]);

  // Countdown and redirect on success
  useEffect(() => {
    if (status !== "success" || !sessionData) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          // Build redirect URL
          const purchaseAmount = ((sessionData.amount || 0) / 100).toFixed(2);
          const params = new URLSearchParams({
            plan: sessionData.plan || "",
            billingCycle: sessionData.billingCycle || "",
            amount: purchaseAmount,
            currency: sessionData.currency || "USD",
            email: sessionData.customerEmail || "",
            name: sessionData.customerName || "",
            hasJobTracker: String(sessionData.includeJobTracker || false),
            hasInterviewKit: String(sessionData.includeInterviewKit || false),
            hasApplyPro: String(sessionData.includeApplyPro || false),
          });

          if (sessionData.isJobTrackerOnly) {
            router.push("/jobs-nearby?activated=true");
          } else if (sessionData.isStandaloneAddon && sessionData.addonParam === "profile_slot") {
            params.set("plan", "profile_slot");
            router.push(`/welcome-premium?${params.toString()}`);
          } else {
            router.push(`/welcome-premium?${params.toString()}`);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, sessionData, router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 text-accent mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-primary mb-2">
              Verifying Your Payment
            </h1>
            <p className="text-[#475569]">
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === "success" && sessionData && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              Payment Successful!
            </h1>
            <p className="text-[#475569] mb-4">
              Welcome to{" "}
              {sessionData.plan === "premium"
                ? "ExpertResume Pro"
                : sessionData.plan === "basic"
                ? "Starter Plan"
                : sessionData.plan === "oneDay"
                ? "Quick Start"
                : sessionData.plan === "profile_slot"
                ? "Profile Slot"
                : "ExpertResume Premium"}
              ! Your account has been upgraded.
            </p>
            <div className="bg-primary/5 rounded-xl p-4 mb-6">
              <p className="text-sm text-[#475569]">
                Amount Paid:{" "}
                <span className="font-semibold text-primary">
                  ${((sessionData.amount || 0) / 100).toFixed(2)}
                </span>
              </p>
            </div>
            <p className="text-sm text-[#475569]">
              Redirecting in {countdown} seconds...
            </p>
            <button
              onClick={() => {
                const purchaseAmount = ((sessionData.amount || 0) / 100).toFixed(2);
                const params = new URLSearchParams({
                  plan: sessionData.plan || "",
                  amount: purchaseAmount,
                  currency: sessionData.currency || "USD",
                });
                router.push(`/welcome-premium?${params.toString()}`);
              }}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Continue Now
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              Verification Issue
            </h1>
            <p className="text-[#475569] mb-6">
              We could not verify your payment. If you were charged, your account
              will be updated shortly. Please contact support if this persists.
            </p>
            <button
              onClick={() => router.push("/checkout")}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Back to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
