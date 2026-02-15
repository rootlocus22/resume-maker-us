"use client";


import { useState, useRef, useEffect, Suspense, useTransition } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import ATSCheckerSkeleton from '../components/ATSCheckerSkeleton';
import PostAnalysisUpsellModal from '../components/PostAnalysisUpsellModal';
import SimpleAuthModal from '../components/SimpleAuthModal';
import {
  UploadCloud,
  Star,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Check,
  ClipboardList,
  Lightbulb,
  Zap,
  Briefcase,
  PenTool,
  BarChart2,
  Twitter,
  Linkedin,
  Share2,
  Download,
  Eye,
  AlertTriangle,
  X,
  ArrowRight,
  ArrowLeft,
  Gem,
  Crown,
  Rocket,
  Award,
  Lock,
  ChevronDown,
  ChevronUp,
  Users,
  TrendingUp,
  Shield,
  Target,
  Clock,

  Globe,
  FileText,
  Bookmark,
  GraduationCap,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Calendar,
  UserCheck,
  Brain,
  Target as TargetIcon,
  Zap as ZapIcon,
  Heart,
  Frown,
  Smile,
  Meh,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Percent,
  Award as AwardIcon,
  Briefcase as BriefcaseIcon,
  GraduationCap as GraduationCapIcon,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  CheckSquare,
  Square,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  Info,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  PhoneCall,
  Video,
  CalendarDays,
  Clock as ClockIcon,
  DollarSign as DollarSignIcon,
  CreditCard,
  Shield as ShieldIcon,
  Zap as ZapIcon2,
  Target as TargetIcon2,
  Users as UsersIcon,
  TrendingUp as TrendingUpIcon,
  Award as AwardIcon2,
  Star as StarIcon,
  Heart as HeartIcon,
  Zap as ZapIcon3,
  Target as TargetIcon3,
  Users as UsersIcon2,
  TrendingUp as TrendingUpIcon2,
  Award as AwardIcon3,
  Star as StarIcon2,
  Heart as HeartIcon2,
  TrophyIcon as TrophyIcon2
} from "lucide-react";
import ModernAnalysisDisplay from "./ModernAnalysisDisplay";
import GoogleReviewsButton from "../components/GoogleReviewsButton";
const OptimizedResumePreview = dynamic(() => import("./OptimizedResumePreview"), {
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>
});
const ResumePreview = dynamic(() => import("../components/ResumePreview"), {
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>
});
import { atsFriendlyTemplates } from "../lib/atsFriendlyTemplates";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";


import ProgressOverlay from "../components/ProgressOverlay";
import ResumeSlideshowModal from "../components/ResumeSlideshowModal";
import { useAuth } from "../context/AuthContext";
import { defaultConfig } from "../lib/templates";
import { useRouter } from "next/navigation";
import JobSpecificResumePreview from "../components/JobSpecificResumePreview";
import { saveResumeData, loadResumeData, getWorkingResume, setWorkingResume, saveResumeDataWithPreAuth } from "../lib/storage";
import { createResumeVersion, setActiveResumeVersion } from "../lib/storage";
import { saveATSHistory, getLastATSCheck } from "../lib/uploadHistory";
const ATSHistoryPanel = dynamic(() => import("../components/ATSHistoryPanel"));
import { getEffectivePricing, getPricingConfigByCurrency, formatPrice } from "../lib/globalPricing";
import { useLocation } from "../context/LocationContext";
// const FresherDiscountPopup = dynamic(() => import("../components/FresherDiscountPopup")); // Disabled - FRESHER50 coupon removed
import InterviewCheatsheetCTA from "../components/InterviewCheatsheetCTA";
import { logActivity, ACTIVITY_TYPES, getAdminId } from "../lib/teamManagement";
import { checkQuota, incrementQuota, QUOTA_TYPES } from "../lib/enterpriseQuotas";
const QuotaLimitModal = dynamic(() => import("../components/QuotaLimitModal"));


