"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track auth initialization
  const [plan, setPlan] = useState("anonymous");
  const [isPremium, setIsPremium] = useState(false);
  const [isBasicPlan, setIsBasicPlan] = useState(false);
  const [isOneDayPlan, setIsOneDayPlan] = useState(false);
  const [isQuarterlyPlan, setIsQuarterlyPlan] = useState(false);
  const [isSixMonthPlan, setIsSixMonthPlan] = useState(false);

  // Separate state for Interview Plan
  const [interviewPlan, setInterviewPlan] = useState("anonymous");
  const [isInterviewPremium, setIsInterviewPremium] = useState(false);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // 1. Enforce Local Persistence (Critical for Extension Sync)
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => console.error("Auth Persistence Error:", error));

    // 2. Listen for cross-tab login events (Extension Sync)
    const handleStorageChange = (e) => {
      if (e.key === 'last_login') {
        console.log("Auth sync triggered from another tab");
        // Force refresh auth state or reload to pick up new cookies/indexedDB
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("onAuthStateChanged triggered:", currentUser?.uid);
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        let userDoc = await getDoc(userRef);

        // Create new Firestore doc if it doesn't exist
        if (!userDoc.exists()) {
          console.log("Creating new Firestore doc for:", currentUser.uid);

          // Check for pending referral code (try sessionStorage first, then localStorage)
          let pendingReferralCode = null;
          if (typeof window !== 'undefined') {
            pendingReferralCode = sessionStorage.getItem('pendingReferralCode') || localStorage.getItem('pendingReferralCode');

            // Check if localStorage code has expired
            if (pendingReferralCode && localStorage.getItem('pendingReferralCode')) {
              const expiry = localStorage.getItem('pendingReferralCodeExpiry');
              if (expiry && Date.now() > parseInt(expiry)) {
                console.log('[Auth] Referral code expired, clearing...');
                localStorage.removeItem('pendingReferralCode');
                localStorage.removeItem('pendingReferralCodeExpiry');
                pendingReferralCode = null;
              }
            }
          }

          const baseUserData = {
            email: currentUser.email || "anonymous",
            plan: "anonymous",
            premium_expiry: null,
            preview_count: 0,
            template_change_count: 0,
          };

          await setDoc(userRef, baseUserData, { merge: true });

          // If there's a pending referral, track it immediately (skip for enterprise users)
          if (pendingReferralCode) {
            // Check if this is an enterprise user by looking at the current URL or user data
            const isEnterpriseUser = typeof window !== 'undefined' &&
              (window.location.pathname.includes('/enterprise/') ||
                window.location.pathname.includes('/dashboard/professional'));

            if (isEnterpriseUser) {
              console.log("[Auth] Skipping referral tracking for enterprise user");
              // Clear the stored codes for enterprise users
              sessionStorage.removeItem('pendingReferralCode');
              localStorage.removeItem('pendingReferralCode');
              localStorage.removeItem('pendingReferralCodeExpiry');
            } else {
              console.log("[Auth] Found pending referral code:", pendingReferralCode);
              try {
                const response = await fetch('/api/track-referral-signup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: currentUser.uid,
                    referralCode: pendingReferralCode,
                    email: currentUser.email
                  })
                });

                if (response.ok) {
                  console.log("[Auth] ✅ Referral tracked successfully in onAuthStateChanged");
                  // Clear the stored codes after successful tracking
                  sessionStorage.removeItem('pendingReferralCode');
                  localStorage.removeItem('pendingReferralCode');
                  localStorage.removeItem('pendingReferralCodeExpiry');
                } else {
                  console.error("[Auth] Failed to track referral:", await response.text());
                }
              } catch (refError) {
                console.error('[Auth] Error tracking referral in onAuthStateChanged:', refError);
              }
            }
          } else {
            console.log("[Auth] No pending referral code found");
          }

          userDoc = await getDoc(userRef); // Refresh doc after creation
        }

        // Check and update plan if premium_expiry has passed
        const docData = userDoc.data();
        let currentPlan = docData.plan || "anonymous";
        const premiumExpiry = docData.premium_expiry;

        if (currentPlan === "premium" && premiumExpiry) {
          const expiryDate = new Date(premiumExpiry);
          const today = new Date();
          if (expiryDate < today) {
            console.log(`Premium expired for user ${currentUser.uid}. Updating plan to free.`);
            try {
              await updateDoc(userRef, {
                plan: "free",
                premium_expiry: null,
              });
              currentPlan = "free";
              console.log("Plan updated to free in Firestore.");
            } catch (error) {
              console.error("Failed to update plan to free:", error);
              toast.error("Error updating plan status. Please contact support.");
            }
          }
        }

        // Check and update interview plan if interview_premium_expiry has passed
        const interviewPlanVal = docData.interview_plan || "anonymous";
        const interviewExpiry = docData.interview_premium_expiry;

        if (interviewPlanVal === "interview_gyani" && interviewExpiry) {
          const expiryDate = new Date(interviewExpiry);
          const today = new Date();
          if (expiryDate < today) {
            console.log(`Interview Pro expired for user ${currentUser.uid}. Updating interview_plan to free.`);
            try {
              await updateDoc(userRef, {
                interview_plan: "free",
                interview_premium_expiry: null,
              });
              console.log("Interview plan updated to free in Firestore.");
            } catch (error) {
              console.error("Failed to update interview plan to free:", error);
            }
          }
        }

        // Set initial state
        setUserData(docData);
        setPlan(currentPlan);
        setIsPremium(currentPlan === "premium" || currentPlan === "monthly" || currentPlan === "quarterly" || currentPlan === "sixMonth");
        setIsBasicPlan(currentPlan === "basic");
        setIsOneDayPlan(currentPlan === "oneDay");
        setIsQuarterlyPlan(currentPlan === "quarterly");
        setIsSixMonthPlan(currentPlan === "sixMonth" || currentPlan === "premium");

        // Set initial Interview Plan state
        const initialInterviewPlan = docData.interview_plan || "anonymous";
        setInterviewPlan(initialInterviewPlan);
        setIsInterviewPremium(initialInterviewPlan === "interview_gyani" || initialInterviewPlan === "pro" || currentPlan === "sixMonth" || currentPlan === "quarterly" || currentPlan === "premium" || !!docData.hasInterviewKit);

        // Set up real-time listener
        onSnapshot(
          userRef,
          (doc) => {
            const data = doc.data();
            console.log("onSnapshot updated:", data);
            if (data) {
              setUserData(data);
              setPlan(data.plan || "anonymous");
              setIsPremium(data.plan === "premium" || data.plan === "monthly" || data.plan === "quarterly" || data.plan === "sixMonth");
              setIsBasicPlan(data.plan === "basic");
              setIsOneDayPlan(data.plan === "oneDay");
              setIsQuarterlyPlan(data.plan === "quarterly");
              setIsSixMonthPlan(data.plan === "sixMonth" || data.plan === "premium");

              // Sync Interview Plan
              const currentInterviewPlan = data.interview_plan || "anonymous";
              setInterviewPlan(currentInterviewPlan);
              setIsInterviewPremium(currentInterviewPlan === "interview_gyani" || currentInterviewPlan === "pro" || data.plan === "sixMonth" || data.plan === "quarterly" || data.plan === "premium" || !!data.hasInterviewKit);
            } else {
              setUserData(null);
              setPlan("anonymous");
              setIsPremium(false);
              setIsBasicPlan(false);
              setIsOneDayPlan(false);
              setIsQuarterlyPlan(false);
              setIsSixMonthPlan(false);
              setInterviewPlan("anonymous");
              setIsInterviewPremium(false);
            }
          },
          (error) => console.error("Firestore error:", error)
        );
      } else {
        setUserData(null);
        setPlan("anonymous");
        setIsPremium(false);
        setIsBasicPlan(false);
        setIsOneDayPlan(false);
        setIsQuarterlyPlan(false);
        setIsSixMonthPlan(false);
        setInterviewPlan("anonymous");
        setIsInterviewPremium(false);
        console.log("User signed out, reset to anonymous");
      }

      // Auth is ready (either user is logged in or confirmed logged out)
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success("Signed in with Google successfully!");
      return result.user;
    } catch (error) {
      toast.error("Sign-in failed: " + error.message);
      throw error;
    }
  };


  const signInWithApple = async () => {
    try {
      const provider = new OAuthProvider("apple.com");
      const result = await signInWithPopup(auth, provider);
      toast.success("Signed in with Apple successfully!");
      return result.user;
    } catch (error) {
      toast.error("Sign-in failed: " + error.message);
      throw error;
    }
  };

  const signInAnonymously = async () => {
    try {
      const result = await signInAnonymously(auth);
      toast.success("Signed in anonymously successfully!");
      return result.user;
    } catch (error) {
      toast.error("Anonymous sign-in failed: " + error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed in successfully!");
      // Sync state immediately after login
      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data) {
          setUserData(data);
          setPlan(data.plan || "anonymous");
          setIsPremium(data.plan === "premium");
          setIsBasicPlan(data.plan === "basic");
          console.log("Email sign-in sync:", { plan: data.plan, isPremium: data.plan === "premium", isBasicPlan: data.plan === "basic" });
        } else {
          setUserData(null);
          setPlan("anonymous");
          setIsPremium(false);
          setIsBasicPlan(false);
          console.log("Email sign-in sync: no data found, using defaults");
        }
      }
      return result.user;
    } catch (error) {
      toast.error(error.message || "Sign-in failed. Please check your credentials.");
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, {
        email: email,
        plan: "anonymous",
        premium_expiry: null,
        preview_count: 0,
        template_change_count: 0,
      }, { merge: true }); // IMPORTANT: merge: true to preserve referral data
      toast.success("Account created successfully!");
      // Sync state immediately after signup
      setUserData(null); // Will be updated by onAuthStateChanged listener or next snapshot
      setPlan("anonymous");
      setIsPremium(false);
      setIsBasicPlan(false);
      console.log("Email sign-up sync:", { plan: "anonymous", isPremium: false, isBasicPlan: false });
      return userCredential.user;
    } catch (error) {
      toast.error(error.message || "Sign-up failed. Please try again.");
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setPlan("anonymous");
      setIsPremium(false);
      setIsBasicPlan(false);
      setIsOneDayPlan(false);
      toast.success("Signed out successfully!");

      // Determine redirect path based on current context
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;

        if (pathname.startsWith('/enterprise') ||
          pathname.startsWith('/dashboard/professional') ||
          pathname.includes('enterprise') ||
          pathname.includes('professional')) {
          return '/login';
        }
      }

      // Default to home page for consumer context
      return '/';
    } catch (error) {
      toast.error("Logout failed: " + error.message);
      throw error;
    }
  };

  const updateUserPlan = async (newPlan, expiry = null) => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          plan: newPlan,
          premium_expiry: expiry ? expiry.toISOString() : null,
          preview_count: newPlan === "premium" ? 0 : 0,
          template_change_count: newPlan === "premium" ? 0 : 0,
        });
        // State update happens via onSnapshot automatically, but setting explicitly for instant feedback
        setPlan(newPlan);
        setIsPremium(newPlan === "premium" || newPlan === "monthly" || newPlan === "quarterly" || newPlan === "sixMonth" || newPlan === "interview_gyani");
        setIsBasicPlan(newPlan === "basic");
        setIsOneDayPlan(newPlan === "oneDay");
        setIsQuarterlyPlan(newPlan === "quarterly");
        setIsSixMonthPlan(newPlan === "sixMonth" || newPlan === "premium");
        setIsInterviewPremium(newPlan === "sixMonth" || newPlan === "premium" || newPlan === "quarterly" || interviewPlan === "interview_gyani" || interviewPlan === "pro" || !!userData.hasInterviewKit);
        toast.success("Plan updated successfully!");
      } catch (error) {
        toast.error("Failed to update plan: " + error.message);
        throw error;
      }
    }
  };

  const value = {
    user,
    userData,
    loading,
    plan,
    isPremium,
    isBasicPlan,
    isOneDayPlan,
    isQuarterlyPlan,
    isSixMonthPlan,
    userData,
    interviewPlan,
    isInterviewPremium,
    signInWithGoogle,
    signInWithApple,
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
    handleLogout,
    updateUserPlan,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);