import { Suspense } from "react";
import PricingClient from "./PricingClient";

// Dynamic metadata for SEO - Updated to reflect current pricing
export const metadata = {
  title: "ExpertResume Pricing | USD Plans - AI Resume Builder & Career Tools",
  description: "ExpertResume pricing in USD. Premium career tools: AI resume builder, ATS checker, interview coach, One-Pager Resume. Start free, upgrade when you need more.",
  keywords:
    "resume builder pricing, ATS resume tools, AI interview coach, premium resume builder, USD pricing",
  author: "ExpertResume",
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/pricing",
  },
  openGraph: {
    title: "ExpertResume Pricing | AI Career Tools (USD)",
    description:
      "ExpertResume premium plans in USD. AI resume builder, ATS checker, interview prep, and more. Free tier available.",
    url: "https://expertresume.us/pricing",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "ExpertResume Pricing - AI Career Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExpertResume Pricing | AI Career Tools (USD)",
    description:
      "Premium resume and career tools in USD. Free tier available. Get past ATS and get more interviews.",
    images: ["https://expertresume.us/ExpertResume.png"],
  },
};

export default function PricingPage({ searchParams }) {

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PricingClient />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#00C4B3] border-t-transparent"></div>
      <p className="mt-4 text-gray-500 text-sm font-medium">Loading pricing...</p>
    </div>
  );
}