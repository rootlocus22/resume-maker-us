import Link from "next/link";
import { BASE_URL, BRAND_NAME } from "../lib/appConfig";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  TrendingUp,
  Award,
  Zap,
  HelpCircle,
  ChevronRight,
  LayoutList,
  Shuffle,
  Layers,
  Star,
  Target,
  Users,
} from "lucide-react";

export const metadata = {
  title: `Best Resume Format in 2026: Examples & Free Templates | ${BRAND_NAME}`,
  description:
    "Learn how to choose the right resume format for your experience level. Compare chronological, functional, and combination formats with examples, tips, and free ATS-friendly templates.",
  alternates: {
    canonical: `${BASE_URL}/resume-format`,
  },
  openGraph: {
    title: `Best Resume Format in 2026: Examples & Free Templates | ${BRAND_NAME}`,
    description:
      "Compare chronological, functional, and combination resume formats. Pick the best one for your career stage with our guide and free templates.",
    url: `${BASE_URL}/resume-format`,
    type: "website",
  },
  keywords: [
    "resume format",
    "best resume format",
    "resume format 2026",
    "chronological resume format",
    "functional resume format",
    "combination resume format",
    "resume format examples",
    "ATS resume format",
    "professional resume format",
    "how to format a resume",
    "resume layout",
    "resume structure",
  ],
};

