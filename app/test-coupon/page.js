'use client';

import React, { useState } from 'react';
import CouponField from '../components/CouponField';

export default function TestCouponPage() {
  const [couponCode, setCouponCode] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Simple coupon validation for testing
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Check for SAVE10 coupon
    if (couponCode.toUpperCase() === 'SAVE10') {
      setCouponError('');
      setSelectedDiscount(0.10);
      setAppliedCoupon({
        code: 'SAVE10',
        discount: 0.10
      });
      return;
    }

    setCouponError('Invalid coupon code');
    setSelectedDiscount(0);
    setAppliedCoupon(null);
  };

  const handleCouponRemoved = () => {
    setSelectedDiscount(0);
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🎫 Coupon Test Page
          </h1>
          
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">
              Test the simplified coupon system with the <strong>SAVE10</strong> coupon
            </p>
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
              <p className="text-orange-800 font-medium">
                💡 Try entering: <code className="bg-orange-200 px-2 py-1 rounded">SAVE10</code>
              </p>
            </div>
          </div>

          {/* Coupon Field Component */}
          <CouponField
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            onApplyCoupon={validateCoupon}
            onRemoveCoupon={handleCouponRemoved}
            appliedCoupon={appliedCoupon}
            billingCycle="monthly"
            orderId={null}
            userId="test-user"
            errorMessage={couponError}
            setErrorMessage={setCouponError}
          />

          {/* Test Results */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Test Results:</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Coupon Code:</strong> {couponCode || 'None'}</div>
              <div><strong>Discount Applied:</strong> {selectedDiscount > 0 ? `${selectedDiscount * 100}%` : 'None'}</div>
              <div><strong>Error:</strong> {couponError || 'None'}</div>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">🧪 Test Instructions:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Enter <code className="bg-blue-200 px-1 rounded">SAVE10</code> for 10% discount</li>
              <li>• Enter any invalid code to test error handling</li>
              <li>• Use the quick apply button for convenience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
