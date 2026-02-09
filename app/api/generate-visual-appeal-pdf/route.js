import puppeteer from "puppeteer";
import { NextResponse } from 'next/server';
import { getChromiumLaunchOptions } from "../../lib/puppeteerChromium";
import { visualAppealTemplates } from "../../lib/visualAppealTemplates";
import { parseRichTextForPDF } from "../../lib/richTextRenderer";

// Use Node.js runtime for headless Chrome
export const runtime = 'nodejs';
export const maxDuration = 120;

// Browser instance management
let browserInstance = null;

async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    try {
      await browserInstance.version();
      return browserInstance;
    } catch (error) {
      console.log("Browser instance disconnected, creating new one");
      browserInstance = null;
    }
  }

  const isProduction = process.env.NODE_ENV === "production";
  const { executablePath, args: chromiumArgs } = await getChromiumLaunchOptions();

  try {
    browserInstance = await puppeteer.launch({
      args: [
        ...chromiumArgs,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--font-render-hinting=none",
        "--enable-font-antialiasing",
        "--force-color-profile=srgb",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-ipc-flooding-protection",
        "--memory-pressure-off",
        "--max_old_space_size=4096",
      ],
      defaultViewport: { width: 794, height: 1123 },
      executablePath: isProduction ? executablePath : undefined,
      headless: "new",
      timeout: 30000,
    });

    console.log("Browser launched successfully");
    return browserInstance;
  } catch (error) {
    console.error("Failed to launch browser:", error);
    throw error;
  }
}


// Helper function to normalize skills data
function normalizeSkill(skill) {
  if (typeof skill === 'string') {
    return { name: skill, proficiency: null };
  }
  if (typeof skill === 'object' && skill !== null) {
    return {
      name: skill.name || skill.skill || skill.title || 'Unknown Skill',
      proficiency: skill.proficiency || skill.level || skill.rating || null
    };
  }
  return { name: 'Unknown Skill', proficiency: null };
}

// Helper function to normalize experience data
function normalizeExperienceData(experienceData) {
  if (!experienceData || !Array.isArray(experienceData)) return [];

  return experienceData.map(exp => ({
    ...exp,
    jobTitle: exp.jobTitle || exp.title || exp.position || "Job Title"
  }));
}

// Normalize custom sections data to ensure they're always properly structured
function normalizeCustomSections(customSections) {
  if (!customSections) return [];
  if (!Array.isArray(customSections)) return [];

  return customSections
    .map(section => {
      if (typeof section === 'string') {
        // If it's a string, treat it as a title with type "project"
        return {
          type: "project",
          title: section.trim(),
          description: "",
          date: ""
        };
      } else if (typeof section === 'object' && section !== null) {
        return {
          type: section.type || "project",
          title: section.title || "",
          description: section.description || "",
          date: section.date || "",
          company: section.company || "",
          position: section.position || "",
          location: section.location || "",
          name: section.name || "",
          email: section.email || "",
          phone: section.phone || ""
        };
      } else {
        return null;
      }
    })
    .filter(section => section !== null && (section.title || section.description || section.name)); // Keep sections with any content
}

