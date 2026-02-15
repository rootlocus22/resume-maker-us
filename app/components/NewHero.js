"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Rocket,
  FilePlus,
  ArrowRight,
  Star,
  Users,
  Trophy,
  CheckCircle,
  Sparkles,
  Target,
  Crown,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Play,
  Eye
} from "lucide-react";
import { event } from "../lib/gtag";
import { useLocation } from "../context/LocationContext";
import { templates } from "../lib/templates";
import { visualAppealTemplates } from "../lib/visualAppealTemplates";

export default function NewHero() {
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { currency } = useLocation();

  // Handle preview loading
  const handlePreviewOpen = (template) => {
    setIsPreviewLoading(true);
    setIsAutoPlaying(false);
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
    // Simulate loading delay
    setTimeout(() => {
      setIsPreviewLoading(false);
    }, 800);
  };

  // Simulate template loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTemplateLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Get templates for showcase
  const allTemplates = { ...templates, ...visualAppealTemplates };
  const featuredTemplates = Object.entries(allTemplates || {})
    .filter(([_, template]) => template.previewImage && template.name)
    .slice(0, 6)
    .map(([key, template]) => ({ ...template, key }));

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAutoPlaying && featuredTemplates.length > 1) {
      const interval = setInterval(() => {
        setCurrentTemplate((prev) => (prev + 1) % featuredTemplates.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, featuredTemplates.length]);

  const handleClick = (action) => {
    event({
      action: action,
      category: "home_page",
      label: "hero_cta",
      value: "hero_cta",
    });
  };

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Software Engineer",
      content: "I was struggling to get interview calls for months. After using ExpertResume, I got 6 interview calls in just 3 weeks! The ATS score checker helped me fix all the issues in my resume.",
      rating: 5,
      avatar: "/images/testimonial-1.jpg"
    },
    {
      name: "James K.",
      role: "Product Manager",
      content: "The job description resume builder is a game changer! I could customize my resume for each application. Got offers from 3 companies including my current role.",
      rating: 5,
      avatar: "/images/testimonial-2.jpg"
    },
    {
      name: "Alex T.",
      role: "Business Analyst",
      content: "As a recent grad, I had no idea how to make my resume stand out. ExpertResume made it so easy with ready templates and AI suggestions. Landed a great role!",
      rating: 5,
      avatar: "/images/testimonial-3.jpg"
    },
    {
      name: "Jordan L.",
      role: "Data Scientist",
      content: "The resume parser saved me hours of work. Then I used the ATS checker and improved my score from 45% to 89%. Worth every penny. Highly recommend.",
      rating: 5,
      avatar: "/images/testimonial-4.jpg"
    },
    {
      name: "Morgan R.",
      role: "Marketing Manager",
      content: "My previous resume was getting rejected everywhere. After rebuilding it on ExpertResume, I started getting responses immediately. Got the job in just 2 months!",
      rating: 5,
      avatar: "/images/testimonial-5.jpg"
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-[#F5F7FA] via-white to-slate-50 text-primary py-8 sm:py-12 lg:py-24 overflow-hidden">
      {/* Light Background Elements - US theme teal/navy */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-accent-200/30 to-accent-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-primary/10 to-accent-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-slate-200/20 to-accent-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="h-full w-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className={`lg:col-span-1 space-y-8 transition-all duration-700 delay-200 overflow-visible ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
            {/* Trust Badge */}
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              <Trophy className="mr-2 text-primary" size={16} />
              <span className="text-gray-700">Trusted by 100,000+ professionals</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                Your Complete
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
                  Career Launchpad
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Plan your career, build your resume, apply smarter, prepare for interviews, and land your dream job.
                ExpertResume is your end-to-end career transformation platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Link
                href="/resume-builder"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-accent text-white px-6 sm:px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:from-gray-900 hover:to-accent-600 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_8px_30px_rgba(11,31,59,0.35)] shadow-2xl relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                onClick={() => handleClick("hero_cta")}
                role="button"
                aria-label="Start building your resume for free"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick("hero_cta");
                  }
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-45 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <Rocket size={20} className="transform group-hover:rotate-12 transition-transform duration-300" aria-hidden="true" />
                <span className="whitespace-nowrap">Start Building FREE</span>
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
              </Link>

              <div className="flex justify-center sm:justify-start">
                <a
                  href="#templates-section"
                  className="inline-flex items-center gap-2 text-primary font-semibold text-base sm:text-lg hover:text-gray-900 transition-colors duration-300 group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg px-2 py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    const section = document.getElementById('templates-section');
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    handleClick("browse_templates");
                  }}
                  role="button"
                  aria-label="Browse all resume templates"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const section = document.getElementById('templates-section');
                      if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                      handleClick("browse_templates");
                    }
                  }}
                >
                  Browse All Templates
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-8 w-full overflow-visible">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100k+</div>
                <div className="text-sm text-gray-500">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
            </div>
          </div>

          {/* Center - Templates Collection Showcase */}
          <div className={`lg:col-span-1 relative transition-all duration-700 delay-400 mb-8 lg:mb-0 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
            {/* Template Collection Grid */}
            <div className="relative mx-auto max-w-sm lg:max-w-lg">
              {/* Main Template (Center) */}
              <div className="relative z-20 group cursor-pointer">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
                  {isTemplateLoading ? (
                    <div className="aspect-[3/4] relative bg-gray-50">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="space-y-8 w-full px-4">
                          {/* Loading animation */}
                          <div className="animate-pulse space-y-4">
                            <div className="h-48 bg-gray-200 rounded-lg"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                            <div className="flex justify-center space-x-2">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-4 h-4 bg-gray-200 rounded-full"></div>
                              ))}
                            </div>
                          </div>
                          {/* Loading text */}
                          <div className="text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="text-sm text-gray-600 font-medium">Loading templates...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : featuredTemplates.length > 0 && (
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={featuredTemplates[currentTemplate].previewImage}
                        alt={featuredTemplates[currentTemplate].name}
                        fill
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                        sizes="400px"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-40"></div>
                      {/* Quick View Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handlePreviewOpen(featuredTemplates[currentTemplate])}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handlePreviewOpen(featuredTemplates[currentTemplate]);
                            }
                          }}
                          className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-full font-semibold flex items-center gap-2 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                          aria-label={`Quick view of ${featuredTemplates[currentTemplate].name} template`}
                        >
                          <Eye size={18} aria-hidden="true" />
                          Quick View
                        </button>
                      </div>

                      {/* Template Info */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {featuredTemplates[currentTemplate].name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">Professional Template</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                            <span className="text-gray-500 text-sm">4.9 (1.2k reviews)</span>
                          </div>
                        </div>
                      </div>

                      {/* Premium Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          PREMIUM
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template 2 (Top Right) */}
              <div className="absolute -top-8 -right-8 z-10 transform rotate-12 hover:rotate-6 hover:scale-110 transition-all duration-500 delay-100">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden w-32 h-40">
                  {featuredTemplates.length > 1 && (
                    <div className="relative w-full h-full">
                      <Image
                        src={featuredTemplates[1].previewImage}
                        alt={featuredTemplates[1].name}
                        fill
                        className="object-cover object-top"
                        sizes="128px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {featuredTemplates[1].name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template 3 (Bottom Left) */}
              <div className="absolute -bottom-8 -left-8 z-10 transform -rotate-12 hover:-rotate-6 hover:scale-110 transition-all duration-500 delay-200">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden w-32 h-40">
                  {featuredTemplates.length > 2 && (
                    <div className="relative w-full h-full">
                      <Image
                        src={featuredTemplates[2].previewImage}
                        alt={featuredTemplates[2].name}
                        fill
                        className="object-cover object-top"
                        sizes="128px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {featuredTemplates[2].name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template 4 (Top Left) */}
              <div className="absolute -top-12 -left-12 z-5 transform rotate-6 hover:rotate-3 hover:scale-105 transition-all duration-500 delay-300">
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden w-24 h-32">
                  {featuredTemplates.length > 3 && (
                    <div className="relative w-full h-full">
                      <Image
                        src={featuredTemplates[3].previewImage}
                        alt={featuredTemplates[3].name}
                        fill
                        className="object-cover object-top"
                        sizes="96px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template 5 (Bottom Right) */}
              <div className="absolute -bottom-12 -right-12 z-5 transform -rotate-6 hover:-rotate-3 hover:scale-105 transition-all duration-500 delay-400">
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden w-24 h-32">
                  {featuredTemplates.length > 4 && (
                    <div className="relative w-full h-full">
                      <Image
                        src={featuredTemplates[4].previewImage}
                        alt={featuredTemplates[4].name}
                        fill
                        className="object-cover object-top"
                        sizes="96px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
                <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  50+ Templates
                </div>
              </div>

              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-accent-400/20 rounded-3xl blur-3xl -z-10 scale-110"></div>
            </div>

            {/* Template Navigation Dots */}
            <div className="flex justify-center mt-12 gap-2">
              {featuredTemplates.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTemplate(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setCurrentTemplate(index);
                    }
                  }}
                  aria-label={`View template ${index + 1}`}
                  aria-current={index === currentTemplate ? 'true' : 'false'}
                  className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${index === currentTemplate
                      ? 'bg-yellow-400 w-8 shadow-lg'
                      : 'bg-gray-400 hover:bg-gray-300'
                    }`}
                />
              ))}
            </div>

            {/* Template Stats */}
            <div className="flex justify-center gap-8 mt-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-gray-500">Templates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-gray-500">Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">100k+</div>
                <div className="text-sm text-gray-500">Downloads</div>
              </div>
            </div>
          </div>

          {/* Right - Testimonials */}
          <div className={`lg:col-span-1 space-y-6 transition-all duration-700 delay-600 mt-8 lg:mt-0 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
            <div>
              <p className="text-lg text-gray-600 mb-6 text-center lg:text-left">
                It's time to feel the ease in your resume building. Join other happy users
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-gray-800 font-semibold">4.9 Positive reviews</span>
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
              </div>

              {/* Testimonial Card */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  {/* Quote Icon */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center ring-2 ring-white shadow-lg transform hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold">
                        {testimonials[currentTestimonial].name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</p>
                      <p className="text-sm text-gray-500">{testimonials[currentTestimonial].role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">"{testimonials[currentTestimonial].content}"</p>
                  <div className="flex items-center gap-1 mt-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                    ))}
                  </div>
                  {/* Navigation Dots */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentTestimonial
                            ? 'bg-primary w-6'
                            : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 gap-6 mt-12">
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-center gap-3">
                      <Users className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">100k+</div>
                    </div>
                    <div className="text-sm text-gray-600 text-center mt-1 font-medium">Resumes Created</div>
                  </div>
                </div>
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-center gap-3">
                      <Trophy className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">50+</div>
                    </div>
                    <div className="text-sm text-gray-600 text-center mt-1 font-medium">Pro Templates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Template Preview Modal */}
      {isPreviewOpen && previewTemplate && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
            aria-hidden="true"
          ></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-auto overflow-hidden"
              role="document"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  aria-label="Close preview"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 p-4 md:p-8">
                {/* Template Preview */}
                <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden max-w-sm mx-auto md:max-w-none">
                  {isPreviewLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <div className="space-y-8 w-full px-8">
                        <div className="animate-pulse space-y-4">
                          <div className="h-64 bg-gray-200 rounded-lg"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm text-gray-600 font-medium">Loading preview...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={previewTemplate.previewImage}
                      alt={previewTemplate.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </div>

                {/* Template Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{previewTemplate.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <span className="text-gray-600">4.9 (1.2k reviews)</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      A professional and modern template perfect for showcasing your skills and experience. ATS-friendly design with clean typography and well-structured sections.
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Template Features</h4>
                    <ul className="space-y-3">
                      {[
                        "ATS-Optimized Layout",
                        "Professional Typography",
                        "Clean & Modern Design",
                        "Customizable Sections",
                        "Perfect Content Spacing",
                        "Mobile-Responsive Format"
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="space-y-4 pt-6">
                    <Link
                      href="/resume-builder"
                      onClick={() => {
                        setIsPreviewOpen(false);
                        handleClick("template_preview_cta");
                      }}
                      className="block text-center bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-primary-800 hover:to-accent-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
                    >
                      Use This Template
                    </Link>
                    <p className="text-center text-sm text-gray-500">
                      Free to use • No credit card required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
