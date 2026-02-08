import Link from "next/link";
import ClientLogin from "./ClientLogin"; // Client-side component

export const metadata = {
  title: "Sign In - ExpertResume | AI Resume Builder for US Jobs",
  description:
    "Sign in to ExpertResume to access your free resume builder account. Use Google or email to log in and create professional, ATS-friendly resumes instantly!",
  keywords: [
    "resume builder login",
    "sign in resume maker",
    "ATS-friendly resume login",
    "free CV generator sign in",
    "login to resume templates",
    "download resume PDF login",
    "resume writing tool login",
    "job application assistant login",
    "ExpertResume login",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/login",
  },
  openGraph: {
    title: "Sign In - ExpertResume | Free Resume Builder & CV Generator",
    description:
      "Log in to ExpertResume with Google or email to create professional, ATS-friendly resumes. Access free resume templates and download your CV as a PDF!",
    url: "https://expertresume.us/login",
    siteName: "ExpertResume",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "Sign In to ExpertResume - Free Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@expertresume",
    title: "Sign In - ExpertResume | Free Resume Builder & CV Generator",
    description:
      "Access ExpertResume with Google or email. Build professional resumes with ATS-friendly templates and download as PDF instantly.",
    images: ["https://expertresume.us/free-resume-maker.webp"],
  },
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Sign In - ExpertResume",
  "url": "https://expertresume.us/login",
  "description":
    "Sign in to ExpertResume to create professional, ATS-friendly resumes using our free resume builder tool.",
  "isPartOf": {
    "@type": "WebSite",
    "name": "ExpertResume",
    "url": "https://expertresume.us",
  },
};

export default function LoginPage() {
  return (
    <>
      {/* Inject Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {/* Client-side interactive component with full-screen layout */}
      <ClientLogin />
    </>
  );
}