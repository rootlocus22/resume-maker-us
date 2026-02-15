"use client";

import {
    Building2, MapPin, Calendar, DollarSign, Clock,
    ExternalLink, Target, Bookmark, BookmarkCheck, CheckCircle,
    Sparkles, Star, Lock, FileText
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JobCard({
    job,
    index,
    matchScore,
    showScore,
    isSaved,
    isApplied,
    onApply,
    onSave,
    selectedResumeId
}) {
    const router = useRouter();

    const handleTailorClick = () => {
        // Always redirect to builder - gating happens there or after
        const params = new URLSearchParams();
        params.set('jobDescription', job.description || job.title);
        params.set('jobTitle', job.title);
        params.set('company', job.company);
        if (selectedResumeId) params.set('sourceResumeId', selectedResumeId);

        router.push(`/job-description-resume-builder?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group h-full flex flex-col relative">
            {/* Top accent border */}
            <div className={`absolute top-0 left-0 w-full h-1 ${showScore && matchScore >= 80 ? 'bg-gradient-to-r from-accent-400 to-accent-500' : 'bg-gradient-to-r from-primary-400 to-primary'}`}></div>

            <div className="p-6 flex-1 flex flex-col">
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {showScore && matchScore >= 80 && (
                                <div className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {matchScore}% Match
                                </div>
                            )}
                            {(index < 3 && (!showScore || matchScore < 80)) && (
                                <div className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {index === 0 ? "Top Match" : "Featured"}
                                </div>
                            )}
                            <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-gray-200">
                                {job.type || "Full Time"}
                            </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-3">
                            <Building2 className="w-4 h-4" />
                            <span className="truncate">{job.company}</span>
                        </div>

                        <div className="flex items-center gap-4 text-gray-500 text-xs sm:text-sm flex-wrap">
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate max-w-[100px]">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span>{job.postedDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Match Score Gauge (Right Side) */}
                    <div className="flex flex-col items-center justify-center flex-shrink-0 pt-1">
                        {showScore ? (
                            <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-[3px] shadow-sm transform group-hover:scale-105 transition-transform ${matchScore >= 80 ? 'border-green-500 text-green-700 bg-green-50' :
                                matchScore >= 60 ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                                    'border-red-500 text-red-700 bg-red-50'
                                }`}>
                                <div className="text-center">
                                    <span className="text-base sm:text-lg font-bold leading-none">{matchScore}</span>
                                    <span className="text-[9px] sm:text-[10px] block font-medium opacity-80">%</span>
                                </div>
                            </div>
                        ) : (
                            <Link href="/pricing?feature=match-score">
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-[3px] border-gray-100 bg-gray-50 text-gray-300 cursor-pointer hover:border-accent/20 hover:text-accent transition-all group/lock">
                                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 group-hover/lock:scale-110 transition-transform" />
                                </div>
                            </Link>
                        )}
                        <div className="mt-1.5 text-[9px] uppercase font-bold text-gray-400 tracking-wider">Match</div>
                    </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg p-2.5 flex items-center gap-3 group/stat">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600 border border-gray-100 group-hover/stat:border-green-200 transition-colors">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Salary</span>
                            <span className="font-semibold text-xs sm:text-sm text-gray-700 truncate block" title={job.salary}>{job.salary}</span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg p-2.5 flex items-center gap-3 group/stat">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-accent border border-gray-100 group-hover/stat:border-accent/20 transition-colors">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Experience</span>
                            <span className="font-semibold text-xs sm:text-sm text-gray-700 truncate block">{job.experience}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-2 flex-grow">
                    {job.description}
                </p>

                {/* Application Method */}
                {job.applicationMethod && (
                    <div className="bg-accent-50/30 rounded-lg px-3 py-2 mb-4 border border-accent-50 flex items-center gap-2.5">
                        <ExternalLink className="w-3.5 h-3.5 text-accent-400 flex-shrink-0" />
                        <p className="text-xs text-primary truncate">
                            <span className="font-semibold opacity-70 mr-1">Apply via:</span>
                            {job.applicationMethod}
                        </p>
                    </div>
                )}

                {/* Status Indicators */}
                {(isSaved || isApplied) && (
                    <div className="mb-4 flex gap-2">
                        {isApplied && (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-100">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Applied
                            </div>
                        )}
                        {isSaved && !isApplied && (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-yellow-50 text-yellow-700 border border-yellow-100">
                                <BookmarkCheck className="w-3 h-3 mr-1" />
                                Saved
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-auto">
                    {/* Apply Now - Full width on mobile, 2 cols on desktop */}
                    <button
                        onClick={() => onApply(job)}
                        className="col-span-2 bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow active:scale-95 group/btn"
                    >
                        {isApplied ? (
                            <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                View Status
                            </>
                        ) : (
                            <>
                                <span>Apply Now</span>
                                <Target className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>

                    {/* Match Score */}
                    <button
                        onClick={() => router.push(`/jobs/match?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location)}&description=${encodeURIComponent(job.description)}`)}
                        className="col-span-1 bg-gradient-to-r from-accent-600 to-accent text-white shadow-md hover:shadow-lg py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 text-xs active:scale-95 group/match relative overflow-hidden"
                        title="AI Match Score Analysis"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/match:translate-y-0 transition-transform duration-300"></div>
                        <Target className="w-3.5 h-3.5" />
                        <span className="truncate">Match</span>
                    </button>

                    {/* Stand Out */}
                    <button
                        onClick={() => router.push(`/jobs/stand-out?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location)}&description=${encodeURIComponent(job.description)}`)}
                        className="col-span-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md hover:shadow-lg py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 text-xs active:scale-95 group/stand relative overflow-hidden"
                        title="Stand Out Strategy"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/stand:translate-y-0 transition-transform duration-300"></div>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="truncate">Stand Out</span>
                    </button>

                    {/* Cover Letter */}
                    <button
                        onClick={() => router.push(`/cover-letter-builder?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&jobDescription=${encodeURIComponent(job.description)}`)}
                        className="col-span-1 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md hover:shadow-lg py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 text-xs active:scale-95 group/cover relative overflow-hidden"
                        title="Generate Cover Letter"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/cover:translate-y-0 transition-transform duration-300"></div>
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate">Cover</span>
                    </button>

                    {/* Tailor Resume */}
                    <button
                        onClick={handleTailorClick}
                        className="col-span-1 bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 text-xs active:scale-95 group/tailor relative overflow-hidden"
                        title="Create a tailored resume for this job"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/tailor:translate-y-0 transition-transform duration-300"></div>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="truncate">Tailor CV</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
