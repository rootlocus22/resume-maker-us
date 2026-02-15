"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, ArrowLeft, Shield, Crown } from "lucide-react";

export default function TeamMemberRoute({ children, fallbackPath = "/dashboard/professional" }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Give auth context time to initialize (prevents flash of login page)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isCheckingAuth) return; // Wait for auth to initialize
    
    if (!user) {
      console.log('🔒 No user - redirecting');
      setShouldRedirect(true);
      setLoading(false);
      return;
    }

    console.log('✅ User authenticated, checking access:', user.uid);
    loadUserProfile();
  }, [user, isCheckingAuth]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`/api/get-user-profile?uid=${user.uid}`);
      const data = await response.json();
      
      if (response.ok) {
        setUserProfile(data);
        
        // Allow access for:
        // 1. Team members
        const isTeamMember = data.isTeamMember === true || 
                             data.teamProfile?.role === "team_member" || 
                             data.userType === "team_member";
        
        // 2. Admins with enterprise accounts
        const isAdmin = data.professionalProfile?.role === "admin" || 
                       data.role === "admin";
        const isEnterpriseUser = data.isEnterpriseUser === true;
        
        if (isTeamMember || (isAdmin && isEnterpriseUser)) {
          // Allow access for both team members and enterprise admins
          setLoading(false);
        } else {
          // Not authorized - redirect
          setShouldRedirect(true);
          setLoading(false);
        }
      } else {
        console.error("Error loading user profile:", data.error);
        setShouldRedirect(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setShouldRedirect(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldRedirect) {
      router.push(fallbackPath);
    }
  }, [shouldRedirect, router, fallbackPath]);

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-accent-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg"
          >
            <Crown size={32} className="text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isCheckingAuth ? "Loading Your Workspace" : "Checking Access Permissions"}
          </h3>
          <p className="text-gray-600">
            {isCheckingAuth ? "Preparing your enterprise workspace..." : "Verifying your access..."}
          </p>
        </motion.div>
      </div>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            This page is only accessible to team members. You'll be redirected to your dashboard.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(fallbackPath)}
            className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-600 transition-colors font-semibold flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // User is a team member, render the children
  return children;
}
