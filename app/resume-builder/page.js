// app/resume-builder/page.js (Resume Builder Page)
import ResumeBuilderWrapper from './ResumeBuilderWrapper';

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

  // Check if template parameter actually exists in URL
  const templateParam = sp?.get?.("template");
  const hasTemplateParam = templateParam && templateParam !== "";

  // Use template from URL if present, otherwise default to "classic" for display only
  const template = hasTemplateParam
    ? templateParam.replace(/-/g, " ")
    : "classic";

  const title = `${template} Resume Maker – Free PDF Download | ExpertResume`;
  const desc = `Build a ${template} resume in minutes. 100% ATS-friendly, free download. Built for US job applications — optimized for Workday, Greenhouse & Lever.`;

  // Canonical URL: base URL if no template param, or include template if it exists
  // Canonical URL: Always use the base URL for template parameters to prevent duplicate content issues/indexing errors
  // unless we have unique server-side content for each template (which we currently don't).
  const canonicalUrl = `https://expertresume.us/resume-builder`;

  return {
    title,
    description: desc,
    keywords: [
      "free resume builder",
      "ATS resume US",
      "resume maker",
      "resume templates",
      "AI resume builder",
      "job application US",
      "ExpertResume",
      template + " resume",
      "workday resume",
      "greenhouse resume",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
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
          alt: "Create Your Resume for Free - ExpertResume",
        },
      ],

    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ["https://expertresume.us/images/4.png"],
    },
    robots: "index, follow",
  };
}



export default function Page() {
  return (
    <>
      <script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ExpertResume Resume Builder",
            url: "https://expertresume.us/resume-builder",
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
        <ResumeBuilderWrapper />
      </Suspense>


    </>
  );
}