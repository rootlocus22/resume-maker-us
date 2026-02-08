"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FeatureScreenshotCarousel({ screenshots, autoRotate = true }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    if (!autoRotate || screenshots.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % screenshots.length;
        console.log(`Screenshot carousel: moving from ${prev} to ${next} of ${screenshots.length}`);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRotate, screenshots.length]);

  const handleImageError = (index, url) => {
    console.error(`Failed to load image at index ${index}: ${url}`);
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  if (screenshots.length === 1) {
    // Single image display
    return (
      <div className="relative w-full h-full">
        {imageErrors[0] ? (
          <div className="flex items-center justify-center h-full text-red-500 text-sm">
            Failed to load image
          </div>
        ) : (
          <Image
            src={screenshots[0].url}
            alt={screenshots[0].alt}
            fill
            className="object-contain object-center"
            sizes="(max-width: 768px) 100vw, 600px"
            priority
            onError={() => handleImageError(0, screenshots[0].url)}
          />
        )}
      </div>
    );
  }

  // Multi-image carousel
  return (
    <div className="relative w-full h-full bg-white">
      {/* Main Image Display */}
      <div className="relative w-full h-full">
        {screenshots.map((screenshot, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {imageErrors[index] ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500 text-sm gap-2">
                <p>Failed to load step {index + 1}</p>
                <p className="text-xs text-gray-500">{screenshot.url}</p>
              </div>
            ) : (
              <Image
                src={screenshot.url}
                alt={screenshot.alt}
                fill
                className="object-contain object-center"
                sizes="(max-width: 768px) 100vw, 700px"
                priority={index === 0}
                onError={() => handleImageError(index, screenshot.url)}
                onLoad={() => console.log(`Successfully loaded: ${screenshot.url}`)}
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            )}
          </div>
        ))}

      </div>

      {/* Navigation Arrows */}
      {screenshots.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-20"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-20"
            aria-label="Next screenshot"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Step Indicator */}
      {screenshots.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full z-20 shadow-lg">
          <span className="text-white text-sm font-bold">
            Step {currentIndex + 1} of {screenshots.length}
          </span>
        </div>
      )}

      {/* Dots Navigation */}
      {screenshots.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {screenshots.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-6 bg-white shadow-lg' 
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to screenshot ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

