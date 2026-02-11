"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Rocket,
  ArrowRight,
  CheckCircle,
  Shield,
  Users,
  Award,
  Zap,
  Crown
} from "lucide-react";
import { getEffectivePricing } from "../lib/globalPricing";

export default function FinalCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const pricing = getEffectivePricing('USD', false);
  const sixMonthPrice = (pricing?.sixMonth || 5999) / 100;

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          {/* Trust Badge */}
          <div className="inline-flex items-center bg-[#00C4B3]/20 backdrop-blur-sm border border-[#00C4B3]/30 px-6 py-3 rounded-full text-sm font-bold mb-8">
            <Rocket className="mr-2" size={18} />
            <span>Stop Paying for 5 Tools. Get One That Does It All.</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
            Resume + Jobs + Interviews = <span className="bg-gradient-to-r from-[#00C4B3] to-emerald-400 bg-clip-text text-transparent">One Platform</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Build your resume (7 ways), search 20+ job boards, practice with an AI interviewer, and track every application —
            all for just {formatPrice(sixMonthPrice)} for 6 months. No other platform gives you this much for this price.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              href="/checkout?billingCycle=sixMonth"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-xl font-bold text-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 relative overflow-hidden group"
              role="button"
              aria-label="Get 6-month career transformation plan"
            >
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform skew-x-12 animate-shine" />
              <Rocket size={24} aria-hidden="true" />
              <span>Get Complete Toolkit <span className="text-sm block font-normal opacity-80">{formatPrice(sixMonthPrice)} for 6 Months</span></span>
              <ArrowRight size={20} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/resume-builder"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              role="button"
              aria-label="Start building your resume for free"
            >
              Start Building FREE
            </Link>
          </div>

          {/* Trust Signals */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12 text-sm"
            role="list"
            aria-label="Trust and security features"
          >
            <div
              className="flex items-center gap-2"
              role="listitem"
            >
              <Shield className="w-5 h-5 text-blue-400" aria-hidden="true" />
              <span>100% Secure & Private</span>
            </div>
            <div
              className="flex items-center gap-2"
              role="listitem"
            >
              <Users className="w-5 h-5 text-blue-400" aria-hidden="true" />
              <span>Trusted by 100,000+ users</span>
            </div>
            <div
              className="flex items-center gap-2"
              role="listitem"
            >
              <Award className="w-5 h-5 text-yellow-400" aria-hidden="true" />
              <span>ATS Compatible</span>
            </div>
          </div>

          {/* Features Grid */}
          <div
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            role="list"
            aria-label="Key platform features"
          >
            <div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300"
              role="listitem"
            >
              <div
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                aria-hidden="true"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3
                className="text-2xl font-bold mb-4"
                id="feature-free"
              >
                Free to Start
              </h3>
              <p
                className="text-gray-300 leading-relaxed"
                aria-labelledby="feature-free"
              >
                No credit card needed. Build your resume, check ATS score, and search jobs — all free.
              </p>
            </div>

            <div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300"
              role="listitem"
            >
              <div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                aria-hidden="true"
              >
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3
                className="text-2xl font-bold mb-4"
                id="feature-fast"
              >
                Replaces 5 Tools
              </h3>
              <p
                className="text-gray-300 leading-relaxed"
                aria-labelledby="feature-fast"
              >
                Resume builder, ATS checker, job search, interview practice, and career coaching — all in one platform.
              </p>
            </div>

            <div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300"
              role="listitem"
            >
              <div
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                aria-hidden="true"
              >
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3
                className="text-2xl font-bold mb-4"
                id="feature-results"
              >
                Proven Results
              </h3>
              <p
                className="text-gray-300 leading-relaxed"
                aria-labelledby="feature-results"
              >
                Users who use all 5 steps — build, optimize, apply, practice, and negotiate — land jobs 3x faster.
              </p>
            </div>
          </div>

          {/* Final Stats */}
          <div
            className="mt-16 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
            role="region"
            aria-labelledby="success-stories-title"
          >
            <h2
              id="success-stories-title"
              className="text-2xl font-bold mb-8"
            >
              Join the Success Stories
            </h2>
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
              role="list"
              aria-label="Platform success metrics"
            >
              <div
                className="text-center"
                role="listitem"
              >
                <div
                  className="text-4xl font-bold text-yellow-400 mb-2"
                  aria-label="Over 100,000 active users"
                >
                  100k+
                </div>
                <div className="text-gray-300">Active Users</div>
              </div>
              <div
                className="text-center"
                role="listitem"
              >
                <div
                  className="text-4xl font-bold text-yellow-400 mb-2"
                  aria-label="Over 50 professional templates"
                >
                  50+
                </div>
                <div className="text-gray-300">Professional Templates</div>
              </div>
              <div
                className="text-center"
                role="listitem"
              >
                <div
                  className="text-4xl font-bold text-yellow-400 mb-2"
                  aria-label="94 percent success rate"
                >
                  94%
                </div>
                <div className="text-gray-300">Success Rate</div>
              </div>
              <div
                className="text-center"
                role="listitem"
              >
                <div
                  className="text-4xl font-bold text-yellow-400 mb-2"
                  aria-label="4.9 out of 5 stars user rating"
                >
                  4.9★
                </div>
                <div className="text-gray-300">User Rating</div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-12">
            <Link
              href="/resume-builder"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-12 py-6 rounded-xl font-bold text-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              role="button"
              aria-label="Create your resume now for free"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  window.location.href = '/resume-builder';
                }
              }}
            >
              <Rocket size={28} aria-hidden="true" />
              Create My Resume Now - FREE
              <ArrowRight size={24} aria-hidden="true" />
            </Link>
            <p
              className="text-gray-400 text-sm mt-4"
              role="note"
              aria-label="Additional information: No signup required, start in 30 seconds, see results immediately"
            >
              ✨ No signup required • Start in 30 seconds • See results immediately
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
