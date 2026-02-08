"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Users, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocation } from "../context/LocationContext";
import { formatPrice } from "../lib/globalPricing";
import { ADDON_CONFIG } from "../lib/planConfig";
import { event } from "../lib/gtag";

const ProfileLimitModal = ({ isOpen, onClose, resumeName, firstResumeName, blockedProfileData }) => {
    const router = useRouter();
    const { currency } = useLocation();

    // Track modal view
    useEffect(() => {
        if (isOpen) {
            event({
                action: "profile_slot_addon_view",
                category: "ProfileGuard",
                label: resumeName || "unknown_profile"
            });
        }
    }, [isOpen, resumeName]);

    // Get price for profile slot
    const getPrice = () => {
        const price = ADDON_CONFIG.profile_slot?.price?.[currency] || 29900;
        return formatPrice(price, currency);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border-b border-orange-200">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Users size={24} className="text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">New Profile Detected</h2>
                                <p className="text-sm text-gray-600 mt-1">This resume belongs to a different person</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                            <div className="flex gap-3">
                                <ShieldAlert className="text-orange-500 shrink-0" size={20} />
                                <div className="text-sm text-gray-600">
                                    <p className="mb-2">
                                        Your account is registered to <strong>{firstResumeName || 'your primary profile'}</strong>.
                                    </p>
                                    <p className="mb-2">
                                        The resume you are trying to download belongs to <strong>{resumeName || 'a new profile'}</strong>.
                                    </p>
                                    <p className="font-medium text-orange-800">
                                        Once you add this profile slot, <strong>{resumeName || 'this profile'}</strong> will be permanently added to your account, and you can create/download unlimited resumes for them.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    event({
                                        action: "profile_slot_addon_cta_click",
                                        category: "ProfileGuard",
                                        label: resumeName || "unknown_profile"
                                    });
                                    onClose();
                                    // Redirect to checkout with profile addon parameter AND profile details for auto-add
                                    const params = new URLSearchParams({
                                        addon: "profile_slot",
                                        profileName: blockedProfileData?.name || "",
                                        profileEmail: blockedProfileData?.email || "",
                                        profilePhone: blockedProfileData?.phone || ""
                                    });
                                    router.push(`/checkout?${params.toString()}`);
                                }}
                                className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <UserPlus size={18} />
                                Add Profile & Continue - {getPrice()}
                            </button>

                            <button
                                onClick={() => {
                                    event({
                                        action: "profile_slot_addon_cancel",
                                        category: "ProfileGuard",
                                        label: resumeName || "unknown_profile"
                                    });
                                    onClose();
                                }}
                                className="w-full py-3 px-4 bg-white text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                            >
                                Cancel Download
                            </button>
                        </div>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            One-time payment. Resume will be auto-added upon next download attempt.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProfileLimitModal;
