"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import { db } from "../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import {
  FileText, Briefcase, Bookmark, ArrowRight, Plus, Crown,
  CheckCircle, Clock, Sparkles, Target, TrendingUp, Lock,
  Calendar, Palette, Trophy, Edit, Search, BarChart3, Brain, Mic, Bot, Lightbulb, MessageSquare
} from "lucide-react";
import Link from "next/link";
import AuthProtection from "../components/AuthProtection";
import DashboardSkeleton from "../components/skeletons/DashboardSkeleton";
import FeaturePromoBanner from "../components/FeaturePromoBanner";

import FlashSaleBanner from "../components/FlashSaleBanner";
import QuarterlyUpgradeBanner from "../components/QuarterlyUpgradeBanner";

export default function Dashboard() {
  return (
    <AuthProtection>
      <DashboardContent />
    </AuthProtection>
  );
}

function DashboardContent() {
  const { user, isPremium, isBasicPlan, isQuarterlyPlan, isSixMonthPlan } = useAuth();
  const { currency } = useLocation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resumeCount, setResumeCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);
  const [recentResumes, setRecentResumes] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch resumes
      const resumesRef = collection(db, "users", user.uid, "resumes");
      const resumesSnapshot = await getDocs(resumesRef);
      const resumesList = resumesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setResumeCount(resumesList.length);

      // Get 3 most recent resumes
      const sortedResumes = resumesList
        .sort((a, b) => {
          const aTime = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
          const bTime = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
          return bTime - aTime;
        })
        .slice(0, 3);
      setRecentResumes(sortedResumes);

      // Fetch job applications
      const jobApplicationsRef = collection(db, `users/${user.uid}/jobApplications`);
      const jobsSnapshot = await getDocs(jobApplicationsRef);

      let saved = 0;
      let applied = 0;

      jobsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'saved') saved++;
        if (data.status === 'applied' || data.status === 'interview' || data.status === 'offer') applied++;
      });

      setSavedJobsCount(saved);
      setAppliedJobsCount(applied);

      // Fetch user subscription
      const userDoc = await getDoc(doc(db, "users", user.uid));
      setUserSubscription(userDoc.data() || null);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getResumeDisplayName = (resume) => {
    if (resume.resumeName?.trim()) return resume.resumeName.trim();
    if (resume.title?.trim()) return resume.title.trim();
    const name = resume.name || resume.resumeData?.personal?.name || resume.resumeData?.personalInfo?.name;
    if (name?.trim()) return name.trim();
    return "Untitled Resume";
  };
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-slate-100/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Quarterly Upgrade Banner - Show to all non-premium users (free + basic plan) */}
        {!isPremium && <QuarterlyUpgradeBanner className="mb-6" currency={currency} />}

        {/* Dashboard Header */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  Career Workspace
                </h1>
                <p className="text-sm sm:text-base text-gray-700 mt-1">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return 'Good morning';
                    if (hour < 17) return 'Good afternoon';
                    return 'Good evening';
                  })()}, {user?.displayName?.split(' ')[0] || 'there'}.
                </p>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Manage resumes, track applications, and monitor progress.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 mt-2 sm:mt-0">
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center min-w-[100px] sm:min-w-[120px]">
                  <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isPremium ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-teal-500 shadow-[0_0_8px_rgba(0,196,179,0.5)]'}`}></div>
                    <span className="text-sm sm:text-base font-bold text-gray-800">
                      {isPremium ? (isQuarterlyPlan ? 'Expert Pro' : isSixMonthPlan ? 'Ultimate Pro' : 'Monthly Pro') : 'Free Member'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>




        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6 md:mb-8">
          {/* Total Resumes Card */}
          <Link href="/my-resumes" className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden block">
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-slate-50 rounded-xl">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1F3B]" />
                </div>
                <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">{resumeCount}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">Total Resumes</p>
            </div>
          </Link>

          {/* Jobs Applied Card */}
          <Link href="/my-jobs" className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden block">
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">{appliedJobsCount}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">Jobs Applied</p>
            </div>
          </Link>

          {/* Saved Jobs Card */}
          <Link href="/my-jobs" className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden block">
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-slate-50 rounded-xl">
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                </div>
                <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">{savedJobsCount}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">Saved Jobs</p>
            </div>
          </Link>

          {/* Current Plan Card */}
          <Link href="/account" className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden block">
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-amber-50 rounded-xl">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                  {isPremium ? 'Pro' : 'Free'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">Current Plan</p>
            </div>
          </Link>
        </div>

        {/* Feature Promotional Banner - Only for Non-Premium Users */}
        {!isPremium && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <FeaturePromoBanner />
          </div>
        )}

        {/* Workspace Shortcuts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Workspace Shortcuts</h3>
            {!isPremium && (
              <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" />
                <span className="hidden sm:inline">Premium features</span>
                <span className="sm:hidden">Premium</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { href: "/resume-builder", icon: FileText, label: "Resume Builder", color: "blue" },
              { href: "/ai-interview", icon: Brain, label: "Interview Simulation", color: "purple", new: true },
              { href: "/upload-resume", icon: Plus, label: "Upload Resume", color: "blue" },
              { href: "/ats-score-checker", icon: Target, label: "ATS Checker", color: "blue" },
              { href: "/job-description-resume-builder", icon: Briefcase, label: "JD Builder", color: "blue", premium: true },
              { href: "/jobs-nearby", icon: Search, label: "Jobs Nearby", color: "green" },
              { href: "/my-jobs", icon: Bookmark, label: "My Jobs", color: "green" },
              { href: "/templates", icon: Palette, label: "Templates", color: "purple" },
              { href: "/one-pager-builder", icon: FileText, label: "One-Pager", color: "purple" },
              { href: isPremium ? "/career-coach" : "/pricing", icon: Sparkles, label: "Career Coach", color: "purple", premium: true },
              { href: isPremium ? "/salary-analyzer" : "/pricing", icon: TrendingUp, label: "Salary Analyzer", color: "green", premium: true },
              { href: isPremium ? "/expertresume-chat" : "/pricing", icon: Sparkles, label: "ExpertResume GPT", color: "blue", premium: true, new: isPremium },
              { href: "/cover-letter-builder", icon: FileText, label: "Cover Letter", color: "indigo" },
              { href: "/feature-requests", icon: Lightbulb, label: "Feature Requests", color: "yellow", new: true },
              { href: "/share-feedback", icon: MessageSquare, label: "Share Feedback", color: "blue" },
            ].map((item, index) => {
              const Icon = item.icon;
              const iconClasses = {
                blue: "text-[#0B1F3B]",
                purple: "text-teal-600",
                green: "text-green-600",
                indigo: "text-teal-600",
                yellow: "text-yellow-600",
              };

              return (
                <Link
                  key={index}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                >
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-center group relative bg-white">
                    {(item.premium && !isPremium) && (
                      <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-amber-50 border border-amber-200 rounded-full p-0.5 sm:p-1 shadow-sm">
                        <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
                      </div>
                    )}
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-200 ${iconClasses[item.color]}`} />
                    <span className="text-xs sm:text-sm font-medium text-gray-900">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* My Resumes Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">My Resumes</h2>
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Create, edit, and manage your professional resumes
              </p>
            </div>

            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              {resumeCount > 0 ? (
                <>
                  <div className="space-y-2 sm:space-y-3 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Recent Resumes:</p>
                    {recentResumes.map((resume) => (
                      <div key={resume.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                          {getResumeDisplayName(resume)[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {getResumeDisplayName(resume)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            Updated {new Date(resume.updatedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 sm:gap-3 mt-4">
                    <Link href="/my-resumes" className="flex-1">
                      <button className="w-full bg-[#0B1F3B] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#071429] transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm">
                        View All
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </Link>
                    <Link href="/resume-builder">
                      <button className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 sm:py-6 flex-1 flex flex-col justify-center">
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">No resumes yet</p>
                  </div>
                  <Link href="/resume-builder">
                    <button className="bg-[#0B1F3B] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#071429] transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Create First Resume
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Jobs Nearby Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Jobs Nearby</h2>
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Find AI-matched job opportunities near you
              </p>
            </div>

            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <div className="space-y-3 sm:space-y-4 flex-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#0B1F3B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">Smart Matching</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">AI analyzes your resume</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">Top 20 Jobs</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Curated for your profile</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">Track Applications</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Never miss a follow-up</p>
                  </div>
                </div>
              </div>

              <Link href="/jobs-nearby" className="mt-4">
                <button className="w-full bg-[#0B1F3B] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#071429] transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm">
                  Find Jobs Now
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* My Jobs / Tracker Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">My Jobs</h2>
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Track your applications and saved opportunities
              </p>
            </div>

            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              {(savedJobsCount > 0 || appliedJobsCount > 0) ? (
                <>
                  <div className="space-y-3 sm:space-y-4 flex-1">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">Applied</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Active applications</p>
                        </div>
                      </div>
                      <span className="text-xl sm:text-2xl font-bold text-green-600">{appliedJobsCount}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-500 rounded-full flex items-center justify-center">
                          <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">Saved</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">For later review</p>
                        </div>
                      </div>
                      <span className="text-xl sm:text-2xl font-bold text-[#0B1F3B]">{savedJobsCount}</span>
                    </div>
                  </div>

                  <Link href="/my-jobs" className="mt-4">
                    <button className="w-full bg-[#0B1F3B] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#071429] transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm">
                      View All Jobs
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-4 sm:py-6 flex-1 flex flex-col justify-center">
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-2 font-medium">No tracked jobs yet</p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      Start finding and saving jobs to track your applications
                    </p>
                  </div>
                  <Link href="/my-jobs">
                    <button className="bg-[#0B1F3B] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#071429] transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm">
                      Track Jobs
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Interview Simulation Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-slate-100/50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Interview Simulation</h2>
                <div className="p-2 bg-slate-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Brain className="w-4 h-4 text-teal-600" />
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Master your interviews with AI-powered mock sessions and feedback
              </p>
            </div>

            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <div className="space-y-3 sm:space-y-4 flex-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">Mock Interviews</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Practice with industry-specific questions</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">AI Feedback</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Real-time analysis of your answers</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#0B1F3B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">Readiness Report</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Detailed score and action plan</p>
                  </div>
                </div>
              </div>

              <Link href="/ai-interview" className="mt-4">
                <button className="w-full bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold hover:from-[#071429] hover:to-[#008C81] transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm group-hover:shadow-md">
                  Practice Now
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>


      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-white text-gray-900 border border-gray-200 shadow-lg',
        }}
      />
    </div>
  );
}