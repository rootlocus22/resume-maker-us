
import Link from 'next/link';
import {
    Rocket, CheckCircle, Star, Users, Trophy, ArrowRight,
    Sparkles, Zap, TrendingUp
} from 'lucide-react';
import SEOPagesLazyContent from './SEOPagesLazyContent';


export default function SEOPageTemplate({ pageData }) {
    const {
        title,
        h1,
        metaDescription,
        icon,
        category,
        features,
        faqs,
        salary,
        demand,
        related,
        skills,
        commonMistakes,
        proTips,
        industryStats
    } = pageData;

    // Generate structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": `https://expertresume.us/resume-builder-${title.toLowerCase().replace(/\s+/g, '-')}`,
                "name": h1,
                "description": metaDescription,
                "publisher": {
                    "@type": "Organization",
                    "name": "ExpertResume",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://expertresume.us/ExpertResume.png"
                    }
                }
            },
            {
                "@type": "FAQPage",
                "mainEntity": faqs?.map(faq => ({
                    "@type": "Question",
                    "name": faq.q,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.a
                    }
                })) || []
            },
            {
                "@type": "HowTo",
                "name": `How to Create a ${title} Resume`,
                "description": `Step-by-step guide to building a professional ${title.toLowerCase()} resume`,
                "step": [
                    {
                        "@type": "HowToStep",
                        "name": "Choose Template",
                        "text": `Select from ATS-optimized templates designed for ${title.toLowerCase()} roles`,
                        "position": 1
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Add Your Details",
                        "text": "Fill in your information with AI-powered suggestions and industry keywords",
                        "position": 2
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Download & Apply",
                        "text": "Export your professional resume as PDF and start applying immediately",
                        "position": 3
                    }
                ]
            }
        ]
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16 sm:py-24 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
                    {/* Left Content */}
                    <div className="lg:w-1/2 text-center lg:text-left z-10">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 px-4 py-2 rounded-full mb-6 text-sm font-medium shadow-lg mx-auto lg:mx-0">
                            <Trophy className="mr-2 text-yellow-400" size={16} />
                            <span>Trusted by 100,000+ Professionals</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            {h1}
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            {metaDescription}
                        </p>

                        {/* Stats Row */}
                        {(salary || demand) && (
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                                {salary && (
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                        <Zap size={16} className="text-yellow-400" />
                                        <span className="font-semibold">Avg Salary: {salary}</span>
                                    </div>
                                )}
                                {demand && (
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                        <TrendingUp size={16} className="text-green-400" />
                                        <span className="font-semibold">Demand: {demand}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-8">
                            <Link
                                href="/resume-builder"
                                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                                <Rocket size={20} />
                                <span>Create My Resume - FREE</span>
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm font-medium text-blue-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-400" />
                                <span>ATS-Optimized</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star size={16} className="text-yellow-400" />
                                <span>AI-Powered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-blue-300" />
                                <span>Free Download</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Visual: Visual Appeal Template Preview */}
                    <div className="lg:w-1/2 relative hidden md:block">
                        <div className="relative w-full max-w-md mx-auto perspective-1000">
                            {/* Abstract Decorative Elements behind */}
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>

                            {/* Resume Template Image */}
                            <div className="relative transform rotate-y-12 rotate-z-2 hover:rotate-0 transition-transform duration-500 group">
                                <img
                                    src="/templates/previews/visual_modern_executive.png"
                                    alt="Professional Resume Template"
                                    className="w-full h-auto rounded-lg shadow-2xl border-[3px] border-white/90"
                                />
                                {/* Floating Badge */}
                                <div className="absolute -right-4 top-10 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2 animate-bounce">
                                    <CheckCircle size={16} />
                                    ATS Score: 98/100
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section onwards moved to Lazy Loaded Component */}
            <SEOPagesLazyContent pageData={pageData} />

        </div>
    );
}
