import Link from "next/link";
import {
  blogArticles,
  blogCategories,
  getArticlesByCategory,
} from "../lib/blogArticles";
import { BASE_URL, BRAND_NAME } from "../lib/appConfig";
import {
  FileText,
  ArrowRight,
  Clock,
  BookOpen,
  Mail,
  ScanSearch,
  Compass,
  Zap,
  Tag,
} from "lucide-react";

export const metadata = {
  title: `Resume Writing Tips, Career Advice & Job Search Guides | ${BRAND_NAME} Blog`,
  description: `Expert resume writing tips, cover letter guides, ATS optimization strategies, and career advice. Actionable how-to guides to help you land more interviews in 2026.`,
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
  openGraph: {
    title: `Resume Writing Tips, Career Advice & Job Search Guides | ${BRAND_NAME} Blog`,
    description: `Expert resume writing tips, cover letter guides, and career advice to help you land your dream job.`,
    url: `${BASE_URL}/blog`,
    type: "website",
  },
  keywords: [
    "resume writing tips",
    "how to write a resume",
    "career advice",
    "job search guide",
    "resume help",
    "cover letter tips",
    "ATS resume tips",
    "interview tips",
  ],
};

const categoryIcons = {
  "resume-writing": FileText,
  "cover-letters": Mail,
  "ats-optimization": ScanSearch,
  "career-advice": Compass,
};

const categoryColors = {
  "resume-writing": "bg-primary-50 text-primary-700",
  "cover-letters": "bg-accent-50 text-accent-700",
  "ats-optimization": "bg-amber-50 text-amber-700",
  "career-advice": "bg-emerald-50 text-emerald-700",
};

export default function BlogHub() {
  const totalArticles = blogArticles.length;
  const featured = blogArticles[0];
  const remaining = blogArticles.slice(1);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Resume Writing Tips, Career Advice & Job Search Guides`,
    description: `Browse ${totalArticles}+ expert how-to guides on resume writing, cover letters, ATS optimization, and career advice.`,
    url: `${BASE_URL}/blog`,
    provider: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: BASE_URL,
    },
    numberOfItems: totalArticles,
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
        name: "Blog",
        item: `${BASE_URL}/blog`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-16 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,196,179,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
              <BookOpen size={16} />
              <span>Expert Guides & Tips</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
              Resume Writing Tips &{" "}
              <span className="text-accent">Career Guides</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Actionable how-to guides, expert tips, and proven strategies to
              help you write better resumes, ace cover letters, beat ATS systems,
              and land more interviews.
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
                href="/ats-score-checker"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary border-2 border-primary-100 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-50 transition-all"
              >
                <ScanSearch size={20} />
                Check Your ATS Score
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-16">
        <Link href={`/blog/${featured.slug}`} className="block group">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-accent-50 text-accent-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                  Featured Guide
                </span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    categoryColors[featured.category]
                  }`}
                >
                  {blogCategories[featured.category]?.name}
                </span>
                <span className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock size={14} />
                  {featured.readTime}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">
                {featured.title}
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl">
                {featured.excerpt}
              </p>
              <span className="inline-flex items-center gap-2 text-accent font-semibold group-hover:gap-3 transition-all">
                Read the full guide
                <ArrowRight size={18} />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-2xl font-bold text-primary mb-6">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(blogCategories).map(([slug, cat]) => {
            const Icon = categoryIcons[slug] || FileText;
            const count = getArticlesByCategory(slug).length;
            return (
              <div
                key={slug}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${categoryColors[slug]}`}
                >
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-primary mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{cat.description}</p>
                <span className="text-xs text-gray-400">
                  {count} {count === 1 ? "article" : "articles"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Article Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-2xl font-bold text-primary mb-8">All Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {remaining.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      categoryColors[article.category]
                    }`}
                  >
                    {blogCategories[article.category]?.name}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock size={12} />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm text-accent font-medium group-hover:gap-2.5 transition-all">
                  Read guide
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary-800 py-16 mb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Build Your Resume?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Put these tips into action with ExpertResume&apos;s AI-powered resume
            builder. Create a professional, ATS-optimized resume in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/resume-builder"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg"
            >
              <Zap size={20} />
              Build Your Resume Free
            </Link>
            <Link
              href="/resume-examples"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all"
            >
              <FileText size={20} />
              Browse Resume Examples
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
