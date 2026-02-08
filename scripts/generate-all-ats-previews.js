#!/usr/bin/env node

/**
 * Script to generate realistic ATS template previews for ALL templates
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
  ],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Spanish", proficiency: "Fluent" },
    { language: "French", proficiency: "Intermediate" }
  ],
  projects: [
    {
      name: "E-commerce Platform",
      description: "Built a full-stack e-commerce solution using React, Node.js, and MongoDB. Implemented payment processing, user authentication, and admin dashboard."
    },
    {
      name: "Mobile App Development",
      description: "Developed cross-platform mobile applications using React Native. Integrated with REST APIs and implemented push notifications."
    },
    {
      name: "Data Analytics Dashboard",
      description: "Created real-time data visualization dashboard using D3.js and WebSocket connections for live data updates."
    }
  ]
};

// ALL ATS template configurations (22 templates total) - using exact structure from atsFriendlyTemplates.js
const allAtsTemplates = {
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
      headerStyle: "standard",
      spacing: "standard",
      atsOptimized: true,
      sidebarWidth: "30%"
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
        background: "#ffffff",
        sidebarBackground: "#f8fafc"
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
      headerStyle: "professional",
      spacing: "comfortable",
      atsOptimized: true,
      sidebarWidth: "35%"
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
        background: "#ffffff",
        sidebarBackground: "#f9f9f9"
      }
    }
  },
  ats_two_column_executive: {
    name: "ATS Two-Column Executive",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications", "projects", "awards"],
      sidebarSections: ["education", "skills", "languages", "certifications"],
      mainSections: ["summary", "experience", "projects", "awards"],
      showIcons: true,
      columns: 2,
      headerStyle: "executive-two-column",
      spacing: "executive",
      atsOptimized: true,
      sidebarWidth: "30%",
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
  ats_tech_engineer: {
    name: "ATS Tech Engineer",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      headerStyle: "tech",
      spacing: "modern",
      atsOptimized: true,
      sidebarWidth: "32%"
    },
    styles: {
      fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
      fontSize: "10pt",
      lineHeight: "1.3",
      colors: {
        primary: "#1e40af",
        secondary: "#1e3a8a",
        accent: "#3b82f6",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#f1f5f9"
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
      headerStyle: "professional",
      spacing: "comfortable",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1f2937",
        secondary: "#374151",
        accent: "#059669",
        text: "#1f2937",
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
      headerStyle: "standard",
      spacing: "standard",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#059669",
        secondary: "#047857",
        accent: "#10b981",
        text: "#1f2937",
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
      headerStyle: "modern",
      spacing: "modern",
      atsOptimized: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#7c3aed",
        secondary: "#6d28d9",
        accent: "#a855f7",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#faf5ff"
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
      headerStyle: "standard",
      spacing: "standard",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1f2937",
        secondary: "#374151",
        accent: "#6b7280",
        text: "#1f2937",
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
      headerStyle: "executive",
      spacing: "executive",
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
  ats_mechanical_engineer: {
    name: "ATS Mechanical Engineer",
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
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#dc2626",
        secondary: "#b91c1c",
        accent: "#ef4444",
        text: "#1f2937",
        background: "#ffffff"
      }
    }
  },
  ats_sales_professional: {
    name: "ATS Sales Professional",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      headerStyle: "sales",
      spacing: "modern",
      atsOptimized: true,
      sidebarWidth: "28%"
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#dc2626",
        secondary: "#b91c1c",
        accent: "#ef4444",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#fef2f2"
      }
    }
  },
  ats_hr_specialist: {
    name: "ATS HR Specialist",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "hr",
      spacing: "comfortable",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#059669",
        secondary: "#047857",
        accent: "#10b981",
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
      showIcons: false,
      columns: 2,
      headerStyle: "modern",
      spacing: "modern",
      atsOptimized: true,
      sidebarWidth: "32%"
    },
    styles: {
      fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
      fontSize: "10pt",
      lineHeight: "1.3",
      colors: {
        primary: "#1e40af",
        secondary: "#1e3a8a",
        accent: "#3b82f6",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#eff6ff"
      }
    }
  },
  ats_creative_designer: {
    name: "ATS Creative Designer",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications", "projects"],
      sidebarSections: ["skills", "languages", "certifications"],
      mainSections: ["personal", "summary", "experience", "education", "projects"],
      showIcons: false,
      columns: 2,
      headerStyle: "creative",
      spacing: "modern",
      atsOptimized: true,
      sidebarWidth: "30%"
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
        background: "#ffffff",
        sidebarBackground: "#faf5ff"
      }
    }
  }
};

function generateResumeHTML(templateKey, template) {
  const { layout, styles } = template;
  const data = sampleResumeData;
  
  // Generate header based on header style
  const header = generateTemplateSpecificHeader(layout.headerStyle, data.personal, styles, layout);
  
  // Generate sections with template-specific styling
  const sections = layout.sectionsOrder ? 
    layout.sectionsOrder.map(section => generateTemplateSpecificSection(section, data, styles, layout)).join('') :
    generateDefaultSections(data, styles, layout);
  
  // Generate layout with template-specific styling
  let layoutHTML;
  if (layout.columns === 1) {
    layoutHTML = `<div class="resume-container" style="width:100%;padding:1rem 2rem;background-color:${styles.colors?.background || '#ffffff'};font-family:${styles.fontFamily};color:${styles.colors?.text || '#000000'};line-height:${styles.lineHeight};font-size:${styles.fontSize};min-height:100vh;">${header}${sections}</div>`;
  } else {
    const sidebarContent = layout.sidebarSections ? 
      layout.sidebarSections.map(section => generateTemplateSpecificSection(section, data, styles, layout)).join('') : '';
    const mainContent = layout.mainSections ? 
      layout.mainSections.map(section => generateTemplateSpecificSection(section, data, styles, layout)).join('') : '';
    
    const sidebarWidth = layout.sidebarWidth || '30%';
    const mainWidth = `${100 - parseInt(sidebarWidth)}%`;
    
    // Add profile picture to sidebar if showProfilePicture is true
    const profilePictureHTML = layout.showProfilePicture ? `
      <div style="text-align:center;margin-bottom:1.5rem;">
        <div style="width:80px;height:80px;border-radius:50%;background-color:#e5e7eb;margin:0 auto 0.75rem;display:flex;align-items:center;justify-content:center;border:2px solid #d1d5db;">
          <span style="font-size:2rem;color:#6b7280;font-weight:bold;">👤</span>
        </div>
      </div>
    ` : '';
    
    layoutHTML = `<div class="resume-container" style="width:100%;padding:1rem 2rem;background-color:${styles.colors?.background || '#ffffff'};font-family:${styles.fontFamily};color:${styles.colors?.text || '#000000'};line-height:${styles.lineHeight};font-size:${styles.fontSize};min-height:100vh;">
      ${header}
      <div style="display:grid;grid-template-columns:${sidebarWidth} ${mainWidth};gap:1.5rem;align-items:start;">
        <div style="background-color:${styles.colors?.sidebarBackground || '#f8fafc'};padding:1.5rem;border-radius:8px;border:1px solid #e5e7eb;">
          ${profilePictureHTML}${sidebarContent}
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
      background-color: ${styles.colors?.background || '#ffffff'};
      overflow: visible;
    }
    * { box-sizing: border-box; }
    .resume-preview {
      max-width: 800px;
      margin: 0 auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    header {
      position: relative;
      z-index: 1;
    }
    /* Ensure no content is clipped */
    html, body {
      min-height: 100%;
      overflow-x: hidden;
    }
    /* Ensure header is always visible */
    header {
      position: relative;
      z-index: 1;
      margin-top: 0;
      padding-top: 0;
    }
    /* Prevent any clipping issues */
    .resume-container {
      position: relative;
      overflow: visible;
    }
  </style>
