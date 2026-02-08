"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Bookmark, AlertCircle, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, getCountFromServer, query, where } from "firebase/firestore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function JobApplicationStatusModal({ isOpen, onClose, job }) {
    const { user, userData } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const FREE_TIER_LIMIT = 3;

    if (!isOpen || !job) return null;

    const handleStatusSelect = async (status) => {
        if (!user) {
            toast.error("Please login to track your applications");
            onClose();
            return;
        }

        setLoading(true);
        try {
            // Check limits
            const isApplyPro = user.job_search_plan === 'apply_pro' || userData?.hasApplyPro;

            if (!isApplyPro) {
                const coll = collection(db, `users/${user.uid}/jobApplications`);
                const q = query(coll, where("status", "in", ["saved", "applied", "interview", "offer", "rejected"]));
                const snapshot = await getCountFromServer(q);
                const count = snapshot.data().count;

                if (count >= FREE_TIER_LIMIT) {
                    toast((t) => (
                        <div className="flex flex-col gap-2">
                            <span className="font-bold">Free Limit Reached (3/3)</span>
                            <span className="text-sm">Upgrade to ApplyOS to track unlimited jobs!</span>
                            <button
                                onClick={() => { toast.dismiss(t.id); router.push('/checkout?billingCycle=apply_pro'); }}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold mt-1"
                            >
                                Upgrade Now
                            </button>
                        </div>
                    ), { duration: 5000, icon: '🔒' });
                    setLoading(false);
                    return;
                }
            }

            const jobData = {
                title: job.job_title,
                company: job.employer_name,
                location: `${job.job_city || ''}, ${job.job_country || ''}`,
                type: job.job_employment_type,
                salary: "Not disclosed", // API doesn't always provide this
                link: job.job_apply_link,
                logo: job.employer_logo,
                status: status, // 'applied' or 'saved'
                notes: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (status === 'applied') {
                jobData.appliedAt = new Date().toISOString();
            } else {
                jobData.savedAt = new Date().toISOString();
            }

            await addDoc(collection(db, `users/${user.uid}/jobApplications`), jobData);

            const message = status === 'applied'
                ? "Job added to 'Applied' list!"
                : "Job saved to 'My Jobs'!";

            toast.success(message);
            onClose();
        } catch (error) {
            console.error("Error saving job:", error);
            toast.error("Failed to save job. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                    >
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-2">Did you apply?</h2>
                            <p className="text-gray-600 mb-6">
                                Keep your job search organized. We can track this application for you.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleStatusSelect('applied')}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70"
                                >
                                    <CheckCircle size={20} />
                                    Yes, I Applied
                                </button>

                                <button
                                    onClick={() => handleStatusSelect('saved')}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 p-3 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-70"
                                >
                                    <Bookmark size={20} />
                                    Save as Draft / To Apply Later
                                </button>

                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 text-sm font-medium mt-2"
                                >
                                    No, I didn't apply
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
