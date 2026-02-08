"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Global component to capture referral codes from URL
 * Place this in the root layout to ensure it runs on every page
 */
export default function ReferralCodeCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's a ref parameter in the URL
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      console.log('[Referral Capture] Found referral code in URL:', refCode);
      
      // Store in both sessionStorage and localStorage for redundancy
      sessionStorage.setItem('pendingReferralCode', refCode.toUpperCase());
      localStorage.setItem('pendingReferralCode', refCode.toUpperCase());
      
      // Store timestamp to expire after 7 days
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('pendingReferralCodeExpiry', expiryTime.toString());
      
      console.log('[Referral Capture] Stored referral code for future signup');
    }
  }, [searchParams]);

  // This component doesn't render anything
  return null;
}

