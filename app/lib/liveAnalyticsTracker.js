/**
 * Live Analytics Tracker for Customer Support
 * Tracks user interactions and resume parsing data for support team insights
 */

/**
 * Store live analytics data directly in Firestore with deduplication
 * @param {Object} analyticsData - The analytics data to store
 */
export async function storeLiveAnalyticsData(analyticsData) {
  try {
    // Validate input data first
    if (!analyticsData || typeof analyticsData !== 'object') {
      console.error('❌ Invalid analytics data provided:', analyticsData);
      throw new Error('Analytics data must be a valid object');
    }
    
    console.log('📊 Analytics data received:', {
      entryPoint: analyticsData.entryPoint,
      profileEmail: analyticsData.profile?.email,
      profileName: analyticsData.profile?.name,
      hasProfile: !!analyticsData.profile,
      dataType: typeof analyticsData,
      keys: Object.keys(analyticsData)
    });
    
    // Import Firebase admin only when needed (server-side)
    const { adminDb } = await import('../lib/firebase');
    
    // Try deduplication check - but don't let it break storage
    const email = analyticsData.profile?.email;
    const entryPoint = analyticsData.entryPoint;
    
    // Temporarily disable deduplication due to query corruption issue
    const ENABLE_DEDUPLICATION = false; // Disabled until query issue is resolved
    
    if (ENABLE_DEDUPLICATION && email && email !== '') {
      // Create isolated scope for deduplication to prevent data corruption
      try {
        console.log(`🔍 Checking for duplicates by email: ${email}, entryPoint: ${entryPoint}`);
        
        // Isolate the deduplication query in its own scope
        const checkDuplicates = async () => {
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
          const existingQuery = await adminDb
            .collection("live_analytics_data")
            .where("profile.email", "==", email)
            .where("entryPoint", "==", entryPoint)
            .where("createdAt", ">", twoMinutesAgo)
            .limit(1)
            .get();
          
          return existingQuery;
        };
        
        const existingQuery = await checkDuplicates();
        
        if (!existingQuery.empty) {
          console.log(`⚠️ Duplicate entry detected for email ${email} with ${entryPoint}, skipping...`);
          const existingDoc = existingQuery.docs[0];
          return { 
            success: true, 
            id: existingDoc.id, 
            message: `Duplicate entry detected and skipped (${email})`,
            isDuplicate: true 
          };
        }
        
        console.log(`✅ No duplicates found, proceeding with storage`);
      } catch (queryError) {
        console.error(`❌ Error in deduplication query:`, queryError);
        console.log(`⚠️ Deduplication failed, but continuing with storage to avoid data loss`);
        
        // Verify analyticsData is still intact
        if (!analyticsData || typeof analyticsData !== 'object') {
          console.error('❌ CRITICAL: Analytics data corrupted by deduplication error:', typeof analyticsData, analyticsData);
          throw new Error('Analytics data was corrupted during deduplication query');
        }
        
        console.log(`✅ Analytics data verified intact after deduplication error`);
        // Continue with storage
      }
    } else {
      console.log(`⚠️ Deduplication disabled or no email - proceeding directly to storage`);
    }
    
    // Ensure analytics data is still valid after deduplication checks
    if (!analyticsData || typeof analyticsData !== 'object') {
      console.error('❌ Analytics data corrupted after deduplication:', analyticsData);
      throw new Error('Analytics data corrupted during deduplication');
    }
    
    // Add server-side timestamp
    analyticsData.createdAt = new Date();
    analyticsData.updatedAt = new Date();
    
    // Final validation before storing
    if (!analyticsData || typeof analyticsData !== 'object') {
      console.error('❌ Analytics data corrupted before storage:', analyticsData);
      throw new Error('Analytics data corrupted during processing');
    }
    
    // Additional validation for critical fields
    if (!analyticsData.profile || !analyticsData.entryPoint) {
      console.error('❌ Analytics data missing critical fields:', {
        hasProfile: !!analyticsData.profile,
        hasEntryPoint: !!analyticsData.entryPoint,
        dataKeys: Object.keys(analyticsData || {})
      });
      throw new Error('Analytics data missing critical fields');
    }
    
    console.log('💾 About to store analytics data:', {
      entryPoint: analyticsData.entryPoint,
      hasProfile: !!analyticsData.profile,
      hasCreatedAt: !!analyticsData.createdAt,
      dataSize: JSON.stringify(analyticsData).length,
      profileEmail: analyticsData.profile?.email,
      profileName: analyticsData.profile?.name
    });
    
    // Store directly in Firestore with additional error handling
    let docRef;
    try {
      // Create a clean copy to prevent any reference issues
      const cleanAnalyticsData = JSON.parse(JSON.stringify(analyticsData));
      
      docRef = await adminDb.collection("live_analytics_data").add(cleanAnalyticsData);
      console.log(`✅ Live analytics data stored with ID: ${docRef.id}`);
    } catch (firestoreError) {
      console.error('❌ Firestore add operation failed:', firestoreError);
      console.error('❌ Analytics data that failed to store:', JSON.stringify(analyticsData, null, 2));
      throw new Error(`Failed to store in Firestore: ${firestoreError.message}`);
    }
    
    return {
      success: true,
      id: docRef.id,
      message: "Live analytics data stored successfully"
    };
  } catch (error) {
    console.error('❌ Error storing live analytics data:', error);
    throw error;
  }
}

