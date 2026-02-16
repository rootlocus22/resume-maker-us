import Link from "next/link";
import {
  BookOpen,
  FileText,
  BarChart3,
  Mic,
  Mail,
  Target,
  HelpCircle,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import helpGuidesData from "../data/help_guides_data.json";

const iconMap = {
  FileText,
  BarChart3,
  Mic,
  Mail,
  Target,
};

export const metadata = {
  title: "Help & How to Use ExpertResume | Step-by-Step Guides & Videos",
  description:
    "Learn how to use ExpertResume: build resumes, check ATS score, practice interviews, find jobs, track applications, and write cover letters. Step-by-step guides and video tutorials.",
  openGraph: {
    title: "Help & How to Use ExpertResume | Guides & Tutorials",
    description:
      "Step-by-step guides for Resume Builder, ATS Checker, AI Interview, Job Search, My Job Tracker, and Cover Letter Builder.",
    url: "https://expertresume.us/help",
  },
  alternates: { canonical: "https://expertresume.us/help" },
};

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Help & How to Use ExpertResume",
            description:
              "Step-by-step guides and tutorials for ExpertResume products.",
            publisher: {
              "@type": "Organization",
              name: "ExpertResume",
              url: "https://expertresume.us",
            },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: helpGuidesData.map((guide, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: guide.title,
                url: `https://expertresume.us/help/${guide.slug}`,
              })),
            },
          }),
        }}
      />

      {/* Hero */}
      <header className="bg-gradient-to-br from-slate-900 via-[#0B1F3B] to-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Help Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            How to Use ExpertResume
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Step-by-step guides and tutorials so you can build resumes, check your
            ATS score, practice interviews, and write cover letters—efficiently.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Written guides */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0B1F3B]" />
            Step-by-step guides
          </h2>
          <p className="text-slate-600 mb-6">
            Follow these guides to use each product from start to finish.
          </p>
          <ul className="space-y-4">
            {helpGuidesData.map((guide) => {
              const Icon = iconMap[guide.icon] || FileText;
              return (
                <li key={guide.slug}>
                  <Link
                    href={`/help/${guide.slug}`}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-[#00C4B3]/40 hover:shadow-md transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#0B1F3B]/5 flex items-center justify-center text-[#0B1F3B]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-[#0B1F3B]">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {guide.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0B1F3B] flex-shrink-0 mt-1" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Quick links */}
        <section className="rounded-xl bg-white border border-slate-200 p-6 mb-14">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            More resources
          </h2>
          <ul className="space-y-3">
            <li>
              <Link
                href="/faqs"
                className="flex items-center gap-2 text-[#0B1F3B] hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                FAQs — Billing, features, and account
              </Link>
            </li>
            <li>
              <Link
                href="/contact-us"
                className="flex items-center gap-2 text-[#0B1F3B] hover:underline"
              >
                <Mail className="w-4 h-4" />
                Contact us — support@expertresume.us
              </Link>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
