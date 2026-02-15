import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, AlertTriangle, X, Share2, Sparkles, Zap, Download, Clock, Shield, Crown, ArrowRight, Mail, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import DownloadFAQ from './DownloadFAQ';
import PostDownloadSurvey from './PostDownloadSurvey';
import { emailPDF } from '../lib/downloadUtils';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getEffectivePricing, formatPrice } from "../lib/globalPricing";
import { useLocation } from "../context/LocationContext";
import { getDownloadLimitMessage, getPlanConfig, ADDON_CONFIG } from "../lib/planConfig";
import { logActivity, ACTIVITY_TYPES, getAdminId } from "../lib/teamManagement";

// Device detection utility
const detectDevice = () => {
  if (typeof window === "undefined") return "desktop";

  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/i.test(userAgent);

  if (isAndroid) return "android";
  if (isIOS) return "ios";
  return "desktop";
};

// Device-based pricing logic
const getDeviceBasedPricing = (currency) => {
  const device = detectDevice();

  if (currency === "USD") {
    return {
      basic: 1000, // $10 for all devices
      monthly: 2400, // $24 for all devices
      yearly: 24000 // $240 for all devices
    };
  }

  // INR pricing with device-based logic
  if (device === "android") {
    return {
      basic: 19900, // ₹199 for Android
      monthly: 39900, // ₹399 for Android
      yearly: 319900 // ₹3,199 for Android
    };
  } else {
    // Desktop and iOS get higher pricing
    return {
      basic: 19900, // ₹199 for Desktop/iOS
      monthly: 39900, // ₹399 for Desktop/iOS
      yearly: 319900 // ₹3,199 for Desktop/iOS
    };
  }
};

