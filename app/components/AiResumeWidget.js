"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bot, Sparkles, FileText, Check, ArrowRight, Lock, Loader2, Maximize2, X, Download } from "lucide-react";
import toast from "react-hot-toast";
import ResumePreview from "./ResumePreview";
import OnePagerPreview from "./OnePagerPreview";
import PremiumPdfPreview from "./PremiumPdfPreview";
import ProgressOverlay from "./ProgressOverlay";
import { savePreAuthState, DEFAULT_RESUME_DATA } from "../lib/storage";
import { useAuth } from "../context/AuthContext";

export default function AiResumeWidget() {
    const router = useRouter();
    // ... items ...

    // Mock event tracking for PremiumPdfPreview
    const event = ({ action, category, label }) => {
        console.log("Track Event:", { action, category, label });
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
    };

    const handleUpgradeClick = (cycle) => {
        router.push(`/checkout?billingCycle=${cycle}`);
    };
    const [inputText, setInputText] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [generatedData, setGeneratedData] = useState(null);
    const [step, setStep] = useState(1); // 1: Input, 2: Preview

    // Default settings for the preview
    const previewSettings = {
        template: "onepager_bold", // "One-Pager: Bold Impact"
        customColors: {
            primary: "#000000", // Bold Impact often looks best with strong contrasting colors
            secondary: "#333333",
            text: "#1F2937",
            background: "#FFFFFF"
        },
        preferences: {
            layout: {
                sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
                columns: 1
            },
            typography: {
                fontSize: "11pt"
            }
        },
        language: "en",
        country: "us"
    };

    const normalizeGeminiData = (rawData) => {
        if (!rawData) return null;

        // 1. Transform Personal Info
        // API returns top-level fields, Template expects nested 'personal' object
        const personal = {
            name: rawData.name || rawData.personal?.name || "",
            jobTitle: rawData.jobTitle || rawData.personal?.jobTitle || "",
            email: rawData.email || rawData.personal?.email || "",
            phone: rawData.phone || rawData.personal?.phone || "",
            location: rawData.address || rawData.location || rawData.personal?.location || "",
            linkedin: rawData.linkedin || rawData.personal?.linkedin || "",
            portfolio: rawData.portfolio || rawData.personal?.portfolio || ""
        };

        // 2. Transform Skills
        // API returns [{ name: "Skill", ... }], Template expects ["Skill", ...]
        const skills = Array.isArray(rawData.skills)
            ? rawData.skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)
            : [];

        // 3. Transform Experience
        // API returns { jobTitle, ... }, Template expects { title, ... }
        const experience = Array.isArray(rawData.experience)
            ? rawData.experience.map(exp => ({
                ...exp,
                title: exp.jobTitle || exp.title || "",
                // Ensure dates are strings
                startDate: exp.startDate || "",
                endDate: exp.endDate || ""
            }))
            : [];

        // 4. Transform Education
        // API returns { endDate, ... }, Template expects { graduationDate, ... }
        const education = Array.isArray(rawData.education)
            ? rawData.education.map(edu => ({
                ...edu,
                graduationDate: edu.endDate || edu.graduationDate || ""
            }))
            : [];

        return {
            ...rawData,
            personal,
            skills,
            experience,
            education
        };
    };

    const handleParse = async () => {
        const text = inputText.trim();
        const MIN_LENGTH = 100;
        const MAX_LENGTH = 25000;

        if (!text) {
            toast.error("Please enter some text first");
            return;
        }

        if (text.length < MIN_LENGTH) {
            toast.error(`Text is too short. Please enter at least ${MIN_LENGTH} characters.`);
            return;
        }

        if (text.length > MAX_LENGTH) {
            toast.error(`Text is too long. Please limit to ${MAX_LENGTH} characters.`);
            return;
        }

        setIsParsing(true);
        try {
            const response = await fetch("/api/gemini-parse-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: inputText }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to parse resume text");
            }

            const rawData = await response.json();
            const normalizedData = normalizeGeminiData(rawData);

            setGeneratedData(normalizedData);
            setStep(2);
            toast.success("Resume generated successfully!");
        } catch (error) {
            console.error("Error parsing text:", error);
            toast.error(error.message || "Failed to generate resume. Please try again.");
        } finally {
            setIsParsing(false);
        }
    };

    const { user } = useAuth();
    const [progressMessage, setProgressMessage] = useState("Initializing...");
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);

    // Progress messages cycling
    useEffect(() => {
        if (!isGeneratingPdf) return;

        const messages = [
            "Preparing your resume...",
            "Formatting layout...",
            "Optimizing for ATS...",
            "Generating PDF...",
            "Finalizing download..."
        ];

        let currentIndex = 0;
        setProgressMessage(messages[0]);

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % messages.length;
            setProgressMessage(messages[currentIndex]);
        }, 800);

        return () => clearInterval(interval);
    }, [isGeneratingPdf]);

    const handleDownloadPDF = async () => {
        if (!user) {
            // Save state for restoration after login
            if (generatedData) {
                savePreAuthState(
                    generatedData,
                    "free_ai_widget",
                    {
                        source: "free_ai_widget",
                        template: previewSettings.template
                    }
                );
            }
            toast.error("Please log in to download your resume");
            router.push("/login?returnUrl=/resume-builder");
            return;
        }

        setIsGeneratingPdf(true);
        try {
            // Map template name for one-pager API (remove 'onepager_' prefix)
            const templateName = previewSettings.template.replace('onepager_', '');

            const response = await fetch("/api/download-one-pager", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: generatedData,
                    template: templateName, // Pass mapped template name
                    wrapperClass: previewSettings.template // Pass original for any specific wrapper logic if needed
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to generate PDF");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setPdfPreviewUrl(url);
            setShowPdfModal(true);
            toast.success("PDF generated successfully!");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error(error.message || "Failed to generate PDF");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // handleEditAndDownload removed as per request

    return (
        <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Header Widget Area */}
            {/* ... (existing header code) ... */}

            <div className="bg-gradient-to-r from-primary to-accent p-6 md:p-8 text-white text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-3">
                    <Bot size={32} />
                    Free AI Resume Builder
                </h2>
                <p className="opacity-90 max-w-2xl mx-auto">
                    Paste your LinkedIn profile or old resume text below, and watch our AI professionally format it in seconds.
                </p>
            </div>

            <div className="p-4 md:p-8 bg-gray-50">
                {step === 1 ? (
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-6 relative">
                            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-primary shadow-sm border border-border flex items-center gap-1">
                                <FileText size={12} />
                                Paste Resume Content
                            </div>
                            <textarea
                                className="w-full h-80 p-6 pt-12 text-base border border-gray-300 rounded-xl focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all resize-none shadow-sm"
                                placeholder="Paste your resume text here...
Example:
John Doe
Software Engineer
Experience: 3 years at Tech Co..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <div className="text-right mt-2 text-xs text-gray-500">
                                {inputText.length} chars
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
                            <button
                                onClick={handleParse}
                                disabled={isParsing || !inputText.trim()}
                                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isParsing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                        Analyzing & Formatting...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Generate Resume Now
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                                <Check size={14} className="text-green-500" />
                                <span>ATS Friendly</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                                <Check size={14} className="text-green-500" />
                                <span>Professional Formatting</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                                <Check size={14} className="text-green-500" />
                                <span>Instant Preview</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[850px]">
                        {/* Sidebar / Actions - Stack on mobile */}
                        <div className="w-full lg:w-1/4 flex flex-col justify-center space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-4 text-green-600 font-semibold bg-green-50 p-3 rounded-lg border border-green-100">
                                    <Check size={20} />
                                    Resume Generated Successfully!
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Your resume has been parsed and formatted. You can now edit the details, change the template, and download the final PDF in our advanced editor.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isGeneratingPdf}
                                        className="w-full py-3.5 bg-accent-600 text-white rounded-lg font-bold hover:bg-accent-700 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isGeneratingPdf ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Download size={18} />
                                        )}
                                        {isGeneratingPdf ? "Generating PDF..." : "Download PDF Now"}
                                    </button>

                                    <button
                                        onClick={() => setStep(1)}
                                        className="w-full py-2.5 text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Try Different Text
                                    </button>
                                </div>
                            </div>

                            <div className="bg-primary/5 p-5 rounded-xl border border-accent/20">
                                <h4 className="font-semibold text-primary mb-2">What happens next?</h4>
                                <ul className="space-y-2 text-sm text-[#475569]">
                                    <li className="flex items-start gap-2">
                                        <span className="bg-accent/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                                        You&apos;ll be redirected to the full editor
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-accent/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                                        Your data will be pre-loaded accurately
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-accent/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                                        You can customize colors, fonts &amp; templates
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Preview Area - WIDER COLUMN */}
                        <div className="w-full lg:w-3/4 h-[500px] lg:h-auto bg-slate-100 rounded-xl overflow-hidden relative shadow-inner border border-gray-200 group">
                            <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar">
                                {previewSettings.template === 'onepager_bold' ? (
                                    <div className="bg-white min-h-[11in] shadow-2xl origin-top transform scale-[0.50] sm:scale-[0.60] md:scale-[0.85] lg:scale-[0.90] transition-transform duration-300 mx-auto mt-8">
                                        <OnePagerPreview
                                            data={generatedData}
                                            template="bold"
                                            customColors={previewSettings.customColors}
                                            language={previewSettings.language}
                                            country={previewSettings.country}
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-white min-h-[11in] shadow-2xl origin-top transform scale-[0.50] sm:scale-[0.60] md:scale-[0.85] lg:scale-[0.90] transition-transform duration-300 mx-auto mt-8">
                                        <ResumePreview
                                            data={generatedData}
                                            template={previewSettings.template}
                                            customColors={previewSettings.customColors}
                                            preferences={previewSettings.preferences}
                                            language={previewSettings.language}
                                            country={previewSettings.country}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Full Screen Button (Mobile Only) */}
                            <button
                                onClick={() => setIsFullScreen(true)}
                                className="absolute top-4 right-4 z-20 bg-white p-2.5 rounded-full shadow-lg border border-gray-200 text-gray-700 hover:text-accent lg:hidden transition-transform active:scale-95"
                                title="Full Screen View"
                            >
                                <Maximize2 size={20} />
                            </button>

                            {/* Watermark Overlay */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 transform -rotate-12">
                                    <div className="text-xl sm:text-3xl font-black text-gray-300 select-none">
                                        PREVIEW MODE
                                    </div>
                                </div>
                            </div>

                            {/* Gradient Overlay at Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-gray-900/10 to-transparent pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Progress Overlays */}
                <ProgressOverlay isVisible={isParsing} type="ai" />
                <ProgressOverlay isVisible={isGeneratingPdf} type="download" />

                {/* Secure PDF Preview Modal */}
                <PremiumPdfPreview
                    isOpen={showPdfModal}
                    onClose={() => setShowPdfModal(false)}
                    pdfPreviewUrl={pdfPreviewUrl}
                    user={user}
                    isPremium={false} // Component handles effective premium check
                    handleUpgradeClick={handleUpgradeClick}
                    event={event}
                    toast={toast}
                    resumeName={generatedData?.personal?.name ? `${generatedData.personal.name} Resume` : "Resume"}
                />
            </div>

            {/* Full Screen Modal */}
            {/* Full Screen Modal - Mobile Bottom Bar Design */}
            {isFullScreen && (
                <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-in slide-in-from-bottom-5 duration-300">

                    {/* Minimal Top Bar */}
                    <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-end pointer-events-none">
                        <button
                            onClick={() => setIsFullScreen(false)}
                            className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 text-gray-500 hover:text-gray-900 pointer-events-auto"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100 flex items-start justify-center pt-8 pb-32">
                        <div className="min-h-full flex items-start justify-center pt-4 pb-20">
                            {/* Render scaled-up preview for mobile */}
                            {previewSettings.template === 'onepager_bold' ? (
                                <div className="bg-white shadow-2xl origin-top transform scale-[0.65] sm:scale-[0.85] mb-8">
                                    <OnePagerPreview
                                        data={generatedData}
                                        template="bold"
                                        customColors={previewSettings.customColors}
                                        language={previewSettings.language}
                                        country={previewSettings.country}
                                    />
                                </div>
                            ) : (
                                <div className="bg-white shadow-2xl origin-top transform scale-[0.65] sm:scale-[0.85] mb-8">
                                    <ResumePreview
                                        data={generatedData}
                                        template={previewSettings.template}
                                        customColors={previewSettings.customColors}
                                        preferences={previewSettings.preferences}
                                        language={previewSettings.language}
                                        country={previewSettings.country}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Bottom Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 pb-8 flex flex-col gap-3 z-50 rounded-t-2xl">
                        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-2 opacity-50"></div>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPdf}
                            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            {isGeneratingPdf ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                            {user ? "Download Final PDF" : "Download PDF Now"}
                        </button>
                    </div>
                </div>
            )
            }
        </div >
    );
}
