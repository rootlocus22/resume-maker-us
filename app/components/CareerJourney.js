"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Rocket,
  Target,
  FileText,
  Briefcase,
  MessageSquare,
  Trophy,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Calendar,
  Search
} from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { getEffectivePricing, formatPrice } from "../lib/globalPricing";

export default function CareerJourney() {
  const [isVisible, setIsVisible] = useState(false);
  const { currency } = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const pricing = getEffectivePricing(currency);
  const sixMonthPrice = pricing.sixMonth;

  const journeySteps = [
    {
      step: 1,
      title: "Build Your Rocket Resume",
      description: "Create an ATS-optimized resume that gets past screening systems and catches recruiters' attention",
      icon: <FileText className="w-8 h-8" />,
      link: "/resume-builder",
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      features: [
        "50+ Professional Templates",
        "ATS Score Optimization",
        "AI-Powered Suggestions",
        "Real-time Preview"
      ]
    },
    {
      step: 2,
      title: "Plan Your Career Path",
      description: "Get a personalized 6-month career roadmap with AI Career Coach - skills to develop, certifications to pursue, and companies to target",
      icon: <Target className="w-8 h-8" />,
      link: "/career-coach",
      color: "from-purple-500 to-violet-600",
      bgColor: "from-purple-50 to-violet-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      features: [
        "Personalized 6-Month Roadmap",
        "Skill Development Plan",
        "Certification Recommendations",
        "Company Targeting Strategy"
      ],
      isPremium: true
    },
    {
      step: 3,
      title: "Find Best Matches",
      description: "Don't just apply blindly. Our AI scans 20+ platforms to find roles that match your new resume perfectly. Get alerts for 'Fresh' jobs to be an early applicant.",
      icon: <Search className="w-8 h-8" />,
      link: "/jobs-nearby",
      color: "from-pink-500 to-rose-600",
      bgColor: "from-pink-50 to-rose-50",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      features: [
        "Aggregated Search (20+ Sites)",
        "Freshness Filter",
        "Smart Relevance Scoring",
        "Direct Application Links"
      ],
      isPremium: true
    },
    {
      step: 4,
      title: "Apply with JD-Based Resume",
      description: "Tailor your resume to each job description using our AI-powered JD Builder - extract keywords, match requirements, and customize instantly",
      icon: <Briefcase className="w-8 h-8" />,
      link: "/job-description-resume-builder",
      color: "from-emerald-500 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      features: [
        "Paste Any Job Description",
        "AI Extracts 26+ Keywords",
        "Auto-Tailored Resume",
        "10x Better Match Rate"
      ],
      isPremium: true
    },
    {
      step: 5,
      title: "Master Your Interview",
      description: "Practice with ExpertResume – Interview Gyani. Get role-specific questions from an AI Senior Interviewer and real-time evaluation of your answers.",
      icon: <MessageSquare className="w-8 h-8" />,
      link: "/interview-gyani",
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      features: [
        "AI-Powered Interview Simulation",
        "Role-Specific Questions",
        "Instant Feedback & Tips",
        "Mock Interview Practice"
      ],
      isPremium: true
    },
    {
      step: 6,
      title: "Land Your Dream Job",
      description: "With your optimized resume, career plan, tailored applications, and interview prep - you're ready to secure offers",
      icon: <Trophy className="w-8 h-8" />,
      link: "/my-resumes",
      color: "from-yellow-500 to-amber-600",
      bgColor: "from-yellow-50 to-amber-50",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      features: [
        "Higher Interview Rate",
        "Better Job Matches",
        "Confident Interviews",
        "Multiple Job Offers"
      ]
    }
  ];

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-200/40 to-purple-200/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-indigo-200/30 to-violet-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 px-4 py-2 rounded-full text-sm font-semibold text-indigo-600 mb-4">
            <Rocket className="w-4 h-4" />
            END-TO-END CAREER TOOL
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
            Launch Your Career into{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              Rocket Mode
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ExpertResume isn't just a resume builder—it's your complete career transformation platform.
            From planning to landing your dream job, we guide you every step of the way.
          </p>
        </div>

        {/* Journey Steps */}
        <div className="relative">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-purple-200 via-violet-200 to-yellow-200 opacity-30" style={{ height: 'calc(100% - 80px)', top: '40px' }}></div>

          <div className="space-y-8 lg:space-y-12">
            {journeySteps.map((step, index) => (
              <div
                key={index}
                className={`transition-all duration-700 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
              >
                <div className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-4 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}>
                  {/* Step Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right lg:pr-4' : 'lg:text-left lg:pl-4'} lg:max-w-[calc(50%-120px)]`}>
                    <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${step.bgColor} border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-700 mb-4`}>
                      <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full font-bold text-sm">
                        {step.step}
                      </span>
                      {step.isPremium && (
                        <>
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span className="text-purple-600">PRO FEATURE</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                      {step.title}
                    </h3>

                    <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Features List */}
                    <div className={`space-y-2 mb-6 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                      {step.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {index % 2 === 0 ? (
                            <>
                              <CheckCircle className={`w-5 h-5 ${step.iconColor} flex-shrink-0`} />
                              <span className="text-gray-700">{feature}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-700">{feature}</span>
                              <CheckCircle className={`w-5 h-5 ${step.iconColor} flex-shrink-0`} />
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`${step.link}?source=career-journey`}
                      className={`inline-flex items-center gap-2 bg-gradient-to-r ${step.color} text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group/btn`}
                    >
                      {index % 2 === 0 ? (
                        <>
                          <span>Get Started</span>
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform duration-300 rotate-180" />
                          <span>Get Started</span>
                        </>
                      )}
                    </Link>
                  </div>

                  {/* Step Icon */}
                  <div className={`relative flex-shrink-0 z-10 lg:w-32 lg:flex lg:justify-center`}>
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300 relative border-4 border-white`}>
                      <div className="text-white">
                        {step.icon}
                      </div>
                    </div>
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-30 blur-2xl transform scale-150 -z-10`}></div>
                  </div>

                  {/* Placeholder for spacing on alternate sides */}
                  <div className={`hidden lg:block flex-1 lg:max-w-[calc(50%-120px)]`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Box */}
        <div className={`mt-20 lg:mt-24 transition-all duration-700 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 rounded-3xl p-8 lg:p-12 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, blue 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            {/* Content */}
            <div className="relative text-center text-gray-900">
              <div className="inline-flex items-center gap-2 bg-blue-200/50 backdrop-blur-sm border border-blue-300/50 px-4 py-2 rounded-full text-sm font-bold mb-6 text-blue-800">
                <Trophy className="w-4 h-4" />
                COMPLETE CAREER TRANSFORMATION
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-gray-900">
                Get Everything You Need for Just{" "}
                <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                  {formatPrice(sixMonthPrice, currency)}
                </span>
              </h3>

              <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Our <strong>Pro 6-Month Plan</strong> gives you unlimited access to all features -
                resume building, career coaching, JD-based customization, interview training, and more.
                Everything you need to transform your career in 6 months.
              </p>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-5xl mx-auto">
                {[
                  "Unlimited Resume Downloads",
                  "AI Career Coach Roadmap",
                  "JD-Based Resume Builder",
                  "ExpertResume – Interview Gyani"
                ].map((feature, idx) => (
                  <div key={idx} className="bg-blue-200/30 backdrop-blur-sm rounded-xl p-4 border border-blue-300/40">
                    <CheckCircle className="w-5 h-5 text-blue-600 mb-2 mx-auto" />
                    <p className="text-sm font-semibold text-gray-800">{feature}</p>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/checkout?billingCycle=sixMonth`}
                  className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  Start 6-Month Journey - {formatPrice(sixMonthPrice, currency)}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-3 bg-blue-200/50 backdrop-blur-sm border-2 border-blue-400 text-blue-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-300/50 transition-all duration-300 transform hover:scale-105"
                >
                  <Calendar className="w-5 h-5" />
                  View All Plans
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="mt-8 inline-flex items-center gap-2 px-6 py-2 bg-blue-200/50 backdrop-blur-sm rounded-full border border-blue-300/50">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <span className="text-sm text-gray-800">94% success rate • 100,000+ professionals transformed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

