"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check, ChevronDown, ArrowRight, Crown, Shield, Zap,
  FileText, Lock, CreditCard, Star, Users, Sparkles,
  BadgeCheck, Clock, Award, ThumbsUp, Brain, Upload,
  Edit, Move, DollarSign, Briefcase, Phone
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import toast from "react-hot-toast";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getEffectivePricing, formatPrice as formatGlobalPrice } from "../lib/globalPricing";
import { PLAN_CONFIG, getPlanConfig, getDownloadLimitMessage } from "../lib/planConfig";

export const getCurrencyAndPriceByCountry = () => {
  const pricing = getEffectivePricing('USD', false);
  return {
    currency: 'USD',
    basicPrice: pricing.basic,
    monthlyPrice: pricing.monthly,
    quarterlyPrice: pricing.quarterly,
    sixMonthPrice: pricing.sixMonth,
    basicAnchorPrice: PLAN_CONFIG.basic.anchorPrice?.USD || (pricing.basic * 3),
    monthlyAnchorPrice: PLAN_CONFIG.monthly.anchorPrice?.USD || (pricing.monthly * 2),
    quarterlyAnchorPrice: PLAN_CONFIG.quarterly.anchorPrice?.USD || (pricing.quarterly * 2),
    sixMonthAnchorPrice: PLAN_CONFIG.sixMonth.anchorPrice?.USD || (pricing.sixMonth * 2),
  };
};

