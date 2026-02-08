"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { User, LogOut, Star, Edit3, HelpCircle, Zap, Clock, Shield, CheckCircle2, ChevronRight, PlusCircle, FileText, CreditCard, Globe, Share2, TrendingUp, Download, Crown, Calendar, ArrowUpRight, AlertCircle, ArrowRight, X, Briefcase, Brain, Users, Trash2, DatabaseZap, Eye, Lock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import MyResumes from "../my-resumes/page";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { PLAN_CONFIG } from "../lib/planConfig";
import { useLocation } from "../context/LocationContext";
import { formatPrice, getEffectivePricing } from "../lib/globalPricing";

export default function Profile() {
  const { handleLogout: authHandleLogout } = useAuth();
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("free");
  const [billingCycle, setBillingCycle] = useState(null);
  const [usage, setUsage] = useState({ previews: 0, resumes: 0, downloads: 0 });
  const [premiumExpiry, setPremiumExpiry] = useState(null);
  const [applyProExpiry, setApplyProExpiry] = useState(null);
  const [hasApplyPro, setHasApplyPro] = useState(false);
  const [hasJobSearch, setHasJobSearch] = useState(false);
  const [jobSearchExpiry, setJobSearchExpiry] = useState(null);
  const [hasInterviewKit, setHasInterviewKit] = useState(false);
  const [interviewKitExpiry, setInterviewKitExpiry] = useState(null);
  const [interviewPlan, setInterviewPlan] = useState("free");
  const [premiumSince, setPremiumSince] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [showUsageTips, setShowUsageTips] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [hasPublicProfile, setHasPublicProfile] = useState(false);
  const [profileSlots, setProfileSlots] = useState(0);
  const [storedProfiles, setStoredProfiles] = useState([]);
  const [profilePromoDismissed, setProfilePromoDismissed] = useState(false);
  const router = useRouter();
  const { currency } = useLocation();
  const pricing = getEffectivePricing(currency);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setTransactionsLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          // Fetch user data
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setPlan(data.plan || "free");
            // Extract billing cycle from plan field (e.g., "premium_monthly" -> "monthly")
            let extractedBillingCycle = null;
            if (data.plan && data.plan.includes('_')) {
              const parts = data.plan.split('_');
              if (parts.length === 2 && parts[0] === "premium") {
                extractedBillingCycle = parts[1];
              }
            }
            setBillingCycle(extractedBillingCycle || data.billingCycle || null);

            setUsage({
              previews: data.preview_count || 0,
              resumes: data.resume_count || 0,
              downloads: data.pdf_download_count || 0,
            });
            setProfileSlots(data.profileSlots || 0);

            // Normalize firstResumeReference to array
            let refs = data.firstResumeReference || [];
            if (!Array.isArray(refs)) {
              refs = [refs];
            }
            setStoredProfiles(refs);

            setPremiumExpiry(data.premium_expiry ? new Date(data.premium_expiry) : null);
            setApplyProExpiry(data.apply_pro_expiry ? new Date(data.apply_pro_expiry) : null);
            setHasApplyPro(data.hasApplyPro || !!data.apply_pro_expiry);
            setHasJobSearch(data.hasJobSearch || data.hasJobTrackerFeature);
            setJobSearchExpiry(data.jobSearchExpiry ? new Date(data.jobSearchExpiry) : null);
            setHasInterviewKit(data.hasInterviewKit);
            setInterviewKitExpiry(data.interviewKitExpiry ? new Date(data.interviewKitExpiry) : null);
            setInterviewPlan(data.interview_plan || "free");
            if (data.interview_premium_expiry) {
              setInterviewKitExpiry(new Date(data.interview_premium_expiry));
            }
          }

          // Check if user has a public profile
          const profileRef = doc(db, `users/${currentUser.uid}/profile`, 'userProfile');
          const profileSnapshot = await getDoc(profileRef);
          setHasPublicProfile(profileSnapshot.exists() && profileSnapshot.data()?.allowMatching);

          // Check if profile promo was dismissed
          const promoDismissed = localStorage.getItem(`accountProfilePromoDismissed_${currentUser.uid}`) === 'true';
          setProfilePromoDismissed(promoDismissed);

          // Fetch payment logs
          const response = await fetch(`/api/payment-logs?userId=${currentUser.uid}`);
          if (!response.ok) {
            throw new Error("Failed to fetch transactions");
          }
          const { transactions } = await response.json();
          const parsedTransactions = transactions.map(tx => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
          }));
          setTransactions(parsedTransactions);

          // Extract billing cycle from latest successful payment
          if (parsedTransactions.length > 0) {
            const successfulTransactions = parsedTransactions.filter(tx => tx.status === 'success');
            if (successfulTransactions.length > 0) {
              // Sort by timestamp descending to get the latest
              successfulTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
              const latestPayment = successfulTransactions[0];

              // Override billing cycle with payment logs data (source of truth)
              if (latestPayment.billingCycle) {
                setBillingCycle(latestPayment.billingCycle);
              }
            }

            // Set premiumSince to earliest timestamp
            const earliestTimestamp = new Date(
              Math.min(...parsedTransactions.map(tx => tx.timestamp.getTime()))
            );
            setPremiumSince(earliestTimestamp);
          }
        } catch (error) {
          toast.error("Error loading profile or transaction data");
          console.error(error);
        }
        setTransactionsLoading(false);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      const redirectPath = await authHandleLogout();
      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (error) {
      toast.error("Logout failed. Try again.");
    }
  };

  const handleDismissProfilePromo = () => {
    setProfilePromoDismissed(true);
    if (user) {
      localStorage.setItem(`accountProfilePromoDismissed_${user?.uid}`, 'true');
    }
  };

  const getPlanLimit = () => {
    if (plan === "monthly" || plan === "sixMonth" || plan === "premium") return "Unlimited";
    if (plan === "interview_gyani") return "Unlimited Interviews";
    if (plan === "basic") return PLAN_CONFIG.basic.downloads;
    if (plan === "free" || plan === "anonymous") return 0;
    return 0;
  };

  const getPlanName = (type = 'resume') => {
    if (type === 'interview') {
      if (interviewPlan === "interview_gyani" || interviewPlan === "pro") return "AI Interview Pro";
      return "Free Interview Practice";
    }

    if (plan === "premium") return "Premium Pro";
    if (plan === "monthly") return "Pro Monthly";
    if (plan === "sixMonth") return "Pro 6-Month";
    return "Free Plan";
  };

  const getPlanFeatures = (type = 'resume') => {
    if (type === 'interview') {
      return [
        "Unlimited Mock Interviews",
        "AI Senior Interviewer",
        "Resume-Aware Questions",
        "Detailed Performance Reports",
        "AI Feedback & Readiness Score",
        "Save & Revisit Sessions",
        "Priority Interview Support"
      ];
    }

    // Pro plans (monthly, sixMonth, or premium with billing cycle)
    if (plan === "premium" || plan === "monthly" || plan === "sixMonth") {
      return [
        "Unlimited Resume Downloads",
        "All Premium Templates",
        "AI Boost Feature",
        "JD Builder - Tailor to Any Job",
        "One Pager Resume",
        "Detailed ATS Analysis",
        "ExpertResume GPT",
        "Salary Analyzer",
        "1 Min Upload Resume",
        "AI Generated Bullet Points",
        "Priority Support"
      ];
    }
    if (plan === "basic") {
      return [
        `${PLAN_CONFIG.basic.downloads} Resume Downloads`,
        "50+ Premium Templates",
        "AI Enhancement",
        "ATS Optimizer",
        "Cover Letter Builder",
        "7-Day Access",
        "Email Support"
      ];
    }
    return [
      "1 Resume Preview",
      "Basic Templates",
      "Limited Features",
      "1 Mock Interview Trial"
    ];
  };

  const getUpgradeOptions = () => {
    if (plan === "free" || plan === "anonymous") {
      return [
        { name: "Starter Plan", price: formatPrice(pricing.basic, currency), duration: "7 days", billingCycle: "basic", features: [`${PLAN_CONFIG.basic.downloads} Downloads`, "50+ Templates", "7-Day Access"] },
        { name: "Pro Monthly", price: formatPrice(pricing.monthly, currency), duration: "30 days", billingCycle: "monthly", features: ["Unlimited Downloads", "All Pro Features", "30-Day Access"] },
        { name: "Pro 6-Month", price: formatPrice(pricing.sixMonth, currency), duration: "180 days", billingCycle: "sixMonth", features: ["Unlimited Downloads", "All Pro Features", "180-Day Access", "Best Value"] }
      ];
    }
    if (plan === "basic") {
      return [
        { name: "Pro Monthly", price: formatPrice(pricing.monthly, currency), duration: "30 days", billingCycle: "monthly", features: ["Unlimited Downloads", "All Pro Features", "30-Day Access"] },
        { name: "Pro 6-Month", price: formatPrice(pricing.sixMonth, currency), duration: "180 days", billingCycle: "sixMonth", features: ["Unlimited Downloads", "All Pro Features", "Best Value"] }
      ];
    }
    return [];
  };

  const handleUpgrade = (billingCycle) => {
    router.push(`/checkout?billingCycle=${billingCycle}&currency=${currency}&step=1`);
  };

  const isPlanExpired = () => {
    if (!premiumExpiry) return false;
    return new Date() > premiumExpiry;
  };

  const getDaysRemaining = () => {
    if (!premiumExpiry) return 0;
    const now = new Date();
    const diffTime = premiumExpiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-900 border-t-transparent" />
          <p className="text-slate-500 text-sm font-medium">Syncing account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 sm:py-8 lg:py-10">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Account Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your profile, subscription, and billing</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg font-medium transition-colors shadow-sm"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Public Profile Promotion Banner */}
        {!hasPublicProfile && !profilePromoDismissed && (
          <div className="relative bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8 group hover:border-slate-300 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#0B1F3B]"></div>
            <button
              onClick={handleDismissProfilePromo}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
            >
              <X size={14} />
            </button>

            <div className="p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200">
                    <Globe size={28} className="text-[#0B1F3B]" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Professional Public Profile
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base mb-6 max-w-2xl">
                    Create a sharable professional page to showcase your career journey and connect with top recruiters directly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => router.push('/edit-profile')}
                      className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95"
                    >
                      <Share2 size={16} />
                      Set Up My Profile
                    </button>
                    <button
                      onClick={() => window.open('/public-profile/demo', '_blank')}
                      className="bg-white text-slate-700 px-6 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all font-semibold text-sm shadow-sm active:scale-95"
                    >
                      Preview Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Profile Section */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-slate-100 shadow-inner">
                    <User size={32} className="text-slate-400 sm:w-10 sm:h-10" />
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{user?.displayName || "User"}</h2>
                <p className="text-slate-500 text-sm mt-1.5 break-all max-w-full px-4">{user?.email}</p>
                {hasPublicProfile && (
                  <Link
                    href="/edit-profile"
                    className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <Globe size={12} />
                    View Public Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Zap size={16} className="text-[#0B1F3B]" />
                Resource Usage
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tight mb-2">
                    <span className="text-slate-500">Resume Downloads</span>
                    <span className="text-slate-900">
                      {usage.downloads} <span className="text-slate-400 font-medium">/ {getPlanLimit()}</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0B1F3B] transition-all duration-700 ease-out rounded-full"
                      style={{
                        width: `${(plan === "premium" || plan === "monthly" || plan === "sixMonth")
                          ? 100
                          : plan === "basic"
                            ? Math.min((usage.downloads / 8) * 100, 100)
                            : Math.min((usage.downloads / 1) * 100, 100)
                          }%`
                      }}
                    />
                  </div>
                  {plan === "basic" && usage.downloads >= 8 && (
                    <p className="text-[11px] text-red-600 mt-2 font-medium flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      Download limit reached.
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tight mb-2">
                    <span className="text-slate-500">Resume Previews</span>
                    <span className="text-slate-900">{usage.previews} <span className="text-slate-400 font-medium">/ 10</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0B1F3B] transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${Math.min((usage.previews / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tight mb-2">
                    <span className="text-slate-500">Saved Resumes</span>
                    <span className="text-slate-900">{usage.resumes} <span className="text-slate-400 font-medium">/ 10</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0B1F3B] transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${Math.min((usage.resumes / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-50">
                  <button
                    onClick={() => setShowUsageTips(!showUsageTips)}
                    className="text-xs font-bold text-[#0B1F3B] hover:text-[#071429] flex items-center gap-1.5 transition-colors group"
                  >
                    <HelpCircle size={14} className="text-slate-400 group-hover:text-[#0B1F3B] transition-colors" />
                    Viewing Usage Policy
                  </button>
                  {showUsageTips && (
                    <div className="mt-3 p-4 bg-slate-50 rounded-lg text-[11px] text-slate-600 leading-relaxed border border-slate-100 animate-slideDown">
                      <p className="flex items-start gap-2 mb-1.5 font-medium">
                        <span className="text-[#0B1F3B] mt-0.5">•</span>
                        Downloads reset immediately upon plan upgrade.
                      </p>
                      <p className="flex items-start gap-2 mb-1.5 font-medium">
                        <span className="text-[#0B1F3B] mt-0.5">•</span>
                        Resume previews allocated per billing cycle.
                      </p>
                      <p className="flex items-start gap-2 font-medium">
                        <span className="text-[#0B1F3B] mt-0.5">•</span>
                        Upgrade to Pro for unlimited resource access.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Management Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Users size={16} className="text-[#0B1F3B]" />
                Linked Identities
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none">{user?.displayName || "Primary Identity"}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium transition-colors">Default Profile</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#0B1F3B] bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-tight">Active</span>
                </div>

                {storedProfiles.map((profile, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 shadow-sm flex-shrink-0">
                        <Users size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{profile.name || "Alternate Identity"}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-1">{profile.email || "No contact info"}</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight whitespace-nowrap ml-3">
                      {profile.storedAt ? new Date(profile.storedAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                ))}

                {storedProfiles.length === 0 && (
                  <div className="p-4 text-center text-[11px] text-slate-500 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                    No secondary identities found. Identities are created when you generate resumes for others.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Card - Resume Builder */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-3 rounded-2xl shadow-sm border ${plan !== 'free' && plan !== 'anonymous' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        <Crown size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-bold text-slate-900">{getPlanName('resume')}</h3>
                          {(plan === "premium" || plan === "monthly" || plan === "sixMonth") && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Pro</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">
                          {plan === "premium" || plan === "monthly" || plan === "sixMonth"
                            ? premiumSince
                              ? `Active since ${premiumSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                              : "Standard Professional Access"
                            : "Standard Personal Access"}
                        </p>
                      </div>
                    </div>

                    {premiumExpiry && (plan === "premium" || plan === "monthly" || plan === "sixMonth") && (
                      <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {isPlanExpired()
                            ? "Plan has expired"
                            : `Renewing in ${getDaysRemaining()} days`}
                        </span>
                      </div>
                    )}
                  </div>

                  {(plan === "free" || plan === "anonymous" || plan === "basic") && (
                    <div className="w-full sm:w-auto">
                      <Link
                        href="/pricing"
                        className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-sm hover:bg-slate-800 flex items-center justify-center gap-3 text-sm active:scale-95"
                      >
                        <Zap size={18} />
                        Elevate to Pro
                      </Link>
                    </div>
                  )}
                </div>
                {/* Add-on sections removed as requested */}


                {/* Legacy add-on badges removed as requested */}


                {/* Plan Features */}
                <div className="mt-10 space-y-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                    {plan !== 'free' && plan !== 'anonymous' ? 'Premium Features Included' : 'Free Tier Features'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {getPlanFeatures('resume').map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                          <CheckCircle2 size={12} className="text-[#0B1F3B]" />
                        </div>
                        <span className="text-sm text-slate-600 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legacy feature lists removed as requested */}


                {/* Upgrade Options for Non-Premium Users */}
                {(plan === "free" || plan === "anonymous" || plan === "basic") && getUpgradeOptions().length > 0 && (
                  <div className="mt-12 pt-10 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Available Upgrades</h4>
                      <Link href="/pricing" className="text-xs font-bold text-[#0B1F3B] hover:text-[#071429] flex items-center gap-1.5 transition-colors">
                        Compare Plans
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {getUpgradeOptions().map((option, index) => (
                        <div
                          key={index}
                          className={`relative border rounded-2xl p-6 transition-all group ${option.billingCycle === "sixMonth"
                            ? "border-slate-200 bg-slate-50/30 ring-1 ring-slate-200"
                            : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                          {option.billingCycle === "sixMonth" && (
                            <div className="absolute -top-3 left-6 bg-[#0B1F3B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                              Most Efficient
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h5 className="font-bold text-slate-900">{option.name}</h5>
                              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-tight mt-0.5">{option.duration}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-black text-slate-900">{option.price}</span>
                            </div>
                          </div>
                          <ul className="space-y-2 mb-6">
                            {option.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <button
                            onClick={() => handleUpgrade(option.billingCycle)}
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${option.billingCycle === "sixMonth"
                              ? "bg-[#0B1F3B] text-white hover:bg-[#071429] shadow-sm"
                              : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm"
                              }`}
                          >
                            Select Plan
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard size={16} className="text-slate-400" />
                  Billing History
                </h3>
              </div>

              <div className="p-0">
                {transactionsLoading ? (
                  <div className="p-12 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-[#0B1F3B]" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-full mb-3">
                      <CreditCard size={20} className="text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No transactions recorded yet</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                                {tx.planName || "Subscription Renewal"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
                                {tx.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${tx.status === "success"
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-red-50 text-red-600 border border-red-100"
                              }`}>
                              {tx.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Amount Paid</span>
                            <span className="text-sm font-black text-slate-900">{tx.currency} {(tx.amount / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction Date</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Plan / Service</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {transactions.slice(0, 5).map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs font-bold text-slate-900">
                                  {tx.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs text-slate-600 font-medium">{tx.planName || "Subscription Renewal"}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-black text-slate-900">{tx.currency} {(tx.amount / 100).toFixed(2)}</span>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${tx.status === "success"
                                  ? "bg-slate-100 text-slate-600 border border-slate-100"
                                  : "bg-red-50 text-red-600 border border-red-100"
                                  }`}>
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {transactions.length > 5 && (
                      <div className="px-6 py-4 border-t border-slate-50 flex justify-center">
                        <button className="text-xs font-bold text-[#0B1F3B] hover:text-[#071429] flex items-center gap-2 transition-colors group">
                          View all transaction history
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Privacy & Data Management */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Shield size={14} className="text-teal-600" />
                Privacy & Data Management
              </h3>
              <p className="text-sm text-slate-500 mb-6">Manage your personal data in compliance with CCPA. You have the right to access, export, and delete your data at any time.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Link
                  href="/privacy-dashboard"
                  className="group flex items-center justify-between p-4 bg-teal-50/50 border border-teal-100 rounded-xl hover:bg-teal-50 hover:border-teal-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-all">
                      <Eye size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Privacy Dashboard</h4>
                      <p className="text-[11px] text-slate-500">Manage all privacy settings</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-teal-300 group-hover:text-teal-700 transition-colors" />
                </Link>

                <button
                  onClick={async () => {
                    if (!user) return;
                    toast.loading("Exporting your data...");
                    try {
                      const res = await fetch(`/api/export-user-data?userId=${user.uid}`);
                      if (!res.ok) throw new Error("Export failed");
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `expertresume-data-export-${new Date().toISOString().split("T")[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.dismiss();
                      toast.success("Data exported successfully!");
                    } catch (err) {
                      toast.dismiss();
                      toast.error("Failed to export data. Try again.");
                    }
                  }}
                  className="group flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <DatabaseZap size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Export My Data</h4>
                      <p className="text-[11px] text-slate-500">Download all your data (JSON)</p>
                    </div>
                  </div>
                  <Download size={16} className="text-blue-300 group-hover:text-blue-700 transition-colors" />
                </button>

                <Link
                  href="/ccpa-opt-out"
                  className="group flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-all">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">CCPA Opt-Out</h4>
                      <p className="text-[11px] text-slate-500">Do not sell my personal info</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-amber-300 group-hover:text-amber-700 transition-colors" />
                </Link>

                <button
                  onClick={() => {
                    if (!user) return;
                    if (window.confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone. All your resumes, cover letters, and data will be permanently deleted.")) {
                      if (window.confirm("FINAL WARNING: This will permanently delete ALL your data including resumes, cover letters, settings, and account information. This cannot be reversed. Continue?")) {
                        toast.loading("Submitting deletion request...");
                        fetch("/api/delete-user-account", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId: user.uid })
                        })
                          .then(res => res.json())
                          .then(data => {
                            toast.dismiss();
                            if (data.success) {
                              toast.success("Account deletion request submitted. Check your email for confirmation.");
                            } else {
                              toast.error(data.error || "Failed to submit request.");
                            }
                          })
                          .catch(() => {
                            toast.dismiss();
                            toast.error("Failed to submit request. Try again.");
                          });
                      }
                    }
                  }}
                  className="group flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-700 text-sm">Delete My Account</h4>
                      <p className="text-[11px] text-slate-500">Permanently remove all data</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-red-300 group-hover:text-red-600 transition-colors" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">Your rights under CCPA:</strong> As a California resident, you have the right to know what personal data we collect, request deletion of your data, opt-out of the sale of your personal information, and not be discriminated against for exercising your rights. For questions, contact <a href="mailto:privacy@expertresume.us" className="text-teal-600 underline">privacy@expertresume.us</a>.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Zap size={14} className="text-[#0B1F3B]" />
                Experience Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/resume-builder"
                  className="group flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-300 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-[#0B1F3B] shadow-tiny group-hover:bg-[#0B1F3B] group-hover:text-white transition-all duration-300">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Resume Builder</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Create from scratch</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                </Link>

                <Link
                  href="/my-resumes"
                  className="group flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-300 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl border border-green-100 flex items-center justify-center text-green-600 shadow-tiny group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Resume Vault</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Manage documents</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                </Link>

                <Link
                  href="/templates"
                  className="group flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-300 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-center text-purple-600 shadow-tiny group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                      <Star size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Templates</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Explore designs</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                </Link>

                <Link
                  href="/edit-profile"
                  className="group flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-300 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-teal-600 shadow-tiny group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Public Identity</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Update details</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}