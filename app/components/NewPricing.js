"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Crown,
  Zap,
  Shield,
  Star,
  Users,
  Award
} from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { getEffectivePricing, formatPrice } from '../lib/globalPricing';

export default function NewPricing() {
  const [isVisible, setIsVisible] = useState(false);
  const { currency } = useLocation();

  // Get pricing based on currency
  const devicePricing = getEffectivePricing(currency, false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const plans = [
    {
      name: "Starter Plan",
      price: formatPrice(devicePricing.basic, currency),
      period: "",
      description: "Get started with all the essentials",
      features: [
        "8 Resume Downloads (7 days)",
        "AI Suggestions",
        "50+ Premium Templates",
        "ATS Optimization",
        "Email Support"
      ],
      cta: "Get Started",
      href: "/checkout?billingCycle=basic",
      popular: true,
      color: "from-primary to-primary-600",
      bgColor: "bg-gradient-to-br from-primary-50 to-primary-100",
      borderColor: "border-primary-200",
      textColor: "text-primary-800"
    },
    {
      name: "Pro Monthly",
      price: formatPrice(devicePricing.monthly, currency),
      period: "",
      description: "Complete career toolkit for serious professionals",
      features: [
        "JD Builder - Tailor to Any Job",
        "AI Interview",
        "Salary Analyzer",
        "AI Career Coach - 6 Month Roadmap",
        "Unlimited Downloads",
        "24/7 Email & Chat Support",
        "Personalized Career Guidance",
        "AI Upload Resume (1-Min)",
        "Priority Support",
        "Advanced Analytics"
      ],
      cta: "Go Pro",
      href: "/checkout?billingCycle=monthly",
      popular: false,
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-800"
    },
    {
      name: "Pro Quarterly",
      price: formatPrice(devicePricing.quarterly, currency),
      period: "",
      description: "Best value for committed professionals",
      features: [
        "JD Builder - Tailor to Any Job",
        "AI Interview",
        "Salary Analyzer",
        "AI Career Coach - 6 Month Roadmap",
        "Unlimited Downloads",
        "24/7 Email & Chat Support",
        "Personalized Career Guidance",
        "AI Upload Resume (1-Min)",
        "Priority Support",
        "Advanced Analytics"
      ],
      cta: "Go Pro",
      href: "/checkout?billingCycle=quarterly",
      popular: false,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800"
    },
    {
      name: "Pro 6-Month",
      price: formatPrice(devicePricing.sixMonth, currency),
      period: "",
      description: "Great value for professionals who want extended access",
      features: [
        "JD Builder - Tailor to Any Job",
        "AI Interview",
        "Salary Analyzer",
        "AI Career Coach - 6 Month Roadmap",
        "Unlimited Downloads",
        "24/7 Email & Chat Support",
        "Personalized Career Guidance",
        "AI Upload Resume (1-Min)",
        "Priority Support",
        "Advanced Analytics"
      ],
      cta: "Go Pro",
      href: "/checkout?billingCycle=sixMonth",
      popular: false,
      color: "from-primary to-primary-600",
      bgColor: "bg-gradient-to-br from-primary-50 to-primary-100",
      borderColor: "border-primary-200",
      textColor: "text-primary-800"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Invest in Your Career Growth
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Choose the plan that fits your goals. <span className="font-bold text-green-600">One-time payment only—no subscriptions, no auto-renewal.</span>
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm font-medium text-gray-500 mb-12">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>One-time payment only</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">🔒</div>
              <span>SSL Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">✨</div>
              <span>No subscriptions · No auto-billing</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent ${plan.name === "Pro Quarterly" // Highlight Quarterly Plan
                  ? `bg-gradient-to-br from-primary-900 to-primary-800 text-white border-2 border-yellow-400 shadow-2xl scale-105 z-10`
                  : plan.popular
                    ? `bg-gradient-to-br from-primary-50 to-primary-100 text-gray-900 border-2 border-primary-200 shadow-xl`
                    : `bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl`
                  }`}
                role="article"
                aria-labelledby={`plan-name-${index}`}
              >
                {/* Best Value / Popular Badge */}
                {(plan.popular || plan.name === "Pro Quarterly") && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full text-center">
                    <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold shadow-lg ${plan.name === "Pro Quarterly"
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 ring-4 ring-white"
                      : "bg-primary-100 text-primary-800"
                      }`}>
                      {plan.name === "Pro Quarterly" ? "🔥 BEST VALUE" : "MOST POPULAR"}
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6 pt-2">
                  <h3 id={`plan-name-${index}`} className={`text-xl font-bold mb-2 ${plan.name === "Pro Quarterly" ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div
                    className="flex items-end justify-center gap-1 mb-2"
                    role="text"
                    aria-label={`${plan.price}${plan.period} for ${plan.name} plan`}
                  >
                    <span className={`text-3xl font-bold ${plan.name === "Pro Quarterly" ? "text-white" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-lg mb-1 ${plan.name === "Pro Quarterly" ? "text-primary-200" : "text-gray-500"}`}>
                      {plan.period}
                    </span>
                  </div>

                  {/* Urgency Tag for Quarterly */}
                  {plan.name === "Pro Quarterly" && (
                    <div className="text-xs font-bold text-yellow-400 mb-2 animate-pulse">
                      ⚡ Limited Time Offer
                    </div>
                  )}

                  <p
                    className={`text-sm ${plan.name === "Pro Quarterly" ? 'text-primary-100' : 'text-gray-600'}`}
                    id={`plan-description-${index}`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div
                  className="space-y-3 mb-6"
                  role="list"
                  aria-label={`Features included in ${plan.name} plan`}
                >
                  {plan.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start gap-2"
                      role="listitem"
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.name === "Pro Quarterly" ? 'bg-yellow-400' : 'bg-green-500'
                          }`}
                        aria-hidden="true"
                      >
                        <Check className={`w-3 h-3 ${plan.name === "Pro Quarterly" ? 'text-gray-900' : 'text-white'}`} />
                      </div>
                      <span className={`text-xs leading-relaxed ${plan.name === "Pro Quarterly" ? 'text-primary-50' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${plan.name === "Pro Quarterly"
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 shadow-lg transform hover:scale-105'
                    : plan.popular
                      ? 'bg-accent text-white hover:bg-accent-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  role="button"
                  aria-label={`Get started with ${plan.name} plan`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}