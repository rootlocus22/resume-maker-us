"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, Zap, Star, FileText, Search, Target, PenTool, Crown, Trophy, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JobSearchPromoModal({ isOpen, onClose, fromSource = "upload", jobTitle = "" }) {
    const router = useRouter();

    // Source-specific Headlines
    const contextMap = {
        upload: { title: "Resume Ready!", subtitle: "Next Step: Find matching jobs" },
        ats: { title: "Analysis Done!", subtitle: "Next Step: See where you rank" },
        default: { title: "Boost Your Career", subtitle: "Complete the success cycle" }
    };
    const { title, subtitle } = contextMap[fromSource] || contextMap.default;

    const handleCtaClick = () => {
        onClose();
        let url = '/jobs-nearby';
        if (jobTitle) {
            const encodedTitle = encodeURIComponent(jobTitle.trim());
            url += `?q=${encodedTitle}&auto=true`;
        }
        router.push(url);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative"
                    >
                        {/* Closing X */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors z-20"
                        >
                            <X size={20} />
                        </button>

                        {/* 1. Header Section */}
                        <div className="pt-8 pb-4 px-8 text-center bg-gradient-to-b from-accent-50 to-white">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
                            <p className="text-accent font-medium">{subtitle}</p>
                        </div>

                        {/* 2. Visual Cycle Diagram */}
                        <div className="px-6 py-2">
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                {/* Dotted Line Path */}
                                <div className="absolute top-1/2 left-4 right-4 h-0.5 border-t-2 border-dashed border-gray-200 -z-10"></div>

                                <div className="flex justify-between items-center relative z-10">
                                    {/* Step 1: Resume (Completed) */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            <FileText size={18} />
                                        </div>
                                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Resume</span>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight size={16} className="text-gray-300" />

                                    {/* Step 2: Search (Active/Next) */}
                                    <div className="flex flex-col items-center gap-2 relative">
                                        <div className="absolute -top-8 animate-bounce">
                                            <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">You're Here</span>
                                        </div>
                                        <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center border-4 border-accent-100 shadow-md ring-2 ring-accent ring-offset-2">
                                            <Search size={22} />
                                        </div>
                                        <span className="text-xs font-bold text-accent-700 uppercase tracking-wide">Job Search</span>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight size={16} className="text-gray-300" />

                                    {/* Step 3: Optimize */}
                                    <div className="flex flex-col items-center gap-2 opacity-60">
                                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            <Target size={18} />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Optimize</span>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight size={16} className="text-gray-300" />

                                    {/* Step 4: Apply */}
                                    <div className="flex flex-col items-center gap-2 opacity-60">
                                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            <Trophy size={18} />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Success</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Value Props Breakdown */}
                        <div className="px-8 py-4 space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Unlock the full AI advantage:</h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                    <Search className="w-4 h-4 text-accent mt-0.5" />
                                    <div>
                                        <span className="block text-xs font-bold text-gray-800">Smart Search</span>
                                        <span className="block text-[10px] text-gray-500">Auto-fill query from resume</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                    <Target className="w-4 h-4 text-purple-600 mt-0.5" />
                                    <div>
                                        <span className="block text-xs font-bold text-gray-800">Match Score</span>
                                        <span className="block text-[10px] text-gray-500">Check eligibility instantly</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                    <PenTool className="w-4 h-4 text-green-600 mt-0.5" />
                                    <div>
                                        <span className="block text-xs font-bold text-gray-800">Tailor CV</span>
                                        <span className="block text-[10px] text-gray-500">Customize for every job</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                    <Crown className="w-4 h-4 text-orange-600 mt-0.5" />
                                    <div>
                                        <span className="block text-xs font-bold text-gray-800">Stand Out</span>
                                        <span className="block text-[10px] text-gray-500">Top candidate analysis</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 italic text-center mt-2">
                                "Candidates who tailor their resume get 3x more interviews."
                            </p>
                        </div>

                        {/* 4. Action Buttons */}
                        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50">
                            <button
                                onClick={onClose}
                                className="px-5 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleCtaClick}
                                className="flex-1 py-3 px-4 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                <span>Find {jobTitle || "Matches"} Jobs Now</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
