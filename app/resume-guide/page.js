import Link from "next/link";
import { adminDb } from "../lib/firebase-admin";
import { getCanonicalUrl } from "../lib/canonical";
import { BASE_URL, BRAND_NAME } from "../lib/appConfig";
import { FileText, ArrowRight, Search, Briefcase, TrendingUp, Zap, ChevronRight, Star, Target } from "lucide-react";

export const revalidate = 86400; // Revalidate every 24 hours

export async function generateMetadata() {
  const canonical = await getCanonicalUrl("/resume-guide");
  return {
    title: `Resume Guide by Job Title - ATS-Optimized Templates & Tips | ${BRAND_NAME}`,
    description:
      "Browse 2,000+ professional resume guides organized by job title, industry, and experience level. Each guide includes ATS keywords, interview questions, salary data, and expert tips for the US job market.",
    alternates: {
      canonical,
      languages: {
        'en-US': `${BASE_URL}/resume-guide`,
        'en-IN': `https://www.expertresume.us/resume-format-for`,
        'x-default': `${BASE_URL}/resume-guide`,
      }
    },
    openGraph: {
      title: "Resume Guide by Job Title | ExpertResume",
      description: "2,000+ ATS-optimized resume guides for every US job role.",
      url: canonical,
      type: "website",
    },
  };
}

async function getAllRolesGrouped() {
  if (!adminDb) return {};

  try {
    // Note: Avoid .orderBy() with .where() on different fields to skip needing a composite index
    // Sort in memory instead for simplicity
    const snapshot = await adminDb
      .collection("global_roles")
      .where("country", "==", "us")
      .select("slug", "job_title", "avg_salary")
      .get();

    // Group by first letter
    const grouped = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (!data.job_title || !data.slug) return;

      const firstChar = data.job_title.charAt(0).toUpperCase();
      if (!grouped[firstChar]) grouped[firstChar] = [];
      grouped[firstChar].push({
        slug: data.slug,
        title: data.job_title,
        salary: data.avg_salary,
      });
    });

    // Sort within each group
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.title.localeCompare(b.title));
    });

    return grouped;
  } catch (e) {
    console.error("Error fetching roles for hub:", e);
    return {};
  }
}

export default async function ResumeGuideHub() {
  const groupedRoles = await getAllRolesGrouped();
  const sortedLetters = Object.keys(groupedRoles).sort();
  const totalRoles = Object.values(groupedRoles).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <>
      {/* Hero - matches site theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-12 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,196,179,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
            <Star size={16} />
            <span>{totalRoles.toLocaleString()}+ Resume Guides</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-6">
            Resume Guides for <span className="text-accent">Every Job Title</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
            Find your job title below. Each guide includes ATS-optimized keywords, interview questions with sample answers, salary data, career path insights, and expert formatting tips for the US market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/resume-builder"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Zap size={20} />
              Build Your Resume
            </Link>
            <Link
              href="/ats-score-checker"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all border border-gray-200"
            >
              <Target size={20} />
              Check ATS Score
            </Link>
          </div>
        </div>
      </section>

      {/* Letter Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-1 justify-center">
            {sortedLetters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-gray-600 hover:text-accent hover:bg-accent-50 rounded transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Roles Directory */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sortedLetters.map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="mb-12 scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 flex items-center justify-center bg-accent text-white font-bold rounded-lg text-lg">
                  {letter}
                </span>
                <span className="text-sm text-gray-500">
                  {groupedRoles[letter].length} guide{groupedRoles[letter].length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedRoles[letter].map((role) => (
                  <Link
                    key={role.slug}
                    href={`/resume-guide/${role.slug}`}
                    className="group flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-accent-300 hover:shadow-sm transition-all"
                  >
                    <div className="min-w-0">
                      <span className="text-primary font-medium group-hover:text-accent transition-colors block truncate">
                        {role.title}
                      </span>
                      {role.salary && (
                        <span className="text-xs text-gray-400">{role.salary}</span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-accent shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {totalRoles === 0 && (
            <div className="text-center py-20">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Resume guides are being generated. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA - dark navy like rest of site */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Can&apos;t Find Your Role?
          </h2>
          <p className="text-xl text-primary-200 mb-8 max-w-xl mx-auto">
            Our AI resume builder works for any job title. Just paste the job description and get an ATS-optimized resume in minutes.
          </p>
          <Link
            href="/resume-builder"
            className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Zap size={20} />
            Start Building for Free
          </Link>
        </div>
      </section>
    </>
  );
}
