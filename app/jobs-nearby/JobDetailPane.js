import { useState, memo } from 'react';
import { Building2, Rocket, MapPin, Clock, ExternalLink, BookmarkPlus, Target, PenTool, FileText, Sparkles, Crown, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import JobApplicationStatusModal from '../components/JobApplicationStatusModal';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getCountFromServer, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const FREE_TIER_LIMIT = 3;

const JobDetailPane = memo(function JobDetailPane({ job, isPremium, onClose }) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const { user, userData } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    if (!job) {
        return (
            <div className="h-full flex items-center justify-center p-8 text-center bg-gray-50">
                <div>
                    <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a job to view details</h3>
                    <p className="text-sm text-gray-500">Click on any job from the list to see full information</p>
                </div>
            </div>
        );
    }

    const postedDate = job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date();
    const diffDays = Math.floor((new Date() - postedDate) / (1000 * 60 * 60 * 24));
    const timeAgo = diffDays === 0 ? "Just now" : diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;

    const handleApplyClick = (e) => {
        e.preventDefault();

        // Show a quick nudge before redirecting
        toast((t) => (
            <div className="flex flex-col gap-1">
                <span className="font-bold text-sm flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-primary" />
                    Opening Application...
                </span>
                <span className="text-xs text-gray-600">Track this application to get daily progress nudges.</span>
            </div>
        ), { duration: 3000, icon: '🚀' });

        // Open job link in new tab after a tiny delay to allow user to see nudge
        setTimeout(() => {
            window.open(job.job_apply_link, '_blank');
            // Show tracking modal immediately so it's there when they return
            setShowTrackingModal(true);
        }, 800);
    };

    const saveJobContext = () => {
        const jobContext = {
            jobTitle: job.job_title,
            company: job.employer_name,
            location: `${job.job_city}, ${job.job_country}`,
            jobDescription: job.job_description || job.job_title
        };
        sessionStorage.setItem('currentJobContext', JSON.stringify(jobContext));
    };

    const handleSaveJob = async () => {
        if (!user) {
            toast.error("Please login to save jobs");
            return;
        }

        setSaving(true);
        try {
            // Determine limit based on plan
            let maxJobs = 3; // Default limit for Free/Basic
            const isUnlimited = isQuarterlyPlan || isSixMonthPlan || userData?.hasJobTrackerFeature === true || userData?.hasJobsFeature === true;

            // Monthly users get 10 jobs, Quarterly/SixMonth get Unlimited
            if (isUnlimited) {
                maxJobs = 9999;
            } else if (isPremium) {
                // Determine if it's monthly plan (isPremium but not Quarterly/SixMonth)
                maxJobs = 10;
            }

            if (!isUnlimited) {
                const coll = collection(db, `users/${user.uid}/jobApplications`);
                const q = query(coll, where("status", "in", ["saved", "applied", "interview", "offer", "rejected"]));
                const snapshot = await getCountFromServer(q);
                const count = snapshot.data().count;

                if (count >= maxJobs) {
                    toast((t) => (
                        <div className="flex flex-col gap-2">
                            <span className="font-bold">
                                {isPremium ? `Pro Limit Reached (${maxJobs}/${maxJobs})` : `Free Limit Reached (${maxJobs}/${maxJobs})`}
                            </span>
                            <span className="text-sm">
                                {isPremium
                                    ? "Upgrade to Expert for UNLIMITED job tracking!"
                                    : "Upgrade to track more jobs!"}
                            </span>
                            <button
                                onClick={() => { toast.dismiss(t.id); router.push('/checkout?billingCycle=quarterly&step=1'); }}
                                className="bg-primary text-white px-3 py-1.5 rounded text-xs font-bold mt-1"
                            >
                                Upgrade Now
                            </button>
                        </div>
                    ), { duration: 5000, icon: '🔒' });
                    return;
                }
            }

            const jobData = {
                title: job.job_title,
                company: job.employer_name,
                location: `${job.job_city}, ${job.job_country}`,
                type: job.job_employment_type,
                salary: "Not disclosed",
                link: job.job_apply_link,
                logo: job.employer_logo,
                status: 'saved',
                notes: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                savedAt: new Date().toISOString()
            };

            await addDoc(collection(db, `users/${user.uid}/jobApplications`), jobData);
            toast.success("Job saved to your tracker!");

        } catch (error) {
            console.error("Error saving job:", error);
            toast.error("Failed to save job");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-white">
            {/* Header Section - COMPACT */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                <div className="p-4">
                    {/* Company & Job Title */}
                    <div className="flex items-start gap-3 mb-3">
                        {/* Company Logo - Smaller */}
                        <div className="w-12 h-12 bg-white flex-shrink-0 flex items-center justify-center border border-gray-200 p-1.5">
                            {job.employer_logo ? (
                                <Image
                                    src={job.employer_logo}
                                    alt={job.employer_name}
                                    width={48}
                                    height={48}
                                    className="object-contain"
                                />
                            ) : (
                                <Building2 className="w-8 h-8 text-gray-300" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                                {job.job_title}
                            </h1>
                            <p className="text-sm text-gray-700 mb-1.5">{job.employer_name}</p>

                            {/* Metadata - Compact */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {job.job_city}, {job.job_country}
                                </span>
                                {job.job_is_remote && (
                                    <span className="text-green-600 font-semibold">• Remote</span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {timeAgo}
                                </span>
                                {job.job_employment_type && (
                                    <>
                                        <span>•</span>
                                        <span>{job.job_employment_type}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Compact */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handleApplyClick}
                            className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#132D54] transition-colors flex items-center justify-center gap-1.5"
                        >
                            Apply now
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={handleSaveJob}
                            disabled={saving}
                            className="w-full sm:w-auto px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content - COMPACT with max-width for readability */}
            <div className="p-4 space-y-4 max-w-6xl mx-auto">
                {/* AI Tools Card - COMPACT*/}
                <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-slate-50 rounded-lg p-4 border border-primary/10">
                    <div className="flex items-center gap-1.5 mb-3">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <h2 className="text-sm font-bold text-gray-900">Your AI-Powered Job Tools</h2>
                        {!isPremium && (
                            <Crown className="w-3.5 h-3.5 text-yellow-500" />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Match Score */}
                        <button
                            onClick={() => {
                                saveJobContext();
                                window.location.href = '/jobs/match';
                            }}
                            disabled={!isPremium}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${isPremium
                                ? 'bg-white border-accent/30 hover:border-accent hover:shadow-md cursor-pointer'
                                : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                                }`}
                        >
                            <div className="relative">
                                <Target className="w-5 h-5 text-primary" />
                                {!isPremium && <Lock className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-amber-500" />}
                            </div>
                            <span className="text-xs font-semibold text-gray-900">Match Score</span>
                            <span className="text-[10px] text-gray-600 text-center leading-tight">See how you match</span>
                        </button>

                        {/* Stand Out */}
                        <button
                            onClick={() => {
                                saveJobContext();
                                window.location.href = '/jobs/stand-out';
                            }}
                            disabled={!isPremium}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${isPremium
                                ? 'bg-white border-primary/20 hover:border-primary/50 hover:shadow-md cursor-pointer'
                                : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                                }`}
                        >
                            <div className="relative">
                                <Sparkles className="w-5 h-5 text-accent" />
                                {!isPremium && <Lock className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-amber-500" />}
                            </div>
                            <span className="text-xs font-semibold text-gray-900">Stand Out</span>
                            <span className="text-[10px] text-gray-600 text-center leading-tight">Get noticed</span>
                        </button>

                        {/* Tailor CV */}
                        <Link
                            href={`/job-description-resume-builder?jobTitle=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.employer_name)}&jobDescription=${encodeURIComponent(job.job_description || job.job_title)}`}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 bg-white border-accent/30 hover:border-accent hover:shadow-md transition-all"
                        >
                            <FileText className="w-5 h-5 text-primary" />
                            <span className="text-xs font-semibold text-gray-900">Tailor CV</span>
                            <span className="text-[10px] text-gray-600 text-center leading-tight">Optimize resume</span>
                        </Link>

                        {/* Cover Letter */}
                        <button
                            onClick={() => {
                                saveJobContext();
                                window.location.href = '/cover-letter-builder';
                            }}
                            disabled={!isPremium}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${isPremium
                                ? 'bg-white border-primary/20 hover:border-primary/50 hover:shadow-md cursor-pointer'
                                : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                                }`}
                        >
                            <div className="relative">
                                <PenTool className="w-5 h-5 text-primary" />
                                {!isPremium && <Lock className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-amber-500" />}
                            </div>
                            <span className="text-xs font-semibold text-gray-900">Cover Letter</span>
                            <span className="text-[10px] text-gray-600 text-center leading-tight">Generate letter</span>
                        </button>
                    </div>

                    {!isPremium && (
                        <p className="text-[10px] text-gray-600 mt-2.5 text-center leading-tight">
                            🔒 Upgrade to <span className="font-semibold text-primary">Premium</span> to unlock all AI tools
                        </p>
                    )}
                </div>
                {/* Job Description */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">About the job</h2>
                    <div className={`prose prose-sm max-w-none ${!showFullDescription && 'line-clamp-12'}`}>
                        <div
                            className="text-gray-700 whitespace-pre-wrap leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: job.job_description?.replace(/\n/g, '<br>') || 'No description available.' }}
                        />
                    </div>
                    {job.job_description && job.job_description.length > 500 && (
                        <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="mt-3 text-primary hover:text-[#132D54] font-semibold flex items-center gap-1 text-sm"
                        >
                            {showFullDescription ? (
                                <>Show less <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>Show more <ChevronDown className="w-4 h-4" /></>
                            )}
                        </button>
                    )}
                </div>

                {/* Additional Info */}
                {(job.job_employment_type || job.job_experience_in_place_of_education) && (
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Employment details</h2>
                        <div className="space-y-2 text-sm">
                            {job.job_employment_type && (
                                <div className="flex items-start gap-2">
                                    <span className="font-semibold text-gray-700 min-w-[120px]">Employment type:</span>
                                    <span className="text-gray-600">{job.job_employment_type}</span>
                                </div>
                            )}
                            {job.job_required_experience && (
                                <div className="flex items-start gap-2">
                                    <span className="font-semibold text-gray-700 min-w-[120px]">Experience:</span>
                                    <span className="text-gray-600">{job.job_required_experience.required_experience_in_months ? `${Math.floor(job.job_required_experience.required_experience_in_months / 12)} years` : 'Not specified'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Job Application Tracking Modal */}
            <JobApplicationStatusModal
                isOpen={showTrackingModal}
                onClose={() => setShowTrackingModal(false)}
                job={job}
            />
        </div>
    );
});

export default JobDetailPane;
