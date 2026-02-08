/**
 * Photo Manager - Centralized photo handling for resumes
 * 
 * This module provides consistent photo management across the application:
 * - Upload photos to Firebase Storage
 * - Retrieve photo URLs
 * - Validate photo data
 * - Clean photo references for Firestore
 */

/**
 * Check if a photo URL is a Firebase Storage URL
 */
export function isFirebaseStorageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return (
    url.startsWith('https://storage.googleapis.com/') ||
    url.startsWith('https://firebasestorage.googleapis.com/')
  );
}

/**
 * Check if a photo URL is a base64 data URL
 */
export function isBase64Image(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('data:image/');
}

/**
 * Check if a photo URL is valid for use
 */
export function isValidPhotoUrl(url) {
  if (!url) return false;
  return isFirebaseStorageUrl(url) || isBase64Image(url);
}

/**
 * Get photo URL for a resume
 * Priority: Firebase Storage URL > base64 > null
 */
export function getPhotoUrl(resumeData) {
  const photoUrl = resumeData?.photo;
  
  if (isFirebaseStorageUrl(photoUrl)) {
    // Firebase Storage URL - best option
    return photoUrl;
  } else if (isBase64Image(photoUrl)) {
    // Base64 - temporary preview only
    console.warn('⚠️ Using base64 photo - this will not persist to Firestore');
    return photoUrl;
  } else if (photoUrl && photoUrl.trim() !== '') {
    // Some other URL (LinkedIn, etc.)
    return photoUrl;
  }
  
  return null;
}

/**
 * Prepare photo data for Firestore save
 * Removes large base64 images to prevent document size limits
 */
export function preparePhotoForFirestore(photoUrl) {
  if (!photoUrl) return null;
  
  // Allow Firebase Storage URLs (small)
  if (isFirebaseStorageUrl(photoUrl)) {
    return photoUrl;
  }
  
  // Block large base64 images (>500KB)
  if (isBase64Image(photoUrl) && photoUrl.length > 500000) {
    console.warn('⚠️ Skipping large base64 photo for Firestore save');
    return null;
  }
  
  // Allow other URLs (LinkedIn, external, etc.)
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  
  // Allow small base64 images (for backward compatibility with anonymous users)
  if (isBase64Image(photoUrl)) {
    return photoUrl;
  }
  
  return null;
}

/**
 * Fetch photo URL from API
 */
export async function fetchResumePhoto(userId, resumeId) {
  try {
    const params = new URLSearchParams({ userId });
    if (resumeId) params.append('resumeId', resumeId);
    
    const response = await fetch(`/api/upload-resume-photo?${params}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.photoUrl : null;
  } catch (error) {
    console.error('Failed to fetch resume photo:', error);
    return null;
  }
}

/**
 * Upload photo to Firebase Storage
 */
export async function uploadResumePhoto(file, userId, resumeId) {
  // Validate file
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }
  
  // Upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  if (resumeId) formData.append('resumeId', resumeId);
  
  const response = await fetch('/api/upload-resume-photo', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }
  
  const data = await response.json();
  return data.url;
}

/**
 * Ensure resume data has a valid photo reference
 * This should be called before rendering or saving
 */
export function normalizeResumePhoto(resumeData) {
  if (!resumeData) return resumeData;
  
  const photoUrl = getPhotoUrl(resumeData);
  
  return {
    ...resumeData,
    photo: photoUrl
  };
}

/**
 * Photo display settings for different contexts
 */
export const PHOTO_DISPLAY_SETTINGS = {
  preview: {
    maxWidth: '150px',
    maxHeight: '150px',
    objectFit: 'cover',
    borderRadius: '50%'
  },
  pdf: {
    maxWidth: '120px',
    maxHeight: '120px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  form: {
    maxWidth: '200px',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '8px'
  }
};

/**
 * Get photo display style for a context
 */
export function getPhotoDisplayStyle(context = 'preview') {
  return PHOTO_DISPLAY_SETTINGS[context] || PHOTO_DISPLAY_SETTINGS.preview;
}

