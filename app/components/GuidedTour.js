"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Star,
  ExternalLink,
  CheckCircle,
  Lightbulb,
  Target,
  FileText,
  Palette,
  Bot,
  Eye,
  Save,
  LayoutDashboard,
  FileUp,
  Sparkles,
  MousePointer,
  Smartphone,
  Monitor,
  Settings
} from "lucide-react";

const tourSteps = [
  {
    id: "welcome",
    title: "Welcome to Resume Builder! 🚀",
    content: "Let's take a quick tour to help you discover all the powerful features that will help you create an amazing resume.",
    target: null,
    position: "center",
    icon: <Sparkles className="w-6 h-6 text-accent" />,
    type: "intro"
  },
  {
    id: "version-switcher",
    title: "Resume Version Manager",
    content: "Switch between different resume versions, create new ones, or start fresh. Your work is automatically saved!",
    target: "[data-tour='version-switcher']",
    position: "bottom",
    icon: <FileText className="w-5 h-5 text-accent" />,
    type: "feature"
  },
  {
    id: "template-selector",
    title: "Beautiful Templates",
    content: "Choose from professional, ATS-optimized templates. Each template is designed to help you stand out!",
    target: "[data-tour='template-button']",
    position: "bottom",
    icon: <LayoutDashboard className="w-5 h-5 text-accent" />,
    type: "feature"
  },
  {
    id: "import-resume",
    title: "Smart Resume Import",
    content: "Upload your existing resume PDF and our AI will extract all the information automatically using advanced parsing.",
    target: "[data-tour='import-button']",
    position: "bottom",
    icon: <FileUp className="w-5 h-5 text-accent" />,
    type: "feature"
  },
  {
    id: "ai-boost",
    title: "AI-Powered Enhancement",
    content: "Let our AI analyze and improve your resume content, making it more compelling and ATS-friendly.",
    target: "[data-tour='ai-button']",
    position: "bottom",
    icon: <Bot className="w-5 h-5 text-accent" />,
    type: "feature"
  },
  {
    id: "form-editing",
    title: "Smart Form Editor",
    content: "Edit your resume with our intelligent form that provides real-time suggestions and validation. Notice the ATS score updates as you type!",
    target: "[data-tour='resume-form']",
    position: "right",
    icon: <FileText className="w-5 h-5 text-accent" />,
    type: "feature"
  },
  {
    id: "ats-score",
    title: "Real-time ATS Score",
    content: "See your resume's ATS score update in real-time as you edit. This widget appears at the top of the form and helps you optimize your resume for applicant tracking systems!",
    target: "[data-tour='ats-score']",
    position: "bottom",
    icon: <Target className="w-5 h-5 text-accent" />,
    type: "feature"
  },
  {
    id: "live-preview",
    title: "Live Preview",
    content: "See your changes instantly in the live preview. What you see is exactly what you'll get in your PDF!",
    target: "[data-tour='resume-preview']",
    position: "left",
    icon: <Eye className="w-5 h-5 text-accent" />,
    type: "feature"
  },
  {
    id: "color-customizer",
    title: "Color Customization",
    content: "Personalize your resume with custom colors. On desktop, use the compact sidebar or click 'More' for full options. On mobile, tap the Colors button in the bottom bar.",
    target: "[data-tour='color-panel']",
    position: "right",
    icon: <Palette className="w-5 h-5 text-orange-600" />,
    type: "feature"
  },
  {
    id: "save-resume",
    title: "Save Your Work",
    content: "Save your resume to the cloud using this button in the header. Your progress is automatically saved as you work, but you can manually save anytime!",
    target: "[data-tour='save-button']",
    position: "bottom",
    icon: <Save className="w-5 h-5 text-accent" />,
    type: "feature"
  },
  {
    id: "preview-pdf",
    title: "Generate & Download PDF",
    content: "Generate a professional PDF of your resume using this prominent button in the header. Premium users get watermark-free downloads with perfect formatting!",
    target: "[data-tour='pdf-button']",
    position: "bottom",
    icon: <Eye className="w-5 h-5 text-accent" />,
    type: "feature"
  },
  {
    id: "preferences-settings",
    title: "Resume Format Settings",
    content: "Customize your resume format preferences including date formats, section ordering, and display options. Tailor your resume to match different job requirements!",
    target: "[data-tour='settings-button']",
    position: "bottom",
    icon: <Settings className="w-5 h-5 text-gray-600" />,
    type: "feature"
  },
  {
    id: "completion",
    title: "You're All Set! 🎉",
    content: "You now know all the key features. Start building your amazing resume and land your dream job! Remember, you can always access this tour again from the help button.",
    target: null,
    position: "center",
    icon: <CheckCircle className="w-6 h-6 text-accent" />,
    type: "completion"
  }
];

