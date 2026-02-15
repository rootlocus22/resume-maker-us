"use client";

import { useState, useEffect } from 'react';
import { X, Clock, Zap, Gift, Star, ArrowRight, Sparkles, Shield, Heart, Crown } from 'lucide-react';

// Utility to detect mobile iOS
function isMobileIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

const ExitIntentDiscountPopup = ({ 
  isVisible, 
  onClose, 
  onAccept, 
  originalPlan, 
  originalPrice,
  triggerInfo 
}) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [isClosing, setIsClosing] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isMobile, setIsMobile] = useState(false);
  const [isIOSMobile, setIsIOSMobile] = useState(false);
  
  // Define all available plans with their prices
  const plans = {
    trial: {
      name: "7-Day Trial",
      originalPrice: 49,
      duration: 7,
      popular: false,
      badge: "🚀 TRY NOW"
    },
    monthly: {
      name: "Monthly Plan", 
      originalPrice: 299,
      duration: 30,
      popular: true,
      badge: "⚡ POPULAR"
    },
    yearly: {
      name: "Annual Plan",
              originalPrice: 1299,
      duration: 365,
      popular: false,
      badge: "💎 BEST VALUE"
    }
  };
  
  // Filter plans based on device constraints
  const getAvailablePlans = () => {
    const allPlans = Object.entries(plans);
    
    // Only show trial plan for mobile (non-iOS) users
    // Desktop users and iOS mobile users should not see trial plan
    if (isIOSMobile || !isMobile) {
      return allPlans.filter(([key]) => key !== 'trial');
    }
    
    return allPlans;
  };
  
  // Set initial selected plan based on original plan or default to monthly
  useEffect(() => {
    // First check if this is iOS mobile
    setIsIOSMobile(isMobileIOS());
    
    // Only select trial if it's available (mobile non-iOS users)
    if (originalPlan?.name?.toLowerCase().includes('trial') && !isMobileIOS() && isMobile) {
      setSelectedPlan('trial');
    } else if (originalPlan?.name?.toLowerCase().includes('year')) {
      setSelectedPlan('yearly');
    } else {
      setSelectedPlan('monthly');
    }
  }, [originalPlan, isMobile, isIOSMobile]);
  
  useEffect(() => {
    setMounted(true);
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsIOSMobile(isMobileIOS());
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (!isVisible) return;
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Pulse animation control
    const pulseTimer = setInterval(() => {
      setShowPulse(prev => !prev);
    }, 1500);
    
    return () => {
      clearInterval(timer);
      clearInterval(pulseTimer);
    };
  }, [isVisible, onClose]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getDiscountedPrice = (plan) => {
    return Math.round(plans[plan].originalPrice * 0.5);
  };
  
  const getSavings = (plan) => {
    return plans[plan].originalPrice - getDiscountedPrice(plan);
  };
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleCloseImmediate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };
  
  const handleAccept = () => {
    const plan = plans[selectedPlan];
    const discountedPrice = getDiscountedPrice(selectedPlan);
    const savings = getSavings(selectedPlan);
    
    // Track conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_discount_accepted', {
        event_category: 'Conversion',
        event_label: plan.name,
        value: discountedPrice,
        custom_parameters: {
          trigger_type: triggerInfo?.trigger,
          original_price: plan.originalPrice,
          discount_amount: savings,
          time_on_page: triggerInfo?.timeOnPage,
          selected_plan: selectedPlan
        }
      });
    }
    
    onAccept({
      originalPrice: plan.originalPrice,
      discountedPrice,
      savings,
      discountCode: 'EXIT50',
      discountedDays: plan.duration,
      selectedPlan: selectedPlan
    });
  };
  
  if (!mounted || !isVisible) return null;
  
  return (
    <>
      {/* Backdrop with stronger blur */}
      <div 
        className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] transition-all duration-500 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`} 
        onClick={handleCloseImmediate}
      />
      
      {/* Popup Container */}
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 transition-all duration-500 ${
        isClosing ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
      }`}>
        
        {/* Main Popup */}
        <div 
          className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-lg mx-auto overflow-hidden transform max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Urgent Header */}
          <div className="relative bg-gradient-to-r from-red-600 via-primary to-primary-600 text-white overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className={`absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-red-400/30 to-primary/30 ${showPulse ? 'animate-pulse' : ''}`}></div>
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse"></div>
              </div>
            </div>
            
            {/* Close button */}
            <button 
              onClick={handleCloseImmediate}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 group"
            >
              <X size={14} className="text-white group-hover:scale-110 transition-transform" />
            </button>
            
            {/* Header content */}
            <div className="relative z-10 p-4 sm:p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`w-2 h-2 bg-yellow-300 rounded-full ${showPulse ? 'animate-ping' : ''}`}></div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest">⚠️ WAIT! URGENT</span>
                <div className={`w-2 h-2 bg-yellow-300 rounded-full ${showPulse ? 'animate-ping' : ''}`}></div>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black mb-2 leading-tight">
                🚨 DON&apos;T MISS OUT!<br />
                <span className="text-yellow-300">50% FLASH DISCOUNT</span>
              </h2>
              
              <p className="text-white/95 text-sm leading-tight">
                This exclusive offer expires in:
              </p>
              
              {/* Countdown Timer */}
              <div className="mt-3 bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
                <div className="text-2xl sm:text-3xl font-black text-yellow-300 font-mono tracking-wider">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-red-200 -mt-1">This offer will never come back!</div>
              </div>
            </div>
          </div>
          
          {/* Plan Selection */}
          <div className="p-4 sm:p-6">
            <h3 className="text-center font-bold text-gray-900 mb-4 text-lg">
              🎯 Choose Your Plan & Save 50%
            </h3>
            
            <div className="space-y-3">
              {getAvailablePlans().map(([key, plan]) => {
                const isSelected = selectedPlan === key;
                const discountedPrice = getDiscountedPrice(key);
                const savings = getSavings(key);
                
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-accent bg-accent-50 shadow-lg scale-105' 
                        : 'border-gray-200 bg-white hover:border-accent-300 hover:shadow-md'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {plan.badge}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-accent bg-accent' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <span className="font-bold text-gray-900">{plan.name}</span>
                          {!plan.popular && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 ml-6">
                          {plan.duration} days • All premium features
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-gray-500 line-through">₹{plan.originalPrice}</div>
                        <div className="text-lg font-black text-primary">₹{discountedPrice}</div>
                        <div className="text-xs text-primary font-semibold">Save ₹{savings}!</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Selected Plan Summary */}
            <div className="mt-6 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-xl p-4">
              <div className="text-center">
                <div className="text-sm text-primary-700 mb-2">🎉 Your Special Deal:</div>
                <div className="text-2xl font-black text-primary-800 mb-1">
                  ₹{getDiscountedPrice(selectedPlan)} 
                  <span className="text-sm font-normal text-primary ml-2">
                    (was ₹{plans[selectedPlan].originalPrice})
                  </span>
                </div>
                <div className="text-sm text-primary-700">
                  💰 You save ₹{getSavings(selectedPlan)} • {plans[selectedPlan].duration} days access
                </div>
              </div>
            </div>
            
            {/* Features highlight */}
            <div className="mt-6">
              <h4 className="font-bold text-center mb-3 text-base">✨ Instant Access To:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {[
                  "60+ Premium Templates",
                  "Unlimited PDF Downloads", 
                  "AI Resume Optimization",
                  "Cover Letter Generator",
                  "24/7 Email & Chat Support"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-gray-800">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom CTA Area */}
          <div className="bg-gray-50 p-4 sm:p-6">
            {/* Main CTA Button */}
            <button
              onClick={handleAccept}
              className={`w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-black text-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-xl ${
                showPulse ? 'shadow-primary/50 animate-pulse' : 'shadow-primary/30'
              }`}
            >
              <Gift className="w-6 h-6" />
              <span>CLAIM 50% OFF - ₹{getDiscountedPrice(selectedPlan)}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-primary" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span>Instant</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-primary" />
                <span>15k+ Users</span>
              </div>
            </div>
            
            <button
              onClick={handleCloseImmediate}
              className="w-full text-gray-500 py-3 text-sm hover:text-gray-700 transition-colors font-medium mt-2"
            >
              No thanks, I&apos;ll pay full price 😢
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExitIntentDiscountPopup; 