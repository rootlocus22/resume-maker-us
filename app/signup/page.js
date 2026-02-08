import Link from "next/link";
import ClientSignup from "./ClientSignup"; // Client-side component

export const metadata = {
  title: "Sign Up - ExpertResume | AI Resume Builder for US Jobs",
  description:
    "Sign up for ExpertResume to create your free account. Use Google or email to join and start building professional, ATS-friendly resumes for the US job market.",
  keywords: [
    "resume builder signup",
    "sign up resume maker",
    "ATS-friendly resume signup",
    "free CV generator sign up",
    "signup for resume templates",
    "download resume PDF signup",
    "resume writing tool signup",
    "job application assistant signup",
    "ExpertResume signup",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/signup",
  },
  openGraph: {
    title: "Sign Up - ExpertResume | Free Resume Builder & CV Generator",
    description:
      "Join ExpertResume with Google or email to create professional, ATS-friendly resumes. Access free resume templates and download your CV as a PDF!",
    url: "https://expertresume.us/signup",
    siteName: "ExpertResume",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "Sign Up for ExpertResume - Free Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@expertresume",
    title: "Sign Up - ExpertResume | Free Resume Builder & CV Generator",
    description:
      "Create your ExpertResume account with Google or email. Build professional resumes with ATS-friendly templates and download as PDF instantly.",
    images: ["https://expertresume.us/free-resume-maker.webp"],
  },
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Sign Up - ExpertResume",
  "url": "https://expertresume.us/signup",
  "description":
    "Sign up for ExpertResume to create professional, ATS-friendly resumes using our free resume builder tool.",
  "isPartOf": {
    "@type": "WebSite",
    "name": "ExpertResume",
    "url": "https://expertresume.us",
  },
};

export default function SignupPage() {
  return (
    <>
      {/* Inject Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {/* Client-side interactive component with full-screen layout */}
      <ClientSignup />
    </>
  );
}