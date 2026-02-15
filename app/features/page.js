import Link from "next/link";
import {
  FaEdit,
  FaEye,
  FaPalette,
  FaFileAlt,
  FaRobot,
  FaCheckCircle,
  FaDollarSign,
  FaQuestionCircle,
  FaArrowRight,
  FaStar,
  FaUsers,
  FaTrophy,
  FaBolt,
  FaShieldAlt,
  FaDownload,
  FaChartLine,
  FaPlayCircle,
  FaHeart,
  FaFireAlt,
  FaGem,
  FaPhone,
  FaEnvelope,
  FaRocket
} from "react-icons/fa";

export const metadata = {
  title: "ExpertResume Features | AI Resume Builder & Cover Letter Builder - Complete Career Toolkit",
  description:
    "Discover ExpertResume's powerful AI resume builder and cover letter builder features. Create ATS-optimized resumes with 60+ templates, AI suggestions, job-specific optimization, JD Based Resume Builder, One-Pager Resume, AI Cover Letter Builder, and JD-Based Cover Letter Builder. Start free and unlock premium features!",
  keywords:
    "resume builder features, AI resume maker, cover letter builder, AI cover letter generator, ATS optimization, job search tools, career tools, professional resume templates",
  author: "ExpertResume",
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/features",
  },
  openGraph: {
    title: "ExpertResume Features | AI Resume Builder & Cover Letter Builder - Complete Career Toolkit",
    description:
      "Explore ExpertResume's powerful AI resume builder and cover letter builder tools. Start free and unlock premium features!",
    url: "https://expertresume.us/features",
    siteName: "ExpertResume",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "ExpertResume Features Overview - AI-Powered Career Tools",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExpertResume Features | AI Resume Builder & Cover Letter Builder",
    description:
      "Create professional resumes and cover letters with AI. Free to start, premium features available including JD Based Resume Builder, One-Pager Resume, AI Cover Letter Builder, and JD-Based Cover Letter Builder.",
    images: ["https://expertresume.us/images/3.png"],
  },
};