export default function Pricing() {
  const { user, isPremium } = useAuth();
  const { currency, isLoadingGeo } = useLocation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState(null);
  const [userCurrentPlan, setUserCurrentPlan] = useState(null);
  const [userPlanExpiry, setUserPlanExpiry] = useState(null);
  const [proBillingCycle, setProBillingCycle] = useState('quarterly');
  const [openFaq, setOpenFaq] = useState(null);

  // Fetch user's current plan data
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user && user.uid) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setUserCurrentPlan(data.plan || null);
            setUserPlanExpiry(data.premium_expiry || null);

            if (data.plan === "premium") {
              try {
                const response = await fetch(`/api/payment-logs?userId=${user.uid}`);
                if (response.ok) {
                  const paymentData = await response.json();
                  if (paymentData?.transactions && Array.isArray(paymentData.transactions)) {
                    const successfulPayments = paymentData.transactions
                      .filter(tx => tx.status === 'success')
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    if (successfulPayments.length > 0 && successfulPayments[0].billingCycle) {
                      setUserCurrentPlan(`${data.plan}_${successfulPayments[0].billingCycle}`);
                    }
                  }
                }
              } catch (err) {
                console.error("Error fetching payment logs:", err);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user plan:", error);
        }
      }
    };
    fetchUserPlan();
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) setUserData(userDoc.data());
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
    basicPrice, monthlyPrice, quarterlyPrice, sixMonthPrice,
    basicAnchorPrice, monthlyAnchorPrice, quarterlyAnchorPrice, sixMonthAnchorPrice,
  } = getCurrencyAndPriceByCountry();

  const formatPrice = (price, cur) => formatGlobalPrice(price, cur);

  const planHierarchy = { basic: 1, monthly: 2, quarterly: 2.5, sixMonth: 3 };

  const getUserBillingCycle = (userPlan) => {
    if (!userPlan || userPlan === "free" || userPlan === "anonymous") return null;
    if (userPlan.includes('_')) {
      const parts = userPlan.split('_');
      if (parts.length === 2 && parts[0] === "premium") return parts[1];
    }
    if (userPlan === "premium") return null;
    return userPlan;
  };

  const userCurrentBillingCycle = getUserBillingCycle(userCurrentPlan);

  const getCheckoutUrl = (billingCycle) => {
    if (!user) return `/checkout?billingCycle=${billingCycle}&currency=${currency}&step=2`;
    if (userCurrentBillingCycle) {
      const currentH = planHierarchy[userCurrentBillingCycle] || 0;
      const requestedH = planHierarchy[billingCycle] || 0;
      if (requestedH <= currentH) return "/resume-builder";
      return `/checkout?billingCycle=${billingCycle}&currency=${currency}&step=2`;
    }
    return `/checkout?billingCycle=${billingCycle}&currency=${currency}&step=2`;
  };

  const handlePlanClick = (e, planBillingCycle) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=checkout&billingCycle=${planBillingCycle}&currency=${currency}&step=2`);
      return;
    }
    if (userData) {
      const hasReachedLimit = checkBasicPlanDownloadLimit(userData);
      if (hasReachedLimit) {
        toast.error(getDownloadLimitMessage("basic", false));
        router.push(`/checkout?billingCycle=${planBillingCycle}&currency=${currency}`);
        return;
      }
    }
    if (user && userCurrentBillingCycle) {
      const currentH = planHierarchy[userCurrentBillingCycle] || 0;
      const requestedH = planHierarchy[planBillingCycle] || 0;
      if (requestedH <= currentH) {
        router.push("/resume-builder");
        return;
      }
    }
    router.push(`/checkout?billingCycle=${planBillingCycle}&currency=${currency}`);
  };

  const checkBasicPlanDownloadLimit = (ud) => {
    if (!ud || !user) return false;
    if (ud.plan === "premium" || ud.plan === "monthly" || ud.plan === "sixMonth") return false;
    if (ud.plan !== "basic") return false;
    if (ud.premium_expiry) {
      if (new Date() > new Date(ud.premium_expiry)) return true;
    }
    return (ud.pdf_download_count || 0) >= getPlanConfig("basic").downloads;
  };

  // Pro plan price based on selected billing cycle
  const proPriceMap = { monthly: monthlyPrice, quarterly: quarterlyPrice, sixMonth: sixMonthPrice };
  const proAnchorMap = { monthly: monthlyAnchorPrice, quarterly: quarterlyAnchorPrice, sixMonth: sixMonthAnchorPrice };
  const proDurationMap = { monthly: '30 days', quarterly: '90 days', sixMonth: '180 days' };
  const proPerMonthMap = {
    monthly: formatPrice(monthlyPrice, currency),
    quarterly: formatPrice(Math.round(quarterlyPrice / 3), currency),
    sixMonth: formatPrice(Math.round(sixMonthPrice / 6), currency)
  };

  const faqs = [
    {
      q: "Is this a subscription? Will I be charged automatically?",
      a: "No. All ExpertResume plans are one-time payments. We never charge you automatically, there is no auto-renewal, and no recurring billing. You pay once and get full access for the duration of your plan. You are always in control."
    },
    {
      q: "What's included in the Professional plan?",
      a: `The Professional plan includes unlimited PDF downloads, all 50+ premium templates, AI-powered resume building, ATS score checker, JD-based resume builder, AI cover letter builder, salary analyzer, career coaching roadmap, and priority support. Choose monthly ($${(monthlyPrice/100).toFixed(2)}), quarterly ($${(quarterlyPrice/100).toFixed(2)}), or 6-month ($${(sixMonthPrice/100).toFixed(2)}) access.`
    },
    {
      q: "Can I try ExpertResume for free?",
      a: "Yes. You can use our resume editor, preview templates, get AI suggestions, and check your ATS score completely free -- no credit card required. Upgrade only when you want to download your polished resume as a PDF."
    },
    {
      q: "What is your refund policy?",
      a: "Contact us within 7 days of purchase if you're not satisfied. We'll work with you to resolve any issues. See our Terms of Service for full details."
    },
    {
      q: "Is my payment information secure?",
      a: "Absolutely. All payments are processed through Stripe, the same payment processor used by Amazon, Google, and millions of businesses worldwide. We never store your card details. All transactions are protected with bank-grade 256-bit SSL encryption."
    },
    {
      q: "How is ExpertResume different from other resume builders?",
      a: "ExpertResume is an all-in-one career platform, not just a resume builder. You get AI resume building, ATS optimization, interview preparation, salary analysis, career coaching, and job-specific resume tailoring -- all in one place. Competitors charge $25-60/month for just a resume builder. We give you 7 tools for less."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover), Apple Pay, Google Pay, and bank transfers through our secure Stripe payment processing."
    },
    {
      q: "Can I cancel anytime?",
      a: "There's nothing to cancel. Since all plans are one-time payments with no auto-renewal, your access simply runs for the duration you purchased. No cancellation needed, no surprise charges, ever."
    }
  ];

  return (
    <div className="min-h-screen bg-white">

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
            description: "AI-powered resume builder with ATS optimization, interview prep, salary analyzer, and career coaching.",
            brand: { "@type": "Brand", name: "Vendax Systems LLC" },
            offers: [
              { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free Plan", url: "https://expertresume.us/pricing" },
              { "@type": "Offer", price: (monthlyPrice / 100).toFixed(2), priceCurrency: "USD", priceValidUntil: "2026-12-31", name: "Pro Monthly", url: "https://expertresume.us/pricing" },
              { "@type": "Offer", price: (quarterlyPrice / 100).toFixed(2), priceCurrency: "USD", priceValidUntil: "2026-12-31", name: "Pro Quarterly", url: "https://expertresume.us/pricing" },
              { "@type": "Offer", price: (sixMonthPrice / 100).toFixed(2), priceCurrency: "USD", priceValidUntil: "2026-12-31", name: "Pro 6-Month", url: "https://expertresume.us/pricing" },
            ],
          }),
        }}
      />

      {/* Hero Section */}
      <section className="pt-8 pb-4 sm:pt-12 sm:pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-6 leading-relaxed">
            One-time payment. No subscriptions. No auto-renewal.
            <br className="hidden sm:block" />
            Pay once, build unlimited resumes for the duration of your plan.
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> One-time payment only</span>
            <span className="hidden sm:inline text-gray-200">|</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> Secure payment via Stripe</span>
            <span className="hidden sm:inline text-gray-200">|</span>
            <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> No subscriptions, no auto-billing</span>
          </div>
        </div>
      </section>

      {/* Upgrade notice for existing users */}
      {user && userCurrentBillingCycle && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4">
          <div className="flex items-center justify-center gap-2 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg px-4 py-2.5 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>You&apos;re on the <strong>{userCurrentBillingCycle === "basic" ? "Starter" : userCurrentBillingCycle === "monthly" ? "Monthly" : userCurrentBillingCycle === "quarterly" ? "Quarterly" : "6-Month"}</strong> plan.</span>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      {!isLoadingGeo && (
        <section className="pb-8 sm:pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">

              {/* STARTER PLAN */}
              <div className="flex">
                <div className="w-full bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col justify-between hover:border-gray-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">Starter</h3>
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">TRIAL</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Quick access to download your resume</p>

                    <div className="mb-6">
                      {basicAnchorPrice > 0 && basicAnchorPrice !== basicPrice && (
                        <span className="text-sm text-gray-400 line-through mr-2">{formatPrice(basicAnchorPrice, currency)}</span>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-bold text-gray-900">{formatPrice(basicPrice, currency)}</span>
                        <span className="text-sm text-gray-500 font-medium">/ 7 days</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">One-time payment</p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {[
                        `${getPlanConfig("basic").downloads} PDF downloads`,
                        "50+ premium templates",
                        "AI suggestions & ATS checker",
                        "AI bullet point generator",
                        "Cover letter builder",
                        "Custom colors & fonts",
                        "Advanced resume editor",
                        "Email support",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" strokeWidth={2.5} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={(e) => handlePlanClick(e, 'basic')}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    Get Started
                  </button>
                </div>
              </div>

              {/* PROFESSIONAL PLAN */}
              <div className="flex">
                <div className="w-full bg-white rounded-2xl border-2 border-accent p-6 sm:p-8 relative flex flex-col justify-between shadow-lg shadow-teal-100/50">
                  {/* Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm tracking-wide">
                      MOST POPULAR
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 mb-1 mt-2">
                      <Crown className="w-5 h-5 text-accent" />
                      <h3 className="text-lg font-semibold text-gray-900">Professional</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-5">Everything you need to get hired</p>

                    {/* Billing cycle tabs */}
                    <div className="flex bg-gray-50 rounded-xl p-1 mb-6 border border-gray-100">
                      {[
                        { id: 'monthly', label: 'Monthly' },
                        { id: 'quarterly', label: 'Quarterly', tag: 'Save 25%' },
                        { id: 'sixMonth', label: '6 Months', tag: 'Save 40%' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setProBillingCycle(tab.id)}
                          className={`flex-1 py-2.5 px-1 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                            proBillingCycle === tab.id
                              ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {tab.tag && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              proBillingCycle === tab.id
                                ? 'bg-teal-50 text-teal-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {tab.tag}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="mb-1">
                      {proAnchorMap[proBillingCycle] > 0 && proAnchorMap[proBillingCycle] !== proPriceMap[proBillingCycle] && (
                        <span className="text-sm text-gray-400 line-through mr-2">{formatPrice(proAnchorMap[proBillingCycle], currency)}</span>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-bold text-gray-900">{formatPrice(proPriceMap[proBillingCycle], currency)}</span>
                        <span className="text-sm text-gray-500 font-medium">/ {proDurationMap[proBillingCycle]}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded">One-time payment</span>
                      {proBillingCycle !== 'monthly' && (
                        <span className="text-xs text-gray-400">({proPerMonthMap[proBillingCycle]}/mo equivalent)</span>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Everything in Starter, plus:</p>
                      {[
                        "Unlimited PDF downloads",
                        "JD-based resume builder",
                        "AI career coach & roadmap",
                        "Salary analyzer",
                        "AI upload resume (1-min)",
                        "ExpertResume GPT assistant",
                        "Priority support",
                        "Advanced analytics",
                      ].map((feature, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" strokeWidth={2.5} />
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={(e) => handlePlanClick(e, proBillingCycle)}
                      className="w-full py-3.5 rounded-xl font-semibold text-sm bg-accent text-white hover:bg-accent-600 transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-200/40"
                    >
                      Get Professional <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                      <CreditCard className="w-3 h-3" /> One-time payment · No recurring charges
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Trust note under cards */}
            <p className="text-center text-xs text-gray-400 mt-6">
              All plans are one-time payments. No recurring charges. No cancellation needed.
            </p>
          </div>
        </section>
      )}

      {/* Resume Service CTA */}
      <section className="pb-8 sm:pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 text-center border border-gray-100">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-gray-900">Prefer a done-for-you resume?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4 max-w-lg mx-auto">
              Our resume specialists will build your resume, optimize your LinkedIn, and prepare your interview pitch end-to-end.
            </p>
            <Link
              href="/book-resume-service"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Book Resume Service <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What's Included - Detailed Comparison */}
      {!isLoadingGeo && (
        <section className="py-12 sm:py-16 bg-gray-50/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
              Compare plans
            </h2>
            <p className="text-sm text-gray-500 text-center mb-10">See exactly what you get with each plan</p>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-900 w-1/2">Feature</th>
                    <th className="text-center px-4 py-4 text-sm font-semibold text-gray-500 w-1/4">Starter</th>
                    <th className="text-center px-4 py-4 text-sm font-semibold text-accent w-1/4">Professional</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { feature: "PDF downloads", starter: `${getPlanConfig("basic").downloads} downloads`, pro: "Unlimited" },
                    { feature: "Premium templates (50+)", starter: true, pro: true },
                    { feature: "AI resume suggestions", starter: true, pro: true },
                    { feature: "ATS score checker", starter: true, pro: true },
                    { feature: "AI bullet point generator", starter: true, pro: true },
                    { feature: "Cover letter builder", starter: true, pro: true },
                    { feature: "Custom colors & fonts", starter: true, pro: true },
                    { feature: "Advanced editor & drag-drop", starter: true, pro: true },
                    { feature: "JD-based resume builder", starter: false, pro: true },
                    { feature: "AI upload resume (1-min)", starter: false, pro: true },
                    { feature: "ExpertResume GPT assistant", starter: false, pro: true },
                    { feature: "AI career coach & roadmap", starter: false, pro: true },
                    { feature: "Salary analyzer", starter: false, pro: true },
                    { feature: "Advanced analytics", starter: false, pro: true },
                    { feature: "Priority support", starter: false, pro: true },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-5 py-3 text-gray-700 font-medium">{row.feature}</td>
                      <td className="px-4 py-3 text-center">
                        {typeof row.starter === 'string' ? (
                          <span className="text-gray-600 text-xs font-medium">{row.starter}</span>
                        ) : row.starter ? (
                          <Check className="w-4 h-4 text-gray-400 mx-auto" strokeWidth={2.5} />
                        ) : (
                          <span className="text-gray-300">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {typeof row.pro === 'string' ? (
                          <span className="text-accent text-xs font-bold">{row.pro}</span>
                        ) : row.pro ? (
                          <Check className="w-4 h-4 text-accent mx-auto" strokeWidth={2.5} />
                        ) : (
                          <span className="text-gray-300">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Value Proposition */}
      {!isLoadingGeo && (
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
              7 career tools. One platform.
            </h2>
            <p className="text-sm text-gray-500 text-center mb-10">
              Competitors charge $25-60/month for just a resume builder. ExpertResume gives you more for less.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <FileText className="w-5 h-5" />, title: "AI Resume Builder", desc: "50+ ATS-optimized templates with smart formatting", cost: "$25-60 elsewhere" },
                { icon: <Zap className="w-5 h-5" />, title: "ATS Score Checker", desc: "Scan your resume against real ATS algorithms", cost: "$15-25 elsewhere" },
                { icon: <Brain className="w-5 h-5" />, title: "AI Interview Prep", desc: "Practice with AI-powered mock interviews", cost: "$30-60 elsewhere" },
                { icon: <DollarSign className="w-5 h-5" />, title: "Salary Analyzer", desc: "Know your market value before negotiating", cost: "$20-40 elsewhere" },
                { icon: <Edit className="w-5 h-5" />, title: "JD-Based Builder", desc: "Tailor your resume to any job description", cost: "$25-50 elsewhere" },
                { icon: <FileText className="w-5 h-5" />, title: "Cover Letter Builder", desc: "AI-generated cover letters matched to jobs", cost: "$20-40 elsewhere" },
              ].map((tool, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-white">
                  <div className="p-2 bg-teal-50 rounded-lg text-accent h-fit shrink-0">
                    {tool.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{tool.title}</h4>
                    <p className="text-xs text-gray-500 mb-1">{tool.desc}</p>
                    <span className="text-[10px] text-gray-400 font-medium">{tool.cost}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-teal-50 rounded-xl p-5 border border-teal-100 text-center">
              <p className="text-sm text-teal-800">
                <strong>Total value elsewhere: $180-365+</strong> per month.
                With ExpertResume Professional: <strong>{formatPrice(monthlyPrice, currency)}</strong> for 30 days.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Trust & Security Section */}
      <section className="py-12 sm:py-16 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
            Your trust matters to us
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Lock className="w-6 h-6" />, title: "Secure payments", desc: "256-bit SSL encryption via Stripe. We never store your card details." },
              { icon: <CreditCard className="w-6 h-6" />, title: "One-time payment only", desc: "Pay once and get full access. No subscriptions, no auto-renewal, no surprise charges—ever." },
              { icon: <DollarSign className="w-6 h-6" />, title: "No recurring billing", desc: "You're in control. Your access runs for the duration you chose. Nothing to cancel." },
              { icon: <BadgeCheck className="w-6 h-6" />, title: "Built for US market", desc: "Optimized for US ATS systems like Greenhouse, Lever, and Workday." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-accent">
                  {item.icon}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { stat: "15,000+", label: "Resumes created", icon: <FileText className="w-5 h-5" /> },
              { stat: "97%", label: "Customer satisfaction", icon: <ThumbsUp className="w-5 h-5" /> },
              { stat: "3x", label: "More interviews", icon: <Award className="w-5 h-5" /> },
              { stat: "50+", label: "Professional templates", icon: <Sparkles className="w-5 h-5" /> },
            ].map((item, i) => (
              <div key={i}>
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-2 text-accent">
                  {item.icon}
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{item.stat}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {!isLoadingGeo && (
        <section className="py-12 sm:py-16 bg-gray-50/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
              Frequently asked questions
            </h2>
            <p className="text-sm text-gray-500 text-center mb-10">
              Everything you need to know about ExpertResume pricing
            </p>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    className="flex justify-between items-center w-full text-left px-5 py-4 hover:bg-gray-50/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <h3 className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</h3>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      {!isLoadingGeo && (
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-12 text-center text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to build your resume?</h2>
              <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-md mx-auto">
                Join thousands of professionals who&apos;ve landed jobs faster with ExpertResume.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={(e) => handlePlanClick(e, proBillingCycle)}
                  className="bg-accent text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-accent-600 transition-colors shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2"
                >
                  Get Professional <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/resume-builder"
                  className="border border-white/20 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors text-center"
                >
                  Try Free
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-5 flex items-center justify-center gap-1.5">
                <CreditCard className="w-3 h-3" /> One-time payment. No subscriptions. No auto-billing.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Payment Partners Footer */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-gray-400 mb-3">Payments securely processed by</p>
          <div className="flex items-center justify-center gap-6 text-gray-300">
            <span className="text-sm font-bold tracking-wide">Stripe</span>
            <span className="text-gray-200">|</span>
            <span className="text-xs">Visa</span>
            <span className="text-xs">Mastercard</span>
            <span className="text-xs">Amex</span>
            <span className="text-xs">Apple Pay</span>
            <span className="text-xs">Google Pay</span>
          </div>
        </div>
      </section>

    </div>
  );
}
