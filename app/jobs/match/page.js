"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, XCircle, Target, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import AuthProtection from "../../components/AuthProtection";

export default function JobMatchScorePage() {
    return (
        <AuthProtection>
            <JobMatchScoreContent />
        </AuthProtection>
    );
}

function JobMatchScoreContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function analyze() {
            if (!user) {
                setLoading(false);
                return;
            }

            // Get Job Data from sessionStorage (preferred) or URL params (fallback)
            let jd;
            const storedContext = sessionStorage.getItem('currentJobContext');
            if (storedContext) {
                try {
                    jd = JSON.parse(storedContext);
                } catch (e) {
                    console.error('Failed to parse job context:', e);
                }
            }

            // Fallback to URL params if sessionStorage is empty
            if (!jd || !jd.jobTitle) {
                jd = {
                    jobTitle: searchParams.get('jobTitle') || '',
                    company: searchParams.get('company') || '',
                    location: searchParams.get('location') || '',
                    jobDescription: searchParams.get('description') || searchParams.get('jobDescription') || ''
                };
            }

            // Normalize to jobDescription field
            if (!jd.jobDescription && jd.description) {
                jd.jobDescription = jd.description;
            }

            if (!jd.jobTitle || !jd.jobDescription) {
                setError("Missing job details. Please return to search.");
                setLoading(false);
                return;
            }

            try {
                // Generate cache key using a safer approach (no btoa for Unicode)
                const hashString = `${jd.jobTitle}-${jd.company}-${jd.jobDescription.substring(0, 100)}`;
                let cacheKey = '';
                for (let i = 0; i < hashString.length; i++) {
                    cacheKey += hashString.charCodeAt(i).toString(36);
                }
                cacheKey = cacheKey.substring(0, 50); // Limit length

                // Check Firestore cache first
                const { doc, getDoc, setDoc } = await import("firebase/firestore");
                const cacheRef = doc(db, "users", user.uid, "jobAnalysisCache", cacheKey);
                const cacheDoc = await getDoc(cacheRef);

                if (cacheDoc.exists()) {
                    const cachedData = cacheDoc.data();
                    const cacheAge = Date.now() - new Date(cachedData.createdAt).getTime();
                    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

                    if (cacheAge < maxAge && cachedData.matchScore) {
                        console.log("✅ Using cached analysis (age:", Math.floor(cacheAge / (1000 * 60 * 60)), "hours)");
                        setAnalysis({
                            ...cachedData.matchScore,
                            _isCached: true,
                            _cacheAge: Math.floor(cacheAge / (1000 * 60 * 60))
                        });
                        setLoading(false);
                        return;
                    }
                }

                // Cache miss or expired - fetch from API
                console.log("🔄 Fetching fresh analysis from API...");

                const resumesRef = collection(db, "users", user.uid, "resumes");
                const snapshot = await getDocs(resumesRef);

                if (snapshot.empty) {
                    setError("No resume found. Please create one first.");
                    setLoading(false);
                    return;
                }

                const parseDateValue = (value) => {
                    if (!value) return 0;
                    if (value instanceof Date) return value.getTime();
                    if (typeof value === "string" || typeof value === "number") return new Date(value).getTime();
                    if (typeof value === "object") {
                        if (typeof value.toDate === "function") return value.toDate().getTime();
                        if (typeof value.seconds === "number") return value.seconds * 1000;
                    }
                    return 0;
                };

                const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                const validDocs = docs.filter(doc => doc.resumeData && Object.keys(doc.resumeData).length > 0);

                if (validDocs.length === 0) {
                    setError("No valid resume data found.");
                    setLoading(false);
                    return;
                }

                validDocs.sort((a, b) => {
                    const dateA = parseDateValue(a.updatedAt || a.createdAt);
                    const dateB = parseDateValue(b.updatedAt || b.createdAt);
                    return dateB - dateA;
                });

                const latestResume = validDocs[0];
                const resumeData = latestResume.resumeData;

                let cleanResumeData;
                try {
                    cleanResumeData = JSON.parse(JSON.stringify(resumeData));
                } catch (e) {
                    setError("Failed to serialize resume data.");
                    setLoading(false);
                    return;
                }

                const payload = {
                    jd: {
                        title: jd.jobTitle,
                        company: jd.company,
                        location: jd.location,
                        description: jd.jobDescription
                    },
                    resumeData: cleanResumeData,
                    type: 'match'
                };

                const res = await fetch('/api/extension/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || `Analysis failed with status ${res.status}`);
                }

                const data = await res.json();

                // Save to Firestore cache
                await setDoc(cacheRef, {
                    matchScore: data,
                    jobTitle: jd.jobTitle,
                    company: jd.company,
                    createdAt: new Date().toISOString(),
                    cacheKey: cacheKey
                });

                console.log("💾 Saved analysis to cache");

                setAnalysis({ ...data, _isCached: false });

            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to analyze matching. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        analyze();
    }, [user, searchParams]);

    // Show loading first - before checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-6 text-center">
                {/* Animated Logo/Icon */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full p-6 shadow-2xl">
                        <Target className="w-12 h-12 text-white animate-pulse" />
                    </div>
                </div>

                {/* Main Message */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Analyzing Your Match...</h3>
                <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
                    Our AI is comparing your resume against the job requirements. This usually takes 3-5 seconds.
                </p>

                {/* Progress Steps */}
                <div className="space-y-3 w-full max-w-sm">
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm animate-pulse">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Resume loaded successfully</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm animate-pulse" style={{ animationDelay: '0.2s' }}>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Analyzing skills match...</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-3 rounded-lg shadow-sm opacity-50">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Generating recommendations...</span>
                    </div>
                </div>

                {/* Tip */}
                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-md">
                    <p className="text-xs text-blue-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Pro tip: A match score above 80% significantly increases your interview chances!</span>
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500 min-h-screen flex flex-col items-center justify-center">
                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                <p className="mb-4 text-gray-700">{error}</p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.push('/resume-builder')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition"
                    >
                        Create Resume
                    </button>
                    <button onClick={() => router.back()} className="text-gray-500 text-sm hover:underline">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const getScoreColor = (s) => {
        if (s >= 80) return "text-green-600 border-green-500 bg-green-50";
        if (s >= 50) return "text-yellow-600 border-yellow-500 bg-yellow-50";
        return "text-red-500 border-red-500 bg-red-50";
    };

    // Don't render main content until analysis is loaded
    if (!analysis) {
        return null;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Back Button */}
            <div className="bg-white border-b border-gray-100 px-4 py-3">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Jobs
                </button>
            </div>

            {/* Header / Score Section */}
            <div className="bg-white p-6 shadow-sm border-b border-gray-100 rounded-b-3xl mb-6">
                <div className="text-center">
                    <h2 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-4">ATS Match Integrity</h2>

                    <div className={`w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center mx-auto mb-4 relative ${getScoreColor(analysis?.score || 0)}`}>
                        <span className="text-5xl font-extrabold tracking-tighter">{analysis?.score || 0}%</span>
                        <span className="text-[10px] font-bold uppercase opacity-80 mt-1">Match Rate</span>
                    </div>

                    {/* Cache Indicator */}
                    {analysis?._isCached ? (
                        <div className="inline-block bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs font-semibold text-green-700 mb-4">
                            ⚡ Cached result ({analysis._cacheAge}h ago)
                        </div>
                    ) : (
                        <div className="inline-block bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs font-semibold text-blue-700 mb-4">
                            🔄 Fresh analysis
                        </div>
                    )}

                    {analysis?.salaryInsights && analysis.salaryInsights !== "N/A" && (
                        <div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-600 mb-4 ml-2">
                            💰 Est. Salary: {analysis.salaryInsights}
                        </div>
                    )}

                    <div className="bg-blue-50/50 p-4 rounded-xl text-left border border-blue-100">
                        <h3 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                            <span className="text-lg">👨‍💻</span> Recruiter's Perspective
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed italic">
                            "{analysis?.recruiterSummary || analysis?.explanation || 'No summary available'}"
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-5">
                {/* Critical Gaps */}
                {(analysis.criticalGaps?.length > 0) && (
                    <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
                        <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                            <AlertCircle className="text-red-500 w-5 h-5" />
                            Critical Gaps
                        </h3>
                        <ul className="space-y-3">
                            {analysis.criticalGaps.map((gap, i) => (
                                <li key={i} className="text-sm text-gray-600 flex gap-3 items-start">
                                    <span className="bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                    <span>{gap}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Quick Wins */}
                {(analysis.quickWins?.length > 0) && (
                    <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-400">
                        <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                            <span className="text-xl">⚡</span>
                            Quick Wins
                        </h3>
                        <ul className="space-y-3">
                            {analysis.quickWins.map((win, i) => (
                                <li key={i} className="text-sm text-gray-600 flex gap-3 items-start">
                                    <span className="bg-yellow-100 text-yellow-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                                    <span>{win}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Keyword Analysis */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                        <CheckCircle2 className="text-green-500 w-5 h-5" />
                        Keyword Match
                    </h3>

                    <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Matched Keywords</p>
                        <div className="flex flex-wrap gap-2">
                            {analysis?.matchingKeywords?.map(k => (
                                <span key={k} className="px-2.5 py-1.5 bg-green-50 text-green-700 text-xs rounded-md font-medium border border-green-100">
                                    {k}
                                </span>
                            ))}
                            {(!analysis?.matchingKeywords || analysis.matchingKeywords.length === 0) && <span className="text-gray-400 text-sm">No direct keyword matches found.</span>}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Missing (Add these!)</p>
                        <div className="flex flex-wrap gap-2">
                            {analysis?.missingKeywords?.map(k => (
                                <span key={k} className="px-2.5 py-1.5 bg-red-50 text-red-700 text-xs rounded-md font-medium border border-red-100">
                                    {k}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
