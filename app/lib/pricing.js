import { getEffectivePricing } from './globalPricing';

// US product: USD only
export const getCurrencyAndPriceByCountry = () => {
  const devicePricing = getEffectivePricing('USD', false);
  return {
    currency: "USD",
    annualPrice: devicePricing.sixMonth ? devicePricing.sixMonth * 2 : 12000,
    monthlyPrice: devicePricing.monthly,
    basicPrice: devicePricing.basic,
    annualBasePrice: devicePricing.sixMonth ? devicePricing.sixMonth * 2 : 12000,
    monthlyBasePrice: devicePricing.monthly,
    basicBasePrice: devicePricing.basic,
    annualGST: 0,
    monthlyGST: 0,
    basicGST: 0,
  };
};