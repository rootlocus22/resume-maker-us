import ATSCheckerWrapper from "./ATSCheckerWrapper";
import Link from "next/link";
import ScrollToTopButton from "./ScrollToTopButton";
import EnglishGyaniATSWidget from "../components/crosssell/EnglishGyaniATSWidget";
import { Bot, Target, FileText } from "lucide-react";

export const metadata = {
  title: "Free ATS Score Checker (2026) – 1-Minute Resume Scan for US Jobs",
  description:
    "Free ATS score checker for US job applications. Get your instant ATS score in 1 minute, fix resume parsing errors, and optimize for Workday, Taleo, LinkedIn, and Indeed. Trusted by US job seekers.",
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/ats-score-checker",
  },
  keywords: [
    "ats score checker free",
    "check ats score for free",
    "resume ats checker",
    "ats resume score",
    "free ats resume checker",
    "ats score checker",
    "is 75 a good ats score",
    "resume score checker online free",
    "check my resume score free",
    "resume parsing errors",
    "jd match percentage",
    "workday ats",
    "taleo resume checker",
    "linkedin ats",
    "indeed resume score",
    "ats compliance checker"
  ],
  openGraph: {
    title: "Free ATS Score Checker (2026) – 1-Minute Resume Scan for US Jobs",
    description:
      "Get your instant ATS score in 1 minute. Optimized for US ATS systems (Workday, Taleo). See why recruiters reject your resume and fix it with ExpertResume AI.",
    url: "https://expertresume.us/ats-score-checker",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "ATS Score Checker for US Jobs 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ATS Score Checker | US Job Resume Scan 2026",
    description: "Get your ATS score in 30 seconds. Free instant analysis for US job applications.",
    images: ["https://expertresume.us/images/ats-checker.jpg"],
  },
};

