// EnglishGyani Post-Download Confidence Booster Widget
// Appears after user downloads their resume PDF

"use client";

import React from 'react';
import Link from 'next/link';
import { Award, ArrowRight, MessageCircle } from 'lucide-react';

export default function EnglishGyaniPostDownloadWidget() {
    return (
        <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Your Resume looks 10/10. But is your Speaking ready?
                    </h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        You've passed the ATS. Now don't let a 'broken' sentence stop you from clearing the HR round.
                    </p>

                    <Link
                        href="https://www.englishgyani.com/?source=expertresume&medium=interview_prep&campaign=speaking_practice"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Practice Interview English (Free)
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
