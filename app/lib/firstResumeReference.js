/**
 * Utility for storing first resume reference with client-side caching
 * Prevents duplicate API calls for the same user
 */

// Cache to track if we've already stored first resume reference for a user
const firstResumeReferenceCache = new Set();

// Cache to track ongoing requests to prevent duplicate calls
const ongoingRequests = new Set();

/**
 * Store first resume reference for a user (with caching)
 * @param {string} userId - User ID
 * @param {Object} resumeData - Resume data with name, email, phone
 * @param {string} source - Source of the call (for tracking)
 * @returns {Promise<Object>} API response
 */
export async function storeFirstResumeReference(userId, resumeData, source = "unknown") {
  // Create a unique key for this user and data combination
  const cacheKey = `${userId}-${resumeData.name || ''}-${resumeData.email || ''}-${resumeData.phone || ''}`;

  // Check if we've already stored this reference
  if (firstResumeReferenceCache.has(cacheKey)) {
    console.log(`First resume reference already cached for user ${userId}, skipping API call`);
    return {
      message: "First resume reference already cached",
      stored: false,
      cached: true
    };
  }

  // Check if we've already stored any reference for this user (regardless of data)
  const userCacheKey = `user-${userId}`;
  if (firstResumeReferenceCache.has(userCacheKey)) {
    console.log(`First resume reference already stored for user ${userId}, skipping API call`);
    return {
      message: "First resume reference already stored for user",
      stored: false,
      cached: true
    };
  }

  // Check if there's already an ongoing request for this user
  if (ongoingRequests.has(userId)) {
    console.log(`First resume reference request already in progress for user ${userId}, skipping duplicate call`);
    return {
      message: "First resume reference request already in progress",
      stored: false,
      inProgress: true
    };
  }

  try {
    // Mark request as ongoing
    ongoingRequests.add(userId);

    const response = await fetch("/api/store-first-resume-reference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        resumeData,
        source
      }),
    });

    const result = await response.json();

    // If successful or already exists, add to cache
    if (result.stored || result.alreadyExists) {
      firstResumeReferenceCache.add(userCacheKey);
      console.log(`First resume reference ${result.stored ? 'stored and' : 'already exists and'} cached for user ${userId}`);
    }

    return result;
  } catch (error) {
    console.error("Error storing first resume reference:", error);
    return {
      error: "Failed to store first resume reference",
      details: error.message
    };
  } finally {
    // Remove from ongoing requests
    ongoingRequests.delete(userId);
  }
}

/**
 * Check if first resume reference has been stored for a user
 * @param {string} userId - User ID
 * @returns {boolean} True if already stored
 */
export function hasFirstResumeReference(userId) {
  const userCacheKey = `user-${userId}`;
  return firstResumeReferenceCache.has(userCacheKey);
}

// Helper to normalize string for comparison
const normalize = (str) => String(str || "").toLowerCase().trim();

/**
 * Check if a resume matches the user's first resume reference
 * @param {Object} resumeData - The resume data being checked (must have name, email, or phone)
 * @param {Object|null} firstReference - The stored first resume reference from user profile
 * @returns {Object} { isOwner: boolean, reason: string | null }
 */
export function isResumeOwner(resumeData, firstReference) {
  // If no first reference exists yet, we assume this WILL BE the first reference
  // So we allow it (ownership check passes)
  if (!firstReference) {
    return { isOwner: true, reason: null };
  }

  // If no resume data provided, we can't verify
  if (!resumeData) {
    return { isOwner: true, reason: "No resume data to verify" };
  }

  const name = normalize(resumeData.name);
  // Email and phone are no longer used for ownership check - only name
  // const email = normalize(resumeData.email);
  // const phone = normalize(resumeData.phone);

  // 0. Exempt Sample Profile (John Doe)
  if (name === "john doe") {
    return { isOwner: true, reason: "Sample profile" };
  }

  // Helper to check a single reference object
  // LIGHT CHECK: Only check name to prevent downloading resume for someone else
  const checkSingleReference = (ref) => {
    if (!ref) return false;

    // CASUALTY CHECK: If existing reference is effectively empty (bad capture), allow it.
    if (!ref.name && !ref.email && !ref.phone) {
      return true;
    }

    const refName = normalize(ref.name);

    // NAME-ONLY CHECK: Simple name match (case-insensitive, trimmed)
    if (name && refName && name === refName) {
      return true;
    }

    return false;
  };

  // Handle Collection (Array)
  if (Array.isArray(firstReference)) {
    // Check if ANY of the references match
    const match = firstReference.some(ref => checkSingleReference(ref));
    if (match) {
      return { isOwner: true, reason: "Match found in profile collection" };
    }

    // Construct expected names list for error message
    const expectedNames = firstReference
      .map(ref => ref.name)
      .filter(Boolean)
      .join(", ");

    return {
      isOwner: false,
      reason: `Identity mismatch. Expected one of: ${expectedNames || 'registered profiles'}`
    };
  }

  // Handle Single Object (Legacy)
  if (checkSingleReference(firstReference)) {
    return { isOwner: true, reason: "Match found" };
  }

  if (name || email) {
    return {
      isOwner: false,
      reason: `Identity mismatch. Expected: ${firstReference.name || 'primary profile'}`
    };
  }

  // Fallback
  return { isOwner: true, reason: "No identifying data in resume" };
}

/**
 * Clear cache for a user (useful for testing or user logout)
 * @param {string} userId - User ID
 */
export function clearFirstResumeReferenceCache(userId) {
  const userCacheKey = `user-${userId}`;
  firstResumeReferenceCache.delete(userCacheKey);
  console.log(`Cleared first resume reference cache for user ${userId}`);
}

/**
 * Clear all cache (useful for testing)
 */
export function clearAllFirstResumeReferenceCache() {
  firstResumeReferenceCache.clear();
  console.log("Cleared all first resume reference cache");
}
