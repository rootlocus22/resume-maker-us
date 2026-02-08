'use client';

import Image from 'next/image';

/**
 * Optimized Feature Image Component
 * Uses AVIF + WebP + PNG fallback for maximum performance
 * Images are pre-optimized in /public/images/features/optimized/
 */
export default function OptimizedFeatureImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px',
  quality = 90,
  loading = 'lazy',
  ...rest
}) {
  // Convert original path to optimized versions
  const getOptimizedPath = (originalPath) => {
    if (!originalPath) return null;
    
    // Extract filename from path (e.g., "/images/features/ATS1.png" -> "ATS1")
    const filename = originalPath.split('/').pop().replace(/\s+/g, '-').replace(/\.(png|jpe?g)$/i, '');
    const basePath = '/images/features/optimized';
    
    return {
      avif: `${basePath}/${filename}.avif`,
      webp: `${basePath}/${filename}.webp`,
      fallback: originalPath // Keep original as fallback
    };
  };

  const paths = getOptimizedPath(src);
  
  if (!paths) {
    return null;
  }

  // For next/image fill mode
  if (fill) {
    return (
      <picture>
        <source srcSet={paths.avif} type="image/avif" />
        <source srcSet={paths.webp} type="image/webp" />
        <Image
          src={paths.fallback}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          quality={quality}
          priority={priority}
          loading={loading}
          {...rest}
        />
      </picture>
    );
  }

  // For fixed dimensions
  return (
    <picture>
      <source srcSet={paths.avif} type="image/avif" />
      <source srcSet={paths.webp} type="image/webp" />
      <Image
        src={paths.fallback}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={loading}
        {...rest}
      />
    </picture>
  );
}

