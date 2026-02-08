"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Lightbulb, Send, Copy, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AuthProtection from "../../components/AuthProtection";

export default function JobStandOutPage() {
    return (
        <AuthProtection>
            <JobStandOutContent />
        </AuthProtection>
    );
}

function JobStandOutContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function generateTips() {
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

            // Fallback to URL params
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
                setLoading(false);
                return;
            }

            try {
                // Generate cache key using safer approach
                const hashString = `${jd.jobTitle}-${jd.company}-${jd.jobDescription.substring(0, 100)}`;
                let cacheKey = '';
                for (let i = 0; i < hashString.length; i++) {
                    cacheKey += hashString.charCodeAt(i).toString(36);
                }
                cacheKey = cacheKey.substring(0, 50);

                // Check Firestore cache first
                const { doc, getDoc, setDoc } = await import("firebase/firestore");
                const { db } = await import("../../lib/firebase");
                const cacheRef = doc(db, "users", user.uid, "jobAnalysisCache", cacheKey);
                const cacheDoc = await getDoc(cacheRef);

                if (cacheDoc.exists()) {
                    const cachedData = cacheDoc.data();
                    const cacheAge = Date.now() - new Date(cachedData.createdAt).getTime();
                    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

                    if (cacheAge < maxAge && cachedData.standOutTips) {
                        console.log("✅ Using cached stand-out tips (age:", Math.floor(cacheAge / (1000 * 60 * 60)), "hours)");
                        setData({
                            ...cachedData.standOutTips,
                            _isCached: true,
                            _cacheAge: Math.floor(cacheAge / (1000 * 60 * 60))
                        });
                        setLoading(false);
                        return;
                    }
                }

                // Cache miss - fetch from API
                console.log("🔄 Generating fresh stand-out tips...");

                const res = await fetch('/api/extension/analyze', {
                    method: 'POST',
                    body: JSON.stringify({
                        jd: {
                            title: jd.jobTitle,
                            company: jd.company,
                            location: jd.location,
                            description: jd.jobDescription
                        },
                        resumeData: { skills: [] },
                        type: 'stand-out'
                    })
                });

                if (!res.ok) throw new Error("Failed to generate tips");

                const result = await res.json();

                // Save to cache
                await setDoc(cacheRef, {
                    standOutTips: result,
                    jobTitle: jd.jobTitle,
                    company: jd.company,
                    createdAt: new Date().toISOString(),
                    cacheKey: cacheKey
                }, { merge: true });

                console.log("💾 Saved stand-out tips to cache");

                setData({ ...result, _isCached: false });

            } catch (err) {
                console.error(err);
                toast.error("Failed to generate tips.");
            } finally {
                setLoading(false);
            }
        }

        generateTips();
    }, [user, searchParams]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    // Show loading first - before checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex flex-col items-center justify-center p-6 text-center">
                {/* Animated Lightbulb */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-yellow-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full p-6 shadow-2xl">
                        <Lightbulb className="w-12 h-12 text-yellow-300 animate-pulse" />
                    </div>
                </div>

                {/* Main Message */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Crafting Your Strategy...</h3>
                <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
                    Our AI is analyzing top 1% tactics used by successful candidates for similar roles.
                </p>

                {/* Progress Steps */}
                <div className="space-y-3 w-full max-w-sm">
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm animate-pulse">
                        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Reading job requirements...</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-3 rounded-lg shadow-sm opacity-50">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Generating unique insights...</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-3 rounded-lg shadow-sm opacity-50">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Send className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Drafting cold email...</span>
                    </div>
                </div>

                {/* Encouraging Message */}
                <div className="mt-8 bg-violet-50 border border-violet-100 rounded-lg p-4 max-w-md">
                    <p className="text-xs text-violet-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Standing out is what gets you noticed. Let's make you unforgettable!</span>
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                <p className="text-gray-600 mb-4">Please log in to unlock AI career coaching.</p>
                <button onClick={() => router.push('/login')} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">
                    Login
                </button>
            </div>
        );
    }

    // Don't render main content until data is loaded
    if (!data) {
        return null;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Back Button */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/80 hover:text-white font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Jobs
                </button>
            </div>

            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 pb-12 text-white">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Lightbulb className="text-yellow-300" />
                    Stand Out Strategy
                </h1>
                <p className="text-indigo-100 text-sm mt-1">
                    Top 1% tactics to get noticed for this role.
                </p>

                {/* Cache Indicator */}
                {data?._isCached && (
                    <div className="mt-3 inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold">
                        ⚡ Cached ({data._cacheAge}h ago)
                    </div>
                )}
            </div>

            <div className="px-4 -mt-8 space-y-6">
                {/* tips */}
                <div className="space-y-3">
                    {data.tips.map((tip, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-start gap-2">
                                <span className="bg-violet-100 text-violet-700 w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{idx + 1}</span>
                                {tip.title}
                            </h3>
                            <p className="text-gray-600 text-xs leading-relaxed ml-7">
                                {tip.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Cold Email */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            <Send size={14} className="text-green-400" />
                            Cold Email Draft
                        </h3>
                        <button
                            onClick={() => copyToClipboard(`Subject: ${data.coldEmail.subject}\n\n${data.coldEmail.body}`)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Copy Email"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="border-b border-gray-100 pb-2">
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Subject:</span>
                            <p className="text-gray-800 font-medium text-sm mt-1">{data.coldEmail.subject}</p>
                        </div>
                        <div>
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Body:</span>
                            <div className="text-gray-600 text-sm mt-2 whitespace-pre-wrap leading-relaxed font-mono bg-gray-50 p-3 rounded-lg">
                                {data.coldEmail.body}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
