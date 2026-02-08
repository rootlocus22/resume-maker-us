#!/usr/bin/env node

/**
 * Script to generate accurate ATS template previews for the main templates
 * This ensures the preview images match exactly what customers will see
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Sample resume data that will be used in all templates
const sampleResumeData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  address: "San Francisco, CA",
  linkedin: "linkedin.com/in/sarahjohnson",
  website: "sarahjohnson.dev",
  jobTitle: "Senior Software Engineer",
  summary: "Experienced software engineer with 5+ years developing scalable web applications. Proven track record of leading development teams and delivering high-quality software solutions. Expertise in React, Node.js, and cloud technologies with a focus on performance optimization and user experience.",
  experience: [
    {
      jobTitle: "Senior Software Engineer",
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      startDate: "2022",
      endDate: "Present",
      description: "Lead development of enterprise web applications using React and Node.js. Manage team of 4 developers and coordinate with product managers. Improved application performance by 40% through optimization techniques."
    },
    {
      jobTitle: "Software Engineer",
      title: "Software Engineer",
      company: "StartupXYZ",
      startDate: "2020",
      endDate: "2022",
      description: "Developed full-stack web applications using modern JavaScript frameworks. Collaborated with design team to implement responsive UI components. Reduced bug reports by 30% through improved testing practices."
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      startDate: "2015",
      endDate: "2019",
      description: "Graduated with honors. Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems."
    }
  ],
  skills: [
    { name: "JavaScript", proficiency: "Expert" },
    { name: "React", proficiency: "Expert" },
    { name: "Node.js", proficiency: "Advanced" },
    { name: "Python", proficiency: "Advanced" },
    { name: "SQL", proficiency: "Advanced" },
    { name: "AWS", proficiency: "Intermediate" }
  ],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Spanish", proficiency: "Intermediate" }
  ],
  certifications: [
    {
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2023"
    },
    {
      name: "React Developer Certification",
      issuer: "Meta",
      date: "2022"
    }
  ]
};

// Main ATS template configurations - focusing on the most popular ones
const mainAtsTemplates = {
  ats_classic_standard: {
    name: "ATS Classic Standard",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "standard",
      spacing: "standard",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      }
    }
  },
  ats_classic_professional: {
    name: "ATS Classic Professional",
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "skills", "experience", "education", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "professional",
      spacing: "comfortable",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#000000",
        secondary: "#444444",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      }
    }
  },
  ats_creative_designer: {
    name: "ATS Creative Designer",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications", "projects"],
      sidebarSections: ["skills", "languages", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "creative",
      spacing: "creative",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#ec4899",
        text: "#1f2937",
        background: "#ffffff"
      }
    }
  },
  ats_data_scientist: {
    name: "ATS Data Scientist",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications"],
      sidebarSections: ["skills", "languages", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "data-scientist",
      spacing: "modern",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#059669",
        secondary: "#047857",
        accent: "#10b981",
        text: "#1f2937",
        background: "#ffffff"
      }
    }
  },
  ats_two_column_executive: {
    name: "ATS Two-Column Executive",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "executive-two-column",
      spacing: "comfortable",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1f2937",
        secondary: "#374151",
        accent: "#6b7280",
        text: "#1f2937",
        background: "#ffffff"
      }
    }
  },
  ats_hr_specialist: {
    name: "ATS HR Specialist",
    layout: { headerStyle: "hr", columns: 1, sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"] },
    styles: { fontFamily: "'Times New Roman', serif", fontSize: "12pt", lineHeight: "1.6" }
  }
};

// Generate HTML that mimics the ATSResumeRenderer component
function generateAccurateResumeHTML(templateKey, template) {
  const { layout, styles } = template;
  const data = sampleResumeData;
  
  // Generate header based on header style
  const header = generateAccurateHeader(layout.headerStyle, data, styles);
  
  // Generate sections
  const sections = layout.sectionsOrder.map(section => generateAccurateSection(section, data, styles)).join('');
  
  // Generate layout
  let layoutHTML;
  if (layout.columns === 1) {
    layoutHTML = `<div style="width:100%;padding:2rem;background-color:${styles.colors.background};font-family:${styles.fontFamily};color:${styles.colors.text};line-height:${styles.lineHeight};font-size:${styles.fontSize};">
      ${header}
      ${sections}
    </div>`;
  } else {
    const sidebarContent = layout.sidebarSections.map(section => generateAccurateSection(section, data, styles)).join('');
    const mainContent = layout.mainSections.map(section => generateAccurateSection(section, data, styles)).join('');
    
    const sidebarWidth = layout.sidebarWidth || "30%";
    const mainWidth = `${100 - parseInt(sidebarWidth)}%`;
    
    layoutHTML = `<div style="width:100%;padding:2rem;background-color:${styles.colors.background};font-family:${styles.fontFamily};color:${styles.colors.text};line-height:${styles.lineHeight};font-size:${styles.fontSize};">
      ${header}
      <div style="display:grid;grid-template-columns:${sidebarWidth} ${mainWidth};gap:1.5rem;align-items:start;">
        <div style="background-color:${styles.colors.sidebarBackground || '#f8fafc'};padding:1.5rem;border-radius:8px;border:1px solid #e5e7eb;">
          ${sidebarContent}
        </div>
        <div style="padding-top:1.5rem;">
          ${mainContent}
        </div>
      </div>
    </div>`;
  }
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      font-family: ${styles.fontFamily}; 
      background-color: ${styles.colors.background};
    }
    * { box-sizing: border-box; }
    .resume-preview {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="resume-preview">
    ${layoutHTML}
  </div>
</body>
</html>`;
}

function generateAccurateHeader(headerStyle, data, styles) {
  if (headerStyle === "creative") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid #d1d5db;padding-bottom:1rem;text-align:center;">
      <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;color:${styles.colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name}</h1>
      <p style="font-size:1.125rem;margin-bottom:0.75rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle}</p>
      <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${styles.colors.accent};font-family:${styles.fontFamily};">
        <span>${data.email}</span><span>•</span><span>${data.phone}</span><span>•</span><span>${data.address}</span>
      </div>
    </header>`;
  }
  
  if (headerStyle === "data-scientist") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid #d1d5db;padding-bottom:1rem;text-align:center;">
      <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;color:${styles.colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name}</h1>
      <p style="font-size:1.125rem;margin-bottom:0.75rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle}</p>
      <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${styles.colors.accent};font-family:${styles.fontFamily};">
        <span>${data.email}</span><span>•</span><span>${data.phone}</span><span>•</span><span>${data.address}</span>
      </div>
    </header>`;
  }
  
  if (headerStyle === "executive-two-column") {
    return `<header style="margin-bottom:1.5rem;">
      <div style="display:flex;align-items:flex-start;gap:1.5rem;">
        <div style="flex-shrink:0;">
          <div style="width:6rem;height:6rem;background-color:#e5e7eb;border:2px solid #d1d5db;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:0.75rem;font-family:${styles.fontFamily};">
            Profile Photo
          </div>
        </div>
        <div style="flex:1;">
          <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;color:${styles.colors.primary};font-family:${styles.fontFamily};line-height:1.1;text-transform:uppercase;letter-spacing:0.05em;">${data.name}</h1>
          <p style="font-size:1.125rem;font-weight:600;margin-bottom:0.75rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};line-height:1.1;text-transform:uppercase;letter-spacing:0.05em;">${data.jobTitle}</p>
        </div>
      </div>
    </header>`;
  }
  
  // Default header
  return `<header style="margin-bottom:1.5rem;border-bottom:2px solid #d1d5db;padding-bottom:1rem;text-align:center;">
    <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;color:${styles.colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name}</h1>
    <p style="font-size:1.125rem;margin-bottom:0.75rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle}</p>
    <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${styles.colors.accent};font-family:${styles.fontFamily};">
      <span>${data.email}</span><span>•</span><span>${data.phone}</span><span>•</span><span>${data.address}</span>
    </div>
  </header>`;
}

function generateAccurateSection(section, data, styles) {
  switch (section) {
    case 'personal':
      return ''; // Already handled in header
      
    case 'summary':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:1px solid #d1d5db;text-transform:uppercase;letter-spacing:0.05em;color:${styles.colors.primary};font-family:${styles.fontFamily};">SUMMARY</h2>
        <p style="margin:0;color:${styles.colors.text};font-family:${styles.fontFamily};font-size:0.875rem;line-height:${styles.lineHeight};">${data.summary}</p>
      </section>`;
      
    case 'experience':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:1px solid #d1d5db;text-transform:uppercase;letter-spacing:0.05em;color:${styles.colors.primary};font-family:${styles.fontFamily};">WORK EXPERIENCE</h2>
        <div style="space-y:1rem;">
          ${data.experience.map(exp => `
            <div style="margin-bottom:1rem;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
                <h3 style="font-size:1.125rem;font-weight:600;margin:0;color:${styles.colors.primary};font-family:${styles.fontFamily};">${exp.jobTitle}</h3>
                <span style="font-size:0.75rem;color:${styles.colors.accent};font-family:${styles.fontFamily};">${exp.startDate} - ${exp.endDate}</span>
              </div>
              <p style="font-size:1rem;font-weight:500;margin-bottom:0.5rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};">${exp.company}</p>
              <p style="font-size:0.875rem;line-height:${styles.lineHeight};margin:0;color:${styles.colors.text};font-family:${styles.fontFamily};">${exp.description}</p>
            </div>
          `).join('')}
        </div>
      </section>`;
      
    case 'education':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:1px solid #d1d5db;text-transform:uppercase;letter-spacing:0.05em;color:${styles.colors.primary};font-family:${styles.fontFamily};">EDUCATION</h2>
        <div style="space-y:1rem;">
          ${data.education.map(edu => `
            <div style="margin-bottom:1rem;">
              <h3 style="font-size:1.125rem;font-weight:600;margin-bottom:0.25rem;color:${styles.colors.primary};font-family:${styles.fontFamily};">${edu.degree}</h3>
              <p style="font-size:1rem;font-weight:500;margin-bottom:0.25rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};">${edu.school}</p>
              <p style="font-size:0.75rem;margin-bottom:0.25rem;color:${styles.colors.accent};font-family:${styles.fontFamily};">${edu.startDate} - ${edu.endDate}</p>
              <p style="font-size:0.875rem;margin:0;color:${styles.colors.text};font-family:${styles.fontFamily};">${edu.description}</p>
            </div>
          `).join('')}
        </div>
      </section>`;
      
    case 'skills':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:1px solid #d1d5db;text-transform:uppercase;letter-spacing:0.05em;color:${styles.colors.primary};font-family:${styles.fontFamily};">SKILLS</h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
          ${data.skills.map(skill => `
            <span style="padding:0.25rem 0.75rem;background-color:${styles.colors.primary}20;color:${styles.colors.primary};border-radius:1rem;font-size:0.875rem;font-family:${styles.fontFamily};">${skill.name}</span>
          `).join('')}
        </div>
      </section>`;
      
    case 'languages':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:1px solid #d1d5db;text-transform:uppercase;letter-spacing:0.05em;color:${styles.colors.primary};font-family:${styles.fontFamily};">LANGUAGES</h2>
        <div style="space-y:0.5rem;">
          ${data.languages.map(lang => `
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:0.875rem;color:${styles.colors.text};font-family:${styles.fontFamily};">${lang.language}</span>
              <span style="font-size:0.75rem;color:${styles.colors.accent};font-family:${styles.fontFamily};">(${lang.proficiency})</span>
            </div>
          `).join('')}
        </div>
      </section>`;
      
    case 'certifications':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:1px solid #d1d5db;text-transform:uppercase;letter-spacing:0.05em;color:${styles.colors.primary};font-family:${styles.fontFamily};">CERTIFICATIONS</h2>
        <div style="space-y:0.5rem;">
          ${data.certifications.map(cert => `
            <div style="margin-bottom:0.5rem;">
              <h3 style="font-size:1rem;font-weight:600;margin-bottom:0.25rem;color:${styles.colors.primary};font-family:${styles.fontFamily};">${cert.name}</h3>
              <p style="font-size:0.875rem;margin:0;color:${styles.colors.text};font-family:${styles.fontFamily};">${cert.issuer} • ${cert.date}</p>
            </div>
          `).join('')}
        </div>
      </section>`;
      
    default:
      return '';
  }
}

async function generateMainAtsPreviews() {
  console.log('🚀 Generating Accurate Main ATS Template Previews...\n');
  console.log('📋 This script will generate previews that match exactly what customers see\n');
  console.log('🎯 Focusing on the 5 most popular ATS templates\n');
  
  // Check if previews directory exists
  const previewsDir = path.join(__dirname, '..', 'public', 'templates', 'previews');
  if (!fs.existsSync(previewsDir)) {
    fs.mkdirSync(previewsDir, { recursive: true });
  }

  // Launch browser
  console.log('🌐 Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent image dimensions - optimized for template previews
    await page.setViewport({
      width: 800,
      height: 1200, // Increased height to prevent cutoff
      deviceScaleFactor: 2
    });

    console.log('📱 Set viewport to 800x1200 with 2x device scale factor\n');
    console.log('📏 This should prevent head and bottom cutoff issues\n');

    let successCount = 0;
    let errorCount = 0;

    // Process each template
    for (const [templateKey, template] of Object.entries(mainAtsTemplates)) {
      try {
        console.log(`🔄 Generating accurate preview for: ${template.name}...`);
        
        // Generate accurate resume HTML that matches ATSResumeRenderer
        const htmlContent = generateAccurateResumeHTML(templateKey, template);
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Wait for content to render and ensure proper layout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Take screenshot with full page to prevent cutoff
        const pngPath = path.join(previewsDir, `${templateKey}.png`);
        await page.screenshot({
          path: pngPath,
          type: 'png',
          fullPage: true
        });

        console.log(`✅ Successfully generated: ${template.name}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error generating ${template.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Accurate Preview Generation Complete!');
    console.log(`✅ Successfully generated: ${successCount} accurate previews`);
    if (errorCount > 0) {
      console.log(`❌ Failed generations: ${errorCount} templates`);
    }
    console.log(`📁 PNG files saved in: ${previewsDir}`);
    console.log('\n💡 These previews should now match exactly what customers see when using the templates!');
    console.log('\n🔧 Next steps:');
    console.log('   1. Test the templates in the resume builder');
    console.log('   2. Verify the preview images match the rendered content');
    console.log('   3. Run this script again if you need to regenerate any previews');

  } catch (error) {
    console.error('❌ Fatal error during generation:', error);
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

// Run the generation
generateMainAtsPreviews().catch(console.error);
