"use client";
import Link from 'next/link';
import {
    Target,
    Zap,
    MessageSquare,
    ShieldCheck,
    ArrowRight,
    Play,
    CheckCircle,
    Star
} from 'lucide-react';
import { motion } from "framer-motion";
import LiveDemoWidget from "./LiveDemoWidget";

// Helper to parse **bold** text
const RichText = ({ text, className = "" }) => {
    if (!text) return null;
    const key = text.substring(0, 10); // unstable key but fine for static content
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={key + i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </span>
    );
};

export default function InterviewSEOContent({ content }) {
    const {
        title,
        hookTitle,
        hookSubtitle,
        problemTitle,
        problemDescription,
        solutionTitle,
        solutionDescription,
        features,
        strategyGuide, // New
        demoImage,
        faq,
        pricing,
        context
    } = content;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 1. Hook Header (Fear/Urgency Based) */}
            <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full mb-8 border border-red-100 font-bold animate-pulse">
                            <Target className="w-4 h-4" />
                            <span className="text-xs tracking-widest uppercase">Don't Fail Your Next Interview</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                            {hookTitle}
                        </h1>
                        <p className="text-xl sm:text-2xl text-slate-600 mb-10 leading-relaxed font-light">
                            <RichText text={hookSubtitle} />
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/interview-gyani/setup"
                                className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Practice Now (Free)
                            </Link>
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>No account needed for first try</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-3xl"></div>
                    <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-3xl"></div>
                </div>
            </section>

            {/* 2. Problem Section */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 leading-tight text-white">{problemTitle}</h2>
                            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                <RichText text={problemDescription} className="text-slate-400" />
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-red-400 font-bold">✕</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">Generic Practice Doesn't Work</h4>
                                        <p className="text-slate-400 text-sm">Reading static "Top 10 Questions" lists won't prepare you for follow-up curveballs.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-red-400 font-bold">✕</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">Zero Feedback Loop</h4>
                                        <p className="text-slate-400 text-sm">Practicing in the mirror feels good, but you can't hear your own filler words or weak structures.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contextual Image Card */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 opacity-20 blur-lg"></div>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
                                <img
                                    src={context?.image || "/images/resume-writing-ai.jpg"}
                                    alt="Interview preparation"
                                    className="w-full h-auto object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent p-6">
                                    <p className="text-orange-300 font-mono text-xs uppercase tracking-widest mb-1">Reality Check</p>
                                    <p className="text-white font-medium italic">"Tell me about a time you failed."</p>
                                    <div className="flex items-center gap-2 mt-4 text-xs text-red-300">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                        You (Panic): "Umm, actually I work really hard..."
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2.5 New Strategy / Playbook Section (Thick Content) */}
            {strategyGuide && (
                <section className="py-20 bg-slate-50 relative overflow-hidden">
                    {/* Tech Background Pattern */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <span className="text-blue-600 font-mono text-xs font-bold tracking-widest uppercase mb-2 block">
                                &lt;The Playbook /&gt;
                            </span>
                            <h2 className="text-3xl font-bold text-slate-900">{strategyGuide.title}</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {strategyGuide.content.map((item, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <span className="font-mono text-blue-600 font-bold text-xl">{String(idx + 1).padStart(2, '0')}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-3">{item.heading}</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        <RichText text={item.text} />
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Solution & Demo Widget */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-2 block">The InterviewGyani Advantage</span>
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">{solutionTitle}</h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            <RichText text={solutionDescription} />
                        </p>
                    </div>

                    {/* Interactive Widget */}
                    <LiveDemoWidget
                        role={context?.role || "Candidate"}
                        country={context?.country || "Global"}
                    />
                </div>
            </section>

            {/* 4. Social Proof & FAQ */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-12">Common Questions</h2>
                    <div className="space-y-4 text-left">
                        {faq.map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-lg mb-2 text-slate-900">{item.q}</h3>
                                <p className="text-slate-600"><RichText text={item.a} /></p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Final CTA */}
            <section className="py-20 bg-blue-900 text-white text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-6">Ready to stop guessing?</h2>
                    <p className="text-xl text-blue-200 mb-8">Join thousands of candidates who walked into their interviews knowing exactly what to say.</p>
                    <Link
                        href="/interview-gyani/setup"
                        className="inline-block px-12 py-5 bg-white text-blue-900 rounded-full font-bold text-xl hover:bg-blue-50 transition-all shadow-xl hover:scale-105"
                    >
                        Start Free Session
                    </Link>
                    <p className="mt-6 text-sm text-blue-300 opacity-80">
                        {pricing ? `${pricing.display}/${pricing.period} for full access` : 'No credit card required • Instant analysis'}
                    </p>
                </div>
            </section>
        </div>
    );
}
