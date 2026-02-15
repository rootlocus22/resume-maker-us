"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Lock,
    Download,
    TrendingUp,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { getEffectivePricing, formatPrice } from '../lib/globalPricing';

export default function AuditReportHero({ role }) {
    const [pricing, setPricing] = useState({ oneDay: 9900, currency: 'INR' });
    const [loading, setLoading] = useState(true);

    // Load pricing
    useEffect(() => {
        // Get pricing - default to INR if loading
        const prices = getEffectivePricing('INR');
        setPricing(prices);
        setLoading(false);
    }, []);

    // Format price helper
    const displayPrice = (amount) => {
        return formatPrice(amount, pricing.currency);
    };

    // Get top 3 hard skills to show as "Missing" to create the gap
    const missingSkills = role.hard_skills ? role.hard_skills.slice(0, 3) : ['Core Skills', 'Keywords', 'Formatting'];
    const presentSkills = role.hard_skills ? role.hard_skills.slice(3, 5) : ['Basic Info', 'Education'];

    return (
        <section className="relative pt-24 pb-16 overflow-hidden bg-slate-50">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-50 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-50 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 opacity-60"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: The "Fear/Opportunity" Hook */}
                    <div className="text-left">
                        <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full mb-6 border border-red-200 shadow-sm animate-pulse">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-bold text-sm">Action Required: Low Match Score</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                            Targeting <span className="text-accent-600">{role.job_title}?</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                            <strong>90% of applicants</strong> get rejected by the ATS before a human ever sees their resume.
                            Don't use a generic format. Use the <strong>{role.job_title} Interview-Cracker Template</strong>.
                        </p>

                        {/* Social Proof Stack */}
                        <div className="flex items-center gap-4 mb-10 bg-white p-4 rounded-xl shadow-sm border border-slate-100 w-fit">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden`}>
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 13}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <p className="font-bold text-slate-800">120+ Students</p>
                                <p className="text-slate-500">optimized for {role.job_title} today</p>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase mb-4">Trusted knowledge from</p>
                            <div className="flex gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                                {/* Logos placeholder text for now, could be images */}
                                <span className="font-bold text-xl text-slate-600">Indeed</span>
                                <span className="font-bold text-xl text-slate-600">LinkedIn</span>
                                <span className="font-bold text-xl text-slate-600">Glassdoor</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: The "Audit Report" UI (The Product) */}
                    <div className="relative">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all hover:-translate-y-1 duration-300">

                            {/* Header pretending to be an analysis tool */}
                            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-green-400" />
                                    <span className="font-bold tracking-wide">RESUME AUDIT: {role.job_title.toUpperCase()}</span>
                                </div>
                                <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded">ID: #8821X</span>
                            </div>

                            <div className="p-6 md:p-8">
                                {/* The Score Gap */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-slate-500 font-medium">Average Applicant Score</span>
                                        <span className="text-red-500 font-bold text-xl">42%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
                                        <div className="bg-red-500 h-3 rounded-full w-[42%]"></div>
                                    </div>

                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-slate-900 font-bold">Recommended Target</span>
                                        <span className="text-green-600 font-bold text-xl">95%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3">
                                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full w-[95%] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    </div>
                                </div>

                                {/* The Keyword Gap Analysis */}
                                <div className="mb-8 bg-slate-50 rounded-xl p-5 border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Mandatory Keyword Check</h3>
                                    <div className="space-y-3">
                                        {/* Missing Skills */}
                                        {missingSkills.map((skill, i) => (
                                            <div key={i} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                    <span className="text-slate-700 font-medium">{skill}</span>
                                                </div>
                                                <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">MISSING</span>
                                            </div>
                                        ))}

                                        {/* Present (Simulated) */}
                                        <div className="flex items-center gap-3 opacity-50">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span className="text-slate-700">Contact Information</span>
                                        </div>
                                    </div>
                                </div>

                                {/* The Solution (Product) */}
                                <div className="bg-accent-50 rounded-xl p-6 border border-accent-100 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                                        HIGH INTENT
                                    </div>

                                    <h3 className="font-bold text-lg text-primary mb-2">{role.job_title} Interview-Cracker</h3>
                                    <p className="text-sm text-accent-600 mb-6">Includes {role.hard_skills?.length || 10}+ ATS keywords & pre-written bullets.</p>

                                    <Link href="/resume-builder?template=ats_modern_executive" className="block w-full bg-accent hover:bg-accent-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-accent-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                                        <span>Unlock Template & Fix Gaps</span>
                                        <span className="bg-accent-800 text-accent-100 px-2 py-0.5 rounded text-sm">
                                            {displayPrice(pricing.oneDay)}
                                        </span>
                                    </Link>

                                    <p className="text-xs text-accent-400 mt-3 flex items-center justify-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        <span>100% Money Back Guarantee</span>
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Floating Pulse Element/Badge */}
                        <div className="absolute -top-6 -right-6 pointer-events-none">
                            <div className="relative">
                                <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
                                <div className="bg-yellow-400 text-yellow-900 font-black text-xs px-4 py-2 rounded-full shadow-lg transform rotate-12 border-2 border-white">
                                    POPULAR
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
