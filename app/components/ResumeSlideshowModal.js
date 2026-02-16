import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ResumePreview from "./ResumePreview";
import ProgressOverlay from "./ProgressOverlay";
import OnePagerPreview from "./OnePagerPreview";
import { templates } from "../lib/templates";
import {
  X, ArrowLeft, ArrowRight, Lock, Palette, Type, LayoutGrid, Zap,
  Crown, Star, Download, Eye, Users, TrendingUp, Award, Sparkles,
  CheckCircle, Clock, Heart, Target, Trophy, Rocket, AlertTriangle, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { doc, updateDoc, onSnapshot, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import toast from "react-hot-toast";
import { useLocation } from "../context/LocationContext";
import { getDownloadLimitMessage, getPlanConfig, ADDON_CONFIG } from "../lib/planConfig";
import { event } from "../lib/gtag";

const FONT_STYLES = [
  { id: "modern", label: "Modern", fontFamily: "'Inter', sans-serif" },
  { id: "tech", label: "Tech", fontFamily: "'Roboto Mono', monospace" },
  { id: "creative", label: "Creative", fontFamily: "'Poppins', sans-serif" },
  { id: "classic", label: "Classic", fontFamily: "'Georgia', serif" },
];

const SKILLS_STYLES = [
  { id: "list", label: "List" },
  { id: "tags", label: "Tags" },
  { id: "bars", label: "Progress Bars" },
  { id: "grid", label: "Grid" },
];

const SUCCESS_STATS = [
  { icon: Users, stat: "20,000+", label: "Downloads", color: "text-accent" },
  { icon: TrendingUp, stat: "4.9★", label: "User Rating", color: "text-accent" },
  { icon: Award, stat: "15+", label: "Templates", color: "text-accent" },
  { icon: Trophy, stat: "ATS", label: "Optimized", color: "text-orange-500" }
];

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Software Engineer",
    avatar: "👩‍💻",
    text: "The premium templates helped me create a professional resume that stood out. Great design options!",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Marketing Manager",
    avatar: "👨‍💼",
    text: "Clean, modern designs that are easy to customize. The ATS optimization features are really helpful.",
    rating: 5
  },
  {
    name: "Emily Chen",
    role: "Product Designer",
    avatar: "👩‍🚀",
    text: "Love the variety of templates available. Much better than generic resume builders out there.",
    rating: 5
  }
];

// Order: Premium Design -> Visual Appeal -> ATS -> One-Pager -> Others
function createBaseSlides(isMobile = false) {
  const allTemplates = templates;

  return Object.entries(allTemplates)
    .filter(([key, template]) => {
      // On mobile, filter out ATS templates if needed
      if (isMobile && key.startsWith('ats_')) {
        return false;
      }
      return true;
    })
    .sort(([keyA, templateA], [keyB, templateB]) => {
      // Priority: Premium Design > Visual Appeal > ATS > One-Pager > Others
      const getScore = (key, t) => {
        if (t.category === 'Premium Design' || key.startsWith('premium_')) return 5;
        if (t.category === 'Visual Appeal' || key.startsWith('visual_')) return 4;
        if (t.category === 'ATS-Optimized' || key.startsWith('ats_')) return 3;
        return 1;
      };

      const scoreA = getScore(keyA, templateA);
      const scoreB = getScore(keyB, templateB);

      if (scoreA !== scoreB) return scoreB - scoreA;

      // Preserve insertion order for Premium Design templates
      if (scoreA === 5) return 0;

      if (scoreA === 4) {
        const visualOrder = [
          'visual_modern_executive',
          'visual_minimalist_modern',
          'visual_creative_designer',
          'visual_tech_innovator',
          'visual_elegant_executive',
          'visual_creative_artist',
          'visual_startup_founder',
          'visual_data_scientist',
          'visual_medical_professional',
          'visual_academic_professor',
          'visual_finance_executive',
          'visual_marketing_manager',
          'visual_entrepreneur',
          'visual_fashion_designer'
        ];
        const aIndex = visualOrder.indexOf(keyA);
        const bIndex = visualOrder.indexOf(keyB);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
      }

      return 0;
    })
    .map(([key, template]) => ({
      key: key,
      template: key,
      label: template.name,
      description: template.description || (template.category + (template.premium ? ' (Premium)' : '')),
      category: template.category,
      colorName: "Default",
      colors: template.styles?.colors || template.template?.styles?.colors || {
        primary: "#1e3a8a",
        accent: "#3b82f6",
        secondary: "#64748b",
        text: "#1f2937",
        background: "#ffffff",
      },
      personality: template.personality || "Professional",
      font: FONT_STYLES[0],
      skillsStyle: SKILLS_STYLES[0],
      phase: "templates"
    }));
}

function createATSSlides(atsTemplates, isMobile = false) {
  if (!atsTemplates) return [];

  return Object.entries(atsTemplates)
    .sort(([keyA, tempA], [keyB, tempB]) => {
      const scoreA = tempA.atsScore || 0;
      const scoreB = tempB.atsScore || 0;
      return scoreB - scoreA;
    })
    .map(([key, template]) => ({
      key: key,
      template: key, // Keep full key
      label: template.name,
      description: template.description || "ATS-Optimized Template",
      category: "ATS-Optimized",
      colorName: "Professional",
      colors: template.styles?.colors || {
        primary: "#000000",
        accent: "#2563eb",
        secondary: "#666666",
        text: "#1f2937",
        background: "#ffffff",
      },
      personality: "Professional",
      font: FONT_STYLES[0],
      skillsStyle: SKILLS_STYLES[0],
      phase: "ats-templates",
      atsScore: template.atsScore,
      atsFeatures: template.atsFeatures
    }));
}

