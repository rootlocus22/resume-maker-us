import { FileText, CheckCircle, Download, Zap, TrendingUp, Award, ArrowRight, Shield, Star, Briefcase, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "One Page Resume Builder Free 2026 | Create Single Page Resume in 60 Seconds",
  description: "Build professional one-page resume for free. ATS-optimized single-page format for freshers, students, job seekers. Download PDF instantly!",
  keywords: [
    "one page resume builder free",
    "single page resume maker",
    "one page resume format",
    "1 page resume builder",
    "one page cv maker",
    "resume on one page",
    "one page resume template free",
    "single page resume format",
    "one page resume for freshers",
    "concise resume builder",
    "compact resume maker"
  ],
  alternates: {
    canonical: "https://expertresume.us/one-page-resume-builder"
  },
  openGraph: {
    title: "One Page Resume Builder Free | Single Page Resume Maker 2026",
    description: "Create a professional one-page resume in 60 seconds. ATS-friendly, clean format, perfect for freshers and professionals. Free download!",
    url: "https://expertresume.us/one-page-resume-builder",
    type: "website",
    images: [{
      url: "https://expertresume.us/ExpertResume.png",
      width: 1200,
      height: 630,
      alt: "One Page Resume Builder"
    }]
  }
};

export default function OnePageResumePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="mr-2" size={16} />
              Create Your Resume in 60 Seconds
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              One Page Resume Builder
            </h1>

            <p className="text-xl sm:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto">
              Build a professional, concise, ATS-friendly resume that fits on one page. Perfect for freshers, students, and professionals with 0-5 years of experience!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/resume-builder"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl inline-flex items-center gap-2"
              >
                <FileText size={24} />
                Build One-Page Resume
                <ArrowRight size={20} />
              </Link>

              <Link
                href="/ats-score-checker"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all inline-flex items-center gap-2"
              >
                <Shield size={24} />
                Check ATS Score Free
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-300" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-300" />
                <span>ATS-Optimized Format</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-300" />
                <span>Instant PDF Download</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg max-w-none">

            {/* Introduction */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl mb-12 border-l-4 border-purple-600">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FileText className="text-purple-600" size={32} />
                Why a One-Page Resume Works Best in 2026
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Research shows that recruiters spend an average of <strong>6-7 seconds</strong> scanning a resume. A one-page resume forces you to highlight only the most relevant information, making it easier for recruiters to quickly identify your value.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                <strong>The data is clear:</strong> 83% of recruiters prefer one-page resumes for candidates with less than 10 years of experience. Single-page resumes have 40% higher callback rates than multi-page resumes for entry-level positions.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                <strong>Best for:</strong> Freshers, college students, recent graduates, professionals with 0-5 years of experience, internship applications, campus placements, and anyone applying through ATS systems.
              </p>
            </div>

            {/* Benefits */}
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Zap className="text-purple-600" size={32} />
              Benefits of a One-Page Resume
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all">
                <Clock className="text-purple-600 mb-4" size={32} />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Recruiter-Friendly</h3>
                <p className="text-gray-700">
                  Recruiters can scan your entire resume in 6-7 seconds. No flipping pages means they won't miss important information buried on page 2.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all">
                <Shield className="text-purple-600 mb-4" size={32} />
                <h3 className="text-xl font-bold text-gray-900 mb-3">ATS-Optimized</h3>
                <p className="text-gray-700">
                  Simpler format means fewer parsing errors by ATS systems. One-page resumes have 30% higher ATS pass rates than multi-page resumes.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all">
                <Star className="text-purple-600 mb-4" size={32} />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Forces Clarity</h3>
                <p className="text-gray-700">
                  Limited space forces you to be concise and include only your most impressive achievements. Quality over quantity.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all">
                <TrendingUp className="text-purple-600 mb-4" size={32} />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Higher Callback Rate</h3>
                <p className="text-gray-700">
                  Studies show one-page resumes get 40% more interview callbacks for entry-level positions compared to two-page resumes.
                </p>
              </div>
            </div>

            {/* What to Include */}
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What to Include in a One-Page Resume</h2>

            <div className="bg-green-50 p-6 rounded-xl mb-8 border-l-4 border-green-600">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={24} />
                Essential Sections (Keep It Tight!)
              </h3>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Contact Information:</strong> Name, phone, email, LinkedIn (1 line only)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Professional Summary:</strong> 2-3 lines max—highlight your biggest achievement and target role
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Skills:</strong> 8-12 relevant skills in 2-3 lines (no more!)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Work Experience:</strong> 2-3 most recent/relevant jobs, 3-4 bullet points each (use action verbs + numbers)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Education:</strong> Degree, college, CGPA (if good), graduation year (2 lines max)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Certifications/Projects:</strong> 1-2 most impressive ones only
                  </div>
                </li>
              </ul>
            </div>

            {/* What to Skip */}
            <div className="bg-red-50 p-6 rounded-xl mb-8 border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-red-900 mb-4">❌ What to Skip in a One-Page Resume</h3>
              <ul className="space-y-2 text-gray-800">
                <li>• <strong>Objective Statement:</strong> Outdated and wastes space (use summary instead)</li>
                <li>• <strong>References:</strong> "Available upon request" is assumed, no need to mention</li>
                <li>• <strong>Hobbies/Interests:</strong> Only include if directly relevant to the job</li>
                <li>• <strong>Full Address:</strong> City and state are enough</li>
                <li>• <strong>Overly Long Descriptions:</strong> Keep bullet points to 1 line each</li>
                <li>• <strong>Every Job You've Ever Had:</strong> Focus on relevant experience only</li>
                <li>• <strong>Generic Skills:</strong> Skip "Microsoft Word," "Email," etc.—everyone knows these</li>
              </ul>
            </div>

            {/* Sample One-Page Resume */}
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Sample One-Page Resume Format</h2>

            <div className="bg-gray-50 p-8 rounded-xl mb-8 border-2 border-gray-300 font-mono text-sm">
              <div className="space-y-4">
                <div>
                  <div className="font-bold text-lg">SARAH MITCHELL</div>
                  <div className="text-gray-600">Digital Marketing Specialist | SEO | Content Strategy | Google Ads</div>
                  <div className="text-gray-600">📞 (415) 555-0192 | ✉️ sarah.mitchell@email.com | 🔗 linkedin.com/in/sarahmitchell</div>
                </div>

                <div>
                  <div className="font-bold text-purple-600">PROFESSIONAL SUMMARY</div>
                  <div className="text-gray-700 text-xs">
                    Results-driven Digital Marketing Specialist with 3 years of experience increasing organic traffic by 200% and reducing CAC by 35%. Expertise in SEO, Google Ads, and content strategy for SaaS and e-commerce.
                  </div>
                </div>

                <div>
                  <div className="font-bold text-purple-600">SKILLS</div>
                  <div className="text-gray-700 text-xs">
                    SEO (Ahrefs, SEMrush) • Google Ads • Content Marketing • Google Analytics • Email Marketing (Mailchimp) • Social Media Marketing • A/B Testing • WordPress • Canva
                  </div>
                </div>

                <div>
                  <div className="font-bold text-purple-600">WORK EXPERIENCE</div>
                  <div className="mb-2">
                    <div className="font-semibold text-xs">Senior Marketing Executive | TechStartup India | Jan 2022 - Present</div>
                    <ul className="list-disc list-inside text-gray-700 text-xs space-y-0.5">
                      <li>Increased organic traffic by 200% (10K → 30K monthly visitors) through SEO optimization</li>
                      <li>Reduced customer acquisition cost (CAC) by 35% by optimizing Google Ads campaigns</li>
                      <li>Managed ₹5L/month marketing budget, achieving 4.5x ROAS</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-xs">Marketing Intern | E-Commerce Co. | Jun 2020 - Dec 2021</div>
                    <ul className="list-disc list-inside text-gray-700 text-xs space-y-0.5">
                      <li>Wrote 50+ SEO-optimized blog posts, increasing organic traffic by 80%</li>
                      <li>Grew Instagram followers from 2K to 15K in 6 months through content strategy</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-purple-600">EDUCATION</div>
                  <div className="text-gray-700 text-xs">
                    B.S. Marketing | UCLA | GPA: 3.7/4.0 | 2017-2020
                  </div>
                </div>

                <div>
                  <div className="font-bold text-purple-600">CERTIFICATIONS</div>
                  <div className="text-gray-700 text-xs">
                    Google Ads Certified | HubSpot Content Marketing | Google Analytics Individual Qualification (GAIQ)
                  </div>
                </div>
              </div>
            </div>

            {/* Tips for Fitting Everything */}
            <h2 className="text-3xl font-bold text-gray-900 mb-6">10 Tips to Fit Everything on One Page</h2>

            <div className="bg-blue-50 p-6 rounded-xl mb-12 border-l-4 border-blue-600">
              <ol className="space-y-3 text-gray-800 list-decimal list-inside">
                <li><strong>Use 10-11pt font</strong> (not smaller—readability matters!)</li>
                <li><strong>Narrow margins</strong> (0.5-0.75 inches) but don't go below 0.5"</li>
                <li><strong>Bullet points, not paragraphs</strong> (much more space-efficient)</li>
                <li><strong>Remove extra spacing</strong> between sections (use 6-8pt spacing)</li>
                <li><strong>Abbreviate where appropriate</strong> (B.Tech instead of Bachelor of Technology)</li>
                <li><strong>Use a single-column layout</strong> (two-column can confuse ATS)</li>
                <li><strong>Limit to 2-3 jobs</strong> (only most recent/relevant)</li>
                <li><strong>3-4 bullet points per job max</strong> (not 6-8)</li>
                <li><strong>Combine sections</strong> (e.g., "Projects & Certifications" instead of two separate sections)</li>
                <li><strong>Use our one-page resume template</strong> (pre-optimized for space!)</li>
              </ol>
            </div>

            {/* When to Use Multi-Page */}
            <h2 className="text-3xl font-bold text-gray-900 mb-6">When Should You Use a Two-Page Resume?</h2>

            <div className="bg-yellow-50 p-6 rounded-xl mb-12 border-l-4 border-yellow-600">
              <p className="text-gray-800 mb-4">A two-page resume is acceptable if:</p>
              <ul className="space-y-2 text-gray-800 list-disc list-inside">
                <li>You have <strong>10+ years of relevant work experience</strong></li>
                <li>You're applying for <strong>senior/executive positions</strong> (Director, VP, C-suite)</li>
                <li>You're in <strong>academia/research</strong> with extensive publications</li>
                <li>You have <strong>multiple advanced degrees, certifications, and technical skills</strong> (e.g., senior engineers)</li>
                <li>The job posting <strong>specifically requests</strong> a detailed resume</li>
              </ul>
              <p className="text-gray-800 mt-4">
                <strong>Otherwise, stick to one page!</strong> Most hiring managers prefer concise resumes.
              </p>
            </div>

            {/* Comparison Table */}
            <h2 className="text-3xl font-bold text-gray-900 mb-6">One-Page vs. Two-Page Resume: Which to Choose?</h2>

            <div className="overflow-x-auto mb-12">
              <table className="min-w-full bg-white border-2 border-gray-300 rounded-xl overflow-hidden">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Criteria</th>
                    <th className="px-6 py-4 text-left font-bold">One-Page Resume</th>
                    <th className="px-6 py-4 text-left font-bold">Two-Page Resume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">Experience Level</td>
                    <td className="px-6 py-4">0-5 years ✅</td>
                    <td className="px-6 py-4">10+ years ✅</td>
                  </tr>
                  <tr className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">Recruiter Preference</td>
                    <td className="px-6 py-4">83% prefer ✅</td>
                    <td className="px-6 py-4">17% prefer</td>
                  </tr>
                  <tr className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">ATS Pass Rate</td>
                    <td className="px-6 py-4">30% higher ✅</td>
                    <td className="px-6 py-4">Lower (more errors)</td>
                  </tr>
                  <tr className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">Time to Review</td>
                    <td className="px-6 py-4">6-7 seconds ✅</td>
                    <td className="px-6 py-4">12-15 seconds</td>
                  </tr>
                  <tr className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">Callback Rate</td>
                    <td className="px-6 py-4">40% higher ✅</td>
                    <td className="px-6 py-4">Lower for juniors</td>
                  </tr>
                  <tr className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">Best For</td>
                    <td className="px-6 py-4">Freshers, Students, 0-5 years ✅</td>
                    <td className="px-6 py-4">Senior roles, 10+ years</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FAQs */}
            <h2 className="text-3xl font-bold text-gray-900 mb-6">FAQs - One Page Resume</h2>

            <div className="space-y-6 mb-12">
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Q1. Is a one-page resume enough for 5 years of experience?</h3>
                <p className="text-gray-700">
                  <strong>Yes!</strong> For 5 years or less, a one-page resume is ideal. Focus on your 2-3 most recent/relevant jobs and highlight achievements with numbers. Recruiters prefer concise resumes—quality over quantity.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Q2. Will recruiters think I lack experience if my resume is only one page?</h3>
                <p className="text-gray-700">
                  <strong>No.</strong> Recruiters judge based on the content, not the length. A well-written one-page resume with quantified achievements is far more impressive than a two-page resume full of fluff. 83% of recruiters prefer one-page resumes for candidates with under 10 years of experience.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Q3. What font size should I use for a one-page resume?</h3>
                <p className="text-gray-700">
                  <strong>10-11pt for body text</strong> is ideal. Never go below 10pt—readability is crucial. Use 14-16pt for your name, 12pt for section headings. Stick to professional fonts like Arial, Calibri, or Times New Roman.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Q4. Can I use a two-column layout to save space?</h3>
                <p className="text-gray-700">
                  <strong>Not recommended.</strong> While two-column layouts save space, they often confuse ATS (Applicant Tracking Systems), leading to parsing errors. Stick to a single-column format for maximum ATS compatibility.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Q5. What if I have multiple projects and certifications?</h3>
                <p className="text-gray-700">
                  <strong>Be selective!</strong> Include only the 1-2 most relevant/impressive projects and certifications. If you have 5 certifications, list the most prestigious ones. You can always mention others in the interview. Remember: space is limited, so prioritize impact.
                </p>
              </div>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl text-center">
              <h2 className="text-3xl font-bold mb-4">Build Your One-Page Resume in 60 Seconds!</h2>
              <p className="text-xl mb-6 text-purple-100">
                Join 50,000+ job seekers who built ATS-optimized one-page resumes and got 3x more interviews!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/resume-builder"
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl inline-flex items-center justify-center gap-2"
                >
                  <FileText size={24} />
                  Create Resume Now (Free)
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/ats-score-checker"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all inline-flex items-center justify-center gap-2"
                >
                  <Shield size={24} />
                  Check ATS Score
                </Link>
              </div>
              <p className="text-sm text-purple-200 mt-6">
                ✅ 100% Free | ✅ No Sign-Up Required | ✅ Instant PDF Download
              </p>
            </div>

          </article>
        </div>
      </section>
    </div>
  );
}

