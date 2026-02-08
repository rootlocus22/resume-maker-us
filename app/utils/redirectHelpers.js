// Utility functions for handling post-login redirects based on user type

/**
 * Get the appropriate redirect URL based on user type and onboarding status
 * @param {Object} user - The Firebase user object
 * @param {string} userType - "individual", "institutional", or "professional"
 * @param {boolean} isEnterpriseUser - Whether the user is an enterprise user
 * @param {Object} userData - Full user data from Firestore
 * @returns {string} The redirect URL
 */
export const getPostLoginRedirect = (user, userType, isEnterpriseUser, userData) => {
  // Default fallback for any issues
  if (!user) {
    return "/";
  }

  // Handle team members - they should go directly to dashboard
  if (userData?.professionalProfile?.role === "team_member") {
    return "/dashboard/professional";
  }

  // Handle professional resume writers (admin users)
  if (isEnterpriseUser === true && 
      userData?.category === "ResumeWriter" && 
      userData?.userType === "professional") {
    
    // Check if user is new (first time signing in) and needs to complete profile
    if (isNewEnterpriseUser(userData)) {
      return "/enterprise/account";
    }
    
    return "/dashboard/professional";
  }

  // Handle institutional/enterprise users (existing logic)
  if (userType === "institutional" || isEnterpriseUser) {
    // Check if onboarding is completed
    if (userData && userData.onboardingCompleted) {
      return "/dashboard"; // Enterprise dashboard
    } else {
      return "/institutional-onboarding"; // Complete onboarding first
    }
  }

  // Handle individual users
  return "/dashboard";
};

/**
 * Check if a user is new (first time signing in) and needs to complete their profile
 * @param {Object} userData - Full user data from Firestore
 * @returns {boolean} True if user is new and needs to complete profile
 */
export const isNewEnterpriseUser = (userData) => {
  if (!userData) return true;
  
  // Check if user has a professional profile
  const professionalProfile = userData.professionalProfile;
  if (!professionalProfile) return true;
  
  // Check if user has completed their profile setup
  const hasBusinessName = professionalProfile.businessName && professionalProfile.businessName.trim() !== '';
  const hasBusinessType = professionalProfile.businessType && professionalProfile.businessType.trim() !== '';
  const hasDisplayName = professionalProfile.displayName && professionalProfile.displayName.trim() !== '';
  
  // User is new if they don't have required profile fields
  return !hasBusinessName || !hasBusinessType || !hasDisplayName;
};

/**
 * Redirect user after login based on their type
 * @param {Object} router - Next.js router object
 * @param {Object} user - The Firebase user object
 * @param {string} userType - "individual", "institutional", or "professional"
 * @param {boolean} isEnterpriseUser - Whether the user is an enterprise user
 * @param {Object} userData - Full user data from Firestore
 */
export const redirectAfterLogin = (router, user, userType, isEnterpriseUser, userData, loginSource = 'consumer') => {
  // Check for checkout intent first - this always takes priority
  const checkoutIntent = localStorage.getItem('checkoutIntent');
  
  // Enhanced debugging
  console.log('🔍 redirectAfterLogin debug:', { 
    checkoutIntent, 
    checkoutIntentExists: !!checkoutIntent,
    checkoutIntentLength: checkoutIntent?.length,
    loginSource, 
    userType, 
    isEnterpriseUser,
    plan: userData?.plan,
    userId: user?.uid
  });
  
  if (checkoutIntent) {
    try {
      const parsed = JSON.parse(checkoutIntent);
      const { billingCycle, source } = parsed;
      console.log('📦 Parsed checkout intent:', parsed);
      
      localStorage.removeItem('checkoutIntent'); // Clean up
      console.log('✅ Redirecting user to checkout after login - source: ${source}, billingCycle: ${billingCycle}');
      
      // Add a small delay to ensure the redirect works
      setTimeout(() => {
        router.push(`/checkout?billingCycle=${billingCycle}&source=${source}`);
      }, 100);
      return;
    } catch (error) {
      console.error('❌ Error parsing checkout intent:', error);
      localStorage.removeItem('checkoutIntent'); // Clean up corrupted data
    }
  } else {
    console.log('❌ No checkout intent found in localStorage');
  }

  // Check for redirect intent (where user wanted to go before logging in)
  const redirectIntent = localStorage.getItem('redirectAfterLogin');
  if (redirectIntent) {
    console.log(`✅ Redirecting to intended destination: ${redirectIntent}`);
    localStorage.removeItem('redirectAfterLogin'); // Clean up
    setTimeout(() => {
      router.push(redirectIntent);
    }, 100);
    return;
  }

  // If login came from consumer login page (/login), prioritize consumer flow
  // BUT only if there's no checkout intent (checkout intent always takes priority)
  if (loginSource === 'consumer') {
    // For consumer login, redirect to dashboard
    const isPremium = userData?.plan === 'premium' || userData?.plan === 'basic';
    console.log('Consumer login without checkout intent - redirecting to dashboard');
    router.push('/dashboard');
    return;
  }

  // Default redirect behavior for enterprise logins
  const redirectUrl = getPostLoginRedirect(user, userType, isEnterpriseUser, userData);
  console.log(`Redirecting ${userType} user (isEnterpriseUser: ${isEnterpriseUser}) to: ${redirectUrl}`);
  router.push(redirectUrl);
};

/**
 * Check if user should be redirected to enterprise dashboard
 * @param {string} userType - "individual", "institutional", or "professional"
 * @param {boolean} isEnterpriseUser - Whether the user is an enterprise user
 * @param {Object} userData - Full user data from Firestore
 * @returns {boolean}
 */
export const shouldRedirectToEnterprise = (userType, isEnterpriseUser, userData) => {
  return userType === "institutional" || 
         isEnterpriseUser || 
         (userData?.isEnterpriseUser === true && userData?.category === "ResumeWriter");
};

/**
 * Check if user is a professional resume writer
 * @param {Object} userData - Full user data from Firestore
 * @returns {boolean}
 */
export const isProfessionalUser = (userData) => {
  return userData?.isEnterpriseUser === true && 
         userData?.category === "ResumeWriter" && 
         userData?.userType === "professional";
};
