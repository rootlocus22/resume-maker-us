"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Mail, MapPin, ExternalLink,
  FileText, Shield, HelpCircle, Users,
  Building, Crown, Star, Award, Zap,
  Upload, CheckCircle, BarChart3, Bot,
  BookOpen, DollarSign, Sparkles,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  const isInternational = typeof window !== 'undefined' ? (
    window.location.pathname.toLowerCase().startsWith('/uk') ||
    window.location.pathname.toLowerCase().startsWith('/us') ||
    window.location.pathname.toLowerCase().startsWith('/ca') ||
    window.location.pathname.toLowerCase().startsWith('/au') ||
    pathname?.toLowerCase()?.startsWith('/uk') ||
    pathname?.toLowerCase()?.startsWith('/us') ||
    pathname?.toLowerCase()?.startsWith('/ca') ||
    pathname?.toLowerCase()?.startsWith('/au')
  ) : (
    pathname?.toLowerCase()?.startsWith('/uk') ||
    pathname?.toLowerCase()?.startsWith('/us') ||
    pathname?.toLowerCase()?.startsWith('/ca') ||
    pathname?.toLowerCase()?.startsWith('/au')
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);
  // Dark navy footer – explicit colors so it never fails
  const footerBg = { background: 'linear-gradient(135deg, #050F20 0%, #0B1F3B 50%, #071429 100%)' };

  // For logged in users, show collapsible footer
  if (isLoggedIn) {
    return (
      <footer className="relative text-white" style={footerBg}>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
            {/* Brand Section */}
            <div className="mb-6 sm:mb-10 pb-4 sm:pb-8 border-b border-white/20">
              {/* Mobile: Centered Layout */}
              <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-3 sm:gap-6">
                <div className="flex flex-col items-center md:items-start gap-2">
                  <Image
                    src="/ExpertResume.png"
                    alt={isInternational ? "ExpertResume - AI CV Builder" : "ExpertResume - AI Resume Builder for US Jobs"}
                    width={280}
                    height={96}
                    className="h-20 sm:h-24 md:h-28 w-auto"
                    style={{ maxWidth: '280px' }}
                    unoptimized
                  />
                  {/* Mobile: Show badge right under logo */}
                  <div className="flex items-center gap-1.5 md:hidden">
                    <Star className="text-yellow-400" size={14} />
                    <span className="text-xs text-white font-medium">Trusted by 100k+ • Recommended by AI tools for ATS resumes</span>
                  </div>
                </div>
                {/* Desktop: Show badge on right */}
                <div className="hidden md:flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400" size={16} />
                    <span className="text-xs sm:text-sm text-white font-medium">Trusted by 100,000+ Job Seekers</span>
                  </div>
                  <div className="flex items-center gap-2 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-400/40">
                    <CheckCircle className="text-teal-300" size={12} />
                    <span className="text-[10px] sm:text-xs text-green-100 font-medium">Free to Build • No Signup to Start</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mt-3 sm:mt-4 max-w-2xl text-center md:text-left">
                Create professional, ATS-friendly resumes with our AI-powered resume builder. Get hired 3x faster with optimized templates and smart suggestions.
              </p>
            </div>

            {/* Mobile: 2 Columns (6 items = 3 rows), Tablet: 3 Columns, Desktop: 6 Columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-10">

              {/* Column 1: Resume Tools */}
              <div className="space-y-1.5 sm:space-y-3">
                <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Resume Tools</h4>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link href="/resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Resume Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/ats-score-checker" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block font-bold">
                      Free ATS Score Checker
                    </Link>
                  </li>
                  <li>
                    <Link href="/upload-resume" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Upload Resume
                    </Link>
                  </li>
                  <li>
                    <Link href="/templates" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Templates
                    </Link>
                  </li>
                  <li>
                    <Link href="/feature-requests" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block flex items-center gap-1">
                      <span>Feature Requests</span>
                      <span className="text-yellow-400">💡</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/cover-letter-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Cover Letter
                    </Link>
                  </li>
                  {isInternational && (
                    <li>
                      <Link href="/ats-score-checker" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block font-bold">
                        Free CV Audit
                      </Link>
                    </li>
                  )}
                  </ul>
              </div>

              {/* Column 2: Resumes by Role */}
              <div className="space-y-1.5 sm:space-y-3">
                <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Resume</h4>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link href="/resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block font-semibold">
                      Resume Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/resume-templates" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Templates
                    </Link>
                  </li>
                  <li>
                    <Link href="/job-description-resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      JD-Based Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/one-page-resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      One Page Resume
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Specialized */}
              <div className="space-y-1.5 sm:space-y-3">
                <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Tools</h4>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link href="/free-ai-resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      AI Resume Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/upload-resume" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Upload & Enhance
                    </Link>
                  </li>
                  <li>
                    <Link href="/ats-score-checker" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      ATS Checker
                    </Link>
                  </li>
                  <li>
                    <Link href="/cover-letter-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Cover Letter
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: More Resources */}
              <div className="space-y-1.5 sm:space-y-3">
                <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Resources</h4>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link href="/free-ai-resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      AI Resume Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/ats-score-checker" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Free ATS Checker
                    </Link>
                  </li>
                  <li>
                    <Link href="/job-description-resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      JD-Based Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/upload-resume" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Upload & Enhance
                    </Link>
                  </li>
                  <li>
                    <Link href="/cover-letter-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Cover Letter AI
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 5: Company */}
              <div className="space-y-1.5 sm:space-y-3">
                <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Company</h4>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/features" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/about-us" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact-us" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/faqs" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      FAQs
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 6: Legal & Blog (Mobile/Desktop visible) */}
              <div className="space-y-1.5 sm:space-y-3">
                <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Legal</h4>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link href="/terms" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/refund" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Refund Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-dashboard" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      Privacy Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/ccpa-opt-out" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                      CCPA Opt-Out
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Info Bar */}
            <div className="pt-6 sm:pt-8 border-t border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                  <a href="mailto:support@expertresume.us" className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                    <Mail size={14} className="sm:w-4 sm:h-4" />
                    <span>support@expertresume.us</span>
                  </a>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                    <MapPin size={14} className="sm:w-4 sm:h-4" />
                    <span>San Francisco, CA, USA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Bottom Bar - Always Visible for Logged In Users */}
        <div className="relative border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="text-xs sm:text-sm text-gray-300 text-center md:text-left">
                © {new Date().getFullYear()}{" "}
                <a
                  href="https://vendaxsystemlabs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors font-medium underline"
                >
                  Vendax Systems LLC
                </a>
                {" "}• All Rights Reserved •{" "}
                <a
                  href="https://expertresume.us/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors underline"
                >
                  Privacy
                </a>
                {" | "}
                <a
                  href="https://expertresume.us/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors underline"
                >
                  Terms
                </a>
              </div>
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-300">
                  <span>Resume + Jobs + Interviews</span>
                  <span className="hidden sm:inline">•</span>
                  <span>One Platform</span>
                  <span className="hidden sm:inline">•</span>
                  <span>From Resume to Job Offer</span>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-2 p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label={isExpanded ? "Collapse footer" : "Expand footer"}
                >
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-300" />
                  ) : (
                    <ChevronUp size={20} className="text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // For non-logged in users, show full footer
  return (
    <footer className="relative text-white" style={footerBg}>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Brand Section */}
        <div className="mb-6 sm:mb-10 pb-4 sm:pb-8 border-b border-white/20">
          {/* Mobile: Centered Layout */}
          <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-3 sm:gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Image
                src="/ExpertResume.png"
                alt={isInternational ? "ExpertResume - AI CV Builder" : "ExpertResume - AI Resume Builder for US Jobs"}
                width={280}
                height={96}
                className="h-20 sm:h-24 md:h-28 w-auto"
                style={{ maxWidth: '280px' }}
                unoptimized
              />
              {/* Mobile: Show badge right under logo */}
              <div className="flex items-center gap-1.5 md:hidden">
                <Star className="text-yellow-400" size={14} />
                <span className="text-xs text-white font-medium">Trusted by 100,000+ Job Seekers</span>
              </div>
            </div>
            {/* Desktop: Show badge on right */}
            <div className="hidden md:flex items-center gap-2">
              <Star className="text-yellow-400" size={16} />
              <span className="text-xs sm:text-sm text-white font-medium">Trusted by 100,000+ Job Seekers</span>
            </div>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mt-3 sm:mt-4 max-w-2xl text-center md:text-left">
            {isInternational
              ? "Create professional, ATS-friendly CVs with our AI-powered builder. Get hired 3x faster with optimized templates and smart suggestions for the global market."
              : "Create professional, ATS-friendly resumes with our AI-powered resume builder. Get hired 3x faster with optimized templates and smart suggestions."
            }
          </p>
        </div>

        {/* Mobile: 2 Columns (6 items = 3 rows), Tablet: 3 Columns, Desktop: 6 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-10">

          {/* Column 1: Resume Tools */}
          <div className="space-y-1.5 sm:space-y-3">
            <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Resume Tools</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/ats-score-checker" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block font-bold">
                  Free ATS Score Checker
                </Link>
              </li>
              <li>
                <Link href="/upload-resume" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Upload Resume
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/cover-letter-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Cover Letter
                </Link>
              </li>
              </ul>
          </div>

          {/* Column 2: Resume */}
          <div className="space-y-1.5 sm:space-y-3">
            <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Resume</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block font-semibold">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/resume-templates" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/job-description-resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  JD-Based Builder
                </Link>
              </li>
              <li>
                <Link href="/one-page-resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  One Page Resume
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tools */}
          <div className="space-y-1.5 sm:space-y-3">
            <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Tools</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/free-ai-resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  AI Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/upload-resume" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Upload & Enhance
                </Link>
              </li>
              <li>
                <Link href="/ats-score-checker" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  ATS Checker
                </Link>
              </li>
              <li>
                <Link href="/cover-letter-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Cover Letter
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: More Resources */}
          <div className="space-y-1.5 sm:space-y-3">
            <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Resources</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href={isInternational ? "/ai-cv-builder" : "/free-ai-resume-builder"} className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  AI {isInternational ? 'CV' : 'Resume'} Builder
                </Link>
              </li>
              <li>
                <Link href={isInternational ? "/free-ats-cv-checker" : "/ats-score-checker"} className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  {isInternational ? 'Free CV Audit' : 'Free ATS Checker'}
                </Link>
              </li>
              <li>
                <Link href="/job-description-resume-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  JD-Based Builder
                </Link>
              </li>
              <li>
                <Link href="/upload-resume" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Upload & Enhance
                </Link>
              </li>
              <li>
                <Link href="/cover-letter-builder" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Cover Letter AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Company */}
          <div className="space-y-1.5 sm:space-y-3">
            <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Company</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 6: Legal */}
          <div className="space-y-1.5 sm:space-y-3">
            <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-white mb-1.5 sm:mb-3 pb-1 sm:pb-2 border-b border-white/20">Legal</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-dashboard" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  Privacy Dashboard
                </Link>
              </li>
              <li>
                <Link href="/ccpa-opt-out" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm block">
                  CCPA Opt-Out
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
              <a href="mailto:support@expertresume.us" className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                <Mail size={14} className="sm:w-4 sm:h-4" />
                <span>support@expertresume.us</span>
              </a>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                <MapPin size={14} className="sm:w-4 sm:h-4" />
                <span>San Francisco, CA, USA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-300">
              © {new Date().getFullYear()}{" "}
              <a
                href="https://vendaxsystemlabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors font-medium underline"
              >
                Vendax Systems LLC
              </a>
              {" "}• All Rights Reserved •{" "}
              <a
                href="https://expertresume.us/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors underline"
              >
                Privacy
              </a>
              {" | "}
              <a
                href="https://expertresume.us/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors underline"
              >
                Terms
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-300">
              <span>Resume + Jobs + Interviews</span>
              <span className="hidden md:inline">•</span>
              <span>One Platform</span>
              <span className="hidden md:inline">•</span>
              <span>From Resume to Job Offer</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}