/**
 * Upload History Management with Firestore
 * Maintains history of resume uploads for quick access without re-uploading
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { cleanResumeDataForFirebase } from './utils';

const MAX_HISTORY_ITEMS = 10; // Keep last 10 uploads per user

/**
 * Save upload history to Firestore
 * Includes both resume data AND metadata for analytics
 */
export const saveUploadHistory = async (userId, uploadData, userInfo = null) => {
  try {
    if (!userId) {
      console.warn('Cannot save upload history without userId');
      return null;
    }

    const historyRef = collection(db, 'users', userId, 'uploadHistory');
    
    // Clean resume data for Firestore
    const cleanParsedData = uploadData.parsedData 
      ? cleanResumeDataForFirebase(uploadData.parsedData) 
      : null;
    const cleanOptimizedData = uploadData.optimizedData 
      ? cleanResumeDataForFirebase(uploadData.optimizedData) 
      : null;
    
    // Merged entry with BOTH resume data AND metadata
    const historyEntry = {
      // Timestamps
      timestamp: Timestamp.now(),
      createdAt: new Date().toISOString(),
      
      // File metadata
      fileName: uploadData.fileName || 'resume.pdf',
      fileType: uploadData.fileType || 'application/pdf',
      fileSize: uploadData.fileSize || null,
      
      // User/performer metadata (for analytics tracking)
      performedBy: userId,
      performedByEmail: userInfo?.email || uploadData.userEmail || null,
      performedByName: userInfo?.displayName || userInfo?.name || uploadData.userName || null,
      
      // Resume data (cleaned for Firestore)
      parsedData: cleanParsedData,
      atsScore: uploadData.atsScore || null,
      atsData: uploadData.atsData || null,
      optimizedData: cleanOptimizedData,
      template: uploadData.template || 'ats_classic_standard',
      customColors: uploadData.customColors || {},
      preferences: uploadData.preferences || {},
      
      // Client context (if provided)
      clientId: uploadData.clientId || null,
      clientName: uploadData.clientName || null,
    };

    const docRef = await addDoc(historyRef, historyEntry);
    
    console.log(`✅ Saved merged upload history (ID: ${docRef.id}) with resume data + metadata`);
    
    // Clean up old entries if we exceed MAX_HISTORY_ITEMS
    await cleanupOldHistory(userId, 'uploadHistory');
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving upload history:', error);
    return null;
  }
};

/**
 * Get upload history for a user
 */
export const getUploadHistory = async (userId) => {
  try {
    if (!userId) {
      return [];
    }

    const historyRef = collection(db, 'users', userId, 'uploadHistory');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(MAX_HISTORY_ITEMS));
    const querySnapshot = await getDocs(q);
    
    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
      });
    });
    
    return history;
  } catch (error) {
    console.error('Error getting upload history:', error);
    return [];
  }
};

/**
 * Get most recent upload for quick restore
 */
export const getLastUpload = async (userId) => {
  const history = await getUploadHistory(userId);
  return history.length > 0 ? history[0] : null;
};

/**
 * Delete a specific history item
 */
export const deleteHistoryItem = async (userId, historyId) => {
  try {
    if (!userId || !historyId) return false;

    const docRef = doc(db, 'users', userId, 'uploadHistory', historyId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting history item:', error);
    return false;
  }
};

/**
 * Clear all history for a user
 */
export const clearUploadHistory = async (userId) => {
  try {
    if (!userId) return false;

    const historyRef = collection(db, 'users', userId, 'uploadHistory');
    const querySnapshot = await getDocs(historyRef);
    
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error clearing upload history:', error);
    return false;
  }
};

/**
 * Save ATS checker history to Firestore
 * Includes both detailed analysis AND metadata for analytics
 */
export const saveATSHistory = async (userId, atsData, userInfo = null) => {
  try {
    if (!userId) {
      console.warn('Cannot save ATS history without userId');
      return null;
    }

    const historyRef = collection(db, 'users', userId, 'atsCheckerHistory');
    
    // Clean resume data for Firestore
    const cleanParsedData = atsData.parsedData 
      ? cleanResumeDataForFirebase(atsData.parsedData) 
      : null;
    const cleanOptimizedData = atsData.optimizedResumeData 
      ? cleanResumeDataForFirebase(atsData.optimizedResumeData) 
      : null;
    
    // Merged entry with BOTH detailed analysis AND metadata
    const historyEntry = {
      // Timestamps
      timestamp: Timestamp.now(),
      createdAt: new Date().toISOString(),
      
      // File metadata
      fileName: atsData.fileName || 'resume.pdf',
      fileType: atsData.fileType || 'application/pdf',
      fileSize: atsData.fileSize || null,
      
      // Score and analysis type
      score: atsData.atsScore || null, // For backwards compatibility and quick access
      atsScore: atsData.atsScore || null,
      analysisType: atsData.atsAnalysis?.analysisType || 'general',
      hasJobDescription: !!atsData.jobDescription,
      
      // User/performer metadata (for analytics tracking)
      performedBy: userId,
      performedByEmail: userInfo?.email || atsData.userEmail || null,
      performedByName: userInfo?.displayName || userInfo?.name || atsData.userName || null,
      
      // Full analysis data (cleaned for Firestore)
      atsAnalysis: atsData.atsAnalysis,
      parsedData: cleanParsedData,
      recommendations: atsData.recommendations || null,
      optimizedResumeData: cleanOptimizedData,
      jobDescription: atsData.jobDescription || null,
      
      // Client context (if provided)
      clientId: atsData.clientId || null,
      clientName: atsData.clientName || null,
    };

    const docRef = await addDoc(historyRef, historyEntry);
    
    console.log(`✅ Saved merged ATS history (ID: ${docRef.id}) with full analysis + metadata`);
    
    // Clean up old entries if we exceed MAX_HISTORY_ITEMS
    await cleanupOldHistory(userId, 'atsCheckerHistory');
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving ATS history:', error);
    return null;
  }
};

/**
 * Get ATS checker history for a user
 */
export const getATSHistory = async (userId) => {
  try {
    if (!userId) {
      return [];
    }

    const historyRef = collection(db, 'users', userId, 'atsCheckerHistory');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(MAX_HISTORY_ITEMS));
    const querySnapshot = await getDocs(q);
    
    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
      });
    });
    
    return history;
  } catch (error) {
    console.error('Error getting ATS history:', error);
    return [];
  }
};

