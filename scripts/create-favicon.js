const fs = require('fs');
const path = require('path');

// Create a better favicon as SVG first, then we can convert
function createFaviconSVG() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="faviconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Background with slight rounded corners -->
  <rect width="32" height="32" rx="4" fill="url(#faviconGrad)"/>
  <!-- RG text with better positioning -->
  <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="12" style="letter-spacing: -0.5px;">RG</text>
</svg>`;
}

// Create an ICO-like data structure (simplified)
function createSimpleFavicon() {
  // Create a simple 16x16 bitmap data for ICO format
  // This is a basic implementation - for production, use proper ICO generation
  
  const faviconSVG = createFaviconSVG();
  
  // Save as SVG first
  const publicDir = path.join(__dirname, '../public');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);
  
  console.log('✅ Generated favicon.svg with RG text');
  console.log('📝 Note: Modern browsers support SVG favicons');
  console.log('🔧 For better compatibility, use an online SVG to ICO converter');
  
  return faviconSVG;
}

if (require.main === module) {
  createSimpleFavicon();
}

module.exports = { createSimpleFavicon }; 