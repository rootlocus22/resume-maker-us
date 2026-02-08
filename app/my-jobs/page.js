"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import {
  Bookmark, CheckCircle, Calendar, MapPin, Building2, DollarSign,
  Clock, Crown, CheckCircle2, ExternalLink, Trash2, Edit3, X, ArrowRight, Briefcase,
  Target, Award, TrendingUp, MessageSquare, Phone, Mail, Plus,
  Zap, Rocket, Lock, FileText, ChevronRight, User, Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AuthProtection from "../components/AuthProtection";
import { calculateFitScore, shouldFollowUp, generateDailyTasks, fetchAiFitScore } from "../lib/intelligenceHelpers";


export default function MyJobs() {
  return (
    <AuthProtection>
      <MyJobsContent />
    </AuthProtection>
  );

}

// Daily Goal Component
function DailyGoalTracker({ jobs }) {
  const DAILY_GOAL = 5;
  const today = new Date().toISOString().split('T')[0];

  // Count jobs applied TODAY
  const appliedToday = jobs.filter(j =>
    (j.status === 'applied' && j.appliedAt && j.appliedAt.startsWith(today))
  ).length;

  const progress = Math.min(100, (appliedToday / DAILY_GOAL) * 100);

  return (
    <div className="bg-gradient-to-r from-[#0B1F3B] to-[#132D54] rounded-xl p-4 sm:p-6 mb-6 text-white shadow-xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 transform pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold flex items-center justify-center sm:justify-start gap-2">
            <Target className="w-5 h-5 text-yellow-400" />
            Daily Apply Goal
          </h3>
            <p className="text-slate-300 text-sm mt-1">Apply to 5 jobs to boost your chances by 3x</p>
        </div>

        <div className="flex-1 w-full max-w-md">
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span>{appliedToday} / {DAILY_GOAL} Applied</span>
            <span>{appliedToday >= DAILY_GOAL ? 'Goal Reached! 🎉' : 'Keep going!'}</span>
          </div>
            <div className="h-4 bg-[#071429]/50 rounded-full overflow-hidden border border-[#0B1F3B]/30">
            <div
              className={`h-full transition-all duration-1000 ease-out ${appliedToday >= DAILY_GOAL ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-[#00C4B3] to-[#00A89A]'}`}
              style={{ width: `${progress}%` }}
            >
              {progress > 0 && <div className="w-full h-full animate-shimmer bg-white/20"></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Intelligence Layer: Funnel Analytics Component
function FunnelAnalytics({ applied, interviews, offers, isPremium, userData }) {
  const interviewRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;
  const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#0B1F3B]" />
          Job Search Funnel Insights
        </h3>
        {!isPremium && (
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wider">
            Basic Analysis
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Conversion 1 */}
          <div className="relative">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Apply → Interview</span>
              <span className={`text-lg font-bold ${interviewRate >= 15 ? 'text-green-600' : 'text-[#0B1F3B]'}`}>
                {interviewRate}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${interviewRate >= 15 ? 'bg-green-500' : 'bg-[#00C4B3]'}`}
                style={{ width: `${Math.min(100, interviewRate * 2.5)}%` }} // Scaled for visibility
              ></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
              {interviewRate < 15
                ? "💡 Target 15-20% to reach top candidate status."
                : "🚀 Outstanding! You're beating the industry average."}
            </p>
          </div>

          {/* Conversion 2 */}
          <div className="relative">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Interview → Offer</span>
              <span className={`text-lg font-bold ${offerRate >= 20 ? 'text-green-600' : 'text-[#0B1F3B]'}`}>
                {offerRate}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${offerRate >= 20 ? 'bg-green-500' : 'bg-[#00C4B3]'}`}
                style={{ width: `${Math.min(100, offerRate * 1.5)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
              {offerRate < 20
                ? "💡 Improve prep kit access to boost offer rates."
                : "🏆 Professional closer! Your interview skills are elite."}
            </p>
          </div>
        </div>

        {!isPremium && !userData?.hasApplyPro && (
          <div className="mt-5 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] text-gray-600 italic">"Why are my rates low?" — Unlock AI Analysis</span>
            </div>
            <Link href="/checkout?billingCycle=quarterly&step=1" className="text-[11px] font-bold text-[#0B1F3B] hover:underline">
              Upgrade to Pro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StreakTracker({ jobs, user, isApplyPro }) {
  const [streak, setStreak] = useState(0);
  const today = new Date().toISOString().split('T')[0];

  const appliedToday = jobs.filter(j =>
    (j.status === 'applied' && j.appliedAt && j.appliedAt.startsWith(today))
  ).length;

  useEffect(() => {
    if (!user?.uid || appliedToday === 0) return;

    const key = `apply_streak_${user.uid}`;
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { lastDate: null, streak: 0 };

    if (data.lastDate === today) {
      setStreak(data.streak || 1);
      return;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const nextStreak = data.lastDate === yesterday ? (data.streak || 0) + 1 : 1;

    const updated = { lastDate: today, streak: nextStreak };
    localStorage.setItem(key, JSON.stringify(updated));
    setStreak(nextStreak);
  }, [user, appliedToday, today]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-lg">
          <Zap className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Consistency Streak</p>
          <h3 className="text-lg font-extrabold text-gray-900">{streak} day streak</h3>
          <p className="text-[11px] text-gray-500">Apply at least once daily to keep it alive.</p>
        </div>
      </div>
      {!isApplyPro && (
        <Link href="/checkout?billingCycle=quarterly&step=1" className="text-xs font-bold text-[#0B1F3B] hover:underline">
          Unlock streak protection
        </Link>
      )}
    </div>
  );
}

// Intelligence Layer: Today's Focus Section
function DailyFocus({ jobs, onAction }) {
  const tasks = generateDailyTasks(jobs);

  if (tasks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <h2 className="text-lg font-bold text-gray-900">Today's Intelligence Focus</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-xl border-l-4 shadow-sm bg-white hover:shadow-md transition-all ${task.priority === 'high' ? 'border-red-500' :
              task.priority === 'medium' ? 'border-blue-500' : 'border-gray-300'
              }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${task.priority === 'high' ? 'text-red-600' :
                task.priority === 'medium' ? 'text-[#0B1F3B]' : 'text-gray-500'
                }`}>
                {task.priority} Priority
              </span>
              {task.type === 'follow-up' && <Clock className="w-3 h-3 text-red-400" />}
              {task.type === 'apply' && <Rocket className="w-3 h-3 text-[#00C4B3]" />}
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{task.text}</h4>
            <p className="text-[11px] text-gray-500 mb-3">{task.subtext}</p>
            <button
              onClick={() => onAction(task)}
              className="text-xs font-bold text-[#0B1F3B] flex items-center gap-1 hover:gap-2 transition-all"
            >
              Start Task <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplyProMissions({ isApplyPro }) {
  const missions = [
    {
      title: "Auto‑follow up on saved jobs",
      description: "Send 2 follow‑ups automatically today.",
      icon: <Mail className="w-4 h-4 text-[#0B1F3B]" />
    },
    {
      title: "AI Fit refresh for top roles",
      description: "Re‑score 3 saved jobs against your latest resume.",
      icon: <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
    },
    {
      title: "Interview prep sprint",
      description: "Practice 5 tailored Qs for your next interview.",
      icon: <Target className="w-4 h-4 text-[#0B1F3B]" />
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          <h3 className="text-base font-bold text-gray-900">Apply Pro Daily Missions</h3>
        </div>
        {!isApplyPro && (
          <Link href="/checkout?billingCycle=quarterly&step=1" className="text-xs font-bold text-[#0B1F3B] hover:underline">
            Unlock Apply Pro
          </Link>
        )}
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${!isApplyPro ? "opacity-70" : ""}`}>
        {missions.map((mission, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden"
          >
            {!isApplyPro && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                  <Lock className="w-3 h-3" />
                  Pro Only
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-gray-50 rounded-lg">{mission.icon}</div>
              <span className="text-xs font-bold text-gray-900">{mission.title}</span>
            </div>
            <p className="text-[11px] text-gray-600">{mission.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyJobsContent() {
  const { user, userData, isPremium, isQuarterlyPlan, isSixMonthPlan } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzingJobId, setAnalyzingJobId] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [allResumes, setAllResumes] = useState([]);
  const [showResumeSelector, setShowResumeSelector] = useState(false);
  const [pendingJobForAi, setPendingJobForAi] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [interviewJobs, setInterviewJobs] = useState([]);
  const [offerJobs, setOfferJobs] = useState([]);
  const [rejectedJobs, setRejectedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const hasJobsAddon = userData?.hasJobTrackerFeature === true || userData?.hasJobsFeature === true;
  const isApplyPro = userData?.job_search_plan === 'apply_pro' || userData?.hasApplyPro || isQuarterlyPlan || isSixMonthPlan;

  useEffect(() => {
    if (user) {
      loadAllJobs();
    }
  }, [user]);

  const fetchAndSortJobs = async () => {
    if (!user) return null;

    const jobApplicationsRef = collection(db, `users/${user.uid}/jobApplications`);
    const jobsSnapshot = await getDocs(jobApplicationsRef);

    const saved = [];
    const applied = [];
    const interview = [];
    const offer = [];
    const rejected = [];

    jobsSnapshot.forEach(docSnap => {
      const data = { ...docSnap.data(), id: docSnap.id };

      switch (data.status) {
        case 'saved':
          saved.push(data);
          break;
        case 'applied':
          applied.push(data);
          break;
        case 'interview':
          interview.push(data);
          break;
        case 'offer':
          offer.push(data);
          break;
        case 'rejected':
          rejected.push(data);
          break;
        default:
          if (data.status === 'not-applied') {
            // Ignore not-applied for now
          }
      }
    });

    // Sort by date (most recent first)
    const sortByDate = (a, b) => {
      const aTime = new Date(a.updatedAt || a.savedAt || a.appliedAt).getTime();
      const bTime = new Date(b.updatedAt || b.savedAt || b.appliedAt).getTime();
      return bTime - aTime;
    };

    return {
      saved: saved.sort(sortByDate),
      applied: applied.sort(sortByDate),
      interview: interview.sort(sortByDate),
      offer: offer.sort(sortByDate),
      rejected: rejected.sort(sortByDate)
    };
  };

  const loadAllJobs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const jobs = await fetchAndSortJobs();
      if (jobs) {
        setSavedJobs(jobs.saved);
        setAppliedJobs(jobs.applied);
        setInterviewJobs(jobs.interview);
        setOfferJobs(jobs.offer);
        setRejectedJobs(jobs.rejected);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchResumeData = async () => {
    if (!user) return;
    try {
      const resumesRef = collection(db, `users/${user.uid}/resumes`);
      const resumesSnapshot = await getDocs(resumesRef);
      if (!resumesSnapshot.empty) {
        // Get all resumes sorted by date
        const resumeList = resumesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

        setAllResumes(resumeList);
        setResumeData(resumeList[0]);
      }
    } catch (error) {
      console.error("Error fetching resume data:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchResumeData();
    }
  }, [user]);

  const handleRunAiAnalysis = async (job, forceResume = null) => {
    const targetResume = forceResume || resumeData;

    if (!targetResume) {
      if (allResumes.length > 1 && !forceResume) {
        setPendingJobForAi(job);
        setShowResumeSelector(true);
        return;
      }

      if (allResumes.length === 0) {
        toast.error("Please create a resume first to run AI analysis.");
        return;
      }
    }

    const resumeToUse = forceResume || targetResume || allResumes[0];

    try {
      // SECURITY CHECK: Ensure user has entitlement before running analysis
      // This prevents console/client-side bypass of the UI button
      const hasAIJobSearch = isQuarterlyPlan || isSixMonthPlan || userData?.hasJobTrackerFeature === true || userData?.hasJobsFeature === true;
      if (!hasAIJobSearch) {
        toast((t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold flex items-center gap-1.5">
              <Crown size={14} className="text-yellow-500 fill-yellow-500" />
              Upgrade Required from Server
            </span>
            <span className="text-xs">AI Job Matching is exclusive to Expert & Ultimate plans.</span>
            <button
              onClick={() => { toast.dismiss(t.id); router.push('/checkout?billingCycle=quarterly&step=1'); }}
              className="bg-[#0B1F3B] text-white px-3 py-1 mt-1 rounded text-xs font-bold w-fit"
            >
              Upgrade Now
            </button>
          </div>
        ), { duration: 5000 });
        return;
      }

      setAnalyzingJobId(job.id);
      setShowResumeSelector(false);
      toast.loading("Gemini is analyzing your fit...", { id: 'ai-analysis' });

      const aiResult = await fetchAiFitScore(job, resumeToUse);

      if (aiResult) {
        // Save to Firestore using setDoc with merge for robustness
        const jobRef = doc(db, `users/${user.uid}/jobApplications`, job.id);
        await setDoc(jobRef, {
          ...aiResult,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        toast.success("AI analysis complete!", { id: 'ai-analysis' });
        refreshJobs(); // Refresh to show new scores
      } else {
        toast.error("AI analysis failed. Please try again.", { id: 'ai-analysis' });
      }
    } catch (error) {
      console.error("Error running AI analysis:", error);
      toast.error("An error occurred during analysis.", { id: 'ai-analysis' });
    } finally {
      setAnalyzingJobId(null);
    }
  };

  const refreshJobs = async () => {
    if (!user) return;

    try {
      const jobs = await fetchAndSortJobs();
      if (jobs) {
        setSavedJobs(jobs.saved);
        setAppliedJobs(jobs.applied);
        setInterviewJobs(jobs.interview);
        setOfferJobs(jobs.offer);
        setRejectedJobs(jobs.rejected);
      }
    } catch (error) {
      console.error("Error refreshing jobs:", error);
      toast.error("Failed to refresh jobs");
    }
  };

  const confirmDeleteJob = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleDeleteJob = async () => {
    if (!user || !jobToDelete) return;

    const jobIdToDelete = jobToDelete.id;

    // Optimistic UI update - remove card immediately
    setSavedJobs(prev => prev.filter(job => job.id !== jobIdToDelete));
    setAppliedJobs(prev => prev.filter(job => job.id !== jobIdToDelete));
    setInterviewJobs(prev => prev.filter(job => job.id !== jobIdToDelete));
    setOfferJobs(prev => prev.filter(job => job.id !== jobIdToDelete));
    setRejectedJobs(prev => prev.filter(job => job.id !== jobIdToDelete));

    // Close modal immediately
    setShowDeleteModal(false);
    setJobToDelete(null);

    // Show success toast
    toast.success("Job removed from tracker");

    try {
      // Delete from database in background
      const jobRef = doc(db, `users/${user.uid}/jobApplications`, jobIdToDelete);
      await deleteDoc(jobRef);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to remove job from database. Refreshing...");
      // If database delete fails, refresh to show accurate state
      await refreshJobs();
    }
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setEditStatus(job.status);
    setEditNotes(job.notes || "");
    setShowEditModal(true);
  };

  const handleUpdateJob = async () => {
    if (!selectedJob || !user) return;

    try {
      const jobRef = doc(db, `users/${user.uid}/jobApplications`, selectedJob.id);
      await setDoc(jobRef, {
        status: editStatus,
        notes: editNotes,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast.success("Job status updated!");
      setShowEditModal(false);
      setSelectedJob(null);
      await refreshJobs();
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job");
    }
  };

  const openJobLink = (job) => {
    if (job.link) {
      const url = job.link.startsWith('http') ? job.link : `https://${job.link}`;
      window.open(url, '_blank');
    }
  };

  const handleTaskAction = (task) => {
    if (task.type === 'search') {
      router.push('/jobs-nearby');
    } else if (task.jobId) {
      // Find and highlight/scroll to the job? 
      // For now, simple toast
      toast.success("Ready to follow up? Use the tracking cards below.");
    } else if (task.type === 'apply') {
      // Scroll to saved section
      document.getElementById('section-saved')?.scrollIntoView({ behavior: 'smooth' });
    } else if (task.type === 'ai') {
      const topJob = [...savedJobs, ...appliedJobs].find(j => !j.aiScore);
      if (topJob) handleRunAiAnalysis(topJob);
      else toast.success("All your jobs are already analyzed! Great work.");
    }
  };

  const JobCard = ({ job, statusColor, statusIcon: StatusIcon, statusLabel }) => {
    const isFollowUpDue = shouldFollowUp(job);

    return (
      <div className={`bg-white rounded-xl p-4 sm:p-5 border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ${isFollowUpDue ? 'border-red-200 bg-red-50/10' : 'border-gray-200'
        }`}>
        {isFollowUpDue && (
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
            <Clock size={10} /> FOLLOW-UP DUE
          </div>
        )}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className={`p-1 sm:p-1.5 ${statusColor} rounded-lg`}>
                <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full ${statusColor.replace('bg-', 'bg-').replace('-600', '-100')} ${statusColor.replace('bg-', 'text-')}`}>
                {statusLabel}
              </span>

              {/* Fit Score Badge */}
              {job.aiScore ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 shadow-sm animate-pulse-slow">
                  <Zap size={10} className="text-green-600 fill-green-600" />
                  <span className="text-[10px] font-bold">{job.aiScore}% Match</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                  <Sparkles size={10} className="text-[#00C4B3]" />
                  <span className="text-[10px] font-bold">Pending Match</span>
                </div>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-sm sm:text-base text-gray-700 font-medium mb-2">{job.company}</p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-3">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
              )}
              {job.type && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {job.type}
                </span>
              )}
              {job.salary && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {job.salary}
                </span>
              )}
            </div>

            {job.notes && (
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3">
                <p className="text-xs sm:text-sm text-gray-700">{job.notes}</p>
              </div>
            )}

            {job.aiReasoning && (
              <div className="bg-green-50/50 rounded-lg p-3 mb-3 border border-green-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap size={12} className="text-green-600" />
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">AI Analysis</span>
                </div>
                <p className="text-xs text-green-800 leading-relaxed italic line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                  "{job.aiReasoning}"
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
              {job.appliedAt && (
                <span>Applied: {new Date(job.appliedAt).toLocaleDateString()}</span>
              )}
              {job.savedAt && !job.appliedAt && (
                <span>Saved: {new Date(job.savedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {job.link && (
            <button
              onClick={() => openJobLink(job)}
              className="flex-1 bg-[#0B1F3B] text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-[#132D54] transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              View Job
            </button>
          )}

          <div className="flex gap-2">
            {!job.aiScore && (
              <button
                onClick={() => {
                  // Only allow if user has specific job search entitlement
                  const hasAIJobSearch = isQuarterlyPlan || isSixMonthPlan || userData?.hasJobTrackerFeature === true || userData?.hasJobsFeature === true;

                  if (!hasAIJobSearch) {
                    toast((t) => (
                      <div className="flex flex-col gap-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <Crown size={14} className="text-yellow-500 fill-yellow-500" />
                          Premium AI Feature
                        </span>
                        <span className="text-xs">
                          {isPremium
                            ? "This AI tool is exclusive to Expert & Ultimate plans."
                            : "Upgrade to Expert to unlock AI Job Matching!"}
                        </span>
                        <button
                          onClick={() => { toast.dismiss(t.id); router.push('/checkout?billingCycle=quarterly&step=1'); }}
                          className="bg-[#0B1F3B] text-white px-3 py-1 mt-1 rounded text-xs font-bold w-fit"
                        >
                          Upgrade to Expert
                        </button>
                      </div>
                    ), { duration: 5000 });
                    return;
                  }
                  handleRunAiAnalysis(job);
                }}
                disabled={analyzingJobId === job.id}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 text-[#0B1F3B] rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-xs ${analyzingJobId === job.id
                  ? 'bg-[#0B1F3B]/5 border-[#0B1F3B]/20 cursor-not-allowed opacity-70'
                  : 'border-[#0B1F3B]/20 hover:bg-[#0B1F3B]/5'
                  }`}
              >
                {analyzingJobId === job.id ? (
                  <div className="w-3 h-3 border-2 border-[#0B1F3B] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  // Show lock if NOT quarterly/sixMonth/addon
                  !(isQuarterlyPlan || isSixMonthPlan || userData?.hasJobTrackerFeature === true || userData?.hasJobsFeature === true)
                    ? <Lock size={14} className="text-amber-500" />
                    : <Zap size={14} className="fill-[#00C4B3]/20" />
                )}
                AI Match
              </button>
            )}

            {isFollowUpDue ? (
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`Following up on my application for ${job.title}`);
                  const body = encodeURIComponent(`Hi there,\n\nI'm following up on my application for the ${job.title} position at ${job.company}. I'm still very interested in the role and would love to hear an update.\n\nBest regards,\n${user.displayName || 'Applicant'}`);
                  window.open(`mailto:?subject=${subject}&body=${body}`);
                }}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 text-xs"
              >
                <Mail size={14} />
                Follow Up
              </button>
            ) : (
              <button
                onClick={() => handleEditJob(job)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="sm:hidden text-xs">Edit</span>
              </button>
            )}

            <button
              onClick={() => confirmDeleteJob(job)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="sm:hidden text-xs">Remove</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#00C4B3]/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0B1F3B] border-t-transparent"></div>
      </div>
    );
  }

  const totalJobs = savedJobs.length + appliedJobs.length + interviewJobs.length + offerJobs.length + rejectedJobs.length;
  const todayKey = new Date().toISOString().split('T')[0];
  const appliedTodayCount = appliedJobs.filter(j =>
    (j.status === 'applied' && j.appliedAt && j.appliedAt.startsWith(todayKey))
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#00C4B3]/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0B1F3B] bg-[#0B1F3B]/5 w-fit px-2.5 py-1 rounded-full mb-2">
                <Sparkles className="w-3 h-3" />
                Job Search Command Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Job Search Intelligence <span className="text-[#00C4B3]">OS</span></h1>
              <p className="text-sm sm:text-base text-gray-500 font-medium">
                Turn applications into interviews with daily focus and momentum.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {!isApplyPro && (
                <Link href="/checkout?billingCycle=quarterly&step=1" className="flex-1 lg:flex-none">
                  <button className="w-full flex items-center justify-center gap-2 bg-[#00C4B3] text-white px-4 py-2.5 sm:py-3 rounded-lg font-black hover:bg-[#00B3A3] transition-all duration-300 shadow-md text-sm">
                    <Zap className="w-4 h-4 fill-white" />
                    Unlock Apply OS
                  </button>
                </Link>
              )}
              <Link href="/jobs-nearby" className="flex-1 lg:flex-none">
                <button className="w-full lg:w-auto bg-[#0B1F3B] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-[#132D54] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg text-sm">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Find More Jobs
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <DailyGoalTracker jobs={appliedJobs} />
              <StreakTracker jobs={appliedJobs} user={user} isApplyPro={isApplyPro} />
              <DailyFocus jobs={[...savedJobs, ...appliedJobs, ...interviewJobs]} onAction={handleTaskAction} />
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Pipeline Health</p>
                    <h3 className="text-2xl font-extrabold text-gray-900">{totalJobs} tracked</h3>
                  </div>
                  <div className="p-2 bg-[#0B1F3B]/5 rounded-lg">
                    <Target className="w-5 h-5 text-[#0B1F3B]" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Applied Today</p>
                    <p className="text-lg font-black text-gray-900">{appliedTodayCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Interviews</p>
                    <p className="text-lg font-black text-gray-900">{interviewJobs.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Offers</p>
                    <p className="text-lg font-black text-gray-900">{offerJobs.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Rejected</p>
                    <p className="text-lg font-black text-gray-900">{rejectedJobs.length}</p>
                  </div>
                </div>
              </div>

              {!isApplyPro && (
                <div className="bg-gradient-to-br from-[#0B1F3B] to-[#132D54] rounded-xl p-4 sm:p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider">Apply Pro OS</p>
                    <Crown className="w-4 h-4 text-[#00C4B3]" />
                  </div>
                  <p className="text-sm font-semibold mb-3">Automate follow‑ups, boost AI fit scores, and track unlimited jobs.</p>
                  <Link href="/checkout?addon=apply_pro">
                    <button className="w-full bg-[#00C4B3] text-white px-4 py-2.5 rounded-lg font-black hover:bg-[#00B3A3] transition-all text-sm">
                      Upgrade to Apply Pro
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Apply Pro Upgrade Banner */}
          {userData?.job_search_plan !== 'apply_pro' && !userData?.hasApplyPro && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#0B1F3B] via-[#132D54] to-[#0B1F3B] rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-2xl relative overflow-hidden group"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#00C4B3]/10 rounded-full blur-3xl group-hover:bg-[#00C4B3]/20 transition-all duration-700"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                    <Rocket className="w-3 h-3 text-[#00C4B3]" />
                    ApplyOS Premium
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Your Job Search is Manual. <span className="text-[#00C4B3] underline decoration-[#00C4B3]/30">Make it Automatic.</span></h2>
                  <p className="text-slate-300 text-sm sm:text-base max-w-xl mb-6 leading-relaxed">
                    Get the unfair advantage with automated follow-ups, AI interview coaching, and deep fit analysis. Turn applications into offers 3x faster.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Zap className="w-4 h-4 text-[#00C4B3]" />
                      Deep AI Match
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Target className="w-4 h-4 text-[#00C4B3]" />
                      Unlimited Tracking
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold hidden sm:flex">
                      <Award className="w-4 h-4 text-[#00C4B3]" />
                      Pro Analytics
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="text-center">
                    <div className="text-slate-300 text-xs mb-1">Full Suite Access</div>
                    <div className="text-2xl font-black text-white">Get Offer Ready</div>
                  </div>
                  <Link href="/checkout?addon=apply_pro" className="w-full">
                    <button className="w-full bg-[#00C4B3] text-white px-8 py-4 rounded-xl font-black hover:bg-[#00B3A3] transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group-hover:scale-105 transform">
                      Upgrade to Apply Pro
                      <ArrowRight size={20} />
                    </button>
                  </Link>
                  <p className="text-[10px] text-slate-400 font-medium">Safe 256-bit encrypted checkout</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
                <div className="p-2 bg-[#0B1F3B]/10 rounded-lg">
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-[#0B1F3B]" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">{savedJobs.length}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 text-center sm:text-left">Saved</p>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
                <div className="p-2 bg-[#00C4B3]/10 rounded-lg">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C4B3]" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">{appliedJobs.length}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 text-center sm:text-left">Applied</p>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
                <div className="p-2 bg-[#0B1F3B]/10 rounded-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#0B1F3B]" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">{interviewJobs.length}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 text-center sm:text-left">Interviews</p>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
                <div className="p-2 bg-[#00C4B3]/10 rounded-lg">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C4B3]" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">{offerJobs.length}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 text-center sm:text-left">Offers</p>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">{rejectedJobs.length}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 text-center sm:text-left">Rejected</p>
            </div>
          </div>

          {/* Intelligence Layer Inserts */}
          {totalJobs > 0 && (
            <div className="mt-8 flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <ApplyProMissions isApplyPro={isApplyPro} />

                {/* EDUCATIONAL BLOCK: Career Switcher's Blueprint */}
                <div className="mt-8 bg-gradient-to-r from-[#0B1F3B] to-[#132D54] rounded-xl p-6 text-white overflow-hidden relative shadow-xl border border-[#0B1F3B]">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Target size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-[#00C4B3]">
                      <Zap className="fill-[#00C4B3]" size={20} />
                      <span className="text-xs font-black tracking-widest uppercase">The Career Switcher's Blueprint</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4">Why Tracking Beats Applying</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">
                          "I applied to 100 jobs and heard nothing." We hear this daily. The solution isn't more applications—it's <strong>better data</strong>.
                        </p>
                        <div className="flex items-start gap-3 mb-2">

                          <div className="bg-[#00C4B3]/20 p-1.5 rounded text-slate-300 mt-0.5">1</div>
                          <p className="text-xs text-slate-300"><strong className="text-white">Track Everything:</strong> If you don't track, you can't follow up. </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-[#00C4B3]/20 p-1.5 rounded text-slate-300 mt-0.5">2</div>
                          <p className="text-xs text-slate-300"><strong className="text-white">Follow Up:</strong> A rejection is better than ghosting. Force a response.</p>
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                          <span className="text-sm font-bold">The Apply Pro Advantage</span>
                          <Crown size={16} className="text-[#00C4B3]" />
                        </div>
                        <ul className="space-y-2.5">
                          <li className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 size={14} className="text-[#00C4B3]" />
                            <span>See which resumes work (A/B Test)</span>
                          </li>
                          <li className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 size={14} className="text-[#00C4B3]" />
                            <span>AI Fit Scores for every job</span>
                          </li>
                          <li className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 size={14} className="text-[#00C4B3]" />
                            <span>One-click Interview Prep</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Interview Prep Upsell */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#00C4B3]" />
                    Ace Your Interviews
                  </h3>
           
                </div>

              </div>
              <div className="lg:w-1/3">
                <FunnelAnalytics
                  applied={appliedJobs.length}
                  interviews={interviewJobs.length}
                  offers={offerJobs.length}
                  isPremium={userData?.job_search_plan === 'apply_pro' || userData?.hasApplyPro}
                  userData={userData}
                />
              </div>
            </div >
          )
          }
        </div >

        {/* Empty State */}
        {
          totalJobs === 0 && (
            <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border border-gray-200 px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No tracked jobs yet</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
                Start finding and saving jobs to track your applications here
              </p>
              <Link href="/jobs-nearby">
                <button className="bg-[#0B1F3B] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-[#132D54] transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg text-sm sm:text-base">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  Find Jobs Now
                </button>
              </Link>
            </div>
          )
        }

        {/* Job Lists */}
        {
          totalJobs > 0 && (
            <div className="space-y-6 sm:space-y-8">
              {/* Offers */}
              {offerJobs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#00C4B3]" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Offers Received ({offerJobs.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {offerJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        statusColor="bg-green-600"
                        statusIcon={Award}
                        statusLabel="Offer Received"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Interviews */}
              {interviewJobs.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-6 h-6 text-[#0B1F3B]" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Interviews Scheduled ({interviewJobs.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interviewJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        statusColor="bg-[#0B1F3B]"
                        statusIcon={Calendar}
                        statusLabel="Interview"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Applied */}
              {appliedJobs.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-[#00C4B3]" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Applied ({appliedJobs.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appliedJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        statusColor="bg-[#0B1F3B]"
                        statusIcon={CheckCircle}
                        statusLabel="Applied"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Saved */}
              {savedJobs.length > 0 && (
                <div id="section-saved">
                  <div className="flex items-center gap-3 mb-4">
                    <Bookmark className="w-6 h-6 text-[#0B1F3B]" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Saved for Later ({savedJobs.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        statusColor="bg-yellow-600"
                        statusIcon={Bookmark}
                        statusLabel="Saved"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected */}
              {rejectedJobs.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <X className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Not Selected ({rejectedJobs.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rejectedJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        statusColor="bg-gray-600"
                        statusIcon={X}
                        statusLabel="Rejected"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        }
      </div >

      {/* Edit Modal */}
      {
        showEditModal && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Update Job Status</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-[#0B1F3B]/5 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-gray-900">{selectedJob.title}</h4>
                  <p className="text-sm text-gray-600">{selectedJob.company}</p>
                </div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent mb-4"
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview Scheduled</option>
                  <option value="offer">Offer Received</option>
                  <option value="rejected">Not Selected</option>
                </select>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this job..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateJob}
                  className="flex-1 px-6 py-3 bg-[#0B1F3B] text-white rounded-lg font-bold hover:bg-[#132D54] transition-all duration-300"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {
        showDeleteModal && jobToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Remove Job?</h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setJobToDelete(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-100">
                  <h4 className="font-bold text-gray-900 mb-1">{jobToDelete.title}</h4>
                  <p className="text-sm text-gray-600">{jobToDelete.company}</p>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      Are you sure you want to remove this job from your tracker?
                    </p>
                    <p className="text-xs text-gray-500">
                      This action cannot be undone. All notes and status history will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteJob}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Resume Selector Modal */}
      <AnimatePresence>
        {showResumeSelector && pendingJobForAi && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Select Matching Resume</h3>
                <button onClick={() => setShowResumeSelector(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <p className="text-sm text-gray-600 mb-6">
                  Select which resume you want to match against <strong>{pendingJobForAi.title}</strong> at <strong>{pendingJobForAi.company}</strong>.
                </p>

                <div className="space-y-3">
                  {allResumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => handleRunAiAnalysis(pendingJobForAi, resume)}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-[#00C4B3] hover:bg-[#00C4B3]/5 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0B1F3B]/10 rounded-lg text-[#0B1F3B] group-hover:bg-[#0B1F3B] group-hover:text-white transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{resume.resumeName || resume.title || 'Untitled Resume'}</h4>
                          <p className="text-xs text-gray-500">
                            Updated {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-[#0B1F3B]" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <Link href="/resume-builder" className="text-sm font-bold text-[#0B1F3B] hover:underline flex items-center justify-center gap-2">
                  <Plus size={14} /> Create a new targeted resume
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!isApplyPro && (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
          <div className="mx-auto max-w-7xl px-3 pb-3">
            <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-2xl shadow-2xl p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-900">Unlock Apply Pro OS</p>
                <p className="text-[10px] text-gray-500">Auto‑followups, AI fit, unlimited tracking.</p>
              </div>
              <Link href="/checkout?addon=apply_pro">
                <button className="bg-[#0B1F3B] text-white px-4 py-2 rounded-lg text-xs font-black shadow-sm hover:bg-[#132D54] transition-colors">
                  Upgrade
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div >
  );
}