const PremiumPdfPreview = ({
  isOpen,
  onClose,
  pdfPreviewUrl,
  pdfPreviewBlob,
  isPremium,
  user,
  handleUpgradeClick,
  monthlyPrice,
  basicPrice,
  event,
  toast,
  enterpriseMode = false,
  adminIsPremium = false,
  resumeName = "Resume",

  candidateName = null,
  resumeData = null,
  currency = "INR"
}) => {
  const modalRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false); // Exit intent state
  const [popupCountdown, setPopupCountdown] = useState(15 * 60); // 15 min countdown for popup
  const [showDefaultResumeWarning, setShowDefaultResumeWarning] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showDownloadSurvey, setShowDownloadSurvey] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(true);

  // Check if resume is still using default data
  const isDefaultResume = () => {
    if (!resumeData) return false;

    console.log("Debug Default Detection:", {
      name: resumeData.name,
      email: resumeData.email,
      isJohnDoe: resumeData.name === "John Doe",
      isDefaultEmail: resumeData.email === "john.doe@example.com" || resumeData.email === "john.doe@email.com"
    });

    // Check primarily for the default name "John Doe"
    // This catches cases where email might have been updated by login but name wasn't
    return resumeData.name === "John Doe";
  };

  // Determine effective premium status - team members inherit admin's premium status
  const effectiveIsPremium = enterpriseMode ? adminIsPremium : isPremium;
  const [pdfScale, setPdfScale] = useState(1);

  // Use props if provided,
  const isAndroidDevice = detectDevice() === "android";
  const pricing = getEffectivePricing(currency, isAndroidDevice);
  const isINR = currency === "INR";
  let effectiveBasicPrice = basicPrice || pricing.basic;
  let effectiveMonthlyPrice = monthlyPrice || pricing.monthly;

  // For USD, always use monthly price for all devices; for INR, use basic for Android, monthly for others
  if (pricing.currency === 'USD' || (!isAndroidDevice && pricing.currency === 'INR')) {
    effectiveBasicPrice = monthlyPrice || pricing.monthly;
  }

  // Helper function to get correct duration based on price
  const getDurationText = (price) => {
    if (pricing.currency === "USD") {
      return "(30 days)";
    }
    // INR pricing
    if (price === 19900) return "(7 days)"; // ₹199
    if (price === 39900) return "(30 days)"; // ₹399
    if (price === 319900) return "(1 year)"; // ₹3,199
    return "(30 days)"; // Default fallback
  };

  // Basic plan state management
  const [isBasicPlan, setIsBasicPlan] = useState(false);
  const [isOneDayPlan, setIsOneDayPlan] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [basicPlanExpiry, setBasicPlanExpiry] = useState(null);
  const [oneDayPlanExpiry, setOneDayPlanExpiry] = useState(null);
  const [pdfDownloadCount, setPdfDownloadCount] = useState(0);
  const [latestPayment, setLatestPayment] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // State to track if user came from Shine
  const [isShineSource, setIsShineSource] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  }, []);

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
      // Also check configured partner storage if URL param is lost during nav
      const storedReferrer = localStorage.getItem('expertresume_referrer');

      if (utmSource === 'shine' || (storedReferrer && JSON.parse(storedReferrer).source === 'shine')) {
        isShineSource = true;
      }
    }

    // Determine price
    const payAmount = isShineSource ? 1900 : (pricing.currency === 'USD' ? 299 : 9900);
    const displayAmount = isShineSource ? 19 : (pricing.currency === 'USD' ? 2.99 : 99);

    setIsProcessingPayment(true);
    // Track Checkout Initiated
    event({
      action: "one_time_payment_initiated",
      category: "Payment",
      label: isShineSource ? "OneTimeDownload_Shine" : "OneTimeDownload",
      value: displayAmount
    });

    try {
      // Create Stripe checkout session via API
      const response = await fetch('/api/create-guest-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: pricing.currency,
          source: isShineSource ? 'shine' : null,
          userInfo: {
            email: user?.email || "",
            name: candidateName || "Guest User",
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
        label: "OneTimeDownload",
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

  // Enhanced close handler for mobile scroll restoration
  const handleModalClose = () => {
    // Immediate body scroll restoration for mobile
    if (isMobile) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.height = '';

      // Force a reflow to ensure styles are applied
      document.body.offsetHeight;
    }
    onClose();
  };

  // Fetch latest payment from payment_logs to determine actual plan type
  const fetchLatestPayment = async (userId) => {
    console.log('🔍 Fetching latest payment for user:', userId);
    try {
      const response = await fetch(`/api/payment-logs?userId=${userId}`);
      console.log('📄 Payment API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('💳 Payment API data:', data);

      const { transactions } = data;

      if (transactions && transactions.length > 0) {
        // Filter for successful payments and sort by timestamp (most recent first)
        const successfulPayments = transactions
          .filter(payment => payment.status === "success")
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.log('✅ Successful payments found:', successfulPayments.length);

        if (successfulPayments.length > 0) {
          const latestPayment = successfulPayments[0];
          console.log('💳 Latest successful payment:', latestPayment);
          setLatestPayment(latestPayment);

          // Check if this is a basic plan purchase
          if (latestPayment.billingCycle === "basic") {
            console.log('🎯 Basic plan detected!');
            const paymentDate = new Date(latestPayment.timestamp);
            const expiryDate = new Date(paymentDate.getTime() + (getPlanConfig("basic").duration * 24 * 60 * 60 * 1000)); // Basic plan duration from config
            const isBasicValid = new Date() < expiryDate;

            console.log('📅 Basic plan validation:', {
              paymentDate,
              expiryDate,
              isBasicValid,
              currentDate: new Date()
            });

            setIsBasicPlan(isBasicValid);
            setBasicPlanExpiry(expiryDate.toISOString());

            return { isBasic: true, isValid: isBasicValid, expiry: expiryDate };
          } else {
            console.log('❌ Not a basic plan, billingCycle:', latestPayment.billingCycle);
            setIsBasicPlan(false);
            return { isBasic: false, isValid: false };
          }
        } else {
          console.log('❌ No successful payment logs found');
          setIsBasicPlan(false);
          return { isBasic: false, isValid: false };
        }
      } else {
        console.log('❌ No payment logs found');
        setIsBasicPlan(false);
        return { isBasic: false, isValid: false };
      }
    } catch (error) {
      console.error("Error fetching latest payment:", error);
      setIsBasicPlan(false);
      return { isBasic: false, isValid: false };
    }
  };

  // Track user's plan status (oneDay and basic plans) - Same logic as ResumeSlideshowModal
  useEffect(() => {
    if (user) {
      console.log('👤 [PdfPreview] Setting up user snapshot listener for:', user.uid);
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
        const data = docSnapshot.data();
        console.log('📊 [PdfPreview] User data received:', { plan: data?.plan, pdf_download_count: data?.pdf_download_count, premium_expiry: data?.premium_expiry });

        if (data) {
          const downloadCount = data.pdf_download_count || 0;
          setPdfDownloadCount(downloadCount);
          console.log('📥 [PdfPreview] PDF download count updated to:', downloadCount);

          // Check if user has oneDay plan - Rely primarily on planType
          if (data.plan === "oneDay") {
            console.log('🎯 [PdfPreview] One Day plan detected from user data!');
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
            console.log('📅 [PdfPreview] OneDay plan validity:', {
              isOneDayValid,
              expiry: data.premium_expiry,
              hasExpiry: !!data.premium_expiry
            });
          }
          // Check if user has basic plan - Rely primarily on planType
          else if (data.plan === "basic") {
            console.log('🎯 [PdfPreview] Basic plan detected from user data!');
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
            console.log('📅 [PdfPreview] Basic plan validity:', {
              isBasicValid,
              expiry: data.premium_expiry,
              hasExpiry: !!data.premium_expiry
            });
          } else if (data.plan === "premium") {
            // If user has premium plan, check payment_logs to see if it's actually a limited plan
            console.log('✨ [PdfPreview] User has premium plan, checking if it\'s actually basic...');
            await fetchLatestPayment(user.uid);
          } else {
            console.log('👤 [PdfPreview] User plan is not premium, basic, or oneDay:', data.plan);
            setIsBasicPlan(false);
            setIsOneDayPlan(false);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Check if basic plan or oneDay plan user has reached download limit - Same logic as ResumeSlideshowModal
  const hasReachedDownloadLimit = () => {
    // Debug logging
    console.log('🔍 [PdfPreview] Download limit check:', {
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
          console.log('❌ [PdfPreview] OneDay plan expired, blocking download');
          return true; // Plan expired, needs renewal
        }
      }

      // Check if user has reached or exceeded download limit
      if (pdfDownloadCount >= getPlanConfig("oneDay").downloads) {
        console.log('❌ [PdfPreview] OneDay download limit reached, blocking download');
        return true; // Download limit reached
      }
    }

    // Check basic plan (downloads and duration from config)
    if (isBasicPlan) {
      // Check if basic plan has expired (only if expiry exists)
      if (basicPlanExpiry) {
        const isExpired = new Date() >= new Date(basicPlanExpiry);
        if (isExpired) {
          console.log('❌ [PdfPreview] Basic plan expired, blocking download');
          return true; // Plan expired, needs renewal
        }
      }

      // Check if user has reached or exceeded download limit
      if (pdfDownloadCount >= getPlanConfig("basic").downloads) {
        console.log('❌ [PdfPreview] Basic download limit reached, blocking download');
        return true; // Download limit reached
      }
    }

    console.log('✅ [PdfPreview] Download allowed');
    return false;
  };

  // Handle PDF download with basic plan and oneDay plan limit checks - Same logic as ResumeSlideshowModal
  const handleDownloadPDF = async () => {
    console.log('🎯 [PdfPreview] Download PDF clicked!', { isBasicPlan, isOneDayPlan, pdfDownloadCount });

    // Check plan download limits first - prevent download if already at limit
    if ((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit()) {
      console.log('🚫 [PdfPreview] Download blocked by limit check');
      const isExpired = (basicPlanExpiry && new Date() >= new Date(basicPlanExpiry)) ||
        (oneDayPlanExpiry && new Date() >= new Date(oneDayPlanExpiry));
      let message;
      message = getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", isExpired);

      toast.error(message);
      handleUpgradeClick("basic"); // Redirect to upgrade
      return;
    }

    console.log('✅ [PdfPreview] Proceeding with download...');

    console.log('✅ Proceeding with download...');

    let urlToDownload = pdfPreviewUrl;
    let tempUrl = null;
    if (pdfPreviewBlob) {
      tempUrl = window.URL.createObjectURL(pdfPreviewBlob);
      urlToDownload = tempUrl;
    }

    // Generate versioned filename with date and version
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS

    // Clean candidate name for filename (remove special characters)
    const cleanCandidateName = candidateName
      ? candidateName.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '_')
      : null;

    // Clean resume name for filename (remove special characters)
    const cleanResumeName = resumeName.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '_');

    // Get current download count to use as version number
    const versionNumber = pdfDownloadCount + 1;

    // Build filename: Name_ResumeTitle_vX_Date.pdf
    const filenameParts = [];
    if (cleanCandidateName) {
      filenameParts.push(cleanCandidateName);
    }
    filenameParts.push(cleanResumeName);
    filenameParts.push(`v${versionNumber}`);
    filenameParts.push(dateStr);

    const filename = `${filenameParts.join('_')}.pdf`;

    // Use robust download utility with retry and error handling
    try {
      const { downloadPDF } = await import('../lib/downloadUtils');
      
      // Use blob if available, otherwise use URL
      const source = pdfPreviewBlob || urlToDownload;
      
      const result = await downloadPDF(source, filename, {
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

      console.log(`📥 Downloaded: ${filename} (method: ${result.method})`);
      setDownloadSuccess(true);
      // Show post-download survey after successful download
      setTimeout(() => {
        setShowDownloadSurvey(true);
      }, 1000);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadSuccess(false);
      // Fallback to original method if utility fails
      const link = document.createElement('a');
      link.href = urlToDownload;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (tempUrl) {
        window.URL.revokeObjectURL(tempUrl);
      }
      toast.error('Download may have failed. Please check your downloads folder or try again.');
      // Show survey even on failure to capture issues
      setTimeout(() => {
        setShowDownloadSurvey(true);
      }, 1000);
    }

    // Track download event
    event({
      action: "download_pdf",
      category: "PDF",
      label: effectiveIsPremium ? "PremiumDownload" : (isBasicPlan ? "BasicDownload" : "FreeDownload"),
    });

    // Increment PDF download count for all paid plan users
    if (user && user.uid) {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      if (userData && (userData.plan === "premium" || userData.plan === "basic" || userData.plan === "oneDay" || userData.plan === "monthly" || userData.plan === "sixMonth")) {
        const newCount = pdfDownloadCount + 1;
        await updateDoc(userRef, { pdf_download_count: newCount });
        setPdfDownloadCount(newCount);

        // Log activity for team management
        try {
          // Get admin ID for proper activity logging
          const adminId = enterpriseMode ? await getAdminId(user.uid) : user.uid;
          await logActivity(adminId || user.uid, user.uid, ACTIVITY_TYPES.PDF_DOWNLOADED, {
            resumeName: "Resume PDF",
            format: "PDF",
            downloadCount: newCount,
            plan: userData.plan,
          });
        } catch (error) {
          console.error("Error logging PDF download activity:", error);
        }

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
  };

  // Handle email PDF
  const handleEmailPDF = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please sign in to use the email feature');
      // Optionally trigger login modal or redirect
      return;
    }

    // Check if user has Premium or Basic plan
    if (!effectiveIsPremium && !isBasicPlan && !isOneDayPlan) {
      toast.error('Email PDF is available for Premium users only');
      handleUpgradeClick("basic");
      return;
    }

    if (!pdfPreviewBlob) {
      toast.error('PDF not available for email');
      return;
    }

    setIsEmailing(true);
    const loadingToast = toast.loading('Sending PDF to your email...');

    try {
      // Clean candidate name for filename (remove special characters)
      const cleanCandidateName = candidateName
        ? candidateName.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '_')
        : null;

      // Clean resume name for filename (remove special characters)
      const cleanResumeName = resumeName.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '_');
      
      const filename = `${cleanCandidateName || 'Resume'}_${cleanResumeName || 'resume'}.pdf`;
      
      const result = await emailPDF(
        pdfPreviewBlob,
        user.email,
        filename,
        {
          userId: user.uid,
          resumeName: resumeName || cleanResumeName,
          showToast: null, // We'll handle toast manually
        }
      );

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(`PDF sent successfully to ${user.email}!`);
        event({
          action: "email_pdf",
          category: "PDF",
          label: effectiveIsPremium ? "PremiumEmail" : (isBasicPlan ? "BasicEmail" : "OneDayEmail"),
        });
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email PDF error:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to send PDF via email: ${error.message || 'Please try again'}`);
    } finally {
      setIsEmailing(false);
    }
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when modal is open - Enhanced mobile support
  useEffect(() => {
    if (isOpen) {
      // Store original scroll position and styles
      const scrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalHeight = document.body.style.height;

      // Apply scroll lock styles
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Mobile-specific: prevent height issues
      if (isMobile) {
        document.body.style.height = '100%';
      }

      return () => {
        // Restore original styles
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.height = originalHeight;

        // Restore scroll position
        window.scrollTo(0, scrollY);

        // Mobile-specific: Force scroll restoration after a tiny delay
        if (isMobile) {
          setTimeout(() => {
            window.scrollTo(0, scrollY);
            // Ensure the page can scroll again
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.height = '';
          }, 10);
        }
      };
    }
  }, [isOpen, isMobile]);

  // Enhanced touch handling for iOS
  useEffect(() => {
    if (!isOpen || !isMobile || !modalRef.current) return;

    const modalElement = modalRef.current;
    const pdfContainer = pdfContainerRef.current;

    // Handle touch start
    const handleTouchStart = (e) => {
      setTouchStartY(e.touches[0].clientY);
      setIsScrolling(false);
    };

    // Handle touch move with intelligent scroll delegation
    const handleTouchMove = (e) => {
      if (!touchStartY) return;

      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      const scrollTop = modalElement.scrollTop;
      const scrollHeight = modalElement.scrollHeight;
      const clientHeight = modalElement.clientHeight;

      // Determine if we're at scroll boundaries
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // If trying to scroll up when at top, or down when at bottom, prevent default
      if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
        e.preventDefault();
        return;
      }

      // For PDF container, we want the modal to handle scrolling on mobile
      if (pdfContainer && pdfContainer.contains(e.target)) {
        // Don't prevent default, let the modal handle the scroll
        setIsScrolling(true);
      }
    };

    // Handle touch end
    const handleTouchEnd = () => {
      setTouchStartY(0);
      setIsScrolling(false);
    };

    // Add event listeners with passive: false for iOS
    modalElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    modalElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    modalElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      modalElement.removeEventListener('touchstart', handleTouchStart);
      modalElement.removeEventListener('touchmove', handleTouchMove);
      modalElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, isMobile, touchStartY]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleModalClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleModalClose]);



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

  useEffect(() => {
    if (pdfContainerRef.current) {
      const contentWidth = pdfContainerRef.current.scrollWidth || 700; // fallback to 700px
      const viewportWidth = window.innerWidth;
      const padding = viewportWidth < 640 ? 16 : 32;
      const availableWidth = viewportWidth - padding;
      if (contentWidth > availableWidth) {
        setPdfScale(availableWidth / contentWidth);
      } else {
        setPdfScale(1);
      }
    }
  }, [pdfPreviewUrl, isMobile, isOpen]);

  // Use portal to render at root level (like ResumeSlideshowModal) for full screen overlay
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-[9999] flex flex-col overflow-hidden"
      style={{
        // iOS Safari fixes
        height: '100vh',
        height: '100dvh', // Dynamic viewport height for iOS
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={(e) => e.target === e.currentTarget && handleModalClose()}
    >
      {/* Modal Container - Full Height with Proper Scrolling */}
      <div
        className="flex-1 flex flex-col w-full h-full"
        style={{
          maxWidth: isMobile ? '100vw' : '1152px', // Full width on mobile, max-width on desktop
          margin: isMobile ? '0' : '0 auto',
          height: '100%',
        }}
      >

        {/* Header - Fixed at top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex-shrink-0 bg-white/95 backdrop-blur-md shadow-lg"
          style={{
            // Ensure header doesn't get cut off on iOS
            minHeight: 'auto',
            zIndex: 10,
          }}
        >
          <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4 sm:p-6'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <Eye size={16} className="text-white" />
              </div>
              <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-lg sm:text-xl'}`}>
                Resume Preview
              </h2>
              {!effectiveIsPremium && !isMobile && (
                <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary-100 to-accent-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                  <Sparkles size={12} />
                  <span>Ready to Download</span>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleModalClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close preview"
            >
              <X size={20} />
            </motion.button>
          </div>


          {/* Upgrade Banner for Non-Premium Users */}
          {!effectiveIsPremium && !isBasicPlan && !isOneDayPlan && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="bg-gradient-to-r from-accent-50 to-primary-50 border-t border-accent/20"
              style={{ padding: isMobile ? '12px 16px' : '12px 24px' }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  <AlertTriangle className="text-accent mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className={`font-semibold text-primary flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                      <Zap size={14} className="text-yellow-500" />
                      Premium Feature
                    </p>
                    <p className={`text-accent-700 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                      Download this professional resume now
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex flex-col items-center w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpgradeClick()}
                      className={`${isShineSource ? 'bg-orange-500 hover:bg-orange-600' : 'bg-accent hover:bg-accent-600'} text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 border-b-4 ${isShineSource ? 'border-orange-700' : 'border-primary'} w-full sm:w-auto`}
                    >
                      <Crown size={18} className="text-yellow-300" />
                      <div className="flex flex-col items-start leading-tight text-left">
                        <span className="text-sm">Upgrade to Premium</span>
                        <span className="text-[10px] opacity-80 font-normal">Starting {isINR ? '₹199' : '$14'} • Remove Watermark</span>
                      </div>
                      <ArrowRight size={16} />
                    </motion.button>
                    {isShineSource && (
                      <span className="text-[10px] text-orange-600 mt-1.5 font-bold">Shine Special Trial Pack Active</span>
                    )}
                  </div>

                  <div className="flex flex-col items-center w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpgradeClick("basic")}
                      className={`bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all font-semibold shadow-md whitespace-nowrap px-4 py-2 text-xs sm:text-sm w-full sm:w-auto shadow-primary-100`}
                    >
                      <span>Get Premium {getDurationText(effectiveBasicPrice)}</span>
                    </motion.button>
                    <span className="text-[10px] opacity-0 mt-1 font-medium select-none">One-time download.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content - Scrollable Area with Enhanced Mobile Support */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex-1 overflow-y-auto bg-white"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
            // iOS specific fixes
            minHeight: 0, // Allow flex shrinking
            height: '100%',
          }}
        >
          <div
            className="space-y-6 pb-32"
            style={{
              padding: isMobile ? '8px' : '16px 24px',
              minHeight: '100%',
            }}
          >

            {/* Preview Mode Notice - Commented out by user */}
            {/*  {!isPremium && (
              <div className={`bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Eye size={14} />
                    <span className="font-medium text-sm">Preview Mode - Upgrade to Download</span>
                  </div>
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs text-slate-600 font-medium"
                  >
                    Premium Available
                  </motion.div>
                </div>
              </div>
            )} */}

            {/* PDF Viewer - Optimized for iOS Safari */}
            <div
              className="relative border-2 border-gray-200 rounded-xl overflow-hidden shadow-xl"
              style={{
                margin: isMobile ? '0' : 'auto',
                width: isMobile ? 'auto' : 'fit-content',
                maxWidth: isMobile ? '100%' : '794px',
                boxSizing: 'border-box',
                display: isMobile ? 'block' : 'flex',
                justifyContent: isMobile ? undefined : 'center',
              }}
            >
              <div
                ref={pdfContainerRef}
                className="relative"
                style={{
                  width: isMobile ? '100vw' : '794px',
                  margin: isMobile ? '0' : '0 auto',
                  transform: isMobile ? undefined : `scale(${pdfScale})`,
                  transformOrigin: isMobile ? undefined : 'top center',
                  ...(isMobile && {
                    touchAction: 'none',
                    pointerEvents: 'none',
                    overflow: 'hidden',
                  })
                }}
              >
                <iframe
                  src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="border-0"
                  style={{
                    width: isMobile ? '100vw' : '794px',
                    height: isMobile ? 'calc(70vh - 60px)' : 'min(70vh, 800px)',
                    minHeight: isMobile ? '500px' : '400px',
                    display: 'block',
                    backgroundColor: 'white',
                  }}
                  title="PDF Preview"
                  aria-label="Resume preview"
                  onContextMenu={(e) => e.preventDefault()}
                  key={isMobile ? 'mobile-pdf-fullwidth' : 'desktop-pdf'}
                />

                {/* Mobile Touch Layer - iOS Safari optimized */}
                {isMobile && (
                  <div
                    className="absolute inset-0 bg-transparent"
                    style={{
                      touchAction: 'pan-y',
                      pointerEvents: 'auto',
                      zIndex: 1,
                      width: '100%',
                      height: '100%',
                    }}
                    onTouchStart={(e) => {
                      setTouchStartY(e.touches[0].clientY);
                    }}
                    onTouchMove={(e) => {
                      if (modalRef.current) {
                        const deltaY = touchStartY - e.touches[0].clientY;
                        modalRef.current.scrollBy({
                          top: deltaY * 0.3, // Even more reduced sensitivity for iOS
                          behavior: 'auto'
                        });
                      }
                    }}
                  />
                )}

                {/* Overlay for Non-Premium Users */}
                {!effectiveIsPremium && !isBasicPlan && !isOneDayPlan && (
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end justify-center pointer-events-none"
                    style={{
                      padding: isMobile ? '12px' : '16px 24px',
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="text-center text-white pointer-events-auto"
                    >
                      <motion.p
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`font-bold mb-2 ${isMobile ? 'text-sm leading-tight' : 'text-base sm:text-lg'}`}
                      >
                        👆 This is YOUR professional resume!
                      </motion.p>
                      <p className={`opacity-90 mb-4 ${isMobile ? 'text-xs leading-tight' : 'text-sm'}`}>
                        Upgrade to download + unlock AI career tools
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpgradeClick("basic")}
                        className={`bg-white text-slate-700 rounded-xl hover:bg-gray-50 transition-all font-bold shadow-xl hover:shadow-2xl ${isMobile
                          ? 'px-4 py-2 text-xs'
                          : 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base'
                          }`}
                      >
                        <span>Get Premium for {formatPrice(effectiveBasicPrice, pricing.currency)} {getDurationText(effectiveBasicPrice)}</span>
                        <div className={`text-xs text-slate-500 mt-1 font-normal ${isMobile ? 'hidden' : 'block'}`}>
                          No Auto-Renewal • One-time payment
                        </div>
                      </motion.button>
                    </motion.div>
                  </div>
                )}

                {/* Basic Plan and OneDay Plan Download Limit Warning */}
                {(isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit() && (
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-transparent to-transparent flex items-end justify-center pointer-events-none"
                    style={{
                      padding: isMobile ? '12px' : '16px 24px',
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="text-center text-white pointer-events-auto"
                    >
                      <motion.p
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`font-bold mb-2 ${isMobile ? 'text-sm leading-tight' : 'text-base sm:text-lg'}`}
                      >
                        ⚠️ Download Limit Reached
                      </motion.p>
                      <p className={`opacity-90 mb-4 ${isMobile ? 'text-xs leading-tight' : 'text-sm'}`}>
                        {basicPlanExpiry && new Date() >= new Date(basicPlanExpiry)
                          ? "Your Basic Plan has expired. Renew to continue downloading."
                          : getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", false)}
                      </p>
                      {/* Removed One-Time Download Option as per Sachet Strategy */}

                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpgradeClick("basic")}
                        className={`bg-white text-red-700 rounded-xl hover:bg-gray-50 transition-all font-bold shadow-xl hover:shadow-2xl ${isMobile
                          ? 'px-4 py-2 text-xs'
                          : 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base'
                          }`}
                      >
                        <span>Renew Basic Plan - {formatPrice(effectiveBasicPrice, pricing.currency)} {getDurationText(effectiveBasicPrice)}</span>
                        <div className={`text-xs text-red-600 mt-1 font-normal ${isMobile ? 'hidden' : 'block'}`}>
                          No Auto-Renewal • One-time payment
                        </div>
                      </motion.button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Features Showcase - Only for Non-Premium */}
            {!effectiveIsPremium && !isBasicPlan && !isOneDayPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-gradient-to-r from-slate-50 to-accent-50 rounded-xl border border-slate-200 shadow-lg"
                style={{
                  padding: isMobile ? '12px' : '16px 24px',
                }}
              >
                <div className={`text-center ${isMobile ? 'mb-3' : 'mb-4 sm:mb-6'}`}>
                  <div
                    className="inline-flex items-center gap-2 bg-accent-50 text-primary py-2 rounded-full text-sm font-bold mb-3 shadow-sm"
                    style={{
                      padding: isMobile ? '8px 12px' : '8px 16px',
                    }}
                  >
                    <span>🤖</span>
                    <span>Bonus: AI Career Tools Included</span>
                  </div>
                  <h3 className={`font-bold text-gray-900 mb-1 ${isMobile ? 'text-sm' : 'text-base sm:text-lg'}`}>
                    Complete Career Package
                  </h3>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Professional Resume + AI Tools = Your Success
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: "🚀", title: "AI Resume Boost", desc: "Optimize content", gradient: "from-primary to-accent" },
                    { icon: "🎤", title: "AI Interview Trainer", desc: "Practice questions", gradient: "from-accent to-cyan-500" },
                    { icon: "🧠", title: "AI Problem Solver", desc: "Technical help", gradient: "from-accent to-accent-600" }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-white rounded-xl text-center shadow-md border hover:shadow-lg transition-all cursor-pointer"
                      style={{
                        padding: isMobile ? '12px' : '16px',
                      }}
                    >
                      <div
                        className={`bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}
                        style={{
                          width: isMobile ? '32px' : '40px',
                          height: isMobile ? '32px' : '40px',
                        }}
                      >
                        <span className={`text-white ${isMobile ? 'text-sm' : 'text-lg'}`}>{feature.icon}</span>
                      </div>
                      <h4 className={`font-bold text-gray-900 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {feature.title}
                      </h4>
                      <p className="text-xs text-gray-600">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Premium User Features */}
            {user && (effectiveIsPremium || isBasicPlan || isOneDayPlan) && (
              <>
                {/* Public Profile Promotion */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent/20"
                  style={{
                    padding: isMobile ? '12px' : '16px 24px',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Share2 size={18} className="text-accent" />
                    <span className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
                      Maximize Your Reach!
                    </span>
                  </div>
                  <p className={`text-gray-600 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Great resume! Create a public profile to get discovered by recruiters and showcase your skills globally.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      window.open('/edit-profile', '_blank');
                      onClose();
                    }}
                    className={`w-full bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary-800 hover:to-accent-600 transition-all font-medium shadow-md ${isMobile ? 'text-xs py-2' : 'text-sm py-3'
                      }`}
                  >
                    Create Public Profile
                  </motion.button>
                </motion.div>

                {/* Download Help & FAQ */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  style={{
                    padding: isMobile ? '12px' : '16px',
                  }}
                >
                  <button
                    onClick={() => setShowFAQ(!showFAQ)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-accent" />
                      <span className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        Download Help & FAQ
                      </span>
                    </div>
                    {showFAQ ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  {showFAQ && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 overflow-hidden"
                    >
                      <DownloadFAQ />
                    </motion.div>
                  )}
                </motion.div>

                {/* Quick Feedback */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-center justify-center"
                >
                  <div
                    className="flex items-center gap-3 bg-slate-50 rounded-full shadow-sm"
                    style={{
                      padding: isMobile ? '8px 12px' : '12px 20px',
                    }}
                  >
                    <span className={`text-slate-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Quick rating:</span>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => {
                        event({ action: 'quick_feedback', category: 'PDF', label: 'yes' });
                        toast.success('Thanks!');
                      }}
                      className="text-accent hover:text-accent-700 transition-colors rounded-full hover:bg-accent-50"
                      style={{
                        padding: isMobile ? '4px' : '8px',
                      }}
                      title="Great!"
                    >
                      <span className={isMobile ? 'text-sm' : 'text-lg'}>👍</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => {
                        event({ action: 'quick_feedback', category: 'PDF', label: 'no' });
                        toast('Thanks for the feedback!');
                      }}
                      className="text-amber-600 hover:text-amber-700 transition-colors rounded-full hover:bg-amber-50"
                      style={{
                        padding: isMobile ? '4px' : '8px',
                      }}
                      title="Could be better"
                    >
                      <span className={isMobile ? 'text-sm' : 'text-lg'}>👎</span>
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}

            {/* Trust Signals for Non-Premium */}
            {!effectiveIsPremium && !isBasicPlan && !isOneDayPlan && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="pt-4 border-t border-gray-200"
              >
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-4">
                  {[
                    { icon: "✓", text: "Instant access" },
                    { icon: "✓", text: "AI Powered" },
                    { icon: "✓", text: "All features" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                      className="flex items-center gap-1"
                    >
                      <span className="text-accent font-bold">{item.icon}</span>
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-sm">⭐</span>
                    ))}
                    <span className="text-xs sm:text-sm text-gray-600 ml-2">Trusted by 20,000+ users</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 italic">
                    "The AI tools helped me land my dream job!" - Sarah K.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer with Action Buttons - Fixed at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex-shrink-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg"
        >
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleModalClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium order-2 sm:order-1"
              >
                Close
              </motion.button>

              {user && (effectiveIsPremium || isBasicPlan || isOneDayPlan) ? (
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <motion.button
                    whileHover={!((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit()) ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!((isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit()) ? { scale: 0.98 } : {}}
                    onClick={handleDownloadPDF}
                    className={`px-6 py-3 rounded-lg transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-md ${(isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-accent to-accent-600 text-white hover:from-accent-600 hover:to-accent-700'
                      }`}
                    disabled={(isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit()}
                  >
                    <Download size={16} />
                    {(isBasicPlan || isOneDayPlan) && hasReachedDownloadLimit() ? (
                      "Download Limit Reached"
                    ) : (
                      <>
                        Download PDF
                        {isBasicPlan && ` (${getPlanConfig("basic").downloads - pdfDownloadCount} left)`}
                        {isOneDayPlan && ` (${getPlanConfig("oneDay").downloads - pdfDownloadCount} left)`}
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUpgradeClick("basic")}
                  className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all text-sm font-semibold flex flex-col items-center justify-center gap-1 shadow-md order-1 sm:order-2"
                >
                  <div className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🚀
                    </motion.span>
                    <span>
                      {isMobile ? (
                        `Get Premium - ${formatPrice(effectiveBasicPrice, pricing.currency)} ${getDurationText(effectiveBasicPrice)}`
                      ) : (
                        <>
                          <span className="sm:hidden">Try for {formatPrice(effectiveBasicPrice, pricing.currency)}</span>
                          <span className="hidden sm:block">Get Premium - {formatPrice(effectiveBasicPrice, pricing.currency)} {getDurationText(effectiveBasicPrice)}</span>
                        </>
                      )}
                    </span>
                  </div>
                  {!isMobile && (
                    <div className="text-xs text-white/70 font-normal">
                      No Auto-Renewal • One-time payment
                    </div>
                  )}
                </motion.button>
              )}

              {/* Email button - only visible for premium users */}
              {pdfPreviewBlob && user && effectiveIsPremium && !isBasicPlan && !isOneDayPlan && (
                <div className="flex items-center gap-1 order-1 sm:order-2">
                  <motion.button
                    whileHover={!isEmailing ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isEmailing ? { scale: 0.98 } : {}}
                    onClick={handleEmailPDF}
                    disabled={isEmailing}
                    className={`px-4 py-3 rounded-lg transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-md ${
                      isEmailing 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-accent to-primary text-white hover:from-accent-600 hover:to-primary'
                    }`}
                    title="Send PDF to your email"
                  >
                    {isEmailing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        {!isMobile && <span>Sending...</span>}
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        {!isMobile && <span>Email</span>}
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Post-Download Survey */}
      <PostDownloadSurvey
        isOpen={showDownloadSurvey}
        onClose={() => setShowDownloadSurvey(false)}
        downloadSuccess={downloadSuccess}
        resumeName={resumeName}
      />

      {/* Default Resume Warning Modal */}
      < AnimatePresence >
        {showDefaultResumeWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm"
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
                      onClose(); // Close the preview to let them edit
                    }}
                    className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-amber-600 hover:shadow-amber-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={18} />
                    <span>Go Back & Edit Resume</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDefaultResumeWarning(false);
                      handleOneTimePayment(true);
                    }}
                    className="w-full py-2 text-gray-400 text-sm font-medium hover:text-gray-600"
                  >
                    I really want to download this sample
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >

      {/* EXIT INTENT POPUP */}
      < AnimatePresence >
        {showExitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm"
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
                  <span>Download Now ({isShineSource ? (currency === 'USD' ? '$2.99' : '₹19') : (pricing.currency === 'USD' ? '$2.99' : '₹99')})</span>
                </button>

                <button
                  onClick={() => {
                    setShowExitPopup(false);
                    handleModalClose();
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

      {/* Post-Download Survey */}
      <PostDownloadSurvey
        isOpen={showDownloadSurvey}
        onClose={() => setShowDownloadSurvey(false)}
        downloadSuccess={downloadSuccess}
        resumeName={resumeName}
      />
    </motion.div >,
    typeof document !== 'undefined' ? document.body : null
  );
};

export default PremiumPdfPreview;