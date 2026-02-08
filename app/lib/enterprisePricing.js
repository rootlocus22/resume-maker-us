// Stub file - Enterprise features removed
// This is a temporary placeholder to prevent import errors

export const ENTERPRISE_PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        quotas: {
            resumes: 999,
            ats_checks: 999,
        },
    },
};

export const getPlanDetails = (planId) => {
    return ENTERPRISE_PLANS.FREE;
};
