"use client";

import { useState, useEffect } from 'react';
import { X, GraduationCap, Sparkles, ArrowRight, Gift, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocation } from "../context/LocationContext";
import { formatPrice, getEffectivePricing } from "../lib/globalPricing";

const FresherDiscountPopup = ({
  isOpen,
  onClose,
  fresherData = null,
  source = 'upload-resume'
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { currency } = useLocation();
  const pricing = getEffectivePricing(currency);

  // Calculate discounted price (50% off monthly)
  const originalPrice = pricing.monthly;
  const discountedPrice = Math.round(originalPrice * 0.5);

  // Don't render if not open or no fresher data
  if (!isOpen || !fresherData?.isFresher) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FRESHER50');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToCheckout = () => {
    // Store fresher status in localStorage for checkout validation
    localStorage.setItem('userFresherStatus', JSON.stringify({
      isFresher: true,
      analysis: fresherData.fresherAnalysis,
      detectedAt: new Date().toISOString(),
      source: source,
      couponCode: 'FRESHER50'
    }));

    // Store checkout intent with FRESHER50 coupon information
    localStorage.setItem('checkoutIntent', JSON.stringify({
      billingCycle: 'basic',
      source: 'fresher-discount-popup',
      couponCode: 'FRESHER50',
      fresherSource: source
    }));

    // Store message in sessionStorage for login page
    sessionStorage.setItem('loginMessage', 'Please login to securely claim your FRESHER50 discount and continue with your purchase');

    // Navigate to login instead of checkout
    router.push('/login');
    handleClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-white rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} flex flex-col max-h-[90vh] sm:max-h-[85vh]`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full mb-3 sm:mb-4">
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">🎓 Fresh Graduate Detected!</h2>
            <p className="text-green-100 text-xs sm:text-sm">
              Congratulations on your recent graduation!
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* AI Analysis */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-100">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">AI Analysis</h3>
                <p className="text-blue-700 text-xs sm:text-sm">
                  {fresherData.fresherAnalysis || "Detected as fresh graduate based on resume analysis"}
                </p>
              </div>
            </div>
          </div>

          {/* Special Offer */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">EXCLUSIVE FRESHER OFFER</span>
              <span className="xs:hidden">FRESHER OFFER</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Get 50% OFF Premium!
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
              Special discount for fresh graduates to kickstart their career
            </p>

            {/* Coupon Code */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-gray-600 mb-1">COUPON CODE</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">FRESHER50</p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                >
                  {copied ? (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Copied!</span>
                    </div>
                  ) : (
                    'Copy Code'
                  )}
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="text-center">
                <p className="text-base sm:text-lg text-gray-500 line-through">{formatPrice(originalPrice, currency)}</p>
                <p className="text-xs text-gray-600">Regular Price</p>
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-600">{formatPrice(discountedPrice, currency)}</p>
                <p className="text-xs text-gray-600">Fresher Price</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mb-4">
            * Offer valid for fresh graduates only. Cannot be combined with other offers.
          </p>
        </div>

        {/* Sticky Action Buttons */}
        <div className="flex-shrink-0 p-4 sm:p-6 pt-0 border-t border-gray-100 bg-white rounded-b-xl sm:rounded-b-2xl">
          <div className="space-y-3">
            <button
              onClick={handleGoToCheckout}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 sm:py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <span>Claim 50% Discount</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleClose}
              className="w-full text-gray-600 py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FresherDiscountPopup;
