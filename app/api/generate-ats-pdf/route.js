import puppeteer from "puppeteer";
// import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { NextResponse } from 'next/server';
import { atsFriendlyTemplates } from '../../lib/atsFriendlyTemplates';

// Use Node.js runtime for headless Chrome
export const runtime = 'nodejs';
export const maxDuration = 120;

// Browser instance management (same as working API)
let browserInstance = null;

// Sanitize filename to remove Unicode characters that cause ByteString errors
const sanitizeFilename = (str) => {
  if (!str) return '';
  return str
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Keep only alphanumeric, spaces, hyphens, underscores
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50); // Limit length
};

async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    try {
      // Test if browser is still responsive
      await browserInstance.version();
      return browserInstance;
    } catch (error) {
      console.log("Browser instance disconnected, creating new one");
      browserInstance = null;
    }
  }

  const isProduction = process.env.NODE_ENV === "production";

  try {
    browserInstance = await puppeteer.launch({
      args: [
        ...(isProduction ? chromium.args : []),
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
      executablePath: isProduction ? await chromium.executablePath() : undefined,
      headless: "new",
      timeout: 30000,
    });

    // Close browser on process exit
    process.on("exit", async () => {
      if (browserInstance && browserInstance.isConnected()) {
        await browserInstance.close();
      }
    });

    return browserInstance;
  } catch (error) {
    console.error("Failed to launch browser:", error);
    throw new Error("Failed to initialize PDF generation service");
  }
}

