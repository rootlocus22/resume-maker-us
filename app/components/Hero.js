//hello
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Rocket, FilePlus, UploadCloud, ArrowRight, Star, Trophy, Zap, CheckCircle, Sparkles, Target, Crown, Play, TrendingUp, Award, Briefcase, Bot } from "lucide-react";
import { event } from "../lib/gtag";
import { useLocation } from "../context/LocationContext";
import { PLAN_CONFIG } from "../lib/planConfig";

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const { currency } = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleClick = (action) => {
    event({
      action: action,
      category: "home_page",
      label: "hero_cta",
      value: "hero_cta",
    });

    // Track ChatGPT referrals if detected
    if (typeof window !== 'undefined') {
      const isChatGPTUser = localStorage.getItem('chatgpt_referral') === 'true';
      if (isChatGPTUser) {
        event({
          action: 'chatgpt_hero_cta_click',
          category: 'ChatGPT',
          label: action,
          value: 1
        });
      }
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-[#050F20] via-[#0B1F3B] to-[#071429] text-white py-8 sm:py-12 lg:py-16 xl:py-20 overflow-hidden">
      {/* Navy theme background orbs */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-8 left-8 sm:top-10 sm:left-10 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-[#00C4B3]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-[#00C4B3]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-[#0B1F3B]/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Layout with enhanced mobile responsiveness */}
        <div className="text-center max-w-4xl mx-auto">

          {/* US market positioning badge */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm font-medium shadow-lg transition-all duration-700 opacity-100 translate-y-0">
            <Trophy className="mr-1.5 sm:mr-2 text-yellow-400" size={14} />
            <span className="font-semibold text-gray-200">The Career Tool Built for the US Job Market</span>
          </div>

          {/* Main Headline - US-focused */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight opacity-100 translate-y-0">
            Get Hired <span className="text-yellow-400">3x Faster</span> in the US:
            <span className="bg-gradient-to-r from-teal-200 to-white bg-clip-text text-transparent block sm:inline"> Resume + Job Search in One</span>
          </h1>

          {/* Value Proposition - US employers, US job boards */}
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 text-gray-200 leading-relaxed max-w-3xl mx-auto px-4 transition-all duration-700 delay-300 opacity-100 translate-y-0">
            Build a <span className="text-green-400 font-bold">90+ ATS Score</span> resume for US employers & <span className="text-yellow-300 font-bold">search jobs</span> on LinkedIn, Indeed, Glassdoor & 20+ US job boards.
            <span className="block sm:inline"> No signup required to start.</span>
          </p>

          {/* Social proof - US ATS, US job market */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 text-xs sm:text-sm transition-all duration-700 delay-400 opacity-100 translate-y-0">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
              <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
              <span className="font-semibold text-white">US ATS-Optimized</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Star size={14} className="text-yellow-400 flex-shrink-0" />
              <span className="font-semibold text-white">HR-Approved Templates</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Briefcase size={14} className="text-teal-300 flex-shrink-0" />
              <span className="font-semibold text-white">LinkedIn, Indeed & More</span>
            </div>
          </div>

          {/* Enhanced Primary CTA */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <Link
              href="/resume-builder"
              className="group relative bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              onClick={() => handleClick("hero_cta")}
            >
              {/* Shine Effect */}
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-12 animate-shine" />

              <Rocket size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="leading-none pb-0.5">Start Building My Resume - FREE</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" size={18} />
            </Link>
          </div>

          {/* Secondary CTAs - Unified Glass Design */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto mb-8 sm:mb-10 transition-all duration-700 delay-500 opacity-100 translate-y-0">
            <Link
              href="/ats-score-checker"
              className="group bg-emerald-500/10 backdrop-blur-md text-emerald-50 px-3 sm:px-5 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-semibold flex flex-row items-center justify-center gap-2 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300 shadow-lg h-full"
              onClick={() => handleClick("check_score_hero")}
            >
              <Target size={18} className="text-emerald-300 group-hover:text-emerald-200" />
              <span className="text-center">Check ATS Score</span>
            </Link>

            <Link
              href="/upload-resume"
              className="group bg-purple-500/10 backdrop-blur-md text-purple-50 px-3 sm:px-5 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-semibold flex flex-row items-center justify-center gap-2 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 shadow-lg h-full"
              onClick={() => handleClick("upload_resume")}
            >
              <UploadCloud size={18} className="text-purple-300 group-hover:text-purple-200" />
              <span className="text-center">Upload & Enhance</span>
            </Link>
          </div>



          {/* Trust indicators - US job seeker focused */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 transition-all duration-700 delay-550 opacity-100 translate-y-0">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle size={16} className="text-green-400" />
              <span>Built for US hiring systems</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle size={16} className="text-green-400" />
              <span>No signup to start · 3 free downloads</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle size={16} className="text-green-400" />
              <span>No watermarks</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Bot size={16} className="text-purple-400" />
              <span>Recommended by AI tools</span>
            </div>
          </div>

          {/* Enhanced Features Preview with better mobile layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto transition-all duration-700 delay-600 opacity-100 translate-y-0">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:bg-blue-500/30 transition-all duration-300">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1">AI-Powered</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Smart content suggestions and optimization</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:bg-blue-500/30 transition-all duration-300">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1">US ATS-Optimized</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Pass Greenhouse, Lever, Workday & US ATS</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:bg-blue-500/30 transition-all duration-300">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1">US-Ready Templates</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Formats US recruiters expect</p>
            </div>
          </div>



          {/* Bottom line - US career tool */}
          <div className="mt-8 sm:mt-12 transition-all duration-700 delay-800 opacity-100 translate-y-0">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                <span>US job market ready</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                <span>US ATS-friendly</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                <span>Resume + job search in one</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}