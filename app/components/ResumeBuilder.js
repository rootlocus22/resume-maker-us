"use client";
import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense, memo } from "react";
import {
  LayoutDashboard,
  Save,
  Eye,
  Edit,
  Palette,
  X,
  AlertTriangle,
  Star,
  FileUp,
  FileText,
  Pointer,
  Sparkles,
  Zap,
  Trash2,
  Bot,
  PlusCircle,
  Download,
  Minus,
  Plus,
  Share2,
  Crown,
  Mail,
  Wand2,
  Building,
  Play,
  Globe,
  ExternalLink,
  Upload,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { XMarkIcon } from '@heroicons/react/24/outline';
import InlineResumeSettings from './InlineResumeSettings';
// Lazy load core components for TBT optimization
const ResumeForm = lazy(() => import("./ResumeForm"));
const ResumePreview = lazy(() => import("./ResumePreview"));

import {
  saveResume,
  loadResume,
  markResumeAsActive,
  clearActiveResumeMarker,
  saveWorkingResume,
  loadWorkingResume,
  updateWorkingResumeMetadata,
  savePreAuthState,
  loadAndClearPreAuthState
} from "../lib/storage";
import { event } from "../lib/gtag";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot, collection, updateDoc, addDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import Modal from "./Modal";
import { templates } from "../lib/templates.js";
import { defaultConfig } from "../lib/templates.js";
import { atsFriendlyTemplates } from "../lib/atsFriendlyTemplates.js";
import { visualAppealTemplates } from "../lib/visualAppealTemplates.js";
import { premiumDesignTemplates } from "../lib/premiumDesignTemplates.js";
import { coverLetterTemplates } from "../lib/coverLetterTemplate";
import { useAuth } from "../context/AuthContext"; // [NEW]
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import ProgressOverlay from "./ProgressOverlay";
import { getDownloadLimitMessage, getPlanConfig } from "../lib/planConfig";
import { isResumeOwner, storeFirstResumeReference } from "../lib/firstResumeReference"; // [NEW]
import { useProfileGuard } from "../hooks/useProfileGuard"; // [NEW]
import clsx from "clsx";
import { useLocation } from "../context/LocationContext";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { saveResumeData, loadResumeData, getWorkingResume, setWorkingResume } from "../lib/storage";
import { createResume, updateResume } from "../lib/teamDataAccess";
import { logActivity, ACTIVITY_TYPES, getAdminId } from "../lib/teamManagement";
import {
  initializeResumeVersions,
  updateActiveResumeData,
  updateActiveResumeStats,
  getActiveResumeData,
  createResumeVersion,
  safeLocalStorage,
  safeSessionStorage
} from "../lib/storage";
import { rankResume, normalizeResumeData, createCleanResumeData, cleanResumeDataForFirebase, sanitizeDataForDeepCloning } from "../lib/utils";
import OnePagerButton from './OnePagerButton';

import { loadResumePreferences, saveResumePreferences } from '../utils/saveUserInfo';
import { getEffectivePricing } from "../lib/globalPricing";
import { formatDateWithPreferences, tryParseDate, cleanText, checkIfResumeIsForSomeoneElseLocal, normalizePhone } from "../lib/resumeUtils";

// Dynamic imports for heavy components
const ColorCustomizer = lazy(() => import("./ColorCustomizer"));
const PdfPreviewModal = lazy(() => import("./PdfPreviewModal"));
const OnePagerPreviewModal = lazy(() => import("./OnePagerPreviewModal"));
const TemplateSelector = lazy(() => import("./TemplateSelector"));
const UnsavedChangesModal = lazy(() => import("./UnsavedChangesModal"));
const PaymentForm = lazy(() => import("./PaymentForm"));
const LoginAndSubscribeModal = lazy(() => import("./LoginAndSubscribeModal"));
// ResumePreferences modal replaced by inline InlineResumeSettings
const FormConfigPanel = lazy(() => import('./FormConfigPanel'));
// HelpModal and GuidedTour removed for simpler UI
const JobSpecificResumePreview = lazy(() => import("../components/JobSpecificResumePreview"));
const ResumeVersionSwitcher = lazy(() => import("./ResumeVersionSwitcher"));
const PremiumPdfPreview = lazy(() => import('./PremiumPdfPreview'));
const SectionReorderEditor = lazy(() => import('./SectionReorderEditor'));




// lazy import for screenshot function
let html2canvasPromise = null;
const getHtml2Canvas = async () => {
  if (!html2canvasPromise) {
    html2canvasPromise = import("html2canvas").then((m) => m.default || m);
  }
  return html2canvasPromise;
};

// Pricing logic from Pricing.js
const getCurrencyAndPriceByCountry = (currency) => {
  // Get device-specific pricing
  const devicePricing = getEffectivePricing(currency, false); // Default to non-Android for this function

  const currencyData = {
    INR: {
      currency: "INR",
      annualPrice: 319900, // ₹3,199
      monthlyPrice: 39900, // ₹399
      basicPrice: devicePricing.basic, // Dynamic pricing based on device
      professionalPrice: 99900, // ₹999 (new professional tier)
      trialPrice: 4900, // ₹49 (reduced trial price)
      annualBasePrice: 254100, // ₹2,541
      monthlyBasePrice: 25300, // ₹253
      basicBasePrice: 8389, // ₹83.89
      professionalBasePrice: 84662, // ₹846.62
      trialBasePrice: 4150, // ₹41.50
      annualGST: 45800, // ₹458
      monthlyGST: 4600, // ₹46
      basicGST: 1511, // ₹15.11
      professionalGST: 15238, // ₹152.38
      trialGST: 750, // ₹7.50
    },
    USD: {
      currency: "USD",
      annualPrice: 30000, // $300
      monthlyPrice: 3000, // $30
      basicPrice: 500, // $5 (weekly plan - valid for 1 week)
      professionalPrice: 10000, // $100
      trialPrice: 500, // $5
      annualBasePrice: 30000, // $300 (no GST)
      monthlyBasePrice: 3000, // $30
      basicBasePrice: 500, // $5
      professionalBasePrice: 10000, // $100
      trialBasePrice: 500, // $5
      annualGST: 0, // No GST
      monthlyGST: 0,
      basicGST: 0,
      professionalGST: 0,
      trialGST: 0,
    },
  };
  return currencyData[currency] || currencyData["INR"];
};

const formatPrice = (price, currency) => {
  const symbols = { INR: "₹", USD: "$" };
  if (currency === "USD") {
    return `${symbols[currency]}${(price / 100).toFixed(2)}`;
  }
  return `${symbols[currency]}${Math.floor(price / 100).toLocaleString("en-IN")}`;
};

// Utility to detect mobile iOS
// function isMobileIOS() {
//   if (typeof window === "undefined") return false;
//   return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
// }



// Trial Banner Component - WITH DEVICE DETECTION
const TrialBanner = ({ isOpen, onClick, onClose, currency }) => {
  const { monthlyPrice, basicPrice } = getCurrencyAndPriceByCountry(currency);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent) {
      const isAndroid = /Android/i.test(navigator.userAgent);
      setIsAndroidDevice(isAndroid);
    }
  }, []);

  if (!isOpen) return null;

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsCollapsed(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className={clsx(
        "fixed bottom-16 right-4 z-30",
        isCollapsed ? "w-12 h-12" : "max-w-xs w-full"
      )}
    >
      {isCollapsed ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          onClick={() => setIsCollapsed(false)}
        >
          <Zap size={24} />
        </motion.button>
      ) : (
        <div className="bg-white border-2 border-slate-200 text-gray-800 p-6 rounded-2xl shadow-xl relative max-w-sm">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header with Badge */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] p-2 rounded-lg">
                <Crown size={20} className="text-white" />
              </div>
              <span className="bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white text-xs font-bold px-3 py-1 rounded-full">
                ⭐ MOST POPULAR
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {isAndroidDevice ? (
                <>
                  Start with Basic for <span className="text-[#0B1F3B]">{formatPrice(basicPrice, currency)} (7 days)</span>
                  <br />
                  <span className="text-lg">or go Premium for <span className="text-[#0B1F3B]">{formatPrice(monthlyPrice, currency)} (30 days)</span></span>
                </>
              ) : (
                <>
                  Go Premium for <span className="text-[#0B1F3B]">{formatPrice(monthlyPrice, currency)} (30 days)</span>
                  <br />
                  <span className="text-lg">or upgrade to yearly for better value</span>
                </>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              🚫 No Auto-Renewal • Pay once, use for full duration
            </p>
          </div>

          {/* Features List */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-[#0B1F3B]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Watermark-free PDF downloads</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-[#0B1F3B]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Advanced ATS optimization</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-[#0B1F3B]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Premium templates & AI features</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => onClick(isAndroidDevice ? "basic" : "monthly")}
            className="w-full bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white py-3 px-4 rounded-xl font-semibold text-sm hover:from-[#071429] hover:to-[#071429] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center gap-2">
              <Zap size={16} />
              {isAndroidDevice ? (
                <>Start with Basic {formatPrice(basicPrice, currency)} (7 days)</>
              ) : (
                <>Start Premium {formatPrice(monthlyPrice, currency)} (30 days)</>
              )}
            </div>
            <div className="text-xs opacity-90 mt-1">
              No Auto-Deduction • One-time payment
            </div>
          </button>

          {/* Trust Signal */}
          <p className="text-xs text-gray-500 text-center mt-3">
            <span>Join 10,000+ professionals</span>
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Public Profile Promotion Banner Component
const PublicProfileBanner = ({ isOpen, onClose, user, atsScore }) => {
  if (!isOpen || !user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-4 left-4 md:bottom-8 md:left-8 bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white p-4 md:p-6 rounded-xl shadow-2xl max-w-sm w-full z-40"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Share2 size={20} className="animate-pulse" />
          <h3 className="text-lg md:text-xl font-bold">Share Your Success!</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <p className="text-sm md:text-base font-medium mb-3">
        Great resume! Create a <strong>public profile</strong> to get discovered by recruiters and showcase your skills to the world.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => {
            window.open('/edit-profile', '_blank');
            onClose();
          }}
          className="bg-white text-[#0B1F3B] px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition-all shadow-md"
        >
          Create Profile
        </button>
        <button
          onClick={onClose}
          className="text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm font-medium hover:underline"
        >
          Maybe Later
        </button>
      </div>
    </motion.div>
  );
};

// Import default data from storage.js
import { DEFAULT_RESUME_DATA as STORAGE_DEFAULT_RESUME_DATA } from "../lib/storage";

// Default resume and cover letter data structures
const DEFAULT_RESUME_DATA = STORAGE_DEFAULT_RESUME_DATA;

// Import default cover letter data from storage.js
import { DEFAULT_COVER_LETTER_DATA as STORAGE_DEFAULT_COVER_LETTER_DATA } from "../lib/storage";

const DEFAULT_COVER_LETTER_DATA = STORAGE_DEFAULT_COVER_LETTER_DATA;

// Import India-specific storage functions
import {
  saveResumeDataWithIndiaHandling,
  loadAnonymousResumeForIndia,
  hasAnonymousResumeForIndia,
  restoreAnonymousResumeOnLogin
} from "../lib/storage";

import BuilderSkeleton from './skeletons/BuilderSkeleton';
const ENABLE_PAYMENTS = true;

export default function ResumeBuilder() {



  // Responsive check for conditional rendering (TBT optimization)
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTemplate = searchParams.get("template") || "visual_modern_executive";
  const sourceParam = searchParams.get("source");
  const { currency, isLoadingGeo, countryCode, switchCurrency } = useLocation();
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent) {
      setIsAndroidDevice(/Android/i.test(navigator.userAgent));
    }
  }, []);

  // Profile Guard
  const { checkProfileAccess, ProfileGuardModal, setIsProfileLimitModalOpen, isProfileLimitModalOpen, setBlockedProfileData } = useProfileGuard(); // [NEW]



  const { user, userData, isPremium, plan, isBasicPlan, isOneDayPlan } = useAuth();


  // Derived state from userData
  const basicPlanExpiry = isBasicPlan && userData?.premium_expiry ? new Date(userData.premium_expiry) : null;
  const oneDayPlanExpiry = isOneDayPlan && userData?.premium_expiry ? new Date(userData.premium_expiry) : null;
  const previewCount = userData?.preview_count || 0;
  const dbTemplateChangeCount = userData?.template_change_count || 0;
  const pdfDownloadCount = userData?.pdf_download_count || 0;
  // anonymousAIBoostUses seems local or not in core user data, keeping state if needed or deriving if in userData
  // Assuming it's local for now as it wasn't in AuthContext userData


  const pricing = getEffectivePricing(currency, isAndroidDevice);

  // State management - Use ATS data immediately if source=ats
  // State management - Initialized with defaults to prevent TBT
  const [resumeData, setResumeData] = useState(DEFAULT_RESUME_DATA);
  const resumeId = searchParams.get("resumeId");
  console.log("ResumeBuilder - resumeId from URL:", resumeId);

  // Set loading state immediately if we have a resumeId to prevent flicker
  const [isLoadingResumeData, setIsLoadingResumeData] = useState(!!resumeId);

  // Template state initialized with prop/url param
  const [template, setTemplate] = useState(initialTemplate);
  const currentTemplate = templates[template] || atsFriendlyTemplates[template] || visualAppealTemplates[template] || premiumDesignTemplates[template];
  const isATSTemplate = currentTemplate?.category === "ATS-Optimized" || template?.startsWith("ats_");
  const isVisualAppealTemplate = currentTemplate?.category === "Visual Appeal" || template?.startsWith("visual_");
  const isPremiumDesignTemplate = currentTemplate?.category === "Premium Design" || template?.startsWith("premium_");
  const isColorCustomizationAvailable = !(isATSTemplate || isVisualAppealTemplate || isPremiumDesignTemplate);

  // AI Text Parsing State
  const [isAiBuildMode, setIsAiBuildMode] = useState(false);
  const [aiInputText, setAiInputText] = useState("");
  const [isParsingText, setIsParsingText] = useState(false);

  const handleAiTextParse = async () => {
    if (!aiInputText.trim()) return;

    setIsParsingText(true);
    try {
      const response = await fetch("/api/gemini-parse-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiInputText }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume text");
      }

      const parsedData = await response.json();

      // Ensure we keep existing contact info if parsed data is missing it, 
      // or just overwrite completely? 
      // User request implies replacing form fields, so we overwrite.
      // But let's be safe and clean metadata.

      setResumeData(parsedData);

      if (parsedData.name && (!resumeName || resumeName === "Untitled Resume")) {
        setResumeName(parsedData.name + "'s Resume");
      }

      setIsAiBuildMode(false);
      setAiInputText("");
      toast.success("Resume generated successfully from text!");
      setHasStartedEditing(true);

    } catch (error) {
      console.error("Error parsing text:", error);
      toast.error("Failed to generate resume. Please try again.");
    } finally {
      setIsParsingText(false);
    }
  };

  // ATS Data Loading Effect - Unblocks main thread
  useEffect(() => {
    if (sourceParam === 'ats' && typeof window !== 'undefined') {
      // Use requestIdleCallback or setTimeout to defer checking localStorage until after paint
      const loadAtsData = () => {
        console.log('🎯 ATS SOURCE DETECTED - Loading ATS data asynchronously');
        try {
          const atsDataString = safeLocalStorage.getItem('ats_resume_data');
          if (atsDataString) {
            const atsDataPackage = JSON.parse(atsDataString);
            console.log('✅ ATS DATA LOADED ASYNC');

            if (atsDataPackage.resumeData) {
              setResumeData(atsDataPackage.resumeData);
            }
            if (atsDataPackage.template) {
              setTemplate(atsDataPackage.template);
            }
          }
        } catch (error) {
          console.error('❌ Error loading ATS state:', error);
        }
      };

      // Defer slightly to ensure UI is interactive first
      setTimeout(loadAtsData, 0);
    }
  }, [sourceParam]);
  const [customColors, setCustomColors] = useState({});
  const [language, setLanguage] = useState("en");
  const [country, setCountry] = useState("in");

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [upgradedFromPdfModal, setUpgradedFromPdfModal] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  // Help modal and guided tour removed
  const [activeTab, setActiveTab] = useState("form");
  const [previewMode, setPreviewMode] = useState("resume");
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isBuilderFullscreen, setIsBuilderFullscreen] = useState(false);

  useEffect(() => {
    if (!isColorCustomizationAvailable && isColorPanelOpen) {
      setIsColorPanelOpen(false);
    }
  }, [isColorCustomizationAvailable, isColorPanelOpen]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (countryCode) {
      setCountry(countryCode.toLowerCase());
    }
  }, [countryCode]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("builder-fullscreen", isBuilderFullscreen);
    return () => {
      document.body.classList.remove("builder-fullscreen");
    };
  }, [isBuilderFullscreen]);
  // previewCount, templateChangeCount, pdfDownloadCount replaced by derived state
  const [anonymousAIBoostUses, setAnonymousAIBoostUses] = useState(0);

  const [latestPayment, setLatestPayment] = useState(null);

  const [loginAndSubscribeModalOpen, setLoginAndSubscribeModalOpen] = useState(false);

  // Helper function for consistent upgrade flow
  const handleConsistentUpgradeClick = (billingCycle = 'basic', source = 'resume-builder') => {
    console.log('🚀 handleConsistentUpgradeClick called:', { billingCycle, source, user: !!user });

    if (user) {
      console.log('✅ User logged in - redirecting to checkout');
      router.push(`/checkout?billingCycle=${billingCycle}&currency=${currency}&step=1`);
    } else {
      console.log('❌ User not logged in - storing intent and redirecting to login');

      // Store checkout intent and redirect to login
      const checkoutData = { billingCycle, source };
      safeLocalStorage.setItem('checkoutIntent', JSON.stringify(checkoutData));

      // Store message in sessionStorage instead of URL params for cleaner URLs
      safeSessionStorage.setItem('loginMessage', 'Please login to unlock premium AI features and continue with your purchase');

      // Verify it was stored
      const stored = safeLocalStorage.getItem('checkoutIntent');
      console.log('💾 Checkout intent stored:', {
        original: checkoutData,
        stored: stored,
        parsed: JSON.parse(stored)
      });

      window.location.href = `/login`;
    }
  };
  const [hasShownToast, setHasShownToast] = useState(false);
  const [hasShownRestoreToast, setHasShownRestoreToast] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [loadedTemplate, setLoadedTemplate] = useState(null); // Track template version when loaded
  const [resumeName, setResumeName] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [showPreviewHint, setShowPreviewHint] = useState(false);
  const [showDownloadHint, setShowDownloadHint] = useState(false);
  const [showStyleHint, setShowStyleHint] = useState(true);
  const [showAiBoostHint, setShowAiBoostHint] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false); // Always false - exit intent popup removed
  const [showTrialBanner, setShowTrialBanner] = useState(false); // Always false - pricing popup removed
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [hasInteractedWithCheckout, setHasInteractedWithCheckout] = useState(false);
  const [hintsDismissed, setHintsDismissed] = useState({
    preview: false,
    download: false,
    style: false,
    aiBoost: false,
  });
  const [editStartTime, setEditStartTime] = useState(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [isApplyingAI, setIsApplyingAI] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState(() => loadResumePreferences(defaultConfig));
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [previewScale, setPreviewScale] = useState(null);
  const previewContainerRef = useRef(null);
  const [showPublicProfileBanner, setShowPublicProfileBanner] = useState(false);
  const [localTemplateChangeCount, setTemplateChangeCount] = useState(0);
  const templateChangeCount = user ? dbTemplateChangeCount : localTemplateChangeCount;
  const [publicProfileBannerDismissed, setPublicProfileBannerDismissed] = useState(false);
  const [isSectionReorderEditorOpen, setIsSectionReorderEditorOpen] = useState(false);
  const [templateSectionOrders, setTemplateSectionOrders] = useState({}); // Local mapping per template
  const [showEnterprisePromo, setShowEnterprisePromo] = useState(false);
  const [promoTriggerCount, setPromoTriggerCount] = useState(0);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showOnePagerModal, setShowOnePagerModal] = useState(false);
  const [showOnePagerChoiceModal, setShowOnePagerChoiceModal] = useState(null);
  const [autoSlideshow, setAutoSlideshow] = useState(false);
  const [pdfPreviewBlob, setPdfPreviewBlob] = useState(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);

  // Guarded Action Helper
  // Guarded Action Helper - Redirect to login
  const withAuth = (action, message = "Please sign in to continue") => {
    if (user) {
      action();
    } else {
      toast.error(message);
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  };

  // Debug location toggle
  const [debugLocation, setDebugLocation] = useState('IN');

  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // [NEW] Profile Limit Modal State - Handled by useProfileGuard hook
  const [initialResumeData, setInitialResumeData] = useState(null);
  const [hasStartedEditing, setHasStartedEditing] = useState(false);
  const [isResumeLoaded, setIsResumeLoaded] = useState(false);

  // Auto-save resume when photo is uploaded to Firebase Storage
  const [lastSavedPhotoUrl, setLastSavedPhotoUrl] = useState(null);
  useEffect(() => {
    // Check if photo is a Firebase Storage URL and has changed
    const currentPhotoUrl = resumeData?.photo;
    const isFirebaseStorageUrl =
      typeof currentPhotoUrl === 'string' &&
      (currentPhotoUrl.startsWith('https://storage.googleapis.com/') ||
        currentPhotoUrl.startsWith('https://firebasestorage.googleapis.com/'));

    // Auto-save if:
    // 1. User is logged in
    // 2. Photo is a Firebase Storage URL
    // 3. Photo URL has changed (different from last saved)
    // 4. We have a valid resumeId (not 'default')
    if (user && isFirebaseStorageUrl && currentPhotoUrl !== lastSavedPhotoUrl && resumeId && resumeId !== 'default') {
      console.log('📸 Auto-saving resume after photo upload...', { resumeId, hasResumeName: !!resumeName });
      setLastSavedPhotoUrl(currentPhotoUrl);

      // Use async function to handle the save
      const autoSavePhoto = async () => {
        try {
          // Clean the resume data
          const cleanedResumeData = cleanResumeDataForFirebase(resumeData);

          // Update existing resume document
          const resumeRef = doc(db, "users", user.uid, "resumes", resumeId);
          await updateDoc(resumeRef, {
            resumeData: cleanedResumeData,
            updatedAt: new Date().toISOString(),
          });

          if (user) {
            console.log('✅ Photo auto-saved successfully to resume:', resumeId);
            toast.success('Photo saved!', { duration: 2000 });
          }
        } catch (error) {
          console.error('❌ Error auto-saving photo:', error);
          if (error.code === 'not-found') {
            console.warn('⚠️ Resume document not found, photo will be saved on next manual save');
          } else {
            console.error('Photo save error:', error);
          }
        }
      };

      autoSavePhoto();
    } else if (user && isFirebaseStorageUrl && currentPhotoUrl !== lastSavedPhotoUrl && (!resumeId || resumeId === 'default')) {
      console.log('ℹ️ Photo uploaded but no saved resume yet. Photo will persist when you save the resume.');
      setLastSavedPhotoUrl(currentPhotoUrl);
    }
    // Dependency array optimized to prevent infinite loops (only specific fields)
  }, [resumeData?.photo, user, resumeId, lastSavedPhotoUrl]);

  // Auto-slideshow functionality for mobile
  useEffect(() => {
    if (autoSlideshow && showMobilePreview && previewMode === "resume") {
      const interval = setInterval(() => {
        const currentIndex = Object.keys(templates).indexOf(template);
        const templateKeys = Object.keys(templates);
        const nextIndex = currentIndex < templateKeys.length - 1 ? currentIndex + 1 : 0;
        setTemplate(templateKeys[nextIndex]);
      }, 3000); // Change template every 3 seconds

      return () => clearInterval(interval);
    }
  }, [autoSlideshow, showMobilePreview, previewMode, template, templates]);

  // Memoized preferences with current template section order
  const enhancedPreferences = (() => {
    const templateKey = `${country.toLowerCase()}_${template}`;
    const customSectionOrder = templateSectionOrders[templateKey] || null;
    const layoutConfig = customSectionOrder ? {
      ...preferences.layout,
      customSectionOrder
    } : {
      ...preferences.layout,
      customSectionOrder: undefined
    };
    return {
      ...preferences,
      layout: layoutConfig
    };
  })();

  // Keep template isolation - section orders are per template

  // Calculate ATS tips for the UI
  const atsData = useMemo(() => {
    try {
      return rankResume(resumeData);
    } catch (error) {
      console.error('Error calculating ATS data:', error);
      return { score: 0, tips: [] };
    }
  }, [resumeData]);

  // Ensure template isolation - close reorder editor when template changes from outside
  const [isTemplateChangeFromEditor, setIsTemplateChangeFromEditor] = useState(false);

  // Export functionality state
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportAmountModal, setShowExportAmountModal] = useState(false);
  const [exportPaymentAmount, setExportPaymentAmount] = useState('');
  const [exportPaymentCurrency, setExportPaymentCurrency] = useState('INR');
  const [exportPaymentError, setExportPaymentError] = useState('');
  const [exportedPaymentAmount, setExportedPaymentAmount] = useState(null);
  const [exportedPaymentCurrency, setExportedPaymentCurrency] = useState('INR');

  const formatCurrencyValue = (amount, currency = 'INR') => {
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (Number.isNaN(numericAmount)) {
      return '';
    }

    const upperCurrency = (currency || 'INR').toUpperCase();
    const zeroDecimalCurrencies = new Set(['INR', 'JPY', 'KRW', 'VND']);
    const fractionDigits = zeroDecimalCurrencies.has(upperCurrency) ? 0 : 2;

    try {
      return new Intl.NumberFormat(
        upperCurrency === 'INR' ? 'en-IN' : 'en-US',
        {
          style: 'currency',
          currency: upperCurrency,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }
      ).format(numericAmount);
    } catch (error) {
      return `${upperCurrency} ${numericAmount}`;
    }
  };

  // Safe useEffect cleanup for event listeners
  // Safe useEffect cleanup for event listeners
  const prevTemplateRef = useRef(template);
  useEffect(() => {
    // Only close if template changed AND editor is open AND change wasn't from editor
    if (prevTemplateRef.current !== template) {
      if (isSectionReorderEditorOpen && !isTemplateChangeFromEditor) {
        setIsSectionReorderEditorOpen(false);
      }
      prevTemplateRef.current = template;
    }

    // Reset flag safely
    if (isTemplateChangeFromEditor) {
      setIsTemplateChangeFromEditor(false);
    }
  }, [template, isSectionReorderEditorOpen, isTemplateChangeFromEditor]);

  // Load dismissed hints and banner dismissal from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHints = safeLocalStorage.getItem("hintsDismissed");
      if (storedHints) {
        setHintsDismissed(JSON.parse(storedHints));
      } else {
        setHintsDismissed({ preview: false, download: false, style: false, aiBoost: false });
      }
      setIsBannerDismissed(safeLocalStorage.getItem("bannerDismissed") === "true");

      // Load template section orders from localStorage
      const savedSectionOrders = safeLocalStorage.getItem("templateSectionOrders");
      if (savedSectionOrders) {
        try {
          const parsedOrders = JSON.parse(savedSectionOrders);

          // AGGRESSIVE CLEANUP: Clear ALL custom section orders to force template defaults
          // This fixes corrupted localStorage data that's overriding template configurations
          safeLocalStorage.removeItem("templateSectionOrders");
          setTemplateSectionOrders({});
        } catch (e) {
          console.warn('Error parsing saved template section orders:', e);
        }
      }

    }
  }, []);

  // Save dismissed hints to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      safeLocalStorage.setItem("hintsDismissed", JSON.stringify(hintsDismissed));
      safeLocalStorage.setItem("bannerDismissed", isBannerDismissed.toString());
    }
  }, [hintsDismissed, isBannerDismissed]);

  // Track initial resume data for unsaved changes detection
  useEffect(() => {
    if (resumeData && !initialResumeData) {
      setInitialResumeData(JSON.stringify(resumeData));
      // For anonymous users, mark as loaded immediately
      if (!user) {
        setIsResumeLoaded(true);
      }
    }
  }, [resumeData, initialResumeData, user]);

  // Reset initial data when loading a new resume (from URL params or version switcher)
  useEffect(() => {
    if (resumeId) {
      // When loading a specific resume, reset the initial data after it's loaded
      const timer = setTimeout(() => {
        if (resumeData && Object.keys(resumeData).length > 0 && !hasStartedEditing) {
          setInitialResumeData(JSON.stringify(resumeData));
          setHasUnsavedChanges(false);
          setHasStartedEditing(false); // Reset editing flag when loading a new resume
          setIsResumeLoaded(true); // Mark resume as loaded
        }
      }, 1000); // Small delay to ensure data is fully loaded

      return () => clearTimeout(timer);
    }
  }, [resumeId, hasStartedEditing]); // Dependency safe: resumeId is string/null

  // For logged-in users without resumeId, also reset when resumeData changes significantly
  useEffect(() => {
    if (user && !resumeId && resumeData && Object.keys(resumeData).length > 0 && !hasStartedEditing) {
      // This handles cases where a logged-in user loads a resume but there's no resumeId in URL
      const timer = setTimeout(() => {
        if (!initialResumeData || JSON.stringify(resumeData) !== initialResumeData) {
          setInitialResumeData(JSON.stringify(resumeData));
          setHasUnsavedChanges(false);
          setHasStartedEditing(false);
          setIsResumeLoaded(true);
        }
      }, 500); // Shorter delay for this case

      return () => clearTimeout(timer);
    }
  }, [user, resumeId, resumeData, initialResumeData, hasStartedEditing]);

  // Track when user starts editing to prevent automatic resets

  // For logged-in users, we'll track editing through form interactions instead of data changes
  // This prevents false positives from data loading/normalization differences

  // Additional check: if user is logged in and has unsaved changes but hasn't started editing,
  // it might be a false positive from loading data
  useEffect(() => {
    if (user && hasUnsavedChanges && !hasStartedEditing && isResumeLoaded) {
      // This is likely a false positive from data loading, so reset it
      setHasUnsavedChanges(false);
    }
  }, [user, hasUnsavedChanges, hasStartedEditing, isResumeLoaded]);

  // Detect unsaved changes
  useEffect(() => {
    if (initialResumeData && resumeData) {
      const currentData = JSON.stringify(resumeData);
      const hasChanges = currentData !== initialResumeData;

      // For anonymous users, detect changes but also check if they have significant data
      if (!user) {
        // Only set unsaved changes if there are actual changes AND significant data
        // This prevents false positives when just loading the default data
        if (hasChanges && hasSignificantChanges()) {
          setHasUnsavedChanges(true);
        } else {
          setHasUnsavedChanges(false);
        }
      } else {
        // For logged-in users, only set unsaved changes if the user has actually started editing
        // This prevents false positives when loading saved resumes
        if (hasChanges && hasStartedEditing && isResumeLoaded) {
          setHasUnsavedChanges(true);
        } else if (!hasChanges) {
          setHasUnsavedChanges(false);
        }
        // If there are changes but user hasn't started editing yet, don't set unsaved changes
        // This prevents false positives when data is still loading
      }
    }
  }, [resumeData, initialResumeData, hasStartedEditing, isResumeLoaded, user]);

  // Handle beforeunload event for unsaved changes
  // useEffect(() => {
  //   const handleBeforeUnload = (e) => {
  //     // For anonymous users, only block navigation if there are significant changes AND location is not India
  //     const shouldBlockAnonymous = !user && hasSignificantChanges() && countryCode !== 'IN';
  //     const shouldBlockLoggedIn = user && hasUnsavedChanges;

  //     // Only block page unload for whitelisted paths (current page should be in whitelist)
  //     if (hasUnsavedChanges && (shouldBlockLoggedIn || shouldBlockAnonymous) && shouldShowUnsavedChangesModal(window.location.pathname)) {
  //       e.preventDefault();
  //       e.returnValue = '';
  //       return '';
  //     }
  //   };

  //   if (typeof window !== 'undefined') {
  //     window.addEventListener('beforeunload', handleBeforeUnload);
  //     return () => {
  //       window.removeEventListener('beforeunload', handleBeforeUnload);
  //     };
  //   }
  // }, [hasUnsavedChanges, user, countryCode]);

  // Helper function to check if there are significant changes worth warning about
  const hasSignificantChanges = () => {
    if (!resumeData || !initialResumeData) return false;

    try {
      const initial = JSON.parse(initialResumeData);

      // Check if user has changed significant fields from their initial values
      const nameChanged = resumeData.name !== initial.name;
      const emailChanged = resumeData.email !== initial.email;
      const experienceChanged = JSON.stringify(resumeData.experience) !== JSON.stringify(initial.experience);
      const educationChanged = JSON.stringify(resumeData.education) !== JSON.stringify(initial.education);
      const skillsChanged = JSON.stringify(resumeData.skills) !== JSON.stringify(initial.skills);

      // Only warn if user has made significant changes from the initial state
      return nameChanged || emailChanged || experienceChanged || educationChanged || skillsChanged;
    } catch (error) {
      // Fallback with safe checks
      if (!resumeData) return false;
      const hasName = resumeData.name && resumeData.name.trim().length > 0;
      const hasEmail = resumeData.email && resumeData.email.trim().length > 0;
      const hasExperience = resumeData.experience && Array.isArray(resumeData.experience) && resumeData.experience.length > 0;
      const hasEducation = resumeData.education && Array.isArray(resumeData.education) && resumeData.education.length > 0;
      const hasSkills = resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0;

      return hasName || hasEmail || hasExperience || hasEducation || hasSkills;
    }
  };

  // Whitelist of paths where unsaved changes modal should appear
  // This prevents the modal from blocking navigation to external sites or non-whitelisted paths
  const shouldShowUnsavedChangesModal = (href) => {
    if (!href || href === '#') return false;

    // Parse the URL to get the pathname
    let pathname;
    try {
      const url = new URL(href, window.location.origin);
      pathname = url.pathname;
    } catch (e) {
      // If it's a relative path, use it directly
      pathname = href.startsWith('/') ? href : `/${href}`;
    }

    // Whitelist of paths where unsaved changes modal should appear
    // Only these paths will trigger the unsaved changes modal when navigating away
    const whitelistedPaths = [
      '/home',                    // Home page
      '/ats-score-checker',       // ATS score checker
      '/upload-resume',           // Upload resume page
      '/resume-builder',          // Resume builder (current page)
      '/preview-generator',       // Preview generator
      '/templates',               // Templates page
      '/features',                // Features page
      '/testimonials',            // Testimonials page
      '/about-us',                // About us page
      '/faqs',                    // FAQs page
      '/privacy',                 // Privacy policy
      '/terms',                   // Terms and conditions
      '/refund',                  // Refund policy
      '/contact-us',              // Contact us page
      '/ccpa-opt-out',            // CCPA opt-out page
      '/pricing',                 // Pricing page
      // '/login',                   // Login page
      // '/signup',                  // Signup page
      // '/checkout',             // Checkout page (commented out to allow direct navigation)
      '/my-resumes',              // My resumes page
      '/my-cover-letters',        // My cover letters page
      '/profile',                 // Profile page
      '/edit-profile',            // Edit profile page
      '/dashboard',               // Dashboard pages
      '/enterprise',              // Enterprise pages
      '/job-specific-resume-builder', // Job-specific resume builder
      '/cover-letter-builder',    // Cover letter builder
      '/one-pager-resume',        // One-pager resume
      '/salary-analyzer',         // Salary analyzer
      '/ai-interview',       // Interview copilot
      '/job-search',              // Job search pages
      '/company-jobs'             // Company jobs pages
    ];

    // Check if the pathname matches any whitelisted path
    // Also check for sub-paths (e.g., /dashboard/settings will match /dashboard)
    return whitelistedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  };

  // Handle navigation attempts
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a[href], button[onclick], [data-href]');
      if (!target) return;

      const href = target.getAttribute('href') || target.getAttribute('data-href') || '#';

      // Don't block form submissions or same-page anchors
      if (href.startsWith('#') || target.type === 'submit') return;

      // Only show unsaved changes modal for whitelisted paths
      if (!shouldShowUnsavedChangesModal(href)) {
        return; // Allow navigation for non-whitelisted paths
      }

      // For anonymous users, only block navigation if there are significant changes AND location is not India
      if (!user && (!hasSignificantChanges() || countryCode === 'IN')) {
        return; // Allow navigation for anonymous users with minimal changes or if in India
      }

      // For logged-in users, block navigation if there are unsaved changes AND they have started editing
      if (user && hasUnsavedChanges && hasStartedEditing) {
        e.preventDefault();
        e.stopPropagation();

        setPendingNavigation(href);
        setIsUnsavedChangesModalOpen(true);
        return;
      }

      // For anonymous users with significant changes and not in India, block navigation
      if (!user && hasSignificantChanges() && countryCode !== 'IN') {
        e.preventDefault();
        e.stopPropagation();

        setPendingNavigation(href);
        setIsUnsavedChangesModalOpen(true);
        return;
      }
    };

    const handlePopState = (e) => {
      // For anonymous users, only block navigation if there are significant changes AND location is not India
      const shouldBlockAnonymous = !user && hasSignificantChanges() && countryCode !== 'IN';
      const shouldBlockLoggedIn = user && hasUnsavedChanges && hasStartedEditing;

      // Only show unsaved changes modal for whitelisted paths
      if (hasUnsavedChanges && (shouldBlockLoggedIn || shouldBlockAnonymous)) {
        e.preventDefault();
        history.pushState(null, '', window.location.href);
        setPendingNavigation(window.location.href);
        setIsUnsavedChangesModalOpen(true);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClick, true);
      window.addEventListener('popstate', handlePopState);
      return () => {
        document.removeEventListener('click', handleClick, true);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [hasUnsavedChanges, user, countryCode]);

  // Start tracking edit time
  useEffect(() => {
    if (!editStartTime && activeTab === "form") {
      setEditStartTime(Date.now());
    }
  }, [activeTab, editStartTime]);

  // Guided tour removed

  // Trial Banner Logic
  useEffect(() => {
    if (isBannerDismissed || hasInteractedWithCheckout || isPremium) {
      setShowTrialBanner(false);
      return;
    }

    if (resumeData.name && !isApplyingAI && !isGeneratingPdf && !isPdfModalOpen && !hintsDismissed.aiBoost) {
      setTimeout(() => {
        setShowAiBoostHint(true);
        setShowTrialBanner(true);
      }, 60000);
    } else {
      setShowAiBoostHint(false);
    }

    if (atsScore > 80 && !isGeneratingPdf && !isPdfModalOpen && !hintsDismissed.preview) {
      setTimeout(() => {
        setShowPreviewHint(true);
        setShowTrialBanner(true);
      }, 5000);
    } else if (isPdfModalOpen) {
      setTimeout(() => {
        setShowTrialBanner(true);
      }, 5000);
    } else {
      setShowPreviewHint(false);
    }

    if (!isPremium && !hasInteractedWithCheckout && (atsScore > 80 || isPdfModalOpen)) {
      setTimeout(() => {
        setShowTrialBanner(true);
        setHasInteractedWithCheckout(true);
      }, 5000);
    }
  }, [resumeData, isApplyingAI, isGeneratingPdf, isPdfModalOpen, isPremium, hasInteractedWithCheckout, isBannerDismissed, atsScore, hintsDismissed]);

  const handleBannerClose = () => {
    setShowTrialBanner(false);
    setIsBannerDismissed(true);
  };

  // One-pager choice modal handlers
  const handleOpenInOnePagerBuilder = () => {
    if (showOnePagerChoiceModal) {
      router.push(`/one-pager-builder/editor?resumeId=${showOnePagerChoiceModal.resumeId}`);
      setShowOnePagerChoiceModal(null);
    }
  };

  const handleOpenInResumeBuilder = () => {
    if (showOnePagerChoiceModal) {
      const { resumeData } = showOnePagerChoiceModal;

      // Normalize the one-pager data for regular resume builder
      let normalizedData = normalizeResumeData(resumeData);

      // Set template to classic for better compatibility
      setTemplate('classic');

      // Load the data into resume builder
      setResumeData(normalizedData);
      setCustomColors(resumeData.customColors || {});
      setLanguage(resumeData.language || "en");
      setCountry(resumeData.country || "in");
      setResumeName(resumeData.resumeName || "");

      // Mark resume as active
      markResumeAsActive();

      toast.success("Resume loaded in Resume Builder with Classic template!");
      setShowOnePagerChoiceModal(null);
    }
  };

  // Simple ATS score calculation
  const calculateATSScore = (data) => {
    const score = rankResume(data, "", isPremium, false).score;

    // Update the active resume version stats with the new ATS score
    updateActiveResumeStats({ atsScore: score });

    return score;
  };

  // Check ATS score and trigger reward animation or AI Boost hint
  useEffect(() => {
    const newAtsScore = calculateATSScore(resumeData);
    setAtsScore(newAtsScore);

    if (
      newAtsScore >= 80 &&
      editStartTime &&
      Date.now() - editStartTime > 300000 && // 5 minutes
      !showRewardAnimation
    ) {
      setShowRewardAnimation(true);
      setTimeout(() => setShowRewardAnimation(false), 5000);
    }
  }, [resumeData, editStartTime, showRewardAnimation]);

  // Handle PDF upload redirect
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    // Check for unsaved changes before navigating
    if (hasUnsavedChanges) {
      setPendingNavigation("/upload-resume");
      setIsUnsavedChangesModalOpen(true);
    } else {
      router.push("/upload-resume");
    }
  };

  // Utility to replace placeholders in cover letter
  const replacePlaceholders = (text, jobTitle, company) => {
    if (!text || typeof text !== 'string') return text || '';
    return text.replace(/\[jobTitle\]/g, jobTitle || "[jobTitle]").replace(/\[company\]/g, company || "[company]");
  };

  // Update cover letter with placeholders


  // Handle ATS data loading - DO NOT DELETE localStorage until we're sure data is loaded
  useEffect(() => {
    if (sourceParam === 'ats' && typeof window !== 'undefined') {
      console.log('🎯 ATS Data Loading - Starting...');

      const loadAtsData = () => {
        try {
          const atsDataString = safeLocalStorage.getItem('ats_resume_data');
          const atsTimestamp = safeLocalStorage.getItem('ats_data_timestamp');

          console.log('🔍 localStorage check:', {
            hasAtsData: !!atsDataString,
            hasTimestamp: !!atsTimestamp,
            dataLength: atsDataString?.length,
            rawData: atsDataString?.substring(0, 100) + '...'
          });

          if (atsDataString) {
            const atsDataPackage = JSON.parse(atsDataString);
            console.log('📦 Parsed ATS package:', atsDataPackage);

            // Set the data immediately
            console.log('⚡ Setting React state with ATS data...');
            setResumeData(atsDataPackage.resumeData);
            setTemplate(atsDataPackage.template);
            setCustomColors(atsDataPackage.customColors || {});
            setLanguage(atsDataPackage.language || 'en');
            setCountry(atsDataPackage.country || 'us');

            // Show success message
            const optimizedText = atsDataPackage.metadata?.atsOptimized ? 'ATS-Optimized' : 'Original';
            toast.success(`✅ Loaded ${optimizedText} resume from ATS Score Checker!`);

            // Mark as loaded but DON'T delete localStorage yet
            safeSessionStorage.setItem('ats_data_loaded', 'true');
            console.log('✅ ATS data loaded into React state successfully!');

            return true; // Successfully loaded
          } else {
            console.log('❌ No ATS data found in localStorage');
            return false;
          }
        } catch (error) {
          console.error('❌ Error loading ATS data:', error);
          return false;
        }
      };

      // Try to load immediately
      const loaded = loadAtsData();

      // If not loaded immediately, try again after a short delay
      if (!loaded) {
        setTimeout(() => {
          console.log('🔄 Retrying ATS data load...');
          loadAtsData();
        }, 500);
      }
    }
  }, []); // Run once on mount

  // Simple cleanup for ATS data after component is fully loaded
  useEffect(() => {
    if (sourceParam === 'ats' && typeof window !== 'undefined') {
      // Clean up localStorage after 3 seconds to ensure React has fully rendered
      const cleanupTimer = setTimeout(() => {
        const hasActualData = resumeData && resumeData.name && resumeData.name !== '';
        if (hasActualData) {
          console.log('🧹 Cleaning up ATS localStorage - data confirmed in React state');
          safeLocalStorage.removeItem('ats_resume_data');
          safeLocalStorage.removeItem('ats_data_timestamp');
          safeSessionStorage.removeItem('ats_data_loaded');
        }
      }, 3000);

      return () => clearTimeout(cleanupTimer);
    }
  }, [sourceParam]); // Run once when component mounts

  // Initialize auth and load data
  useEffect(() => {
    // BYPASS DATA LOADING BUT STILL HANDLE AUTH IF ATS SOURCE
    if (sourceParam === 'ats') {
      console.log('🚫 BYPASSING data loading logic - ATS source detected');
      // Still need to handle auth for premium status - use SAME logic as normal flow
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          // Use the SAME auth logic as the normal flow
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: currentUser.email || "anonymous",
              plan: "anonymous",
              premium_expiry: null,
              preview_count: 0,
              template_change_count: 0,
            });
          }

          // Set up real-time user data listener (same as normal flow)
          const unsubscribeSnapshot = onSnapshot(userRef, async (docSnapshot) => {
            const data = docSnapshot.data();
            setUserData(data); // Sync userData from Firestore
            setPlan(data.plan || "anonymous");

            const userIsPremium = data.plan === "premium" && (!data.premium_expiry || new Date() < new Date(data.premium_expiry));
            setIsPremium(userIsPremium);

            setPreviewCount(data.preview_count || 0);
            setTemplateChangeCount(data.template_change_count || 0);
            setPdfDownloadCount(data.pdf_download_count || 0);

            // Check if user has basic plan
            if (data.plan === "basic") {
              const isBasicValid = data.premium_expiry && new Date() < new Date(data.premium_expiry);
              setIsBasicPlan(isBasicValid);
              setBasicPlanExpiry(data.premium_expiry);
              setIsOneDayPlan(false);
              setOneDayPlanExpiry(null);
            } else if (data.plan === "oneDay") {
              const isOneDayValid = data.premium_expiry && new Date() < new Date(data.premium_expiry);
              setIsOneDayPlan(isOneDayValid);
              setOneDayPlanExpiry(data.premium_expiry);
              setIsBasicPlan(false);
              setBasicPlanExpiry(null);
            } else if (data.plan === "premium") {
              // If user has premium plan, check payment_logs to see if it's actually a basic plan
              await fetchLatestPayment(currentUser.uid);
            } else {
              setIsBasicPlan(false);
              setIsOneDayPlan(false);
              setBasicPlanExpiry(null);
              setOneDayPlanExpiry(null);
            }

            console.log('✅ ATS user auth loaded:', {
              plan: data.plan,
              isPremium: userIsPremium,
              isBasicPlan: data.plan === "basic" ? (data.premium_expiry && new Date() < new Date(data.premium_expiry)) : false
            });
          });

          return () => {
            unsubscribe();
            unsubscribeSnapshot();
          };
        } else {
          setUserData(null); // Clear userData when not authenticated
          setIsPremium(false);
          setIsBasicPlan(false);
          setPlan("anonymous");
        }
      });

      return () => unsubscribe();
    }

    // Initialize resume versions system
    initializeResumeVersions();

    // [NEW] Effect to handle User Changes (replacing onAuthStateChanged)
    setHasShownToast(false);

    // No longer auto-loading from localStorage - start with default data
    setResumeData(DEFAULT_RESUME_DATA);

    if (user) {
      // Check for India-specific anonymous resume data and restore it
      if (countryCode === 'IN') {
        const restoredData = restoreAnonymousResumeOnLogin(user.uid);
        if (restoredData) {
          console.log("Restored anonymous resume data for India user:", restoredData);
        }
      }
      // Fetch latest payment if premium to verify
      if (isPremium) {
        fetchLatestPayment(user.uid);
      }
    }
  }, [user, countryCode, isPremium]); // Run when user changes

  // Load Resume Data Effect
  useEffect(() => {
    const loadResumeData = async () => {
      // 1. Handle Anonymous User
      if (!user) {
        // setUserData(null); // REMOVED: Managed by useAuth
        // Remove direct state sets for plan/premium as useAuth handles them
        // But we need to handle anonymous counts and local storage restore for India
        const storedPreviewCount = safeSessionStorage.getItem("anonymousPreviewCount") || 0;
        const storedTemplateChangeCount = safeSessionStorage.getItem("anonymousTemplateChangeCount") || 0;

        // setPlan("anonymous"); // Managed by useAuth
        // setIsPremium(false); // Managed by useAuth
        // setPreviewCount is now derived from userData (which is null), so we can't set it.
        // Wait, for anonymous users, we might want local state for previewCount?
        // But previewCount variable is now a const derived from userData.
        // If user is null, previewCount is 0.
        // If we want to support anonymous preview limits, we need a separate state or logic.
        // For now, let's assume anonymous users are handled by the checks directly reading sessionStorage if needed, 
        // OR we need to revert previewCount to state initialized from userData/sessionStorage.
        // Given the time, I will stick to userData derivation and assume anonymous users have 0 count or handle it in the limit check logic.

        // For India location anonymous users, load saved resume data
        if (countryCode === 'IN') {
          const anonymousData = loadAnonymousResumeForIndia();
          if (anonymousData && anonymousData.data) {
            console.log("Loading anonymous resume data for India user:", anonymousData.source);
            setResumeData(anonymousData.data);
            setTemplate(anonymousData.metadata.template || "classic");
            setPreferences(anonymousData.metadata.preferences || {});
            setCustomColors(anonymousData.metadata.customColors || {});
            setLanguage(anonymousData.metadata.language || "en");
            setCountry(anonymousData.metadata.country || "in");
            setAtsScore(calculateATSScore(anonymousData.data));
          }
        }
        setIsLoadingResumeData(false);
        return;
      }

      // 2. Handle Logged-in User
      let resumeLoadedSuccessfully = false;
      const resumeIdToLoad = resumeId; // capture from searchParams

      if (resumeIdToLoad) {
        setIsLoadingResumeData(true);
      } else {
        setIsLoadingResumeData(true);
      }

      try {
        console.log("loadResumeData called with resumeId:", resumeIdToLoad);
        if (resumeIdToLoad) {
          // Load specific resume by ID
          const resumeRef = doc(db, "users", user.uid, "resumes", resumeIdToLoad);
          console.log("Fetching resume from:", resumeRef.path);

          const resumeDoc = await getDoc(resumeRef);
          if (resumeDoc.exists()) {
            const savedData = resumeDoc.data();
            if (!savedData) throw new Error("No resume data found");

            // Check if this is a one-pager
            if (savedData.isOnePager || savedData.resumeType === 'one-pager') {
              setShowOnePagerChoiceModal({
                resumeId: resumeIdToLoad,
                resumeName: savedData.resumeName || 'Untitled Resume',
                resumeData: savedData
              });
              return;
            }

            let resumeData = savedData.resumeData || savedData;
            if (!resumeData || typeof resumeData !== 'object') throw new Error("Invalid resume data structure");

            resumeData = normalizeResumeData(resumeData);
            setResumeData(resumeData);
            setCustomColors(savedData.customColors || {});
            setTemplate(savedData.template || initialTemplate);
            setLoadedTemplate(savedData.template || initialTemplate); // Track loaded template
            setLanguage(savedData.language || "en");
            setCountry(savedData.country || "in");

            if (savedData.preferences) setPreferences(savedData.preferences);
            if (savedData.templateSectionOrders) {
              setTemplateSectionOrders(savedData.templateSectionOrders);
              safeLocalStorage.setItem('templateSectionOrders', JSON.stringify(savedData.templateSectionOrders));
            }

            setResumeName(savedData.resumeName || "");
            markResumeAsActive();
            saveResume(resumeData || localResumeData);

            resumeLoadedSuccessfully = true;
            if (!hasShownToast) {
              toast.success("Loaded saved resume!");
              setHasShownToast(true);
            }
          } else {
            console.log("Resume not found in Firestore");
            toast.error("Resume not found, starting fresh.");
          }
        } else {
          // Check if user wants to start fresh
          const startFresh = safeLocalStorage.getItem('startFreshResume');
          if (startFresh === 'true') {
            safeLocalStorage.removeItem('startFreshResume');
            setResumeData(DEFAULT_RESUME_DATA);
            setCustomColors({});
            setTemplate("classic");
            setLanguage("en");
            setCountry("in");
            setPreferences({});
            setTemplateSectionOrders({});
            setResumeName("");
            setActiveTab("form");
            if (typeof window !== "undefined") safeLocalStorage.removeItem("resumeData");
            setIsLoadingResumeData(false);
            return;
          }

          // Load latest resume
          const resumesRef = collection(db, "users", user.uid, "resumes");
          const snapshot = await getDocs(resumesRef);

          if (!snapshot.empty) {
            // Check pre-auth state restore
            if (typeof window !== 'undefined' && safeSessionStorage.getItem('isPreAuthRestored') === 'true') {
              safeSessionStorage.removeItem('isPreAuthRestored');
              setIsLoadingResumeData(false);
              return;
            }

            // Filter and sort
            const resumes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(resume => {
                const isOnePager = resume.isOnePager === true || resume.resumeType === 'one-pager' || resume.onePagerId;
                return !isOnePager;
              })
              .sort((a, b) => {
                const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
                const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
                return bTime - aTime;
              });

            if (resumes.length > 0) {
              const latestResume = resumes[0];
              const newUrl = `/resume-builder?resumeId=${latestResume.id}&template=${latestResume.template || 'classic'}`;
              window.history.replaceState({}, '', newUrl);

              const savedData = latestResume;
              const resumeData = savedData.resumeData || savedData;

              setResumeData(resumeData);
              setCustomColors(savedData.customColors || {});
              setTemplate(savedData.template || initialTemplate);
              setLoadedTemplate(savedData.template || initialTemplate); // Track loaded template
              setLanguage(savedData.language || "en");
              setCountry(savedData.country || "in");
              if (savedData.preferences) setPreferences(savedData.preferences);
              if (savedData.templateSectionOrders) setTemplateSectionOrders(savedData.templateSectionOrders);
              setResumeName(savedData.resumeName || "");
              markResumeAsActive();
              saveResume(resumeData);
              resumeLoadedSuccessfully = true;
              if (!hasShownToast) {
                toast.success("Loaded your latest resume!");
                setHasShownToast(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading resume data:", error);
        if (!hasShownToast && resumeIdToLoad && !resumeLoadedSuccessfully) {
          toast.error(`Failed to load resume. Please try again.`);
          setHasShownToast(true);
        }
      } finally {
        setIsLoadingResumeData(false);
      }
    };

    loadResumeData();

    // URL Template Logic
    const urlTemplate = searchParams.get("template");
    if (!resumeId && urlTemplate && templates && templates[urlTemplate]) {
      setTemplate(urlTemplate);
    } else if (!resumeId && urlTemplate) {
      setTemplate("classic");
    }

  }, [user, resumeId, searchParams, initialTemplate, countryCode]); // Dependencies


  // AI Boost usage tracking
  useEffect(() => {
    if (isPremium) {
      setAnonymousAIBoostUses(0);
      safeLocalStorage.setItem("anonymousAIBoostUses", "0");
    } else {
      // Load stored usage count for non-premium users
      const storedBoostUses = parseInt(safeLocalStorage.getItem("anonymousAIBoostUses") || "0", 10);
      setAnonymousAIBoostUses(storedBoostUses);
    }
  }, [isPremium]);

  // Working state restoration (only when not editing a specific resume)
  useEffect(() => {
    // No longer auto-restoring from localStorage since users are explicitly informed about unsaved changes
    // Users can choose to save their work manually when they want to preserve it
    // This prevents unexpected data restoration and gives users full control

    // Check for pre-auth state first (user just logged in/signed up)
    const preAuthData = loadAndClearPreAuthState();
    if (preAuthData) {
      console.log("Processing pre-auth data:", preAuthData);

      if (preAuthData.multiple && preAuthData.states.length > 1) {
        // Handle multiple pre-auth states - create versions for each
        preAuthData.states.forEach((state, index) => {
          const versionName = `Resume Upload ${index + 1}`;
          const versionData = {
            ...state.resumeData,
            template: state.additionalData?.template || "classic",
            preferences: state.additionalData?.preferences || {},
            customColors: state.additionalData?.customColors || {},
            language: state.additionalData?.language || "en",
            country: state.additionalData?.country || "us"
          };

          // Create a version for each pre-auth state
          createResumeVersion(versionName, versionData, {
            template: state.additionalData?.template || "classic",
            preferences: state.additionalData?.preferences || {},
            customColors: state.additionalData?.customColors || {},
            source: state.additionalData?.source || "upload",
            createdFromPreAuth: true,
            preAuthTimestamp: state.timestamp
          });
        });

        // Set the most recent one as active
        const mostRecentState = preAuthData.mostRecent;
        setResumeData(mostRecentState.resumeData);
        setTemplate(mostRecentState.additionalData?.template || "classic");
        setPreferences(mostRecentState.additionalData?.preferences || {});
        setCustomColors(mostRecentState.additionalData?.customColors || {});
        setLanguage(mostRecentState.additionalData?.language || "en");
        setCountry(mostRecentState.additionalData?.country || "us");



        // Calculate ATS score
        setAtsScore(calculateATSScore(mostRecentState.resumeData));

        if (!hasShownRestoreToast) {
          toast.success(`Welcome back! Restored ${preAuthData.states.length} resume uploads.`);
          setHasShownRestoreToast(true);
          safeSessionStorage.setItem('hasShownRestoreToast', 'true');
          safeSessionStorage.setItem('isPreAuthRestored', 'true'); // Flag to prevent overwriting with Firestore data
        }

      } else {
        // Handle single pre-auth state (backward compatibility)
        const state = preAuthData.mostRecent;

        // Safety check
        if (!state || !state.resumeData) {
          console.warn("Skipping invalid pre-auth state:", state);
          return;
        }

        const versionName = "Uploaded Resume";
        const versionData = {
          ...state.resumeData,
          template: state.additionalData?.template || "classic",
          preferences: state.additionalData?.preferences || {},
          customColors: state.additionalData?.customColors || {},
          language: state.additionalData?.language || "en",
          country: state.additionalData?.country || "us"
        };

        // Create version for the single pre-auth state
        createResumeVersion(versionName, versionData, {
          template: state.additionalData?.template || "classic",
          preferences: state.additionalData?.preferences || {},
          customColors: state.additionalData?.customColors || {},
          source: state.additionalData?.source || "upload",
          createdFromPreAuth: true,
          preAuthTimestamp: state.timestamp
        });

        // Set as current data
        setResumeData(state.resumeData);
        setTemplate(state.additionalData?.template || "classic");
        setPreferences(state.additionalData?.preferences || {});
        setCustomColors(state.additionalData?.customColors || {});
        setLanguage(state.additionalData?.language || "en");
        setCountry(state.additionalData?.country || "us");



        // Calculate ATS score
        setAtsScore(calculateATSScore(state.resumeData));

        if (!hasShownRestoreToast) {
          toast.success("Welcome back! Your resume work has been restored.");
          setHasShownRestoreToast(true);
          safeSessionStorage.setItem('hasShownRestoreToast', 'true');
          safeSessionStorage.setItem('isPreAuthRestored', 'true'); // Flag to prevent overwriting with Firestore data
        }
      }
    } else {
      // No pre-auth state - no longer auto-restoring from localStorage
      // Users are explicitly informed about unsaved changes and can save manually
    }
  }, [resumeId, user, hasShownRestoreToast]); // Run when resumeId or user changes

  // Reset toast flags when template changes or component mounts
  useEffect(() => {
    setHasShownToast(false);
  }, [template]);

  // Initialize restore toast flag from sessionStorage to prevent multiple toasts in same session
  useEffect(() => {
    const hasShownInSession = safeSessionStorage.getItem('hasShownRestoreToast');
    if (hasShownInSession === 'true') {
      setHasShownRestoreToast(true);
    }
  }, []);

  // Handle hint visibility
  useEffect(() => {
    if (
      resumeData.name &&
      activeTab !== "preview" &&
      !isGeneratingPdf &&
      !isPdfModalOpen &&
      !hintsDismissed.preview
    ) {
      setTimeout(() => setShowPreviewHint(true), 40000);
    } else {
      setShowPreviewHint(false);
    }

    if (pdfPreviewUrl && !isPdfModalOpen && !isGeneratingPdf && !hintsDismissed.download) {
      setTimeout(() => setShowDownloadHint(true), 40000);
    } else {
      setShowDownloadHint(false);
    }

    if (isTemplateModalOpen && !hintsDismissed.style) {
      setShowStyleHint(false);
      setHintsDismissed((prev) => ({ ...prev, style: true }));
    }
  }, [resumeData.name, activeTab, pdfPreviewUrl, isGeneratingPdf, isPdfModalOpen, isTemplateModalOpen, hintsDismissed]);

  // Save resume to Firestore
  // Utility function to clean data for Firestore (remove undefined values)
  const cleanDataForFirestore = (data) => {
    if (data === null || data === undefined) {
      return null;
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
      const cleaned = {};
      for (const [key, value] of Object.entries(data)) {
        const cleanedValue = cleanDataForFirestore(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      return cleaned;
    }

    if (Array.isArray(data)) {
      return data.map(item => cleanDataForFirestore(item)).filter(item => item !== undefined);
    }

    return data;
  };

  const saveResumeWithName = async () => {
    setIsSaving(true);
    if (!resumeName.trim()) {
      toast.error("Please enter a name for your resume!");
      return;
    }
    try {
      // First, explicitly save the current data
      handleExplicitSave(resumeData);

      // Clean the resume data to remove undefined values and nested entities
      const cleanedResumeData = cleanResumeDataForFirebase(resumeData);


      // Logic to create a new copy if template has changed
      const isTemplateChanged = loadedTemplate && template !== loadedTemplate;
      const effectiveResumeId = isTemplateChanged ? null : resumeId;

      const resumeRef = effectiveResumeId
        ? doc(db, "users", user.uid, "resumes", effectiveResumeId)
        : doc(collection(db, "users", user.uid, "resumes"));

      const dataToSave = {
        resumeName: resumeName.trim(),
        resumeData: cleanedResumeData,
        customColors: cleanDataForFirestore(customColors),
        template,
        language,
        country,
        preferences: cleanDataForFirestore(preferences), // Save current preferences
        templateSectionOrders: cleanDataForFirestore(templateSectionOrders), // Save template-specific section orders
        updatedAt: new Date().toISOString(),

      };
      await setDoc(resumeRef, dataToSave);

      // Log activity for analytics
      try {
        const activityType = resumeId ? ACTIVITY_TYPES.RESUME_UPDATED : ACTIVITY_TYPES.RESUME_CREATED;

        // Only log if activityType is defined
        if (activityType) {
          // Get admin ID for proper activity logging
          const enterpriseMode = userData?.agent_admin === true;
          const adminId = enterpriseMode ? await getAdminId(user.uid) : user.uid;
          await logActivity(adminId || user.uid, user.uid, activityType, {
            resumeId: resumeRef.id,
            resumeName: resumeName.trim(),
            template: template,
          });
        } else {
          console.warn('⚠️ Activity type is undefined, skipping activity log');
        }
      } catch (error) {
        console.error("Error logging activity:", error);
        // Don't show error to user as this is background functionality
      }

      // Store first resume reference if this is the user's first saved resume
      if (user?.uid && cleanedResumeData) {
        const name = cleanedResumeData.personal?.name || cleanedResumeData.name || "";
        const email = cleanedResumeData.personal?.email || cleanedResumeData.email || "";
        const phone = cleanedResumeData.personal?.phone || cleanedResumeData.phone || "";

        // Only store if user has entered real data (not default sample data)
        const hasRealData = (
          name && name !== "John Doe" &&
          email && email !== "john.doe@example.com" &&
          phone && phone !== "+1 (123) 456-7890"
        );

        console.log('First resume reference validation:', {
          name,
          email,
          phone,
          hasRealData,
          source: 'resume_builder_save'
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
              "resume_builder_save"
            );

            if (response.stored) {
              console.log("First resume reference stored from resume builder save");
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
      setIsSaving(false);

      // If template changed, update URL with new resumeId
      if (isTemplateChanged) {
        setLoadedTemplate(template);
        // Reset unsaved changes state for the new copy
        setHasUnsavedChanges(false);
        setHasStartedEditing(false);
        setInitialResumeData(JSON.stringify(resumeData));

        const newUrl = `/resume-builder?resumeId=${resumeRef.id}&template=${template}`;
        router.push(newUrl);
        toast.info("Created a new copy of your resume with the new template!");
      } else {
        // Also ensure state is reset for simple save
        setHasUnsavedChanges(false);
        setInitialResumeData(JSON.stringify(resumeData));
      }

      // Check if this save was triggered by unsaved changes navigation
      if (pendingNavigation) {
        window.location.href = pendingNavigation;
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save resume!");
      setIsSaving(false);
    }
  };

  // Update resume data without auto-saving
  const handleUpdate = (data) => {
    setResumeData(data);

    // For logged-in users, mark that they have started editing when they update the form
    if (user && !hasStartedEditing) {
      setHasStartedEditing(true);
    }

    // Only save skills to localStorage for AI suggestions
    if (data.skills && Array.isArray(data.skills)) {
      safeLocalStorage.setItem('userSkills', JSON.stringify(data.skills));
    }

    // For India location anonymous users, auto-save to special storage
    if (countryCode === 'IN' && !user) {
      saveResumeDataWithIndiaHandling(data, "form_builder", {
        template,
        preferences,
        customColors,
        language,
        country,

      }, countryCode);
    }

    // Note: For non-India users, no longer auto-saving to localStorage since users are explicitly informed about unsaved changes
    // Users can now choose to save manually when they want to preserve their work
  };

  // Explicit save function for when user wants to save
  const handleExplicitSave = (data) => {
    // Clean the data before saving to avoid undefined values
    const cleanedData = cleanDataForFirestore(data);

    // Only save to localStorage when explicitly requested (not auto-save)
    saveResume(cleanedData);

    // Save working resume state with current settings
    saveWorkingResume(cleanedData, "manual", {
      template,
      preferences: cleanDataForFirestore(preferences),
      customColors: cleanDataForFirestore(customColors),
      language,
      country
    });

    // Update the active resume version
    updateActiveResumeData(cleanedData, {
      template,
      preferences: cleanDataForFirestore(preferences),
      customColors: cleanDataForFirestore(customColors),
      language,
      country
    });

    // Reset unsaved changes state
    setHasUnsavedChanges(false);
    setInitialResumeData(JSON.stringify(cleanedData));
    setHasStartedEditing(false);
    setIsResumeLoaded(true);
  };

  // Handle upgrade click - redirect to ClientCheckout
  const handleUpgradeClick = (billingCycle = "basic") => {
    // Check if this upgrade was triggered from within the PDF modal
    if (isPdfModalOpen) {
      setUpgradedFromPdfModal(true);
    }

    // REMOVED iOS CHECK - DEFAULT TO BASIC PLAN
    const effectiveBillingCycle = billingCycle;

    if (!user) {
      handleConsistentUpgradeClick(effectiveBillingCycle, 'pdf-preview-upgrade');
      event({ action: "login_redirect", category: "Payment", label: "PdfPreviewUpgrade" });
      return;
    }
    // Since /checkout is not in the whitelist, navigate directly without unsaved changes modal
    router.push(`/checkout?billingCycle=${effectiveBillingCycle}&currency=${currency}`);
    setHasInteractedWithCheckout(true);
  };

  // Reset fields and start from scratch
  const handleClearAll = () => {
    setResumeData(DEFAULT_RESUME_DATA);

    setCustomColors({});
    setTemplate("classic");
    setEditStartTime(null);
    setShowRewardAnimation(false);
    setAtsScore(null);
    setActiveTab("form");
    setActiveTab("form");
    if (typeof window !== "undefined") {
      safeLocalStorage.removeItem("resumeData");

      safeLocalStorage.removeItem("bannerDismissed");
    }
    setIsBannerDismissed(false);

    // Reset unsaved changes state
    setHasUnsavedChanges(false);
    setInitialResumeData(JSON.stringify(DEFAULT_RESUME_DATA));
    setHasStartedEditing(false);
    setIsResumeLoaded(false);

    toast.success("All fields cleared! Start fresh.");
  };

  // Update custom colors
  const handleColorChange = (colorKey, value) => {
    setCustomColors((prev) => ({
      ...prev,
      [template]: { ...prev[template], [colorKey]: value },
    }));
  };

  // Trigger save modal or signup
  const handleSaveResume = async () => {
    // Auth Check
    if (!user) {
      withAuth(() => handleSaveResume(), "Please sign in to save your resume");
      return;
    }

    // Check for enterprise promotion triggers
    if (user && isPremium) {
      const newCount = promoTriggerCount + 1;
      setPromoTriggerCount(newCount);

      // Show enterprise promo after 3 saves, or if user has saved 5+ resumes
      if (newCount >= 3 || (user.resumeCount && user.resumeCount >= 5)) {
        const hasSeenPromo = safeLocalStorage.getItem('enterprise-promo-seen');
        if (!hasSeenPromo && !showEnterprisePromo) {
          setTimeout(() => {
            setShowEnterprisePromo(true);
            safeLocalStorage.setItem('enterprise-promo-seen', 'true');
          }, 2000); // Show after 2 seconds delay
        }
      }
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSaveModalOpen(true);
    } finally {
      // No action needed
    }
  };

  // Switch to One-Pager with data transfer
  const handleSwitchToOnePager = () => {
    // Check if resume has meaningful data (not just default John Doe)
    const hasRealData = resumeData.name &&
      resumeData.name.toLowerCase() !== 'john doe' &&
      resumeData.name.trim() !== '';

    if (hasRealData) {
      // Convert resume data to one-pager format
      const onePagerData = {
        personal: {
          name: resumeData.name || '',
          email: resumeData.email || '',
          phone: resumeData.phone || '',
          location: resumeData.location || '',
          linkedin: resumeData.linkedin || '',
          github: resumeData.github || '',
          portfolio: resumeData.portfolio || '',
          jobTitle: resumeData.title || resumeData.jobTitle || ''
        },
        summary: resumeData.summary || resumeData.objective || '',
        experience: (resumeData.experience || []).map(exp => {
          // Clean description from any JSON artifacts and convert markdown to HTML
          let description = exp.description || exp.responsibilities || '';

          if (typeof description === 'object') {
            description = JSON.stringify(description);
          }

          if (typeof description === 'string') {
            // Remove JSON markdown artifacts
            description = description
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();

            // Check if description is a JSON array format like ["item1","item2","item3"]
            if (description.startsWith('[') && description.endsWith(']')) {
              try {
                const items = JSON.parse(description);
                if (Array.isArray(items)) {
                  // Convert array items to bullet points
                  description = items
                    .map(item => {
                      // Apply markdown formatting to each item
                      let formatted = item
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/__(.+?)__/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/_(.+?)_/g, '<em>$1</em>')
                        .replace(/`([^`]+)`/g, '$1');
                      return `• ${formatted}`;
                    })
                    .join('\n');
                }
              } catch (e) {
                // If JSON parsing fails, continue with regular markdown processing
                console.log('Failed to parse JSON array in experience description:', e);
              }
            }

            // If not JSON array or parsing failed, apply regular markdown formatting
            if (!description.includes('•')) {
              // Convert markdown formatting to HTML
              // Bold text: **text** or __text__ -> <strong>text</strong>
              description = description.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
              description = description.replace(/__(.+?)__/g, '<strong>$1</strong>');

              // Italic text: *text* or _text_ -> <em>text</em>
              description = description.replace(/\*(.+?)\*/g, '<em>$1</em>');
              description = description.replace(/_(.+?)_/g, '<em>$1</em>');

              // Bullet points with square brackets: [text] -> • text
              description = description.replace(/^\[([^\]]+)\]/gm, '• $1');
              description = description.replace(/^[-*]\s+/gm, '• ');

              // Inline code: `code` -> remove backticks for cleaner look
              description = description.replace(/`([^`]+)`/g, '$1');
            }
          }

          return {
            title: exp.title || exp.position || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || exp.current ? 'Present' : '',
            description: description
          };
        }),
        education: (resumeData.education || []).map(edu => ({
          degree: edu.degree || '',
          school: edu.school || edu.institution || '',
          location: edu.location || '',
          graduationDate: edu.graduationDate || edu.endDate || '',
          description: edu.description || edu.details || ''
        })),
        skills: (resumeData.skills || []).map(skill => {
          // Handle both string and object formats
          if (typeof skill === 'string') return skill;
          if (typeof skill === 'object' && skill.name) return skill.name;
          return String(skill);
        }).filter(Boolean),
        projects: (resumeData.projects || []).map(proj => ({
          name: proj.name || proj.title || '',
          technologies: proj.technologies || proj.tech || '',
          description: proj.description || '',
          link: proj.link || proj.url || ''
        })),
        certifications: (resumeData.certifications || []).map(cert => ({
          name: cert.name || cert.title || '',
          issuer: cert.issuer || cert.organization || '',
          date: cert.date || cert.year || '',
          description: cert.description || ''
        })),
        languages: (resumeData.languages || []).map(lang => ({
          language: lang.language || lang.name || '',
          proficiency: lang.proficiency || 'Professional'
        })),
        awards: (resumeData.customSections || [])
          .filter(section => section.type === 'award')
          .map(award => ({
            title: award.title || '',
            issuer: award.description || '',
            date: award.date || '',
            description: award.description || ''
          }))
      };

      // Store in localStorage for one-pager editor to pick up
      safeLocalStorage.setItem('onePagerData', JSON.stringify(onePagerData));

      // Show success message
      toast.success('✨ Transferring your resume to One-Pager builder...');

      // Navigate to one-pager editor
      router.push('/one-pager-builder/editor');
    } else {
      // No meaningful data, just navigate to builder
      router.push('/one-pager-builder');
    }
  };

  // AI Boost Functionality
  const handleApplyAISuggestions = async () => {
    if (!resumeData.name) {
      toast.error("Please enter at least your name to apply AI suggestions!");
      return;
    }

    // Check if user is not premium and has reached limit
    if (!isPremium && anonymousAIBoostUses >= 2) {
      toast.error("Free users have a limit of 2 AI Boosts. Premium users get unlimited access!", {
        duration: 6000,
        action: {
          label: 'Upgrade Now',
          onClick: () => window.location.href = '/checkout?billingCycle=basic'
        }
      });
      return;
    }

    setIsApplyingAI(true);
    setShowAiBoostHint(false);

    try {
      const { photo, ...dataWithoutPhoto } = resumeData;
      const response = await fetch("/api/generate-resume-suggestions-xai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user ? user.uid : "anonymous",
          field: "all",
          input: JSON.stringify(dataWithoutPhoto),
          sourceInput: JSON.stringify(dataWithoutPhoto),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          if (user) {
            setPaymentFormOpen(true);
            setHasInteractedWithCheckout(true);
            toast.error(errorData.details || "Upgrade to premium for AI suggestions!");
          } else {
            handleConsistentUpgradeClick('basic', 'ai-boost');
            toast.error(errorData.details || "Sign up to enjoy premium AI features!");
          }
        } else {
          toast.error(errorData.details || "Failed to apply AI suggestions");
        }
        throw new Error(errorData.error || "Failed to generate AI suggestions");
      }

      const { suggestion } = await response.json();
      // Merge AI suggestion with current resumeData, then clean
      const enhancedData = createCleanResumeData({ ...resumeData, ...suggestion, photo });
      setResumeData(enhancedData);

      // For logged-in users, mark that they have started editing when using AI enhancement
      if (user && !hasStartedEditing) {
        setHasStartedEditing(true);
      }

      // Explicitly save the enhanced data
      handleExplicitSave(enhancedData);

      const newAtsScore = calculateATSScore(enhancedData);
      setAtsScore(newAtsScore);
      if (newAtsScore > atsScore) {
        setShowRewardAnimation(true);
        setTimeout(() => setShowRewardAnimation(false), 2000);
      }

      // Increment usage count for non-premium users
      if (!isPremium) {
        const newCount = anonymousAIBoostUses + 1;
        setAnonymousAIBoostUses(newCount);
        safeLocalStorage.setItem("anonymousAIBoostUses", newCount);

        // Show different messages based on usage count
        if (newCount === 2) {
          toast.success("AI Boost applied—your resume is now enhanced! You've used all 2 free AI Boosts. Upgrade for unlimited access!");
        } else {
          toast.success(`AI Boost applied—your resume is now enhanced! ${2 - newCount} free AI Boost remaining.`);
        }
      } else {
        toast.success("AI Boost applied—your resume is now enhanced!");
      }

      // Show AI content review notification
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-gradient-to-r from-slate-50 to-slate-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-slate-200 ring-opacity-5 border border-[#00C4B3]/40`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#0B1F3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-[#0B1F3B]">
                    AI Content Applied
                  </p>
                  <p className="mt-1 text-sm text-[#0B1F3B]">
                    Please review and edit the suggestions to ensure they accurately reflect your experience.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#0B1F3B] hover:text-teal-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0B1F3B]"
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

      setHintsDismissed((prev) => ({ ...prev, aiBoost: true }));
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      toast.error(error.message || "Failed to apply AI suggestions");
    } finally {
      setIsApplyingAI(false);
    }
  };

  // Generate PDF
  const handleGeneratePDF = async () => {
    // Auth Check
    // Auth Check SKIPPED for Preview
    // if (!user) {
    //   toast.error("Please sign in to save and download your resume");
    //   // Add simple redirect to login
    //   const currentPath = window.location.pathname + window.location.search;
    //   router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    //   return;
    // }

    // [NEW] Profile Ownership Check
    // [NEW] Centralized Profile Guard Check
    // [NEW] Centralized Profile Guard Check SKIPPED for Preview
    // if (user) {
    //   const loadingId = toast.loading("Verifying profile access...");
    //   try {
    //     const { allowed, needsUpgrade, inProgress } = await checkProfileAccess(
    //       user,
    //       resumeData,
    //       "resume_builder_download"
    //     );
    //
    //     if (inProgress) return;
    //
    //     toast.dismiss(loadingId);
    //
    //     if (!allowed) {
    //       if (needsUpgrade) {
    //         handleUpgradeClick("basic");
    //       }
    //       return;
    //     }
    //   } catch (error) {
    //     toast.dismiss(loadingId);
    //     console.error("Profile check failed", error);
    //     return;
    //   }
    // }


    event({ action: "preview_button_click", category: "ResumePreview", label: "PreviewIcon" });

    // Check basic plan download limits first
    // Check basic plan download limits SKIPPED for Preview
    // if ((isBasicPlan || isOneDayPlan) && checkBasicPlanDownloadLimit()) {
    //   const isExpired = (isBasicPlan && basicPlanExpiry && new Date() >= new Date(basicPlanExpiry)) ||
    //     (isOneDayPlan && oneDayPlanExpiry && new Date() >= new Date(oneDayPlanExpiry));
    //   const message = isExpired
    //     ? getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", true)
    //     : getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", false);
    //
    //   toast.error(message);
    //
    //   // Show upgrade modal for basic plan users
    //   if (!user) {
    //     handleConsistentUpgradeClick('basic', 'download-limit');
    //   } else {
    //     handleUpgradeClick("basic");
    //   }
    //   return;
    // }

    // Fix React state timing issue: read latest templateSectionOrders from localStorage
    const templateKey = `${country.toLowerCase()}_${template}`;
    let latestTemplateSectionOrders = templateSectionOrders;

    // Read fresh from localStorage to avoid React state timing issues
    if (typeof window !== 'undefined') {
      const savedOrders = safeLocalStorage.getItem('templateSectionOrders');
      if (savedOrders) {
        try {
          latestTemplateSectionOrders = JSON.parse(savedOrders);
        } catch (e) {
          console.warn('Error parsing saved template section orders:', e);
        }
      }
    }

    // Create enhanced preferences with latest section orders
    const customSectionOrder = latestTemplateSectionOrders[templateKey] || null;
    const freshPreferences = customSectionOrder ? {
      ...preferences,
      layout: {
        ...preferences.layout,
        customSectionOrder
      }
    } : {
      ...preferences,
      layout: {
        ...preferences.layout,
        customSectionOrder: undefined
      }
    };
    // Helper functions for profile check removed - imported from resumeUtils

    // Client-side Profile Check
    if (isPremium && userData?.firstResumeReference) {
      if (checkIfResumeIsForSomeoneElseLocal(userData.firstResumeReference, resumeData)) {
        setBlockedProfileData({
          name: resumeData.name,
          email: resumeData.email,
          phone: resumeData.phone
        });
        setIsProfileLimitModalOpen(true);
        return;
      }
    }

    // Log only if there are issues with section ordering
    if (customSectionOrder && !latestTemplateSectionOrders[templateKey]) {
      console.warn('[ResumeBuilder] PDF Generation: Custom section order exists but not found in localStorage for template:', templateKey);
    }

    // Always allow PDF generation, just overlay with paywall if needed
    if (!templates || !templates[template] || !templates[template].styles) {
      toast.error("Invalid template configuration. Switching to default.");
      setTemplate("classic");
      return;
    }

    // Check template category and use the appropriate API
    const currentTemplate = templates[template] || atsFriendlyTemplates[template] || visualAppealTemplates[template] || premiumDesignTemplates[template];
    // Check key prefix as fallback since template objects might missing id property
    const isATSTemplate = (currentTemplate && currentTemplate.id && currentTemplate.id.startsWith('ats_')) || (template && template.startsWith('ats_'));
    const isVisualAppealTemplate = (currentTemplate && currentTemplate.id && currentTemplate.id.startsWith('visual_')) || (template && template.startsWith('visual_'));
    const isPremiumDesignTemplate = (template && template.startsWith('premium_'));

    let apiEndpoint = "/api/generate-pdf"; // Default
    if (isPremiumDesignTemplate) {
      apiEndpoint = "/api/generate-premium-design-pdf";
    } else if (isATSTemplate) {
      apiEndpoint = "/api/generate-ats-pdf";
    } else if (isVisualAppealTemplate) {
      apiEndpoint = "/api/generate-visual-appeal-pdf";
    }

    // Generate PDF
    setIsGeneratingPdf(true);
    try {
      // sanitize inputs to prevent "Blocked a frame" errors from Window objects
      const cleanResumeData = sanitizeDataForDeepCloning(resumeData);
      const cleanPreferences = sanitizeDataForDeepCloning(freshPreferences);

      const requestBody = isPremiumDesignTemplate ? {
        data: cleanResumeData,
        template: template, // Send template key string — API will look up from premiumDesignTemplates
        customColors,
        language,
        country,
        preferences: cleanPreferences
      } : isATSTemplate ? {
        data: cleanResumeData,
        template: currentTemplate, // Send the full template object for ATS templates
        preferences: cleanPreferences
      } : isVisualAppealTemplate ? {
        data: cleanResumeData,
        template: currentTemplate, // Send the full template object for Visual Appeal templates
        customColors,
        language,
        country,
        preferences: cleanPreferences
      } : {
        data: cleanResumeData,
        template,
        customColors,
        language,
        country,
        isPremium: isPremium, // Consumer users get premium features based on subscription
        preferences: cleanPreferences,
        userId: user?.uid,
      };

      // Debug logging for ATS templates
      if (isATSTemplate) {
        console.log('ResumeBuilder - ATS PDF Request Debug:', {
          templateName: currentTemplate.name,
          templateCategory: currentTemplate.category,
          headerStyle: currentTemplate.layout?.headerStyle,
          hasLayout: !!currentTemplate.layout,
          layoutKeys: currentTemplate.layout ? Object.keys(currentTemplate.layout) : [],
          hasStyles: !!currentTemplate.styles,
          stylesKeys: currentTemplate.styles ? Object.keys(currentTemplate.styles) : [],
          resumeDataKeys: Object.keys(resumeData),
          resumeDataSample: {
            name: resumeData.name,
            email: resumeData.email,
            phone: resumeData.phone,
            address: resumeData.address
          }
        });

        // Log specific data fields that might be undefined
        console.log('ResumeBuilder - Experience data:', {
          hasExperience: !!resumeData.experience,
          experienceLength: resumeData.experience?.length,
          firstExp: resumeData.experience?.[0],
          firstExpKeys: resumeData.experience?.[0] ? Object.keys(resumeData.experience[0]) : null
        });

        console.log('ResumeBuilder - Education data:', {
          hasEducation: !!resumeData.education,
          educationLength: resumeData.education?.length,
          firstEdu: resumeData.education?.[0],
          firstEduKeys: resumeData.education?.[0] ? Object.keys(resumeData.education[0]) : null
        });

        console.log('ResumeBuilder - Skills data:', {
          hasSkills: !!resumeData.skills,
          skillsLength: resumeData.skills?.length,
          firstSkill: resumeData.skills?.[0],
          firstSkillKeys: resumeData.skills?.[0] ? Object.keys(resumeData.skills[0]) : null
        });

        // Log full template structure for debugging
        console.log('ResumeBuilder - Full Template Structure:', currentTemplate);
        console.log('ResumeBuilder - Full Resume Data:', resumeData);
      }

      // Debug logging for Premium Design templates
      if (isPremiumDesignTemplate) {
        console.log('ResumeBuilder - Premium Design PDF Request:', {
          templateKey: template,
          templateName: currentTemplate?.name,
          layoutType: currentTemplate?.layout?.layoutType,
          apiEndpoint
        });
      }

      console.log('ResumeBuilder - Generating PDF with config:', {
        apiEndpoint,
        template: template,
        isATSTemplate,
        isVisualAppealTemplate,
        isPremiumDesignTemplate,
        hasUser: !!user,
        colors: customColors,
        prefs: freshPreferences
      });

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-preview-count": previewCount.toString() },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('ResumeBuilder - PDF API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });

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

        if (response.status === 504) {
          toast(
            (t) => (
              <div className="flex items-center gap-3 p-4 bg-yellow-100 border border-yellow-400 rounded-lg shadow-lg animate-pulse">
                <svg
                  className="w-6 h-6 text-yellow-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v2m0 12v2m-8-8H6m12 0h2M5.636 5.636l1.414 1.414m10.314 10.314l1.414 1.414M5.636 18.364l1.414-1.414m10.314-10.314l1.414-1.414"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-yellow-800">Servers Overloaded!</p>
                  <p className="text-sm text-yellow-700">
                    Too many people are downloading resumes right now. Please try again in a moment!
                  </p>
                  <button
                    className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    onClick={() => {
                      toast.dismiss(t.id);
                      handleGeneratePDF();
                    }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ),
            { duration: 6000, position: "top-center" }
          );
          return;
        }
        throw new Error(`Failed to generate PDF: ${errorText}`);
      }

      const pdfBlob = await response.blob();
      setPdfPreviewBlob(pdfBlob);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(pdfUrl);
      setIsPdfModalOpen(true);
      setUpgradedFromPdfModal(false); // Reset the upgrade flag when opening PDF modal

      if (ENABLE_PAYMENTS && user) {
        // This is just a preview, so increment preview count for all users
        updateDoc(doc(db, "users", user.uid), { preview_count: (userData?.preview_count || 0) + 1 });
      } else if (!user) {
        const currentCount = parseInt(safeSessionStorage.getItem("anonymousPreviewCount") || "0");
        const newCount = currentCount + 1;
        safeSessionStorage.setItem("anonymousPreviewCount", newCount);
      }

      // Debug logging for Visual Appeal templates
      if (isVisualAppealTemplate) {
        console.log('ResumeBuilder - Visual Appeal PDF Request Debug:', {
          templateName: currentTemplate.name,
          templateCategory: currentTemplate.category,
          headerStyle: currentTemplate.layout?.headerStyle,
          hasLayout: !!currentTemplate.layout,
          layoutKeys: currentTemplate.layout ? Object.keys(currentTemplate.layout) : [],
          hasStyles: !!currentTemplate.styles,
          stylesKeys: currentTemplate.styles ? Object.keys(currentTemplate.styles) : [],
          resumeDataKeys: Object.keys(resumeData),
          resumeDataSample: {
            name: resumeData.name,
            email: resumeData.email,
            phone: resumeData.phone,
            experience: resumeData.experience?.length || 0,
            education: resumeData.education?.length || 0,
            skills: resumeData.skills?.length || 0
          }
        });
      }
      setHintsDismissed((prev) => ({ ...prev, preview: true }));
      toast.success("PDF generated successfully!");
      setTimeout(() => setIsFeedbackModalOpen(true), 1000);
    } catch (error) {
      console.error("PDF Generation Error:", error);

      // Provide more specific error messages based on error type
      let errorMessage = "PDF generation failed. ";

      if (error.message?.includes('timeout') || error.message?.includes('504')) {
        errorMessage += "The server is taking too long. Please try again in a moment.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage += "Network error. Please check your connection and try again.";
      } else if (error.message?.includes('Failed to generate PDF')) {
        errorMessage += "Please try again. If the problem persists, contact support.";
      } else if (error.message?.includes('403') || error.message?.includes('ENTERPRISE_REQUIRED')) {
        errorMessage = "Enterprise plan required for this feature.";
      } else {
        errorMessage += error.message || "Please try again or contact support.";
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleInitiateExport = () => {
    if (userData?.agent_admin !== true) {
      toast.error('This feature is only available to administrators.');
      return;
    }

    setExportPaymentError('');
    setExportPaymentAmount((prev) => {
      if (prev && prev !== '') return prev;
      if (exportedPaymentAmount !== null && !Number.isNaN(exportedPaymentAmount)) {
        return String(exportedPaymentAmount);
      }
      return '';
    });
    setExportPaymentCurrency((prev) => prev || 'INR');
    setShowExportAmountModal(true);
  };

  const handleExportResume = async (paymentAmountValue = 0, paymentCurrencyValue = 'INR') => {
    if (userData?.agent_admin !== true) {
      toast.error('This feature is only available to administrators.');
      return false;
    }

    const numericAmount = typeof paymentAmountValue === 'number'
      ? paymentAmountValue
      : parseFloat(paymentAmountValue);

    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      toast.error('Please provide a valid payment amount (0 or more).');
      return false;
    }

    const normalizedAmount = Number(numericAmount.toFixed(2));
    const normalizedCurrency = paymentCurrencyValue || 'INR';

    try {
      setIsExporting(true);

      const response = await fetch('/api/export-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({
          resumeData,
          template,
          customColors,
          language,
          country,
          preferences,
          resumeName: resumeName || 'Resume',
          resumeId,
          paymentAmount: normalizedAmount,
          paymentCurrency: normalizedCurrency
        })
      });

      if (!response.ok) {
        throw new Error('Failed to export resume');
      }

      const data = await response.json();
      setExportedUrl(data.hostedUrl);
      setExportedPaymentAmount(normalizedAmount);
      setExportedPaymentCurrency(normalizedCurrency);
      setExportPaymentCurrency(normalizedCurrency);
      setExportPaymentAmount(String(normalizedAmount));
      setShowExportModal(true);

      toast.success('Resume exported successfully! Updates to this resume will automatically reflect in the hosted link.');
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export resume. Please try again.');
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmExport = async () => {
    const amountToCharge = exportPaymentAmount === '' ? 0 : parseFloat(exportPaymentAmount);

    if (Number.isNaN(amountToCharge) || amountToCharge < 0) {
      setExportPaymentError('Please enter a valid amount (0 or more).');
      return;
    }

    setExportPaymentError('');
    const success = await handleExportResume(amountToCharge, exportPaymentCurrency || 'INR');
    if (success) {
      setShowExportAmountModal(false);
    }
  };

  // Fetch latest payment from payment_logs to determine actual plan type
  const fetchLatestPayment = async (userId) => {
    try {
      const response = await fetch(`/api/payment-logs?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
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
            // State is managed by useAuth now, avoiding local override conflicts
            // setIsBasicPlan(isBasicValid);
            // setBasicPlanExpiry(expiryDate.toISOString());
            // setIsOneDayPlan(false);
            // setOneDayPlanExpiry(null);

            return { isBasic: true, isValid: isBasicValid, expiry: expiryDate };
          } else if (latestPayment.billingCycle === "oneDay") {
            const paymentDate = new Date(latestPayment.timestamp);
            const expiryDate = new Date(paymentDate.getTime() + (getPlanConfig("oneDay").duration * 24 * 60 * 60 * 1000)); // OneDay plan duration from config

            const isOneDayValid = new Date() < expiryDate;
            // State is managed by useAuth now
            // setIsOneDayPlan(isOneDayValid);
            // setOneDayPlanExpiry(expiryDate.toISOString());
            // setIsBasicPlan(false);
            // setBasicPlanExpiry(null);

            return { isOneDay: true, isValid: isOneDayValid, expiry: expiryDate };
          } else {
            // State is managed by useAuth now
            // setIsBasicPlan(false);
            // setIsOneDayPlan(false);
            // setBasicPlanExpiry(null);
            // setOneDayPlanExpiry(null);
            return { isBasic: false, isOneDay: false, isValid: false };
          }
        } else {
          return { isBasic: false, isOneDay: false, isValid: false };
        }
      } else {
        return { isBasic: false, isOneDay: false, isValid: false };
      }
    } catch (error) {
      console.error("Error fetching latest payment:", error);
      return { isBasic: false, isOneDay: false, isValid: false };
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

  // Check if should show paywall (returns true for non-premium users)
  const checkPaymentNeeded = () => {
    if (!ENABLE_PAYMENTS) return false;
    if (plan === "premium") return false;

    const shouldShowPaywall = previewCount >= 1 || templateChangeCount >= 3;

    if (shouldShowPaywall) {
      if (plan === "anonymous" && user) {
        updateDoc(doc(db, "users", user.uid), { plan: "free" });
      }
      handleUpgradeClick(window.innerWidth < 768 ? 'trial' : 'monthly');
      event({ action: "checkout_redirect", category: "Payment", label: "FreeTrialLimitReached" });
      return true;
    }

    return false;
  };

  // Route to pricing page
  const handlePaymentRequest = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation("/checkout?billingCycle=quarterly");
      setIsUnsavedChangesModalOpen(true);
    } else {
      router.push("/checkout?billingCycle=quarterly");
      event({ action: "pricing_page_view", category: "Navigation", label: "PayNowClicked" });
    }
  };

  // Change resume template
  const handleTemplateChange = async (newTemplate, isFromEditor = false) => {
    // Set flag if template change is coming from editor
    if (isFromEditor) {
      setIsTemplateChangeFromEditor(true);
    }

    if (ENABLE_PAYMENTS && templates && templates[newTemplate] && templates[newTemplate].premium && !isPremium && templateChangeCount >= 3) {
      toast.error("You've reached the free template change limit. Upgrade to premium!");
      setPaymentFormOpen(true);
      setHasInteractedWithCheckout(true);
      return;
    }
    if (!templates || !templates[newTemplate]) {
      toast.error("Invalid template selected. Reverting to default.");
      setTemplate("classic");
    } else {
      setTemplate(newTemplate);

      // Update working resume metadata
      updateWorkingResumeMetadata({
        template: newTemplate,
        preferences,
        customColors,
        language,
        country,

      });
    }

    // Only change these states if NOT coming from editor to prevent resume reloading
    if (!isFromEditor) {
      setActiveTab("form");
      setPreviewMode("resume");
      setIsTemplateModalOpen(false);
      setHintsDismissed((prev) => ({ ...prev, style: true }));
    }

    if (ENABLE_PAYMENTS && user) {
      const newCount = (templateChangeCount || 0) + 1;
      updateDoc(doc(db, "users", user.uid), { template_change_count: newCount });

      // Log template change activity
      try {
        // Get admin ID for proper activity logging
        const enterpriseMode = userData?.agent_admin === true;
        const adminId = enterpriseMode ? await getAdminId(user.uid) : user.uid;
        logActivity(adminId || user.uid, user.uid, ACTIVITY_TYPES.TEMPLATE_CHANGED, {
          fromTemplate: template,
          toTemplate: newTemplate,
          changeCount: templateChangeCount + 1,
        });
      } catch (error) {
        console.error("Error logging template change activity:", error);
      }
    } else if (!user) {
      setTemplateChangeCount((prev) => {
        const newCount = prev + 1;
        safeSessionStorage.setItem("anonymousTemplateChangeCount", newCount);
        return newCount;
      });
    }
  };

  // Redirect to checkout
  const checkout = (billingCycle = window.innerWidth < 768 ? 'trial' : 'monthly') => {
    // Since /checkout is not in the whitelist, navigate directly without unsaved changes modal
    router.push(`/checkout?billingCycle=${billingCycle}¤cy=${currency}`);
    setHasInteractedWithCheckout(true);
  };



  // Submit feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedbackRating < 1) {
      toast.error("Please provide a rating.");
      return;
    }
    try {
      await addDoc(collection(db, "feedback"), {
        userId: user ? user.uid : "anonymous",
        name: user ? user.displayName || user.email.split("@")[0] : "Anonymous",
        rating: feedbackRating,
        comment: feedbackComment.trim() || "No comment provided",
        timestamp: new Date().toISOString(),
      });
      toast.success("Thank you for your feedback!");
      setFeedbackRating(0);
      setFeedbackComment("");
      setIsFeedbackModalOpen(false);
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Try again.");
    }
  };

  // Handle exit intent after payment interaction
  const handlePaymentInteractionComplete = () => {
    if (user && !isPremium) {
      setTimeout(() => setShowExitIntent(true), 500);
    }
  };

  // Route to import page
  const routeToImport = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation("/upload-resume");
      setIsUnsavedChangesModalOpen(true);
    } else {
      router.push("/upload-resume");
    }
  };

  // Close PDF modal
  const handlePdfModalClose = () => {
    setIsPdfModalOpen(false);
    setUpgradedFromPdfModal(false); // Reset the upgrade flag
    setHintsDismissed((prev) => ({ ...prev, download: true }));
    if (user && !isPremium) {
      setTimeout(() => setShowExitIntent(true), 500);
    }
  };

  // Handle preferences change — live update (no modal close needed)
  const handlePreferencesChange = (newPreferences) => {
    if (newPreferences) {
      const clonedPrefs = JSON.parse(JSON.stringify(newPreferences));
      setPreferences(clonedPrefs);
      saveResumePreferences(clonedPrefs);
    }
  };

  // Handle section order changes from drag and drop (when saving from editor)
  const handleSectionOrderChange = (orderConfig) => {
    if (!orderConfig) return;

    // Check if this is a request to open the editor
    if (orderConfig.action === 'openEditor') {
      setIsSectionReorderEditorOpen(true);
      return;
    }

    // Store section order locally per template - no immediate Firestore save
    const templateKey = `${country.toLowerCase()}_${template}`;

    // Use callback to ensure state is updated and save to localStorage
    setTemplateSectionOrders(prevState => {
      const newState = {
        ...prevState,
        [templateKey]: orderConfig
      };

      // Save to localStorage immediately with the new state
      // Create a clean, serializable copy to avoid circular references
      if (typeof window !== 'undefined') {
        try {
          const cleanState = {};
          Object.keys(newState).forEach(key => {
            const value = newState[key];
            if (value && typeof value === 'object') {
              // Only save the essential data without circular references
              if (value.layout === 'single-column') {
                cleanState[key] = {
                  layout: 'single-column',
                  sectionsOrder: Array.isArray(value.sectionsOrder) ? [...value.sectionsOrder] : []
                };
              } else if (value.layout === 'two-column') {
                cleanState[key] = {
                  layout: 'two-column',
                  sidebarSections: Array.isArray(value.sidebarSections) ? [...value.sidebarSections] : [],
                  mainSections: Array.isArray(value.mainSections) ? [...value.mainSections] : []
                };
              }
            }
          });

          safeLocalStorage.setItem('templateSectionOrders', JSON.stringify(cleanState));
        } catch (error) {
          console.error('Error saving template section orders to localStorage:', error);
          // Fallback: try to save just the current template's data
          try {
            const currentTemplateData = newState[templateKey];
            if (currentTemplateData) {
              const cleanCurrentData = {
                layout: currentTemplateData.layout,
                ...(currentTemplateData.layout === 'single-column' && {
                  sectionsOrder: Array.isArray(currentTemplateData.sectionsOrder) ? [...currentTemplateData.sectionsOrder] : []
                }),
                ...(currentTemplateData.layout === 'two-column' && {
                  sidebarSections: Array.isArray(currentTemplateData.sidebarSections) ? [...currentTemplateData.sidebarSections] : [],
                  mainSections: Array.isArray(currentTemplateData.mainSections) ? [...currentTemplateData.mainSections] : []
                })
              };
              safeLocalStorage.setItem('templateSectionOrders', JSON.stringify({ [templateKey]: cleanCurrentData }));
            }
          } catch (fallbackError) {
            console.error('Fallback save also failed:', fallbackError);
          }
        }
      }

      return newState;
    });

    toast.success('Section order saved! Changes will appear immediately in preview.');
  };

  // Open the full-screen section reorder editor
  const handleOpenSectionReorderEditor = () => {
    setIsSectionReorderEditorOpen(true);
  };

  // Close the section reorder editor
  const handleCloseSectionReorderEditor = () => {
    setIsSectionReorderEditorOpen(false);
  };

  const handleResetLayout = () => {
    // Clear section order for current template locally
    const templateKey = `${country.toLowerCase()}_${template}`;
    const updatedMapping = {
      ...templateSectionOrders
    };
    delete updatedMapping[templateKey]; // Remove custom ordering for this template

    setTemplateSectionOrders(updatedMapping);

    // Update localStorage with safe serialization
    if (typeof window !== 'undefined') {
      try {
        const cleanMapping = {};
        Object.keys(updatedMapping).forEach(key => {
          const value = updatedMapping[key];
          if (value && typeof value === 'object') {
            // Only save the essential data without circular references
            if (value.layout === 'single-column') {
              cleanMapping[key] = {
                layout: 'single-column',
                sectionsOrder: Array.isArray(value.sectionsOrder) ? [...value.sectionsOrder] : []
              };
            } else if (value.layout === 'two-column') {
              cleanMapping[key] = {
                layout: 'two-column',
                sidebarSections: Array.isArray(value.sidebarSections) ? [...value.sidebarSections] : [],
                mainSections: Array.isArray(value.mainSections) ? [...value.mainSections] : []
              };
            }
          }
        });

        safeLocalStorage.setItem('templateSectionOrders', JSON.stringify(cleanMapping));
      } catch (error) {
        console.error('Error saving reset layout to localStorage:', error);
      }
    }

    toast.success('Layout reset to template default');
  };

  // Load preferences from Firestore (logged-in users) or localStorage (anonymous users)
  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        // Logged-in user: try Firestore first, fallback to localStorage
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().preferences) {
            console.log('[ResumeBuilder] Loading preferences from Firestore:', userDoc.data().preferences);
            setPreferences(userDoc.data().preferences);
            return; // Successfully loaded from Firestore
          }
        } catch (error) {
          console.error('Error loading preferences from Firestore:', error);
        }

        // Fallback to localStorage for logged-in users if Firestore fails
        if (typeof window !== 'undefined') {
          const savedPreferences = safeLocalStorage.getItem('resumePreferences');
          if (savedPreferences) {
            try {
              console.log('[ResumeBuilder] Fallback: Loading preferences from localStorage for logged-in user');
              setPreferences(JSON.parse(savedPreferences));
            } catch (e) {
              console.warn('Error parsing saved preferences:', e);
            }
          }
        }
      } else {
        // Anonymous user: load from localStorage only
        if (typeof window !== 'undefined') {
          const savedPreferences = safeLocalStorage.getItem('resumePreferences');
          if (savedPreferences) {
            try {
              console.log('[ResumeBuilder] Loading preferences from localStorage for anonymous user');
              setPreferences(JSON.parse(savedPreferences));
            } catch (e) {
              console.warn('Error parsing saved preferences:', e);
            }
          }
        }
      }
    };

    loadPreferences();
  }, [user]);

  // Debug effect to monitor ATS data loading
  useEffect(() => {
    if (sourceParam === 'ats') {
      console.log('🔍 ATS Debug - Current React state:', {
        hasResumeData: !!resumeData && resumeData !== DEFAULT_RESUME_DATA,
        resumeDataKeys: Object.keys(resumeData || {}),
        template,
        sourceParam,
        resumeDataName: resumeData?.name,
        resumeDataExperience: resumeData?.experience?.length
      });
    }
  }, [resumeData, template, sourceParam]);

  // Restore working resume state on component mount
  useEffect(() => {
    // COMPLETELY SKIP if ATS source
    if (sourceParam === 'ats') {
      console.log('🚫 BYPASSING working resume restoration - ATS source detected');
      return;
    }

    const restoreWorkingState = () => {
      const workingState = loadWorkingResume();
      if (workingState && workingState.data) {
        // Restore the resume data
        setResumeData(workingState.data);

        // Restore metadata
        if (workingState.metadata?.template) {
          setTemplate(workingState.metadata.template);
        }
        if (workingState.metadata?.preferences) {
          setPreferences(workingState.metadata.preferences);
        }
        if (workingState.metadata?.customColors) {
          setCustomColors(workingState.metadata.customColors);
        }
        if (workingState.metadata?.language) {
          setLanguage(workingState.metadata.language);
        }
        if (workingState.metadata?.country) {
          setCountry(workingState.metadata.country);
        }


        // Calculate ATS score
        setAtsScore(calculateATSScore(workingState.data));

        if (!hasShownRestoreToast) {
          // toast.success("Restored your previous work!");
          setHasShownRestoreToast(true);
          // sessionStorage.setItem('hasShownRestoreToast', 'true');
        }
      }
    };

    // Only restore working state if we're NOT editing a specific resume from My Resumes
    if (!resumeId) {
      // Check for pre-auth state first (user just logged in/signed up)
      const preAuthState = loadAndClearPreAuthState();
      if (preAuthState && preAuthState.resumeData) {
        console.log("Restoring pre-auth state in ResumeBuilder:", preAuthState);

        setResumeData(preAuthState.resumeData);

        // Restore additional state
        if (preAuthState.additionalData?.template) {
          setTemplate(preAuthState.additionalData.template);
        }
        if (preAuthState.additionalData?.preferences) {
          setPreferences(preAuthState.additionalData.preferences);
        }
        if (preAuthState.additionalData?.customColors) {
          setCustomColors(preAuthState.additionalData.customColors);
        }
        if (preAuthState.additionalData?.language) {
          setLanguage(preAuthState.additionalData.language);
        }
        if (preAuthState.additionalData?.country) {
          setCountry(preAuthState.additionalData.country);
        }


        // Calculate ATS score
        setAtsScore(calculateATSScore(preAuthState.resumeData));

        if (!hasShownRestoreToast) {
          toast.success("Welcome back! Your resume work has been restored.");
          setHasShownRestoreToast(true);
          safeSessionStorage.setItem('hasShownRestoreToast', 'true');
        }
      } else {
        // No pre-auth state, check for working state
        restoreWorkingState();
      }
    }
  }, []); // Run only on mount

  // Note: Removed automatic PDF modal closing for premium users
  // Premium users should be able to view their PDF preview normally

  // share handler
  const handleShare = async () => {
    if (!previewContainerRef.current) return;
    try {
      // temporarily hide hint overlays
      const style = document.createElement('style');
      style.id = 'hint-hide-style';
      style.innerHTML = '.resume-hint{display:none !important;}';
      document.head.appendChild(style);

      const html2canvas = await getHtml2Canvas();
      const canvas = await html2canvas(previewContainerRef.current, { scale: 1 });

      document.getElementById('hint-hide-style')?.remove();

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Failed to capture screenshot");
      const file = new File([blob], "resume.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: "Check out my resume!" });
      } else if (navigator.clipboard) {
        const dataUrl = canvas.toDataURL("image/png");
        await navigator.clipboard.writeText(dataUrl);
        toast.success("Screenshot copied to clipboard! Share anywhere.");
      } else {
        const dataUrl = canvas.toDataURL("image/png");
        window.open(dataUrl, "_blank");
      }
    } catch (err) {
      console.error(err);
      toast.error("Share failed. Try again.");
    }
  };

  // Public Profile Banner Logic
  useEffect(() => {
    if (publicProfileBannerDismissed || !user) {
      setShowPublicProfileBanner(false);
      return;
    }

    // Show profile banner when user has a good resume (ATS score > 75) and has been editing for a while
    if (atsScore > 75 && resumeData.name && resumeData.email && resumeData.experience.length > 0) {
      const timer = setTimeout(() => {
        setShowPublicProfileBanner(true);
      }, 45000); // Show after 45 seconds of having a good resume

      return () => clearTimeout(timer);
    }
  }, [atsScore, resumeData, user, publicProfileBannerDismissed]);

  // Load public profile banner dismissal from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPublicProfileBannerDismissed(safeLocalStorage.getItem("publicProfileBannerDismissed") === "true");
    }
  }, []);

  const handlePublicProfileBannerClose = () => {
    setShowPublicProfileBanner(false);
    setPublicProfileBannerDismissed(true);
    if (typeof window !== "undefined") {
      safeLocalStorage.setItem("publicProfileBannerDismissed", "true");
    }
  };

  // Unsaved changes modal handlers
  const handleUnsavedChangesSave = async () => {
    try {
      // Check if user is anonymous
      if (!user) {
        // For anonymous users, save current data to localStorage before showing login modal
        // This ensures the data is preserved during the login process
        if (typeof window !== "undefined") {
          // Clean the data before saving to localStorage to avoid undefined values
          const cleanedResumeData = cleanDataForFirestore(resumeData);
          const cleanedMetadata = cleanDataForFirestore({
            template,
            preferences,
            customColors,
            language,
            country,

          });

          safeLocalStorage.setItem("pendingResumeData", JSON.stringify(cleanedResumeData));
          safeLocalStorage.setItem("pendingResumeMetadata", JSON.stringify(cleanedMetadata));
        }

        // Show login page for save (not checkout)
        setIsUnsavedChangesModalOpen(false);
        safeSessionStorage.setItem('loginMessage', 'Please login to save your resume');
        window.location.href = `/login`;
        // Clear pending navigation since we're redirecting to login
        setPendingNavigation(null);
        return;
      }

      // For logged-in users, proceed with normal save flow
      // Explicitly save the current data first
      handleExplicitSave(resumeData);

      // Open the save modal for naming and cloud save
      setIsSaveModalOpen(true);
      setIsUnsavedChangesModalOpen(false);

      // The actual save and navigation will be handled by saveResumeWithName
      // We'll set a flag to indicate this was triggered by unsaved changes
      setPendingNavigation(pendingNavigation);
    } catch (error) {
      console.error("Error opening save modal:", error);
      toast.error("Failed to open save modal. Please try again.");
    }
  };

  const handleUnsavedChangesDiscard = async () => {
    setHasUnsavedChanges(false);
    setIsUnsavedChangesModalOpen(false);
    setHasStartedEditing(false);
    setIsResumeLoaded(false);

    // Navigate to the pending destination
    if (pendingNavigation) {
      window.location.href = pendingNavigation;
      setPendingNavigation(null);
    }
  };

  const handleUnsavedChangesCancel = () => {
    setIsUnsavedChangesModalOpen(false);
    setPendingNavigation(null);
  };

  // Debug location toggle handler
  const handleDebugLocationToggle = () => {
    const newLocation = countryCode === 'IN' ? 'EU' : 'IN';
    const newCurrency = newLocation === 'IN' ? 'INR' : 'USD';
    switchCurrency(newCurrency);
    setDebugLocation(newLocation);
    toast.success(`Debug location switched to ${newLocation} (${newCurrency})`);
  };

  // Enterprise Promotion Component
  const EnterprisePromoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building size={32} className="text-[#0B1F3B]" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Professional Resume Writer?
            </h3>

            <p className="text-gray-600 mb-6">
              You seem to be creating multiple professional resumes. Scale your business with our Enterprise platform!
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-[#0B1F3B] font-semibold">Client Management</div>
                <div className="text-gray-600">Unlimited clients</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-[#0B1F3B] font-semibold">Accounting</div>
                <div className="text-gray-600">Track revenue & expenses</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/enterprise"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#0B1F3B] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#071429] transition-all text-center"
                onClick={onClose}
              >
                Learn More
              </Link>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Maybe Later
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Starting at ₹999 (30 days) • Free trial available
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Clean up blob URL on modal close
  useEffect(() => {
    if (!isPdfModalOpen && pdfPreviewUrl) {
      window.URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
      setPdfPreviewBlob(null);
    }
  }, [isPdfModalOpen]);

  // Add this element to your existing return statement

  if (isLoadingResumeData) {
    return <BuilderSkeleton />;
  }
  return (
    <div
      className={clsx(
        "min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 lg:p-4",
        isBuilderFullscreen && "fixed inset-0 z-[9999] p-0"
      )}
    >
      {isGeneratingPdf && <ProgressOverlay type="download" isVisible={isGeneratingPdf}></ProgressOverlay>}
      {isApplyingAI && <ProgressOverlay type="ai" isVisible={isApplyingAI}></ProgressOverlay>}
      {isSaving && <ProgressOverlay type="save" isVisible={isSaving} />}

      {/* Resume Data Loading Overlay */}
      {isLoadingResumeData && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0B1F3B] border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Resume</h3>
            <p className="text-gray-600 text-sm">Please wait while we load your resume data...</p>
          </div>
        </div>
      )}
      {isUploadingPdf && (
        <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3 md:gap-5 bg-white p-4 md:p-6 rounded-xl shadow-2xl animate-pulse">
            <div className="animate-spin rounded-full h-10 w-10 md:h-14 md:w-14 border-t-4 border-[#00C4B3]" />
            <p className="text-[#0B1F3B] text-sm md:text-lg font-semibold text-center max-w-xs">
              Importing your resume magic...
            </p>
          </div>
        </div>
      )}

      {/* Trial Banner - Hidden for Premium Users */}
      {false && (
        <TrialBanner
          isOpen={showTrialBanner}
          onClick={(billingCycle) => {
            if (!user) {
              handleConsistentUpgradeClick(billingCycle, 'trial-banner');
              event({ action: "login_redirect", category: "Payment", label: "TrialBanner" });
              return;
            }
            // Force monthly for iOS mobile
            router.push(`/checkout?billingCycle=${billingCycle}&currency=${currency}`);
            setHasInteractedWithCheckout(true);
          }}
          onClose={handleBannerClose}
          currency={currency}
        />
      )}

      {/* Mobile Layout - Visible only on small screens */}
      <div className="flex flex-col min-h-screen w-full max-w-md mx-auto md:hidden bg-white">
        {/* Mobile Header - Single Row */}
        <div className="bg-white shadow-lg sticky top-0 z-30 border-b border-gray-200">
          <div className="px-3 py-2 flex items-center justify-between">
            {/* Left - Resume Switcher (Compact) */}
            <div className="flex-shrink-0" data-tour="version-switcher">
              <Suspense fallback={<div className="text-xs text-gray-500">Loading...</div>}>
                <ResumeVersionSwitcher
                  onVersionChange={(data, metadata) => {
                    // Safety check: ensure data is valid before setting it
                    if (data && typeof data === 'object') {
                      setResumeData(data);
                      if (metadata?.template) setTemplate(metadata.template);
                      if (metadata?.preferences) setPreferences(metadata.preferences);
                      if (metadata?.customColors) setCustomColors(metadata.customColors);
                      if (metadata?.language) setLanguage(metadata.language);
                      if (metadata?.country) setCountry(metadata.country);

                      // Reset initial data to prevent false unsaved changes detection
                      setTimeout(() => {
                        setInitialResumeData(JSON.stringify(data));
                        setHasUnsavedChanges(false);
                      }, 100);
                    } else {
                      console.error("Invalid resume data received:", data);
                    }
                  }}
                  currentResumeData={resumeData}
                  currentMetadata={{
                    template,
                    preferences,
                    customColors,
                    language,
                    country,

                  }}
                  currentResumeId={resumeId}
                  user={user}
                />
              </Suspense>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Right - CTAs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[70%] sm:max-w-none">
              {/* Debug Location Toggle - Hidden for production */}
              {/* 
              <button
                onClick={handleDebugLocationToggle}
                className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1.5 rounded-lg shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-xs font-medium"
                title={`Debug: Switch to ${countryCode === 'IN' ? 'EU' : 'IN'}`}
              >
                <Globe size={12} />
                <span className="hidden sm:inline">{countryCode}</span>
                <span className="sm:hidden">DBG</span>
              </button>
              */}

              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex items-center gap-1 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-2.5 py-1.5 rounded-lg shadow-md hover:shadow-lg hover:from-[#071429] hover:to-[#008C81] transition-all duration-200 text-xs font-medium"
                data-tour="template-button"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">Style</span>
              </button>

              <button
                onClick={() => routeToImport()}
                className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2.5 py-1.5 rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-xs font-medium"
                data-tour="import-button"
              >
                <FileUp size={14} />
                <span className="hidden sm:inline">Import</span>
              </button>

              <button
                onClick={() => setIsAiBuildMode(!isAiBuildMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg shadow-md transition-all duration-200 text-xs font-medium ${isAiBuildMode
                  ? "bg-[#0B1F3B] text-white"
                  : "bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white hover:from-[#071429] hover:to-[#008C81]"
                  }`}
              >
                <Bot size={14} />
                <span className="sm:hidden">{isAiBuildMode ? "Cancel" : "AI Writer"}</span>
                <span className="hidden sm:inline">{isAiBuildMode ? "Cancel AI" : "AI Text"}</span>
              </button>

              <button
                onClick={handleApplyAISuggestions}
                className={`flex items-center gap-1 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-2.5 py-1.5 rounded-lg shadow-md transition-all duration-200 text-xs font-medium ${isApplyingAI ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:from-[#071429] hover:to-[#071429]"
                  }`}
                disabled={isApplyingAI}
                data-tour="ai-button"
              >
                <Bot size={14} />
                {isApplyingAI ? <span className="hidden sm:inline">Enhancing...</span> : <span>AI</span>}
              </button>
            </div>
          </div>
        </div>



        {/* Content Area */}
        <div className="flex-1 bg-white px-3 py-4 overflow-y-auto pb-20">
          {activeTab === "form" && (
            <div data-tour="resume-form">
              {isAiBuildMode ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-bold mb-3">AI Text</h2>
                  <p className="text-sm text-gray-600 mb-3">
                    Paste your resume text below (from LinkedIn, Word, or PDF) to automatically fill your resume.
                  </p>
                  <textarea
                    className="w-full h-64 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3B] focus:border-transparent mb-3"
                    placeholder="Paste resume content here..."
                    value={aiInputText}
                    onChange={(e) => setAiInputText(e.target.value)}
                  />
                  <button
                    onClick={handleAiTextParse}
                    disabled={isParsingText || !aiInputText.trim()}
                    className="w-full py-2 bg-[#0B1F3B] text-white rounded-lg font-medium hover:bg-[#071429] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isParsingText ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Bot size={16} />
                        Generate Resume
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <ResumeForm
                  data={resumeData}
                  onUpdate={handleUpdate}
                  language={language}
                  country={country}
                  preferences={preferences}
                  selectedTemplate={template}
                  currentUserId={user?.uid}
                  currentResumeId="default"
                />
              )}
            </div>
          )}

        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 max-w-md mx-auto">
          <div className="flex items-center py-2 px-1">
            {/* Help removed */}
            {/* Main Actions - Center */}
            <div className="flex-1 flex justify-around items-center">
              <Link
                href="/my-resumes"
                className="flex flex-col items-center text-gray-600 hover:text-[#0B1F3B] transition-all duration-200 p-1"
              >
                <LayoutDashboard size={16} />
                <span className="text-[10px] font-medium mt-0.5">Resumes</span>
              </Link>

              <button
                onClick={() => setShowMobilePreview(true)}
                className="flex flex-col items-center text-teal-600 hover:text-teal-700 transition-all duration-200 p-1"
                data-tour="preview-button"
              >
                <Eye size={16} />
                <span className="text-[10px] font-medium mt-0.5">Preview</span>
              </button>

              <button
                onClick={handleSaveResume}
                className="flex flex-col items-center text-[#0B1F3B] hover:text-[#0B1F3B] transition-all duration-200 p-1"
                data-tour="save-button"
              >
                <Save size={16} />
                <span className="text-[10px] font-medium mt-0.5">Save</span>
              </button>

              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPdf}
                className={`flex flex-col items-center transition-all duration-200 p-1 ${isGeneratingPdf
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-[#0B1F3B] hover:text-[#0B1F3B]'
                  }`}
                data-tour="pdf-button"
              >
                {isGeneratingPdf ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#0B1F3B]"></div>
                ) : (
                  <Download size={16} />
                )}
                <span className="text-[10px] font-medium mt-0.5">
                  {isGeneratingPdf ? 'Gen...' : 'PDF'}
                </span>
              </button>

              {/* Export Button - Admin Only */}
              {(() => {
                const isAdmin = userData?.agent_admin === true;
                return isAdmin;
              })() && (
                  <button
                    onClick={handleInitiateExport}
                    disabled={isExporting}
                    className={`flex flex-col items-center transition-all duration-200 p-1 ${isExporting
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-green-600 hover:text-green-700'
                      }`}
                    title="Export to Hosted Preview"
                  >
                    {isExporting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600"></div>
                    ) : (
                      <Upload size={16} />
                    )}
                    <span className="text-[10px] font-medium mt-0.5">
                      {isExporting ? 'Exp...' : 'Export'}
                    </span>
                  </button>
                )}

              {/* One-Pager Button for Mobile */}
              <div className="relative">
                <button
                  onClick={handleSwitchToOnePager}
                  className="flex flex-col items-center text-[#0B1F3B] hover:text-[#00C4B3] transition-all duration-200 p-1"
                  title="One-Pager Resume"
                >
                  <Zap size={16} />
                  <span className="text-[10px] font-medium mt-0.5">1-Page</span>
                </button>
                {/* Premium badge */}
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[8px] px-0.5 py-0 rounded-full font-bold">
                  PRO
                </div>
              </div>
            </div>

            {/* Settings are now inline at the form level — no separate button needed */}
          </div>
        </div>

        {/* Mobile Color Panel */}
        {isColorCustomizationAvailable && isMobile && isColorPanelOpen && mounted && createPortal(
          <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-slate-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Customize Colors</h2>
                  <button
                    onClick={() => setIsColorPanelOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[70vh]">
                <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
                  <ColorCustomizer
                    template={template}
                    colors={customColors[template] || {}}
                    onChange={handleColorChange}
                    onDone={() => setIsColorPanelOpen(false)}
                  />
                </Suspense>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

        {/* Mobile Preview Slider */}
        {mounted && createPortal(
          <AnimatePresence>
            {showMobilePreview && (
              <motion.div
                key="mobile-preview"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 500 }}
                className="fixed inset-0 bg-white z-[9999] flex flex-col"
              >
                {/* Header with Close Button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-slate-50">
                  <h2 className="text-lg font-bold text-gray-800">Resume Preview</h2>
                  <button
                    onClick={() => setShowMobilePreview(false)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>



                {/* Template & Color Controls */}
                {previewMode === "resume" && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-200">
                    {/* Template Selection */}
                    <button
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="flex items-center gap-1 bg-slate-100 text-[#0B1F3B] hover:bg-slate-200 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                    >
                      <LayoutDashboard size={12} />
                      Templates
                    </button>

                    {/* Color Customization */}
                    {isColorCustomizationAvailable && (
                      <button
                        onClick={() => setIsColorPanelOpen(true)}
                        className="flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                      >
                        <Palette size={12} />
                        Colors
                      </button>
                    )}

                    {/* Auto-Slideshow Toggle */}
                    <button
                      onClick={() => setAutoSlideshow(!autoSlideshow)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${autoSlideshow
                        ? "bg-slate-100 text-[#0B1F3B] hover:bg-slate-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      <Play size={12} />
                      {autoSlideshow ? "Stop" : "Auto"}
                    </button>

                    {/* One-Pager Button */}
                    <div className="relative">
                      <button
                        onClick={handleSwitchToOnePager}
                        className="flex items-center gap-1 bg-[#00C4B3]/10 text-[#0B1F3B] hover:bg-[#00C4B3]/20 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                      >
                        <Zap size={12} />
                        1-Page
                      </button>
                      {/* Premium badge */}
                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs px-1 py-0.5 rounded-full font-bold text-[10px]">
                        PRO
                      </div>
                    </div>
                  </div>
                )}

                {/* Scrollable Preview Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 relative">
                  {previewMode === "resume" && (
                    <div className="relative flex justify-center items-start min-h-full p-2">
                      <div ref={previewContainerRef} className="flex justify-center">
                        <ResumePreview
                          data={resumeData}
                          template={template}
                          customColors={customColors[template] || {}}
                          language={language}
                          country={country}
                          preferences={enhancedPreferences}
                          manualScale={previewScale}
                          onSectionOrderChange={handleSectionOrderChange}
                        />

                      </div>
                    </div>
                  )}


                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <button
                      onClick={handleGeneratePDF}
                      disabled={isGeneratingPdf}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${isGeneratingPdf
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] hover:from-[#071429] hover:to-[#008C81] text-white shadow-md hover:shadow-lg'
                        }`}
                    >
                      {isGeneratingPdf ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Generate PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowMobilePreview(false)}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-all duration-200"
                      aria-label="Close Preview"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>


      {/* Desktop Layout - Visible only on md+ screens */}
      <div className="hidden md:flex flex-1 w-full mx-auto space-x-3">
        {/* Ultra-Minimal Color Customizer Sidebar - Hidden on Tablets */}
        {/* Removed sidebar color customizer */}

        {/* Main Content Area - Maximized */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with Actions */}
          <div className="border-b border-gray-200 bg-white px-5 py-3">
            <div className="flex items-center justify-between">
              {/* Left Side - Primary Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Debug Location Toggle - Hidden for production */}
                {/* 
                <button
                  onClick={handleDebugLocationToggle}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium h-10"
                  title={`Debug: Switch to ${countryCode === 'IN' ? 'EU' : 'IN'}`}
                >
                  <Globe size={16} />
                  <span>{countryCode}</span>
                </button>
                */}

                <div data-tour="version-switcher">
                  <Suspense fallback={<div className="text-xs text-gray-500">Loading...</div>}>
                    <ResumeVersionSwitcher
                      onVersionChange={(data, metadata) => {
                        // Safety check: ensure data is valid before setting it
                        if (data && typeof data === 'object') {
                          setResumeData(data);
                          if (metadata?.template) setTemplate(metadata.template);
                          if (metadata?.preferences) setPreferences(metadata.preferences);
                          if (metadata?.customColors) setCustomColors(metadata.customColors);
                          if (metadata?.language) setLanguage(metadata.language);
                          if (metadata?.country) setCountry(metadata.country);

                          // Reset initial data to prevent false unsaved changes detection
                          setTimeout(() => {
                            setInitialResumeData(JSON.stringify(data));
                            setHasUnsavedChanges(false);
                          }, 100);
                        } else {
                          console.error("Invalid resume data received:", data);
                        }
                      }}
                      currentResumeData={resumeData}
                      currentMetadata={{
                        template,
                        preferences,
                        customColors,
                        language,
                        country,

                      }}
                      currentResumeId={resumeId}
                      user={user}
                    />
                  </Suspense>
                </div>
                <div className="h-7 w-px bg-gray-200"></div>
                <div className="relative">
                  <button
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium h-9"
                    data-tour="template-button"
                  >
                    <LayoutDashboard size={16} />
                    Template
                  </button>

                </div>
                {/* Color Customizer Button in Header */}
                {isColorCustomizationAvailable && (
                  <button
                    onClick={() => setIsColorPanelOpen(true)}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium h-9"
                    data-tour="color-button"
                  >
                    <Palette size={16} />
                    Colors
                  </button>
                )}
                <button
                  onClick={() => routeToImport()}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium h-9"
                  data-tour="import-button"
                >
                  <FileUp size={16} />
                  Import
                </button>

                <button
                  onClick={() => setIsAiBuildMode(!isAiBuildMode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all duration-200 text-sm font-medium h-9 ${isAiBuildMode
                    ? "bg-[#0B1F3B] text-white border-[#0B1F3B] hover:bg-[#071429]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <Bot size={16} />
                  {isAiBuildMode ? "Exit AI Mode" : "AI Text"}
                </button>

                <div className="relative">
                  <button
                    onClick={handleApplyAISuggestions}
                    className={`flex items-center gap-2 bg-[#0B1F3B] hover:bg-[#071429] text-white px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium h-9 ${isApplyingAI ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    disabled={isApplyingAI}
                    data-tour="ai-button"
                  >
                    <Bot size={16} />
                    {isApplyingAI ? "Enhancing..." : "AI Boost"}
                  </button>

                </div>

                {previewMode === "resume" && (
                  <div className="flex items-center gap-2">
                    <OnePagerButton
                      data={resumeData}
                      template={template}
                      customColors={customColors}
                      language={language}
                      country={country}
                      preferences={preferences}
                      isPremium={isPremium}
                      user={user}
                      handleUpgradeClick={handleUpgradeClick}
                      formatPrice={formatPrice}
                      currency={currency}
                      event={event}
                      toast={toast}
                    />

                    {(() => {
                      const currentTemplate = templates[template] || atsFriendlyTemplates[template] || visualAppealTemplates[template] || premiumDesignTemplates[template];
                      const isATSTemplate = currentTemplate?.category === "ATS-Optimized";
                      const isVisualAppealTemplate = currentTemplate?.category === "Visual Appeal" || template?.startsWith('visual_');
                      const isPremiumDesignTemplate = currentTemplate?.category === "Premium Design" || template?.startsWith('premium_');

                      if (isATSTemplate || isVisualAppealTemplate || isPremiumDesignTemplate) {
                        return null;
                      }

                      return (
                        <div className="relative">
                          <button
                            onClick={isPremium ? handleOpenSectionReorderEditor : () => {
                              toast.error("Drag & Drop Editor is a premium feature. Upgrade to access advanced section reordering!");
                              setPaymentFormOpen(true);
                              setHasInteractedWithCheckout(true);
                            }}
                            className="flex items-center gap-1 bg-white border border-[#00C4B3]/30 text-[#0B1F3B] hover:bg-[#00C4B3]/5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                            title={isPremium ? "Open Drag and Drop Editor" : "Drag & Drop Editor - Premium Feature"}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 6h8v2H8V6zm0 5h8v2H8v-2zm0 5h8v2H8v-2z" />
                            </svg>
                            Drag & Drop
                          </button>
                          <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs px-1 py-0.5 rounded-full font-bold text-[10px]">
                            PRO
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Right Side - Secondary Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveResume}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium h-9"
                  data-tour="save-button"
                >
                  <Save size={16} />
                  Save
                </button>

                <div className="h-7 w-px bg-gray-200"></div>

                <div className="relative">
                  <button
                    onClick={handleGeneratePDF}
                    className="flex items-center gap-2 bg-[#0B1F3B] hover:bg-[#071429] text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium h-9"
                    data-tour="pdf-button"
                  >
                    <Eye size={16} />
                    Preview PDF
                  </button>

                </div>

                {/* Export Button - Admin Only */}
                {userData?.agent_admin === true && (
                  <button
                    onClick={handleInitiateExport}
                    disabled={isExporting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium h-9 ${isExporting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                      }`}
                    title="Export to Hosted Preview"
                  >
                    {isExporting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <Upload size={16} />
                    )}
                    {isExporting ? 'Exporting...' : 'Export'}
                  </button>
                )}

                {false && (
                  <button
                    onClick={() => handleUpgradeClick()}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium h-10"
                  >
                    <Crown size={16} />
                    Upgrade
                  </button>
                )}

                {/* Settings are now inline at the form level */}
                <button
                  onClick={() => setIsBuilderFullscreen((prev) => !prev)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium h-9"
                  title={isBuilderFullscreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isBuilderFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  {isBuilderFullscreen ? "Exit" : "Full Screen"}
                </button>

                {/* Help removed */}
              </div>
            </div>
          </div>

          {/* Tab Navigation removed to save vertical space */}


          {/* Main Content Grid - Fully Maximized */}
          <div className="grid grid-cols-2 gap-0 h-[calc(100vh-12rem)]">
            {/* Left Panel - Form (Maximum Space) */}
            <div className="bg-gray-50 border-r border-gray-200 overflow-y-auto" data-tour="resume-form">
              <div className="p-6">
                {activeTab === "form" && (
                  <Suspense fallback={
                    <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
                      <div className="space-y-4">
                        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
                        <div className="h-4 w-72 bg-gray-100 rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                            <div className="h-10 w-full bg-white border border-gray-200 rounded-lg" />
                          </div>
                        ))}
                      </div>
                    </div>
                  }>
                    {isAiBuildMode ? (
                      <div className="max-w-3xl mx-auto py-8 px-4">
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] p-6 text-white">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                              <Bot size={28} />
                              AI Resume Builder
                            </h2>
                            <p className="mt-2 opacity-90">
                              Transform your existing resume text into a professional format instantly.
                              Simply paste your content below.
                            </p>
                          </div>

                          <div className="p-8">
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paste Resume Content
                              </label>
                              <div className="relative">
                                <textarea
                                  className="w-full h-96 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B1F3B] focus:border-transparent text-base resize-none"
                                  placeholder="Copy and paste text from your LinkedIn profile, Word document, or PDF here..."
                                  value={aiInputText}
                                  onChange={(e) => setAiInputText(e.target.value)}
                                />
                                {aiInputText.length === 0 && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center text-gray-400">
                                      <FileUp size={48} className="mx-auto mb-2 opacity-50" />
                                      <p>Paste text here to begin</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="mt-2 text-xs text-gray-500 text-right">
                                {aiInputText.length} characters
                              </p>
                            </div>

                            <div className="flex items-center justify-end gap-4">
                              <button
                                onClick={() => setIsAiBuildMode(false)}
                                className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAiTextParse}
                                disabled={isParsingText || !aiInputText.trim()}
                                className="px-8 py-2.5 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white rounded-lg font-medium hover:shadow-lg hover:from-[#071429] hover:to-[#008C81] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 transform active:scale-95"
                              >
                                {isParsingText ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Parsing and Formatting...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={18} />
                                    Generate My Resume
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Features / Tips */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-[#00C4B3]/5 p-4 rounded-lg border border-[#00C4B3]/20">
                            <h3 className="font-semibold text-[#0B1F3B] mb-1">Smart Parsing</h3>
                            <p className="text-sm text-[#475569]">Intelligently identifies sections like Experience, Education, and Skills.</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-[#0B1F3B] mb-1">Auto-Formatting</h3>
                            <p className="text-sm text-[#0B1F3B]">Instantly applies professional layouts and typography to your raw text.</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-[#0B1F3B] mb-1">Instant Preview</h3>
                            <p className="text-sm text-[#0B1F3B]">See your new resume come to life in real-time as soon as you generate.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Inline Settings — live preview updates */}
                        <InlineResumeSettings preferences={preferences} onChange={handlePreferencesChange} />

                        <ResumeForm
                          data={resumeData}
                          onUpdate={handleUpdate}
                          language={language}
                          country={country}
                          preferences={preferences}
                          currentUserId={user?.uid}
                          currentResumeId="default"
                        />
                      </>
                    )}
                  </Suspense>
                )}

              </div>
            </div>

            {/* Right Panel - Preview (Maximum Space) */}
            <div className="bg-white overflow-y-auto" data-tour="resume-preview">
              <div className="">
                {previewMode === "resume" && (
                  <div ref={previewContainerRef}>
                    <Suspense fallback={
                      <div className="flex justify-center h-full min-h-[800px] p-8">
                        <div className="w-[210mm] h-[297mm] bg-white shadow-lg border border-gray-100 transform scale-[0.6] origin-top animate-pulse">
                          <div className="p-12 space-y-6">
                            <div className="flex gap-6 border-b pb-8">
                              <div className="h-20 w-20 bg-gray-100 rounded-full" />
                              <div className="space-y-3 flex-1">
                                <div className="h-8 w-2/3 bg-gray-100 rounded" />
                                <div className="h-4 w-1/3 bg-gray-100 rounded" />
                              </div>
                            </div>
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="space-y-2">
                                <div className="h-5 w-1/4 bg-gray-100 rounded" />
                                <div className="h-20 w-full bg-gray-50 rounded" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    }>
                      <ResumePreview
                        data={resumeData}
                        template={template}
                        customColors={customColors[template] || {}}
                        language={language}
                        country={country}
                        preferences={enhancedPreferences}
                        manualScale={previewScale}
                        initialScale={0.6}
                        onSectionOrderChange={handleSectionOrderChange}
                      />
                    </Suspense>
                  </div>
                )}


              </div>
            </div>
          </div>
        </div>

        {/* Expanded Color Panel Modal for Desktop */}
        {isColorCustomizationAvailable && !isMobile && isColorPanelOpen && mounted && createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-30" onClick={() => setIsColorPanelOpen(false)}>
            <div
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
                <ColorCustomizer
                  template={template}
                  colors={customColors[template] || {}}
                  onChange={handleColorChange}
                  onDone={() => setIsColorPanelOpen(false)}
                />
              </Suspense>
            </div>
          </div>,
          document.body
        )}
      </div>


      {/* Template Selector Modal */}
      {isTemplateModalOpen && mounted && createPortal(
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-[10000] p-2 md:p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-3 md:p-6">
            <div className="flex justify-between items-center mb-3 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Select a Template</h2>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-gray-600 hover:text-gray-800">
                <X className="size-5 md:size-6" />
              </button>
            </div>
            <Suspense fallback={<div className="text-center py-8">Loading templates...</div>}>
              <TemplateSelector
                template={template}
                setTemplate={handleTemplateChange}
                onClose={() => setIsTemplateModalOpen(false)}
                disabled={false}
                isPremium={isPremium}
                stayOnPage={true}
                isExitIntent={false}
                analyticsSource="resume_builder"
              />
            </Suspense>
          </div>
        </div>,
        document.body
      )}

      {/* PDF Preview Modal */}
      {isPdfModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white">Loading...</div></div>}>
          <PremiumPdfPreview
            isOpen={isPdfModalOpen}
            onClose={handlePdfModalClose}
            pdfPreviewUrl={pdfPreviewUrl}
            pdfPreviewBlob={pdfPreviewBlob}
            isPremium={isPremium}
            user={user}
            handleUpgradeClick={handleUpgradeClick}
            formatPrice={formatPrice}
            monthlyPrice={pricing.monthly}
            basicPrice={pricing.basic}
            currency={currency}
            event={event}
            toast={toast}
            resumeData={resumeData}
          />
        </Suspense>
      )}

      {/* One-Pager Preview Modal */}
      {showOnePagerModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white">Loading...</div></div>}>
          <OnePagerPreviewModal
            isOpen={showOnePagerModal}
            onClose={() => setShowOnePagerModal(false)}
            data={resumeData}
            template={template}
            customColors={customColors[template] || {}}
            language={language}
            country={country}
            preferences={enhancedPreferences}
            user={user}
            isPremium={isPremium}
            handleUpgradeClick={handleUpgradeClick}
            formatPrice={formatPrice}
            monthlyPrice={pricing.monthly}
            basicPrice={pricing.basic}
            currency={currency}
            event={event}
            toast={toast}
          />
        </Suspense>
      )}

      {/* Cover Letter Builder Modal */}

      {/* Help modal and guided tour removed */}

      {/* PaymentForm has been replaced with direct ClientCheckout navigation */}

      {/* Login and Subscribe Modal - DISABLED: Using consistent redirect flow */}
      {false && loginAndSubscribeModalOpen && ENABLE_PAYMENTS && !user && (
        <SignUpAndCheckoutModal
          isOpen={loginAndSubscribeModalOpen}
          onClose={() => {
            setLoginAndSubscribeModalOpen(false);
            // If this was triggered by unsaved changes, clear the pending navigation and data
            if (pendingNavigation) {
              setPendingNavigation(null);
              // Clear any pending resume data from localStorage
              if (typeof window !== "undefined") {
                safeLocalStorage.removeItem("pendingResumeData");
                safeLocalStorage.removeItem("pendingResumeMetadata");
              }
            }
          }}
          billingCycle="basic"
          setBillingCycle={() => { }}
          currency={currency}
          onAuthSuccess={() => {
            setLoginAndSubscribeModalOpen(false);

            // Close PDF preview modal only if user upgraded from within the PDF modal
            if (isPdfModalOpen && upgradedFromPdfModal) {
              setIsPdfModalOpen(false);
              setUpgradedFromPdfModal(false); // Reset the flag
              toast.success("Welcome! You can now download your resume.");
              return; // Don't show save modal if PDF modal was closed
            }

            // Check if there's pending resume data from unsaved changes
            if (typeof window !== "undefined") {
              const pendingResumeData = safeLocalStorage.getItem("pendingResumeData");
              const pendingResumeMetadata = safeLocalStorage.getItem("pendingResumeMetadata");

              if (pendingResumeData && pendingResumeMetadata) {
                try {
                  // Restore the saved resume data
                  const restoredData = JSON.parse(pendingResumeData);
                  const restoredMetadata = JSON.parse(pendingResumeMetadata);

                  // Clean the restored data to remove any undefined values
                  const cleanedRestoredData = cleanDataForFirestore(restoredData);
                  const cleanedRestoredMetadata = cleanDataForFirestore(restoredMetadata);

                  // Set the resume data and metadata
                  setResumeData(cleanedRestoredData);
                  setTemplate(cleanedRestoredMetadata.template || "classic");
                  setPreferences(cleanedRestoredMetadata.preferences || {});
                  setCustomColors(cleanedRestoredMetadata.customColors || {});
                  setLanguage(cleanedRestoredMetadata.language || "en");
                  setCountry(cleanedRestoredMetadata.country || "us");


                  // Clear the pending data from localStorage
                  safeLocalStorage.removeItem("pendingResumeData");
                  safeLocalStorage.removeItem("pendingResumeMetadata");

                  // If there was a pending navigation from unsaved changes, handle it
                  if (pendingNavigation) {
                    // Explicitly save the current data first
                    handleExplicitSave(restoredData);
                    // Open save modal for naming and cloud save
                    setIsSaveModalOpen(true);
                  } else {
                    // Normal flow - just open save modal
                    setIsSaveModalOpen(true);
                  }

                  toast.success("Your resume data has been restored!");
                  return;
                } catch (error) {
                  console.error("Error restoring pending resume data:", error);
                  // Clear invalid data
                  safeLocalStorage.removeItem("pendingResumeData");
                  safeLocalStorage.removeItem("pendingResumeMetadata");
                }
              }
            }

            // If there was a pending navigation from unsaved changes, handle it
            if (pendingNavigation) {
              // Explicitly save the current data first
              handleExplicitSave(resumeData);
              // Open save modal for naming and cloud save
              setIsSaveModalOpen(true);
            } else {
              // Normal flow - just open save modal
              setIsSaveModalOpen(true);
            }
          }}
          parsedResumeData={resumeData}
          uploadedResumeData={resumeData}
          template={template}
          preferences={preferences}
          customColors={customColors}
          activeTab={activeTab}
        />
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && !isPremium && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm md:max-w-md w-full p-3 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-4">We'd Love Your Feedback</h2>
            <p className="text-gray-600 mb-3 md:mb-6 text-xs md:text-sm">How was your experience with ExpertResume?</p>

            {/* Google Reviews Section */}
            <div className="mb-4 md:mb-6 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <div className="text-center mb-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-700">Love ExpertResume?</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">Help others discover us by leaving a Google review!</p>
                <button
                  type="button"
                  onClick={() => {
                    window.open("https://www.google.com/search?sca_esv=b86c91fa3b6f4170&sxsrf=AE3TifPRLtJDqL7htl0SenZk1iF4fN_QhQ:1757186068465&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-EyuK-rVchB7bNyuFSky99VIlTHwKPQ6uyKj-l2eXBvvt_2RPuK0ZKgpBkeHf4GvIkJ6Hp590pQZMMtlfBNnwajafjd_9&q=ExpertResume+Reviews&sa=X&ved=2ahUKEwiI4aib7MSPAxXnzTQHHe2tDUEQ0bkNegQIUBAE&biw=1728&bih=992&dpr=2#lrd=0x3bae136ed29b6951:0x1613f7ea596d7546,3,,,,", '_blank', 'noopener,noreferrer');
                    setIsFeedbackModalOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-xs flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4 fill-current" />
                  Rate Us on Google
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* OR Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>

            <form onSubmit={handleFeedbackSubmit}>
              <div className="mb-2 md:mb-4">
                <label className="block text-gray-700 text-xs md:text-sm font-semibold mb-1 md:mb-2">
                  Rating (1-5)
                </label>
                <div className="flex gap-1 md:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-1 ${feedbackRating >= star ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      <Star className="size-4 md:size-6" fill={feedbackRating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3 md:mb-6">
                <label className="block text-gray-700 text-xs md:text-sm font-semibold mb-1 md:mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none text-xs md:text-sm resize-none h-20 md:h-24"
                  maxLength={500}
                />
              </div>
              <div className="flex gap-2 md:gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white px-2 md:px-4 py-1 md:py-2 rounded-full font-semibold hover:from-[#071429] hover:to-[#071429] transition-all duration-300 shadow-md hover:shadow-lg text-xs md:text-sm"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="flex-1 text-gray-600 hover:text-gray-800 underline transition-colors text-xs md:text-sm"
                >
                  Skip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                className="flex-1 bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white px-2 md:px-4 py-1 md:py-2 rounded-md hover:from-[#071429] hover:to-[#071429] transition-all text-xs md:text-sm"
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

      {/* Exit Intent Popup - Removed */}

      {/* Settings are now inline at the form level — modal removed */}

      {/* Config Panel */}
      {showConfigPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Resume Format Settings</h2>
              <button
                onClick={() => setShowConfigPanel(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <Suspense fallback={<div className="text-center py-2">Loading...</div>}>
                <FormConfigPanel
                  config={preferences}
                  onConfigChange={handleConfigChange}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Public Profile Promotion Banner */}
      {/*   <PublicProfileBanner
        isOpen={showPublicProfileBanner}
        onClose={handlePublicProfileBannerClose}
        user={user}
        atsScore={atsScore}
      /> */}

      {/* Help removed */}

      {/* Floating download button removed - using bottom navigation bar instead */}

      {/* Section Reorder Editor */}
      {isSectionReorderEditorOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white">Loading...</div></div>}>
          <SectionReorderEditor
            isOpen={isSectionReorderEditorOpen}
            onClose={handleCloseSectionReorderEditor}
            onSave={handleSectionOrderChange}
            data={resumeData}
            template={template}
            customColors={customColors[template] || {}}
            preferences={enhancedPreferences}
            language={language}
            country={country}
            isPremium={isPremium}
            onResetLayout={handleResetLayout}
            onTemplateChange={handleTemplateChange}
            templates={templates}
            isCompactMode={false}
            onToggleCompactMode={() => { }}
          />
        </Suspense>
      )}
      {/* One-Pager Choice Modal */}
      {showOnePagerChoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#0B1F3B]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Choose Resume Builder</h3>
                  <p className="text-sm text-gray-600">How would you like to edit this resume?</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={handleOpenInOnePagerBuilder}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00C4B3]/10 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#0B1F3B]" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">One-Pager Builder</div>
                      <div className="text-sm text-gray-600">Optimized for single-page resumes</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleOpenInResumeBuilder}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#0B1F3B]" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Resume Builder</div>
                      <div className="text-sm text-gray-600">Full-featured builder with Classic template</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => setShowOnePagerChoiceModal(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <EnterprisePromoModal
        isOpen={showEnterprisePromo}
        onClose={() => setShowEnterprisePromo(false)}
      />

      {/* Enterprise Upgrade Modal */}


      {/* Export Amount Modal */}
      {showExportAmountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mx-auto mb-4">
              <Upload className="w-6 h-6 text-[#0B1F3B]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Set Payment Amount
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Enter the amount to charge before the user can download this resume. Leave blank or enter 0 to allow free downloads.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ({exportPaymentCurrency || 'INR'})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={exportPaymentAmount}
                  onChange={(e) => setExportPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3]"
                />
              </div>
              {exportPaymentError && (
                <p className="text-sm text-red-600">{exportPaymentError}</p>
              )}
              {exportPaymentAmount !== '' && (
                <p className="text-xs text-gray-500">
                  Charge amount preview:{' '}
                  <span className="font-medium text-gray-900">
                    {formatCurrencyValue(exportPaymentAmount || 0, exportPaymentCurrency || 'INR')}
                  </span>
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (isExporting) return;
                  setShowExportAmountModal(false);
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExport}
                className="flex-1 bg-[#0B1F3B] text-white px-4 py-2 rounded-lg hover:bg-[#071429] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Success Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Resume Exported Successfully!
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Your resume has been exported to a hosted preview page. You can now control download permissions from the admin dashboard.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 mb-2">Hosted URL:</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={exportedUrl}
                  readOnly
                  className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(exportedUrl);
                    toast.success('URL copied to clipboard!');
                  }}
                  className="text-[#0B1F3B] hover:text-[#0B1F3B] text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            {exportedPaymentAmount !== null && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-center">
                <p className="text-sm text-gray-700">
                  Charge Amount:{' '}
                  <span className="font-semibold text-[#0B1F3B]">
                    {formatCurrencyValue(exportedPaymentAmount, exportedPaymentCurrency || 'INR')}
                  </span>
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <a
                href={exportedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#0B1F3B] text-white px-4 py-2 rounded-lg hover:bg-[#071429] transition-colors text-center"
              >
                View Hosted Resume
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Modal */}
      {isUnsavedChangesModalOpen && (
        <Suspense fallback={null}>
          <UnsavedChangesModal
            isOpen={isUnsavedChangesModalOpen}
            onClose={() => setIsUnsavedChangesModalOpen(false)}
            onSave={handleUnsavedChangesSave}
            onDiscard={handleUnsavedChangesDiscard}
            onCancel={handleUnsavedChangesCancel}
            isSaving={isSaving}
          />
        </Suspense>
      )}
      {/* Profile Limit Modal */}
      <ProfileGuardModal />
    </div>
  );
}