export default function ResumeFormatPage() {
  const faqData = [
    {
      question: "What is the best resume format in 2026?",
      answer:
        "The reverse-chronological format is the best resume format for most job seekers in 2026. It lists your most recent experience first and is preferred by 95% of recruiters and ATS software. Use a functional or combination format only if you have specific circumstances like career gaps or career changes.",
    },
    {
      question: "Which resume format is best for ATS?",
      answer:
        "The reverse-chronological format is the most ATS-friendly because it uses a standard structure that parsing software can easily read. Functional resumes can confuse ATS systems because they separate skills from work history. If you use a combination format, ensure your work history section is clearly labeled and includes dates.",
    },
    {
      question: "Should I use a functional resume to hide employment gaps?",
      answer:
        "While functional resumes can de-emphasize gaps, most recruiters are aware of this tactic and may view it negatively. Instead, consider using a combination format that highlights your skills while still including a brief work history. You can also address gaps directly in your cover letter or use years-only dates instead of months.",
    },
    {
      question: "Can I use a creative resume format?",
      answer:
        "Creative formats (infographic resumes, video resumes, etc.) may work for design or creative roles, but they fail in ATS systems and are not recommended for most industries. Stick to a clean, professional format and save your creativity for your portfolio. If applying to a creative role, submit both a standard and creative version.",
    },
    {
      question: "How long should my resume be?",
      answer:
        "For most professionals, a one-page resume is ideal. If you have 10+ years of experience or are in academia or a senior executive role, a two-page resume is acceptable. Regardless of format, avoid going beyond two pages. Focus on relevance over length — every line should support your candidacy for the target role.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Resume Format Guide",
        item: `${BASE_URL}/resume-format`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight size={14} />
          <li className="text-primary font-medium">Resume Format Guide</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-12 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,196,179,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
              <FileText size={16} />
              <span>823K+ Monthly Searches</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
              Best <span className="text-accent">Resume Format</span> in 2026
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Choosing the right resume format is the first step to landing interviews. Learn the differences between chronological, functional, and combination formats — with examples, pros &amp; cons, and free ATS-friendly templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/resume-builder"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Zap size={20} />
                Build Your Resume Now
              </Link>
              <Link
                href="/resume-templates"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all border border-gray-200"
              >
                <LayoutList size={20} />
                Browse Templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Format Types Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              The 3 Main Resume Formats
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each format organizes your information differently. The best choice depends on your work history, career goals, and the job you&apos;re targeting.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Chronological */}
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <Clock size={28} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">Reverse-Chronological</h3>
              <p className="text-gray-600 mb-4">
                Lists your work experience from most recent to oldest. The gold standard for most job seekers and the format recruiters prefer.
              </p>
              <div className="mb-4">
                <p className="font-semibold text-primary text-sm mb-2">Best for:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Steady career progression
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Staying in the same industry
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    No significant employment gaps
                  </li>
                </ul>
              </div>
              <div className="mb-4">
                <p className="font-semibold text-accent-600 text-sm mb-2">Pros:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    ATS-friendly
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Recruiters prefer it
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Shows career growth clearly
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Cons:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    Highlights employment gaps
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    Less ideal for career changers
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-primary-100">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-50 text-accent-700 rounded-full text-xs font-semibold">
                  <Star size={12} /> Recommended for 90% of job seekers
                </span>
              </div>
            </div>

            {/* Functional */}
            <div className="bg-gradient-to-br from-accent-50 to-white rounded-2xl p-8 border border-accent-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-6">
                <Briefcase size={28} className="text-accent-700" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">Functional (Skills-Based)</h3>
              <p className="text-gray-600 mb-4">
                Focuses on your skills and abilities rather than your work history. Organizes experience by skill category instead of timeline.
              </p>
              <div className="mb-4">
                <p className="font-semibold text-primary text-sm mb-2">Best for:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Career changers
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Large employment gaps
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Military-to-civilian transitions
                  </li>
                </ul>
              </div>
              <div className="mb-4">
                <p className="font-semibold text-accent-600 text-sm mb-2">Pros:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Highlights transferable skills
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    De-emphasizes gaps or short tenures
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Cons:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    Many ATS systems can&apos;t parse it well
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    Recruiters may be suspicious
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    Lacks context for achievements
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-accent-100">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold">
                  ⚠️ Use only when necessary
                </span>
              </div>
            </div>

            {/* Combination */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <Layers size={28} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">Combination (Hybrid)</h3>
              <p className="text-gray-600 mb-4">
                Merges the best of both worlds: a prominent skills section followed by a reverse-chronological work history.
              </p>
              <div className="mb-4">
                <p className="font-semibold text-primary text-sm mb-2">Best for:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Career changers with relevant skills
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Senior professionals with diverse skills
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Targeting roles needing specific expertise
                  </li>
                </ul>
              </div>
              <div className="mb-4">
                <p className="font-semibold text-accent-600 text-sm mb-2">Pros:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Showcases skills prominently
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    Still includes work history context
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    More ATS-friendly than functional
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Cons:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    Can be longer than one page
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    Requires careful organization
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-400 rounded-full text-xs font-semibold">
                  <Shuffle size={12} /> Great for career changers
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Resume Format Comparison
            </h2>
            <p className="text-lg text-gray-600">
              See how the three formats stack up across the factors that matter most.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">Chronological</th>
                  <th className="px-6 py-4 text-center font-semibold">Functional</th>
                  <th className="px-6 py-4 text-center font-semibold">Combination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { feature: "ATS Compatibility", chron: "Excellent", func: "Poor", combo: "Good" },
                  { feature: "Recruiter Preference", chron: "High", func: "Low", combo: "Medium" },
                  { feature: "Shows Career Growth", chron: "Excellent", func: "Poor", combo: "Good" },
                  { feature: "Hides Gaps", chron: "Poor", func: "Excellent", combo: "Good" },
                  { feature: "Highlights Skills", chron: "Moderate", func: "Excellent", combo: "Excellent" },
                  { feature: "Best for Entry-Level", chron: "Good", func: "Moderate", combo: "Good" },
                  { feature: "Best for Career Changers", chron: "Poor", func: "Good", combo: "Excellent" },
                  { feature: "Ease of Writing", chron: "Easy", func: "Moderate", combo: "Moderate" },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 font-medium text-primary">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        row.chron === "Excellent" ? "bg-accent-50 text-accent-700" :
                        row.chron === "Good" || row.chron === "High" ? "bg-accent-50 text-accent-600" :
                        row.chron === "Moderate" || row.chron === "Medium" ? "bg-yellow-50 text-yellow-700" :
                        row.chron === "Easy" ? "bg-accent-50 text-accent-700" :
                        "bg-red-50 text-red-600"
                      }`}>{row.chron}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        row.func === "Excellent" ? "bg-accent-50 text-accent-700" :
                        row.func === "Good" ? "bg-accent-50 text-accent-600" :
                        row.func === "Moderate" || row.func === "Medium" ? "bg-yellow-50 text-yellow-700" :
                        "bg-red-50 text-red-600"
                      }`}>{row.func}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        row.combo === "Excellent" ? "bg-accent-50 text-accent-700" :
                        row.combo === "Good" ? "bg-accent-50 text-accent-600" :
                        row.combo === "Moderate" || row.combo === "Medium" ? "bg-yellow-50 text-yellow-700" :
                        "bg-red-50 text-red-600"
                      }`}>{row.combo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Format Examples Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Resume Format Examples
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See what each format looks like in practice. These examples show how the same candidate&apos;s information is structured differently.
            </p>
          </div>

          {/* Chronological Example */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary">Reverse-Chronological Format Example</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 font-mono text-sm leading-relaxed">
              <div className="text-center mb-4">
                <p className="font-bold text-primary text-lg">SARAH JOHNSON</p>
                <p className="text-gray-600">San Francisco, CA | (555) 123-4567 | sarah.johnson@email.com | linkedin.com/in/sarahjohnson</p>
              </div>
              <div className="border-t border-gray-300 pt-3 mb-3">
                <p className="font-bold text-primary mb-1">PROFESSIONAL SUMMARY</p>
                <p className="text-gray-700">Results-driven Marketing Manager with 7+ years of experience driving digital campaigns that increased revenue by 45%. Expert in SEO, paid media, and content strategy for SaaS companies.</p>
              </div>
              <div className="border-t border-gray-300 pt-3 mb-3">
                <p className="font-bold text-primary mb-1">WORK EXPERIENCE</p>
                <p className="font-semibold text-gray-800">Senior Marketing Manager — TechCorp Inc., San Francisco, CA</p>
                <p className="text-gray-500 text-xs mb-1">January 2022 – Present</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Led a team of 8 marketers, increasing qualified leads by 62% year-over-year</li>
                  <li>Managed $2.4M annual ad budget across Google Ads, LinkedIn, and Meta platforms</li>
                  <li>Launched content marketing program that drove 150K+ monthly organic visitors</li>
                </ul>
                <p className="font-semibold text-gray-800 mt-3">Marketing Manager — StartupXYZ, San Francisco, CA</p>
                <p className="text-gray-500 text-xs mb-1">June 2019 – December 2021</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Built and executed multi-channel campaigns resulting in 35% revenue growth</li>
                  <li>Implemented marketing automation workflows reducing lead response time by 80%</li>
                </ul>
              </div>
              <div className="border-t border-gray-300 pt-3 mb-3">
                <p className="font-bold text-primary mb-1">EDUCATION</p>
                <p className="text-gray-700">Bachelor of Science in Marketing — UCLA, 2017</p>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <p className="font-bold text-primary mb-1">SKILLS</p>
                <p className="text-gray-700">SEO/SEM • Google Analytics • HubSpot • Content Strategy • Paid Media • A/B Testing • Marketing Automation</p>
              </div>
            </div>
          </div>

          {/* Functional Example */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                <Briefcase size={20} className="text-accent-700" />
              </div>
              <h3 className="text-2xl font-bold text-primary">Functional Format Example</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 font-mono text-sm leading-relaxed">
              <div className="text-center mb-4">
                <p className="font-bold text-primary text-lg">SARAH JOHNSON</p>
                <p className="text-gray-600">San Francisco, CA | (555) 123-4567 | sarah.johnson@email.com</p>
              </div>
              <div className="border-t border-gray-300 pt-3 mb-3">
                <p className="font-bold text-primary mb-1">PROFESSIONAL SUMMARY</p>
                <p className="text-gray-700">Dynamic marketing professional with expertise in digital strategy, team leadership, and data-driven campaign management across SaaS and technology sectors.</p>
              </div>
              <div className="border-t border-gray-300 pt-3 mb-3">
                <p className="font-bold text-primary mb-2">KEY SKILLS &amp; ACCOMPLISHMENTS</p>
                <p className="font-semibold text-gray-800">Digital Marketing &amp; Campaign Management</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
                  <li>Increased qualified leads by 62% through integrated multi-channel campaigns</li>
                  <li>Managed $2.4M annual advertising budget across paid search and social</li>
                  <li>Built content marketing program generating 150K+ monthly organic visitors</li>
                </ul>
                <p className="font-semibold text-gray-800">Team Leadership &amp; Strategy</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
                  <li>Led and mentored a team of 8 marketing professionals</li>
                  <li>Developed quarterly marketing roadmaps aligned with company OKRs</li>
                </ul>
                <p className="font-semibold text-gray-800">Marketing Technology &amp; Automation</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Implemented HubSpot automation workflows reducing lead response time by 80%</li>
                  <li>Set up advanced analytics dashboards for real-time campaign performance tracking</li>
                </ul>
              </div>
              <div className="border-t border-gray-300 pt-3 mb-3">
                <p className="font-bold text-primary mb-1">WORK HISTORY</p>
                <p className="text-gray-700">Senior Marketing Manager — TechCorp Inc. (2022–Present)</p>
                <p className="text-gray-700">Marketing Manager — StartupXYZ (2019–2021)</p>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <p className="font-bold text-primary mb-1">EDUCATION</p>
                <p className="text-gray-700">B.S. Marketing — UCLA, 2017</p>
              </div>
            </div>
          </div>

          {/* Combination Example */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Layers size={20} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary">Combination Format Example</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 font-mono text-sm leading-relaxed">
              <div className="text-center mb-4">
                <p className="font-bold text-primary text-lg">SARAH JOHNSON</p>
                <p className="text-gray-600">San Francisco, CA | (555) 123-4567 | sarah.johnson@email.com | linkedin.com/in/sarahjohnson</p>
              </div>
              <div className="border-t border-gray-300 pt-3 mb-3">
                <p className="font-bold text-primary mb-1">PROFESSIONAL SUMMARY</p>
                <p className="text-gray-700">Results-driven Marketing Manager with 7+ years of experience in digital marketing, team leadership, and revenue growth strategy for SaaS companies.</p>
              </div>
              <div className="border-t border-gray-300 pt-3 mb-3">
                <p className="font-bold text-primary mb-2">CORE COMPETENCIES</p>
                <div className="grid grid-cols-2 gap-1 text-gray-700">
                  <p>• SEO/SEM &amp; Content Strategy</p>
                  <p>• Marketing Automation (HubSpot)</p>
                  <p>• Paid Media ($2M+ budgets)</p>
                  <p>• Team Leadership (8+ reports)</p>
                  <p>• Data Analytics &amp; A/B Testing</p>
                  <p>• Cross-Functional Collaboration</p>
                </div>
              </div>
              <div className="border-t border-gray-300 pt-3 mb-3">
                <p className="font-bold text-primary mb-1">WORK EXPERIENCE</p>
                <p className="font-semibold text-gray-800">Senior Marketing Manager — TechCorp Inc., San Francisco, CA</p>
                <p className="text-gray-500 text-xs mb-1">January 2022 – Present</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Led a team of 8 marketers, increasing qualified leads by 62% YoY</li>
                  <li>Managed $2.4M annual ad budget; achieved 4.2x ROAS across channels</li>
                  <li>Launched content marketing program driving 150K+ monthly organic visitors</li>
                </ul>
                <p className="font-semibold text-gray-800 mt-3">Marketing Manager — StartupXYZ, San Francisco, CA</p>
                <p className="text-gray-500 text-xs mb-1">June 2019 – December 2021</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Built multi-channel campaigns resulting in 35% revenue growth</li>
                  <li>Implemented automation workflows reducing lead response time by 80%</li>
                </ul>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <p className="font-bold text-primary mb-1">EDUCATION</p>
                <p className="text-gray-700">Bachelor of Science in Marketing — UCLA, 2017</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/resume-examples"
              className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-600 transition-colors"
            >
              See more resume examples <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Decision Flow Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Which Resume Format Is Right for You?
            </h2>
            <p className="text-lg text-gray-600">
              Answer these questions to find the best format for your situation.
            </p>
          </div>

          <div className="space-y-6">
            {/* Decision 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-50 rounded-full flex items-center justify-center shrink-0">
                  <Target size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2">
                    Do you have a steady work history in the same field?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-accent mt-0.5 shrink-0" />
                      <p className="text-gray-700">
                        <strong>Yes →</strong> Use the <strong>Reverse-Chronological</strong> format. It&apos;s the safest choice for ATS and recruiters.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <ArrowRight size={20} className="text-primary-400 mt-0.5 shrink-0" />
                      <p className="text-gray-700">
                        <strong>Not sure →</strong> Continue to the next question.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-50 rounded-full flex items-center justify-center shrink-0">
                  <Shuffle size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2">
                    Are you changing careers or industries?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-accent mt-0.5 shrink-0" />
                      <p className="text-gray-700">
                        <strong>Yes →</strong> Use the <strong>Combination</strong> format. Lead with transferable skills, then back them up with your work history.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <ArrowRight size={20} className="text-primary-400 mt-0.5 shrink-0" />
                      <p className="text-gray-700">
                        <strong>No →</strong> Continue to the next question.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-50 rounded-full flex items-center justify-center shrink-0">
                  <HelpCircle size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2">
                    Do you have significant employment gaps (1+ years)?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-accent mt-0.5 shrink-0" />
                      <p className="text-gray-700">
                        <strong>Yes →</strong> Consider a <strong>Combination</strong> format with a strong skills section. Avoid purely functional resumes as they raise red flags.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-accent mt-0.5 shrink-0" />
                      <p className="text-gray-700">
                        <strong>Minor gaps →</strong> Stick with <strong>Reverse-Chronological</strong> and address gaps in your cover letter.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision 4 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-50 rounded-full flex items-center justify-center shrink-0">
                  <Award size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2">
                    Are you a student or recent graduate?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-accent mt-0.5 shrink-0" />
                      <p className="text-gray-700">
                        <strong>Yes →</strong> Use the <strong>Reverse-Chronological</strong> format but lead with Education before Work Experience. Include internships, projects, and relevant coursework.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formatting Tips */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Essential Resume Formatting Tips
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Regardless of which format you choose, follow these formatting best practices to ensure your resume looks professional and passes ATS scans.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FileText size={24} className="text-accent" />,
                title: "Use a Clean Font",
                description: "Stick to professional fonts like Calibri, Arial, Garamond, or Cambria. Use 10-12pt for body text and 14-16pt for your name.",
              },
              {
                icon: <LayoutList size={24} className="text-accent" />,
                title: "Set Proper Margins",
                description: "Use 0.5 to 1-inch margins on all sides. This gives your resume enough white space without wasting valuable real estate.",
              },
              {
                icon: <Target size={24} className="text-accent" />,
                title: "Use Clear Section Headers",
                description: "Label sections with standard headings: Professional Summary, Work Experience, Education, Skills. ATS systems look for these exact labels.",
              },
              {
                icon: <TrendingUp size={24} className="text-accent" />,
                title: "Quantify Achievements",
                description: "Use numbers, percentages, and dollar amounts. 'Increased sales by 35%' is far more impactful than 'Improved sales performance.'",
              },
              {
                icon: <CheckCircle size={24} className="text-accent" />,
                title: "Save as PDF",
                description: "Unless the job posting requests .docx, always submit a PDF. It preserves formatting across all devices and ATS platforms.",
              },
              {
                icon: <Zap size={24} className="text-accent" />,
                title: "Keep it Concise",
                description: "Aim for one page if you have under 10 years of experience. Each bullet should start with an action verb and be 1-2 lines max.",
              },
            ].map((tip, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-accent-200 transition-colors">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  {tip.icon}
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Build Your Perfectly Formatted Resume?
          </h2>
          <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto">
            Choose from ATS-friendly templates, get AI-powered suggestions, and export a polished resume in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/resume-builder"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Zap size={20} />
              Start Building — It&apos;s Free
            </Link>
            <Link
              href="/ats-score-checker"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Check Your ATS Score
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Frequently Asked Questions About Resume Formats
            </h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-primary mb-3 flex items-start gap-3">
                  <HelpCircle size={22} className="text-accent shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-[34px]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">
            Explore More Resume Resources
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/resume-builder", label: "AI Resume Builder", description: "Build your resume with AI assistance" },
              { href: "/resume-templates", label: "Resume Templates", description: "Browse professional templates" },
              { href: "/resume-examples", label: "Resume Examples", description: "See real resume samples" },
              { href: "/ats-score-checker", label: "ATS Score Checker", description: "Check your resume's ATS score" },
              { href: "/resume-skills", label: "Resume Skills Guide", description: "Best skills to put on a resume" },
              { href: "/resume-objective", label: "Resume Objectives", description: "50+ objective examples" },
              { href: "/resume-summary", label: "Resume Summaries", description: "60+ summary examples" },
              { href: "/cover-letter-builder", label: "Cover Letter Builder", description: "Create matching cover letters" },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-accent-200 hover:shadow-md transition-all group"
              >
                <p className="font-semibold text-primary group-hover:text-accent transition-colors">{link.label}</p>
                <p className="text-sm text-gray-500 mt-1">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
