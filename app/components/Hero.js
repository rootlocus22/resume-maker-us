"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Rocket, UploadCloud, ArrowRight, Star, Trophy, Zap, CheckCircle, Sparkles, Target, Play, TrendingUp, Award, Briefcase, Bot, FileText, Search, Mic, Medal } from "lucide-react";
import { event } from "../lib/gtag";

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = (action) => {
    event({
      action: action,
      category: "home_page",
      label: "hero_cta",
      value: "hero_cta",
    });

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

  const journeySteps = [
    {
      step: "1",
      label: "Build",
      description: "AI Resume",
      icon: FileText,
      color: "from-teal-400 to-emerald-400",
      glow: "teal",
    },
    {
      step: "2",
      label: "Optimize",
      description: "ATS Score 90+",
      icon: Target,
      color: "from-emerald-400 to-green-400",
      glow: "emerald",
    },
    {
      step: "3",
      label: "Apply",
      description: "Job Search",
      icon: Search,
      color: "from-blue-400 to-indigo-400",
      glow: "blue",
    },
    {
      step: "4",
      label: "Practice",
      description: "AI Interview",
      icon: Mic,
      color: "from-purple-400 to-violet-400",
      glow: "purple",
    },
    {
      step: "5",
      label: "Get Hired",
      description: "Land the Job",
      icon: Medal,
      color: "from-amber-400 to-yellow-400",
      glow: "amber",
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-[#050F20] via-[#0B1F3B] to-[#071429] text-white py-8 sm:py-12 lg:py-16 xl:py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-8 left-8 sm:top-10 sm:left-10 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-[#00C4B3]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-[#00C4B3]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-[#0B1F3B]/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">

          {/* Positioning badge */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm font-medium shadow-lg">
            <Trophy className="mr-1.5 sm:mr-2 text-yellow-400" size={14} />
            <span className="text-gray-200">The Only Platform That Takes You From Resume to Job Offer</span>
          </div>

          {/* Main Headline - SEO optimized for "expert resume" */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            Build Your <span className="bg-gradient-to-r from-[#00C4B3] to-emerald-300 bg-clip-text text-transparent">Expert Resume</span>
            <br />
            <span className="text-gray-300">Get Hired Faster.</span>
          </h1>

          {/* Sub-headline - The Journey */}
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 text-gray-300 leading-relaxed max-w-3xl mx-auto px-4">
            Create an <span className="text-[#00C4B3] font-semibold">expert resume</span> with AI-powered optimization, <span className="text-[#00C4B3] font-semibold">ATS score 90+</span>, job search across 20+ boards, and <span className="text-[#00C4B3] font-semibold">AI interview practice</span> — all in one platform.
            <span className="block text-gray-400 text-sm sm:text-base mt-2">Free to start. No credit card required.</span>
          </p>

          {/* Social proof row */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
              <CheckCircle size={14} className="text-[#00C4B3] flex-shrink-0" />
              <span className="font-semibold text-white">90+ ATS Score</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Briefcase size={14} className="text-blue-300 flex-shrink-0" />
              <span className="font-semibold text-white">20+ Job Boards</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Mic size={14} className="text-purple-300 flex-shrink-0" />
              <span className="font-semibold text-white">AI Mock Interviews</span>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <Link
              href="/resume-builder"
              className="group relative bg-gradient-to-r from-[#00C4B3] to-emerald-500 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              onClick={() => handleClick("hero_cta")}
            >
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent transform skew-x-12 animate-shine" />
              <Rocket size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="leading-none pb-0.5">Build My Resume Free — No Signup</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" size={18} />
            </Link>
          </div>

          {/* Secondary CTAs */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto mb-8 sm:mb-10">
            <Link
              href="/ats-score-checker"
              className="group bg-emerald-500/10 backdrop-blur-md text-emerald-50 px-3 sm:px-5 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-semibold flex flex-row items-center justify-center gap-2 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300 shadow-lg h-full"
              onClick={() => handleClick("check_score_hero")}
            >
              <Target size={18} className="text-emerald-300 group-hover:text-emerald-200" />
              <span className="text-center">Check ATS Score Free</span>
            </Link>
            <Link
              href="/ai-interview"
              className="group bg-purple-500/10 backdrop-blur-md text-purple-50 px-3 sm:px-5 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-semibold flex flex-row items-center justify-center gap-2 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 shadow-lg h-full"
              onClick={() => handleClick("ai_interview_hero")}
            >
              <Mic size={18} className="text-purple-300 group-hover:text-purple-200" />
              <span className="text-center">Practice Interview</span>
            </Link>
          </div>

          {/* Career Journey Steps - The Differentiator */}
          <div className="mb-8 sm:mb-10">
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest font-semibold mb-4 sm:mb-5">Your Complete Career Toolkit</p>
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-0 max-w-3xl mx-auto">
              {journeySteps.map((step, i) => (
                <div key={step.step} className="flex items-center">
                  <div className="group flex flex-col items-center px-2 sm:px-4 py-2 cursor-default">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-1.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon size={isMobile ? 16 : 20} className="text-white" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-white">{step.label}</span>
                    <span className="text-[9px] sm:text-[11px] text-gray-400">{step.description}</span>
                  </div>
                  {i < journeySteps.length - 1 && (
                    <div className="hidden sm:flex items-center mx-0.5">
                      <div className="w-4 sm:w-6 h-px bg-gradient-to-r from-white/30 to-white/10"></div>
                      <ArrowRight size={10} className="text-white/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* "What You Get" Value Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00C4B3]/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:bg-[#00C4B3]/30 transition-all">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C4B3]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1">7 Ways to Build</h3>
              <p className="text-gray-400 text-xs sm:text-sm">AI Builder, JD-Match, Text-to-Resume, Upload & Enhance, One-Pager & more</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:bg-blue-500/30 transition-all">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1">Find & Track Jobs</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Search across LinkedIn, Indeed, Glassdoor & 20+ boards. Track every application.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:bg-purple-500/30 transition-all">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1">Ace Interviews</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Practice with an AI interviewer. Get instant feedback & confidence scoring.</p>
            </div>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-[#00C4B3]" />
              <span>Passes Workday, Greenhouse, Lever ATS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-[#00C4B3]" />
              <span>No signup to start · Free downloads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bot size={14} className="text-purple-400" />
              <span>Recommended by ChatGPT & AI tools</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
