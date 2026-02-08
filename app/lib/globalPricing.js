// Global Pricing Configuration with Multi-Currency Support
// Stripe-powered payment processing for US market
import { PLAN_CONFIG, DISCOUNT_CONFIG, ADDON_CONFIG } from './planConfig';

// Supported currencies (Stripe supports 135+ currencies)
const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', country: 'United States' },
  INR: { symbol: '₹', name: 'US Rupee', country: 'India' },
};

// PPP-based pricing multipliers (relative to INR)
const PPP_MULTIPLIERS = {
  INR: 1.0,      // Base currency (India)
  USD: 0.15,     // US pricing - more affordable
};

// Base prices in INR (our reference currency) - NEW PRICING STRUCTURE
// Now driven from centralized configuration
const BASE_PRICES_INR = {
  oneDay: PLAN_CONFIG.oneDay.price.INR,       // ₹49
  basic: PLAN_CONFIG.basic.price.INR,         // ₹49 (Sachet Pack)
  monthly: PLAN_CONFIG.monthly.price.INR,     // ₹499 (Job Seeker Choice)
  quarterly: PLAN_CONFIG.quarterly.price.INR, // ₹699 (Career Growth)
  sixMonth: PLAN_CONFIG.sixMonth.price.INR,   // ₹899 (Complete Success)
  profile_slot: ADDON_CONFIG.profile_slot.price.INR, // ₹299 (Lifetime)
  trial: 0            // Free trial
};

// Enterprise base prices in INR
const ENTERPRISE_BASE_PRICES_INR = {
  starter: {
    monthly: 249900,  // ₹2,499
    yearly: 2499900   // ₹24,999
  },
  business: {
    monthly: 499900,  // ₹4,999
    yearly: 4999900   // ₹49,999
  },
  enterprise: {
    monthly: 999900,  // ₹9,999
    yearly: 9999900   // ₹99,999
  }
};

// Calculate prices for all currencies
const calculateGlobalPrices = () => {
  const globalPrices = {};

  Object.keys(SUPPORTED_CURRENCIES).forEach(currency => {
    const multiplier = PPP_MULTIPLIERS[currency];
    globalPrices[currency] = {};

    Object.keys(BASE_PRICES_INR).forEach(plan => {
      const basePrice = BASE_PRICES_INR[plan];
      // Apply PPP multiplier for more affordable international pricing
      const pppPrice = basePrice * multiplier;
      // Round to nearest whole number to avoid decimals
      const finalPrice = Math.round(pppPrice);

      globalPrices[currency][plan] = finalPrice;
    });
  });

  return globalPrices;
};

// Calculate enterprise prices for all currencies
const calculateEnterprisePrices = () => {
  const enterprisePrices = {};

  Object.keys(SUPPORTED_CURRENCIES).forEach(currency => {
    const multiplier = PPP_MULTIPLIERS[currency];
    enterprisePrices[currency] = {};

    Object.keys(ENTERPRISE_BASE_PRICES_INR).forEach(plan => {
      enterprisePrices[currency][plan] = {};

      Object.keys(ENTERPRISE_BASE_PRICES_INR[plan]).forEach(billingCycle => {
        const basePrice = ENTERPRISE_BASE_PRICES_INR[plan][billingCycle];
        // Apply PPP multiplier for more affordable international pricing
        const pppPrice = basePrice * multiplier;
        // Round to nearest whole number to avoid decimals
        const finalPrice = Math.round(pppPrice);

        enterprisePrices[currency][plan][billingCycle] = finalPrice;
      });
    });
  });

  return enterprisePrices;
};

// Generate all pricing data
const GLOBAL_PRICES = calculateGlobalPrices();
// Override USD prices to use original prices from PLAN_CONFIG for discount display
// These are the original prices before 10% discount is applied
GLOBAL_PRICES.USD.oneDay = PLAN_CONFIG.oneDay.price.USD;      // $5.99 (original price, 10% discount will be applied)
GLOBAL_PRICES.USD.basic = PLAN_CONFIG.basic.price.USD;        // $13.99 (original price, 10% discount will be applied)
GLOBAL_PRICES.USD.monthly = PLAN_CONFIG.monthly.price.USD;    // $24.99 (original price, 10% discount will be applied)
GLOBAL_PRICES.USD.quarterly = PLAN_CONFIG.quarterly.price.USD;  // $44.99 (original price, 10% discount will be applied)
GLOBAL_PRICES.USD.sixMonth = PLAN_CONFIG.sixMonth.price.USD;  // $59.99 (original price, 10% discount will be applied)
GLOBAL_PRICES.USD.profile_slot = ADDON_CONFIG.profile_slot.price.USD; // $4.99
const ENTERPRISE_PRICES = calculateEnterprisePrices();

