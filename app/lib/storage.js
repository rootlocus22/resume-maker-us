import { doc, collection, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { cleanResumeDataForFirebase } from "./utils";
import { saveGuestData } from "../actions/guestData";


export const DEFAULT_RESUME_DATA = {
  name: "John Doe",
  email: "john.doe@example.com",
  jobTitle: "Staff Software Engineer",
  phone: "+1 (123) 456-7890",
  address: "123 Main St, New York, NY 10001",
  linkedin: "https://linkedin.com/in/johndoe",
  portfolio: "https://johndoeportfolio.com",
  summary:
    "Results-driven software engineer with 5+ years of experience in building scalable web applications. Proficient in JavaScript, React, and Node.js. Passionate about solving complex problems and delivering high-quality solutions.",
  experience: [
    {
      jobTitle: "Senior Software Engineer",
      company: "Tech Corp Inc.",
      startDate: "Jan 2020",
      endDate: "Present",
      location: "New York, NY",
      description:
        "Led a team of 5 developers to build and maintain a scalable e-commerce platform. Implemented microservices architecture, reducing system downtime by 30%. Mentored junior developers and conducted code reviews.",
    },
    {
      jobTitle: "Software Engineer",
      company: "Innovate Solutions",
      startDate: "Jun 2017",
      endDate: "Dec 2019",
      location: "San Francisco, CA",
      description:
        "Developed and maintained RESTful APIs for a SaaS product. Collaborated with cross-functional teams to deliver features on time. Improved application performance by optimizing database queries.",
    },
  ],
  education: [
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "Aug 2013",
      endDate: "May 2017",
      gpa: "3.8",
    },
  ],
  skills: [
    { name: "JavaScript", proficiency: "Expert" },
    { name: "React", proficiency: "Expert" },
    { name: "Node.js", proficiency: "Advanced" },
    { name: "Python", proficiency: "Intermediate" },
    { name: "SQL", proficiency: "Advanced" },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "Aug 2021",
    },
    {
      name: "React Nanodegree",
      issuer: "Udacity",
      date: "Mar 2020",
    },
  ],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Spanish", proficiency: "Intermediate" },
  ],
  customSections: [
    {
      type: "reference",
      title: "Professional Reference",
      description: "",
      date: "",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      phone: "+1 (987) 654-3210",
      customSectionAttempts: 0,
    },
    {
      type: "project",
      title: "E-Commerce Platform",
      description: "Developed a scalable e-commerce solution using React and Node.js.",
      date: "Jun 2022",
      customSectionAttempts: 0,
    },
    {
      type: "award",
      title: "Best Developer Award",
      description: "Recognized for outstanding contributions to team projects.",
      date: "Dec 2021",
      customSectionAttempts: 0,
    },
  ],
  customSectionAttempts: 0,
};

export const DEFAULT_COVER_LETTER_DATA = {
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "+1 (555) 123-4567",
  location: "New York, NY",
  recipient: "Dear Hiring Manager",
  jobTitle: "Senior Software Engineer",
  company: "TechCorp Inc.",
  intro: "I am writing to express my strong interest in the Senior Software Engineer position at TechCorp Inc. With over 5 years of experience in full-stack development and a proven track record of delivering scalable solutions, I am confident in my ability to contribute significantly to your engineering team and help drive innovation in your product development initiatives.",
  body: "In my current role at InnovateTech Solutions, I have successfully led the development of a microservices-based e-commerce platform that serves over 100,000 users daily. Through strategic implementation of React.js, Node.js, and AWS services, I achieved a 40% improvement in application performance and a 25% reduction in deployment time. My experience includes mentoring junior developers, conducting code reviews, and collaborating with cross-functional teams to deliver high-quality software solutions that align with business objectives. I am particularly excited about TechCorp's mission to revolutionize digital experiences, and I believe my expertise in modern web technologies and agile methodologies would be valuable in achieving your company's goals.",
  closing: "Thank you for considering my application. I would welcome the opportunity to discuss how my technical skills, leadership experience, and passion for innovation align with TechCorp's vision. I am available for an interview at your convenience and look forward to the possibility of contributing to your team's success. Please feel free to contact me to schedule a conversation.",
};

