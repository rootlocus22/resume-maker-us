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
      </Suspense>
    </AuthProtection>
  );
}