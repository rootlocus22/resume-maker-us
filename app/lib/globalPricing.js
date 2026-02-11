// Global Pricing - US product: USD only
import { PLAN_CONFIG, ADDON_CONFIG } from './planConfig';

export const SUPPORTED_CURRENCIES = { USD: { symbol: '$', name: 'US Dollar', country: 'United States' } };
export const getSupportedCurrencies = () => SUPPORTED_CURRENCIES;

const USD_PRICES = {
  oneDay: PLAN_CONFIG.oneDay.price.USD,
  basic: PLAN_CONFIG.basic.price.USD,
  monthly: PLAN_CONFIG.monthly.price.USD,
  quarterly: PLAN_CONFIG.quarterly.price.USD,
  sixMonth: PLAN_CONFIG.sixMonth.price.USD,
  profile_slot: ADDON_CONFIG.profile_slot.price.USD,
  trial: 0,
};

const ENTERPRISE_USD = {
  starter: { monthly: 2499, yearly: 24999 },
  business: { monthly: 4999, yearly: 49999 },
  enterprise: { monthly: 9999, yearly: 99999 },
};

export const getPricingConfigByCurrency = (_currency = 'USD') => ({
  currency: 'USD',
  symbol: '$',
  name: 'US Dollar',
  country: 'United States',
  prices: USD_PRICES,
  plans: {
    oneDay: {
      name: PLAN_CONFIG.oneDay.name,
      originalPrice: USD_PRICES.oneDay / 100,
      anchorPrice: (PLAN_CONFIG.oneDay.anchorPrice?.USD || USD_PRICES.oneDay) / 100,
      duration: PLAN_CONFIG.oneDay.duration,
      planType: PLAN_CONFIG.oneDay.planType,
      features: PLAN_CONFIG.oneDay.features,
    },
    basic: {
      name: PLAN_CONFIG.basic.name,
      originalPrice: USD_PRICES.basic / 100,
      anchorPrice: (PLAN_CONFIG.basic.anchorPrice?.USD || USD_PRICES.basic) / 100,
      duration: PLAN_CONFIG.basic.duration,
      planType: PLAN_CONFIG.basic.planType,
      features: PLAN_CONFIG.basic.features,
    },
    monthly: {
      name: PLAN_CONFIG.monthly.name,
      originalPrice: USD_PRICES.monthly / 100,
      anchorPrice: (PLAN_CONFIG.monthly.anchorPrice?.USD || USD_PRICES.monthly) / 100,
      duration: PLAN_CONFIG.monthly.duration,
      planType: PLAN_CONFIG.monthly.planType,
      features: PLAN_CONFIG.monthly.features,
    },
    quarterly: {
      name: PLAN_CONFIG.quarterly.name,
      originalPrice: USD_PRICES.quarterly / 100,
      anchorPrice: (PLAN_CONFIG.quarterly.anchorPrice?.USD || USD_PRICES.quarterly) / 100,
      duration: PLAN_CONFIG.quarterly.duration,
      planType: PLAN_CONFIG.quarterly.planType,
      features: PLAN_CONFIG.quarterly.features,
    },
    sixMonth: {
      name: PLAN_CONFIG.sixMonth.name,
      originalPrice: USD_PRICES.sixMonth / 100,
      anchorPrice: (PLAN_CONFIG.sixMonth.anchorPrice?.USD || USD_PRICES.sixMonth) / 100,
      duration: PLAN_CONFIG.sixMonth.duration,
      planType: PLAN_CONFIG.sixMonth.planType,
      features: PLAN_CONFIG.sixMonth.features,
    },
    profile_slot: {
      name: ADDON_CONFIG.profile_slot.name,
      originalPrice: USD_PRICES.profile_slot / 100,
      duration: ADDON_CONFIG.profile_slot.duration,
      planType: "Add-on",
      features: ADDON_CONFIG.profile_slot.features,
    },
  },
});

export const getPlanPrice = (plan, _currency = 'USD') => USD_PRICES[plan] ?? 0;

export const getPricing = (_currency = 'USD') => USD_PRICES;

export const formatPrice = (price, _currency = 'USD') => {
  const displayPrice = price / 100;
  return `$${Math.round(displayPrice)}`;
};

export const getPaymentProviderByCurrency = () => 'stripe';

export const getDiscountAmount = (plan, _currency = 'USD', discountPercentage = 0) => {
  const price = getPlanPrice(plan);
  return Math.round(price * discountPercentage);
};

export const getFinalPrice = (plan, _currency = 'USD', discountPercentage = 0) => {
  const price = getPlanPrice(plan);
  const discount = getDiscountAmount(plan, 'USD', discountPercentage);
  return price - discount;
};

export function getEnterprisePricing(_currency = 'USD') {
  return {
    starter: {
      name: "Starter Pro",
      monthlyPrice: ENTERPRISE_USD.starter.monthly * 100,
      yearlyPrice: ENTERPRISE_USD.starter.yearly * 100,
    },
    business: {
      name: "Business Pro",
      monthlyPrice: ENTERPRISE_USD.business.monthly * 100,
      yearlyPrice: ENTERPRISE_USD.business.yearly * 100,
    },
    enterprise: {
      name: "Enterprise Pro",
      monthlyPrice: ENTERPRISE_USD.enterprise.monthly * 100,
      yearlyPrice: ENTERPRISE_USD.enterprise.yearly * 100,
    },
  };
}

export function getEffectivePricing(_currency = 'USD', _isAndroidDevice = false) {
  return {
    oneDay: USD_PRICES.oneDay,
    basic: USD_PRICES.basic,
    monthly: USD_PRICES.monthly,
    quarterly: USD_PRICES.quarterly,
    sixMonth: USD_PRICES.sixMonth,
    yearly: USD_PRICES.sixMonth * 2,
    profile_slot: USD_PRICES.profile_slot,
    currency: 'USD',
  };
}

export const GLOBAL_PRICING_DATA = {
  getPricingConfigByCurrency,
  getPlanPrice,
  getPricing,
  formatPrice,
  getPaymentProviderByCurrency,
  getDiscountAmount,
  getFinalPrice,
  getEnterprisePricing,
  getEffectivePricing,
};

export default GLOBAL_PRICING_DATA;