// Helper to normalize all date fields in resume data
function normalizeDateField(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const trimmed = dateStr.trim();
  // Handle compact numeric formats
  if (/^\d{8}$/.test(trimmed)) {
    // YYYYMMDD → YYYY-MM-DD
    return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
  }
  if (/^\d{6}$/.test(trimmed)) {
    // YYYYMM → YYYY-MM
    return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed; // yyyy-MM-dd
  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed; // yyyy-MM
  if (/^\d{4}$/.test(trimmed)) return trimmed; // yyyy
  // Try to parse common formats
  const parts = trimmed.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
  if (parts) return `${parts[1]}-${parts[2]}-${parts[3]}`;
  const ym = trimmed.match(/^(\d{4})[\/-](\d{2})$/);
  if (ym) return `${ym[1]}-${ym[2]}`;
  // Try to parse month names (e.g., Jan 2020, January 2020)
  const monthMap = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
  const mmyyyy = trimmed.match(/^([A-Za-z]{3,9})[ .,-]+(\d{4})$/);
  if (mmyyyy) {
    const month = monthMap[mmyyyy[1].slice(0, 3)];
    if (month) return `${mmyyyy[2]}-${month}`;
  }
  // If it's just a year
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  // Fallback: return as-is
  return trimmed;
}

export function normalizeResumeDates(data) {
  if (!data || typeof data !== 'object') return data;
  const norm = { ...data };
  if (Array.isArray(norm.experience)) {
    norm.experience = norm.experience.map(exp => ({
      ...exp,
      startDate: normalizeDateField(exp.startDate),
      endDate: normalizeDateField(exp.endDate),
    }));
  }
  if (Array.isArray(norm.education)) {
    norm.education = norm.education.map(edu => ({
      ...edu,
      startDate: normalizeDateField(edu.startDate),
      endDate: normalizeDateField(edu.endDate),
    }));
  }
  if (Array.isArray(norm.certifications)) {
    norm.certifications = norm.certifications.map(cert => ({
      ...cert,
      date: normalizeDateField(cert.date),
    }));
  }
  if (Array.isArray(norm.customSections)) {
    norm.customSections = norm.customSections.map(cs => ({
      ...cs,
      date: normalizeDateField(cs.date),
    }));
  }
  return norm;
}

// Helper for safe localStorage operations (handles SecurityError and QuotaExceededError)
export const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`LocalStorage access denied (getItem): ${key}`, e);
      return null;
    }
  },
  setItem: (key, value) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
        console.warn(`LocalStorage quota exceeded for ${key}. Clearing old cache to make space.`);
        try {
          // Emergency: Clear less critical items
          localStorage.removeItem("preAuthStates");
          localStorage.removeItem("indiaAnonymousResumeData");
          localStorage.removeItem("workingResumeState");
          localStorage.setItem(key, value); // Retry
        } catch (retryError) {
          console.error("Failed to recover from storage quota error:", retryError);
        }
      } else {
        console.warn(`LocalStorage access denied (setItem): ${key}`, e);
      }
    }
  },
  removeItem: (key) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`LocalStorage access denied (removeItem): ${key}`, e);
    }
  }
};

export const safeSessionStorage = {
  getItem: (key) => {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn(`SessionStorage access denied (getItem): ${key}`, e);
      return null;
    }
  },
  setItem: (key, value) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn(`SessionStorage access denied (setItem): ${key}`, e);
    }
  },
  removeItem: (key) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn(`SessionStorage access denied (removeItem): ${key}`, e);
    }
  }
};

// Internal backward compatibility helper
const safeSetItem = (key, value) => safeLocalStorage.setItem(key, value);

