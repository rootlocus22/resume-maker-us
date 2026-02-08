// Centralized Plan Configuration
// This file contains all plan details, pricing, limits, and access periods
// Update this file to change plan configurations across the entire application

// Discount Configuration
export const DISCOUNT_CONFIG = {
  enabled: true,
  oneDay: {
    discountPercentage: 10, // 10% off
    couponCode: "SAVE10" // No coupon for oneDay plan
  },
  basic: {
    discountPercentage: 10, // 10% off
    couponCode: "SAVE10"
  },
  monthly: {
    discountPercentage: 10, // 10% off
    couponCode: "SAVE10"
  },
  quarterly: {
    discountPercentage: 10, // 10% off
    couponCode: "SAVE10"
  },
  sixMonth: {
    discountPercentage: 10, // 10% off
    couponCode: "SAVE10"
  }
};

// Helper functions for discount calculations
export const getOriginalPrice = (planType, currency = 'INR') => {
  // Return the base price from PLAN_CONFIG as the original price
  return PLAN_CONFIG[planType]?.price[currency] || 0;
};

export const getDiscountedPrice = (planType, currency = 'INR') => {
  const originalPrice = getOriginalPrice(planType, currency);
  const discountPercentage = getDiscountPercentage(planType);
  // Apply discount on top of original price
  return Math.round(originalPrice * (1 - discountPercentage / 100));
};

export const getDiscountPercentage = (planType) => {
  return DISCOUNT_CONFIG[planType]?.discountPercentage || 0;
};

export const getCouponCode = (planType) => {
  return DISCOUNT_CONFIG[planType]?.couponCode || '';
};

export const isDiscountEnabled = () => {
  return DISCOUNT_CONFIG.enabled;
};

export const INTRO_OFFER_ACTIVE = true; // Set to false to revert to original pricing

export const PLAN_CONFIG = {
  oneDay: {
    name: "Quick Start",
    price: {
      INR: 19900,  // ₹199
      USD: 999     // $9.99
    },
    anchorPrice: {
      INR: 39900, // ₹399
      USD: 1299   // $12.99
    },
    duration: 3,  // 3 days access
    downloads: 2, // 3 downloads
    planType: 'oneDay',
    hierarchy: 1, // Lowest tier
    features: [
      "Resume Downloads (3 days)",
      "AI Suggestions",
      "50+ Premium Templates",
      "ATS Score Checker",
      "Custom Colors",
      "One Pager Resume Creator",
      "AI Bullet Points Generator",
      "AI Boost Full Resume",
      "Advanced Resume Editor",
      "Drag & Drop (Desktop Only)"
    ],
    badge: "QUICK ACCESS",
    badgeColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
    description: "Quick & affordable - perfect for urgent applications",
    interviewLimits: { sessionsPerMonth: 1, questionsPerSession: 2 }
  },

  basic: {
    name: "Starter (Sachet Pack)",
    price: {
      INR: 19900,  // ₹199
      USD: 1399    // $13.99
    },
    anchorPrice: {
      INR: 39900, // ₹399
      USD: 1699   // $16.99
    },
    duration: 7,  // 7 days access
    downloads: 5, // 5 downloads
    planType: 'basic',
    hierarchy: 2,
    features: [
      "Resume Downloads (7 days)",
      "AI Suggestions",
      "50+ Premium Templates",
      "ATS Score Checker",
      "Custom Colors",
      "One Pager Resume Creator",
      "AI Bullet Points Generator",
      "AI Boost Full Resume",
      "Advanced Resume Editor",
      "Drag & Drop (Desktop Only)"
    ],
    badge: "POPULAR",
    badgeColor: "bg-gradient-to-r from-blue-500 to-purple-500",
    description: "Perfect for job seekers - 7 days to create multiple resumes",
    interviewLimits: { sessionsPerMonth: 1, questionsPerSession: 2 }
  },

  monthly: {
    name: "Pro (Job Seeker Choice)",
    price: {
      INR: 49900,  // ₹499
      USD: 2499    // $24.99
    },
    anchorPrice: {
      INR: 69900, // ₹699 (Original)
      USD: 2499
    },
    duration: 30,  // 30 days access
    downloads: "unlimited",
    planType: 'monthly',
    hierarchy: 3,
    features: [
      "Unlimited Resume Downloads",
      "JD Builder - Tailor to Any Job",
      "ExpertResume GPT",
      "Salary Analyzer",
      "24/7 Email & Chat Support",
      "Personalized Career Guidance",
      "AI Upload Resume (1-Min)",
      "Priority Support",
      "Advanced Analytics",
      "All Starter Plan Features"
    ],
    badge: "PRO",
    badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    description: "Complete professional toolkit - everything you need",
    interviewLimits: { sessionsPerMonth: 10, questionsPerSession: 15 }
  },

  quarterly: {
    name: "Expert (Career Growth Bundle)",
    price: {
      INR: 69900,  // ₹699
      USD: 4499    // $44.99
    },
    anchorPrice: {
      INR: 89900, // ₹899 (Original)
      USD: 4499
    },
    duration: 90,  // 90 days access (3 months)
    downloads: "unlimited",
    planType: 'quarterly',
    hierarchy: 3.5,
    features: [
      "Unlimited Resume Downloads",
      "JD Builder - Tailor to Any Job",
      "AI Job Search (100 jobs/day)",
      "ExpertResume GPT",
      "Salary Analyzer",
      "AI Career Coach - 3 Month Roadmap",
      "24/7 Email & Chat Support",
      "Personalized Career Guidance",
      "AI Upload Resume (1-Min)",
      "Priority Support",
      "Advanced Analytics"
    ],
    badge: "POPULAR",
    badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
    description: "Perfect balance of value and features - 3 months full access",
    interviewLimits: { sessionsPerMonth: 10, questionsPerSession: 15 }
  },

  sixMonth: {
    name: "Ultimate (Complete Success Kit)",
    price: {
      INR: 89900,  // ₹899
      USD: 5999    // $59.99
    },
    anchorPrice: {
      INR: 129900, // ₹1299 (Original)
      USD: 5999
    },
    duration: 180,  // 180 days access
    downloads: "unlimited",
    planType: 'sixMonth',
    hierarchy: 4, // Highest tier
    features: [
      "Unlimited Resume Downloads",
      "JD Builder - Tailor to Any Job",
      "AI Job Search (Unlimited)",
      "Interview Prep Kit",
      "Interview Gyani Pro Access",
      "ExpertResume GPT",
      "Salary Analyzer",
      "AI Career Coach - 6 Month Roadmap",
      "24/7 Email & Chat Support",
      "Personalized Career Guidance",
      "AI Upload Resume (1-Min)",
      "Priority Support",
      "Advanced Analytics"
    ],
    badge: "BEST VALUE",
    badgeColor: "bg-gradient-to-r from-green-500 to-teal-500",
    description: "Best value - 6 months of unlimited access",
    interviewLimits: { sessionsPerMonth: 20, questionsPerSession: 15 }
  },

  free: {
    name: "Free",
    price: {
      INR: 0,
      USD: 0
    },
    duration: 0,
    downloads: 0,
    planType: 'free',
    hierarchy: 0,
    features: [
      "AI Resume Suggestions",
      "Limited Templates",
      "Mock Interview (1 Trial)"
    ],
    interviewLimits: { sessionsPerMonth: 1, questionsPerSession: 2 }
  }
};