/**
 * Track ATS Score Checker usage
 * @param {Object} resumeData - Parsed resume data from Gemini
 * @param {Object} metadata - Additional metadata (userAgent, url, etc.)
 */
export function trackATSScoreChecker(resumeData, metadata = {}) {
  const analyticsData = {
    entryPoint: 'ats-score-checker',
    pageUrl: metadata.pageUrl || '/ats-score-checker',
    userAgent: metadata.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
    timestamp: new Date().toISOString(),
    location: metadata.location || null,
    ipAddress: metadata.ipAddress || null,
    
    // User Profile Information
    profile: {
      name: resumeData.name || 'Unknown',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      address: resumeData.address || '',
      linkedin: resumeData.linkedin || '',
      portfolio: resumeData.portfolio || '',
      jobTitle: resumeData.jobTitle || '',
      yearsOfExperience: resumeData.yearsOfExperience || 0,
      summary: resumeData.summary || '',
      location: resumeData.location || 'Unknown',
    },
    
    // Professional Information
    experience: resumeData.experience || [],
    education: resumeData.education || [],
    skills: resumeData.skills || [],
    certifications: resumeData.certifications || [],
    languages: resumeData.languages || [],
    customSections: resumeData.customSections || [],
    
    // Analytics Metadata
    sessionId: metadata.sessionId || generateSessionId(),
    deviceType: getDeviceType(metadata.userAgent),
    browserInfo: getBrowserInfo(metadata.userAgent),
    referrer: metadata.referrer || '',
    
    // Support Flags
    supportStatus: 'new', // new, contacted, converted, closed
    supportPriority: calculatePriority(resumeData),
    supportNotes: [],
    contactAttempts: [],
    assignedAgent: null, // Agent who claimed this lead
    
    // Performance Tracking
    firstContactTime: null,
    conversionTime: null,
    totalCallDuration: 0,
    callCount: 0,
    emailCount: 0,
    whatsappCount: 0,
    
    // Revenue Tracking
    conversionValue: 0, // Amount if converted
    planType: null, // monthly, yearly, trial converted to
    
    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActiveAt: new Date(),
  };

  return storeLiveAnalyticsData(analyticsData);
}

/**
 * Track Upload Resume usage
 * @param {Object} resumeData - Parsed resume data from Gemini
 * @param {Object} metadata - Additional metadata
 */