export default function ResumeSlideshowModal({
  isOpen,
  onClose,
  resumeData,
  customColors = {},
  preferences = {},
  isPremium = false,
  upgradeCTA,
  downloadResume,
  user = null,
  atsMode = false,
  atsTemplates = null,
}) {
  const router = useRouter();
  const [isBasicPlan, setIsBasicPlan] = useState(false);
  const [isOneDayPlan, setIsOneDayPlan] = useState(false);
  const [pdfDownloadCount, setPdfDownloadCount] = useState(0);
  const [basicPlanExpiry, setBasicPlanExpiry] = useState(null);
  const [oneDayPlanExpiry, setOneDayPlanExpiry] = useState(null);
  const [latestPayment, setLatestPayment] = useState(null);

  const [showExitPopup, setShowExitPopup] = useState(false); // Exit intent state
  const [popupCountdown, setPopupCountdown] = useState(15 * 60); // 15 min countdown for popup
  const [showDefaultResumeWarning, setShowDefaultResumeWarning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check if resume is still using default data
  const isDefaultResume = () => {
    if (!resumeData) return false;
    // Check for specific default values from storage.js
    return resumeData.name === "John Doe" && (resumeData.email === "john.doe@example.com" || resumeData.email === "john.doe@email.com");
  };

  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showTestimonial, setShowTestimonial] = useState(0);
  const [viewTime, setViewTime] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showFloatingNotification, setShowFloatingNotification] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { currency } = useLocation();

  // State to track if user came from Shine
  const [isShineSource, setIsShineSource] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      let storedReferrer = null;
      try {
        const storedItem = localStorage.getItem('expertresume_referrer');
        if (storedItem) storedReferrer = JSON.parse(storedItem);
      } catch (e) {
        console.error("Error parsing referrer", e);
      }

      if (utmSource === 'shine' || (storedReferrer && storedReferrer.source === 'shine')) {
        setIsShineSource(true);
      }
    }
  }, [isOpen]);

  // Handle One-Time Payment logic
  const handleOneTimePayment = async (force = false) => {
    // Check for default resume data first
    if (isDefaultResume()) {
      setShowDefaultResumeWarning(true);
      return;
    }

    // Check for partner source (Shine)
    let isShineSource = false;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const storedReferrer = localStorage.getItem('expertresume_referrer');
      if (utmSource === 'shine' || (storedReferrer && JSON.parse(storedReferrer).source === 'shine')) {
        isShineSource = true;
      }
    }

    const displayAmount = isShineSource ? 19 : (currency === 'USD' ? 2.99 : 99);

    setIsProcessingPayment(true);
    // Track Checkout Initiated
    event({
      action: "one_time_payment_initiated",
      category: "Payment",
      label: isShineSource ? "ResumeSlideshow_Shine" : "ResumeSlideshow",
      value: displayAmount
    });
    try {
      // Create Stripe checkout session via API
      const response = await fetch('/api/create-guest-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: currency || 'INR',
          source: isShineSource ? 'shine' : null,
          userInfo: {
            email: user?.email || "",
            name: "Guest User",
            userId: user?.uid || "guest"
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create checkout session');
      const data = await response.json();

      // Track Order Created
      event({
        action: "one_time_payment_created",
        category: "Payment",
        label: "ResumeSlideshow",
      });

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed to initialize");
      // Track Failure
      event({
        action: "one_time_payment_failed",
        category: "Payment",
        label: error.message
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };


  // Track viewing time for urgency
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setViewTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setShowTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Handle floating notification with auto-dismiss
  useEffect(() => {
    if (hasInteracted && viewTime > 10) {
      setShowFloatingNotification(true);

      // Auto-dismiss after 4 seconds
      const dismissTimer = setTimeout(() => {
        setShowFloatingNotification(false);
      }, 4000);

      return () => clearTimeout(dismissTimer);
    }
  }, [hasInteracted, viewTime]);




  // Use effective popup countdown in effect
  useEffect(() => {
    if (showExitPopup) {
      const timer = setInterval(() => {
        setPopupCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showExitPopup]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  // Fetch latest payment from payment_logs to determine actual plan type
  const fetchLatestPayment = async (userId) => {
    console.log('🔍 [Slideshow] Fetching latest payment for user:', userId);
    try {
      const response = await fetch(`/api/payment-logs?userId=${userId}`);
      console.log('📄 [Slideshow] Payment API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('💳 [Slideshow] Payment API data:', data);

      const { transactions } = data;

      if (transactions && transactions.length > 0) {
        // Filter for successful payments and sort by timestamp (most recent first)
        const successfulPayments = transactions
          .filter(payment => payment.status === "success")
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.log('✅ [Slideshow] Successful payments found:', successfulPayments.length);

        if (successfulPayments.length > 0) {
          const latestPayment = successfulPayments[0];
          console.log('💳 [Slideshow] Latest successful payment:', latestPayment);
          setLatestPayment(latestPayment);

          // Check if this is a basic plan purchase
          if (latestPayment.billingCycle === "basic") {
            console.log('🎯 [Slideshow] Basic plan detected!');
            const paymentDate = new Date(latestPayment.timestamp);
            const expiryDate = new Date(paymentDate.getTime() + (getPlanConfig("basic").duration * 24 * 60 * 60 * 1000)); // Basic plan duration from config
            const isBasicValid = new Date() < expiryDate;

            console.log('📅 [Slideshow] Basic plan validation:', {
              paymentDate,
              expiryDate,
              isBasicValid,
              currentDate: new Date()
            });

            setIsBasicPlan(isBasicValid);
            setBasicPlanExpiry(expiryDate.toISOString());

            return { isBasic: true, isValid: isBasicValid, expiry: expiryDate };
          } else {
            console.log('❌ [Slideshow] Not a basic plan, billingCycle:', latestPayment.billingCycle);
            setIsBasicPlan(false);
            return { isBasic: false, isValid: false };
          }
        } else {
          console.log('❌ [Slideshow] No successful payment logs found');
          setIsBasicPlan(false);
          return { isBasic: false, isValid: false };
        }
      } else {
        console.log('❌ [Slideshow] No payment logs found');
        setIsBasicPlan(false);
        return { isBasic: false, isValid: false };
      }
    } catch (error) {
      console.error("Error fetching latest payment:", error);
      setIsBasicPlan(false);
      return { isBasic: false, isValid: false };
    }
  };

  // Track user's plan status (oneDay and basic plans)
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
        const data = docSnapshot.data();
        if (data) {
          setPdfDownloadCount(data.pdf_download_count || 0);

          // Check if user has oneDay plan - Rely primarily on planType
          if (data.plan === "oneDay") {
            console.log('🎯 [Slideshow] One Day plan detected from user data!');
            // Plan is valid if premium_expiry is missing (backwards compatibility)
            // or if expiry date is in the future
            let isOneDayValid = true; // Default to valid based on plan type

            // Only check expiry if it exists
            if (data.premium_expiry) {
              isOneDayValid = new Date() < new Date(data.premium_expiry);
            }

            setIsOneDayPlan(isOneDayValid);
            setOneDayPlanExpiry(data.premium_expiry);
            setIsBasicPlan(false);
            console.log('📅 [Slideshow] OneDay plan validity:', {
              isOneDayValid,
              expiry: data.premium_expiry,
              hasExpiry: !!data.premium_expiry
            });
          }
          // Check if user has basic plan - Rely primarily on planType
          else if (data.plan === "basic") {
            console.log('🎯 [Slideshow] Basic plan detected from user data!');
            // Plan is valid if premium_expiry is missing (backwards compatibility)
            // or if expiry date is in the future
            let isBasicValid = true; // Default to valid based on plan type

            // Only check expiry if it exists
            if (data.premium_expiry) {
              isBasicValid = new Date() < new Date(data.premium_expiry);
            }

            setIsBasicPlan(isBasicValid);
            setBasicPlanExpiry(data.premium_expiry);
            setIsOneDayPlan(false);
            console.log('📅 [Slideshow] Basic plan validity:', {
              isBasicValid,
              expiry: data.premium_expiry,
              hasExpiry: !!data.premium_expiry
            });
          } else if (data.plan === "premium") {
            // If user has premium plan, check payment_logs to see if it's actually a limited plan
            await fetchLatestPayment(user.uid);
          } else {
            setIsBasicPlan(false);
            setIsOneDayPlan(false);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Check mobile status
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Create slides with strategic sequencing (after mobile state is set)
  const slides = atsMode ? createATSSlides(atsTemplates, isMobile) : createBaseSlides(isMobile);
  const slide = slides[current];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "ArrowLeft") {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
        setHasInteracted(true);
      } else if (e.key === "ArrowRight") {
        setCurrent((prev) => (prev + 1) % slides.length);
        setHasInteracted(true);
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, slides.length, onClose]);

  if (!isOpen) return null;

  // Check if user has reached download limit (for oneDay and basic plans)
  const hasReachedDownloadLimit = () => {
    // Debug logging
    console.log('🔍 [Slideshow] Download limit check:', {
      isOneDayPlan,
      isBasicPlan,
      user: !!user,
      pdfDownloadCount,
      oneDayPlanExpiry,
      basicPlanExpiry
    });

    if (!user) return false;

    // Check oneDay plan (downloads and duration from config)
    if (isOneDayPlan) {
      // Check if oneDay plan has expired (only if expiry exists)
      if (oneDayPlanExpiry) {
        const isExpired = new Date() >= new Date(oneDayPlanExpiry);
        if (isExpired) {
          console.log('❌ [Slideshow] OneDay plan expired, blocking download');
          return true; // Plan expired, needs renewal
        }
      }

      // Check if user has reached or exceeded download limit
      if (pdfDownloadCount >= getPlanConfig("oneDay").downloads) {
        console.log('❌ [Slideshow] OneDay download limit reached, blocking download');
        return true; // Download limit reached
      }
    }

    // Check basic plan (downloads and duration from config)
    if (isBasicPlan) {
      // Check if basic plan has expired (only if expiry exists)
      if (basicPlanExpiry) {
        const isExpired = new Date() >= new Date(basicPlanExpiry);
        if (isExpired) {
          console.log('❌ [Slideshow] Basic plan expired, blocking download');
          return true; // Plan expired, needs renewal
        }
      }

      // Check if user has reached or exceeded download limit
      if (pdfDownloadCount >= getPlanConfig("basic").downloads) {
        console.log('❌ [Slideshow] Basic download limit reached, blocking download');
        return true; // Download limit reached
      }
    }

    console.log('✅ [Slideshow] Download allowed');
    return false;
  };

  // Download Resume handler for premium users
  async function handleDownloadResume() {
    console.log('🎯 [Slideshow] Download PDF clicked!', { isBasicPlan, pdfDownloadCount });

    // Check download limits first - prevent download if already at limit
    if ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit()) {
      console.log('🚫 [Slideshow] Download blocked by limit check');
      const isExpired = (basicPlanExpiry && new Date() >= new Date(basicPlanExpiry)) ||
        (oneDayPlanExpiry && new Date() >= new Date(oneDayPlanExpiry));
      let message;
      message = getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", isExpired);

      toast.error(message);
      handleUpgrade(); // Redirect to upgrade
      return;
    }

    console.log('✅ [Slideshow] Proceeding with download...');
    setIsDownloading(true);

    try {
      // Check if this is a one-pager template first
      const isOnePagerTemplate = slide.key?.startsWith('onepager_') || slide.template?.startsWith('onepager_');
      
      // Determine the correct API endpoint based on template type
      const { templates } = await import('../lib/templates');
      const { atsFriendlyTemplates } = await import('../lib/atsFriendlyTemplates');
      const { visualAppealTemplates } = await import('../lib/visualAppealTemplates');
      const { premiumDesignTemplates } = await import('../lib/premiumDesignTemplates');

      const allTemplates = { ...templates, ...atsFriendlyTemplates, ...visualAppealTemplates, ...premiumDesignTemplates };
      const currentTemplate = allTemplates[slide.template];

      const isATSTemplate = currentTemplate?.category === "ATS-Optimized";
      const isVisualAppealTemplate = currentTemplate?.category === "Visual Appeal" || slide.template?.startsWith('visual_');
      const isPremiumDesignTemplate = currentTemplate?.category === "Premium Design" || slide.template?.startsWith('premium_');

      let apiEndpoint = "/api/generate-pdf"; // Default
      if (isOnePagerTemplate) {
        apiEndpoint = "/api/download-one-pager";
      } else if (isPremiumDesignTemplate) {
        apiEndpoint = "/api/generate-premium-design-pdf";
      } else if (isATSTemplate) {
        apiEndpoint = "/api/generate-ats-pdf";
      } else if (isVisualAppealTemplate) {
        apiEndpoint = "/api/generate-visual-appeal-pdf";
      }

      // Build request body based on template type
      let requestBody;
      if (isOnePagerTemplate) {
        // One-pager API expects: { data, template } where template is without 'onepager_' prefix
        const templateName = slide.template?.replace('onepager_', '') || slide.key?.replace('onepager_', '') || 'classic';
        requestBody = {
          data: resumeData,
          template: templateName
        };
      } else if (isPremiumDesignTemplate) {
        requestBody = {
          data: resumeData,
          template: slide.template,
          customColors: slide.colors,
          language: preferences.language || "en",
          country: preferences.country || "us",
          preferences
        };
      } else if (isATSTemplate) {
        requestBody = {
          data: resumeData,
          template: currentTemplate
        };
      } else if (isVisualAppealTemplate) {
        requestBody = {
          data: resumeData,
          template: currentTemplate,
          customColors: slide.colors,
          language: preferences.language || "en",
          country: preferences.country || "us",
          preferences
        };
      } else {
        requestBody = {
          data: resumeData,
          template: slide.template,
          customColors: slide.colors,
          language: preferences.language || "en",
          country: preferences.country || "us",
          isPremium: isPremium || isBasicPlan,
          preferences,
          userId: user?.uid,
        };
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorText = await response.text();

        // Handle Enterprise upgrade required error
        if (response.status === 403) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error === "ENTERPRISE_REQUIRED") {
              // Enterprise modal removed
              return;
            }
          } catch (e) {
            // If JSON parsing fails, continue with normal error handling
          }
        }

        throw new Error(`Failed to generate PDF: ${errorText}`);
      }

      const blob = await response.blob();
      
      // Use robust download utility with retry and error handling
      try {
        const { downloadPDF } = await import('../lib/downloadUtils');
        
        const filename = `${resumeData.name || 'Resume'}_${slide.template || 'resume'}.pdf`;
        const result = await downloadPDF(blob, filename, {
          maxRetries: 3,
          retryDelay: 1000,
          timeout: 30000,
          showToast: toast,
          onProgress: (progress) => {
            if (progress.stage === 'preparing' && progress.attempt > 1) {
              toast.loading(`Retrying download (attempt ${progress.attempt}/${progress.maxRetries})...`, { id: 'download-retry' });
            }
          },
          onError: (error, attempt) => {
            console.error(`Download failed after ${attempt} attempts:`, error);
          },
        });

        if (!result.success) {
          throw result.error || new Error('Download failed');
        }
      } catch (downloadError) {
        console.error('Download utility failed, using fallback:', downloadError);
        // Fallback to original method
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.error('Download may have failed. Please check your downloads folder or try again.');
      }

      // Increment PDF download count for all paid plan users
      if (user && user.uid) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData && (userData.plan === "premium" || userData.plan === "basic" || userData.plan === "oneDay" || userData.plan === "monthly" || userData.plan === "sixMonth")) {
          const newCount = pdfDownloadCount + 1;
          await updateDoc(userRef, { pdf_download_count: newCount });
          setPdfDownloadCount(newCount);

          // Show remaining downloads message for limited plan users
          if (userData.plan === "oneDay") {
            const remaining = getPlanConfig("oneDay").downloads - newCount;
            if (remaining > 0) {
              toast.success(`Download successful! ${remaining} downloads remaining.`);
            } else {
              toast.warning(getDownloadLimitMessage("oneDay", false));
            }
          } else if (userData.plan === "basic") {
            const remaining = getPlanConfig("basic").downloads - newCount;
            if (remaining > 0) {
              toast.success(`Download successful! ${remaining} downloads remaining.`);
            } else {
              toast.warning(getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", false));
            }
          } else {
            toast.success("Download successful!");
          }
        }
      }

    } catch (err) {
      console.error('[Slideshow] Download error:', err);
      
      // Provide more specific error messages
      let errorMessage = "Failed to download PDF. ";
      
      if (err.message?.includes('timeout')) {
        errorMessage += "The file is taking too long to generate. Please try again.";
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage += "Network error. Please check your connection and try again.";
      } else if (err.message?.includes('Failed to generate PDF')) {
        errorMessage += "PDF generation failed. Please try again or contact support.";
      } else {
        errorMessage += "Please try again or contact support if the problem persists.";
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsDownloading(false);
    }
  }

  const handleUpgrade = () => {
    const billingCycle = (isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit() ? 'monthly' : 'monthly';
    const source = 'slideshow';

    if (user) {
      // User is logged in - redirect directly to checkout
      router.push(`/checkout?billingCycle=${billingCycle}&source=${source}`);
    } else {
      // User not logged in - store intent and redirect to login
      localStorage.setItem('checkoutIntent', JSON.stringify({ billingCycle, source }));
      sessionStorage.setItem('loginMessage', 'Please login to continue with your purchase');
      window.location.href = '/login';
    }
  };

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setHasInteracted(true);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    setHasInteracted(true);
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900/98 via-slate-900/98 to-gray-900/98 backdrop-blur-sm z-[9999] overflow-hidden"
    >
      {/* Progress Overlay */}
      {isDownloading && (
        <ProgressOverlay
          isVisible={isDownloading}
          type="download"
        />
      )}

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="h-full flex flex-col">
          {/* Mobile Header */}
          <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-gray-200 p-4 relative z-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {atsMode ? "ATS-Optimized Templates" : "Premium Templates"}
                </h1>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-yellow-400 fill-current" />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">
                    {atsMode ? "Optimized for ATS compatibility" : "4.9/5 from 2,000+ reviews"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Mobile Phase Indicator */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                  {slide.phase === "templates" || slide.phase === "ats-templates" ? (
                    <>
                      <Target size={12} className={slide.phase === "ats-templates" ? "text-green-600" : "text-accent"} />
                      <span className={`text-xs font-medium ${slide.phase === "ats-templates" ? "text-green-700" : "text-accent-700"}`}>
                        {current + 1}/{slides.length}
                      </span>
                    </>
                  ) : (
                    <>
                      <Palette size={12} className="text-orange-600" />
                      <span className="text-xs font-medium text-orange-700">
                        Color
                      </span>
                    </>
                  )}
                </div>
                <span className="text-sm text-gray-600">{current + 1}/{slides.length}</span>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Resume Preview with Navigation */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
            {/* Navigation Arrows - Properly positioned for mobile */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-white/90 hover:bg-white text-accent border border-gray-200 shadow-lg rounded-full w-10 h-10 flex items-center justify-center transition-all active:scale-95"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-white/90 hover:bg-white text-accent border border-gray-200 shadow-lg rounded-full w-10 h-10 flex items-center justify-center transition-all active:scale-95"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <ArrowRight size={18} />
            </button>

            {/* Scrollable Resume Preview */}
            <div className="h-full overflow-y-auto overflow-x-hidden p-4">
              <motion.div
                key={`${slide.key}-${current}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="relative bg-white rounded-lg shadow-lg border border-gray-200"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'visible'
                }}
              >
                {slide.key.startsWith('onepager_') ? (
                  <OnePagerPreview
                    data={resumeData}
                    template={slide.template.replace('onepager_', '')}
                    customColors={slide.template?.startsWith('premium_') ? {} : slide.colors}
                    language="en"
                    country="us"
                  />
                ) : (
                  <ResumePreview
                    data={resumeData}
                    template={slide.template}
                    customColors={slide.template?.startsWith('premium_') ? {} : slide.colors}
                    language="en"
                    country="us"
                    preferences={{
                      ...preferences,
                      typography: { ...(preferences.typography || {}), fontPair: slide.font },
                      skills: { ...(preferences.skills || {}), displayStyle: slide.skillsStyle.id },
                    }}
                  />
                )}

                {/* Premium Overlay - Maximum visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex items-end justify-center p-3 sm:p-4 rounded-lg">
                  {!isPremium && !isBasicPlan && !isOneDayPlan ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-white w-full"
                    >
                      <div className="bg-white/30 backdrop-blur-md rounded-full p-2 sm:p-3 mb-3 mx-auto w-fit">
                        <Lock size={18} className="sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mb-2">{slide.label}</h3>
                      <p className="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4 line-clamp-2">
                        {slide.description}
                      </p>
                      <button
                        onClick={handleUpgrade}
                        className="bg-gradient-to-r from-primary to-accent text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:from-primary-800 hover:to-accent-600 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 mx-auto"
                      >
                        <Crown size={16} className="sm:w-5 sm:h-5" />
                        Upgrade Now
                      </button>
                    </motion.div>
                  ) : (isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit() ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-white w-full"
                    >
                      <div className="bg-red-500/30 backdrop-blur-md rounded-full p-2 sm:p-3 mb-3 mx-auto w-fit">
                        <AlertTriangle size={18} className="sm:w-5 sm:h-5 text-red-300" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mb-2">Download Limit Reached</h3>
                      <p className="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4">
                        {basicPlanExpiry && new Date() >= new Date(basicPlanExpiry)
                          ? "Your Basic Plan has expired. Renew to continue downloading."
                          : getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", false)}
                      </p>
                      <button
                        onClick={() => handleUpgrade()}
                        className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:from-red-600 hover:to-orange-600 transition-all shadow-xl hover:shadow-2xl flex flex-col items-center gap-1 mx-auto"
                      >
                        <div className="flex items-center gap-2">
                          <Crown size={16} className="sm:w-5 sm:h-5" />
                          Renew Basic Plan
                        </div>
                        <div className="text-xs text-white/80 font-normal">
                          No Auto-Renewal • One-time payment
                        </div>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-white w-full"
                    >
                      <div className="bg-accent/20 backdrop-blur-sm rounded-full p-2 mb-3 mx-auto w-fit">
                        <CheckCircle size={20} className="text-accent-300" />
                      </div>
                      <h3 className="text-base font-bold mb-2">
                        {isPremium ? "Premium Unlocked" : "Basic Plan Active"}
                      </h3>
                      <p className="text-xs opacity-90 mb-3">
                        {isPremium
                          ? "Download this template instantly"
                          : `${getPlanConfig("basic").downloads - pdfDownloadCount} downloads remaining`}
                      </p>
                      <button
                        onClick={handleDownloadResume}
                        disabled={isDownloading || ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit())}
                        className={`px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-lg flex items-center gap-2 mx-auto ${isDownloading || ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit())
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-gradient-to-r from-accent to-accent-600 text-white hover:from-accent-600 hover:to-accent-700'
                          }`}
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download size={14} />
                            {(isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit() ? "Limit Reached" : "Download PDF"}
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile Bottom Section - Streamlined */}
          <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3">
            {/* Template Info - Compact */}
            <div className="text-center mb-3">
              <h3 className="font-bold text-gray-900 text-sm">{slide.label}</h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 bg-accent-50 px-2 py-1 rounded-full">
                  <LayoutGrid size={10} />
                  {slide.category}
                </span>
                {slide.phase === "colors" && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                    <Palette size={10} />
                    {slide.colorName}
                  </span>
                )}
              </div>
              {/* ATS-Specific Information */}
              {slide.phase === "ats-templates" && slide.atsScore && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    <TrendingUp size={10} />
                    ATS Score: {slide.atsScore}%
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                    <Target size={10} />
                    ATS Optimized
                  </span>
                </div>
              )}
              {slide.phase === "ats-templates" && slide.atsFeatures && (
                <div className="mt-2">
                  <div className="flex flex-wrap justify-center gap-1">
                    {slide.atsFeatures.slice(0, 3).map((feature, index) => (
                      <span key={index} className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upgrade CTA - Always Visible */}
            {!isPremium && !isBasicPlan && !isOneDayPlan ? (
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-accent text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-accent-600 transition-all shadow-lg flex items-center justify-center gap-2 border-b-4 border-primary"
                >
                  <Crown size={18} className="text-yellow-300" />
                  Upgrade to Premium
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit() ? (
              <button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-4 rounded-xl font-bold text-sm hover:from-red-600 hover:to-orange-600 transition-all shadow-lg flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-2">
                  <Crown size={16} />
                  Renew Basic Plan
                </div>
                <div className="text-xs text-white/80 font-normal">
                  No Auto-Renewal • One-time payment
                </div>
              </button>
            ) : (
              <button
                onClick={handleDownloadResume}
                disabled={isDownloading || ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit())}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${isDownloading || ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit())
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-accent to-accent-600 text-white hover:from-accent-600 hover:to-accent-700'
                  }`}
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    {isBasicPlan && hasReachedDownloadLimit() ? "Limit Reached" : "Download PDF"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div className="h-full flex" style={{ minWidth: "0" }}>
          {/* Desktop Sidebar */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-72 bg-white/95 backdrop-blur-md p-6 space-y-6 border-r border-gray-200 overflow-y-auto flex-shrink-0"
            style={{ maxHeight: '100vh' }}
          >
            {/* Premium Badge */}
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full shadow-lg mb-4"
              >
                <Crown size={20} />
                <span className="font-bold">Premium Gallery</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {slides.length} Professional Templates
              </h2>
              <p className="text-gray-600 text-sm">
                Professional templates designed to help you create standout resumes
              </p>
            </div>

            {/* Success Stats */}
            <div className="grid grid-cols-2 gap-3">
              {SUCCESS_STATS.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="bg-white rounded-xl p-3 text-center shadow-sm border"
                >
                  <stat.icon className={`${stat.color} w-6 h-6 mx-auto mb-1`} />
                  <div className="font-bold text-lg text-gray-900">{stat.stat}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial Carousel */}
            <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-4 border border-accent/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showTestimonial}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{TESTIMONIALS[showTestimonial].avatar}</span>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        {TESTIMONIALS[showTestimonial].name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {TESTIMONIALS[showTestimonial].role}
                      </div>
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 italic">
                    "{TESTIMONIALS[showTestimonial].text}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Current Template Info */}
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Current Style</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Template</span>
                  <span className="text-sm font-medium">{slide.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Color Scheme</span>
                  <span className="text-sm font-medium">{slide.colorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Personality</span>
                  <span className="text-sm font-medium">{slide.personality}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 italic">{slide.description}</p>
            </div>

            {/* Urgency Timer */}
            {viewTime > 30 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-red-500" size={16} />
                  <span className="text-sm font-semibold text-red-700">Limited Time</span>
                </div>
                <p className="text-xs text-red-600 mb-3">
                  Join thousands of professionals who upgraded to premium templates
                </p>
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:from-red-600 hover:to-orange-600 transition-all"
                >
                  Upgrade Now - Limited Offer
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Desktop Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Desktop Header - Fixed and Visible */}
            <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-gray-200 p-4 relative z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-bold text-gray-900">Premium Templates</h1>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">4.9/5 from 2,000+ reviews</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Strategic Phase Indicator */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                    {slide.phase === "templates" ? (
                      <>
                        <LayoutGrid size={14} className="text-accent" />
                        <span className="text-xs font-medium text-accent-700">
                          Layout {current + 1}/21
                        </span>
                      </>
                    ) : (
                      <>
                        <Palette size={14} className="text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">
                          Color Variant
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {current + 1} / {slides.length}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Template Discovery Progress</span>
                  <span>{Math.round(((current + 1) / slides.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-accent to-accent h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((current + 1) / slides.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>

            {/* Desktop Resume Preview Area */}
            <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-white overflow-hidden" style={{ minWidth: "0" }}>

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white hover:bg-accent-50 text-accent border border-gray-200 shadow-lg rounded-full w-12 h-12 flex items-center justify-center transition-all group"
              >
                <ArrowLeft size={20} className="group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white hover:bg-accent-50 text-accent border border-gray-200 shadow-lg rounded-full w-12 h-12 flex items-center justify-center transition-all group"
              >
                <ArrowRight size={20} className="group-hover:scale-110 transition-transform" />
              </button>

              {/* Scrollable Resume Preview */}
              <div className="h-full overflow-y-auto overflow-x-auto p-6" style={{ minWidth: "fit-content" }}>
                <motion.div
                  key={`${slide.key}-${current}`}
                  initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="relative bg-white rounded-2xl shadow-2xl border-2 border-gray-200 mx-auto"
                  style={{
                    maxWidth: "900px",
                    width: "100%",
                    minHeight: "fit-content",
                    overflow: "visible"
                  }}
                >
                  {/* Premium Shine Effect */}
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-10"
                  />

                  <div className="w-full" style={{ overflow: "visible", padding: "20px", maxWidth: "100%" }}>
                    {slide.key.startsWith('onepager_') ? (
                      <OnePagerPreview
                        data={resumeData}
                        template={slide.template.replace('onepager_', '')}
                        customColors={slide.template?.startsWith('premium_') ? {} : slide.colors}
                        language="en"
                        country="us"
                      />
                    ) : (
                      <ResumePreview
                        data={resumeData}
                        template={slide.template}
                        customColors={slide.template?.startsWith('premium_') ? {} : slide.colors}
                        language="en"
                        country="us"
                        preferences={{
                          ...preferences,
                          typography: { ...(preferences.typography || {}), fontPair: slide.font },
                          skills: { ...(preferences.skills || {}), displayStyle: slide.skillsStyle.id },
                        }}
                        manualScale={0.9}
                        style={{
                          width: "100%",
                          minHeight: "auto",
                          overflow: "visible",
                          transform: "scale(0.9)",
                          transformOrigin: "top left",
                          maxWidth: "100%"
                        }}
                      />
                    )}
                  </div>

                  {/* Premium Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center p-6">
                    {!isPremium && !isBasicPlan && !isOneDayPlan ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white"
                      >
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mb-4 mx-auto w-fit">
                          <Lock size={24} className="text-white" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{slide.label}</h3>
                        <p className="text-sm opacity-90 mb-4 max-w-sm">
                          {slide.description}
                        </p>
                        <button
                          onClick={handleUpgrade}
                          className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-full font-semibold hover:from-primary-800 hover:to-accent-600 transition-all shadow-lg flex items-center gap-2 mx-auto"
                        >
                          <Crown size={16} />
                          Upgrade to Premium
                        </button>
                      </motion.div>
                    ) : (isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit() ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white"
                      >
                        <div className="bg-red-500/20 backdrop-blur-sm rounded-full p-3 mb-4 mx-auto w-fit">
                          <AlertTriangle size={24} className="text-red-300" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Download Limit Reached</h3>
                        <p className="text-sm opacity-90 mb-4 max-w-sm">
                          {basicPlanExpiry && new Date() >= new Date(basicPlanExpiry)
                            ? "Your Basic Plan has expired. Renew to continue downloading professional templates."
                            : getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", false)}
                        </p>
                        <button
                          onClick={() => handleUpgrade()}
                          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg flex flex-col items-center gap-1 mx-auto"
                        >
                          <div className="flex items-center gap-2">
                            <Crown size={16} />
                            Renew Basic Plan
                          </div>
                          <div className="text-xs text-white/80 font-normal">
                            No Auto-Renewal • One-time payment
                          </div>
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white"
                      >
                        <div className="bg-accent/20 backdrop-blur-sm rounded-full p-3 mb-4 mx-auto w-fit">
                          <CheckCircle size={24} className="text-accent-300" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">
                          {isPremium ? "Premium Unlocked" : "Basic Plan Active"}
                        </h3>
                        <p className="text-sm opacity-90 mb-4">
                          {isPremium
                            ? "Download this beautiful template instantly"
                            : `${getPlanConfig("basic").downloads - pdfDownloadCount} downloads remaining`}
                        </p>
                        <button
                          onClick={handleDownloadResume}
                          disabled={isDownloading || ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit())}
                          className={`px-6 py-3 rounded-full font-semibold transition-all shadow-lg flex items-center gap-2 mx-auto ${isDownloading || ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit())
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-gradient-to-r from-accent to-accent-600 text-white hover:from-accent-600 hover:to-accent-700'
                            }`}
                        >
                          {isDownloading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              {(isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit() ? "Limit Reached" : "Download PDF"}
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Desktop Bottom Bar */}
            <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{slide.label}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 bg-accent-50 px-2 py-1 rounded-full">
                      <LayoutGrid size={12} />
                      {slide.category}
                    </span>
                    {slide.phase === "colors" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                        <Palette size={12} />
                        {slide.colorName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 bg-accent-50 px-2 py-1 rounded-full">
                        <Eye size={12} />
                        Layout Preview
                      </span>
                    )}
                  </div>

                  {!isPremium && (
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} className="text-accent" />
                        ATS Optimized
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} className="text-accent" />
                        Interview Ready
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} className="text-accent" />
                        1-Click Download
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isPremium && !isBasicPlan && !isOneDayPlan ? (
                    <>
                      <div className="flex flex-col items-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setHasInteracted(true);
                            handleUpgrade();
                          }}
                          className={`${isShineSource ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-gradient-to-r from-primary to-accent hover:from-primary-800 hover:to-accent-600 shadow-accent-100'} text-white px-4 py-2 sm:px-8 sm:py-3 rounded-xl font-bold transition-all shadow-xl flex items-center gap-2 border-b-4 ${isShineSource ? 'border-orange-700' : 'border-primary'}`}
                        >
                          <Crown size={18} className={`${isShineSource ? 'text-yellow-200' : 'text-yellow-300'} animate-pulse`} />
                          <div className="flex flex-col items-start leading-tight">
                            <span>Upgrade to Premium</span>
                            <span className="text-[10px] opacity-80 font-medium">Remove Watermark & Save Unlimited</span>
                          </div>
                          <ArrowRight size={16} className="ml-1" />
                        </motion.button>
                        {isShineSource && (
                          <span className="text-[10px] text-orange-600 mt-1.5 font-bold flex items-center gap-1">
                            <Sparkles size={10} /> Exclusive Shine Trial Pack Active
                          </span>
                        )}
                      </div>

                      {hasInteracted && (
                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => window.open("/pricing", "_blank")}
                          className="text-accent hover:text-accent-700 font-medium text-sm underline"
                        >
                          View Pricing
                        </motion.button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-4 w-full">
                      {/* One-Time Download Option */}
                      {/* Removed One-Time Download Option as per Sachet Strategy */}

                      {/* Logic for Existing Plan Limits */}
                      {(isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit() ? (
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleUpgrade}
                            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg flex flex-col items-center gap-1"
                          >
                            <div className="flex items-center gap-2">
                              <Crown size={16} />
                              Renew Basic Plan
                            </div>
                            <div className="text-xs text-white/80 font-normal">
                              No Auto-Renewal • One-time payment
                            </div>
                          </motion.button>
                          <span className="text-sm text-red-600 font-medium">
                            Download limit reached
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={!(isDownloading || ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit())) ? { scale: 1.05 } : {}}
                            whileTap={!(isDownloading || ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit())) ? { scale: 0.95 } : {}}
                            onClick={handleDownloadResume}
                            disabled={isDownloading || ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit())}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2 ${isDownloading || ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit())
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'bg-gradient-to-r from-accent to-accent-600 text-white hover:from-accent-600 hover:to-accent-700'
                              }`}
                          >
                            {isDownloading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download size={16} />
                                {(isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit() ? "Download Limited" : "Download This Template"}
                              </>
                            )}
                          </motion.button>
                          {(isBasicPlan || isOneDayPlan) && !hasReachedDownloadLimit() && (
                            <span className="text-sm text-gray-600">
                              {isOneDayPlan ? (getPlanConfig("oneDay").downloads - pdfDownloadCount) : (getPlanConfig("basic").downloads - pdfDownloadCount)} downloads left
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }


      {/* Enterprise Upgrade Modal */}

      {/* EXIT INTENT POPUP */}
      <AnimatePresence>
        {showExitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
            >
              <button
                onClick={() => setShowExitPopup(false)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="bg-gradient-to-r from-primary to-accent p-6 text-white text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Clock className="w-6 h-6 text-white animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-1">Wait! Don't Miss Out</h3>
                <p className="text-accent-100 text-sm">Your download is ready and waiting.</p>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                  <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                  <p className="text-sm text-yellow-800 font-medium">
                    Offer expires in <span className="font-bold text-red-600">{formatTime(popupCountdown)}</span>
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Shield size={16} className="text-green-500" />
                    <span>Secure one-time payment (No subscription)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Sparkles size={16} className="text-primary" />
                    <span>Instant PDF download + Editable version</span>
                  </li>
                </ul>

                <button
                  onClick={() => {
                    setShowExitPopup(false);
                    handleOneTimePayment(true);
                  }}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-primary-700 hover:shadow-primary-200 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  <span>Download Now {isShineSource ? (currency === 'USD' ? '($2.99)' : '(₹19)') : (currency === 'USD' ? '($2.99)' : <>(₹99)</>)}</span>
                </button>

                <button
                  onClick={() => {
                    setShowExitPopup(false);
                    onClose();
                  }}
                  className="w-full mt-3 py-2 text-gray-500 text-sm font-medium hover:text-gray-700"
                >
                  No thanks, I'll lose my resume
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Default Resume Warning Modal */}
      <AnimatePresence>
        {showDefaultResumeWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
            >
              <div className="bg-amber-500 p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">Wait! This looks like a sample.</h3>
                <p className="text-amber-100 text-sm">You haven't customised your resume yet.</p>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-center mb-6">
                  It seems you are trying to download the <strong>Default Template</strong> with the name "John Doe".
                  <br /><br />
                  Paying now would result in a generic resume. We recommend you edit your details first!
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowDefaultResumeWarning(false);
                      onClose(); // Close the modal to let them edit
                    }}
                    className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-amber-600 hover:shadow-amber-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={18} />
                    <span>Go Back & Edit Resume</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDefaultResumeWarning(false);
                      handleUpgrade();
                    }}
                    className="w-full py-2 text-primary text-sm font-bold hover:text-primary-700 underline"
                  >
                    Upgrade to Download Premium Templates
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div >,
    document.body
  );
}