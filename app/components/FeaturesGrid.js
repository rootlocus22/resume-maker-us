"use client";
import { useState, useEffect } from "react";
import OptimizedFeatureImage from "./OptimizedFeatureImage";
import Link from "next/link";
import { 
  Shield, 
  FileText, 
  Upload, 
  Target, 
  BarChart3,
  ArrowRight,
  Zap,
  CheckCircle,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "ATS Score Checker & Enhancer",
    description: "3-step process: Upload resume → Get detailed analysis → Improve score from 68% to 91%+",
    screenshots: [
      "/images/features/ATS1.png",
      "/images/features/ATS2.png",
      "/images/features/ATS3.png"
    ],
    color: "from-[#0B1F3B] to-[#00C4B3]",
    stats: "3 Steps • 91% Score",
    link: "/ats-score-checker"
  },
  {
    icon: FileText,
    title: "JD Resume Builder",
    description: "3-step workflow: Paste job description → Extract keywords → Get tailored resume",
    screenshots: [
      "/images/features/JD Builder 1.png",
      "/images/features/JD Builder 2.png",
      "/images/features/JD Builder 3.png"
    ],
    color: "from-green-500 to-emerald-600",
    stats: "3 Steps • 26+ Keywords",
    link: "/job-description-resume-builder"
  },
  {
    icon: Upload,
    title: "Smart Resume Parser",
    description: "Upload any resume format and get instant intelligent parsing with complete data extraction",
    screenshots: [
      "/images/features/Upload_Resume.png"
    ],
    color: "from-purple-500 to-purple-600",
    stats: "Instant Parsing",
    link: "/upload-resume"
  }
];

export default function FeaturesGrid() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentScreenshots, setCurrentScreenshots] = useState(features.map(() => 0));

  // Auto-rotate screenshots for multi-image features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreenshots(prev => 
        prev.map((current, index) => {
          if (features[index].screenshots.length > 1) {
            return (current + 1) % features[index].screenshots.length;
          }
          return current;
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59 130 246) 2px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#0B1F3B]" />
            <span className="text-sm font-semibold text-[#0B1F3B]">SEE IT IN ACTION</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Beautiful Results
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every feature is designed to give you an edge in your job search. See real screenshots of what you'll get.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const isHovered = hoveredIndex === index;

            return (
              <Link
                key={index}
                href={feature.link}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-teal-300 transition-all duration-500 hover:shadow-2xl"
              >
                {/* Background Gradient on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Screenshot Section - Taller for better visibility */}
                <div className="relative bg-gradient-to-br from-gray-50 to-slate-50 overflow-hidden" style={{ minHeight: '350px' }}>
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}></div>
                  
                  {/* Screenshot(s) */}
                  <div className="relative w-full h-full p-3">
                    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-500 bg-white">
                      {/* Multiple screenshots with crossfade */}
                      {feature.screenshots.map((screenshot, imgIndex) => (
                        <div
                          key={imgIndex}
                          className={`absolute inset-0 transition-opacity duration-700 ${
                            imgIndex === currentScreenshots[index] ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <OptimizedFeatureImage
                            src={screenshot}
                            alt={`${feature.title} - Step ${imgIndex + 1}`}
                            fill
                            className="object-contain object-center p-1 group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 450px"
                            priority={index === 0 && imgIndex === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats Badge with Step Counter */}
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-200">
                    <span className="text-xs font-bold text-gray-700">
                      {feature.screenshots.length > 1 
                        ? `Step ${currentScreenshots[index] + 1}/${feature.screenshots.length} • ${feature.stats}`
                        : feature.stats
                      }
                    </span>
                  </div>

                  {/* Icon Badge */}
                  <div className={`absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-500 ${isHovered ? 'scale-110 rotate-6' : 'scale-100'}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  {/* Step Dots for Multi-Image Features */}
                  {feature.screenshots.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {feature.screenshots.map((_, dotIndex) => (
                        <div
                          key={dotIndex}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            dotIndex === currentScreenshots[index]
                              ? 'w-6 bg-white shadow-lg'
                              : 'w-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-3">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0B1F3B] transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-[#0B1F3B] font-semibold text-sm pt-2">
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      Try it now
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/resume-builder"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-[#071429] hover:to-[#008C81] transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <Zap className="w-5 h-5" />
              Start Building Your Resume
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required • 100% Free to start</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

