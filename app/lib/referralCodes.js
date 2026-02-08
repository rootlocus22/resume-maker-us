// Referral Codes Configuration
// This file manages all referral codes and their associated discounts

export const REFERRAL_CODES = {
  RANJAN10: {
    code: "RANJAN10",
    discountPercentage: 0, // 10% discount
    influencer: "Ranjan",
    description: "Ranjan's 10% discount",
    validPlans: ["monthly", "sixMonth", "yearly"], // Only valid for premium plans
    maxUses: 1000, // Maximum number of times this code can be used
    isActive: true
  },
  DEEKSHA20: {
    code: "DEEKSHA20",
    discountPercentage: 0, // 10% discount
    influencer: "DEEKSHA20",
    description: "DEEKSHA20's 20% discount",
    validPlans: ["monthly", "sixMonth", "yearly"], // Only valid for premium plans
    maxUses: 10000
    , // Maximum number of times this code can be used
    isActive: true
  },
  SHEENU20: {
    code: "SHEENU20",
    discountPercentage: 0, // 10% discount
    influencer: "SHEENU20",
    description: "SHEENU's 20% discount",
    validPlans: ["monthly", "sixMonth", "yearly"], // Only valid for premium plans
    maxUses: 10000
    , // Maximum number of times this code can be used
    isActive: true
  },

};

// Helper function to get referral code details
export const getReferralCodeDetails = (code) => {
  const upperCode = code?.toUpperCase();
  return REFERRAL_CODES[upperCode] || null;
};

// Helper function to validate referral code
export const validateReferralCode = (code, billingCycle) => {
  const codeDetails = getReferralCodeDetails(code);
  
  if (!codeDetails) {
    return { isValid: false, error: "Invalid referral code." };
  }
  
  if (!codeDetails.isActive) {
    return { isValid: false, error: "This referral code is no longer active." };
  }
  
  if (!codeDetails.validPlans.includes(billingCycle)) {
    return { 
      isValid: false, 
              error: `Referral code is only valid for Premium plans (₹499, ₹899 & ₹1,299).` 
    };
  }
  
  return { 
    isValid: true, 
    codeDetails 
  };
};

// Helper function to get all active referral codes
export const getActiveReferralCodes = () => {
  return Object.values(REFERRAL_CODES).filter(code => code.isActive);
}; 