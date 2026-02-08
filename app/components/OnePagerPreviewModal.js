"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Crown, Star, CheckCircle, Zap, FileText, ArrowRight, Lock, Eye, AlertTriangle, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import ProgressOverlay from "./ProgressOverlay";
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { getEffectivePricing } from "../lib/globalPricing";
import { useLocation } from "../context/LocationContext";
import { getDownloadLimitMessage, getPlanConfig } from "../lib/planConfig";

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

export default function OnePagerPreviewModal({ 
  isOpen, 
  onClose, 
  data, 
  template, 
  customColors, 
  language, 
  country, 
  preferences,
  user,
  isPremium = false,
  handleUpgradeClick,
  formatPrice,
  monthlyPrice,
  basicPrice,
  event,
  toast
}) {
  const modalRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewBlob, setPreviewBlob] = useState(null);
  
  const { currency } = useLocation();
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent) {
      setIsAndroidDevice(/Android/i.test(navigator.userAgent));
    }
  }, []);
  // Use props if provided, otherwise fall back to calculated pricing
  const pricing = getEffectivePricing(currency, isAndroidDevice);
  let onePagerPrice = basicPrice || pricing.basic;
  
  // For USD, always use monthly price for all devices; for INR, use basic for Android, monthly for others
  if (pricing.currency === 'USD' || (!isAndroidDevice && pricing.currency === 'INR')) {
    onePagerPrice = monthlyPrice || pricing.monthly;
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
  const [basicPlanExpiry, setBasicPlanExpiry] = useState(null);
  const [pdfDownloadCount, setPdfDownloadCount] = useState(0);
  const [latestPayment, setLatestPayment] = useState(null);

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

  // Track user's basic plan status
  useEffect(() => {
    if (user) {
      console.log('👤 Setting up user snapshot listener for:', user.uid);
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
        const data = docSnapshot.data();
        console.log('📊 User data received:', data);
        
        if (data) {
          const downloadCount = data.pdf_download_count || 0;
          setPdfDownloadCount(downloadCount);
          console.log('📥 PDF download count updated to:', downloadCount);
          
          // Check if user has basic plan
          if (data.plan === "basic") {
            console.log('🎯 Basic plan detected from user data!');
            const isBasicValid = data.premium_expiry && new Date() < new Date(data.premium_expiry);
            setIsBasicPlan(isBasicValid);
            setBasicPlanExpiry(data.premium_expiry);
          } else if (data.plan === "premium") {
            // If user has premium plan, check payment_logs to see if it's actually a basic plan
            console.log('✨ User has premium plan, checking if it\'s actually basic...');
            await fetchLatestPayment(user.uid);
          } else {
            console.log('👤 User plan is not premium or basic:', data.plan);
            setIsBasicPlan(false);
          }
        }
      });
      
      return () => unsubscribe();
    }
  }, [user]);

  // Check if basic plan user has reached download limit
  const hasReachedDownloadLimit = () => {
    console.log('🔍 Download limit check:', {
      isBasicPlan,
      user: !!user,
      pdfDownloadCount,
      basicPlanExpiry,
      isExpired: basicPlanExpiry && new Date() >= new Date(basicPlanExpiry)
    });
    
    if (!isBasicPlan || !user) return false;
    
    // Check if basic plan has expired
    if (basicPlanExpiry && new Date() >= new Date(basicPlanExpiry)) {
      console.log('❌ Plan expired, blocking download');
      return true; // Plan expired, needs renewal
    }
    
    // Check if user has reached or exceeded download limit
    if (pdfDownloadCount >= getPlanConfig("basic").downloads) {
      console.log('❌ Download limit reached, blocking download');
      return true; // Download limit reached
    }
    
    console.log('✅ Download allowed');
    return false;
  };

  // Check if Android user needs premium upgrade for one-pager
  const needsPremiumForOnePager = () => {
    const device = detectDevice();
    const isAndroid = device === "android";
    const isBasicPlanUser = isBasicPlan && latestPayment && latestPayment.billingCycle === "basic";
    
          // Android users with basic plan (₹199) need to upgrade to premium (₹399) for one-pager
    if (isAndroid && isBasicPlanUser && currency === "INR") {
      console.log('📱 Android user with basic plan needs premium upgrade for one-pager');
      return true;
    }
    
    return false;
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

  // Generate preview when modal opens
  useEffect(() => {
    if (isOpen && !previewUrl && !isPreviewLoading) {
      generatePreview();
    }
  }, [isOpen]);

  const generatePreview = async () => {
    setIsPreviewLoading(true);
    setShowProgress(true);
    try {
      const response = await fetch('/api/generate-one-pager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          template,
          customColors,
          language,
          country,
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const blob = await response.blob();
      setPreviewBlob(blob);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Preview generation error:', error);
      toast.error('Failed to generate preview. Please try again.');
    } finally {
      setIsPreviewLoading(false);
      setShowProgress(false);
    }
  };

  const handleDownload = async () => {
    console.log('🎯 Download One-Pager clicked!', { isBasicPlan, pdfDownloadCount });
    
    // Check if Android user needs premium upgrade for one-pager
    if (needsPremiumForOnePager()) {
      console.log('🚫 Android user with basic plan blocked from one-pager download');
              toast.error(`One-pager resume is a premium feature. Upgrade to Premium (${formatPrice(onePagerPrice, pricing.currency)}) to access this feature!`);
      handleUpgradeClick("monthly"); // Redirect to monthly plan for Android users
      return;
    }
    
    // Check basic plan download limits first - prevent download if already at limit
    if (isBasicPlan && hasReachedDownloadLimit()) {
      console.log('🚫 Download blocked by limit check');
      const isExpired = basicPlanExpiry && new Date() >= new Date(basicPlanExpiry);
      const message = getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", isExpired);
      
      toast.error(message);
      handleUpgradeClick("basic"); // Redirect to upgrade
      return;
    }

    if (!isPremium && !isBasicPlan) {
      handleUpgradeClick("basic");
      return;
    }

    console.log('✅ Proceeding with download...');

    if (previewBlob) {
      // Use the already generated blob
      const url = window.URL.createObjectURL(previewBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'one-pager-resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Track download event
      if (event) {
        event({
          action: "download_onepager",
          category: "OnePager",
          label: isPremium ? "PremiumDownload" : (isBasicPlan ? "BasicDownload" : "FreeDownload"),
        });
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
              toast.success(`One-pager downloaded! ${remaining} downloads remaining.`);
            } else {
              toast.warning(getDownloadLimitMessage("oneDay", false));
            }
          } else if (userData.plan === "basic") {
            const remaining = getPlanConfig("basic").downloads - newCount;
            if (remaining > 0) {
              toast.success(`One-pager downloaded! ${remaining} downloads remaining.`);
            } else {
              toast.warning(getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", false));
            }
          } else {
            toast.success('One-pager resume downloaded successfully!', {
              icon: '🎯',
              duration: 4000
            });
          }
        }
      }

      onClose();
      return;
    }

    setIsGenerating(true);
    setShowProgress(true);
    
    try {
      const response = await fetch('/api/generate-one-pager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          template,
          customColors,
          language,
          country,
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate one-pager resume');
      }

      const blob = await response.blob();
      setPreviewBlob(blob);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'one-pager-resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Track download event
      if (event) {
        event({
          action: "download_onepager",
          category: "OnePager",
          label: isPremium ? "PremiumDownload" : (isBasicPlan ? "BasicDownload" : "FreeDownload"),
        });
      }

      // Increment PDF download count for premium users (including basic plan)
      if (user && user.uid) {
        // Check if user has premium plan (which includes basic plan users)
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        
        if (userData && (userData.plan === "premium" || userData.plan === "basic")) {
          const newCount = pdfDownloadCount + 1;
          await updateDoc(userRef, { pdf_download_count: newCount });
          setPdfDownloadCount(newCount);
          
          // Show remaining downloads message for basic plan users
          if (isBasicPlan) {
            const remaining = getPlanConfig("basic").downloads - newCount;
            if (remaining > 0) {
              toast.success(`One-pager downloaded! ${remaining} downloads remaining.`);
            } else {
              toast.warning(getDownloadLimitMessage(isOneDayPlan ? "oneDay" : "basic", false));
            }
          } else {
            toast.success('One-pager resume downloaded successfully!', {
              icon: '🎯',
              duration: 4000
            });
          }
        }
      }

      onClose();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download one-pager resume. Please try again.');
    } finally {
      setIsGenerating(false);
      setShowProgress(false);
    }
  };

  // Clean up blob URL on modal close
  useEffect(() => {
    if (!isOpen && previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewBlob(null);
    }
  }, [isOpen]);


  if (!isOpen) return null;

  return (
    <>
      <ProgressOverlay isVisible={showProgress} type="onepager" />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleModalClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Crown size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">One-Pager Resume</h2>
                    <p className="text-purple-100">Premium AI-powered resume optimization</p>
                  </div>
                </div>
                <button
                  onClick={handleModalClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Main Content - Scrollable Area */}
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
                minHeight: 0,
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
                {/* PDF Viewer */}
                <div 
                  className="relative border-2 border-gray-200 rounded-xl overflow-hidden shadow-xl"
                  style={{
                    margin: isMobile ? '0' : 'auto',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div 
                    ref={pdfContainerRef}
                    className="relative"
                    style={{
                      width: '100%',
                      ...(isMobile && {
                        touchAction: 'none',
                        pointerEvents: 'none',
                        overflow: 'hidden',
                      })
                    }}
                  >
                    {previewUrl ? (
                      <iframe
                        src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        className="w-full border-0"
                        style={{ 
                          width: isMobile ? '130%' : '100%',
                          height: isMobile ? 'calc(70vh - 60px)' : 'min(70vh, 800px)',
                          minHeight: isMobile ? '500px' : '400px',
                          display: 'block',
                          ...(isMobile && {
                            pointerEvents: 'none',
                            touchAction: 'none',
                            margin: '0',
                            padding: '0',
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'white',
                            transform: 'scale(0.77)',
                            transformOrigin: 'top left',
                            overflow: 'hidden',
                          })
                        }}
                        title="One-Pager Resume Preview"
                        aria-label="One-pager resume preview"
                        onContextMenu={(e) => e.preventDefault()}
                        key={isMobile ? 'mobile-pdf-scaled' : 'desktop-pdf'}
                      />
                    ) : (
                      <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            {isPreviewLoading ? "Generating preview..." : "Preview not available"}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Blur Overlay for Non-Premium Users */}
                    {!isPremium && !isBasicPlan && (
                      <>
                        {/* Bottom 30% blur overlay */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none"
                          style={{
                            height: '30%',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                          }}
                        />
                        
                        {/* CTA Overlay */}
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
                            👆 This is YOUR optimized one-pager resume!
                          </motion.p>
                          <p className={`opacity-90 mb-4 ${isMobile ? 'text-xs leading-tight' : 'text-sm'}`}>
                            {detectDevice() === "android" && currency === "INR" 
                              ? `One-pager is a premium feature. Upgrade to Premium (${formatPrice(onePagerPrice, pricing.currency)}) to access!`
                              : "Upgrade to download + unlock AI career tools"
                            }
                          </p>
                            <motion.button
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpgradeClick("basic")}
                              className={`rounded-xl transition-all font-bold shadow-xl hover:shadow-2xl ${
                                isMobile 
                                  ? 'w-full px-5 py-3 text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                                  : 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-white text-slate-700 hover:bg-gray-50'
                              }`}
                            >
                              {isMobile ? (
                                <span>Get Premium - {formatPrice(onePagerPrice, pricing.currency)} {getDurationText(onePagerPrice)}</span>
                              ) : (
                                <>
                                  <span>Get Premium for {formatPrice(onePagerPrice, pricing.currency)} {getDurationText(onePagerPrice)}</span>
                                  <div className={`text-xs text-slate-500 mt-1 font-normal ${isMobile ? 'hidden' : 'block'}`}>
                                    No Auto-Renewal • One-time payment
                                  </div>
                                </>
                              )}
                            </motion.button>
                          </motion.div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Trust Signals for Non-Premium */}
                {!isPremium && !isBasicPlan && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="pt-4 border-t border-gray-200"
                  >
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-4">
                      {[
                        { icon: "✓", text: "Instant access" },
                        { icon: "✓", text: "Cancel anytime" },
                        { icon: "✓", text: "All features" }
                      ].map((item, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                          className="flex items-center gap-1"
                        >
                          <span className="text-emerald-500 font-bold">{item.icon}</span>
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
                        {detectDevice() === "android" && currency === "INR"
                          ? "Premium feature - Upgrade to access one-pager resume!"
                          : '"The one-pager helped me land my dream job!" - Sarah K.'
                        }
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
                  
                  {user && (isPremium || isBasicPlan) ? (
                    <motion.button
                      whileHover={!(isBasicPlan && (hasReachedDownloadLimit() || needsPremiumForOnePager())) ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!(isBasicPlan && (hasReachedDownloadLimit() || needsPremiumForOnePager())) ? { scale: 0.98 } : {}}
                      onClick={needsPremiumForOnePager() ? () => handleUpgradeClick("monthly") : handleDownload}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-md order-1 sm:order-2 ${
                        isBasicPlan && (hasReachedDownloadLimit() || needsPremiumForOnePager())
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : needsPremiumForOnePager()
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                      }`}
                      disabled={isBasicPlan && (hasReachedDownloadLimit() || needsPremiumForOnePager())}
                    >
                      {needsPremiumForOnePager() ? (
                        <>
                          <Crown size={16} />
                          Upgrade to Premium ({formatPrice(onePagerPrice, pricing.currency)})
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          {isBasicPlan && hasReachedDownloadLimit() ? (
                            "Download Limit Reached"
                          ) : (
                            <>
                              Download One-Pager
                              {isBasicPlan && ` (${getPlanConfig("basic").downloads - pdfDownloadCount} left)`}
                            </>
                          )}
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpgradeClick("basic")}
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all text-sm font-semibold flex flex-col items-center justify-center gap-1 shadow-md order-1 sm:order-2"
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
                            `Get Premium - ${formatPrice(onePagerPrice, pricing.currency)} ${getDurationText(onePagerPrice)}`
                          ) : (
                            <>
                              <span className="sm:hidden">Try for {formatPrice(onePagerPrice, pricing.currency)}</span>
                              <span className="hidden sm:block">Get Premium - {formatPrice(onePagerPrice, pricing.currency)} {getDurationText(onePagerPrice)}</span>
                            </>
                          )}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/80 font-normal">
                        No Auto-Renewal • One-time payment
                      </div>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
} 