export async function POST(request) {
  console.log('🚀 ATS PDF API ROUTE CALLED - POST method triggered');
  console.log('🔥🔥🔥 THIS SHOULD BE VISIBLE IF ROUTE IS CALLED 🔥🔥🔥');
  try {
    console.log('ATS PDF API - Starting request processing... [DEBUG V2]');

    // Safely parse request body with error handling
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        console.error('ATS PDF API - Empty request body');
        return NextResponse.json(
          { error: 'Request body is empty' },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (jsonError) {
      console.error('ATS PDF API - JSON parse error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: jsonError.message },
        { status: 400 }
      );
    }

    console.log('ATS PDF API - Request body received:', Object.keys(body || {}));

    if (!body || typeof body !== 'object') {
      console.error('ATS PDF API - Invalid body format');
      return NextResponse.json(
        { error: 'Invalid request body format' },
        { status: 400 }
      );
    }

    const { data, template } = body;

    if (!data || !template) {
      console.log('ATS PDF API - Missing data or template:', { hasData: !!data, hasTemplate: !!template });
      return NextResponse.json(
        { error: 'Missing required data or template' },
        { status: 400 }
      );
    }

    console.log('ATS PDF API - Template structure:', {
      name: template.name,
      category: template.category,
      hasLayout: !!template.layout,
      headerStyle: template.layout?.headerStyle,
      layoutKeys: template.layout ? Object.keys(template.layout) : []
    });

    console.log('ATS PDF API - Data structure:', {
      name: data.name,
      hasEmail: !!data.email,
      hasPhone: !!data.phone,
      hasAddress: !!data.address,
      hasLinkedin: !!data.linkedin,
      hasPortfolio: !!data.portfolio,
      dataKeys: Object.keys(data)
    });

    // Resolve template if it's a string ID
    let templateConfig = template;
    if (typeof template === 'string') {
      if (atsFriendlyTemplates[template]) {
        console.log(`ATS PDF API - Resolving template ID "${template}" to config object`);
        templateConfig = atsFriendlyTemplates[template];
      } else {
        console.warn(`ATS PDF API - Template ID "${template}" not found in registry, using as-is`);
      }
    }

    // Ensure templateConfig has required properties
    if (!templateConfig.styles) {
      console.error('ATS PDF API - Template config missing "styles" property');
      // Attempt fallback or error
    }

    // Debug: Log specific data fields that might be undefined
    console.log('ATS PDF API - Experience data:', {
      hasExperience: !!data.experience,
      experienceLength: data.experience?.length,
      firstExp: data.experience?.[0],
      firstExpKeys: data.experience?.[0] ? Object.keys(data.experience[0]) : null
    });

    console.log('ATS PDF API - Education data:', {
      hasEducation: !!data.education,
      educationLength: data.education?.length,
      firstEdu: data.education?.[0],
      firstEduKeys: data.education?.[0] ? Object.keys(data.education[0]) : null
    });

    // Debug: Log customSections data
    console.log('ATS PDF API - CustomSections data:', {
      hasCustomSections: !!data.customSections,
      customSectionsLength: data.customSections?.length,
      customSectionsTypes: data.customSections?.map(cs => cs.type),
      customSectionsData: data.customSections
    });

    console.log('ATS PDF API - Skills data:', {
      hasSkills: !!data.skills,
      skillsLength: data.skills?.length,
      firstSkill: data.skills?.[0],
      firstSkillKeys: data.skills?.[0] ? Object.keys(data.skills[0]) : null
    });

    // Generate HTML for ATS template
    console.log('ATS PDF API - Generating HTML...');
    let html;
    try {
      // Use resolved templateConfig instead of raw template input
      html = generateATSTemplateHTML(data, templateConfig);
      console.log('ATS PDF API - HTML generated successfully, length:', html.length);

      // Log a sample of the HTML to check for issues
      console.log('ATS PDF API - HTML sample (first 500 chars):', html.substring(0, 500));
      console.log('ATS PDF API - HTML sample (last 500 chars):', html.substring(Math.max(0, html.length - 500)));

      // Check for common HTML issues
      if (html.includes('undefined') || html.includes('null') || html.includes('NaN')) {
        console.warn('ATS PDF API - HTML contains undefined/null/NaN values');
      }


    } catch (htmlError) {
      console.error('ATS PDF API - HTML generation failed:', htmlError);
      return NextResponse.json(
        { error: 'Failed to generate HTML template' },
        { status: 500 }
      );
    }

    // Generate PDF using the same proven approach as the working API
    console.log('ATS PDF API - Starting PDF generation...');

    let browser = null;
    let page = null;

    try {
      browser = await getBrowser();
      page = await browser.newPage();

      // Set page timeout (same as working API)
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      // Set content with the same wait strategy as working API
      console.log('ATS PDF API - Setting page content...');
      await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log('ATS PDF API - Page content set successfully');

      // Wait for fonts to load (same as working API)
      await page.evaluate(async () => {
        if (document.fonts) {
          await document.fonts.ready;
        }
      });

      // Generate PDF with the same options as working API
      console.log('ATS PDF API - Generating PDF...');
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.1in',
          right: '0.3in',
          bottom: '0.3in',
          left: '0.3in'
        },
        timeout: 30000
      });

      console.log('ATS PDF API - PDF generated successfully, size:', pdf.length, 'bytes');

      // Sanitize filename to prevent Unicode errors
      const sanitizedName = sanitizeFilename(data.name) || 'resume';
      const sanitizedTemplate = sanitizeFilename(template.name) || 'ats';
      const filename = `${sanitizedName}-${sanitizedTemplate}.pdf`;

      return new NextResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      console.error('ATS PDF API - PDF generation error:', error);

      // If it's a connection error, try to restart the browser (same as working API)
      if (error.message.includes('Protocol error') || error.message.includes('Connection closed')) {
        console.log('ATS PDF API - Connection error detected, restarting browser...');

        // Close existing browser instance
        if (browserInstance && browserInstance.isConnected()) {
          try {
            await browserInstance.close();
          } catch (e) {
            console.log('ATS PDF API - Error closing browser:', e);
          }
          browserInstance = null;
        }

        // Retry once
        try {
          browser = await getBrowser();
          page = await browser.newPage();

          page.setDefaultTimeout(30000);
          page.setDefaultNavigationTimeout(30000);

          await page.setContent(html, { waitUntil: 'networkidle0' });

          await page.evaluate(async () => {
            if (document.fonts) {
              await document.fonts.ready;
            }
          });

          const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
              top: '0.1in',
              right: '0.3in',
              bottom: '0.3in',
              left: '0.3in'
            },
            timeout: 30000
          });

          // Sanitize filename to prevent Unicode errors
          const sanitizedName = sanitizeFilename(data.name) || 'resume';
          const sanitizedTemplate = sanitizeFilename(template.name) || 'ats';
          const filename = `${sanitizedName}-${sanitizedTemplate}.pdf`;

          return new NextResponse(pdf, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}"`,
            },
          });
        } catch (retryError) {
          console.error('ATS PDF API - Retry failed:', retryError);
          throw retryError;
        }
      }

      throw error;
    } finally {
      // Clean up
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.log('ATS PDF API - Error closing page:', e);
        }
      }
    }

  } catch (error) {
    console.error('Error generating ATS PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}



function generateATSTemplateHTML(data, template) {
  const { layout, styles } = template;

  // Use data.achievements directly without merging from customSections
  // This preserves the title/description structure of custom achievements sections
  // while still supporting standard string-based achievements

  console.log('ATS PDF API - Achievements data:', {
    hasAchievements: !!data.achievements && data.achievements.length > 0,
    achievementsCount: data.achievements?.length || 0,
    customSectionsCount: data.customSections?.length || 0,
    customSectionTypes: data.customSections?.map(cs => cs.type) || []
  });

  console.log('ATS PDF API - Updated data:', {
    hasAchievements: !!data.achievements && data.achievements.length > 0,
    achievementsCount: data.achievements?.length || 0,
    customSectionsCount: data.customSections?.length || 0,
    customSectionTypes: data.customSections?.map(cs => cs.type) || []
  });

  // Create consistent typography style object (same as ATSResumeRenderer)
  const textStyle = {
    fontFamily: styles.fontFamily || "Arial, sans-serif",
    fontSize: styles.fontSize || "11pt",
    lineHeight: styles.lineHeight || "1.4"
  };

  // Merge colors with defaults (same as ATSResumeRenderer)
  const colors = {
    primary: styles?.colors?.primary || "#000000",
    secondary: styles?.colors?.secondary || "#333333",
    accent: styles?.colors?.accent || "#666666",
    text: styles?.colors?.text || "#000000",
    background: styles?.colors?.background || "#ffffff",
    sidebarBackground: styles?.colors?.sidebarBackground || "#f8fafc"
  };

  // Generate header based on template style
  const header = generateATSHeader(data, layout, styles, colors, textStyle);

  // Generate sections
  const sections = generateATSSections(data, layout, styles, colors, textStyle, false); // Pass false for single column

  // Generate layout HTML
  let layoutHTML;
  if (layout.columns === 1) {
    layoutHTML = `
      <div style="width:100%;padding:0.5rem 2rem 2rem 2rem;background-color:${colors.background};font-family:${textStyle.fontFamily};color:${colors.text};line-height:${textStyle.lineHeight};font-size:${textStyle.fontSize};">
        ${header}${sections}
      </div>
    `;
  } else {
    // Helper function to check if a section has data (same logic as ATSResumeRenderer)
    const hasSectionData = (section) => {
      switch (section) {
        case 'personal':
          return true; // Always show personal info
        case 'summary':
          return data.summary && data.summary.trim() !== '';
        case 'experience':
          return data.experience && data.experience.length > 0;
        case 'education':
          return data.education && data.education.length > 0;
        case 'skills':
          return data.skills && data.skills.length > 0;
        case 'certifications':
          return data.certifications && data.certifications.length > 0;
        case 'languages':
          return data.languages && data.languages.length > 0;
        case 'projects':
          return data.projects && data.projects.length > 0;
        case 'awards':
          return data.awards && data.awards.length > 0;
        case 'achievements':
          return data.achievements && data.achievements.length > 0;
        case 'customSections':
          return data.customSections && data.customSections.length > 0;
        default:
          return false;
      }
    };

    // Use mainSections exactly as defined in the template to maintain UI order
    // This matches exactly how ATSResumeRenderer works - it uses layout.mainSections directly
    let mainSectionsToRender = layout.mainSections ? [...layout.mainSections] : [];

    // Only add achievements if they exist and are not already in mainSections
    // Insert before customSections to maintain the relative order (achievements before custom sections)
    if (data.achievements && data.achievements.length > 0 && !mainSectionsToRender.includes('achievements')) {
      const customSectionsIndex = mainSectionsToRender.indexOf('customSections');
      const awardsIndex = mainSectionsToRender.indexOf('awards');

      if (customSectionsIndex !== -1) {
        // Insert achievements right before customSections to maintain order
        mainSectionsToRender.splice(customSectionsIndex, 0, 'achievements');
      } else if (awardsIndex !== -1) {
        // If no customSections but awards exist, insert after awards
        mainSectionsToRender.splice(awardsIndex + 1, 0, 'achievements');
      } else {
        // Fallback: add at end
        mainSectionsToRender.push('achievements');
      }
      console.log('ATS PDF API - Adding achievements to mainSections for two-column layout');
    }

    // customSections should already be in mainSections from template
    // Only add if somehow missing (shouldn't happen, but safety check)
    if (data.customSections && data.customSections.length > 0 && !mainSectionsToRender.includes('customSections')) {
      console.log('ATS PDF API - Adding customSections to mainSections for two-column layout (was missing)');
      mainSectionsToRender.push('customSections');
    }

    // Projects are now correctly configured in mainSections for ATS executive template

    // Remove languages from main sections for ATS executive template (should only be in sidebar)
    if (template.id === 'ats_two_column_executive') {
      mainSectionsToRender = mainSectionsToRender.filter(section => section !== 'languages');
      console.log('ATS PDF API - Removed languages from main sections for ATS executive template');
    }

    console.log('ATS PDF API - Two-column layout sections:', {
      templateId: template.id,
      sidebar: layout.sidebarSections,
      main: mainSectionsToRender,
      originalMainSections: layout.mainSections
    });

    // Use sidebar sections as configured in template
    const sidebarSectionsToRender = layout.sidebarSections || [];

    const sidebarContent = sidebarSectionsToRender.length > 0 ?
      sidebarSectionsToRender
        .filter(section => hasSectionData(section))
        .map(section => generateATSSection(section, data, styles, colors, layout, textStyle, true)) // Pass true for sidebar
        .join('') : '';
    const mainContent = mainSectionsToRender
      .filter(section => hasSectionData(section))
      .map(section => generateATSSection(section, data, styles, colors, layout, textStyle, false)) // Pass false for main content
      .join('');

    // Increase sidebar width for ATS executive template
    const sidebarWidth = template.id === 'ats_two_column_executive' ? '35%' : (layout.sidebarWidth || '30%');
    const mainWidth = `${100 - parseInt(sidebarWidth)}%`;

    // Add profile picture to sidebar if showProfilePicture is true (same styling as ATSResumeRenderer)
    const profilePictureHTML = layout.showProfilePicture ? `
      <div style="text-align:center;margin-bottom:1.5rem;">
        ${data.photo ? `
          <img src="${data.photo}" alt="Profile" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #d1d5db;box-shadow:0 1px 3px rgba(0,0,0,0.1);margin:0 auto 0.75rem;" />
        ` : `
          <div style="width:80px;height:80px;border-radius:50%;background-color:#e5e7eb;margin:0 auto 0.75rem;display:flex;align-items:center;justify-content:center;border:2px solid #d1d5db;">
            <span style="font-size:2rem;color:#6b7280;font-weight:bold;">👤</span>
          </div>
        `}
      </div>
    ` : '';

    layoutHTML = `
      <div style="width:100%;padding:0.5rem 2rem 2rem 2rem;background-color:${colors.background};font-family:${textStyle.fontFamily};color:${colors.text};line-height:${textStyle.lineHeight};font-size:${textStyle.fontSize};">
        ${header}
        <div style="display:grid;grid-template-columns:${sidebarWidth} ${mainWidth};gap:1.5rem;align-items:start;">
          <div style="background-color:${colors.sidebarBackground};padding:1.5rem;border-radius:8px;border:1px solid #e5e7eb;">
            ${profilePictureHTML}${sidebarContent}
          </div>
          <div style="padding-top:1.5rem;">
            ${mainContent}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: ${textStyle.fontFamily}; 
          background-color: ${colors.background};
          color: ${colors.text};
          line-height: ${textStyle.lineHeight};
          font-size: ${textStyle.fontSize};
        }
        * { box-sizing: border-box; }
        .resume-preview {
          max-width: 800px;
          margin: 0 auto;
        }
        @media print {
          body { margin: 0; }
          .resume-preview { max-width: none; }
          @page { 
            margin: 0.1in 0.3in; 
            size: A4; 
          }
          
          /* Simple rule: If a line/item would be cut at page end, move it to next page */
          /* Don't move entire entries, allow them to break but keep header together */
          
          /* Experience and Education entries - allow breaking but keep header together */
          .experience-entry, .education-entry {
            break-inside: auto;
            page-break-inside: auto;
          }
          
          /* Keep experience/education header (title, company, dates) together */
          .experience-header, .education-header {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          /* Description/bullet points can break, but keep individual items together */
          .experience-description, .education-description {
            break-inside: auto;
            page-break-inside: auto;
          }
          
          /* Prevent individual list items from being split */
          li {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          /* Paragraphs - keep together */
          p {
            break-inside: avoid;
            page-break-inside: avoid;
            orphans: 2;
            widows: 2;
          }
          
          /* Prevent breaks after headings */
          h1, h2, h3, h4, h5, h6 { 
            break-after: avoid; 
            page-break-after: avoid; 
          }
        }
      </style>
    </head>
    <body>${layoutHTML}</body>
    </html>
  `;
}

function generateATSHeader(data, layout, styles, colors, textStyle) {
  const headerStyle = layout.headerStyle;

  switch (headerStyle) {
    case 'executive-two-column':
      return `
        <header style="margin-bottom:1.5rem;">
          <div style="display:table;width:100%;table-layout:fixed;">
            <div style="display:table-row;">
              <!-- Left Side - Name and Title -->
              <div style="display:table-cell;width:60%;vertical-align:top;padding-right:1.5rem;">
                <h1 style="font-size:1.9rem;font-weight:700;margin:0;margin-bottom:0.4rem;color:${colors.primary};font-family:${textStyle.fontFamily};line-height:1.1;text-transform:uppercase;letter-spacing:0.01em;word-wrap:break-word;overflow-wrap:break-word;hyphens:auto;">${data.name || "Your Name"}</h1>
                ${data.jobTitle ? `<p style="font-size:1rem;font-weight:600;margin:0;margin-bottom:0.5rem;color:${colors.secondary};font-family:${textStyle.fontFamily};line-height:1.2;text-transform:uppercase;letter-spacing:0.01em;word-wrap:break-word;">${data.jobTitle}</p>` : ''}
              </div>
              
              <!-- Right Side - Contact Details -->
              <div style="display:table-cell;width:40%;vertical-align:top;text-align:right;color:${colors.accent};font-size:0.8rem;font-family:${textStyle.fontFamily};padding-top:0;">
                ${data.email ? `<div style="margin:0;margin-bottom:0.25rem;line-height:1.3;"><span style="font-weight:600;">Email:</span> ${data.email}</div>` : ''}
                ${data.phone ? `<div style="margin:0;margin-bottom:0.25rem;line-height:1.3;"><span style="font-weight:600;">Phone:</span> ${data.phone}</div>` : ''}
                ${data.address ? `<div style="margin:0;margin-bottom:0.25rem;line-height:1.3;"><span style="font-weight:600;">Address:</span> ${data.address}</div>` : ''}
                ${data.dateOfBirth ? `<div style="margin:0;margin-bottom:0.25rem;line-height:1.3;"><span style="font-weight:600;">DOB:</span> ${data.dateOfBirth}</div>` : ''}
                ${data.gender ? `<div style="margin:0;margin-bottom:0.25rem;line-height:1.3;"><span style="font-weight:600;">Gender:</span> ${data.gender}</div>` : ''}
                ${data.maritalStatus ? `<div style="margin:0;margin-bottom:0.25rem;line-height:1.3;"><span style="font-weight:600;">Status:</span> ${data.maritalStatus}</div>` : ''}
                ${data.linkedin ? `<div style="margin:0;margin-bottom:0.25rem;line-height:1.3;word-break:break-all;"><span style="font-weight:600;">LinkedIn:</span> ${data.linkedin}</div>` : ''}
                ${data.portfolio ? `<div style="margin:0;margin-bottom:0.25rem;line-height:1.3;word-break:break-all;"><span style="font-weight:600;">Portfolio:</span> ${data.portfolio}</div>` : ''}
              </div>
            </div>
          </div>
        </header>
      `;

    case 'standard':
      return `
        <header style="margin-bottom:1.5rem;border-bottom:2px solid ${colors.accent};padding-bottom:1rem;text-align:center;">
          <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1>
          ${data.jobTitle ? `<p style="font-size:1.375rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle}</p>` : ''}
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.25rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
            <!-- Primary contact info -->
            <div style="display:flex;justify-content:center;align-items:center;gap:1rem;">
              ${data.email ? `<span>${data.email}</span>` : ''}
              ${data.phone ? `<span>${data.phone}</span>` : ''}
              ${data.address ? `<span>${data.address}</span>` : ''}
            </div>
            <!-- Personal details and web presence -->
            ${(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) ? `
              <div style="display:flex;justify-content:center;align-items:center;gap:1rem;">
                ${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ''}
                ${data.gender ? `<span>${data.gender}</span>` : ''}
                ${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ''}
                ${data.linkedin ? `<span>${data.linkedin}</span>` : ''}
                ${data.portfolio ? `<span>${data.portfolio}</span>` : ''}
              </div>
            ` : ''}
          </div>
        </header>
      `;

    case 'modern':
      return `
        <header style="margin-bottom:1.25rem;border-bottom:2px solid ${colors.accent};padding-bottom:0.875rem;text-align:center;">
          <h1 style="font-size:2.25rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1>
          ${data.jobTitle ? `<p style="font-size:1.125rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle}</p>` : ''}
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.25rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
            <!-- Primary contact info -->
            <div style="display:flex;justify-content:center;align-items:center;gap:1rem;">
              ${data.email ? `<span>${data.email}</span>` : ''}
              ${data.phone ? `<span>${data.phone}</span>` : ''}
              ${data.address ? `<span>${data.address}</span>` : ''}
            </div>
            <!-- Personal details and web presence -->
            ${(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) ? `
              <div style="display:flex;justify-content:center;align-items:center;gap:1rem;">
                ${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ''}
                ${data.gender ? `<span>${data.gender}</span>` : ''}
                ${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ''}
                ${data.linkedin ? `<span>${data.linkedin}</span>` : ''}
                ${data.portfolio ? `<span>${data.portfolio}</span>` : ''}
              </div>
            ` : ''}
          </div>
        </header>
      `;

    case 'professional':
      return `
        <header style="margin-bottom:1.75rem;border-bottom:2px solid ${colors.accent};padding-bottom:1rem;text-align:center;">
          <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1>
          ${data.jobTitle ? `<p style="font-size:1.375rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle}</p>` : ''}
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.25rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
            <!-- Primary contact info -->
            <div style="display:flex;justify-content:center;align-items:center;gap:1rem;">
              ${data.email ? `<span>${data.email}</span>` : ''}
              ${data.phone ? `<span>${data.phone}</span>` : ''}
              ${data.address ? `<span>${data.address}</span>` : ''}
            </div>
            <!-- Personal details and web presence -->
            ${(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) ? `
              <div style="display:flex;justify-content:center;align-items:center;gap:1rem;">
                ${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ''}
                ${data.gender ? `<span>${data.gender}</span>` : ''}
                ${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ''}
                ${data.linkedin ? `<span>${data.linkedin}</span>` : ''}
                ${data.portfolio ? `<span>${data.portfolio}</span>` : ''}
              </div>
            ` : ''}
          </div>
        </header>
      `;

    case 'executive':
      return `
        <header style="margin-bottom:2rem;border-bottom:3px solid ${colors.accent};padding-bottom:1.25rem;text-align:center;">
          <h1 style="font-size:2.5rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;text-transform:uppercase;">${data.name || "Your Name"}</h1>
          ${data.jobTitle ? `<p style="font-size:1.5rem;margin-bottom:1rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle}</p>` : ''}
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;font-size:1rem;color:${colors.accent};font-family:${styles.fontFamily};">
            <!-- Primary contact info -->
            <div style="display:flex;justify-content:center;align-items:center;gap:1rem;">
              ${data.email ? `<span>${data.email}</span>` : ''}
              ${data.phone ? `<span>${data.phone}</span>` : ''}
              ${data.address ? `<span>${data.address}</span>` : ''}
            </div>
            <!-- Personal details and web presence -->
            ${(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) ? `
              <div style="display:flex;justify-content:center;align-items:center;gap:1rem;">
                ${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ''}
                ${data.gender ? `<span>${data.gender}</span>` : ''}
                ${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ''}
                ${data.linkedin ? `<span>${data.linkedin}</span>` : ''}
                ${data.portfolio ? `<span>${data.portfolio}</span>` : ''}
              </div>
            ` : ''}
          </div>
        </header>
      `;

    case 'profile-left':
      return `
        <header style="margin-bottom:1.5rem;padding-bottom:1rem;">
          <div style="display:flex;align-items:start;gap:1.5rem;">
            <!-- Name and Contact Information -->
            <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem;">
              <!-- Name -->
              <h1 style="font-size:2rem;font-weight:700;margin:0;color:${colors.primary};font-family:${textStyle.fontFamily};line-height:1.1;text-transform:uppercase;letter-spacing:0.02em;">${data.name || "Your Name"}</h1>
              
              <!-- Job Title -->
              ${data.jobTitle ? `<p style="font-size:1.1rem;font-weight:500;margin:0;color:${colors.secondary};font-family:${textStyle.fontFamily};line-height:1.2;margin-bottom:0.25rem;">${data.jobTitle}</p>` : ''}
              
              <!-- Contact Information - Two Columns Without Labels -->
              <div style="display:flex;gap:2rem;margin-top:0.5rem;">
                <!-- Basic Contact Column -->
                <div style="display:flex;flex-direction:column;gap:0.25rem;color:${colors.text};font-size:0.9rem;font-family:${textStyle.fontFamily};line-height:1.4;flex:1;">
                  ${data.address ? `<div>${data.address}</div>` : ''}
                  ${data.phone ? `<div>${data.phone}</div>` : ''}
                  ${data.email ? `<div>${data.email}</div>` : ''}
                </div>
                
                <!-- Web Presence Column -->
                ${(data.portfolio || data.website || data.linkedin) ? `
                  <div style="display:flex;flex-direction:column;gap:0.25rem;color:${colors.text};font-size:0.9rem;font-family:${textStyle.fontFamily};line-height:1.4;flex:1;">
                    ${data.portfolio || data.website ? `<div style="word-break:break-all;">${data.portfolio || data.website}</div>` : ''}
                    ${data.linkedin ? `<div style="word-break:break-all;">${data.linkedin}</div>` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Profile Picture - Moved to Right -->
            <div style="flex-shrink:0;">
              ${data.photo ? `
                <img src="${data.photo}" alt="Profile" style="width:130px;height:130px;border-radius:8px;object-fit:cover;border:2px solid #e5e7eb;box-shadow:0 2px 4px rgba(0,0,0,0.1);" />
              ` : `
                <div style="width:130px;height:130px;border-radius:8px;background-color:#f3f4f6;border:2px solid #e5e7eb;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                  <span style="font-size:3.5rem;color:#9ca3af;">👤</span>
                </div>
              `}
            </div>
          </div>
        </header>
      `;

    default:
      return `
        <header style="margin-bottom:1.5rem;border-bottom:2px solid ${colors.accent};padding-bottom:1rem;text-align:center;">
          <!-- DEBUG: Default header style used, headerStyle was: ${headerStyle} -->
          <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1>
          ${data.jobTitle ? `<p style="font-size:1.375rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle}</p>` : ''}
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.25rem;font-size:0.875rem;color:${colors.accent};font-family:${styles.fontFamily};">
            <!-- Primary contact info -->
            <div style="display:flex;justify-content:center;align-items:center;gap:1rem;">
              ${data.email ? `<span>${data.email}</span>` : ''}
              ${data.phone ? `<span>${data.phone}</span>` : ''}
              ${data.address ? `<span>${data.address}</span>` : ''}
            </div>
            <!-- Personal details and web presence -->
            ${(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) ? `
              <div style="display:flex;justify-content:center;align-items:center;gap:1rem;">
                ${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ''}
                ${data.gender ? `<span>${data.gender}</span>` : ''}
                ${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ''}
                ${data.linkedin ? `<span>${data.linkedin}</span>` : ''}
                ${data.portfolio ? `<span>${data.portfolio}</span>` : ''}
              </div>
            ` : ''}
          </div>
        </header>
      `;
  }
}

function generateATSSections(data, layout, styles, colors, textStyle, isSidebar = false) {
  if (layout.columns === 1) {
    // Helper function to check if a section has data (same logic as ATSResumeRenderer)
    const hasSectionData = (section) => {
      switch (section) {
        case 'personal':
          return true; // Always show personal info
        case 'summary':
          return data.summary && data.summary.trim() !== '';
        case 'experience':
          return data.experience && data.experience.length > 0;
        case 'education':
          return data.education && data.education.length > 0;
        case 'skills':
          return data.skills && data.skills.length > 0;
        case 'certifications':
          return data.certifications && data.certifications.length > 0;
        case 'languages':
          return data.languages && data.languages.length > 0;
        case 'projects':
          return data.projects && data.projects.length > 0;
        case 'awards':
          return data.awards && data.awards.length > 0;
        case 'achievements':
          return data.achievements && data.achievements.length > 0;
        case 'customSections':
          return data.customSections && data.customSections.length > 0;
        default:
          return false;
      }
    };

    if (layout.sectionsOrder) {
      // Use sectionsOrder exactly as defined in the template to maintain UI order
      // This matches exactly how ATSResumeRenderer works - it uses layout.sectionsOrder directly
      let sectionsToRender = [...layout.sectionsOrder];

      // Only add achievements if they exist and are not already in sectionsOrder
      // Insert before customSections to maintain the relative order (achievements before custom sections)
      if (data.achievements && data.achievements.length > 0 && !sectionsToRender.includes('achievements')) {
        const customSectionsIndex = sectionsToRender.indexOf('customSections');
        const awardsIndex = sectionsToRender.indexOf('awards');

        if (customSectionsIndex !== -1) {
          // Insert achievements right before customSections to maintain order
          sectionsToRender.splice(customSectionsIndex, 0, 'achievements');
        } else if (awardsIndex !== -1) {
          // If no customSections but awards exist, insert after awards
          sectionsToRender.splice(awardsIndex + 1, 0, 'achievements');
        } else {
          // Fallback: add at end
          sectionsToRender.push('achievements');
        }
        console.log('ATS PDF API - Adding achievements to sectionsOrder for single column layout');
      }

      // customSections should already be in sectionsOrder from template
      // Only add if somehow missing (shouldn't happen, but safety check)
      if (data.customSections && data.customSections.length > 0 && !sectionsToRender.includes('customSections')) {
        console.log('ATS PDF API - Adding customSections to sectionsOrder for single column layout (was missing)');
        sectionsToRender.push('customSections');
      }

      console.log('ATS PDF API - Single column sections to render (maintaining UI order):', sectionsToRender);

      // Filter and render in the exact order from sectionsOrder (same as UI)
      return sectionsToRender
        .filter(section => hasSectionData(section))
        .map(section => generateATSSection(section, data, styles, colors, layout, textStyle, isSidebar))
        .join('');
    } else {
      return generateDefaultATSSections(data, styles, colors, layout, textStyle, isSidebar);
    }
  }
  return '';
}

// Helper function to convert markdown bold (**text**) to HTML bold (<strong>text</strong>)
function convertMarkdownBold(text) {
  if (!text || typeof text !== 'string') return text;
  // Convert **text** to <strong>text</strong>
  // Handle both **text** and __text__ markdown syntax
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>');
}

// Helper function to safely render text values with markdown support
function safeText(value) {
  if (value === null || value === undefined || value === 'null' || value === 'undefined' || value === '') {
    return '';
  }
  const text = String(value).trim();
  return convertMarkdownBold(text);
}

// Helper function to safely render date values
function safeDate(value) {
  if (!value || value === 'null' || value === 'undefined' || value === 'ongoing') {
    return '';
  }
  const dateStr = String(value).trim().toLowerCase();
  if (dateStr === '' || dateStr === 'ongoing' || dateStr === 'undefined' || dateStr === 'null') {
    return '';
  }
  return String(value).trim();
}

// Helper function to safely render date range
function safeDateRange(startDate, endDate) {
  const start = safeDate(startDate);
  const end = safeDate(endDate);

  // Only return empty string if both are empty
  if (!start && !end) return '';
  // If only one date exists, return just that date (no hyphen)
  if (!start || start.trim() === '') return end || '';
  if (!end || end.trim() === '') return start || '';
  // Only add hyphen when both dates exist and are not empty
  return `${start} - ${end}`;
}

// Helper function to render bullet points properly (matching ATSResumeRenderer)
function renderBulletPoints(text, colors, textStyle, excludeTexts = []) {
  if (!text) return '';

  // Handle both string and array descriptions (same as ATSResumeRenderer)
  let lines = [];
  if (Array.isArray(text)) {
    lines = text.map(l => String(l || '').trim()).filter(Boolean);
  } else {
    // Split by newline and filter empty lines
    lines = String(text).split('\n').map(l => l.trim()).filter(Boolean);
  }

  if (lines.length === 0) return '';

  // For ATS templates, always render as bullets if multiple lines
  let bulletLines = lines.filter(l => /^[-•*]/.test(l));

  // Filter out redundant first lines that match title/company etc.
  if (excludeTexts.length > 0) {
    const normalizedExclude = excludeTexts.map(t => String(t || "").toLowerCase().trim()).filter(Boolean);
    if (lines.length > 0) {
      const firstLineClean = lines[0].replace(/^[-•*]\s*/, "").toLowerCase().trim();
      if (normalizedExclude.some(exclude => firstLineClean === exclude || firstLineClean.includes(`as ${exclude}`))) {
        lines.shift();
        // Re-evaluate bulletLines after shifting
        bulletLines = lines.filter(l => /^[-•*]/.test(l));
      }
    }
  }

  // Same logic as ATSResumeRenderer: force bullets if >1 line or if many lines start with bullets
  const shouldRenderAsBullets = lines.length > 1 || bulletLines.length >= Math.max(2, lines.length / 2);

  if (shouldRenderAsBullets) {
    // Create a list for bullets
    const listItems = lines.map(line => {
      // Remove existing bullet characters if present
      const cleanLine = line.replace(/^[-•*]\s*/, '');
      return `<li style="margin-bottom: 2px;">${safeText(cleanLine)}</li>`;
    }).join('');

    return `
      <ul style="
        margin: 2px 0 4px 16px; 
        padding-left: 0; 
        list-style-type: disc; 
        color: ${colors.text}; 
        font-family: ${textStyle.fontFamily};
        line-height: ${textStyle.lineHeight || '1.4'};
      ">
        ${listItems}
      </ul>
    `;
  } else {
    // Render as paragraphs
    return lines.map(line => `
      <p style="
        margin-bottom: 2px; 
        color: ${colors.text}; 
        font-family: ${textStyle.fontFamily};
        line-height: ${textStyle.lineHeight || '1.4'};
      ">
        ${safeText(line)}
      </p>
    `).join('');
  }
}

function generateATSSection(sectionType, data, styles, colors, layout, textStyle, isSidebar = false) {
  switch (sectionType) {
    case 'summary':
      return `
        <section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
          <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${textStyle.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Professional Summary</h2>
          <div style="padding:1rem;border-radius:0.5rem;border-left:4px solid ${colors.accent};background-color:rgba(0,0,0,0.02);">
            <p style="margin:0;color:${colors.text};font-family:${textStyle.fontFamily};line-height:1.6;font-size:0.875rem;">${convertMarkdownBold(data.summary || "Experienced professional with proven track record...")}</p>
          </div>
        </section>
      `;

    case 'experience':
      return `
        <section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
          <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${textStyle.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Professional Experience</h2>
          <div style="space-y:1.5rem;">
            ${data.experience?.map(exp => {
        const dateRange = safeDateRange(exp.startDate, exp.endDate);
        return `
              <div class="experience-entry" style="margin-bottom:1.5rem;">
                <div class="experience-header" style="margin-bottom:0.5rem;">
                  <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.5rem;${isSidebar ? 'flex-direction:column;gap:0.25rem;' : ''}">
                    <h3 style="font-size:1rem;font-weight:600;margin:0;color:${colors.primary};font-family:${textStyle.fontFamily};line-height:1.4;${isSidebar ? 'width:100%;' : ''}">${safeText(exp.jobTitle)}</h3>
                    ${dateRange ? `<span style="font-size:0.875rem;color:${colors.accent};font-family:${textStyle.fontFamily};line-height:1.4;background-color:rgba(0,0,0,0.05);padding:0.25rem 0.75rem;border-radius:1rem;white-space:nowrap;${isSidebar ? 'align-self:flex-start;' : ''}">${dateRange}</span>` : ''}
                  </div>
                  <p style="font-size:0.875rem;font-weight:500;margin:0;color:${colors.secondary};font-family:${textStyle.fontFamily};line-height:1.4;">${safeText(exp.company)}</p>
                </div>
                <div class="experience-description" style="margin-top:0.5rem;">${renderBulletPoints(exp.description, colors, textStyle)}</div>
              </div>
            `}).join('') || '<p style="color:#666;">No experience data available</p>'}
          </div>
        </section>
      `;

    case 'education':
      return `
        <section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
          <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${textStyle.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Education</h2>
          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${data.education?.map(edu => {
        const dateRange = safeDateRange(edu.startDate, edu.endDate);
        return `
              <div class="education-entry" style="margin-bottom:1rem;">
                <div class="education-header" style="margin-bottom:0.5rem;">
                  <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.5rem;${isSidebar ? 'flex-direction:column;gap:0.25rem;' : ''}">
                    <h3 style="font-size:1rem;font-weight:600;margin:0;color:${colors.primary};font-family:${textStyle.fontFamily};line-height:1.4;${isSidebar ? 'width:100%;' : ''}">${safeText(edu.degree)}</h3>
                    ${dateRange ? `<span style="font-size:0.875rem;color:${colors.accent};font-family:${textStyle.fontFamily};line-height:1.4;background-color:rgba(0,0,0,0.05);padding:0.25rem 0.75rem;border-radius:1rem;white-space:nowrap;${isSidebar ? 'align-self:flex-start;' : ''}">${dateRange}</span>` : ''}
                  </div>
                  <p style="margin:0 0 0.25rem 0;color:${colors.secondary};font-family:${textStyle.fontFamily};font-size:0.875rem;line-height:1.4;font-weight:500;">${safeText(edu.institution || edu.school)}</p>
                  ${edu.field ? `<p style="font-size:0.875rem;margin:0;color:${colors.text};font-family:${textStyle.fontFamily};line-height:1.4;font-style:italic;">${safeText(edu.field)}</p>` : ''}
                </div>
                <div class="education-description" style="margin-top:0.5rem;">
                  ${edu.description ? `<p style="font-size:0.875rem;margin:0;color:${colors.text};font-family:${textStyle.fontFamily};line-height:1.5;">${convertMarkdownBold(safeText(edu.description))}</p>` : ''}
                </div>
              </div>
            `}).join('') || '<p style="color:#666;">No education data available</p>'}
          </div>
        </section>
      `;

    case 'skills':
      // Row-wise grid layout - skills fill horizontally left-to-right
      if (layout.columns === 1) {
        return `
          <section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
            <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${textStyle.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Skills</h2>
            <div style="display:grid;gap:0.5rem;grid-template-columns:repeat(3,1fr);min-width:100%;overflow:hidden;">
              ${data.skills?.map(skill => `
                <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.875rem;line-height:1.4;color:${colors.text};font-family:${textStyle.fontFamily};font-weight:400;padding:0.5rem;border-radius:0.375rem;background-color:rgba(0,0,0,0.02);">
                  <div style="width:0.5rem;height:0.5rem;border-radius:50%;background-color:${colors.accent};flex-shrink:0;"></div>
                  <span style="flex:1;word-wrap:break-word;overflow-wrap:break-word;font-weight:500;">${typeof skill === 'string' ? safeText(skill) : safeText(skill.name || skill.skill)}</span>
                </div>
              `).join('') || '<div style="color:#666;">No skills data available</div>'}
            </div>
          </section>
        `;
      } else {
        // Default single-column skills layout (sidebar or 2-column layout)
        return `
          <section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
            <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${textStyle.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Skills</h2>
            <div style="space-y:0.5rem;">
              ${data.skills?.map(skill => `
                <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.875rem;line-height:1.4;color:${colors.text};font-family:${textStyle.fontFamily};padding:0.5rem;border-radius:0.375rem;background-color:rgba(0,0,0,0.02);">
                  <div style="width:0.5rem;height:0.5rem;border-radius:50%;background-color:${colors.accent};flex-shrink:0;"></div>
                  <span style="flex:1;word-wrap:break-word;overflow-wrap:break-word;font-weight:500;">${typeof skill === 'string' ? safeText(skill) : safeText(skill.name || skill.skill)}</span>
                </div>
              `).join('') || '<div style="color:#666;">No skills data available</div>'}
            </div>
          </section>
        `;
      }

    case 'languages':
      // Only show languages section if there's actual data
      if (!data.languages || data.languages.length === 0) {
        return '';
      }
      return `
        <section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
          <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${textStyle.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Languages</h2>
          <div style="space-y:0.5rem;">
            ${data.languages.map(lang => {
        const proficiency = safeText(lang.proficiency);
        return `
              <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.875rem;line-height:1.4;color:${colors.text};font-family:${textStyle.fontFamily};padding:0.5rem;border-radius:0.375rem;background-color:rgba(0,0,0,0.02);">
                <div style="width:0.5rem;height:0.5rem;border-radius:50%;background-color:${colors.accent};flex-shrink:0;"></div>
                <span style="font-weight:500;">${safeText(lang.language)}${proficiency ? `<span style="color:#666;margin-left:0.25rem;">(${proficiency})</span>` : ''}</span>
              </div>
            `;
      }).join('')}
          </div>
        </section>
      `;

    case 'certifications':
      // Only show certifications section if there's actual data
      if (!data.certifications || data.certifications.length === 0) {
        return '';
      }

      // Use bullet format for both single-column and two-column ATS templates
      return `
        <section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
          <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${textStyle.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Certifications</h2>
          <div style="space-y:0.75rem;">
            ${data.certifications.map(cert => `
              <div style="display:flex;align-items:flex-start;gap:0.75rem;font-size:0.875rem;line-height:1.4;color:${colors.text};font-family:${textStyle.fontFamily};padding:0.75rem;border-radius:0.375rem;background-color:rgba(0,0,0,0.02);">
                <div style="width:0.75rem;height:0.75rem;border-radius:50%;background-color:${colors.accent};flex-shrink:0;margin-top:0.125rem;"></div>
                <div style="flex:1;">
                  <div style="font-weight:600;color:${colors.primary};margin-bottom:0.25rem;">${safeText(cert.name)}</div>
                  <div style="color:${colors.text};font-size:0.8rem;">
                    ${(() => {
          const issuer = safeText(cert.issuer);
          const date = safeDate(cert.date);
          if (issuer && date) {
            return `${issuer} - ${date}`;
          } else if (issuer) {
            return issuer;
          } else if (date) {
            return date;
          }
          return '';
        })()}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;

    case 'projects':
      // Only show projects section if there's actual data
      if (!data.projects || data.projects.length === 0) {
        return '';
      }
      return `
        <section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
          <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${textStyle.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Projects</h2>
          <div style="space-y:1rem;">
            ${data.projects.map(project => `
              <div style="margin-bottom:1rem;">
                <h3 style="font-size:1rem;font-weight:600;margin:0 0 0.5rem 0;color:${colors.primary};font-family:${textStyle.fontFamily};line-height:1.4;">${safeText(project.name)}</h3>
                <p style="margin:0;color:${colors.text};font-family:${textStyle.fontFamily};line-height:1.4;font-size:1rem;">${convertMarkdownBold(safeText(project.description))}</p>
              </div>
            `).join('')}
          </div>
        </section>
      `;

    case 'achievements':
      // Only show achievements section if there's actual data
      if (!data.achievements || data.achievements.length === 0) {
        return '';
      }
      return `
        <section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
          <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${textStyle.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Achievements</h2>
          <div style="space-y:0.5rem;">
            ${data.achievements.map(achievement => `
              <div style="display:flex;align-items:flex-start;gap:0.75rem;font-size:0.875rem;line-height:1.4;color:${colors.text};font-family:${textStyle.fontFamily};padding:0.75rem;border-radius:0.375rem;background-color:rgba(0,0,0,0.02);">
                <div style="width:0.75rem;height:0.75rem;border-radius:50%;background-color:${colors.accent};flex-shrink:0;margin-top:0.125rem;"></div>
                <div style="flex:1;">${convertMarkdownBold(safeText(achievement))}</div>
              </div>
            `).join('')}
          </div>
        </section>
      `;

    case 'awards':
      // Only show awards section if there's actual data
      if (!data.awards || data.awards.length === 0) {
        return '';
      }
      return `
        <section style="margin-bottom:${layout.spacing === 'modern' ? '1.25rem' : layout.spacing === 'comfortable' ? '1.75rem' : '1.5rem'};">
          <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${textStyle.fontFamily};border-bottom:1px solid ${colors.accent};padding-bottom:0.5rem;">Awards & Achievements</h2>
          <div style="space-y:0.5rem;">
            ${data.awards.map(award => `
              <div style="margin-bottom:0.75rem;">
                <h3 style="font-size:1rem;font-weight:600;margin:0 0 0.25rem 0;color:${colors.primary};font-family:${textStyle.fontFamily};line-height:1.4;">${safeText(award.name)}</h3>
                <p style="margin:0;color:${colors.text};font-family:${textStyle.fontFamily};font-size:1rem;line-height:1.4;">
                  ${(() => {
          const issuer = safeText(award.issuer);
          const date = safeDate(award.date);
          if (issuer && date) return `${issuer} • ${date}`;
          if (issuer) return issuer;
          if (date) return date;
          return '';
        })()}
                </p>
              </div>
            `).join('')}
          </div>
        </section>
      `;

    case 'customSections':
      // Only show custom sections if there's actual data
      if (!data.customSections || data.customSections.length === 0) {
        console.log('ATS PDF API - No customSections data found');
        return '';
      }

      console.log('ATS PDF API - Processing customSections:', {
        count: data.customSections.length,
        types: data.customSections.map(cs => cs.type),
        data: data.customSections
      });

      try {
        // Group custom sections by type
        const groups = data.customSections.reduce((acc, current) => {
          const type = (current.type || "custom").toLowerCase();
          if (!acc[type]) acc[type] = [];
          acc[type].push(current);
          return acc;
        }, {});

        // Generate HTML for each group
        const customSectionsHTML = Object.entries(groups).map(([type, items]) => {
          const sectionTitle = (type.charAt(0).toUpperCase() + type.slice(1) + (type.endsWith('s') ? '' : 's'));

          const headerHtml = `
            <div style="
              border-bottom: 1px solid ${colors.secondary}; 
              margin-bottom: 8px; 
              padding-bottom: 2px;
              break-after: avoid; 
              page-break-after: avoid;
            ">
              <h2 style="
                margin: 0; 
                color: ${colors.primary}; 
                font-family: ${textStyle.fontFamily}; 
                font-size: 11pt; 
                font-weight: bold; 
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">
                ${sectionTitle}
              </h2>
            </div>
          `;

          const itemsHtml = items.map(item => {
            const itemTitle = item.name || item.title || "";

            return `
              <div style="margin-bottom: 10px; break-inside: avoid; page-break-inside: avoid;">
                ${itemTitle ? `
                  <h3 style="
                    margin: 0 0 2px 0; 
                    font-weight: bold; 
                    font-size: 10pt; 
                    color: ${colors.primary};
                    font-family: ${textStyle.fontFamily};
                  ">
                    ${safeText(itemTitle)}
                  </h3>
                ` : ''}
                
                ${item.date ? `
                  <div style="
                    font-size: 9pt; 
                    color: ${colors.accent}; 
                    margin-bottom: 4px; 
                    font-weight: 600;
                    font-family: ${textStyle.fontFamily};
                  ">
                    ${safeDate(item.date)}
                  </div>
                ` : ''}
                
                ${item.description ? `
                  <div style="font-size: 10pt; margin-bottom: 4px;">
                    ${renderBulletPoints(item.description, colors, textStyle, [sectionTitle, itemTitle])}
                  </div>
                ` : ''}
                
                ${item.achievements ? `
                  <div style="margin-top: 4px;">
                    <h4 style="font-size: 10pt; font-weight: 600; margin: 0 0 2px 0; color: ${colors.primary}; font-family: ${textStyle.fontFamily};">Key Achievements:</h4>
                    ${renderBulletPoints(item.achievements, colors, textStyle)}
                  </div>
                ` : ''}
                
                ${item.technologies ? `
                  <div style="margin-top: 4px; font-size: 10pt; color: ${colors.text}; font-family: ${textStyle.fontFamily};">
                    <span style="font-weight: 600; color: ${colors.primary};">Technologies Used:</span> ${safeText(item.technologies)}
                  </div>
                ` : ''}
                
                ${(item.name || item.email || item.phone) && !item.description ? `
                  <div style="margin-top: 6px; padding: 6px; background-color: #f9fafb; border-radius: 4px; font-size: 9pt;">
                    <div style="font-weight: 600; margin-bottom: 2px; color: ${colors.primary}; font-family: ${textStyle.fontFamily};">Reference Details:</div>
                    ${item.name ? `<div>${safeText(item.name)}</div>` : ''}
                    ${item.email ? `<div>${safeText(item.email)}</div>` : ''}
                    ${item.phone ? `<div>${safeText(item.phone)}</div>` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('');

          return `
            <div style="margin-bottom: 16px;">
              ${headerHtml}
              ${itemsHtml}
            </div>
          `;
        }).join('');

        console.log('ATS PDF API - Custom sections HTML generated, length:', customSectionsHTML.length);
        return customSectionsHTML;
      } catch (e) {
        console.error("ATS PDF API - Error generating custom sections:", e);
        return `<!-- Error generating custom sections: ${e.message} -->`;
      }

    default:
      return '';
  }
}

function generateDefaultATSSections(data, styles, colors, layout, textStyle, isSidebar = false) {
  console.log('ATS PDF API - Generating default ATS sections');

  const sections = [
    'summary',
    'experience',
    'education',
    'skills',
    'certifications'
  ];

  // Add achievements if they exist
  if (data.achievements && data.achievements.length > 0) {
    console.log('ATS PDF API - Adding achievements to default sections');
    sections.push('achievements');
  }

  // Add customSections if they exist
  if (data.customSections && data.customSections.length > 0) {
    console.log('ATS PDF API - Adding customSections to default sections');
    sections.push('customSections');
  }

  console.log('ATS PDF API - Final sections to render:', sections);

  return sections.map(section => {
    console.log('ATS PDF API - Rendering section:', section);
    return generateATSSection(section, data, styles, colors, layout, textStyle, isSidebar);
  }).join('');
}
