"use client";
import { useState, useEffect, useRef } from "react";
import { templates } from "../lib/templates";
import { useRouter } from "next/navigation";
import { event } from "../lib/gtag";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, ArrowRight, Crown } from "lucide-react";

export default function TemplateSlider() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const templateData = Object.entries(templates).map(([key, template]) => ({
    ...template,
    key,
  }));

  // Snap to center on scroll/arrow
  const scrollToIndex = (idx) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const card = carousel.children[idx];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  useEffect(() => {
    scrollToIndex(currentIndex);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") setCurrentIndex((i) => (i + 1) % templateData.length);
      if (e.key === "ArrowLeft") setCurrentIndex((i) => (i - 1 + templateData.length) % templateData.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [templateData.length]);

  const handleTemplateSelect = (key, isPremium, template) => {
    if (isPremium) {
      router.push("/pricing");
      return;
    }
    event({ action: "select_template", category: "TemplateShowcase", label: templates[key].name });
    
    // Redirect based on template category
    if (template.category === "One-Pager") {
      // For one-pager templates, use the templateId and navigate to one-pager editor
      router.push(`/one-pager-builder/editor?template=${template.templateId || key}`);
    } else if (template.category === "Job-Specific") {
      router.push(`/job-specific-resume-builder?template=${key}`);
    } else {
      router.push(`/resume-builder?template=${key}`);
    }
  };

  const nextSlide = () => setCurrentIndex((i) => (i + 1) % templateData.length);
  const prevSlide = () => setCurrentIndex((i) => (i - 1 + templateData.length) % templateData.length);

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Compact grid for desktop, slider for mobile */}
      <div className="hidden sm:grid grid-cols-3 gap-2 sm:gap-3">
        {templateData.slice(0, 6).map((template, idx) => (
          <div
            key={template.key}
            className="relative group transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => handleTemplateSelect(template.key, template.premium, template)}
          >
            {/* Compact badges */}
            {template.premium && (
              <span className="absolute top-1 left-1 z-20 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                <Crown size={8} className="inline mr-1" />Pro
              </span>
            )}
            {template.isPopular && (
              <span className="absolute top-1 right-1 z-20 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                <Star size={8} className="inline mr-1" />Hot
              </span>
            )}

            {/* Compact preview */}
                            <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white group-hover:shadow-lg transition-all duration-300">
              <Image
                src={`${template.previewImage}${template.previewImage.includes('?') ? '&' : '?'}v=2`}
                alt={template.name}
                fill
                sizes="(max-width: 640px) 100px, 150px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                quality={75}
                onError={(e) => {
                  // Fallback to original image if cache-busted version fails
                  e.target.src = template.previewImage;
                }}
              />
              
              {/* Premium overlay */}
              {template.premium && (
                <div className="absolute inset-0 bg-blue-600/50 flex items-center justify-center text-white z-10">
                  <div className="text-center">
                    <Crown className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs font-bold">Premium</div>
                  </div>
                </div>
              )}

              {/* Hover effect */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/90 text-gray-900 px-2 py-1 rounded text-xs font-medium">
                  Use Template
                </div>
              </div>
            </div>

            {/* Template name */}
            <div className="mt-1 sm:mt-2 text-center">
              <h4 className="text-xs font-medium text-white truncate">{template.name}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile slider */}
      <div className="sm:hidden">
        <div
          ref={carouselRef}
          className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-1 px-1"
          style={{ scrollBehavior: "smooth" }}
        >
          {templateData.slice(0, 6).map((template, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <div
                key={template.key}
                className={`relative flex-shrink-0 w-24 sm:w-32 snap-center group transition-all duration-300 cursor-pointer ${
                  isSelected ? "scale-105 z-10" : "scale-95 opacity-70 hover:opacity-90 hover:scale-100"
                }`}
                onClick={() => {
                  setCurrentIndex(idx);
                  handleTemplateSelect(template.key, template.premium, template);
                }}
              >
                {/* Mobile badges */}
                {template.premium && (
                  <span className="absolute top-0.5 left-0.5 z-20 bg-blue-500 text-white text-xs font-bold px-1 py-0.5 rounded-full shadow-md">
                    <Crown size={6} className="inline mr-0.5" />Pro
                  </span>
                )}
                {template.isPopular && (
                  <span className="absolute top-0.5 right-0.5 z-20 bg-blue-500 text-white text-xs font-bold px-1 py-0.5 rounded-full shadow-md">
                    <Star size={6} className="inline mr-0.5" />Hot
                  </span>
                )}

                <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-white group-hover:shadow-xl transition-all duration-300">
                  <Image
                    src={`${template.previewImage}${template.previewImage.includes('?') ? '&' : '?'}v=2`}
                    alt={template.name}
                    fill
                    sizes="100px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    quality={60}
                    onError={(e) => {
                      // Fallback to original image if cache-busted version fails
                      e.target.src = template.previewImage;
                    }}
                  />
                  
                  {template.premium && (
                    <div className="absolute inset-0 bg-blue-600/50 flex items-center justify-center text-white z-10">
                      <div className="text-center">
                        <Crown className="w-3 h-3 mx-auto mb-0.5" />
                        <div className="text-xs font-bold">Premium</div>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 text-gray-900 px-1.5 py-0.5 rounded text-xs font-medium">
                      Use
                    </div>
                  </div>
                </div>

                <div className="mt-1 text-center">
                  <h4 className="text-xs font-medium text-white truncate">{template.name}</h4>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile navigation */}
        <div className="flex justify-center items-center gap-3 mt-3">
          <button
            onClick={prevSlide}
            className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={12} />
          </button>
          
          <div className="flex gap-1">
            {templateData.slice(0, 6).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1 h-1 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white w-2" : "bg-white/40"
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Simple CTA */}
      <div className="text-center mt-3 sm:mt-4">
        <Link
          href="/templates"
          className="inline-flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-xs sm:text-sm font-medium transition-colors"
        >
          <span>View all templates</span>
          <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  );
}