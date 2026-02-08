"use client";
import Image from 'next/image';
import { useState } from 'react';

/**
 * Optimized Image Component for ExpertResume
 * 
 * Features:
 * - Automatic WebP/AVIF format selection
 * - Lazy loading by default
 * - Blur placeholder
 * - Automatic size optimization
 * - Loading state
 * 
 * Usage:
 * <OptimizedImage 
 *   src="/images/photo.jpg" 
 *   alt="Description" 
 *   width={800} 
 *   height={600}
 *   priority={false} // Set to true for above-the-fold images
 * />
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className = '',
  quality = 85,
  sizes,
  fill = false,
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div 
      className={`${isLoading ? 'animate-pulse bg-gray-200' : ''} ${className}`}
      style={fill ? {} : { width, height }}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(width || 700, height || 475))}`}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        onLoadingComplete={() => setIsLoading(false)}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
        {...props}
      />
    </div>
  );
}

// Shimmer effect for loading
const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="20%" />
      <stop stop-color="#f6f7f8" offset="40%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

