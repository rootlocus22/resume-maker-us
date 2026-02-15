"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, FileUp, FileText, Search, Camera, Download, Save, Sparkles, Zap, Star, Wand2, Crown, Trophy, Target, Rocket, DollarSign } from "lucide-react";

export default function ProgressOverlay({ isVisible, type }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messageCycle, setMessageCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showStars, setShowStars] = useState(false);

  const progressMessages = {
    upload: {
      icon: FileUp,
      color: "from-accent-500 to-accent",
      accentColor: "emerald",
      title: "Analyzing Your Resume",
      messages: [
        "🔍 Scanning your professional journey...",
        "✨ Extracting your unique strengths...",
        "🎯 Identifying key achievements...",
        "🚀 Preparing AI-powered insights...",
        "💎 Polishing your career highlights..."
      ],
      motivation: "Every great career story deserves the perfect presentation!"
    },
    ai: {
      icon: Bot,
      color: "from-primary to-accent",
      accentColor: "purple",
      title: "AI Enhancement in Progress",
      messages: [
        "🧠 AI analyzing your career potential...",
        "✨ Crafting personalized improvements...",
        "🎨 Optimizing content for impact...",
        "🔥 Enhancing your professional story...",
        "⭐ Fine-tuning for maximum appeal..."
      ],
      motivation: "Your enhanced resume will open doors to amazing opportunities!"
    },
    download: {
      icon: Download,
      color: "from-primary to-primary-800",
      accentColor: "blue",
      title: "Creating Your PDF",
      messages: [
        "📄 Assembling your professional masterpiece...",
        "🎨 Applying perfect formatting...",
        "✨ Adding final polish touches...",
        "📋 Ensuring ATS optimization...",
        "🎯 Preparing for download..."
      ],
      motivation: "Your recruiter-ready resume is almost ready!"
    },
    atscheck: {
      icon: Target,
      color: "from-orange-500 to-red-500",
      accentColor: "orange",
      title: "ATS Score Analysis",
      messages: [
        "🎯 Scanning for ATS compatibility...",
        "📊 Calculating optimization score...",
        "🔍 Identifying improvement areas...",
        "💡 Generating smart suggestions...",
        "⚡ Finalizing your ATS report..."
      ],
      motivation: "A higher ATS score means more interview invitations!"
    },
    screenshot: {
      icon: Camera,
      color: "from-primary to-rose-500",
      accentColor: "pink",
      title: "Capturing Your Score",
      messages: [
        "📸 Capturing your achievement...",
        "🎨 Creating a beautiful snapshot...",
        "✨ Adding professional styling...",
        "🌟 Optimizing image quality...",
        "🎯 Preparing shareable format..."
      ],
      motivation: "Share your success with pride!"
    },
    save: {
      icon: Save,
      color: "from-primary to-accent",
      accentColor: "green",
      title: "Securing Your Work",
      messages: [
        "💾 Safely storing your resume...",
        "🔒 Encrypting your data...",
        "☁️ Syncing to secure cloud...",
        "✅ Verifying save completion...",
        "🎉 Your work is protected!"
      ],
      motivation: "Your career investment is safely secured!"
    },
    onepager: {
      icon: FileText,
      color: "from-accent to-accent-500",
      accentColor: "emerald",
      title: "Creating One-Pager Resume",
      messages: [
        "📄 Condensing your experience into one page...",
        "🧠 AI optimizing content for impact...",
        "🎯 Extracting key achievements...",
        "✨ Crafting professional layout...",
        "📋 Finalizing ATS-optimized format..."
      ],
      motivation: "A powerful one-page resume that gets you noticed!"
    },
    salary: {
      icon: DollarSign,
      color: "from-primary to-accent",
      accentColor: "blue",
      title: "AI Salary Analysis",
      messages: [
        "💰 Analyzing market compensation data...",
        "📊 Processing industry benchmarks...",
        "🎯 Calculating your market value...",
        "📈 Generating negotiation insights...",
        "✨ Preparing comprehensive salary report..."
      ],
      motivation: "Knowledge is power - know your true worth!"
    },
    interview: {
      icon: Target,
      color: "from-primary-800 to-primary",
      accentColor: "purple",
      title: "AI Interview Training",
      messages: [
        "🎯 Preparing personalized interview questions...",
        "🧠 Analyzing your target role requirements...",
        "📝 Crafting scenario-based challenges...",
        "🎭 Setting up realistic interview environment...",
        "✨ Starting your AI-powered interview session..."
      ],
      motivation: "Practice makes perfect - ace your next interview!"
    }
  };

  const currentConfig = progressMessages[type] || progressMessages.ai;

  useEffect(() => {
    if (!isVisible) {
      setDisplayText("");
      setCurrentIndex(0);
      setMessageCycle(0);
      setProgress(0);
      setShowStars(false);
      return;
    }

    console.log('ProgressOverlay type:', type, 'isVisible:', isVisible);

    // Simulate smooth progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 3;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 200);

    // Show celebration stars occasionally
    const starsInterval = setInterval(() => {
      setShowStars(true);
      setTimeout(() => setShowStars(false), 1000);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(starsInterval);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const currentMessage = currentConfig.messages[messageCycle % currentConfig.messages.length];
    const typingSpeed = 30; // Faster typing for one-pager

    if (currentIndex < currentMessage.length) {
      const timeout = setTimeout(() => {
        setDisplayText(currentMessage.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      const pauseTimeout = setTimeout(() => {
        setCurrentIndex(0);
        setDisplayText("");
        setMessageCycle((prev) => {
          console.log('Message cycle advancing from', prev, 'to', prev + 1, 'for type:', type);
          return prev + 1;
        });
      }, type === 'onepager' ? 1500 : 2000); // Shorter pause for one-pager
      return () => clearTimeout(pauseTimeout);
    }
  }, [isVisible, currentIndex, messageCycle, currentConfig, type]);

  if (!isVisible) return null;

  const IconComponent = currentConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900/95 via-slate-900/95 to-gray-900/95 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentConfig.color} opacity-5 animate-pulse`} />

        {/* Floating stars animation */}
        <AnimatePresence>
          {showStars && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: Math.random() * 300, y: Math.random() * 400 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [Math.random() * 400, Math.random() * 200]
                  }}
                  transition={{ duration: 2, delay: i * 0.1 }}
                  className={`absolute text-${currentConfig.accentColor}-400`}
                >
                  <Star size={16} fill="currentColor" />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <div className="relative z-10">
          {/* Header Section */}
          <div className="text-center mb-6">
            <motion.div
              className="relative mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ width: 'fit-content' }}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentConfig.color} flex items-center justify-center shadow-lg`}>
                <IconComponent size={28} className="text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: `rgb(${currentConfig.accentColor === 'emerald' ? '34, 197, 94' :
                    currentConfig.accentColor === 'purple' ? '168, 85, 247' :
                      currentConfig.accentColor === 'blue' ? '59, 130, 246' :
                        currentConfig.accentColor === 'orange' ? '249, 115, 22' :
                          currentConfig.accentColor === 'pink' ? '236, 72, 153' :
                            '34, 197, 94'})`,
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-white mb-2"
            >
              {currentConfig.title}
            </motion.h2>
          </div>

          {/* Message Display */}
          <div className="mb-6">
            <div className="min-h-[3rem] flex items-center justify-center">
              <motion.p
                key={messageCycle}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-base font-medium text-white text-center leading-relaxed"
              >
                {displayText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-1 text-primary font-bold"
                >
                  |
                </motion.span>
              </motion.p>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">Progress</span>
              <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                className={`h-full bg-gradient-to-r ${currentConfig.color} rounded-full relative overflow-hidden`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-30"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </div>

          {/* Motivation Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-center p-4 bg-gradient-to-r ${currentConfig.color} bg-opacity-10 rounded-xl border border-opacity-20`}
            style={{
              borderColor: `rgb(${currentConfig.accentColor === 'emerald' ? '34, 197, 94' :
                currentConfig.accentColor === 'purple' ? '168, 85, 247' :
                  currentConfig.accentColor === 'blue' ? '59, 130, 246' :
                    currentConfig.accentColor === 'orange' ? '249, 115, 22' :
                      currentConfig.accentColor === 'pink' ? '236, 72, 153' :
                        '34, 197, 94'})`
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={16} className={`text-${currentConfig.accentColor}-500`} />
              <span className="text-sm font-semibold text-white">Did You Know?</span>
              <Sparkles size={16} className={`text-${currentConfig.accentColor}-500`} />
            </div>
            <p className="text-sm text-white font-medium">
              {currentConfig.motivation}
            </p>
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute top-4 right-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Wand2 size={20} className={`text-${currentConfig.accentColor}-400 opacity-60`} />
            </motion.div>
          </div>

          <div className="absolute bottom-4 left-4">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Trophy size={18} className={`text-${currentConfig.accentColor}-400 opacity-60`} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}