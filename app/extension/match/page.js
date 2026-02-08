"use client";
import { useState, useEffect } from "react";
import { useExtension } from "../context/ExtensionContext";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export default function MatchScorePage() {
    const { currentJob } = useExtension();
    const { user } = useAuth();
    const router = useRouter();

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function analyze() {
            if (!user) {
                setLoading(false);
                return; // Show login prompt
            }

            // Get Job Data
            let jd = currentJob;
            if (!jd) {
                try {
                    jd = JSON.parse(localStorage.getItem('extension_job_context'));
                } catch (e) { }
            }

            if (!jd) {
                setError("No job found. Please return to home.");
                setLoading(false);
                return;
            }

            try {
                // Match MyResumes page logic exactly
                const resumesRef = collection(db, "users", user.uid, "resumes");
                // Fetch all resumes without limit (same as MyResumes to ensure we get everything)
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

                // Filter out docs that don't have potentially valid resumeData
                const validDocs = docs.filter(doc => doc.resumeData && Object.keys(doc.resumeData).length > 0);

                if (validDocs.length === 0) {
                    setError("No valid resume data found. Please create or update a resume.");
                    setLoading(false);
                    return;
                }

                // Sort by UpdatedAt (or CreatedAt) desc
                validDocs.sort((a, b) => {
                    const dateA = parseDateValue(a.updatedAt || a.createdAt);
                    const dateB = parseDateValue(b.updatedAt || b.createdAt);
                    return dateB - dateA;
                });

                const latestResume = validDocs[0];
                const resumeData = latestResume.resumeData;

                // Serialize to strip Firestore specific types (Timestamps) that might cause issues
                let cleanResumeData;
                try {
                    cleanResumeData = JSON.parse(JSON.stringify(resumeData));
                } catch (e) {
                    console.error("[MatchPage] Serialization Failed:", e);
                    setError("Failed to serialize resume data.");
                    setLoading(false);
                    return;
                }

                const payload = {
                    jd: jd,
                    resumeData: cleanResumeData, // Use the clean version
                    type: 'match'
                };

                const payloadStr = JSON.stringify(payload);

                if (!cleanResumeData || Object.keys(cleanResumeData).length === 0) {
                    setError("Failed to verify resume data integrity.");
                    setLoading(false);
                    return;
                }

                const res = await fetch('/api/extension/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: payloadStr
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || `Analysis failed with status ${res.status}`);
                }

                const data = await res.json();
                setAnalysis(data);

            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to analyze matching. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        analyze();
    }, [user, currentJob]);

    if (!user) {
        return (
            <div className="p-8 text-center">
                <p>Please log in to view your match score.</p>
                <button
                    onClick={() => {
                        // Set redirect intent so ClientLogin redirects back here
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('redirectAfterLogin', '/extension/match');
                        }
                        router.push('/login');
                    }}
                    className="text-blue-600 font-bold mt-2 hover:underline"
                >
                    Login
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-gray-800">Analyzing Profile...</h3>
                <p className="text-sm text-gray-500 mt-2">Recruiter AI is reviewing your resume against the JD...</p>
                <div className="mt-8 space-y-2 w-full max-w-xs mx-auto">
                    <div className="h-2 bg-gray-100 rounded overflow-hidden">
                        <div className="h-full bg-blue-500 animate-progress origin-left"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                <p className="mb-4 text-gray-700">{error}</p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.push('/extension/builder')}
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

    // Determine color based on score
    const getScoreColor = (s) => {
        if (s >= 80) return "text-green-600 border-green-500 bg-green-50";
        if (s >= 50) return "text-yellow-600 border-yellow-500 bg-yellow-50";
        return "text-red-500 border-red-500 bg-red-50";
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Header / Score Section */}
            <div className="bg-white p-6 shadow-sm border-b border-gray-100 rounded-b-3xl mb-6">
                <div className="text-center">
                    <h2 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-4">ATS Match Integrity</h2>

                    <div className={`w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center mx-auto mb-4 relative ${getScoreColor(analysis.score)}`}>

                        <span className="text-5xl font-extrabold tracking-tighter">{analysis.score}%</span>
                        <span className="text-[10px] font-bold uppercase opacity-80 mt-1">Match Rate</span>
                    </div>


                    {analysis.salaryInsights && analysis.salaryInsights !== "N/A" && (
                        <div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-600 mb-4">
                            💰 Est. Salary: {analysis.salaryInsights}
                        </div>
                    )}

                    <div className="bg-blue-50/50 p-4 rounded-xl text-left border border-blue-100">
                        <h3 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                            <span className="text-lg">👨‍💻</span> Recruiter's Perspective
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed italic">
                            "{analysis.recruiterSummary || analysis.explanation}"
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-5">
                {/* 1. Critical Gaps - High Priority */}
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

                {/* 2. Quick Wins - Positive Action */}
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

                {/* 3. Keyword Analysis */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                        <CheckCircle2 className="text-green-500 w-5 h-5" />
                        Keyword Match
                    </h3>

                    <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Matched found</p>
                        <div className="flex flex-wrap gap-2">
                            {analysis.matchingKeywords.map(k => (
                                <span key={k} className="px-2.5 py-1.5 bg-green-50 text-green-700 text-xs rounded-md font-medium border border-green-100">
                                    {k}
                                </span>
                            ))}
                            {analysis.matchingKeywords.length === 0 && <span className="text-gray-400 text-sm">No direct keyword matches found.</span>}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Missing (Add these!)</p>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missingKeywords.map(k => (
                                <span key={k} className="px-2.5 py-1.5 bg-red-50 text-red-700 text-xs rounded-md font-medium border border-red-100">
                                    {k}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-10"></div>
        </div>
    );
}
