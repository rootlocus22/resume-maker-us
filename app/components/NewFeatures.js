"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Crown,
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Play,
  Search
} from "lucide-react";

export default function NewFeatures() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSteps, setActiveSteps] = useState({});

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "ATS Score Checker & Enhancer",
      description: "Check and improve your ATS compatibility score with real-time feedback and optimization suggestions. Upload your resume, get instant analysis across 8+ categories, and see your score improve from 68% to 91%+.",
      highlight: false,
      link: "/ats-score-checker",
      screenshots: [
        { url: "/images/features/hq/ats_1.png", alt: "Upload resume" },
        { url: "/images/features/hq/ats_2.png", alt: "Score breakdown" },
        { url: "/images/features/hq/ats_3.png", alt: "Score improvement" }
      ],
      multiImage: true,
      color: "from-blue-500 to-cyan-600",
      lightColor: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      benefits: [
        "Instant ATS compatibility check",
        "Detailed score breakdown across 8+ categories",
        "Improve score from 68% to 91%+",
        "Real-time optimization suggestions"
      ]
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "AI Job Search Engine",
      description: "Stop searching multiple sites. We aggregate premium job listings from LinkedIn, Indeed, Glassdoor & more. Filter by 'Freshness' to apply first and get hired faster.",
      highlight: true,
      link: "/jobs-nearby",
      screenshots: [
        { url: "/images/features/hq/job_search_1.png", alt: "Search Jobs" },
        { url: "/images/features/hq/job_search_results.png", alt: "See Results" }
      ],
      multiImage: true,
      color: "from-indigo-500 to-violet-600",
      lightColor: "from-indigo-50 to-violet-50",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      benefits: [
        "Aggregate 20+ Job Sites",
        "Filter by 'Posted Today'",
        "One-Click Apply",
        "Smart Role Matching"
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "JD Resume Builder",
      description: "Build job-specific resumes tailored to exact job descriptions. Paste any job posting, our AI extracts 26+ keywords and requirements, then enhances your resume to perfectly match the role.",
      highlight: true,
      link: "/job-description-resume-builder",
      screenshots: [
        { url: "/images/features/hq/jd_1.png", alt: "Paste job description" },
        { url: "/images/features/hq/jd_2.png", alt: "Extract keywords" },
        { url: "/images/features/hq/jd_builder_result_anon.png", alt: "Tailored resume" }
      ],
      multiImage: true,
      color: "from-emerald-500 to-teal-600",
      lightColor: "from-emerald-50 to-teal-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      benefits: [
        "Paste any job description",
        "AI extracts 26+ keywords automatically",
        "Tailored resume for each application",
        "10x better match rate"
      ]
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Smart Resume Parser",
      description: "2-step process: Upload your existing resume in any format → Get instant AI-powered parsing with complete extraction of experience, skills, education, and achievements in seconds.",
      highlight: false,
      link: "/upload-resume",
      screenshots: [
        { url: "/images/features/hq/smart_parser_upload_anon.png", alt: "Upload your resume" },
        { url: "/images/features/hq/smart_parser_analysis_anon.png", alt: "AI parsing & analysis" }
      ],
      multiImage: true,
      color: "from-blue-400 to-cyan-500",
      lightColor: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      benefits: [
        "Upload any resume format",
        "AI-powered intelligent parsing",
        "Extract all experience & skills",
        "Instant data analysis"
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "AI Resume Builder",
      description: "Create professional resumes from scratch with our intuitive drag-and-drop builder. Choose from 50+ ATS-friendly templates, customize every section, and download your perfect resume in minutes. No design skills required!",
      highlight: false,
      link: "/resume-builder",
      screenshots: [
        { url: "/images/features/resumeBuilder.png", alt: "AI resume builder interface" }
      ],
      multiImage: false,
      color: "from-orange-500 to-red-600",
      lightColor: "from-orange-50 to-red-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      benefits: [
        "50+ professional ATS-friendly templates",
        "Drag-and-drop easy customization",
        "Real-time preview as you build",
        "Download in multiple formats (PDF, DOCX)"
      ]
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate steps for multi-image features
  useEffect(() => {
    const intervals = {};

    features.forEach((feature, featureIndex) => {
      if (feature.multiImage) {
        intervals[featureIndex] = setInterval(() => {
          setActiveSteps(prev => ({
            ...prev,
            [featureIndex]: ((prev[featureIndex] || 0) + 1) % feature.screenshots.length
          }));
        }, 3500);
      }
    });

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, []);

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 px-4 py-2 rounded-full text-sm font-semibold text-primary-700 mb-4">
            <Sparkles className="w-4 h-4" />
            ONE PLATFORM, EVERY TOOL
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent">
              Get Hired
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Build resumes 7 different ways, check ATS scores for free, search 20+ job boards, and practice with an AI interviewer — all without switching tools
          </p>
        </div>

        {/* Features */}
        <div className="space-y-16 lg:space-y-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`transition-all duration-700 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
            >
              {/* Alternate Layout: Left-Right */}
              <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>

                {/* Content Side */}
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''} group`}>
                  {/* Feature Card with Improved Design */}
                  <div className="relative">
                    {/* Icon & Title Section */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Icon */}
                      <div className={`${feature.iconBg} ${feature.iconColor} p-3 rounded-xl shadow-sm`}>
                        {feature.icon}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        {feature.highlight && (
                          <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                            <Crown className="w-3.5 h-3.5 mr-1" />
                            MOST POPULAR
                          </div>
                        )}
                        {feature.multiImage && (
                          <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                            <Play className="w-3.5 h-3.5" />
                            <span>{feature.screenshots.length} Steps</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-3 mb-6">
                      {feature.benefits.map((benefit, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 group/benefit"
                        >
                          <CheckCircle2 className={`w-5 h-5 ${feature.iconColor} mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover/benefit:scale-110`} />
                          <span className="text-gray-700 leading-snug">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`${feature.link}?source=home`}
                      className={`inline-flex items-center gap-2 bg-gradient-to-r ${feature.color} text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group/btn`}
                    >
                      <Zap className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                      Try It Now
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>

                {/* Screenshot Side - Enhanced Animations */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative min-h-[400px] sm:min-h-[500px] flex items-center justify-center perspective-1000">
                    {/* Glow Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10 blur-3xl rounded-3xl`}></div>

                    {feature.multiImage ? (
                      /* Multi-Step Feature with Enhanced 3D Rotation */
                      <div className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center">
                        {feature.screenshots.map((screenshot, stepIndex) => {
                          const currentStep = activeSteps[index] || 0;
                          const isActive = currentStep === stepIndex;

                          // Enhanced 3D rotation effect
                          let rotateY = 0;
                          let translateZ = 0;
                          let translateX = 0;
                          let scale = 1;
                          let opacity = 1;

                          if (stepIndex < currentStep) {
                            // Previous: smoothly rotate away to the left
                            rotateY = -60;
                            translateZ = -150;
                            translateX = -100;
                            scale = 0.7;
                            opacity = 0;
                          } else if (stepIndex > currentStep) {
                            // Next: waiting on right side
                            rotateY = 60;
                            translateZ = -150;
                            translateX = 100;
                            scale = 0.7;
                            opacity = 0;
                          }

                          return (
                            <div
                              key={stepIndex}
                              className="absolute w-11/12 sm:w-4/5 h-4/5 transition-all duration-1000 ease-out"
                              style={{
                                transform: `perspective(1200px) rotateY(${rotateY}deg) translateZ(${translateZ}px) translateX(${translateX}px) scale(${scale})`,
                                opacity: opacity,
                                zIndex: isActive ? 10 : 0,
                                transformStyle: 'preserve-3d',
                                pointerEvents: isActive ? 'auto' : 'none'
                              }}
                            >
                              <div className="relative w-full h-full">
                                {/* Enhanced Layered Shadows */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} blur-3xl rounded-3xl transform translate-y-8 scale-105 transition-all duration-1000 ${isActive ? 'opacity-40' : 'opacity-0'}`}></div>
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} blur-xl rounded-3xl transform translate-y-4 scale-102 transition-all duration-1000 ${isActive ? 'opacity-30' : 'opacity-0'}`}></div>

                                {/* Image Container with Border */}
                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-white">
                                  <Image
                                    src={screenshot.url}
                                    alt={screenshot.alt}
                                    fill
                                    className="object-contain p-2"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                                    priority={index === 0 && stepIndex === 0}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    quality={90}
                                  />
                                </div>

                                {/* Step Label - Redesigned */}
                                <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-xl transition-all duration-500 ${isActive
                                  ? `bg-gradient-to-r ${feature.color} scale-105`
                                  : 'bg-white/90 scale-100'
                                  }`}>
                                  <span className={`text-sm font-semibold whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-700'}`}>
                                    {screenshot.alt}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Navigation Dots - Redesigned */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                          {feature.screenshots.map((_, dotIndex) => {
                            const currentStep = activeSteps[index] || 0;
                            const isActive = currentStep === dotIndex;

                            return (
                              <button
                                key={dotIndex}
                                onClick={() => setActiveSteps(prev => ({ ...prev, [index]: dotIndex }))}
                                className={`transition-all duration-300 rounded-full ${isActive
                                  ? `w-6 h-2 bg-gradient-to-r ${feature.color}`
                                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                                  }`}
                                aria-label={`View step ${dotIndex + 1}`}
                              />
                            );
                          })}
                        </div>

                        {/* Step Counter - Redesigned */}
                        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                              Step {(activeSteps[index] || 0) + 1}
                            </span>
                            <span className="text-xs text-gray-500">
                              of {feature.screenshots.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Single Image Feature */
                      <div className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center">
                        <div className="relative w-11/12 sm:w-4/5 h-4/5">
                          {/* Layered Shadows */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-40 blur-3xl rounded-3xl transform translate-y-8 scale-105`}></div>
                          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-30 blur-xl rounded-3xl transform translate-y-4 scale-102`}></div>

                          {/* Image Container */}
                          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-white">
                            <Image
                              src={feature.screenshots[0].url}
                              alt={feature.screenshots[0].alt}
                              fill
                              className="object-contain p-2"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                              priority={index === 0}
                              loading={index === 0 ? "eager" : "lazy"}
                              quality={90}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-20 lg:mt-24 transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-12 lg:p-16 border border-blue-100">
            {/* Floating Elements */}
            <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl transform -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl transform translate-y-1/2"></div>

            {/* Content */}
            <div className="relative">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 mb-4 leading-tight">
                Stop switching between tools. Start getting hired.
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join <span className="font-bold text-gray-900">100,000+</span> professionals who use one platform for their entire job search
              </p>

              {/* CTA Button */}
              <Link
                href="/resume-builder"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Start Building For Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>

              {/* Trust Badge */}
              <div className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">No credit card required • 100% Free to start</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