// Generate Visual Appeal Resume HTML
function generateVisualAppealResumeHTML(data, template, customColors = {}, language = "en", country = "us", preferences = {}) {
  // Normalize custom sections - preserve original order
  const normalizedCustomSections = normalizeCustomSections(data.customSections);

  // Normalize the data
  // Don't extract achievements from customSections - let them render in their original position
  // The achievements section will use data.achievements if it exists
  const normalizedData = {
    ...data,
    customSections: normalizedCustomSections, // Keep all sections including achievements to preserve order
    experience: normalizeExperienceData(data.experience)
    // Use data.achievements as-is, don't extract from customSections to avoid duplication
  };

  // Get template configuration
  const layout = template.layout || {};
  const styles = template.styles || {};
  const visualFeatures = template.visualFeatures || {};

  // Merge colors with template defaults
  const mergedColors = {
    primary: styles?.colors?.primary || "#1e40af",
    secondary: styles?.colors?.secondary || "#475569",
    accent: styles?.colors?.accent || "#3b82f6",
    text: styles?.colors?.text || "#1f2937",
    background: styles?.colors?.background || "#ffffff",
    sidebarBackground: styles?.colors?.sidebarBackground || "#f8fafc",
    sidebarText: styles?.colors?.sidebarText || "#1f2937",
    accentLight: styles?.colors?.accentLight || "#dbeafe",
    gradientStart: styles?.colors?.gradientStart || "#1e40af",
    gradientEnd: styles?.colors?.gradientEnd || "#3b82f6",
    ...customColors
  };

  // Get visual effects
  const visualEffects = styles?.visualEffects || {};

  // Show photo by default, only hide if explicitly deleted (empty string)
  const shouldShowPhoto = data.photo !== ""; // Only hide if explicitly deleted
  const photoUrl = shouldShowPhoto ? (data.photo || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE2MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE4MCAxNDBMMjAwIDEyMEwyMjAgMTQwTDIwMCAxNjBMMTgwIDE0MFoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiPkFkZCBQaG90bzwvdGV4dD4KPC9zdmc+") : null;

  // Generate CSS
  const generateCSS = () => {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: ${styles.fontFamily || "'Inter', 'Helvetica Neue', sans-serif"};
        font-size: ${styles.fontSize || "11pt"};
        line-height: ${styles.lineHeight || "1.5"};
        color: ${mergedColors.text};
        background: ${mergedColors.background};
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .visual-appeal-resume {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: ${mergedColors.background};
      }

      .resume-container {
        display: flex;
        min-height: 100vh;
        gap: 2rem;
      }

      .single-column-container {
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
      }

      .sidebar {
        width: ${layout.sidebarWidth || "35%"};
        padding: 0 ${styles?.spacing?.contentPadding || "1.5rem"} ${styles?.spacing?.contentPadding || "1.5rem"} ${styles?.spacing?.contentPadding || "1.5rem"};
        flex-shrink: 0;
        background: ${mergedColors.sidebarBackground};
        color: ${mergedColors.sidebarText};
        ${(() => {
        // Apply different sidebar styles based on layout type
        switch (layout.layoutType) {
          case "dark-sidebar-with-timeline":
            return `border-radius: 0 1rem 1rem 0;`;
          case "clean-sidebar-photo":
            return `border-right: 2px solid ${mergedColors.accentLight}; border-radius: 0 0.5rem 0.5rem 0;`;
          case "timeline-with-sidebar":
            return `border-right: 3px solid ${mergedColors.accent};`;
          case "luxury-sidebar-with-awards":
            return `border-right: 4px solid ${mergedColors.fashionGold || mergedColors.accent}; border-radius: 0 1rem 1rem 0;`;
          case "card-based-professional":
            return `border-right: 2px solid ${mergedColors.accentLight}; border-radius: 0.75rem;`;
          default:
            return `border-radius: 0 1rem 1rem 0;`;
        }
      })()}
        ${visualEffects.cardShadow ? `box-shadow: ${visualEffects.cardShadow};` : ''}
      }

      .main-content {
        flex: 1;
        padding: 0 ${styles?.spacing?.contentPadding || "1.5rem"} ${styles?.spacing?.contentPadding || "1.5rem"} ${styles?.spacing?.contentPadding || "1.5rem"};
      }

      .section-header {
        margin-bottom: 1rem;
        margin-top: 1.25rem;
      }

      .main-content .section-header:first-child {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
      .main-content > div:first-child {
        margin-top: ${styles?.spacing?.contentPadding || "1.5rem"} !important;
        padding-top: 0 !important;
      }
      
      .sidebar > div:first-child {
        margin-top: ${styles?.spacing?.contentPadding || "1.5rem"} !important;
        padding-top: 0 !important;
      }

      /* Simple and effective page flow (copied from working ATS PDF API) */
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
      }

      .header {
        margin-bottom: 1.5rem;
        text-align: center;
      }

      .header-banner {
        background: ${visualEffects.headerGradient || `linear-gradient(135deg, ${mergedColors.gradientStart} 0%, ${mergedColors.gradientEnd} 100%)`};
        padding: ${styles?.spacing?.headerPadding || "2.5rem"};
        min-height: 180px;
        border-radius: 1rem;
        ${visualEffects.creativeShadow ? `box-shadow: ${visualEffects.creativeShadow};` : ''}
        position: relative;
        overflow: hidden;
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

      .header-single-column {
        margin-bottom: 0.5rem;
        padding: 0.75rem 0;
        border-bottom: 2px solid ${mergedColors.accent};
      }

      .header-content-single {
        display: flex;
        align-items: center;
        gap: 2rem;
      }

      .profile-photo-single {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid ${mergedColors.accent};
        flex-shrink: 0;
      }

      .header-text-single {
        flex: 1;
      }

      .header-text-single .header-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: ${mergedColors.primary};
        margin: 0 0 0.5rem 0;
        letter-spacing: -0.02em;
      }

      .header-text-single .header-subtitle {
        font-size: 1.25rem;
        font-weight: 600;
        color: ${mergedColors.secondary};
        margin: 0 0 1rem 0;
      }

      .header-contact {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: ${mergedColors.text};
      }

      .header-contact span {
        white-space: nowrap;
      }

      .profile-photo {
        width: 128px;
        height: 128px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid white;
        ${visualEffects.photoShadow ? `box-shadow: ${visualEffects.photoShadow};` : ''}
        margin: 0 auto 1rem auto;
        display: block;
      }

      .sidebar-name {
        text-align: center;
      }

      .sidebar-title {
        text-align: center;
      }

      .sidebar-section {
        margin-bottom: 1.25rem;
      }

      .section-header {
        font-weight: 700;
        margin-bottom: 1rem;
        margin-top: 1.25rem;
        position: relative;
        color: ${mergedColors.primary};
        font-size: 1.15rem;
        letter-spacing: 0.05em;
      }

      .sidebar .section-header {
        color: ${mergedColors.sidebarText};
      }

      .section-header::after {
        content: '';
        position: absolute;
        bottom: -0.5rem;
        left: 0;
        width: 60px;
        height: 4px;
        background: linear-gradient(90deg, ${mergedColors.accent} 0%, ${mergedColors.gradientEnd} 100%);
        border-radius: 2px;
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
        color: ${mergedColors.sidebarText};
      }

      .skills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .skill-item {
        width: auto;
      }

      .skill-tag {
        padding: 0.35rem 0.6rem;
        border-radius: 0.35rem;
        font-size: 0.8rem;
        font-weight: 500;
        background: ${mergedColors.accentLight};
        color: ${mergedColors.primary};
        display: inline-block;
        width: auto;
        text-align: left;
      }

      .certification-item {
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        color: ${mergedColors.sidebarText};
      }

      .certification-item .name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .certification-item .issuer {
        font-size: 0.75rem;
        opacity: 0.8;
      }

      .certification-item .date {
        font-size: 0.75rem;
        opacity: 0.7;
      }

      .language-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .language-item .language {
        font-weight: 500;
        font-size: 0.875rem;
        color: ${mergedColors.sidebarText};
      }

      .language-item .proficiency {
        font-size: 0.75rem;
        opacity: 0.8;
        color: ${mergedColors.sidebarText};
      }

      .summary-card {
        background: ${mergedColors.accentLight};
        padding: 1rem;
        border-radius: 0.5rem;
        ${visualEffects.cardShadow ? `box-shadow: ${visualEffects.cardShadow};` : ''}
        margin-bottom: 1rem;
      }

      .summary-text {
        font-size: 0.875rem;
        line-height: 1.6;
        color: ${mergedColors.text};
      }

      .experience-item {
        margin-bottom: 1rem;
        padding: 1rem;
        background: #ffffff;
        border-radius: 0.5rem;
        ${visualEffects.cardShadow ? `box-shadow: ${visualEffects.cardShadow};` : ''}
      }

      .job-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }

      .job-title {
        font-weight: 700;
        font-size: 1.125rem;
        color: ${mergedColors.primary};
        margin-bottom: 0.25rem;
      }

      .company {
        font-weight: 600;
        font-size: 1rem;
        color: ${mergedColors.secondary};
        margin-bottom: 0.25rem;
      }

      .location {
        font-size: 0.875rem;
        opacity: 0.8;
        color: ${mergedColors.text};
      }

      .job-date {
        font-size: 0.875rem;
        font-weight: 500;
        color: ${mergedColors.text};
        text-align: right;
      }

      .job-description {
        margin-top: 0.75rem;
        padding-left: 1.5rem;
      }

      .job-description li {
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.5;
        color: ${mergedColors.text};
        list-style-type: disc;
        display: list-item;
      }

      .project-description {
        margin-top: 0.5rem;
        padding-left: 1.5rem;
      }

      .project-description li {
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.5;
        color: ${mergedColors.text};
        list-style-type: disc;
        display: list-item;
      }

      .custom-section-description {
        margin-top: 0.75rem;
        padding-left: 1.5rem;
      }

      .custom-section-description li {
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.5;
        color: ${mergedColors.text};
        list-style-type: disc;
        display: list-item;
      }

      .education-item {
        margin-bottom: 0.75rem;
        padding: 1rem;
        background: #ffffff;
        border-radius: 0.5rem;
        ${visualEffects.cardShadow ? `box-shadow: ${visualEffects.cardShadow};` : ''}
      }

      .education-degree {
        font-weight: 700;
        font-size: 1rem;
        color: ${mergedColors.primary};
        margin-bottom: 0.25rem;
      }

      .education-school {
        font-weight: 600;
        font-size: 0.875rem;
        color: ${mergedColors.secondary};
        margin-bottom: 0.25rem;
      }

      .education-details {
        font-size: 0.75rem;
        opacity: 0.8;
        color: ${mergedColors.text};
      }

      .skills-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        padding: 1.25rem;
        background: #ffffff;
        border-radius: 0.75rem;
        ${visualEffects.cardShadow ? `box-shadow: ${visualEffects.cardShadow};` : ''}
      }

      .project-item {
        margin-bottom: 0.75rem;
        padding: 1rem;
        background: #ffffff;
        border-radius: 0.5rem;
        ${visualEffects.cardShadow ? `box-shadow: ${visualEffects.cardShadow};` : ''}
      }

      .project-title {
        font-weight: 700;
        font-size: 1rem;
        color: ${mergedColors.primary};
        margin-bottom: 0.5rem;
      }

      .project-description {
        font-size: 0.875rem;
        line-height: 1.5;
        color: ${mergedColors.text};
        margin-bottom: 0.5rem;
      }

      .project-technologies {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .tech-tag {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
        background: ${mergedColors.accentLight};
        color: ${mergedColors.primary};
      }

      .project-url {
        font-size: 0.875rem;
        color: #2563eb;
        text-decoration: none;
      }

      .achievements-list {
        padding: 0.75rem 1rem;
        background: #ffffff;
        border-radius: 0.75rem;
        ${visualEffects.cardShadow ? `box-shadow: ${visualEffects.cardShadow};` : ''}
      }

      .achievement-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 0.5rem;
      }

      .achievement-icon {
        color: #f59e0b;
        margin-right: 0.5rem;
        margin-top: 0.125rem;
      }

      .achievement-text {
        font-size: 0.875rem;
        line-height: 1.5;
        color: ${mergedColors.text};
      }

      .languages-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        padding: 1.25rem;
        background: #ffffff;
        border-radius: 0.75rem;
        ${visualEffects.cardShadow ? `box-shadow: ${visualEffects.cardShadow};` : ''}
      }

      .language-item-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .language-name {
        font-weight: 500;
        color: ${mergedColors.text};
      }

      .language-proficiency {
        font-size: 0.875rem;
        opacity: 0.8;
        color: ${mergedColors.text};
      }

      .main-section {
        margin-bottom: 1rem;
      }

      .custom-section {
        margin-bottom: 0.75rem;
        padding: 0.75rem 1rem;
        background: #ffffff;
        border-radius: 0.75rem;
        ${visualEffects.cardShadow ? `box-shadow: ${visualEffects.cardShadow};` : ''}
      }

      .custom-section-title {
        font-weight: 700;
        font-size: 1rem;
        color: ${mergedColors.primary};
        margin-bottom: 0.5rem;
      }

      .custom-section-description {
        font-size: 0.875rem;
        line-height: 1.5;
        color: ${mergedColors.text};
        margin-bottom: 0.5rem;
      }

      .custom-section-date {
        font-size: 0.75rem;
        opacity: 0.8;
        color: ${mergedColors.text};
      }

      .custom-section-company {
        font-size: 0.875rem;
        font-weight: 500;
        color: ${mergedColors.text};
      }

      .custom-section-position {
        font-size: 0.875rem;
        color: ${mergedColors.text};
      }

      .custom-section-location {
        font-size: 0.75rem;
        opacity: 0.8;
        color: ${mergedColors.text};
      }

      .reference-info {
        margin-top: 0.5rem;
      }

      .reference-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: ${mergedColors.text};
      }

      .reference-contact {
        font-size: 0.75rem;
        color: ${mergedColors.text};
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .visual-appeal-resume {
          box-shadow: none;
        }
      }
    `;
  };

  // Generate sidebar HTML
  const generateSidebarHTML = () => {
    if (!layout.sidebarSections?.length) return '';

    return `
      <div class="sidebar">
        ${layout.showProfilePicture && layout.headerStyle !== "colored-banner-with-photo" && shouldShowPhoto ? `<div style="text-align: center;"><img src="${photoUrl}" alt="Profile" class="profile-photo"></div>` : ''}
        
        ${layout.columns === 2 && layout.headerStyle !== "colored-banner-with-photo" ? `
          <div class="sidebar-section text-center" style="margin-bottom: 1.5rem;">
            <h1 class="sidebar-name" style="font-size: 1.5rem; font-weight: 700; color: ${mergedColors.sidebarText}; margin-bottom: 0.5rem; letter-spacing: 0.02em;">
              ${data.name || "Your Name"}
            </h1>
            ${data.jobTitle ? `<p class="sidebar-title" style="font-size: 1rem; font-weight: 600; color: ${mergedColors.sidebarText === "#ffffff" ? "#e2e8f0" : mergedColors.secondary};">
              ${data.jobTitle}
            </p>` : ''}
          </div>
        ` : ''}
        
        ${layout.sidebarSections.includes('personal') && (data.email || data.phone || data.address || data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) ? `
          <div class="sidebar-section">
            <h2 class="section-header">CONTACT</h2>
            <div>
              ${data.email ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></span><span class="text">${data.email || ''}</span></div>` : ''}
              ${data.phone ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></span><span class="text">${data.phone || ''}</span></div>` : ''}
              ${data.address ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></span><span class="text">${data.address || ''}</span></div>` : ''}
              ${data.dateOfBirth ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg></span><span class="text">DOB: ${data.dateOfBirth || ''}</span></div>` : ''}
              ${data.gender ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span><span class="text">${data.gender || ''}</span></div>` : ''}
              ${data.maritalStatus ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5l-.99-1.51A2.5 2.5 0 0 0 11.01 8H9.46a1.5 1.5 0 0 0-1.42 1.37L5.5 17H8v5h2v-6h2.5l1.5 6h2l1.5-6H20v6h2z"/></svg></span><span class="text">${data.maritalStatus || ''}</span></div>` : ''}
              ${data.linkedin ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></span><span class="text">${data.linkedin || ''}</span></div>` : ''}
              ${data.portfolio ? `<div class="contact-item"><span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span><span class="text">${data.portfolio || ''}</span></div>` : ''}
            </div>
          </div>
        ` : ''}
        
        ${layout.sidebarSections.includes('skills') && data.skills?.length > 0 ? `
          <div class="sidebar-section">
            <h2 class="section-header">SKILLS</h2>
            <div class="skills-container">
              ${data.skills?.map(skill => {
      const skillName = typeof skill === 'string' ? skill : skill.name || skill;
      return `<div class="skill-item relative"><div class="skill-tag">${skillName || ''}</div></div>`;
    }).join('')}
            </div>
          </div>
        ` : ''}
        
        ${layout.sidebarSections.includes('certifications') && data.certifications?.length > 0 ? `
          <div class="sidebar-section">
            <h2 class="section-header">CERTIFICATIONS</h2>
            <div>
              ${data.certifications?.map(cert => `
                <div class="certification-item">
                  <div class="name">${cert.name || ''}</div>
                  ${cert.issuer ? `<div class="issuer">${cert.issuer || ''}</div>` : ''}
                  ${cert.date ? `<div class="date">${cert.date || ''}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${layout.sidebarSections.includes('languages') && data.languages?.length > 0 ? `
          <div class="sidebar-section">
            <h2 class="section-header">LANGUAGES</h2>
            <div>
              ${data.languages?.map(lang => `
                <div class="language-item">
                  <span class="language">${lang.language || ''}</span>
                  ${lang.proficiency ? `<span class="proficiency">${lang.proficiency}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  // Generate main content HTML
  const generateMainContentHTML = () => {
    const mainSections = layout.mainSections || [];

    return `
      <div class="main-content">
        ${mainSections.map(section => {
      switch (section) {
        case 'summary':
          return data.summary ? `
                <h2 class="section-header">PROFESSIONAL SUMMARY</h2>
                <div class="summary-card">
                  <div class="summary-text" style="white-space: pre-line;">${parseRichTextForPDF(data.summary || '')}</div>
                </div>
              ` : '';

        case 'experience':
          return normalizedData.experience?.length > 0 ? `
                <h2 class="section-header">WORK EXPERIENCE</h2>
                ${normalizedData.experience?.map(exp => `
                  <div class="experience-item">
                    <div class="job-header">
                      <div>
                        <div class="job-title">${exp.jobTitle || ''}</div>
                        <div class="company">${exp.company || ''}</div>
                        ${exp.location ? `<div class="location">${exp.location || ''}</div>` : ''}
                      </div>
                      <div class="job-date">${(() => {
              const start = exp.startDate ? exp.startDate.trim() : '';
              const end = exp.endDate ? exp.endDate.trim() : '';
              if (!start && !end) return '';
              if (!start) return end;
              if (!end) return start;
              return `${start} - ${end}`;
            })()}</div>
                    </div>
                    ${exp.description ? `
                      <ul class="job-description">
                        ${(() => {
                let lines;
                if (Array.isArray(exp.description)) {
                  lines = exp.description.map(l => String(l).trim()).filter(Boolean);
                } else {
                  lines = String(exp.description).split('\n').map(l => l.trim()).filter(Boolean);
                }
                return lines.map(line => `<li>${line.replace(/^[-•*]\s*/, '')}</li>`).join('');
              })()}
                      </ul>
                    ` : ''}
                  </div>
                `).join('')}
              ` : '';

        case 'education':
          return data.education?.length > 0 ? `
                <h2 class="section-header">EDUCATION</h2>
                ${data.education?.map(edu => `
                  <div class="education-item">
                    <div class="education-degree">${edu.degree || ''}</div>
                    <div class="education-school">${edu.school || edu.institution || ''}</div>
                    <div class="education-details">${(() => {
              const start = edu.startDate ? edu.startDate.trim() : '';
              const end = edu.endDate ? edu.endDate.trim() : '';
              let datePart = '';
              if (start && end) {
                datePart = `${start} - ${end}`;
              } else if (start) {
                datePart = start;
              } else if (end) {
                datePart = end;
              }
              const gpaPart = edu.gpa ? `GPA: ${edu.gpa}` : '';
              return datePart && gpaPart ? `${datePart} | ${gpaPart}` : datePart || gpaPart || '';
            })()}</div>
                  </div>
                `).join('')}
              ` : '';

        case 'projects':
          return data.projects?.length > 0 ? `
                <h2 class="section-header">PROJECTS</h2>
                ${data.projects?.map(project => `
                  <div class="project-item">
                    <div class="project-title">${project.name || project.title || ''}</div>
                    ${project.description ? `
                      <ul class="project-description">
                        ${(() => {
                let lines;
                if (Array.isArray(project.description)) {
                  lines = project.description.map(l => String(l).trim()).filter(Boolean);
                } else {
                  lines = String(project.description).split('\n').map(l => l.trim()).filter(Boolean);
                }
                if (lines.length > 1) {
                  return lines.map(line => `<li>${line.replace(/^[-•*]\s*/, '')}</li>`).join('');
                }
                return `<div style="list-style: none; padding-left: 0;">${lines[0] || ''}</div>`;
              })()}
                      </ul>
                    ` : ''}
                    ${project.technologies ? `
                      <div class="project-technologies">
                        ${(() => {
                const techs = Array.isArray(project.technologies)
                  ? project.technologies
                  : typeof project.technologies === 'string'
                    ? project.technologies.split(',')
                    : [];
                return techs.map(tech => `
                            <span class="tech-tag">${typeof tech === 'string' ? tech.trim() : tech || ''}</span>
                          `).join('');
              })()}
                      </div>
                    ` : ''}
                    ${project.url ? `<a href="${project.url || ''}" class="project-url">View Project →</a>` : ''}
                  </div>
                `).join('')}
              ` : '';

        case 'achievements':
          // Only render achievements section if data.achievements exists (not from customSections)
          // Achievements in customSections will be rendered in their original position
          return data.achievements?.length > 0 ? `
                <h2 class="section-header">ACHIEVEMENTS</h2>
                <div class="achievements-list">
                  <ul>
                    ${data.achievements?.map(achievement => `
                      <li class="achievement-item">
                        <span class="achievement-text">${achievement || ''}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : '';

        case 'languages':
          return data.languages?.length > 0 ? `
                <div class="main-section">
                  <h2 class="section-header">LANGUAGES</h2>
                  <div class="languages-grid">
                    ${data.languages?.map(lang => `
                      <div class="language-item-main">
                        <span class="language-name">${lang.language}</span>
                        ${lang.proficiency ? `<span class="language-proficiency">${lang.proficiency}</span>` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : '';

        case 'customSections':
          if (!normalizedData.customSections || normalizedData.customSections.length === 0) return '';

          // Group custom sections by type
          const groups = normalizedData.customSections.reduce((acc, current) => {
            const type = (current.type || "project").toLowerCase();
            if (!acc[type]) acc[type] = [];
            acc[type].push(current);
            return acc;
          }, {});

          return Object.entries(groups).map(([type, items]) => {
            const sectionTitle = (type.charAt(0).toUpperCase() + type.slice(1) + (type.endsWith('s') ? '' : 's'));

            // Render items in this group
            const itemsHtml = items.map(customSection => {
              const itemTitle = customSection.name || customSection.title || "";

              return `
                  <div class="main-section">
                    <div class="custom-section">
                      ${itemTitle ? `<div class="custom-section-title">${itemTitle}</div>` : ''}
                      ${customSection.description ? `
                        <ul class="custom-section-description">
                          ${(() => {
                    let lines;
                    if (Array.isArray(customSection.description)) {
                      lines = customSection.description.map(l => String(l).trim()).filter(Boolean);
                    } else {
                      lines = String(customSection.description).split('\n').map(l => l.trim()).filter(Boolean);
                    }

                    // Deduplication logic
                    const excludeTexts = [sectionTitle, itemTitle].filter(Boolean).map(t => t.toLowerCase());
                    if (lines.length > 0 && excludeTexts.length > 0) {
                      const firstLine = lines[0].toLowerCase().trim().replace(/^[-•*]\s*/, "");
                      const isRedundant = excludeTexts.some(exclude =>
                        firstLine === exclude || firstLine.includes(exclude) || exclude.includes(firstLine)
                      );
                      if (isRedundant) lines.shift();
                    }

                    return lines.map(line => `<li>${line.replace(/^[-•*]\s*/, '')}</li>`).join('');
                  })()}
                        </ul>
                      ` : ''}
                      ${customSection.date ? `<div class="custom-section-date">${customSection.date}</div>` : ''}
                      ${customSection.company ? `<div class="custom-section-company">${customSection.company}</div>` : ''}
                      ${customSection.position ? `<div class="custom-section-position">${customSection.position}</div>` : ''}
                      ${customSection.location ? `<div class="custom-section-location">${customSection.location}</div>` : ''}
                      ${customSection.name && customSection.type === 'reference' ? `
                        <div class="reference-info">
                          <div class="reference-name">${customSection.name}</div>
                          ${customSection.email ? `<div class="reference-contact">${customSection.email}</div>` : ''}
                          ${customSection.phone ? `<div class="reference-contact">${customSection.phone}</div>` : ''}
                        </div>
                      ` : ''}
                    </div>
                  </div>
              `;
            }).join('');

            return `
              <div class="main-section">
                <h2 class="section-header">${sectionTitle}</h2>
                ${itemsHtml}
              </div>
            `;
          }).join('');

        default:
          return '';
      }
    }).join('')}
      </div>
    `;
  };

  // Generate header HTML
  const generateHeaderHTML = () => {
    // For two-column layouts, only show header if it's a banner style
    if (layout.columns === 2 && layout.headerStyle !== "colored-banner-with-photo") {
      return ''; // Name and title are in sidebar for two-column layouts
    }

    if (layout.headerStyle === "colored-banner-with-photo") {
      return `
        <div class="header-banner">
          <div class="header-content">
            ${shouldShowPhoto ? `<img src="${photoUrl}" alt="Profile" class="profile-photo">` : ''}
            <div class="header-text">
              <h1 class="header-title">${data.name || "Your Name"}</h1>
              ${data.jobTitle ? `<p class="header-subtitle">${data.jobTitle}</p>` : ''}
            </div>
          </div>
        </div>
      `;
    } else if (layout.headerStyle === "single-column-header-photo") {
      return `
        <div class="header-single-column">
          <div class="header-content-single">
            ${shouldShowPhoto ? `<img src="${photoUrl}" alt="Profile" class="profile-photo-single">` : ''}
            <div class="header-text-single">
              <h1 class="header-title">${data.name || "Your Name"}</h1>
              ${data.jobTitle ? `<p class="header-subtitle">${data.jobTitle}</p>` : ''}
              <div class="header-contact">
                ${data.email ? `<span>${data.email || ''}</span>` : ''}
                ${data.email && data.phone ? '<span>•</span>' : ''}
                ${data.phone ? `<span>${data.phone || ''}</span>` : ''}
                ${data.phone && data.address ? '<span>•</span>' : ''}
                ${data.address ? `<span>${data.address || ''}</span>` : ''}
                ${data.address && data.linkedin ? '<span>•</span>' : ''}
                ${data.linkedin ? `<span>${data.linkedin || ''}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="header">
          <h1 class="header-title">${data.name || "Your Name"}</h1>
          ${data.jobTitle ? `<p class="header-subtitle">${data.jobTitle}</p>` : ''}
        </div>
      `;
    }
  };

  // Generate layout based on template configuration
  const generateLayoutHTML = () => {
    if (layout.columns === 2) {
      // For two-column layouts, check if header should be rendered
      if (layout.headerStyle === "colored-banner-with-photo") {
        return `
          ${generateHeaderHTML()}
          <div class="resume-container">
            ${generateSidebarHTML()}
            ${generateMainContentHTML()}
          </div>
        `;
      } else {
        return `
          <div class="resume-container">
            ${generateSidebarHTML()}
            ${generateMainContentHTML()}
          </div>
        `;
      }
    } else {
      // For single-column layouts
      if (layout.headerStyle === "single-column-header-photo") {
        return `
          <div class="single-column-container">
            ${generateHeaderHTML()}
            ${generateMainContentHTML()}
          </div>
        `;
      } else {
        return `
          <div class="single-column-container">
            ${generateMainContentHTML()}
          </div>
        `;
      }
    }
  };

  // Generate complete HTML
  const html = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Visual Appeal Resume</title>
      <style>${generateCSS()}</style>
    </head>
    <body>
      <div class="visual-appeal-resume">
        ${generateLayoutHTML()}
      </div>
    </body>
    </html>
  `;

  return html;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      data,
      template,
      customColors = {},
      language = "en",
      country = "us",
      preferences = {}
    } = body;

    console.log("Visual Appeal PDF generation request:", {
      template,
      hasData: !!data,
      language,
      country
    });

    // Validate required data
    if (!data) {
      return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
    }

    // Get template configuration
    let templateConfig;
    if (typeof template === 'string') {
      templateConfig = visualAppealTemplates[template];
    } else {
      templateConfig = template;
    }

    if (!templateConfig) {
      return NextResponse.json({ error: "Template not found" }, { status: 400 });
    }

    // Generate HTML
    const html = generateVisualAppealResumeHTML(data, templateConfig, customColors, language, country, preferences);

    // Get browser instance
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      // Set page settings
      await page.setDefaultTimeout(30000);
      await page.setDefaultNavigationTimeout(30000);

      // Set viewport for better rendering
      await page.setViewport({
        width: 794,
        height: 1123,
        deviceScaleFactor: 2
      });

      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for fonts and images to load
      await page.evaluateHandle('document.fonts.ready');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.3in',
          right: '0.3in',
          bottom: '0.3in',
          left: '0.3in'
        },
        timeout: 30000
      });

      console.log("Visual Appeal PDF generated successfully");

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="visual-appeal-resume.pdf"',
          'Cache-Control': 'no-cache'
        }
      });

    } finally {
      await page.close();
    }

  } catch (error) {
    console.error("Error generating Visual Appeal PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
}