// Get pricing configuration for a specific currency
export const getPricingConfigByCurrency = (currency = 'INR') => {
  const supportedCurrency = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES['INR'];
  const prices = GLOBAL_PRICES[currency] || GLOBAL_PRICES['INR'];

  return {
    currency: currency,
    symbol: supportedCurrency.symbol,
    name: supportedCurrency.name,
    country: supportedCurrency.country,
    prices: prices,
    // Plan definitions - now driven from centralized configuration
    plans: {
      oneDay: {
        name: PLAN_CONFIG.oneDay.name,
        originalPrice: prices.oneDay / 100, // Convert to display units
        anchorPrice: PLAN_CONFIG.oneDay.anchorPrice[currency] / 100 || (prices.oneDay / 100),
        duration: PLAN_CONFIG.oneDay.duration,
        planType: PLAN_CONFIG.oneDay.planType,
        features: PLAN_CONFIG.oneDay.features
      },
      basic: {
        name: PLAN_CONFIG.basic.name,
        originalPrice: prices.basic / 100, // Convert to display units
        anchorPrice: PLAN_CONFIG.basic.anchorPrice[currency] / 100 || (prices.basic / 100),
        duration: PLAN_CONFIG.basic.duration,
        planType: PLAN_CONFIG.basic.planType,
        features: PLAN_CONFIG.basic.features
      },
      monthly: {
        name: PLAN_CONFIG.monthly.name,
        originalPrice: prices.monthly / 100,
        anchorPrice: PLAN_CONFIG.monthly.anchorPrice[currency] / 100 || (prices.monthly / 100),
        duration: PLAN_CONFIG.monthly.duration,
        planType: PLAN_CONFIG.monthly.planType,
        features: PLAN_CONFIG.monthly.features
      },
      quarterly: {
        name: PLAN_CONFIG.quarterly.name,
        originalPrice: prices.quarterly / 100,
        anchorPrice: PLAN_CONFIG.quarterly.anchorPrice[currency] / 100 || (prices.quarterly / 100),
        duration: PLAN_CONFIG.quarterly.duration,
        planType: PLAN_CONFIG.quarterly.planType,
        features: PLAN_CONFIG.quarterly.features
      },
      sixMonth: {
        name: PLAN_CONFIG.sixMonth.name,
        originalPrice: prices.sixMonth / 100,
        anchorPrice: PLAN_CONFIG.sixMonth.anchorPrice[currency] / 100 || (prices.sixMonth / 100),
        duration: PLAN_CONFIG.sixMonth.duration,
        planType: PLAN_CONFIG.sixMonth.planType,
        features: PLAN_CONFIG.sixMonth.features
      },
      profile_slot: {
        name: ADDON_CONFIG.profile_slot.name,
        originalPrice: prices.profile_slot / 100,
        duration: ADDON_CONFIG.profile_slot.duration,
        planType: "Add-on",
        features: ADDON_CONFIG.profile_slot.features
      }
    }
  };
};

// Get all supported currencies
export const getSupportedCurrencies = () => SUPPORTED_CURRENCIES;

// Get pricing for a specific plan and currency
export const getPlanPrice = (plan, currency = 'INR') => {
  const config = getPricingConfigByCurrency(currency);
  return config.prices[plan] || 0;
};

// Get all pricing for a specific currency (main function used by components)
export const getPricing = (currency = 'INR') => {
  const prices = GLOBAL_PRICES[currency] || GLOBAL_PRICES['INR'];
  return prices;
};

// Get currency multiplier for PPP calculations
export const getCurrencyMultiplier = (currency = 'INR') => {
  return PPP_MULTIPLIERS[currency] || PPP_MULTIPLIERS['INR'];
};

