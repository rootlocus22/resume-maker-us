import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "../../lib/firebase-admin";
import { getCanonicalUrl } from "../../lib/canonical";
import { BASE_URL, BRAND_NAME } from "../../lib/appConfig";
import {
  FileText, ArrowRight, CheckCircle, Zap, Star, DollarSign,
  TrendingUp, BookOpen, AlertCircle, Award, Lightbulb, Target,
  Download, Briefcase, Clock, Users, BarChart3, Shield, ChevronRight
} from "lucide-react";

// Revalidate every 24 hours for ISR
export const revalidate = 86400;

// --- generateStaticParams: Pre-generate top pages at build time ---
export async function generateStaticParams() {
  if (!adminDb) return [];

  try {
    // Only pre-render US roles (highest priority for US site)
    const snapshot = await adminDb
      .collection("global_roles")
      .where("country", "==", "us")
      .select("slug")
      .limit(500)
      .get();

    return snapshot.docs.map((doc) => ({
      slug: doc.data().slug,
    }));
  } catch (e) {
    console.error("generateStaticParams error:", e);
    return [];
  }
}

// --- generateMetadata: Dynamic SEO metadata ---
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const role = await getRoleData(slug);

  if (!role) {
    return { title: "Resume Guide Not Found" };
  }

  // Self-referencing canonical from request host so Google indexes (fixes "Duplicate without user-selected canonical")
  const canonical = await getCanonicalUrl(`/resume-guide/${slug}`);

  return {
    title: role.seo_title || `${role.job_title} Resume Guide | ${BRAND_NAME}`,
    description: role.meta_description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: role.seo_title,
      description: role.meta_description,
      url: canonical,
      type: "article",
      images: [role.hero_image || "/og-image.png"],
    },
    keywords: role.keywords || [],
  };
}

// --- Data Fetching ---
async function getRoleData(slug) {
  if (!adminDb) return null;

  try {
    // Try with us_ prefix first (standard format)
    const docSnap = await adminDb.collection("global_roles").doc(`us_${slug}`).get();
    if (docSnap.exists) return docSnap.data();

    // Fallback: try direct slug
    const directSnap = await adminDb.collection("global_roles").doc(slug).get();
    if (directSnap.exists) return directSnap.data();

    return null;
  } catch (e) {
    console.error(`Error fetching role ${slug}:`, e);
    return null;
  }
}

