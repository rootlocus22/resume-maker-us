const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Import the visual appeal templates
const visualAppealTemplates = require('../app/lib/visualAppealTemplates.js').default;

// Sample resume data for previews
const sampleData = {
  name: "Alexander Chan",
  jobTitle: "Senior Product Manager & UX Strategist",
  email: "alexander.chan@email.com",
  phone: "+1 (555) 987-6543",
  address: "San Francisco, CA 94105",
  linkedin: "linkedin.com/in/alexanderchan",
  portfolio: "alexanderchan.design",
  summary: "Innovative product manager and UX strategist with 10+ years of experience driving digital transformation across Fortune 500 companies. Proven track record of leading cross-functional teams to deliver user-centered products that achieve 40%+ growth in user engagement and revenue. Expertise in agile methodologies, design thinking, and data-driven decision making.",
  photo: "https://www.nyquisttech.com/wp-content/uploads/2025/11/image-9.jpg",
  experience: [
    {
      jobTitle: "Senior Product Manager & UX Strategist",
      company: "TechCorp Inc.",
      startDate: "Jan 2020",
      endDate: "Present",
      description: [
        "Led product strategy for flagship SaaS platform serving 100K+ enterprise users",
        "Increased user engagement by 40% and revenue by 35% through data-driven optimization",
        "Managed cross-functional team of 12 engineers, designers, and analysts",
        "Spearheaded mobile-first redesign resulting in 60% increase in mobile adoption"
      ]
    },
    {
      jobTitle: "Senior Product Manager",
      company: "InnovateTech Solutions",
      startDate: "Mar 2018",
      endDate: "Dec 2019",
      description: [
        "Launched 3 major product features resulting in 25% revenue growth",
        "Collaborated with engineering teams to deliver products on time and budget",
        "Conducted user research and A/B testing to optimize conversion rates",
        "Established KPIs and analytics frameworks for product success measurement"
      ]
    },
    {
      jobTitle: "Product Manager",
      company: "StartupXYZ",
      startDate: "Jun 2016",
      endDate: "Feb 2018",
      description: [
        "Developed go-to-market strategy for new product launch, achieving 10K users",
        "Led user experience research and usability testing",
        "Worked with design and development teams on scalable product solutions"
      ]
    },
    {
      jobTitle: "UX Designer & Product Analyst",
      company: "Digital Agency Pro",
      startDate: "Jan 2015",
      endDate: "May 2016",
      description: [
        "Designed user interfaces for web and mobile applications",
        "Conducted user interviews and usability testing",
        "Created wireframes and design specifications"
      ]
    }
  ],
  education: [
    {
      degree: "MBA in Product Management & Innovation",
      school: "Stanford Graduate School of Business",
      startDate: "2016",
      endDate: "2018",
      gpa: "3.8",
      honors: "Magna Cum Laude"
    },
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      startDate: "2012",
      endDate: "2016",
      gpa: "3.7",
      honors: "Dean's List, Phi Beta Kappa"
    }
  ],
  skills: [
    "Product Strategy", "Agile Development", "User Research", "Data Analysis",
    "Team Leadership", "Stakeholder Management", "Design Thinking", "A/B Testing",
    "Market Research", "Project Management", "UX Design"
  ],
  certifications: [
    "Certified Scrum Product Owner (CSPO) - Scrum Alliance",
    "Google Analytics Certified - Google",
    "Project Management Professional (PMP) - PMI",
    "Certified User Experience Designer (CUXD) - UX Design Institute",
    "AWS Certified Cloud Practitioner - Amazon Web Services",
    "Design Thinking Certificate - IDEO"
  ],
  projects: [
    {
      name: "Enterprise Mobile Platform Redesign",
      description: "Led complete UX overhaul of mobile platform resulting in 60% increase in user engagement",
      technologies: "React Native, Figma, Analytics"
    },
    {
      name: "AI-Powered Recommendation Engine",
      description: "Developed machine learning algorithms that improved conversion rates by 25%",
      technologies: "Python, TensorFlow, A/B Testing"
    },
    {
      name: "Cross-Platform Design System",
      description: "Created comprehensive design system used across 15+ products and applications",
      technologies: "Design Tokens, Figma, Storybook"
    }
  ],
  achievements: [
    "Led product that achieved $50M ARR milestone in Q3 2023",
    "Recognized as 'Top 40 Under 40 Product Leaders' by ProductHunt",
    "Speaker at 5+ industry conferences including SXSW and ProductCon",
    "Mentored 20+ junior product managers and designers",
    "Patented 3 product features for user engagement optimization"
  ],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Spanish", proficiency: "Professional" },
    { language: "French", proficiency: "Conversational" }
  ],
  projects: [
    {
      name: "E-commerce Platform Redesign",
      description: "Led complete UX/UI redesign of enterprise e-commerce platform, resulting in 60% increase in conversion rates and 40% improvement in user satisfaction scores.",
      technologies: "React, Node.js, MongoDB, AWS, Figma",
      url: "https://example.com/ecommerce-redesign"
    },
    {
      name: "Mobile Banking App",
      description: "Designed and launched mobile banking application for 50K+ users with 99.9% uptime and 4.8/5 user rating.",
      technologies: "React Native, TypeScript, Firebase, Stripe API",
      url: "https://example.com/banking-app"
    }
  ]
};

