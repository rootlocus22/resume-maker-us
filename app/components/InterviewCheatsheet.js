"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Brain,
  MessageCircle,
  Crown,
  Lock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import jsPDF from "jspdf";

export default function InterviewCheatsheet({
  jobDescription: initialJobDescription = "",
  resumeData: initialResumeData = null,
  standalone = false
}) {
  const { user, isPremium } = useAuth();
  const router = useRouter();

  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [resumeData, setResumeData] = useState(initialResumeData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cheatsheet, setCheatsheet] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [remainingCheatsheets, setRemainingCheatsheets] = useState(0);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set([0])); // First question expanded by default
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [savedJDs, setSavedJDs] = useState([]);
  const [selectedJDId, setSelectedJDId] = useState("");
  const [isLoadingJDs, setIsLoadingJDs] = useState(false);

  // Fetch saved JDs when user is available
  useEffect(() => {
    if (user && standalone) {
      fetchSavedJDs();
    }
  }, [user, standalone]);

  const fetchSavedJDs = async () => {
    if (!user) return;

    setIsLoadingJDs(true);
    try {
      const response = await fetch(`/api/get-saved-job-descriptions?userId=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setSavedJDs(data.jobDescriptions || []);
      }
    } catch (error) {
      console.error("Error fetching saved JDs:", error);
    } finally {
      setIsLoadingJDs(false);
    }
  };

  const handleSelectSavedJD = async (jdId) => {
    const selected = savedJDs.find(jd => jd.id === jdId);
    if (selected) {
      setJobDescription(selected.jobDescription);
      setSelectedJDId(jdId);

      // Update last used timestamp
      try {
        await fetch(`/api/save-job-description`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            jobDescription: selected.jobDescription,
            source: selected.source,
            jobTitle: selected.jobTitle,
            company: selected.company,
          }),
        });
      } catch (error) {
        console.error("Error updating JD timestamp:", error);
      }
    }
  };

  // Load data from sessionStorage if available
  useEffect(() => {
    if (standalone && typeof window !== "undefined") {
      const savedJD = sessionStorage.getItem("interview_jd");
      const savedResume = sessionStorage.getItem("interview_resume");

      if (savedJD && !initialJobDescription) {
        setJobDescription(savedJD);
        // Clear after loading
        sessionStorage.removeItem("interview_jd");
      }

      if (savedResume && !initialResumeData) {
        try {
          const parsed = JSON.parse(savedResume);
          setResumeData(parsed);
          sessionStorage.removeItem("interview_resume");
        } catch (e) {
          console.error("Error parsing saved resume data:", e);
        }
      }
    }
  }, [standalone, initialJobDescription, initialResumeData]);

  // Check user's cheatsheet access on mount
  useEffect(() => {
    checkCheatsheetAccess();
  }, [user]);

  const checkCheatsheetAccess = async () => {
    if (!user) {
      setIsLoadingAccess(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cheatsheetsRemaining = userData.interviewCheatsheetsRemaining || 0;
        const hasUnlimitedAccess = userData.unlimitedInterviewCheatsheets || false;

        // Check for subscription-based plan (Interview Kit)
        const hasActiveSubscription = userData.hasInterviewKit === true &&
          userData.interviewKitExpiry &&
          new Date(userData.interviewKitExpiry) > new Date();

        setRemainingCheatsheets(cheatsheetsRemaining);
        setHasAccess(hasUnlimitedAccess || cheatsheetsRemaining > 0 || hasActiveSubscription);
      }
    } catch (error) {
      console.error("Error checking cheatsheet access:", error);
    } finally {
      setIsLoadingAccess(false);
    }
  };

  const handleGenerateCheatsheet = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste the job description first");
      return;
    }

    if (!user) {
      toast.error("Please sign in to generate interview prep kits");
      router.push("/login");
      return;
    }

    if (!hasAccess && !isLoadingAccess) {
      toast.error("Please purchase Interview Prep Kit credits to continue");
      router.push("/interview-prep-kit-pricing");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-interview-cheatsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeData: resumeData || {},
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate cheatsheet");
      }

      const data = await response.json();
      setCheatsheet(data);

      // Update remaining cheatsheets locally
      if (remainingCheatsheets > 0) {
        setRemainingCheatsheets(prev => prev - 1);
        setHasAccess(remainingCheatsheets - 1 > 0);
      }

      toast.success("✨ Interview Prep Kit generated successfully!");
    } catch (error) {
      console.error("Error generating cheatsheet:", error);
      toast.error(error.message || "Failed to generate prep kit. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const copyAnswer = (answer, index) => {
    navigator.clipboard.writeText(answer);
    setCopiedIndex(index);
    toast.success("Answer copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadPDF = () => {
    if (!cheatsheet) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 15;
    const lineHeight = 7;
    let yPosition = margin;

    // Title
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Interview Prep Kit", margin, yPosition);
    yPosition += 10;

    // Job Title
    if (cheatsheet.jobTitle) {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Position: ${cheatsheet.jobTitle}`, margin, yPosition);
      yPosition += 8;
    }

    // Generated date
    pdf.setFontSize(9);
    pdf.setTextColor(128);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 10;
    pdf.setTextColor(0);

    // Questions and Answers
    cheatsheet.questions.forEach((qa, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      // Question
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(37, 99, 235); // Blue color
      const questionLines = pdf.splitTextToSize(
        `Q${index + 1}: ${qa.question}`,
        pageWidth - 2 * margin
      );
      questionLines.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 2;

      // Answer
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0);
      const answerLines = pdf.splitTextToSize(qa.answer, pageWidth - 2 * margin);
      answerLines.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 8;
    });

    // Footer
    const footerText = "Generated by ExpertResume.us";
    pdf.setFontSize(8);
    pdf.setTextColor(128);
    pdf.text(
      footerText,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    pdf.save(`interview-prep-kit-${Date.now()}.pdf`);
    toast.success("📄 Prep Kit downloaded successfully!");
  };

  if (standalone && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to generate interview cheatsheets
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={standalone ? "min-h-screen bg-gray-50 py-8 px-4" : ""}>
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg p-6 sm:p-8 mb-6 text-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-8 h-8 sm:w-10 sm:h-10" />
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Interview Prep Kit Generator
                </h1>
              </div>
              <p className="text-white/80 text-sm sm:text-base mb-4">
                Get 20 likely interview questions with perfect answers based on your resume
              </p>

              {!isLoadingAccess && user && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {remainingCheatsheets > 0
                      ? `${remainingCheatsheets} Credits Remaining`
                      : (hasAccess ? "Active Subscription" : "No Credits - Purchase to Continue")}
                  </span>
                </div>
              )}
            </div>

            {user && !hasAccess && (
              <button
                onClick={() => router.push("/interview-cheatsheet-pricing")}
                className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors text-sm whitespace-nowrap ml-4"
              >
                Buy Credits
              </button>
            )}
          </div>
        </motion.div>

        {/* Input Section */}
        {!cheatsheet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold text-gray-900">
                  Job Description
                </h2>
              </div>

              {savedJDs.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {savedJDs.length} saved JD{savedJDs.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Saved JDs Dropdown */}
            {savedJDs.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select from your saved job descriptions
                </label>
                <select
                  value={selectedJDId}
                  onChange={(e) => handleSelectSavedJD(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-white"
                  disabled={isGenerating || isLoadingJDs}
                >
                  <option value="">-- Or paste a new job description below --</option>
                  {savedJDs.map((jd) => (
                    <option key={jd.id} value={jd.id}>
                      {jd.jobTitle || "Untitled Position"}
                      {jd.company ? ` at ${jd.company}` : ""}
                      {" "}({new Date(jd.lastUsed).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setSelectedJDId(""); // Clear selection when typing
              }}
              placeholder="Paste the complete job description here...&#10;&#10;Include: Job title, responsibilities, requirements, qualifications, skills needed, etc."
              className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
              disabled={isGenerating}
            />

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerateCheatsheet}
                disabled={isGenerating || !jobDescription.trim() || (user && !hasAccess)}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white px-6 py-4 rounded-lg font-bold text-lg hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Interview Prep Kit
                  </>
                )}
              </button>
            </div>

            {user && !hasAccess && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">
                      No credits remaining. Purchase interview prep kit credits to continue.
                    </p>
                    <button
                      onClick={() => router.push("/interview-cheatsheet-pricing")}
                      className="mt-2 text-sm text-amber-700 font-semibold hover:text-amber-900 underline"
                    >
                      View Pricing →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Prep Kit Results */}
        {cheatsheet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-bold text-gray-900">Prep Kit Ready!</h3>
                  <p className="text-sm text-gray-600">{cheatsheet.questions.length} questions generated</p>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setCheatsheet(null);
                    setJobDescription("");
                  }}
                  className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Generate New
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 sm:flex-none bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {cheatsheet.questions.map((qa, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full p-4 sm:p-6 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-accent/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base break-words">
                            {qa.question}
                          </h3>
                          {qa.category && (
                            <span className="inline-block mt-2 text-xs font-medium text-primary bg-accent/5 px-2 py-1 rounded">
                              {qa.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedQuestions.has(index) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedQuestions.has(index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100"
                      >
                        <div className="p-4 sm:p-6 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-accent" />
                              Your Answer:
                            </h4>
                            <button
                              onClick={() => copyAnswer(qa.answer, index)}
                              className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1"
                            >
                              {copiedIndex === index ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                            {qa.answer}
                          </p>

                          {qa.tips && qa.tips.length > 0 && (
                            <div className="mt-4 bg-primary/5 border border-border rounded-lg p-4">
                              <h5 className="font-semibold text-primary text-sm mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Pro Tips:
                              </h5>
                              <ul className="space-y-1 text-xs sm:text-sm text-[#475569]">
                                {qa.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="flex items-start gap-2">
                                    <span className="text-accent flex-shrink-0">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

