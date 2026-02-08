"use client";
import Image from "next/image";
import {
    MapPin,
    Building2,
    FileText,
    PenTool,
    Target,
    Sparkles,
    Lock,
    Crown,
    X,
    Clock
} from "lucide-react";
import Link from "next/link";

export default function UnifiedJobCard({ job, isPremium }) {
    // Format date relative
    const postedDate = job.job_posted_at_datetime_utc
        ? new Date(job.job_posted_at_datetime_utc)
        : new Date();

    // Calculate days ago
    const diffDays = Math.floor((new Date() - postedDate) / (1000 * 60 * 60 * 24));
    const timeAgo = diffDays === 0 ? "Just now" : diffDays === 1 ? "1 day ago" : `${diffDays} days ago`; // LinkedIn style: "2 days ago"

    // Insight Text (Simulating LinkedIn's "Be an early applicant")
    const isEarly = diffDays <= 2;
    const insightText = isEarly ? "Be an early applicant" : `${Math.floor(Math.random() * 50) + 10} applicants`;

    // LinkedIn-Style Action Item (Ghost Button)
    const ActionItem = ({ icon: Icon, label, href, locked = false, highlight = false }) => {
        if (locked && !isPremium) {
            return (
                <Link
                    href="/checkout?billingCycle=quarterly&step=1"
                    className="flex flex-col items-center justify-center gap-1 group cursor-pointer text-gray-400 p-2 rounded hover:bg-yellow-50 hover:text-yellow-700 transition-all w-full relative"
                >
                    <div className="relative">
                        <Icon size={20} />
                        <Lock size={10} className="absolute -top-1 -right-1 text-amber-500" />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-none">{label}</span>
                </Link>
            )
        }
        return (
            <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded hover:bg-gray-100 transition-colors w-full group ${highlight ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
                <Icon size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium text-center leading-none">{label}</span>
            </Link>
        )
    };

    return (
        <div className="bg-white px-4 py-4 md:px-6 md:py-5 border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors group relative">

            {/* Dismiss Button (Visual Only for now) */}
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                <X size={16} />
            </button>

            <div className="flex items-start gap-3 md:gap-4">
                {/* Logo - LinkedIn Square Style */}
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white flex-shrink-0 flex items-center justify-center border border-gray-100 shadow-sm p-1 mt-1">
                    {job.employer_logo ? (
                        <Image
                            src={job.employer_logo}
                            alt={job.employer_name}
                            width={48}
                            height={48}
                            className="object-contain max-h-full max-w-full"
                        />
                    ) : (
                        <Building2 className="w-8 h-8 text-gray-300" />
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 pr-6">
                    {/* Job Title */}
                    <Link href={job.job_apply_link} target="_blank" className="block w-fit">
                        <h3 className="text-base md:text-lg font-semibold text-blue-600 hover:underline leading-snug mb-0.5">
                            {job.job_title}
                        </h3>
                    </Link>

                    {/* Company Name */}
                    <div className="text-sm text-gray-900 mb-0.5">
                        {job.employer_name}
                    </div>

                    {/* Location & Metadata */}
                    <div className="text-sm text-gray-500 mb-2 flex items-center flex-wrap gap-x-1">
                        <span>{job.job_city}, {job.job_country}</span>
                        {job.job_is_remote && (
                            <>
                                <span className="w-0.5 h-0.5 bg-gray-400 rounded-full mx-1"></span>
                                <span className="text-gray-500">(Remote)</span>
                            </>
                        )}
                        <span className="w-0.5 h-0.5 bg-gray-400 rounded-full mx-1"></span>
                        <span className={`font-medium ${isEarly ? 'text-green-600' : 'text-gray-500'}`}>
                            {timeAgo}
                        </span>
                    </div>

                    {/* Insights (Alumni/Applicants) */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-1.5 overflow-hidden">
                            {[1, 2].map(i => (
                                <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[8px] text-gray-500 font-bold">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="text-xs text-gray-500">
                            {insightText}
                        </span>

                        {/* Premium Lock Teaser */}
                        {!isPremium && <span className="text-xs text-amber-600 font-medium ml-2 flex items-center gap-1">
                            <Lock size={10} /> Unlock Salary
                        </span>}
                    </div>
                </div>
            </div>

            {!isPremium && (
                <div className="mt-2 mb-1 inline-flex items-center gap-2 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <Lock size={12} />
                    Unlock AI Match + Salary Insights
                    <Link href="/checkout?billingCycle=quarterly&step=1" className="text-blue-600 hover:underline ml-1">
                        Upgrade
                    </Link>
                </div>
            )}

            {/* Actions Bar - Clean Icon Style */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-around gap-2">
                {/* Tailor CV */}
                <Link
                    href={`/job-description-resume-builder?jobTitle=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.employer_name)}&jobDescription=${encodeURIComponent(job.job_description || job.job_title)}`}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded hover:bg-gray-100 transition-colors flex-1 group text-gray-600 hover:text-gray-900"
                >
                    <FileText size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium text-center leading-none">Tailor CV</span>
                </Link>

                {/* Cover Letter */}
                <button
                    onClick={() => {
                        const jobContext = {
                            jobTitle: job.job_title,
                            company: job.employer_name,
                            location: `${job.job_city}, ${job.job_country}`,
                            jobDescription: job.job_description || job.job_title
                        };
                        console.log('📝 Cover Letter - Saving job context:', jobContext);
                        sessionStorage.setItem('currentJobContext', JSON.stringify(jobContext));
                        window.location.href = '/cover-letter-builder';
                    }}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded hover:bg-gray-100 transition-colors flex-1 group text-gray-600 hover:text-gray-900"
                >
                    <PenTool size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium text-center leading-none">Cover Letter</span>
                </button>

                {/* Match Score */}
                <button
                    onClick={() => {
                        const jobContext = {
                            jobTitle: job.job_title,
                            company: job.employer_name,
                            location: `${job.job_city}, ${job.job_country}`,
                            jobDescription: job.job_description || job.job_title
                        };
                        console.log('🎯 Match Score - Saving job context:', jobContext);
                        sessionStorage.setItem('currentJobContext', JSON.stringify(jobContext));
                        window.location.href = '/jobs/match';
                    }}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded hover:bg-gray-100 transition-colors flex-1 group text-gray-600 hover:text-gray-900"
                >
                    <Target size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium text-center leading-none">Match Score</span>
                </button>

                {/* Stand Out */}
                <button
                    onClick={() => {
                        const jobContext = {
                            jobTitle: job.job_title,
                            company: job.employer_name,
                            location: `${job.job_city}, ${job.job_country}`,
                            jobDescription: job.job_description || job.job_title
                        };
                        console.log('✨ Stand Out - Saving job context:', jobContext);
                        sessionStorage.setItem('currentJobContext', JSON.stringify(jobContext));
                        window.location.href = '/jobs/stand-out';
                    }}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded hover:bg-gray-100 transition-colors flex-1 group text-gray-600 hover:text-gray-900"
                >
                    <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium text-center leading-none">Stand Out</span>
                </button>
            </div>

        </div>
    );
}
