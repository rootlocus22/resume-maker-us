'use client';

import React, { useState } from 'react';
import { XCircle, Sparkles, AlertCircle, Copy, CheckCircle } from 'lucide-react';

const CouponField = ({ 
  couponCode, 
  setCouponCode, 
  onApplyCoupon, 
  onRemoveCoupon, 
  appliedCoupon,
  billingCycle,
  orderId,
  userId,
  errorMessage,
  setErrorMessage
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleApply = async () => {
    if (!couponCode.trim()) {
      setErrorMessage('Please enter a coupon code');
      return;
    }
    
    setIsValidating(true);
    try {
      await onApplyCoupon();
      if (!errorMessage) {
        setShowSuccess(true);
        setShowConfetti(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleCopyCode = async () => {
    if (appliedCoupon?.code) {
      await navigator.clipboard.writeText(appliedCoupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setCouponCode('');
    setErrorMessage('');
    onRemoveCoupon();
  };

  // Simple confetti particles
  const ConfettiParticles = () => {
    if (!showConfetti) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          >
            <div className={`w-2 h-2 rounded-full ${
              ['bg-yellow-400', 'bg-red-400', 'bg-accent-400', 'bg-green-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]
            }`} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Simple Promotional Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-lg">Special Offer!</span>
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-sm">Use code <span className="font-mono font-bold bg-white text-orange-600 px-2 py-1 rounded">SAVE10</span> for 10% OFF!</p>
      </div>

      {/* Simple Coupon Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Have a coupon code?
        </label>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code (e.g., SAVE10)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isValidating}
          />
          <button
            onClick={handleApply}
            disabled={!couponCode.trim() || isValidating}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? 'Applying...' : 'Apply'}
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Reset Button */}
        {couponCode && (
          <button
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Applied Coupon Display with Animation */}
      {appliedCoupon && (
        <div className={`relative overflow-hidden rounded-lg border-2 border-green-200 bg-green-50 p-4 transition-all duration-500 ${
          showSuccess ? 'scale-105 shadow-lg' : 'scale-100'
        }`}>
          {/* Confetti Animation */}
          <ConfettiParticles />
          
          {/* Success Animation Overlay */}
          {showSuccess && (
            <div className="absolute inset-0 bg-green-100 opacity-50 animate-pulse rounded-lg"></div>
          )}
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {showSuccess ? '✓' : '🎫'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-lg text-green-800">{appliedCoupon.code}</span>
                  <span className="text-sm text-green-600">• {appliedCoupon.discount * 100}% OFF</span>
                </div>
                <p className="text-sm text-green-600">
                  {showSuccess ? 'Coupon applied successfully!' : 'Discount applied to your order'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-green-200 rounded-full transition-colors"
                title="Copy code"
              >
                <Copy className="w-4 h-4 text-green-600" />
              </button>
              <button
                onClick={onRemoveCoupon}
                className="p-2 hover:bg-green-200 rounded-full transition-colors"
                title="Remove coupon"
              >
                <XCircle className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </div>
          
          {copied && (
            <div className="mt-2 text-center text-sm bg-green-200 text-green-800 rounded px-2 py-1">
              Code copied to clipboard! 📋
            </div>
          )}
        </div>
      )}

      {/* Quick Apply Buttons */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Quick apply:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCouponCode('SAVE10')}
            className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            SAVE10
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponField;

