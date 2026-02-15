import JobDescriptionResumeBuilder from "../components/JobDescriptionResumeBuilder";

import { Suspense } from "react";

export async function generateMetadata() {
  const title = "AI Job Description Resume Builder – Create Tailored Resumes | ExpertResume";
  const description = "Transform any job posting into a perfectly tailored resume. Upload your existing resume and paste any job description to create ATS-optimized, customized resumes instantly with AI.";

  return {
    title,
    description,
    keywords: [
      "job description resume builder",
      "AI resume tailoring",
      "ATS resume optimization",
      "custom resume creator",
      "job-specific resume",
      "resume matcher",
      "AI resume writer",
      "tailored resume builder",
      "job posting resume",
      "ExpertResume"
    ],
    alternates: {
      canonical: "https://expertresume.us/job-description-resume-builder",
    },
    openGraph: {
      title,
      description,
      url: "https://expertresume.us/job-description-resume-builder",
      siteName: "ExpertResume",
      type: "website",
      images: [
        {
          url: "https://expertresume.us/ExpertResume.png",
          width: 1200,
          height: 630,
          alt: "AI Job Description Resume Builder - ExpertResume",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://expertresume.us/free-resume-maker.webp"],
    },
    robots: "index, follow",
  };
}

export default function JobDescriptionResumeBuilderPage() {
  return (
    <>
      <script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ExpertResume AI Job Description Resume Builder",
            url: "https://expertresume.us/job-description-resume-builder",
            applicationCategory: "BusinessApplication",
            operatingSystem: "All",
            description: "Create perfectly tailored resumes from any job description using AI technology",
            featureList: [
              "Job description analysis",
              "Resume parsing and enhancement",
              "ATS optimization",
              "AI-powered customization",
              "Multiple resume templates",
              "Instant PDF generation"
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "850",
            },
            offers: {
              "@type": "Offer",
              price: "0.00",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
        </div>
      }>
        <JobDescriptionResumeBuilder />
      </Suspense>
    </>
  );
} 