export default function FeaturesPage() {
  return (
    <>
      <script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "ExpertResume",
            image: [
              "https://expertresume.us/images/3.png",
              "https://expertresume.us/ExpertResume.png"
            ],
            url: "https://expertresume.us",
            description:
              "ExpertResume offers an AI-powered resume builder and cover letter builder with job-specific templates, real-time previews, ATS score checker, AI interview trainer, salary analyzer, JD Based Resume Builder, AI Cover Letter Builder, JD-Based Cover Letter Builder, and more. Start free and unlock premium features!",
            brand: {
              "@type": "Brand",
              name: "Vendax Systems LLC",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "52000"
            },
            offers: [
              {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                priceValidUntil: "2026-12-31",
                name: "Free Plan",
                description: "Start building resumes for free with basic features.",
                url: "https://expertresume.us/pricing",
              },
            ],
          }),
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-bg via-white to-primary/5">

        {/* Hero Section with Social Proof */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary to-accent text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            {/* Trust Signals */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <FaFireAlt className="text-yellow-300" />
                <span className="text-sm font-medium">🔥 100,000++ professionals already trust us</span>
              </div>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
                Land Your <span className="text-yellow-300">Dream Job</span> with AI-Powered Resumes
              </h1>
              <p className="text-xl sm:text-2xl mb-8 text-white/80 leading-relaxed">
                Create stunning, ATS-friendly resumes that get you <span className="font-bold text-yellow-300">3x more interviews</span>.
                Join 100,000++ professionals who've transformed their careers with ExpertResume.
              </p>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300">94%</div>
                  <div className="text-sm text-white/80">Get Interviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300">4.9★</div>
                  <div className="text-sm text-white/80">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300">52K+</div>
                  <div className="text-sm text-white/80">Happy Users</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/resume-builder"
                  className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaPlayCircle />
                  Start Building for FREE
                </Link>
                <Link
                  href="/ats-score-checker"
                  className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaCheckCircle />
                  Check ATS Score FREE
                </Link>
              </div>

              <p className="text-sm text-white/80 mt-4">
                ✨ No signup required • Free forever • Upgrade anytime
              </p>
            </div>
          </div>
        </div>

        {/* Problem & Solution Section */}
        <div className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Most Resumes Get <span className="text-red-500">Rejected</span> in 6 Seconds
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">😞</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Poor ATS Compatibility</h3>
                  <p className="text-gray-600 text-sm">75% of resumes never reach human eyes due to ATS failures</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Weak Content</h3>
                  <p className="text-gray-600 text-sm">Generic descriptions that don't showcase your impact</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Poor Design</h3>
                  <p className="text-gray-600 text-sm">Outdated formatting that doesn't capture attention</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                ExpertResume <span className="text-accent">Solves</span> All These Problems
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI-powered platform ensures your resume passes ATS systems, impresses recruiters,
                and lands you interviews with industry-leading tools.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section - Redesigned for Conversion */}
        <div className="py-16 sm:py-20 bg-gradient-to-b from-bg to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to <span className="text-primary">Win Jobs</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From AI-powered content suggestions to ATS optimization, we've got your entire job search covered.
              </p>
            </div>

            {/* Core Free Features */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-primary px-4 py-2 rounded-full font-semibold">
                  <FaHeart className="text-accent" />
                  Free Tier Features
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group bg-white rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl hover:border-accent/20 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <FaCheckCircle className="text-accent text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Free ATS Score Checker</h3>
                      <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Free Tier</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Get instant feedback on your resume's ATS compatibility. See exactly what's blocking you from interviews.
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    <span>Check your score now</span>
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="group bg-white rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl hover:border-accent/20 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <FaEdit className="text-accent text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Smart Resume Editor</h3>
                      <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Free Tier</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Intuitive drag-and-drop editor with real-time preview. Build professional resumes in minutes, not hours.
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    <span>Start building</span>
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="group bg-white rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl hover:border-accent/20 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <FaRobot className="text-accent text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">AI Content Boost</h3>
                      <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Free Tier</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    AI-powered suggestions for every section. Transform weak bullet points into powerful achievements.
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    <span>Try AI boost</span>
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Features - High Converting */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl"></div>
              <div className="relative p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full font-semibold">
                    <FaGem className="text-yellow-300" />
                    Premium Features - 3x Higher Interview Success
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-accent/20 hover:shadow-xl hover:border-accent/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <FaFileAlt className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">20+ Premium Templates</h3>
                        <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Premium</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      <strong>Eye-catching designs</strong> that make recruiters notice you in 6 seconds. Job-specific templates for IT, Finance, Healthcare & more.
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg mb-4">
                      <div className="text-xs text-primary font-medium">✨ Success Rate: <span className="text-lg font-bold">94% get interviews</span></div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-accent/20 hover:shadow-xl hover:border-accent/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <FaRobot className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">AI Interview Trainer</h3>
                        <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Premium</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      Practice with <strong>AI-powered</strong> virtual coach. Get role-specific questions and real-time feedback.
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg mb-4">
                      <div className="text-xs text-primary font-medium">🎯 Confidence Boost: <span className="text-lg font-bold">85% ace interviews</span></div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-accent/20 hover:shadow-xl hover:border-accent/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <FaDollarSign className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">AI Salary Analyzer</h3>
                        <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Premium</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      Know your market value instantly. <strong>Negotiate with confidence</strong> using AI-powered salary insights.
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg mb-4">
                      <div className="text-xs text-primary font-medium">💰 Avg Salary Increase: <span className="text-lg font-bold">23% higher</span></div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-accent/20 hover:shadow-xl hover:border-accent/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <FaRocket className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">AI Career Coach</h3>
                        <span className="text-xs bg-gradient-to-r from-primary to-accent text-white px-2 py-1 rounded font-medium">Premium</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      Get a personalized <strong>6-month career roadmap</strong> with skills, certifications, and interview prep tailored to your resume.
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg mb-4">
                      <div className="text-xs text-primary font-medium">🚀 Career Growth: <span className="text-lg font-bold">Accelerate 3x faster</span></div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-accent/20 hover:shadow-xl hover:border-accent/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <FaDownload className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Watermark-Free PDFs</h3>
                        <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Premium</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      Download <strong>professional PDFs</strong> without watermarks. Make the perfect first impression.
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg mb-4">
                      <div className="text-xs text-primary font-medium">📄 Quality: <span className="text-lg font-bold">Print-ready</span></div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-accent/20 hover:shadow-xl hover:border-accent/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <FaFileAlt className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">JD Based Resume Builder</h3>
                        <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Premium</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      <strong>Job-specific optimization</strong> that tailors your resume to match the exact job description, keywords, and requirements for maximum ATS compatibility.
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg mb-4">
                      <div className="text-xs text-primary font-medium">🎯 Perfect Match: <span className="text-lg font-bold">95% keyword alignment</span></div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-accent/20 hover:shadow-xl hover:border-accent/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <FaFileAlt className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">One-Pager Resume</h3>
                          <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Premium</span>
                          <span className="text-xs bg-primary/5 text-primary px-2 py-1 rounded font-medium">🖥️ Desktop Only</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      <strong>AI-powered compression</strong> that fits your entire resume on one page while maintaining ATS compatibility and professional formatting. <span className="text-primary font-semibold">Best experienced on desktop for full editing capabilities.</span>
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg mb-4">
                      <div className="text-xs text-primary font-medium">🎯 Perfect Fit: <span className="text-lg font-bold">100% content preserved</span></div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-accent/20 hover:shadow-xl hover:border-accent/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <FaFileAlt className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">AI-Powered Cover Letter Builder</h3>
                        <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Premium</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      <strong>Intelligent content generation</strong> that creates compelling cover letters using AI. Generate personalized introductions, body content, and closings that match your resume and job requirements.
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg mb-4">
                      <div className="text-xs text-primary font-medium">✍️ Content Quality: <span className="text-lg font-bold">AI-generated excellence</span></div>
                    </div>
                  </div>

                  <div className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-accent/20 hover:shadow-xl hover:border-accent/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <FaFileAlt className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">JD-Based Cover Letter Builder</h3>
                        <span className="text-xs bg-accent/10 text-primary px-2 py-1 rounded font-medium">Premium</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      <strong>One-click perfection</strong> that analyzes job descriptions and automatically generates tailored cover letters. Perfect alignment with job requirements for maximum impact.
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg mb-4">
                      <div className="text-xs text-primary font-medium">🎯 Job Match: <span className="text-lg font-bold">Perfect alignment</span></div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-95 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaTrophy />
                    Unlock Premium Features
                    <FaArrowRight />
                  </Link>
                  <p className="text-sm text-gray-600 mt-2">💳 All sales are final • No refunds or cancellations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories & Social Proof */}
        <div className="py-16 sm:py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Join 100,000++ Professionals Who <span className="text-yellow-300">Transformed</span> Their Careers
              </h2>
              <p className="text-xl text-gray-300">Real results from real users</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "Got 3 interview calls in just 2 weeks after using ExpertResume's premium templates. The ATS score went from 65 to 94!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="font-bold">RC</span>
                  </div>
                  <div>
                    <div className="font-semibold">Ryan Cooper</div>
                    <div className="text-sm text-gray-400">Software Engineer, San Francisco</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "The AI interview trainer helped me crack my dream job at Google. Worth every penny of the premium subscription!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="font-bold">SM</span>
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Mitchell</div>
                    <div className="text-sm text-gray-400">Product Manager, New York</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "Salary analyzer showed I was underpaid by 40%. Used the insights to negotiate a 35% raise at my current company!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="font-bold">AT</span>
                  </div>
                  <div>
                    <div className="font-semibold">Alex Turner</div>
                    <div className="text-sm text-gray-400">Data Scientist, Austin</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-yellow-300 mb-2">100,000++</div>
                <div className="text-gray-300">Happy Users</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-yellow-300 mb-2">94%</div>
                <div className="text-gray-300">Get Interviews</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-yellow-300 mb-2">4.9★</div>
                <div className="text-gray-300">User Rating</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-yellow-300 mb-2">3x</div>
                <div className="text-gray-300">More Interviews</div>
              </div>
            </div>
          </div>
        </div>



        {/* FAQ Section - Enhanced */}
        <div className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Got Questions? We've Got Answers
              </h2>
              <p className="text-xl text-gray-600">Everything you need to know about ExpertResume</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/5 to-primary/5 rounded-2xl p-8 border border-accent/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <FaQuestionCircle className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">What makes ExpertResume different from other resume builders?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      ExpertResume is powered by cutting-edge AI technology and specifically designed for the US job market. We offer:
                      <br />• <strong>94% interview success rate</strong> vs industry average of 30%
                      <br />• <strong>ATS optimization</strong> that actually works (tested with real ATS systems)
                      <br />• <strong>Job-specific templates</strong> tailored for IT, Finance, Healthcare, etc.
                      <br />• <strong>AI Interview Trainer</strong> - practice with AI before real interviews
                      <br />• <strong>Salary insights</strong> to help you negotiate better packages
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Can I really use ExpertResume for free?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Absolutely!</strong> Our free plan includes:
                      <br />• Smart resume editor with real-time preview
                      <br />• AI-powered content suggestions
                      <br />• Free ATS score checker (unlimited use)
                      <br />• Custom color themes
                      <br />• Basic PDF export
                      <br />
                      No hidden fees, no time limits. You can create professional resumes forever without paying a cent.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <FaRobot className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">How does the AI Interview Trainer work?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our AI Interview Trainer uses <strong>advanced AI technology</strong> to simulate real interview scenarios:
                      <br />• Upload your resume and job description
                      <br />• Get role-specific questions (technical, behavioral, situational)
                      <br />• Practice with voice or text responses
                      <br />• Receive instant feedback on your answers
                      <br />• Learn from thousands of successful interview patterns
                      <br />
                      <span className="text-primary font-semibold">85% of our premium users report feeling more confident in interviews!</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                    <FaDollarSign className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">What is the Salary Analyzer and how accurate is it?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our AI Salary Analyzer provides market-rate insights based on:
                      <br />• Your skills, experience, and location
                      <br />• Current market trends and demand
                      <br />• Company size and industry standards
                      <br />• Real salary data from 100,000+ professionals
                      <br />
                      <span className="text-primary font-semibold">Users report an average 23% salary increase</span> after using our insights for negotiations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <FaShieldAlt className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">What are your payment terms?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our payment policy is straightforward:
                      <br />• <strong>All sales are final</strong> - no refunds or cancellations
                      <br />• <strong>Instant access</strong> to premium features after payment
                      <br />• <strong>Secure payment processing</strong> with industry standards
                      <br />• <strong>Transparent pricing</strong> with no hidden fees
                      <br />
                      We're confident in our platform's value - 96% of our premium users continue using ExpertResume actively!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <FaChartLine className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Do you have success stories from real users?</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <strong>Absolutely!</strong> Here are some recent wins:
                      <br />• <strong>Ryan C. (Software Engineer):</strong> "Got 3 interviews in 2 weeks, ATS score improved from 65 to 94"
                      <br />• <strong>Sarah M. (Product Manager):</strong> "Landed my dream job at Google using the interview trainer"
                      <br />• <strong>Alex T. (Data Scientist):</strong> "Negotiated 35% salary increase using salary analyzer insights"
                    </p>
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="text-primary font-semibold text-sm">
                        📊 Our Track Record: 100,000++ users • 94% interview success • 4.9★ rating • 3x more callbacks
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA in FAQ */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">Still have questions?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/resume-builder"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-full font-semibold hover:opacity-95 transition-all duration-300"
                >
                  <FaPlayCircle />
                  Try ExpertResume Free
                </Link>
                <a
                  href="mailto:support@expertresume.us"
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  <FaQuestionCircle />
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA - High Converting */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-primary to-primary text-white">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-400 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent rounded-full animate-pulse delay-2000"></div>
            </div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            {/* Urgency Element */}
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm mb-8 animate-bounce">
              <FaFireAlt className="text-yellow-300" />
              <span>⏰ Limited Time: 10% OFF ends soon!</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Your Dream Job is Just One
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-accent"> Click Away</span>
            </h2>

            <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Join <strong className="text-yellow-300">100,000++ professionals</strong> who transformed their careers with ExpertResume.
              Don't let another opportunity slip away.
            </p>

            {/* Social Proof Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-1">94%</div>
                <div className="text-sm text-gray-400">Get Interviews</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-1">3x</div>
                <div className="text-sm text-gray-400">More Callbacks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-1">4.9★</div>
                <div className="text-sm text-gray-400">User Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-1">52K+</div>
                <div className="text-sm text-gray-400">Success Stories</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Link
                href="/resume-builder"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-10 py-5 rounded-full font-bold text-xl hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                <FaPlayCircle className="text-2xl group-hover:rotate-12 transition-transform" />
                Start Building FREE Now
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/pricing"
                className="group inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                <FaTrophy className="text-yellow-300 text-2xl group-hover:rotate-12 transition-transform" />
                Unlock Premium - 15% OFF
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-accent" />
                Secure payment processing
              </div>
              <div className="flex items-center gap-2">
                <FaBolt className="text-accent" />
                Instant access after payment
              </div>
              <div className="flex items-center gap-2">
                <FaHeart className="text-accent" />
                Free version forever
              </div>
            </div>

            {/* Final urgency message */}
            <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 max-w-2xl mx-auto">
              <p className="text-lg font-semibold text-yellow-300 mb-2">⚡ Don't Wait - Your Competition Won't!</p>
              <p className="text-gray-300">
                Every day you delay is another day your perfect job goes to someone else.
                Start your success story today with ExpertResume.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badge Footer */}
        <div className="bg-bg py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
              <div className="mb-4 md:mb-0">
                <h3 className="font-bold text-gray-900 mb-1">Trusted by 100,000++ Professionals</h3>
                <p className="text-gray-600 text-sm">From startups to Fortune 500 companies</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm" />
                ))}
                <span className="ml-2 text-gray-600 text-sm">4.9/5 from 12,000+ reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating CTA Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            href="/resume-builder"
            className="group flex items-center gap-3 bg-gradient-to-r from-primary to-accent text-white px-6 py-4 rounded-full font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none"
          >
            <FaPlayCircle className="text-xl group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Start Building FREE</span>
            <span className="sm:hidden">Build Resume</span>
          </Link>
        </div>
      </div>
    </>
  );
}
