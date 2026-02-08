"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, Clock, Gift, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { event } from "../lib/gtag";

/**
 * Exit Intent WhatsApp Marketing Component
 * Shows popup when user tries to leave, close tab, or navigate away
 */
export default function ExitIntentWhatsApp() {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const pathname = usePathname();
  const exitIntentTimer = useRef(null);
  const isActivated = useRef(false);

  // Your WhatsApp business number (format: country code + number, no +)
  const WHATSAPP_NUMBER = "918431256903"; // TODO: Replace with your actual number

  // Paths where exit intent should NOT show
  const EXCLUDE_PATHS = ['/checkout', '/payment', '/enterprise/checkout'];

  // Check if should show on current path
  const shouldShow = useCallback(() => {
    return !EXCLUDE_PATHS.some(path => pathname.startsWith(path));
  }, [pathname]);

  // Show popup
  const triggerPopup = useCallback(() => {
    if (!hasShown && shouldShow()) {
      setShowPopup(true);
      setHasShown(true);
      
      // Track event
      event({
        action: "exit_intent_whatsapp_triggered",
        category: "Engagement",
        label: "Exit Intent Popup Shown"
      });

      // Store in sessionStorage
      sessionStorage.setItem('exitIntentWhatsAppShown', 'true');
    }
  }, [hasShown, shouldShow]);

  // Detect mouse leaving viewport (classic exit intent)
  const handleMouseLeave = useCallback((e) => {
    if (!isActivated.current) return;
    
    // Mouse moving to top of screen (trying to close tab/click URL bar)
    if (e.clientY <= 50 && e.relatedTarget === null) {
      triggerPopup();
    }
  }, [triggerPopup]);

  // Detect tab closing/navigation (beforeunload)
  const handleBeforeUnload = useCallback((e) => {
    if (!hasShown && shouldShow()) {
      // Show popup immediately
      triggerPopup();
      
      // Optional: Show browser's default confirmation dialog
      // Uncomment if you want both popup AND browser warning
      // e.preventDefault();
      // e.returnValue = '';
    }
  }, [hasShown, shouldShow, triggerPopup]);

  // Detect tab switching (visibilitychange)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !hasShown && shouldShow()) {
      // User switched to another tab
      triggerPopup();
    }
  }, [hasShown, shouldShow, triggerPopup]);

  // Detect page navigation (popstate - back button)
  const handlePopState = useCallback(() => {
    if (!hasShown && shouldShow()) {
      triggerPopup();
    }
  }, [hasShown, shouldShow, triggerPopup]);

  useEffect(() => {
    // Check if already shown
    const alreadyShown = sessionStorage.getItem('exitIntentWhatsAppShown');
    if (alreadyShown) {
      setHasShown(true);
      return;
    }

    // Activate exit intent after 5 seconds (avoid annoying immediate users)
    exitIntentTimer.current = setTimeout(() => {
      isActivated.current = true;

      // Add event listeners
      document.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('popstate', handlePopState);
    }, 5000);

    return () => {
      if (exitIntentTimer.current) {
        clearTimeout(exitIntentTimer.current);
      }
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleMouseLeave, handleBeforeUnload, handleVisibilityChange, handlePopState]);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi! I was just browsing ExpertResume and would like to know more about:\n\n` +
      `• Creating the perfect resume 📄\n` +
      `• ATS optimization tips ✅\n` +
      `• Premium plans and pricing 💎\n` +
      `• Job Description Resume Builder 🎯\n` +
      `• Resume GPT - AI-powered suggestions 🤖\n\n` +
      `Can you help me? 😊`
    );

    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    let whatsappURL;
    
    if (isMobile) {
      // For mobile: Try to use app protocol first (most direct)
      // Format: whatsapp://send?phone=918431256903&text=message
      whatsappURL = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${message}`;
      
      // Try to open with protocol handler
      try {
        window.location.href = whatsappURL;
        
        // Fallback to web.whatsapp.com after short delay if app didn't open
        setTimeout(() => {
          window.open(`https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`, '_blank');
        }, 1500);
      } catch (e) {
        // If protocol fails, use web URL
        window.open(`https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`, '_blank');
      }
    } else {
      // For desktop: Use web.whatsapp.com directly (opens chat immediately)
      whatsappURL = `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`;
      
      // Open in new window with specific dimensions
      const width = 800;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const whatsappWindow = window.open(
        whatsappURL,
        'WhatsApp',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );
      
      // Fallback: If popup was blocked, open in new tab
      if (!whatsappWindow) {
        window.open(whatsappURL, '_blank');
      }
    }
    
    // Track click
    event({
      action: "exit_intent_whatsapp_clicked",
      category: "Conversion",
      label: "WhatsApp Chat Started",
      value: isMobile ? 1 : 0 // Track mobile vs desktop
    });

    setShowPopup(false);
  };

  const handleClose = () => {
    setShowPopup(false);
    
    // Track close
    event({
      action: "exit_intent_whatsapp_closed",
      category: "Engagement",
      label: "User Dismissed"
    });
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleClose}
          />

          {/* Popup Container - Full Screen Flex Center */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-[95%] sm:w-[90%] md:w-[500px] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-2xl border-2 border-green-300 overflow-hidden">
              {/* Animated header with gradient */}
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-3 sm:p-4 md:p-6 relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                </div>

                <button
                  onClick={handleClose}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 text-white/80 hover:text-white transition-colors z-20 hover:rotate-90 transition-transform duration-300 bg-black/10 hover:bg-black/20 rounded-full p-1"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <motion.div 
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 sm:ring-4 ring-white/30 flex-shrink-0"
                    >
                      {/* Official WhatsApp Logo */}
                      <svg 
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" 
                        viewBox="0 0 24 24" 
                        fill="none"
                      >
                        <path 
                          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" 
                          fill="white"
                        />
                      </svg>
                    </motion.div>
                    <div className="flex-1 min-w-0 pr-6 sm:pr-8 md:pr-10">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-lg leading-snug">
                        Wait! Chat with us on WhatsApp! 👋
                      </h3>
                      <p className="text-green-100 text-[11px] sm:text-xs md:text-sm font-medium mt-0.5 sm:mt-1">
                        We're here to help you!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 md:p-6">
                <p className="text-gray-800 text-xs sm:text-sm md:text-base font-medium mb-3 sm:mb-4 leading-relaxed">
                  Before you go! 💬 Have questions about creating the perfect resume? <strong>Chat with us on WhatsApp</strong> for instant help and guidance!
                </p>

                {/* Benefits with icons */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-green-100"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Get instant replies on WhatsApp</span>
                  </motion.div>

                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-blue-100"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Available 24/7 to answer questions</span>
                  </motion.div>

                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-purple-100"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Get exclusive tips & special offers</span>
                  </motion.div>
                </div>

                {/* CTA Button with animation */}
                <motion.button
                  onClick={handleWhatsAppClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 sm:gap-3 group relative overflow-hidden text-sm sm:text-base"
                >
                  {/* Animated background shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  {/* WhatsApp Logo */}
                  <svg 
                    className="w-5 h-5 sm:w-6 sm:h-6 relative group-hover:scale-110 transition-transform" 
                    viewBox="0 0 24 24" 
                    fill="none"
                  >
                    <path 
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" 
                      fill="white"
                    />
                  </svg>
                  
                  <span className="relative whitespace-nowrap">Chat on WhatsApp Now</span>
                  
                  {/* WhatsApp Logo */}
                  <svg 
                    className="w-5 h-5 sm:w-6 sm:h-6 relative group-hover:scale-110 transition-transform" 
                    viewBox="0 0 24 24" 
                    fill="none"
                  >
                    <path 
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" 
                      fill="white"
                    />
                  </svg>
                </motion.button>

                <p className="text-center text-gray-500 text-[10px] sm:text-xs mt-2 sm:mt-3 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Free • No spam • Instant support</span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                </p>

                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm mt-3 sm:mt-4 w-full text-center transition-colors underline"
                >
                  Skip for now
                </button>
              </div>

              {/* Trust indicators */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-6 py-2 sm:py-3 border-t border-gray-200">
                <div className="flex items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                    <span className="whitespace-nowrap">Trusted by 10,000+ users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                    <span className="whitespace-nowrap">Response time: &lt;5 min</span>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
