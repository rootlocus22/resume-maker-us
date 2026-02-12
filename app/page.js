import dynamic from "next/dynamic";
import { Suspense } from "react";
import CookieYesScript from "./components/CookieYesScript";
import AuthGuard from "./components/AuthGuard";
import Hero from "./components/Hero";
import HomePageLazyContent from "./components/HomePageLazyContent";

// ... metadata remains the same ...

export const metadata = {
  title: "Expert Resume Builder | Create Your Expert Resume in 5 Minutes",
  description: "Build an expert resume that gets you hired faster. Free AI-powered expert resume builder with ATS optimization, 50+ professional templates, and instant job matching. Used by 100,000+ professionals to create standout expert resumes.",
  keywords: [
    "expert resume",
    "expert resume builder",
    "create expert resume",
    "build expert resume",
    "professional expert resume",
    "expert resume template",
    "ATS expert resume",
    "resume builder",
    "AI resume builder",
    "ATS resume checker",
    "resume optimizer",
    "job search tool",
    "AI interview practice",
    "mock interview",
    "career toolkit",
    "US job market",
    "resume for software engineer",
    "resume for data analyst",
    "cover letter builder",
    "interview prep",
    "professional resume",
    "resume templates",
  ],
  authors: [{ name: "ExpertResume" }],
  creator: "ExpertResume",
  publisher: "ExpertResume",
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    }
  },
  alternates: {
    canonical: "https://expertresume.us",
    languages: {
      'en-US': 'https://expertresume.us',
    }
  },
  openGraph: {
    title: "Expert Resume Builder | Create Your Expert Resume in Minutes",
    description: "Build an expert resume that gets interviews. Free AI-powered expert resume builder with ATS optimization, professional templates, and job matching. Trusted by 100,000+ job seekers.",
    url: "https://expertresume.us",
    siteName: "ExpertResume",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        secureUrl: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "Expert Resume Builder - Create Professional Expert Resumes",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@expertresume",
    creator: "@expertresume",
    title: "ExpertResume | Resume to Job Offer — All in One",
    description: "Build ATS-perfect resumes, search jobs, practice AI interviews, and get hired. The complete career toolkit.",
    images: ["https://expertresume.us/ExpertResume.png"],
  },
  category: "Technology",
  applicationName: "ExpertResume",
  appleWebApp: {
    capable: true,
    title: "ExpertResume",
    statusBarStyle: "black-translucent",
  },
};

// ... schemas remain the same ...
// Preload critical fonts
const fontPreload = {
  rel: "preload",
  href: "/fonts/inter-var.woff2",
  as: "font",
  type: "font/woff2",
  crossOrigin: "anonymous",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is ExpertResume free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. ExpertResume is free to use. Create professional resumes, access ATS-friendly templates, and download your resume as PDF. Premium plans in USD add AI suggestions and advanced features."
      }
    },
    {
      "@type": "Question",
      "name": "How do I create an ATS-friendly resume for US jobs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pick a template, add your experience, education, and skills. Use our AI to tailor content to job descriptions. All templates are ATS-optimized for US job boards like LinkedIn, Indeed, and company career pages."
      }
    },
    {
      "@type": "Question",
      "name": "Are ExpertResume templates ATS-friendly for US job applications?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. All templates are ATS-optimized and work with LinkedIn, Indeed, and major US job boards. We also offer an ATS score checker to verify compatibility."
      }
    },
    {
      "@type": "Question",
      "name": "What is ATS score and how can I check it for free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ATS (Applicant Tracking System) score shows how well your resume performs with automated screening. ExpertResume offers a free ATS checker that analyzes your resume and suggests improvements."
      }
    },
    {
      "@type": "Question",
      "name": "Can I create a resume with a photo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. ExpertResume supports templates with photo sections. Upload a professional headshot and build a complete resume."
      }
    },
    {
      "@type": "Question",
      "name": "How is ExpertResume different from Zety, Canva, or Resume.io?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ExpertResume is the only all-in-one career platform that covers your entire job search. While Zety and Resume.io only build resumes, ExpertResume also includes AI interview practice, job search across 20+ boards, application tracking, career coaching, and salary insights — all in one subscription. No other tool does this."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use ExpertResume for software and tech jobs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. ExpertResume has templates for software engineers, developers, and tech professionals. Our AI helps with technical skills and project descriptions for US roles."
      }
    },
    {
      "@type": "Question",
      "name": "Can I download my resume as PDF without watermarks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Free users get limited downloads. Premium users get unlimited PDF downloads, no watermarks, and more templates. All pricing is in USD."
      }
    },
    {
      "@type": "Question",
      "name": "Does ExpertResume work on mobile phones?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! ExpertResume is fully mobile-responsive. Create, edit, and download your resume from any device - smartphone, tablet, or desktop. Perfect for students and job seekers on the go."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take to create a resume on ExpertResume?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most users create a professional resume in just 5-10 minutes! Choose a template, fill in your details, customize with our drag-and-drop editor, and download. For faster results, upload an existing resume and our AI will enhance it in seconds."
      }
    },
    {
      "@type": "Question",
      "name": "What makes ExpertResume different from other resume builders?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ExpertResume is the only all-in-one career platform that covers your entire job search journey. While competitors like Zety or Resume.io only build resumes, ExpertResume also includes a free ATS score checker, job search across 20+ US boards, AI mock interview practice, application tracking, career coaching, and salary insights — all in one platform at a lower price."
      }
    },
    {
      "@type": "Question",
      "name": "Can I practice for interviews on ExpertResume?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! ExpertResume includes AI Interview Pro — a built-in AI mock interviewer that simulates real interviews for your specific role. You get instant feedback, confidence scoring, and unlimited practice. No other major resume builder offers this feature."
      }
    }
  ]
};

