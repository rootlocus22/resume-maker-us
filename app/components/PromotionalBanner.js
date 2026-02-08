'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MapPin, MessageSquare, Upload } from 'lucide-react';

const promotionalMessages = [
  {
    id: 1,
    icon: MapPin,
    text: 'Find Jobs Near You',
    description: 'Discover local job opportunities',
    link: '/jobs-nearby',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    darkColor: 'text-emerald-700'
  },
  {
    id: 2,
    icon: MessageSquare,
    text: 'ExpertResume GPT',
    description: 'AI-powered career assistant',
    link: '/expertresume-gpt',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    darkColor: 'text-purple-700'
  },
  {
    id: 3,
    icon: Upload,
    text: 'Create AI Resume',
    description: 'Build your resume with AI assistance',
    link: '/upload-resume',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    darkColor: 'text-blue-700'
  },
  {
    id: 4,
    icon: Sparkles, // reusing Sparkles or adding ShieldCheck if available
    text: 'Free ATS Score',
    description: 'Check your resume visibility',
    link: '/ats-score-checker',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    darkColor: 'text-orange-700'
  }
];

export default function PromotionalBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % promotionalMessages.length);
        setFade(true);
      }, 300);
    }, 5000); // Change message every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const currentMessage = promotionalMessages[currentIndex];
  const Icon = currentMessage.icon;

  return (
    <div className="relative w-full bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between py-2.5 sm:py-3">
          {/* Left: Sparkle Icon (hidden on very small screens) */}
          <div className="hidden xs:flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-pulse" />
          </div>

          {/* Center: Rotating Message */}
          <a
            href={currentMessage.link}
            className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-2 py-2 sm:py-2.5 rounded-lg transition-all duration-300 hover:scale-[1.02] ${currentMessage.lightColor
              } ${fade ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className={`flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full ${currentMessage.color}`}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`text-xs sm:text-sm font-semibold ${currentMessage.darkColor} truncate`}>
                  {currentMessage.text}
                </span>
                <span className="hidden sm:inline text-xs text-gray-500">•</span>
                <span className="hidden sm:inline text-xs text-gray-600 truncate">
                  {currentMessage.description}
                </span>
              </div>
            </div>

            {/* Arrow Icon */}
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>

          {/* Right: Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 ml-1 sm:ml-2"
            aria-label="Close banner"
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Indicator Dots */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 pb-1">
        {promotionalMessages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setFade(false);
              setTimeout(() => {
                setCurrentIndex(index);
                setFade(true);
              }, 300);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                ? `${promotionalMessages[index].color} w-4`
                : 'bg-gray-300 hover:bg-gray-400'
              }`}
            aria-label={`Go to message ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

