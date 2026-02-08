// EnglishGyani ATS Scorecard Integration Widget
// Shows communication impact warning in ATS Score results

"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';

export default function EnglishGyaniATSWidget() {
    return (
        <div className="mt-8 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                </div>

                <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row items-center gap-2 mb-2 sm:mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                            Enhance Your Communication
                        </h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border border-blue-200">
                            Recommended
                        </span>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                            Strong English communication is often the deciding factor for global roles.
                            <span className="hidden sm:inline"><br /></span>
                            <span className="block mt-1">
                                EnglishGyani helps you master professional business English, so you can speak with confidence in interviews.
                            </span>
                        </p>
                    </div>

                    <div className="bg-white/60 p-3 sm:p-4 rounded-lg border border-blue-200/50 mb-4 text-left shadow-sm">
                        <p className="text-sm text-gray-700">
                            <span className="font-bold text-blue-700 block sm:inline mb-1 sm:mb-0">Top Tip: </span>
                            Candidates with clear, assertive communication are <span className="font-bold underline decoration-blue-300 decoration-2">3x more likely</span> to be hired.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="https://www.englishgyani.com/?source=expertresume&medium=interview_prep&campaign=tone_improvement"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Improve Professional English</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
