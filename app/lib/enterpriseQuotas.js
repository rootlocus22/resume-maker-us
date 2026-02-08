// Stub file - Enterprise features removed
// This is a temporary placeholder to prevent import errors

export const QUOTA_TYPES = {
    RESUMES: 'resumes',
    ATS_CHECKS: 'ats_checks',
    TEAM_MEMBERS: 'team_members',
};

export const checkQuota = async (userId, quotaType) => {
    // Removed enterprise quota checking
    // Always return true for now (unlimited)
    return { allowed: true, remaining: 999 };
};

export const incrementQuota = async (userId, quotaType) => {
    // Removed enterprise quota tracking
    return { success: true };
};

export const decrementQuota = async (userId, quotaType) => {
    // Removed enterprise quota tracking
    return { success: true };
};

export const initializeUserQuotas = async (userId) => {
    // Removed enterprise quota initialization
    return { success: true };
};

export const getQuotaSummary = async (userId) => {
    // Stub for removed enterprise feature
    return {
        plan: {
            name: 'Free',
            description: 'Standard Access',
            price: 0
        }
    };
};
