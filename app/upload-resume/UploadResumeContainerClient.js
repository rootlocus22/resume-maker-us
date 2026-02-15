"use client";
import { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy, memo } from "react";
import UploadResumeSkeleton from '../components/UploadResumeSkeleton';
import dynamic from "next/dynamic";

// Lazy load heavy components for better performance
const ResumeForm = lazy(() => import("../components/ResumeForm"));
const ResumePreview = lazy(() => import("../components/ResumePreview"));
const ATSResumeRenderer = lazy(() => import("../components/ATSResumeRenderer"));
const VisualAppealRenderer = lazy(() => import("../components/VisualAppealRenderer"));
const TemplateSelector = lazy(() => import("../components/TemplateSelector"));

const ProgressOverlay = lazy(() => import("../components/ProgressOverlay"));
import {
  Bot,
  Eye,
  X,
  FileText,
  UploadCloud,
  Sparkles,
  Edit2,
  RefreshCw,
  Palette,
  Save,
  Check,
  Crown,
  Lock,
  Share2,
  Globe,
  TrendingUp,
  Trophy,
  Download,
  ArrowRight,
  Zap,
  Shield,
  Rocket,
  Clock
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { event } from "../lib/gtag";
import { useAuth } from "../context/AuthContext";
import { rankResume, cleanResumeDataForFirebase } from "../lib/utils";
// Lazy load more heavy components
const UnifiedResumeProcessor = lazy(() => import("../components/UnifiedResumeProcessor"));
const ResumePreferences = lazy(() => import("../components/ResumePreferences"));
const ColorCustomizer = lazy(() => import("../components/ColorCustomizer"));
const ResumeSlideshowModal = lazy(() => import("../components/ResumeSlideshowModal"));
const PremiumPdfPreview = lazy(() => import("../components/PremiumPdfPreview"));
// const FresherDiscountPopup = lazy(() => import("../components/FresherDiscountPopup")); // Disabled - FRESHER50 coupon removed


import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { doc, setDoc, collection, getDoc, updateDoc, onSnapshot, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import clsx from "clsx";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { useLocation } from "../context/LocationContext";
import { saveUserInfo } from "../utils/saveUserInfo";
import { defaultConfig, templates } from "../lib/templates";
import { atsFriendlyTemplates } from "../lib/atsFriendlyTemplates.js";
import { visualAppealTemplates } from "../lib/visualAppealTemplates.js";
import { premiumDesignTemplates } from "../lib/premiumDesignTemplates.js";
import {
  saveWorkingResume,
  loadWorkingResume,
  savePreAuthState,
  loadAndClearPreAuthState,
  updateWorkingResumeMetadata,
  hasActiveResumeWork,
  saveResumeDataWithPreAuth,
  createResumeVersion,
  setActiveResumeVersion,
  initializeResumeVersions,
  saveResumeDataWithIndiaHandling,
  safeLocalStorage,
  safeSessionStorage
} from "../lib/storage";
import { saveUploadHistory, getLastUpload } from "../lib/uploadHistory";
import UploadHistoryPanel from "../components/UploadHistoryPanel";
import { loadResumePreferences, saveResumePreferences } from '../utils/saveUserInfo';
import { normalizeResumeDates } from "../lib/storage";
import { getEffectivePricing } from "../lib/globalPricing";
import { saveUploadHistory as saveTeamUploadHistory } from "../lib/teamDataAccess";
import { logActivity, ACTIVITY_TYPES, getAdminId } from "../lib/teamManagement";
import { checkQuota, incrementQuota, QUOTA_TYPES } from "../lib/enterpriseQuotas";
import QuotaLimitModal from "../components/QuotaLimitModal";
import { formatPrice } from "../lib/globalPricing";
import { getDownloadLimitMessage, getPlanConfig } from "../lib/planConfig";
import { isResumeOwner, storeFirstResumeReference } from "../lib/firstResumeReference"; // [NEW]
import { useProfileGuard } from "../hooks/useProfileGuard"; // [NEW]


// Utility to detect mobile iOS
// function isMobileIOS() {
//   if (typeof window === "undefined") return false;
//   return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
// }





const DEFAULT_RESUME_DATA = {
  name: "",
  jobTitle: "",
  email: "",
  phone: "",
  address: "",
  linkedin: "",
  portfolio: "",
  photo: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  customSections: [],
};

// Transform optimized data to ensure form compatibility
const transformDataForForm = (data) => {
  if (!data) return data;

  const transformedData = { ...data };

  // Handle personal info mapping
  if (transformedData.personal && typeof transformedData.personal === 'object') {
    if (transformedData.personal.name) transformedData.name = transformedData.personal.name;
    if (transformedData.personal.email) transformedData.email = transformedData.personal.email;
    if (transformedData.personal.phone) transformedData.phone = transformedData.personal.phone;
    if (transformedData.personal.location) transformedData.address = transformedData.personal.location;
    if (transformedData.personal.linkedin) transformedData.linkedin = transformedData.personal.linkedin;
    if (transformedData.personal.website) transformedData.portfolio = transformedData.personal.website;
  }

  // Ensure jobTitle exists - check multiple possible field names
  if (!transformedData.jobTitle || transformedData.jobTitle === '') {
    const possibleJobTitleFields = [
      transformedData.personal?.jobTitle,
      transformedData.personal?.title,
      transformedData.personal?.position,
      transformedData.title,
      transformedData.position,
      transformedData.jobTitle,
      transformedData.role,
      transformedData.designation
    ];

    const foundJobTitle = possibleJobTitleFields.find(field => field && field.trim() !== '');
    if (foundJobTitle) {
      transformedData.jobTitle = String(foundJobTitle).trim();
    }

    console.log('🎯 Job title mapping:', {
      originalJobTitle: transformedData.jobTitle,
      personalJobTitle: transformedData.personal?.jobTitle,
      personalTitle: transformedData.personal?.title,
      title: transformedData.title,
      foundJobTitle
    });
  }

  // Transform experience descriptions from arrays to strings
  if (transformedData.experience && Array.isArray(transformedData.experience)) {
    transformedData.experience = transformedData.experience.map(exp => {
      const transformedExp = { ...exp };

      // Convert description array to bullet string
      if (Array.isArray(transformedExp.description)) {
        transformedExp.description = transformedExp.description
          .map(item => {
            const line = String(item).trim();
            return line.startsWith('•') ? line : `• ${line} `;
          })
          .join('\n');
      }

      // Map experience job title from various possible field names
      if (!transformedExp.jobTitle || transformedExp.jobTitle === '') {
        const possibleJobTitleFields = [
          transformedExp.jobTitle,
          transformedExp.title,
          transformedExp.position,
          transformedExp.role,
          transformedExp.designation
        ];

        const foundJobTitle = possibleJobTitleFields.find(field => field && String(field).trim() !== '');
        if (foundJobTitle) {
          transformedExp.jobTitle = String(foundJobTitle).trim();
        }
      }

      // Ensure other fields are strings
      ['jobTitle', 'company', 'location'].forEach(field => {
        if (transformedExp[field] && typeof transformedExp[field] !== 'string') {
          transformedExp[field] = String(transformedExp[field]);
        }
      });

      console.log('💼 Experience transformation:', {
        original: exp,
        transformed: transformedExp,
        jobTitleMapped: transformedExp.jobTitle
      });

      return transformedExp;
    });
  }

  // Transform custom sections
  if (transformedData.customSections && Array.isArray(transformedData.customSections)) {
    transformedData.customSections = transformedData.customSections.map(section => {
      const transformedSection = { ...section };

      // Convert description array to bullet string
      if (Array.isArray(transformedSection.description)) {
        transformedSection.description = transformedSection.description
          .map(item => {
            const line = String(item).trim();
            return line.startsWith('•') ? line : `• ${line} `;
          })
          .join('\n');
      }

      // Convert achievements array to bullet string
      if (Array.isArray(transformedSection.achievements)) {
        transformedSection.achievements = transformedSection.achievements
          .map(item => {
            const line = String(item).trim();
            return line.startsWith('•') ? line : `• ${line} `;
          })
          .join('\n');
      }

      return transformedSection;
    });
  }

  // Transform skills to expected format
  if (transformedData.skills && Array.isArray(transformedData.skills)) {
    transformedData.skills = transformedData.skills.map(skill => {
      if (typeof skill === 'string') {
        return { name: skill };
      }
      if (typeof skill === 'object' && skill.name) {
        return skill;
      }
      return { name: String(skill) };
    });
  }

  // Ensure top-level string fields are strings
  ['name', 'email', 'phone', 'jobTitle', 'summary', 'address', 'linkedin', 'portfolio'].forEach(field => {
    if (transformedData[field] && typeof transformedData[field] !== 'string') {
      transformedData[field] = String(transformedData[field]);
    }
  });

  return transformedData;
};

export default function UploadResumeContainerClient({
  enterpriseMode = false,
  selectedClient = null,
  enterpriseUserId = null,
  initialHistoryData = null,
  onUploadComplete = null
}) {
  const { user, isPremium, isBasicPlan, isOneDayPlan } = useAuth();
  const { currency, isLoadingGeo, countryCode } = useLocation();
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);



  const [adminIsPremium, setAdminIsPremium] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  // Profile Guard
  const { checkProfileAccess, ProfileGuardModal, setIsProfileLimitModalOpen, isProfileLimitModalOpen } = useProfileGuard();

  // Load saved preferences on mount
  const [quotaInfo, setQuotaInfo] = useState(null);

  // Memoize pricing calculation
  const pricing = useMemo(() => getEffectivePricing(currency, isAndroidDevice), [currency, isAndroidDevice]);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent) {
      const isAndroid = /Android/i.test(navigator.userAgent);
      setIsAndroidDevice(isAndroid);
    }
  }, []);

  // Fetch admin's premium status for team members
  useEffect(() => {
    const fetchAdminPremiumStatus = async () => {
      if (enterpriseMode && user?.uid) {
        try {
          // Get user's role and admin ID
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.professionalProfile?.role || userData.role;

            if (role === "team_member") {
              const adminUserId = userData.professionalProfile?.adminUserId || userData.adminUserId;
              if (adminUserId) {
                // Fetch admin's premium status
                const adminDoc = await getDoc(doc(db, "users", adminUserId));
                if (adminDoc.exists()) {
                  const adminData = adminDoc.data();
                  const adminPremium = adminData.professionalProfile?.isPremium || adminData.isPremium || false;
                  setAdminIsPremium(adminPremium);
                  console.log('👑 Admin premium status for team member:', adminPremium);
                }
              }
            } else {
              // If user is admin, use their own premium status
              setAdminIsPremium(isPremium);
            }
          }
        } catch (error) {
          console.error('Error fetching admin premium status:', error);
          setAdminIsPremium(false);
        }
      } else {
        setAdminIsPremium(isPremium);
      }
    };

    fetchAdminPremiumStatus();
  }, [enterpriseMode, user?.uid, isPremium]);

  const [pdfDownloadCount, setPdfDownloadCount] = useState(0);
  const [basicPlanExpiry, setBasicPlanExpiry] = useState(null);
  const [localOneDayPlanValid, setLocalOneDayPlanValid] = useState(false);
  const [oneDayPlanExpiry, setOneDayPlanExpiry] = useState(null);
  const [latestPayment, setLatestPayment] = useState(null);

  const [uploadedResumeData, setUploadedResumeData] = useState(null);
  const [parsedResumeData, setParsedResumeData] = useState(null); // Initialize as null to avoid premature default data
  const [originalParsedData, setOriginalParsedData] = useState(null); // Store original parsed data
  const [optimizedParsedData, setOptimizedParsedData] = useState(null); // Store optimized data
  const [useOriginalContent, setUseOriginalContent] = useState(false); // Toggle between original and enhanced
  const [template, setTemplate] = useState("ats_classic_standard");

  // Debug template changes
  useEffect(() => {
    console.log('🎨 Template changed to:', template);
    console.log('🎨 Template starts with ats_:', template && template.startsWith('ats_'));
  }, [template]);

  // Effect to switch between original and enhanced content
  useEffect(() => {
    if (useOriginalContent && originalParsedData) {
      console.log('🔄 Switching to ORIGINAL content');
      setParsedResumeData(originalParsedData);
      const { score } = rankResume(originalParsedData);
      setParsedScore(score);
    } else if (!useOriginalContent && optimizedParsedData) {
      console.log('✨ Switching to ENHANCED content');
      setParsedResumeData(optimizedParsedData);
      const { score } = rankResume(optimizedParsedData);
      setParsedScore(score);
    }
  }, [useOriginalContent, originalParsedData, optimizedParsedData]);

  const [preferences, setPreferences] = useState(() => loadResumePreferences(defaultConfig));
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [customColors, setCustomColors] = useState({});
  const [language] = useState("en");
  const [country] = useState("in");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isApplyingAI, setIsApplyingAI] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // ATS Analysis and Optimization state
  const [atsAnalysisResult, setAtsAnalysisResult] = useState(null);
  const [optimizedResumeData, setOptimizedResumeData] = useState(null);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [isOptimizingResume, setIsOptimizingResume] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [optimizedScore, setOptimizedScore] = useState(null);
  const [optimizationImprovements, setOptimizationImprovements] = useState(null);
  const [showImprovementsModal, setShowImprovementsModal] = useState(false);

  // Helper function to get score color and label
  // ATS score color rule: <60 gray, 60-79 amber, 80+ green/teal (reinforces progress & success)
  const getScoreColorAndLabel = (score) => {
    if (score == null) {
      return { textColor: 'text-gray-500', labelColor: 'text-gray-400', label: '—', progressColor: 'bg-gray-300', badgeBg: 'bg-gray-500' };
    }
    if (score < 60) {
      return {
        textColor: 'text-gray-600',
        labelColor: 'text-gray-500',
        label: 'Needs Work',
        progressColor: 'bg-gray-400',
        badgeBg: 'bg-gray-500'
      };
    }
    if (score >= 60 && score < 80) {
      return {
        textColor: 'text-amber-700',
        labelColor: 'text-amber-500',
        label: 'Good',
        progressColor: 'bg-amber-500',
        badgeBg: 'bg-amber-500'
      };
    }
    return {
      textColor: 'text-accent-700',
      labelColor: 'text-accent-700',
      label: 'Excellent',
      progressColor: 'bg-accent-700',
      badgeBg: 'bg-accent-700'
    };
  };

  const [checkoutBillingCycle, setCheckoutBillingCycle] = useState("monthly");
  const [uploadedScore, setUploadedScore] = useState(null);
  const [parsedScore, setParsedScore] = useState(null);
  const [activeTab, setActiveTab] = useState("uploaded");

  // Upload history state
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const [showScoreBoost, setShowScoreBoost] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [hasSeenSlideshow, setHasSeenSlideshow] = useState(true); // Track if slideshow has been seen
  const [userClosedSlideshow, setUserClosedSlideshow] = useState(false); // Track if user manually closed slideshow
  const [showProfilePromo, setShowProfilePromo] = useState(false);
  const [hasPublicProfile, setHasPublicProfile] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const fileInputRef = useRef(null);

  // Debug auth state
  useEffect(() => {
    console.log('🔐 Auth State Debug:', {
      user: !!user,
      isPremium,
      isBasicPlan,
      uploadCount
    });
  }, [user, isPremium, isBasicPlan, uploadCount]);

  // Debug modal state changes
  useEffect(() => {
    console.log('🔧 showUpgradeModal state changed:', showUpgradeModal);
    if (showUpgradeModal) {
      console.log('🎭 Modal should be visible now!');
    }
  }, [showUpgradeModal]);
  const [showAIBoostSuccess, setShowAIBoostSuccess] = useState(false);
  const [aiBoostData, setAIBoostData] = useState(null);


  const [showFresherPopup, setShowFresherPopup] = useState(false);
  const [fresherData, setFresherData] = useState(null);

  const router = useRouter();
  // Add state for login/signup modal
  const [showLoginSignupModal, setShowLoginSignupModal] = useState(false);
  const [postAuthCheckoutBillingCycle, setPostAuthCheckoutBillingCycle] = useState(null);
  const [loginModalAction, setLoginModalAction] = useState(null); // 'save' or 'upgrade'
  // Add state for the original file URL and type
  const [originalFileUrl, setOriginalFileUrl] = useState(null);
  const [originalFileType, setOriginalFileType] = useState(null);
  const [enhancedCardHeight, setEnhancedCardHeight] = useState(null);
  const enhancedCardRef = useRef(null);



  // Resume processing stepper state


  // Resume processing stepper state
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [currentProcessingStep, setCurrentProcessingStep] = useState(null);
  const [errorSteps, setErrorSteps] = useState(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  // Unified processing state
  const [showUnifiedProcessor, setShowUnifiedProcessor] = useState(false);
  const [processingFile, setProcessingFile] = useState(null);

  // Unified processor completion handlers
  const handleUnifiedProcessorComplete = (data) => {

    // Set up original file URL for uploaded resume view
    if (processingFile) {
      const fileUrl = URL.createObjectURL(processingFile);
      setOriginalFileUrl(fileUrl);
      setOriginalFileType(processingFile.type);
    }

    // Store ORIGINAL parsed data
    if (data.parsedData) {
      setOriginalParsedData(data.parsedData); // Store original separately
      setParsedResumeData(data.parsedData); // Set as current (will be replaced if optimized exists)
      setUploadedResumeData(data.parsedData);

      // Calculate and set scores
      const { score: uploadedScore } = rankResume(data.parsedData);
      const { score: parsedScore } = rankResume(data.parsedData);
      setUploadedScore(uploadedScore);
      setParsedScore(parsedScore);
    }

    if (data.atsData) {
      // Try multiple possible score fields
      const score = data.atsData.overallScore || data.atsData.score || data.atsData.atsScore;
      setAtsScore(score);
    }

    if (data.optimizedData) {
      // Try multiple possible structures for optimized data
      let optimizedResume = null;
      let optimizedScore = null;

      // Check if optimizedData is the resume data itself
      if (data.optimizedData.optimizedResume) {
        optimizedResume = data.optimizedData.optimizedResume;
        optimizedScore = data.optimizedData.optimizedResume.score;
      } else if (data.optimizedData.score) {
        optimizedResume = data.optimizedData;
        optimizedScore = data.optimizedData.score;
      } else if (data.optimizedData.optimizedScore) {
        optimizedResume = data.optimizedData;
        optimizedScore = data.optimizedData.optimizedScore;
      } else {
        // The optimizedData is likely the resume data itself
        optimizedResume = data.optimizedData;
        // Calculate score if not provided
        const { score: calculatedScore } = rankResume(data.optimizedData);
        optimizedScore = calculatedScore;
      }

      // Store OPTIMIZED data separately
      setOptimizedParsedData(optimizedResume);

      // Check if there's an estimatedScoreImprovement object with the actual score
      if (data.estimatedScoreImprovement?.estimatedScore) {
        optimizedScore = data.estimatedScoreImprovement.estimatedScore;
      }

      // Check if there's an optimizedAnalysis object with the score
      if (data.optimizedAnalysis?.overallScore) {
        optimizedScore = data.optimizedAnalysis.overallScore;
      }

      // Check if the optimization API returned a score improvement object
      if (data.optimizedData.estimatedScoreImprovement?.estimatedScore) {
        optimizedScore = data.optimizedData.estimatedScoreImprovement.estimatedScore;
      }

      // Check if the optimization API returned an analysis object
      if (data.optimizedData.optimizedAnalysis?.overallScore) {
        optimizedScore = data.optimizedData.optimizedAnalysis.overallScore;
      }

      // If we still don't have a score, try to calculate it from the optimized resume
      if (!optimizedScore && optimizedResume) {
        const { score: calculatedScore } = rankResume(optimizedResume);
        optimizedScore = calculatedScore;
      }

      // Check if skills need to be normalized
      if (optimizedResume?.skills && typeof optimizedResume.skills === 'string') {
        // Convert string skills to array format
        const skillsArray = optimizedResume.skills.split(',').map(skill => ({
          name: skill.trim(),
          proficiency: 'Intermediate'
        }));
        optimizedResume.skills = skillsArray;
      }

      setOptimizedResumeData(optimizedResume);
      setOptimizedScore(optimizedScore);

      // Store improvements data for user feedback
      if (data.optimizedData.improvements) {
        setOptimizationImprovements(data.optimizedData.improvements);
      }

      // By default, use optimized data (enhanced) - user can toggle to original
      setParsedResumeData(optimizedResume);
      const { score: optimizedParsedScore } = rankResume(optimizedResume);
      setParsedScore(optimizedParsedScore);

      // Reset toggle to false (enhanced by default)
      setUseOriginalContent(false);
    }

    // Set active tab to show the enhanced resume
    setActiveTab("enhanced");

    // Show AI boost success modal with improvements if we have optimized data
    if (data.optimizedData && atsScore && optimizedScore) {
      setAIBoostData({
        scoreImprovement: optimizedScore - atsScore,
        newScore: optimizedScore,
        enhancementCount: optimizationImprovements ? optimizationImprovements.length : 0
      });
      setShowAIBoostSuccess(true);
    }

    // Hide improvements modal when processing completes
    setShowImprovementsModal(false);

    // Increment and save upload count for non-premium users
    if (!isPremium && !isBasicPlan) {
      const newCount = uploadCount + 1;
      console.log('📈 Incrementing upload count for non-premium user:', { oldCount: uploadCount, newCount });
      setUploadCount(newCount);
      safeLocalStorage.setItem("uploadCount", newCount.toString());
    }

    // Save to upload history for quick restore later (merged with metadata)
    if (user?.uid && processingFile && data.parsedData) {
      // Extract ATS score from data
      const scoreToSave = data.atsData?.overallScore || data.atsData?.score || data.atsData?.atsScore || null;

      console.log('💾 Saving merged upload history with resume data + metadata:', {
        fileName: processingFile.name,
        fileSize: processingFile.size,
        hasParsedData: !!data.parsedData,
        hasAtsData: !!data.atsData,
        atsScore: scoreToSave,
        template,
        enterpriseMode,
        hasClient: !!selectedClient
      });

      // Get user info for metadata
      const userInfo = {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        name: user.displayName || user.email?.split('@')[0] || 'User'
      };

      // Save to upload history with merged data (resume data + metadata)
      saveUploadHistory(user.uid, {
        // File details
        fileName: processingFile.name,
        fileType: processingFile.type,
        fileSize: processingFile.size,

        // Resume data
        parsedData: data.parsedData,
        atsScore: scoreToSave,
        atsData: data.atsData,
        optimizedData: data.optimizedData,
        template: template,
        customColors: customColors,
        preferences: preferences,

        // Client context (for enterprise mode)
        clientId: selectedClient?.id || null,
        clientName: selectedClient?.name || null,

        // User metadata
        userEmail: user.email,
        userName: user.displayName || user.email?.split('@')[0],
      }, userInfo).then(() => {
        setHasHistory(true);
        console.log('✅ Saved merged upload history successfully');
      }).catch((error) => {
        console.error('Failed to save upload history:', error);
      });
    }

    // Close unified processor
    setShowUnifiedProcessor(false);
    setProcessingFile(null);
    toast.success("Resume processing completed successfully!");


  };

  const handleUnifiedProcessorError = (error) => {
    console.error('Unified processing error:', error);
    setShowUnifiedProcessor(false);
    setProcessingFile(null);
    toast.error("Resume processing failed. Please try again.");
  };

  // Check if user has upload history
  useEffect(() => {
    const checkHistory = async () => {
      if (user?.uid) {
        const lastUpload = await getLastUpload(user.uid);
        if (lastUpload) {
          setHasHistory(true);
        }
      }
    };
    checkHistory();
  }, [user]);

  // Handle restore from history
  const handleRestoreFromHistory = useCallback((historyItem) => {
    try {
      // Validate required data
      if (!historyItem.parsedData) {
        toast.error('Invalid history item - missing resume data');
        return;
      }

      // Extract the actual resume data from optimizedData structure
      let dataToDisplay;
      if (historyItem.optimizedData) {
        // OptimizedData has a wrapper structure with optimizedResume inside
        dataToDisplay = historyItem.optimizedData.optimizedResume
          ? historyItem.optimizedData.optimizedResume
          : historyItem.optimizedData;
      } else {
        dataToDisplay = historyItem.parsedData;
      }

      // Set all resume data
      setUploadedResumeData(historyItem.parsedData);
      setParsedResumeData(dataToDisplay);

      // Set optimized data if available
      if (historyItem.optimizedData) {
        const optimizedToSet = historyItem.optimizedData.optimizedResume
          ? historyItem.optimizedData.optimizedResume
          : historyItem.optimizedData;
        setOptimizedResumeData(optimizedToSet);
      }

      // Calculate and set scores
      const { score: uploadedScoreCalc } = rankResume(historyItem.parsedData);
      const { score: parsedScoreCalc } = rankResume(dataToDisplay);
      setUploadedScore(uploadedScoreCalc);
      setParsedScore(parsedScoreCalc);

      // Set optimized score if available
      if (historyItem.optimizedData) {
        const optimizedResumeData = historyItem.optimizedData.optimizedResume
          ? historyItem.optimizedData.optimizedResume
          : historyItem.optimizedData;
        const { score: optimizedScoreCalc } = rankResume(optimizedResumeData);
        setOptimizedScore(optimizedScoreCalc);
      }

      // Set ATS data
      if (historyItem.atsScore !== undefined && historyItem.atsScore !== null) {
        setAtsScore(historyItem.atsScore);
      }
      if (historyItem.atsData) {
        setAtsAnalysisResult(historyItem.atsData);
      }

      // Set template and preferences
      if (historyItem.template) {
        setTemplate(historyItem.template);
      }
      if (historyItem.customColors && Object.keys(historyItem.customColors).length > 0) {
        setCustomColors(historyItem.customColors);
      }
      if (historyItem.preferences) {
        setPreferences(historyItem.preferences);
      }

      // Set active tab
      const tabToSet = historyItem.optimizedData ? "enhanced" : "uploaded";
      setActiveTab(tabToSet);

    } catch (error) {
      console.error('Error restoring from history:', error);
      toast.error('Failed to restore from history');
    }
  }, []); // useCallback with empty deps since it only uses setters

  // Auto-restore from initial history data (for quick access from analytics)
  useEffect(() => {
    if (initialHistoryData) {
      console.log("🔄 Auto-restoring history data for quick access:", initialHistoryData);
      handleRestoreFromHistory(initialHistoryData);
    }
  }, [initialHistoryData, handleRestoreFromHistory]);

  // Error handling function
  const handleProcessingError = (step, error, shouldRetry = true) => {
    console.error(`Error in ${step}: `, error);

    // Add step to error set
    setErrorSteps(prev => new Set([...prev, step]));

    if (shouldRetry && retryCount < maxRetries) {
      // Show error state with retry option
      setCurrentProcessingStep('error');
      toast.error(`${step} failed.Please try again.`);
    } else {
      // Max retries reached or no retry needed
      setCurrentProcessingStep('error');
      toast.error(`${step} failed after ${retryCount} attempts.Please try uploading again.`);

      // Auto-dismiss stepper after showing error
      setTimeout(() => {
        setIsProcessingResume(false);
        setCurrentProcessingStep(null);
        setErrorSteps(new Set());
        setRetryCount(0);
      }, 5000);
    }
  };

  // Retry function
  const handleRetry = () => {
    console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
    setRetryCount(prev => prev + 1);
    setErrorSteps(new Set());
    setCurrentProcessingStep('parsing');

    // Reset processing states
    setIsUploadingPdf(false);
    setIsAnalyzingATS(false);
    setIsOptimizingResume(false);

    // Show retry message
    toast.success(`Retrying upload... (${retryCount + 1}/${maxRetries})`);

    // For now, just reset the stepper and let user try again
    // In a real implementation, you might want to store the file and retry automatically
    setTimeout(() => {
      setIsProcessingResume(false);
      setCurrentProcessingStep(null);
      setErrorSteps(new Set());
    }, 2000);
  };

  // Device detection effect
  useEffect(() => {
    const detectAndroid = () => {
      if (typeof window !== "undefined" && navigator.userAgent) {
        const isAndroid = /Android/i.test(navigator.userAgent);
        setIsAndroidDevice(isAndroid);
        console.log('🔍 UploadResume Device Detection:', {
          userAgent: navigator.userAgent,
          isAndroid: isAndroid
        });
      }
    };

    detectAndroid();
  }, []);

  const isEnhanced =
    uploadedResumeData &&
    parsedResumeData &&
    JSON.stringify(uploadedResumeData) !== JSON.stringify(parsedResumeData);

  // Fetch latest payment from payment_logs to determine actual plan type
  const fetchLatestPayment = async (userId) => {
    try {
      const response = await fetch(`/api/payment-logs?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status} `);
      }

      const data = await response.json();
      const { transactions } = data;

      if (transactions && transactions.length > 0) {
        // Filter for successful payments and sort by timestamp (most recent first)
        const successfulPayments = transactions
          .filter(payment => payment.status === "success")
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (successfulPayments.length > 0) {
          const latestPayment = successfulPayments[0];
          setLatestPayment(latestPayment);

          // Check if this is a basic plan purchase
          if (latestPayment.billingCycle === "basic") {
            const paymentDate = new Date(latestPayment.timestamp);
            const expiryDate = new Date(paymentDate.getTime() + (getPlanConfig("basic").duration * 24 * 60 * 60 * 1000)); // Basic plan duration from config

            const isBasicValid = new Date() < expiryDate;
            setBasicPlanExpiry(expiryDate.toISOString());
            setLocalOneDayPlanValid(false);
            setOneDayPlanExpiry(null);

            return { isBasic: true, isValid: isBasicValid, expiry: expiryDate };
          } else if (latestPayment.billingCycle === "oneDay") {
            const paymentDate = new Date(latestPayment.timestamp);
            const expiryDate = new Date(paymentDate.getTime() + (getPlanConfig("oneDay").duration * 24 * 60 * 60 * 1000)); // OneDay plan duration from config

            const isOneDayValid = new Date() < expiryDate;
            setLocalOneDayPlanValid(isOneDayValid);
            setOneDayPlanExpiry(expiryDate.toISOString());
            setBasicPlanExpiry(null);

            return { isOneDay: true, isValid: isOneDayValid, expiry: expiryDate };
          } else {
            setLocalOneDayPlanValid(false);
            setOneDayPlanExpiry(null);
            setBasicPlanExpiry(null);
            return { isBasic: false, isOneDay: false, isValid: false };
          }
        } else {
          setLocalOneDayPlanValid(false);
          setOneDayPlanExpiry(null);
          setBasicPlanExpiry(null);
          return { isBasic: false, isOneDay: false, isValid: false };
        }
      } else {
        setLocalOneDayPlanValid(false);
        setOneDayPlanExpiry(null);
        setBasicPlanExpiry(null);
        return { isBasic: false, isOneDay: false, isValid: false };
      }
    } catch (error) {
      console.error("Error fetching latest payment:", error);
      setLocalOneDayPlanValid(false);
      setOneDayPlanExpiry(null);
      setBasicPlanExpiry(null);
      return { isBasic: false, isOneDay: false, isValid: false };
    }
  };

  // Track user's basic plan status
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
        const data = docSnapshot.data();
        if (data) {
          setPdfDownloadCount(data.pdf_download_count || 0);

          // Check if user has basic plan
          if (data.plan === "basic") {
            const isBasicValid = data.premium_expiry && new Date() < new Date(data.premium_expiry);
            setBasicPlanExpiry(data.premium_expiry);
            setLocalOneDayPlanValid(false);
            setOneDayPlanExpiry(null);
          } else if (data.plan === "oneDay") {
            const isOneDayValid = data.premium_expiry && new Date() < new Date(data.premium_expiry);
            setLocalOneDayPlanValid(isOneDayValid);
            setOneDayPlanExpiry(data.premium_expiry);
            setBasicPlanExpiry(null);
          } else if (data.plan === "premium") {
            // If user has premium plan, check payment_logs to see if it's actually a basic plan
            await fetchLatestPayment(user.uid);
          } else {
            setLocalOneDayPlanValid(false);
            setOneDayPlanExpiry(null);
            setBasicPlanExpiry(null);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    // Show checkout modal only when PDF modal is open and user is not premium
    if (isPdfModalOpen && !isPremium) {
      setShowCheckoutModal(true);
      setCheckoutBillingCycle(window.innerWidth < 768 ? "monthly" : "monthly");
    } else {
      setShowCheckoutModal(false);
    }
  }, [isPdfModalOpen, isPremium]);

  // Load upload count and check user profile
  useEffect(() => {
    // Load upload count from localStorage
    const savedCount = safeLocalStorage.getItem("uploadCount");
    const count = savedCount ? parseInt(savedCount) : 0;
    console.log('📊 Loading upload count from localStorage:', { savedCount, count });
    setUploadCount(count);

    const checkPublicProfile = async () => {
      if (!user) {
        setHasPublicProfile(false);
        return;
      }

      try {
        const profileRef = doc(db, `users / ${user.uid}/profile`, 'userProfile');
        const profileSnapshot = await getDoc(profileRef);
        const hasProfile = profileSnapshot.exists() && profileSnapshot.data()?.allowMatching;
        setHasPublicProfile(hasProfile);
      } catch (error) {
        console.error("Error checking profile status:", error);
      }
    };

    checkPublicProfile();
  }, [user]);

  // Show floating slideshow button after first open
  useEffect(() => {
    if (isSlideshowOpen && !hasSeenSlideshow) {
      setHasSeenSlideshow(true);
    }
  }, [isSlideshowOpen, hasSeenSlideshow]);

  // Removed auto-open slideshow logic - user must click the floating button to view resume styles

  // Initialize resume versions system and restore working resume state on component mount
  useEffect(() => {
    // Initialize resume versions system
    initializeResumeVersions();

    const restoreWorkingState = () => {
      const workingState = loadWorkingResume();
      if (workingState && workingState.data) {
        console.log("Restoring working resume state:", workingState);

        // Restore the resume data based on source
        if (workingState.source === "upload" && workingState.metadata?.originalData) {
          setUploadedResumeData(workingState.metadata.originalData);
          setParsedResumeData(workingState.data);

          // Calculate scores
          const uploadedScore = rankResume(workingState.metadata.originalData).score;
          const parsedScore = rankResume(workingState.data).score;
          setUploadedScore(uploadedScore);
          setParsedScore(parsedScore);

          setActiveTab("enhanced");
        } else if (workingState.source === "ai_enhanced") {
          if (workingState.metadata?.originalData) {
            setUploadedResumeData(workingState.metadata.originalData);
            const uploadedScore = rankResume(workingState.metadata.originalData).score;
            setUploadedScore(uploadedScore);
          }

          setParsedResumeData(workingState.data);
          const parsedScore = rankResume(workingState.data).score;
          setParsedScore(parsedScore);

          setActiveTab("enhanced");
        }

        // Restore metadata
        if (workingState.metadata?.template) {
          console.log('🔄 Restoring template from working state:', workingState.metadata.template);
          // FORCE ATS template if saved template is not an ATS template
          if (!workingState.metadata.template.startsWith('ats_')) {
            console.log('🔄 Converting non-ATS template to ats_classic_standard:', workingState.metadata.template);
            setTemplate("ats_classic_standard");
          } else {
            setTemplate(workingState.metadata.template);
          }
        } else {
          // If no saved template, use ATS Classic Standard as default
          console.log('🔄 No saved template, using default: ats_classic_standard');
          setTemplate("ats_classic_standard");
        }
        if (workingState.metadata?.preferences) {
          setPreferences(workingState.metadata.preferences);
        }
        if (workingState.metadata?.customColors) {
          setCustomColors(workingState.metadata.customColors);
        }

        // Check if restore toast was already shown to prevent duplicates
        const hasShownRestore = safeSessionStorage.getItem('hasShownRestoreToast');
        if (!hasShownRestore) {
          // toast.success("Restored your previous work!");
          // sessionStorage.setItem('hasShownRestoreToast', 'true');
        }
      }
    };

    // Check for pre-auth state first (user just logged in/signed up)
    const preAuthData = loadAndClearPreAuthState();
    if (preAuthData) {
      console.log("Processing pre-auth data:", preAuthData);

      if (preAuthData.multiple && preAuthData.states.length > 1) {
        // Handle multiple pre-auth states - create versions for each
        preAuthData.states.forEach((state, index) => {
          const versionName = `Resume Upload ${index + 1}`;
          const versionId = createResumeVersion(versionName, state.resumeData, {
            template: state.additionalData?.template || template,
            preferences: state.additionalData?.preferences || preferences,
            customColors: state.additionalData?.customColors || customColors,
            language: language,
            country: country
          });

          // Make the most recent one active
          if (index === preAuthData.states.length - 1) {
            setActiveResumeVersion(versionId);
          }
        });

        // Set up UI with the most recent state
        const mostRecent = preAuthData.mostRecent;
        if (mostRecent.additionalData?.uploadedData) {
          setUploadedResumeData(mostRecent.additionalData.uploadedData);
          const uploadedScore = rankResume(mostRecent.additionalData.uploadedData).score;
          setUploadedScore(uploadedScore);
        }

        setParsedResumeData(mostRecent.resumeData);
        const parsedScore = rankResume(mostRecent.resumeData).score;
        setParsedScore(parsedScore);

        // Restore additional state
        if (mostRecent.additionalData?.template) {
          console.log('🔄 Restoring template from most recent:', mostRecent.additionalData.template);
          // FORCE ATS template if saved template is not an ATS template
          if (!mostRecent.additionalData.template.startsWith('ats_')) {
            console.log('🔄 Converting non-ATS template to ats_classic_standard:', mostRecent.additionalData.template);
            setTemplate("ats_classic_standard");
          } else {
            setTemplate(mostRecent.additionalData.template);
          }
        } else {
          // If no saved template, use ATS Classic Standard as default
          console.log('🔄 No saved template in most recent, using default: ats_classic_standard');
          setTemplate("ats_classic_standard");
        }
        if (mostRecent.additionalData?.preferences) {
          setPreferences(mostRecent.additionalData.preferences);
        }
        if (mostRecent.additionalData?.customColors) {
          setCustomColors(mostRecent.additionalData.customColors);
        }

        setActiveTab("enhanced");
        toast.success(`Welcome back! Restored ${preAuthData.states.length} resume uploads.`);
      } else if (preAuthData.mostRecent) {
        // Handle single pre-auth state
        const state = preAuthData.mostRecent;

        // Create a new version for this upload
        const versionName = state.resumeData.name ? `${state.resumeData.name}'s Resume` : "Uploaded Resume";
        const versionId = createResumeVersion(versionName, state.resumeData, {
          template: state.additionalData?.template || template,
          preferences: state.additionalData?.preferences || preferences,
          customColors: state.additionalData?.customColors || customColors,
          language: language,
          country: country
        });

        setActiveResumeVersion(versionId);

        if (state.additionalData?.uploadedData) {
          setUploadedResumeData(state.additionalData.uploadedData);
          const uploadedScore = rankResume(state.additionalData.uploadedData).score;
          setUploadedScore(uploadedScore);
        }

        setParsedResumeData(state.resumeData);
        const parsedScore = rankResume(state.resumeData).score;
        setParsedScore(parsedScore);

        // Restore additional state
        if (state.additionalData?.template) {
          console.log('🔄 Restoring template from state:', state.additionalData.template);
          // FORCE ATS template if saved template is not an ATS template
          if (!state.additionalData.template.startsWith('ats_')) {
            console.log('🔄 Converting non-ATS template to ats_classic_standard:', state.additionalData.template);
            setTemplate("ats_classic_standard");
          } else {
            setTemplate(state.additionalData.template);
          }
        } else {
          // If no saved template, use ATS Classic Standard as default
          console.log('🔄 No saved template in state, using default: ats_classic_standard');
          setTemplate("ats_classic_standard");
        }
        if (state.additionalData?.preferences) {
          setPreferences(state.additionalData.preferences);
        }
        if (state.additionalData?.customColors) {
          setCustomColors(state.additionalData.customColors);
        }

        setActiveTab("enhanced");
        toast.success("Welcome back! Your resume work has been restored.");
      }
    } else {
      // No pre-auth state, check for working state
      restoreWorkingState();

      // If no working state was restored, ensure we have the default ATS template
      const workingState = loadWorkingResume();
      if (!workingState || !workingState.data) {
        console.log('🔄 No working state found, setting default template: ats_classic_standard');
        setTemplate("ats_classic_standard");
      }
    }
  }, []); // Run only on mount

  // ATS Analysis and Optimization function (similar to ATS score checker)
  const runATSAnalysisAndOptimization = async (file, parsedData, normalizedParsedData) => {
    console.log('⚠️ runATSAnalysisAndOptimization called but is deprecated. Using UnifiedResumeProcessor instead.');
    return; // Exit early - this function is replaced by UnifiedResumeProcessor

    try {
      console.log('🔍 Starting ATS analysis and optimization...');

      // Start the processing stepper
      console.log('Setting stepper visible and parsing step');
      setIsProcessingResume(true);
      setCurrentProcessingStep('parsing');

      // Wait a moment to show parsing step, then move to ATS
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentProcessingStep('ats-check');

      // Step 1: Run ATS Analysis
      setIsAnalyzingATS(true);
      const atsFormData = new FormData();
      atsFormData.append("file", file);
      atsFormData.append("bypassCache", "true"); // Always get fresh AI analysis for authentic results
      atsFormData.append("entryPoint", "upload-resume");
      atsFormData.append("pageUrl", "/upload-resume");

      const atsResponse = await fetch("/api/ats-checker", {
        method: "POST",
        body: atsFormData
      });

      if (!atsResponse.ok) {
        throw new Error("Failed to analyze ATS score");
      }

      const atsResult = await atsResponse.json();
      setAtsAnalysisResult(atsResult);
      setAtsScore(atsResult.overallScore);

      console.log('✅ ATS Analysis completed:', atsResult.overallScore);

      // Move to AI boost step
      setCurrentProcessingStep('ai-boost');


      // Step 2: Run Resume Optimization
      setIsOptimizingResume(true);
      const optimizeResponse = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalResumeData: normalizedParsedData,
          atsAnalysisResult: atsResult
        }),
      });

      if (!optimizeResponse.ok) {
        throw new Error('Failed to optimize resume');
      }

      const optimizeResult = await optimizeResponse.json();

      // Transform the optimized data to ensure arrays are converted to strings for form compatibility
      console.log('🔧 Raw optimized data:', optimizeResult.optimizedResume);
      const transformedOptimizedData = transformDataForForm(optimizeResult.optimizedResume);
      console.log('✅ Transformed optimized data:', transformedOptimizedData);

      setOptimizedResumeData(transformedOptimizedData);
      setOptimizedScore(optimizeResult.estimatedScoreImprovement?.estimatedScore);

      console.log('✅ Resume optimization completed:', {
        originalScore: atsResult.overallScore,
        optimizedScore: optimizeResult.estimatedScoreImprovement?.estimatedScore
      });

      // Update the basic scores for backward compatibility
      const { score: uploadedScore } = rankResume(parsedData);
      setUploadedScore(uploadedScore);
      setParsedScore(uploadedScore);

      toast.success('Resume analyzed and optimized successfully!');


      // Complete the AI boost step
      console.log('🎯 Setting stepper to completed after optimization');
      setCurrentProcessingStep('completed');

    } catch (error) {
      console.error('Error in ATS analysis/optimization:', error);

      // For ATS analysis, we'll use fallback but still show error in stepper
      handleProcessingError('ats-check', error, false);

      // Fallback to basic scoring
      const { score: uploadedScore } = rankResume(parsedData);
      setUploadedScore(uploadedScore);
      setParsedScore(uploadedScore);

      // Continue to completion even with ATS error
      setCurrentProcessingStep('completed');
    } finally {
      setIsAnalyzingATS(false);
      setIsOptimizingResume(false);
    }
  };

  const handlePdfUpload = async (e) => {
    console.log('📁 handlePdfUpload called');
    setActiveTab("uploaded");
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    // Allow PDF, DOCX, and DOC files
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/msword" // DOC
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid PDF or Word document (.pdf, .docx, .doc).");
      return;
    }

    // Clean up previous Blob URL
    if (originalFileUrl) {
      URL.revokeObjectURL(originalFileUrl);
      setOriginalFileUrl(null);
      setOriginalFileType(null);
    }

    // Store the file Blob URL and type
    const fileUrl = URL.createObjectURL(file);
    setOriginalFileUrl(fileUrl);
    setOriginalFileType(file.type);

    setIsUploadingPdf(true);
    try {
      // Start the processing stepper for parsing
      setIsProcessingResume(true);
      setCurrentProcessingStep('parsing');


      // Always use Gemini parsing API for all devices and browsers
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entryPoint", "upload-resume");
      formData.append("pageUrl", "/upload-resume");
      const response = await fetch("/api/gemini-parse-resume", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Provide a user-friendly error message based on Gemini error details.
        let userMessage = errorData.details || "Failed to extract resume data.";
        if (userMessage.toLowerCase().includes("no pages")) {
          userMessage = "The document appears to be empty or not a valid file. Please try uploading a different resume file.";
        }
        toast.error(userMessage);
        throw new Error(errorData.error || "Failed to parse resume");
      }

      const parsedData = await response.json();
      const normalizedParsedData = normalizeResumeDates(parsedData);
      console.log("Initial parsed data (normalized):", normalizedParsedData);
      console.log("📋 Job title check in parsed data:", {
        jobTitle: normalizedParsedData.jobTitle,
        title: normalizedParsedData.title,
        personal: normalizedParsedData.personal,
        personalJobTitle: normalizedParsedData.personal?.jobTitle,
        personalTitle: normalizedParsedData.personal?.title
      });

      setUploadedResumeData(normalizedParsedData);
      setParsedResumeData(normalizedParsedData);

      // Save upload history and log activity for analytics
      if (user) {
        try {
          await saveTeamUploadHistory(user.uid, {
            fileName: file.name,
            fileSize: file.size,
            parsedFields: Object.keys(normalizedParsedData),
          });

          // Get admin ID for proper activity logging
          const adminId = enterpriseMode ? await getAdminId(user.uid) : user.uid;
          await logActivity(adminId || user.uid, user.uid, ACTIVITY_TYPES.RESUME_UPLOADED, {
            fileName: file.name,
            fileSize: file.size,
            hasExperience: !!(normalizedParsedData.experience && normalizedParsedData.experience.length > 0),
          });

          // Increment quota for enterprise users
          if (enterpriseMode) {
            try {
              await incrementQuota(adminId || user.uid, QUOTA_TYPES.RESUME_UPLOADS);
              console.log(`✅ Resume upload quota incremented for admin ${adminId || user.uid}`);
            } catch (quotaError) {
              console.error("Error incrementing upload quota:", quotaError);
              // Don't fail the upload if quota increment fails
            }
          }
        } catch (error) {
          console.error("Error saving upload history:", error);
          // Don't show error to user as this is background functionality
        }
      }

      // Save skills to localStorage as userSkills, if available.
      if (parsedData.skills && Array.isArray(parsedData.skills)) {
        const normalizedSkills = parsedData.skills
          .map((skill) => (typeof skill === "string" ? { name: skill } : skill))
          .filter((skill) => skill && skill.name);
        if (typeof window !== "undefined") {
          safeLocalStorage.setItem("userSkills", JSON.stringify(normalizedSkills));
        }
      }

      // Run ATS analysis and optimization (similar to ATS score checker)
      // Only run old flow if unified processor is not being used
      if (!showUnifiedProcessor) {
        await runATSAnalysisAndOptimization(file, parsedData, normalizedParsedData);
      }

      // Check for fresher status and show popup if detected (only for non-premium users)
      if (parsedData.isFresher && !isPremium) {
        console.log('🎓 Fresher detected and user is not premium, showing discount popup');
        setFresherData({
          isFresher: parsedData.isFresher,
          fresherAnalysis: parsedData.fresherAnalysis,
          yearsOfExperience: parsedData.yearsOfExperience
        });

        // Show popup after a short delay for better UX
        setTimeout(() => {
          setShowFresherPopup(true);
        }, 2000);
      } else if (parsedData.isFresher && isPremium) {
        console.log('🎓 Fresher detected but user is already premium, skipping discount popup');
      }

      // Save to working resume state and create a new version
      saveWorkingResume(normalizedParsedData, "upload", {
        template,
        preferences,
        customColors,
        uploadTimestamp: Date.now(),
        originalData: normalizedParsedData
      });

      // For India location anonymous users, save to special storage
      if (countryCode === 'IN' && !user) {
        saveResumeDataWithIndiaHandling(normalizedParsedData, "upload", {
          template,
          preferences,
          customColors,
          language,
          country,
          uploadTimestamp: Date.now(),
          originalData: normalizedParsedData
        }, countryCode);
      }

      // Create a new resume version with the uploaded data
      const resumeName = normalizedParsedData.name ? `${normalizedParsedData.name}'s Resume` : "Uploaded Resume";
      const versionId = createResumeVersion(resumeName, normalizedParsedData, {
        template,
        preferences,
        customColors,
        language,
        country
      });

      // Set this as the active version
      setActiveResumeVersion(versionId);

      // Increment and save upload count
      const newCount = uploadCount + 1;
      console.log('📈 Incrementing upload count:', { oldCount: uploadCount, newCount });
      setUploadCount(newCount);
      safeLocalStorage.setItem("uploadCount", newCount.toString());

      toast.success("Resume uploaded and parsed successfully!");



      // ATS analysis and optimization is now handled in runATSAnalysisAndOptimization
      // No need for separate AI suggestions as optimization provides better results

      // Save user info to Firestore.
      handleResumeParsed(normalizedParsedData, user?.uid);

      // Store first resume reference if user is logged in
      if (user?.uid && normalizedParsedData) {
        const name = normalizedParsedData.name || "";
        const email = normalizedParsedData.email || "";
        const phone = normalizedParsedData.phone || "";

        // Only store if user has entered real data (not default sample data)
        const hasRealData = (
          name && name !== "John Doe" &&
          email && email !== "john.doe@example.com" &&
          phone && phone !== "+1 (123) 456-7890"
        );

        console.log('First resume reference validation (upload):', {
          name,
          email,
          phone,
          hasRealData,
          source: 'first_upload'
        });

        if (hasRealData) {
          try {
            const { storeFirstResumeReference } = await import("../lib/firstResumeReference");
            const response = await storeFirstResumeReference(
              user.uid,
              {
                name,
                email,
                phone
              },
              "first_upload"
            );

            if (response.stored) {
              console.log("First resume reference stored successfully from upload");
            } else {
              console.log("First resume reference not stored:", response.message);
            }
          } catch (error) {
            console.error("Error storing first resume reference:", error);
            // Don't show error to user as this is background functionality
          }
        }
      }
    } catch (error) {
      console.error("PDF Upload Error:", error);
      handleProcessingError('parsing', error, true);
    } finally {
      setIsUploadingPdf(false);
      // Don't close the stepper here as it will continue with ATS and optimization
    }
  };
  const handleResumeParsed = (parsedData, userId) => {
    if (parsedData && (parsedData.name || parsedData.email || parsedData.phone)) {
      saveUserInfo(userId, {
        name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone,
      });
    }

    // Note: Working resume state and version creation is now handled in handlePdfUpload
    console.log("Resume parsed and user info saved");
  };

  const handleApplyAISuggestions = async (data, isAutoBoost = false) => {
    // For auto boosts, use the provided data; for manual boosts, use parsedResumeData
    let dataToEnhance;
    if (isAutoBoost) {
      dataToEnhance = data;
    } else {
      dataToEnhance = parsedResumeData;
      if (!dataToEnhance) {
        console.error("parsedResumeData is null during manual AI Boost", { parsedResumeData, uploadedResumeData });
        toast.error("No enhanced resume data available to further enhance. Please upload a resume.");
        return;
      }
    }

    console.log("handleApplyAISuggestions called:", { isAutoBoost, dataToEnhance });

    // Ensure we have valid data to enhance
    if (!dataToEnhance || Object.keys(dataToEnhance).length === 0) {
      console.error("No valid resume data to enhance:", { dataToEnhance, uploadedResumeData, parsedResumeData });
      toast.error("No resume data available to enhance. Please upload a resume first.");
      return;
    }

    setIsApplyingAI(true);
    setActiveTab("enhanced");

    try {
      // Create a clean data object to avoid circular references
      const cleanData = {
        name: dataToEnhance.name || "",
        jobTitle: dataToEnhance.jobTitle || "",
        email: dataToEnhance.email || "",
        phone: dataToEnhance.phone || "",
        address: dataToEnhance.address || "",
        linkedin: dataToEnhance.linkedin || "",
        portfolio: dataToEnhance.portfolio || "",
        photo: dataToEnhance.photo || "",
        summary: dataToEnhance.summary || "",
        experience: dataToEnhance.experience || [],
        education: dataToEnhance.education || [],
        skills: dataToEnhance.skills || [],
        certifications: dataToEnhance.certifications || [],
        languages: dataToEnhance.languages || [],
        customSections: dataToEnhance.customSections || []
      };

      // Create a clean source input if available
      let sourceInput = undefined;
      if (uploadedResumeData) {
        sourceInput = {
          name: uploadedResumeData.name || "",
          jobTitle: uploadedResumeData.jobTitle || "",
          email: uploadedResumeData.email || "",
          phone: uploadedResumeData.phone || "",
          address: uploadedResumeData.address || "",
          linkedin: uploadedResumeData.linkedin || "",
          portfolio: uploadedResumeData.portfolio || "",
          summary: uploadedResumeData.summary || "",
          experience: uploadedResumeData.experience || [],
          education: uploadedResumeData.education || [],
          skills: uploadedResumeData.skills || [],
          certifications: uploadedResumeData.certifications || [],
          languages: uploadedResumeData.languages || "",
          customSections: uploadedResumeData.customSections || []
        };
      }

      // Remove photo from cleanData and sourceInput before sending to API
      const cleanDataNoPhoto = { ...cleanData };
      if ('photo' in cleanDataNoPhoto) delete cleanDataNoPhoto.photo;
      let sourceInputNoPhoto = sourceInput;
      if (sourceInputNoPhoto && 'photo' in sourceInputNoPhoto) {
        sourceInputNoPhoto = { ...sourceInputNoPhoto };
        delete sourceInputNoPhoto.photo;
      }

      const response = await fetch("/api/generate-resume-suggestions-xai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user ? user.uid : "anonymous",
          field: "all",
          input: cleanDataNoPhoto,
          sourceInput: sourceInputNoPhoto,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.details || "Failed to apply AI suggestions");
        throw new Error(errorData.error || "Failed to generate AI suggestions");
      }

      const { suggestion } = await response.json();

      // Ensure the enhanced data maintains the structure
      const enhancedData = {
        ...cleanData,
        ...suggestion,
      };

      console.log("Enhanced data:", enhancedData);

      // Update parsedResumeData with the enhanced data
      setParsedResumeData(enhancedData);

      // Save enhanced working resume state
      saveWorkingResume(enhancedData, "ai_enhanced", {
        template,
        preferences,
        customColors,
        enhancementTimestamp: Date.now(),
        originalData: uploadedResumeData,
        sourceData: dataToEnhance
      });

      const { score: newScore } = rankResume(enhancedData);
      setParsedScore(newScore);

      const lastScore = activeTab === "enhanced" ? parsedScore : uploadedScore;
      if (newScore > lastScore) {
        setShowScoreBoost(true);
        setTimeout(() => setShowScoreBoost(false), 2000);
      }

      toast.success("AI Boost applied—check out the magic!");

      // Show AI content review notification
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-bg shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-accent/20 ring-opacity-5 border border-accent/30`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-primary">
                    AI Content Applied
                  </p>
                  <p className="mt-1 text-sm text-primary">
                    Please review and edit the suggestions to ensure they accurately reflect your experience.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-accent/20">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ),
        {
          duration: 3000,
          position: 'top-right',
          id: 'ai-content-review',
        }
      );

      // Show strategic AI boost success notification instead of automatic slideshow
      setAIBoostData({
        scoreImprovement: newScore - (lastScore || uploadedScore),
        newScore: newScore,
        enhancementCount: Object.keys(enhancedData).length
      });
      setShowAIBoostSuccess(true);

      // If this is part of the processing stepper, complete the step
      if (isProcessingResume && currentProcessingStep === 'ai-boost') {
        console.log('🎯 Setting stepper to completed after manual AI boost');
        setCurrentProcessingStep('completed');
      }
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      handleProcessingError('ai-boost', error, false);
      toast.error(error.message || "Failed to apply AI suggestions");
    } finally {
      setIsApplyingAI(false);
    }
  };

  // Check if basic plan user has reached download limit
  const checkBasicPlanDownloadLimit = () => {
    if ((!isBasicPlan && !isOneDayPlan) || !user) return false;

    // Check if basic plan has expired
    if (isBasicPlan && basicPlanExpiry && new Date() >= new Date(basicPlanExpiry)) {
      return true; // Plan expired, needs renewal
    }

    // Check if oneDay plan has expired
    if (isOneDayPlan && oneDayPlanExpiry && new Date() >= new Date(oneDayPlanExpiry)) {
      return true; // Plan expired, needs renewal
    }

    // Check if user has exceeded download limit based on plan
    if (isOneDayPlan && pdfDownloadCount >= getPlanConfig("oneDay").downloads) {
      return true; // OneDay plan: download limit reached
    }

    if (isBasicPlan && pdfDownloadCount >= getPlanConfig("basic").downloads) {
      return true; // Basic plan: download limit reached
    }

    return false;
  };

  const handleGeneratePDF = async () => {
    // Auth Check
    if (!user) {
      toast.error("Please sign in to download your resume");
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // [NEW] Profile Ownership Check using useProfileGuard
    if (user) {
      const dataToCheck = parsedResumeData || uploadedResumeData;
      if (dataToCheck) {
        const loadingId = toast.loading("Verifying profile access...");
        try {
          const { allowed, needsUpgrade, inProgress } = await checkProfileAccess(
            user,
            dataToCheck,
            "upload_resume_download"
          );

          if (inProgress) return;

          toast.dismiss(loadingId);
          if (!allowed) {
            if (needsUpgrade) {
              setShowUpgradeModal(true);
            }
            return; // Guard modal takes over
          }
        } catch (error) {
          toast.dismiss(loadingId);
          console.error("Profile check failed", error);
          // We might want to allow or block on error. 
          // useProfileGuard usually handles its own errors or returns false safely?
          // based on previous read it returns false on error.
          return;
        }
      }
    }

    // Check basic plan download limits first
    if ((isBasicPlan || isOneDayPlan) && checkBasicPlanDownloadLimit()) {
      const message = isOneDayPlan
        ? getDownloadLimitMessage("oneDay", true)
        : getDownloadLimitMessage("basic", true);
      toast.error(message);

      // Redirect to checkout with Pro Monthly plan pre-selected
      router.push('/checkout?billingCycle=monthly');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      // Determine template type and use the appropriate API
      const isATSTemplate = template && template.startsWith('ats_');
      const isVisualAppealTemplate = template && template.startsWith('visual_');
      const isPremiumDesignTemplate = template && template.startsWith('premium_');

      let apiEndpoint, templateData;

      if (isPremiumDesignTemplate) {
        apiEndpoint = "/api/generate-premium-design-pdf";
        templateData = template; // Send template key — API looks up from premiumDesignTemplates
      } else if (isATSTemplate) {
        apiEndpoint = "/api/generate-ats-pdf";
        templateData = atsFriendlyTemplates[template];
        if (!templateData) {
          console.error('Upload Resume - ATS Template not found:', template);
          toast.error(`Template "${template}" not found. Please select a different template.`);
          return;
        }
      } else if (isVisualAppealTemplate) {
        apiEndpoint = "/api/generate-visual-appeal-pdf";
        templateData = visualAppealTemplates[template];
        if (!templateData) {
          console.error('Upload Resume - Visual Appeal Template not found:', template);
          toast.error(`Template "${template}" not found. Please select a different template.`);
          return;
        }
      } else {
        apiEndpoint = "/api/generate-pdf";
        templateData = template; // For regular templates, pass the template name
      }

      console.log('Upload Resume - PDF Generation Debug:', {
        template,
        templateData: templateData ? templateData.name : 'undefined',
        isATSTemplate,
        isVisualAppealTemplate,
        apiEndpoint,
        templateCategory: isATSTemplate ? 'ATS-Optimized' : isVisualAppealTemplate ? 'Visual-Appeal' : 'Standard'
      });

      // Use optimized data if available, otherwise use original parsed data
      const dataToSend = optimizedResumeData || parsedResumeData;

      // Debug: Log the data being sent to the API
      console.log('Upload Resume - Data being sent to API:', {
        usingOptimizedData: !!optimizedResumeData,
        hasParsedData: !!parsedResumeData,
        hasOptimizedData: !!optimizedResumeData,
        dataKeys: dataToSend ? Object.keys(dataToSend) : [],
        hasCustomSections: dataToSend?.customSections ? true : false,
        customSectionsCount: dataToSend?.customSections?.length || 0,
        customSectionsTypes: dataToSend?.customSections?.map(cs => cs.type) || [],
        templateDataKeys: templateData ? Object.keys(templateData) : []
      });

      const requestBody = {
        data: dataToSend,
        template: templateData, // Pass the full template object for ATS templates
        customColors,
        language,
        country,
        isPremium: isPremium,
        preferences,
        userId: user?.uid,
      };

      console.log('Upload Resume - Making API request to:', apiEndpoint);
      console.log('Upload Resume - Request body size:', JSON.stringify(requestBody).length, 'characters');

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log('Upload Resume - API response status:', response.status);
      console.log('Upload Resume - API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();

        // Handle Enterprise upgrade required error
        if (response.status === 403) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error === "ENTERPRISE_REQUIRED") {
              setShowEnterpriseModal(true);
              return;
            }
          } catch (e) {
            // If JSON parsing fails, continue with normal error handling
          }
        }

        throw new Error(`Failed to generate PDF: ${errorText}`);
      }

      const pdfBlob = await response.blob();
      console.log('Upload Resume - PDF blob received, size:', pdfBlob.size, 'bytes');

      const pdfUrl = URL.createObjectURL(pdfBlob);
      console.log('Upload Resume - PDF URL created:', pdfUrl);

      setPdfPreviewUrl(pdfUrl);
      setIsPdfModalOpen(true);
      console.log('Upload Resume - PDF modal opened, URL set to state');

      // Increment PDF download count for premium users (including basic plan)
      if (user && user.uid) {
        // Check if user has premium plan (which includes basic plan users)
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData && (userData.plan === "premium" || userData.plan === "basic")) {
          setPdfDownloadCount((prev) => {
            const newCount = prev + 1;
            updateDoc(userRef, { pdf_download_count: newCount });
            return newCount;
          });
        }
      }

      toast.success("PDF preview generated!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to generate PDF. ";
      
      if (error.message?.includes('timeout') || error.message?.includes('504')) {
        errorMessage += "The server is taking too long. Please try again in a moment.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage += "Network error. Please check your connection and try again.";
      } else if (error.message?.includes('Failed to generate PDF')) {
        errorMessage += "Please try again. If the problem persists, contact support.";
      } else {
        errorMessage += error.message || "Please try again or contact support.";
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleUpdate = (updatedData) => {
    setParsedResumeData(updatedData);

    // If we have optimized data, update it too so the preview reflects changes
    if (optimizedResumeData) {
      setOptimizedResumeData(updatedData);
    }

    const { score: newScore } = rankResume(updatedData);
    setParsedScore(newScore);
    if (newScore > parsedScore) {
      setShowScoreBoost(true);
      setTimeout(() => setShowScoreBoost(false), 1000);
    }
  };

  const handleReset = () => {
    setUploadedResumeData(null);
    setParsedResumeData(null);
    setUploadedScore(null);
    setParsedScore(null);
    // Reset ATS-related state
    setAtsAnalysisResult(null);
    setOptimizedResumeData(null);
    setAtsScore(null);
    setOptimizedScore(null);
    setOptimizationImprovements(null);
    setShowImprovementsModal(false);
    // Reset loading experience states
    setShowUnifiedProcessor(false);
    setProcessingFile(null);
    setOriginalFileUrl(null);
    setOriginalFileType(null);
    setActiveTab("uploaded");
    setTemplate("ats_classic_standard");
    setShowCheckoutModal(false);
    setResumeName("");
    setHasSeenSlideshow(false);
    setIsSlideshowOpen(false);
    setUserClosedSlideshow(false);
    toast.success("Reset complete! Upload a new resume.");
  };

  const handleTemplateChange = (newTemplate) => {
    setTemplate(newTemplate);
    toast.success(`Switched to ${newTemplate} style!`);
  };

  const handlePdfModalClose = () => {
    setIsPdfModalOpen(false);
    setShowCheckoutModal(false);
  };

  // Handle upgrade click - redirect to checkout with device-specific logic
  const handleUpgradeClick = (billingCycle = null) => {
    // If in enterprise mode, redirect to enterprise checkout
    if (enterpriseMode) {
      router.push('/enterprise/checkout');
      return;
    }

    const defaultBillingCycle = isAndroidDevice ? "basic" : "monthly";
    const finalBillingCycle = billingCycle || defaultBillingCycle;
    if (!user) {
      // Store checkout intent and message in storage
      safeLocalStorage.setItem('checkoutIntent', JSON.stringify({ billingCycle: finalBillingCycle, source: 'upload-resume' }));
      safeSessionStorage.setItem('loginMessage', 'Please login to continue with your purchase');
      window.location.href = `/login`;
      return;
    }
    router.push(`/checkout?billingCycle=${finalBillingCycle}&currency=${currency}`);
  };

  const handleSaveResume = () => {
    if (!user) {
      // Redirect to resume builder instead of checkout for better UX
      safeSessionStorage.setItem('loginMessage', 'Please login to save your resume');
      window.location.href = `/login`;
      return;
    }
    setIsSaveModalOpen(true);
  };

  const saveResumeWithName = async () => {
    if (!resumeName.trim()) {
      toast.error("Please enter a name for your resume!");
      return;
    }
    try {
      const resumeRef = doc(collection(db, "users", user.uid, "resumes"));
      const cleanResumeData = JSON.parse(JSON.stringify(parsedResumeData));
      const dataToSave = {
        resumeName: resumeName.trim(),
        resumeData: cleanResumeDataForFirebase(cleanResumeData),
        customColors,
        template,
        preferences,
        language,
        country,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(resumeRef, dataToSave);

      // Store first resume reference if this is the user's first saved resume
      if (user?.uid && cleanResumeData) {
        const name = cleanResumeData.name || "";
        const email = cleanResumeData.email || "";
        const phone = cleanResumeData.phone || "";

        // Only store if user has entered real data (not default sample data)
        const hasRealData = (
          name && name !== "John Doe" &&
          email && email !== "john.doe@example.com" &&
          phone && phone !== "+1 (123) 456-7890"
        );

        console.log('First resume reference validation (upload save):', {
          name,
          email,
          phone,
          hasRealData,
          source: 'upload_save'
        });

        if (hasRealData) {
          try {
            const { storeFirstResumeReference } = await import("../lib/firstResumeReference");
            const response = await storeFirstResumeReference(
              user.uid,
              {
                name,
                email,
                phone
              },
              "upload_save"
            );

            if (response.stored) {
              console.log("First resume reference stored from upload save operation");
            } else {
              console.log("First resume reference not stored:", response.message);
            }
          } catch (error) {
            console.error("Error storing first resume reference:", error);
            // Don't show error to user as this is background functionality
          }
        }
      }

      toast.success(`Resume "${resumeName}" saved successfully in My resumes section!`);
      setIsSaveModalOpen(false);
      // Removed the redirect to my-resumes to keep user in context
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save resume!");
    }
  };

  const handleColorChange = (key, value) => {
    setCustomColors(prev => ({ ...prev, [key]: value }));
  };

  const openPreferences = () => {
    const latest = loadResumePreferences(defaultConfig);
    setPreferences(latest);
    setIsPrefsOpen(true);
  };
  const closePreferences = () => setIsPrefsOpen(false);
  const handlePreferencesSave = (newPrefs) => {
    setPreferences(newPrefs);
    saveResumePreferences(newPrefs);
  };

  const openColorCustomizer = () => setIsColorOpen(true);
  const closeColorCustomizer = () => setIsColorOpen(false);

  // Clean up Blob URL on unmount
  useEffect(() => {
    return () => {
      if (originalFileUrl) {
        URL.revokeObjectURL(originalFileUrl);
      }
    };
  }, [originalFileUrl]);

  // Measure enhanced card height on mount and resize
  useEffect(() => {
    function updateHeight() {
      if (enhancedCardRef.current) {
        setEnhancedCardHeight(enhancedCardRef.current.offsetHeight);
      }
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Sync preferences from localStorage on mount and when preferences modal is closed
  useEffect(() => {
    if (!isPrefsOpen) {
      const latest = loadResumePreferences(defaultConfig);
      if (JSON.stringify(latest) !== JSON.stringify(preferences)) {
        setPreferences(latest);
      }
    }
    // eslint-disable-next-line
  }, [isPrefsOpen]);

  // Always load latest preferences from localStorage on mount
  useEffect(() => {
    const latest = loadResumePreferences(defaultConfig);
    if (JSON.stringify(latest) !== JSON.stringify(preferences)) {
      setPreferences(latest);
    }
    // eslint-disable-next-line
  }, []);

  // Hydration check must be AFTER all hooks to prevent "Rendered fewer hooks than expected" error




  return (
    <>
      {/* Progress Overlays */}
      {isGeneratingPdf && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div></div>}>
          <ProgressOverlay type="download" isVisible={isGeneratingPdf} />
        </Suspense>
      )}

      {/* Unified Resume Processor */}
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div></div>}>
        <UnifiedResumeProcessor
          isVisible={showUnifiedProcessor}
          file={processingFile}
          onComplete={handleUnifiedProcessorComplete}
          onError={handleUnifiedProcessorError}
          isPremium={isPremium}
          isBasicPlan={isBasicPlan}
          isOneDayPlan={isOneDayPlan}
          uploadCount={uploadCount}
          user={user}
          onShowUpgradeModal={() => setShowUpgradeModal(true)}
          enterpriseMode={enterpriseMode}
        />
      </Suspense>

      <AnimatePresence>
        {showImprovementsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-1 sm:p-2 md:p-4"
            onClick={() => setShowImprovementsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-3xl h-[95vh] sm:h-[90vh] md:h-[85vh] lg:h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - Ultra Compact */}
              <div className="p-2 sm:p-3 border-b border-gray-200 bg-gradient-to-r from-primary to-accent text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold flex items-center gap-1">
                        AI Optimization Complete
                        <Rocket className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                      </h3>
                      <p className="text-white/80 text-xs">
                        Resume enhanced with AI optimizations
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowImprovementsModal(false)}
                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Score Improvement Section - Ultra Compact */}
                {atsScore && optimizedScore && (
                  <div className="p-2 sm:p-3 bg-bg border-b border-gray-200">
                    <div className="max-w-4xl mx-auto">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <TrendingUp className="text-accent w-3 h-3 sm:w-4 sm:h-4" />
                        ATS Score Improvement
                      </h4>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
                        {/* Original Score */}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200"
                        >
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Original</div>
                            <div className="relative inline-block">
                              <div className={`text-lg sm:text-xl font-bold ${getScoreColorAndLabel(atsScore).textColor}`}>{atsScore}</div>
                              <div className={`absolute -top-0.5 -right-3 text-[8px] font-medium ${getScoreColorAndLabel(atsScore).labelColor}`}>
                                {getScoreColorAndLabel(atsScore).label}
                              </div>
                            </div>
                            <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${atsScore}%` }}
                                transition={{ delay: 0.3, duration: 1 }}
                                className={`h-full ${getScoreColorAndLabel(atsScore).progressColor} rounded-full`}
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* Optimized Score */}
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200"
                        >
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Optimized</div>
                            <div className="relative inline-block">
                              <div className={`text-lg sm:text-xl font-bold ${getScoreColorAndLabel(optimizedScore).textColor}`}>{optimizedScore}</div>
                              <div className={`absolute -top-0.5 -right-3 text-[8px] font-medium ${getScoreColorAndLabel(optimizedScore).labelColor}`}>
                                {getScoreColorAndLabel(optimizedScore).label}
                              </div>
                            </div>
                            <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${optimizedScore}%` }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className={`h-full ${getScoreColorAndLabel(optimizedScore).progressColor} rounded-full`}
                              />
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Improvement Badge */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center"
                      >
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-accent to-accent-600 text-white shadow-lg">
                          <ArrowRight className="mr-1 w-3 h-3" />
                          +{optimizedScore - atsScore} Point Improvement
                          <Zap className="ml-1 w-3 h-3" fill="currentColor" />
                        </span>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* AI Improvements Section - Ultra Compact */}
                {optimizationImprovements && optimizationImprovements.length > 0 && (
                  <div className="p-2 sm:p-3">
                    <div className="max-w-4xl mx-auto">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <Sparkles className="text-accent w-3 h-3 sm:w-4 sm:h-4" />
                        AI Enhancements Applied
                      </h4>

                      <div className="grid gap-1 sm:gap-2">
                        {optimizationImprovements.map((improvement, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="group p-2 sm:p-3 bg-white rounded-lg border border-gray-200 hover:border-accent/30 transition-all duration-300"
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <h5 className="font-semibold text-gray-900 text-xs sm:text-sm capitalize break-words">
                                    {improvement.type.replace(/_/g, ' ')}
                                  </h5>

                                  {improvement.count && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                      {improvement.count}
                                    </span>
                                  )}
                                </div>

                                <p className="text-gray-600 text-[10px] sm:text-xs break-words line-clamp-2">
                                  {improvement.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pro Tip Section - Ultra Compact */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-2 sm:p-3 bg-amber-50 border-t border-b border-amber-200"
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-semibold text-amber-900 text-xs sm:text-sm mb-0.5">
                          Pro Tip from our AI Career Coach
                        </h5>
                        <p className="text-amber-800 text-[10px] sm:text-xs">
                          These enhancements improve your resume's compatibility with Applicant Tracking Systems (ATS) used by over 95% of Fortune 500 companies.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Modal Footer - Ultra Compact */}
              <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center text-[10px] sm:text-xs text-gray-500 order-2 sm:order-1">
                    <Shield className="text-gray-400 mr-1 w-3 h-3" />
                    Your data is secure and private
                  </div>

                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 w-full sm:w-auto order-1 sm:order-2">
                    <button
                      onClick={() => setShowImprovementsModal(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors text-xs w-full sm:w-auto"
                    >
                      View Resume
                    </button>

                    <button
                      onClick={() => {
                        setShowImprovementsModal(false);
                        handleGeneratePDF();
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:opacity-95 transition-all text-xs shadow-md flex items-center justify-center w-full sm:w-auto"
                    >
                      <Download className="mr-1 w-3 h-3" />
                      Download Enhanced Resume
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Header */}
      <header className="w-full flex flex-col md:flex-row justify-between items-center mb-4 lg:mb-6 gap-2 relative z-10">
        <div
          className="flex flex-col text-center md:text-left"
        >
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <h1 className="text-2xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-accent animate-pulse" size={28} />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Resume Enhancer
              </span>
            </h1>
            {uploadedResumeData && optimizationImprovements && optimizationImprovements.length > 0 && (
              <button
                onClick={() => setShowImprovementsModal(true)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-accent-50 text-accent-700 hover:bg-accent-100 transition-all duration-200 flex items-center gap-1.5 border border-accent/20"
              >
                <Sparkles size={14} />
                View AI Changes
              </button>
            )}
          </div>
          {!enterpriseMode && (
            <p className="text-gray-600 text-base lg:text-base font-medium mt-1 max-w-md">
              Build an <strong>ATS-optimized resume</strong> with AI-powered enhancements for your <strong>job application</strong> success.
            </p>
          )}
          {enterpriseMode && selectedClient && (
            <p className="text-gray-600 text-base lg:text-base font-medium mt-1">
              Enhancing resume for: <strong>{selectedClient.name}</strong>
            </p>
          )}
        </div>
        {/* Desktop CTAs - Keep for desktop only */}
        <div
          className="hidden md:flex gap-2 flex-wrap justify-center"
        >
          {uploadedResumeData && (
            <>
              {/* AI Boost button removed - ATS optimization provides better results automatically */}
              <button
                onClick={handleSaveResume}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md hover:opacity-95 hover:shadow-xl"
                aria-label="Save resume"
              >
                <Save size={16} /> Save
              </button>
              <button
                onClick={handleGeneratePDF}
                className={`flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md hover:opacity-95 hover:shadow-xl`}
                aria-label="Preview PDF"
              >
                <FileText size={16} /> Download PDF
              </button>
              <button
                onClick={openColorCustomizer}
                className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-md hover:bg-gray-200"
                aria-label="Color Customizer"
              >
                <Palette size={16} /> Colors
              </button>
              <button
                onClick={openPreferences}
                className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-md hover:bg-gray-200"
                aria-label="Preferences"
              >
                <Edit2 size={16} /> Prefs
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all border border-gray-200 shadow-sm hover:shadow-md"
                aria-label="Reset and upload new"
              >
                <RefreshCw size={16} /> Reset
              </button>
            </>
          )}
        </div>
      </header>


      {/* Main Content */}
      <main className="w-full flex flex-col gap-4 relative z-10 mt-0">
        {/* Mobile Header - Only show when resume is uploaded */}
        {uploadedResumeData && (
          <div className="md:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">Resume Enhancer</span>

                {atsScore !== null ? (
                  <div className="flex items-center gap-2">
                    <span className={`${getScoreColorAndLabel(atsScore).badgeBg} text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium shadow-sm`}>
                      Original: {atsScore}/100
                    </span>
                    {optimizedScore != null && (
                      <span className={`${getScoreColorAndLabel(optimizedScore).badgeBg} text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium shadow-sm`}>
                        Optimized: {optimizedScore}/100
                      </span>
                    )}
                  </div>
                ) : (
                  <span className={`${getScoreColorAndLabel(activeTab === "uploaded" ? uploadedScore : parsedScore).badgeBg} text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm`}>
                    {activeTab === "uploaded" ? uploadedScore : parsedScore}/100
                  </span>
                )}
              </div>

            </div>
          </div>
        )}

        {!uploadedResumeData ? (
          <div
            className="bg-white rounded-2xl shadow-xl p-3 lg:p-4 text-center border border-gray-200/50 backdrop-blur-sm"
          >
            <div className="max-w-2xl mx-auto">
              {/* Only show upload limit banner for free users, not oneDay, basic or premium plan users */}
              {!enterpriseMode && !isPremium && !isBasicPlan && !isOneDayPlan && (
                <div className="mb-6 p-4 bg-primary/5 border border-accent/20 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <UploadCloud size={18} className="text-accent" />
                    <span className="font-semibold">
                      {uploadCount === 0 ? "1 Free Upload Available" : "Free Upload Used"}
                    </span>
                  </div>
                  {uploadCount > 0 && !isLoadingGeo && (
                    <div className="text-center mt-3">
                      <div className="text-sm text-primary mb-3">
                        {`Get unlimited uploads starting at ${isAndroidDevice && pricing.currency === 'INR' ? formatPrice(pricing.basic, pricing.currency) + ' (7 days)' : formatPrice(pricing.monthly, pricing.currency) + ' (30 days)'}`}
                        <div className="text-xs text-gray-500 mt-1">
                          🚫 No Auto-Renewal • One-time payment
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpgradeClick(pricing.currency === 'INR' && isAndroidDevice ? "basic" : "monthly")}
                        className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-lg font-semibold hover:opacity-95 transition-all shadow-md flex items-center gap-2 mx-auto"
                      >
                        <Crown size={16} />
                        {isAndroidDevice && pricing.currency === 'INR' ? `Upgrade Now - ${formatPrice(pricing.basic, pricing.currency)} (7 days)` : `Upgrade Now - ${formatPrice(pricing.monthly, pricing.currency)} (30 days)`}
                      </button>
                    </div>
                  )}
                  {uploadCount > 0 && isLoadingGeo && (
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Loading offers...</span>
                    </div>
                  )}
                </div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mb-4">
                <label
                  className="flex flex-col items-center gap-4 bg-gradient-to-r from-primary to-accent text-white px-8 py-6 rounded-xl hover:opacity-95 transition-all cursor-pointer w-full mx-auto shadow-lg hover:shadow-xl"
                  onClick={() => {
                    console.log('🖱️ Upload button clicked', {
                      isUploadingPdf,
                      fileInputRef: fileInputRef.current
                    });
                  }}
                >
                  <div className="p-3 bg-white/20 rounded-full">
                    <UploadCloud size={32} className="animate-bounce" />
                  </div>
                  <span className="text-xl font-bold">Upload Your Resume</span>
                  <span className="text-sm font-medium opacity-90">PDF • DOCX • DOC • Max 5MB</span>
                  <input
                    ref={fileInputRef}
                    id="file-upload-input"
                    type="file"
                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                    onChange={(e) => {
                      console.log('📁 File input onChange triggered');
                      const file = e.target.files[0];
                      if (!file) {
                        toast.error("Please select a file to upload.");
                        return;
                      }
                      console.log('📄 File selected:', file.name);

                      // Check free upload limit for non-premium users
                      // oneDay, basic, and premium users have unlimited uploads
                      // Enterprise users bypass this check
                      if (!enterpriseMode && !isPremium && !isBasicPlan && !isOneDayPlan && uploadCount >= 1) {
                        console.log('🚫 Free upload limit reached, showing upgrade modal');
                        setShowUpgradeModal(true);
                        // Clear the file input
                        e.target.value = '';
                        return;
                      }

                      // Check quota for enterprise users
                      if (enterpriseMode && user) {
                        console.log("🔄 Enterprise mode detected, checking quota for user:", user.uid);
                        const checkEnterpriseQuota = async () => {
                          try {
                            const adminId = await getAdminId(user.uid);
                            console.log("👤 Admin ID for quota check:", adminId || user.uid);
                            const quotaCheck = await checkQuota(adminId || user.uid, QUOTA_TYPES.RESUME_UPLOADS);
                            console.log("📊 Quota check result:", quotaCheck);

                            if (!quotaCheck.allowed) {
                              console.log("❌ Quota limit reached, showing modal");
                              setQuotaInfo({
                                quotaType: "resumeUploads",
                                currentCount: quotaCheck.currentCount,
                                limit: quotaCheck.limit,
                                remaining: quotaCheck.remaining
                              });
                              setShowQuotaModal(true);
                              // Clear the file input
                              e.target.value = '';
                              return;
                            }

                            // If quota check passes, proceed with file processing
                            console.log("✅ Quota check passed, opening unified processor");
                            setProcessingFile(file);
                            setShowUnifiedProcessor(true);
                          } catch (quotaError) {
                            console.error("Error checking upload quota:", quotaError);
                            toast.error("Unable to verify upload quota. Please try again.");
                            // Clear the file input
                            e.target.value = '';
                            return;
                          }
                        };

                        checkEnterpriseQuota();
                        return;
                      }

                      // Set the file and show unified processor (for non-enterprise users)
                      console.log("🔄 Non-enterprise mode, opening unified processor directly");
                      setProcessingFile(file);
                      setShowUnifiedProcessor(true);
                    }}
                    className="hidden"
                    disabled={isUploadingPdf}
                    aria-label="Upload resume PDF or Word document for ATS enhancement"
                  />
                </label>
              </motion.div>

              {/* Trust micro-signal */}
              <p className="text-center text-xs text-gray-500 mt-3">
                Used by professionals applying to US companies. Built for ATS like Workday, Greenhouse & Lever. Your resume data is never shared or sold.
              </p>

              {/* Upload History Button */}
              {hasHistory && user && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setIsHistoryPanelOpen(true)}
                  className="mt-4 w-full bg-primary/5 border-2 border-accent/30 text-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-primary/10 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Clock size={18} className="sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">View Upload History</span>
                  <span className="bg-accent/20 text-primary px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap">
                    Quick Access
                  </span>
                </motion.button>
              )}

              <section className="mt-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Optimize Your Resume for ATS
                </h2>
                <p className="text-gray-600 text-sm">
                  Upload your resume to get AI-powered enhancements tailored for <strong>applicant tracking systems</strong>. Our tool ensures your resume is <strong>ATS-friendly</strong> with optimized <strong>keywords</strong> and formatting.
                </p>
              </section>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-4 min-h-[calc(100vh-200px)]">
              <section
                className="bg-white rounded-2xl shadow-xl p-3 border border-gray-200/50 h-full"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("uploaded")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${activeTab === "uploaded"
                        ? "bg-gradient-to-r from-primary to-accent text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } transition-all duration-200`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setActiveTab("edit")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${activeTab === "edit"
                        ? "bg-gradient-to-r from-primary to-accent text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } transition-all duration-200`}
                    >
                      Edit
                    </button>
                  </div>
                  {atsScore !== null ? (
                    <span className={`${getScoreColorAndLabel(atsScore).badgeBg} text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm`}>
                      Original ATS: {atsScore}/100
                    </span>
                  ) : (
                    <span className={`${getScoreColorAndLabel(activeTab === "uploaded" ? uploadedScore : parsedScore).badgeBg} text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm`}>
                      {activeTab === "uploaded" ? uploadedScore : parsedScore}/100
                    </span>
                  )}
                </div>
                <div className="h-full overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {activeTab === "uploaded" ? (
                      <motion.div
                        key="uploaded"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {originalFileUrl ? (
                          originalFileType === "application/pdf" ? (
                            <div
                              className="w-full border rounded-xl overflow-hidden bg-gray-50"
                              style={{ minHeight: '90vh', height: enhancedCardHeight || '90vh' }}
                            >
                              <iframe src={originalFileUrl} title="Original Resume PDF" className="w-full h-full" />
                            </div>
                          ) : (
                            <div className="w-full flex flex-col items-center justify-center h-[50vh]">
                              <div className="text-center">
                                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Original Resume</h3>
                                <p className="text-gray-500 mb-4">Download your original uploaded file</p>
                                <a
                                  href={originalFileUrl}
                                  download
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-medium hover:opacity-95 transition-all"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download size={20} />
                                  Download Original Resume ({originalFileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? ".docx" : ".doc"})
                                </a>
                                <p className="text-xs text-gray-400 mt-2">Preview not supported for this file type</p>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="w-full flex flex-col items-center justify-center h-[50vh]">
                            <div className="text-center">
                              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Original File</h3>
                              <p className="text-gray-500">Upload a resume to see the original file here</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div></div>}>
                          <ResumeForm
                            data={parsedResumeData}
                            onUpdate={handleUpdate}
                            language={language}
                            country={country}
                            currentUserId={user?.uid}
                            currentResumeId="upload"
                          />
                        </Suspense>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              <section
                ref={enhancedCardRef}
                className="bg-white rounded-2xl shadow-xl p-3 border border-gray-200/50 h-full"
              >
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles size={18} className="text-accent" />
                    {useOriginalContent ? "Original Content" : "Enhanced Resume"}
                  </h2>
                  <div className="flex gap-2 items-center flex-wrap">
                    {/* Toggle between Original and Enhanced */}
                    {originalParsedData && optimizedParsedData && (
                      <button
                        onClick={() => {
                          const newState = !useOriginalContent;
                          console.log('🔄 Toggle clicked:', {
                            from: useOriginalContent ? 'original' : 'enhanced',
                            to: newState ? 'original' : 'enhanced',
                            hasOriginalData: !!originalParsedData,
                            hasOptimizedData: !!optimizedParsedData
                          });
                          setUseOriginalContent(newState);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-sm hover:shadow-md ${useOriginalContent
                          ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          : "bg-gradient-to-r from-primary to-accent text-white border-primary hover:opacity-95"
                          }`}
                        aria-label={useOriginalContent ? "Switch to Enhanced" : "Switch to Original"}
                      >
                        <RefreshCw size={14} />
                        {useOriginalContent ? "Use Enhanced" : "Use Original"}
                      </button>
                    )}
                    <button
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="flex items-center gap-2 bg-white text-gray-700 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all border border-gray-200 shadow-sm hover:shadow-md"
                      aria-label="Change template style"
                    >
                      <Palette size={16} /> Style
                    </button>
                    {optimizedScore !== null && !useOriginalContent ? (
                      <span className={`${getScoreColorAndLabel(optimizedScore).badgeBg} text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm`}>
                        Optimized ATS: {optimizedScore}/100
                      </span>
                    ) : (
                      <span className={`${getScoreColorAndLabel(parsedScore).badgeBg} text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm`}>
                        {parsedScore ?? "N/A"}/100
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Status Banner */}
                {optimizedResumeData && originalParsedData && (
                  <div className={`mb-3 p-3 rounded-lg border ${useOriginalContent
                    ? "bg-gray-50 border-gray-300"
                    : "bg-gradient-to-r from-accent-50 to-accent-50 border-accent/20"
                    }`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${useOriginalContent ? "bg-gray-500" : "bg-accent animate-pulse"
                          }`}></div>
                        <span className={`text-sm font-medium ${useOriginalContent ? "text-gray-800" : "text-accent-800"
                          }`}>
                          {useOriginalContent
                            ? "Showing Original Parsed Content"
                            : "Showing ATS-Optimized Resume"}
                        </span>
                        {!useOriginalContent && optimizedScore && atsScore && (
                          <span className="text-xs text-accent-600">
                            (+{optimizedScore - atsScore} points improvement)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-600">
                        {useOriginalContent
                          ? "This is your original resume data with minimal AI changes"
                          : "AI-enhanced content for better ATS performance"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="h-full overflow-y-auto">
                  {(() => {
                    const isATSTemplate = template && template.startsWith('ats_');
                    console.log('Upload Resume - Template Debug:', {
                      template,
                      isATSTemplate,
                      templateType: typeof template,
                      hasData: !!(parsedResumeData || uploadedResumeData),
                      templateData: isATSTemplate ? (templates[template] || atsFriendlyTemplates[template]) : null
                    });

                    // Convert template string to template object for ATS templates
                    const templateData = isATSTemplate ? (atsFriendlyTemplates[template] || templates[template]) :
                      template && template.startsWith('visual_') ? (visualAppealTemplates[template] || templates[template]) : template;

                    // Check if it's a Visual Appeal template
                    const isVisualAppealTemplate = template && template.startsWith('visual_') ||
                      (templateData && templateData.category === 'Visual Appeal');

                    // Use parsedResumeData which is updated by toggle
                    // parsedResumeData contains either original or enhanced based on toggle state
                    const dataToRender = parsedResumeData || uploadedResumeData;

                    console.log('📊 Preview Render Data:', {
                      useOriginalContent,
                      hasParsedData: !!parsedResumeData,
                      hasDataToRender: !!dataToRender,
                      dataSource: parsedResumeData ? 'parsedResumeData' : 'uploadedResumeData',
                      sampleData: dataToRender ? {
                        name: dataToRender.name,
                        experienceCount: dataToRender.experience?.length || 0
                      } : null
                    });

                    return isVisualAppealTemplate ? (
                      <VisualAppealRenderer
                        data={dataToRender}
                        template={templateData}
                        isCompact={false}
                        isPremium={isPremium}
                      />
                    ) : isATSTemplate ? (
                      <ATSResumeRenderer
                        data={dataToRender}
                        template={templateData}
                        isCompact={false}
                        isPremium={isPremium}
                      />
                    ) : (
                      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div></div>}>
                        <ResumePreview
                          data={dataToRender}
                          template={template}
                          customColors={customColors}
                          language={language}
                          country={country}
                          preferences={preferences}
                          isPremium={isPremium}
                        />
                      </Suspense>
                    );
                  })()}
                </div>
              </section>
            </div>

            {/* Mobile Layout - Three Tabs */}
            <div className="lg:hidden">
              <div
                className="bg-white rounded-2xl shadow-xl p-2 border border-gray-200/50 backdrop-blur-sm mb-20 mt-2 mobile-upload-container"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveTab("uploaded")}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${activeTab === "uploaded"
                        ? "bg-gradient-to-r from-primary to-accent text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } transition-all duration-200`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setActiveTab("edit")}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${activeTab === "edit"
                        ? "bg-gradient-to-r from-primary to-accent text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } transition-all duration-200`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setActiveTab("enhanced")}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${activeTab === "enhanced"
                        ? "bg-gradient-to-r from-primary to-accent text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } transition-all duration-200`}
                    >
                      Enhanced
                    </button>

                  </div>

                </div>
                <AnimatePresence mode="wait">
                  {activeTab === "uploaded" ? (
                    <motion.div
                      key="uploaded"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {originalFileUrl ? (
                        originalFileType === "application/pdf" ? (
                          <div
                            className="w-full border rounded-xl overflow-hidden bg-gray-50"
                            style={{ minHeight: '90vh', height: enhancedCardHeight || '90vh' }}
                          >
                            <iframe src={originalFileUrl} title="Original Resume PDF" className="w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-full flex flex-col items-center justify-center h-[50vh]">
                            <div className="text-center">
                              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-700 mb-2">Original Resume</h3>
                              <p className="text-gray-500 mb-4">Download your original uploaded file</p>
                              <a
                                href={originalFileUrl}
                                download
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-medium hover:opacity-95 transition-all"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download size={20} />
                                Download Original Resume ({originalFileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? ".docx" : ".doc"})
                              </a>
                              <p className="text-xs text-gray-400 mt-2">Preview not supported for this file type</p>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="w-full flex flex-col items-center justify-center h-[50vh]">
                          <div className="text-center">
                            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Original File</h3>
                            <p className="text-gray-500">Upload a resume to see the original file here</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : activeTab === "edit" ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div></div>}>
                        <ResumeForm
                          data={parsedResumeData}
                          onUpdate={handleUpdate}
                          language={language}
                          country={country}
                          mobile={true}
                          currentUserId={user?.uid}
                          currentResumeId="upload"
                        />
                      </Suspense>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="enhanced"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-center items-start w-full"
                    >
                      {(() => {
                        const isATSTemplate = template && template.startsWith('ats_');
                        console.log('Upload Resume Mobile - Template Debug:', {
                          template,
                          isATSTemplate,
                          templateType: typeof template,
                          hasData: !!(parsedResumeData || uploadedResumeData)
                        });

                        // Convert template string to template object for ATS templates
                        const templateData = isATSTemplate ? (templates[template] || atsFriendlyTemplates[template]) : template;

                        return isATSTemplate ? (
                          <ATSResumeRenderer
                            data={parsedResumeData || uploadedResumeData}
                            template={templateData}
                            isCompact={false}
                            isPremium={isPremium}
                          />
                        ) : (
                          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div></div>}>
                            <ResumePreview
                              data={parsedResumeData || uploadedResumeData} // Fallback to uploadedResumeData if parsedResumeData is null
                              template={template}
                              customColors={customColors}
                              language={language}
                              country={country}
                              preferences={preferences}
                              isPremium={isPremium}
                              style={{ padding: 0 }}
                            />
                          </Suspense>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Template Selector Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-3 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Select a Template</h2>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="size-6" />
              </button>
            </div>
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div></div>}>
              <TemplateSelector
                template={template}
                setTemplate={handleTemplateChange}
                onClose={() => setIsTemplateModalOpen(false)}
                disabled={false}
                isPremium={isPremium}
                stayOnPage={true}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      <PremiumPdfPreview
        isOpen={isPdfModalOpen}
        onClose={handlePdfModalClose}
        pdfPreviewUrl={pdfPreviewUrl}
        isPremium={isPremium}
        user={user}
        handleUpgradeClick={handleUpgradeClick}
        formatPrice={formatPrice}
        monthlyPrice={pricing.monthly}
        basicPrice={pricing.basic}
        currency={currency}
        enterpriseMode={enterpriseMode}
        adminIsPremium={adminIsPremium}
        event={event}
        toast={toast}
      />

      {/* Save Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg p-3 md:p-6 w-full max-w-sm md:max-w-md">
            <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-gray-800">Save Resume</h2>
            <p className="text-gray-600 mb-2 md:mb-4 text-xs md:text-sm">Enter a name for your resume:</p>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="e.g., Software Engineer Resume"
              className="w-full p-1 md:p-2 border border-gray-300 rounded-md mb-2 md:mb-4 text-xs md:text-sm"
            />
            <div className="flex gap-2 md:gap-4">
              <button
                onClick={saveResumeWithName}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white px-2 md:px-4 py-1 md:py-2 rounded-md hover:opacity-95 transition-all text-xs md:text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="flex-1 text-gray-600 hover:text-gray-800 underline transition-colors text-xs md:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Slideshow Modal */}
      <ResumeSlideshowModal
        isOpen={isSlideshowOpen}
        onClose={() => {
          setIsSlideshowOpen(false);
          setUserClosedSlideshow(true);
        }}
        resumeData={parsedResumeData}
        customColors={customColors}
        preferences={preferences}
        isPremium={isPremium}
        user={user}
        upgradeCTA={
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-md font-semibold hover:opacity-95 transition-all mt-2"
          >
            Unlock All Templates
          </button>
        }
      />

      {/* Preferences Modal */}
      <AnimatePresence>
        {isPrefsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Resume Preferences</h3>
                <button
                  onClick={closePreferences}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <ResumePreferences
                config={preferences}
                onChange={handlePreferencesSave}
                onClose={closePreferences}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Customizer Modal */}
      <AnimatePresence>
        {isColorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Color Customizer</h3>
                <button
                  onClick={closeColorCustomizer}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <ColorCustomizer
                template={template}
                colors={customColors}
                onChange={handleColorChange}
                onDone={closeColorCustomizer}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Boost Success Notification - Strategic UX */}
      <AnimatePresence>
        {showAIBoostSuccess && aiBoostData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 lg:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAIBoostSuccess(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="text-center">
                  {/* Success Icon with Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 relative"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-transparent border-t-white/30 rounded-full"
                    />
                    <Sparkles size={24} className="sm:w-8 sm:h-8 text-white" />
                  </motion.div>

                  {/* Success Message */}
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    🎉 AI Boost Complete!
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    We've analyzed and enhanced your resume with AI-powered improvements.
                    Your ATS score increased by <span className="font-bold text-accent">+{aiBoostData.scoreImprovement} points</span> to <span className="font-bold text-accent">{aiBoostData.newScore}/100</span>!
                  </p>

                  {/* Achievement Badges */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="bg-primary/10 border border-accent/20 rounded-lg p-2 sm:p-3">
                      <div className="text-primary font-bold text-base sm:text-lg">+{aiBoostData.scoreImprovement}</div>
                      <div className="text-primary text-xs font-medium">Score Boost</div>
                    </div>
                    <div className="bg-primary/10 border border-accent/20 rounded-lg p-2 sm:p-3">
                      <div className="text-primary font-bold text-base sm:text-lg">{aiBoostData.newScore}/100</div>
                      <div className="text-primary text-xs font-medium">New ATS Score</div>
                    </div>
                  </div>

                  {/* AI Improvements Summary */}
                  {optimizationImprovements && optimizationImprovements.length > 0 && (
                    <div className="bg-accent-50 border border-accent/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <h4 className="font-semibold text-accent-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Sparkles size={14} className="sm:w-4 sm:h-4" />
                        AI Enhancements Applied
                      </h4>
                      <div className="space-y-2">
                        {optimizationImprovements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <div className="text-xs sm:text-sm text-accent-800">
                              <span className="font-medium">{improvement.type.charAt(0).toUpperCase() + improvement.type.slice(1)}:</span> {improvement.description}
                              {improvement.count && (
                                <span className="text-accent-600 font-medium"> ({improvement.count} items)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  <div className="bg-primary/5 border border-accent/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <h4 className="font-semibold text-primary mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <Trophy size={14} className="sm:w-4 sm:h-4" />
                      Ready for the Next Level?
                    </h4>
                    <p className="text-primary text-xs sm:text-sm">
                      Explore our premium templates designed to make your enhanced resume stand out even more!
                    </p>
                  </div>

                  {/* Small Print */}
                  <p className="text-xs text-gray-500">
                    ✨ Your enhanced resume is ready to download or continue editing
                  </p>
                </div>
              </div>

              {/* Sticky Action Buttons */}
              <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 pt-0 sm:pt-0 lg:pt-0 border-t border-gray-100 bg-white rounded-b-xl sm:rounded-b-2xl">
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={() => {
                      setShowAIBoostSuccess(false);
                      setIsSlideshowOpen(true);
                      setHasSeenSlideshow(true);
                      setUserClosedSlideshow(false);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-bold hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Eye size={16} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">View Premium Templates</span>
                    <span className="sm:hidden">View Templates</span>
                  </button>

                  <button
                    onClick={() => setShowAIBoostSuccess(false)}
                    className="w-full bg-gray-100 text-gray-600 py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg font-medium hover:bg-gray-200 transition-all text-sm sm:text-base"
                  >
                    Continue Editing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Limit Upgrade Modal */}
      <AnimatePresence>
        {!enterpriseMode && showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 lg:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="text-center">
                  {/* Lock Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                  >
                    <Lock size={24} className="sm:w-8 sm:h-8 text-white" />
                  </motion.div>

                  {/* Headline */}
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
                    🔒 Free Upload Limit Reached
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed px-2">
                    You've used your <span className="font-semibold">1 free upload</span>. Upgrade to get unlimited resume uploads and AI-powered enhancements!
                  </p>

                  {/* Benefits */}
                  <div className="bg-primary/5 border border-accent/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left">
                    <h4 className="font-semibold text-primary mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <Crown size={16} className="sm:w-5 sm:h-5" />
                      What You'll Get:
                    </h4>
                    <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-primary-700">
                      <li className="flex items-start gap-2">
                        <Check size={14} className="sm:w-4 sm:h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span><strong>Unlimited resume uploads</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="sm:w-4 sm:h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span><strong>AI-powered content enhancement</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="sm:w-4 sm:h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span><strong>Premium templates & designs</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="sm:w-4 sm:h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span><strong>ATS optimization tools</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="sm:w-4 sm:h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span><strong>Unlimited downloads</strong></span>
                      </li>
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="bg-primary/5 border border-accent/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Special Offer</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary">
                        {`Get unlimited uploads starting at ${isAndroidDevice && pricing.currency === 'INR' ? formatPrice(pricing.basic, pricing.currency) + ' (7 days)' : formatPrice(pricing.monthly, pricing.currency) + ' (30 days)'}`}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {isAndroidDevice ? "Valid for 7 days" : "Valid for 30 days"}
                      </p>
                      <div className="text-xs text-gray-500 mt-1 sm:mt-2">
                        🚫 No Auto-Renewal • One-time payment
                      </div>
                    </div>
                  </div>

                  {/* Trust Signals */}
                  <p className="text-xs text-gray-500 px-2 leading-relaxed">
                    💸 Trusted by 100,000+ job seekers<br className="sm:hidden" />
                    <span className="hidden sm:inline"> • </span>World class quality
                  </p>
                </div>
              </div>

              {/* Sticky Action Buttons */}
              <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 pt-0 sm:pt-0 lg:pt-0 border-t border-gray-100 bg-white rounded-b-xl sm:rounded-b-2xl">
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      handleUpgradeClick(pricing.currency === 'INR' && isAndroidDevice ? "basic" : "monthly");
                    }}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-bold hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Crown size={16} className="sm:w-5 sm:h-5" />
                    <span className="truncate">
                      {`Upgrade Now - ${isAndroidDevice && pricing.currency === 'INR' ? formatPrice(pricing.basic, pricing.currency) + ' (7 days)' : formatPrice(pricing.monthly, pricing.currency) + ' (30 days)'}`}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-full bg-gray-100 text-gray-600 py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg font-medium hover:bg-gray-200 transition-all text-sm sm:text-base"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      {uploadedResumeData && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 max-w-md mx-auto">
          <div className="flex items-center py-2 px-1">
            {/* Reset Button - Left */}
            <button
              onClick={handleReset}
              className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-all duration-200 p-1"
            >
              <RefreshCw size={16} />
              <span className="text-[10px] font-medium mt-0.5">Reset</span>
            </button>

            {/* Main Actions - Center */}
            <div className="flex-1 flex justify-around items-center">
              {/* AI Boost button removed - ATS optimization provides better results automatically */}

              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex flex-col items-center text-accent hover:text-accent-700 transition-all duration-200 p-1"
              >
                <Palette size={16} />
                <span className="text-[10px] font-medium mt-0.5">Themes</span>
              </button>

              <button
                onClick={openColorCustomizer}
                className="flex flex-col items-center text-orange-600 hover:text-orange-700 transition-all duration-200 p-1"
              >
                <Palette size={16} />
                <span className="text-[10px] font-medium mt-0.5">Colors</span>
              </button>

              <button
                onClick={handleSaveResume}
                className="flex flex-col items-center text-primary hover:text-accent transition-all duration-200 p-1"
              >
                <Save size={16} />
                <span className="text-[10px] font-medium mt-0.5">Save</span>
              </button>

              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPdf}
                className={`flex flex-col items-center transition-all duration-200 p-1 ${isGeneratingPdf
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-primary hover:text-accent'
                  }`}
              >
                {isGeneratingPdf ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-accent"></div>
                ) : (
                  <Download size={16} />
                )}
                <span className="text-[10px] font-medium mt-0.5">
                  {isGeneratingPdf ? 'Gen...' : 'Download'}
                </span>
              </button>


            </div>

            {/* Settings Button - Right */}
            <button
              onClick={openPreferences}
              className="flex flex-col items-center text-gray-600 hover:text-accent transition-all duration-200 p-1"
            >
              <Edit2 size={16} />
              <span className="text-xs font-medium mt-0.5">Prefs</span>
            </button>
          </div>
        </div>
      )}

      {/* Slideshow Modal Trigger Button (only when resume data is available) */}
      {parsedResumeData && (
        <button
          className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-primary to-accent text-white p-3 rounded-full shadow-xl font-bold hover:scale-105 hover:opacity-95 transition-all md:bottom-6 md:right-6 md:px-5 md:py-3"
          onClick={() => {
            setIsSlideshowOpen(true);
            setUserClosedSlideshow(false);
          }}
          aria-label="See Magic Designs"
        >
          <Sparkles className="w-5 h-5" />
          <span className="hidden md:inline ml-2">See Magic Designs</span>
        </button>
      )}



      {/* Enterprise Upgrade Modal */}


      {/* Quota Limit Modal */}
      <QuotaLimitModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        quotaType={quotaInfo?.quotaType}
        currentCount={quotaInfo?.currentCount}
        limit={quotaInfo?.limit}
        onUpgrade={() => {
          setShowQuotaModal(false);
          router.push('/enterprise/checkout');
        }}
      />


      {/* Quota Limit Modal */}
      <QuotaLimitModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        quotaType={quotaInfo?.quotaType}
        currentCount={quotaInfo?.currentCount}
        limit={quotaInfo?.limit}
        onUpgrade={() => {
          setShowQuotaModal(false);
          router.push('/enterprise/checkout');
        }}
      />

      {/* Fresher Discount Popup - Disabled - FRESHER50 coupon removed */}
      {/* <FresherDiscountPopup
        isOpen={showFresherPopup}
        onClose={() => setShowFresherPopup(false)}
        fresherData={fresherData}
        source="upload-resume"
      /> */}

      {/* Upload History Panel */}
      <UploadHistoryPanel
        userId={user?.uid}
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        onRestore={handleRestoreFromHistory}
      />


      <ProfileGuardModal />

    </>
  );
}