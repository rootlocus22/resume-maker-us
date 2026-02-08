"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Star, Zap, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocation } from "../context/LocationContext";
import { formatPrice, getEffectivePricing } from "../lib/globalPricing";

export default function UpgradeBanner({
  user,
  plan,
  isPremium,
  previewCount = 0,
  templateChangeCount = 0,
  onClose
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const { currency } = useLocation();
  const pricing = getEffectivePricing(currency);

  // Show banner logic
  useEffect(() => {
    if (!user || isPremium || plan === "premium" || plan === "basic") {
      setIsVisible(false);
      return;
    }

    // Show banner if user is approaching limits or has hit limits
    const shouldShow = previewCount >= 1 || templateChangeCount >= 1;

    if (shouldShow) {
      setIsVisible(true);
    }
  }, [user, isPremium, plan, previewCount, templateChangeCount]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const isAtLimit = previewCount >= 1 || templateChangeCount >= 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-600 to-orange-500 text-white shadow-xl"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left side - Main message */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Crown className="text-yellow-300" size={24} />
                  <span className="font-bold text-lg">
                    {isAtLimit ? "🔒 Upgrade Required!" : "⚡ Unlock Full Power!"}
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap size={16} />
                    <span>Unlimited Previews</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} />
                    <span>Premium Templates</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>AI Interview Coach</span>
                  </div>
                </div>
              </div>

              {/* Center - Countdown */}
              <div className="hidden lg:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Clock size={16} />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                <span className="text-xs">left</span>
              </div>

              {/* Right side - CTA */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm opacity-90">Starting at</div>
                  <div className="font-bold text-lg">{formatPrice(pricing.basic, currency)} (7 days)</div>
                </div>

                <Link
                  href={`/checkout?billingCycle=basic&currency=${currency}&step=1`}
                  className="bg-white text-blue-700 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  Upgrade Now
                  <ArrowRight size={16} />
                </Link>

                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Mobile additional info */}
            <div className="md:hidden mt-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span>✓ Unlimited access</span>
                <span>✓ Premium templates</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <motion.div
              className="h-full bg-white"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: timeLeft, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 