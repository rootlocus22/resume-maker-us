import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const DEFAULT_DASHBOARD_SETTINGS = {
  // Dashboard Tools
  showResumeBuilder: true,
  showUploadResume: true,
  showJDResumeBuilder: true,
  showATSChecker: true,
  // Business Features
  showClientManagement: true,
  showBusinessAccounting: true,
  // Dashboard Sections
  showRecentActivity: true,
  showQuickActions: true,
};

/**
 * Load dashboard settings for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} The dashboard settings
 */
export async function loadDashboardSettings(userId) {
  if (!userId) {
    return DEFAULT_DASHBOARD_SETTINGS;
  }

  try {
    const settingsRef = doc(db, "users", userId, "preferences", "dashboard");
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return { ...DEFAULT_DASHBOARD_SETTINGS, ...settingsDoc.data() };
    }

    return DEFAULT_DASHBOARD_SETTINGS;
  } catch (error) {
    console.error("Error loading dashboard settings:", error);
    return DEFAULT_DASHBOARD_SETTINGS;
  }
}

/**
 * Check if a feature should be shown based on settings
 * @param {Object} settings - The dashboard settings
 * @param {string} featureKey - The feature key to check
 * @returns {boolean} Whether the feature should be shown
 */
export function shouldShowFeature(settings, featureKey) {
  if (!settings || typeof settings[featureKey] === "undefined") {
    return DEFAULT_DASHBOARD_SETTINGS[featureKey] !== false;
  }
  return settings[featureKey] === true;
}

