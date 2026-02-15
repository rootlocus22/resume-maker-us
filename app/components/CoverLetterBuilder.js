"use client";
import { useState, useEffect, useRef } from "react";
import { Save, Eye, ArrowRight, ArrowLeft, Check, Sparkles, FileText, Download, X } from "lucide-react";
import { coverLetterTemplates } from "../lib/coverLetterTemplate";
import CoverLetterPreview from "./CoverLetterPreview";
import toast, { Toaster } from "react-hot-toast";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cleanResumeDataForFirebase } from "../lib/utils";

const ENABLE_PAYMENTS = true;

export default function CoverLetterBuilder({
  initialData = {},
  initialTemplate = "executive",
  initialCustomColors = {},
  coverLetterId = null,
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateFromParams = searchParams.get("template") || initialTemplate;
  const resumeId = searchParams.get("resumeId");

  // Ensure we have a valid template
  const validTemplate = coverLetterTemplates[templateFromParams] ? templateFromParams : "executive";

  const [currentStep, setCurrentStep] = useState(1);
  const [coverLetterData, setCoverLetterData] = useState(initialData);
  const [template, setTemplate] = useState(validTemplate);
  const [customColors, setCustomColors] = useState(initialCustomColors);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfPreviewBlob, setPdfPreviewBlob] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [coverLetterName, setCoverLetterName] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [showPreviewOnMobile, setShowPreviewOnMobile] = useState(false);

  // Lock body scroll when mobile preview is open
  useEffect(() => {
    if (showPreviewOnMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPreviewOnMobile]);

  const steps = [
    { number: 1, title: "Personal Info", icon: FileText },
    { number: 2, title: "Job Details", icon: FileText },
    { number: 3, title: "Content", icon: FileText },
    { number: 4, title: "Preview & Download", icon: Eye }
  ];

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(true);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: currentUser.email || "anonymous",
            plan: "anonymous",
            premium_expiry: null,
            preview_count: 0,
          });
        }

        unsubscribeSnapshot = onSnapshot(userRef, (docSnapshot) => {
          const data = docSnapshot.data();
          setUserPlan(data?.plan || "free");
          setIsPremium(data?.plan === "premium" && (!data.premium_expiry || new Date() < new Date(data.premium_expiry)));
          setPreviewCount(data.preview_count || 0);
        });

        // Initialize fetchedResumeData
        let fetchedResumeData = {};

        // STRATEGY: Try localStorage first (fastest & most up-to-date for active session)
        if (typeof window !== "undefined") {
          const localResumeData = localStorage.getItem("resumeData");
          if (localResumeData) {
            try {
              fetchedResumeData = JSON.parse(localResumeData);
              console.log("👤 Loaded Resume Data from LocalStorage:", fetchedResumeData);
            } catch (e) {
              console.error("Error parsing local resume data:", e);
            }
          }
        }

        // Fallback to Firestore if localStorage is empty or missing data
        if (!fetchedResumeData.name && !fetchedResumeData.email) {
          if (resumeId) {
            const resumeRef = doc(db, "users", currentUser.uid, "resumes", resumeId);
            const resumeDoc = await getDoc(resumeRef);
            if (resumeDoc.exists()) {
              fetchedResumeData = resumeDoc.data().resumeData || {};
              // Update local state if we fetched simpler data
            }
          } else {
            // Fallback: Try to find the most recent resume
            try {
              const { getDocs, query, orderBy, limit, collection } = await import("firebase/firestore");
              const resumesRef = collection(db, "users", currentUser.uid, "resumes");
              const q = query(resumesRef, orderBy("updatedAt", "desc"), limit(1));
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                fetchedResumeData = querySnapshot.docs[0].data().resumeData || {};
              }
            } catch (e) {
              console.error("Failed to fetch default resume", e);
            }
          }
        }

        // Update state with whatever we found
        setResumeData(fetchedResumeData);

        if (coverLetterId) {
          const coverLetterRef = doc(db, "users", currentUser.uid, "coverLetters", coverLetterId);
          const coverLetterDoc = await getDoc(coverLetterRef);
          if (coverLetterDoc.exists()) {
            const savedData = coverLetterDoc.data();
            setCoverLetterData(savedData.coverLetterData || {});
            setCustomColors(savedData.customColors || {});
            setTemplate(savedData.template || templateFromParams);
            setCoverLetterName(savedData.coverLetterName || "");
            localStorage.removeItem("coverLetterDraft");
            toast.success("Loaded saved cover letter!");
          } else {
            toast.error("Cover letter not found!");
            router.push("/my-cover-letters");
          }
        } else {
          const savedDraft = typeof window !== "undefined" ? localStorage.getItem("coverLetterDraft") : null;

          // JOB CONTEXT LOADING (Fix Race Condition)
          let jobContextOverride = null;
          if (typeof window !== "undefined") {
            const storedContext = sessionStorage.getItem('currentJobContext');
            if (storedContext) {
              try {
                jobContextOverride = JSON.parse(storedContext);
                sessionStorage.removeItem('currentJobContext'); // Consume
                localStorage.removeItem('coverLetterDraft'); // Start fresh
                console.log("💼 Loaded Job Context:", jobContextOverride);
                setTimeout(() => toast.success(`Loaded: ${jobContextOverride.company}`, { icon: '💼', duration: 4000 }), 500);
                if (currentStep === 1) setTimeout(() => setCurrentStep(2), 800);
              } catch (e) { console.error(e); }
            }
          }

          const initialDataFromStorage = (savedDraft && !jobContextOverride) ? JSON.parse(savedDraft) : {};
          const defaultData = coverLetterTemplates[validTemplate]?.defaultData || coverLetterTemplates["executive"].defaultData || {};

          // Extract personal info from fetched resume (Resume Data is FLAT, not nested in personalInfo)
          // Priority: Resume Data -> User Profile -> Job/Defaults
          const resumeName = fetchedResumeData.name || user?.displayName || "";
          const resumeEmail = fetchedResumeData.email || user?.email || "";
          const resumePhone = fetchedResumeData.phone || "";
          const resumeAddress = fetchedResumeData.address || "";

          const completeDefaultData = {
            name: resumeName,
            email: resumeEmail,
            phone: resumePhone,
            location: resumeAddress,
            recipient: "Dear Hiring Manager",
            jobTitle: jobContextOverride?.jobTitle || defaultData.jobTitle || "",
            company: jobContextOverride?.company || defaultData.company || "",
            jobDescription: jobContextOverride?.jobDescription || jobContextOverride?.description || defaultData.jobDescription || "",
            intro: "",
            body: "",
            closing: "",
            ...initialDataFromStorage,
            ...initialData,
          };

          // Sanitize legacy defaults from storage
          if (completeDefaultData.name === "Michael Rodriguez" || completeDefaultData.name === "John Doe") {
            completeDefaultData.name = "";
            completeDefaultData.email = "";
            completeDefaultData.phone = "";
            completeDefaultData.location = "";
            // Also clear content if it matches legacy default
            completeDefaultData.intro = "";
            completeDefaultData.body = "";
            completeDefaultData.closing = "";
          }

          // Aggressive content sanitation: Check for known template strings
          const legacyStrings = ["GlobalTech Enterprises", "TechCorp Inc.", "InnovateTech", "TechFlow Inc.", "TechVision Corp."];
          if (legacyStrings.some(str => completeDefaultData.intro?.includes(str) || completeDefaultData.body?.includes(str))) {
            completeDefaultData.intro = "";
            completeDefaultData.body = "";
            completeDefaultData.closing = "";
            // Also clear associated fake company info if it matches

            if (completeDefaultData.company === "GlobalTech Enterprises" || completeDefaultData.company === "TechCorp Inc.") {
              completeDefaultData.company = "";
              completeDefaultData.jobTitle = "";
            }
          }

          // Force sanitation of recipient if it matches legacy default
          if (completeDefaultData.recipient === "Dear Board of Directors" || completeDefaultData.recipient === "Dear Sarah Johnson, Hiring Manager") {
            completeDefaultData.recipient = "Dear Hiring Manager";
          }

          setCoverLetterData(completeDefaultData);
        }
      } else {
        const storedPreviewCount = sessionStorage.getItem("anonymousPreviewCount") || 0;
        setIsPremium(false);
        setPreviewCount(parseInt(storedPreviewCount, 10));

        const savedDraft = typeof window !== "undefined" ? localStorage.getItem("coverLetterDraft") : null;

        // JOB CONTEXT LOADING (Fix Race Condition) - Non-Auth Path
        let jobContextOverride = null;
        if (typeof window !== "undefined") {
          const storedContext = sessionStorage.getItem('currentJobContext');
          if (storedContext) {
            try {
              jobContextOverride = JSON.parse(storedContext);
              sessionStorage.removeItem('currentJobContext'); // Consume
              localStorage.removeItem('coverLetterDraft'); // Start fresh
              console.log("💼 Loaded Job Context (Anon):", jobContextOverride);
              setTimeout(() => toast.success(`Loaded: ${jobContextOverride.company}`, { icon: '💼', duration: 4000 }), 500);
              if (currentStep === 1) setTimeout(() => setCurrentStep(2), 800);
            } catch (e) { console.error(e); }
          }
        }

        const initialDataFromStorage = (savedDraft && !jobContextOverride) ? JSON.parse(savedDraft) : {};
        const defaultData = coverLetterTemplates[validTemplate]?.defaultData || coverLetterTemplates["executive"].defaultData || {};

        // Extract personal info from fetched resume (Resume Data is FLAT)
        // For non-auth, we might not have user object, but fetchedResumeData might be populated from localStorage
        const resumeName = fetchedResumeData.name || user?.displayName || "";
        const resumeEmail = fetchedResumeData.email || user?.email || "";
        const resumePhone = fetchedResumeData.phone || "";
        const resumeAddress = fetchedResumeData.address || "";

        const completeDefaultData = {

          name: resumeName,
          email: resumeEmail,
          phone: resumePhone,
          location: resumeAddress,
          recipient: "Dear Hiring Manager",
          jobTitle: jobContextOverride?.jobTitle || defaultData.jobTitle || "",
          company: jobContextOverride?.company || defaultData.company || "",
          jobDescription: jobContextOverride?.jobDescription || jobContextOverride?.description || defaultData.jobDescription || "",
          intro: "",
          body: "",
          closing: "",
          ...initialDataFromStorage,
          ...initialData,
        };

        // Sanitize legacy defaults from storage
        if (completeDefaultData.name === "Michael Rodriguez" || completeDefaultData.name === "John Doe") {
          completeDefaultData.name = "";
          completeDefaultData.email = "";
          completeDefaultData.phone = "";
          completeDefaultData.location = "";
          // Also clear content if it matches legacy default
          completeDefaultData.intro = "";
          completeDefaultData.body = "";
          completeDefaultData.closing = "";
        }

        // Aggressive content sanitation: Check for known template strings
        const legacyStrings = ["GlobalTech Enterprises", "TechCorp Inc.", "InnovateTech", "TechFlow Inc.", "TechVision Corp."];
        if (legacyStrings.some(str => completeDefaultData.intro?.includes(str) || completeDefaultData.body?.includes(str))) {
          completeDefaultData.intro = "";
          completeDefaultData.body = "";
          completeDefaultData.closing = "";
          // Also clear associated fake company info if it matches

          if (completeDefaultData.company === "GlobalTech Enterprises" || completeDefaultData.company === "TechCorp Inc.") {
            completeDefaultData.company = "";
            completeDefaultData.jobTitle = "";
          }
        }

        // Force sanitation of recipient if it matches legacy default
        if (completeDefaultData.recipient === "Dear Board of Directors" || completeDefaultData.recipient === "Dear Sarah Johnson, Hiring Manager") {
          completeDefaultData.recipient = "Dear Hiring Manager";
        }

        setCoverLetterData(completeDefaultData);
      }

      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [coverLetterId, resumeId, validTemplate]);

  // Removed redundant useEffect to prevent race conditions

  const hasAutoGenerated = useRef(false);

  // Auto-generate content when data is ready
  useEffect(() => {
    const hasJobData = coverLetterData.jobTitle && coverLetterData.company;
    const hasResumeData = resumeData;

    // Check if content is empty OR contains legacy default headers
    const legacyStrings = ["GlobalTech", "TechCorp", "InnovateTech", "TechFlow", "TechVision", "[Position]", "[Company]"];
    const hasLegacyContent = legacyStrings.some(str =>
      (coverLetterData.intro || "").includes(str) ||
      (coverLetterData.body || "").includes(str)
    );

    const isContentEmpty = (!coverLetterData.intro && !coverLetterData.body && !coverLetterData.closing) || hasLegacyContent;

    const canGenerate = user && ['oneDay', 'basic', 'monthly', 'sixMonth', 'quarterly', 'yearly', 'premium'].includes(userPlan);

    // Only generate if:
    // 1. We haven't generated yet in this session
    // 2. We have job info and resume data
    // 3. The content fields are empty
    // 4. User has permission
    if (hasJobData && hasResumeData && isContentEmpty && canGenerate && !hasAutoGenerated.current) {
      console.log("Auto-generating cover letter content...");
      hasAutoGenerated.current = true;
      generateAIContent();
    }
  }, [coverLetterData.jobTitle, coverLetterData.company, resumeData, user, userPlan, coverLetterData.intro, currentStep]);

  // Force-correct recipient if it matches legacy default
  useEffect(() => {
    if (coverLetterData.recipient === "Dear Board of Directors") {
      setCoverLetterData(prev => ({ ...prev, recipient: "Dear Hiring Manager" }));
    }
  }, [coverLetterData.recipient]);

  // Update cover letter data when resume data becomes available
  useEffect(() => {
    // Check if we have valid resume data (either nested in personal or flat)
    const personalInfo = resumeData?.personal || resumeData;

    if (personalInfo && (personalInfo.name || personalInfo.email)) {
      setCoverLetterData(prev => ({
        ...prev,
        // Force overwrite defaults with resume data, checking both nested and flat structures
        name: personalInfo.name || prev.name || "",
        email: personalInfo.email || prev.email || "",
        phone: personalInfo.phone || prev.phone || "",
        location: personalInfo.location || personalInfo.address || prev.location || "",
      }));
    }
  }, [resumeData]);

  // Auto-save effect
  useEffect(() => {
    if (coverLetterData && Object.keys(coverLetterData).length > 0) {
      const timeoutId = setTimeout(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("coverLetterDraft", JSON.stringify(coverLetterData));
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [coverLetterData]);

  const generateAIContent = async () => {
    if (!coverLetterData.jobTitle || !coverLetterData.company) {
      toast.error("Please fill in Job Title and Company first!");
      return;
    }

    if (!user) {
      toast.error("Please log in to use AI content generation!");
      return;
    }

    const allowedPlans = ['oneDay', 'basic', 'monthly', 'sixMonth', 'quarterly', 'yearly', 'premium'];
    if (!allowedPlans.includes(userPlan)) {
      toast.error("AI generation is only available for paid plans. Please upgrade to access this feature.");
      return;
    }

    console.log("Generating AI content with:", { jobTitle: coverLetterData.jobTitle, company: coverLetterData.company, hasResume: !!resumeData });

    setIsGeneratingAI(true);

    try {
      const token = await user.getIdToken();

      const payload = {
        section: "all",
        jobTitle: coverLetterData.jobTitle,
        company: coverLetterData.company,
        jobDescription: coverLetterData.jobDescription,
        resumeData: resumeData || {},
        context: "cover_letter"
      };

      console.log("Sending payload:", payload);

      const response = await fetch("/api/generate-cover-letter-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate content");
      }

      const result = await response.json();
      console.log("AI Response:", result);

      if (result.success) {
        const updatedData = {
          ...coverLetterData,
          intro: result.intro || coverLetterData.intro,
          body: result.body || coverLetterData.body,
          closing: result.closing || coverLetterData.closing,
        };

        setCoverLetterData(updatedData);

        if (typeof window !== "undefined") {
          localStorage.setItem("coverLetterDraft", JSON.stringify(updatedData));
        }

        toast.success("Cover letter content generated successfully!");
        // Force move to step 3 if not already there, to show result
        if (currentStep < 3) setCurrentStep(3);
      } else {
        throw new Error(result.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("AI Content Generation Error:", error);
      toast.error(`Failed to generate content: ${error.message}`);
      // Allow retry if auto-gen failed
      if (hasAutoGenerated.current) hasAutoGenerated.current = false;
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (ENABLE_PAYMENTS && !isPremium && previewCount >= 1) {
      toast.error(
        "Preview limit reached. Get unlimited previews starting ₹199 (7 days)!",
        {
          duration: 6000,
          action: {
            label: 'Upgrade Now',
            onClick: () => window.location.href = '/checkout?billingCycle=basic'
          }
        }
      );
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const response = await fetch("/api/generate-cover-letter-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: coverLetterData,
          template,
          customColors,
          isPremium,
        }),
      });

      if (!response.ok) throw new Error(`Failed to generate PDF: ${await response.text()}`);

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(pdfUrl);
      setPdfPreviewBlob(pdfBlob);
      setIsPdfModalOpen(true);

      const currentUser = auth.currentUser;
      if (currentUser) {
        const coverLetterDataToSave = {
          coverLetterName: coverLetterName || `Cover Letter - ${coverLetterData.jobTitle || ""} (${new Date().toLocaleDateString()})`,
          coverLetterData: cleanResumeDataForFirebase(coverLetterData),
          template,
          customColors,
          createdAt: coverLetterId ? undefined : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (coverLetterId) {
          const coverLetterRef = doc(db, "users", currentUser.uid, "coverLetters", coverLetterId);
          await updateDoc(coverLetterRef, coverLetterDataToSave);
          toast.success("Cover letter updated successfully!");
        } else {
          const coverLetterRef = await addDoc(collection(db, "users", currentUser.uid, "coverLetters"), coverLetterDataToSave);
          router.push(`/cover-letter-builder?coverLetterId=${coverLetterRef.id}&template=${template}`);
          toast.success("Cover letter saved successfully!");
        }

        if (ENABLE_PAYMENTS) {
          setPreviewCount((prev) => {
            const newCount = prev + 1;
            updateDoc(doc(db, "users", currentUser.uid), { preview_count: newCount });
            return newCount;
          });
        }
      } else {
        setPreviewCount((prev) => {
          const newCount = prev + 1;
          sessionStorage.setItem("anonymousPreviewCount", newCount);
          return newCount;
        });
      }
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error(`PDF generation failed: ${error.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPDF = () => {
    if (pdfPreviewBlob) {
      const url = URL.createObjectURL(pdfPreviewBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${coverLetterData.jobTitle || 'cover-letter'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    }
  };

  const handleAIGenerateClick = () => {
    if (!user) {
      toast.error("Please log in to benefit from AI generation.");
      return;
    }
    const allowed = ['oneDay', 'basic', 'monthly', 'sixMonth', 'quarterly', 'yearly', 'premium'];
    if (!allowed.includes(userPlan)) {
      toast.error("Upgrade your plan to unlock AI generation.");
      return;
    }
    if (!coverLetterData.jobTitle || !coverLetterData.company) {
      toast.error("Job Title and Company are required.");
      return;
    }
    generateAIContent();
  };

  const handleSaveCoverLetter = async () => {
    if (!user) {
      toast.error("Please log in to save your cover letter!");
      return;
    }

    const name = coverLetterName.trim() || `Cover Letter - ${coverLetterData.jobTitle || ""} (${new Date().toLocaleDateString()})`;

    try {
      const coverLetterDataToSave = {
        coverLetterName: name,
        coverLetterData: cleanResumeDataForFirebase(coverLetterData),
        customColors,
        template,
        updatedAt: new Date().toISOString(),
      };

      if (coverLetterId) {
        const coverLetterRef = doc(db, "users", user.uid, "coverLetters", coverLetterId);
        await updateDoc(coverLetterRef, coverLetterDataToSave);
        toast.success("Cover letter updated successfully!");
      } else {
        coverLetterDataToSave.createdAt = new Date().toISOString();
        const coverLetterRef = await addDoc(collection(db, "users", user.uid, "coverLetters"), coverLetterDataToSave);
        router.push(`/cover-letter-builder?coverLetterId=${coverLetterRef.id}&template=${template}`);
        toast.success("Cover letter saved successfully!");
      }

      localStorage.removeItem("coverLetterDraft");
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save cover letter!");
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!coverLetterData.name || !coverLetterData.email) {
        toast.error("Please fill in your name and email!");
        return;
      }
    }
    if (currentStep === 2) {
      if (!coverLetterData.jobTitle || !coverLetterData.company) {
        toast.error("Please fill in job title and company!");
        return;
      }
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateField = (field, value) => {
    setCoverLetterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg via-white to-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-accent" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-white to-bg">

      {/* Custom Scrollbar Styles and Animations */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>

      {isGeneratingPdf && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-accent" />
            <p className="text-gray-800 text-lg font-medium">Generating your cover letter PDF...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-accent hover:text-accent/80 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Cover Letter Builder</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Create a professional cover letter in minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/my-cover-letters"
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-sm"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">My Letters</span>
              </Link>
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-accent px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all text-sm"
              >
                <Save size={16} />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${currentStep === step.number
                      ? "bg-primary text-white shadow-md"
                      : currentStep > step.number
                        ? "bg-accent text-white"
                        : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  <span className={`text-xs font-medium mt-1.5 text-center hidden sm:block ${currentStep === step.number ? "text-primary" : "text-gray-500"
                    }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 rounded transition-all ${currentStep > step.number ? "bg-accent" : "bg-gray-200"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 lg:px-12 xl:px-16 py-4 lg:py-6 pb-28 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Personal Information</h2>
                    <p className="text-sm text-gray-600">Let's start with your basic details</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={coverLetterData.name || ""}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-gray-50 focus:bg-white hover:border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={coverLetterData.email || ""}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-gray-50 focus:bg-white hover:border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={coverLetterData.phone || ""}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-gray-50 focus:bg-white hover:border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={coverLetterData.location || ""}
                        onChange={(e) => updateField("location", e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-gray-50 focus:bg-white hover:border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Job Details */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Job Details</h2>
                    <p className="text-sm text-gray-600">Tell us about the position you're applying for</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        Job Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={coverLetterData.jobTitle || ""}
                        onChange={(e) => updateField("jobTitle", e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-gray-50 focus:bg-white hover:border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        placeholder="Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={coverLetterData.company || ""}
                        onChange={(e) => updateField("company", e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-gray-50 focus:bg-white hover:border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        placeholder="Google"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient</label>
                      <input
                        type="text"
                        value={coverLetterData.recipient || ""}
                        onChange={(e) => updateField("recipient", e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all bg-gray-50 focus:bg-white hover:border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        placeholder="Dear Hiring Manager"
                      />
                    </div>

                    {/* AI Generate Option */}
                    {user && ['oneDay', 'basic', 'monthly', 'sixMonth', 'quarterly', 'yearly', 'premium'].includes(userPlan) && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-accent/20">
                        <div className="flex items-start gap-3 mb-3">
                          <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Content</h3>
                            <p className="text-sm text-gray-600">
                              Let AI generate a professional cover letter based on your details
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={generateAIContent}
                          disabled={isGeneratingAI || !coverLetterData.jobTitle || !coverLetterData.company}
                          className="w-full bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium shadow-md"
                        >
                          {isGeneratingAI ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate with AI
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Content */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Cover Letter Content</h2>
                        <p className="text-sm text-gray-600">Write or edit your cover letter content</p>
                      </div>

                      {/* AI Generate Button - Always Visible */}
                      <button
                        onClick={handleAIGenerateClick}
                        disabled={isGeneratingAI}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                        style={{ minWidth: '160px' }}
                      >
                        {isGeneratingAI ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                            <span>Writing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Generate with AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Introduction</label>
                      <textarea
                        value={coverLetterData.intro || ""}
                        onChange={(e) => updateField("intro", e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none bg-gray-50 focus:bg-white hover:border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        rows="3"
                        placeholder="I am writing to express my strong interest in the [Position] role at [Company]. With my background in..."
                      />
                      <p className="text-xs text-gray-500 mt-1.5">Start with a compelling opening that captures attention (2-3 sentences)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Body</label>
                      <textarea
                        value={coverLetterData.body || ""}
                        onChange={(e) => updateField("body", e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none bg-gray-50 focus:bg-white hover:border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        rows="4"
                        placeholder="In my current role at [Company], I successfully... My experience includes... I am particularly drawn to this opportunity because..."
                      />
                      <p className="text-xs text-gray-500 mt-1.5">Highlight your relevant experience and achievements (3-4 sentences)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Closing</label>
                      <textarea
                        value={coverLetterData.closing || ""}
                        onChange={(e) => updateField("closing", e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none bg-gray-50 focus:bg-white hover:border-gray-300 text-gray-900 placeholder-gray-400 text-sm"
                        rows="2"
                        placeholder="Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience align with your needs..."
                      />
                      <p className="text-xs text-gray-500 mt-1.5">End with gratitude and a clear call to action (2-3 sentences)</p>
                    </div>
                  </div>

                  {/* Content Tips */}
                  <div className="bg-primary/5 border border-accent/20 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900 text-xs mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      Quick Tips
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      <li>• Be specific and quantify achievements</li>
                      <li>• Match skills to job requirements</li>
                      <li>• Keep it concise (3-4 paragraphs)</li>
                      <li>• Proofread carefully</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 4: Template Selection */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Choose Your Style</h2>
                    <p className="text-sm text-gray-600">Select a professional template</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.keys(coverLetterTemplates).map((key) => {
                      const templateInfo = coverLetterTemplates[key];
                      const isSelected = template === key;
                      const isPremiumTemplate = templateInfo.premium && !isPremium;

                      return (
                        <button
                          key={key}
                          onClick={() => setTemplate(key)}
                          disabled={isPremiumTemplate}
                          className={`relative p-3 rounded-lg border-2 transition-all text-left group ${isSelected
                            ? "border-accent bg-accent/5 shadow-md"
                            : isPremiumTemplate
                              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                              : "border-gray-200 hover:border-accent/30 hover:bg-accent/5"
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${isSelected
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-600 group-hover:bg-accent/10"
                              }`}>
                              {key.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                                    {templateInfo.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                    {templateInfo.description}
                                  </p>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                                )}
                              </div>

                              {isPremiumTemplate && (
                                <div className="mt-2 inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md text-xs font-medium">
                                  <Sparkles className="w-3 h-3" />
                                  Premium
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Template Features Info */}
                  <div className="bg-primary/5 rounded-lg p-3 border border-border">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-xs mb-1">All templates include:</h4>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          <li>• ATS-optimized formatting</li>
                          <li>• Customizable colors</li>
                          <li>• Professional fonts</li>
                          <li>• Print-ready PDF output</li>
                        </ul>
                        {/* AI Generate Button - Bottom (Backup) */}
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={handleAIGenerateClick}
                            className="px-6 py-2 bg-accent/10 text-primary rounded-lg hover:bg-accent/20 transition-all flex items-center gap-2 text-sm font-semibold"
                          >
                            <Sparkles className="w-4 h-4" />
                            Regenerate Content
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons - Hidden on mobile, shown on desktop */}
              <div className="hidden lg:flex items-center justify-between mt-6 pt-4 border-t-2 border-gray-100">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-95 transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Generate PDF
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Preview (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">Live Preview</h3>
                  <p className="text-xs text-gray-500">See your cover letter in real-time</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 font-medium">Auto-saving</span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="bg-gray-100 overflow-auto p-4" style={{
                height: 'calc(100vh - 200px)',
                maxHeight: 'calc(100vh - 200px)'
              }}>
                <div className="bg-white shadow-md mx-auto" style={{ maxWidth: '210mm' }}>
                  <CoverLetterPreview
                    data={coverLetterData}
                    template={template}
                    customColors={customColors}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal - Slides from right */}
      {
        showPreviewOnMobile && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setShowPreviewOnMobile(false)}
            />

            {/* Modal Panel - Slides from right */}
            <div className="absolute inset-y-0 right-0 w-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-accent" />
                  <h3 className="text-base font-semibold text-gray-900">Live Preview</h3>
                </div>
                <button
                  onClick={() => setShowPreviewOnMobile(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close preview"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Preview Content - Full Width */}
              <div className="flex-1 overflow-auto bg-white">
                <CoverLetterPreview
                  data={coverLetterData}
                  template={template}
                  customColors={customColors}
                />
              </div>
            </div>
          </div>
        )
      }

      {/* PDF Preview Modal */}
      {
        isPdfModalOpen && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Your Cover Letter</h2>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* PDF Preview */}
              <div className="flex-1 overflow-auto p-6">
                <div className="flex justify-center">
                  <iframe
                    src={pdfPreviewUrl}
                    className="border-0 rounded-lg shadow-lg"
                    style={{
                      width: '794px',
                      maxWidth: '100%',
                      height: '60vh',
                      backgroundColor: 'white'
                    }}
                    title="PDF Preview"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:opacity-95 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Save Modal */}
      {
        isSaveModalOpen && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Save Cover Letter</h2>
              <p className="text-gray-600 mb-4">Give your cover letter a name to save it:</p>
              <input
                type="text"
                value={coverLetterName}
                onChange={(e) => setCoverLetterName(e.target.value)}
                placeholder="e.g., Software Engineer at Google"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all mb-6"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSaveModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCoverLetter}
                  className="flex-1 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Floating Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40 safe-area-inset-bottom" style={{
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="max-w-lg mx-auto px-3 py-2.5">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`h-1 flex-1 rounded-full transition-all ${currentStep >= step.number ? 'bg-accent' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm shadow-sm"
              style={{ minWidth: '80px' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs">Back</span>
            </button>

            {/* Preview Button */}
            <button
              onClick={() => setShowPreviewOnMobile(!showPreviewOnMobile)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm bg-primary/5 border border-accent/20 text-primary hover:bg-accent/10 active:bg-accent/20"
            >
              <Eye className="w-4 h-4" />
              <span className="text-xs font-semibold">Preview</span>
            </button>

            {/* Next/Generate Button */}
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 active:bg-primary transition-all text-sm shadow-md"
                style={{ minWidth: '80px' }}
              >
                <span className="text-xs">Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPdf}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-95 active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-md"
                style={{ minWidth: '100px' }}
              >
                <Download className="w-4 h-4" />
                <span className="text-xs">PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}
