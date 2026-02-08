"use client";
import { Brain, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function InterviewCheatsheetCTA({ 
  jobDescription = "", 
  resumeData = null, 
  compact = false,
  className = "" 
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user already has interview cheatsheet access
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const remaining = userData.interviewCheatsheetsRemaining || 0;
          
          // Hide if user has remaining cheatsheets or unlimited access
          if (remaining > 0 || remaining === -1) {
            setHasAccess(true);
          }
        }
      } catch (error) {
        console.error("Error checking cheatsheet access:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user]);

  const handleClick = () => {
    // Store data in sessionStorage for the interview prep kit page
    if (jobDescription) {
      sessionStorage.setItem("interview_jd", jobDescription);
    }
    if (resumeData) {
      sessionStorage.setItem("interview_resume", JSON.stringify(resumeData));
    }
    router.push("/interview-prep-kit");
  };

  // Don't show if user already has access
  if (isLoading || hasAccess) {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white rounded-lg font-semibold hover:opacity-95 transition-all shadow-md hover:shadow-lg ${className}`}
      >
        <Brain className="w-4 h-4" />
        <span className="text-sm">Interview Prep</span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md p-4 text-white ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold mb-1">🎯 Interview Prep Kit</h3>
            <p className="text-sm text-white/90 line-clamp-1">
              20 likely questions with winning answers tailored for you
            </p>
          </div>
        </div>
        
        <button
          onClick={handleClick}
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md flex-shrink-0 text-sm"
        >
          Get Yours
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

