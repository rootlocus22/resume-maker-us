"use client";

import Link from "next/link";
import { Rocket, UploadCloud, ArrowRight, Star, Trophy, Zap, CheckCircle, Sparkles, Target, Play, TrendingUp, Award, Briefcase, Bot, FileText, Search, Mic, Medal } from "lucide-react";
import { event } from "../lib/gtag";

export default function Hero() {

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
      color: "from-blue-400 to-blue-300",
      glow: "blue",
    },
    {
      step: "2",
      label: "Optimize",
      description: "ATS Score 90+",
      icon: Target,
      color: "from-indigo-400 to-indigo-300",
      glow: "indigo",
    },
    {
      step: "3",
      label: "Apply",
      description: "Job Search",
      icon: Search,
      color: "from-primary-400 to-primary-300",
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
    <section className="relative bg-gradient-to-br from-primary-800 via-primary-900 to-primary-700 text-white py-8 sm:py-12 lg:py-16 xl:py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-8 left-8 sm:top-10 sm:left-10 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-primary/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 sm:w-20 sm:h-20 bg-accent/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">

          {/* Positioning badge */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm font-medium shadow-lg">
            <Trophy className="mr-1.5 sm:mr-2 text-yellow-400" size={14} />
            <span className="text-gray-200">AI-Powered Tools to Help You Build, Optimize, and Ace Your Next Interview</span>
          </div>

          {/* Main Headline - SEO optimized for "expert resume" */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            Build Your <span className="bg-gradient-to-r from-accent to-accent-200 bg-clip-text text-transparent">Expert Resume</span>
            <br />
            <span className="text-gray-300">Get Hired Faster.</span>
          </h1>

          {/* Sub-headline - The Journey */}
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 text-gray-300 leading-relaxed max-w-3xl mx-auto px-4">
            Create an <span className="text-accent font-semibold">expert resume</span> with AI-powered optimization, <span className="text-accent font-semibold">ATS score 90+</span>, job search across 20+ boards, and <span className="text-accent font-semibold">AI interview practice</span> — all in one platform.
            <span className="block text-gray-400 text-sm sm:text-base mt-2">Free to start. No credit card required.</span>
          </p>

          {/* Social proof row */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
              <CheckCircle size={14} className="text-accent flex-shrink-0" />
              <span className="font-semibold text-white">90+ ATS Score</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Briefcase size={14} className="text-primary-300 flex-shrink-0" />
              <span className="font-semibold text-white">20+ Job Boards</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Mic size={14} className="text-purple-300 flex-shrink-0" />
              <span className="font-semibold text-white">AI Mock Interviews</span>
            </div>
          </div>

          {/* All CTAs - Minimal Horizontal Layout */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 max-w-4xl mx-auto mb-12 sm:mb-16 px-4">
            <Link
              href="/resume-builder"
              className="group relative bg-accent hover:bg-accent-600 text-white px-6 py-3.5 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 overflow-hidden border border-white/20"
              onClick={() => handleClick("hero_cta")}
            >
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 animate-shine" />
              <Rocket size={20} className="flex-shrink-0" />
              <span>Build New Resume</span>
            </Link>

            <Link
              href="/upload-resume"
              className="group relative bg-white/5 backdrop-blur-md text-white px-6 py-3.5 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
              onClick={() => handleClick("upload_enhance_hero")}
            >
              <UploadCloud size={20} className="text-blue-300 group-hover:text-blue-200" />
              <span>Upload & Enhance</span>
            </Link>

            <Link
              href="/ats-score-checker"
              className="group relative bg-white/5 backdrop-blur-md text-white px-6 py-3.5 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 hover:border-indigo-400/50 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
              onClick={() => handleClick("check_score_hero")}
            >
              <Target size={20} className="text-indigo-300 group-hover:text-indigo-200" />
              <span>Check ATS Score</span>
            </Link>

            <Link
              href="/ai-interview"
              className="group relative bg-white/5 backdrop-blur-md text-white px-6 py-3.5 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
              onClick={() => handleClick("ai_interview_hero")}
            >
              <Mic size={20} className="text-purple-300 group-hover:text-purple-200" />
              <span>Practice Interview</span>
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
                      <step.icon size={20} className="text-white w-4 h-4 sm:w-5 sm:h-5" />
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:bg-accent/30 transition-all">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1">7 Ways to Build</h3>
              <p className="text-gray-400 text-xs sm:text-sm">AI Builder, JD-Match, Text-to-Resume, Upload & Enhance, One-Pager & more</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:bg-primary/30 transition-all">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
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
              <CheckCircle size={14} className="text-accent" />
              <span>Passes Workday, Greenhouse, Lever ATS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-accent" />
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
