"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, deleteDoc, addDoc, query, orderBy, where, getDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, FileText, Users, TrendingUp, Calendar, Clock, Plus,
  ArrowRight, Sparkles, Target, Award, Rocket, Star,
  BarChart3, DollarSign, Zap, CheckCircle
} from "lucide-react";
import ClientModal from "../../components/ClientModal";
import { loadDashboardSettings } from "../../lib/dashboardSettings";
import { createClient } from "../../lib/teamDataAccess";
import { logActivity, ACTIVITY_TYPES, USER_ROLES, isAdmin } from "../../lib/teamManagement";
import QuotaLimitModal from "../../components/QuotaLimitModal";
import { fixExistingUserProfile } from "../../lib/fixExistingUser";

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [dashboardSettings, setDashboardSettings] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalClients: 0,
    thisWeekResumes: 0,
    thisMonthResumes: 0,
    completionRate: 0,
    avgTemplatesUsed: 0,
    recentActivity: 0
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showOnboardingFlow, setShowOnboardingFlow] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(true); // Default to true until verified
  const [userRole, setUserRole] = useState(null);
  const [businessName, setBusinessName] = useState(null);

  useEffect(() => {
    // Give auth context time to initialize
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isCheckingAuth) return;

    if (!user) {
      router.push("/login");
      return;
    }
    loadDashboardData();
  }, [user, router, isCheckingAuth]);

  const loadDashboardData = async () => {
    if (!user?.uid) return;

    setLoading(true);

    // Fix existing user profile if needed
    try {
      const fixResult = await fixExistingUserProfile(user.uid);
      if (fixResult.success) {
        console.log("✅ User profile fixed:", fixResult.userData);
      } else {
        console.warn("⚠️ Could not fix user profile:", fixResult.error);
      }
    } catch (fixError) {
      console.warn("⚠️ Error during user profile fix:", fixError);
    }

    try {
      // Check if user is admin
      const adminStatus = await isAdmin(user.uid);
      setUserIsAdmin(adminStatus);

      // Get user role and business name
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.professionalProfile?.role || userData.role || USER_ROLES.ADMIN;
        setUserRole(role);

        // For team members, fetch business name from admin
        if (role === USER_ROLES.TEAM_MEMBER && userData.professionalProfile?.adminUserId) {
          try {
            const adminRef = doc(db, "users", userData.professionalProfile.adminUserId);
            const adminDoc = await getDoc(adminRef);
            if (adminDoc.exists()) {
              const adminData = adminDoc.data();
              const business = adminData.professionalProfile?.businessName ||
                adminData.businessName ||
                "Business";
              setBusinessName(business);
            }
          } catch (error) {
            console.error("Error fetching business name:", error);
          }
        } else {
          setBusinessName(null);
        }
      }

      // Load dashboard settings
      const settings = await loadDashboardSettings(user.uid);
      setDashboardSettings(settings);
      // Load resumes
      const resumesRef = collection(db, "users", user.uid, "resumes");
      const resumesQuery = query(resumesRef, orderBy("updatedAt", "desc"));
      const resumesSnapshot = await getDocs(resumesQuery);
      const resumesList = resumesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setResumes(resumesList);

      // Check if first-time user
      const isFirstTime = resumesList.length === 0;
      setIsFirstTimeUser(isFirstTime);

      // Calculate statistics
      calculateRealStats(resumesList, []);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateRealStats = (resumesList) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate real statistics
    const thisWeekResumes = resumesList.filter(resume =>
      new Date(resume.createdAt) > oneWeekAgo
    ).length;

    const thisMonthResumes = resumesList.filter(resume =>
      new Date(resume.createdAt) > oneMonthAgo
    ).length;

    // Calculate unique clients from resumes (clients are loaded on-demand elsewhere)
    const uniqueClientIds = [...new Set(resumesList.map(r => r.clientId).filter(Boolean))];
    const totalUniqueClients = uniqueClientIds.length;

    // Calculate completion rate (assume completed if has resumeData)
    const completedResumes = resumesList.filter(r => r.resumeData && Object.keys(r.resumeData).length > 0).length;
    const completionRate = resumesList.length > 0 ? Math.round((completedResumes / resumesList.length) * 100) : 0;

    // Calculate unique templates used
    const uniqueTemplates = [...new Set(resumesList.map(r => r.template).filter(Boolean))].length;

    // Recent activity (resumes created in last 7 days)
    const recentActivity = thisWeekResumes;

    setStats({
      totalResumes: resumesList.length,
      totalClients: totalUniqueClients,
      thisWeekResumes,
      thisMonthResumes,
      completionRate,
      avgTemplatesUsed: uniqueTemplates,
      recentActivity
    });
  };

  const addNewClient = async (clientData) => {
    if (!clientData.name || !user?.uid) {
      toast.error("Client name is required");
      return;
    }

    try {
      // Use team data access helper (stores under admin if user is team member)
      const newClient = await createClient(user.uid, {
        ...clientData,
        userId: user.uid,
        resumeCount: 0,
        totalRevenue: 0,
        lastContact: new Date().toISOString()
      });

      // Log activity for analytics
      await logActivity(user.uid, user.uid, ACTIVITY_TYPES.CLIENT_CREATED, {
        clientId: newClient.id,
        clientName: clientData.name,
        company: clientData.company || "",
      });

      // Update local client list without reloading entire dashboard
      setClients(prev => [...prev, newClient]);
      setShowClientModal(false);
      toast.success("Client added successfully!");
    } catch (error) {
      console.error("Error adding client:", error);

      // Handle quota limit errors
      if (error.isQuotaError) {
        setQuotaInfo({
          quotaType: "clients",
          currentCount: error.quotaInfo?.currentCount || 0,
          limit: error.quotaInfo?.limit || 1,
          remaining: error.quotaInfo?.remaining || 0
        });
        setShowQuotaModal(true);
        return;
      }

      toast.error("Failed to add client");
    }
  };

  const navigateToCreateResume = () => {
    router.push('/enterprise/resume-builder');
  };

  const navigateToUploadResume = () => {
    router.push('/enterprise/upload-resume');
  };

  const navigateToMyResumes = () => {
    router.push('/enterprise/my-resumes');
  };

  const startOnboarding = () => {
    setShowOnboardingFlow(true);
  };

  const CompleteOnboardingFlow = () => {
    setShowOnboardingFlow(false);
    navigateToCreateResume();
  };

  // Loading State
  // Show loading while checking authentication or loading data
  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md w-full mx-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-primary to-primary rounded-full flex items-center justify-center"
          >
            <Crown size={24} className="text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isCheckingAuth ? "Preparing Your Workspace" : "Loading Your Dashboard"}
          </h3>
          <p className="text-gray-600">
            {isCheckingAuth ? "Just a moment..." : "Preparing your professional workspace..."}
          </p>
        </motion.div>
      </div>
    );
  }

  // First-Time User Experience
  if (isFirstTimeUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Professional Dashboard! 🚀
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              You're about to transform your resume writing business. Let's get you started with creating your first professional resume and begin earning!
            </p>

            <div className="inline-flex items-center bg-slate-100 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-8">
              <Sparkles size={16} className="mr-2" />
              Ready to start your journey to success
            </div>
          </motion.div>

          {/* Getting Started Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {dashboardSettings?.showResumeBuilder && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-xl text-center hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Create Your First Resume</h3>
                <p className="text-gray-600 mb-6">Start with our professional resume builder and create stunning resumes that get results.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={navigateToCreateResume}
                  className="bg-gradient-to-r from-primary to-primary text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-900 hover:to-gray-900 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Start Building
                </motion.button>
              </motion.div>
            )}

            {dashboardSettings?.showJDResumeBuilder && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-xl text-center hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target size={32} className="text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">JD Resume Builder</h3>
                <p className="text-gray-600 mb-6">Build resumes perfectly tailored to specific job descriptions for better results.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/enterprise/job-description-resume-builder')}
                  className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-900 hover:to-accent-700 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <Target size={16} />
                  Try JD Builder
                </motion.button>
              </motion.div>
            )}

            {dashboardSettings?.showUploadResume && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-8 shadow-xl text-center hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Upload & Enhance</h3>
                <p className="text-gray-600 mb-6">Have an existing resume? Upload it and enhance it with our AI-powered tools.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={navigateToUploadResume}
                  className="bg-gradient-to-r from-primary to-primary text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-900 hover:to-gray-900 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <Rocket size={16} />
                  Upload Resume
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Success Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="text-yellow-500" size={20} />
              <Star className="text-yellow-500" size={20} />
              <Star className="text-yellow-500" size={20} />
              <Star className="text-yellow-500" size={20} />
              <Star className="text-yellow-500" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Join 10,000+ Successful Resume Writers</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              "I've increased my client base by 300% and my revenue by 500% since switching to ExpertResume Enterprise.
              The professional tools and templates have transformed my business!"
            </p>
            <div className="text-sm text-gray-600">
              - Sarah Johnson, Professional Resume Writer
            </div>
          </motion.div>

          {/* Quick Start Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-white rounded-2xl p-8 shadow-xl"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">💡 Quick Start Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Start Simple</h4>
                  <p className="text-gray-600 text-sm">Begin with one resume to familiarize yourself with our tools</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Use Professional Templates</h4>
                  <p className="text-gray-600 text-sm">Our templates are ATS-optimized and designed by professionals</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Track Client Progress</h4>
                  <p className="text-gray-600 text-sm">Use client management to stay organized and professional</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Scale Gradually</h4>
                  <p className="text-gray-600 text-sm">As you get comfortable, take on more clients and increase rates</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Existing User Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <Crown className="text-yellow-500" size={32} />
              {userRole === USER_ROLES.TEAM_MEMBER && businessName
                ? `${businessName} Workspace`
                : "Professional Dashboard"
              }
            </h1>
            <p className="text-gray-600">
              {userRole === USER_ROLES.TEAM_MEMBER
                ? `Working for ${businessName || 'your team'}`
                : stats.totalResumes === 0
                  ? "Ready to create your first professional resume?"
                  : `Managing ${stats.totalResumes} resumes across ${stats.totalClients} clients`
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowClientModal(true)}
              className="bg-gradient-to-r from-primary to-primary text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-900 hover:to-gray-900 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Add Client
            </motion.button>
          </div>
        </motion.div>

        {/* Dynamic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalResumes}</p>
                <p className="text-sm text-primary mt-1">
                  {stats.thisWeekResumes > 0
                    ? `📈 +${stats.thisWeekResumes} this week`
                    : "🚀 Create your first resume"
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
                <p className="text-sm text-primary mt-1">
                  {stats.totalClients > 0
                    ? "👥 Growing your business"
                    : "🎯 Add your first client"
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <Users size={24} className="text-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completionRate}%</p>
                <p className="text-sm text-primary mt-1">
                  {stats.completionRate >= 80
                    ? "⭐ Excellent quality"
                    : stats.completionRate > 0
                      ? "📊 Keep improving"
                      : "🎯 Start tracking"
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <TrendingUp size={24} className="text-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Templates Used</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgTemplatesUsed}</p>
                <p className="text-sm text-orange-600 mt-1">
                  {stats.avgTemplatesUsed > 5
                    ? "🏆 Great variety"
                    : stats.avgTemplatesUsed > 0
                      ? "🎨 Explore more templates"
                      : "✨ Try professional templates"
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Award size={24} className="text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>


        {/* Professional Tools Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {dashboardSettings?.showUploadResume && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={navigateToUploadResume}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText size={24} className="text-white" />
                </div>
                <div className="text-3xl">📤</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload & Enhance</h3>
              <p className="text-slate-100 text-sm">Upload client resumes and enhance them with AI</p>
              <div className="mt-4 text-sm font-medium flex items-center gap-2">
                Click to start <ArrowRight size={14} />
              </div>
            </motion.div>
          )}

          {dashboardSettings?.showResumeBuilder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={navigateToCreateResume}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Plus size={24} className="text-white" />
                </div>
                <div className="text-3xl">✨</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Resume Builder</h3>
              <p className="text-slate-100 text-sm">Create professional resumes from scratch</p>
              <div className="mt-4 text-sm font-medium flex items-center gap-2">
                Click to start <ArrowRight size={14} />
              </div>
            </motion.div>
          )}

          {dashboardSettings?.showJDResumeBuilder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => router.push('/enterprise/job-description-resume-builder')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Target size={24} className="text-white" />
                </div>
                <div className="text-3xl">🎯</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">JD Resume Builder</h3>
              <p className="text-purple-100 text-sm">Build resumes tailored to job descriptions</p>
              <div className="mt-4 text-sm font-medium flex items-center gap-2">
                Click to start <ArrowRight size={14} />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={navigateToMyResumes}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <div className="text-3xl">📁</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">My Resumes</h3>
            <p className="text-orange-100 text-sm">Manage and organize all client resumes</p>
            <div className="mt-4 text-sm font-medium flex items-center gap-2">
              Click to start <ArrowRight size={14} />
            </div>
          </motion.div>

          {dashboardSettings?.showATSChecker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => router.push('/enterprise/ats-checker')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <div className="text-3xl">🎯</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">ATS Checker</h3>
              <p className="text-slate-100 text-sm">Analyze resume compatibility with ATS systems</p>
              <div className="mt-4 text-sm font-medium flex items-center gap-2">
                Click to start <ArrowRight size={14} />
              </div>
            </motion.div>
          )}
        </div>

        {/* New Business Management Tools Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {dashboardSettings?.showClientManagement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => router.push('/enterprise/clients')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div className="text-3xl">👥</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Client Management</h3>
              <p className="text-slate-100 text-sm">Organize clients, track projects, and manage relationships</p>
              <div className="mt-4 text-sm font-medium flex items-center gap-2">
                Manage {stats.totalClients} clients <ArrowRight size={14} />
              </div>
            </motion.div>
          )}

          {dashboardSettings?.showBusinessAccounting && userIsAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => router.push('/enterprise/accounting')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign size={24} className="text-white" />
                </div>
                <div className="text-3xl">💰</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Business Accounting</h3>
              <p className="text-emerald-100 text-sm">Track revenue, expenses, and business performance</p>
              <div className="mt-4 text-sm font-medium flex items-center gap-2">
                View financial insights <ArrowRight size={14} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Content Based on Data */}
        {stats.totalResumes === 0 ? (
          // No Resumes - Encourage First Resume
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-50 to-slate-50 rounded-2xl p-8 border border-slate-200 text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Create Your First Resume? 🚀</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              You're just one click away from starting your professional resume writing journey.
              Create stunning, ATS-optimized resumes that help your clients land their dream jobs!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={navigateToCreateResume}
                className="bg-gradient-to-r from-primary to-primary text-white px-8 py-4 rounded-xl font-semibold hover:from-gray-900 hover:to-gray-900 transition-all duration-200 inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create First Resume
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/enterprise/job-description-resume-builder')}
                className="bg-white border-2 border-teal-300 text-teal-700 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 inline-flex items-center gap-2"
              >
                <Target size={20} />
                JD Resume Builder
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={navigateToUploadResume}
                className="bg-white border-2 border-teal-300 text-primary px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 inline-flex items-center gap-2"
              >
                <FileText size={20} />
                Upload & Enhance
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // Has Resumes - Show Recent Activity & Quick Actions
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {dashboardSettings?.showRecentActivity && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="text-teal-500" size={20} />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {resumes.slice(0, 3).map((resume, index) => (
                    <div key={resume.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {resume.resumeName || resume.resumeData?.personal?.name || ' Resume'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/enterprise/resume-builder?resumeId=${resume.id}&template=${resume.template}`)}
                        className="bg-slate-100 text-primary px-3 py-1 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        Edit
                      </motion.button>
                    </div>
                  ))}
                  {resumes.length > 3 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={navigateToMyResumes}
                      className="w-full text-center text-primary hover:text-gray-900 font-medium py-2 text-sm"
                    >
                      View All {resumes.length} Resumes →
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {dashboardSettings?.showQuickActions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="text-teal-500" size={20} />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={navigateToCreateResume}
                    className="w-full text-left px-4 py-3 bg-slate-50 text-primary rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3"
                  >
                    <Plus size={18} />
                    <span className="font-medium">Create New Resume</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/enterprise/job-description-resume-builder')}
                    className="w-full text-left px-4 py-3 bg-slate-50 text-primary rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3"
                  >
                    <Target size={18} />
                    <span className="font-medium">JD Resume Builder</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowClientModal(true)}
                    className="w-full text-left px-4 py-3 bg-slate-50 text-primary rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3"
                  >
                    <Users size={18} />
                    <span className="font-medium">Add New Client</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/enterprise/templates')}
                    className="w-full text-left px-4 py-3 bg-slate-50 text-primary rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3"
                  >
                    <Award size={18} />
                    <span className="font-medium">Browse Templates</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={navigateToMyResumes}
                    className="w-full text-left px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-3"
                  >
                    <FileText size={18} />
                    <span className="font-medium">Manage All Resumes</span>
                  </motion.button>

                  {dashboardSettings?.showClientManagement && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/enterprise/clients')}
                      className="w-full text-left px-4 py-3 bg-slate-50 text-primary rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3"
                    >
                      <Users size={18} />
                      <span className="font-medium">Client Management</span>
                    </motion.button>
                  )}

                  {dashboardSettings?.showBusinessAccounting && userIsAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/enterprise/accounting')}
                      className="w-full text-left px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-3"
                    >
                      <DollarSign size={18} />
                      <span className="font-medium">Business Accounting</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Performance Insights */}
        {stats.totalResumes > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-50 to-slate-50 rounded-2xl p-8 border border-slate-200 mb-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="text-teal-500" size={28} />
                Your Professional Growth 📈
              </h3>
              <p className="text-gray-600">Keep track of your progress and achievements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.totalResumes}</div>
                <div className="text-gray-700 font-medium">Professional Resumes Created</div>
                <div className="text-sm text-gray-500">Helping clients succeed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.completionRate}%</div>
                <div className="text-gray-700 font-medium">Quality Score</div>
                <div className="text-sm text-gray-500">Completion rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.thisWeekResumes}</div>
                <div className="text-gray-700 font-medium">This Week</div>
                <div className="text-sm text-gray-500">New resumes created</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Professional Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={24} />
            Professional Tips & Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-teal-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Use ATS-Optimized Templates</h4>
                <p className="text-gray-600 text-sm">Our templates are designed to pass Applicant Tracking Systems</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-teal-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Track Client Progress</h4>
                <p className="text-gray-600 text-sm">Maintain detailed records for better client relationships</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-teal-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Regular Quality Reviews</h4>
                <p className="text-gray-600 text-sm">Review and update resumes to maintain high standards</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Client Modal */}
      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSubmit={addNewClient}
      />

      {/* Quota Limit Modal */}
      <QuotaLimitModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        quotaInfo={quotaInfo}
        onUpgrade={() => {
          setShowQuotaModal(false);
          router.push('/enterprise/checkout');
        }}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
    </div>
  );
}
