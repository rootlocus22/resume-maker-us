"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, TrendingUp, Award, BookOpen, Users, Briefcase, 
  CheckCircle, Clock, Star, ArrowRight, Lock, Sparkles,
  Calendar, BarChart, Lightbulb, Rocket, Trophy, Zap,
  Activity, Brain, Code, GraduationCap, Link2, MessageSquare,
  FileText, AlertCircle, ChevronRight, ChevronDown, Crown,
  Loader2, RefreshCw, Download, Share2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { formatPrice } from '../lib/globalPricing';
import { getOriginalPrice, getDiscountedPrice, isDiscountEnabled } from '../lib/planConfig';
import { 
  RoadmapTab, 
  SkillsTab, 
  CompaniesTab, 
  LinkedInTab, 
  InterviewsTab 
} from './CareerCoachTabs';

export default function CareerCoachClient() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [careerPlan, setCareerPlan] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [hasCachedPlan, setHasCachedPlan] = useState(false);
  const router = useRouter();

  // Get pricing from config
  const currency = 'INR'; // Can be made dynamic based on user location
  const discountEnabled = isDiscountEnabled();
  const monthlyPrice = discountEnabled 
    ? getDiscountedPrice('monthly', currency) 
    : getOriginalPrice('monthly', currency);
  const yearlyPrice = discountEnabled 
    ? getDiscountedPrice('sixMonth', currency) 
    : getOriginalPrice('sixMonth', currency);
  const formattedMonthlyPrice = formatPrice(monthlyPrice, currency);
  const formattedYearlyPrice = formatPrice(yearlyPrice, currency);

  // Helper functions
  const fetchLatestResumeData = async (userId) => {
    try {
      // Try uploadHistory first
      const uploadHistoryRef = collection(db, `users/${userId}/uploadHistory`);
      const uploadQuery = query(uploadHistoryRef, orderBy('timestamp', 'desc'), limit(1));
      const uploadSnapshot = await getDocs(uploadQuery);

      if (!uploadSnapshot.empty) {
        const latestUpload = uploadSnapshot.docs[0].data();
        setResumeData(latestUpload.parsedData || latestUpload.optimizedData);
        console.log('📄 Loaded resume from uploadHistory');
        return;
      }

      // Try atsCheckerHistory if no uploadHistory
      const atsHistoryRef = collection(db, `users/${userId}/atsCheckerHistory`);
      const atsQuery = query(atsHistoryRef, orderBy('timestamp', 'desc'), limit(1));
      const atsSnapshot = await getDocs(atsQuery);

      if (!atsSnapshot.empty) {
        const latestAts = atsSnapshot.docs[0].data();
        setResumeData(latestAts.parsedData);
        console.log('📄 Loaded resume from atsCheckerHistory');
        return;
      }

      console.log('❌ No resume data found');
    } catch (error) {
      console.error('Error fetching resume data:', error);
    }
  };

  const checkCachedAnalysis = async (userId) => {
    try {
      const careerAnalysisRef = collection(db, `users/${userId}/careerGrowthAnalysis`);
      const q = query(careerAnalysisRef, orderBy('generatedAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const cachedPlan = snapshot.docs[0].data();
        const cacheAge = Date.now() - new Date(cachedPlan.generatedAt).getTime();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        // Auto-load cached plan if less than 30 days old
        if (cacheAge < thirtyDays) {
          setCareerPlan({
            ...cachedPlan,
            cached: true,
            cacheAge: Math.floor(cacheAge / (24 * 60 * 60 * 1000))
          });
          console.log('📄 Auto-loaded cached career analysis');
        }
      }
    } catch (error) {
      console.error('Error checking cached analysis:', error);
    }
  };

  const checkForCachedPlan = async () => {
    if (user && !careerPlan) {
      try {
        const careerAnalysisRef = collection(db, `users/${user.uid}/careerGrowthAnalysis`);
        const q = query(careerAnalysisRef, orderBy('generatedAt', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        setHasCachedPlan(!snapshot.empty);
      } catch (error) {
        console.error('Error checking for cached plan:', error);
      }
    }
  };

  // Check authentication and fetch data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Fetch user data
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          const userDataFromDb = userSnap.data();
          setUserData(userDataFromDb);

          // Fetch latest resume data from uploadHistory or atsCheckerHistory
          await fetchLatestResumeData(currentUser.uid);

          // Check if we have a cached career analysis
          await checkCachedAnalysis(currentUser.uid);
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load your data');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check for cached plan on mount
  useEffect(() => {
    checkForCachedPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, careerPlan]);

  const generateCareerPlan = async (forceRegenerate = false) => {
    if (!resumeData) {
      toast.error('No resume data found. Please upload or analyze a resume first.');
      return;
    }

    if (!user) {
      toast.error('Please sign in to generate your career plan.');
      return;
    }

    setGenerating(true);
    try {
      // Deep clean resume data to remove any circular references or non-serializable data
      let cleanResumeData;
      try {
        // First pass: remove obvious circular references
        const tempData = JSON.parse(JSON.stringify(resumeData, (key, value) => {
          // Skip any DOM elements, React fibers, or functions
          if (typeof value === 'function' || 
              value instanceof Element || 
              value instanceof Node ||
              key.startsWith('__react') ||
              key.startsWith('_react')) {
            return undefined;
          }
          return value;
        }));
        cleanResumeData = tempData;
      } catch (cleanError) {
        console.error('Error cleaning resume data:', cleanError);
        // Fallback: extract only basic fields
        cleanResumeData = {
          name: resumeData?.name || '',
          email: resumeData?.email || '',
          phone: resumeData?.phone || '',
          summary: resumeData?.summary || '',
          experience: resumeData?.experience || [],
          education: resumeData?.education || [],
          skills: resumeData?.skills || [],
          certifications: resumeData?.certifications || [],
          projects: resumeData?.projects || []
        };
      }

      const payload = {
        resumeData: cleanResumeData,
        userPlan: userData?.plan || 'free',
        userId: user?.uid || '',
        forceRegenerate: !!forceRegenerate
      };

      const response = await fetch('/api/career-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to generate career plan');
      }

      const plan = await response.json();
      setCareerPlan(plan);
      
      if (plan.cached) {
        toast.success(`📄 Loaded your career plan (updated ${plan.cacheAge} days ago)`);
      } else {
        toast.success('🎉 Your personalized career plan is ready!');
      }
    } catch (error) {
      console.error('Error generating career plan:', error);
      toast.error('Failed to generate career plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleMonth = (index) => {
    setExpandedMonths(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isPremiumUser = () => {
    const plan = userData?.plan;
    // Only monthly and yearly plans get full access
    return plan && ['monthly', 'sixMonth', 'premium', 'yearly'].includes(plan);
  };

  const isFreePlanUser = () => {
    const plan = userData?.plan;
    // Free, anonymous, oneDay, and basic plans only get preview
    return !plan || plan === 'free' || plan === 'anonymous' || plan === 'oneDay' || plan === 'basic';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your career coach...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Career Coach
          </h2>
          <p className="text-gray-600 mb-8">
            Sign in to get your personalized career development plan
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg"
          >
            Sign In to Continue
          </button>
        </motion.div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">
            No Resume Data Found
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            To get your personalized AI career plan, you need to upload or analyze a resume first. Our AI will use your resume data to create a comprehensive career development strategy.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/upload-resume')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg text-sm sm:text-base inline-flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Upload Resume
            </button>
            <button
              onClick={() => router.push('/ats-score-checker')}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2"
            >
              <BarChart className="w-4 h-4 sm:w-5 sm:h-5" />
              Check ATS Score
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500">
              💡 Tip: Upload your resume to get personalized career guidance, skill recommendations, and interview preparation strategies.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!careerPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
                  backgroundSize: '50px 50px'
                }}></div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">AI Career Coach</h1>
                </div>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  {hasCachedPlan ? 'Your personalized career plan is ready!' : 'Get a personalized 3-6 month career development plan powered by AI'}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">
                  Ready to Accelerate Your Career?
                </h2>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 px-4">
                  Our AI will analyze your resume and create a detailed roadmap for your success
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[
                  { icon: Target, title: 'Personalized Goals', desc: 'Custom milestones based on your background' },
                  { icon: Award, title: 'Certifications', desc: 'Recommended courses and credentials' },
                  { icon: Code, title: 'Skill Development', desc: 'Technical and soft skills roadmap' },
                  { icon: Briefcase, title: 'Company Targets', desc: 'Best-fit companies for your profile' },
                  { icon: Link2, title: 'LinkedIn Tips', desc: 'Optimize your professional presence' },
                  { icon: MessageSquare, title: 'Interview Prep', desc: 'Structured preparation plan' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200"
                  >
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center">
                {hasCachedPlan ? (
                  <>
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                      <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto mb-2 sm:mb-3" />
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                        You Have an Existing Career Plan!
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-4">
                        Your plan is automatically loaded. You can view it or generate a fresh one.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
                      <button
                        onClick={() => checkCachedAnalysis(user.uid)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-base sm:text-lg inline-flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto"
                      >
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                        View Existing Plan
                      </button>
                      <button
                        onClick={() => generateCareerPlan(true)}
                        disabled={generating}
                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-base sm:text-lg inline-flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                            <span className="hidden sm:inline">Generating...</span>
                            <span className="sm:hidden">Generating</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="hidden sm:inline">Generate Fresh Plan</span>
                            <span className="sm:hidden">Generate New</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={generateCareerPlan}
                      disabled={generating}
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-base sm:text-lg inline-flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-md mx-auto"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                          <span>Generating Your Plan...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span>Generate My Career Plan</span>
                          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </>
                      )}
                    </button>
                    <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                      This usually takes 10-15 seconds
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  // Career Plan View
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'roadmap', label: '6-Month Roadmap', icon: Calendar },
    { id: 'skills', label: 'Skills & Certs', icon: Award },
    { id: 'companies', label: 'Target Companies', icon: Briefcase },
    { id: 'linkedin', label: 'LinkedIn', icon: Link2 },
    { id: 'interviews', label: 'Interview Prep', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Your Career Development Plan
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Generated on {new Date(careerPlan.generatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {careerPlan.cached && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-blue-50 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                  <span className="whitespace-nowrap">Updated {careerPlan.cacheAge} {careerPlan.cacheAge === 1 ? 'day' : 'days'} ago</span>
                </div>
              )}
              <button
                onClick={() => generateCareerPlan(true)}
                disabled={generating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{generating ? 'Regenerating...' : 'Regenerate Plan'}</span>
                <span className="sm:hidden">{generating ? 'Regenerating' : 'Regenerate'}</span>
              </button>
            </div>
          </div>

          {/* Free User Banner */}
          {isFreePlanUser() && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Unlock Full Career Plan</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                    You're seeing a preview. Upgrade to Premium plan ({formattedMonthlyPrice}/month or {formattedYearlyPrice}/6 months) to unlock your complete 6-month roadmap, detailed interview prep, and more!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => router.push('/checkout?billingCycle=monthly')}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold inline-flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formattedMonthlyPrice}/month
                    </button>
                    <button
                      onClick={() => router.push('/checkout?billingCycle=sixMonth')}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold inline-flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formattedYearlyPrice}/6 months
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-1.5 sm:p-2 mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex gap-1.5 sm:gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm lg:text-base whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedTab === 'overview' && (
              <OverviewTab careerPlan={careerPlan} isPremium={isPremiumUser()} isFree={isFreePlanUser()} />
            )}
            {selectedTab === 'roadmap' && (
              <RoadmapTab 
                careerPlan={careerPlan} 
                isPremium={isPremiumUser()} 
                isFree={isFreePlanUser()}
                expandedMonths={expandedMonths}
                toggleMonth={toggleMonth}
              />
            )}
            {selectedTab === 'skills' && (
              <SkillsTab careerPlan={careerPlan} isPremium={isPremiumUser()} isFree={isFreePlanUser()} />
            )}
            {selectedTab === 'companies' && (
              <CompaniesTab careerPlan={careerPlan} isPremium={isPremiumUser()} isFree={isFreePlanUser()} />
            )}
            {selectedTab === 'linkedin' && (
              <LinkedInTab careerPlan={careerPlan} isPremium={isPremiumUser()} isFree={isFreePlanUser()} />
            )}
            {selectedTab === 'interviews' && (
              <InterviewsTab careerPlan={careerPlan} isPremium={isPremiumUser()} isFree={isFreePlanUser()} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ careerPlan, isPremium, isFree }) {
  const { careerSummary, strengths, improvementAreas, quickWins, longTermVision } = careerPlan;

  return (
    <div className="space-y-6">
      {/* Career Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Career Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-semibold mb-1">Current Level</p>
            <p className="text-lg font-bold text-gray-900">{careerSummary.currentLevel}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <p className="text-sm text-purple-600 font-semibold mb-1">Experience</p>
            <p className="text-lg font-bold text-gray-900">{careerSummary.yearsOfExperience} years</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <p className="text-sm text-green-600 font-semibold mb-1">Industry</p>
            <p className="text-lg font-bold text-gray-900">{careerSummary.industryFocus}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <p className="text-sm text-orange-600 font-semibold mb-1">Top Skills</p>
            <p className="text-lg font-bold text-gray-900">{careerSummary.primarySkills.length}</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-700">{careerSummary.careerTrajectory}</p>
        </div>
      </motion.div>

      {/* Quick Wins */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Quick Wins
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickWins.map((win, index) => (
            <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-500 rounded-lg p-2 flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{win.action}</h3>
                  <p className="text-sm text-gray-600 mb-2">{win.impact}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-white px-2 py-1 rounded-full text-gray-700">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {win.timeRequired}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${
                      win.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      win.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {win.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-green-600" />
            Your Strengths
          </h2>
          <div className="space-y-4">
            {strengths.slice(0, isFree ? 2 : strengths.length).map((strength, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  {strength.area}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{strength.description}</p>
                <p className="text-xs text-green-700 font-medium">Impact: {strength.impact}</p>
              </div>
            ))}
            {isFree && strengths.length > 2 && (
              <div className="bg-gray-50 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
                <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">+{strengths.length - 2} more strengths</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Growth Areas
          </h2>
          <div className="space-y-4">
            {improvementAreas.slice(0, isFree ? 2 : improvementAreas.length).map((area, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{area.area}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    area.priority === 'High' ? 'bg-red-100 text-red-700' :
                    area.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {area.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>{area.currentLevel}</span>
                  <ArrowRight className="w-4 h-4" />
                  <span className="font-semibold text-blue-600">{area.targetLevel}</span>
                </div>
                <p className="text-xs text-gray-600">{area.reasoning}</p>
              </div>
            ))}
            {isFree && improvementAreas.length > 2 && (
              <div className="bg-gray-50 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
                <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">+{improvementAreas.length - 2} more areas</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Long-term Vision */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
          Your Career Vision
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-purple-200 text-sm font-semibold mb-2">6 Months</p>
            <p className="font-medium">{longTermVision['6MonthGoal']}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-purple-200 text-sm font-semibold mb-2">1 Year</p>
            <p className="font-medium">{longTermVision['1YearGoal']}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-purple-200 text-sm font-semibold mb-2">3 Years</p>
            <p className="font-medium">{longTermVision['3YearGoal']}</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
          <p className="text-purple-200 text-sm font-semibold mb-2">Career Path</p>
          <p className="font-medium">{longTermVision.careerPath}</p>
        </div>
      </motion.div>
    </div>
  );
}
