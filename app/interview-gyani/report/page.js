"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Trophy,
    Target,
    AlertTriangle,
    TrendingUp,
    ArrowRight,
    RefreshCcw,
    ShieldCheck,
    FileText,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

export default function InterviewReport() {
    const { user } = useAuth();
    const router = useRouter();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [setup, setSetup] = useState(null);

    useEffect(() => {
        const savedSetup = sessionStorage.getItem('interview_setup');
        const sessionHistory = sessionStorage.getItem('full_session');

        if (!savedSetup || !sessionHistory) {
            router.push('/interview-gyani/setup');
            return;
        }

        const parsedSetup = JSON.parse(savedSetup);
        const parsedHistory = JSON.parse(sessionHistory);
        setSetup(parsedSetup);
        generateReport(parsedSetup, parsedHistory);
    }, []);

    const generateReport = async (setupData, historyData) => {
        try {
            // Validate that there are actual answers from the user
            const userAnswers = historyData.filter(h => h.role === 'user' && h.content && h.content.trim().length > 0);
            const botQuestions = historyData.filter(h => h.role === 'bot' && h.content && h.content.trim().length > 0);

            if (userAnswers.length === 0) {
                // No answers provided - show error message
                toast.error("Cannot generate report: No answers were provided during the session.");
                setLoading(false);
                setReport({
                    error: true,
                    message: "No answers provided",
                    readinessScore: 0,
                    verdict: "Incomplete Session",
                    summary: "You didn't provide any answers during this interview session. Please complete at least one question to generate a readiness report.",
                    strengthAreas: [],
                    weakAreas: ["No answers were provided to evaluate"],
                    keyImprovements: ["Complete an interview session by answering at least one question"]
                });
                return;
            }

            if (userAnswers.length < botQuestions.length) {
                // Some questions unanswered - warn but still generate report
                console.warn(`Session incomplete: ${botQuestions.length} questions asked, ${userAnswers.length} answers provided`);
            }

            const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('current_session_id') : null;
            const sessionText = historyData
                .map(h => `${h.role === 'bot' ? 'Interviewer' : 'Candidate'}: ${h.content}`)
                .join('\n\n');

            const res = await fetch('/api/interview-gyani', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_summary',
                    jobRole: setupData.jobRole,
                    country: setupData.country,
                    fullSession: sessionText,
                    userId: user?.uid || (sessionId ? `guest_${sessionId}` : null),
                    sessionId: sessionId,
                    answerCount: userAnswers.length,
                    questionCount: botQuestions.length
                })
            });
            
            const data = await res.json();
            
            // Handle error responses (400 status for incomplete sessions)
            if (!res.ok || data.error === "INCOMPLETE_SESSION") {
                setReport({
                    error: true,
                    message: data.message || "Cannot generate report: No answers were provided during the session.",
                    readinessScore: 0,
                    verdict: "Incomplete Session",
                    summary: data.summary || "You didn't provide any answers during this interview session. Please complete at least one question to generate a readiness report.",
                    strengthAreas: [],
                    weakAreas: ["No answers were provided to evaluate"],
                    keyImprovements: ["Complete an interview session by answering at least one question"]
                });
                setLoading(false);
                return;
            }
            
            // Additional validation: Ensure score is not generated for empty sessions
            if (data.readinessScore && userAnswers.length === 0) {
                data.readinessScore = 0;
                data.verdict = "Incomplete Session";
                data.summary = "No answers were provided during this session. Please complete at least one question to get a proper evaluation.";
                data.error = true;
            }
            
            // Validate score is reasonable - if no answers but score > 0, force to 0
            if (userAnswers.length === 0 && data.readinessScore > 0) {
                data.readinessScore = 0;
                data.verdict = "Incomplete Session";
                data.error = true;
            }
            
            setReport(data);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to generate readiness report.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Target className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your performance...</h2>
                <p className="text-slate-500 max-w-xs mx-auto italic leading-relaxed">
                    Comparing your answers against global hiring standards for <span className="text-slate-900 font-bold underline decoration-blue-500/30">{setup?.jobRole}</span>.
                </p>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <p>Something went wrong. <Link href="/interview-gyani" className="text-blue-600 underline">Try again</Link></p>
            </div>
        );
    }

    // Handle error/incomplete session
    if (report.error || report.readinessScore === 0 && report.verdict === "Incomplete Session") {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 p-8 sm:p-12 text-center">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Incomplete Interview Session</h2>
                        <p className="text-slate-600 mb-8 leading-relaxed max-w-md mx-auto">
                            {report.message || report.summary || "You didn't provide any answers during this interview session. Please complete at least one question to generate a readiness report."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/interview-gyani/setup"
                                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-2 group"
                            >
                                Start New Session
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/interview-gyani"
                                className="px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black hover:bg-slate-200 transition-all"
                            >
                                Back to Interview Gyani
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getVerdictStyles = (verdict) => {
        if (verdict?.includes('High Chance')) return 'bg-green-100 text-green-700 border-green-200';
        if (verdict?.includes('Needs Practice')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Header Navigation */}
                <div className="flex justify-between items-center mb-10">
                    <Link href="/interview-gyani" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> Start New Session
                    </Link>
                    <div className="flex items-center gap-2 text-slate-900 font-black text-xl italic tracking-tighter">
                        <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg shadow-lg not-italic">RG</div>
                        ExpertResume
                    </div>
                </div>

                {/* Readiness Score Card */}
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden mb-10 border border-slate-100 relative">
                    <div className="absolute top-0 right-0 p-4 sm:p-8">
                        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 text-white rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase">
                            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" /> AI Verified
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5">
                        <div className="md:col-span-2 bg-slate-900 text-white p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                            <h3 className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] mb-8">Readiness Score</h3>
                            <div className="relative inline-flex items-center justify-center mb-6">
                                <svg className="w-40 h-40 transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-slate-800"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * report.readinessScore) / 100}
                                        className="text-blue-500 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-5xl font-black italic tracking-tighter">{report.readinessScore}</span>
                            </div>
                            <div className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${getVerdictStyles(report.verdict)}`}>
                                {report.verdict}
                            </div>
                        </div>

                        <div className="md:col-span-3 p-8 sm:p-12">
                            <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">Your Performance Summary</h2>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 italic">
                                "{report.summary}"
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Role</p>
                                        <p className="text-sm font-bold text-slate-900">{setup?.jobRole}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Standards</p>
                                        <p className="text-sm font-bold text-slate-900">{setup?.country}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breakdown Grid */}
                <div className="grid md:grid-cols-2 gap-10 mb-12">
                    {/* Strengths */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-50">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tighter italic">Top Strengths</h4>
                        <ul className="space-y-4">
                            {report.strengthAreas.map((s, i) => (
                                <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-50">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tighter italic">Critical Gaps</h4>
                        <ul className="space-y-4">
                            {report.weakAreas.map((w, i) => (
                                <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Action Plan */}
                <div className="bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <Target className="w-32 h-32" />
                    </div>
                    <div className="relative">
                        <h3 className="text-2xl font-black mb-8 uppercase tracking-tight italic">Your Improvement Checklist</h3>
                        <div className="space-y-6 mb-10">
                            {report.keyImprovements.map((imp, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <p className="text-slate-300 font-medium leading-relaxed">{imp}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/resume-builder"
                                className="flex-1 px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-center hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group"
                            >
                                <FileText className="w-5 h-5" />
                                Optimize My Resume Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button
                                onClick={() => router.push('/interview-gyani/setup')}
                                className="flex-1 px-8 py-5 bg-white/10 text-white rounded-2xl font-black text-center hover:bg-white/20 transition-all border border-white/20"
                            >
                                Practice Again
                            </button>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    This report is generated by AI simulation. <br />
                    Hiring decisions are made by humans and vary by company.
                </p>
            </div>
        </div>
    );
}
