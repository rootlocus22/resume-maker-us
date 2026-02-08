/**
 * US App (ExpertResume) config – single source for brand, URLs, and analytics.
 * Use env vars for analytics/ads so you can change without code edits.
 */
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://expertresume.us";
const BRAND_NAME = "ExpertResume";
const BRAND_TAGLINE = "AI Job Application System – Get past ATS. Get more interviews.";

// Analytics & ads – set in .env for US property
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID_US || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID_US || process.env.NEXT_PUBLIC_CLARITY_ID || "";
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID_US || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "";

// Payments – US app uses Stripe only
const USE_STRIPE = true;
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// Company (US product launched via Vendax Systems LLC)
const COMPANY_NAME = "Vendax Systems LLC";
const SUPPORT_EMAIL = "support@vendaxsystemlabs.com";
const COMPANY_ADDRESS = "28 Geary St STE 650 Suite #500, San Francisco, California 94108, United States";
const COMPANY_URL = "https://vendaxsystemlabs.com";

export {
  BASE_URL,
  BRAND_NAME,
  BRAND_TAGLINE,
  GA_MEASUREMENT_ID,
  CLARITY_ID,
  GOOGLE_ADS_ID,
  USE_STRIPE,
  STRIPE_PUBLISHABLE_KEY,
  COMPANY_NAME,
  SUPPORT_EMAIL,
  COMPANY_ADDRESS,
  COMPANY_URL,
};
