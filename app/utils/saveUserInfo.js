// utils/saveUserInfo.js
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

/**
 * Save or update user info in Firestore (userInfo collection).
 * @param {string|null} userId - Firebase userId or null
 * @param {object} data - { name, email, phone }
 */
import { safeLocalStorage } from "../lib/storage";

/**
 * Save or update user info in Firestore (userInfo collection).
 * @param {string|null} userId - Firebase userId or null
 * @param {object} data - { name, email, phone }
 */
export const saveUserInfo = async (userId, data) => {
  if (!data) return;
  const docId = userId || data.email || "anonymous-" + Math.random().toString(36).slice(2, 10);
  await setDoc(doc(db, "userInfo", docId), {
    ...data,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

// Shared utility for resume preferences
export function loadResumePreferences(defaultConfig) {
  if (typeof window !== 'undefined') {
    const saved = safeLocalStorage.getItem('resumePreferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { }
    }
  }
  return defaultConfig;
}

export function saveResumePreferences(prefs) {
  if (typeof window !== 'undefined') {
    safeLocalStorage.setItem('resumePreferences', JSON.stringify(prefs));
  }
}