export const saveResume = (data) => {
  // Only run in browser environment
  if (typeof window !== "undefined") {
    safeLocalStorage.setItem("resumeData", JSON.stringify(normalizeResumeDates(data)));
    // Mark that we have active resume data to prevent auto-clearing
    safeLocalStorage.setItem("hasActiveResumeData", "true");
  }
};

export const loadResume = () => {
  // Only run in browser environment
  if (typeof window !== "undefined") {
    // Check if we have active resume data that shouldn't be cleared
    const hasActiveData = safeLocalStorage.getItem("hasActiveResumeData") === "true";

    // Check for a session flag or timestamp to determine fresh request
    const lastVisit = safeLocalStorage.getItem("lastVisit");
    const now = Date.now();
    const isFreshRequest = !lastVisit || (now - parseInt(lastVisit, 10) > 24 * 60 * 60 * 1000); // Clear if more than 24 hours

    // Only clear localStorage if it's a fresh request AND we don't have active resume data
    if (isFreshRequest && !hasActiveData) {
      // Clear only specific resume-related data, not everything
      safeLocalStorage.removeItem("resumeData");
      safeLocalStorage.removeItem("coverLetterDraft");
      safeLocalStorage.removeItem("bannerDismissed");
      // Don't clear workingResumeState, preAuthState, or other important session data
      safeLocalStorage.setItem("lastVisit", now.toString()); // Update last visit timestamp
      return { ...DEFAULT_RESUME_DATA }; // Return a fresh copy of default data
    }

    // Update last visit timestamp but don't clear data
    if (isFreshRequest && hasActiveData) {
      safeLocalStorage.setItem("lastVisit", now.toString());
    }

    const storedData = safeLocalStorage.getItem("resumeData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Check and initialize customSections if not found or invalid
        const result = { ...parsedData };
        if (!result.customSections || !Array.isArray(result.customSections)) {
          result.customSections = [...DEFAULT_RESUME_DATA.customSections];
        }
        return result;
      } catch (e) {
        console.error("Error parsing localStorage data:", e);
        return { ...DEFAULT_RESUME_DATA }; // Fallback to default on parse error
      }
    }
    return { ...DEFAULT_RESUME_DATA }; // Return default if no stored data
  }
  // Return default data during SSR
  return { ...DEFAULT_RESUME_DATA };
};

// Helper to get or create a session ID
export const getOrCreateSessionId = () => {
  if (typeof window !== "undefined") {
    let sessionId = safeLocalStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      safeLocalStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  }
  return null;
};

// Load working resume state (draft)
export const loadWorkingResume = () => {
  if (typeof window !== "undefined") {
    const stored = safeLocalStorage.getItem("workingResumeState");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing working resume state:", e);
        return null;
      }
    }
  }
  return null;
};

export const markResumeAsActive = () => {
  if (typeof window !== "undefined") {
    safeLocalStorage.setItem("hasActiveResumeData", "true");
  }
};

export const clearActiveResumeMarker = () => {
  if (typeof window !== "undefined") {
    safeLocalStorage.removeItem("hasActiveResumeData");
  }
};

// Load and clear pre-auth state (used after login/signup)
export const loadAndClearPreAuthState = () => {
  if (typeof window !== "undefined") {
    const stored = safeLocalStorage.getItem("preAuthState");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Clear it so it's only used once
        safeLocalStorage.removeItem("preAuthState");
        return parsed;
      } catch (e) {
        console.error("Error parsing pre-auth state:", e);
        return null;
      }
    }
  }
  return null;
};

// ... existing code ...

// Save working resume state with metadata for session persistence
export const saveWorkingResume = (data, source = "manual", metadata = {}) => {
  if (typeof window !== "undefined") {
    const workingResumeState = {
      data: normalizeResumeDates(data),
      source, // "upload", "manual", "ai_enhanced", etc.
      timestamp: Date.now(),
      sessionId: getOrCreateSessionId(),
      metadata: {
        template: metadata.template || "visual_modern_executive",
        preferences: metadata.preferences || {},
        customColors: metadata.customColors || {},
        ...metadata
      }
    };

    safeSetItem("workingResumeState", JSON.stringify(workingResumeState));
    safeLocalStorage.setItem("hasActiveResumeData", "true");

    // Also save to regular resumeData for backward compatibility
    saveResume(data);
  }
};

