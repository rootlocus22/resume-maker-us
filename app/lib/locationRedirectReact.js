// React-based location redirection utility for ExpertResume
// Redirects users to ExpertResume if they're outside India or coming from specific referral URLs
import { useState, useEffect } from 'react';

const DEFAULT_EXPERT_RESUME_URL = "https://www.expertresume.us/?referralCode=RANJAN10";

// Function to get the target URL with referral parameter
const getTargetUrl = () => {
  if (typeof window === "undefined") return "https://www.expertresume.us/";
  
  const urlParams = new URLSearchParams(window.location.search);
  const referralParam = urlParams.get('referral');
  
  if (referralParam) {
    return `https://www.expertresume.us/?referral=${referralParam}`;
  }
  
  return "https://www.expertresume.us/";
};

// Check if current URL has referral parameter
export const isReferralUrl = () => {
  if (typeof window === "undefined") return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('referral');
};

// Check if user is outside India based on IP
export const checkLocationAndRedirect = async () => {
  try {
    console.log('Starting location check...');
    
    // Try multiple IP geolocation services as fallback
    const ipServices = [
      "https://ipapi.co/json/",
      "https://ipinfo.io/json",
      "https://api.ipify.org?format=json"
    ];
    
    let countryCode = "IN"; // Default to India
    let locationData = null;
    
    for (const serviceUrl of ipServices) {
      try {
        console.log(`Trying IP service: ${serviceUrl}`);
        
        const response = await fetch(serviceUrl, {
          method: "GET",
          headers: { 
            "User-Agent": "ExpertResume/1.0",
            "Accept": "application/json"
          },
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (!response.ok) {
          console.warn(`IP service ${serviceUrl} failed with status: ${response.status}`);
          continue;
        }

        locationData = await response.json();
        
        // Extract country code based on service response format
        if (serviceUrl.includes('ipapi.co')) {
          countryCode = locationData.country_code || "IN";
        } else if (serviceUrl.includes('ipinfo.io')) {
          countryCode = locationData.country || "IN";
        } else if (serviceUrl.includes('ipify.org')) {
          // ipify only provides IP, not location data
          continue;
        }
        
        console.log('Successfully detected country code:', countryCode);
        break; // Success, exit the loop
        
      } catch (serviceError) {
        console.warn(`IP service ${serviceUrl} failed:`, serviceError);
        continue; // Try next service
      }
    }
    
    // If all services failed, check browser language as fallback
    if (countryCode === "IN" && typeof window !== "undefined") {
      const browserLanguage = navigator.language || navigator.userLanguage;
      if (browserLanguage && !browserLanguage.startsWith('en-IN') && !browserLanguage.startsWith('hi-IN')) {
        console.log('Using browser language fallback:', browserLanguage);
        // This is a very rough heuristic - only redirect for obvious non-US languages
        const nonUSLanguages = ['en-US', 'en-GB', 'en-CA', 'en-AU', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
        if (nonUSLanguages.some(lang => browserLanguage.startsWith(lang))) {
          countryCode = "XX"; // Force redirect for obvious non-US users
        }
      }
    }
    
    // If user is outside India, redirect to ExpertResume
    if (countryCode !== "IN") {
      console.log('User is outside India, should redirect');
      return {
        shouldRedirect: true,
        message: "We're redirecting you to our international platform for better service in your region.",
        delay: 3000
      };
    }

    // Also check if user has referral parameter (for users in India with referral)
    if (isReferralUrl()) {
      console.log('User is coming from referral URL, should redirect');
      return {
        shouldRedirect: true,
        message: "You're being redirected to our international platform for better service.",
        delay: 2000
      };
    }

    return { shouldRedirect: false };
  } catch (error) {
    console.error("Location check error:", error);
    // On error, don't redirect - let user continue with the site
    return { shouldRedirect: false };
  }
};

// Hook for location-based redirect
export const useLocationRedirect = () => {
  const [showModal, setShowModal] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");
  const [hasChecked, setHasChecked] = useState(false);

  const handleRedirect = () => {
    const targetUrl = getTargetUrl();
    console.log('Redirecting to:', targetUrl);
    // Force redirect with replace to prevent back button
    window.location.replace(targetUrl);
  };

  // Immediate redirect without modal (for testing)
  const forceRedirect = () => {
    const targetUrl = getTargetUrl();
    console.log('Force redirecting to:', targetUrl);
    window.location.replace(targetUrl);
  };

  useEffect(() => {
    // Only run once and only on client side
    if (typeof window === "undefined" || hasChecked) return;

    // Skip location check in certain contexts
    const skipLocationCheck = () => {
      // Skip in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Skipping location check in development mode');
        return true;
      }
      
      // Skip in browser extensions
      if (window.location.protocol === 'chrome-extension:' || 
          window.location.protocol === 'moz-extension:' ||
          window.location.protocol === 'safari-extension:') {
        console.log('Skipping location check in browser extension context');
        return true;
      }
      
      // Skip if already redirected recently
      if (sessionStorage.getItem('locationRedirectChecked')) {
        console.log('Location check already performed in this session');
        return true;
      }
      
      return false;
    };

    if (skipLocationCheck()) {
      setHasChecked(true);
      return;
    }

    // Mark as checked to prevent multiple checks on same page load
    setHasChecked(true);
    sessionStorage.setItem('locationRedirectChecked', 'true');

    // Run the check
    const performCheck = async () => {
      console.log('Performing location check...');
      const result = await checkLocationAndRedirect();
      console.log('Location check result:', result);
      
      if (result.shouldRedirect) {
        console.log('Should redirect, showing modal with message:', result.message);
        setRedirectMessage(result.message);
        setShowModal(true);
        console.log('Modal state set to true');
      } else {
        console.log('No redirect needed');
      }
    };

    performCheck();
  }, [hasChecked]);

  return {
    showModal,
    redirectMessage,
    handleRedirect,
    forceRedirect
  };
};

// Export the main function for use in components
export default {
  checkLocationAndRedirect,
  useLocationRedirect,
  isReferralUrl
}; 