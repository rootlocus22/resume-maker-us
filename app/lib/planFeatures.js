// Plan Features Access Control
// This utility helps determine which features are available for different plan types
// Now uses centralized configuration from planConfig.js

import {
  getPlanConfig,
  hasAdvancedFeatures as configHasAdvancedFeatures,
  getDownloadQuota as configGetDownloadQuota,
  hasReachedDownloadLimit as configHasReachedDownloadLimit,
  getPlanDisplayName as configGetPlanDisplayName,
  getRemainingDownloads as configGetRemainingDownloads
} from './planConfig';

/**
 * Check if a plan has access to advanced features
 * Advanced features: JD Builder, AI Interview, Salary Analyzer
 * Only available for: monthly and sixMonth plans
 */
export const hasAdvancedFeatures = (plan) => {
  return configHasAdvancedFeatures(plan);
};

/**
 * Check if user has specific advanced feature access
 * @param {string} plan - User's current plan (oneDay, basic, premium, monthly, sixMonth)
 * @param {string} billingCycle - User's billing cycle (for premium users)
 */
export const hasFeatureAccess = (plan, billingCycle = null, interviewPlan = null) => {
  // Check Interview Plan access first
  if (interviewPlan === "interview_gyani" || interviewPlan === "pro") return true;

  // For premium users, check their billing cycle
  if (plan === "premium") {
    return billingCycle === "monthly" || billingCycle === "sixMonth";
  }

  // Direct plan types for Resume
  return plan === "monthly" || plan === "sixMonth";
};

/**
 * Get download quota for a plan
 * @param {string} plan - User's current plan
 * @returns {number|string} - Number of downloads allowed, or "unlimited"
 */
export const getDownloadQuota = (plan) => {
  // Handle legacy plan types
  if (plan === "premium") {
    return "unlimited";
  }
  if (plan === "free" || plan === "anonymous") {
    return 0;
  }

  return configGetDownloadQuota(plan);
};

/**
 * Check if user has reached download limit
 * @param {string} plan - User's current plan
 * @param {number} downloadCount - Current download count
 * @returns {boolean} - True if limit reached
 */
export const hasReachedDownloadLimit = (plan, downloadCount) => {
  // Handle legacy plan types
  if (plan === "premium") {
    return false;
  }
  if (plan === "free" || plan === "anonymous") {
    return true;
  }

  return configHasReachedDownloadLimit(plan, downloadCount);
};

/**
 * Get plan display name
 */
export const getPlanDisplayName = (plan, billingCycle = null) => {
  // Handle legacy plan types
  if (plan === "premium") {
    if (billingCycle === "monthly") return "Pro Monthly";
    if (billingCycle === "sixMonth") return "Pro 6-Month";
    return "Premium";
  }
  if (plan === "free" || plan === "anonymous") {
    return "Free";
  }

  return configGetPlanDisplayName(plan, billingCycle);
};

/**
 * Get remaining downloads for a plan
 */
export const getRemainingDownloads = (plan, downloadCount) => {
  // Handle legacy plan types
  if (plan === "premium") {
    return "unlimited";
  }
  if (plan === "free" || plan === "anonymous") {
    return 0;
  }

  return configGetRemainingDownloads(plan, downloadCount);
};

