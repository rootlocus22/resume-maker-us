"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, FileText, Target, Sparkles, Loader2, X, RotateCcw } from "lucide-react";

const ResumeProcessingStepper = ({ 
  isVisible, 
  currentStep, 
  onComplete,
  errorSteps = new Set(),
  onRetry = null,
  retryCount = 0
}) => {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [failedSteps, setFailedSteps] = useState(new Set());

  const steps = [
    {
      id: 'parsing',
      title: 'Parsing Resume',
      description: 'Extracting your professional information',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      accentColor: 'blue'
    },
    {
      id: 'ats-check',
      title: 'Checking ATS Score',
      description: 'Analyzing compatibility with ATS systems',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      accentColor: 'orange'
    },
    {
      id: 'ai-boost',
      title: 'Applying AI Boost',
      description: 'Enhancing your resume with AI optimization',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      accentColor: 'purple'
    }
  ];

  useEffect(() => {
    if (!isVisible) {
      setCompletedSteps(new Set());
      setFailedSteps(new Set());
      return;
    }

    // Update failed steps from props
    setFailedSteps(errorSteps);

    // Mark steps as completed based on currentStep
    // Only mark as completed when we move to the next step or finish
    if (currentStep === 'ats-check') {
      setCompletedSteps(new Set(['parsing']));
    } else if (currentStep === 'ai-boost') {
      setCompletedSteps(new Set(['parsing', 'ats-check']));
    } else if (currentStep === 'completed') {
      setCompletedSteps(new Set(['parsing', 'ats-check', 'ai-boost']));
      // Call onComplete after a short delay to show the final state
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    } else if (currentStep === 'error') {
      // Handle error state - stepper will show error and retry option
      setTimeout(() => {
        onComplete?.();
      }, 3000); // Auto-dismiss after 3 seconds
    }
  }, [isVisible, currentStep, onComplete, errorSteps]);

  if (!isVisible) {
    console.log('ResumeProcessingStepper: Not visible');
    return null;
  }

  console.log('ResumeProcessingStepper: Rendering with currentStep:', currentStep, 'completedSteps:', completedSteps);

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  console.log('ResumeProcessingStepper: currentStepIndex:', currentStepIndex);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg z-[10001] py-3 px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* Horizontal Stepper */}
        <div className="flex items-center justify-between relative">
          {/* Animated Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full -z-10">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-orange-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: currentStepIndex === 0 ? '0%' : 
                       currentStepIndex === 1 ? '50%' : 
                       currentStepIndex === 2 ? '100%' : '100%'
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isFailed = failedSteps.has(step.id);
            const isCurrent = step.id === currentStep && !isFailed;
            const isUpcoming = index > currentStepIndex;
            
            const IconComponent = step.icon;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center relative z-10"
              >
                {/* Step Circle */}
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted 
                      ? 'bg-green-500 shadow-lg' 
                      : isFailed
                      ? 'bg-red-500 shadow-lg'
                      : isCurrent 
                      ? `bg-gradient-to-r ${step.color} shadow-lg`
                      : 'bg-gray-300'
                  }`}
                  animate={isCurrent ? { 
                    scale: [1, 1.15, 1]
                  } : isFailed ? {
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <Check size={16} className="text-white font-bold" />
                    </motion.div>
                  ) : isFailed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <X size={16} className="text-white font-bold" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 size={16} className="text-white" />
                    </motion.div>
                  ) : (
                    <IconComponent size={16} className="text-white" />
                  )}
                </motion.div>

                {/* Step Title Only */}
                <motion.h3 
                  className={`text-xs font-bold text-center max-w-20 leading-tight ${
                    isCompleted ? 'text-green-800' : 
                    isFailed ? 'text-red-800' :
                    isCurrent ? 'text-gray-900' : 
                    'text-gray-600'
                  }`}
                  animate={isCurrent ? { opacity: [0.8, 1, 0.8] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  {step.title}
                </motion.h3>
              </motion.div>
            );
          })}
        </div>

        {/* Completion/Error Message */}
        <AnimatePresence>
          {currentStep === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6, delay: 0.7 }}
                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg"
              >
                <Check size={12} className="text-white font-bold" />
              </motion.div>
              <h3 className="text-xs font-bold text-green-800">
                Processing Complete!
              </h3>
            </motion.div>
          )}
          
          {currentStep === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6, delay: 0.7 }}
                className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg"
              >
                <X size={12} className="text-white font-bold" />
              </motion.div>
              <h3 className="text-xs font-bold text-red-800 mb-2">
                Processing Failed
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                {retryCount === 0 ? 'Please try again' : `Retry ${retryCount}/3`}
              </p>
              {onRetry && retryCount < 3 && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors mx-auto"
                >
                  <RotateCcw size={12} />
                  Try Again
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ResumeProcessingStepper;
