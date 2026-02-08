import Link from "next/link";
import {
  coverLetterExamples,
  getAllCoverLetterCategories,
} from "../lib/coverLetterExamples";
import { BASE_URL, BRAND_NAME } from "../lib/appConfig";
import {
  FileText,
  ArrowRight,
  Search,
  CheckCircle,
  Users,
  Star,
  Zap,
  Mail,
} from "lucide-react";

export const metadata = {
  title: `Cover Letter Examples & Writing Guides (2026) | ${BRAND_NAME}`,
  description: `Browse 25+ professional cover letter examples for every job and situation. Expert-written with key phrases, tips, and do's & don'ts. Build your cover letter in minutes with ${BRAND_NAME}.`,
  alternates: {
    canonical: `${BASE_URL}/cover-letter-examples`,
  },
  openGraph: {
    title: `Cover Letter Examples & Writing Guides (2026) | ${BRAND_NAME}`,
    description: `Expert-crafted cover letter examples for every job. Includes writing tips, key phrases, and free templates.`,
    url: `${BASE_URL}/cover-letter-examples`,
    type: "website",
  },
  keywords: [
    "cover letter examples",
    "cover letter samples",
    "professional cover letter examples",
    "cover letter writing guide",
    "free cover letter examples",
    "job cover letter examples",
    "cover letter templates",
    "how to write a cover letter",
  ],
};

export default function CoverLetterExamplesHub() {
  const categories = getAllCoverLetterCategories();
  const totalExamples = coverLetterExamples.length;

  // Get a selection of popular examples (first 12)
  const popularExamples = coverLetterExamples.slice(0, 12);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Cover Letter Examples & Writing Guides (2026)`,
    description: `Browse ${totalExamples}+ professional cover letter examples across ${categories.length} categories.`,
    url: `${BASE_URL}/cover-letter-examples`,
    provider: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: BASE_URL,
    },
    numberOfItems: totalExamples,
  };

  const faqs = [
    {
      q: "What should a cover letter include?",
      a: "A strong cover letter should include a compelling opening paragraph that states the role you're applying for, a body section highlighting your relevant experience and achievements with specific examples, a paragraph explaining why you're interested in the company, and a professional closing with a call to action. Keep it to one page and tailor it to each job.",
    },
    {
      q: "How long should a cover letter be?",
      a: "A cover letter should be 250–400 words, or roughly three to four paragraphs that fit on a single page. Hiring managers spend an average of 30 seconds reviewing a cover letter, so be concise, specific, and impactful. Every sentence should add value.",
    },
    {
      q: "Do I need a cover letter in 2026?",
      a: "Yes, in most cases. While some job postings say a cover letter is optional, submitting one gives you an advantage. A well-written cover letter lets you explain career gaps, show personality, and demonstrate genuine interest in the role—things a resume alone can't convey.",
    },
    {
      q: "How do I write a cover letter with no experience?",
      a: "Focus on transferable skills, academic projects, volunteer work, and internships. Emphasize your enthusiasm for the role and the company, and explain how your background—even if non-traditional—has prepared you. Use our entry-level and career change cover letter examples as templates.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">
              Cover Letter Examples
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-16 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,196,179,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
              <Mail size={16} />
              <span>{totalExamples}+ Expert-Written Examples</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
              Professional{" "}
              <span className="text-accent">Cover Letter Examples</span> &
              Writing Guides
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Browse {totalExamples}+ cover letter examples across{" "}
              {categories.length} categories. Each example includes the full
              cover letter text, key phrases, expert tips, and do&apos;s &
              don&apos;ts to help you write a compelling letter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cover-letter-builder"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Zap size={20} />
                Build Your Cover Letter Now
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
              <span>Hiring-Manager Approved</span>
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
          <h2 className="text-3xl font-bold text-primary mb-2 text-center">
            Popular Cover Letter Examples
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Start with our most popular cover letter examples, covering
            in-demand jobs, career situations, and industries.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {popularExamples.map((example) => (
              <Link
                key={example.slug}
                href={`/cover-letter-examples/${example.slug}`}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-accent-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-accent" />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-gray-300 group-hover:text-accent transition-colors mt-2"
                  />
                </div>
                <h3 className="font-semibold text-primary group-hover:text-accent transition-colors mb-1">
                  {example.title} Cover Letter
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {example.keyPhrases.slice(0, 3).join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-2 text-center">
            Browse Cover Letters by Category
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Find cover letter examples specific to your job title, career
            situation, or industry. Each category includes expert-written
            examples with writing tips.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryExamples = coverLetterExamples.filter(
                (e) => e.category === category.slug
              );
              return (
                <div
                  key={category.slug}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-primary text-lg">
                      {category.name}
                    </h3>
                    <span className="text-xs bg-accent-50 text-accent-600 px-2 py-1 rounded-full font-medium">
                      {category.count}{" "}
                      {category.count === 1 ? "example" : "examples"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="space-y-1.5 mb-4">
                    {categoryExamples.slice(0, 4).map((example) => (
                      <Link
                        key={example.slug}
                        href={`/cover-letter-examples/${example.slug}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-accent transition-colors"
                      >
                        <FileText size={14} className="text-gray-400" />
                        {example.title} Cover Letter
                      </Link>
                    ))}
                  </div>
                  {categoryExamples.length > 4 && (
                    <p className="text-xs text-gray-400">
                      +{categoryExamples.length - 4} more examples
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Examples A-Z */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-2 text-center">
            All Cover Letter Examples A–Z
          </h2>
          <p className="text-gray-600 text-center mb-10">
            Complete list of all {totalExamples}+ cover letter examples
            available on {BRAND_NAME}.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...coverLetterExamples]
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((example) => (
                <Link
                  key={example.slug}
                  href={`/cover-letter-examples/${example.slug}`}
                  className="text-sm text-gray-700 hover:text-accent hover:underline py-1 transition-colors"
                >
                  {example.title}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Write Your Cover Letter?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Use our AI-powered cover letter builder to create a personalized,
            professional cover letter in minutes. Match it to any job posting
            instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cover-letter-builder"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg"
            >
              Build Your Cover Letter Free
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/resume-examples"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Browse Resume Examples
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-primary pr-4">{faq.q}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-xl flex-shrink-0">
                    ▼
                  </span>
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
