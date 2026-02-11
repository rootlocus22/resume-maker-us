// app/job-specific-resume-builder/page.js
import JobSpecificResumeBuilder from "../components/JobSpecificResumeBuilder";
import { Suspense } from "react";

export async function generateMetadata({ searchParams }) {
  let sp;
  if (typeof searchParams === 'function') {
    sp = await searchParams();
  } else if (searchParams && typeof searchParams.then === 'function') {
    sp = await searchParams;
  } else {
    sp = searchParams;
  }
  const template = (sp?.get?.("template") ?? "it fresher").replace(/-/g, " ");
  const title = `${template} Resume Maker – Job-Specific PDF | ExpertResume`;
  const desc = `Create a job-specific ${template} resume. ATS-optimized, free download, trusted in India & US.`;
  // Canonical URL: base URL if no template param, or include template if it exists
  const templateParam = sp?.get?.("template");
  const hasTemplateParam = templateParam && templateParam !== "";
  
  const canonicalUrl = hasTemplateParam
    ? `https://expertresume.us/job-specific-resume-builder?template=${templateParam}`
    : `https://expertresume.us/job-specific-resume-builder`;

  return {
    title,
    description: desc,
    robots: "index, follow",
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      "job-specific resume builder",
      "ATS resume India",
      "ATS resume US",
      "resume maker",
      "resume templates",
      "AI resume builder",
      "job application India",
      "job application US",
      "ExpertResume",
      template + " resume",
    ],
    openGraph: {
      title,
      description: desc,
      url: canonicalUrl,
      siteName: "ExpertResume",
      type: "website",
      images: [
        {
          url: "https://expertresume.us/ExpertResume.png",
          width: 1200,
          height: 630,
          alt: "Job-Specific Resume Builder - Tailored for Your Career",
        },
      ],

    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ["https://expertresume.us/images/5.png"],
    },
  };
}

export default function JobSpecificResumeBuilderPage() {
  return (
    <>
      <script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ExpertResume Job-Specific Resume Builder",
            url: "https://expertresume.us/job-specific-resume-builder",
            applicationCategory: "BusinessApplication",
            operatingSystem: "All",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "1200",
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
      <Suspense>
        <JobSpecificResumeBuilder />
      </Suspense>
    </>
  );
}