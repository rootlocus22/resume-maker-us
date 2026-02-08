import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp, doc } from 'firebase/firestore';

/**
 * Save a version of a field to Firestore under users/{userId}/fieldVersionHistory
 * @param {string} userId - User's ID
 * @param {string} resumeId - Resume ID (optional, use 'default' for main resume)
 * @param {string} fieldPath - Path to the field (e.g., 'profile.summary', 'experience.0.description')
 * @param {string} value - The text value to save
 * @param {string} action - Type of change (e.g., 'manual_edit', 'ai_rephrase', 'ai_bullets')
 * @returns {Promise<void>}
 */
export async function saveFieldVersion(userId, resumeId, fieldPath, value, action = 'manual_edit') {
  try {
    if (!userId || !value) return;
    
    // Check if this is a duplicate of the last saved version
    const lastVersion = await getLastFieldVersion(userId, resumeId, fieldPath);
    if (lastVersion && lastVersion.value.trim() === value.trim()) {
      console.log(`Skipping duplicate version for ${fieldPath}`);
      return; // Don't save if it's the same as the last version
    }
    
    // Store under users/{userId}/fieldVersionHistory subcollection
    const userDocRef = doc(db, 'users', userId);
    const versionHistoryRef = collection(userDocRef, 'fieldVersionHistory');
    
    await addDoc(versionHistoryRef, {
      resumeId: resumeId || 'default',
      fieldPath,
      value,
      action,
      timestamp: Timestamp.now(),
      createdAt: new Date().toISOString()
    });
    
    console.log(`Saved version for ${fieldPath}:`, { action, valueLength: value.length });
  } catch (error) {
    console.error('Error saving field version:', error);
  }
}

/**
 * Get the last saved version for a field (for duplicate detection)
 * @param {string} userId - User's ID
 * @param {string} resumeId - Resume ID
 * @param {string} fieldPath - Path to the field
 * @returns {Promise<Object|null>} Last version object or null
 */
async function getLastFieldVersion(userId, resumeId, fieldPath) {
  try {
    if (!userId) return null;
    
    const userDocRef = doc(db, 'users', userId);
    const versionHistoryRef = collection(userDocRef, 'fieldVersionHistory');
    
    const q = query(
      versionHistoryRef,
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    let lastVersion = null;
    
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.resumeId === (resumeId || 'default') && data.fieldPath === fieldPath) {
        lastVersion = {
          id: docSnapshot.id,
          ...data
        };
      }
    });
    
    return lastVersion;
  } catch (error) {
    console.error('Error fetching last field version:', error);
    return null;
  }
}

/**
 * Get version history for a specific field from users/{userId}/fieldVersionHistory
 * @param {string} userId - User's ID
 * @param {string} resumeId - Resume ID
 * @param {string} fieldPath - Path to the field
 * @param {number} limitCount - Maximum number of versions to retrieve
 * @returns {Promise<Array>} Array of version objects
 */
export async function getFieldVersionHistory(userId, resumeId, fieldPath, limitCount = 50) {
  try {
    if (!userId) return [];
    
    // Query from users/{userId}/fieldVersionHistory subcollection
    const userDocRef = doc(db, 'users', userId);
    const versionHistoryRef = collection(userDocRef, 'fieldVersionHistory');
    
    const q = query(
      versionHistoryRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const versions = [];
    
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      // Filter by resumeId and fieldPath in memory (since we can't use compound queries on subcollections without specific index)
      if (data.resumeId === (resumeId || 'default') && data.fieldPath === fieldPath) {
        versions.push({
          id: docSnapshot.id,
          ...data
        });
      }
    });
    
    return versions;
  } catch (error) {
    console.error('Error fetching field version history:', error);
    return [];
  }
}

/**
 * Get all version history for a resume from users/{userId}/fieldVersionHistory
 * @param {string} userId - User's ID
 * @param {string} resumeId - Resume ID
 * @param {number} limitCount - Maximum number of versions to retrieve
 * @returns {Promise<Array>} Array of version objects grouped by field
 */
export async function getResumeVersionHistory(userId, resumeId, limitCount = 100) {
  try {
    if (!userId) return [];
    
    // Query from users/{userId}/fieldVersionHistory subcollection
    const userDocRef = doc(db, 'users', userId);
    const versionHistoryRef = collection(userDocRef, 'fieldVersionHistory');
    
    const q = query(
      versionHistoryRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const versions = [];
    
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      // Filter by resumeId in memory
      if (data.resumeId === (resumeId || 'default')) {
        versions.push({
          id: docSnapshot.id,
          ...data
        });
      }
    });
    
    return versions;
  } catch (error) {
    console.error('Error fetching resume version history:', error);
    return [];
  }
}

/**
 * Get statistics about field changes
 * @param {string} userId - User's ID
 * @param {string} resumeId - Resume ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getFieldStatistics(userId, resumeId) {
  try {
    const versions = await getResumeVersionHistory(userId, resumeId, 1000);
    
    const stats = {
      totalVersions: versions.length,
      fieldCounts: {},
      actionCounts: {
        manual_edit: 0,
        ai_rephrase: 0,
        ai_bullets: 0,
        other: 0
      },
      mostEditedFields: [],
      recentActivity: versions.slice(0, 10)
    };
    
    // Count by field and action
    versions.forEach(v => {
      // Field counts
      stats.fieldCounts[v.fieldPath] = (stats.fieldCounts[v.fieldPath] || 0) + 1;
      
      // Action counts
      if (stats.actionCounts[v.action] !== undefined) {
        stats.actionCounts[v.action]++;
      } else {
        stats.actionCounts.other++;
      }
    });
    
    // Sort fields by edit count
    stats.mostEditedFields = Object.entries(stats.fieldCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([field, count]) => ({ field, count }));
    
    return stats;
  } catch (error) {
    console.error('Error calculating field statistics:', error);
    return null;
  }
}