</head>
<body>${layoutHTML}</body>
</html>`;
}

function generateDefaultSections(data, styles, layout) {
  return generateTemplateSpecificSection('summary', data, styles, layout) +
         generateTemplateSpecificSection('experience', data, styles, layout) +
         generateTemplateSpecificSection('education', data, styles, layout) +
         generateTemplateSpecificSection('skills', data, styles, layout) +
         generateTemplateSpecificSection('certifications', data, styles, layout);
}

function generateTemplateSpecificHeader(headerStyle, personal, styles, layout) {
  const colors = styles.colors || {
    primary: '#000000',
    secondary: '#333333',
    accent: '#000000',
    text: '#000000',
    background: '#ffffff'
  };
  
  // Template-specific header styles
  switch (headerStyle) {
    case 'standard':
      return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${colors.accent};padding-bottom:1rem;text-align:center;">
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${personal.name}</h1>
        <p style="font-size:1.375rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">Senior Software Engineer</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
          <span>${personal.email}</span><span>•</span><span>${personal.phone}</span><span>•</span><span>${personal.address}</span>
        </div>
      </header>`;
      
    case 'modern':
      return `<header style="margin-bottom:1.25rem;border-bottom:2px solid ${colors.accent};padding-bottom:0.875rem;text-align:center;">
        <h1 style="font-size:2.25rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${personal.name}</h1>
        <p style="font-size:1.125rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">Senior Software Engineer</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
          <span>${personal.email}</span><span>•</span><span>${personal.phone}</span><span>•</span><span>${personal.address}</span>
        </div>
      </header>`;
      
    case 'professional':
      return `<header style="margin-bottom:1.75rem;border-bottom:2px solid ${colors.accent};padding-bottom:1rem;text-align:center;">
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${personal.name}</h1>
        <p style="font-size:1.375rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">Senior Software Engineer</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
          <span>${personal.email}</span><span>•</span><span>${personal.phone}</span><span>•</span><span>${personal.address}</span>
        </div>
      </header>`;
      
    case 'executive':
      return `<header style="margin-bottom:2rem;border-bottom:3px solid ${colors.accent};padding-bottom:1.25rem;text-align:center;">
        <h1 style="font-size:2.5rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;text-transform:uppercase;">${personal.name}</h1>
        <p style="font-size:1.5rem;margin-bottom:1rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">Senior Software Engineer</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:1rem;color:${colors.accent};font-family:${styles.fontFamily};">
          <span>${personal.email}</span><span>•</span><span>${personal.phone}</span><span>•</span><span>${personal.address}</span>
        </div>
      </header>`;
      
    case 'executive-two-column':
      return `<header style="margin-bottom:1.5rem;">
        <div style="display:flex;align-items:start;justify-content:space-between;gap:1.5rem;">
          <div style="flex:1;">
            <h1 style="font-size:2.5rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;text-transform:uppercase;letter-spacing:0.05em;">${personal.name}</h1>
            <p style="font-size:1.25rem;font-weight:600;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;text-transform:uppercase;letter-spacing:0.05em;">Senior Software Engineer</p>
          </div>
          
          <!-- Contact Details on Right Side -->
          <div style="flex-shrink:0;text-align:right;color:${colors.accent};font-size:0.875rem;">
            <div style="margin-bottom:0.25rem;">
              <span style="font-weight:600;">Email:</span> ${personal.email}
            </div>
            <div style="margin-bottom:0.25rem;">
              <span style="font-weight:600;">Phone:</span> ${personal.phone}
            </div>
            <div style="margin-bottom:0.25rem;">
              <span style="font-weight:600;">Address:</span> ${personal.address}
            </div>
            <div style="margin-bottom:0.25rem;">
              <span style="font-weight:600;">LinkedIn:</span> ${personal.linkedin}
            </div>
            <div style="margin-bottom:0.25rem;">
              <span style="font-weight:600;">Portfolio:</span> ${personal.portfolio}
            </div>
          </div>
        </div>
      </header>`;
      
    case 'tech':
      return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${colors.accent};padding-bottom:1rem;text-align:center;">
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${personal.name}</h1>
        <p style="font-size:1.25rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">Senior Software Engineer</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
          <span>${personal.email}</span><span>•</span><span>${personal.phone}</span><span>•</span><span>${personal.address}</span>
        </div>
      </header>`;
      
    case 'sales':
      return `<header style="margin-bottom:1.25rem;border-bottom:3px solid ${colors.primary};padding-bottom:0.875rem;text-align:center;">
        <h1 style="font-size:2.25rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${personal.name}</h1>
        <p style="font-size:1.25rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">Senior Sales Executive</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
          <span>${personal.email}</span><span>•</span><span>${personal.phone}</span><span>•</span><span>${personal.address}</span>
        </div>
      </header>`;
      
    case 'hr':
      return `<header style="margin-bottom:1.75rem;border-bottom:2px solid ${colors.accent};padding-bottom:1rem;text-align:center;">
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${personal.name}</h1>
        <p style="font-size:1.375rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">HR Specialist</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
          <span>${personal.email}</span><span>•</span><span>${personal.phone}</span><span>•</span><span>${personal.address}</span>
        </div>
      </header>`;
      
    case 'creative':
      return `<header style="margin-bottom:1.25rem;border-bottom:2px solid ${colors.accent};padding-bottom:0.875rem;text-align:center;">
        <h1 style="font-size:2.25rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${personal.name}</h1>
        <p style="font-size:1.25rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">Creative Designer</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
          <span>${personal.email}</span><span>•</span><span>${personal.phone}</span><span>•</span><span>${personal.address}</span>
        </div>
      </header>`;
      
    default:
      return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${colors.accent};padding-bottom:1rem;text-align:center;">
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${personal.name}</h1>
        <p style="font-size:1.375rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">Senior Software Engineer</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
          <span>${personal.email}</span><span>•</span><span>${personal.phone}</span><span>•</span><span>${personal.address}</span>
        </div>
      </header>`;
  }
}