// ... existing code ...

// Save user state before signup/login for restoration after authentication
export const savePreAuthState = (resumeData, currentPage, additionalData = {}) => {
  if (typeof window !== "undefined") {
    const sessionId = getOrCreateSessionId();
    const timestamp = Date.now();

    // Get existing pre-auth states (support multiple sessions)
    const existingStates = JSON.parse(safeLocalStorage.getItem("preAuthStates") || "[]");

    const preAuthState = {
      resumeData,
      currentPage,
      timestamp,
      sessionId,
      additionalData,
      id: `preauth_${timestamp}_${Math.random().toString(36).substr(2, 6)}`
    };

    // Add to the array of pre-auth states
    existingStates.push(preAuthState);

    // Keep only the last 3 sessions to prevent excessive storage (Reduced from 5)
    const recentStates = existingStates.slice(-3);

    safeLocalStorage.setItem("preAuthStates", JSON.stringify(recentStates));

    // Also save the most recent one in the old format for backward compatibility
    safeLocalStorage.setItem("preAuthState", JSON.stringify(preAuthState));
  }
};

// ... existing code ...

// Update working resume metadata (template, preferences, etc.) without changing the data
export const updateWorkingResumeMetadata = (metadata) => {
  if (typeof window !== "undefined") {
    const workingState = loadWorkingResume();
    if (workingState) {
      workingState.metadata = { ...workingState.metadata, ...metadata };
      workingState.timestamp = Date.now();
      safeSetItem("workingResumeState", JSON.stringify(workingState));
    }
  }
};

// Check if user has active resume work in progress
export const hasActiveResumeWork = () => {
  if (typeof window !== "undefined") {
    const workingState = loadWorkingResume();
    return workingState && workingState.data && (
      workingState.data.name ||
      workingState.data.email ||
      workingState.data.experience?.length > 0 ||
      workingState.data.education?.length > 0
    );
  }
  return false;
};

// Convenience function for saving resume data from ATS checker or other sources
export const saveResumeData = (data, source = "ats_checker") => {
  saveWorkingResume(data, source, {
    template: "visual_modern_executive",
    preferences: {},
    customColors: {},
    language: "en",
    country: "us"
  });
};

// Convenience function for loading resume data
export const loadResumeData = () => {
  const workingState = loadWorkingResume();
  if (workingState && workingState.data) {
    return workingState.data;
  }
  return loadResume();
};

// ===== RESUME VERSION MANAGEMENT SYSTEM =====

// Get all resume versions for the current user/session
export const getResumeVersions = () => {
  if (typeof window !== "undefined") {
    const versions = safeLocalStorage.getItem("resumeVersions");
    if (versions) {
      try {
        return JSON.parse(versions);
      } catch (e) {
        console.error("Error parsing resume versions:", e);
        return {};
      }
    }
  }
  return {};
};

// Save resume versions - MOVED HERE AND UPDATED
const saveResumeVersionsInternal = (versions) => {
  if (typeof window !== "undefined") {
    safeLocalStorage.setItem("resumeVersions", JSON.stringify(versions));
  }
};
// Export for external use
export const saveResumeVersions = saveResumeVersionsInternal;


// Get the active resume version ID
export const getActiveResumeVersion = () => {
  if (typeof window !== "undefined") {
    return safeLocalStorage.getItem("activeResumeVersion") || "default";
  }
  return "default";
};

// Set the active resume version
export const setActiveResumeVersion = (versionId) => {
  if (typeof window !== "undefined") {
    safeLocalStorage.setItem("activeResumeVersion", versionId);

    // Load the active version data into working state
    const versions = getResumeVersions();
    if (versions[versionId]) {
      saveWorkingResume(
        versions[versionId].data,
        "version_switch",
        versions[versionId].metadata
      );
    }
  }
};

