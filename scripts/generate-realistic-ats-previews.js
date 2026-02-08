#!/usr/bin/env node

/**
 * Script to generate realistic ATS template previews with sample resume data
 * This shows customers exactly how the templates will look when filled with content
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Sample resume data that will be used in all templates
const sampleResumeData = {
  personal: {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    address: "San Francisco, CA",
    linkedin: "linkedin.com/in/sarahjohnson",
    portfolio: "sarahjohnson.dev"
  },
  summary: "Experienced software engineer with 5+ years developing scalable web applications. Proven track record of leading development teams and delivering high-quality software solutions. Expertise in React, Node.js, and cloud technologies with a focus on performance optimization and user experience.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      startDate: "2022",
      endDate: "Present",
      description: "Lead development of enterprise web applications using React and Node.js. Manage team of 4 developers and coordinate with product managers. Improved application performance by 40% through optimization techniques."
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      startDate: "2020",
      endDate: "2022",
      description: "Developed full-stack web applications using modern JavaScript frameworks. Collaborated with design team to implement responsive UI components. Reduced bug reports by 30% through improved testing practices."
    },
    {
      title: "Junior Developer",
      company: "Digital Solutions",
      startDate: "2019",
      endDate: "2020",
      description: "Built and maintained client websites using HTML, CSS, and JavaScript. Assisted senior developers with debugging and code reviews. Implemented responsive design principles across all projects."
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
    { name: "JavaScript", level: "Expert" },
    { name: "React", level: "Expert" },
    { name: "Node.js", level: "Advanced" },
    { name: "Python", level: "Advanced" },
    { name: "SQL", level: "Advanced" },
    { name: "AWS", level: "Intermediate" },
    { name: "Docker", level: "Intermediate" },
    { name: "Git", level: "Expert" }
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

// ATS template configurations
const atsTemplates = {
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
  ats_modern_clean: {
    name: "ATS Modern Clean",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "modern",
      spacing: "modern",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#2c3e50",
        secondary: "#34495e",
        accent: "#2c3e50",
        text: "#2c3e50",
        background: "#ffffff"
      }
    }
  },
  ats_modern_executive: {
    name: "ATS Modern Executive",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "executive",
      spacing: "executive",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1a1a1a",
        secondary: "#404040",
        accent: "#1a1a1a",
        text: "#1a1a1a",
        background: "#ffffff"
      }
    }
  },
  ats_two_column_standard: {
    name: "ATS Two-Column Standard",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "standard",
      spacing: "standard",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      }
    }
  },
  ats_two_column_professional: {
    name: "ATS Two-Column Professional",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "professional",
      spacing: "comfortable",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#000000",
        secondary: "#444444",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      }
    }
  },
  ats_tech_engineer: {
    name: "ATS Tech Engineer",
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "32%",
      headerStyle: "tech",
      spacing: "tech",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
      fontSize: "10pt",
      lineHeight: "1.3",
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      }
    }
  },
  ats_finance_analyst: {
    name: "ATS Finance Analyst",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "finance",
      spacing: "finance",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      }
    }
  },
  ats_healthcare_professional: {
    name: "ATS Healthcare Professional",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "healthcare",
      spacing: "healthcare",
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
  ats_marketing_specialist: {
    name: "ATS Marketing Specialist",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "marketing",
      spacing: "marketing",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      }
    }
  },
  ats_entry_level_standard: {
    name: "ATS Entry Level Standard",
    layout: {
      sectionsOrder: ["personal", "summary", "education", "skills", "experience", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "education", "skills", "experience", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "entry-level",
      spacing: "entry-level",
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
  ats_c_level_executive: {
    name: "ATS C-Level Executive",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "c-level",
      spacing: "c-level",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      }
    }
  },
  ats_two_column_executive: {
      name: "ATS Two-Column Executive",
      layout: {
        sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
        sidebarSections: ["personal", "education", "skills"],
        mainSections: ["summary", "experience", "certifications"],
        showIcons: true,
        columns: 2,
        sidebarWidth: "30%",
        headerStyle: "executive-two-column",
        spacing: "executive",
        atsOptimized: true,
        showProfilePicture: true,
        profilePicturePosition: "sidebar-top"
      },
      styles: {
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: "11pt",
        lineHeight: "1.4",
        colors: {
          primary: "#8B4513",
          secondary: "#2F2F2F",
          accent: "#D2B48C",
          text: "#2F2F2F",
          background: "#FFFFFF",
          sidebarBackground: "#F5F5DC"
        }
      }
    },
    ats_professional_profile: {
      name: "ATS Professional Profile",
      layout: {
        sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
        sidebarSections: [],
        mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
        showIcons: false,
        columns: 1,
        headerStyle: "profile-left",
        spacing: "professional",
        atsOptimized: true,
        showProfilePicture: true,
        profilePicturePosition: "left"
      },
      styles: {
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: "11pt",
        lineHeight: "1.4",
        colors: {
          primary: "#1e40af",
          secondary: "#374151",
          accent: "#6b7280",
          text: "#111827",
          background: "#ffffff"
        }
      }
    }
};

function generateResumeHTML(templateKey, template) {
  const { layout, styles } = template;
  const data = sampleResumeData;
  
  // Generate header based on header style
  const header = generateHeader(layout.headerStyle, data.personal, styles);
  
  // Generate sections
  const sections = layout.sectionsOrder.map(section => generateSection(section, data, styles)).join('');
  
  // Generate layout
  let layoutHTML;
  if (layout.columns === 1) {
    layoutHTML = `<div style="width:100%;padding:1rem;background-color:${styles.colors.background};font-family:${styles.fontFamily};color:${styles.colors.text};line-height:${styles.lineHeight};font-size:${styles.fontSize};">${header}${sections}</div>`;
  } else {
    const sidebarContent = layout.sidebarSections.map(section => generateSection(section, data, styles)).join('');
    const mainContent = layout.mainSections.map(section => generateSection(section, data, styles)).join('');
    
    // Check if this is the executive two-column template
    if (layout.headerStyle === "executive-two-column") {
      const sidebarBg = styles.colors.sidebarBackground || "#F5F5DC";
      layoutHTML = `<div style="width:100%;padding:1rem;background-color:${styles.colors.background};font-family:${styles.fontFamily};color:${styles.colors.text};line-height:${styles.lineHeight};font-size:${styles.fontSize};">
        ${header}
        <div style="display:grid;grid-template-columns:${layout.sidebarWidth} 1fr;gap:1.5rem;align-items:start;">
          <div style="background-color:${sidebarBg};padding:1.5rem;border-radius:8px;border:1px solid #e5e7eb;">
            ${sidebarContent}
          </div>
          <div style="padding-top:1.5rem;">
            ${mainContent}
          </div>
        </div>
      </div>`;
    } else {
      layoutHTML = `<div style="width:100%;padding:1rem;background-color:${styles.colors.background};font-family:${styles.fontFamily};color:${styles.colors.text};line-height:${styles.lineHeight};font-size:${styles.fontSize};"><div style="display:grid;grid-template-columns:${layout.sidebarWidth} 1fr;gap:1rem;">${sidebarContent}${mainContent}</div></div>`;
    }
  }
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; font-family: ${styles.fontFamily}; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>${layoutHTML}</body>
</html>`;
}

function generateHeader(headerStyle, personal, styles) {
  if (headerStyle === "profile-left") {
    return `<header style="margin-bottom:1.5rem;border-bottom:1px solid #d1d5db;padding-bottom:1rem;">
      <div style="display:flex;align-items:flex-start;gap:1.5rem;">
        <div style="flex-shrink:0;">
          <div style="width:6rem;height:6rem;background-color:#e5e7eb;border:2px solid #d1d5db;border-radius:0.5rem;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:0.75rem;font-family:${styles.fontFamily};">
            Profile Photo
          </div>
        </div>
        <div style="flex-1;">
          <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;color:${styles.colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${personal.name}</h1>
          <p style="font-size:1.125rem;margin-bottom:0.75rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">Senior Software Engineer</p>
          <div style="display:flex;flex-direction:column;gap:0.25rem;font-size:0.875rem;color:${styles.colors.accent};font-family:${styles.fontFamily};">
            <span>${personal.address}</span>
            <span>${personal.phone}</span>
            <span>${personal.email}</span>
            <span>${personal.portfolio}</span>
          </div>
        </div>
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
          <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;color:${styles.colors.primary};font-family:${styles.fontFamily};line-height:1.1;text-transform:uppercase;letter-spacing:0.05em;">${personal.name}</h1>
          <p style="font-size:1.125rem;font-weight:600;margin-bottom:0.75rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};line-height:1.1;text-transform:uppercase;letter-spacing:0.05em;">Digital Marketing Executive</p>
        </div>
      </div>
    </header>`;
  }
  
  const baseHeader = `<header style="margin-bottom:1.5rem;border-bottom:2px solid #d1d5db;padding-bottom:1rem;text-align:center;">
    <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;color:${styles.colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${personal.name}</h1>
    <p style="font-size:1.125rem;margin-bottom:0.75rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">Senior Software Engineer</p>
    <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${styles.colors.text};font-family:${styles.fontFamily};">
      <span>${personal.email}</span><span>•</span><span>${personal.phone}</span><span>•</span><span>${personal.address}</span>
    </div>
  </header>`;
  
  return baseHeader;
}

function generateSection(sectionType, data, styles) {
  switch (sectionType) {
    case 'personal':
      return ''; // Already handled in header
      
    case 'summary':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${styles.colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid #e5e7eb;padding-bottom:0.5rem;">Professional Summary</h2>
        <p style="margin:0;color:${styles.colors.text};font-family:${styles.fontFamily};line-height:${styles.lineHeight};">${data.summary}</p>
      </section>`;
      
    case 'experience':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${styles.colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid #e5e7eb;padding-bottom:0.5rem;">Professional Experience</h2>
        ${data.experience.map(exp => `
          <div style="margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.5rem;">
              <h3 style="font-size:1.125rem;font-weight:600;margin:0;color:${styles.colors.primary};font-family:${styles.fontFamily};">${exp.title}</h3>
              <span style="font-size:0.875rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <p style="font-weight:600;margin:0 0 0.5rem 0;color:${styles.colors.secondary};font-family:${styles.fontFamily};">${exp.company}</p>
            <p style="margin:0;color:${styles.colors.text};font-family:${styles.fontFamily};line-height:${styles.lineHeight};">${exp.description}</p>
          </div>
        `).join('')}
      </section>`;
      
    case 'education':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${styles.colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid #e5e7eb;padding-bottom:0.5rem;">Education</h2>
        ${data.education.map(edu => `
          <div style="margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.5rem;">
              <h3 style="font-size:1.125rem;font-weight:600;margin:0;color:${styles.colors.primary};font-family:${styles.fontFamily};">${edu.degree}</h3>
              <span style="font-size:0.875rem;color:${styles.colors.secondary};font-family:${styles.fontFamily};">${edu.startDate} - ${edu.endDate}</span>
            </div>
            <p style="font-weight:600;margin:0 0 0.5rem 0;color:${styles.colors.secondary};font-family:${styles.fontFamily};">${edu.school}</p>
            <p style="margin:0;color:${styles.colors.text};font-family:${styles.fontFamily};line-height:${styles.lineHeight};">${edu.description}</p>
          </div>
        `).join('')}
      </section>`;
      
    case 'skills':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${styles.colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid #e5e7eb;padding-bottom:0.5rem;">Technical Skills</h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
          ${data.skills.map(skill => `
            <span style="background:${styles.colors.primary};color:white;padding:0.25rem 0.75rem;border-radius:1rem;font-size:0.875rem;font-family:${styles.fontFamily};">${skill.name}</span>
          `).join('')}
        </div>
      </section>`;
      
    case 'certifications':
      return `<section style="margin-bottom:1.5rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${styles.colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid #e5e7eb;padding-bottom:0.5rem;">Certifications</h2>
        ${data.certifications.map(cert => `
          <div style="margin-bottom:0.75rem;">
            <h3 style="font-size:1rem;font-weight:600;margin:0 0 0.25rem 0;color:${styles.colors.primary};font-family:${styles.fontFamily};">${cert.name}</h3>
            <p style="margin:0;color:${styles.colors.text};font-family:${styles.fontFamily};font-size:0.875rem;">${cert.issuer} • ${cert.date}</p>
          </div>
        `).join('')}
      </section>`;
      
    default:
      return '';
  }
}

async function generateRealisticPreviews() {
  console.log('🚀 Generating Realistic ATS Template Previews...\n');
  
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
    
    // Set viewport for consistent image dimensions
    await page.setViewport({
      width: 800,
      height: 1000,
      deviceScaleFactor: 2
    });

    console.log('📱 Set viewport to 800x1000 with 2x device scale factor\n');

    let successCount = 0;
    let errorCount = 0;

    // Process each template
    for (const [templateKey, template] of Object.entries(atsTemplates)) {
      try {
        console.log(`🔄 Generating preview for: ${template.name}...`);
        
        // Generate realistic resume HTML
        const htmlContent = generateResumeHTML(templateKey, template);
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Wait for content to render
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Take screenshot
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

    console.log('\n🎉 Preview Generation Complete!');
    console.log(`✅ Successfully generated: ${successCount} realistic previews`);
    if (errorCount > 0) {
      console.log(`❌ Failed generations: ${errorCount} templates`);
    }
    console.log(`📁 PNG files saved in: ${previewsDir}`);

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
generateRealisticPreviews().catch(console.error);
