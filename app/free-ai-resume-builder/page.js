export const metadata = {
    title: "Free AI Resume Builder for US Jobs | Text to Resume Instantly",
    description: "Build a professional, ATS-friendly resume in seconds. Paste your text, LinkedIn profile, or old resume — our AI formats it for US job applications. No sign-up required to preview.",
    keywords: "free ai resume builder, convert text to resume, ai resume generator, ats resume builder, instant resume formatter, linkedin to resume, text to pdf resume, resume maker us, free cv builder, us job resume",
    alternates: {
        canonical: "https://expertresume.us/free-ai-resume-builder",
    },
};

import AiResumeWidget from "../components/AiResumeWidget";
import Link from "next/link";
import { Sparkles, CheckCircle, FileText, Download, X, Lightbulb, Quote, Target } from "lucide-react";

export default function FreeAiResumeBuilderPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
            {/* Hero Section — navy + teal, same as home */}
            <section className="relative bg-gradient-to-br from-[#050F20] via-[#0B1F3B] to-[#071429] text-white pb-32 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute top-10 left-10 w-24 h-24 bg-[#00C4B3]/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#00C4B3]/15 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm mb-6 backdrop-blur-sm">
                        <Target size={16} className="text-[#00C4B3]" />
                        <span>AI-Powered &middot; Built for US Jobs</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                        Turn Text into a <span className="text-[#00C4B3]">Professional Resume</span>
                    </h1>
                    <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-2 font-light">
                        Paste your old resume, LinkedIn profile, or rough notes.
                    </p>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
                        Our AI instantly formats it into an ATS-optimized PDF — ready for US job applications.
                    </p>
                    <p className="text-sm text-gray-400">
                        Already have a resume?{" "}
                        <Link href="/upload-resume" className="text-[#00C4B3] hover:text-[#00C4B3]/80 underline underline-offset-2">Upload &amp; optimize it</Link>
                        {" "}or{" "}
                        <Link href="/ats-score-checker" className="text-[#00C4B3] hover:text-[#00C4B3]/80 underline underline-offset-2">check your ATS score</Link>.
                    </p>
                </div>
            </section>

            {/* Widget Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-20 relative z-10">
                <AiResumeWidget />
            </div>

            {/* Comparison Section: AI vs Manual */}
            <div className="py-16 bg-white border-t border-[#E5E7EB]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-[#0F172A] mb-12">Why Choose AI Over Manual Formatting?</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Manual Way */}
                        <div className="p-6 rounded-2xl bg-red-50 border border-red-100">
                            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                                <X size={24} /> The Old Way (Manual)
                            </h3>
                            <ul className="space-y-3 text-red-800/80">
                                <li className="flex gap-2"><X size={16} className="mt-1 flex-shrink-0" /> Hours spent adjusting margins & fonts</li>
                                <li className="flex gap-2"><X size={16} className="mt-1 flex-shrink-0" /> Struggling with complex Word templates</li>
                                <li className="flex gap-2"><X size={16} className="mt-1 flex-shrink-0" /> Risk of "thin content" or weak phrasing</li>
                                <li className="flex gap-2"><X size={16} className="mt-1 flex-shrink-0" /> Often rejected by US ATS software</li>
                            </ul>
                        </div>

                        {/* AI Way */}
                        <div className="p-6 rounded-2xl bg-[#00C4B3]/5 border border-[#00C4B3]/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Sparkles size={100} className="text-[#00C4B3]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0B1F3B] mb-4 flex items-center gap-2">
                                <Sparkles size={24} className="text-[#00C4B3]" /> The ExpertResume Way (AI)
                            </h3>
                            <ul className="space-y-3 text-[#0F172A]/80 font-medium">
                                <li className="flex gap-2"><CheckCircle size={16} className="mt-1 text-[#00C4B3] flex-shrink-0" /> Done in seconds, not hours</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="mt-1 text-[#00C4B3] flex-shrink-0" /> Perfect formatting automatically</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="mt-1 text-[#00C4B3] flex-shrink-0" /> AI suggests professional keywords for US roles</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="mt-1 text-[#00C4B3] flex-shrink-0" /> 100% ATS-Friendly for Workday, Greenhouse & Lever</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pro Tips Section */}
            <div className="py-16 bg-[#0B1F3B] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="bg-[#00C4B3]/20 p-3 rounded-xl">
                            <Lightbulb size={32} className="text-[#00C4B3]" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Pro Tips for Best Results</h2>
                            <p className="text-white/70">Get the most out of our AI engine with these simple tricks.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/10 p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                            <h4 className="font-bold text-lg mb-2 text-[#00C4B3]">Use LinkedIn Data</h4>
                            <p className="text-sm text-white/80">Go to your LinkedIn profile, copy your entire &apos;About&apos; and &apos;Experience&apos; sections, and paste them directly. The AI loves structured data like that!</p>
                        </div>
                        <div className="bg-white/10 p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                            <h4 className="font-bold text-lg mb-2 text-[#00C4B3]">Don&apos;t Worry About Format</h4>
                            <p className="text-sm text-white/80">Paste messy bullet points or even paragraphs. The AI will convert them into clean, punchy bullet points automatically.</p>
                        </div>
                        <div className="bg-white/10 p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                            <h4 className="font-bold text-lg mb-2 text-[#00C4B3]">Include Numbers</h4>
                            <p className="text-sm text-white/80">Mentioning metrics (e.g., &quot;Increased sales by 20%&quot;) helps the AI highlight your achievements more effectively.</p>
                        </div>
                        <div className="bg-white/10 p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                            <h4 className="font-bold text-lg mb-2 text-[#00C4B3]">Review Before Download</h4>
                            <p className="text-sm text-white/80">Always use the &apos;Edit&apos; button after generation to fine-tune specific details or add a personal touch.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials (Trust Signals) */}
            <div className="py-20 bg-[#F8FAFC]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-[#0F172A] mb-12">Trusted by 10,000+ US Job Seekers</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                text: "I pasted my messy notes and boom — a perfect resume in 30 seconds. I got an interview call from a FAANG recruiter the next day!",
                                author: "Sarah K.",
                                role: "Software Engineer, Bay Area"
                            },
                            {
                                text: "Way better than the paid tools I've used. The LinkedIn import feature is a lifesaver for quick applications.",
                                author: "Michael T.",
                                role: "Marketing Manager, NYC"
                            },
                            {
                                text: "Finally, a resume builder that actually works for early-career professionals. The formatting is clean and passes every ATS.",
                                author: "Jessica L.",
                                role: "Recent Graduate, Austin"
                            }
                        ].map((t, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
                                <Quote size={24} className="text-[#00C4B3]/30 mb-4" />
                                <p className="text-[#475569] mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                                <div>
                                    <div className="font-bold text-[#0F172A]">{t.author}</div>
                                    <div className="text-xs text-[#475569]">{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="py-20 bg-white border-t border-[#E5E7EB]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Three Simple Steps</h2>
                        <p className="text-[#475569] max-w-2xl mx-auto">From raw text to dream job in minutes.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FileText size={32} className="text-[#0B1F3B]" />,
                                title: "1. Paste Content",
                                desc: "Copy text from your current resume, LinkedIn profile, or write a rough draft."
                            },
                            {
                                icon: <Sparkles size={32} className="text-[#00C4B3]" />,
                                title: "2. AI Magic",
                                desc: "Our AI analyzes your experience and reformats it into a professional, ATS-friendly layout."
                            },
                            {
                                icon: <Download size={32} className="text-[#0D9488]" />,
                                title: "3. Download PDF",
                                desc: "Review your new resume, make quick edits, and download the print-ready PDF."
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] hover:shadow-lg transition-shadow">
                                <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm mb-6 border border-[#E5E7EB]">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#0F172A] mb-3">{item.title}</h3>
                                <p className="text-[#475569]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Structured Data for AI Engines (AIO/GEO) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        "name": "How to Create a Resume with AI for Free",
                        "description": "Use ExpertResume's Free AI Resume Builder to turn plain text into a professional, ATS-friendly resume in seconds.",
                        "step": [
                            {
                                "@type": "HowToStep",
                                "name": "Paste Your Content",
                                "text": "Copy text from your old resume, LinkedIn profile, or write a rough draft of your experience and skills.",
                                "url": "https://expertresume.us/free-ai-resume-builder"
                            },
                            {
                                "@type": "HowToStep",
                                "name": "Click Generate",
                                "text": "Click the 'Generate Resume Now' button. Our Gemini-powered AI analyzes your text and structures it professionally.",
                                "url": "https://expertresume.us/free-ai-resume-builder"
                            },
                            {
                                "@type": "HowToStep",
                                "name": "Preview and Download",
                                "text": "Review the instant preview. If you like it, proceed to the editor to make final adjustments and download your PDF.",
                                "url": "https://expertresume.us/free-ai-resume-builder"
                            }
                        ],
                        "totalTime": "PT2M",
                        "tool": [{ "@type": "SoftwareApplication", "name": "ExpertResume AI Builder" }]
                    })
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "Is this AI Resume Builder completely free?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes, you can use the AI tool to parse and format your resume text completely for free. Generating the preview is free. You may need a free account to download the final high-quality PDF depending on the template selected."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Can I convert my LinkedIn profile to a resume?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Absolutely. You can copy the 'About', 'Experience', and 'Education' sections from your LinkedIn profile and paste them into our tool. The AI detects the structure and formats it into a resume automatically."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is the resume ATS-friendly?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes. Our AI uses standard professional formatting and keywords that are optimized for Applicant Tracking Systems (ATS), ensuring your resume is readable by hiring software."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Which AI model do you use?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "We utilize advanced Google Gemini models to understand context, extract skills, and format your professional history accurately."
                                }
                            }
                        ]
                    })
                }}
            />

            {/* SEO Content Section */}
            <div className="bg-[#F8FAFC] py-20 border-t border-[#E5E7EB]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg prose-slate">
                    <h2 className="text-center text-3xl font-bold text-[#0F172A] mb-8">Why Use Our Free AI Resume Builder?</h2>

                    <p>
                        In today's competitive job market, having a polished, professional resume is non-negotiable. However, formatting a resume from scratch can be tedious and frustrating. ExpertResume's <strong>Free AI Resume Builder</strong> solves this problem by leveraging advanced artificial intelligence to handle the heavy lifting for you.
                    </p>

                    <h3>Key Benefits:</h3>
                    <ul className="list-none pl-0 space-y-3">
                        {[
                            "ATS-Optimized Templates ensuring your resume gets past the bots.",
                            "Instant Formatting saves you hours of fiddling with margins and fonts.",
                            "Smart content parsing identifies your skills, experience, and education automatically.",
                            "Professional designs that stand out to recruiters."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <h3>How AI Transforms Your Resume Creation</h3>
                    <p>
                        Traditional resume builders require you to fill out endless forms field by field. Our <strong>Text-to-Resume</strong> technology allows you to dump unstructured text—like a rough draft or your LinkedIn bio—and instantly get a structured document.
                    </p>
                    <p>
                        Our AI understands the difference between a job title and a company name, detects dates, and organizes your skills into a readable list. This not only saves time but ensures you don't miss critical sections that recruiters look for.
                    </p>

                    <h3>Frequently Asked Questions</h3>
                    <div className="space-y-6 mt-8">
                        <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Is this really free?</h4>
                            <p className="text-gray-600">Yes! You can use the AI parsing tool to generate a preview of your resume completely for free. To download the high-quality PDF without watermarks, you can create a free account.</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">What format should I paste?</h4>
                            <p className="text-gray-600">You can paste plain text, copy content from a Word document, or even copy your LinkedIn 'About' and 'Experience' sections. Our AI is smart enough to structure it correctly.</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">My text is messy, will it work?</h4>
                            <p className="text-gray-600">Yes! That is the power of our Gemini-powered engine. It parses messy, unstructured text and extracts the relevant professional details, ignoring the noise.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