// Backward compatibility for legacy plan key
PLAN_CONFIG.interview_copilot = PLAN_CONFIG.sixMonth; // Redirect legacy to bundled plan

export const ADDON_CONFIG = {
  one_time_download: {
    name: "One-Time Download",
    id: "one_time_download",
    price: {
      INR: 9900,   // ₹99
      USD: 299     // $2.99
    },
    duration: "one_time",
    features: [
      "Single Resume Download",
      "No Subscription",
      "Instant Access"
    ],
    description: "Download just this resume without a plan"
  },
  profile_slot: {
    name: "Additional Profile Slot",
    id: "profile_slot",
    price: {
      INR: 29900,   // ₹299
      USD: 499      // $4.99
    },
    duration: "unlimited",
    features: [
      "Create One Additional Profile",
      "Download Resumes for this Profile",
      "Lifetime Access"
    ],
    description: "Add a slot for a friend or family member"
  }
};

export const COUPON_OPTIONS = [
  { code: "SAVE10", value: 0.10, label: "10% OFF" },
  { code: "SAVE15", value: 0.15, label: "15% OFF" },
  { code: "SAVE20", value: 0.20, label: "20% OFF" },
  { code: "SAVE30", value: 0.30, label: "30% OFF" },
  { code: "SAVE75", value: 0.75377, label: "75% OFF" },
  { code: "YOGESH10", value: 0.10, label: "10% OFF - Yogesh" },
  { code: "YOGESH20", value: 0.20, label: "20% OFF - Yogesh" },
  { code: "YOGESH30", value: 0.30, label: "30% OFF - Yogesh" },
  { code: "AVINASH10", value: 0.10, label: "10% OFF - Avinash" },
  { code: "AVINASH20", value: 0.20, label: "20% OFF - Avinash" },
  { code: "AVINASH30", value: 0.30, label: "30% OFF - Avinash" },
  { code: "RESOLUTION2026", value: 0.20, label: "20% OFF" }, // Maps to 20%
];

// Helper functions to get plan details
export const getPlanConfig = (planType) => {
  return PLAN_CONFIG[planType] || null;
};

export const getPlanPrice = (planType, currency = 'INR') => {
  const plan = getPlanConfig(planType);
  return plan ? plan.price[currency] : 0;
};

export const getPlanDownloads = (planType) => {
  const plan = getPlanConfig(planType);
  return plan ? plan.downloads : 0;
};

export const getPlanDuration = (planType) => {
  const plan = getPlanConfig(planType);
  return plan ? plan.duration : 0;
};

export const getPlanName = (planType) => {
  const plan = getPlanConfig(planType);
  return plan ? plan.name : 'Unknown Plan';
};

