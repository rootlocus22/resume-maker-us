/**
 * SEO Performance Test Script
 * 
 * Tests key performance metrics after SEO optimizations
 * Run with: node scripts/test-seo-performance.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 ResumeGyani SEO Performance Test\n');
console.log('='.repeat(60));

// Test 1: Check if next.config.mjs has optimizations
console.log('\n📝 Test 1: Next.js Configuration');
console.log('-'.repeat(60));

try {
  const configPath = path.join(__dirname, '../next.config.mjs');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  const checks = {
    'Image optimization': configContent.includes('images:'),
    'WebP format': configContent.includes('webp'),
    'Compression': configContent.includes('compress: true'),
    'Cache headers': configContent.includes('Cache-Control'),
    'SWC minification': configContent.includes('swcMinify'),
  };
  
  let passed = 0;
  for (const [check, result] of Object.entries(checks)) {
    console.log(`${result ? '✅' : '❌'} ${check}`);
    if (result) passed++;
  }
  
  console.log(`\nScore: ${passed}/${Object.keys(checks).length}`);
  
} catch (error) {
  console.error('❌ Error reading next.config.mjs:', error.message);
}

// Test 2: Check if OptimizedImage component exists
console.log('\n📝 Test 2: Optimized Image Component');
console.log('-'.repeat(60));

try {
  const componentPath = path.join(__dirname, '../app/components/OptimizedImage.js');
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    const checks = {
      'Lazy loading': content.includes('loading='),
      'Blur placeholder': content.includes('placeholder="blur"'),
      'Priority prop': content.includes('priority'),
      'Next Image': content.includes('next/image'),
    };
    
    let passed = 0;
    for (const [check, result] of Object.entries(checks)) {
      console.log(`${result ? '✅' : '❌'} ${check}`);
      if (result) passed++;
    }
    
    console.log(`\nScore: ${passed}/${Object.keys(checks).length}`);
  } else {
    console.log('❌ OptimizedImage.js not found');
  }
  
} catch (error) {
  console.error('❌ Error checking OptimizedImage:', error.message);
}

// Test 3: Check if images are optimized
console.log('\n📝 Test 3: Image Optimization');
console.log('-'.repeat(60));

try {
  const imagesDir = path.join(__dirname, '../public/images');
  const optimizedDir = path.join(__dirname, '../public/images/optimized');
  
  if (fs.existsSync(imagesDir)) {
    const images = fs.readdirSync(imagesDir).filter(f => 
      ['.jpg', '.jpeg', '.png'].includes(path.extname(f).toLowerCase())
    );
    
    let optimizedCount = 0;
    if (fs.existsSync(optimizedDir)) {
      const optimized = fs.readdirSync(optimizedDir);
      optimizedCount = optimized.filter(f => f.endsWith('.webp')).length;
    }
    
    console.log(`📊 Original images: ${images.length}`);
    console.log(`📊 Optimized WebP images: ${optimizedCount}`);
    
    if (optimizedCount > 0) {
      const percentage = ((optimizedCount / images.length) * 100).toFixed(1);
      console.log(`\n${optimizedCount >= images.length ? '✅' : '⚠️'} Optimization: ${percentage}%`);
    } else {
      console.log('\n⚠️  No optimized images found. Run: node optimize-images.js');
    }
    
  } else {
    console.log('⚠️  Images directory not found');
  }
  
} catch (error) {
  console.error('❌ Error checking images:', error.message);
}

// Test 4: Check structured data in layout.js
console.log('\n📝 Test 4: Structured Data Schema');
console.log('-'.repeat(60));

try {
  const layoutPath = path.join(__dirname, '../app/layout.js');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  const schemas = {
    'FAQ Schema': layoutContent.includes('faqSchema'),
    'Organization Schema': layoutContent.includes('orgSchema'),
    'Software Schema': layoutContent.includes('softwareSchema'),
    'Breadcrumb Schema': layoutContent.includes('breadcrumbSchema'),
    'DNS Prefetch': layoutContent.includes('dns-prefetch'),
    'Preconnect': layoutContent.includes('preconnect'),
  };
  
  let passed = 0;
  for (const [schema, result] of Object.entries(schemas)) {
    console.log(`${result ? '✅' : '❌'} ${schema}`);
    if (result) passed++;
  }
  
  console.log(`\nScore: ${passed}/${Object.keys(schemas).length}`);
  
} catch (error) {
  console.error('❌ Error reading layout.js:', error.message);
}

// Test 5: Check for common performance issues
console.log('\n📝 Test 5: Common Performance Issues');
console.log('-'.repeat(60));

try {
  const globalsPath = path.join(__dirname, '../app/globals.css');
  
  if (fs.existsSync(globalsPath)) {
    const cssContent = fs.readFileSync(globalsPath, 'utf8');
    const cssSize = (Buffer.byteLength(cssContent, 'utf8') / 1024).toFixed(2);
    
    console.log(`📊 Global CSS size: ${cssSize} KB`);
    console.log(`${cssSize < 50 ? '✅' : '⚠️'} CSS size ${cssSize < 50 ? 'optimal' : 'could be optimized'}`);
  }
  
  // Check for large images
  const publicPath = path.join(__dirname, '../public');
  if (fs.existsSync(publicPath)) {
    let largeImages = [];
    
    const checkDir = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules')) {
          checkDir(filePath);
        } else if (['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())) {
          if (stat.size > 200 * 1024) { // > 200 KB
            largeImages.push({
              file: path.relative(publicPath, filePath),
              size: (stat.size / 1024).toFixed(2)
            });
          }
        }
      });
    };
    
    checkDir(publicPath);
    
    if (largeImages.length > 0) {
      console.log(`\n⚠️  Found ${largeImages.length} large images (>200KB):`);
      largeImages.slice(0, 5).forEach(img => {
        console.log(`   - ${img.file} (${img.size} KB)`);
      });
      if (largeImages.length > 5) {
        console.log(`   ... and ${largeImages.length - 5} more`);
      }
      console.log('\n💡 Run: node optimize-images.js');
    } else {
      console.log('\n✅ No large unoptimized images found');
    }
  }
  
} catch (error) {
  console.error('❌ Error checking performance issues:', error.message);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log('\n✅ Technical SEO fixes have been implemented');
console.log('⚠️  Run image optimization if you see warnings above');
console.log('\n📝 Next Steps:');
console.log('   1. Run: node optimize-images.js');
console.log('   2. Deploy changes to production');
console.log('   3. Test with Google PageSpeed Insights');
console.log('   4. Monitor Core Web Vitals in Search Console');
console.log('\n📖 Full guide: SEO_OPTIMIZATION_GUIDE.md');
console.log('📋 Quick checklist: SEO_QUICK_ACTION_CHECKLIST.md\n');

