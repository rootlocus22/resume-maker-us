"use client";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Save,
  HelpCircle,
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
  Trash2,
  Bot,
  EyeOff,
  Crown,
  Check,
} from "lucide-react";
import { jobSpecificTemplates } from "../lib/jobSpecificTemplate";
import { coverLetterTemplates } from "../lib/coverLetterTemplate";
import JobSpecificResumeForm from "./JobSpecificResumeForm";
import JobSpecificResumePreview from "./JobSpecificResumePreview";
import CoverLetterPreview from "./CoverLetterPreview";
import ColorCustomizer from "./ColorCustomizer";
import TemplateSelector from "./TemplateSelector";
import PaymentForm from "./PaymentForm";

import ProgressOverlay from "./ProgressOverlay";
import toast, { Toaster } from "react-hot-toast";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, collection, updateDoc, addDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { event } from "../lib/gtag";
import { motion, AnimatePresence } from "framer-motion";
import SignUpAndCheckoutModal from "./SignUpAndCheckoutModal";
import PdfPreviewModal from "./PdfPreviewModal";
import HelpModal from "./HelpModal";
import { cleanResumeDataForFirebase } from "../lib/utils";



const ENABLE_PAYMENTS = true;

// Utility to detect mobile iOS
function isMobileIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function JobSpecificResumeBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTemplate = searchParams.get("template") || "it_fresher";
  const resumeId = searchParams.get("resumeId");

  // State management
  const [resumeData, setResumeData] = useState(jobSpecificTemplates[initialTemplate]?.defaultData || {});
  const [template, setTemplate] = useState(initialTemplate);
  const [customColors, setCustomColors] = useState({});
  const [language, setLanguage] = useState("en");
  const [country, setCountry] = useState("in");
  const [coverLetterData, setCoverLetterData] = useState(() => {
    const savedDraft = typeof window !== "undefined" ? localStorage.getItem("coverLetterDraft") : null;
    const baseData = savedDraft ? JSON.parse(savedDraft) : coverLetterTemplates.classic.defaultData;
    return {
      ...baseData,
      name: resumeData.personal?.name || baseData.name,
      email: resumeData.personal?.email || baseData.email,
      phone: resumeData.personal?.phone || baseData.phone,
    };
  });
  const [coverLetterTemplate, setCoverLetterTemplate] = useState("classic");
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [previewMode, setPreviewMode] = useState("resume");
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("anonymous");
  const [isPremium, setIsPremium] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);
  const [templateChangeCount, setTemplateChangeCount] = useState(0);
  const [anonymousAIBoostUses, setAnonymousAIBoostUses] = useState(0);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [loginAndSubscribeModalOpen, setLoginAndSubscribeModalOpen] = useState(false);

  // Helper function for consistent upgrade flow
  const handleConsistentUpgradeClick = (billingCycle = 'basic', source = 'job-specific-builder') => {
    if (user) {
      router.push(`/checkout?billingCycle=${billingCycle}&currency=${currency}`);
    } else {
      // Store checkout intent and message in storage
      localStorage.setItem('checkoutIntent', JSON.stringify({ billingCycle, source }));
      sessionStorage.setItem('loginMessage', 'Please login to continue with your purchase');
      window.location.href = `/login`;
    }
  };
  const [hasShownToast, setHasShownToast] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [showPreviewHint, setShowPreviewHint] = useState(false);
  const [showDownloadHint, setShowDownloadHint] = useState(false);
  const [showStyleHint, setShowStyleHint] = useState(true);
  const [showAiBoostHint, setShowAiBoostHint] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
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
  const [collapsedSections, setCollapsedSections] = useState({});
  const [customFields, setCustomFields] = useState([]); // Ensure customFields is defined
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutBillingCycle, setCheckoutBillingCycle] = useState("monthly");
  const [currency, setCurrency] = useState("INR");
  const [jobResumeCount, setJobResumeCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showOnePagerChoiceModal, setShowOnePagerChoiceModal] = useState(null);

  // Load dismissed hints from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHints = localStorage.getItem("hintsDismissed");
      if (storedHints) {
        setHintsDismissed(JSON.parse(storedHints));
      } else {
        setHintsDismissed({ preview: false, download: false, style: false, aiBoost: false });
      }
      
      // Load job resume count
      const savedJobResumeCount = localStorage.getItem("jobResumeCount");
      const count = savedJobResumeCount ? parseInt(savedJobResumeCount) : 0;
      setJobResumeCount(count);
    }
  }, []);

  // Save dismissed hints to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hintsDismissed", JSON.stringify(hintsDismissed));
    }
  }, [hintsDismissed]);

  // Start tracking edit time
  useEffect(() => {
    if (!editStartTime && activeTab === "form") {
      setEditStartTime(Date.now());
    }
  }, [activeTab, editStartTime]);

  // Simple ATS score calculation
  const calculateATSScore = (data) => {
    let score = 0;
    if (data.personal?.name) score += 10;
    if (data.personal?.email) score += 10;
    if (data.personal?.phone) score += 10;
    if (data.summary && data.summary.length > 50) score += 20;
    if (data.experience?.length > 0) score += 20 * Math.min(data.experience.length, 3);
    if (data.education?.length > 0) score += 15;
    if (data.skills?.length > 3) score += 15;
    return Math.min(score, 100);
  };

  // Check ATS score and hints
  useEffect(() => {
    const newAtsScore = calculateATSScore(resumeData);
    setAtsScore(newAtsScore);

    if (
      newAtsScore >= 80 &&
      editStartTime &&
      Date.now() - editStartTime > 300000 &&
      !showRewardAnimation
    ) {
      setShowRewardAnimation(true);
      setTimeout(() => setShowRewardAnimation(false), 5000);
    }

    if (
      resumeData.personal?.name &&
      activeTab === "form" &&
      !isApplyingAI &&
      !isGeneratingPdf &&
      !isPdfModalOpen &&
      !hintsDismissed.aiBoost
    ) {
      setTimeout(() => setShowAiBoostHint(true), 60000);
    } else {
      setShowAiBoostHint(false);
    }

    if (
      resumeData.personal?.name &&
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
  }, [
    resumeData,
    editStartTime,
    showRewardAnimation,
    activeTab,
    isApplyingAI,
    isGeneratingPdf,
    isPdfModalOpen,
    hintsDismissed,
    pdfPreviewUrl,
    isTemplateModalOpen,
  ]);

  // Authentication and data loading
  useEffect(() => {
    let unsubscribeSnapshot = null;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setHasShownToast(false);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: currentUser.email || "anonymous",
            plan: "anonymous",
            premium_expiry: null,
            preview_count: 0,
            template_change_count: 0,
            name: currentUser.displayName || "",
            phone: "",
          });
        }
        unsubscribeSnapshot = onSnapshot(userRef, (docSnapshot) => {
          const data = docSnapshot.data();
          setPlan(data.plan || "anonymous");
          setIsPremium(
            data.plan === "premium" && (!data.premium_expiry || new Date() < new Date(data.premium_expiry))
          );
          setPreviewCount(data.preview_count || 0);
          setTemplateChangeCount(data.template_change_count || 0);
        });

        const loadResumeData = async () => {
          try {
            if (resumeId) {
              const resumeRef = doc(db, "users", currentUser.uid, "resumes", resumeId);
              const resumeDoc = await getDoc(resumeRef);
              if (resumeDoc.exists()) {
                const savedData = resumeDoc.data();
                
                // Check if this is a one-pager resume and show choice modal
                if (savedData.isOnePager || savedData.resumeType === 'one-pager') {
                  console.log("One-pager resume detected, showing choice modal...");
                  setShowOnePagerChoiceModal({
                    resumeId: resumeId,
                    resumeName: savedData.resumeName || 'Untitled Resume',
                    resumeData: savedData
                  });
                  return;
                }
                
                setResumeData(savedData.resumeData || jobSpecificTemplates[initialTemplate].defaultData);
                setCustomColors(savedData.customColors || {});
                setTemplate(savedData.template || initialTemplate);
                setLanguage(savedData.language || "en");
                setCountry(savedData.country || "in");
                // Get personal info from normalized data
                const resumeData = savedData.resumeData || {};
                const personalInfo = resumeData.personal || resumeData; // Handle both nested and flattened structures
                
                setCoverLetterData({
                  ...(savedData.coverLetter || coverLetterTemplates.classic.defaultData),
                  name: personalInfo.name || resumeData.name || "",
                  email: personalInfo.email || resumeData.email || "",
                  phone: personalInfo.phone || resumeData.phone || "",
                });
                setCoverLetterTemplate(savedData.coverLetterTemplate || "classic");
                setIncludeCoverLetter(!!savedData.coverLetter);
                setResumeName(savedData.resumeName || "");
                if (savedData.coverLetter) localStorage.removeItem("coverLetterDraft");
                if (!hasShownToast) {
                  toast.success(
                    "Loaded saved resume" + (savedData.coverLetter ? " and cover letter!" : "!")
                  );
                  setHasShownToast(true);
                }
              } else {
                toast.error("Resume not found, starting fresh.");
              }
            }
          } catch (error) {
            console.error("Error loading resume data:", error);
            if (!hasShownToast) {
              toast.error("Failed to load resume data from server!");
              setHasShownToast(true);
            }
          }
        };
        loadResumeData();
      } else {
        const storedPreviewCount = sessionStorage.getItem("anonymousPreviewCount") || 0;
        const storedTemplateChangeCount = sessionStorage.getItem("anonymousTemplateChangeCount") || 0;
        setPlan("anonymous");
        setIsPremium(false);
        setPreviewCount(parseInt(storedPreviewCount, 10));
        setTemplateChangeCount(parseInt(storedTemplateChangeCount, 10));
        setResumeData(jobSpecificTemplates[initialTemplate].defaultData);
        const localDraft = localStorage.getItem("coverLetterDraft");
        setCoverLetterData(
          localDraft ? JSON.parse(localDraft) : coverLetterTemplates.classic.defaultData
        );
      }

      const urlTemplate = searchParams.get("template");
      if (urlTemplate && jobSpecificTemplates[urlTemplate]) {
        setTemplate(urlTemplate);
      } else if (urlTemplate) {
        console.warn(`Invalid template ${urlTemplate}, defaulting to "it_fresher"`);
        setTemplate("it_fresher");
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [initialTemplate, resumeId, searchParams]);

  // Close PDF modal when user becomes premium
  useEffect(() => {
    if (isPdfModalOpen && isPremium && user) {
      // Small delay to ensure the premium status is properly updated
      const timer = setTimeout(() => {
        setIsPdfModalOpen(false);
        toast.success("Welcome to Premium! You can now download your resume.");
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isPdfModalOpen, isPremium, user]);

  // Sync cover letter personal info
  useEffect(() => {
    setCoverLetterData((prev) => ({
      ...prev,
      name: resumeData.personal?.name || prev.name,
      email: resumeData.personal?.email || prev.email,
      phone: resumeData.personal?.phone || prev.phone,
    }));
  }, [resumeData.personal?.name, resumeData.personal?.email, resumeData.personal?.phone]);

  // Reset tabs if cover letter is removed
  useEffect(() => {
    if (!includeCoverLetter && activeTab === "coverLetter") setActiveTab("form");
    if (!includeCoverLetter && previewMode !== "resume") setPreviewMode("resume");
  }, [includeCoverLetter]);

  // AI Boost usage tracking
  useEffect(() => {
    if (isPremium) {
      setAnonymousAIBoostUses(0);
      localStorage.setItem("anonymousAIBoostUses", "0");
    } else {
      // Load stored usage count for non-premium users
      const storedBoostUses = parseInt(localStorage.getItem("anonymousAIBoostUses") || "0", 10);
      setAnonymousAIBoostUses(storedBoostUses);
    }
  }, [isPremium]);

  // Handle PDF upload redirect
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }
    router.push("/upload-resume");
  };

  // Save resume to Firestore
  const saveResumeWithName = async () => {
    if (!resumeName.trim()) {
      toast.error("Please enter a name for your resume!");
      return;
    }
    try {
      const resumeRef = resumeId
        ? doc(db, "users", user.uid, "resumes", resumeId)
        : doc(collection(db, "users", user.uid, "resumes"));
      const dataToSave = {
        resumeName: resumeName.trim(),
        resumeData: cleanResumeDataForFirebase(resumeData),
        customColors,
        template,
        language,
        country,
        updatedAt: new Date().toISOString(),
        ...(includeCoverLetter && {
          coverLetter: cleanResumeDataForFirebase(coverLetterData),
          coverLetterTemplate,
        }),
      };
      await setDoc(resumeRef, dataToSave);
      localStorage.removeItem("coverLetterDraft");
      toast.success(`Resume "${resumeName}" saved successfully in My resumes section!`);
      setIsSaveModalOpen(false);
      // Removed the redirect to keep user in context
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save resume!");
    }
  };

  // Update resume data
  const handleUpdate = useCallback((section, value) => {
    setResumeData((prev) => {
      const updatedData = { ...prev, [section]: value };
      if (section === "personal") {
        setCoverLetterData((prevCover) => ({
          ...prevCover,
          name: value.name || prevCover.name,
          email: value.email || prevCover.email,
          phone: value.phone || prevCover.phone,
        }));
      }
      return updatedData;
    });
  }, []);

  // Array and custom field handlers
  const handleArrayUpdate = (section, index, field, value) => {
    setResumeData((prev) => {
      const updatedArray = [...(prev[section] || [])];
      updatedArray[index] = { ...updatedArray[index], [field]: value };
      return { ...prev, [section]: updatedArray };
    });
  };

  const addArrayItem = (section) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), {}],
    }));
  };

  const removeArrayItem = (section, index) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const addCustomField = () => {
    setCustomFields((prev) => [...prev, { name: "", value: "" }]);
  };

  const updateCustomField = (index, field, value) => {
    setCustomFields((prev) => {
      const updatedFields = [...prev];
      updatedFields[index] = { ...updatedFields[index], [field]: value };
      const customData = updatedFields.reduce((acc, curr) => {
        if (curr.name) acc[curr.name] = curr.value;
        return acc;
      }, {});
      setResumeData((prevData) => ({ ...prevData, ...customData }));
      return updatedFields;
    });
  };

  const removeCustomField = (index) => {
    setCustomFields((prev) => {
      const fieldName = prev[index].name;
      const updatedFields = prev.filter((_, i) => i !== index);
      setResumeData((prevData) => {
        const newData = { ...prevData };
        delete newData[fieldName];
        return newData;
      });
      return updatedFields;
    });
  };

  // Clear all fields
  const handleClearAll = () => {
    setResumeData(jobSpecificTemplates[template].defaultData);
    setCoverLetterData(coverLetterTemplates.classic.defaultData);
    setIncludeCoverLetter(false);
    setCustomColors({});
    setTemplate("it_fresher");
    setEditStartTime(null);
    setShowRewardAnimation(false);
    setAtsScore(null);
    setActiveTab("form");
    setCustomFields([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("coverLetterDraft");
    }
    toast.success("All fields cleared! Start fresh.");
  };

  // One-pager choice modal handlers
  const handleOpenInOnePagerBuilder = () => {
    if (showOnePagerChoiceModal) {
      router.push(`/one-pager-builder/editor?resumeId=${showOnePagerChoiceModal.resumeId}`);
      setShowOnePagerChoiceModal(null);
    }
  };

  const handleOpenInJobSpecificBuilder = () => {
    if (showOnePagerChoiceModal) {
      const { resumeData } = showOnePagerChoiceModal;
      
      // Normalize the one-pager data for job-specific resume builder
      let normalizedData = normalizeResumeData(resumeData);
      
      // Set template to classic for better compatibility
      setTemplate('classic');
      
      // Load the data into job-specific resume builder
      setResumeData(normalizedData);
      setCustomColors(resumeData.customColors || {});
      setLanguage(resumeData.language || "en");
      setCountry(resumeData.country || "in");
      setResumeName(resumeData.resumeName || "");
      
      toast.success("Resume loaded in Job-Specific Resume Builder with Classic template!");
      setShowOnePagerChoiceModal(null);
    }
  };

  // Color customization
  const handleColorChange = (colorKey, color) => {
    setCustomColors((prev) => ({
      ...prev,
      [template]: { ...prev[template], [colorKey]: color },
    }));
  };

  // Save resume
  const handleSaveResume = async () => {
    if (!user) {
      // Redirect to login instead of showing error for better UX
      sessionStorage.setItem('loginMessage', 'Please login to save your resume');
      window.location.href = `/login`;
      return;
    }
    setIsSaveModalOpen(true);
  };

  // AI Boost
  const handleApplyAISuggestions = async () => {
    if (!resumeData.personal?.name) {
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
      // Remove photo from payload
      const resumeDataNoPhoto = { ...resumeData };
      if (resumeDataNoPhoto.personal && 'photo' in resumeDataNoPhoto.personal) {
        const { photo, ...rest } = resumeDataNoPhoto.personal;
        resumeDataNoPhoto.personal = rest;
      }
      const response = await fetch("/api/generate-resume-suggestions-xai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user ? user.uid : "anonymous",
          field: "all",
          input: JSON.stringify(resumeDataNoPhoto),
          sourceInput: JSON.stringify(resumeDataNoPhoto),
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          if (user) {
            setPaymentFormOpen(true);
                         toast.error(
               "AI limit reached. Get unlimited AI suggestions starting ₹199 (7 days)!", 
               {
                 duration: 6000,
                 action: {
                   label: 'Upgrade Now',
                   onClick: () => window.location.href = '/checkout?billingCycle=basic'
                 }
               }
             );
          } else {
            handleConsistentUpgradeClick('basic', 'ai-boost');
                         toast.error(
               "Sign up to enjoy premium AI features starting ₹199 (7 days)!", 
               {
                 duration: 6000,
                 action: {
                   label: 'Sign Up',
                   onClick: () => window.location.href = '/signup'
                 }
               }
             );
          }
        }
        throw new Error("Failed to generate AI suggestions");
      }

      const { suggestion } = await response.json();
      // Preserve photo if it existed
      let newSuggestion = suggestion;
      if (resumeData.personal && resumeData.personal.photo) {
        newSuggestion = {
          ...suggestion,
          personal: {
            ...suggestion.personal,
            photo: resumeData.personal.photo,
          },
        };
      }
      setResumeData(newSuggestion);
      const newAtsScore = calculateATSScore(newSuggestion);
      setAtsScore(newAtsScore);
      if (newAtsScore > atsScore) {
        setShowRewardAnimation(true);
        setTimeout(() => setShowRewardAnimation(false), 2000);
      }
      // Increment usage count for non-premium users
      if (!isPremium) {
        const newCount = anonymousAIBoostUses + 1;
        setAnonymousAIBoostUses(newCount);
        localStorage.setItem("anonymousAIBoostUses", newCount);
        
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
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-gradient-to-r from-slate-50 to-slate-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-slate-200 ring-opacity-5 border border-slate-300`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="flex border-l border-slate-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-accent-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent"
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

  // PDF generation
  const handleGeneratePDF = async () => {
    event({ action: "preview_button_click", category: "ResumePreview", label: "PreviewIcon" });
    if (checkPaymentNeeded()) {
      setIsGeneratingPdf(false);
      return;
    }
    if (!jobSpecificTemplates[template]) {
      toast.error("Invalid template configuration. Switching to default.");
      setTemplate("it_fresher");
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const response = await fetch("/api/generate-job-specific-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-preview-count": previewCount.toString() },
        body: JSON.stringify({
          data: resumeData,
          template,
          customColors,
          language,
          country,
          isPremium,
          coverLetter: includeCoverLetter ? coverLetterData : null,
          coverLetterTemplate: includeCoverLetter ? coverLetterTemplate : null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
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
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(pdfUrl);
      setIsPdfModalOpen(true);

      if (ENABLE_PAYMENTS && user) {
        setPreviewCount((prev) => {
          const newCount = prev + 1;
          updateDoc(doc(db, "users", user.uid), { preview_count: newCount });
          return newCount;
        });
      } else if (!user) {
        setPreviewCount((prev) => {
          const newCount = prev + 1;
          sessionStorage.setItem("anonymousPreviewCount", newCount);
          return newCount;
        });
      }
      setHintsDismissed((prev) => ({ ...prev, preview: true }));
      
      // Increment job resume count for free users
      if (!isPremium) {
        const newJobResumeCount = jobResumeCount + 1;
        setJobResumeCount(newJobResumeCount);
        localStorage.setItem("jobResumeCount", newJobResumeCount.toString());
      }
      
      toast.success("PDF generated successfully!");
      setTimeout(() => setIsFeedbackModalOpen(true), 1000);
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Try again.");
    }
  };

  // PDF modal close
  const handlePdfModalClose = () => {
    setIsPdfModalOpen(false);
    setHintsDismissed((prev) => ({ ...prev, download: true }));
    if (user && !isPremium) {
      setTimeout(() => setShowExitIntent(true), 500);
    }
  };

  // Toggle section collapse
  const toggleSectionCollapse = (section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Sections configuration
  const sections = [
    {
      key: "personal",
      label: "Personal Information",
      isObject: true,
      fields: ["name", "email", "phone", "location", "dateOfBirth", "nationality"],
    },
    { key: "summary", label: "Summary", isText: true },
    { key: "skills", label: "Skills", isArray: true, singleField: true },
    { key: "projects", label: "Projects", isArray: true, fields: ["title", "description", "startDate", "endDate"] },
    {
      key: "experience",
      label: "Experience",
      isArray: true,
      fields: ["title", "company", "startDate", "endDate", "description"],
    },
    {
      key: "education",
      label: "Education",
      isArray: true,
      fields: ["degree", "institution", "startDate", "endDate", "grade"],
    },
    { key: "certifications", label: "Certifications", isArray: true, fields: ["title", "issuer", "date"] },
    { key: "languages", label: "Languages", isArray: true, singleField: true },
    { key: "achievements", label: "Achievements", isArray: true, singleField: true },
    { key: "references", label: "References", isArray: true, fields: ["name", "position", "company", "contact"] },
  ];

  // PDF Preview Modal logic
  const handleOpenPdfModal = () => setIsPdfModalOpen(true);
  const handleClosePdfModal = () => setIsPdfModalOpen(false);
  const handleOpenCheckoutModal = () => {
    setShowCheckoutModal(true);
    setCheckoutBillingCycle("monthly");
  };

  // Handle upgrade click - redirect to ClientCheckout
  const handleUpgradeClick = (billingCycle = (typeof window !== 'undefined' && window.innerWidth < 768) ? 'trial' : 'monthly') => {
    if (!user) {
      handleConsistentUpgradeClick(billingCycle, 'pdf-preview-upgrade');
      event({ action: "login_redirect", category: "Payment", label: "PdfPreviewUpgrade" });
      return;
    }
    const effectiveBillingCycle = isMobileIOS() ? "monthly" : billingCycle;
    router.push(`/checkout?billingCycle=${effectiveBillingCycle}&currency=${currency}`);
    setHasInteractedWithCheckout(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex flex-col items-center justify-center p-2 sm:p-4 md:p-4 lg:p-6">
      {isGeneratingPdf && <ProgressOverlay type="download" isVisible={isGeneratingPdf} />}
      {isApplyingAI && <ProgressOverlay type="ai" isVisible={isApplyingAI} />}
      {isUploadingPdf && (
        <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3 md:gap-5 bg-white p-4 md:p-6 rounded-xl shadow-2xl animate-pulse">
            <div className="animate-spin rounded-full h-10 w-10 md:h-14 md:w-14 border-t-4 border-primary" />
            <p className="text-primary text-sm md:text-lg font-semibold text-center max-w-xs">
              Importing your resume magic...
            </p>
          </div>
        </div>
      )}

      {/* Reward Animation */}
      <AnimatePresence>
        {false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-r from-primary to-primary text-white p-4 md:p-6 rounded-xl shadow-2xl max-w-sm w-full relative">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setShowRewardAnimation(false)}
                  className="absolute top-2 right-2 text-white hover:text-gray-200 p-1 transition-colors"
                  aria-label="Close reward dialog"
                >
                  <X size={20} />
                </button>
                <Sparkles size={24} className="animate-pulse" />
                <h3 className="text-lg md:text-xl font-bold">
                  {atsScore > calculateATSScore(resumeData) ? "Score Boost!" : "Great Job!"}
                </h3>
                <p className="text-sm md:text-base font-medium text-center">
                  {atsScore > calculateATSScore(resumeData)
                    ? `Your ATS score improved to ${atsScore}!`
                    : "Your resume's ATS score is 80+! Amazing work crafting it!"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Layout */}
      <div className="flex flex-col min-h-screen w-full max-w-md mx-auto md:hidden overflow-y-auto">
        <div className="bg-white rounded-t-xl p-2 sm:p-3 flex flex-nowrap gap-1 sm:gap-2 items-center shadow-md z-10 overflow-x-auto sticky top-0">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-primary to-accent text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-md hover:from-gray-900 hover:to-accent-600 transition-all duration-300 text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              <LayoutDashboard size={16} className="sm:size-18" /> Template
            </button>
            {showStyleHint && !isPremium && !hintsDismissed.style && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute top-10 sm:top-12 left-1/2 transform -translate-x-1/2 bg-slate-100 text-primary px-2 py-1 rounded-lg shadow-lg flex items-center gap-2 z-50"
              >
                <Pointer size={16} className="sm:size-18 animate-bounce rotate-180" />
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Pick a style!</span>
              </motion.div>
            )}
          </div>
          <label
            onClick={() => router.push("/upload-resume")}
            className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-primary to-accent text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-md hover:from-gray-900 hover:to-accent-600 transition-all duration-300 text-xs sm:text-sm font-medium cursor-pointer flex-shrink-0 whitespace-nowrap"
          >
            <FileUp size={16} className="sm:size-18" /> Import
          </label>
          <button
            onClick={() => setIncludeCoverLetter(!includeCoverLetter)}
            className={`flex items-center gap-1 sm:gap-2 bg-gradient-to-r ${
              includeCoverLetter ? "from-gray-500 to-gray-600" : "from-primary to-primary"
            } text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-md hover:from-gray-900 hover:to-gray-900 transition-all duration-300 text-xs sm:text-sm font-medium flex-shrink-0 whitespace-nowrap`}
          >
            <FileText size={16} className="sm:size-18" /> {includeCoverLetter ? "Remove Cover" : "Cover"}
          </button>
          <div className="relative flex-shrink-0">
            <button
              onClick={handleApplyAISuggestions}
              className={`flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-primary to-accent text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-md transition-all duration-300 text-xs sm:text-sm font-medium whitespace-nowrap ${
                isApplyingAI ? "opacity-50 cursor-not-allowed" : "hover:from-gray-900 hover:to-accent-600"
              }`}
              disabled={isApplyingAI}
            >
              <Bot size={16} className="sm:size-18" /> {isApplyingAI ? "Enhancing..." : "AI Boost"}
            </button>
            {showAiBoostHint && false &&  (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute top-10 sm:top-12 left-1/2 transform -translate-x-1/2 bg-slate-100 text-primary px-2 py-1 rounded-lg shadow-lg flex items-center gap-2 z-50"
              >
                <Pointer size={16} className="sm:size-18 animate-bounce rotate-180" />
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Boost with AI!</span>
              </motion.div>
            )}
          </div>
        </div>
        <div className="bg-white p-2 flex gap-2 border-b border-gray-200 sticky top-[calc(2.5rem+0.5rem)] sm:top-[calc(3rem+0.5rem)] z-10">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 py-2 text-sm font-semibold rounded-t-lg ${
              activeTab === "form"
                ? "bg-primary text-white shadow-inner"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } transition-all duration-200`}
          >
            Edit
          </button>
          {includeCoverLetter && (
            <button
              onClick={() => setActiveTab("coverLetter")}
              className={`flex-1 py-2 text-sm font-semibold rounded-t-lg ${
                activeTab === "coverLetter"
                  ? "bg-primary text-white shadow-inner"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } transition-all duration-200`}
            >
              Cover
            </button>
          )}
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-2 text-sm font-semibold rounded-t-lg ${
              activeTab === "preview"
                ? "bg-primary text-white shadow-inner"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } transition-all duration-200`}
          >
            Preview
          </button>
        </div>
        <div className="bg-white p-3 rounded-b-xl shadow-inner">
          {activeTab === "form" && (
            <JobSpecificResumeForm
              data={resumeData}
              onUpdate={handleUpdate}
              sections={sections}
              collapsedSections={collapsedSections || {}}
              toggleSectionCollapse={toggleSectionCollapse}
              handleArrayUpdate={handleArrayUpdate}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              customFields={customFields || []}
              updateCustomField={updateCustomField}
              addCustomField={addCustomField}
              removeCustomField={removeCustomField}
              disabled={false} // Always allow editing, never disable inputs
            />
          )}
          {activeTab === "coverLetter" && includeCoverLetter && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-800">Create Cover Letter</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={coverLetterData.name}
                    onChange={(e) => updateCoverLetterWithPlaceholders({ ...coverLetterData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                    placeholder="Mapped from resume"
                    disabled={ENABLE_PAYMENTS && !isPremium}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={coverLetterData.email}
                    onChange={(e) => updateCoverLetterWithPlaceholders({ ...coverLetterData, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                    placeholder="Mapped from resume"
                    disabled={ENABLE_PAYMENTS && !isPremium}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={coverLetterData.phone}
                    onChange={(e) => updateCoverLetterWithPlaceholders({ ...coverLetterData, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                    placeholder="Mapped from resume"
                    disabled={ENABLE_PAYMENTS && !isPremium}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template</label>
                  <select
                    value={coverLetterTemplate}
                    onChange={(e) => handleCoverLetterTemplateChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                    disabled={ENABLE_PAYMENTS && !isPremium}
                  >
                    {Object.keys(coverLetterTemplates).map((key) => (
                      <option key={key} value={key}>
                        {coverLetterTemplates[key].name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient</label>
                  <input
                    type="text"
                    value={coverLetterData.recipient}
                    onChange={(e) =>
                      updateCoverLetterWithPlaceholders({ ...coverLetterData, recipient: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                    placeholder="e.g., Dear Hiring Manager"
                    disabled={ENABLE_PAYMENTS && !isPremium}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
                  <input
                    type="text"
                    value={coverLetterData.jobTitle}
                    onChange={(e) =>
                      updateCoverLetterWithPlaceholders({ ...coverLetterData, jobTitle: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                    placeholder="e.g., Software Engineer"
                    disabled={ENABLE_PAYMENTS && !isPremium}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={coverLetterData.company}
                    onChange={(e) =>
                      updateCoverLetterWithPlaceholders({ ...coverLetterData, company: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                    placeholder="e.g., Acme Inc"
                    disabled={ENABLE_PAYMENTS && !isPremium}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Intro</label>
                  <textarea
                    value={coverLetterData.intro}
                    onChange={(e) => updateCoverLetterWithPlaceholders({ ...coverLetterData, intro: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                    rows="2"
                    disabled={ENABLE_PAYMENTS && !isPremium}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Body</label>
                  <textarea
                    value={coverLetterData.body}
                    onChange={(e) => updateCoverLetterWithPlaceholders({ ...coverLetterData, body: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                    rows="3"
                    disabled={ENABLE_PAYMENTS && !isPremium}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Closing</label>
                  <textarea
                    value={coverLetterData.closing}
                    onChange={(e) =>
                      updateCoverLetterWithPlaceholders({ ...coverLetterData, closing: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                    rows="2"
                    disabled={ENABLE_PAYMENTS && !isPremium}
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === "preview" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPreviewMode("resume")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    previewMode === "resume"
                      ? "bg-primary text-white shadow-inner"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } transition-all duration-200`}
                >
                  Resume
                </button>
                {includeCoverLetter && (
                  <>
                    <button
                      onClick={() => setPreviewMode("coverLetter")}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                        previewMode === "coverLetter"
                          ? "bg-primary text-white shadow-inner"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-all duration-200`}
                    >
                      Cover
                    </button>
                    <button
                      onClick={() => setPreviewMode("both")}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                        previewMode === "both"
                          ? "bg-primary text-white shadow-inner"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-all duration-200`}
                    >
                      Both
                    </button>
                  </>
                )}
              </div>
              {previewMode === "resume" && (
      <JobSpecificResumePreview
        data={resumeData}
        template={template}
        customColors={customColors} // Pass full customColors object
        language={language}
        country={country}
        isPremium={isPremium}
      />
    )}
              {previewMode === "coverLetter" && includeCoverLetter && (
                <CoverLetterPreview
                  data={coverLetterData}
                  template={coverLetterTemplate}
                  customColors={customColors}
                  resumeData={resumeData}
                />
              )}
              {previewMode === "both" && includeCoverLetter && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-1 text-gray-800">Resume</h3>
                    <JobSpecificResumePreview
            data={resumeData}
            template={template}
            customColors={customColors} // Pass full customColors object
            language={language}
            country={country}
            isPremium={isPremium}
          />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1 text-gray-800">Cover Letter</h3>
                    <CoverLetterPreview
                      data={coverLetterData}
                      template={coverLetterTemplate}
                      customColors={customColors}
                      resumeData={resumeData}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white flex justify-around items-center py-2 px-1 z-20 border-t border-gray-200 max-w-md mx-auto rounded-t-xl shadow-lg">
          <button
            onClick={handleSaveResume}
            className="flex flex-col items-center text-gray-700 hover:text-primary transition-all duration-200 p-1"
          >
            <Save size={16} />
            <span className="text-[10px] font-medium mt-0.5">Save</span>
          </button>
          <div className="relative">
            <button
              onClick={handleGeneratePDF}
              className="flex flex-col items-center text-gray-700 hover:text-primary transition-all duration-200 p-1"
            >
              <Eye size={16} />
              <span className="text-[10px] font-medium mt-0.5">PDF</span>
            </button>
            {showPreviewHint && !isPremium && !hintsDismissed.preview && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-slate-100 text-primary px-2 py-1 rounded-lg shadow-lg flex items-center gap-2 z-50"
              >
                <Pointer size={18} className="[transform:rotate(180deg)]" />
                <span className="text-sm font-medium whitespace-nowrap">Click "PDF" to Download!</span>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setActiveTab(activeTab === "form" ? "preview" : "form")}
            className="flex flex-col items-center text-gray-700 hover:text-primary transition-all duration-200 p-1"
          >
            <Edit size={16} />
            <span className="text-[10px] font-medium mt-0.5">{activeTab === "form" ? "Preview" : "Edit"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("preview"); // Switch to preview when opening color panel
              setIsColorPanelOpen(true);
            }}
            className="flex flex-col items-center text-gray-700 hover:text-primary transition-all duration-200 p-1"
          >
            <Palette size={16} />
            <span className="text-[10px] font-medium mt-0.5">Colors</span>
          </button>
          <Link
            href="/my-resumes"
            className="flex flex-col items-center text-gray-700 hover:text-primary transition-all duration-200 p-1"
          >
            <LayoutDashboard size={16} />
            <span className="text-[10px] font-medium mt-0.5">Resumes</span>
          </Link>
        </div>

        {/* Mobile Color Panel */}
        {isColorPanelOpen && (
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl z-30 p-3 max-h-[60vh] overflow-y-auto max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-800">Customize Colors</h2>
              <button onClick={() => setIsColorPanelOpen(false)} className="text-gray-600 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <ColorCustomizer template={template} colors={customColors[template] || {}} onChange={handleColorChange} onDone={() => setIsColorPanelOpen(false)} />
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 w-full mx-auto space-x-4">
        <div className="flex-shrink-0">
          <ColorCustomizer template={template} colors={customColors[template] || {}} onChange={handleColorChange} />
        </div>
        <div className="flex-1 bg-white rounded-lg pt-0 px-4 pb-4 flex flex-col space-y-4 shadow-md">
          <div className="flex justify-between items-center py-2">
            <div className="flex space-x-3">
              <div className="relative">
                <button
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-primary to-accent text-white px-3 py-1.5 rounded-md shadow-md hover:from-gray-900 hover:to-accent-600 transition-all duration-300 text-sm font-semibold"
                >
                  <LayoutDashboard size={16} /> Template
                </button>
                {showStyleHint && !isPremium && !hintsDismissed.style && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-slate-100 text-primary px-2 py-1 rounded-lg shadow-lg flex items-center gap-2 z-50"
                  >
                    <Pointer size={18} className="animate-bounce" />
                    <span className="text-sm font-medium whitespace-nowrap">Pick a style!</span>
                  </motion.div>
                )}
              </div>
              <label
                onClick={() => router.push("/upload-resume")}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-3 py-1.5 rounded-lg shadow-md hover:from-gray-900 hover:to-accent-600 transition-all duration-300 text-sm font-medium cursor-pointer"
              >
                <FileUp size={18} /> Import
              </label>
              <button
                onClick={() => setIncludeCoverLetter(!includeCoverLetter)}
                className={`flex items-center gap-1 bg-gradient-to-r ${
                  includeCoverLetter ? "from-gray-500 to-gray-600" : "from-primary to-primary"
                } text-white px-3 py-1.5 rounded-md shadow-md hover:from-gray-900 hover:to-gray-900 transition-all duration-300 text-sm font-semibold`}
              >
                <FileText size={16} /> {includeCoverLetter ? "Remove Cover" : "Cover"}
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveResume}
                className="flex items-center gap-1 text-gray-700 hover:text-primary px-2 py-1.5 rounded-md transition-all duration-300 text-sm font-semibold"
              >
                <Save size={16} /> Save
              </button>
              <div className="relative">
                <button
                  onClick={handleGeneratePDF}
                  className="flex items-center gap-1 bg-gradient-to-r from-primary to-primary text-white px-3 py-1.5 rounded-md shadow-md hover:from-gray-900 hover:to-gray-900 transition-all duration-300 text-sm font-semibold"
                >
                  <Eye size={16} /> Preview PDF
                </button>
                {showPreviewHint && !isPremium && !hintsDismissed.preview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-slate-100 text-primary px-2 py-1 rounded-lg shadow-lg flex items-center gap-2 z-50"
                  >
                    <Pointer size={18} className="animate-bounce" />
                    <span className="text-sm font-medium whitespace-nowrap">Click "PDF" to preview!</span>
                  </motion.div>
                )}
              </div>
              {user && !isPremium && (
                <button
                  onClick={handleUpgradeClick}
                  className="flex items-center gap-1 bg-gradient-to-r from-primary to-primary text-white px-3 py-1.5 rounded-md shadow-md hover:from-gray-900 hover:to-gray-900 transition-all duration-300 text-sm font-semibold"
                >
                  Upgrade
                </button>
              )}
              <button
                onClick={() => setIsHelpModalOpen(true)}
                className="flex items-center gap-1 text-gray-700 hover:text-primary px-2 py-1.5 rounded-md transition-all duration-300 text-sm font-semibold"
              >
                <HelpCircle size={16} />
              </button>
            </div>
          </div>
          <div className="flex gap-4 border-b border-gray-200 justify-between">
            <div className="flex gap-4 justify-between items-center mb-2">
              <button
                onClick={() => setActiveTab("form")}
                className={`pb-1 text-sm font-semibold ${
                  activeTab === "form" ? "border-b-2 border-primary text-primary" : "text-gray-600 hover:text-gray-800"
                } transition-all duration-200`}
              >
                Edit Resume
              </button>
              {includeCoverLetter && (
                <button
                  onClick={() => setActiveTab("coverLetter")}
                  className={`pb-1 text-sm font-semibold ${
                    activeTab === "coverLetter"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-600 hover:text-gray-800"
                  } transition-all duration-200`}
                >
                  Cover Letter
                </button>
              )}
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode("resume")}
                  className={`px-2 py-1 rounded-md text-sm font-medium ${
                    previewMode === "resume"
                      ? "bg-primary text-white shadow-inner"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } transition-all duration-200`}
                >
                  Resume
                </button>
                {includeCoverLetter && (
                  <>
                    <button
                      onClick={() => setPreviewMode("coverLetter")}
                      className={`px-2 py-1 rounded-md text-sm font-medium ${
                        previewMode === "coverLetter"
                          ? "bg-primary text-white shadow-inner"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-all duration-200`}
                    >
                      Cover
                    </button>
                    <button
                      onClick={() => setPreviewMode("both")}
                      className={`px-2 py-1 rounded-md text-sm font-medium ${
                        previewMode === "both"
                          ? "bg-primary text-white shadow-inner"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-all duration-200`}
                    >
                      Both
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-md overflow-y-auto max-h-[calc(100vh-10rem)] shadow-inner">
              {activeTab === "form" && (
                <JobSpecificResumeForm
                  data={resumeData}
                  onUpdate={handleUpdate}
                  sections={sections}
                  collapsedSections={collapsedSections || {}}
                  toggleSectionCollapse={toggleSectionCollapse}
                  handleArrayUpdate={handleArrayUpdate}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  customFields={customFields || []}
                  updateCustomField={updateCustomField}
                  addCustomField={addCustomField}
                  removeCustomField={removeCustomField}
                  disabled={false} // Always allow editing, never disable inputs
                />
              )}
              {activeTab === "coverLetter" && includeCoverLetter && (
                <>
                  <h2 className="text-lg font-bold mb-2 text-gray-800">Create Cover Letter</h2>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Template</label>
                      <select
                        value={coverLetterTemplate}
                        onChange={(e) => handleCoverLetterTemplateChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                        disabled={ENABLE_PAYMENTS && !isPremium}
                      >
                        {Object.keys(coverLetterTemplates).map((key) => (
                          <option key={key} value={key}>
                            {coverLetterTemplates[key].name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Your Name</label>
                      <input
                        type="text"
                        value={coverLetterData.name}
                        onChange={(e) =>
                          updateCoverLetterWithPlaceholders({ ...coverLetterData, name: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                        placeholder="Mapped from resume"
                        disabled={ENABLE_PAYMENTS && !isPremium}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Your Email</label>
                      <input
                        type="email"
                        value={coverLetterData.email}
                        onChange={(e) =>
                          updateCoverLetterWithPlaceholders({ ...coverLetterData, email: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                        placeholder="Mapped from resume"
                        disabled={ENABLE_PAYMENTS && !isPremium}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Your Phone</label>
                      <input
                        type="tel"
                        value={coverLetterData.phone}
                        onChange={(e) =>
                          updateCoverLetterWithPlaceholders({ ...coverLetterData, phone: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                        placeholder="Mapped from resume"
                        disabled={ENABLE_PAYMENTS && !isPremium}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recipient</label>
                      <input
                        type="text"
                        value={coverLetterData.recipient}
                        onChange={(e) =>
                          updateCoverLetterWithPlaceholders({ ...coverLetterData, recipient: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                        placeholder="e.g., Dear Hiring Manager"
                        disabled={ENABLE_PAYMENTS && !isPremium}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Job Title</label>
                      <input
                        type="text"
                        value={coverLetterData.jobTitle}
                        onChange={(e) =>
                          updateCoverLetterWithPlaceholders({ ...coverLetterData, jobTitle: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                        placeholder="e.g., Software Engineer"
                        disabled={ENABLE_PAYMENTS && !isPremium}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input
                        type="text"
                        value={coverLetterData.company}
                        onChange={(e) =>
                          updateCoverLetterWithPlaceholders({ ...coverLetterData, company: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                        placeholder="e.g., Acme Inc"
                        disabled={ENABLE_PAYMENTS && !isPremium}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Introduction</label>
                      <textarea
                        value={coverLetterData.intro}
                        onChange={(e) =>
                          updateCoverLetterWithPlaceholders({ ...coverLetterData, intro: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                        rows="3"
                        disabled={ENABLE_PAYMENTS && !isPremium}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Body</label>
                      <textarea
                        value={coverLetterData.body}
                        onChange={(e) =>
                          updateCoverLetterWithPlaceholders({ ...coverLetterData, body: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                        rows="4"
                        disabled={ENABLE_PAYMENTS && !isPremium}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Closing</label>
                      <textarea
                        value={coverLetterData.closing}
                        onChange={(e) =>
                          updateCoverLetterWithPlaceholders({ ...coverLetterData, closing: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-accent"
                        rows="2"
                        disabled={ENABLE_PAYMENTS && !isPremium}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="bg-white rounded-md overflow-y-auto max-h-[calc(100vh-10rem)] relative">
              {previewMode === "resume" && (
               <JobSpecificResumePreview
               data={resumeData}
               template={template}
               customColors={customColors} // Pass full customColors object
               language={language}
               country={country}
               isPremium={isPremium}
             />
              )}
              {previewMode === "coverLetter" && includeCoverLetter && (
                <CoverLetterPreview
                  data={coverLetterData}
                  template={coverLetterTemplate}
                  customColors={customColors}
                  resumeData={resumeData}
                />
              )}
              {previewMode === "both" && includeCoverLetter && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold mb-1 text-gray-800">Resume</h3>
                    <JobSpecificResumePreview
          data={resumeData}
          template={template}
          customColors={customColors} // Pass full customColors object
          language={language}
          country={country}
          isPremium={isPremium}
        />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1 text-gray-800">Cover Letter</h3>
                    <CoverLetterPreview
                      data={coverLetterData}
                      template={coverLetterTemplate}
                      customColors={customColors}
                      resumeData={resumeData}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-full max-w-4xl mx-auto">
            <PdfPreviewModal
              pdfPreviewUrl={pdfPreviewUrl}
              onClose={handleClosePdfModal}
              isLoading={isGeneratingPdf}
            />
            {!isPremium && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">Unlock PDF Download</h3>
                  <p className="mb-4">Upgrade to premium to download your resume and access all features.</p>
                  <button
                    onClick={handleOpenCheckoutModal}
                    className="bg-gradient-to-r from-primary to-primary text-white px-6 py-2 rounded-xl text-sm font-semibold hover:from-gray-900 hover:to-gray-900 transition-all flex items-center gap-2"
                  >
                    Get Premium Access
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Overlay/Upgrade Button (inside PDF modal or overlay) */}
      {!isPremium && isPdfModalOpen && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">Unlock PDF Download</h3>
            <p className="mb-4">Upgrade to premium to download your resume and access all features.</p>
            <button
              onClick={handleOpenCheckoutModal}
              className="bg-gradient-to-r from-primary to-primary text-white px-6 py-2 rounded-xl text-sm font-semibold hover:from-gray-900 hover:to-gray-900 transition-all flex items-center gap-2"
            >
              Get Premium Access
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <SignUpAndCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          billingCycle={checkoutBillingCycle}
          setBillingCycle={setCheckoutBillingCycle}
          currency={currency}
          onAuthSuccess={() => {
            setShowCheckoutModal(false);
            
            // Close PDF preview modal if it's open
            if (isPdfModalOpen) {
              setIsPdfModalOpen(false);
              toast.success("Welcome! You can now download your resume.");
              return; // Don't show save modal if PDF modal was closed
            }
          }}
        />
      )}

      {/* Modals */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-3 md:p-6">
            <div className="flex justify-between items-center mb-3 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Select a Template</h2>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-gray-600 hover:text-gray-800">
                <X className="size-5 md:size-6" />
              </button>
            </div>
            <TemplateSelector
              template={template}
              setTemplate={handleTemplateChange}
              onClose={() => setIsTemplateModalOpen(false)}
              disabled={false}
              isPremium={false} // All templates accessible, no premium gating
              stayOnPage={true}
            />
                      </div>
        </div>
      )}

      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-3 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={handlePdfModalClose}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close preview"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Eye size={20} />
              <h2 className="text-xl font-semibold text-gray-800">Resume Preview</h2>
            </div>
            <div className="relative flex justify-center">
              <iframe
                src={`${pdfPreviewUrl}#toolbar=1&navpanes=0&scrollbar=0`}
                className="border border-gray-200 rounded-xl"
                style={{
                  width: '794px',
                  maxWidth: '100%',
                  height: '60vh',
                  backgroundColor: 'white'
                }}
                title="PDF Preview"
                aria-label="Resume preview"
              />
              {!isPremium && (
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-white/30 flex items-end justify-center p-6">
                  <div className="text-center">
                    <p className="text-gray-800 font-medium mb-3">Ready to download your professional resume?</p>
                    <button
                      onClick={() => {
                        setShowCheckoutModal(true);
                        setCheckoutBillingCycle(isMobileIOS() ? "monthly" : "monthly");
                      }}
                      className="bg-gradient-to-r from-primary to-primary text-white px-8 py-3 rounded-xl text-base font-semibold hover:from-gray-900 hover:to-gray-900 transition-all shadow-lg hover:shadow-xl"
                    >
                      Get Premium Access Now
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handlePdfModalClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              {user && isPremium ? (
                <a
                  href={pdfPreviewUrl}
                  download="resume.pdf"
                  className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-primary-800 hover:to-accent-600 transition-all flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </a>
              ) : (
                <button
                  onClick={() => {
                    setShowCheckoutModal(true);
                    setCheckoutBillingCycle(isMobileIOS() ? "monthly" : "monthly");
                  }}
                  className="bg-gradient-to-r from-primary to-primary text-white px-6 py-2 rounded-xl text-sm font-semibold hover:from-gray-900 hover:to-gray-900 transition-all flex items-center gap-2"
                >
                  <Crown size={16} />
                  Get Premium Access
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* One-Pager Choice Modal */}
      {showOnePagerChoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Choose Resume Builder</h3>
                  <p className="text-sm text-gray-600">How would you like to edit this resume?</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleOpenInOnePagerBuilder}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">One-Pager Builder</div>
                      <div className="text-sm text-gray-600">Optimized for single-page resumes</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={handleOpenInJobSpecificBuilder}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Job-Specific Builder</div>
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

      {/* Checkout Modal (only shown during PDF preview) */}
      {showCheckoutModal && (
        <SignUpAndCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          billingCycle={checkoutBillingCycle}
          setBillingCycle={setCheckoutBillingCycle}
          currency={currency}
        />
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} app="job-specific" />
      )}

      {/* Upgrade Modal for Free Users */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
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
                <div className="mb-4 sm:mb-6 flex justify-center">
                  <div className="p-2 sm:p-3 bg-slate-100 rounded-full">
                    <Crown size={24} className="sm:w-8 sm:h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  🔒 Upgrade to Continue
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  You've used your <strong>1 free job-specific resume</strong>. Upgrade to get:
                </p>
                <div className="text-left space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Unlimited Job-Specific Resumes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                    <span className="text-xs sm:text-sm">All Premium Templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Cover Letter Builder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                    <span className="text-xs sm:text-sm">AI Resume Enhancement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Buttons */}
            <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 pt-0 sm:pt-0 lg:pt-0 border-t border-gray-100 bg-white rounded-b-xl sm:rounded-b-2xl">
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    router.push('/checkout?billingCycle=basic');
                  }}
                  className="w-full bg-gradient-to-r from-primary to-primary text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-bold hover:from-gray-900 hover:to-gray-900 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Crown size={16} className="sm:w-5 sm:h-5" />
                  <span className="truncate">Upgrade to Basic - ₹199 (7 days)</span>
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
        </div>
      )}
    </div>
  );
}