// Format price for display
export const formatPrice = (price, currency = 'INR') => {
  const config = getPricingConfigByCurrency(currency);
  const symbol = config.symbol;

  // Convert from smallest unit (paise/cents) to display unit
  const displayPrice = price / 100;

  // Format based on currency - always show whole numbers
  if (currency === 'INR') {
    return `${symbol}${Math.round(displayPrice).toLocaleString('en-IN')}`;
  } else if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
    return `${symbol}${Math.round(displayPrice)}`;
  } else {
    return `${symbol}${Math.round(displayPrice).toLocaleString()}`;
  }
};

// Get payment provider based on country/currency
export const getPaymentProviderByCurrency = (currency = 'USD') => {
  // Stripe handles all currencies
  return 'stripe';
};

// Get discount amount for a plan
export const getDiscountAmount = (plan, currency = 'INR', discountPercentage = 0) => {
  const price = getPlanPrice(plan, currency);
  return Math.round(price * discountPercentage);
};

// Get final price after discount
export const getFinalPrice = (plan, currency = 'INR', discountPercentage = 0) => {
  const price = getPlanPrice(plan, currency);
  const discount = getDiscountAmount(plan, currency, discountPercentage);
  return price - discount;
};

// Get enterprise pricing for a specific currency
export function getEnterprisePricing(currency = 'INR') {
  const enterprisePrices = ENTERPRISE_PRICES[currency] || ENTERPRISE_PRICES['INR'];

  return {
    starter: {
      name: "Starter Pro",
      monthlyPrice: enterprisePrices.starter.monthly,
      yearlyPrice: enterprisePrices.starter.yearly,
    },
    business: {
      name: "Business Pro",
      monthlyPrice: enterprisePrices.business.monthly,
      yearlyPrice: enterprisePrices.business.yearly,
    },
    enterprise: {
      name: "Enterprise Pro",
      monthlyPrice: enterprisePrices.enterprise.monthly,
      yearlyPrice: enterprisePrices.enterprise.yearly,
    }
  };
}

// Returns effective pricing for the current user/device/country
// No device bias - consistent pricing across all devices
export function getEffectivePricing(currency = 'INR', isAndroidDevice = false) {
  if (currency === 'INR') {
    // Unified pricing for all devices - no bias
    return {
      oneDay: BASE_PRICES_INR.oneDay,      // ₹49 (1 day, 3 downloads)
      basic: BASE_PRICES_INR.basic,        // ₹199 (7 days, 5 downloads)
      monthly: BASE_PRICES_INR.monthly,    // ₹499 (30 days, unlimited)
      quarterly: BASE_PRICES_INR.quarterly,  // ₹699 (90 days, unlimited)
      sixMonth: BASE_PRICES_INR.sixMonth,  // ₹899 (180 days, unlimited)
      profile_slot: BASE_PRICES_INR.profile_slot, // ₹299 (Lifetime)
      currency: 'INR',
    };
  } else {
    // USD pricing - consistent across all devices
    return {
      oneDay: GLOBAL_PRICES.USD.oneDay,      // $0.99 (1 day, 3 downloads)
      basic: GLOBAL_PRICES.USD.basic,        // $4.99 (7 days, 5 downloads)
      monthly: GLOBAL_PRICES.USD.monthly,    // $9.99 (30 days, unlimited)
      quarterly: GLOBAL_PRICES.USD.quarterly,  // $13.99 (90 days, unlimited)
      sixMonth: GLOBAL_PRICES.USD.sixMonth,  // $19.99 (180 days, unlimited)
      profile_slot: GLOBAL_PRICES.USD.profile_slot || 499, // $4.99
      currency: 'USD',
    };
  }
}

// Export all pricing data for components
export const GLOBAL_PRICING_DATA = {
  SUPPORTED_CURRENCIES,
  PPP_MULTIPLIERS,
  BASE_PRICES_INR,
  ENTERPRISE_BASE_PRICES_INR,
  GLOBAL_PRICES,
  ENTERPRISE_PRICES,
  getPricingConfigByCurrency,
  getSupportedCurrencies,
  getPlanPrice,
  getPricing,
  getCurrencyMultiplier,
  formatPrice,
  getPaymentProviderByCurrency,
  getDiscountAmount,
  getFinalPrice,
  getEnterprisePricing
};

export default GLOBAL_PRICING_DATA; 