/**
 * Save JD resume history to Firestore
 */
export const saveJDResumeHistory = async (userId, jdData) => {
  try {
    if (!userId) {
      console.warn('Cannot save JD resume history without userId');
      return null;
    }

    const historyRef = collection(db, 'users', userId, 'jdResumeHistory');
    
    // Clean resume data for Firestore (remove undefined, functions, nested issues)
    const cleanParsedData = jdData.parsedResumeData || jdData.resumeData 
      ? cleanResumeDataForFirebase(jdData.parsedResumeData || jdData.resumeData) 
      : null;
    const cleanEnhancedData = jdData.enhancedResumeData || jdData.resumeData 
      ? cleanResumeDataForFirebase(jdData.enhancedResumeData || jdData.resumeData) 
      : null;
    const cleanResumeData = jdData.resumeData 
      ? cleanResumeDataForFirebase(jdData.resumeData) 
      : null;
    
    const historyEntry = {
      timestamp: Timestamp.now(),
      resumeId: jdData.resumeId || null, // ✅ Store the resume document ID for backward compatibility lookup
      resumeName: jdData.resumeName || 'JD Resume',
      fileName: jdData.fileName || jdData.resumeName || 'JD Resume',
      originalFileName: jdData.originalFileName || jdData.fileName || null,
      jobDescription: jdData.jobDescription || null,
      // Store both parsed and enhanced resume data for quick access (cleaned)
      parsedResumeData: cleanParsedData,
      enhancedResumeData: cleanEnhancedData,
      resumeData: cleanResumeData, // Keep for backward compatibility (cleaned)
      selectedTemplate: jdData.selectedTemplate || jdData.template || 'ats_classic_standard',
      template: jdData.template || jdData.selectedTemplate || 'ats_classic_standard',
      customColors: jdData.customColors || {},
      preferences: jdData.preferences || {},
      enhancementSummary: jdData.enhancementSummary || null,
      source: jdData.source || 'job_description_builder',
      clientId: jdData.clientId || null,
      clientName: jdData.clientName || null,
    };

    const docRef = await addDoc(historyRef, historyEntry);
    
    console.log('✅ Saved JD resume history with ID:', docRef.id);
    
    // Clean up old entries if we exceed MAX_HISTORY_ITEMS
    await cleanupOldHistory(userId, 'jdResumeHistory');
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving JD resume history:', error);
    return null;
  }
};

/**
 * Get JD resume history for a user
 */
export const getJDResumeHistory = async (userId) => {
  try {
    if (!userId) {
      console.warn('Cannot get JD resume history without userId');
      return [];
    }

    const historyRef = collection(db, 'users', userId, 'jdResumeHistory');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(MAX_HISTORY_ITEMS));
    const snapshot = await getDocs(q);
    
    const history = [];
    snapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return history;
  } catch (error) {
    console.error('Error getting JD resume history:', error);
    return [];
  }
};

/**
 * Clear JD resume history for a user
 */
export const clearJDResumeHistory = async (userId) => {
  try {
    if (!userId) {
      console.warn('Cannot clear JD resume history without userId');
      return false;
    }

    const historyRef = collection(db, 'users', userId, 'jdResumeHistory');
    const snapshot = await getDocs(historyRef);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error clearing JD resume history:', error);
    return false;
  }
};

/**
 * Get most recent ATS check for quick restore
 */
export const getLastATSCheck = async (userId) => {
  const history = await getATSHistory(userId);
  return history.length > 0 ? history[0] : null;
};

/**
 * Delete a specific ATS history item
 */
export const deleteATSHistoryItem = async (userId, historyId) => {
  try {
    if (!userId || !historyId) return false;

    const docRef = doc(db, 'users', userId, 'atsCheckerHistory', historyId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting ATS history item:', error);
    return false;
  }
};

/**
 * Clear all ATS history for a user
 */
export const clearATSHistory = async (userId) => {
  try {
    if (!userId) return false;

    const historyRef = collection(db, 'users', userId, 'atsCheckerHistory');
    const querySnapshot = await getDocs(historyRef);
    
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error clearing ATS history:', error);
    return false;
  }
};

/**
 * Clean up old history items beyond MAX_HISTORY_ITEMS
 */
const cleanupOldHistory = async (userId, collectionName) => {
  try {
    const historyRef = collection(db, 'users', userId, collectionName);
    const q = query(historyRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.size > MAX_HISTORY_ITEMS) {
      const docsToDelete = [];
      querySnapshot.forEach((doc, index) => {
        if (index >= MAX_HISTORY_ITEMS) {
          docsToDelete.push(deleteDoc(doc.ref));
        }
      });
      await Promise.all(docsToDelete);
    }
  } catch (error) {
    console.error('Error cleaning up old history:', error);
  }
};

/**
 * Format timestamp for display
 */
export const formatHistoryTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Get file size estimate from data
 */
export const estimateDataSize = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  } catch (error) {
    return 'Unknown';
  }
};