async function generateTemplatePreview(templateKey, template) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport for consistent sizing
  await page.setViewport({
    width: 900,
    height: 1200,
    deviceScaleFactor: 2
  });

  // Generate HTML content that matches VisualAppealRenderer exactly
  const htmlContent = generateVisualAppealHTML(templateKey, template, sampleData);

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Wait for fonts and styling to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Take screenshot
  const outputPath = path.join(__dirname, '..', 'public', 'templates', 'previews', `${templateKey}.png`);
  await page.screenshot({
    path: outputPath,
    type: 'png',
    fullPage: false,
    clip: {
      x: 0,
      y: 0,
      width: 900,
      height: 1200
    }
  });

  await browser.close();
  console.log(`✅ Generated preview: ${templateKey}.png`);
}

function generateVisualAppealHTML(templateKey, template, data) {
  const { layout, styles } = template;
  const colors = styles?.colors || {};
  const spacing = styles?.spacing || {};
  const visualEffects = styles?.visualEffects || {};
  const visualFeatures = template?.visualFeatures || {};

  // Merge colors exactly like VisualAppealRenderer
  const mergedColors = {
    primary: colors.primary || "#1e40af",
    secondary: colors.secondary || "#475569",
    accent: colors.accent || "#3b82f6",
    text: colors.text || "#1f2937",
    background: colors.background || "#ffffff",
    sidebarBackground: colors.sidebarBackground || "#f8fafc",
    sidebarText: colors.sidebarText || "#1f2937",
    accentLight: colors.accentLight || "#dbeafe",
    gradientStart: colors.gradientStart || "#1e40af",
    gradientEnd: colors.gradientEnd || "#3b82f6"
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name} Preview</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${(styles && styles.fontFamily) || "Inter, sans-serif"};
            font-size: ${(styles && styles.fontSize) || "11pt"};
            line-height: ${(styles && styles.lineHeight) || "1.5"};
            color: ${mergedColors.text};
            background: ${mergedColors.background};
        }
        
        .visual-appeal-resume {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid #e5e7eb;
            border-radius: 1rem;
            overflow: hidden;
            min-height: 100vh;
            position: relative;
            background-color: ${mergedColors.background};
            font-family: ${(styles && styles.fontFamily) || "Inter, sans-serif"};
        }
        
        .resume-content {
            padding: 1.5rem;
        }
        
        .preview-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 1.25rem;
            font-size: 0.75rem;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            z-index: 1000;
        }
        
        ${generateLayoutCSS(layout, mergedColors, visualEffects, visualFeatures)}
        ${generateHeaderCSS(layout, mergedColors, visualEffects)}
        ${generateSidebarCSS(layout, mergedColors, visualEffects)}
        ${generateMainContentCSS(mergedColors)}
        ${generateSectionHeaderCSS(mergedColors)}
        ${generatePhotoCSS(visualEffects)}
    </style>
</head>
<body>
    <div class="visual-appeal-resume">
        <div class="preview-badge">Visual Appeal</div>
        <div class="resume-content">
            ${generateLayoutHTML(templateKey, layout, data, mergedColors, visualEffects)}
        </div>
    </div>
