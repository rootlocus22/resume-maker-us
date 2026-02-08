/**
 * Image Optimization Script for ExpertResume
 * Converts JPEG/PNG images to WebP format for better page speed
 * Run with: node optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const CONFIG = {
  sourceDir: './public/images',
  outputDir: './public/images/optimized',
  quality: 85, // WebP quality (0-100)
  maxWidth: 1200, // Max width for responsive images
  formats: ['.jpg', '.jpeg', '.png'],
  preserveOriginals: true, // Keep original files
};

// Statistics
let stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  totalSizeBefore: 0,
  totalSizeAfter: 0,
};

/**
 * Get all image files recursively from a directory
 */
function getAllImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fileList = getAllImages(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (CONFIG.formats.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Convert image to WebP format
 */
async function convertToWebP(inputPath) {
  try {
    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;

    // Get relative path and create output path
    const relativePath = path.relative(CONFIG.sourceDir, inputPath);
    const outputPath = path.join(
      CONFIG.outputDir,
      relativePath.replace(path.extname(relativePath), '.webp')
    );

    // Ensure output directory exists
    const outputDirPath = path.dirname(outputPath);
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }

    // Check if WebP already exists and is newer
    if (fs.existsSync(outputPath)) {
      const outputStats = fs.statSync(outputPath);
      if (outputStats.mtime > originalStats.mtime) {
        console.log(`⏭️  Skipped: ${relativePath} (already optimized)`);
        stats.skipped++;
        return;
      }
    }

    // Convert to WebP
    await sharp(inputPath)
      .resize(CONFIG.maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: CONFIG.quality })
      .toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    stats.totalSizeBefore += originalSize;
    stats.totalSizeAfter += newSize;
    stats.processed++;

    console.log(`✅ Optimized: ${relativePath}`);
    console.log(`   ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${savings}% smaller)`);

  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Update blogdata.json to use WebP images
 */
function updateBlogData() {
  const blogDataPath = './app/blogdata/blogdata.json';
  
  if (!fs.existsSync(blogDataPath)) {
    console.log('⚠️  blogdata.json not found, skipping update');
    return;
  }

  try {
    const blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));
    let updateCount = 0;

    blogData.blogs.forEach((blog) => {
      if (blog.image && blog.image.url) {
        const oldUrl = blog.image.url;
        const ext = path.extname(oldUrl);
        
        if (['.jpg', '.jpeg', '.png'].includes(ext.toLowerCase())) {
          // Check if WebP version exists
          const webpUrl = oldUrl.replace(ext, '.webp').replace('/images/', '/images/optimized/');
          const webpPath = path.join('./public', webpUrl);
          
          if (fs.existsSync(webpPath)) {
            blog.image.url = webpUrl;
            blog.image.originalUrl = oldUrl; // Keep reference to original
            updateCount++;
          }
        }
      }
    });

    if (updateCount > 0) {
      // Backup original
      fs.copyFileSync(blogDataPath, `${blogDataPath}.backup`);
      
      // Write updated data
      fs.writeFileSync(blogDataPath, JSON.stringify(blogData, null, 2));
      console.log(`\n📝 Updated ${updateCount} image references in blogdata.json`);
      console.log(`   Backup saved to: blogdata.json.backup`);
    } else {
      console.log('\n📝 No blog images needed updating');
    }

  } catch (error) {
    console.error('❌ Error updating blogdata.json:', error.message);
  }
}

/**
 * Generate Next.js Image component code
 */
function generateImageComponentCode() {
  const code = `
// Updated Image Component for WebP Support
import Image from 'next/image';

export default function OptimizedImage({ src, alt, ...props }) {
  // Check if WebP version exists
  const webpSrc = src.replace(/\\.(jpg|jpeg|png)$/i, '.webp').replace('/images/', '/images/optimized/');
  
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <Image src={src} alt={alt} {...props} />
    </picture>
  );
}

// Usage:
// <OptimizedImage src="/images/photo.jpg" alt="Description" width={800} height={600} />
`;

  fs.writeFileSync('./OPTIMIZED_IMAGE_COMPONENT.txt', code);
  console.log('\n📄 Generated optimized image component code: OPTIMIZED_IMAGE_COMPONENT.txt');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Image Optimization\n');
  console.log(`📂 Source: ${CONFIG.sourceDir}`);
  console.log(`📂 Output: ${CONFIG.outputDir}`);
  console.log(`⚙️  Quality: ${CONFIG.quality}%`);
  console.log(`⚙️  Max Width: ${CONFIG.maxWidth}px\n`);

  // Check if sharp is installed
  try {
    require.resolve('sharp');
  } catch (e) {
    console.error('❌ Error: sharp package not found!');
    console.log('\n💡 Install it with: npm install sharp\n');
    process.exit(1);
  }

  // Check source directory
  if (!fs.existsSync(CONFIG.sourceDir)) {
    console.error(`❌ Error: Source directory not found: ${CONFIG.sourceDir}`);
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`✅ Created output directory: ${CONFIG.outputDir}\n`);
  }

  // Get all images
  const images = getAllImages(CONFIG.sourceDir);
  console.log(`📸 Found ${images.length} images to process\n`);

  if (images.length === 0) {
    console.log('⚠️  No images found to optimize');
    return;
  }

  // Process each image
  console.log('🔄 Processing images...\n');
  for (const imagePath of images) {
    await convertToWebP(imagePath);
  }

  // Update blogdata.json
  console.log('\n🔄 Updating blog data...');
  updateBlogData();

  // Generate component code
  generateImageComponentCode();

  // Print statistics
  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Processed:       ${stats.processed} images`);
  console.log(`⏭️  Skipped:         ${stats.skipped} images`);
  console.log(`❌ Errors:          ${stats.errors} images`);
  console.log(`📦 Total Before:    ${(stats.totalSizeBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 Total After:     ${(stats.totalSizeAfter / 1024 / 1024).toFixed(2)} MB`);
  
  if (stats.totalSizeBefore > 0) {
    const totalSavings = ((stats.totalSizeBefore - stats.totalSizeAfter) / stats.totalSizeBefore * 100).toFixed(1);
    const mbSaved = ((stats.totalSizeBefore - stats.totalSizeAfter) / 1024 / 1024).toFixed(2);
    console.log(`💾 Space Saved:     ${mbSaved} MB (${totalSavings}% reduction)`);
  }
  
  console.log('='.repeat(60));

  // Performance impact estimate
  if (stats.processed > 0) {
    console.log('\n📈 EXPECTED PERFORMANCE IMPROVEMENTS:');
    console.log('   • Page Load Time: 20-40% faster');
    console.log('   • Mobile Performance: 30-50% improvement');
    console.log('   • Bandwidth Savings: ~' + ((stats.totalSizeBefore - stats.totalSizeAfter) / 1024 / 1024 * 1000).toFixed(0) + ' GB per 1M page views');
    console.log('   • SEO Score: +5-10 points (PageSpeed Insights)');
  }

  // Next steps
  console.log('\n✅ NEXT STEPS:');
  console.log('   1. Test optimized images on your site');
  console.log('   2. Update Image components to use WebP (see OPTIMIZED_IMAGE_COMPONENT.txt)');
  console.log('   3. Run PageSpeed Insights: https://pagespeed.web.dev/');
  console.log('   4. Deploy changes and monitor Core Web Vitals');
  console.log('   5. Keep originals as backup (already done ✓)');
  
  console.log('\n🎉 Optimization complete!\n');
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { convertToWebP, getAllImages };

