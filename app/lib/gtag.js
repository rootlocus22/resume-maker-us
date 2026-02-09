// lib/gtag.js

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID_US || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-17941472933";

// Brand prefix for all events — makes ExpertResume events
// instantly identifiable in GA4 alongside any other data streams
const EVENT_PREFIX = "expert_resume";

// Track pageviews
export const pageview = (url) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track specific events — all actions are auto-prefixed with "expert_resume_"
// so "hero_cta" becomes "expert_resume_hero_cta" in GA4
export const event = ({ action, category, label, value }) => {
  if (typeof window !== "undefined" && window.gtag) {
    const prefixedAction = action.startsWith(EVENT_PREFIX)
      ? action
      : `${EVENT_PREFIX}_${action}`;

    window.gtag("event", prefixedAction, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track events WITHOUT the prefix (for third-party or standard GA4 events)
export const rawEvent = ({ action, category, label, value }) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Google Ads conversion - use conversion action ID from env
// Set NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_PURCHASE / _WELCOME in .env after creating conversion actions in Google Ads
export const trackGoogleAdsConversion = ({ conversionLabel, value, currency = "USD", transactionId, allowEnhancedConversions = true }) => {
  if (typeof window === "undefined" || !window.gtag || !conversionLabel) return;
  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
    value,
    currency,
    transaction_id: transactionId,
    allow_enhanced_conversions: allowEnhancedConversions,
  });
};

