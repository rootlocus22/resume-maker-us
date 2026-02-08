"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Brain,
  Target,
  Sparkles,
  Clock,
  FileText,
  Zap,
  TrendingUp,
  Shield,
  ArrowRight,
  Rocket,
  Star,
  Award,
  Crown,
  Bot,
  Loader2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BarChart3
} from "lucide-react";

const UnifiedResumeProcessor = ({ 
  isVisible, 
  onComplete, 
  onError,
  file,
  isPremium = false,
  isBasicPlan = false,
  isOneDayPlan = false,
  uploadCount = 0,
  user = null,
  onShowUpgradeModal = null,
  enterpriseMode = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState({
    parsing: 'pending',
    atsCheck: 'pending',
    optimization: 'pending'
  });
  const [stepData, setStepData] = useState({
    parsedData: null,
    atsData: null,
    optimizedData: null
  });
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Detect screen height and set compact mode for smaller screens
  useEffect(() => {
    const checkScreenHeight = () => {
      const height = window.innerHeight;
      // Enable compact mode for screens smaller than 600px height
      setIsCompactMode(height < 600);
    };

    checkScreenHeight();
    window.addEventListener('resize', checkScreenHeight);
    return () => window.removeEventListener('resize', checkScreenHeight);
  }, []);
  const [estimatedTime, setEstimatedTime] = useState('15-30 seconds');
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const [insights, setInsights] = useState([]);

  const steps = [
    {
      id: 'parsing',
      title: 'AI Resume Parsing',
      description: 'Extracting and structuring your resume data',
      icon: Brain,
      color: 'blue',
      messages: [
        '🧠 AI is reading your resume content...',
        '🔍 Identifying key sections and skills...',
        '📊 Structuring data for optimal processing...',
        '✨ Parsing complete! Your resume is now AI-ready!'
      ],
      anticipationMessages: [
        'Our AI is analyzing every word...',
        'Detecting your unique skills and experience...',
        'Preparing for the next level of optimization...'
      ],
      timeEstimate: 8 // seconds
    },
    {
      id: 'atsCheck',
      title: 'ATS Compatibility Analysis',
      description: 'Analyzing ATS optimization and scoring',
      icon: Target,
      color: 'green',
      messages: [
        '🎯 Scanning for ATS compatibility...',
        '🔑 Checking keyword optimization...',
        '📋 Analyzing formatting and structure...',
        '🏆 ATS analysis complete! Your resume scored well!'
      ],
      anticipationMessages: [
        'ATS systems are being analyzed...',
        'Your resume is being scored by industry standards...',
        'Preparing optimization recommendations...'
      ],
      timeEstimate: 10 // seconds
    },
    {
      id: 'optimization',
      title: 'AI Resume Enhancement',
      description: 'Optimizing content for better results',
      icon: Sparkles,
      color: 'purple',
      messages: [
        '✨ Enhancing content with AI insights...',
        '🚀 Optimizing keywords and phrases...',
        '💎 Improving structure and flow...',
        '🎉 Optimization complete! Your resume is now world-class!'
      ],
      anticipationMessages: [
        'AI is crafting the perfect resume...',
        'Your resume is being transformed...',
        'Something amazing is about to happen...'
      ],
      timeEstimate: 12 // seconds
    }
  ];

  // Start timer when processing begins
  useEffect(() => {
    if (isProcessing) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsedTime(0);
    }

    return () => clearInterval(timerRef.current);
  }, [isProcessing]);

  // Generate dynamic insights based on processing stage
  useEffect(() => {
    const newInsights = [];
    
    if (stepStatus.parsing === 'processing') {
      newInsights.push({
        text: "AI is identifying your top skills and experiences",
        icon: Brain,
        color: "text-blue-500"
      });
    }
    
    if (stepStatus.atsCheck === 'processing' || stepStatus.atsCheck === 'completed') {
      newInsights.push({
        text: "Optimizing for Applicant Tracking Systems used by Fortune 500 companies",
        icon: Target,
        color: "text-green-500"
      });
    }
    
    if (stepStatus.optimization === 'processing' || stepStatus.optimization === 'completed') {
      newInsights.push({
        text: "Enhancing your resume with industry-specific keywords",
        icon: Sparkles,
        color: "text-purple-500"
      });
    }
    
    // Add general tips if we have space
    if (newInsights.length < 3) {
      newInsights.push({
        text: "Resumes with optimized formatting get 40% more views",
        icon: TrendingUp,
        color: "text-amber-500"
      });
    }
    
    setInsights(newInsights);
  }, [stepStatus]);

  const getStepColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[color] || colors.blue;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
    }
  };

  const processStep = async (stepIndex, currentData = stepData) => {
    const step = steps[stepIndex];
    setCurrentStep(stepIndex);
    setStepStatus(prev => ({ ...prev, [step.id]: 'processing' }));
    setErrorMessage(null);

    // Update progress
    const baseProgress = (stepIndex / steps.length) * 100;
    setProgressPercentage(baseProgress);

    // Show anticipation messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (messageIndex < step.anticipationMessages.length) {
        setCurrentMessage(step.anticipationMessages[messageIndex]);
        messageIndex++;
      } else {
        clearInterval(messageInterval);
      }
    }, 2000);

    try {
      let response;
      let data;
      let updatedData = currentData;

      switch (step.id) {
        case 'parsing':
          const parseFormData = new FormData();
          parseFormData.append("file", file);
          parseFormData.append("entryPoint", "upload-resume");
          parseFormData.append("pageUrl", "/upload-resume");
          
          response = await fetch("/api/gemini-parse-resume", {
            method: "POST",
            body: parseFormData
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Parsing failed: ${response.statusText} - ${errorText}`);
          }

          data = await response.json();
          updatedData = { ...currentData, parsedData: data };
          setStepData(updatedData);
          break;

        case 'atsCheck':
          const atsFormData = new FormData();
          atsFormData.append("file", file);
          atsFormData.append("bypassCache", "true");
          atsFormData.append("entryPoint", "upload-resume");
          atsFormData.append("pageUrl", "/upload-resume");
          
          response = await fetch("/api/ats-checker", {
            method: "POST",
            body: atsFormData
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ATS check failed: ${response.statusText} - ${errorText}`);
          }

          data = await response.json();
          updatedData = { ...currentData, atsData: data };
          setStepData(updatedData);
          break;

        case 'optimization':
          if (!currentData.parsedData) {
            throw new Error('Parsed resume data is missing. Please retry the process.');
          }
          if (!currentData.atsData) {
            throw new Error('ATS analysis data is missing. Please retry the process.');
          }
          
          response = await fetch('/api/optimize-resume', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              originalResumeData: currentData.parsedData,
              atsAnalysisResult: currentData.atsData
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Optimization failed: ${response.statusText} - ${errorText}`);
          }

          data = await response.json();
          updatedData = { ...currentData, optimizedData: data };
          setStepData(updatedData);
          break;
      }

      clearInterval(messageInterval);
      setStepStatus(prev => ({ ...prev, [step.id]: 'completed' }));
      
      // Show completion message
      setCurrentMessage(step.messages[step.messages.length - 1]);
      
      // Update progress
      setProgressPercentage(((stepIndex + 1) / steps.length) * 100);
      
      // Move to next step or complete
      if (stepIndex < steps.length - 1) {
        setTimeout(() => {
          processStep(stepIndex + 1, updatedData);
        }, 2000);
      } else {
        // All steps completed
        setTimeout(() => {
          setCurrentMessage('🎉 Your world-class resume is ready!');
          setTimeout(() => {
            onComplete(updatedData);
          }, 2000);
        }, 2000);
      }

    } catch (error) {
      clearInterval(messageInterval);
      console.error(`Error in ${step.id}:`, error);
      setStepStatus(prev => ({ ...prev, [step.id]: 'error' }));
      setErrorMessage(error.message);
      onError(error);
    }
  };

  const handleRetry = () => {
    setStepStatus({
      parsing: 'pending',
      atsCheck: 'pending',
      optimization: 'pending'
    });
    setStepData({
      parsedData: null,
      atsData: null,
      optimizedData: null
    });
    setCurrentStep(0);
    setErrorMessage(null);
    setProgressPercentage(0);
    setCurrentMessage('');
    processStep(0);
  };

  const handleStart = () => {
    // Check upload limit for free users
    // Basic plan, oneDay plan, and enterprise users have unlimited uploads
    if (!enterpriseMode && !isPremium && !isBasicPlan && !isOneDayPlan && uploadCount >= 1) {
      if (onShowUpgradeModal) {
        onShowUpgradeModal();
      }
      onError(new Error('Upload limit reached'));
      return;
    }
    
    setIsProcessing(true);
    setCurrentMessage('🚀 Starting your resume transformation...');
    processStep(0);
  };

  useEffect(() => {
    if (isVisible && file) {
      handleStart();
    } else if (!isVisible) {
      // Reset all states when component becomes invisible (reset clicked)
      setCurrentStep(0);
      setStepStatus({
        parsing: 'pending',
        atsCheck: 'pending',
        optimization: 'pending'
      });
      setStepData({
        parsedData: null,
        atsData: null,
        optimizedData: null
      });
      setErrorMessage(null);
      setCurrentMessage('');
      setProgressPercentage(0);
      setIsProcessing(false);
      setShowDetails(false);
    }
  }, [isVisible, file]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-[90vh] sm:h-[85vh] md:h-[80vh] lg:h-[75vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white flex-shrink-0 ${isCompactMode ? 'p-2' : 'p-4 sm:p-6'}`}>
            {isCompactMode ? (
              // Compact header for small screens
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 animate-pulse" />
                  </div>
                <div>
                  <h2 className="text-sm font-bold">AI Processing</h2>
                  <p className="text-blue-100 text-xs">{Math.round(progressPercentage)}% Complete • Est. 90s</p>
                </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold">{elapsedTime}s</div>
                </div>
              </div>
            ) : (
              // Full header for larger screens
              <>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">ExpertResume AI Processing</h2>
                      <p className="text-blue-100 text-xs sm:text-sm">Transforming your resume with AI</p>
                    </div>
                  </div>
                  
                  {/* Timer */}
                  <div className="text-right">
                    <div className="text-xs font-medium opacity-80">Processing Time</div>
                    <div className="text-sm font-bold">{elapsedTime}s / 90s</div>
                  </div>
                </div>
                
                {/* Status Message */}
                <motion.div 
                  key={currentMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 sm:mb-4 text-center py-2 bg-white/10 rounded-lg"
                >
                  <p className="text-sm sm:text-base font-medium">{currentMessage}</p>
                </motion.div>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium">Processing Progress</span>
                    <span className="text-xs sm:text-sm font-bold">{Math.round(progressPercentage)}%</span>
                  </div>
                  
                  <div className="w-full bg-white/20 rounded-full h-1.5 sm:h-2">
                    <motion.div
                      className="bg-white h-1.5 sm:h-2 rounded-full relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </motion.div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
         


            {/* Processing Steps - Conditionally Rendered */}
            {(
              <div className={`space-y-2 sm:space-y-3 ${isCompactMode ? 'p-2' : 'p-3'}`}>
                {steps.map((step, index) => {
                  const isActive = currentStep === index;
                  const isCompleted = stepStatus[step.id] === 'completed';
                  const hasError = stepStatus[step.id] === 'error';
                  const isProcessing = stepStatus[step.id] === 'processing';
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className={`relative bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 transition-all duration-500 ${
                        isActive ? 'border-blue-300 shadow-xl scale-[1.02]' :
                        isCompleted ? 'border-green-300 shadow-lg' :
                        hasError ? 'border-red-300 shadow-lg' :
                        'border-gray-200'
                      }`}
                    >
                      {/* Step Header */}
                      <div className={isCompactMode ? 'p-2' : 'p-2 sm:p-3'}>
                        <div className={`flex items-center ${isCompactMode ? 'gap-2' : 'gap-3'}`}>
                          <div className={`${isCompactMode ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl'} bg-gradient-to-r ${getStepColor(step.color)} flex items-center justify-center shadow-lg`}>
                            <step.icon className={`${isCompactMode ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-5 sm:h-5'} text-white`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className={`flex items-center ${isCompactMode ? 'gap-1' : 'gap-2'} mb-0.5`}>
                              <h3 className={`${isCompactMode ? 'text-xs' : 'text-sm sm:text-base'} font-bold text-gray-900`}>{step.title}</h3>
                              {getStatusIcon(stepStatus[step.id])}
                            </div>
                            {!isCompactMode && (
                              <p className="text-gray-600 text-xs">{step.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Error State */}
                      {hasError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className={`border-t border-red-100 bg-red-50 ${isCompactMode ? 'px-2 pb-1' : 'px-2 pb-2'}`}
                        >
                          <div className={isCompactMode ? 'pt-1' : 'pt-1.5'}>
                            <div className={`flex items-center gap-1.5 text-red-600 ${isCompactMode ? 'mb-1' : 'mb-1'}`}>
                              <XCircle className={isCompactMode ? 'w-3 h-3' : 'w-3 h-3'} />
                              <span className={`font-medium ${isCompactMode ? 'text-xs' : 'text-xs'}`}>Error</span>
                            </div>
                            <button
                              onClick={handleRetry}
                              className={`flex items-center gap-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors ${isCompactMode ? 'px-2 py-0.5' : 'px-2 py-1'}`}
                            >
                              <RefreshCw className="w-2 h-2" />
                              Retry
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Success State */}
                      {isCompleted && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className={`border-t border-green-100 bg-green-50 ${isCompactMode ? 'px-2 pb-1' : 'px-2 pb-2'}`}
                        >
                          <div className={isCompactMode ? 'pt-1' : 'pt-1.5'}>
                            <div className={`flex items-center gap-1.5 text-green-600 ${isCompactMode ? 'mb-0' : 'mb-0'}`}>
                              <CheckCircle className={isCompactMode ? 'w-3 h-3' : 'w-3 h-3'} />
                              <span className={`font-medium ${isCompactMode ? 'text-xs' : 'text-xs'}`}>Completed</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ultra Compact Trust Building Section - Fixed at Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`flex-shrink-0 text-center border-t border-gray-100 ${isCompactMode ? 'p-1' : 'p-1.5'}`}
          >
            {isCompactMode ? (
              // Ultra compact footer for small screens
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded p-1 border border-blue-200">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Crown className="w-2 h-2 text-yellow-500" />
                  <span className="text-[8px] font-medium text-gray-700">Premium AI</span>
                  <div className="w-px h-1 bg-gray-300"></div>
                  <Award className="w-2 h-2 text-blue-500" />
                  <span className="text-[8px] font-medium text-gray-700">Industry Leading</span>
                </div>
                <p className="text-[8px] text-gray-600 leading-tight">
                  Trusted by professionals at Google, Amazon, and Microsoft
                </p>
              </div>
            ) : (
              // Full footer for larger screens
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-md p-1 border border-blue-200">
                <div className="flex items-center justify-center gap-1.5 mb-0.5 flex-wrap">
                  <div className="flex items-center gap-0.5">
                    <Crown className="w-2 h-2 text-yellow-500" />
                    <span className="text-[9px] font-medium text-gray-700">Premium AI</span>
                  </div>
                  <div className="w-px h-1 bg-gray-300"></div>
                  <div className="flex items-center gap-0.5">
                    <Award className="w-2 h-2 text-blue-500" />
                    <span className="text-[9px] font-medium text-gray-700">Industry Leading</span>
                  </div>
                  <div className="w-px h-1 bg-gray-300"></div>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-2 h-2 text-purple-500" />
                    <span className="text-[9px] font-medium text-gray-700">Proven Results</span>
                  </div>
                </div>
                
                <p className="text-[9px] text-gray-600 leading-tight">
                  Trusted by professionals at Google, Amazon, and Microsoft
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnifiedResumeProcessor;