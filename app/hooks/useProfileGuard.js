"use client";
import { useState, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { isResumeOwner, storeFirstResumeReference } from "../lib/firstResumeReference";
import ProfileLimitModal from "../components/ProfileLimitModal";
import toast from "react-hot-toast";

export function useProfileGuard() {
    const [isProfileLimitModalOpen, setIsProfileLimitModalOpen] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [blockedProfileData, setBlockedProfileData] = useState(null);

    /**
     * Checks if the current resume data is allowed to be downloaded/saved
     * based on the user's profile quota and ownership.
     * 
     * @param {Object} user - Firebase user object
     * @param {Object} resumeData - The resume data to check (MUST contain name for light check)
     * @param {string} source - Source of the action (e.g., "resume_builder_download")
     * @returns {Promise<Object>} - { allowed: boolean, needsUpgrade: boolean }
     */
    const checkProfileAccess = useCallback(async (user, resumeData, source = "unknown_source") => {
        if (!user) return { allowed: true, needsUpgrade: false }; // checking usually requires auth, but if no user, typical logic might allow or prompt login elsewhere. 
        // Assuming auth check is done before calling this.

        // Minimum data requirement: name is required for profile check
        if (!resumeData?.name || !resumeData.name.trim()) {
            // If no name, we can't validate. Allow but log.
            console.warn("ProfileGuard: No name in resume data, skipping check.");
            return { allowed: true, needsUpgrade: false };
        }

        // Exempt Sample Profile (John Doe) form Check & Capture
        // Checking for "John Doe" case-insensitively
        const nameToCheck = String(resumeData?.name || "").toLowerCase().trim();
        if (nameToCheck === "john doe" || nameToCheck === "johndoe") {
            console.log("ProfileGuard: Sample profile 'John Doe' detected. Skipping check and allowing access.");
            return { allowed: true, needsUpgrade: false };
        }

        if (isChecking) {
            console.log("ProfileGuard: Access check already in progress, skipping.");
            return { allowed: false, needsUpgrade: false, inProgress: true };
        }

        setIsChecking(true);

        try {
            // 1. Fetch fresh user data to ensure latest references and slots
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                setIsChecking(false);
                return { allowed: true, needsUpgrade: false }; // Should not happen for auth user
            }

            const userData = userSnap.data();
            let firstRef = userData.firstResumeReference;

            // 2. If NO reference exists at all, try to store this one (Initial Capture)
            if (!firstRef) {
                console.log("ProfileGuard: No primary profile. Attempting initial capture...");
                const result = await storeFirstResumeReference(user.uid, {
                    name: resumeData.name,
                    email: resumeData.email,
                    phone: resumeData.phone
                }, source);

                if (result.stored) {
                    console.log("ProfileGuard: Initial profile captured.");
                    setIsChecking(false);
                    return { allowed: true, needsUpgrade: false };
                }
                // If failed, it might be due to limit (though unlikely for 1st one), or error.
            }

            // 3. Ownership Check against collection
            // Normalize 'firstRef' for isResumeOwner (which handles array/object internally now, but good to be explicit)
            if (firstRef) {
                const { isOwner, reason } = isResumeOwner(resumeData, firstRef);

                if (isOwner) {
                    console.log("ProfileGuard: Match found.", reason);
                    setIsChecking(false);
                    return { allowed: true, needsUpgrade: false };
                }

                // 4. Mismatch Detected -> Check Quota before Adding
                console.log("ProfileGuard: Mismatch detected.", reason);

                // Calculate Quota
                const profileSlots = parseInt(userData.profileSlots || 0, 10);
                const totalAllowed = 1 + profileSlots; // 1 (Base) + Purchased Slots

                // Calculate Usage
                let currentUsage = 0;
                if (Array.isArray(firstRef)) {
                    currentUsage = firstRef.length;
                } else if (firstRef) {
                    currentUsage = 1; // Legacy single object
                }

                console.log(`ProfileGuard: Quota Check: Usage ${currentUsage} / Allowed ${totalAllowed}`);

                // Check plan - if free user, mismatch should trigger upgrade modal instead of slot modal
                const userPlan = userData.plan || "anonymous";
                const isPaidPlan = ["premium", "basic", "oneDay"].includes(userPlan);

                if (!isPaidPlan) {
                    console.log("ProfileGuard: Free user detected on mismatch. Requiring upgrade.");
                    setIsChecking(false);
                    return { allowed: false, needsUpgrade: true };
                }

                if (currentUsage < totalAllowed) {
                    // Has empty slots -> Add New Profile
                    console.log("ProfileGuard: Slot available. Attempting to add new profile...");
                    const addResult = await storeFirstResumeReference(user.uid, {
                        name: resumeData.name,
                        email: resumeData.email,
                        phone: resumeData.phone
                    }, source);

                    if (addResult.stored || addResult.cached) {
                        console.log("ProfileGuard: Additional profile slot used (or cached). Access granted.");
                        if (addResult.stored) toast.success("New profile identity verified & saved!");
                        setIsChecking(false);
                        return { allowed: true, needsUpgrade: false };
                    } else if (addResult.alreadyExists) {
                        console.log("ProfileGuard: API says exists (allow).");
                        setIsChecking(false);
                        return { allowed: true, needsUpgrade: false };
                    }
                }

                // Limit Reached or Add Failed
                console.log("ProfileGuard: Profile limit reached. Blocking.");
                setBlockedProfileData({
                    name: resumeData.name,
                    email: resumeData.email,
                    phone: resumeData.phone
                });
                setIsProfileLimitModalOpen(true);
                setIsChecking(false);
                return { allowed: false, needsUpgrade: false };
            }

            setIsChecking(false);
            return { allowed: true, needsUpgrade: false };

        } catch (error) {
            console.error("ProfileGuard Error:", error);
            // Fail safe: Block if unsure? Or Allow? 
            // To prevent bypassing paid features on error, usually safest to Block or show specific error.
            // But to avoid blocking valid users on network glitch, maybe generic error toast.
            toast.error("Unable to verify profile access. Please check connection.");
            setIsChecking(false);
            return { allowed: false, needsUpgrade: false }; // Safest
        }
    }, []);

    const ProfileGuardModal = useCallback(() => (
        <ProfileLimitModal
            isOpen={isProfileLimitModalOpen}
            onClose={() => setIsProfileLimitModalOpen(false)}
            blockedProfileData={blockedProfileData}
        />
    ), [isProfileLimitModalOpen, blockedProfileData]);

    return {
        checkProfileAccess,
        ProfileGuardModal,
        isProfileLimitModalOpen, // Exported in case parent needs to know
        setIsProfileLimitModalOpen,
        isChecking,
        setBlockedProfileData
    };
}
