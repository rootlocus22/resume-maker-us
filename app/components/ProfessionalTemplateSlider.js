"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Crown,
  ArrowRight,
  Sparkles,
  Users,
  Check,
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  CheckCircle,
  Briefcase,
  Palette,
  Layout,
  X
} from "lucide-react";
import { templates } from "../lib/templates";
import { visualAppealTemplates } from "../lib/visualAppealTemplates";
import { event } from "../lib/gtag";

// Template categories with metadata
const categories = [
  { name: "All", icon: <Sparkles className="w-5 h-5" />, count: "50+" },
  { name: "Professional", icon: <Briefcase className="w-5 h-5" />, count: "15+" },
  { name: "Creative", icon: <Palette className="w-5 h-5" />, count: "12+" },
  { name: "Modern", icon: <Sparkles className="w-5 h-5" />, count: "10+" },
  { name: "Simple", icon: <Layout className="w-5 h-5" />, count: "8+" },
  { name: "ATS-Optimized", icon: <CheckCircle className="w-5 h-5" />, count: "All" }
];

const TEMPLATE_FEATURES = [
  "ATS-Optimized Format",
  "Professional Design",
  "Easy Customization",
  "Multiple Color Schemes",
  "Print & PDF Ready",
  "Mobile Responsive"
];

