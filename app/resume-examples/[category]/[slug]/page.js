import Link from "next/link";
import { notFound } from "next/navigation";
import { getExampleBySlug, getCategoryBySlug, getRelatedExamples, getAllExampleSlugs } from "../../../lib/resumeExamples";
import { BASE_URL, BRAND_NAME } from "../../../lib/appConfig";
import { getCanonicalUrl } from "../../../lib/canonical";
import { FileText, ArrowRight, ArrowLeft, CheckCircle, Zap, Star, DollarSign, TrendingUp, BookOpen, AlertCircle, Award, Lightbulb, Target, Download } from "lucide-react";

export async function generateStaticParams() {
  return getAllExampleSlugs().map(({ category, slug }) => ({
    category,
    slug,
  }));
}

import { sanitizeGlobalSlug } from "../../../lib/slugUtils";

export async function generateMetadata({ params }) {
  const { category, slug } = await params;
  const example = getExampleBySlug(slug);
  if (!example) return { title: "Resume Example Not Found" };

  const canonical = await getCanonicalUrl(`/resume-examples/${category}/${example.slug}`);
  const sanitizedSlug = sanitizeGlobalSlug(example.slug);

  return {
    title: example.metaTitle,
    description: example.metaDescription,
    alternates: {
      canonical,
      languages: {
        'en-US': `https://www.expertresume.us/resume-examples/${category}/${example.slug}`,
        'en-IN': `https://www.expertresume.us/resume-format-for/${sanitizedSlug}`,
        'en-GB': `https://www.expertresume.us/uk/cv-examples/${sanitizedSlug}`,
        'x-default': `https://www.expertresume.us/resume-examples/${category}/${example.slug}`,
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

export default async function ResumeExamplePage({ params }) {
  const { slug, category } = await params;
  const example = getExampleBySlug(slug);
  if (!example) notFound();

  const categoryData = getCategoryBySlug(category);
  const related = getRelatedExamples(example.relatedExamples || []);

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
    url: `${BASE_URL}/resume-examples/${example.category}/${example.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-accent">Home</Link>
            <span>/</span>
            <Link href="/resume-examples" className="hover:text-accent">Resume Examples</Link>
            <span>/</span>
            <Link href={`/resume-examples/${category}`} className="hover:text-accent">{categoryData?.name}</Link>
            <span>/</span>
            <span className="text-primary font-medium">{example.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-10 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <Link href={`/resume-examples/${category}`} className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-4">
              <ArrowLeft size={14} /> {categoryData?.name} Resume Examples
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4 leading-tight">
              {example.title} <span className="text-accent">Resume Example</span> & Writing Guide
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-3xl">
              {example.metaDescription}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
              <span className="flex items-center gap-1"><CheckCircle size={16} className="text-accent" /> ATS-Optimized</span>
              <span className="flex items-center gap-1"><Star size={16} className="text-amber-500" /> Expert-Written</span>
              <span className="flex items-center gap-1"><BookOpen size={16} className="text-primary-400" /> Updated 2026</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/resume-builder"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-600 transition-all shadow-lg"
              >
                <Zap size={18} />
                Build Your {example.title} Resume
              </Link>
              <Link
                href="/ats-score-checker"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200"
              >
                Check ATS Score Free
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
                <h2 className="font-semibold text-primary mb-3">Table of Contents</h2>
                <ul className="space-y-2 text-sm">
                  <li><a href="#example" className="text-accent hover:underline">1. {example.title} Resume Example</a></li>
                  <li><a href="#summary" className="text-accent hover:underline">2. Resume Summary Examples</a></li>
                  <li><a href="#experience" className="text-accent hover:underline">3. Work Experience & Bullet Points</a></li>
                  <li><a href="#skills" className="text-accent hover:underline">4. Key Skills for {example.title} Resume</a></li>
                  <li><a href="#ats-keywords" className="text-accent hover:underline">5. ATS Keywords</a></li>
                  <li><a href="#education" className="text-accent hover:underline">6. Education & Certifications</a></li>
                  <li><a href="#tips" className="text-accent hover:underline">7. Expert Tips</a></li>
                  <li><a href="#salary" className="text-accent hover:underline">8. Salary & Job Outlook</a></li>
                  <li><a href="#faq" className="text-accent hover:underline">9. FAQs</a></li>
                </ul>
              </nav>

              {/* Resume Example Preview */}
              <div id="example">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <FileText className="text-accent" size={24} />
                  {example.title} Resume Example
                </h2>
                <p className="text-gray-600 mb-6">
                  Here&apos;s a professional {example.title.toLowerCase()} resume example that you can use as a reference.
                  This example highlights the key sections and content that hiring managers look for.
                </p>

                {/* Resume Preview Card */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h3 className="text-xl font-bold text-primary">Alex Johnson</h3>
                    <p className="text-accent font-medium">{example.title}</p>
                    <p className="text-sm text-gray-500 mt-1">New York, NY | alex.johnson@email.com | (555) 123-4567 | linkedin.com/in/alexjohnson</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Professional Summary</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{example.summary.text}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Work Experience</h4>
                    <div className="mb-3">
                      <div className="flex justify-between items-baseline">
                        <p className="text-sm font-semibold text-gray-800">Senior {example.title}</p>
                        <p className="text-xs text-gray-500">2022 – Present</p>
                      </div>
                      <p className="text-xs text-gray-500 italic mb-1">ABC Corporation, New York, NY</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {example.bulletPoints.slice(0, 3).map((bp, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-gray-400 flex-shrink-0">•</span>
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="flex justify-between items-baseline">
                        <p className="text-sm font-semibold text-gray-800">{example.title}</p>
                        <p className="text-xs text-gray-500">2019 – 2022</p>
                      </div>
                      <p className="text-xs text-gray-500 italic mb-1">XYZ Company, Chicago, IL</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {example.bulletPoints.slice(3).map((bp, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-gray-400 flex-shrink-0">•</span>
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Skills</h4>
                    <p className="text-sm text-gray-700">{example.skills.join(" • ")}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Education</h4>
                    {example.education.map((edu, i) => (
                      <p key={i} className="text-sm text-gray-700">{edu}</p>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <Link
                    href="/resume-builder"
                    className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-600 transition-colors"
                  >
                    <Download size={18} />
                    Use This Template in Resume Builder
                  </Link>
                </div>
              </div>

              {/* Resume Summary */}
              <div id="summary">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Target className="text-accent" size={24} />
                  {example.title} Resume Summary Examples
                </h2>
                <p className="text-gray-600 mb-4">
                  Your resume summary is the first thing hiring managers read. Here&apos;s a strong example for a
                  {example.title.toLowerCase()} with {example.summary.yearsExperience} years of experience:
                </p>
                <div className="bg-accent-50 border border-accent-200 rounded-xl p-5 mb-4">
                  <div className="flex items-center gap-2 text-accent-700 font-medium text-sm mb-2">
                    <CheckCircle size={16} /> Good Example
                  </div>
                  <p className="text-gray-700 italic">&ldquo;{example.summary.text}&rdquo;</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
                    <AlertCircle size={16} /> Avoid This
                  </div>
                  <p className="text-gray-700 italic">
                    &ldquo;Hardworking {example.title.toLowerCase()} looking for a challenging position where I can utilize my skills
                    and experience. I am a team player with excellent communication skills.&rdquo;
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  <strong>Why the first example works:</strong> It includes specific years of experience, quantified achievements,
                  technical skills, and certifications — all things ATS systems and hiring managers look for.
                </p>
              </div>

              {/* Work Experience */}
              <div id="experience">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Award className="text-accent" size={24} />
                  Work Experience Bullet Points
                </h2>
                <p className="text-gray-600 mb-4">
                  Here are powerful, metrics-driven bullet points for a {example.title.toLowerCase()} resume.
                  Notice how each one starts with an action verb and includes specific numbers:
                </p>
                <ul className="space-y-3">
                  {example.bulletPoints.map((bp, i) => (
                    <li key={i} className="flex gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <CheckCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{bp}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-accent-50 border border-accent-200 rounded-xl p-4">
                  <p className="text-sm text-primary-400">
                    <strong>Pro Tip:</strong> Use the formula: <strong>Action Verb + Task + Quantified Result</strong>.
                    For example: &ldquo;Managed&rdquo; + &ldquo;team of 12 engineers&rdquo; + &ldquo;delivering project 20% under budget.&rdquo;
                  </p>
                </div>
              </div>

              {/* Skills Section */}
              <div id="skills">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Star className="text-accent" size={24} />
                  Key Skills for a {example.title} Resume
                </h2>
                <p className="text-gray-600 mb-4">
                  Include these skills on your {example.title.toLowerCase()} resume to pass ATS screening and impress hiring managers:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {example.skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                      <CheckCircle size={14} className="text-accent flex-shrink-0" />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ATS Keywords */}
              <div id="ats-keywords">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Target className="text-accent" size={24} />
                  ATS Keywords for {example.title} Resume
                </h2>
                <p className="text-gray-600 mb-4">
                  These are the most important keywords that Applicant Tracking Systems scan for in {example.title.toLowerCase()} resumes.
                  Include them naturally throughout your resume:
                </p>
                <div className="flex flex-wrap gap-2">
                  {example.atsKeywords.map((keyword) => (
                    <span key={keyword} className="bg-accent-50 text-accent-700 px-3 py-1 rounded-full text-sm font-medium border border-accent-200">
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Don&apos;t stuff keywords. Use them naturally in your summary, experience,
                    and skills sections. ATS systems can detect keyword stuffing and may flag your resume.
                  </p>
                </div>
              </div>

              {/* Education & Certifications */}
              <div id="education">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <BookOpen className="text-accent" size={24} />
                  Education & Certifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h3 className="font-semibold text-primary mb-3">Education</h3>
                    <ul className="space-y-2">
                      {example.education.map((edu, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle size={14} className="text-accent mt-0.5 flex-shrink-0" />
                          {edu}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h3 className="font-semibold text-primary mb-3">Certifications</h3>
                    <ul className="space-y-2">
                      {example.certifications.map((cert, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <Award size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Expert Tips */}
              <div id="tips">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Lightbulb className="text-accent" size={24} />
                  Expert Tips for Your {example.title} Resume
                </h2>
                <div className="space-y-3">
                  {example.tips.map((tip, i) => (
                    <div key={i} className="flex gap-3 items-start bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <span className="flex-shrink-0 w-6 h-6 bg-accent-50 text-accent rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary & Outlook */}
              <div id="salary">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <DollarSign className="text-accent" size={24} />
                  {example.title} Salary & Job Outlook
                </h2>
                {example.salaryRange && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-accent-50 rounded-xl p-5 border border-accent-200 text-center">
                      <p className="text-sm text-accent-600 font-medium mb-1">Entry Level</p>
                      <p className="text-2xl font-bold text-accent-700">${(example.salaryRange.min / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-5 border border-primary-200 text-center">
                      <p className="text-sm text-primary-400 font-medium mb-1">Median Salary</p>
                      <p className="text-2xl font-bold text-primary">${(example.salaryRange.median / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 text-center">
                      <p className="text-sm text-amber-600 font-medium mb-1">Experienced</p>
                      <p className="text-2xl font-bold text-amber-700">${(example.salaryRange.max / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-start gap-3">
                  <TrendingUp size={18} className="text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary text-sm">Job Outlook</p>
                    <p className="text-sm text-gray-600">{example.jobOutlook}</p>
                    {example.salaryRange?.source && (
                      <p className="text-xs text-gray-400 mt-1">Source: {example.salaryRange.source}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              {example.faq && example.faq.length > 0 && (
                <div id="faq">
                  <h2 className="text-2xl font-bold text-primary mb-4">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3">
                    {example.faq.map((faq, i) => (
                      <details key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                          <h3 className="font-medium text-primary pr-4 text-left">{faq.q}</h3>
                          <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg flex-shrink-0">▼</span>
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
                <div className="bg-gradient-to-br from-primary to-primary-400 rounded-xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Build Your {example.title} Resume</h3>
                  <p className="text-primary-100 text-sm mb-4">
                    Use our AI-powered builder with ATS-optimized templates.
                  </p>
                  <Link
                    href="/resume-builder"
                    className="inline-flex items-center gap-2 bg-accent text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-accent-600 transition-colors w-full justify-center"
                  >
                    <Zap size={16} />
                    Start Building Free
                  </Link>
                </div>

                {/* ATS Score Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-primary mb-2">Check Your ATS Score</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your resume and get instant feedback on ATS compatibility.
                  </p>
                  <Link
                    href="/ats-score-checker"
                    className="inline-flex items-center gap-2 bg-accent-50 text-accent-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-accent-100 transition-colors w-full justify-center border border-accent-200"
                  >
                    <CheckCircle size={16} />
                    Free ATS Check
                  </Link>
                </div>

                {/* Quick Stats */}
                {example.salaryRange && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-primary mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Median Salary</span>
                        <span className="font-semibold text-primary">${(example.salaryRange.median / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Experience Shown</span>
                        <span className="font-semibold text-primary">{example.summary.yearsExperience} years</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Key Skills</span>
                        <span className="font-semibold text-primary">{example.skills.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">ATS Keywords</span>
                        <span className="font-semibold text-primary">{example.atsKeywords.length}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Related Examples */}
                {related.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-primary mb-4">Related Resume Examples</h3>
                    <div className="space-y-2">
                      {related.map((r) => (
                        <Link
                          key={r.slug}
                          href={`/resume-examples/${r.category}/${r.slug}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <span className="text-sm text-gray-700 group-hover:text-accent">{r.title} Resume</span>
                          <ArrowRight size={14} className="text-gray-300 group-hover:text-accent" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter CTA */}
                <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
                  <h3 className="font-bold text-primary mb-2">Need a Cover Letter?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Build a matching cover letter with our AI cover letter builder.
                  </p>
                  <Link
                    href="/cover-letter-builder"
                    className="inline-flex items-center gap-2 bg-primary-100 text-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-200 transition-colors w-full justify-center border border-primary-200"
                  >
                    Build Cover Letter
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 bg-gradient-to-r from-primary to-primary-400">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Build Your {example.title} Resume Now
          </h2>
          <p className="text-primary-100 mb-6">
            Use this example as a starting point. Our AI resume builder will help you customize it for your
            target job in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/resume-builder"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-semibold hover:bg-accent-600 transition-all shadow-lg"
            >
              <Zap size={20} />
              Build Your Resume Free
            </Link>
            <Link
              href="/resume-examples"
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
