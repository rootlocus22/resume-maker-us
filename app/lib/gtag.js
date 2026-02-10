// lib/gtag.js

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID_US || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-17942761054";

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

// US pricing tiers for signal engineering – clear value bands for Google Ads optimization
export const USD_PRICE_TIERS = { basic: 14, monthly: 25, quarterly: 45, sixMonth: 60 };

// Hash email for enhanced conversions (SHA256)
async function hashEmail(email) {
  if (!email || typeof crypto?.subtle === "undefined") return null;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}

// Google Ads conversion with full signal engineering for better value-based bidding
export const trackGoogleAdsConversion = async ({
  conversionLabel,
  value,
  currency = "USD",
  transactionId,
  billingCycle,
  allowEnhancedConversions = true,
  customerEmail,
}) => {
  if (typeof window === "undefined" || !window.gtag || !conversionLabel) return;
  const numValue = Number(value);
  const safeValue = numValue > 0 ? numValue : 1;

  if (allowEnhancedConversions && customerEmail) {
    const hashedEmail = await hashEmail(customerEmail);
    if (hashedEmail) {
      window.gtag("set", "user_data", { sha256_email_address: hashedEmail });
    }
  }

  const conversionPayload = {
    send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
    value: safeValue,
    currency,
    transaction_id: transactionId || undefined,
  };

  if (billingCycle) {
    conversionPayload.aw_plan_tier = billingCycle;
    const tierValue = USD_PRICE_TIERS[billingCycle];
    if (tierValue) conversionPayload.aw_value_band = tierValue;
  }

  window.gtag("event", "conversion", conversionPayload);
};