export default function ATSScoreCheckerPage() {

  // JSON-LD Schema for Software Application
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ExpertResume ATS Score Checker",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free AI-powered tool to check resume ATS compatibility for US job applications (Workday, Taleo, LinkedIn, Indeed).",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  };

  // JSON-LD Schema for FAQ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a good ATS score for US job applications?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A score of 80% or above is generally considered strong for most US ATS systems (Workday, Taleo, Greenhouse) to ensure your resume reaches recruiters. Scores 60-79% need keyword optimization. Below 60% usually requires formatting fixes like removing columns and graphics."
        }
      },
      {
        "@type": "Question",
        "name": "How is ATS score calculated by ExpertResume?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ExpertResume calculates your ATS score using an algorithm that mimics top US ATS platforms like Taleo and Workday. We analyze four key areas: 1) Parsing rate (can we read the text?), 2) Keyword matching (skills vs. job description), 3) Section identification (standard headers), and 4) Formatting hygiene (no tables/images). Points are deducted for errors that block parsing."
        }
      },
      {
        "@type": "Question",
        "name": "What is a good ATS score for Fortune 500 companies?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For large US employers using Workday, Taleo, or similar ATS, aim for at least 85%. These companies receive thousands of applications and use strict automated filters. Your resume should have a clean, single-column format with standard headers (Experience, Education, Skills) to pass parsing."
        }
      },
      {
        "@type": "Question",
        "name": "How do Workday and Taleo score resumes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Workday and Taleo parse resumes into structured data (skills, experience, education). They rank candidates by keyword match with the job description and profile completeness. Using standard section names and avoiding tables/graphics helps ensure your content is extracted correctly."
        }
      },
      {
        "@type": "Question",
        "name": "How can I check my ATS score for free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can check your ATS score for free on ExpertResume. Upload your resume PDF or Word file, and our tool will analyze it and give you a score out of 100 instantly, with tips to improve."
        }
      },
      {
        "@type": "Question",
        "name": "Is 75 a good ATS score?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, an ATS score of 75 or above is generally considered good and indicates your resume is readable by most tracking systems. A score above 85 is excellent. Scores below 60 typically need formatting or keyword improvements."
        }
      },
      {
        "@type": "Question",
        "name": "Why do recruiters use ATS instead of reading resumes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "US recruiters receive an average of 250+ applications per job. ATS software filters this down to the top 10-20 candidates in seconds based on keywords and qualifications, saving time and ensuring consistency."
        }
      },
      {
        "@type": "Question",
        "name": "Can I improve my ATS score for free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Effective free improvements: 1) Use a standard font (Arial, Calibri), 2) Remove tables, columns, and icons, 3) Use standard section headers (e.g., Work Experience, Skills), and 4) Include keywords from the job description. Verify with our free checker."
        }
      },
      {
        "@type": "Question",
        "name": "Does this work with LinkedIn and Indeed applications?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. LinkedIn and Indeed (and most US job boards) use or integrate with ATS-style parsing. A resume that scores well on our checker is more likely to parse correctly and rank well when you apply through these platforms."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero – same theme as home (navy + teal) */}
      <section className="relative bg-gradient-to-br from-[#050F20] via-[#0B1F3B] to-[#071429] text-white py-6 sm:py-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-8 left-8 w-20 h-20 sm:w-24 sm:h-24 bg-[#00C4B3]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-8 w-24 h-24 sm:w-32 sm:h-32 bg-[#00C4B3]/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full mb-3 text-xs font-medium">
                <Target size={14} className="text-[#00C4B3]" />
                <span>Free ATS Scan</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                See how <span className="text-[#00C4B3]">US ATS systems</span> read your resume.
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-200 max-w-xl">
                Beat applicant tracking systems and get more interviews — get your free score in 60 seconds. Built for the US job market.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-gray-400">
                Need to build a resume?{" "}
                <Link href="/resume-builder" className="text-[#00C4B3] hover:text-[#00C4B3]/90 underline underline-offset-2">
                  Start from scratch
                </Link>
                {" "}or{" "}
                <Link href="/upload-resume" className="text-[#00C4B3] hover:text-[#00C4B3]/90 underline underline-offset-2">
                  upload to optimize
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="flex-1 bg-[#F8FAFC] flex flex-col items-center p-4 md:p-8 relative">
        <ATSCheckerWrapper />

        {/* EnglishGyani Cross-sell */}
        <div className="max-w-5xl mx-auto mb-16 w-full">
          <EnglishGyaniATSWidget />
        </div>

      <section className="w-full max-w-5xl mt-8 space-y-16">

        {/* Social proof + value */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-[#0D9488]/10 border border-[#0D9488]/30 px-4 py-1.5 rounded-full mb-4">
            <span className="flex text-[#0D9488] text-sm">★★★★★</span>
            <span className="text-sm font-medium text-[#020617]">Rated 4.9/5 by 15,000+ US Job Seekers</span>
          </div>
          <p className="text-lg text-[#475569] max-w-2xl mx-auto">
            A score of <strong className="text-[#0F172A]">80+</strong> is strong for Workday, Taleo & Greenhouse. Below 60? We&apos;ll show you exactly what to fix.
          </p>
        </div>

        <div className="py-6 border-y border-[#E5E7EB] mb-10">
          <p className="text-center text-sm font-semibold text-[#475569] uppercase tracking-wider mb-6">
            Trusted by candidates hired at top US companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70">
            <span className="text-xl md:text-2xl font-bold text-[#020617]">Google</span>
            <span className="text-xl md:text-2xl font-bold text-[#020617]">Amazon</span>
            <span className="text-xl md:text-2xl font-bold text-[#020617]">Microsoft</span>
            <span className="text-xl md:text-2xl font-bold text-[#020617]">Meta</span>
            <span className="text-xl md:text-2xl font-bold text-[#020617]">Apple</span>
            <span className="text-xl md:text-2xl font-bold text-[#020617]">LinkedIn</span>
          </div>
        </div>

        {/* How to Get a 90+ Score - US ATS */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-6">
            How to Get a 90+ ATS Score for US Jobs
          </h2>
          <p className="text-lg text-[#475569] mb-6">
            US ATS systems (Workday, Taleo, Greenhouse) rank resumes on keyword match, structure, and clarity. Here’s how to ace each:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-[#E5E7EB]">
              <h3 className="font-bold text-xl text-[#0B1F3B] mb-3">1. Keyword Match</h3>
              <p className="text-[#475569] text-sm">
                Use exact phrases from the job description. If they say "Stakeholder Management," don’t just write "Client Relations."
              </p>
            </div>
            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-[#E5E7EB]">
              <h3 className="font-bold text-xl text-[#0B1F3B] mb-3">2. Standard Sections</h3>
              <p className="text-[#475569] text-sm">
                Use clear headers: Experience, Education, Skills. Incomplete or creative section names hurt parsing.
              </p>
            </div>
            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-[#E5E7EB]">
              <h3 className="font-bold text-xl text-[#0B1F3B] mb-3">3. Clean Format</h3>
              <p className="text-[#475569] text-sm">
                Single column, no tables or graphics. Use Arial, Calibri, or similar. Parsers read plain, structured text best.
              </p>
            </div>
          </div>
        </div>

        {/* How ExpertResume Fixes ATS Issues */}
        <div className="bg-white border border-[#E5E7EB] text-left rounded-2xl shadow-sm overflow-hidden p-8 md:p-10">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-6">
            How ExpertResume Fixes ATS Issues
          </h2>
          <p className="text-[#475569] text-lg mb-6">
            Most resumes fail ATS because of layout and naming. ExpertResume builds your resume to parse correctly:
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-6">
            <div className="flex gap-4">
              <div className="bg-[#0B1F3B]/10 text-[#00C4B3] w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
              <div>
                <h3 className="font-bold text-[#020617] mb-2">Parsing-Friendly Structure</h3>
                <p className="text-[#475569] text-sm">Single-column layout so ATS systems never jumble your text or skip sections.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-[#0B1F3B]/10 text-[#00C4B3] w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
              <div>
                <h3 className="font-bold text-[#020617] mb-2">Standard Section Headers</h3>
                <p className="text-[#475569] text-sm">Headers like "Work Experience" and "Skills" so the ATS finds your data every time.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-[#0B1F3B]/10 text-[#00C4B3] w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
              <div>
                <h3 className="font-bold text-[#020617] mb-2">No Graphics or Tables</h3>
                <p className="text-[#475569] text-sm">Pure, structured text that US ATS parsers read with high accuracy.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-[#0B1F3B]/10 text-[#00C4B3] w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
              <div>
                <h3 className="font-bold text-[#020617] mb-2">Keyword Optimization</h3>
                <p className="text-[#475569] text-sm">AI helps you include the right keywords for the job and industry.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Top 5 Resume Parsing Errors That Hurt Your ATS Score</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-xl">✗</span>
                <p className="text-gray-700"><strong>Using Columns/Tables:</strong> Parsers read left-to-right. Two-column resumes often get jumbled, merging work experience with skills.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-xl">✗</span>
                <p className="text-gray-700"><strong>Icons & Graphics:</strong> ATS cannot "see" logos or skill bars (e.g., 5/5 stars). Use text instead.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-xl">✗</span>
                <p className="text-gray-700"><strong>Important Details in Header/Footer:</strong> Some older parsers ignore headers completely. Put contact info in the main body.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-xl">✗</span>
                <p className="text-gray-700"><strong>Wrong File Format:</strong> Always use .DOCX or text-based .PDF. Never use image-based PDFs (Canva exports can sometimes be risky).</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-xl">✗</span>
                <p className="text-gray-700"><strong>Creative Section Names:</strong> Don't use "My Journey" or "Professional Arsenal". Use standard headers like "Experience" and "Skills".</p>
              </li>
            </ul>
          </div>
          <div className="bg-[#0D9488]/5 p-8 rounded-xl border border-[#0D9488]/20">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">✅ How to Fix It (The 80+ Score Formula)</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-[#0D9488] font-bold text-xl">✓</span>
                <p className="text-gray-700"><strong>Use Standard Formatting:</strong> Stick to a clean, single-column layout.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#0D9488] font-bold text-xl">✓</span>
                <p className="text-[#475569]"><strong>Keyword Stuffing (Smartly):</strong> Read the JD. If they ask for "Client Management", don't just write "Sales". Use the exact phrase.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#0D9488] font-bold text-xl">✓</span>
                <p className="text-[#475569]"><strong>Spell Out Acronyms:</strong> Write "Search Engine Optimization (SEO)" so you rank for both.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#0D9488] font-bold text-xl">✓</span>
                <p className="text-[#475569]"><strong>Standard Fonts:</strong> Use Arial, Calibri, or Roboto. Avoid fancy serif fonts that might confusing OCR.</p>
              </li>
            </ul>
            <div className="mt-8">
              <Link href="/templates" className="block w-full text-center bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold py-3 rounded-lg transition">
                Browse ATS-Verified Templates
              </Link>
            </div>
          </div>
        </div>

        {/* Comparison Section - US ATS */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#0F172A] px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Workday vs. Taleo vs. LinkedIn: How US ATS Scoring Differs</h2>
          </div>
          <div className="p-8 md:p-10">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-xl mb-3 text-[#2563EB]">Workday</h3>
                <p className="text-[#475569] text-sm">
                  Focuses on <strong>keyword match</strong> and <strong>structured data</strong>. Use standard section names and avoid tables so your skills and experience parse correctly.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-3 text-[#2563EB]">Taleo (Oracle)</h3>
                <p className="text-[#475569] text-sm">
                  Prioritizes <strong>job titles</strong> and <strong>company names</strong>. Clean, chronological format with clear headers works best.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-3 text-[#2563EB]">LinkedIn / Indeed</h3>
                <p className="text-[#475569] text-sm">
                  Values <strong>keyword relevance</strong> and <strong>profile completeness</strong>. A resume that scores well here will align with what recruiters search for.
                </p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-[#2563EB]/5 rounded-lg border border-[#2563EB]/20">
              <p className="text-[#020617] text-sm font-medium">
                <strong>Pro Tip:</strong> Use a <strong>reverse-chronological format</strong> with a strong Skills section and clear Experience/Education headers to perform well across US ATS systems.
              </p>
            </div>
          </div>
        </div>

        {/* How to Improve Your ATS Score - US */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden mt-8">
          <div className="bg-[#2563EB] px-8 py-6">
            <h2 className="text-2xl font-bold text-white">How to Improve Your ATS Score</h2>
          </div>
          <div className="p-8 md:p-10 space-y-6">
            <p className="text-[#475569]">
              <em>"Why is my ATS score low even with a strong resume?"</em> Usually it’s structure and keywords. Here’s how to improve for free:
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 border border-[#E5E7EB] rounded-xl hover:bg-[#F8FAFC] transition">
                <div className="bg-[#2563EB]/10 text-[#2563EB] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">A</div>
                <p className="text-[#475569] text-sm"><strong>Match Your Application:</strong> Your resume PDF should align with what you enter in job portals (e.g., LinkedIn, company career pages). Inconsistencies can hurt your ranking.</p>
              </div>
              <div className="flex gap-4 p-4 border border-[#E5E7EB] rounded-xl hover:bg-[#F8FAFC] transition">
                <div className="bg-[#2563EB]/10 text-[#2563EB] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">B</div>
                <p className="text-[#475569] text-sm"><strong>Specific Job Titles:</strong> Use precise titles like "Senior Product Manager" instead of "Manager" so ATS and recruiters can match you to the right roles.</p>
              </div>
              <div className="flex gap-4 p-4 border border-[#E5E7EB] rounded-xl hover:bg-[#F8FAFC] transition">
                <div className="bg-[#2563EB]/10 text-[#2563EB] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">C</div>
                <p className="text-[#475569] text-sm"><strong>Strong Summary:</strong> The first 2–3 lines of your resume often act as the "snippet" in search results. Use them to highlight key skills and experience.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-8 md:p-12">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">What is a good ATS score for US job applications?</h3>
              <p className="text-[#475569]">A score of <strong>80% or above</strong> is generally strong for most US ATS systems. Scores 60-79% need keyword optimization. Below 60% usually requires formatting fixes.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">How is ATS score calculated by ExpertResume?</h3>
              <p className="text-[#475569]">We analyze 4 factors: <strong>Parsing Rate</strong>, <strong>Keyword Matching</strong>, <strong>Section Identification</strong>, and <strong>Formatting Hygiene</strong>, similar to systems like Taleo and Workday.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">What is a good ATS score for Fortune 500 companies?</h3>
              <p className="text-[#475569]">Aim for <strong>85%+</strong>. Large US employers use strict filters. Use single-column format and clear "Education" and "Skills" headers.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">How do Workday and Taleo score resumes?</h3>
              <p className="text-[#475569]">They parse resumes into structured data and rank by <strong>keyword match</strong> and <strong>profile completeness</strong>. Standard headers and no tables help.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Why do recruiters use ATS?</h3>
              <p className="text-[#475569]">Recruiters get hundreds of applications per job. ATS filters to the top 10-20 candidates quickly. You need to optimize for the system first to reach a human.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">How do I check my ATS score for free?</h3>
              <p className="text-[#475569]">Upload your resume at the top of this page. We analyze it instantly and give you a detailed report for free.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Is 75 a good ATS score?</h3>
              <p className="text-[#475569]">Yes. 75+ is good, 80+ is excellent. Below 60 means your resume needs work on formatting or keywords.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Can I improve my score for free?</h3>
              <p className="text-[#475569]">Yes. Use standard fonts (Arial/Calibri), remove tables/columns, use standard headers, and add keywords from the job description.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Which resume format is best for ATS?</h3>
              <p className="text-[#475569]"><strong>Reverse-chronological</strong> is best — most recent job first. Avoid purely functional or skills-only formats.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Best fonts for ATS?</h3>
              <p className="text-[#475569]">Use <strong>Arial, Calibri, or Roboto</strong>. These work well with <Link href="/resume-builder" className="text-[#2563EB] hover:underline">US ATS systems</Link> and job boards.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Can Canva resumes pass ATS?</h3>
              <p className="text-[#475569]">Often no. Canva can export text as images or complex layers that parsers miss. Use an ATS-friendly builder or a clean Word/PDF.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Does this tool save my resume?</h3>
              <p className="text-[#475569]">We prioritize privacy. We process your resume only to generate the score and insights and do not sell your data.</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-[#0F172A] text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't Let an Algorithm Reject You</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Your next role at a top US company could be one improved resume away. Check your score now and fix what’s holding you back.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ScrollToTopButton />
            <Link href="/resume-builder" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold py-3 px-8 rounded-full transition duration-300">
              Build New Resume
            </Link>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm mb-3">Resume ready? Prepare for the interview.</p>
            <Link href="/interview-gyani/mock-interview-ai" className="inline-flex items-center gap-2 text-white font-semibold hover:underline">
              <Bot className="w-4 h-4" /> Practice Free Mock Interview &rarr;
            </Link>
          </div>
        </div>

      </section>
      </div>
    </div>
  );
}