// AggregateRating Schema for Trust Signals
const ratingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ExpertResume - Resume to Job Offer Career Platform",
  "description": "All-in-one career platform: ATS resume builder, job search across 20+ boards, AI interview practice, application tracker, and career coaching for US job seekers",
  "brand": {
    "@type": "Brand",
    "name": "ExpertResume"
  },
  "offers": {
    "@type": "AggregateOffer",
    "url": "https://expertresume.us/pricing",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "29",
    "offerCount": "4"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "10247",
    "bestRating": "5",
    "worstRating": "1"
  }
};

// SoftwareApplication Schema for ChatGPT Discovery
const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ExpertResume",
  "operatingSystem": "Web",
  "applicationCategory": "BusinessApplication",
  "description": "ExpertResume is the only all-in-one career platform that takes you from resume to job offer. Build ATS-perfect resumes (7 different ways), search jobs across 20+ boards, practice with AI mock interviews, track applications, and get career coaching — all in one place. Free tier and USD premium plans.",
  "url": "https://expertresume.us",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free resume builder with premium plans in USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "10247",
    "bestRating": "5",
    "worstRating": "1"
  },
  "author": {
    "@type": "Organization",
    "name": "Vendax Systems LLC",
    "url": "https://vendaxsystemlabs.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Vendax Systems LLC",
    "url": "https://vendaxsystemlabs.com"
  },
  "datePublished": "2023-01-01",
  "dateModified": "2026-02-08",
  "inLanguage": "en-US",
  "isAccessibleForFree": true,
  "featureList": [
    "Free resume builder with 7 creation modes",
    "ATS-friendly templates optimized for US hiring",
    "AI-powered content suggestions and optimization",
    "Free ATS score checker",
    "JD-based resume tailoring",
    "Upload and enhance existing resumes",
    "Text-to-resume AI conversion",
    "One-page resume builder",
    "Job search across 20+ US job boards",
    "Job application tracker",
    "AI mock interview practice",
    "Interview confidence scoring",
    "Career coaching tools",
    "Salary insights and job outlook data",
    "PDF download with no watermarks",
    "Mobile-responsive design"
  ],
  "screenshot": "https://expertresume.us/ExpertResume.png",
  "softwareVersion": "2026.1",
  "downloadUrl": "https://expertresume.us/resume-builder",
  "installUrl": "https://expertresume.us/resume-builder",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "softwareRequirements": "Web browser",
  "memoryRequirements": "512 MB RAM",
  "storageRequirements": "10 MB",
  "permissions": "No special permissions required",
  "releaseNotes": "2026 update: Complete career platform with 7 resume building methods, AI interview practice, job search across 20+ boards, application tracking, career coaching, and salary insights."
};

// Breadcrumb Schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://expertresume.us"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Resume Builder",
      "item": "https://expertresume.us/resume-builder"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Templates",
      "item": "https://expertresume.us/templates"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "ATS Checker",
      "item": "https://expertresume.us/ats-score-checker"
    }
  ]
};

export default function Page() {
  return (
    <>
      <AuthGuard />
      {/* Structured Data Schemas for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ratingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Critical LCP Component - Rendered Immediately (SSR) */}
      <Hero />

      {/* Lazy Loaded Components for TBT Optimization (Client-Side Only) */}
      <HomePageLazyContent />
    </>
  );
}