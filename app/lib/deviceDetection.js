"use client";

/**
 * Device detection utility to identify Android users
 * Returns true only for Android devices, false for iOS and desktop
 */
export const isAndroidUser = () => {
  if (typeof window === 'undefined') {
    return false; // Server-side rendering fallback
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Check if it's an Android device
  const isAndroid = /android/i.test(userAgent);
  
  // Check if it's iOS
  const isIOS = /iphone|ipad|ipod/i.test(userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Check if it's desktop (not mobile/tablet)
  const isDesktop = !isAndroid && !isIOS && window.innerWidth >= 1024;
  
  // Return true only for Android users
  return isAndroid && !isDesktop;
};

/**
 * Check if user is on iOS device
 */
export const isIOSUser = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/i.test(userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Check if user is on desktop
 */
export const isDesktopUser = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const isAndroid = /android/i.test(window.navigator.userAgent.toLowerCase());
  const isIOS = isIOSUser();
  
  return !isAndroid && !isIOS && window.innerWidth >= 1024;
};

/**
 * Hook to detect Android users with state management
 */
import { useState, useEffect } from 'react';

export const useIsAndroidUser = () => {
  const [isAndroid, setIsAndroid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      setIsAndroid(isAndroidUser());
      setIsLoading(false);
    };

    checkDevice();
    
    // Re-check on resize
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return { isAndroid, isLoading };
};
