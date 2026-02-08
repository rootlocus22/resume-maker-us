"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useExtension } from "../context/ExtensionContext";
import {
    Sparkles,
    Briefcase,
    MapPin,
    Building2,
    Save,
    ExternalLink,
    ArrowRight,
    FileText,
    Target,
    Lightbulb,
    Unlock,
    Clock,
    DollarSign,
    Calendar,
    BookmarkCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { db } from "../../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function ExtensionSidebar() {
    const { currentJob: jobData } = useExtension();
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    // Auto-save job to history when viewed
    useEffect(() => {
        if (user && jobData && jobData.title) {
            const saveToHistory = async () => {
                try {
                    const jobId = `${jobData.company}-${jobData.title}`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                    // Use a separate collection or flag for "viewed/history" vs explicitly "saved"
                    // For now, let's just log it to a history subcollection
                    // Or check if user wanted "saved" vs "viewed". User said "maintain history".
                    // Let's save to 'viewedJobs' collection.
                    await setDoc(doc(db, "users", user.uid, "viewedJobs", jobId), {
                        ...jobData,
                        viewedAt: serverTimestamp(),
                        source: 'extension_view'
                    });
                } catch (e) {
                    console.error("Failed to save history", e);
                }
            };
            saveToHistory();
        }
    }, [user, jobData]);

    const handleFeatureClick = (path) => {
        if (!jobData) return;
        localStorage.setItem('extension_job_context', JSON.stringify({
            title: jobData.title,
            company: jobData.company,
            description: jobData.description,
            location: jobData.location, // Ensure location is passed
            source: 'extension'
        }));
        router.push(path);
    };

    const handleSaveJob = async () => {
        if (!user) {
            toast.error("Please log in to save jobs");
            return;
        }
        if (!jobData) return;

        setLoading(true);
        try {
            const jobId = `${jobData.company}-${jobData.title}`.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-' + Date.now();
            await setDoc(doc(db, "users", user.uid, "savedJobs", jobId), {
                ...jobData,
                savedAt: serverTimestamp(),
                source: 'linkedin_extension'
            });
            toast.success("Job Saved!");
        } catch (error) {
            console.error("Error saving job:", error);
            toast.error("Failed to save job");
        } finally {
            setLoading(false);
        }
    };

    if (!jobData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                    <Briefcase className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Waiting for Job...</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Navigate to any job post on LinkedIn.<br />
                    I'll automatically detect the details here.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 w-full text-left border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Try visiting:</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Reference a job on standard job sites
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-10">

            {/* Main Job Dashboard Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative">
                {/* Decorative header bg */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-60 pointer-events-none"></div>

                <div className="p-6 relative z-10">
                    {/* Badge / Type */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-blue-100 flex items-center gap-1.5">
                            <Briefcase size={12} />
                            {jobData.type || 'Full Time'}
                        </span>
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-green-100 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            Live
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold leading-tight mb-2 text-gray-900">{jobData.title}</h2>

                    <div className="flex items-center gap-2 text-gray-600 font-medium mb-6">
                        <Building2 size={16} />
                        <span className="text-lg">{jobData.company}</span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <MapPin size={18} className="text-gray-400" />
                            <span className="font-medium">{jobData.location || "Location not specified"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <DollarSign size={18} className="text-gray-400" />
                            <span className="font-medium">{jobData.title.toLowerCase().includes('senior') || jobData.title.toLowerCase().includes('staff') ? '$140k - $220k (Est.)' : 'Competitive Salary'}</span>
                        </div>
                    </div>

                    {/* --- ACTION BADGES (Integrated) --- */}
                    <div className="grid grid-cols-4 gap-2 mb-8">
                        <button
                            onClick={() => handleFeatureClick('/extension/builder')}
                            className="flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md p-2 transition-all active:scale-95 py-3 group"
                        >
                            <Sparkles className="w-5 h-5 mb-1.5 group-hover:animate-pulse" />
                            <span className="text-[9px] font-bold">Tailor</span>
                        </button>

                        <button
                            onClick={() => handleFeatureClick('/extension/match')}
                            className="flex flex-col items-center justify-center bg-white hover:bg-green-50 text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-200 rounded-xl shadow-sm p-2 transition-all active:scale-95 py-3"
                        >
                            <Target className="w-5 h-5 mb-1.5" />
                            <span className="text-[9px] font-bold">Match</span>
                        </button>

                        <button
                            onClick={() => handleFeatureClick('/extension/cover-letter')}
                            className="flex flex-col items-center justify-center bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-700 border border-gray-200 hover:border-purple-200 rounded-xl shadow-sm p-2 transition-all active:scale-95 py-3"
                        >
                            <FileText className="w-5 h-5 mb-1.5" />
                            <span className="text-[9px] font-bold">Cover</span>
                        </button>

                        <button
                            onClick={() => handleFeatureClick('/extension/stand-out')}
                            className="flex flex-col items-center justify-center bg-white hover:bg-amber-50 text-gray-700 hover:text-amber-700 border border-gray-200 hover:border-amber-200 rounded-xl shadow-sm p-2 transition-all active:scale-95 py-3"
                        >
                            <Lightbulb className="w-5 h-5 mb-1.5" />
                            <span className="text-[9px] font-bold">Tips</span>
                        </button>
                    </div>

                    {/* Section Divider */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-px bg-gray-100 flex-1"></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Details</span>
                        <div className="h-px bg-gray-100 flex-1"></div>
                    </div>

                    {/* Description (Full) */}
                    <div className="text-sm text-gray-600 leading-relaxed mb-8 font-sans">
                        {jobData.description}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-1">
                        <a
                            href={jobData.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                        >
                            Apply Now
                            <ExternalLink size={14} />
                        </a>
                        <button
                            onClick={handleSaveJob}
                            disabled={loading}
                            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl border border-gray-200 font-bold transition-all text-sm flex items-center gap-2"
                        >
                            <BookmarkCheck size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
