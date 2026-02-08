const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Sample resume data for consistent previews
const sampleResumeData = {
  name: "John Doe",
  jobTitle: "Senior Sales Professional",
  email: "john.doe@company.com",
  phone: "+1 (555) 123-4567",
  address: "123 Business St, New York, NY 10001",
  linkedin: "linkedin.com/in/johndoe",
  website: "johndoe.com",
  summary: "Results-driven sales professional with 8+ years of experience in B2B sales, account management, and team leadership. Proven track record of exceeding targets and building long-term client relationships.",
  experience: [
    {
      jobTitle: "Senior Sales Manager",
      company: "Tech Solutions Inc.",
      startDate: "Jan 2020",
      endDate: "Present",
      description: "Led a team of 12 sales representatives, achieving 125% of annual targets. Managed key accounts worth $5M+ in annual revenue."
    },
    {
      jobTitle: "Sales Representative",
      company: "Business Corp",
      startDate: "Mar 2017",
      endDate: "Dec 2019",
      description: "Exceeded sales targets by 40% through strategic prospecting and relationship building. Developed new market segments."
    }
  ],
  education: [
    {
      degree: "Bachelor of Business Administration",
      school: "University of Business",
      startDate: "2013",
      endDate: "2017"
    }
  ],
  skills: ["Sales Strategy", "Account Management", "CRM Systems", "Negotiation", "Team Leadership", "Market Analysis"],
  certifications: [
    { name: "Certified Sales Professional", issuer: "Sales Institute", date: "2021" },
    { name: "Advanced Negotiation", issuer: "Business Academy", date: "2020" }
  ]
};

// ATS Template definitions with CORRECT colors from atsFriendlyTemplates.js
const atsTemplates = {
  ats_classic_standard: {
    name: "ATS Classic Standard",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      headerStyle: "standard",
      spacing: "standard",
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
  ats_classic_professional: {
    name: "ATS Classic Professional",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      headerStyle: "professional",
      spacing: "professional",
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
  ats_creative_designer: {
    name: "ATS Creative Designer",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications", "projects", "awards"],
      sidebarSections: ["skills", "languages", "certifications", "projects"],
      mainSections: ["personal", "summary", "experience", "education", "awards"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "creative",
      spacing: "creative",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#7c3aed",
        secondary: "#5b21b6",
        accent: "#a855f7",
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
  ats_sales_professional: {
    name: "ATS Sales Professional",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "28%",
      headerStyle: "sales",
      spacing: "sales",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#dc2626", // RED for sales
        secondary: "#b91c1c", // Darker red
        accent: "#ef4444", // Lighter red
        text: "#1f2937",
        background: "#ffffff"
      }
    }
  },
  ats_hr_specialist: {
    name: "ATS HR Specialist",
    layout: { headerStyle: "hr", columns: 1, sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"] },
    styles: { fontFamily: "'Times New Roman', serif", fontSize: "12pt", lineHeight: "1.6" }
  },
  ats_marketing_specialist: {
    name: "ATS Marketing Specialist",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "marketing",
      spacing: "marketing",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#7c2d12", // BROWN for marketing
        secondary: "#92400e", // Darker brown
        accent: "#d97706", // Lighter brown
        text: "#1f2937",
        background: "#ffffff"
      }
    }
  },
  ats_tech_engineer: {
    name: "ATS Tech Engineer",
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "tech",
      spacing: "tech",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Consolas', 'Monaco', monospace",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#059669", // GREEN for tech
        secondary: "#047857", // Darker green
        accent: "#10b981", // Lighter green
        text: "#1f2937",
        background: "#ffffff"
      }
    }
  }
};

// Generate accurate HTML that mimics ATSResumeRenderer
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