</body>
</html>`;
}

function generateLayoutCSS(layout, colors, visualEffects, visualFeatures = {}) {
  if (layout.columns === 2) {
    return `
      .layout-container {
        display: flex;
        gap: 2rem;
        min-height: 100vh;
      }
      
      .sidebar {
        width: ${layout.sidebarWidth || "35%"};
        padding: ${layout.spacing?.contentPadding || "1.5rem"};
        flex-shrink: 0;
        ${getSidebarStyleCSS(layout, colors, visualEffects, visualFeatures)}
      }
      
      .main-content {
        flex: 1;
        padding: ${layout.spacing?.contentPadding || "1.5rem"};
      }
    `;
  } else {
    return `
      .layout-container {
        max-width: 1024px;
        margin: 0 auto;
      }
    `;
  }
}

function getSidebarStyleCSS(layout, colors, visualEffects, visualFeatures = {}) {
  switch (layout.layoutType) {
    case "dark-sidebar-with-timeline":
      return `
        background: ${colors.sidebarBackground};
        color: ${colors.sidebarText};
        border-radius: 0 1rem 1rem 0;
        ${visualEffects.elegantShadow ? `box-shadow: ${visualEffects.elegantShadow};` : ''}
      `;
    case "clean-sidebar-photo":
      return `
        background: ${colors.sidebarBackground};
        color: ${colors.sidebarText};
        border-right: 2px solid ${colors.accentLight};
        border-radius: 0 0.5rem 0.5rem 0;
      `;
    case "timeline-with-sidebar":
      return `
        background: ${colors.sidebarBackground};
        color: ${colors.sidebarText};
        border-right: 3px solid ${colors.accent};
        ${visualEffects.creativeShadow ? `box-shadow: ${visualEffects.creativeShadow};` : ''}
      `;
    case "luxury-sidebar-with-awards":
      return `
        background: ${colors.sidebarBackground};
        color: ${colors.sidebarText};
        border-right: 4px solid ${colors.fashionGold || colors.accent};
        border-radius: 0 1rem 1rem 0;
        ${visualEffects.fashionShadow ? `box-shadow: ${visualEffects.fashionShadow};` : ''}
      `;
    default:
      return `
        background: ${visualEffects.sidebarGradient || colors.sidebarBackground};
        color: ${colors.sidebarText};
        border-radius: ${(visualFeatures && visualFeatures.modernLayout) ? "0 1rem 1rem 0" : "0"};
        ${visualEffects.elegantShadow ? `box-shadow: ${visualEffects.elegantShadow};` : ''}
      `;
  }
}

function generateHeaderCSS(layout, colors, visualEffects) {
  return `
    .header {
      margin-bottom: 2rem;
    }
    
    .header-banner {
      background: ${visualEffects.headerGradient || `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`};
      padding: ${layout.spacing?.headerPadding || "2.5rem"};
      min-height: 180px;
      border-radius: 1rem;
      ${visualEffects.creativeShadow ? `box-shadow: ${visualEffects.creativeShadow};` : ''}
      position: relative;
      overflow: hidden;
    }
    
    .header-banner::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
      pointer-events: none;
    }
    
    .header-content {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 2.5rem;
    }
    
    .header-text {
      flex: 1;
      color: white;
    }
    
    .header-title {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin-bottom: 0.75rem;
    }
    
    .header-subtitle {
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      opacity: 0.95;
    }
  `;
}

function generateSidebarCSS(layout, colors, visualEffects) {
  return `
    .sidebar-section {
      margin-bottom: 1.5rem;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    
    .contact-item .icon {
      font-size: 1.125rem;
    }
    
    .contact-item .text {
      font-size: 0.875rem;
      word-break: break-all;
    }
    
    .skills-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .skill-item {
      width: 100%;
    }

    .skill-tag {
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      background: ${colors.accentLight};
      color: ${colors.primary};
      display: block;
      width: 100%;
      text-align: center;
    }
    
    .certification-item {
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: ${colors.sidebarText === colors.primary ? colors.secondary : colors.sidebarText};
    }
  `;
}

function generateMainContentCSS(colors) {
  return `
    .main-section {
      margin-bottom: 2rem;
    }
    
    .experience-item {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    
    .job-title {
      font-weight: 700;
      font-size: 1.1rem;
      color: ${colors.primary};
      margin-bottom: 0.25rem;
    }
    
    .company {
      font-weight: 600;
      color: ${colors.secondary};
    }
    
    .job-date {
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .job-description {
      padding-left: 1.5rem;
    }
    
    .job-description li {
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
      line-height: 1.6;
    }
    
    .education-item {
      margin-bottom: 1rem;
    }
    
    .education-degree {
      font-weight: 700;
      color: ${colors.primary};
      margin-bottom: 0.25rem;
    }
    
    .education-school {
      color: ${colors.secondary};
      margin-bottom: 0.25rem;
    }
    
    .education-details {
      color: #6b7280;
      font-size: 0.9rem;
    }
  `;
}

function generateSectionHeaderCSS(colors) {
  return `
    .section-header {
      font-weight: 700;
      margin-bottom: 1rem;
      position: relative;
      color: ${colors.primary};
      font-size: 1.25rem;
      letter-spacing: 0.05em;
    }
    
    .sidebar .section-header {
      color: ${colors.sidebarText || colors.primary};
    }
    
    .section-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 4px;
      background: linear-gradient(90deg, ${colors.accent} 0%, ${colors.gradientEnd} 100%);
      border-radius: 9999px;
    }
  `;
}

function generatePhotoCSS(visualEffects) {
  return `
    .profile-photo {
      width: 10rem;
      height: 10rem;
      border-radius: 50%;
      object-fit: cover;
      margin: 0 auto 1rem;
      display: block;
      ${visualEffects.photoShadow ? `box-shadow: ${visualEffects.photoShadow};` : ''}
      ${visualEffects.photoGlow ? `box-shadow: ${visualEffects.photoGlow};` : ''}
      ${visualEffects.photoFrame ? `border: ${visualEffects.photoFrame};` : ''}
    }
    
    .header-photo {
      width: 8rem;
      height: 8rem;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
  `;
}

function generateLayoutHTML(templateKey, layout, data, colors, visualEffects) {
  if (layout.columns === 2) {
    return `
      ${layout.headerStyle === "colored-banner-with-photo" ? generateHeaderHTML(layout, data, colors, visualEffects) : ''}
      <div class="layout-container">
        ${generateSidebarHTML(layout, data, colors, templateKey)}
        ${generateMainContentHTML(layout, data, colors)}
      </div>
    `;
  } else {
    return `
      ${layout.headerStyle === "single-column-header-photo" ? generateHeaderHTML(layout, data, colors, visualEffects) : ''}
      <div class="layout-container">
        ${generateMainContentHTML(layout, data, colors)}
      </div>
    `;
  }
}

function generateHeaderHTML(layout, data, colors, visualEffects) {
  if (layout.headerStyle === "colored-banner-with-photo") {
    return `
      <header class="header-banner">
        <div class="header-content">
          ${data.photo ? `<img src="${data.photo}" alt="Profile" class="header-photo">` : ''}
          <div class="header-text">
            <h1 class="header-title">${data.name}</h1>
            <p class="header-subtitle">${data.jobTitle}</p>
          </div>
        </div>
      </header>
    `;
  }

  if (layout.headerStyle === "single-column-header-photo") {
    return `
      <header class="header">
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          ${data.photo ? `<img src="${data.photo}" alt="Profile" class="header-photo">` : ''}
          <div style="flex: 1;">
            <h1 style="font-size: 2.5rem; font-weight: 700; color: ${colors.primary}; margin-bottom: 0.5rem;">${data.name}</h1>
            <p style="font-size: 1.25rem; font-weight: 600; color: ${colors.secondary}; margin-bottom: 0.75rem;">${data.jobTitle}</p>
            <div style="display: flex; gap: 1.5rem; font-size: 0.875rem; color: ${colors.accent};">
              ${data.email ? `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; margin-right: 0.5rem; vertical-align: middle;"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>${data.email}</span>` : ''}
              ${data.phone ? `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; margin-right: 0.5rem; vertical-align: middle;"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>${data.phone}</span>` : ''}
              ${data.address ? `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; margin-right: 0.5rem; vertical-align: middle;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>${data.address}</span>` : ''}
            </div>
          </div>
        </div>
      </header>
    `;
  }

  return '';
}

function generateSidebarHTML(layout, data, colors, templateKey = '') {
  if (!layout.sidebarSections?.length) return '';

  return `
      <div class="sidebar">
        ${layout.showProfilePicture && templateKey !== 'visual_creative_designer' ? `<img src="${data.photo}" alt="Profile" class="profile-photo">` : ''}
        
        ${layout.columns === 2 && templateKey !== 'visual_creative_designer' ? `
          <div class="sidebar-section text-center" style="margin-bottom: 1.5rem;">
            <h1 class="sidebar-name" style="font-size: 1.5rem; font-weight: 700; color: ${colors.sidebarText || colors.primary}; margin-bottom: 0.5rem; letter-spacing: 0.02em; text-align: center;">
              ${data.name || "Your Name"}
            </h1>
            <p class="sidebar-title" style="font-size: 1rem; font-weight: 600; color: ${colors.sidebarText === "#ffffff" ? "#e2e8f0" : colors.secondary}; text-align: center;">
              ${data.jobTitle || ""}
            </p>
          </div>
        ` : ''}
        
        ${layout.sidebarSections.includes('personal') && (data.email || data.phone || data.address || data.linkedin || data.portfolio) ? `
        <div class="sidebar-section">
          <h2 class="section-header">CONTACT</h2>
          <div>
            ${data.email ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></span><span class="text">${data.email}</span></div>` : ''}
            ${data.phone ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></span><span class="text">${data.phone}</span></div>` : ''}
            ${data.address ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></span><span class="text">${data.address}</span></div>` : ''}
            ${data.linkedin ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></span><span class="text">${data.linkedin}</span></div>` : ''}
            ${data.portfolio ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span><span class="text">${data.portfolio}</span></div>` : ''}
          </div>
        </div>
      ` : ''}
      
      ${layout.sidebarSections.includes('skills') && data.skills?.length > 0 ? `
        <div class="sidebar-section">
          <h2 class="section-header">SKILLS</h2>
          <div class="skills-list">
            ${data.skills?.map(skill => `<div class="skill-item"><span class="skill-tag">${skill}</span></div>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${layout.sidebarSections.includes('certifications') && data.certifications?.length > 0 ? `
        <div class="sidebar-section">
          <h2 class="section-header">CERTIFICATIONS</h2>
          <div>
            ${data.certifications?.map(cert => `<div class="certification-item">• ${cert}</div>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateMainContentHTML(layout, data, colors) {
  return `
    <div class="main-content">
      ${!layout.headerStyle || layout.headerStyle === "dark-sidebar-executive" ? `
        <header class="header">
          <div style="text-align: center;">
            <h1 style="font-size: 2.5rem; font-weight: 700; color: ${colors.primary}; margin-bottom: 0.5rem;">${data.name}</h1>
            <p style="font-size: 1.25rem; font-weight: 600; color: ${colors.secondary};">${data.jobTitle}</p>
          </div>
        </header>
      ` : ''}
      
      ${data.summary ? `
        <div class="main-section">
          <h2 class="section-header">PROFESSIONAL SUMMARY</h2>
          <p style="font-size: 0.875rem; line-height: 1.6;">${data.summary}</p>
        </div>
      ` : ''}
      
      ${data.experience?.length > 0 ? `
        <div class="main-section">
          <h2 class="section-header">WORK EXPERIENCE</h2>
        ${data.experience?.map(exp => `
          <div class="experience-item">
            <div class="job-header">
              <div>
                <div class="job-title">${exp.jobTitle}</div>
                <div class="company">${exp.company}</div>
              </div>
              <div class="job-date">${exp.startDate} - ${exp.endDate}</div>
            </div>
            <ul class="job-description">
              ${exp.description?.map(desc => `<li>${desc}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
        </div>
      ` : ''}
      
      ${data.education?.length > 0 ? `
        <div class="main-section">
          <h2 class="section-header">EDUCATION</h2>
        ${data.education?.map(edu => `
          <div class="education-item">
            <div class="education-degree">${edu.degree}</div>
            <div class="education-school">${edu.school}</div>
            <div class="education-details">${edu.startDate} - ${edu.endDate} | GPA: ${edu.gpa}${edu.honors ? ` | ${edu.honors}` : ''}</div>
          </div>
        `).join('')}
        </div>
      ` : ''}
      
      ${data.projects && data.projects.length > 0 ? `
        <div class="main-section">
          <h2 class="section-header">KEY PROJECTS</h2>
          ${data.projects.map(project => `
            <div style="margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 0.5rem; border-left: 3px solid ${colors.accent};">
              <h3 style="font-weight: 700; color: ${colors.primary}; margin-bottom: 0.25rem;">${project.name}</h3>
              <p style="color: ${colors.secondary}; margin-bottom: 0.25rem; font-size: 0.875rem;">${project.description}</p>
              <p style="color: #666; font-size: 0.8rem; font-style: italic;">Technologies: ${project.technologies}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${data.achievements && data.achievements.length > 0 ? `
        <div class="main-section">
          <h2 class="section-header">KEY ACHIEVEMENTS</h2>
          <ul style="padding-left: 1.5rem;">
            ${data.achievements.map(achievement => `
              <li style="margin-bottom: 0.5rem; font-size: 0.875rem; line-height: 1.5;">${achievement}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${layout.columns === 1 && data.skills?.length > 0 ? `
        <div class="main-section">
          <h2 class="section-header">SKILLS</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${data.skills?.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

async function generateAllPreviews() {
  console.log('🚀 Generating Visual Appeal template previews that match VisualAppealRenderer...');

  const templateKeys = Object.keys(visualAppealTemplates);

  for (const templateKey of templateKeys) {
    const template = visualAppealTemplates[templateKey];
    try {
      await generateTemplatePreview(templateKey, template);
    } catch (error) {
      console.error(`❌ Error generating preview for ${templateKey}:`, error.message);
    }
  }

  console.log('🎉 All Visual Appeal template previews generated successfully!');
  console.log('📸 Each preview now matches the exact styling of VisualAppealRenderer');
}

// Run the preview generation
generateAllPreviews().catch(console.error);