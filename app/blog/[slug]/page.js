import Link from "next/link";
import { notFound } from "next/navigation";
import {
  blogArticles,
  blogCategories,
  getArticleBySlug,
  getAllArticleSlugs,
  getRelatedArticles,
} from "../../lib/blogArticles";
import { BASE_URL, BRAND_NAME } from "../../lib/appConfig";
import { getCanonicalUrl } from "../../lib/canonical";
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  User,
  BookOpen,
  Lightbulb,
  List,
  ChevronRight,
  Zap,
  HelpCircle,
  ExternalLink,
  Tag,
} from "lucide-react";

export async function generateStaticParams() {
  return getAllArticleSlugs().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  const canonical = await getCanonicalUrl(`/blog/${article.slug}`);
  return {
    title: `${article.metaTitle} | ${BRAND_NAME}`,
    description: article.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: canonical,
      type: "article",
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate,
      authors: [article.author],
    },
    keywords: article.keywords,
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderContentSection(section, index) {
  switch (section.type) {
    case "paragraph":
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-6 text-lg">
          {section.text}
        </p>
      );
    case "heading":
      if (section.level === 2) {
        return (
          <h2
            key={index}
            id={slugify(section.text)}
            className="text-2xl sm:text-3xl font-bold text-primary mt-10 mb-4 scroll-mt-24"
          >
            {section.text}
          </h2>
        );
      }
      return (
        <h3
          key={index}
          id={slugify(section.text)}
          className="text-xl sm:text-2xl font-semibold text-primary-800 mt-8 mb-3 scroll-mt-24"
        >
          {section.text}
        </h3>
      );
    case "list":
      return (
        <ul
          key={index}
          className="mb-6 space-y-2 pl-1"
        >
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-700 text-lg">
              <ChevronRight
                size={18}
                className="text-accent mt-1 flex-shrink-0"
              />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <div
          key={index}
          className="bg-accent-50 border-l-4 border-accent rounded-r-xl p-5 mb-6"
        >
          <div className="flex items-start gap-3">
            <Lightbulb
              size={20}
              className="text-accent flex-shrink-0 mt-0.5"
            />
            <p className="text-gray-700 leading-relaxed">{section.text}</p>
          </div>
        </div>
      );
    case "example":
      return (
        <div
          key={index}
          className="bg-primary-50 border border-primary-100 rounded-xl p-5 mb-6"
        >
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
            Example
          </p>
          <p className="text-gray-700 leading-relaxed italic">
            {section.text}
          </p>
        </div>
      );
    default:
      return null;
  }
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const relatedArticlesList = getRelatedArticles(article.relatedArticles || []);
  const categoryData = blogCategories[article.category];

  // Schema: Article
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    author: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    datePublished: article.publishedDate,
    dateModified: article.updatedDate,
    url: `${BASE_URL}/blog/${article.slug}`,
    mainEntityOfPage: `${BASE_URL}/blog/${article.slug}`,
    keywords: article.keywords.join(", "),
  };

  // Schema: FAQ
  const faqSchema =
    article.faq && article.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }
      : null;

  // Schema: Breadcrumb
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
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${BASE_URL}/blog/${article.slug}`,
      },
    ],
  };

  const categoryColorMap = {
    "resume-writing": "bg-primary-50 text-primary-700",
    "cover-letters": "bg-accent-50 text-accent-700",
    "ats-optimization": "bg-amber-50 text-amber-700",
    "career-advice": "bg-emerald-50 text-emerald-700",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link href="/blog" className="hover:text-accent transition-colors">
              Blog
            </Link>
            <ChevronRight size={14} />
            <span className="text-primary font-medium truncate max-w-xs sm:max-w-md">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <header className="bg-gradient-to-b from-primary-50 to-white pt-10 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                categoryColorMap[article.category] || "bg-gray-100 text-gray-700"
              }`}
            >
              {categoryData?.name || article.category}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 text-sm">
              <Clock size={14} />
              {article.readTime}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 text-sm">
              <Calendar size={14} />
              {new Date(article.publishedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">{article.excerpt}</p>
          <div className="flex items-center gap-2 mt-6 text-sm text-gray-500">
            <User size={16} className="text-primary-400" />
            <span>
              By <strong className="text-primary-700">{article.author}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Table of Contents - Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wide mb-4">
                  <List size={16} />
                  Table of Contents
                </h2>
                <nav className="space-y-1.5">
                  {article.tableOfContents.map((heading, i) => (
                    <a
                      key={i}
                      href={`#${slugify(heading)}`}
                      className="block text-sm text-gray-600 hover:text-accent hover:pl-1 transition-all py-1 border-l-2 border-transparent hover:border-accent pl-3"
                    >
                      {heading}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Quick CTA in sidebar */}
              {article.relatedTools && article.relatedTools.length > 0 && (
                <div className="mt-6 bg-gradient-to-b from-primary-50 to-accent-50 rounded-xl border border-primary-100 p-5">
                  <h3 className="text-sm font-bold text-primary mb-3">
                    Related Tools
                  </h3>
                  <div className="space-y-2">
                    {article.relatedTools.map((tool, i) => (
                      <Link
                        key={i}
                        href={tool.url}
                        className="flex items-center gap-2 text-sm text-primary-700 hover:text-accent transition-colors py-1"
                      >
                        <Zap size={14} className="text-accent" />
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Article Body */}
          <article className="flex-1 min-w-0 max-w-3xl">
            {/* Mobile TOC */}
            <div className="lg:hidden bg-white rounded-xl border border-gray-100 p-5 mb-8 shadow-sm">
              <details>
                <summary className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wide cursor-pointer">
                  <List size={16} />
                  Table of Contents
                </summary>
                <nav className="mt-3 space-y-1.5 pl-1">
                  {article.tableOfContents.map((heading, i) => (
                    <a
                      key={i}
                      href={`#${slugify(heading)}`}
                      className="block text-sm text-gray-600 hover:text-accent py-1"
                    >
                      {heading}
                    </a>
                  ))}
                </nav>
              </details>
            </div>

            {/* Rendered Content Sections */}
            {article.content.map((section, index) =>
              renderContentSection(section, index)
            )}

            {/* FAQ Section */}
            {article.faq && article.faq.length > 0 && (
              <section className="mt-14">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 flex items-center gap-3">
                  <HelpCircle size={28} className="text-accent" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {article.faq.map((item, i) => (
                    <details
                      key={i}
                      className="group bg-white border border-gray-100 rounded-xl overflow-hidden"
                      open={i === 0}
                    >
                      <summary className="flex items-start gap-3 p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                        <ChevronRight
                          size={20}
                          className="text-accent mt-0.5 flex-shrink-0 group-open:rotate-90 transition-transform"
                        />
                        <span className="font-semibold text-primary text-lg">
                          {item.q}
                        </span>
                      </summary>
                      <div className="px-5 pb-5 pl-12">
                        <p className="text-gray-700 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Related Articles */}
            {relatedArticlesList.length > 0 && (
              <section className="mt-14">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Related Guides
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedArticlesList.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/blog/${related.slug}`}
                      className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all"
                    >
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full mb-2 ${
                          categoryColorMap[related.category] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {blogCategories[related.category]?.name}
                      </span>
                      <h3 className="font-semibold text-primary group-hover:text-accent transition-colors mb-1 leading-snug">
                        {related.title}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {related.readTime}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related Tools CTA */}
            {article.relatedTools && article.relatedTools.length > 0 && (
              <section className="mt-14">
                <div className="bg-gradient-to-r from-primary to-primary-800 rounded-2xl p-8 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    Put This Guide Into Action
                  </h2>
                  <p className="text-primary-100 mb-6">
                    Use ExpertResume&apos;s free tools to create your resume, check
                    your ATS score, and land more interviews.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {article.relatedTools.map((tool, i) => (
                      <Link
                        key={i}
                        href={tool.url}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                      >
                        <Zap size={16} />
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Author Bio */}
            <section className="mt-14 bg-gray-50 rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-lg">
                    {article.author}
                  </h3>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    The {BRAND_NAME} editorial team consists of certified resume
                    writers, career coaches, and HR professionals with decades of
                    combined experience helping job seekers land their dream
                    roles. Every guide is researched, fact-checked, and updated
                    regularly to reflect current hiring trends.
                  </p>
                </div>
              </div>
            </section>

            {/* Back to Blog */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-primary hover:text-accent font-medium transition-colors"
              >
                <ArrowLeft size={18} />
                Back to all guides
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
