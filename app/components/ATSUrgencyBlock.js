"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function ATSUrgencyBlock({ role }) {
    return (
        <div className="w-full bg-red-50 border-y border-red-100 p-4 mb-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">

                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm md:text-base">
                            Most {role.job_title} resumes fail the ATS scan.
                        </p>
                        <p className="text-xs md:text-sm text-red-700 font-medium">
                            Don't apply blindly. Check your score first.
                        </p>
                    </div>
                </div>

                <Link
                    href="/ats-score-checker"
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2 whitespace-nowrap"
                >
                    Check My Resume Score
                    <ArrowRight className="w-4 h-4" />
                </Link>

            </div>
        </div>
    );
}
