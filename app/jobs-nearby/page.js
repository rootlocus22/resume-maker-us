"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Sparkles, AlertCircle, Clock, Crown, Target, Zap, Rocket, BookmarkPlus } from "lucide-react";
import toast from "react-hot-toast";
import JobListCard from "./JobListCard";
import JobDetailPane from "./JobDetailPane";
import AuthProtection from "../components/AuthProtection";


// Simple robust caching to prevent API abuse during session
const SEARCH_CACHE = new Map();

export default function JobsHub() {
  return (
    <AuthProtection>
      <JobsHubContent />
    </AuthProtection>
  );
}

function JobsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isPremium, userData, isQuarterlyPlan, isSixMonthPlan } = useAuth();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("United States");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const [recentSearches, setRecentSearches] = useState([]);
  const [autoSaveInProgress, setAutoSaveInProgress] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  // Gating Logic
  const hasJobsAddon = userData?.hasJobTrackerFeature === true || userData?.hasJobsFeature === true;
  const isApplyPro = userData?.job_search_plan === 'apply_pro' || userData?.hasApplyPro;
  const hasProAccess = isQuarterlyPlan || isSixMonthPlan || hasJobsAddon || isApplyPro;

  const quickFilters = ["For you", "Easy Apply", "Remote", "Hybrid", "Part-time", "Top Pay", "Recently Posted"];
  const MAX_PAGES_FREE = 1;
  const MAX_PAGES_PRO = 20;
  const maxPages = hasProAccess ? MAX_PAGES_PRO : MAX_PAGES_FREE;

  // Load last search results from localStorage on mount
  useEffect(() => {
    // Check for auto-search params first
    const autoParam = searchParams.get('auto');
    const queryParam = searchParams.get('q');

    if (autoParam === 'true' && queryParam) {
      // Check limit synchronously to prevent race condition
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `jsearch_count_${user?.uid || 'guest'}_${today}`;
      const used = parseInt(localStorage.getItem(storageKey) || '0');
      const max = isPremium ? 50 : 3;

      if (used >= max) {
        setLimitReached(true);
        toast.error("Daily limit reached. Please upgrade to check jobs.");
        return;
      }

      console.log('🚀 Auto-triggering search for:', queryParam);
      setQuery(queryParam);
      handleSearch(null, queryParam); // Pass null event, and queryParam
      return; // Skip loading from cache
    }

    const savedSearch = localStorage.getItem('lastJobSearch');
    if (savedSearch) {
      try {
        const { query: savedQuery, location: savedLocation, jobs: savedJobs, timestamp } = JSON.parse(savedSearch);
        // Only restore if search was within last 24 hours
        if (timestamp && Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setQuery(savedQuery || '');
          setLocation(savedLocation || 'India');
          setJobs(savedJobs || []);
          // Auto-select first job when loading saved results
          if (savedJobs && savedJobs.length > 0) {
            setSelectedJobId(savedJobs[0].job_id);
          }
          setHasSearched(savedJobs && savedJobs.length > 0);
          console.log('📦 Restored last search:', savedQuery, 'in', savedLocation);
        }
      } catch (e) {
        console.error('Failed to restore search:', e);
      }
    }
  }, [searchParams]); // Added searchParams dependency

  useEffect(() => {
    if (!user?.uid) return;
    try {
      const key = `job_alerts_${user.uid}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAlertsEnabled(!!parsed.alertsEnabled);
        setAutoSaveEnabled(!!parsed.autoSaveEnabled);
      }
    } catch (e) {
      console.error('Failed to restore alerts settings', e);
    }
  }, [user]);

  useEffect(() => {
    if (!userData?.jobSearchAlerts) return;
    const alerts = userData.jobSearchAlerts;
    if (typeof alerts.alertsEnabled === "boolean") {
      setAlertsEnabled(alerts.alertsEnabled);
    }
    if (typeof alerts.autoSaveEnabled === "boolean") {
      setAutoSaveEnabled(alerts.autoSaveEnabled);
    }
  }, [userData]);

  useEffect(() => {
    if (!user?.uid) return;
    try {
      const key = `job_alerts_${user.uid}`;
      localStorage.setItem(key, JSON.stringify({ alertsEnabled, autoSaveEnabled }));
    } catch (e) {
      // Non-blocking
    }
  }, [user, alertsEnabled, autoSaveEnabled]);

  useEffect(() => {
    if (!user?.uid || !hasProAccess) return;
    const syncPrefs = async () => {
      try {
        const { db } = await import("../lib/firebase");
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(
          doc(db, "users", user.uid),
          {
            jobSearchAlerts: {
              alertsEnabled,
              autoSaveEnabled,
              updatedAt: new Date().toISOString(),
            },
          },
          { merge: true }
        );
      } catch (e) {
        console.error("Failed to sync alert prefs", e);
      }
    };
    syncPrefs();
  }, [user, hasProAccess, alertsEnabled, autoSaveEnabled]);

  // Fetch History
  useEffect(() => {
    if (!user?.uid) return;

    // Dynamically import to safely use window/client logic
    import("../lib/firebase").then(({ db }) => {
      import("firebase/firestore").then(({ collection, query, orderBy, limit, getDocs }) => {
        const q = query(
          collection(db, "users", user.uid, "job_search_history"),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        getDocs(q).then(snapshot => {
          const history = [];
          const seen = new Set();
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.query && !seen.has(data.query)) {
              seen.add(data.query);
              history.push(data.query);
            }
          });
          setRecentSearches(history);
        }).catch(console.error);
      });
    });
  }, [user]);

  // Fetch Saved Job IDs to show status in list
  useEffect(() => {
    if (!user?.uid) return;

    import("../lib/firebase").then(({ db }) => {
      import("firebase/firestore").then(({ collection, getDocs, query, where }) => {
        const q = query(collection(db, `users/${user.uid}/jobApplications`));
        getDocs(q).then(snapshot => {
          const ids = new Set();
          snapshot.forEach(doc => {
            const data = doc.data();
            // We use a combination of title and company for matching if job_id isn't consistent across sources
            if (data.title && data.company) {
              ids.add(`${data.title}-${data.company}`);
            }
          });
          setSavedJobIds(ids);
        }).catch(console.error);
      });
    });
  }, [user]);

  const handleSaveJob = async (job) => {
    const options = arguments.length > 1 ? arguments[1] : {};
    const silent = !!options.silent;
    const skipLimitCheck = !!options.skipLimitCheck;
    if (!user) {
      if (!silent) toast.error("Please login to save jobs");
      return;
    }

    console.log('JobsHub handleSaveJob:', {
      uid: user.uid,
      hasApplyPro: userData?.hasApplyPro,
      userPlan: user.job_search_plan,
      userDataPlan: userData?.job_search_plan,
      userData
    });
    const isApplyPro = user.job_search_plan === 'apply_pro' || userData?.hasApplyPro;
    const jobKey = `${job.job_title}-${job.employer_name}`;

    if (savedJobIds.has(jobKey)) {
      if (!silent) toast.success("Job already saved!");
      return;
    }

    try {
      if (!isApplyPro && !skipLimitCheck) {
        const { db } = await import("../lib/firebase");
        const { collection, query, where, getCountFromServer } = await import("firebase/firestore");

        const coll = collection(db, `users/${user.uid}/jobApplications`);
        const q = query(coll, where("status", "in", ["saved", "applied", "interview", "offer", "rejected"]));
        const snapshot = await getCountFromServer(q);
        const count = snapshot.data().count;

        if (count >= 3) {
          if (!silent) {
            toast((t) => (
              <div className="flex flex-col gap-2">
                <span className="font-bold">Upgrade to Save More (3/3)</span>
                <span className="text-sm">You've reached the free limit. Unlock unlimited tracking!</span>
                <button
                  onClick={() => { toast.dismiss(t.id); router.push('/checkout?billingCycle=quarterly&step=1'); }}
                  className="bg-[#0B1F3B] text-white px-3 py-1.5 rounded text-xs font-bold mt-1"
                >
                  Upgrade to Expert Plan
                </button>
              </div>
            ), { duration: 5000, icon: '🔒' });
          }
          return;
        }
      }

      const { db } = await import("../lib/firebase");
      const { collection, addDoc } = await import("firebase/firestore");

      const jobData = {
        title: job.job_title,
        company: job.employer_name,
        location: `${job.job_city || ''}, ${job.job_country || ''}`,
        type: job.job_employment_type,
        salary: "Not disclosed",
        link: job.job_apply_link,
        logo: job.employer_logo,
        status: 'saved',
        notes: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        savedAt: new Date().toISOString()
      };

      await addDoc(collection(db, `users/${user.uid}/jobApplications`), jobData);
      setSavedJobIds(prev => new Set([...prev, jobKey]));
      if (!silent) toast.success("Job saved to your tracker!");

    } catch (error) {
      console.error("Error saving job:", error);
      if (!silent) toast.error("Failed to save job");
    }
  };

  const autoSaveTopJobs = async (jobsToSave) => {
    if (!user || !hasProAccess || !autoSaveEnabled || autoSaveInProgress) return;
    const topJobs = jobsToSave
      .filter(job => !savedJobIds.has(`${job.job_title}-${job.employer_name}`))
      .slice(0, 2);

    if (topJobs.length === 0) return;

    setAutoSaveInProgress(true);
    try {
      for (const job of topJobs) {
        await handleSaveJob(job, { silent: true, skipLimitCheck: true });
      }
      toast.success(`Auto-saved ${topJobs.length} top matches`);
    } catch (e) {
      console.error("Auto-save failed:", e);
    } finally {
      setAutoSaveInProgress(false);
    }
  };

  const handleRecentClick = (fullQuery) => {
    // format: "developer in bangalore"
    const parts = fullQuery.split(' in ');
    if (parts.length > 1) {
      const loc = parts.pop();
      setLocation(loc);
      setQuery(parts.join(' in '));
    } else {
      setQuery(fullQuery);
    }
  };

  // Business Limits
  const DAILY_LIMIT_FREE = 3;
  const DAILY_LIMIT_PREMIUM = 50;

  const [searchesLeft, setSearchesLeft] = useState(3);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    // Determine limit based on plan
    const max = hasProAccess ? DAILY_LIMIT_PREMIUM : DAILY_LIMIT_FREE;

    // Check local storage for today's usage
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `jsearch_count_${user?.uid || 'guest'}_${today}`;
    const used = parseInt(localStorage.getItem(storageKey) || '0');

    const remaining = Math.max(0, max - used);
    setSearchesLeft(remaining);
    if (remaining === 0) setLimitReached(true);
  }, [user, hasProAccess]);

  // Auto-fill from user profile/resume if available could go here
  // For now, clean slate is safer to avoid "random" searches on load

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only navigate if we have jobs and not typing in an input
      if (jobs.length === 0 || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = jobs.findIndex(j => j.job_id === selectedJobId);
        const nextIndex = currentIndex < jobs.length - 1 ? currentIndex + 1 : 0;
        setSelectedJobId(jobs[nextIndex].job_id);

        // Scroll into view logic could come here if needed
        document.getElementById(`job-card-${jobs[nextIndex].job_id}`)?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = jobs.findIndex(j => j.job_id === selectedJobId);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : jobs.length - 1;
        setSelectedJobId(jobs[prevIndex].job_id);

        document.getElementById(`job-card-${jobs[prevIndex].job_id}`)?.scrollIntoView({ block: 'nearest' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jobs, selectedJobId]);

  const handleSearch = async (e, overrideQuery = null) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    // Use override query if provided, otherwise failback to state
    const effectiveQuery = overrideQuery || query;
    const effectiveLocation = location;

    if (!effectiveQuery || !effectiveLocation) {
      toast.error("Please enter a job title and location");
      return;
    }

    if (limitReached) {
      if (!hasProAccess) {
        toast.error("Free limit reached. Upgrade to unlock 50 searches/day.");
        router.push('/checkout?billingCycle=quarterly&step=1');
      } else {
        toast.error("Daily search limit reached (50/day). Come back tomorrow!");
      }
      return;
    }

    setLoading(true);
    setHasSearched(true);
    const cacheKey = `${effectiveQuery.toLowerCase()}-${effectiveLocation.toLowerCase()}-p1`;

    // 1. Check Session Cache (Free - Does NOT count against limit)
    if (SEARCH_CACHE.has(cacheKey)) {
      console.log("Serving from cache");
      setJobs(SEARCH_CACHE.get(cacheKey));
      setCurrentPage(1);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/jobs-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `${effectiveQuery} in ${effectiveLocation}`,
          uid: user?.uid,
          page: 1,
          num_pages: 1
        })
      });

      const data = await response.json();

      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
        setCurrentPage(1);
        // Auto-select first job
        setSelectedJobId(data.jobs[0].job_id);
        SEARCH_CACHE.set(cacheKey, data.jobs); // Session cache

        // Save to localStorage for persistence across page reloads
        localStorage.setItem('lastJobSearch', JSON.stringify({
          query,
          location,
          jobs: data.jobs,
          timestamp: Date.now()
        }));
        console.log('💾 Saved search to localStorage');

        // Increment Count
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `jsearch_count_${user?.uid || 'guest'}_${today}`;
        const currentUsed = parseInt(localStorage.getItem(storageKey) || '0');
        const newUsed = currentUsed + 1;
        localStorage.setItem(storageKey, newUsed.toString());

        const max = isPremium ? DAILY_LIMIT_PREMIUM : DAILY_LIMIT_FREE;
        setSearchesLeft(Math.max(0, max - newUsed));
        if (newUsed >= max) setLimitReached(true);

        // Auto-save top matches for Pro users
        autoSaveTopJobs(data.jobs);

      } else {
        setJobs([]);
        toast.error("No jobs found. Try broader keywords.");
      }
    } catch (error) {
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasSearched) return;
    if (currentPage >= maxPages) return;
    if (!query || !location) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const cacheKey = `${query.toLowerCase()}-${location.toLowerCase()}-p${nextPage}`;
      if (SEARCH_CACHE.has(cacheKey)) {
        const cached = SEARCH_CACHE.get(cacheKey);
        setJobs(prev => [...prev, ...cached]);
        setCurrentPage(nextPage);
        setIsLoadingMore(false);
        return;
      }

      const response = await fetch("/api/jobs-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `${query} in ${location}`,
          uid: user?.uid,
          page: nextPage,
          num_pages: 1
        })
      });

      const data = await response.json();
      if (data.jobs && data.jobs.length > 0) {
        setJobs(prev => [...prev, ...data.jobs]);
        SEARCH_CACHE.set(cacheKey, data.jobs);
        setCurrentPage(nextPage);
      } else {
        toast.error("No more jobs found.");
      }
    } catch (error) {
      toast.error("Failed to load more jobs.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Stable handler for job selection
  const handleJobSelect = useCallback((jobId) => {
    setSelectedJobId(jobId);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 pb-20 pt-16 lg:pt-0">

      {/* 1. Dynamic Search Section (Hero vs Compact) */}
      <div className={`bg-white border-b border-gray-200 transition-all duration-300 sticky top-16 lg:top-0 inset-x-0 z-40 ${hasSearched ? 'py-3 shadow-md' : 'pt-4 pb-4 shadow-sm'
        }`}>
        <div className={`mx-auto transition-all duration-300 ${hasSearched ? 'max-w-[1400px] px-4' : 'max-w-4xl px-4 text-center'
          }`}>
          {!hasSearched && null}

          <div className={`grid gap-4 ${hasSearched ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[1.6fr_1fr] items-start'}`}>
            <form onSubmit={handleSearch} className={`flex gap-3 transition-all duration-300 ${hasSearched
              ? 'flex-row items-center'
              : 'flex-col md:flex-row bg-white p-2 rounded-xl shadow-md border border-gray-100'
              }`}>
              {/* Logo/Brand for Compact Mode */}
              {hasSearched && (
                <div className="hidden lg:flex items-center gap-2 mr-4 md:mr-8 border-r border-gray-200 pr-6 h-8">
                  <span className="font-bold text-xl tracking-tight text-gray-900">Job<span className="text-[#00C4B3]">Search</span></span>
                </div>
              )}

              <div className={`flex items-center bg-gray-50 transition-all focus-within:ring-2 ring-[#00C4B3]/20 ${hasSearched
                ? 'flex-1 h-10 rounded-lg px-3 border border-gray-200'
                : 'flex-1 rounded-lg px-3 py-2.5'
                }`}>
                <Search className="text-gray-400 flex-shrink-0 mr-3" size={hasSearched ? 16 : 18} />
                <input
                  type="text"
                  placeholder="Job title (e.g. React Developer)"
                  className={`bg-transparent border-none outline-none w-full text-gray-800 placeholder-gray-400 ${hasSearched ? 'text-sm' : 'text-sm'
                    }`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className={`flex items-center bg-gray-50 transition-all focus-within:ring-2 ring-[#00C4B3]/20 ${hasSearched
                ? 'w-48 h-10 rounded-lg px-3 border border-gray-200 hidden md:flex'
                : 'flex-1 rounded-lg px-3 py-2.5'
                }`}>
                <MapPin className="text-gray-400 flex-shrink-0 mr-3" size={hasSearched ? 16 : 18} />
                <input
                  type="text"
                  placeholder="Location"
                  className={`bg-transparent border-none outline-none w-full text-gray-800 placeholder-gray-400 ${hasSearched ? 'text-sm' : 'text-sm'
                    }`}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || limitReached}
                className={`bg-[#0B1F3B] hover:bg-[#071429] text-white font-semibold transition-all shadow-md hover:shadow-[#0B1F3B]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${hasSearched
                  ? 'h-10 px-6 rounded-lg text-sm whitespace-nowrap'
                  : 'py-2.5 px-6 rounded-lg text-sm'
                  }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            </form>



            {!hasSearched && !hasProAccess && (
              <div className="hidden lg:flex flex-col gap-3 bg-gradient-to-br from-[#0B1F3B] to-[#132D54] text-white rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider">Apply Pro OS</p>
                  <Crown className="w-4 h-4 text-[#00C4B3]" />
                </div>
                <h3 className="text-lg font-bold">Unlock daily alerts + auto‑save matches</h3>
                <p className="text-xs text-slate-300">Get 50 searches/day, AI match scores, and auto‑followups.</p>
                <button
                  onClick={() => router.push('/checkout?billingCycle=quarterly&step=1')}
                  className="bg-[#00C4B3] text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-[#00B3A3] transition-colors"
                >
                  Upgrade to Expert Plan
                </button>
              </div>
            )}
          </div>

          {!hasSearched && hasProAccess && (
            <div className="mt-4 text-xs text-gray-500 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C4B3]" />
              Saved alerts and auto‑save are ready for your next search.
            </div>
          )}

          {/* USAGE TRACKER & UPGRADE CTA */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className={`text-xs font-bold flex items-center justify-center gap-1.5 ${limitReached ? 'text-red-500' : 'text-[#0B1F3B]'}`}>
              <Sparkles size={14} className={limitReached ? 'text-red-500' : 'text-[#00C4B3] animate-pulse'} />
              <span>
                {limitReached
                  ? (isPremium
                    ? "Premium Daily Limit (50/50) Reached"
                    : <span onClick={() => router.push('/checkout?billingCycle=quarterly&step=1')} className="cursor-pointer underline decoration-dotted">
                      Free Search Limit Reached. Unlock Expert Plan for 100/day.
                    </span>
                  )
                  : `${searchesLeft} Searches Remaining Today`
                }
              </span>
            </p>

            {limitReached && !isPremium && (
              <button
                onClick={() => router.push('/checkout?billingCycle=quarterly&step=1')}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0B1F3B] to-[#132D54] text-white text-sm font-extrabold rounded-full shadow-xl hover:shadow-[#0B1F3B]/20 hover:-translate-y-1 transition-all active:scale-95"
              >
                < Crown size={16} />
                Upgrade to Expert (Job Search Included)
              </button>
            )}
          </div>



          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2 animate-fadeIn transition-all duration-500">
              <span className="flex items-center text-xs text-gray-400 font-medium mr-1">
                <Clock size={12} className="mr-1" /> Recent:
              </span>
              {recentSearches.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleRecentClick(s)}
                  className="px-3 py-1 bg-gray-100 hover:bg-[#00C4B3]/10 text-gray-600 hover:text-[#0B1F3B] text-xs rounded-full transition-colors border border-transparent hover:border-[#00C4B3]/20"
                >
                  {s}
                </button>
              ))}
            </div>
          )}



        </div>
      </div>

      {/* 2. Results Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 pt-20 lg:pt-8">

        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl w-full"></div>
            ))}
          </div>
        )}

        {!loading && hasSearched && jobs.length === 0 && (
          <div className="text-center py-20 opacity-60">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="font-bold text-gray-600 text-lg">No Results Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your keywords.</p>
          </div>
        )}

        {/* Initial Empty State */}
        {!hasSearched && (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center p-4 bg-[#0B1F3B]/5 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-[#00C4B3]" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Ready to Launch?</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Type a job title above to instantly find opportunities across the web.
            </p>
          </div>
        )}

        {/* RESULTS FEED - Space-Optimized Two Column Layout */}
        {jobs.length > 0 && (
          <>
            <div className="grid lg:grid-cols-[30%_70%] gap-4 bg-white lg:bg-transparent rounded-xl shadow-sm lg:shadow-none border border-gray-200 lg:border-0 overflow-hidden">
              {/* Left: Job List */}
              <div className="lg:bg-white lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-200 overflow-hidden h-[600px] lg:h-[calc(100vh-140px)] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2.5 z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Top job picks for you</h3>
                      <p className="text-[10px] text-gray-500">Based on your activity • {jobs.length} results</p>
                    </div>
                    <span className="text-[10px] text-gray-500">Sorted: Smart Picks</span>
                  </div>

                </div>
                <div className="divide-y divide-gray-100">
                  {jobs.map((job) => (
                    <JobListCard
                      key={job.job_id}
                      job={job}
                      isSelected={selectedJobId === job.job_id}
                      onSelect={handleJobSelect}
                      onSave={handleSaveJob}
                      isSaved={savedJobIds.has(`${job.job_title}-${job.employer_name}`)}
                    />
                  ))}
                  {isLoadingMore && (
                    <div className="p-3 space-y-3 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={`loadmore-skel-${i}`} className="h-20 rounded-lg bg-gray-100 border border-gray-200"></div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 bg-white">
                  {currentPage < maxPages ? (
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold border border-[#0B1F3B] text-[#0B1F3B] hover:bg-[#0B1F3B]/5 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isLoadingMore && (
                        <span className="w-3.5 h-3.5 border-2 border-[#0B1F3B]/40 border-t-[#0B1F3B] rounded-full animate-spin"></span>
                      )}
                      {isLoadingMore ? "Loading more..." : "Load more jobs"}
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <p className="text-[11px] text-gray-500">
                        Showing {currentPage} / {maxPages} pages
                      </p>
                      {!hasProAccess && (
                        <button
                          onClick={() => router.push('/checkout?billingCycle=quarterly&step=1')}
                          className="text-[11px] font-bold text-[#0B1F3B] hover:underline"
                        >
                          Unlock more jobs with Expert Plan
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Job Details */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-140px)] overflow-hidden sticky top-[72px]">
                <JobDetailPane
                  job={jobs.find(j => j.job_id === selectedJobId)}
                  isPremium={isPremium}
                />
              </div>

            </div>
          </>
        )}

        {/* Mobile: Selected Job Detail (Full Screen Overlay) */}
        {selectedJobId && jobs.length > 0 && (
          <div className="lg:hidden fixed inset-0 bg-white z-50 overflow-y-auto pt-16">
            <JobDetailPane
              job={jobs.find(j => j.job_id === selectedJobId)}
              isPremium={isPremium}
              onClose={() => setSelectedJobId(null)}
            />
            <button
              onClick={() => setSelectedJobId(null)}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
            >
              ← Back to list
            </button>
          </div>
        )}

        {!hasProAccess && (
          <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
            <div className="mx-auto max-w-7xl px-3 pb-3">
              <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-2xl shadow-2xl p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-900">Unlock Apply Pro OS</p>
                  <p className="text-[10px] text-gray-500">AI match + alerts + auto‑save.</p>
                </div>
                <button
                  onClick={() => router.push('/checkout?billingCycle=quarterly&step=1')}
                  className="bg-[#0B1F3B] text-white px-4 py-2 rounded-lg text-xs font-black shadow-sm hover:bg-[#132D54] transition-colors"
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div >
  );
}