// pages/cover-letter-builder.js
import { Suspense } from "react";
import CoverLetterBuilder from "../components/CoverLetterBuilder";
import AuthProtection from "../components/AuthProtection";

export const metadata = {
  title: "AI Cover Letter Builder - Create Professional Cover Letters | ExpertResume",
  description:
    "Build professional, ATS-friendly cover letters with our AI-powered cover letter builder. Generate personalized cover letters tailored to job descriptions in minutes.",
  keywords: [
    "cover letter builder",
    "AI cover letter generator",
    "professional cover letter maker",
    "ATS-friendly cover letter",
    "cover letter template",
    "job application cover letter",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/cover-letter-builder",
  },
  openGraph: {
    title: "AI Cover Letter Builder - Create Professional Cover Letters | ExpertResume",
    description:
      "Build professional, ATS-friendly cover letters with our AI-powered cover letter builder. Generate personalized cover letters tailored to job descriptions.",
    url: "https://expertresume.us/cover-letter-builder",
    siteName: "ExpertResume",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "AI Cover Letter Builder - ExpertResume",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Cover Letter Builder - Create Professional Cover Letters",
    description: "Build professional, ATS-friendly cover letters with AI-powered suggestions.",
    images: ["https://expertresume.us/ExpertResume.png"],
  },
};

export default function CoverLetterBuilderPage() {
  return (
    <AuthProtection>
      <Suspense>
        <CoverLetterBuilder />

        {/* SEO Depth for Indexation */}
        <div className="max-w-4xl mx-auto px-4 py-20 border-t border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center italic">Make Your Job Application Stand Out</h2>
          <div className="grid md:grid-cols-2 gap-12 text-slate-600">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Why use an AI Cover Letter?</h3>
              <p>
                In a sea of hundreds of applications, a generic cover letter is a missed opportunity. Our AI analyzes the job description to highlight exactly how your skills solve the company's specific problems.
              </p>
              <p>
                We focus on creating a narrative that connects your resume data to the employer's needs, using professional yet authentic language suitable for the US corporate environment.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">The 3-Part Success Formula</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  <span><strong>The Hook:</strong> A personalized opening that demonstrates your knowledge of the company.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  <span><strong>The Proof:</strong> Specific metrics and accomplishments from your expert resume that prove you're the right fit.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                  <span><strong>The Ask:</strong> A professional call-to-action that invites an interview.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Suspense>
    </AuthProtection>
  );
}