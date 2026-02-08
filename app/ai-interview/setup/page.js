"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Briefcase,
    MapPin,
    UserCircle,
    MessageSquare,
    ArrowRight,
    ChevronLeft
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function InterviewSetup() {
    const { user, loading, isInterviewPremium } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        jobRole: '',
        experienceLevel: '3-6',
        country: 'Global / US',
        interviewType: 'Behavioral'
    });

    useEffect(() => {
        if (!loading && !isInterviewPremium) {
            router.push('/ai-interview');
        }
    }, [loading, isInterviewPremium, router]);

    if (loading || !isInterviewPremium) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    const experienceOptions = [
        { label: '0-2 Years (Junior / Entry-Level)', value: '0-2' },
        { label: '3-6 Years (Mid-Career)', value: '3-6' },
        { label: '7+ Years (Senior / Lead)', value: '7+' }
    ];

    const countryOptions = [
        { label: 'Global / US Standard', value: 'Global / US' },
        { label: 'India MNC / Startup', value: 'India' },
        { label: 'UK / European Market', value: 'UK / Europe' }
    ];

    const typeOptions = [
        { label: 'General / Mixed', value: 'General' },
        { label: 'Behavioral (STAR Method)', value: 'Behavioral' },
        { label: 'Technical / Skill-Based', value: 'Technical' },
        { label: 'Leadership / Managerial', value: 'Leadership' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Save to session storage or state management
        sessionStorage.setItem('interview_setup', JSON.stringify(formData));
        router.push('/ai-interview/session');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between">
                <Link href="/ai-interview" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium text-sm">Back</span>
                </Link>
                <div className="text-center">
                    <span className="text-slate-900 font-bold text-lg">Setup Your Interview</span>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <main className="flex-1 flex items-center justify-center p-4 sm:p-12">
                <div className="max-w-xl w-full bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl p-5 sm:p-12 border border-slate-100">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Let's Prepare.</h1>
                    <p className="text-slate-500 mb-10 text-center">Tell us about the role you're interviewing for.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Job Role */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                TARGET JOB ROLE
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Senior Product Manager"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900"
                                value={formData.jobRole}
                                onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {/* Experience */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <UserCircle className="w-4 h-4 text-blue-600" />
                                    EXPERIENCE
                                </label>
                                <select
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900"
                                    value={formData.experienceLevel}
                                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                                >
                                    {experienceOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Country */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    COUNTRY STANDARDS
                                </label>
                                <select
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                >
                                    {countryOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Interview Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                INTERVIEW STYLE
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {typeOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, interviewType: opt.value })}
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${formData.interviewType === opt.value
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group mt-8"
                        >
                            Start Practice Session
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
                        By starting, you agree to generate AI mock interviews. <br />
                        No real recruiter is on the other side of this screen.
                    </p>
                </div>
            </main>
        </div>
    );
}
