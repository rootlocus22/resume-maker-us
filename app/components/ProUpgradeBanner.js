"use client";

import { motion } from "framer-motion";
import { Briefcase, Target, Zap, TrendingUp, Star, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocation } from "../context/LocationContext";
import { PLAN_CONFIG, getOriginalPrice, getDiscountedPrice, getDiscountPercentage } from "../lib/planConfig";

export default function ProUpgradeBanner({ userSubscription }) {
  const router = useRouter();
  const { currency } = useLocation();

  // Only show for oneDay and basic plan users
  const shouldShowBanner = userSubscription?.plan === 'oneDay' || userSubscription?.plan === 'basic';

  if (!shouldShowBanner) {
    return null;
  }

  const planName = userSubscription?.plan === 'oneDay' ? PLAN_CONFIG.oneDay.name : PLAN_CONFIG.basic.name;
  const remainingDays = userSubscription?.plan === 'oneDay' ? `${PLAN_CONFIG.oneDay.duration} days` : `${PLAN_CONFIG.basic.duration} days`;

  // Get original prices from planConfig (before discount)
  const originalSixMonthPrice = getOriginalPrice('sixMonth', currency);
  const originalMonthlyPrice = getOriginalPrice('monthly', currency);

  // Get discounted prices (after 10% discount applied)
  const discountedSixMonthPrice = getDiscountedPrice('sixMonth', currency);
  const discountedMonthlyPrice = getDiscountedPrice('monthly', currency);

  // Get discount percentage
  const discountPercentage = getDiscountPercentage('sixMonth');

  // Format prices
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const displaySixMonthPrice = formatPrice(discountedSixMonthPrice, currency);
  const displayMonthlyPrice = formatPrice(discountedMonthlyPrice, currency);
  const displayOriginalPrice = formatPrice(originalSixMonthPrice, currency);

  return (
    <div className="mb-6 sm:mb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-indigo-300 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center sm:text-left">
              {/* Header */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <Star className="w-6 h-6 text-yellow-300 animate-bounce" />
                <span className="text-xl sm:text-2xl font-bold text-white">Applying to Multiple Jobs?</span>
                <Sparkles className="w-6 h-6 text-yellow-300 animate-bounce" />
              </div>

              {/* Current Plan Status */}
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-4 inline-block">
                <p className="text-white text-sm">
                  <span className="font-semibold">Your {planName}:</span> {remainingDays} access with limited downloads
                </p>
              </div>

              {/* Upgrade Message */}
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Upgrade to Pro 6-Month Plan
              </h3>

              <p className="text-white/90 text-base sm:text-lg mb-4 leading-relaxed">
                <span className="font-bold text-yellow-300">Planning to apply to multiple jobs in the next 3-6 months?</span>
                <br />
                Get <span className="font-bold">unlimited access to JD Builder</span> and create tailored resumes for every application!
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-white">
                  <Briefcase className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                  <span className="text-sm font-medium">Unlimited JD Builder</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Target className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                  <span className="text-sm font-medium">Unlimited Downloads</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                  <span className="text-sm font-medium">180 Days Access</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                  <span className="text-sm font-medium">All Pro Features</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 mb-4 inline-block">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-white/70 text-xs line-through">{displayOriginalPrice}</p>
                    <p className="text-white text-3xl font-black">{displaySixMonthPrice}</p>
                  </div>
                  <div className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold">
                    SAVE {discountPercentage}%
                  </div>
                </div>
                <p className="text-white/80 text-xs mt-1">One-time payment • No auto-renewal</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/checkout?billingCycle=sixMonth&currency=${currency}&step=1`)}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-4 rounded-xl font-bold text-base hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                <span>Upgrade to Pro 6-Month</span>
              </motion.button>

              <button
                onClick={() => router.push(`/checkout?billingCycle=monthly&currency=${currency}&step=1`)}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/30 transition-all duration-300 border-2 border-white/30"
              >
                Or try Pro Monthly ({displayMonthlyPrice})
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

