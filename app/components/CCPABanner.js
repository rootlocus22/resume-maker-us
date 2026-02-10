'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Cookie } from 'lucide-react';

export default function CCPABanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isUS, setIsUS] = useState(false);

  useEffect(() => {
    // Only run client-side after mount (no SSR)
    if (typeof window === 'undefined') return;

    // Check if we're on the US domain
    const isUSVersion = window.location.hostname.includes('expertresume.us') || window.location.hostname.includes('expertresume.com');
    setIsUS(isUSVersion);

    // Only show for US domain (also show on localhost for testing)
    if (!isUSVersion && !window.location.hostname.includes('localhost')) return;

    // Check if user has already made a choice
    const consent = localStorage.getItem('ccpa_consent');
    
    // Show banner if no consent stored
    if (!consent) {
      // Delay showing banner by 1 second to not block initial paint
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ccpa_consent', 'accepted');
    localStorage.setItem('ccpa_consent_date', new Date().toISOString());
    setShowBanner(false);
  };

  const handleOptOut = () => {
    localStorage.setItem('ccpa_consent', 'opted_out');
    localStorage.setItem('ccpa_consent_date', new Date().toISOString());
    
    // Disable analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
    
    setShowBanner(false);
  };

  // Don't render if not US or already consented
  if (!isUS || !showBanner) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up"
      style={{
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Banner content - compact on mobile */}
      <div className="relative bg-white border-t border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            {/* Icon & Message */}
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">
                  Your Privacy Rights (CCPA)
                </h3>
                <p className="text-[11px] sm:text-sm text-gray-600 leading-snug sm:leading-relaxed">
                  We use cookies for analytics and personalization. You can opt-out of data sales.{" "}
                  <a 
                    href="/ccpa-opt-out" 
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                    onClick={() => setShowBanner(false)}
                  >
                    Learn more
                  </a>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <button
                onClick={handleOptOut}
                className="flex-1 sm:flex-initial px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
                Do Not Sell
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-initial px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 whitespace-nowrap"
              >
                Accept
              </button>
              <button
                onClick={handleAccept}
                className="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

