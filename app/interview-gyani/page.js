"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Zap,
    Target,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Award,
    MessageSquare,
    ShieldCheck,
    BrainCircuit,
    Lock,
    Crown,
    Sparkles
} from 'lucide-react';

export default function InterviewGyaniLanding() {
    const { user, loading, isInterviewPremium } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent"></div>
            </div>
        );
    }

    const hasAccess = isInterviewPremium;

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 sm:p-12 text-center text-white shadow-2xl overflow-hidden relative">
                    {/* Background Glow */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px]"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/30 rounded-full blur-[80px]"></div>

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full mb-8 border border-blue-500/30">
                            <BrainCircuit className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">Interview Pro Access</span>
                        </div>

                        <div className="mb-8">
                            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
                                <Lock className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
                                Unlock Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 italic">Personality-Aware</span> Mock Interviews
                            </h2>
                            <p className="text-blue-100/70 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                                Interview Simulation is now exclusively available for our <span className="text-white font-bold">Professional Bundle</span> users. Get unlimited mock interviews tailored to your skills and personality.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                                <p className="text-xs font-bold text-white uppercase tracking-wider">Unlimited</p>
                                <p className="text-[10px] text-blue-200/60 uppercase">Mock Sessions</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <Sparkles className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                <p className="text-xs font-bold text-white uppercase tracking-wider">AI Feedback</p>
                                <p className="text-[10px] text-blue-200/60 uppercase">Brutally Honest</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <Zap className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                <p className="text-xs font-bold text-white uppercase tracking-wider">Ready Score</p>
                                <p className="text-[10px] text-blue-200/60 uppercase">Hireability Index</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/checkout?billingCycle=quarterly&step=1"
                                className="px-10 py-5 bg-white text-blue-900 rounded-full font-black text-lg hover:bg-white/90 transition-all shadow-xl hover:shadow-white/10 flex items-center justify-center gap-2 group"
                            >
                                Upgrade to Expert Plan
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/dashboard"
                                className="px-10 py-5 bg-white/5 text-white/70 hover:text-white border border-white/20 rounded-full font-bold transition-all flex items-center justify-center"
                            >
                                Back to Dashboard
                            </Link>
                        </div>

                        <p className="mt-8 text-blue-200/40 text-xs font-medium italic">
                            Already purchased? Make sure you're logged into the correct account.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white pt-16 pb-20 lg:pt-24 lg:pb-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full mb-8 border border-blue-100 animate-fade-in">
                            <BrainCircuit className="w-5 h-5" />
                            <span className="text-sm font-semibold tracking-wide uppercase">AI Interview Simulation</span>
                        </div>

                        <h1 className="text-3xl sm:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                            Practice Your Interview Before <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                It Costs You the Job
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Simulate real interviews, get honest feedback, and walk in
                            confident — <span className="text-slate-900 font-semibold underline decoration-blue-500/30">not guessing</span>.
                            Tailored for US, UK, Canada, and US hiring standards.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/interview-gyani/setup"
                                className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-200 flex items-center justify-center gap-2 group"
                            >
                                Start Mock Interview
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="w-full sm:w-auto px-10 py-5 bg-white text-slate-600 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
                            >
                                See How It Works
                            </Link>
                        </div>

                        {/* Trust Indicator */}
                        <div className="mt-16 pt-8 border-t border-slate-100">
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
                                Trusted by professionals interviewing at
                            </p>
                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
                                <span className="text-xl font-bold">Google</span>
                                <span className="text-xl font-bold">Amazon</span>
                                <span className="text-xl font-bold">TCS</span>
                                <span className="text-xl font-bold">Microsoft</span>
                                <span className="text-xl font-bold">HDFC Bank</span>
                                <span className="text-xl font-bold">Meta</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pain-Driven Copy Section */}
            <section className="py-20 bg-slate-900 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-8 leading-tight">
                                Most candidates don’t fail interviews because they lack skills.
                            </h2>
                            <p className="text-xl text-slate-400 mb-8 leading-relaxed italic">
                                They fail because they don’t know <strong>how they sound to an interviewer.</strong>
                            </p>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="bg-red-500/10 p-3 rounded-lg flex-shrink-0">
                                        <Target className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Unseen Red Flags</h3>
                                        <p className="text-slate-400">Identify the subtle mistakes in your answers that trigger "Not a Culture Fit" or "Skill Gap" rejections.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-blue-500/10 p-3 rounded-lg flex-shrink-0">
                                        <TrendingUp className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Real Confidence</h3>
                                        <p className="text-slate-400">Stop memorizing scripts. Practice responding to curveballs in a safe, AI-powered environment.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full"></div>
                            <div className="relative bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center italic font-bold">AI</div>
                                    <div>
                                        <p className="text-sm text-slate-400">Senior Interviewer Feedback</p>
                                        <p className="font-bold">Honest, Brutal, Constructive.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                                        <p className="text-red-400 text-sm font-bold mb-2">Recruiter Warning:</p>
                                        <p className="text-slate-300 text-sm italic">"Your answer for the project challenge was too vague on technical metrics. Recruiters at this level expect specific ROI or data-backed results."</p>
                                    </div>
                                    <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                                        <p className="text-green-400 text-sm font-bold mb-2">Improved Version:</p>
                                        <p className="text-slate-300 text-sm">"Instead of saying 'I helped the team', say: 'I implemented a new CI/CD workflow that reduced deployment time by 40%...'"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Grid */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need to Ace the Real Thing</h2>
                        <p className="text-xl text-slate-600">Simulate the real pressure, get professional insights.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <div className="p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                            <Award className="w-12 h-12 text-blue-600 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Role-Specific Practice</h3>
                            <p className="text-slate-600">Tailored questions for Tech, Marketing, Finance, and more, matching your exact experience level.</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                            <Zap className="w-12 h-12 text-blue-600 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Resume-Aware Logic</h3>
                            <p className="text-slate-600 font-medium">Killer Feature: <span className="text-slate-900">The AI reads your resume and asks deep-dive questions about your actual claims.</span></p>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                            <MessageSquare className="w-12 h-12 text-blue-600 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Dynamic Follow-ups</h3>
                            <p className="text-slate-600">The AI interviewer doesn't just read a list. It asks follow-up questions based on what you just said.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="relative">
                            <h2 className="text-2xl sm:text-5xl font-bold mb-6 italic leading-tight">"Cheaper than one missed opportunity."</h2>
                            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                                Join thousands of job seekers using Interview Simulation to turn rejections into offers.
                                Turn your interview preparation into an offer today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/interview-gyani/setup"
                                    className="px-12 py-5 bg-white text-blue-700 rounded-full font-bold text-xl hover:bg-blue-50 transition-all shadow-lg"
                                >
                                    Start My Practice Interview
                                </Link>
                            </div>
                            <div className="mt-8 flex items-center justify-center gap-2 text-blue-100">
                                <ShieldCheck className="w-5 h-5" />
                                <span className="text-sm">Global Hiring Standard Verified (2026)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