function generateTemplateSpecificSection(sectionType, data, styles, layout) {
  const colors = styles.colors || {
    primary: '#000000',
    secondary: '#333333',
    accent: '#000000',
    text: '#000000',
    background: '#ffffff'
  };

  switch (sectionType) {
    case 'personal':
      return ''; // Already handled in header
      
    case 'summary':
      return `<section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Professional Summary</h2>
        <p style="margin:0;color:${colors.text};font-family:${styles.fontFamily};line-height:${styles.lineHeight};">${data.summary}</p>
      </section>`;
      
    case 'experience':
      return `<section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Professional Experience</h2>
        ${data.experience.map(exp => `
          <div style="margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.5rem;">
              <h3 style="font-size:1.125rem;font-weight:600;margin:0;color:${colors.primary};font-family:${styles.fontFamily};">${exp.title}</h3>
              <span style="font-size:0.875rem;color:${colors.secondary};font-family:${styles.fontFamily};">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <p style="font-weight:600;margin:0 0 0.5rem 0;color:${colors.secondary};font-family:${styles.fontFamily};">${exp.company}</p>
            <p style="margin:0;color:${colors.text};font-family:${styles.fontFamily};line-height:${styles.lineHeight};">${exp.description}</p>
          </div>
        `).join('')}
      </section>`;
      
    case 'education':
      return `<section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Education</h2>
        ${data.education.map(edu => `
          <div style="margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.5rem;">
              <h3 style="font-size:1.125rem;font-weight:600;margin:0;color:${colors.primary};font-family:${styles.fontFamily};">${edu.degree}</h3>
              <span style="font-size:0.875rem;color:${colors.secondary};font-family:${styles.fontFamily};">${edu.startDate} - ${edu.endDate}</span>
            </div>
            <p style="font-weight:600;margin:0 0 0.5rem 0;color:${colors.secondary};font-family:${styles.fontFamily};">${edu.school}</p>
            <p style="margin:0;color:${colors.text};font-family:${styles.fontFamily};line-height:${styles.lineHeight};">${edu.description}</p>
          </div>
        `).join('')}
      </section>`;
      
    case 'skills':
      return `<section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Technical Skills</h2>
        ${layout.columns === 1 ? 
          // Single column: 3-column grid layout with bullets
          `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;font-family:${styles.fontFamily};">
            ${(() => {
              const totalSkills = data.skills.length;
              const skillsPerColumn = Math.ceil(totalSkills / 3);
              let html = '';
              for (let i = 0; i < 3; i++) {
                const startIdx = i * skillsPerColumn;
                const endIdx = Math.min(startIdx + skillsPerColumn, totalSkills);
                const columnSkills = data.skills.slice(startIdx, endIdx);
                html += '<div style="display:flex;flex-direction:column;gap:0.25rem;">';
                columnSkills.forEach(skill => {
                  html += `<div style="display:flex;align-items:center;">
                    <span style="color:${colors.accent};font-size:0.75rem;margin-right:0.5rem;">•</span>
                    <span style="color:${colors.text};font-size:0.875rem;font-family:${styles.fontFamily};line-height:1.4;">${skill.name}</span>
                  </div>`;
                });
                html += '</div>';
              }
              return html;
            })()}
          </div>` :
          // Two column: individual bullets
          `<ul style="list-style:none;margin:0;padding:0;font-family:${styles.fontFamily};">
            ${data.skills.map(skill => `
              <li style="display:flex;align-items:center;margin-bottom:0.25rem;">
                <span style="color:${colors.accent};font-size:0.75rem;margin-right:0.5rem;">•</span>
                <span style="color:${colors.text};font-size:0.875rem;font-family:${styles.fontFamily};line-height:1.4;">${skill.name}</span>
              </li>
            `).join('')}
          </ul>`
        }
      </section>`;
      
    case 'certifications':
      return `<section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Certifications</h2>
        ${data.certifications.map(cert => `
          <div style="margin-bottom:0.75rem;">
            <h3 style="font-size:1rem;font-weight:600;margin:0 0 0.25rem 0;color:${colors.primary};font-family:${styles.fontFamily};">${cert.name}</h3>
            <p style="margin:0;color:${colors.text};font-family:${styles.fontFamily};font-size:0.875rem;">${cert.issuer} • ${cert.date}</p>
          </div>
        `).join('')}
      </section>`;
      
    case 'languages':
      return `<section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Languages</h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
          ${data.languages?.map(lang => `
            <span style="color:${colors.accent};padding:0.25rem 0.75rem;font-size:0.875rem;font-family:${styles.fontFamily};">${lang.language} (${lang.proficiency})</span>
          `).join('') || '<span style="color:#666;">English (Native), Spanish (Fluent)</span>'}
        </div>
      </section>`;
      
    case 'projects':
      return `<section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Projects</h2>
        ${data.projects?.map(project => `
          <div style="margin-bottom:1rem;">
            <h3 style="font-size:1.125rem;font-weight:600;margin:0 0 0.5rem 0;color:${colors.primary};font-family:${styles.fontFamily};">${project.name}</h3>
            <p style="margin:0;color:${colors.text};font-family:${styles.fontFamily};line-height:${styles.lineHeight};">${project.description}</p>
          </div>
        `).join('') || '<p style="color:#666;">E-commerce Platform, Mobile App Development, Data Analytics Dashboard</p>'}
      </section>`;
      
    case 'awards':
      return `<section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Awards & Achievements</h2>
        <div style="space-y-2;">
          <div style="margin-bottom:0.75rem;">
            <h3 style="font-size:1rem;font-weight:600;margin:0 0 0.25rem 0;color:${colors.primary};font-family:${styles.fontFamily};">Employee of the Year</h3>
            <p style="margin:0;color:${colors.text};font-family:${styles.fontFamily};font-size:0.875rem;">TechCorp Inc. • 2023</p>
          </div>
          <div style="margin-bottom:0.75rem;">
            <h3 style="font-size:1rem;font-weight:600;margin:0 0 0.25rem 0;color:${colors.primary};font-family:${styles.fontFamily};">Best Innovation Award</h3>
            <p style="margin:0;color:${colors.text};font-family:${styles.fontFamily};font-size:0.875rem;">Tech Conference • 2022</p>
          </div>
        </div>
      </section>`;
      
    default:
      return '';
  }
}

