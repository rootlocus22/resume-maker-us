import { Suspense } from "react";
import SalaryAnalyzerPage from "./SalaryAnalyzerPage";
import AuthProtection from "../components/AuthProtection";


export async function generateMetadata() {
  return {
    title: "ExpertResume Salary Analyzer | Compare & Negotiate Your Salary",
    description:
      "Use ExpertResume's Salary Analyzer to compare your salary with market rates in India. Premium users get advanced insights and negotiation strategies to boost their pay.",
    robots: "index, follow",
    alternates: {
      canonical: "https://expertresume.us/salary-analyzer",
    },
    keywords: [
      "ExpertResume salary analyzer",
      "salary benchmarking",
      "salary negotiation guide",
      "career tools",
      "job market salaries",
      "premium career insights"
    ],
    openGraph: {
      title: "ExpertResume Salary Analyzer",
      description:
        "Compare your salary with market rates and get expert negotiation tips with ExpertResume's premium Salary Analyzer.",
      url: "https://expertresume.us/salary-analyzer",
      type: "website",
      images: [
        {
          url: "https://expertresume.us/ExpertResume.png",
          width: 1200,
          height: 630,
          alt: "ExpertResume Salary Analyzer - Compare Market Rates"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "ExpertResume Salary Analyzer",
      description:
        "Analyze your salary and learn negotiation strategies with ExpertResume's premium tools!",
      images: ["https://expertresume.us/images/7.png"]
    }
  };
}

export default function SalaryAnalyzer() {
  return (
    <AuthProtection>
      <Suspense fallback={<LoadingSpinner />}>
        <SalaryAnalyzerPage />
      </Suspense>
    </AuthProtection>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-gray-600 font-medium">Loading Salary Analyzer...</p>
    </div>
  );
}