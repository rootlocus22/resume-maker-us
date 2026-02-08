import Link from "next/link";
import UploadResumeWrapper from "./UploadResumeWrapper";
import { UploadCloud } from "lucide-react";

export const metadata = {
  title: "ATS-Friendly Resume Builder - Optimize Your Resume for Job Applications",
  description:
    "Create an ATS-friendly resume with our AI-powered resume builder. Optimize keywords, formatting, and content to pass applicant tracking systems and boost your job application success.",
  keywords:
    "ATS-friendly resume, resume builder, ATS resume checker, resume optimization, applicant tracking system, ATS resume, job application, resume keywords, AI resume tool, resume enhancer",
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/upload-resume",
  },
  openGraph: {
    title: "ATS Resume Builder - Craft Your Perfect Resume",
    description:
      "Build an ATS-optimized resume with AI enhancements. Ensure compatibility with applicant tracking systems and improve your job search results.",
    url: "https://expertresume.us/upload-resume",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "ATS Resume Builder - Professional Resume Editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATS Resume Builder - Craft Your Perfect Resume",
    description: "Build an ATS-optimized resume with AI enhancements. Ensure compatibility with applicant tracking systems.",
    images: ["https://expertresume.us/images/resume-editor.jpg"],
  },
};

export default function ResumeBuilderPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero – same theme as home (navy + teal) */}
      <section className="relative bg-gradient-to-br from-[#050F20] via-[#0B1F3B] to-[#071429] text-white py-6 sm:py-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-8 left-8 w-20 h-20 sm:w-24 sm:h-24 bg-[#00C4B3]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-8 w-24 h-24 sm:w-32 sm:h-32 bg-[#00C4B3]/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full mb-3 text-xs font-medium">
              <UploadCloud size={14} className="text-[#00C4B3]" />
              <span>ATS-Optimized</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Optimize your resume for real <span className="text-[#00C4B3]">US job descriptions.</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-200 max-w-xl">
              Beat applicant tracking systems and increase your chances of getting interviews — built for the US job market.
            </p>
            <p className="mt-3 text-xs sm:text-sm text-gray-400">
              Don&apos;t have a resume yet?{" "}
              <Link
                href="/resume-builder"
                className="text-[#00C4B3] hover:text-[#00C4B3]/90 underline underline-offset-2"
              >
                Start from scratch
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Main content – soft gray bg like home */}
      <div className="flex-1 bg-[#F8FAFC] flex flex-col items-center p-4 md:p-8 relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#00C4B3]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-20 w-40 h-40 bg-[#0B1F3B]/5 rounded-full blur-3xl" />
        </div>

        <UploadResumeWrapper />

        <section className="w-full max-w-5xl mt-12 mb-6 text-center relative z-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] mb-4">
            Why build an ATS-friendly resume?
          </h2>
          <p className="text-[#475569] text-sm sm:text-base mb-6 max-w-3xl mx-auto">
            An <strong>ATS-friendly resume</strong> gets past applicant tracking systems. We analyze and optimize for <strong>US job boards</strong> with tailored <strong>keywords</strong> and professional formatting.
          </p>
        </section>
      </div>
    </div>
  );
}