export default function ProfessionalTemplateSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activePreview, setActivePreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    const timer = setTimeout(() => setIsLoading(false), 300);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  // Utility functions
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  };

  const getTemplateCategory = (key, template) => {
    if (key.startsWith('visual_')) return 'Creative';
    if (key.startsWith('ats_')) return 'ATS-Optimized';
    if (key.includes('professional')) return 'Professional';
    if (key.includes('modern')) return 'Modern';
    if (key.includes('simple')) return 'Simple';
    return template.category || 'Professional';
  };

  const formatNumber = (num) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
  };

  // Process templates
  const allTemplates = Object.entries({ ...templates, ...visualAppealTemplates })
    .map(([key, template]) => {
      const hash = simpleHash(key);
      const category = getTemplateCategory(key, template);
      const isPopular = [
        'visual_fashion_designer',
        'visual_modern_executive',
        'visual_minimalist_modern',
        'modern_professional',
        'creative_professional',
        'ats_optimized',
        'executive_professional',
        'tech_professional'
      ].includes(key);

      return {
        ...template,
        key,
        category,
        isPopular,
        downloads: 15000 + (hash % 35000),
        rating: parseFloat((4.5 + (hash % 50) / 100).toFixed(1)),
        description: template.description || (
          template.category === 'Visual Appeal'
            ? `Stunning ${template.name.toLowerCase()} template with premium design and photo integration.`
            : `Professional ${template.category?.toLowerCase() || 'resume'} template designed for modern job seekers.`
        )
      };
    })
    .filter(template => template.previewImage && template.name)
    .sort((a, b) => {
      const aIsVisual = a.key.startsWith('visual_') || a.category === 'Visual Appeal';
      const bIsVisual = b.key.startsWith('visual_') || b.category === 'Visual Appeal';
      if (aIsVisual !== bIsVisual) return aIsVisual ? -1 : 1;
      if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
      return b.downloads - a.downloads;
    });

  const templateData = selectedCategory === "All"
    ? allTemplates
    : allTemplates.filter(t => t.category === selectedCategory)
      .sort((a, b) => {
        // For ATS-Optimized category, prioritize ATS Two-Column Executive
        if (selectedCategory === "ATS-Optimized") {
          if (a.key === 'ats_two_column_executive') return -1;
          if (b.key === 'ats_two_column_executive') return 1;
        }
        return 0; // Keep original order for other items
      });

  // Navigation handlers
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % templateData.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + templateData.length) % templateData.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const handleTemplateClick = (template, action = 'use') => {
    event({
      action: `template_${action}`,
      category: "template_slider",
      label: template.key,
      value: template.key
    });
  };

  const getTemplateUrl = (template) => {
    if (template.category === 'One-Pager') {
      // For one-pager templates, redirect to one-pager editor
      return `/one-pager-builder/editor?template=${template.templateId || template.key}`;
    }
    return `/resume-builder?template=${template.key}&fromTemplate=true`;
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  // Auto-play
  useEffect(() => {
    if (isAutoPlaying && templateData.length > 1 && !hoveredTemplate && !activePreview) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % templateData.length);
      }, 4000);
    } else {
      clearInterval(autoPlayRef.current);
    }

    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, templateData.length, hoveredTemplate, activePreview]);

  // Reset slide when category changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedCategory]);

  if (templateData.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded-full w-64 mx-auto mb-8"></div>
            <div className="h-12 bg-slate-200 rounded-lg w-96 mx-auto mb-12"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Ensure currentSlide is valid for the current templateData to prevent out-of-bounds access
  // This handles the case where filtered templateData shrinks before useEffect resets currentSlide
  const safeCurrentSlide = currentSlide >= templateData.length ? 0 : currentSlide;

  const visibleTemplates = isMobile ? [templateData[safeCurrentSlide]] :
    templateData.slice(safeCurrentSlide, safeCurrentSlide + 3).concat(
      templateData.slice(0, Math.max(0, 3 - (templateData.length - safeCurrentSlide)))
    );

  return (
    <section id="templates-section" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-accent-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-accent-200/20 to-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-primary-200/20 to-accent-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-200 px-4 py-2 rounded-full text-sm font-semibold text-accent-600 mb-6">
            <Sparkles className="w-4 h-4" />
            PROFESSIONAL TEMPLATES
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Choose Your Perfect
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Resume Template
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            50+ professionally designed, ATS-optimized templates trusted by <span className="font-semibold text-gray-900">100,000+</span> professionals worldwide
          </p>

          {/* Category Filter */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${selectedCategory === category.name
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                  }`}
              >
                {category.icon}
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name === "ATS-Optimized" ? "ATS" : category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Template Slider */}
        <div className="relative mb-16">
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {visibleTemplates.map((template, index) => (
                <div
                  key={`${template.key}-${index}`}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
                  onMouseEnter={() => setHoveredTemplate(template.key)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  {/* Template Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <Image
                      src={template.previewImage?.split('?')[0]}
                      alt={`${template.name} Resume Template`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain transition-transform duration-700 group-hover:scale-110"
                      loading={index === 0 ? "eager" : "lazy"}
                      quality={90}
                    />

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">{template.description}</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setActivePreview(template)}
                            className="flex-1 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors duration-300"
                          >
                            Preview
                          </button>
                          <Link
                            href={getTemplateUrl(template)}
                            className="flex-1 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 text-center"
                            onClick={() => handleTemplateClick(template, 'use')}
                          >
                            Use This
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {template.isPopular && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          <Crown className="w-3 h-3 inline mr-1" />
                          Popular
                        </div>
                      )}
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-semibold text-gray-900">{template.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatNumber(template.downloads)}
                      </span>
                      <span className="px-3 py-1 bg-accent-50 text-accent-600 rounded-full text-xs font-semibold">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {templateData.length > (isMobile ? 1 : 3) && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all duration-300 z-10 group"
                aria-label="Previous templates"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-gray-900" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all duration-300 z-10 group"
                aria-label="Next templates"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-gray-900" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {templateData.slice(0, Math.min(10, templateData.length)).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${index === currentSlide
                ? 'w-8 h-2 bg-gradient-to-r from-primary to-accent'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          {templateData.length > 10 && (
            <span className="text-gray-400 text-sm ml-2">+{templateData.length - 10}</span>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Join <span className="font-bold text-gray-900">100,000+</span> professionals who chose our templates
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-full shadow-lg border-2 border-gray-100">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-700 text-sm sm:text-base">ATS-Optimized</span>
            </div>
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-full shadow-lg border-2 border-gray-100">
              <Crown className="w-5 h-5 text-accent-600" />
              <span className="font-semibold text-gray-700 text-sm sm:text-base">Expert-Designed</span>
            </div>
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-full shadow-lg border-2 border-gray-100">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-700 text-sm sm:text-base">Ready in Minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Preview Side */}
              <div>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={activePreview.previewImage?.split('?')[0]}
                    alt={activePreview.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Details Side */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{activePreview.name}</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{activePreview.rating}</span>
                    </div>
                    <div className="text-gray-500">|</div>
                    <div className="text-gray-600">{formatNumber(activePreview.downloads)} downloads</div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{activePreview.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Key Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TEMPLATE_FEATURES.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={getTemplateUrl(activePreview)}
                  className="block w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-bold hover:from-primary-600 hover:to-accent-600 transition-colors duration-300 text-center"
                  onClick={() => {
                    handleTemplateClick(activePreview, 'use_from_preview');
                    setActivePreview(null);
                  }}
                >
                  Use This Template
                  <ArrowRight className="w-5 h-5 inline ml-2" />
                </Link>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setActivePreview(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-300 shadow-lg"
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
