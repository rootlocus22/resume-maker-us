"use client";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import React from "react";
import { event } from "../lib/gtag";
import dynamic from 'next/dynamic';
import {
  ChevronRight,
  CheckCircle,
  FilePlus,
  UploadCloud,
  Zap,
  Sparkles,
  LayoutTemplate,
  Flag,
  BookOpen,
  ArrowRight,
  Rocket,
  ShieldCheck,
  BadgeCheck,
  Brain,
  Clock,
  Star,
  Mic,
  X,
  Lock,
  Users,
  Trophy,
  TrendingUp,
  Target,
  Crown,
  Flame,
  DollarSign,
  AlertCircle,
  Gift,
  Timer
} from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

// Lazy load non-critical components
const VideoComponent = dynamic(() => import("./VideoComponent"), {
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-xl" />
});
const Testimonial = dynamic(() => import("./Testimonials"), {
  loading: () => <div className="w-full h-48 bg-gray-100 animate-pulse rounded-xl" />
});
const TemplateSlider = dynamic(() => import("./TemplateSlider"), {
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-xl" />
});

// Pricing logic from globalPricing
import { getEffectivePricing, formatPrice } from '../lib/globalPricing';

const getCurrencyAndPriceByCountry = (currency) => {
  // Get device-specific pricing from globalPricing
  const devicePricing = getEffectivePricing(currency, false); // Default to non-Android for this function

  return {
    currency: devicePricing.currency,
    annualPrice: devicePricing.yearly,
    monthlyPrice: devicePricing.monthly,
    basicPrice: devicePricing.basic,
    trialPrice: devicePricing.basic, // Use basic price for trial
  };
};