export function trackUploadResume(resumeData, metadata = {}) {
  // Validate input data
  if (!resumeData || typeof resumeData !== 'object') {
    console.error('❌ Invalid resume data provided to trackUploadResume:', resumeData);
    throw new Error('Resume data must be a valid object');
  }
  
  console.log('📝 Tracking upload resume for:', {
    name: resumeData.name,
    email: resumeData.email,
    entryPoint: metadata.entryPoint,
    hasMetadata: !!metadata,
    metadataKeys: Object.keys(metadata)
  });
  
  const analyticsData = {
    entryPoint: metadata.entryPoint || 'upload-resume',
    pageUrl: metadata.pageUrl || '/upload-resume',
    userAgent: metadata.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
    timestamp: new Date().toISOString(),
    location: metadata.location || null,
    ipAddress: metadata.ipAddress || null,
    
    // User Profile Information
    profile: {
      name: resumeData.name || 'Unknown',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      address: resumeData.address || '',
      linkedin: resumeData.linkedin || '',
      portfolio: resumeData.portfolio || '',
      jobTitle: resumeData.jobTitle || '',
      yearsOfExperience: resumeData.yearsOfExperience || 0,
      summary: resumeData.summary || '',
    },
    
    // Professional Information
    experience: resumeData.experience || [],
    education: resumeData.education || [],
    skills: resumeData.skills || [],
    certifications: resumeData.certifications || [],
    languages: resumeData.languages || [],
    customSections: resumeData.customSections || [],
    
    // Analytics Metadata
    sessionId: metadata.sessionId || generateSessionId(),
    deviceType: getDeviceType(metadata.userAgent),
    browserInfo: getBrowserInfo(metadata.userAgent),
    referrer: metadata.referrer || '',
    
    // Support Flags
    supportStatus: 'new',
    supportPriority: calculatePriority(resumeData),
    supportNotes: [],
    contactAttempts: [],
    assignedAgent: null, // Agent who claimed this lead
    
    // Performance Tracking
    firstContactTime: null,
    conversionTime: null,
    totalCallDuration: 0,
    callCount: 0,
    emailCount: 0,
    whatsappCount: 0,
    
    // Revenue Tracking
    conversionValue: 0, // Amount if converted
    planType: null, // monthly, yearly, trial converted to
    
    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActiveAt: new Date(),
  };

  return storeLiveAnalyticsData(analyticsData);
}

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Determine device type from user agent
 */
function getDeviceType(userAgent = '') {
  if (!userAgent) return 'unknown';
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

/**
 * Extract browser information from user agent
 */
function getBrowserInfo(userAgent = '') {
  if (!userAgent) return { name: 'unknown', version: 'unknown' };
  
  let browserName = 'unknown';
  let browserVersion = 'unknown';
  
  if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'unknown';
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'unknown';
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'unknown';
  } else if (userAgent.includes('Edge')) {
    browserName = 'Edge';
    const match = userAgent.match(/Edge\/(\d+)/);
    browserVersion = match ? match[1] : 'unknown';
  }
  
  return { name: browserName, version: browserVersion };
}

/**
 * Calculate support priority based on resume data
 */
function calculatePriority(resumeData) {
  let priority = 'medium';
  
  // High priority if experienced professional
  if (resumeData.yearsOfExperience >= 5) priority = 'high';
  
  // High priority if has contact info
  if (resumeData.email && resumeData.phone) priority = 'high';
  
  // Medium priority if has some experience
  if (resumeData.yearsOfExperience >= 2 && resumeData.yearsOfExperience < 5) priority = 'medium';
  
  // Low priority if entry level
  if (resumeData.yearsOfExperience < 2) priority = 'low';
  
  return priority;
}

/**
 * Update analytics record with support actions
 * @param {string} recordId - The record ID to update
 * @param {Object} updates - Updates to apply
 * @param {boolean} isServerSide - Whether this is called from server-side
 */
export async function updateAnalyticsRecord(recordId, updates, isServerSide = false) {
  try {
    if (isServerSide) {
      // Direct Firestore update for server-side calls
      const { adminDb } = await import('../lib/firebase');
      
      const updateData = {
        ...updates,
        updatedAt: new Date(),
        lastActiveAt: new Date(),
      };
      
      await adminDb.collection("live_analytics_data").doc(recordId).update(updateData);
      
      console.log(`✅ Analytics record updated with ID: ${recordId}`);
      return {
        success: true,
        message: "Analytics record updated successfully"
      };
    } else {
      // Client-side HTTP call
      const response = await fetch(`/api/live-analytics-data/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date(),
          lastActiveAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update analytics record: ${response.statusText}`);
      }

      return await response.json();
    }
  } catch (error) {
    console.error('❌ Error updating analytics record:', error);
    throw error;
  }
}