export const getPlanFeatures = (planType) => {
  const plan = getPlanConfig(planType);
  return plan ? plan.features : [];
};

// Get all plans in hierarchy order
export const getAllPlans = () => {
  return Object.entries(PLAN_CONFIG)
    .map(([key, config]) => ({ ...config, planType: key }))
    .sort((a, b) => a.hierarchy - b.hierarchy);
};

// Check if plan has advanced features (JD Builder, Interview Gyani, Salary Analyzer)
export const hasAdvancedFeatures = (planType) => {
  return planType === 'monthly' || planType === 'quarterly' || planType === 'sixMonth';
};

// Check if plan has unlimited downloads
export const hasUnlimitedDownloads = (planType) => {
  const plan = getPlanConfig(planType);
  return plan ? plan.downloads === 'unlimited' : false;
};

// Get download quota for a plan
export const getDownloadQuota = (planType) => {
  const plan = getPlanConfig(planType);
  return plan ? plan.downloads : 0;
};

// Check if user has reached download limit
export const hasReachedDownloadLimit = (planType, downloadCount) => {
  const quota = getDownloadQuota(planType);

  if (quota === 'unlimited') {
    return false;
  }

  return downloadCount >= quota;
};

// Get remaining downloads for a plan
export const getRemainingDownloads = (planType, downloadCount) => {
  const quota = getDownloadQuota(planType);

  if (quota === 'unlimited') {
    return 'unlimited';
  }

  const remaining = quota - downloadCount;
  return Math.max(0, remaining);
};

// Get US discount information for a plan
export const getUSDiscountInfo = (planType) => {
  const plan = getPlanConfig(planType);
  // Original price is from PLAN_CONFIG.price.USD, not usOriginalPrice
  const originalPrice = plan?.price?.USD || 0;
  const discountPercentage = getDiscountPercentage(planType);
  // Calculate discounted price
  const currentPrice = Math.round(originalPrice * (1 - discountPercentage / 100));

  return {
    originalPrice: originalPrice,
    discountPercentage: discountPercentage,
    currentPrice: currentPrice
  };
};

// Format US price for display
export const formatUSPrice = (priceInCents) => {
  return `$${(priceInCents / 100).toFixed(2)}`;
};

// Format US price with discount display
export const formatUSPriceWithDiscount = (planType) => {
  const plan = getPlanConfig(planType);
  const originalPrice = plan?.price?.USD || 0;
  const discountPercentage = getDiscountPercentage(planType);

  if (!originalPrice || !discountPercentage) {
    return {
      currentPrice: formatUSPrice(originalPrice),
      showDiscount: false
    };
  }

  // Calculate discounted price
  const currentPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
  const savings = originalPrice - currentPrice;

  return {
    currentPrice: formatUSPrice(currentPrice),
    originalPrice: formatUSPrice(originalPrice),
    savings: formatUSPrice(savings),
    discountPercentage: discountPercentage,
    showDiscount: true
  };
};

// Get plan display name with billing cycle support
export const getPlanDisplayName = (planType, billingCycle = null) => {
  if (planType === 'premium') {
    if (billingCycle === 'monthly') return 'Pro Monthly';
    if (billingCycle === 'sixMonth') return 'Pro 6-Month';
    return 'Premium';
  }

  const plan = getPlanConfig(planType);
  return plan ? plan.name : 'Free';
};

// Get plan description with download and duration info
export const getPlanDescription = (planType) => {
  const plan = getPlanConfig(planType);
  if (!plan) return '';

  const downloadText = plan.downloads === 'unlimited' ? 'Unlimited Downloads' : `${plan.downloads} Downloads`;
  const durationText = plan.duration === 1 ? '1 day' : `${plan.duration} days`;

  return `${downloadText} (${durationText})`;
};

// Get error message for download limit reached
export const getDownloadLimitMessage = (planType, isExpired = false) => {
  const plan = getPlanConfig(planType);
  if (!plan) return 'Download limit reached. Please upgrade to continue.';

  const planName = plan.name;
  const downloadCount = plan.downloads;
  const duration = plan.duration === 1 ? '1 day' : `${plan.duration} days`;

  if (isExpired) {
    return `Your ${planName} has expired. Purchase a new ${planName} to get ${downloadCount} more download${downloadCount !== 1 ? 's' : ''}.`;
  }

  if (plan.downloads === 'unlimited') {
    return `You have unlimited downloads with your ${planName}.`;
  }

  return `You've used all ${downloadCount} download${downloadCount !== 1 ? 's' : ''} from your ${planName}. Please  upgrade to Pro for unlimited downloads!`;
};

// Get upgrade message for limited plans
export const getUpgradeMessage = (planType) => {
  const plan = getPlanConfig(planType);
  if (!plan) return 'Upgrade to continue.';

  if (plan.hierarchy >= 3) {
    return 'You have access to all features!';
  }

  return `Upgrade to Pro Monthly or Pro 6-Month for advanced features like JD Builder, Interview Gyani, and Salary Analyzer.`;
};
