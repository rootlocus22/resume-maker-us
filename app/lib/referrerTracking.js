// lib/referrerTracking.js
// Comprehensive referrer tracking utility

/**
 * Get the source/medium from referrer URL
 * @param {string} referrer - Document referrer
 * @param {URLSearchParams} urlParams - URL search parameters
 * @returns {object} - Source, medium, campaign, and other UTM parameters
 */
export const parseReferrer = (referrer, urlParams) => {
  const referrerData = {
    source: 'direct',
    medium: 'none',
    campaign: null,
    term: null,
    content: null,
    referrerUrl: referrer || 'direct',
    landingPage: typeof window !== 'undefined' ? window.location.href : null,
    timestamp: new Date().toISOString(),
  };

  // Check for UTM parameters first (highest priority)
  if (urlParams) {
    if (urlParams.get('utm_source')) {
      referrerData.source = urlParams.get('utm_source');
      referrerData.medium = urlParams.get('utm_medium') || 'unknown';
      referrerData.campaign = urlParams.get('utm_campaign');
      referrerData.term = urlParams.get('utm_term');
      referrerData.content = urlParams.get('utm_content');
      return referrerData;
    }

    // Check for Google Ads click ID (gclid)
    if (urlParams.get('gclid')) {
      referrerData.source = 'google';
      referrerData.medium = 'cpc';
      referrerData.campaign = urlParams.get('utm_campaign') || 'google_ads';
      referrerData.gclid = urlParams.get('gclid');
      return referrerData;
    }

    // Check for Facebook click ID (fbclid)
    if (urlParams.get('fbclid')) {
      referrerData.source = 'facebook';
      referrerData.medium = 'cpc';
      referrerData.campaign = urlParams.get('utm_campaign') || 'facebook_ads';
      referrerData.fbclid = urlParams.get('fbclid');
      return referrerData;
    }
  }

  // If no UTM parameters, parse the referrer URL
  if (referrer && referrer !== '') {
    try {
      const referrerUrl = new URL(referrer);
      const referrerHostname = referrerUrl.hostname.toLowerCase();

      // Check if it's from our own domain
      if (referrerHostname.includes('expertresume.us') || referrerHostname.includes('expertresume.com')) {
        referrerData.source = 'expertresume';
        referrerData.medium = 'internal';
        return referrerData;
      }

      // Google Search (organic)
      if (referrerHostname.includes('google.')) {
        referrerData.source = 'google';
        referrerData.medium = 'organic';
        // Try to extract search query if available
        const query = referrerUrl.searchParams.get('q');
        if (query) {
          referrerData.term = query;
        }
        return referrerData;
      }

      // Bing Search
      if (referrerHostname.includes('bing.')) {
        referrerData.source = 'bing';
        referrerData.medium = 'organic';
        const query = referrerUrl.searchParams.get('q');
        if (query) {
          referrerData.term = query;
        }
        return referrerData;
      }

      // Yahoo Search
      if (referrerHostname.includes('yahoo.')) {
        referrerData.source = 'yahoo';
        referrerData.medium = 'organic';
        const query = referrerUrl.searchParams.get('p');
        if (query) {
          referrerData.term = query;
        }
        return referrerData;
      }

      // Social Media
      if (referrerHostname.includes('facebook.') || referrerHostname.includes('fb.')) {
        referrerData.source = 'facebook';
        referrerData.medium = 'social';
        return referrerData;
      }

      if (referrerHostname.includes('twitter.') || referrerHostname.includes('t.co')) {
        referrerData.source = 'twitter';
        referrerData.medium = 'social';
        return referrerData;
      }

      if (referrerHostname.includes('linkedin.')) {
        referrerData.source = 'linkedin';
        referrerData.medium = 'social';
        return referrerData;
      }

      if (referrerHostname.includes('instagram.')) {
        referrerData.source = 'instagram';
        referrerData.medium = 'social';
        return referrerData;
      }

      if (referrerHostname.includes('youtube.') || referrerHostname.includes('youtu.be')) {
        referrerData.source = 'youtube';
        referrerData.medium = 'social';
        return referrerData;
      }

      if (referrerHostname.includes('whatsapp.')) {
        referrerData.source = 'whatsapp';
        referrerData.medium = 'social';
        return referrerData;
      }

      if (referrerHostname.includes('reddit.')) {
        referrerData.source = 'reddit';
        referrerData.medium = 'social';
        return referrerData;
      }

      if (referrerHostname.includes('quora.')) {
        referrerData.source = 'quora';
        referrerData.medium = 'social';
        return referrerData;
      }

      // Other referrers
      referrerData.source = referrerHostname;
      referrerData.medium = 'referral';
      return referrerData;

    } catch (error) {
      console.error('Error parsing referrer:', error);
    }
  }

  // If we reach here, it's a direct visit
  return referrerData;
};

