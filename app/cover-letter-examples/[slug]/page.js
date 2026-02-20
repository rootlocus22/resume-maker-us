import Link from "next/link";
import { notFound } from "next/navigation";
import {
  coverLetterExamples,
  getCoverLetterBySlug,
  getAllCoverLetterSlugs,
  getAllCoverLetterCategories,
} from "../../lib/coverLetterExamples";
import { getExampleBySlug as getResumeBySlug } from "../../lib/resumeExamples";
import { BASE_URL, BRAND_NAME } from "../../lib/appConfig";
import { getCanonicalUrl } from "../../lib/canonical";
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Zap,
  Star,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Mail,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export async function generateStaticParams() {
  return getAllCoverLetterSlugs().map(({ slug }) => ({
    slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const example = getCoverLetterBySlug(slug);
  if (!example) return { title: "Cover Letter Example Not Found" };

  const canonical = await getCanonicalUrl(`/cover-letter-examples/${example.slug}`);
  return {
    title: example.metaTitle,
    description: example.metaDescription,
    alternates: {
      canonical,
      languages: {
        'en-US': `https://www.expertresume.us/cover-letter-examples/${example.slug}`,
        'en-IN': `https://www.expertresume.us/cover-letter-examples/${example.slug}`,
        'x-default': `https://www.expertresume.us/cover-letter-examples/${example.slug}`,
      }
    },
    openGraph: {
      title: example.metaTitle,
      description: example.metaDescription,
      url: canonical,
      type: "article",
    },
    keywords: example.keywords,
  };
}

export default async function CoverLetterExamplePage({ params }) {
  const { slug } = await params;
  const example = getCoverLetterBySlug(slug);
  if (!example) notFound();

  // Get related cover letter examples
  const relatedCoverLetters = (example.relatedExamples || [])
    .map((s) => getCoverLetterBySlug(s))
    .filter(Boolean);

  // Get related resume example if it exists
  const relatedResume = example.relatedResumeExample
    ? getResumeBySlug(example.relatedResumeExample)
    : null;

  // Get category info
  const categories = getAllCoverLetterCategories();
  const categoryData = categories.find((c) => c.slug === example.category);

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (example.faq || []).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: example.metaTitle,
    description: example.metaDescription,
    author: { "@type": "Organization", name: BRAND_NAME },
    publisher: { "@type": "Organization", name: BRAND_NAME, url: BASE_URL },
    datePublished: "2026-01-15",
    dateModified: new Date().toISOString().split("T")[0],
    url: `${BASE_URL}/cover-letter-examples/${example.slug}`,
  };

  // Breadcrumb schema
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
        name: "Cover Letter Examples",
        item: `${BASE_URL}/cover-letter-examples`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${example.title} Cover Letter`,
        item: `${BASE_URL}/cover-letter-examples/${example.slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <span>/</span>
            <Link href="/cover-letter-examples" className="hover:text-accent">
              Cover Letter Examples
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">
              {example.title} Cover Letter
            </span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-10 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <Link
              href="/cover-letter-examples"
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-4"
            >
              <ArrowLeft size={14} /> All Cover Letter Examples
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4 leading-tight">
              {example.title}{" "}
              <span className="text-accent">Cover Letter Example</span> &
              Writing Guide
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-3xl">
              {example.metaDescription}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
              <span className="flex items-center gap-1">
                <CheckCircle size={16} className="text-accent" />{" "}
                Hiring-Manager Approved
              </span>
              <span className="flex items-center gap-1">
                <Star size={16} className="text-amber-500" /> Expert-Written
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={16} className="text-primary-400" /> Updated 2026
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/cover-letter-builder"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-600 transition-all shadow-lg"
              >
                <Zap size={18} />
                Build Your {example.title} Cover Letter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - 2 Column Layout */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Table of Contents */}
              <nav className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h2 className="font-semibold text-primary mb-3">
                  Table of Contents
                </h2>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#cover-letter" className="text-accent hover:underline">
                      1. {example.title} Cover Letter Example
                    </a>
                  </li>
                  <li>
                    <a href="#key-phrases" className="text-accent hover:underline">
                      2. Key Phrases to Include
                    </a>
                  </li>
                  <li>
                    <a href="#tips" className="text-accent hover:underline">
                      3. Expert Writing Tips
                    </a>
                  </li>
                  <li>
                    <a href="#dos-donts" className="text-accent hover:underline">
                      4. Do&apos;s & Don&apos;ts
                    </a>
                  </li>
                  {example.faq && example.faq.length > 0 && (
                    <li>
                      <a href="#faq" className="text-accent hover:underline">
                        5. Frequently Asked Questions
                      </a>
                    </li>
                  )}
                </ul>
              </nav>

              {/* Cover Letter Preview */}
              <div id="cover-letter">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Mail className="text-accent" size={24} />
                  {example.title} Cover Letter Example
                </h2>
                <p className="text-gray-600 mb-6">
                  Here&apos;s a professional {example.title.toLowerCase()} cover
                  letter example you can use as a reference. Customize it with
                  your own experience, achievements, and the specific company
                  details.
                </p>

                {/* Cover Letter Card */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
                  <div className="prose prose-gray max-w-none">
                    {example.coverLetterText.split("\n\n").map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-sm text-gray-700 leading-relaxed mb-4 last:mb-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <Link
                    href="/cover-letter-builder"
                    className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-600 transition-colors"
                  >
                    <Zap size={18} />
                    Customize This Cover Letter
                  </Link>
                </div>
              </div>

              {/* Key Phrases */}
              <div id="key-phrases">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Star className="text-accent" size={24} />
                  Key Phrases for a {example.title} Cover Letter
                </h2>
                <p className="text-gray-600 mb-4">
                  Include these powerful phrases in your{" "}
                  {example.title.toLowerCase()} cover letter to demonstrate
                  expertise and make an impression on hiring managers:
                </p>
                <div className="flex flex-wrap gap-2">
                  {example.keyPhrases.map((phrase) => (
                    <span
                      key={phrase}
                      className="bg-accent-50 text-accent-700 px-3 py-1.5 rounded-full text-sm font-medium border border-accent-200"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
                <div className="mt-4 bg-accent-50 border border-accent-200 rounded-xl p-4">
                  <p className="text-sm text-primary-700">
                    <strong>Pro Tip:</strong> Don&apos;t just list these
                    phrases—weave them naturally into your cover letter to show
                    genuine expertise. Hiring managers can spot keyword stuffing.
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div id="tips">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Lightbulb className="text-accent" size={24} />
                  Expert Tips for Your {example.title} Cover Letter
                </h2>
                <div className="space-y-3">
                  {example.tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-start bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-50 text-accent rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div id="dos-donts">
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                  <CheckCircle className="text-accent" size={24} />
                  Do&apos;s & Don&apos;ts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Do's */}
                  <div className="bg-accent-50 rounded-xl p-6 border border-accent-200">
                    <div className="flex items-center gap-2 mb-4">
                      <ThumbsUp size={20} className="text-accent-700" />
                      <h3 className="font-semibold text-accent-700 text-lg">
                        Do&apos;s
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {example.dos.map((item, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <CheckCircle
                            size={16}
                            className="text-accent-600 flex-shrink-0 mt-0.5"
                          />
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Don'ts */}
                  <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                    <div className="flex items-center gap-2 mb-4">
                      <ThumbsDown size={20} className="text-red-700" />
                      <h3 className="font-semibold text-red-700 text-lg">
                        Don&apos;ts
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {example.donts.map((item, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <span className="text-red-500 flex-shrink-0 mt-0.5 text-sm font-bold">
                            ✕
                          </span>
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              {example.faq && example.faq.length > 0 && (
                <div id="faq">
                  <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                    <HelpCircle className="text-accent" size={24} />
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3">
                    {example.faq.map((faq, i) => (
                      <details
                        key={i}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden group"
                      >
                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                          <h3 className="font-medium text-primary pr-4 text-left">
                            {faq.q}
                          </h3>
                          <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg flex-shrink-0">
                            ▼
                          </span>
                        </summary>
                        <div className="px-5 pb-5 text-gray-600">{faq.a}</div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* CTA Card */}
                <div className="bg-gradient-to-br from-primary to-primary-700 rounded-xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">
                    Build Your {example.title} Cover Letter
                  </h3>
                  <p className="text-primary-100 text-sm mb-4">
                    Use our AI-powered builder to create a personalized cover
                    letter in minutes.
                  </p>
                  <Link
                    href="/cover-letter-builder"
                    className="inline-flex items-center gap-2 bg-accent text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-accent-600 transition-colors w-full justify-center"
                  >
                    <Zap size={16} />
                    Start Building Free
                  </Link>
                </div>

                {/* Related Resume Example */}
                {relatedResume && (
                  <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
                    <h3 className="font-bold text-primary mb-2">
                      Matching Resume Example
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Pair this cover letter with a matching{" "}
                      {relatedResume.title} resume for a complete application.
                    </p>
                    <Link
                      href={`/resume-examples/${relatedResume.category}/${relatedResume.slug}`}
                      className="inline-flex items-center gap-2 bg-primary-100 text-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-200 transition-colors w-full justify-center border border-primary-200"
                    >
                      <FileText size={16} />
                      View {relatedResume.title} Resume
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}

                {/* Related Cover Letters */}
                {relatedCoverLetters.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-primary mb-4">
                      Related Cover Letter Examples
                    </h3>
                    <div className="space-y-2">
                      {relatedCoverLetters.map((r) => (
                        <Link
                          key={r.slug}
                          href={`/cover-letter-examples/${r.slug}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <span className="text-sm text-gray-700 group-hover:text-accent">
                            {r.title} Cover Letter
                          </span>
                          <ArrowRight
                            size={14}
                            className="text-gray-300 group-hover:text-accent"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Builder CTA */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-primary mb-2">
                    Need a Resume Too?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Build a professional, ATS-optimized resume to go with your
                    cover letter.
                  </p>
                  <Link
                    href="/resume-builder"
                    className="inline-flex items-center gap-2 bg-accent-50 text-accent-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-accent-100 transition-colors w-full justify-center border border-accent-200"
                  >
                    <FileText size={16} />
                    Build Your Resume Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 bg-gradient-to-r from-primary to-primary-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Create Your {example.title} Cover Letter Now
          </h2>
          <p className="text-primary-100 mb-6">
            Use this example as a starting point. Our AI cover letter builder
            will help you customize it for your target job in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cover-letter-builder"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-semibold hover:bg-accent-600 transition-all shadow-lg"
            >
              <Zap size={20} />
              Build Your Cover Letter Free
            </Link>
            <Link
              href="/cover-letter-examples"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Browse More Examples
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
