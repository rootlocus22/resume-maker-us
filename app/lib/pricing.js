import { getEffectivePricing } from './globalPricing';

export const getCurrencyAndPriceByCountry = (currency) => {
  // Get device-specific pricing
  const devicePricing = getEffectivePricing(currency, false); // Default to non-Android for this function
  
  const currencyData = {
    INR: {
      currency: "INR",
              annualPrice: 319900, // ₹3,199
      monthlyPrice: 39900, // ₹399
      basicPrice: devicePricing.basic, // Dynamic pricing based on device
      annualBasePrice: 338900, // ₹3,389
      monthlyBasePrice: 33800, // ₹338
      basicBasePrice: 8389, // ₹83.89
      annualGST: 61000, // ₹610
      monthlyGST: 6100, // ₹61
      basicGST: 1511, // ₹15.11
    },
    USD: {
      currency: "USD",
      annualPrice: 30000, // $300
      monthlyPrice: 3000, // $30
      basicPrice: 500, // $5 (weekly plan - valid for 1 week)
      annualBasePrice: 30000, // $300 (no GST)
      monthlyBasePrice: 3000, // $30
      basicBasePrice: 500, // $5
      annualGST: 0, // No GST
      monthlyGST: 0,
      basicGST: 0,
    },
    US: { 
      currency: "USD", 
      annualPrice: 1200, 
      monthlyPrice: 500,
      basicPrice: 300,
      professionalPrice: 10000, // $100
    },
    GB: { 
      currency: "GBP", 
      annualPrice: 1000, 
      monthlyPrice: 400,
      basicPrice: 250,
      professionalPrice: 8000, // £80
    },
    CA: { 
      currency: "CAD", 
      annualPrice: 1600, 
      monthlyPrice: 700,
      basicPrice: 400,
      professionalPrice: 13000, // CAD $130
    },
    AU: { 
      currency: "AUD", 
      annualPrice: 1800, 
      monthlyPrice: 800,
      basicPrice: 450,
      professionalPrice: 15000, // AUD $150
    },
  };
  return currencyData[currency] || currencyData["INR"];
};