export default function ATSScoreCheckerClient({ enterpriseMode = false, selectedClient = null, initialHistoryData = null, prefilledData = null }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);



  const router = useRouter();
  const { isPremium, isBasicPlan, isOneDayPlan, user } = useAuth();
  const { currency } = useLocation();
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingScreenshot, setIsGeneratingScreenshot] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [hasSeenSlideshow, setHasSeenSlideshow] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [showPremiumComparison, setShowPremiumComparison] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0);

  const [atsCheckCount, setAtsCheckCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showATSSuccess, setShowATSSuccess] = useState(false);
  const [atsSuccessData, setATSSuccessData] = useState(null);
  const [showAIBoostModal, setShowAIBoostModal] = useState(false);

  const [activeTab, setActiveTab] = useState('original');
  const [currentOptimizedTemplate, setCurrentOptimizedTemplate] = useState(0);
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const [customColors] = useState({});
  const [preferences] = useState(defaultConfig);

  // ATS History state
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  // Enterprise access state (for unlocking premium features)
  const [hasEnterpriseAccess, setHasEnterpriseAccess] = useState(false);

  // Check enterprise access on mount
  useEffect(() => {

    const checkEnterpriseAccess = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/get-user-profile?uid=${user.uid}`);
        if (response.ok) {
          const profile = await response.json();

          // Enterprise access if:
          // 1. Admin with enterprise_pro plan OR
          // 2. Team member (inherits admin's enterprise_pro)
          const isAdmin = profile.professionalProfile?.role === "admin" || profile.role === "admin";
          const isEnterprisePro = profile.professionalProfile?.planType === "enterprise_pro" || profile.planType === "enterprise_pro";
          const isTeamMember = profile.isTeamMember === true ||
            profile.userType === "team_member" ||
            profile.teamProfile?.role === "team_member" ||
            profile.professionalProfile?.role === "team_member";

          const hasAccess = (isAdmin && isEnterprisePro) || isTeamMember;

          console.log('🔐 Enterprise access check:', {
            isAdmin,
            isEnterprisePro,
            isTeamMember,
            hasAccess,
            planType: profile.professionalProfile?.planType || profile.planType
          });

          setHasEnterpriseAccess(hasAccess);
        }
      } catch (error) {
        console.error("Error checking enterprise access:", error);
      }
    };

    checkEnterpriseAccess();
  }, [user]);

  // Auto-restore from initial history data (for quick access from analytics)
  useEffect(() => {
    if (initialHistoryData) {
      console.log("🔄 Auto-restoring ATS history data for quick access");
      console.log("📄 File:", initialHistoryData.fileName);
      console.log("📊 Score:", initialHistoryData.atsScore || initialHistoryData.score);
      console.log("📦 Available fields:", Object.keys(initialHistoryData));
      console.log("📋 Field details:", {
        hasAtsAnalysis: !!initialHistoryData.atsAnalysis,
        hasResult: !!initialHistoryData.result,
        hasAnalysis: !!initialHistoryData.analysis,
        hasScore: !!(initialHistoryData.atsScore || initialHistoryData.score),
        hasParsedData: !!initialHistoryData.parsedData,
        hasRecommendations: !!initialHistoryData.recommendations,
        timestamp: initialHistoryData.timestamp || initialHistoryData.createdAt
      });

      // Log the actual atsAnalysis object if it exists
      if (initialHistoryData.atsAnalysis) {
        console.log("✅ atsAnalysis EXISTS! Structure:", {
          keys: Object.keys(initialHistoryData.atsAnalysis),
          overallScore: initialHistoryData.atsAnalysis.overallScore,
          hasKeywordAnalysis: !!initialHistoryData.atsAnalysis.keywordAnalysis,
          hasSkillsAnalysis: !!initialHistoryData.atsAnalysis.skillsAnalysis,
          hasDetailedAnalysis: !!initialHistoryData.atsAnalysis.detailedAnalysis,
          hasExecutiveSummary: !!initialHistoryData.atsAnalysis.executiveSummary,
          hasActionableRecommendations: !!initialHistoryData.atsAnalysis.actionableRecommendations
        });
      } else {
        console.log("❌ atsAnalysis field is MISSING from Firestore document");
        console.log("🔍 Available top-level fields:", Object.keys(initialHistoryData));
      }

      // Try to get the full atsAnalysis object first
      let resultToSet = initialHistoryData.atsAnalysis ||
        initialHistoryData.result ||
        initialHistoryData.analysis;

      console.log("🎯 Found full atsAnalysis?", !!resultToSet);
      console.log("🔍 atsAnalysis structure:", resultToSet ? {
        hasOverallScore: !!resultToSet.overallScore,
        hasSections: !!resultToSet.sections,
        sectionsCount: resultToSet.sections?.length || 0,
        hasPersonalizedRecommendations: !!resultToSet.personalizedRecommendations
      } : "N/A");

      // If we have a full atsAnalysis object with sections, use it directly
      if (resultToSet && (resultToSet.sections || resultToSet.overallScore)) {
        console.log("✅ Restoring complete ATS analysis with", resultToSet.sections?.length || 0, "sections");

        // Transform the data structure if needed (Firestore structure → UI structure)
        const transformedResult = {
          ...resultToSet,
          // Ensure we have the overallScore
          overallScore: resultToSet.overallScore || initialHistoryData.atsScore || initialHistoryData.score || 0,

          // Map actionableRecommendations to personalizedRecommendations if needed
          personalizedRecommendations: resultToSet.personalizedRecommendations ||
            resultToSet.actionableRecommendations ||
            [],

          // Ensure sections array exists (even if empty, UI will handle it)
          sections: resultToSet.sections || [],

          // Include all nested analysis objects
          keywordAnalysis: resultToSet.keywordAnalysis,
          skillsAnalysis: resultToSet.skillsAnalysis,
          detailedAnalysis: resultToSet.detailedAnalysis,
          executiveSummary: resultToSet.executiveSummary,

          // Include parsed data
          parsedData: initialHistoryData.parsedData || resultToSet.parsedData,

          // Analysis metadata
          analysisType: resultToSet.analysisType || initialHistoryData.analysisType || 'general',
          hasJobDescription: resultToSet.hasJobDescription || false,
          jobDescription: resultToSet.jobDescription || null
        };

        console.log("🔄 Transformed result:", {
          overallScore: transformedResult.overallScore,
          hasKeywordAnalysis: !!transformedResult.keywordAnalysis,
          hasSkillsAnalysis: !!transformedResult.skillsAnalysis,
          hasDetailedAnalysis: !!transformedResult.detailedAnalysis,
          hasExecutiveSummary: !!transformedResult.executiveSummary,
          personalizedRecommendationsCount: transformedResult.personalizedRecommendations?.length || 0
        });

        setResult(transformedResult);
        setFile({ name: initialHistoryData.fileName || "Resume" });
        setIsUploading(false);
        setShowATSSuccess(false);

        // Scroll to results
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }
      // Fallback: If only score is available, show incomplete data message
      else if (initialHistoryData.atsScore || initialHistoryData.score || initialHistoryData.score === 0) {
        console.warn("⚠️ Incomplete ATS data - only score available. Full analysis not saved in history.");
        console.warn("💡 Tip: Re-run the ATS check to see detailed analysis");

        // Show a toast to inform the user
        toast((t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <span className="font-semibold">Incomplete Analysis Data</span>
            </div>
            <p className="text-sm text-gray-600">
              This history entry only contains the ATS score ({initialHistoryData.atsScore || initialHistoryData.score}%).
              Full analysis details are not available.
            </p>
            <p className="text-xs text-gray-500">
              Upload the resume again to see complete analysis with recommendations.
            </p>
          </div>
        ), {
          duration: 6000,
          icon: '⚠️',
        });

        // Still show basic score
        const mockResult = {
          overallScore: initialHistoryData.atsScore || initialHistoryData.score || 0,
          sections: [],
          recommendations: [],
          parsedData: null,
          personalizedRecommendations: [],
          isIncomplete: true // Flag to show warning in UI
        };

        setResult(mockResult);
        setFile({ name: initialHistoryData.fileName || "Resume" });
        setIsUploading(false);
        setShowATSSuccess(false);

        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      } else {
        console.error("❌ No ATS score found in history data");
        toast.error("Unable to load ATS analysis from history. Please upload the resume again.");
      }
    }
  }, [initialHistoryData]);

  // Helper function for consistent upgrade flow
  const handleUpgradeClick = (billingCycle = 'basic', source = 'ats-score-checker') => {
    // If in enterprise mode, redirect to enterprise checkout
    if (enterpriseMode) {
      router.push('/enterprise/checkout');
      return;
    }

    if (user) {
      router.push(`/checkout?billingCycle=${billingCycle}`);
    } else {
      // Store checkout intent and message in storage
      localStorage.setItem('checkoutIntent', JSON.stringify({ billingCycle, source }));
      sessionStorage.setItem('loginMessage', 'Please login to continue with your purchase');
      window.location.href = `/login`;
    }
  };

  // ATS Template navigation functions - Get templates with proper structure
  // Sort: Single-column templates first (better ATS compatibility), then double-column templates
  const atsTemplates = Object.entries(atsFriendlyTemplates)
    .filter(([key, template]) =>
      template &&
      key.startsWith('ats_') &&
      !key.startsWith('onepager_') &&
      template.name
    )
    .map(([key, template]) => ({
      id: key,
      name: template.name,
      ...template
    }))
    .sort((a, b) => {
      // Get column count (default to 1 if not specified)
      const aColumns = a.layout?.columns || 1;
      const bColumns = b.layout?.columns || 1;
      
      // Single-column (1) comes before double-column (2)
      if (aColumns !== bColumns) {
        return aColumns - bColumns;
      }
      
      // If same column count, maintain original order
      return 0;
    });

  // Fallback if no ATS templates found
  const safeAtsTemplates = atsTemplates.length > 0 ? atsTemplates : [
    {
      id: 'ats_modern_executive',
      name: 'ATS Modern Executive',
      atsFeatures: { cleanFormatting: true, standardFonts: true, properHeadings: true }
    }
  ];

  // Circular navigation functions (like main page)
  const goToPreviousTemplate = () => {
    setCurrentOptimizedTemplate((prev) =>
      prev > 0 ? prev - 1 : safeAtsTemplates.length - 1
    );
  };

  const goToNextTemplate = () => {
    setCurrentOptimizedTemplate((prev) =>
      prev < safeAtsTemplates.length - 1 ? prev + 1 : 0
    );
  };

  const [improvedResult, setImprovedResult] = useState(null);
  const [improvedResume, setImprovedResume] = useState(null);
  const [showImprovedModal, setShowImprovedModal] = useState(false);
  const [showProfilePromo, setShowProfilePromo] = useState(false);
  const [hasPublicProfile, setHasPublicProfile] = useState(false);
  const [showFresherPopup, setShowFresherPopup] = useState(false);
  const [fresherData, setFresherData] = useState(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [pricing, setPricing] = useState(() => getEffectivePricing(currency, isAndroidDevice));
  const [showExitIntentModal, setShowExitIntentModal] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);

  // SSR safety for createPortal
  useEffect(() => {
    setIsPortalMounted(true);
  }, []);

  // Job Description Modal State
  const [showJobDescriptionModal, setShowJobDescriptionModal] = useState(false);

  // Template Selection State
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [optimizedResumeData, setOptimizedResumeData] = useState(null);
  const [selectedRole, setSelectedRole] = useState(prefilledData?.job_title || '');
  const [jobDescription, setJobDescription] = useState(prefilledData?.description || '');
  const [detectedIndustry, setDetectedIndustry] = useState('Software Development');

  // Update pricing when currency or device changes
  useEffect(() => {
    setPricing(getEffectivePricing(currency, isAndroidDevice));
  }, [currency, isAndroidDevice]);

  // Device detection effect
  useEffect(() => {
    const detectAndroid = () => {
      if (typeof window !== "undefined" && navigator.userAgent) {
        const isAndroid = /Android/i.test(navigator.userAgent);
        setIsAndroidDevice(isAndroid);
        console.log('🔍 ATSChecker Device Detection:', {
          userAgent: navigator.userAgent,
          isAndroid: isAndroid
        });
      }
    };

    detectAndroid();
  }, []);

  // Check if user is first-time and load ATS check count
  useEffect(() => {
    const hasCheckedATS = localStorage.getItem("hasCheckedATS");
    const savedCount = localStorage.getItem("atsCheckCount");
    const count = savedCount ? parseInt(savedCount) : 0;

    setAtsCheckCount(count);

    if (hasCheckedATS || user?.hasCheckedATS || count > 0) {
      setIsFirstTimeUser(false);
    }
  }, [user]);

  // Check if user has public profile
  useEffect(() => {
    const checkPublicProfile = async () => {
      if (!user) {
        setHasPublicProfile(false);
        return;
      }

      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const profileRef = doc(db, `users/${user.uid}/profile`, 'userProfile');
        const profileSnapshot = await getDoc(profileRef);
        const hasProfile = profileSnapshot.exists() && profileSnapshot.data()?.allowMatching;
        setHasPublicProfile(hasProfile);
      } catch (error) {
        console.error("Error checking profile status:", error);
      }
    };

    checkPublicProfile();
  }, [user]);

  // Simple time tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnPage(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Check for job description in sessionStorage
  useEffect(() => {
    const storedJobDescription = sessionStorage.getItem('jobDescription');
    if (storedJobDescription) {
      console.log('Found job description in sessionStorage:', storedJobDescription.substring(0, 100) + '...');
    }
  }, []);

  // Auto-invoke ATS checker when file is uploaded OR when user logs in with a file pending
  useEffect(() => {
    // If file exists and not analyzing...
    if (file && !isUploading && !result) {
      // Always trigger handleSubmit, which handles Auth check internally
      const timer = setTimeout(() => {
        handleSubmit();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [file, user]); // Added user to dependency to trigger after login

  // Check if user has ATS history
  useEffect(() => {
    const checkHistory = async () => {
      if (user?.uid) {
        const lastCheck = await getLastATSCheck(user.uid);
        if (lastCheck) {
          setHasHistory(true);
        }
      }
    };
    checkHistory();
  }, [user]);

  // Handle restore from history
  const handleRestoreFromHistory = (historyItem) => {
    try {
      if (!historyItem.parsedData || !historyItem.atsAnalysis) {
        toast.error('Invalid history item');
        return;
      }

      // Restore the parsed data
      setOptimizedResumeData(historyItem.parsedData);

      // Restore the ATS result
      setResult(historyItem.atsAnalysis);

      // Create a mock file object for display
      const mockFile = new File([], historyItem.fileName, { type: historyItem.fileType });
      setFile(mockFile);

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } catch (error) {
      console.error('Error restoring from history:', error);
      toast.error('Failed to restore from history');
    }
  };



  // Debug Template Logic - Removed auto-switch, now starts with single-column template (index 0)
  useEffect(() => {
    console.log("🎨 Templates Available:", safeAtsTemplates.length);
    console.log("🎨 Current Template Index:", currentOptimizedTemplate);
    // No auto-switch - starts with first template (single-column) by default
  }, [optimizedResumeData, currentOptimizedTemplate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setFile(selectedFile);
    } else {
      toast.error("Please upload a PDF or DOCX file.");
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      toast.error("Please upload a resume.");
      return;
    }

    // Auth Check
    // Auth Check - Modified for Frictionless Entry
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Check paywall for free users - only 1 free ATS check allowed
    // Basic plan and oneDay plan users should have unlimited ATS checks
    // Enterprise users bypass this check
    if (!enterpriseMode && !isPremium && !isBasicPlan && !isOneDayPlan && atsCheckCount >= 1) {
      setShowUpgradeModal(true);
      return;
    }

    // Show job description modal first
    setShowJobDescriptionModal(true);
  };

  const performAnalysis = async (jobDescriptionToUse = null) => {
    // Check quota for enterprise users
    if (enterpriseMode && user) {
      try {
        const adminId = await getAdminId(user.uid);
        const quotaCheck = await checkQuota(adminId || user.uid, QUOTA_TYPES.ATS_CHECKS);

        if (!quotaCheck.allowed) {
          setQuotaInfo({
            quotaType: "atsChecks",
            currentCount: quotaCheck.currentCount,
            limit: quotaCheck.limit,
            remaining: quotaCheck.remaining
          });
          setShowQuotaModal(true);
          return;
        }
      } catch (quotaError) {
        console.error("Error checking ATS quota:", quotaError);
        toast.error("Unable to verify ATS check quota. Please try again.");
        return;
      }
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entryPoint", "ats-score-checker");
      formData.append("pageUrl", "/ats-score-checker");

      // First, parse the resume to get the data for preview
      const parseResponse = await fetch("/api/gemini-parse-resume", {
        method: "POST",
        body: formData
      });

      if (!parseResponse.ok) {
        let errorData;
        try {
          // Try to parse as JSON first
          const contentType = parseResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await parseResponse.json();
          } else {
            // If not JSON, read as text and create error object
            const text = await parseResponse.text();
            errorData = {
              error: text || `Server error: ${parseResponse.status} ${parseResponse.statusText}`,
              status: parseResponse.status
            };
          }
        } catch (parseError) {
          // If parsing fails, create a generic error
          errorData = {
            error: `Failed to parse resume: ${parseResponse.status} ${parseResponse.statusText}`,
            status: parseResponse.status
          };
        }

        const errorMessage = errorData.error || errorData.message || `Failed to parse resume (${parseResponse.status})`;

        if (parseResponse.status === 403) {
          throw new Error("Access denied. The API is currently unavailable. Please try again later or contact support.");
        }

        throw new Error(errorMessage);
      }

      const parsedData = await parseResponse.json();

      // Set the optimized resume data for preview
      setOptimizedResumeData(parsedData);

      // Check for fresher status and show popup if detected (only for free users)
      if (parsedData.isFresher && !isPremium && !isBasicPlan) {
        // ... Logic preserved but overridden by UpsellModal for now
      }

      // TRIGGER UPSELL MODAL FOR ALL FREE USERS (Post-Intent)
      if (!isPremium && !isBasicPlan && !enterpriseMode) {
        setTimeout(() => {
          setShowUpsellModal(true);
        }, 2500); // Slightly faster than the fresher popup was
      }

      // Create new FormData for ATS analysis
      const atsFormData = new FormData();
      atsFormData.append("file", file);
      atsFormData.append("bypassCache", "true"); // Always get fresh AI analysis for authentic results
      atsFormData.append("entryPoint", "ats-score-checker");
      atsFormData.append("pageUrl", "/ats-score-checker");

      // Use provided job description or check sessionStorage
      const jobDescription = jobDescriptionToUse || sessionStorage.getItem('jobDescription');
      if (jobDescription) {
        atsFormData.append("jobDescription", jobDescription);
        console.log('Including job description in analysis');

        // Clear the job description from sessionStorage after using it
        sessionStorage.removeItem('jobDescription');
      }

      // Use the new personalized ATS checker API
      const atsResponse = await fetch("/api/ats-checker", {
        method: "POST",
        body: atsFormData
      });

      if (!atsResponse.ok) {
        const errorData = await atsResponse.json();
        console.error('ATS API Error:', errorData);
        throw new Error(errorData.error || `Failed to analyze resume (Status: ${atsResponse.status})`);
      }

      const atsResult = await atsResponse.json();

      // Combine ATS analysis with parsed data for preview
      const enhancedResult = {
        ...atsResult,
        parsedData: parsedData,
        hasJobDescription: !!jobDescription,
        jobDescription: jobDescription || null,
        selectedRole: selectedRole || null, // Store the selected role
        analysisType: jobDescription ? 'job_specific' : 'general',
        // Ensure keyword analysis has proper structure
        keywordAnalysis: {
          foundKeywords: atsResult.keywordAnalysis?.foundKeywords || [],
          missingKeywords: atsResult.keywordAnalysis?.missingKeywords || [],
          score: atsResult.keywordAnalysis?.score || 0,
          industryMatch: atsResult.keywordAnalysis?.industryMatch || 'general',
          ...atsResult.keywordAnalysis
        }
      };

      setResult(enhancedResult);

      // Log activity for analytics (history is saved later with full analysis)
      if (user) {
        try {
          // Get admin ID for proper activity logging
          const adminId = enterpriseMode ? await getAdminId(user.uid) : user.uid;
          await logActivity(adminId || user.uid, user.uid, ACTIVITY_TYPES.ATS_CHECK_PERFORMED, {
            fileName: file.name,
            score: enhancedResult.overallScore,
            hasJobDescription: !!jobDescription,
          });

          // Increment quota for enterprise users
          if (enterpriseMode) {
            try {
              await incrementQuota(adminId || user.uid, QUOTA_TYPES.ATS_CHECKS);
              console.log(`✅ ATS check quota incremented for admin ${adminId || user.uid}`);
            } catch (quotaError) {
              console.error("Error incrementing ATS check quota:", quotaError);
              // Don't fail the analysis if quota increment fails
            }
          }
        } catch (error) {
          console.error("Error logging ATS check activity:", error);
          // Don't show error to user as this is background functionality
        }
      }

      // Debug logging for keyword analysis
      console.log('🔍 ATS Analysis Debug:', {
        overallScore: enhancedResult.overallScore,
        keywordAnalysis: enhancedResult.keywordAnalysis,
        foundKeywords: enhancedResult.keywordAnalysis?.foundKeywords,
        missingKeywords: enhancedResult.keywordAnalysis?.missingKeywords,
        foundKeywordsLength: enhancedResult.keywordAnalysis?.foundKeywords?.length,
        missingKeywordsLength: enhancedResult.keywordAnalysis?.missingKeywords?.length,
        personalizedRecommendations: enhancedResult.personalizedRecommendations?.map(rec => ({
          priority: rec.priority,
          message: rec.message?.substring(0, 50) + '...',
          impact: rec.impact,
          hasImpact: !!rec.impact
        }))
      });

      // Update ATS check count
      const newCount = atsCheckCount + 1;
      setAtsCheckCount(newCount);
      localStorage.setItem("atsCheckCount", newCount.toString());
      localStorage.setItem("hasCheckedATS", "true");

      // Show success message
      const successMessage = jobDescription
        ? "Job-specific ATS analysis completed! Your resume has been analyzed with the provided job description."
        : "ATS analysis completed! Check your personalized report below.";
      toast.success(successMessage);

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);



      // Save to ATS history for quick restore later (merged with metadata)
      if (user?.uid && file && parsedData) {
        console.log('💾 Saving merged ATS history with full analysis + metadata:', {
          fileName: file.name,
          fileSize: file.size,
          hasParsedData: !!parsedData,
          hasResult: !!enhancedResult,
          atsScore: enhancedResult.overallScore,
          hasJobDescription: !!jobDescriptionToUse,
          enterpriseMode,
          hasClient: !!selectedClient
        });

        // Get user info for metadata
        const userInfo = {
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          name: user.displayName || user.email?.split('@')[0] || 'User'
        };

        // Save to ATS history with merged data (detailed analysis + metadata)
        saveATSHistory(user.uid, {
          // File details
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,

          // Analysis data
          parsedData: parsedData,
          atsScore: enhancedResult.overallScore,
          atsAnalysis: enhancedResult,
          recommendations: enhancedResult.personalizedRecommendations || [],
          optimizedResumeData: parsedData,
          jobDescription: jobDescriptionToUse || null,

          // Client context (for enterprise mode)
          clientId: selectedClient?.id || null,
          clientName: selectedClient?.name || null,

          // User metadata
          userEmail: user.email,
          userName: user.displayName || user.email?.split('@')[0],
        }, userInfo).then(() => {
          setHasHistory(true);
          console.log('✅ Saved merged ATS history successfully');
        }).catch((error) => {
          console.error('Failed to save ATS history:', error);
        });
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast.error(error.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Job Description Modal Functions
  const getRoleOptions = (industry) => {
    const roleOptions = {
      'Software Development': [
        'Software Engineer',
        'Senior Software Engineer',
        'Full Stack Developer',
        'Frontend Developer',
        'Backend Developer',
        'DevOps Engineer',
        'System Architect',
        'Technical Lead',
        'Engineering Manager',
        'Product Manager',
        'Data Scientist',
        'Machine Learning Engineer',
        'QA Engineer',
        'Mobile Developer',
        'Cloud Engineer'
      ],
      'Finance': [
        'Financial Analyst',
        'Investment Banker',
        'Portfolio Manager',
        'Risk Manager',
        'Accountant',
        'Financial Controller',
        'Treasury Analyst',
        'Credit Analyst',
        'Compliance Officer',
        'Financial Advisor'
      ],
      'Healthcare': [
        'Registered Nurse',
        'Physician',
        'Medical Administrator',
        'Healthcare Consultant',
        'Clinical Research Coordinator',
        'Medical Technologist',
        'Health Information Manager',
        'Pharmaceutical Sales',
        'Medical Device Specialist'
      ],
      'Marketing': [
        'Marketing Manager',
        'Digital Marketing Specialist',
        'Content Marketing Manager',
        'SEO Specialist',
        'Social Media Manager',
        'Brand Manager',
        'Marketing Analyst',
        'Product Marketing Manager',
        'Growth Marketing Manager'
      ],
      'Sales': [
        'Sales Representative',
        'Account Executive',
        'Sales Manager',
        'Business Development Manager',
        'Sales Director',
        'Inside Sales Representative',
        'Field Sales Representative',
        'Sales Operations Manager'
      ]
    };

    return roleOptions[industry] || roleOptions['Software Development'];
  };

  const generateJobDescription = (role, industry) => {
    const descriptions = {
      'Software Engineer': `We are seeking a talented Software Engineer to join our dynamic team. The ideal candidate will have strong programming skills in Java, Python, or JavaScript, experience with modern frameworks and tools, and a passion for writing clean, maintainable code. You will work on exciting projects, collaborate with cross-functional teams, and contribute to the development of innovative software solutions.

Key Responsibilities:
• Design, develop, and maintain software applications
• Write clean, efficient, and well-documented code
• Collaborate with product managers and designers
• Participate in code reviews and technical discussions
• Debug and resolve software issues
• Stay updated with emerging technologies

Requirements:
• Bachelor's degree in Computer Science or related field
• 2+ years of experience in software development
• Proficiency in at least one programming language
• Experience with version control systems (Git)
• Strong problem-solving and analytical skills
• Excellent communication and teamwork abilities

Nice to Have:
• Experience with cloud platforms (AWS, Azure, GCP)
• Knowledge of containerization (Docker, Kubernetes)
• Understanding of CI/CD pipelines
• Experience with agile development methodologies`,

      'Senior Software Engineer': `We are looking for an experienced Senior Software Engineer to lead technical initiatives and mentor junior developers. The ideal candidate will have a strong background in software architecture, system design, and technical leadership. You will be responsible for designing scalable solutions, making technical decisions, and driving innovation within the team.

Key Responsibilities:
• Lead the design and implementation of complex software systems
• Mentor junior developers and conduct code reviews
• Make architectural decisions and technical recommendations
• Collaborate with stakeholders to define technical requirements
• Optimize application performance and scalability
• Drive technical excellence and best practices

Requirements:
• Bachelor's degree in Computer Science or related field
• 5+ years of experience in software development
• Strong expertise in multiple programming languages
• Experience with system design and architecture
• Leadership and mentoring experience
• Excellent problem-solving and communication skills

Nice to Have:
• Experience with microservices architecture
• Knowledge of distributed systems
• Experience with cloud-native development
• Understanding of DevOps practices`,

      'Frontend Developer': `We are seeking a talented Frontend Developer to join our dynamic team. The ideal candidate will have strong expertise in modern frontend technologies and a passion for creating exceptional user experiences.

Key Responsibilities:
• Develop responsive and interactive user interfaces using React, Vue, or Angular
• Collaborate with designers to implement pixel-perfect designs
• Optimize application performance and ensure cross-browser compatibility
• Write clean, maintainable, and well-documented code
• Participate in code reviews and contribute to technical discussions
• Stay updated with emerging frontend technologies and best practices

Requirements:
• Bachelor's degree in Computer Science or related field
• 2+ years of experience in frontend development
• Proficiency in HTML5, CSS3, and JavaScript (ES6+)
• Experience with modern JavaScript frameworks (React, Vue, Angular)
• Understanding of responsive design principles and CSS preprocessors
• Knowledge of version control systems (Git)
• Strong problem-solving and communication skills

Nice to Have:
• Experience with TypeScript and state management libraries
• Knowledge of build tools (Webpack, Vite) and testing frameworks
• Understanding of accessibility standards and SEO principles
• Experience with design systems and component libraries`,

      'Backend Developer': `We are seeking a skilled Backend Developer to join our team. The ideal candidate will have strong expertise in server-side development and database management, with a focus on building scalable and secure applications.

Key Responsibilities:
• Design and develop robust backend services and APIs
• Implement database schemas and optimize database performance
• Ensure application security and data protection
• Collaborate with frontend developers to integrate APIs
• Write clean, efficient, and well-documented code
• Participate in code reviews and technical discussions
• Monitor and maintain application performance

Requirements:
• Bachelor's degree in Computer Science or related field
• 3+ years of experience in backend development
• Proficiency in server-side languages (Java, Python, Node.js, C#)
• Experience with database systems (PostgreSQL, MySQL, MongoDB)
• Knowledge of RESTful APIs and microservices architecture
• Understanding of authentication and authorization mechanisms
• Strong problem-solving and analytical skills

Nice to Have:
• Experience with cloud platforms (AWS, Azure, GCP)
• Knowledge of containerization (Docker, Kubernetes)
• Understanding of CI/CD pipelines and DevOps practices
• Experience with message queues and caching systems`,

      'Data Scientist': `We are seeking a Data Scientist to join our team. The ideal candidate will have strong analytical skills and experience in machine learning, with a passion for extracting insights from complex data sets.

Key Responsibilities:
• Develop and implement machine learning models and algorithms
• Analyze large datasets to identify patterns and trends
• Create predictive models for business applications
• Collaborate with stakeholders to understand business requirements
• Communicate findings through data visualization and reports
• Stay updated with emerging data science technologies
• Mentor junior data scientists and share best practices

Requirements:
• Master's degree in Statistics, Mathematics, Computer Science, or related field
• 3+ years of experience in data science or analytics
• Proficiency in Python, R, or similar programming languages
• Experience with machine learning frameworks (scikit-learn, TensorFlow, PyTorch)
• Knowledge of statistical analysis and data visualization tools
• Understanding of SQL and database systems
• Strong analytical and problem-solving skills

Nice to Have:
• Experience with big data technologies (Spark, Hadoop)
• Knowledge of deep learning and neural networks
• Understanding of MLOps and model deployment
• Experience with cloud-based data platforms (AWS SageMaker, Azure ML)`,

      'Product Manager': `We are seeking a Product Manager to join our team. The ideal candidate will have experience in product strategy, user research, and cross-functional collaboration, with a focus on delivering user-centric solutions.

Key Responsibilities:
• Define product vision, strategy, and roadmap
• Conduct user research and gather requirements from stakeholders
• Prioritize features and create detailed product specifications
• Collaborate with engineering, design, and marketing teams
• Analyze product metrics and user feedback to drive decisions
• Coordinate product launches and go-to-market strategies
• Monitor competitive landscape and industry trends

Requirements:
• Bachelor's degree in Business, Engineering, or related field
• 3+ years of experience in product management
• Experience with agile development methodologies
• Strong analytical and data-driven decision-making skills
• Excellent communication and stakeholder management abilities
• Understanding of user experience principles and design thinking
• Knowledge of product analytics and A/B testing

Nice to Have:
• Experience with product management tools (Jira, Asana, Productboard)
• Knowledge of user research methodologies and tools
• Understanding of technical concepts and development processes
• Experience with B2B or B2C product management`,

      'Financial Analyst': `We are seeking a Financial Analyst to join our team. The ideal candidate will have strong analytical skills and experience in financial modeling, with a focus on providing actionable insights to support business decisions.

Key Responsibilities:
• Develop and maintain financial models and forecasts
• Analyze financial data and prepare detailed reports
• Conduct variance analysis and identify trends
• Support budgeting and planning processes
• Collaborate with cross-functional teams on financial projects
• Prepare presentations for senior management
• Monitor key performance indicators and financial metrics

Requirements:
• Bachelor's degree in Finance, Accounting, Economics, or related field
• 2+ years of experience in financial analysis or accounting
• Proficiency in Excel and financial modeling
• Experience with financial analysis and reporting
• Knowledge of accounting principles and financial statements
• Strong analytical and problem-solving skills
• Excellent attention to detail and accuracy

Nice to Have:
• Experience with financial software (Bloomberg, FactSet)
• Knowledge of SQL and data analysis tools
• Understanding of investment analysis and valuation
• Experience with business intelligence tools (Tableau, Power BI)`,

      'Marketing Manager': `We are seeking a Marketing Manager to join our team. The ideal candidate will have experience in developing and executing marketing strategies, with a focus on driving brand awareness and customer engagement.

Key Responsibilities:
• Develop and execute comprehensive marketing strategies
• Manage digital marketing campaigns across multiple channels
• Analyze marketing performance and optimize campaigns
• Collaborate with creative and content teams
• Oversee brand management and positioning
• Manage marketing budgets and ROI tracking
• Lead marketing team and coordinate cross-functional projects

Requirements:
• Bachelor's degree in Marketing, Business, or related field
• 4+ years of experience in marketing or brand management
• Experience with digital marketing tools and platforms
• Strong analytical skills and data-driven decision making
• Knowledge of marketing automation and CRM systems
• Excellent communication and leadership skills
• Understanding of customer journey and conversion optimization

Nice to Have:
• Experience with specific marketing channels (SEO, PPC, Social Media)
• Knowledge of marketing analytics and attribution
• Understanding of B2B or B2C marketing strategies
• Experience with marketing technology stack`,

      'Sales Representative': `We are seeking a Sales Representative to join our team. The ideal candidate will have strong sales skills and experience in building client relationships, with a focus on achieving sales targets and driving revenue growth.

Key Responsibilities:
• Prospect and qualify new sales opportunities
• Build and maintain relationships with clients
• Conduct product demonstrations and presentations
• Negotiate contracts and close sales deals
• Meet and exceed monthly and quarterly sales targets
• Collaborate with marketing and product teams
• Maintain accurate sales records and forecasts

Requirements:
• Bachelor's degree in Business, Sales, or related field
• 2+ years of experience in sales or business development
• Strong communication and presentation skills
• Experience with CRM systems and sales processes
• Ability to build relationships and network effectively
• Results-oriented with proven track record
• Excellent negotiation and closing skills

Nice to Have:
• Experience in specific industry or product vertical
• Knowledge of consultative selling methodologies
• Understanding of sales enablement tools and processes
• Experience with B2B or B2C sales environments`
    };

    return descriptions[role] || `We are seeking a talented ${role} to join our ${industry} team. The ideal candidate will have relevant experience and a passion for excellence.

Key Responsibilities:
• Develop and implement strategies aligned with business objectives
• Collaborate with cross-functional teams to achieve goals
• Analyze data and provide insights to drive decision-making
• Maintain high standards of quality and performance
• Stay updated with industry trends and best practices

Requirements:
• Bachelor's degree in relevant field or equivalent experience
• 2+ years of experience in ${industry} or related field
• Strong analytical and problem-solving skills
• Excellent communication and teamwork abilities
• Ability to work in a fast-paced environment

Nice to Have:
• Advanced degree or professional certifications
• Experience with industry-specific tools and technologies
• Knowledge of emerging trends in ${industry}`;
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role) {
      const generatedDescription = generateJobDescription(role, detectedIndustry);
      setJobDescription(generatedDescription);
    }
  };

  const handleSkipJobDescription = () => {
    setShowJobDescriptionModal(false);
    performAnalysis();
  };

  const handleAnalyzeWithJobDescription = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter or select a job description first.');
      return;
    }

    // Save job description for future use (Interview Cheatsheet, etc.)
    if (user?.uid) {
      try {
        await fetch("/api/save-job-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            jobDescription: jobDescription.trim(),
            source: "ats_checker",
            jobTitle: selectedRole || "Position from ATS Checker",
          }),
        });
        console.log("✅ Job description saved from ATS checker");
      } catch (error) {
        console.error("Error saving JD:", error);
        // Don't block the analysis if JD save fails
      }
    }

    setShowJobDescriptionModal(false);
    performAnalysis(jobDescription);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setScreenshotUrl(null);
    setShowATSSuccess(false);
    setATSSuccessData(null);
    setShowImprovedModal(false);
    setImprovedResult(null);
    setImprovedResume(null);
    setShowProfilePromo(false);



    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch("/api/ats-checker", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Cache cleared successfully!");
      } else {
        toast.error("Failed to clear cache");
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Failed to clear cache");
    }
  };

  const generateScreenshot = async () => {
    if (!resultsRef.current) return;

    setIsGeneratingScreenshot(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });

      const imageUrl = canvas.toDataURL("image/png");
      setScreenshotUrl(imageUrl);
      toast.success("Screenshot generated successfully!");
    } catch (error) {
      console.error("Error generating screenshot:", error);
      toast.error("Failed to generate screenshot");
    } finally {
      setIsGeneratingScreenshot(false);
    }
  };

  const handleDownloadScreenshot = () => {
    if (!screenshotUrl) return;

    const link = document.createElement("a");
    link.download = "ats-score-report.png";
    link.href = screenshotUrl;
    link.click();
  };

  const handleShare = async (platform) => {
    if (!screenshotUrl) {
      await generateScreenshot();
      return;
    }

    const text = `My ATS Score: ${result?.overallScore}/100! 🎯 Check your resume's ATS compatibility at ExpertResume.com`;
    const url = window.location.href;

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case "copy":
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Link copied to clipboard!");
        break;
    }
  };

  // 🚀 NEW CONVERSION COMPONENTS













  const PremiumUpsellSection = () => (
    <div className="bg-gradient-to-br from-primary to-primary-800 p-2 rounded-xl my-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10">
        <Sparkles size={150} />
      </div>
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            Get <span className="text-accent">3x More Interviews</span> with Premium
          </h3>
          <p className="text-white/80 max-w-2xl mx-auto">
            Our users report 3x higher interview rates after optimizing with Premium tools
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: Shield,
              title: "ATS Score Booster",
              desc: "Increase your score by 20-30 points instantly",
            },
            {
              icon: Target,
              title: "Job-Specific Optimization",
              desc: "Tailor your resume for each application",
            },
            {
              icon: Clock,
              title: "Time-Saving AI Tools",
              desc: "Get instant rewrites and improvements",
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white/10 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="bg-accent/20 p-3 rounded-full w-fit mb-4">
                <feature.icon size={24} className="text-accent" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
              <p className="text-white/80 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-black/20 p-6 rounded-xl border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => handleUpgradeClick('basic', 'improved-resume')}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-3 rounded-lg font-bold hover:shadow-xl transition-all flex-1 text-center"
              >
                Upgrade
              </button>
              <button
                onClick={() => setIsSlideshowOpen(true)}
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all flex-1 text-center"
              >
                See Templates Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ScoreLimitationNotice = () => (
    <div className="bg-yellow-50 border-b border-yellow-200 p-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Lock size={20} className="text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">Free Version Limitations</p>
            <p className="text-sm text-yellow-700">
              Upgrade to see your <strong>true ATS score</strong> and get <strong>AI-powered fixes</strong>
            </p>
          </div>
        </div>
        <button
          onClick={() => handleUpgradeClick(isAndroidDevice ? 'basic' : 'monthly', 'unlock-full-analysis')}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg font-bold text-sm hover:shadow-lg transition-all whitespace-nowrap"
        >
          {`Unlock Full Analysis - ${pricing.currency === 'INR' ? '₹' : '$'}${pricing.basic / 100} (${pricing.currency === 'INR' && isAndroidDevice ? '7 days' : '7 days'})`}
        </button>
      </div>
    </div>
  );

  // Improved personalized tips generator with deduplication and more comprehensive, tailored advice
  function getPersonalizedTips(parsedData, result) {
    if (!parsedData) return [
      "We couldn't extract enough information from your resume. Please try uploading a clearer or more detailed file."
    ];

    // If we have API results, use those for highly personalized tips
    if (result && result.personalizedRecommendations && result.personalizedRecommendations.length > 0) {
      return result.personalizedRecommendations
        .filter(rec => rec.specific) // Only show specific, personalized recommendations
        .slice(0, 5) // Limit to top 5 most important
        .map(rec => rec.suggestion);
    }

    // Fallback to dynamic tips based on parsed data
    const tips = new Set();
    const industry = result?.keywordAnalysis?.industryMatch || 'general';

    // Dynamic skills analysis
    if (!parsedData.skills || parsedData.skills.length === 0) {
      tips.add(`No skills detected. Add a dedicated skills section with ${industry} keywords that match your target roles.`);
    } else if (parsedData.skills.length < 5) {
      tips.add(`Add more relevant ${industry} skills (at least 5-8). Your current ${parsedData.skills.length} skills need expansion.`);
    } else {
      const topSkills = parsedData.skills.slice(0, 3).map(s => s.name).join(', ');
      tips.add(`Great! You have ${parsedData.skills.length} skills including ${topSkills}. Ensure they appear in your summary and experience sections.`);
    }

    // Dynamic experience analysis
    if (!parsedData.experience || parsedData.experience.length === 0) {
      tips.add("Add at least one work experience section with job title, company, dates, and 2-4 bullet points describing your impact.");
    } else {
      parsedData.experience.forEach((exp, idx) => {
        if (!exp.jobTitle) {
          tips.add(`Specify your job title for your position at ${exp.company || 'a company'}. Recruiters need clear titles.`);
        }
        if (!exp.company) {
          tips.add(`List the company name for your role as ${exp.jobTitle || 'your position'}.`);
        }
        if (!exp.description || exp.description.length < 40) {
          tips.add(`Expand your role at ${exp.company || 'your recent job'}: add 2-4 bullet points with measurable achievements.`);
        } else {
          // Check for action verbs and metrics
          const actionVerbs = ['achieved', 'improved', 'led', 'managed', 'increased', 'reduced', 'built', 'created', 'designed', 'launched', 'optimized', 'delivered', 'implemented'];
          // Handle both string and array descriptions
          let description = exp.description;
          if (Array.isArray(description)) {
            description = description.join(' ');
          }
          const hasActionVerbs = actionVerbs.some(verb => (description || '').toLowerCase().includes(verb));
          if (!hasActionVerbs) {
            tips.add(`Use strong action verbs in your ${exp.jobTitle} description. Start bullet points with words like "Led", "Managed", "Delivered".`);
          }

          // Check for metrics (using the same normalized description)
          const hasMetrics = /\d+%|\d+x|\$\d+|\d+ people|\d+ team|\d+ customers|\d+ projects/gi.test(description || '');
          if (!hasMetrics) {
            tips.add(`Add quantifiable achievements to your ${exp.jobTitle} role. Include numbers like "Increased sales by 25%" or "Managed team of 5".`);
          }
        }
      });
    }

    // Dynamic education analysis
    if (!parsedData.education || parsedData.education.length === 0) {
      tips.add("Include your education details: degree, institution, and graduation year for recruiters to assess your background.");
    } else {
      parsedData.education.forEach((edu) => {
        if (!edu.degree) {
          tips.add(`Specify your degree for your education at ${edu.institution || 'an institution'}.`);
        }
        if (!edu.institution) {
          tips.add("List the institution name for your education.");
        }
        if (!edu.graduationDate) {
          tips.add(`Add your graduation year for your degree at ${edu.institution || 'your institution'}.`);
        }
      });
    }

    // Dynamic contact info analysis
    if (!parsedData.email) {
      tips.add("Add a professional email address to your resume header. Avoid using unprofessional addresses.");
    }
    if (!parsedData.phone) {
      tips.add("Include a phone number so recruiters can contact you easily.");
    }

    // Dynamic summary analysis
    if (!parsedData.summary || parsedData.summary.length < 40) {
      const experienceCount = parsedData.experience?.length || 0;
      const skillCount = parsedData.skills?.length || 0;
      tips.add(`Expand your summary to 2-3 sentences. Highlight your ${experienceCount} years of experience and ${skillCount} key skills.`);
    } else {
      tips.add("Your summary is present. Ensure it's tailored to your target job and includes your top skills and value proposition.");
    }

    // Dynamic length analysis
    if (parsedData.text && parsedData.text.length > 3000) {
      tips.add("Your resume may be too long. Aim for 1-2 pages and remove outdated or irrelevant details.");
    }

    // Fallback
    if (tips.size === 0) {
      tips.add("Your resume looks strong! Consider tailoring it for each job for best results.");
    }

    return Array.from(tips);
  }



  if (!isMounted) {
    return <ATSCheckerSkeleton />;
  }

  return (
    <>
      {isUploading && <ProgressOverlay isVisible={isUploading} type="atscheck" />}
      {isGeneratingScreenshot && <ProgressOverlay isVisible={isGeneratingScreenshot} type="screenshot" />}
      <main className="ats-score-checker w-full max-w-5xl relative z-10 mx-auto px-2 sm:px-4 md:px-6 lg:px-8">

        {/* Main ATS Score Checker UI */}
        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 lg:p-8 text-center border border-gray-200/50 backdrop-blur-sm"
          >
            <div className="max-w-2xl mx-auto">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-2 sm:mb-3 md:mb-4">
                Get your free ATS score for US job applications.
              </h1>
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-[#475569] mb-3 sm:mb-4 md:mb-5">
                Beat applicant tracking systems — <span className="font-bold text-primary">score in 60 seconds</span> + AI-powered fixes.
              </h2>

              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Rated 4.9/5 by 12,487+ Job Seekers
                </span>
              </div>

              {/* Free Check Limit Banner - Only show for free users, not basic plan users or enterprise mode */}
              {!enterpriseMode && !isPremium && !isBasicPlan && !isOneDayPlan && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/5 border border-accent/20 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Star size={14} className="sm:w-[18px] sm:h-[18px] text-accent" />
                    <span className="font-semibold text-sm sm:text-base">
                      {atsCheckCount === 0 ? "1 Free ATS Check Available" : "Free Check Used"}
                    </span>
                  </div>
                  {atsCheckCount > 0 && (
                    <div className="text-center mt-2 sm:mt-3">
                      <>
                        <p className="text-xs sm:text-sm text-primary mb-2 sm:mb-3">
                          {`Get unlimited ATS checks starting at ${pricing.currency === 'INR' ? '₹' : '$'}${pricing.basic / 100} (${pricing.currency === 'INR' && isAndroidDevice ? '7 days' : '7 days'})`}
                        </p>

                        {/* Removed Career Tool Promotion as per Sachet Strategy */}

                        <div className="text-xs text-gray-500 mt-1">
                          🚫 No Auto-Renewal • One-time payment
                        </div>
                      </>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
                {[
                  { icon: ShieldCheck, text: "Beat ATS Rejection" },
                  { icon: Zap, text: "AI-Optimized Keywords" },
                  { icon: Briefcase, text: "Job-Specific Tips" },
                  { icon: TrendingUp, text: "3x More Interviews" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1 sm:gap-2 bg-bg p-2 sm:p-2 rounded-lg border border-border">
                    <item.icon size={12} className="sm:w-4 sm:h-4 text-accent" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Pro Tip */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-bg border border-border rounded-xl">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Briefcase size={14} className="sm:w-4 sm:h-4 text-accent" />
                  <span className="text-xs sm:text-sm font-medium">💡 Pro Tip</span>
                </div>
                <p className="text-xs sm:text-sm text-[#475569] text-center leading-relaxed">
                  <strong>Switching companies?</strong> Our JD-based resume builder helps you create targeted resumes for each job. Perfect for US job search timelines.
                </p>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} className="mb-4 sm:mb-6">
                <label className="flex flex-col items-center gap-3 sm:gap-4 bg-gradient-to-r from-primary to-accent text-white px-4 sm:px-8 py-4 sm:py-6 rounded-xl hover:opacity-95 transition-all cursor-pointer w-full mx-auto shadow-lg hover:shadow-xl">
                  <div className="relative">
                    <div className="p-3 sm:p-4 bg-white/20 rounded-full animate-pulse">
                      <UploadCloud size={20} className="sm:w-8 sm:h-8" />
                    </div>
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-white/90 text-primary text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      FREE
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm sm:text-lg mb-1">Upload Your Resume</p>
                    <p className="text-xs sm:text-sm opacity-90">PDF or DOCX • Max 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </motion.div>

              {/* Trust micro-signal */}
              <p className="text-center text-xs text-gray-500 mt-3 mb-4">
                Used by professionals applying to US companies. Built for Workday, Greenhouse & Lever. Your resume data is never shared or sold.
              </p>

              {/* ATS History Button */}
              {hasHistory && user && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setIsHistoryPanelOpen(true)}
                  className="mt-4 w-full bg-primary/5 border-2 border-accent/30 text-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-primary/10 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Clock size={18} className="sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">View ATS Check History</span>
                  <span className="bg-accent/20 text-primary px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap">
                    Quick Access
                  </span>
                </motion.button>
              )}

              <div className="text-xs sm:text-sm text-gray-500">
                <p>🔒 Your data is secure and never shared</p>
                <p>⚡ Get results in under 60 seconds</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* ATS Analysis Results */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <ModernAnalysisDisplay
                result={result}
                onReset={handleReset}
                isPremium={isPremium}
                isBasicPlan={isBasicPlan}
                enterpriseMode={enterpriseMode}
                hasEnterpriseAccess={hasEnterpriseAccess}
                onUpgradeClick={handleUpgradeClick}
              />
            </div>

            {/* Google Reviews Section - Hide in enterprise mode */}
            {!enterpriseMode && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <TrophyIcon2 className="w-8 h-8 text-yellow-600 mr-2" />
                  <h3 className="text-xl font-bold text-yellow-800">How was your ATS analysis experience?</h3>
                </div>
                <p className="text-yellow-700 mb-4">
                  Your feedback helps us improve and helps other job seekers discover ExpertResume!
                </p>
                <GoogleReviewsButton
                  variant="success"
                  size="large"
                  className="shadow-lg"
                />
              </div>
            )}

            {/* Optimized Resume Preview Section */}
            {optimizedResumeData && (
              <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-4 md:p-6">
                <OptimizedResumePreview
                  key={`${optimizedResumeData?.name || 'unknown'}-${result?.overallScore || 'unknown'}`}
                  originalData={optimizedResumeData}
                  atsResult={result}
                  onUpgradeClick={handleUpgradeClick}
                  isPremium={isPremium}
                  isBasicPlan={isBasicPlan}
                  user={user}
                />
              </div>
            )}

          </motion.div>
        )}

        {/* Simplified Upgrade CTA - Hide in enterprise mode */}
        {!enterpriseMode && result && !isPremium && !isBasicPlan && (
          <div className="bg-bg border border-border rounded-2xl p-4 sm:p-6 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-3">
              Ready to Create Your Optimized Resume?
            </h3>
            <p className="text-sm sm:text-base text-[#475569] mb-4 sm:mb-6 max-w-2xl mx-auto">
              Get access to ATS-optimized templates, unlimited resume versions, and job-specific optimization tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
              <button
                onClick={() => handleUpgradeClick('basic', 'ats-simple-cta')}
                className="bg-gradient-to-r from-primary to-accent text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Crown size={18} />
                Upgrade Now - {formatPrice(pricing.basic, pricing.currency)}
                {getPricingConfigByCurrency(pricing.currency)?.basic?.anchorPrice > pricing.basic && (
                  <span className="line-through opacity-60 ml-2 text-sm">{formatPrice(getPricingConfigByCurrency(pricing.currency).basic.anchorPrice, pricing.currency)}</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Fixed Bottom CTA for Free Users - Hide in enterprise mode */}
        {!enterpriseMode && !isPremium && !isBasicPlan && result && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-border z-50">
            <div className="max-w-6xl mx-auto p-3 sm:p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <Crown size={20} className="sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm sm:text-base text-primary">
                      Ready to unlock your <span className="text-accent">full ATS potential</span>?
                    </p>
                    <p className="text-xs sm:text-sm text-[#475569]">
                      Get detailed analysis and create optimized resumes
                    </p>
                  </div>
                </div>
                <div className="flex flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowAIBoostModal(true)}
                    className="bg-gradient-to-r from-primary to-accent text-white px-4 sm:px-6 py-3 sm:py-3 rounded-lg font-semibold hover:opacity-95 transition-all flex items-center gap-2 flex-1 sm:flex-none"
                  >
                    <Zap size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-sm">AI Boost</span>
                  </button>
                  <button
                    onClick={() => handleUpgradeClick('basic', 'ats-bottom-cta')}
                    className="bg-primary text-white px-4 sm:px-6 py-3 sm:py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 flex-1 sm:flex-none"
                  >
                    <Crown size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-sm">Upgrade</span>
                  </button>
                </div>
              </div>


            </div>
          </div>
        )}
      </main>

      {/* Modals and Overlays - Portaled to body for proper z-index stacking */}
      {isPortalMounted && createPortal(
        <AnimatePresence>
          {!enterpriseMode && showUpgradeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-2 sm:p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown size={32} className="text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
                      Unlock Full ATS Analysis
                    </h2>
                    <p className="text-sm sm:text-base text-[#475569]">
                      Get unlimited ATS checks and detailed optimization insights
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                      <span className="text-sm sm:text-base text-gray-700">Unlimited ATS score checks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                      <span className="text-sm sm:text-base text-gray-700">Detailed keyword analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                      <span className="text-sm sm:text-base text-gray-700">ATS-optimized templates</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                      <span className="text-sm sm:text-base text-gray-700">Job-specific resume builder</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowUpgradeModal(false);
                        handleUpgradeClick('basic', 'ats-upgrade-modal');
                      }}
                      className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-lg font-bold hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Crown size={18} />
                      Upgrade Now - {formatPrice(pricing.basic, pricing.currency)}
                      {getPricingConfigByCurrency(pricing.currency)?.basic?.anchorPrice > pricing.basic && (
                        <span className="line-through opacity-60 ml-2 text-xs">{formatPrice(getPricingConfigByCurrency(pricing.currency).basic.anchorPrice, pricing.currency)}</span>
                      )}
                    </button>

                    <button
                      onClick={() => setShowUpgradeModal(false)}
                      className="w-full bg-gray-100 text-gray-600 py-2.5 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Job Description Modal */}
          {showJobDescriptionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-2 sm:p-4">
              <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Target className="text-accent sm:w-5 sm:h-5" size={18} />
                      <span className="truncate">Add Job Description (Optional)</span>
                    </h2>
                    <button
                      onClick={handleSkipJobDescription}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  <div className="bg-bg border border-border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Info className="text-accent mt-1 flex-shrink-0 sm:w-5 sm:h-5" size={18} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary mb-2">Get Better ATS Analysis</h3>
                        <p className="text-[#475569] text-xs sm:text-sm mb-3 leading-relaxed">
                          Adding a job description enables targeted ATS analysis and can improve your score by 15-25 points.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Role (Based on detected industry: {detectedIndustry})
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">Choose a role...</option>
                      {getRoleOptions(detectedIndustry).map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste your job description here or select a role above to auto-generate one..."
                      className="w-full h-32 sm:h-48 px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-sm sm:text-base"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleSkipJobDescription}
                      className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 text-sm sm:text-base font-medium transition-colors"
                    >
                      Skip & Analyze
                    </button>
                    <button
                      onClick={handleAnalyzeWithJobDescription}
                      disabled={!jobDescription.trim()}
                      className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium transition-colors"
                    >
                      Analyze with Job Description
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ATS AI Boost Modal - Full Screen Slide In - Portaled to body */}
      {isPortalMounted && showAIBoostModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000]">
          <div className="fixed inset-0 flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full h-full flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Zap className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">ATS AI Boost Preview</h2>
                    <p className="text-sm text-gray-600">Compare your original resume with AI-optimized version</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIBoostModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tab Navigation - Directly below header */}
              <div className="border-b border-gray-200 bg-white sticky top-[73px] z-50">
                <div className="flex">
                  <button
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'original'
                      ? 'text-gray-900 border-gray-900'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    onClick={() => startTransition(() => setActiveTab('original'))}
                  >
                    <div className="flex items-center gap-2">
                      <span>Original Resume</span>
                    </div>
                  </button>
                  <button
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'optimized'
                      ? 'text-primary border-accent'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    onClick={() => startTransition(() => setActiveTab('optimized'))}
                  >
                    <div className="flex items-center gap-2">
                      <span>ATS Optimized</span>
                      <Star className="text-green-500 w-4 h-4" />
                      {!isPremium && !isBasicPlan && <Lock className="text-orange-500 w-3 h-3" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {optimizedResumeData ? (
                  <div className="h-full flex flex-col">
                    {/* Tab Content */}
                    <div className="flex-1 p-2 sm:p-4">
                      {activeTab === 'original' ? (
                        <div className="h-full flex flex-col">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <AlertCircle className="text-orange-500 w-4 h-4" />
                            <span className="text-xs sm:text-sm text-orange-600">
                              Your Original Uploaded Resume - ATS Score: {result?.overallScore || 0}%
                            </span>
                          </div>
                          <div className="flex-1 bg-white rounded-lg shadow-sm relative overflow-hidden">
                            <ResumePreview
                              data={optimizedResumeData}
                              template="classic"
                              customColors={{}}
                              preferences={{}}
                              language="en"
                              country="us"
                              isPremium={false}
                              manualScale={0.9}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col">
                          {/* Template Navigation Header for ATS Optimized */}
                          <div className="flex items-center justify-between mb-2 sm:mb-3 bg-gray-50 p-2 sm:p-3 rounded-lg">
                            <button
                              onClick={goToPreviousTemplate}
                              disabled={safeAtsTemplates.length <= 1}
                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ArrowLeft size={16} />
                            </button>
                            <div className="text-center">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <Star className="text-green-500 mx-auto sm:mx-0 w-4 h-4" />
                                <span className="text-sm font-medium text-gray-900">
                                  {safeAtsTemplates[currentOptimizedTemplate]?.name || 'Template'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {currentOptimizedTemplate + 1} of {safeAtsTemplates.length} templates
                              </div>
                            </div>
                            <button
                              onClick={goToNextTemplate}
                              disabled={safeAtsTemplates.length <= 1}
                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ArrowRight size={16} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <CheckCircle className="text-green-500 w-4 h-4" />
                            <span className="text-xs sm:text-sm text-green-600">
                              ATS-Optimized Resume - Estimated Score: {result?.overallScore || 0}%
                            </span>
                          </div>

                          <div className="flex-1 bg-white rounded-lg shadow-sm relative overflow-hidden">
                            <ResumePreview
                              data={optimizedResumeData}
                              template={safeAtsTemplates[currentOptimizedTemplate]?.id || 'ats_modern_executive'}
                              customColors={{}}
                              preferences={{}}
                              language="en"
                              country="us"
                              isPremium={false}
                              manualScale={0.9}
                            />

                            {/* Premium Blur Overlay for Non-Premium Users - Maximum visibility */}
                            {!isPremium && !isBasicPlan && (
                              <div className="absolute bottom-0 left-0 right-0 h-4/5 sm:h-3/5 bg-gradient-to-t from-white/99 via-white/90 to-transparent backdrop-blur-md flex items-end justify-center p-2 sm:p-6">
                                <div className="bg-white/98 backdrop-blur-lg rounded-xl p-3 sm:p-6 shadow-2xl border border-gray-300 max-w-sm text-center w-full mx-1 sm:mx-0">
                                  <div className="mb-3 sm:mb-4">
                                    <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-2 sm:mb-3">
                                      <Lock className="text-white sm:w-5 sm:h-5" size={16} />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-primary mb-1 sm:mb-2">
                                      Unlock ATS Optimization
                                    </h3>
                                    <p className="text-xs sm:text-sm text-[#475569] mb-3 sm:mb-4">
                                      Get access to AI-optimized resumes with improved ATS scores and unlimited downloads.
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleUpgradeClick('basic', 'ats-preview-blur')}
                                    className="w-full bg-gradient-to-r from-primary to-accent text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2"
                                  >
                                    <Crown size={16} className="sm:w-5 sm:h-5" />
                                    <span className="text-sm sm:text-base">Upgrade to Premium</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <AlertCircle className="text-orange-500 w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resume Data Available</h3>
                      <p className="text-gray-600 mb-4">Please upload a resume first to use the ATS AI Boost feature.</p>
                      <button
                        onClick={() => setShowAIBoostModal(false)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>,
        document.body
      )}

      {/* Fresher Discount Popup - Disabled - FRESHER50 coupon removed */}
      {/* <FresherDiscountPopup
        isOpen={showFresherPopup}
        onClose={() => setShowFresherPopup(false)}
        fresherData={fresherData}
        source="ats-score-checker"
      /> */}


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

      {/* ATS History Panel */}
      <ATSHistoryPanel
        userId={user?.uid}
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        onRestore={handleRestoreFromHistory}
      />

      {/* Post Analysis Upsell Modal (₹99 Intent Filter) */}
      <PostAnalysisUpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        onUpgrade={(planType) => {
          setShowUpsellModal(false);
          handleUpgradeClick(planType, 'ats-post-analysis-upsell');
        }}
      />


      {/* Auth Modal for Frictionless Entry */}
      <SimpleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // The useEffect [file, user] will handle the auto-submission once user state updates
        }}
        title="Sign in to view your score"
      />

    </>
  );
}