export default function GuidedTour({ isOpen, onClose, onComplete, onTabChange }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [spotlightStyle, setSpotlightStyle] = useState({});
  const intervalRef = useRef(null);

  // Detect mobile and handle resize
  useEffect(() => {
    const checkMobile = () => {
      const wasMobile = isMobile;
      const nowMobile = window.innerWidth < 768;
      setIsMobile(nowMobile);
      
      // If mobile state changed and tour is active, recalculate positions
      if (wasMobile !== nowMobile && hasStarted && targetElement) {
        console.log(`📱 Mobile state changed: ${wasMobile} -> ${nowMobile}, recalculating positions`);
        // Force a small delay and recalculate
        setTimeout(() => {
          const step = tourSteps[currentStep];
          if (step?.target) {
            const element = document.querySelector(step.target);
            if (element) {
              setTargetElement(element);
            }
          }
        }, 100);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile, hasStarted, targetElement, currentStep]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && hasStarted) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= tourSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, hasStarted]);

  // Create spotlight effect and position tooltip
  useEffect(() => {
    if (!hasStarted) return;

    const step = tourSteps[currentStep];
    
    // Handle tab switching for specific steps
    if (step?.id === "live-preview" && onTabChange) {
      console.log("🔄 Switching to preview tab for live-preview step");
      onTabChange("preview");
    }
    
    if (step?.target) {
      const findAndHighlightElement = () => {
        // Try multiple times to find the element as it might not be rendered yet
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryFindElement = () => {
          const elements = document.querySelectorAll(step.target);
          
          if (elements.length === 0 && attempts < maxAttempts) {
            attempts++;
            console.log(`🔍 Attempt ${attempts}: Looking for element ${step.target}`);
            setTimeout(tryFindElement, 200);
            return;
          }
          
          if (elements.length === 0) {
            console.warn(`❌ Element not found after ${maxAttempts} attempts: ${step.target}`);
            setTargetElement(null);
            setSpotlightStyle({});
            return;
          }

          // If multiple elements found, pick the best visible one
          let bestElement = null;
          let bestScore = -1;
          
          elements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(el);
            
            // Calculate visibility score
            let score = 0;
            
            // Has dimensions
            if (rect.width > 0 && rect.height > 0) score += 10;
            
            // Is visible
            if (computedStyle.display !== 'none') score += 5;
            if (computedStyle.visibility !== 'hidden') score += 5;
            if (computedStyle.opacity !== '0') score += 5;
            
            // Is in viewport (partial visibility is ok for large sections)
            const isPartiallyInViewport = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
            if (isPartiallyInViewport) {
              score += 15;
            }
            
            // Bonus points for larger elements (sections like form/preview)
            const area = rect.width * rect.height;
            if (area > 50000) score += 10; // Large sections
            if (area > 100000) score += 5; // Very large sections
            
            // Prefer elements that are higher in the DOM (usually desktop layout)
            if (index === 0) score += 2;
            
            // Special handling for mobile - prefer visible elements even if partially off-screen
            if (isMobile) {
              // For mobile, prioritize elements that are at least 50% visible
              const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
              const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
              const visibilityRatio = (visibleHeight * visibleWidth) / (rect.height * rect.width);
              
              if (visibilityRatio > 0.5) score += 8;
              if (visibilityRatio > 0.8) score += 5;
            }
            
            console.log(`🎯 Element ${index} score: ${score}`, {
              element: el,
              rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
              style: { display: computedStyle.display, visibility: computedStyle.visibility, opacity: computedStyle.opacity },
              area: rect.width * rect.height,
              partiallyVisible: isPartiallyInViewport,
              selector: step.target
            });
            
            if (score > bestScore) {
              bestScore = score;
              bestElement = el;
            }
          });

          if (!bestElement || bestScore < 5) {
            console.warn(`❌ No suitable element found for ${step.target}. Best score: ${bestScore}`);
            setTargetElement(null);
            setSpotlightStyle({});
            return;
          }

          console.log(`🎯 Found best element for step ${currentStep + 1}:`, step.target, bestElement, `Score: ${bestScore}`);
          setTargetElement(bestElement);
          
          // Force a reflow to ensure element is positioned
          bestElement.offsetHeight;
          
          // Scroll element into view with more aggressive settings
          // For large sections, scroll to start, for small elements, center them
          const isLargeSection = bestElement.getBoundingClientRect().height > window.innerHeight * 0.6;
          bestElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: isLargeSection ? 'start' : 'center',
            inline: 'center'
          });

          // Calculate spotlight position after scroll with longer delay
          setTimeout(() => {
            const rect = bestElement.getBoundingClientRect();
            const padding = 8; // Reduced padding for tighter spotlight
            
            console.log(`📍 Element position for ${step.target}:`, {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              bottom: rect.bottom,
              right: rect.right,
              visible: rect.width > 0 && rect.height > 0
            });
            
            // Ensure element is visible and has dimensions
            if (rect.width === 0 || rect.height === 0) {
              console.warn(`⚠️ Element has no dimensions:`, step.target);
              setSpotlightStyle({});
              return;
            }
            
            // Get viewport dimensions
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            
            // Calculate spotlight area with padding and constraints
            const x1 = Math.max(0, rect.left - padding);
            const y1 = Math.max(0, rect.top - padding);
            const x2 = Math.min(vw, rect.right + padding);
            const y2 = Math.min(vh, rect.bottom + padding);
            
            // Additional constraint: don't let spotlight extend too far beyond element
            const maxWidth = rect.width + (padding * 4); // Max 4x padding total
            const maxHeight = rect.height + (padding * 4); // Max 4x padding total
            const constrainedX2 = Math.min(x2, x1 + maxWidth);
            const constrainedY2 = Math.min(y2, y1 + maxHeight);
            
            // Ensure we have a valid spotlight area
            if (x1 >= constrainedX2 || y1 >= constrainedY2) {
              console.warn(`⚠️ Invalid spotlight area:`, { x1, y1, x2: constrainedX2, y2: constrainedY2 });
              setSpotlightStyle({});
              return;
            }
            
            // Create clip-path that cuts out only the spotlight area (more precise)
            const clipPath = `polygon(
              0% 0%, 
              0% 100%, 
              ${x1}px 100%, 
              ${x1}px ${y1}px, 
              ${constrainedX2}px ${y1}px, 
              ${constrainedX2}px ${constrainedY2}px, 
              ${x1}px ${constrainedY2}px, 
              ${x1}px 100%, 
              100% 100%, 
              100% 0%
            )`;

            console.log(`✨ Setting spotlight for ${step.target}:`, {
              viewport: { width: vw, height: vh },
              element: { width: rect.width, height: rect.height },
              original: { x1, y1, x2, y2 },
              constrained: { x1, y1, x2: constrainedX2, y2: constrainedY2 },
              clipPath
            });

            setSpotlightStyle({ clipPath });
          }, 500);
        };
        
        tryFindElement();
      };

      findAndHighlightElement();
    } else {
      // For center steps (welcome, completion), clear spotlight
      setTargetElement(null);
      setSpotlightStyle({});
    }
  }, [currentStep, hasStarted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentStep(0);
    
    // Debug: Check if all tour elements exist
    console.log('🎯 Tour started - checking all elements:');
    tourSteps.forEach((step, index) => {
      if (step.target) {
        const element = document.querySelector(step.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          console.log(`✅ Step ${index + 1} (${step.id}): ${step.target} - FOUND`, {
            position: `(${Math.round(rect.left)}, ${Math.round(rect.top)})`,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            visible: isVisible,
            element: element
          });
        } else {
          console.log(`❌ Step ${index + 1} (${step.id}): ${step.target} - NOT FOUND`);
        }
      } else {
        console.log(`ℹ️ Step ${index + 1} (${step.id}): Center positioned (no target)`);
      }
    });
    
    // Also check some common elements that might be problematic
    const commonSelectors = [
      '[data-tour="version-switcher"]',
      '[data-tour="template-button"]', 
      '[data-tour="import-button"]',
      '[data-tour="ai-button"]',
      '[data-tour="resume-form"]',
      '[data-tour="resume-preview"]',
      '[data-tour="color-panel"]',
      '[data-tour="save-button"]',
      '[data-tour="pdf-button"]',
      '[data-tour="ats-score"]',
      '[data-tour="settings-button"]'
    ];
    
    console.log('🔍 Checking common tour elements:');
    commonSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.log(`${selector}: ${elements.length} element(s) found`);
      elements.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const isInViewport = rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
        const computedStyle = window.getComputedStyle(el);
        const isDisplayed = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && computedStyle.opacity !== '0';
        
        console.log(`  [${i}]: ${rect.width}x${rect.height} at (${Math.round(rect.left)}, ${Math.round(rect.top)})`, {
          visible: isVisible,
          inViewport: isInViewport,
          displayed: isDisplayed,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          element: el
        });
      });
    });
    
    // Also check if we're on mobile vs desktop
    console.log(`📱 Device info:`, {
      isMobile: window.innerWidth < 768,
      windowSize: { width: window.innerWidth, height: window.innerHeight },
      userAgent: navigator.userAgent
    });
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      console.log(`➡️ Moving to step ${currentStep + 2}`);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      console.log(`⬅️ Moving to step ${currentStep}`);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
    
    // Show sparkling completion animation
    setCurrentStep(tourSteps.length); // Move to a special completion step
    
    // Auto close after showing completion animation
    setTimeout(() => {
      onComplete?.();
      onClose();
    }, 4000);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setHasStarted(true);
    setIsPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentStepData = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Calculate tooltip position with much better logic
  const getTooltipPosition = () => {
    // For center positioned steps or when no target element
    if (!targetElement || currentStepData?.position === "center") {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
        maxWidth: '400px'
      };
    }

    // Get fresh bounding rect
    const rect = targetElement.getBoundingClientRect();
    
    // Ensure element is still visible
    if (rect.width === 0 || rect.height === 0) {
      console.warn(`⚠️ Target element has no dimensions during positioning`);
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
        maxWidth: '400px'
      };
    }

    const tooltipWidth = 320;
    const tooltipHeight = 220;
    const offset = 15;
    const padding = 15;

    console.log(`🎯 Positioning tooltip for ${currentStepData.id}:`, {
      elementRect: { 
        top: rect.top, 
        left: rect.left, 
        width: rect.width, 
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom
      },
      tooltipSize: { width: tooltipWidth, height: tooltipHeight },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      preferredPosition: currentStepData.position
    });

    let style = { 
      position: 'fixed',
      zIndex: 10001,
      maxWidth: `${tooltipWidth}px`
    };

    // Desktop positioning - be more careful about space calculation
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;

    console.log(`📏 Available space around element:`, { 
      spaceTop, 
      spaceBottom, 
      spaceLeft, 
      spaceRight,
      requiredWidth: tooltipWidth,
      requiredHeight: tooltipHeight
    });

    // Determine best position based on available space
    let bestPosition = currentStepData.position;
    
    // Override position if there's not enough space
    if (currentStepData.position === 'bottom' && spaceBottom < tooltipHeight + offset + padding) {
      bestPosition = spaceTop > tooltipHeight + offset + padding ? 'top' : 'right';
      console.log(`🔄 Switching from bottom to ${bestPosition} due to insufficient space`);
    } else if (currentStepData.position === 'top' && spaceTop < tooltipHeight + offset + padding) {
      bestPosition = spaceBottom > tooltipHeight + offset + padding ? 'bottom' : 'right';
      console.log(`🔄 Switching from top to ${bestPosition} due to insufficient space`);
    } else if (currentStepData.position === 'right' && spaceRight < tooltipWidth + offset + padding) {
      bestPosition = spaceLeft > tooltipWidth + offset + padding ? 'left' : 'bottom';
      console.log(`🔄 Switching from right to ${bestPosition} due to insufficient space`);
    } else if (currentStepData.position === 'left' && spaceLeft < tooltipWidth + offset + padding) {
      bestPosition = spaceRight > tooltipWidth + offset + padding ? 'right' : 'bottom';
      console.log(`🔄 Switching from left to ${bestPosition} due to insufficient space`);
    }

    // Apply positioning based on best position
    switch (bestPosition) {
      case 'top':
        style.bottom = viewportHeight - rect.top + offset;
        style.left = Math.max(padding, Math.min(
          rect.left + (rect.width / 2) - (tooltipWidth / 2),
          viewportWidth - tooltipWidth - padding
        ));
        break;
      case 'bottom':
        style.top = rect.bottom + offset;
        style.left = Math.max(padding, Math.min(
          rect.left + (rect.width / 2) - (tooltipWidth / 2),
          viewportWidth - tooltipWidth - padding
        ));
        break;
      case 'left':
        style.right = viewportWidth - rect.left + offset;
        style.top = Math.max(padding, Math.min(
          rect.top + (rect.height / 2) - (tooltipHeight / 2),
          viewportHeight - tooltipHeight - padding
        ));
        break;
      case 'right':
        style.left = rect.right + offset;
        style.top = Math.max(padding, Math.min(
          rect.top + (rect.height / 2) - (tooltipHeight / 2),
          viewportHeight - tooltipHeight - padding
        ));
        break;
      default:
        // Fallback to bottom
        style.top = rect.bottom + offset;
        style.left = Math.max(padding, Math.min(
          rect.left + (rect.width / 2) - (tooltipWidth / 2),
          viewportWidth - tooltipWidth - padding
        ));
    }

    console.log(`📌 Final desktop positioning for ${currentStepData.id}:`, {
      position: bestPosition,
      style,
      elementCenter: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
         });

    return style;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Tour Styles */}
      <style jsx global>{`
        .tour-spotlight-overlay {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(2px);
        }
        
        .tour-tooltip {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .tour-highlight-ring {
          position: absolute;
          border: 3px solid #8b5cf6;
          border-radius: 8px;
          animation: tourPulse 2s infinite;
          pointer-events: none;
          z-index: 10002;
        }
        
        @keyframes tourPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(139, 92, 246, 0.1);
          }
        }
      `}</style>

      {/* Spotlight Overlay */}
      {hasStarted && (
        <div 
          className="fixed inset-0 pointer-events-none transition-all duration-300"
          style={{
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            ...spotlightStyle
          }}
        />
      )}

      {/* Highlight Ring for Target Element */}
      {targetElement && hasStarted && currentStepData?.target && (() => {
        const rect = targetElement.getBoundingClientRect();
        return (
          <div
            className="tour-highlight-ring"
            style={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
          />
        );
      })()}

      {!hasStarted ? (
        // Welcome Screen
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`${isMobile ? 'px-4 w-full' : 'px-8'}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`bg-white rounded-2xl shadow-2xl overflow-hidden mx-auto ${isMobile ? 'w-full max-w-sm' : 'w-full max-w-md'}`}
            >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {isMobile ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Monitor className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Resume Builder Tour</h2>
                    <p className="text-sm opacity-90">Interactive Guide</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Discover Amazing Features!
              </h3>
              <p className="text-gray-600 mb-6">
                Take a guided tour to learn about all the powerful tools that will help you create the perfect resume.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div className="bg-accent-50 p-3 rounded-lg">
                  <Target className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="font-medium text-gray-800">ATS Optimization</p>
                </div>
                <div className="bg-accent-50 p-3 rounded-lg">
                  <Bot className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="font-medium text-gray-800">AI Enhancement</p>
                </div>
                <div className="bg-accent-50 p-3 rounded-lg">
                  <FileText className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="font-medium text-gray-800">Live Preview</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <Palette className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                  <p className="font-medium text-gray-800">Customization</p>
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-800 hover:to-accent-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Interactive Tour
              </button>
            </div>
          </motion.div>
          </div>
        </div>
      ) : (
        // Tour Tooltip
        <AnimatePresence>
          {currentStepData && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="z-[10001] tour-tooltip fixed"
              style={(() => {
                if (isMobile) {
                  return {
                    top: '50%',
                    left: '0',
                    transform: 'translateY(-50%)',
                    width: 'calc(100vw - 40px)',
                    maxWidth: '340px',
                    position: 'fixed',
                    zIndex: 10001,
                    marginLeft: '20px',
                    marginRight: '20px'
                  };
                } else {
                  return getTooltipPosition();
                }
              })()}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200" style={{ width: isMobile ? '100%' : '320px' }}>
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-accent px-4 py-3 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        {currentStepData.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate">
                          {currentStepData.title}
                        </h3>
                        <p className="text-xs opacity-90">
                          Step {currentStep + 1} of {tourSteps.length}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="bg-white/20 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                        className="bg-white h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
                  <p className={`text-gray-700 leading-relaxed ${isMobile ? 'text-sm mb-3' : 'text-sm mb-4'}`}>
                    {currentStepData.content}
                  </p>

                  {/* Step Type Indicator - More compact on mobile */}
                  <div className={`flex items-center gap-2 ${isMobile ? 'mb-3' : 'mb-4'}`}>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentStepData.type === 'feature' ? 'bg-accent-50 text-accent-700' :
                      currentStepData.type === 'intro' ? 'bg-accent-50 text-accent-700' :
                      currentStepData.type === 'completion' ? 'bg-accent-50 text-accent-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {currentStepData.type === 'feature' ? '🎯 Feature' :
                       currentStepData.type === 'intro' ? '👋 Introduction' :
                       currentStepData.type === 'completion' ? '🎉 Complete' :
                       'ℹ️ Info'}
                    </div>
                    {currentStepData.target && !isMobile && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MousePointer className="w-3 h-3" />
                        <span>Element highlighted</span>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                        title="Previous"
                      >
                        <ArrowLeft className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-600`} />
                      </button>
                      
                      <button
                        onClick={toggleAutoPlay}
                        className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg hover:bg-gray-100 transition-colors`}
                        title={isPlaying ? "Pause" : "Auto-play"}
                      >
                        {isPlaying ? (
                          <Pause className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-600`} />
                        ) : (
                          <Play className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-600`} />
                        )}
                      </button>
                      
                      <button
                        onClick={handleRestart}
                        className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg hover:bg-gray-100 transition-colors`}
                        title="Restart"
                      >
                        <RotateCcw className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-600`} />
                      </button>
                      
                      {!isMobile && (
                        <button
                          onClick={() => {
                            console.log('🐛 DEBUG INFO:');
                            console.log('Current Step:', currentStep, currentStepData);
                            console.log('Target Element:', targetElement);
                            console.log('Has Started:', hasStarted);
                            console.log('Is Mobile:', isMobile);
                            console.log('Spotlight Style:', spotlightStyle);
                            if (targetElement) {
                              const rect = targetElement.getBoundingClientRect();
                              console.log('Element Rect:', rect);
                              console.log('Tooltip Position:', getTooltipPosition());
                            }
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Debug Info"
                        >
                          <span className="text-xs text-gray-600">🐛</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {currentStep === tourSteps.length - 1 ? (
                        <button
                          onClick={handleComplete}
                          className={`bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:from-primary-800 hover:to-accent-600 transition-all duration-200 flex items-center gap-1 ${isMobile ? 'py-1.5 px-3 text-xs' : 'py-2 px-4 text-sm'}`}
                        >
                          <CheckCircle className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                          Finish
                        </button>
                      ) : (
                        <button
                          onClick={handleNext}
                          className={`bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:from-primary-800 hover:to-accent-600 transition-all duration-200 flex items-center gap-1 ${isMobile ? 'py-1.5 px-3 text-xs' : 'py-2 px-4 text-sm'}`}
                        >
                          Next
                          <ArrowRight className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Sparkling Completion Animation */}
      {currentStep === tourSteps.length && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-gradient-to-br from-primary/90 to-primary-900/90 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden relative"
          >
            {/* Sparkling Background Effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: Math.random() * 400,
                    y: Math.random() * 400
                  }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 2, 
                    delay: Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-3xl font-bold text-gray-800 mb-4"
              >
                🎉 Congratulations!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-lg text-gray-600 mb-6"
              >
                You've mastered all the amazing features!
              </motion.p>

              {/* Google Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mb-6"
              >
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">Love your experience? Help others discover ExpertResume!</p>
                  <button
                    onClick={() => {
                      window.open("https://www.google.com/search?sca_esv=b86c91fa3b6f4170&sxsrf=AE3TifPRLtJDqL7htl0SenZk1iF4fN_QhQ:1757186068465&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-EyuK-rVchB7bNyuFSky99VIlTHwKPQ6uyKj-l2eXBvvt_2RPuK0ZKgpBkeHf4GvIkJ6Hp590pQZMMtlfBNnwajafjd_9&q=ExpertResume+Reviews&sa=X&ved=2ahUKEwiI4aib7MSPAxXnzTQHHe2tDUEQ0bkNegQIUBAE&biw=1728&bih=992&dpr=2#lrd=0x3bae136ed29b6951:0x1613f7ea596d7546,3,,,,", '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    Rate Us on Google
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="bg-accent-50 rounded-2xl p-6 mb-6"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Ready to Create Your First Resume?
                </h3>
                <p className="text-gray-600 mb-4">
                  Now that you know all the features, it's time to build an amazing resume that will help you land your dream job!
                </p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Target className="w-5 h-5 text-accent mx-auto mb-1" />
                    <p className="font-medium text-gray-800">ATS Optimized</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Bot className="w-5 h-5 text-accent mx-auto mb-1" />
                    <p className="font-medium text-gray-800">AI Enhanced</p>
                  </div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                onClick={() => {
                  onComplete?.();
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-primary-800 hover:to-accent-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
              >
                <Sparkles className="w-6 h-6" />
                Start Building Your Resume
                <ArrowRight className="w-6 h-6" />
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="text-sm text-gray-500 mt-4"
              >
                This window will close automatically in a few seconds
              </motion.p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
} 