export default function Home() {
  const [isUSDomain, setIsUSDomain] = useState(false);
  const { currency, isLoadingGeo } = useLocation();
  const { user } = useAuth();
  const router = useRouter();
  const { trialPrice, monthlyPrice } = getCurrencyAndPriceByCountry(currency);
  const [isLoaded, setIsLoaded] = useState(false);

  // Redirect logged-in users to dashboard (only from homepage)
  useEffect(() => {
    // Only redirect if user is logged in AND we're on the homepage
    if (user && typeof window !== 'undefined' && window.location.pathname === '/') {
      console.log('User is logged in on homepage, redirecting to dashboard...');
      // Use replace instead of push to avoid adding to history
      router.replace('/my-resumes');
    }
  }, [user, router]);

  // Handle referral code from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('referralCode');

      if (referralCode) {
        // Store referral code in localStorage
        localStorage.setItem('referralCode', referralCode);
        console.log('Referral code stored:', referralCode);

        // Track referral code event
        event({
          action: "referral_code_detected",
          category: "Referral",
          label: referralCode,
          value: 1
        });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsUSDomain(window.location.host.includes("expertresume.com"));
      setIsLoaded(true);
    }
  }, []);

  const handleClick = (action) => {
    event({
      action: action,
      category: "home_page",
      label: "hero_cta",
      value: "hero_cta",
    });
  };

  const trustedCompanies = [
    {
      name: "Google",
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        </svg>
      ),
    },
    {
      name: "Amazon",
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.5 18.5c-1.2 1.5-3.5 2.5-6 2.5-2.5 0-4.8-1-6-2.5-.2-.3-.1-.7.2-.9.3-.2.7-.1.9.2 1 1.2 3 2.2 5 2.2s4-.9 5-2.2c.2-.3.6-.4.9-.2.3.2.4.6.2.9zm-1-3.5c-.3 0-.5.2-.5.5v1c0 .3.2.5.5.5s.5-.2.5-.5v-1c0-.3-.2-.5-.5-.5z" fill="#FF9900" />
          <path d="M12 2c5.5 0 10 4.5 10 10 0 1.5-.3 2.9-.9 4.2-.2.4-.7.5-1 .2-.4-.2-.5-.7-.2-1 .5-1 .8-2.2.8-3.4 0-4.4-3.6-8-8-8S4 7.6 4 12c0 1.2.3 2.4.8 3.4.2.4.1.8-.2 1-.4.2-.8.1-1-.2C3 14.9 2.7 13.5 2.7 12 2.7 6.5 7.2 2 12 2z" fill="#000000" />
        </svg>
      ),
    },
    {
      name: "Microsoft",
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="9" height="9" fill="#F25022" />
          <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
          <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
          <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
        </svg>
      ),
    },
    {
      name: "Apple",
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.5 2c-1.7 0-3 1.3-3 3 0 .5.1 1 .4 1.4-.9-.2-1.8-.1-2.6.3-2 1-3.2 3-3.2 5.3 0 2.2 1.2 4.2 3.2 5.2 1.5 1 3.2 1 4.7 0 1-.6 1.7-1.6 2-2.8-.5 1.5-1.7 2.6-3.2 2.6-.5 0-1-.2-1.5-.5-1-.8-1.8-2-1.8-3.5 0-1.5.8-2.8 2-3.5-.5-.8-1.2-1.5-2-2zm-4.5 2c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z" fill="#000000" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 8.5c.9 0 1.6-.7 1.6-1.6S9.4 5.3 8.5 5.3 6.9 6 6.9 6.9s.7 1.6 1.6 1.6zm1.5 3.5v6H7v-6h3zm7 0v6h-3v-6h3zm-3-3.5c-.9 0-1.6.7-1.6 1.6s.7 1.6 1.6 1.6 1.6-.7 1.6-1.6-.7-1.6-1.6-1.6z" fill="#0077B5" />
        </svg>
      ),
    },
    {
      name: "Indeed",
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.4-3 5h2c0-2.6 3-2 3-5 0-2.21-1.79-4-4-4zm0 10h-2v2h2v-2z" fill="#003A9B" />
        </svg>
      ),
    },
  ];

  if (isLoadingGeo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Show loading while redirecting logged-in users
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B1F3B] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Enhanced Trust Signals & Social Proof - Match Hero Theme */}
      <Suspense fallback={<div className="w-full h-48 bg-gray-100 animate-pulse rounded-xl" />}>
        <section className="py-16 bg-gradient-to-br from-[#050F20] via-[#0B1F3B] to-[#071429] text-white relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-[#0B1F3B]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#0B1F3B]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/4 right-1/4 opacity-10">
              <img
                src="/images/Linkedin post.jpeg"
                alt="ExpertResume LinkedIn Success"
                className="w-64 h-64 object-contain rounded-2xl"
              />
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Trust Banner */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-[#0B1F3B]/20 backdrop-blur-sm border border-[#0B1F3B]/30 px-6 py-3 rounded-full text-sm font-bold mb-6">
                <Trophy className="mr-2" size={18} />
                <span>Trusted by professionals worldwide</span>
              </div>
              <h2 className="text-2xl sm:text-2xl font-bold mb-4">
                Trusted by Professionals at <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Top Companies</span>
              </h2>
              <p className="text-gray-300 text-lg">Join thousands who transformed their careers</p>
            </div>

            {/* Company Logo Marquee */}
            <div className="relative h-16 overflow-hidden mb-12">
              <div className="absolute flex gap-12 animate-marquee whitespace-nowrap">
                {trustedCompanies.map((company, index) => (
                  <div key={index} className="inline-flex items-center h-12 filter brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300 transform hover:scale-110">
                    {company.svg}
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {trustedCompanies.map((company, index) => (
                  <div key={`dup-${index}`} className="inline-flex items-center h-12 filter brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300">
                    {company.svg}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/20 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/20">
                <div className="text-2xl sm:text-2xl font-bold text-teal-400 mb-2">AI-Powered</div>
                <div className="text-white font-semibold text-sm sm:text-base">Resume Builder</div>
                <div className="text-xs sm:text-sm text-gray-300 mt-1">Smart optimization</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/20 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/20">
                <div className="text-2xl sm:text-2xl font-bold text-yellow-400 mb-2">ATS-Friendly</div>
                <div className="text-white font-semibold text-sm sm:text-base">Templates</div>
                <div className="text-xs sm:text-sm text-gray-300 mt-1">Recruiter approved</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/20 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/20">
                <div className="text-2xl sm:text-2xl font-bold text-teal-400 mb-2">Professional</div>
                <div className="text-white font-semibold text-sm sm:text-base">Quality</div>
                <div className="text-xs sm:text-sm text-gray-300 mt-1">HR expert designed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/20 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/20">
                <div className="text-2xl sm:text-2xl font-bold text-orange-400 mb-2">Free</div>
                <div className="text-white font-semibold text-sm sm:text-base">To Start</div>
                <div className="text-xs sm:text-sm text-gray-300 mt-1">No credit card needed</div>
              </div>
            </div>

            {/* Additional Trust Signals for US Domain */}
            {isUSDomain && (
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-white/20">
                  <BadgeCheck className="text-teal-400 flex-shrink-0" size={24} />
                  <div>
                    <div className="font-bold text-white text-sm sm:text-base">Verified Business</div>
                    <div className="text-xs text-gray-300">Trusted by Fortune 500</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-white/20">
                  <Star className="text-yellow-400 flex-shrink-0" size={24} />
                  <div>
                    <div className="font-bold text-white text-sm sm:text-base">Top Rated Platform</div>
                    <div className="text-xs text-gray-300">Jobseekers' #1 Choice</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </Suspense>

      {/* Enhanced Problem Statement - Matching Hero Theme */}
      <Suspense fallback={<div className="w-full h-64 bg-gray-100 animate-pulse rounded-xl" />}>
        <section className="py-20 bg-gradient-to-br from-[#0B1F3B] via-[#071429] to-[#050F20] text-white relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-20 left-20 w-32 h-32 bg-[#0B1F3B]/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#0B1F3B]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Problem Hook */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center bg-[#0B1F3B]/20 backdrop-blur-sm border border-teal-400/40 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
                <AlertCircle className="mr-2 text-teal-400" size={16} />
                <span className="text-slate-100">Common Resume Challenges</span>
              </div>
              <h2 className="text-2xl sm:text-2xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Why Many <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Resumes</span> Don't Get Noticed
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
                Many qualified professionals struggle with resume formatting, ATS compatibility, and making their experience stand out to recruiters.
              </p>
            </div>

            {/* Problem Cards */}
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
              <div className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 hover:bg-white/20">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-center">🤖</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">ATS Compatibility Issues</h3>
                <p className="text-gray-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                  Many resumes are filtered out by Applicant Tracking Systems due to formatting issues,
                  missing keywords, or incompatible file formats.
                </p>
                <div className="bg-[#0B1F3B]/20 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-teal-400/30">
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    💡 Our templates are designed to pass ATS filters
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 hover:bg-white/20">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-center">😴</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Generic Templates</h3>
                <p className="text-gray-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                  Many resumes use generic templates that don't stand out. Recruiters typically spend
                  <span className="font-bold text-orange-400"> 6-10 seconds</span> reviewing each resume.
                </p>
                <div className="bg-[#0B1F3B]/20 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-teal-400/30">
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    ⏰ Professional design helps make a strong first impression
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 hover:bg-white/20">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-center">⏰</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Time Investment</h3>
                <p className="text-gray-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                  Creating a professional resume can be time-consuming. Many job seekers struggle with
                  formatting, content optimization, and ensuring ATS compatibility.
                </p>
                <div className="bg-[#0B1F3B]/20 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-teal-400/30">
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    💰 Our tools help you create professional resumes faster
                  </p>
                </div>
              </div>
            </div>

            {/* Solution Promise */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3B]/10 to-[#00C4B3]/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-[#0B1F3B] to-[#071429] text-white p-12 rounded-3xl border border-teal-400/30 backdrop-blur-sm">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">
                    <span className="text-yellow-300">ExpertResume</span> Solves All These Problems
                  </h3>
                  <p className="text-xl text-slate-100 leading-relaxed">
                    Our AI-powered platform transforms your resume into an interview-generating machine
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target className="text-[#0B1F3B]" size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-lg mb-2">Beat the ATS</div>
                      <div className="text-slate-100 text-sm leading-relaxed">
                        Our AI analyzes 1000+ ATS patterns to ensure your resume passes every filter
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="text-[#0B1F3B]" size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-lg mb-2">Stand Out Instantly</div>
                      <div className="text-slate-100 text-sm leading-relaxed">
                        Professional templates that make recruiters stop scrolling and start reading
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="text-[#0B1F3B]" size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-lg mb-2">Faster Results</div>
                      <div className="text-slate-100 text-sm leading-relaxed">
                        Professional resumes help you stand out and get noticed by recruiters
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6 sm:mt-8">
                  <Link
                    href="/resume-builder"
                    className="inline-flex items-center gap-2 sm:gap-3 bg-[#0B1F3B] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl hover:bg-[#071429] transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={() => handleClick("problem_solution_cta")}
                  >
                    <Rocket size={20} className="sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">Fix My Resume Now - FREE</span>
                    <span className="sm:hidden">Fix My Resume - FREE</span>
                    <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                  </Link>
                  <p className="text-slate-100 text-xs sm:text-sm mt-3">✨ No signup required • See results in 60 seconds</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Suspense>

      {/* Enhanced How It Works - Conversion Focused */}
      <Suspense fallback={<div className="w-full h-64 bg-gray-100 animate-pulse rounded-xl" />}>
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center bg-slate-100 text-[#0B1F3B] px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm font-bold">
                <Timer className="mr-2" size={16} />
                <span>⚡ Transform Your Career in 3 Simple Steps</span>
              </div>
              <h2 className="text-2xl sm:text-2xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
                Create Your <span className="bg-gradient-to-r from-[#0B1F3B] to-teal-600 bg-clip-text text-transparent">Professional Resume</span> in Minutes
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Our simple 3-step process helps you build a professional, ATS-friendly resume
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
              {/* Step 1 - Purple */}
              <div className="relative group">
                {/* Connection Line */}
                <div className="hidden md:block absolute top-16 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 z-10"></div>

                <div className="relative bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 lg:p-8 rounded-3xl border-2 border-slate-200 hover:border-teal-400 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2">
                  {/* Step Number */}
                  <div className="absolute -top-4 sm:-top-6 left-4 sm:left-8 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-xl shadow-lg">
                    1
                  </div>

                  {/* Content */}
                  <div className="text-center mb-6 sm:mb-8 pt-3 sm:pt-4">
                    <div className="mb-4 sm:mb-6 flex justify-center">
                      <UploadCloud size={32} className="text-teal-500 sm:w-10 sm:h-10" />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">Upload or Start Fresh</h3>

                    {/* Time Badge */}
                    <div className="inline-flex items-center bg-slate-100 text-[#0B1F3B] px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                      <Clock size={12} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                      ⏱️ 30 seconds
                    </div>

                    <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">Upload your existing resume or start with our AI-powered builder using proven templates</p>

                    {/* Benefits */}
                    <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
                      <div className="text-[#0B1F3B] font-bold text-xs sm:text-sm mb-1 sm:mb-2">
                        ✨ No signup required!
                      </div>
                      <div className="text-gray-600 text-xs sm:text-sm">
                        💡 Skip the hassle
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/resume-builder"
                    className="block w-full bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-center hover:from-[#071429] hover:to-[#008C81] transition-all duration-300 transform hover:scale-105 shadow-lg group-hover:shadow-xl"
                    onClick={() => handleClick(`how_it_works_cta_0`)}
                  >
                    Start Building FREE
                  </Link>
                </div>
              </div>

              {/* Step 2 - Yellow */}
              <div className="relative group">
                {/* Connection Line */}
                <div className="hidden md:block absolute top-16 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 z-10"></div>

                <div className="relative bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 lg:p-8 rounded-3xl border-2 border-slate-200 hover:border-teal-400 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2">
                  {/* Step Number */}
                  <div className="absolute -top-4 sm:-top-6 left-4 sm:left-8 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-xl shadow-lg">
                    2
                  </div>

                  {/* Content */}
                  <div className="text-center mb-6 sm:mb-8 pt-3 sm:pt-4">
                    <div className="mb-4 sm:mb-6 flex justify-center">
                      <Sparkles size={32} className="text-teal-500 sm:w-10 sm:h-10" />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">AI Magic Happens</h3>

                    {/* Time Badge */}
                    <div className="inline-flex items-center bg-slate-100 text-[#0B1F3B] px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                      <Clock size={12} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                      ⏱️ 60 seconds
                    </div>

                    <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">Our AI-powered system analyzes your content and optimizes for ATS + recruiter appeal</p>

                    {/* Benefits */}
                    <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
                      <div className="text-[#0B1F3B] font-bold text-xs sm:text-sm mb-1 sm:mb-2">
                        ✨ Instant optimization
                      </div>
                      <div className="text-gray-600 text-xs sm:text-sm">
                        💡 Beat the bots
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/upload-resume"
                    className="block w-full bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-center hover:from-[#071429] hover:to-[#008C81] transition-all duration-300 transform hover:scale-105 shadow-lg group-hover:shadow-xl"
                    onClick={() => handleClick(`how_it_works_cta_1`)}
                  >
                    See AI in Action
                  </Link>
                </div>
              </div>

              {/* Step 3 - Green */}
              <div className="relative group">
                <div className="relative bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 lg:p-8 rounded-3xl border-2 border-slate-200 hover:border-teal-400 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2">
                  {/* Step Number */}
                  <div className="absolute -top-4 sm:-top-6 left-4 sm:left-8 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-xl shadow-lg">
                    3
                  </div>

                  {/* Content */}
                  <div className="text-center mb-6 sm:mb-8 pt-3 sm:pt-4">
                    <div className="mb-4 sm:mb-6 flex justify-center">
                      <Trophy size={32} className="text-teal-500 sm:w-10 sm:h-10" />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">Land Interviews</h3>

                    {/* Time Badge */}
                    <div className="inline-flex items-center bg-slate-100 text-[#0B1F3B] px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                      <Clock size={12} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                      ⏱️ 2 weeks avg
                    </div>

                    <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">Download your optimized resume and watch the interview invitations roll in</p>

                    {/* Benefits */}
                    <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
                      <div className="text-[#0B1F3B] font-bold text-xs sm:text-sm mb-1 sm:mb-2">
                        ✨ 94% success rate
                      </div>
                      <div className="text-gray-600 text-xs sm:text-sm">
                        💡 Dream job secured
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/pricing"
                    className="block w-full bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-center hover:from-[#071429] hover:to-[#008C81] transition-all duration-300 transform hover:scale-105 shadow-lg group-hover:shadow-xl"
                    onClick={() => handleClick(`how_it_works_cta_2`)}
                  >
                    Get Premium Power
                  </Link>
                </div>
              </div>
            </div>

            {/* Success Promise */}
            <div className="text-center bg-gradient-to-r from-[#0B1F3B] to-[#071429] text-white p-6 sm:p-8 lg:p-12 rounded-3xl shadow-2xl">
              <h3 className="text-2xl sm:text-2xl font-bold mb-3 sm:mb-4">
                <span className="text-yellow-300">What to Expect:</span> Better Resume Performance
              </h3>
              <p className="text-lg sm:text-xl text-slate-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Users typically see improved resume performance with better ATS scores and increased response rates
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-2xl font-bold text-yellow-300 mb-1 sm:mb-2">75%+</div>
                  <div className="text-slate-100 text-sm sm:text-base">Improved ATS scores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-2xl font-bold text-yellow-300 mb-1 sm:mb-2">4-6 weeks</div>
                  <div className="text-slate-100 text-sm sm:text-base">Typical job search timeline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-2xl font-bold text-yellow-300 mb-1 sm:mb-2">60%</div>
                  <div className="text-slate-100 text-sm sm:text-base">Report better results</div>
                </div>
              </div>

              <Link
                href="/resume-builder"
                className="inline-flex items-center gap-2 sm:gap-3 bg-[#0B1F3B] text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full font-bold text-lg sm:text-xl hover:bg-[#071429] transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => handleClick("how_it_works_final_cta")}
              >
                <Rocket size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="hidden sm:inline">Improve My Resume - FREE</span>
                <span className="sm:hidden">Improve Resume - FREE</span>
                <ArrowRight size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </Link>
            </div>
          </div>
        </section>
      </Suspense>

      {/* Enhanced Value Proposition - Features Showcase */}
      <Suspense fallback={<div className="w-full h-96 bg-gray-100 animate-pulse rounded-xl" />}>
        <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center bg-slate-100 text-[#0B1F3B] px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm font-bold">
                <Crown className="mr-2" size={16} />
                <span>🚀 AI-Powered Career Transformation Tools</span>
              </div>
              <h2 className="text-2xl sm:text-2xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 px-4">
                Everything You Need to <span className="bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] bg-clip-text text-transparent">Dominate</span> Your Job Search
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                From ATS-beating resumes to interview mastery - we've built the complete toolkit for career success
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Features List */}
              <div>
                <div className="space-y-6 sm:space-y-8">
                  {[
                    {
                      title: "AI-Powered Resume Optimization",
                      description: "Our advanced AI analyzes your resume against 1000+ successful job applications and optimizes every word for maximum impact.",
                      icon: <Brain className="text-teal-500" size={28} />,
                      premium: true,
                      stats: "94% pass ATS",
                      benefit: "Beat the robots"
                    },
                    {
                      title: "Smart Resume Builder",
                      description: "Professional templates designed by HR experts. Real-time preview, drag-and-drop editing, and instant formatting.",
                      icon: <Sparkles className="text-teal-500" size={28} />,
                      premium: false,
                      stats: "60 sec build",
                      benefit: "Save hours"
                    },
                    {
                      title: "ExpertResume – AI Interview",
                      description: "Mock interviews with feedback from an AI Senior Interviewer. Get readiness reports and ace your next big opportunity.",
                      icon: <Mic className="text-teal-500" size={28} />,
                      premium: true,
                      stats: "85% success",
                      benefit: "Ace interviews"
                    },
                    {
                      title: "Salary Analyzer & Negotiator",
                      description: "Know your market value with AI-powered salary insights. Get negotiation scripts that actually work.",
                      icon: <DollarSign className="text-yellow-500" size={28} />,
                      premium: true,
                      stats: "23% higher",
                      benefit: "Earn more"
                    },
                  ].map((feature, i) => (
                    <div key={i} className="relative group">
                      <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 p-4 sm:p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-teal-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center group-hover:from-slate-50 group-hover:to-slate-50 transition-all duration-300">
                            {React.cloneElement(feature.icon, { size: 20, className: `${feature.icon.props.className} sm:w-6 sm:h-6 lg:w-7 lg:h-7` })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <h3 className="font-bold text-lg sm:text-xl text-gray-900 leading-tight">{feature.title}</h3>
                            {feature.premium ? (
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-bold text-[#0B1F3B] bg-gradient-to-r from-slate-100 to-slate-100 rounded-full self-start">
                                <Crown size={10} className="mr-1 sm:w-3 sm:h-3" /> Premium
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-bold text-[#0B1F3B] bg-slate-100 rounded-full self-start">
                                <CheckCircle size={10} className="mr-1 sm:w-3 sm:h-3" /> Free
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <TrendingUp size={14} className="text-teal-500 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm font-bold text-[#0B1F3B]">{feature.stats}</span>
                            </div>
                            <div className="text-xs sm:text-sm text-[#0B1F3B] font-medium">💡 {feature.benefit}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8 sm:mt-12 text-center lg:text-left">
                  <Link
                    href="/resume-builder"
                    className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full font-bold text-lg sm:text-xl hover:from-[#071429] hover:to-[#071429] transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={() => handleClick("value_prop_cta")}
                  >
                    <Rocket size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    <span className="hidden sm:inline">Start Free - Upgrade Later</span>
                    <span className="sm:hidden">Start Free</span>
                    <ArrowRight size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </Link>
                  <p className="text-gray-600 text-xs sm:text-sm mt-3">✨ No credit card required • Premium from ₹499 (30 days)</p>
                </div>
              </div>

              {/* Video/Demo */}
              <div className="relative mt-8 lg:mt-0">
                <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-[#0B1F3B]/20 to-[#00C4B3]/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                  <div className="bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex gap-1 sm:gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-400 rounded-full"></div>
                      </div>
                      <span className="text-white font-medium text-xs sm:text-sm">ExpertResume AI Demo</span>
                    </div>
                  </div>
                  <VideoComponent />
                </div>

                {/* Floating Success Badge */}
                <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-gradient-to-r from-[#0B1F3B] to-teal-500 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-lg animate-pulse">
                  <Trophy className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">100,000++ Success Stories</span>
                  <span className="sm:hidden">52K+ Stories</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Suspense>




      {/* Final CTA - Redesigned to Match Hero Theme */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#050F20] via-[#0B1F3B] to-[#071429] text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#0B1F3B]/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#0B1F3B]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-[#0B1F3B]/20 backdrop-blur-sm border border-[#0B1F3B]/30 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-6 sm:mb-8 text-xs sm:text-sm font-bold animate-pulse">
            <Sparkles className="mr-2" size={16} />
            <span>🚀 Start Improving Your Resume Today</span>
          </div>

          <h2 className="text-2xl sm:text-2xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Create Your <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Professional Resume</span> Today
          </h2>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            Build a professional, ATS-friendly resume with our easy-to-use platform and AI-powered tools.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-12 sm:mb-16">
            {/* Free Plan */}
            <div className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🆓</div>
              <h3 className="text-2xl sm:text-2xl font-bold mb-3 sm:mb-4">Start Free Today</h3>
              <p className="text-gray-300 mb-6 sm:mb-8 text-base sm:text-lg">Perfect for getting started with professional resumes</p>

              <ul className="text-left space-y-3 sm:space-y-4 mb-8 sm:mb-10 text-base sm:text-lg">
                {[
                  "✅ Professional resume builder",
                  "✅ ATS-friendly templates",
                  "✅ Real-time preview",
                  "✅ PDF downloads",
                  "✅ No credit card required"
                ].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <span className="mr-3 sm:mr-4 text-xl sm:text-2xl">{item.split(' ')[0]}</span>
                    <span className="text-white/90 text-sm sm:text-base">{item.split(' ').slice(1).join(' ')}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/resume-builder"
                className="block w-full bg-gradient-to-r from-[#0B1F3B] to-teal-600 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:from-[#071429] hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                onClick={() => handleClick("final_cta_free")}
              >
                🚀 Start for Free
              </Link>
              <p className="text-gray-400 text-xs sm:text-sm mt-3 sm:mt-4">No signup required • Start immediately</p>
            </div>

            {/* Premium Plan */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl opacity-75 blur-md"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 border border-yellow-400/50 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="text-4xl sm:text-6xl">⚡</div>
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
                    MOST POPULAR
                  </div>
                </div>

                <h3 className="text-2xl sm:text-2xl font-bold mb-3 sm:mb-4">Premium Career Tools</h3>
                <div className="text-2xl sm:text-2xl font-bold mb-1 sm:mb-2">
                  {formatPrice(monthlyPrice, currency)}<span className="text-lg sm:text-xl font-normal text-gray-400"> (30 days)</span>
                </div>
                <p className="text-yellow-200 mb-6 sm:mb-8 text-base sm:text-lg">Everything + AI superpowers</p>

                <ul className="text-left space-y-3 sm:space-y-4 mb-8 sm:mb-10 text-base sm:text-lg">
                  {[
                    "⚡ 1-minute AI resume boost",
                    "🎯 Interview Simulation  - Mock Practice",
                    "💰 Salary analyzer & negotiation",
                    "🏆 Job-specific optimizations",
                    "📄 Unlimited premium downloads"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-3 sm:mr-4 text-xl sm:text-2xl">{item.split(' ')[0]}</span>
                      <span className="text-white/90 text-sm sm:text-base">{item.split(' ').slice(1).join(' ')}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/pricing"
                  className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                  onClick={() => handleClick("final_cta_premium")}
                >
                  💼 Explore Premium Features
                </Link>
                <p className="text-yellow-200 text-xs sm:text-sm mt-3 sm:mt-4">7-day satisfaction guarantee</p>
              </div>
            </div>

            {/* New Premium Features Plan */}
            <div className="bg-gradient-to-br from-[#0B1F3B]/80 to-[#071429]/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-teal-400/30 hover:bg-[#071429]/90 transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🚀</div>
              <h3 className="text-2xl sm:text-2xl font-bold mb-3 sm:mb-4">Advanced AI Tools</h3>
              <p className="text-slate-200 mb-6 sm:mb-8 text-base sm:text-lg">Professional features for career growth</p>

              <ul className="text-left space-y-3 sm:space-y-4 mb-8 sm:mb-10 text-base sm:text-lg">
                {[
                  "🔍 Detailed ATS Analysis",
                  "📝 JD-Based Resume Builder",
                  "📄 One-Pager Resume Premium",
                  "🎯 AI-Powered Suggestions",
                  "📊 Performance Analytics"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-3 sm:mr-4 text-xl sm:text-2xl">{item.split(' ')[0]}</span>
                    <span className="text-slate-100 text-sm sm:text-base">{item.split(' ').slice(1).join(' ')}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/pricing"
                className="block w-full bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:from-[#071429] hover:to-[#008C81] transition-all duration-300 transform hover:scale-105 shadow-2xl"
                onClick={() => handleClick("final_cta_advanced")}
              >
                🚀 Unlock Advanced Features
              </Link>
              <p className="text-slate-300 text-xs sm:text-sm mt-3 sm:mt-4">Included in Premium Plan</p>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm mb-8 sm:mb-12 opacity-90">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-teal-400 sm:w-4 sm:h-4" />
              <span>100% Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-yellow-400 sm:w-4 sm:h-4" />
              <span>7-Day Satisfaction Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-teal-400 sm:w-4 sm:h-4" />
              <span>Trusted by 100,000++ professionals</span>
            </div>
          </div>

          {/* Final Stats */}
          <div className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/20 max-w-2xl mx-auto">
            <p className="text-xl sm:text-2xl font-bold mb-3">Ready to create your professional resume?</p>
            <div className="flex items-center justify-center gap-6 sm:gap-8 text-base sm:text-lg">
              <div className="text-center">
                <div className="text-2xl sm:text-2xl font-bold text-teal-400">Free</div>
                <div className="text-gray-300 text-xs sm:text-sm">To get started</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-2xl font-bold text-teal-400">ATS-Friendly</div>
                <div className="text-gray-300 text-xs sm:text-sm">Templates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      {isLoaded && <StickyCTABar />}

      {/* Testimonials */}
      <Suspense fallback={<div className="w-full h-48 bg-gray-100 animate-pulse rounded-xl" />}>
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Testimonial />
          </div>
        </section>
      </Suspense>

      {/* Resume by Industry/Role - SEO Internal Linking */}
      <Suspense fallback={<div className="w-full h-48 bg-gray-100 animate-pulse rounded-xl" />}>
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Resume Templates by Industry & Role
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get industry-specific resume formats optimized for your target role
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Software Engineer */}
              <Link href="/resume-builder-software-engineer" className="group bg-gradient-to-br from-slate-50 to-teal-50 p-6 rounded-xl border-2 border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💻</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0B1F3B] transition-colors mb-2">
                      Software Engineer Resume
                    </h3>
                    <p className="text-sm text-gray-600">
                      ATS-optimized for tech roles, developer portfolios, and IT professionals
                    </p>
                  </div>
                </div>
              </Link>

              {/* MBA Freshers */}
              <Link href="/resume-builder-mba-freshers" className="group bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border-2 border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📈</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0B1F3B] transition-colors mb-2">
                      MBA Fresher Resume
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tailored for MBA graduates in marketing, finance, HR, and consulting
                    </p>
                  </div>
                </div>
              </Link>

              {/* BPO Jobs */}
              <Link href="/resume-builder-bpo-jobs" className="group bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border-2 border-orange-100 hover:border-orange-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📞</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                      BPO/Call Center Resume
                    </h3>
                    <p className="text-sm text-gray-600">
                      Optimized for customer service, telecaller, and call center roles
                    </p>
                  </div>
                </div>
              </Link>

              {/* US Jobs */}
              <Link href="/resume-builder-us-jobs" className="group bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border-2 border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🇺🇸</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors mb-2">
                      US Jobs Resume
                    </h3>
                    <p className="text-sm text-gray-600">
                      American format for H1B, green card, and US job applications
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <Link
                href="/resume-builder"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-8 py-4 rounded-xl font-bold hover:from-[#071429] hover:to-[#008C81] transition-all shadow-lg hover:shadow-xl"
              >
                Build Your Industry-Specific Resume
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      </Suspense>

    </div>
  );
}

// Optimize StickyCTABar with passive event listener
const StickyCTABar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const handleClick = (action) => {
    event({
      action: action,
      category: "home_page",
      label: "sticky_cta",
      value: "sticky_cta",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-40 flex justify-center">
      <Link
        href="/resume-builder"
        className="bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:from-[#071429] hover:to-[#008C81] hover:shadow-xl transition-all duration-300 flex items-center gap-1 sm:gap-2"
        onClick={() => handleClick("sticky_cta")}
      >
        <FilePlus size={16} className="sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Start Free Now</span>
        <span className="sm:hidden">Start Free</span>
      </Link>
    </div>
  );
};