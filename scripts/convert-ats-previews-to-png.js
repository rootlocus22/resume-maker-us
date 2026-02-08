#!/usr/bin/env node

/**
 * Script to convert ATS template HTML previews to PNG images using Puppeteer
 * This automates the conversion process for all template previews
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ATS template names
const atsTemplates = [
  'ats_classic_standard',
  'ats_classic_professional',
  'ats_modern_clean',
  'ats_modern_executive',
  'ats_two_column_standard',
  'ats_two_column_professional',
  'ats_tech_engineer',
  'ats_finance_analyst',
  'ats_healthcare_professional',
  'ats_marketing_specialist',
  'ats_entry_level_standard',
  'ats_c_level_executive',
  'ats_mechanical_engineer',
  'ats_sales_professional',
  'ats_hr_specialist',
  'ats_data_scientist',
  'ats_creative_designer'
];

// Template display names for logging
const templateNames = {
  'ats_classic_standard': 'ATS Classic Standard',
  'ats_classic_professional': 'ATS Classic Professional',
  'ats_modern_clean': 'ATS Modern Clean',
  'ats_modern_executive': 'ATS Modern Executive',
  'ats_two_column_standard': 'ATS Two-Column Standard',
  'ats_two_column_professional': 'ATS Two-Column Professional',
  'ats_tech_engineer': 'ATS Tech Engineer',
  'ats_finance_analyst': 'ATS Finance Analyst',
  'ats_healthcare_professional': 'ATS Healthcare Professional',
  'ats_marketing_specialist': 'ATS Marketing Specialist',
  'ats_entry_level_standard': 'ATS Entry Level Standard',
  'ats_c_level_executive': 'ATS C-Level Executive',
  'ats_mechanical_engineer': 'ATS Mechanical Engineer',
  'ats_sales_professional': 'ATS Sales Professional',
  'ats_hr_specialist': 'ATS HR Specialist',
  'ats_data_scientist': 'ATS Data Scientist',
  'ats_creative_designer': 'ATS Creative Designer'
};

async function convertHTMLToPNG() {
  console.log('🚀 Starting ATS Template Preview Conversion to PNG...\n');
  
  // Check if previews directory exists
  const previewsDir = path.join(__dirname, '..', 'public', 'templates', 'previews');
  if (!fs.existsSync(previewsDir)) {
    console.error('❌ Previews directory not found:', previewsDir);
    console.log('Please run the generate-ats-previews.js script first.');
    return;
  }

  // Launch browser
  console.log('🌐 Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent image dimensions
    await page.setViewport({
      width: 800,
      height: 600,
      deviceScaleFactor: 2 // Higher resolution
    });

    console.log('📱 Set viewport to 800x600 with 2x device scale factor\n');

    let successCount = 0;
    let errorCount = 0;

    // Process each template
    for (const templateKey of atsTemplates) {
      const htmlPath = path.join(previewsDir, `${templateKey}.html`);
      const pngPath = path.join(previewsDir, `${templateKey}.png`);
      
      if (!fs.existsSync(htmlPath)) {
        console.log(`⚠️  Skipping ${templateNames[templateKey]}: HTML file not found`);
        continue;
      }

      try {
        console.log(`🔄 Converting: ${templateNames[templateKey]}...`);
        
        // Load the HTML file
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Wait a bit for any dynamic content to render
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Take screenshot
        await page.screenshot({
          path: pngPath,
          type: 'png',
          fullPage: true
        });

        console.log(`✅ Successfully converted: ${templateNames[templateKey]}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error converting ${templateNames[templateKey]}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Conversion Complete!');
    console.log(`✅ Successfully converted: ${successCount} templates`);
    if (errorCount > 0) {
      console.log(`❌ Failed conversions: ${errorCount} templates`);
    }
    console.log(`📁 PNG files saved in: ${previewsDir}`);

  } catch (error) {
    console.error('❌ Fatal error during conversion:', error);
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

// Check if Puppeteer is available
try {
  require.resolve('puppeteer');
} catch (error) {
  console.error('❌ Puppeteer is not installed. Please install it first:');
  console.log('npm install puppeteer');
  process.exit(1);
}

// Run the conversion
convertHTMLToPNG().catch(console.error);
