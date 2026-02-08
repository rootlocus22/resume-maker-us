import Link from "next/link";
import { getAllCategories, resumeExamples } from "../lib/resumeExamples";
import { BASE_URL, BRAND_NAME } from "../lib/appConfig";
import { FileText, ArrowRight, Search, CheckCircle, Users, Star, Zap } from "lucide-react";

export const metadata = {
  title: `${resumeExamples.length}+ Free Resume Examples for Every Job (2026) | ${BRAND_NAME}`,
  description: `Browse ${resumeExamples.length}+ professional resume examples for every industry and job title. ATS-optimized, expert-written, with free templates. Build your resume in minutes.`,
  alternates: {
    canonical: `${BASE_URL}/resume-examples`,
  },
  openGraph: {
    title: `${resumeExamples.length}+ Free Professional Resume Examples | ${BRAND_NAME}`,
    description: `Expert-crafted resume examples for every job. ATS-optimized templates with writing guides and tips.`,
    url: `${BASE_URL}/resume-examples`,
    type: "website",
  },
  keywords: [
    "resume examples",
    "resume samples",
    "professional resume examples",
    "resume examples for jobs",
    "free resume examples",
    "ATS resume examples",
    "resume writing examples",
    "job resume examples",
  ],
};

export default function ResumeExamplesHub() {
  const categories = getAllCategories();
  const totalExamples = resumeExamples.length;

  // Get top/popular examples
  const popularExamples = resumeExamples.filter(e => e.searchVolume === "high").slice(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${totalExamples}+ Free Resume Examples for Every Job`,
    description: `Browse ${totalExamples}+ professional resume examples across ${categories.length} industries.`,
    url: `${BASE_URL}/resume-examples`,
    provider: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: BASE_URL,
    },
    numberOfItems: totalExamples,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-16 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,196,179,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
              <FileText size={16} />
              <span>{totalExamples}+ Expert-Written Examples</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
              Free Professional <span className="text-accent">Resume Examples</span> for Every Job
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Browse {totalExamples}+ resume examples across {categories.length} industries. Each example is ATS-optimized, 
              expert-written, and comes with a complete writing guide to help you land more interviews.
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
                href="#categories"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all border border-gray-200"
              >
                <Search size={20} />
                Browse by Category
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-accent" />
              <span>ATS-Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary-400" />
              <span>Trusted by 100,000+ Job Seekers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-500" />
              <span>Expert-Written Content</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Examples */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-2 text-center">Most Popular Resume Examples</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Start with our most-viewed resume examples, covering the top in-demand jobs in the US market.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {popularExamples.map((example) => (
              <Link
                key={example.slug}
                href={`/resume-examples/${example.category}/${example.slug}`}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-accent-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-accent" />
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-accent transition-colors mt-2" />
                </div>
                <h3 className="font-semibold text-primary group-hover:text-accent transition-colors mb-1">
                  {example.title} Resume
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {example.skills.slice(0, 4).join(" · ")}
                </p>
                {example.salaryRange && (
                  <p className="text-xs text-accent-600 mt-2 font-medium">
                    ${(example.salaryRange.min / 1000).toFixed(0)}K - ${(example.salaryRange.max / 1000).toFixed(0)}K avg salary
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-2 text-center">Browse Resume Examples by Industry</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Find resume examples specific to your industry. Each category includes expert-written examples 
            with ATS-optimized formatting and writing tips.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/resume-examples/${category.slug}`}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-accent-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                  <span className="text-xs bg-accent-50 text-accent-600 px-2 py-1 rounded-full font-medium">
                    {category.count} {category.count === 1 ? "example" : "examples"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{category.description}</p>
                <span className="text-sm text-accent font-medium group-hover:underline inline-flex items-center gap-1">
                  View Examples <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Examples List */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-2 text-center">All Resume Examples A-Z</h2>
          <p className="text-gray-600 text-center mb-10">
            Complete list of all {totalExamples}+ resume examples available on {BRAND_NAME}.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...resumeExamples].sort((a, b) => a.title.localeCompare(b.title)).map((example) => (
              <Link
                key={example.slug}
                href={`/resume-examples/${example.category}/${example.slug}`}
                className="text-sm text-gray-700 hover:text-accent hover:underline py-1 transition-colors"
              >
                {example.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-400">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Resume?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Use our AI-powered resume builder with ATS-optimized templates. Build a professional resume 
            in minutes, not hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/resume-builder"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg"
            >
              Build Your Resume Free
              <ArrowRight size={20} />
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

      {/* FAQ Schema */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I use these resume examples?",
                a: "Browse our resume examples to find one that matches your job title or industry. Use the example as inspiration for your own resume's structure, content, and keywords. Then use our AI resume builder to create your personalized version with ATS-optimized formatting.",
              },
              {
                q: "Are these resume examples free?",
                a: "Yes! All resume examples on ExpertResume are completely free to view and use as reference. You can also build your own resume for free using our resume builder.",
              },
              {
                q: "Are these resume examples ATS-friendly?",
                a: "Absolutely. Every resume example is designed with ATS (Applicant Tracking System) compatibility in mind. We include the right keywords, formatting, and structure that ATS systems scan for.",
              },
              {
                q: "How often are the resume examples updated?",
                a: "We update our resume examples quarterly to reflect current hiring trends, in-demand skills, and industry changes. All examples are current for 2026.",
              },
              {
                q: "Can I download these resume examples as PDF?",
                a: "You can use any of our resume examples as a starting point in our resume builder, customize it with your information, and download it as a PDF.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-primary pr-4">{faq.q}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-xl flex-shrink-0">▼</span>
                </summary>
                <div className="px-5 pb-5 text-gray-600">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