// --- Page Component ---
export default async function ResumeGuidePage({ params }) {
  const { slug } = await params;
  const role = await getRoleData(slug);

  if (!role) notFound();

  // Schema.org structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (role.faqs || []).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: role.seo_title,
    description: role.meta_description,
    author: { "@type": "Organization", name: BRAND_NAME },
    publisher: { "@type": "Organization", name: BRAND_NAME, url: BASE_URL },
    datePublished: "2026-02-01",
    dateModified: role.updated_at || new Date().toISOString().split("T")[0],
    url: `${BASE_URL}/resume-guide/${slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Resume Guide", item: `${BASE_URL}/resume-guide` },
      { "@type": "ListItem", position: 3, name: role.job_title, item: `${BASE_URL}/resume-guide/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-accent">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/resume-guide" className="hover:text-accent">Resume Guides</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary font-medium truncate max-w-xs">{role.job_title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section - matches site theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-12 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,196,179,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
                <Zap size={16} />
                ATS-Optimized for US Market
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-6">
                {role.hero_headline || `${role.job_title} Resume Guide`}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {role.summary_text}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/resume-builder"
                  className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <Zap size={20} />
                  Build Your Resume Now
                </Link>
                <Link
                  href="/ats-score-checker"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all border border-gray-200"
                >
                  <Target size={20} />
                  Check Your ATS Score
                </Link>
              </div>
              {role.avg_salary && (
                <div className="mt-8 flex items-center gap-3 text-gray-600">
                  <DollarSign className="w-5 h-5 text-accent" />
                  <span>Average US Salary: <strong className="text-primary">{role.avg_salary}</strong></span>
                </div>
              )}
            </div>
            {role.hero_image && (
              <div className="hidden lg:block">
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xl">
                  <img
                    src={role.hero_image}
                    alt={`${role.job_title} Resume Template`}
                    className="rounded-lg w-full"
                    loading="eager"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Keywords / Skills Matrix */}
      {role.skills_matrix && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3 text-center">
              Essential Skills for {role.job_title}
            </h2>
            <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
              Include these keywords in your resume to pass ATS screening and impress recruiters.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Must-Have Skills */}
              <div className="bg-gradient-to-br from-accent-50 to-white rounded-2xl p-6 border border-accent-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-primary">Must-Have Skills</h3>
                </div>
                <ul className="space-y-3">
                  {(role.skills_matrix.must_have || []).map((skill, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`mt-1 px-2 py-0.5 rounded text-xs font-medium ${skill.importance === "Critical" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {skill.importance}
                      </span>
                      <span className="text-gray-700">{skill.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Technical Skills */}
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 border border-primary-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-primary">Technical Skills</h3>
                </div>
                <ul className="space-y-3">
                  {(role.skills_matrix.technical || []).map((skill, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`mt-1 px-2 py-0.5 rounded text-xs font-medium ${skill.importance === "High" ? "bg-accent-50 text-accent-700" : "bg-gray-100 text-gray-700"}`}>
                        {skill.importance}
                      </span>
                      <span className="text-gray-700">{skill.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Soft Skills */}
              <div className="bg-gradient-to-br from-accent-50 to-white rounded-2xl p-6 border border-accent-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-primary">Soft Skills</h3>
                </div>
                <ul className="space-y-3">
                  {(role.skills_matrix.soft_skills || []).map((skill, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`mt-1 px-2 py-0.5 rounded text-xs font-medium ${skill.importance === "Critical" ? "bg-red-100 text-red-700" : skill.importance === "High" ? "bg-accent-50 text-accent-700" : "bg-gray-100 text-gray-700"}`}>
                        {skill.importance}
                      </span>
                      <span className="text-gray-700">{skill.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Day in the Life */}
      {role.day_in_life && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-accent" />
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">A Day in the Life</h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 prose prose-gray max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(role.day_in_life) }} />
            </div>
          </div>
        </section>
      )}

      {/* Career Path */}
      {role.career_path && role.career_path.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-accent" />
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">Career Progression Path</h2>
            </div>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-accent-200" />
              <div className="space-y-6">
                {role.career_path.map((step, i) => (
                  <div key={i} className="relative flex items-center gap-4 pl-14">
                    <div className={`absolute left-4 w-5 h-5 rounded-full border-2 ${i === 0 ? "bg-accent border-accent" : "bg-white border-accent-300"}`} />
                    <div className="bg-gray-50 rounded-lg px-5 py-3 border border-gray-200 flex-1">
                      <span className="text-sm text-accent font-medium">Level {i + 1}</span>
                      <p className="text-primary font-semibold">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Interview Questions */}
      {role.interview_questions && role.interview_questions.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-6 h-6 text-accent" />
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">Interview Questions & Answers</h2>
            </div>
            <p className="text-gray-600 mb-8">Prepare for your {role.job_title} interview with these commonly asked questions.</p>
            <div className="space-y-6">
              {role.interview_questions.map((q, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-primary">{q.question}</h3>
                      {q.difficulty && (
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                          q.difficulty === "Hard" ? "bg-red-100 text-red-700" :
                          q.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                    {q.category && (
                      <span className="inline-block mb-3 px-2 py-0.5 bg-accent-50 text-accent-700 rounded text-xs font-medium">
                        {q.category}
                      </span>
                    )}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-800">Sample Answer</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{q.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ATS Tips */}
      {role.ats_tips && role.ats_tips.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-accent" />
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">ATS Optimization Tips</h2>
            </div>
            <p className="text-gray-600 mb-8">Make sure your resume passes Applicant Tracking Systems used by US employers.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {role.ats_tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 bg-accent-50 border border-accent-100 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Common Mistakes */}
      {role.common_mistakes && role.common_mistakes.length > 0 && (
        <section className="py-16 bg-red-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">Common Resume Mistakes to Avoid</h2>
            </div>
            <p className="text-gray-600 mb-8">Don&apos;t make these errors that get resumes rejected.</p>
            <div className="space-y-4">
              {role.common_mistakes.map((mistake, i) => (
                <div key={i} className="flex items-start gap-3 bg-white border border-red-200 rounded-lg p-4">
                  <span className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-gray-700">{mistake}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Industry Context */}
      {role.industry_context && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-accent" />
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">Industry Outlook</h2>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 rounded-xl p-6 sm:p-8">
              <p className="text-gray-700 leading-relaxed mb-6">{role.industry_context.text}</p>
              {role.industry_context.companies && role.industry_context.companies.length > 0 && (
                <div>
                  <h3 className="font-semibold text-primary mb-3">Top Hiring Companies</h3>
                  <div className="flex flex-wrap gap-2">
                    {role.industry_context.companies.map((company, i) => (
                      <span key={i} className="bg-white border border-accent-200 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Template Gallery */}
      {role.template_gallery && role.template_gallery.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3 text-center">
              Recommended Resume Templates
            </h2>
            <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
              ATS-friendly templates designed specifically for {role.job_title} positions in the US market.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {role.template_gallery.map((template, i) => (
                <Link
                  key={i}
                  href="/resume-builder"
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-accent-200 transition-all"
                >
                  <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                    <img
                      src={template.img}
                      alt={`${template.name} Resume Template`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="font-semibold text-primary">{template.name}</span>
                    <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {role.faqs && role.faqs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {role.faqs.map((faq, i) => (
                <details key={i} className="group bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-5 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-primary pr-4">{faq.q}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform shrink-0" />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - matches site dark navy theme */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Build Your {role.job_title} Resume?
          </h2>
          <p className="text-xl text-primary-200 mb-8 max-w-xl mx-auto">
            Use our AI-powered resume builder to create an ATS-optimized resume tailored for {role.job_title} positions in the US market.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/resume-builder"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Zap size={20} />
              Start Building for Free
            </Link>
            <Link
              href="/resume-examples"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              <BookOpen size={20} />
              Browse Examples
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// --- Helper: Convert simple markdown to HTML ---
function formatMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/## (.*)/g, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p class='mb-4 text-gray-700 leading-relaxed'>")
    .replace(/^/, "<p class='mb-4 text-gray-700 leading-relaxed'>")
    .replace(/$/, "</p>");
}
