"use client";
import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function ExpertResumeGPTBanner({ variant = "floating" }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem("gpt-banner-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show banner after 3 seconds for floating variant
    if (variant === "floating") {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [variant]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("gpt-banner-dismissed", "true");
    setTimeout(() => setIsDismissed(true), 300);
  };

  if (isDismissed) return null;

  // Floating banner (bottom-right)
  if (variant === "floating") {
    return (
      <div
        className={`fixed bottom-6 right-6 z-50 max-w-md transition-all duration-500 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl p-6 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">
                ✨ New: ExpertResume GPT
              </h3>
              <p className="text-sm text-blue-100 mb-4">
                Your AI assistant for interviews, coding, career advice & more!
              </p>
              <Link
                href="/expertresume-gpt"
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-full font-semibold text-sm hover:bg-gray-100 transition-all"
              >
                Learn More
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline banner (for pages)
  if (variant === "inline") {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-white/20 p-4 rounded-2xl flex-shrink-0">
            <Sparkles className="w-8 h-8" />
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-block bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
              NEW FEATURE
            </div>
            <h3 className="text-2xl font-bold mb-2">
              Meet ExpertResume GPT - Your AI Career Partner
            </h3>
            <p className="text-blue-100">
              Get instant help with interviews, coding, system design, career advice, and more. Available 24/7 for all premium members.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link
              href="/expertresume-gpt"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg"
            >
              Explore GPT
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Top banner (full-width)
  if (variant === "top") {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all duration-500 ${
        isVisible ? "max-h-20 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm sm:text-base font-medium">
              <span className="font-bold">New:</span> ExpertResume GPT - Your AI assistant for career success!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/expertresume-gpt"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-full font-semibold text-sm hover:bg-gray-100 transition-all whitespace-nowrap"
            >
              Try Now
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