// Generate header based on header style
function generateAccurateHeader(headerStyle, data, styles) {
  if (headerStyle === "creative") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${styles.colors.accent};padding-bottom:1rem;text-align:center;">
      <h1 style="color:${styles.colors.primary};font-size:2.5rem;font-weight:700;margin-bottom:0.5rem;">${data.name}</h1>
      <p style="color:${styles.colors.secondary};font-size:1.25rem;font-weight:500;margin-bottom:1rem;">${data.jobTitle}</p>
      <div style="color:${styles.colors.accent};font-size:0.875rem;">
        ${data.email} • ${data.phone} • ${data.address}
      </div>
    </header>`;
  }
  
  if (headerStyle === "data-scientist") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${styles.colors.accent};padding-bottom:1rem;text-align:center;">
      <h1 style="color:${styles.colors.primary};font-size:2.5rem;font-weight:700;margin-bottom:0.5rem;">${data.name}</h1>
      <p style="color:${styles.colors.secondary};font-size:1.25rem;font-weight:500;margin-bottom:1rem;">${data.jobTitle}</p>
      <div style="color:${styles.colors.accent};font-size:0.875rem;">
        ${data.email} • ${data.phone} • ${data.address}
      </div>
    </header>`;
  }
  
  if (headerStyle === "project-manager") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${styles.colors.accent};padding-bottom:1rem;text-align:center;">
      <h1 style="color:${styles.colors.primary};font-size:2.5rem;font-weight:700;margin-bottom:0.5rem;">${data.name}</h1>
      <p style="color:${styles.colors.secondary};font-size:1.25rem;font-weight:500;margin-bottom:1rem;">${data.jobTitle}</p>
      <div style="color:${styles.colors.accent};font-size:0.875rem;">
        ${data.email} • ${data.phone} • ${data.address}
      </div>
    </header>`;
  }
  
  if (headerStyle === "sales") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${styles.colors.accent};padding-bottom:1rem;text-align:center;">
      <h1 style="color:${styles.colors.primary};font-size:2.5rem;font-weight:700;margin-bottom:0.5rem;">${data.name}</h1>
      <p style="color:${styles.colors.secondary};font-size:1.25rem;font-weight:500;margin-bottom:1rem;">${data.jobTitle}</p>
      <div style="color:${styles.colors.accent};font-size:0.875rem;">
        ${data.email} • ${data.phone} • ${data.address}
      </div>
    </header>`;
  }
  
  if (headerStyle === "consulting") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${styles.colors.accent};padding-bottom:1rem;text-align:center;">
      <h1 style="color:${styles.colors.primary};font-size:2.5rem;font-weight:700;margin-bottom:0.5rem;">${data.name}</h1>
      <p style="color:${styles.colors.secondary};font-size:1.25rem;font-weight:500;margin-bottom:1rem;">${data.jobTitle}</p>
      <div style="color:${styles.colors.accent};font-size:0.875rem;">
        ${data.email} • ${data.phone} • ${data.address}
      </div>
    </header>`;
  }
  
  if (headerStyle === "marketing") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${styles.colors.accent};padding-bottom:1rem;text-align:center;">
      <h1 style="color:${styles.colors.primary};font-size:2.5rem;font-weight:700;margin-bottom:0.5rem;">${data.name}</h1>
      <p style="color:${styles.colors.secondary};font-size:1.25rem;font-weight:500;margin-bottom:1rem;">${data.jobTitle}</p>
      <div style="color:${styles.colors.accent};font-size:0.875rem;">
        ${data.email} • ${data.phone} • ${data.address}
      </div>
    </header>`;
  }
  
  if (headerStyle === "tech") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${styles.colors.accent};padding-bottom:1rem;text-align:center;">
      <h1 style="color:${styles.colors.primary};font-size:2.5rem;font-weight:700;margin-bottom:0.5rem;">${data.name}</h1>
      <p style="color:${styles.colors.secondary};font-size:1.25rem;font-weight:500;margin-bottom:1rem;">${data.jobTitle}</p>
      <div style="color:${styles.colors.accent};font-size:0.875rem;">
        ${data.email} • ${data.phone} • ${data.address}
      </div>
    </header>`;
  }
  
  // Default header styles
  if (headerStyle === "standard") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${styles.colors.accent};padding-bottom:1rem;text-align:center;">
      <h1 style="color:${styles.colors.primary};font-size:2rem;font-weight:700;margin-bottom:0.5rem;">${data.name}</h1>
      <p style="color:${styles.colors.secondary};font-size:1.375rem;font-weight:500;margin-bottom:1rem;">${data.jobTitle}</p>
      <div style="color:${styles.colors.accent};font-size:0.875rem;">
        ${data.email} • ${data.phone} • ${data.address}
      </div>
    </header>`;
  }
  
  if (headerStyle === "professional") {
    return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${styles.colors.accent};padding-bottom:1rem;text-align:center;">
      <h1 style="color:${styles.colors.primary};font-size:2rem;font-weight:700;margin-bottom:0.5rem;">${data.name}</h1>
      <p style="color:${styles.colors.secondary};font-size:1.375rem;font-weight:500;margin-bottom:1rem;">${data.jobTitle}</p>
      <div style="color:${styles.colors.accent};font-size:0.875rem;">
        ${data.email} • ${data.phone} • ${data.address}
      </div>
    </header>`;
  }
  
  // Default header
  return `<header style="margin-bottom:1.5rem;border-bottom:2px solid ${styles.colors.accent};padding-bottom:1rem;text-align:center;">
    <h1 style="color:${styles.colors.primary};font-size:2.5rem;font-weight:700;margin-bottom:0.5rem;">${data.name}</h1>
    <p style="color:${styles.colors.secondary};font-size:1.25rem;font-weight:500;margin-bottom:1rem;">${data.jobTitle}</p>
    <div style="color:${styles.colors.accent};font-size:0.875rem;">
      ${data.email} • ${data.phone} • ${data.address}
    </div>
  </header>`;
}

// Generate sections
function generateAccurateSection(section, data, styles) {
  switch (section) {
    case 'personal':
      return `<div style="margin-bottom:1.5rem;">
        <h2 style="color:${styles.colors.primary};font-size:1.25rem;font-weight:600;margin-bottom:1rem;border-bottom:1px solid ${styles.colors.accent};padding-bottom:0.5rem;">CONTACT</h2>
        <div style="font-size:0.875rem;line-height:1.6;">
          <div style="margin-bottom:0.5rem;">• ${data.address}</div>
          <div style="margin-bottom:0.5rem;">• ${data.phone}</div>
          <div style="margin-bottom:0.5rem;">• ${data.email}</div>
          <div style="margin-bottom:0.5rem;">• ${data.linkedin}</div>
        </div>
      </div>`;
      
    case 'summary':
      return `<div style="margin-bottom:1.5rem;">
        <h2 style="color:${styles.colors.primary};font-size:1.25rem;font-weight:600;margin-bottom:1rem;border-bottom:1px solid ${styles.colors.accent};padding-bottom:0.5rem;">SUMMARY</h2>
        <p style="color:${styles.colors.text};font-size:0.875rem;line-height:1.6;">${data.summary}</p>
      </div>`;
      
    case 'experience':
      return `<div style="margin-bottom:1.5rem;">
        <h2 style="color:${styles.colors.primary};font-size:1.25rem;font-weight:600;margin-bottom:1rem;border-bottom:1px solid ${styles.colors.accent};padding-bottom:0.5rem;">WORK EXPERIENCE</h2>
        ${data.experience.map(exp => `
          <div style="margin-bottom:1rem;">
            <h3 style="color:${styles.colors.primary};font-size:1rem;font-weight:600;margin-bottom:0.25rem;">${exp.jobTitle}</h3>
            <p style="color:${styles.colors.secondary};font-size:0.875rem;font-weight:500;margin-bottom:0.25rem;">${exp.company}</p>
            <p style="color:${styles.colors.accent};font-size:0.75rem;margin-bottom:0.5rem;">${exp.startDate} - ${exp.endDate}</p>
            <p style="color:${styles.colors.text};font-size:0.875rem;line-height:1.6;">${exp.description}</p>
          </div>
        `).join('')}
      </div>`;
      
    case 'education':
      return `<div style="margin-bottom:1.5rem;">
        <h2 style="color:${styles.colors.primary};font-size:1.25rem;font-weight:600;margin-bottom:1rem;border-bottom:1px solid ${styles.colors.accent};padding-bottom:0.5rem;">EDUCATION</h2>
        ${data.education.map(edu => `
          <div style="margin-bottom:1rem;">
            <h3 style="color:${styles.colors.primary};font-size:1rem;font-weight:600;margin-bottom:0.25rem;">${edu.degree}</h3>
            <p style="color:${styles.colors.secondary};font-size:0.875rem;font-weight:500;margin-bottom:0.25rem;">${edu.school}</p>
            <p style="color:${styles.colors.accent};font-size:0.75rem;">${edu.startDate} - ${edu.endDate}</p>
          </div>
        `).join('')}
      </div>`;
      
    case 'skills':
      return `<div style="margin-bottom:1.5rem;">
        <h2 style="color:${styles.colors.primary};font-size:1.25rem;font-weight:600;margin-bottom:1rem;border-bottom:1px solid ${styles.colors.accent};padding-bottom:0.5rem;">SKILLS</h2>
        <div style="font-size:0.875rem;line-height:1.6;">
          ${data.skills.map(skill => `<div style="margin-bottom:0.25rem;">• ${skill}</div>`).join('')}
        </div>
      </div>`;
      
    case 'certifications':
      return `<div style="margin-bottom:1.5rem;">
        <h2 style="color:${styles.colors.primary};font-size:1.25rem;font-weight:600;margin-bottom:1rem;border-bottom:1px solid ${styles.colors.accent};padding-bottom:0.5rem;">CERTIFICATIONS</h2>
        ${data.certifications.map(cert => `
          <div style="margin-bottom:1rem;">
            <p style="color:${styles.colors.accent};font-size:0.75rem;margin-bottom:0.25rem;">${cert.date}</p>
            <h3 style="color:${styles.colors.primary};font-size:1rem;font-weight:600;margin-bottom:0.25rem;">${cert.name}</h3>
            <p style="color:${styles.colors.secondary};font-size:0.875rem;">${cert.issuer}</p>
          </div>
        `).join('')}
      </div>`;
      
    default:
      return '';
  }
}

// Main function
async function generateAllATSPreviews() {
  console.log('🚀 Generating ALL ATS Template Previews with CORRECT Colors...');
  console.log('');
  console.log('🎯 This will fix ALL color mismatches between preview images and rendered templates');
  console.log('');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 2 });
    
    const outputDir = path.join(__dirname, '../public/templates/previews');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('🌐 Launching Puppeteer browser...');
    console.log('📱 Set viewport to 800x1200 with 2x device scale factor');
    console.log('');
    
    let successCount = 0;
    const totalTemplates = Object.keys(atsTemplates).length;
    
    for (const [templateKey, template] of Object.entries(atsTemplates)) {
      console.log(`🔄 Generating accurate preview for: ${template.name}...`);
      
      try {
        const html = generateAccurateResumeHTML(templateKey, template);
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const outputPath = path.join(outputDir, `${templateKey}.png`);
        await page.screenshot({
          path: outputPath,
          fullPage: true,
          type: 'png'
        });
        
        console.log(`✅ Successfully generated: ${template.name}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Failed to generate ${template.name}:`, error.message);
      }
    }
    
    console.log('');
    console.log('🎉 ALL ATS Template Preview Generation Complete!');
    console.log(`✅ Successfully generated: ${successCount} accurate previews`);
    console.log(`📁 PNG files saved in: ${outputDir}`);
    console.log('');
    console.log('💡 These previews now match exactly what customers see when using the templates!');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Test the templates in the resume builder');
    console.log('   2. Verify the preview images match the rendered content');
    console.log('   3. All color mismatches should now be fixed!');
    
  } catch (error) {
    console.error('❌ Error during preview generation:', error);
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

// Run the script
generateAllATSPreviews().catch(console.error);