/**
 * Store referrer data in localStorage
 * Only stores if it's the first visit or if the source has changed
 */
export const trackReferrer = () => {
  if (typeof window === 'undefined') return null;

  const STORAGE_KEY = 'expertresume_referrer';
  const SESSION_KEY = 'expertresume_session_start';

  // Check if this is a new session (more than 30 minutes since last activity)
  const lastSession = localStorage.getItem(SESSION_KEY);
  const now = Date.now();
  const isNewSession = !lastSession || (now - parseInt(lastSession)) > 30 * 60 * 1000;

  // Update session timestamp
  localStorage.setItem(SESSION_KEY, now.toString());

  // Get existing referrer data
  const existingData = localStorage.getItem(STORAGE_KEY);
  let shouldUpdate = false;

  // Parse current referrer
  const urlParams = new URLSearchParams(window.location.search);
  const currentReferrer = parseReferrer(document.referrer, urlParams);

  if (!existingData) {
    // First time visitor
    shouldUpdate = true;
  } else if (isNewSession) {
    // New session - check if referrer has changed
    const stored = JSON.parse(existingData);
    
    // Update if:
    // 1. Source has changed
    // 2. New UTM parameters are present
    // 3. Previous source was direct and now we have a real source
    if (
      stored.source !== currentReferrer.source ||
      (currentReferrer.campaign && currentReferrer.campaign !== stored.campaign) ||
      (stored.source === 'direct' && currentReferrer.source !== 'direct')
    ) {
      shouldUpdate = true;
    }
  }

  if (shouldUpdate) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentReferrer));
    console.log('📊 Referrer tracked:', currentReferrer);
    return currentReferrer;
  }

  return existingData ? JSON.parse(existingData) : currentReferrer;
};

/**
 * Get stored referrer data
 */
export const getReferrerData = () => {
  if (typeof window === 'undefined') return null;
  
  const STORAGE_KEY = 'expertresume_referrer';
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing stored referrer:', error);
      return null;
    }
  }
  
  return null;
};

/**
 * Get referrer summary for display
 */
export const getReferrerSummary = () => {
  const data = getReferrerData();
  if (!data) return 'Unknown';

  if (data.source === 'direct') {
    return 'Direct Visit';
  }

  if (data.medium === 'cpc') {
    return `${data.source.charAt(0).toUpperCase() + data.source.slice(1)} Ads${data.campaign ? ` (${data.campaign})` : ''}`;
  }

  if (data.medium === 'organic') {
    return `${data.source.charAt(0).toUpperCase() + data.source.slice(1)} Search${data.term ? ` - "${data.term}"` : ''}`;
  }

  if (data.medium === 'social') {
    return `${data.source.charAt(0).toUpperCase() + data.source.slice(1)} (Social)`;
  }

  if (data.medium === 'referral') {
    return `Referral from ${data.source}`;
  }

  if (data.medium === 'internal') {
    return 'Internal Navigation';
  }

  return `${data.source} (${data.medium})`;
};

/**
 * Clear referrer data (useful for testing or user logout)
 */
export const clearReferrerData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('expertresume_referrer');
  localStorage.removeItem('expertresume_session_start');
  console.log('🧹 Referrer data cleared');
};