// Create a new resume version
export const createResumeVersion = (name, data = null, metadata = {}) => {
  if (typeof window !== "undefined") {
    const versions = getResumeVersions();
    const versionId = `version_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newVersion = {
      id: versionId,
      name: name || `Resume Version ${Object.keys(versions).length + 1}`,
      data: data || { ...DEFAULT_RESUME_DATA },
      metadata: {
        template: "visual_modern_executive",
        preferences: {},
        customColors: {},
        language: "en",
        country: "us",
        ...metadata
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        atsScore: null,
        lastViewed: new Date().toISOString(),
        editCount: 0
      }
    };

    versions[versionId] = newVersion;
    saveResumeVersionsInternal(versions);

    // If this is the first version, make it active
    if (Object.keys(versions).length === 1) {
      setActiveResumeVersion(versionId);
    }

    return versionId;
  }
  return null;
};

// Update an existing resume version
export const updateResumeVersion = (versionId, updates) => {
  if (typeof window !== "undefined") {
    const versions = getResumeVersions();
    if (versions[versionId]) {
      versions[versionId] = {
        ...versions[versionId],
        ...updates,
        updatedAt: new Date().toISOString(),
        stats: {
          ...versions[versionId].stats,
          editCount: (versions[versionId].stats?.editCount || 0) + 1
        }
      };
      saveResumeVersionsInternal(versions);

      // If this is the active version, update working state
      if (getActiveResumeVersion() === versionId) {
        saveWorkingResume(
          versions[versionId].data,
          "version_update",
          versions[versionId].metadata
        );
      }
    }
  }
};

// Delete a resume version
export const deleteResumeVersion = (versionId) => {
  if (typeof window !== "undefined") {
    const versions = getResumeVersions();
    if (versions[versionId]) {
      delete versions[versionId];
      saveResumeVersionsInternal(versions);

      // If we deleted the active version, switch to another one
      if (getActiveResumeVersion() === versionId) {
        const remainingVersions = Object.keys(versions);
        if (remainingVersions.length > 0) {
          setActiveResumeVersion(remainingVersions[0]);
        } else {
          // No versions left, create a default one
          const newVersionId = createResumeVersion("My Resume");
          setActiveResumeVersion(newVersionId);
        }
      }
    }
  }
};

// Get the current active resume data
export const getActiveResumeData = () => {
  const activeVersionId = getActiveResumeVersion();
  const versions = getResumeVersions();

  if (versions[activeVersionId]) {
    return {
      versionId: activeVersionId,
      ...versions[activeVersionId]
    };
  }

  // No active version found, create default
  const defaultVersionId = createResumeVersion("My Resume");
  return {
    versionId: defaultVersionId,
    ...getResumeVersions()[defaultVersionId]
  };
};

// Update active resume data (convenience function)
export const updateActiveResumeData = (data, metadata = {}) => {
  const activeVersionId = getActiveResumeVersion();
  updateResumeVersion(activeVersionId, { data, metadata });
};

// Update active resume stats (ATS score, last viewed, etc.)
export const updateActiveResumeStats = (stats) => {
  const activeVersionId = getActiveResumeVersion();
  const versions = getResumeVersions();
  if (versions[activeVersionId]) {
    versions[activeVersionId].stats = {
      ...versions[activeVersionId].stats,
      ...stats
    };
    saveResumeVersionsInternal(versions);
  }
};

// Duplicate a resume version
export const duplicateResumeVersion = (versionId, newName = null) => {
  const versions = getResumeVersions();
  if (versions[versionId]) {
    const originalVersion = versions[versionId];
    const duplicatedName = newName || `${originalVersion.name} (Copy)`;

    return createResumeVersion(
      duplicatedName,
      { ...originalVersion.data },
      { ...originalVersion.metadata }
    );
  }
  return null;
};

// Initialize resume versions system (call this on app startup)
export const initializeResumeVersions = () => {
  if (typeof window !== "undefined") {
    const versions = getResumeVersions();

    // If no versions exist, create a default one
    if (Object.keys(versions).length === 0) {
      const workingState = loadWorkingResume();
      const resumeData = workingState?.data || loadResume();

      const defaultVersionId = createResumeVersion(
        "My Resume",
        resumeData,
        workingState?.metadata || {}
      );
      setActiveResumeVersion(defaultVersionId);
    }
  }
};

// Get resume version summary for UI display
export const getResumeVersionSummary = (versionId) => {
  const versions = getResumeVersions();
  const version = versions[versionId];

  if (!version) return null;

  return {
    id: versionId,
    name: version.name,
    isActive: getActiveResumeVersion() === versionId,
    atsScore: version.stats?.atsScore,
    lastUpdated: version.updatedAt,
    template: version.metadata?.template || "visual_modern_executive",
    summary: version.data?.summary?.substring(0, 100) + "..." || "No summary",
    experience: version.data?.experience?.length || 0,
    skills: version.data?.skills?.length || 0
  };
};

// Enhanced function to save resume data with automatic pre-auth state management
export const saveResumeDataWithPreAuth = (data, source = "upload", page = "ats_checker") => {
  // Always save to working resume
  saveResumeData(normalizeResumeDates(data), source);

  // If user is not logged in, also save to pre-auth state
  if (typeof window !== "undefined") {
    const user = JSON.parse(safeLocalStorage.getItem("user") || "null");
    if (!user) {
      savePreAuthState(normalizeResumeDates(data), page, {
        source,
        template: "visual_modern_executive",
        preferences: {},
        customColors: {},
        language: "en",
        country: "us"
      });
    }
  }
};

// ... existing code ...

// Save anonymous resume data specifically for India location users
export const saveAnonymousResumeForIndia = (data, source = "manual", metadata = {}) => {
  if (typeof window !== "undefined") {
    const anonymousResumeData = {
      data: normalizeResumeDates(data),
      source, // "form_builder", "upload", "manual", etc.
      timestamp: Date.now(),
      sessionId: getOrCreateSessionId(),
      metadata: {
        template: metadata.template || "visual_modern_executive",
        preferences: metadata.preferences || {},
        customColors: metadata.customColors || {},
        language: metadata.language || "en",
        country: metadata.country || "in",
        includeCoverLetter: metadata.includeCoverLetter || false,
        coverLetterTemplate: metadata.coverLetterTemplate || "classic",
        coverLetterData: metadata.coverLetterData || {},
        ...metadata
      }
    };

    safeLocalStorage.setItem("indiaAnonymousResumeData", JSON.stringify(anonymousResumeData));
    safeLocalStorage.setItem("hasActiveResumeData", "true");

    // Also save to regular resumeData for backward compatibility
    saveResume(data);

    console.log("Saved anonymous resume data for India user:", source);
  }
};

// Load anonymous resume data for India location users
export const loadAnonymousResumeForIndia = () => {
  if (typeof window !== "undefined") {
    const anonymousData = safeLocalStorage.getItem("indiaAnonymousResumeData");
    if (anonymousData) {
      try {
        const parsed = JSON.parse(anonymousData);
        // Check if the data is still valid (within 7 days for India users)
        const isDataValid = Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000;
        if (isDataValid) {
          console.log("Loaded anonymous resume data for India user:", parsed.source);
          return parsed;
        } else {
          // Clear expired data
          clearAnonymousResumeForIndia();
        }
      } catch (e) {
        console.error("Error parsing anonymous resume data:", e);
        clearAnonymousResumeForIndia();
      }
    }
  }
  return null;
};



// Clear anonymous resume data for India location users
export const clearAnonymousResumeForIndia = () => {
  if (typeof window !== "undefined") {
    safeLocalStorage.removeItem("indiaAnonymousResumeData");
  }
};

// Check if user has anonymous resume data for India
export const hasAnonymousResumeForIndia = () => {
  if (typeof window !== "undefined") {
    const anonymousData = loadAnonymousResumeForIndia();
    return anonymousData && anonymousData.data && (
      anonymousData.data.name ||
      anonymousData.data.email ||
      anonymousData.data.experience?.length > 0 ||
      anonymousData.data.education?.length > 0 ||
      anonymousData.data.skills?.length > 0
    );
  }
  return false;
};

// Save resume data with India-specific handling for anonymous users
export const saveResumeDataWithIndiaHandling = (data, source = "manual", metadata = {}, countryCode = "IN") => {
  // Always save to working resume
  saveWorkingResume(data, source, metadata);

  // For India location anonymous users, save to special storage
  if (countryCode === "IN" && typeof window !== "undefined") {
    const user = JSON.parse(safeLocalStorage.getItem("user") || "null");
    if (!user) {
      saveAnonymousResumeForIndia(data, source, metadata);
    }
  }

  // Also save to pre-auth state for all anonymous users
  if (typeof window !== "undefined") {
    const user = JSON.parse(safeLocalStorage.getItem("user") || "null");
    if (!user) {
      savePreAuthState(normalizeResumeDates(data), "resume_builder", {
        source,
        template: metadata.template || "visual_modern_executive",
        preferences: metadata.preferences || {},
        customColors: metadata.customColors || {},
        language: metadata.language || "en",
        country: metadata.country || "in",
        includeCoverLetter: metadata.includeCoverLetter || false,
        coverLetterTemplate: metadata.coverLetterTemplate || "classic",
        coverLetterData: metadata.coverLetterData || {}
      });

      // Sync to Firestore for guest persistence
      const clientId = getOrCreateSessionId();
      saveGuestData(clientId, {
        resumeData: data,
        metadata: { ...metadata, source },
        timestamp: Date.now()
      }).catch(err => console.error("Guest sync failed:", err));
    }
  }
};

// Restore anonymous resume data when user logs in (India-specific)
export const restoreAnonymousResumeOnLogin = (userId) => {
  if (typeof window !== "undefined") {
    const anonymousData = loadAnonymousResumeForIndia();
    if (anonymousData && anonymousData.data) {
      // Save the anonymous data to Firestore for the logged-in user
      const resumeRef = doc(collection(db, "users", userId, "resumes"));
      const dataToSave = {
        resumeName: "My Resume",
        resumeData: cleanResumeDataForFirebase(anonymousData.data),
        customColors: anonymousData.metadata.customColors || {},
        template: anonymousData.metadata.template || "visual_modern_executive",
        language: anonymousData.metadata.language || "en",
        country: anonymousData.metadata.country || "in",
        preferences: anonymousData.metadata.preferences || {},
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        source: anonymousData.source,
        ...(anonymousData.metadata.includeCoverLetter && {
          coverLetter: cleanResumeDataForFirebase(anonymousData.metadata.coverLetterData),
          coverLetterTemplate: anonymousData.metadata.coverLetterTemplate,
        }),
      };

      // Save to Firestore
      setDoc(resumeRef, dataToSave).then(() => {
        console.log("Restored anonymous resume data for logged-in user:", userId);
        // Clear the anonymous data after successful save
        clearAnonymousResumeForIndia();

        // Show success message
        if (typeof toast !== "undefined") {
          toast.success("Your resume data has been saved to your account!");
        }
      }).catch((error) => {
        console.error("Error saving anonymous resume data:", error);
      });

      return {
        resumeId: resumeRef.id,
        data: anonymousData.data,
        metadata: anonymousData.metadata
      };
    }
  }
  return null;
};

// Helper function to clean data for Firestore (if not already imported)
const cleanDataForFirestore = (data) => {
  if (!data) return data;
  const cleaned = JSON.parse(JSON.stringify(data));
  // Remove undefined values
  const removeUndefined = (obj) => {
    Object.keys(obj).forEach(key => {
      if (obj[key] === undefined) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        removeUndefined(obj[key]);
      }
    });
  };
  removeUndefined(cleaned);
  return cleaned;
};