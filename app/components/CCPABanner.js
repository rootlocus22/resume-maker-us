'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Cookie } from 'lucide-react';

export default function CCPABanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isUS, setIsUS] = useState(false);

  useEffect(() => {
    // Only run client-side after mount (no SSR)
    if (typeof window === 'undefined') return;

    // Check if we're on .com domain (US)
    const isUSVersion = window.location.hostname.includes('expertresume.com');
    setIsUS(isUSVersion);

    // Only show for US domain
    if (!isUSVersion) return;

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
      
      {/* Banner content */}
      <div className="relative bg-white border-t border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon & Message */}
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-0.5">
                <Cookie className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Your Privacy Rights (CCPA)
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We use cookies and similar technologies to analyze site traffic, personalize content, and provide social media features. 
                  You have the right to opt-out of the sale of your personal information. 
                  <a 
                    href="/ccpa-opt-out" 
                    className="text-blue-600 hover:text-blue-700 font-medium ml-1 underline"
                    onClick={() => setShowBanner(false)}
                  >
                    Learn more about your privacy rights
                  </a>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={handleOptOut}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 whitespace-nowrap"
              >
                <Shield className="w-4 h-4 inline mr-1.5" />
                Do Not Sell My Info
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 whitespace-nowrap"
              >
                Accept
              </button>
              <button
                onClick={handleAccept}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
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