async function generateAllPreviews() {
  console.log('🚀 Generating ALL ATS Template Previews (22 templates)...\n');
  
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
    
    // Set viewport for consistent image dimensions - increased height to ensure full content is visible
    await page.setViewport({
      width: 800,
      height: 1200,
      deviceScaleFactor: 2
    });

    console.log('📱 Set viewport to 800x1200 with 2x device scale factor\n');

    let successCount = 0;
    let errorCount = 0;

    // Process each template
    for (const [templateKey, template] of Object.entries(allAtsTemplates)) {
      try {
        console.log(`🔄 Generating preview for: ${template.name}...`);
        
        // Generate realistic resume HTML
        const htmlContent = generateResumeHTML(templateKey, template);
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Wait for content to render
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Take screenshot - ensure full content is captured
        const pngPath = path.join(previewsDir, `${templateKey}.png`);
        
        // Wait a bit more for content to fully render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the full height of the content
        const bodyHeight = await page.evaluate(() => {
          return Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          );
        });
        
        // Set viewport to match content height
        await page.setViewport({
          width: 800,
          height: bodyHeight,
          deviceScaleFactor: 2
        });
        
        console.log(`📏 Content height for ${template.name}: ${bodyHeight}px`);
        
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
    console.log(`📊 Total templates processed: ${Object.keys(allAtsTemplates).length}`);

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
generateAllPreviews().catch(console.error);
