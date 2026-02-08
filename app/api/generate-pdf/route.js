// Use Node.js runtime for headless Chrome
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { Buffer } from 'buffer';
import puppeteer from "puppeteer";
// import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { templates } from "../../lib/templates";
import { jobSpecificTemplates } from "../../lib/jobSpecificTemplate";
import { premiumTemplates } from "../../lib/premiumTemplate";
import { coverLetterTemplates } from "../../lib/coverLetterTemplate";
import { defaultConfig } from "../../lib/templates";
import { formatDateWithPreferences, tryParseDate, cleanText } from "../../lib/resumeUtils";
import { parseRichText } from "../../lib/richTextRenderer";

// Note: cleanText function in resumeUtils.js now handles non-string values safely
import { adminDb } from "../../lib/firebase";

// Increase max duration to allow for complex PDFs (same as ATS PDF API)
export const maxDuration = 120;
// Add this near the top of your file
const FONT_CACHE = new Map();

// Helper function to normalize phone numbers for comparison
function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return "";
  return phone.replace(/\D/g, ''); // Remove all non-digits
}

// Helper function to store first resume reference for a user
async function storeFirstResumeReference(userId, resumeData, source = "first_upload") {
  try {
    // Validate input parameters
    if (!userId || !resumeData || typeof resumeData !== 'object') {
      console.log('Invalid parameters for storeFirstResumeReference:', { userId, resumeData: typeof resumeData });
      return;
    }

    // Validate that we have at least one identifying piece of information
    const hasIdentifyingInfo = resumeData.name || resumeData.email || resumeData.phone;
    if (!hasIdentifyingInfo) {
      console.log(`User ${userId} has no identifying information, skipping reference storage`);
      return;
    }

    // Only store if user has entered real data (not default sample data)
    const name = String(resumeData.name || "").trim();
    const email = String(resumeData.email || "").trim();
    const phone = String(resumeData.phone || "").trim();

    const hasRealData = (
      name && name !== "John Doe" &&
      email && email !== "john.doe@example.com" &&
      phone && phone !== "+1 (123) 456-7890"
    );

    console.log('PDF API: First resume reference validation:', {
      name,
      email,
      phone,
      hasRealData,
      source
    });

    if (!hasRealData) {
      console.log(`User ${userId} has default sample data, skipping reference storage`);
      return;
    }

    // Check if user already has a first resume reference
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();

      // If user already has a firstResumeReference, don't overwrite it
      if (userData.firstResumeReference) {
        console.log(`User ${userId} already has first resume reference, skipping storage`);
        return;
      }

      // User exists, just add the firstResumeReference field
      await userRef.update({
        firstResumeReference: {
          name,
          email,
          phone,
          storedAt: new Date().toISOString(),
          source: source
        }
      });
    } else {
      // User doesn't exist, create with default fields plus firstResumeReference
      await userRef.set({
        email: "anonymous",
        plan: "anonymous",
        premium_expiry: null,
        preview_count: 0,
        template_change_count: 0,
        name: "",
        phone: "",
        firstResumeReference: {
          name,
          email,
          phone,
          storedAt: new Date().toISOString(),
          source: source
        }
      });
    }

    console.log(`Stored first resume reference for user ${userId} from source: ${source}`);
  } catch (error) {
    console.error("Error storing first resume reference:", error);
    // Don't throw error to avoid blocking the main flow
  }
}

// Helper function to check if resume is for someone else
async function checkIfResumeIsForSomeoneElse(userId, resumeData) {
  try {
    // Validate input parameters
    if (!userId || !resumeData || typeof resumeData !== 'object') {
      console.log('Invalid parameters for checkIfResumeIsForSomeoneElse:', { userId, resumeData: typeof resumeData });
      return false; // Allow download if we can't validate
    }

    // Allow John Doe sample profile
    const nameCheck = String(resumeData.name || "").trim().toLowerCase();
    if (nameCheck === "john doe" || nameCheck === "johndoe") {
      console.log("PDF API: John Doe sample profile detected - allowing download.");
      return false; // Allow download
    }

    // Get user's profile information
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userProfileDoc = await adminDb.collection("users").doc(userId).collection("profile").doc("userProfile").get();

    let userPersonalInfo = {};
    let firstResumeReference = null;

    if (userDoc.exists) {
      const userData = userDoc.data();
      firstResumeReference = userData.firstResumeReference;

      // If no first resume reference exists, store current as reference
      if (!firstResumeReference) {
        console.log(`No first resume reference found for user ${userId}, storing current resume as reference`);
        await storeFirstResumeReference(userId, resumeData, "first_download");
        return false; // Allow the first download
      }
    } else {
      // User doesn't exist, create user and store first reference
      console.log(`User ${userId} doesn't exist, creating user and storing first reference`);
      await storeFirstResumeReference(userId, resumeData, "first_download");
      return false; // Allow the first download
    }

    if (userProfileDoc.exists) {
      userPersonalInfo = userProfileDoc.data();
    } else if (userDoc.exists) {
      const userData = userDoc.data();
      userPersonalInfo = {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || ""
      };
    }

    // Extract personal info from resume data
    const resumePersonalInfo = {
      name: resumeData.name || "",
      email: resumeData.email || "",
      phone: resumeData.phone || ""
    };

    // LIGHT CHECK: Only compare names (case-insensitive) - with null checks
    const userName = userPersonalInfo.name?.trim()?.toLowerCase() || "";
    const resumeName = resumePersonalInfo.name?.trim()?.toLowerCase() || "";

    // NAME-ONLY CHECK: Simple name match
    if (userName && resumeName && userName === resumeName) {
      console.log(`Name match found - allowing download. Name: "${resumeName}"`);
      return false; // Allow download
    }

    // If we have a first resume reference, compare against it (name-only)
    if (firstResumeReference) {
      // Handle array of references (multiple profile slots)
      const references = Array.isArray(firstResumeReference) ? firstResumeReference : [firstResumeReference];

      // Check if ANY reference name matches
      const nameMatch = references.some(ref => {
        const referenceName = ref.name?.trim()?.toLowerCase() || "";
        return referenceName && resumeName && referenceName === resumeName;
      });

      if (nameMatch) {
        console.log(`First resume reference name match found - allowing download. Resume name: "${resumeName}"`);
        return false; // Allow download
      }

      // Construct expected names list for error message
      const expectedNames = references
        .map(ref => ref.name)
        .filter(Boolean)
        .join(", ");

      console.log(`No name match found against first resume reference. Expected one of: ${expectedNames || 'registered profiles'} vs Resume: "${resumeName}"`);
    }

    // If no name match, block the download
    console.log(`No name match found - blocking download. User: "${userName}" vs Resume: "${resumeName}"`);
    return true; // Block download

  } catch (error) {
    console.error("Error checking if resume is for someone else:", error);
    // If we can't verify, allow the download to avoid blocking legitimate users
    return false;
  }
}

async function loadFont(fontFamily) {
  if (!fontFamily || typeof fontFamily !== 'string') {
    console.warn('Invalid fontFamily provided:', fontFamily);
    return null;
  }
  const normalizedFont = fontFamily.split(',')[0]?.trim()?.replace(/^['"]|['"]$/g, '') || 'Arial';

  if (FONT_CACHE.has(normalizedFont)) {
    return FONT_CACHE.get(normalizedFont);
  }

  const fontUrl = `https://fonts.googleapis.com/css2?family=${normalizedFont.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;

  try {
    const response = await fetch(fontUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    let cssText = await response.text();

    // Extract font URLs from the CSS
    const fontUrls = cssText.match(/url\(([^)]+)\)/g)?.map(url =>
      url.replace(/^url\(['"]?|['"]?\)$/g, '')
    ) || [];

    // Cache the CSS and font URLs
    const result = { cssText, fontUrls };
    FONT_CACHE.set(normalizedFont, result);

    return result;
  } catch (error) {
    console.error(`Failed to load font "${normalizedFont}":`, error);
    return { cssText: '', fontUrls: [] };
  }
}

// Singleton for browser instance to reuse across requests
let browserInstance = null;

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

// Cache for template configurations
const templateCache = new Map();

// Merge all templates (classic, job-specific, premium) for unified lookup
const allTemplates = {
  ...templates,
  ...jobSpecificTemplates,
  ...premiumTemplates,
};

function getCachedTemplate(templateName, type = "resume") {
  const key = `${type}:${templateName.toLowerCase()}`;
  if (!templateCache.has(key)) {
    let templateSet;
    if (type === "resume") {
      templateSet = allTemplates;
    } else if (type === "coverLetter") {
      templateSet = coverLetterTemplates;
    } else {
      throw new Error(`Unknown template type: ${type}`);
    }
    const availableTemplates = Object.keys(templateSet);
    const normalizedTemplate = templateName.toLowerCase();
    const matchingTemplate = availableTemplates.find((t) => t.toLowerCase() === normalizedTemplate);

    if (!matchingTemplate) {
      throw new Error(`Template "${templateName}" not found. Available templates: ${availableTemplates.join(", ")}`);
    }

    const template = templateSet[matchingTemplate];
    templateCache.set(key, template);
  }
  return templateCache.get(key);
}

// Pre-rendered SVG icons
const iconMap = {
  Bookmark: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
  Briefcase: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="14" rx="2" ry="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M12 12v.01"></path><path d="M3 13a20 20 0 0 0 18 0"></path></svg>`,
  GraduationCap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path><path d="M12 22v-5"></path><path d="M12 17l-3-3 3-3 3 3-3 3z"></path></svg>`,
  Award: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path><path d="M9 12l2 2 4-4"></path></svg>`,
  Wrench: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
  Languages: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"></path><path d="M12 2v20"></path><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1 10-10z"></path><path d="M12 6v12"></path><path d="M6 12h12"></path></svg>`,
  User: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  Project: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path><path d="M12 12h.01"></path><path d="M16 12h.01"></path><path d="M12 16h.01"></path></svg>`,
  Volunteer: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path><path d="M12 2v3"></path></svg>`,
  Publication: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
  Reference: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
  Hobby: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path><path d="M12 12h.01"></path><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
};

const sectionIconMap = {
  summary: "Bookmark",
  experience: "Briefcase",
  education: "GraduationCap",
  skills: "Wrench",
  certifications: "Award",
  languages: "Languages",
  personal: "User",
  project: "Project",
  volunteer: "Volunteer",
  publication: "Publication",
  reference: "Reference",
  award: "Award",
  hobby: "Hobby",
  achievements: "Award",
};

const translations = {
  en: { summary: "Profile", experience: "Employment History", education: "Education", skills: "Skills", certifications: "Certifications", languages: "Languages", project: "Projects", volunteer: "Volunteer Work", publication: "Publications", reference: "References", award: "Awards", hobby: "Interests" },
  es: { summary: "Perfil", experience: "Historial de Empleo", education: "Educación", skills: "Habilidades", certifications: "Certificaciones", languages: "Idiomas", project: "Proyectos", volunteer: "Trabajo Voluntario", publication: "Publicaciones", reference: "Referencias", award: "Premios", hobby: "Intereses" },
  fr: { summary: "Profil", experience: "Historique d'Emploi", education: "Éducation", skills: "Compétences", certifications: "Certifications", languages: "Langues", project: "Projets", volunteer: "Travail Bénévole", publication: "Publications", reference: "Références", award: "Prix", hobby: "Centres d'Intérêt" },
};

// Add a helper to render description as bullets if needed
function renderDescriptionBulletsHTML(description, isTimeline = false, excludeTexts = []) {
  if (!description) return '';

  // Handle both string and array descriptions
  let lines;
  if (Array.isArray(description)) {
    // If it's already an array, use it directly after trimming and ensuring strings
    lines = description.map(l => String(l || '').trim()).filter(Boolean);
  } else {
    // If it's a string, split into lines, trim, and filter empty
    lines = String(description || '').split('\n').map(l => String(l || '').trim()).filter(Boolean);
  }

  // Filter out redundant first lines
  if (excludeTexts.length > 0) {
    const normalizedExclude = excludeTexts.map(t => String(t || "").toLowerCase().trim()).filter(Boolean);
    if (lines.length > 0) {
      const firstLineClean = lines[0].replace(/^[-•*]\s*/, "").toLowerCase().trim();
      if (normalizedExclude.some(exclude => firstLineClean === exclude || firstLineClean.includes(`as ${exclude}`))) {
        lines.shift();
      }
    }
  }

  const bulletLines = lines.filter(l => {
    const lineStr = String(l || '');
    return /^[-•*]/.test(lineStr);
  });
  if (bulletLines.length >= Math.max(2, lines.length / 2)) {
    // For timeline style, use much tighter spacing
    const ulMargin = isTimeline ? '0.15rem 0 0 1rem' : '0.25rem 0 0.5rem 1.25rem';
    const liLineHeight = isTimeline ? '1.45' : '1.5';
    const liFontSize = isTimeline ? '0.875rem' : '0.875rem';
    return `<ul style="margin:${ulMargin};padding:0;list-style:disc;">${lines.map(line => {
      const lineStr = String(line || '');
      // Clean leading bullet chars if they exist in the text, then parse markdown
      const cleanLine = lineStr.replace(/^[-•*]\s*/, "");
      return `<li style="font-size:${liFontSize};line-height:${liLineHeight};margin:0;margin-bottom:${isTimeline ? '0.15rem' : '0'};">${parseRichText(cleanLine)}</li>`;
    }).join('')}</ul>`;
  }
  return lines.map(line => {
    const lineStr = String(line || '');
    const pMargin = isTimeline ? '0 0 0.15rem 0' : '0';
    const pFontSize = isTimeline ? '0.875rem' : '0.875rem';
    const pLineHeight = isTimeline ? '1.45' : '1.5';
    return `<p style="margin:${pMargin};line-height:${pLineHeight};font-size:${pFontSize};">${parseRichText(lineStr)}</p>`;
  }).join('');
}

// Extract achievements from customSections if they exist there
function extractAchievementsFromCustomSections(customSections) {
  if (!customSections || !Array.isArray(customSections)) return [];
  const achievementSections = customSections.filter(section =>
    section && typeof section === 'object' && section.type === 'achievements'
  );

  const achievements = [];
  achievementSections.forEach(section => {
    if (section.description) {
      // If description is a string with newlines, split it
      if (typeof section.description === 'string') {
        const lines = section.description.split('\n').map(l => l.trim()).filter(Boolean);
        achievements.push(...lines);
      } else if (Array.isArray(section.description)) {
        achievements.push(...section.description.map(d => String(d).trim()).filter(Boolean));
      }
    }
  });
  return achievements;
}

function generateResumeHTML(data, template = "classic", customColors = {}, language = "en", country = "us", isPremium = false, preferences = defaultConfig) {
  // RESUME_HTML_MARKER - Used to identify resume generation function

  // Extract achievements from customSections and combine with data.achievements
  // FIX: This logic was causing "Achievements" type custom sections to lose their titles.
  // We now leave them in customSections so they are rendered with their full structure.
  /*
  const achievementsFromCustomSections = extractAchievementsFromCustomSections(data.customSections);
  const allAchievements = [
    ...(Array.isArray(data.achievements) ? data.achievements : []),
    ...achievementsFromCustomSections
  ].filter(Boolean);

  // Update data to include combined achievements and filter achievements from customSections
  data = {
    ...data,
    achievements: allAchievements.length > 0 ? allAchievements : data.achievements,
    customSections: (data.customSections || []).filter(section =>
      !(section && typeof section === 'object' && section.type === 'achievements')
    )
  };
  */

  // Debug logging for resume data
  console.log('🔍 Resume Data Debug:', {
    hasData: !!data,
    dataKeys: Object.keys(data || {}),
    skillsExists: !!data?.skills,
    skillsType: Array.isArray(data?.skills) ? 'array' : typeof data?.skills,
    skillsLength: data?.skills?.length || 0,
    skillsData: data?.skills,
    template: template,
    preferences: preferences,
    // Debug optional personal information fields
    dateOfBirth: data?.dateOfBirth,
    gender: data?.gender,
    maritalStatus: data?.maritalStatus,
    hasOptionalFields: !!(data?.dateOfBirth || data?.gender || data?.maritalStatus)
  });

  const templateConfig = getCachedTemplate(template, "resume");
  const { layout = {}, styles = {} } = templateConfig || {};

  // Typography override from preferences
  if (styles) {
    styles.fontFamily = preferences?.typography?.fontPair?.fontFamily || styles.fontFamily || 'Arial';
  }

  // Support both top-level customColors or customColors keyed by template
  const custom = customColors?.[template] || customColors || {};

  const mergedColors = {
    ...((styles && styles.colors) || {}),
    ...custom,
    primary: custom.primary || styles.colors?.primary || "#4B5EAA",
    secondary: custom.secondary || styles.colors?.secondary || "#6B7280",
    text: custom.text || styles.colors?.text || "#1F2937",
    accent: custom.accent || styles.colors?.accent || "#9333EA",
    background: custom.background || styles.colors?.background || "#FFFFFF",
  };

  // Pre-render icons with accent color
  const renderedIcons = Object.fromEntries(
    Object.entries(iconMap).map(([key, svg]) => [key, svg.replace("%ACCENT%", mergedColors.accent)])
  );

  const t = translations[language] || translations.en;

  const formatDate = (date) => formatDateWithPreferences(date, preferences);

  // Helper function to generate personal information HTML
  const renderPersonalInfo = (includeOptional = true, style = "vertical") => {
    if (style === "horizontal") {
      // For horizontal layouts (like minimal, elegant)
      let personalInfo = `${cleanText(data.email) || "email@example.com"}`;
      personalInfo += `•${data.phone || "+1 (555) 123-4567"}`;
      if (data.address) personalInfo += `•${cleanText(data.address)}`;

      if (includeOptional) {
        if (data.dateOfBirth) personalInfo += `•DOB: ${data.dateOfBirth}`;
        if (data.gender) personalInfo += `•${data.gender}`;
        if (data.maritalStatus) personalInfo += `•${data.maritalStatus}`;
      }

      if (data.linkedin) personalInfo += `•${cleanText(data.linkedin)}`;
      if (data.portfolio) personalInfo += `•${cleanText(data.portfolio)}`;

      return personalInfo;
    } else {
      // For vertical layouts (default)
      let personalInfo = `
        <p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.email) || "email@example.com"}</p>
        <p style="margin:0.075rem 0;line-height:1.1;">${data.phone || "+1 (555) 123-4567"}</p>
        <p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.address) || "123 Street, City, Country"}</p>
      `;

      if (includeOptional) {
        personalInfo += `
          ${data.dateOfBirth ? `<p style="margin:0.075rem 0;line-height:1.1;">DOB: ${data.dateOfBirth}</p>` : ""}
          ${data.gender ? `<p style="margin:0.075rem 0;line-height:1.1;">${data.gender}</p>` : ""}
          ${data.maritalStatus ? `<p style="margin:0.075rem 0;line-height:1.1;">${data.maritalStatus}</p>` : ""}
        `;
      }

      personalInfo += `
        ${data.linkedin ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.linkedin)}" style="color:white;text-decoration:underline;">${cleanText(data.linkedin)}</a></p>` : ""}
        ${data.dateOfBirth ? `<p style="margin:0.075rem 0;line-height:1.1;">DOB: ${data.dateOfBirth}</p>` : ""}${data.gender ? `<p style="margin:0.075rem 0;line-height:1.1;">${data.gender}</p>` : ""}${data.maritalStatus ? `<p style="margin:0.075rem 0;line-height:1.1;">${data.maritalStatus}</p>` : ""}${data.portfolio ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.portfolio)}" style="color:white;text-decoration:underline;">${cleanText(data.portfolio)}</a></p>` : ""}
      `;

      return personalInfo;
    }
  };

  const renderSectionContent = (section) => {
    console.log(`🔍 Processing section: ${section}`, {
      dataExists: !!data[section],
      dataType: Array.isArray(data[section]) ? 'array' : typeof data[section],
      dataLength: data[section]?.length || 'N/A',
      isSkipped: (Array.isArray(data[section]) && !data[section].length) && section !== "summary" && section !== "customSections"
    });

    if ((!data[section] || (Array.isArray(data[section]) && !data[section].length)) && section !== "summary" && section !== "customSections" && section !== "personal") {
      console.log(`❌ Section ${section} skipped: no data or empty array`);
      return "";
    }

    // Apply compact styling for timeline or 2-column layouts
    const isCompact = layout.timelineStyle || layout.columns === 2;
    const sectionStyle = `padding-left:0.3rem;margin-bottom:${isCompact ? '0.5rem' : '1rem'};`;
    const renderWithIcons = layout.showIcons ? `<span style="width:1rem;height:1rem;margin-right:0.25rem;display:inline-flex;align-items:center;justify-content:center;">${renderedIcons[sectionIconMap[section]] || `<span style="display:inline-block;width:1rem;height:1rem;color:${mergedColors.accent};font-size:0.625rem;text-align:center;line-height:1rem;">?</span>`}</span>` : "";
    switch (section) {
      case "summary":
        return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:${isCompact ? '0.3rem' : '0.5rem'};display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;padding-bottom:${isCompact ? '0.3rem' : '0.5rem'};border-bottom:1px solid #f3f4f6;">${renderWithIcons}${t.summary}</h2><p style="color:${mergedColors.text};font-size:0.875rem;line-height:1.5;font-family:${styles.fontFamily};word-wrap:break-word;margin-top:0.075rem;">${parseRichText(cleanText(data.summary)) || "Your professional profile goes here."}</p></section>`;
      case "experience":
        return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:${isCompact ? '0.35rem' : '0.5rem'};display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.2;padding-bottom:${isCompact ? '0.35rem' : '0.5rem'};border-bottom:1px solid #f3f4f6;break-after:avoid;page-break-after:avoid;">${renderWithIcons}${t.experience}</h2>${data.experience.map(exp => {
          const start = exp.startDate ? formatDate(exp.startDate) : '';
          const end = exp.endDate ? formatDate(exp.endDate) : '';
          let dateStr = '';
          if (start && end) {
            dateStr = `${start} - ${end}`;
          } else if (start) {
            dateStr = start;
          } else if (end) {
            dateStr = end;
          }
          return `<div class="experience-entry" style="margin-bottom:${isCompact ? '0.5rem' : '0.6rem'};padding-left:${layout.timelineStyle ? '0.9rem' : '0'};${layout.timelineStyle ? 'border-left:0.15rem solid ' + mergedColors.accent + ';position:relative;' : ''}"><div class="experience-header"><h3 style="font-weight:600;font-size:0.9375rem;color:${mergedColors.primary};font-family:${styles.fontFamily};margin:0 0 0.15rem 0;line-height:1.3;">${cleanText(exp.jobTitle) || "Job Title"}, ${cleanText(exp.company) || "Company Name"}</h3>${(dateStr || exp.location) ? `<p style="font-size:0.75rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};margin:0 0 0.2rem 0;line-height:1.2;">${dateStr}${dateStr && exp.location ? ' | ' : ''}${exp.location ? cleanText(exp.location) : ''}</p>` : ''}</div><div class="experience-description">${renderDescriptionBulletsHTML(exp.description, isCompact)}</div></div>`;
        }).join("")}</section>`;
      case "education":
        return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:${isCompact ? '0.35rem' : '0.5rem'};display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.2;padding-bottom:${isCompact ? '0.35rem' : '0.5rem'};border-bottom:1px solid #f3f4f6;break-after:avoid;page-break-after:avoid;">${renderWithIcons}${t.education}</h2>${data.education.map(edu => {
          const showGPA = preferences?.education?.showGPA !== false && edu.gpa;
          const showPercentage = preferences?.education?.showPercentage !== false && edu.percentage;
          const gradeFormat = preferences?.education?.gradeFormat || "both";
          let gradeStr = "";
          if (showGPA && (gradeFormat === "gpa" || gradeFormat === "both")) {
            gradeStr += `GPA: ${cleanText(edu.gpa)}`;
          }
          if (showPercentage && (gradeFormat === "percentage" || gradeFormat === "both")) {
            gradeStr += `${gradeStr ? " | " : ""}Percentage: ${cleanText(edu.percentage)}`;
          }
          const start = edu.startDate ? formatDate(edu.startDate) : '';
          const end = edu.endDate ? formatDate(edu.endDate) : '';
          let dateStr = '';
          if (start && end) {
            dateStr = `${start} - ${end}`;
          } else if (start) {
            dateStr = start;
          } else if (end) {
            dateStr = end;
          }
          return `<div class="education-entry" style="margin-bottom:${isCompact ? '0.5rem' : '0.6rem'};padding-left:${layout.timelineStyle ? '0.9rem' : '0'};${layout.timelineStyle ? 'border-left:0.15rem solid ' + mergedColors.accent + ';position:relative;' : ''}"><div class="education-header"><h3 style="font-weight:600;font-size:0.9375rem;color:${mergedColors.primary};font-family:${styles.fontFamily};margin:0 0 0.1rem 0;line-height:1.3;">${cleanText(edu.institution) || "Institution Name"}</h3><p style="font-size:0.9375rem;color:${mergedColors.text};font-family:${styles.fontFamily};margin:0 0 0.15rem 0;line-height:1.4;">${cleanText(edu.degree) || "Degree"}${edu.field ? ` in ${cleanText(edu.field)}` : ""}</p>${(dateStr || gradeStr) ? `<p style="font-size:0.75rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};margin:0;line-height:1.2;">${dateStr}${dateStr && gradeStr ? ' | ' : ''}${gradeStr || ''}</p>` : ''}</div></div>`;
        }).join("")}</section>`;
      case "skills":
        // Debug logging for skills
        console.log('🔍 Skills Debug:', {
          skillsExists: !!data.skills,
          skillsType: Array.isArray(data.skills) ? 'array' : typeof data.skills,
          skillsLength: data.skills?.length || 0,
          firstSkill: data.skills?.[0],
          allSkills: data.skills
        });

        // Check if skills exist and are valid
        if (!data.skills || !Array.isArray(data.skills) || data.skills.length === 0) {
          console.log('❌ Skills section skipped: no valid skills data');
          return "";
        }

        // Normalize skills data to handle both string arrays and object arrays
        const normalizeSkill = (skill) => {
          if (typeof skill === 'string') {
            return { name: skill, proficiency: null };
          } else if (typeof skill === 'object' && skill !== null) {
            return {
              name: skill.name || skill.skill || String(skill),
              proficiency: skill.proficiency || skill.level || null
            };
          } else {
            return { name: String(skill), proficiency: null };
          }
        };

        const normalizedSkills = data.skills.map(normalizeSkill);
        console.log('🔍 Normalized skills:', normalizedSkills);

        const skillDisplay = preferences?.skills?.display || layout.skillsDisplay || "tags"; // list | grid | tags | bars
        const showProf = preferences?.skills?.showProficiency && normalizedSkills.some(s => s.proficiency);
        if (skillDisplay === "tags") {
          return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:${isCompact ? '0.3rem' : '0.5rem'};display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;padding-bottom:${isCompact ? '0.3rem' : '0.5rem'};border-bottom:1px solid #f3f4f6;">${renderWithIcons}${t.skills}</h2><div style="display:flex;flex-wrap:wrap;gap:${isCompact ? '0.2rem' : '0.25rem'};">${normalizedSkills.map(skill => `<span style=\"background:#E0E7FF;color:#3730A3;font-size:0.8125rem;padding:0.25rem 0.5rem;border-radius:0.375rem;font-family:${styles.fontFamily};word-wrap:break-word;word-break:break-all;max-width:100%;overflow-wrap:break-word;\">${cleanText(skill.name)}${showProf && skill.proficiency ? ` (${cleanText(skill.proficiency)})` : ''}</span>`).join("")}</div></section>`;
        } else if (skillDisplay === "grid") {
          const columns = preferences?.skills?.columns || 2;
          return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;padding-bottom:0.5rem;border-bottom:1px solid #f3f4f6;">${renderWithIcons}${t.skills}</h2><div style="display:grid;grid-template-columns:repeat(${columns},1fr);gap:0.5rem;">${normalizedSkills.map(skill => `<div style=\"background:white;padding:0.25rem;border:1px solid rgba(255,255,255,0.5);border-radius:0.375rem;font-family:${styles.fontFamily};overflow:hidden;\"><span style=\"font-size:0.9375rem;color:${mergedColors.text};line-height:1.5;word-wrap:break-word;word-break:break-all;max-width:100%;overflow-wrap:break-word;\">${cleanText(skill.name)}${showProf && skill.proficiency ? ` (${cleanText(skill.proficiency)})` : ''}</span></div>`).join("")}</div></section>`;
        } else if (skillDisplay === "bars") {
          const scale = preferences?.skills?.proficiencyScale || "1-5";
          const calcPercent = (prof) => {
            if (!prof) return 0;
            if (scale === "percentage") return Math.min(100, parseInt(prof, 10));
            if (scale === "beginner-expert") {
              const levels = ["beginner", "intermediate", "advanced", "expert"];
              const idx = levels.findIndex(l => l.toLowerCase() === String(prof).toLowerCase());
              return idx >= 0 ? ((idx + 1) / levels.length) * 100 : 0;
            }
            // 1-5 numeric
            return Math.min(100, (parseInt(prof, 10) || 0) * 20);
          };
          return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;padding-bottom:0.5rem;border-bottom:1px solid #f3f4f6;">${renderWithIcons}${t.skills}</h2><div style="display:flex;flex-direction:column;gap:0.25rem;">${normalizedSkills.map(skill => {
            const percent = calcPercent(skill.proficiency);
            return `<div style=\"display:flex;flex-direction:column;gap:0.1rem;font-family:${styles.fontFamily};\"><div style=\"display:flex;justify-content:space-between;font-size:0.8125rem;color:${mergedColors.text};\"><span style=\"word-wrap:break-word;word-break:break-all;max-width:100%;overflow-wrap:break-word;\">${cleanText(skill.name)}</span>${showProf && skill.proficiency ? `<span style=\"color:${mergedColors.secondary};word-wrap:break-word;word-break:break-all;max-width:100%;overflow-wrap:break-word;\">${cleanText(skill.proficiency)}</span>` : ''}</div><div style=\"width:100%;height:0.375rem;background:#E5E7EB;border-radius:0.25rem;overflow:hidden;\"><div style=\"width:${percent}%;height:100%;background:${mergedColors.accent};border-radius:0.25rem;\"></div></div></div>`;
          }).join("")}</div></section>`;
        } else {
          // list
          return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;padding-bottom:0.5rem;border-bottom:1px solid #f3f4f6;">${renderWithIcons}${t.skills}</h2><ul style="margin:0;padding-left:1.25rem;list-style:disc;">${normalizedSkills.map(skill => `<li style=\"font-size:0.9375rem;color:${mergedColors.text};font-family:${styles.fontFamily};line-height:1.5;word-wrap:break-word;word-break:break-all;max-width:100%;overflow-wrap:break-word;\">${cleanText(skill.name)}${showProf && skill.proficiency ? ` (${cleanText(skill.proficiency)})` : ''}</li>`).join("")}</ul></section>`;
        }
      case "certifications":
        return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:${isCompact ? '0.35rem' : '0.5rem'};display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.2;padding-bottom:${isCompact ? '0.35rem' : '0.5rem'};border-bottom:1px solid #f3f4f6;break-after:avoid;page-break-after:avoid;">${renderWithIcons}${t.certifications}</h2>${data.certifications.map(cert => `<div style="margin-bottom:${isCompact ? '0.4rem' : '0.5rem'};padding-left:${layout.timelineStyle ? '0.9rem' : '0'};${layout.timelineStyle ? 'border-left:0.15rem solid ' + mergedColors.accent + ';position:relative;' : ''}"><h3 style="font-weight:600;font-size:0.9375rem;color:${mergedColors.primary};font-family:${styles.fontFamily};margin:0 0 0.1rem 0;line-height:1.3;break-after:avoid;page-break-after:avoid;">${cleanText(cert.name) || "Certification Name"}</h3>${(cert.issuer || cert.date) ? `<p style="font-size:0.75rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};margin:0;line-height:1.2;">${cert.issuer ? cleanText(cert.issuer) : ''}${cert.issuer && cert.date ? ' • ' : ''}${cert.date ? formatDate(cert.date) : ''}</p>` : ''}</div>`).join("")}</section>`;
      case "achievements":
        if (!data.achievements || !Array.isArray(data.achievements) || data.achievements.length === 0) return "";
        return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:${isCompact ? '0.35rem' : '0.5rem'};display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;padding-bottom:${isCompact ? '0.3rem' : '0.5rem'};border-bottom:1px solid #f3f4f6;">${renderWithIcons}${t.achievements || "Achievements"}</h2><ul style="margin:0;padding-left:${isCompact ? '1rem' : '1.25rem'};list-style:disc;">${data.achievements.map(achievement => `<li style="font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};line-height:1.5;margin-bottom:${isCompact ? '0.25rem' : '0.35rem'};">${parseRichText(cleanText(achievement))}</li>`).join("")}</ul></section>`;
      case "languages":
        return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;padding-bottom:0.5rem;border-bottom:1px solid #f3f4f6;">${renderWithIcons}${t.languages}</h2><div style="display:grid;grid-template-columns:${layout.columns === 2 ? '1fr' : 'repeat(2,1fr)'};gap:0.5rem;">${data.languages.map(lang => `<div style="background:white;padding:0.25rem;border:1px solid rgba(255,255,255,0.5);border-radius:0.375rem;display:flex;justify-content:space-between;align-items:center;overflow:hidden;"><span style="font-size:0.9375rem;color:${mergedColors.text};font-family:${styles.fontFamily};word-wrap:break-word;word-break:break-all;max-width:100%;overflow-wrap:break-word;line-height:1.5;">${cleanText(lang.language) || "Language"} ${lang.proficiency ? `(${cleanText(lang.proficiency)})` : ""}</span></div>`).join("")}</div></section>`;
      case "personal":
        return ""; // Personal info is already in header, skip rendering as section
      case "customSections":
        if (!data.customSections || data.customSections.length === 0) return "";

        // Group custom sections by type
        const groupedSections = data.customSections.reduce((acc, current) => {
          const type = (current.type || "project").toLowerCase();
          if (!acc[type]) acc[type] = [];
          acc[type].push(current);
          return acc;
        }, {});

        return Object.entries(groupedSections).map(([type, items]) => {
          const sectionTitle = (t[type] || type.charAt(0).toUpperCase() + type.slice(1) + (type.endsWith('s') ? '' : 's'));
          const customRenderWithIcons = layout.showIcons ? `<span style="width:1rem;height:1rem;margin-right:0.25rem;display:inline-flex;align-items:center;justify-content:center;">${(sectionIconMap[type] && renderedIcons[sectionIconMap[type]]) || `<span style="display:inline-block;width:1rem;height:1rem;color:${mergedColors.accent};font-size:0.625rem;text-align:center;line-height:1rem;">?</span>`}</span>` : "";

          // Generate HTML for items in this group
          const itemsHtml = items.map(cs => {
            const itemTitle = cs.name || cs.title || "";
            return `<div style="background:white;padding:0.25rem;border:1px solid rgba(255,255,255,0.5);border-radius:0.375rem;overflow:hidden;"><h3 style="font-weight:600;font-size:0.9375rem;color:${mergedColors.primary};font-family:${styles.fontFamily};word-wrap:break-word;word-break:break-all;max-width:100%;overflow-wrap:break-word;margin-bottom:0.05rem;line-height:1.1;">${cleanText(itemTitle) || ""}</h3>${renderDescriptionBulletsHTML(cs.description, isCompact, [sectionTitle, itemTitle])}${cs.date ? `<p style="font-size:0.8125rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};word-wrap:break-word;word-break:break-all;max-width:100%;overflow-wrap:break-word;margin-top:0.25rem;line-height:1.1;">${formatDate(cs.date)}</p>` : ''}</div>`;
          }).join("");

          return `<section style="${sectionStyle}"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:${isCompact ? '0.3rem' : '0.5rem'};display:flex;align-items:center;gap:0.25rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;padding-bottom:${isCompact ? '0.3rem' : '0.5rem'};border-bottom:1px solid #f3f4f6;">${customRenderWithIcons}${sectionTitle}</h2><div style="display:flex;flex-direction:column;gap:0.25rem;">${itemsHtml}</div></section>`;
        }).join("");
      default:
        return "";
    }
  };

  const renderHeader = () => {
    const isCompact = layout.timelineStyle || layout.columns === 2;
    // Match preview padding: p-8 = 2rem = 32px for full-width header, p-6 = 1.5rem = 24px for compact
    const headerPadding = layout.headerStyle === "full-width" ? '2rem' : (isCompact ? '0.4rem' : '1.5rem');
    const headerBaseStyle = `margin:0;margin-bottom:${isCompact ? '0.25rem' : '0.5rem'};padding:${headerPadding};background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%);color:white;border-radius:${layout.headerStyle === "full-width" ? '1rem' : '0.5rem'};font-family:${styles.fontFamily};box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:1px solid rgba(255,255,255,0.5);`;

    if (layout.headerStyle === "compact") {
      return `<header style="${headerBaseStyle}text-align:center;"><h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.05rem;font-family:${styles.fontFamily};line-height:1.1;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:0.875rem;font-weight:500;opacity:0.9;margin-bottom:0.075rem;font-family:${styles.fontFamily};line-height:1.1;">${cleanText(data.jobTitle)}</p>` : ''}<div style="font-size:0.75rem;font-family:${styles.fontFamily};white-space:normal;word-wrap:break-word;"><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.email) || "email@example.com"}</p><p style="margin:0.075rem 0;line-height:1.1;">${data.phone || "+1 (555) 123-4567"}</p><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.address) || "123 Street, City, Country"}</p>${data.linkedin ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.linkedin)}" style="color:white;text-decoration:underline;">${cleanText(data.linkedin)}</a></p>` : ""}${data.dateOfBirth ? `<p style="margin:0.075rem 0;line-height:1.1;">DOB: ${data.dateOfBirth}</p>` : ""}${data.gender ? `<p style="margin:0.075rem 0;line-height:1.1;">${data.gender}</p>` : ""}${data.maritalStatus ? `<p style="margin:0.075rem 0;line-height:1.1;">${data.maritalStatus}</p>` : ""}${data.portfolio ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.portfolio)}" style="color:white;text-decoration:underline;">${cleanText(data.portfolio)}</a></p>` : ""}</div></header>`;
    } else if (layout.headerStyle === "full-width") {
      // Match preview styling: p-8 (2rem), rounded-2xl (1rem), gap-8 (2rem), gap-6 (1.5rem)
      // Preview uses 3-color gradient: primary -> accent -> secondary, shadow-xl
      const fullWidthHeaderStyle = `margin:0;margin-bottom:1.5rem;padding:2rem;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 50%,${mergedColors.secondary} 100%);color:white;border-radius:1rem;font-family:${styles.fontFamily};box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);border:1px solid rgba(255,255,255,0.5);position:relative;overflow:hidden;`;
      return `<header style="${fullWidthHeaderStyle}"><div style="position:absolute;inset:0;opacity:0.1;pointer-events:none;"><div style="position:absolute;top:0;right:0;width:16rem;height:16rem;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.3) 0%,transparent 70%);"></div><div style="position:absolute;bottom:0;left:0;width:12rem;height:12rem;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%);"></div></div><div style="position:relative;z-index:10;display:flex;flex-wrap:nowrap;justify-content:space-between;align-items:center;gap:2rem;"><div style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:1.5rem;">${data.photo && data.photo.trim() !== "" ? `<img src="${data.photo}" alt="Profile" style="width:6rem;height:6rem;border-radius:1rem;object-fit:cover;border:4px solid white;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">` : ""}<div><h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;font-family:${styles.fontFamily};word-wrap:break-word;line-height:1.2;text-shadow:0 2px 4px rgba(0,0,0,0.3);">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.125rem;font-weight:500;opacity:0.95;font-family:${styles.fontFamily};word-wrap:break-word;line-height:1.2;text-shadow:0 1px 2px rgba(0,0,0,0.2);">${cleanText(data.jobTitle)}</p>` : ''}</div></div><div style="font-size:0.875rem;text-align:right;flex:0 0 auto;max-width:50%;font-family:${styles.fontFamily};white-space:normal;word-wrap:break-word;line-height:1.6;opacity:0.9;"><p style="margin:0.25rem 0;line-height:1.5;">${cleanText(data.email) || "email@example.com"}</p><p style="margin:0.25rem 0;line-height:1.5;">${data.phone || "+1 (555) 123-4567"}</p><p style="margin:0.25rem 0;line-height:1.5;">${cleanText(data.address) || "123 Street, City, Country"}</p>${data.linkedin ? `<p style="margin:0.25rem 0;line-height:1.5;"><a href="${cleanText(data.linkedin)}" style="color:white;text-decoration:underline;">${cleanText(data.linkedin)}</a></p>` : ""}${data.dateOfBirth ? `<p style="margin:0.25rem 0;line-height:1.5;">DOB: ${data.dateOfBirth}</p>` : ""}${data.gender ? `<p style="margin:0.25rem 0;line-height:1.5;">${data.gender}</p>` : ""}${data.maritalStatus ? `<p style="margin:0.25rem 0;line-height:1.5;">${data.maritalStatus}</p>` : ""}${data.portfolio ? `<p style="margin:0.25rem 0;line-height:1.5;"><a href="${cleanText(data.portfolio)}" style="color:white;text-decoration:underline;">${cleanText(data.portfolio)}</a></p>` : ""}</div></div></header>`;
    } else if (layout.headerStyle === "minimal" || layout.headerStyle === "minimal-header") {
      return `<header style="margin-bottom:1rem;border-bottom:3px solid ${mergedColors.primary};padding-bottom:0.75rem;text-align:center;font-family:${styles.fontFamily};"><h1 style="font-size:2rem;font-weight:300;letter-spacing:0.1em;margin-bottom:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.125rem;margin-bottom:0.75rem;color:${mergedColors.secondary};letter-spacing:0.05em;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};"><div style="display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;"><span>${cleanText(data.email) || "email@example.com"}</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>${cleanText(data.address)}</span>` : ""}</div>${(data.dateOfBirth || data.gender || data.maritalStatus) ? `<div style="display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;">${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ""}${data.gender ? `<span>${data.gender}</span>` : ""}${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ""}</div>` : ""}</div></header>`;
    } else if (layout.headerStyle === "creative-asymmetric") {
      return `<header style="margin-bottom:1.5rem;position:relative;border-radius:1rem;overflow:hidden;min-height:7.5rem;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.secondary} 60%,${mergedColors.accent} 100%);font-family:${styles.fontFamily};"><div style="position:absolute;top:1rem;right:1rem;width:4rem;height:4rem;border-radius:50%;opacity:0.1;background:radial-gradient(circle,${mergedColors.accent} 0%,transparent 70%);"></div><div style="position:absolute;top:1.5rem;left:1.5rem;width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.2);"></div><div style="position:absolute;top:2.5rem;left:1rem;width:0.25rem;height:0.25rem;border-radius:50%;background:rgba(255,255,255,0.3);"></div><div style="position:absolute;bottom:1.5rem;right:2.5rem;width:0.375rem;height:0.375rem;border-radius:50%;background:rgba(255,255,255,0.15);"></div><div style="position:relative;z-index:10;padding:1.5rem;color:white;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;"><div style="flex-shrink:0;"><h1 style="font-size:1.875rem;font-weight:700;line-height:1.2;margin-bottom:0.25rem;text-shadow:0 2px 8px rgba(0,0,0,0.3);color:white;font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.125rem;font-weight:500;opacity:0.9;text-shadow:0 1px 4px rgba(0,0,0,0.2);color:white;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}</div><div style="flex:1;display:flex;justify-content:center;"><div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;font-size:0.875rem;opacity:0.9;justify-content:center;"><div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;justify-content:center;"><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${cleanText(data.email) || "email@example.com"}</span></div><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${data.phone || "+1 (555) 123-4567"}</span></div>${data.address ? `<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${cleanText(data.address)}</span></div>` : ""}</div>${(data.dateOfBirth || data.gender || data.maritalStatus) ? `<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;justify-content:center;">${data.dateOfBirth ? `<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>DOB: ${data.dateOfBirth}</span></div>` : ""}${data.gender ? `<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${data.gender}</span></div>` : ""}${data.maritalStatus ? `<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${data.maritalStatus}</span></div>` : ""}</div>` : ""}</div></div><div style="flex-shrink:0;">${data.photo ? `<div style="position:relative;transform:rotate(2deg);"><img src="${data.photo}" alt="Profile" style="width:5rem;height:5rem;border-radius:0.75rem;object-fit:cover;box-shadow:0 8px 24px rgba(0,0,0,0.15);border:2px solid white;filter:contrast(1.05) saturate(1.05);"><div style="position:absolute;top:-0.25rem;right:-0.25rem;width:0.75rem;height:0.75rem;border-radius:50%;border:2px solid white;background:${mergedColors.accent};"></div></div>` : `<div style="position:relative;transform:rotate(1deg);width:5rem;height:5rem;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;color:white;font-size:1.125rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,0.15);border:2px solid white;background:linear-gradient(135deg,${mergedColors.accent} 0%,${mergedColors.secondary} 100%);">${(cleanText(data.name) || "YN").split(' ').map(n => n[0]).join('').slice(0, 2)}</div>`}</div></div></header>`;
    } else if (layout.headerStyle === "creative") {
      return `<header style="margin-bottom:1rem;padding:1.5rem;border-radius:1rem;position:relative;overflow:hidden;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%);color:white;font-family:${styles.fontFamily};"><div style="position:absolute;inset:0;opacity:0.2;pointer-events:none;"><svg viewBox="0 0 100 100" style="width:100%;height:100%;"><defs><pattern id="creative-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3"/></pattern></defs><rect width="100%" height="100%" fill="url(#creative-pattern)"/></svg></div><div style="position:relative;z-index:10;display:flex;align-items:center;gap:1.5rem;">${data.photo ? `<div style="flex-shrink:0;"><img src="${data.photo}" alt="Profile" style="width:5rem;height:5rem;border-radius:50%;object-fit:cover;border:4px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2);"></div>` : ""}<div style="flex:1;"><h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;background:linear-gradient(45deg,#fff,#f0f0f0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.25rem;font-weight:500;margin-bottom:0.75rem;opacity:0.9;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;font-size:0.875rem;opacity:0.85;"><div>${cleanText(data.email) || "email@example.com"}</div><div>${data.phone || "+1 (555) 123-4567"}</div>${data.address ? `<div style="grid-column:span 2;">${cleanText(data.address)}</div>` : ""}${data.dateOfBirth ? `<div>DOB: ${data.dateOfBirth}</div>` : ""}${data.gender ? `<div>${data.gender}</div>` : ""}${data.maritalStatus ? `<div>${data.maritalStatus}</div>` : ""}</div></div></div></div></header>`;
    } else if (layout.headerStyle === "elegant") {
      return `<header style="margin-bottom:1rem;border-bottom:4px solid #374151;padding-bottom:1rem;text-align:center;font-family:${styles.fontFamily};"><h1 style="font-size:2.25rem;font-family:'Playfair Display',serif;margin-bottom:0.25rem;color:${mergedColors.primary};font-weight:700;letter-spacing:-0.02em;">${cleanText(data.name) || "Your Name"}</h1><div style="width:6rem;height:0.25rem;margin:0 auto 0.75rem;background:${mergedColors.accent};"></div>${data.jobTitle ? `<p style="font-size:1.125rem;font-style:italic;margin-bottom:1rem;color:${mergedColors.secondary};font-family:'Playfair Display',serif;">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;font-size:0.875rem;font-weight:500;color:${mergedColors.text};font-family:${styles.fontFamily};"><div style="display:flex;justify-content:center;align-items:center;gap:1rem;flex-wrap:wrap;"><span>${cleanText(data.email) || "email@example.com"}</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>${cleanText(data.address)}</span>` : ""}</div>${(data.dateOfBirth || data.gender || data.maritalStatus) ? `<div style="display:flex;justify-content:center;align-items:center;gap:1rem;flex-wrap:wrap;">${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ""}${data.gender ? `<span>${data.gender}</span>` : ""}${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ""}</div>` : ""}</div></header>`;
    } else if (layout.headerStyle === "hero-banner") {
      return `<header style="margin-bottom:1rem;padding:1.5rem;border-radius:0.75rem;position:relative;background:${mergedColors.headerGradient || `linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%)`};color:white;min-height:7.5rem;font-family:${styles.fontFamily};"><div style="position:absolute;inset:0;background:rgba(0,0,0,0.1);border-radius:0.75rem;"></div><div style="position:relative;z-index:10;display:flex;align-items:center;justify-content:center;height:100%;"><div style="text-align:center;">${data.photo && data.photo.trim() !== "" ? `<img src="${data.photo}" alt="Profile" style="width:4rem;height:4rem;border-radius:50%;object-fit:cover;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2);margin:0 auto 0.75rem;display:block;">` : ""}<h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;text-shadow:0 2px 4px rgba(0,0,0,0.3);font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.125rem;font-weight:300;margin-bottom:1rem;opacity:0.95;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;font-size:0.875rem;"><div style="display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;"><span>${cleanText(data.email) || "email@example.com"}</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>${cleanText(data.address)}</span>` : ""}</div>${(data.dateOfBirth || data.gender || data.maritalStatus) ? `<div style="display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;">${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ""}${data.gender ? `<span>${data.gender}</span>` : ""}${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ""}</div>` : ""}</div></div></div></header>`;
    } else if (layout.headerStyle === "portfolio-modern") {
      return `<header style="margin-bottom:1rem;position:relative;background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%);border-radius:0.75rem;overflow:hidden;font-family:${styles.fontFamily};"><div style="height:0.375rem;background:linear-gradient(90deg,${mergedColors.primary} 0%,${mergedColors.accent} 50%,${mergedColors.secondary} 100%);"></div><div style="padding:1.5rem;"><div style="display:flex;align-items:start;gap:1.5rem;"><div style="flex-shrink:0;">${data.photo ? `<div style="position:relative;"><img src="${data.photo}" alt="Profile" style="width:5rem;height:5rem;border-radius:0.75rem;object-fit:cover;box-shadow:0 4px 12px rgba(0,0,0,0.1);border:3px solid white;"></div>` : `<div style="width:5rem;height:5rem;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;color:white;font-size:1.25rem;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.1);border:3px solid white;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%);">${(cleanText(data.name) || "YN").split(' ').map(n => n[0]).join('').slice(0, 2)}</div>`}</div><div style="flex:1;"><h1 style="font-size:1.5rem;font-weight:600;margin-bottom:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};letter-spacing:-0.01em;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1rem;margin-bottom:1rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;flex-wrap:wrap;gap:0.75rem;font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};"><div style="display:flex;align-items:center;gap:0.375rem;"><div style="width:1rem;height:1rem;border-radius:0.375rem;background:${mergedColors.accent};display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 20 20" fill="white"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg></div><span>${cleanText(data.email) || "email@example.com"}</span></div><div style="display:flex;align-items:center;gap:0.375rem;"><div style="width:1rem;height:1rem;border-radius:0.375rem;background:${mergedColors.accent};display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 20 20" fill="white"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg></div><span>${data.phone || "+1 (555) 123-4567"}</span></div>${data.address ? `<div style="display:flex;align-items:center;gap:0.375rem;"><div style="width:1rem;height:1rem;border-radius:0.375rem;background:${mergedColors.accent};display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg></div><span>${cleanText(data.address)}</span></div>` : ""}</div></div></div></div></header>`;
    } else {
      return `<header style="${headerBaseStyle}position:relative;overflow:hidden;"><div style="position:absolute;inset:0;opacity:0.1;pointer-events:none;"><svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;"><path d="M0,0 Q50,50 100,0" stroke="${mergedColors.accent}" stroke-width="2" fill="none" /><path d="M0,100 Q50,50 100,100" stroke="${mergedColors.accent}" stroke-width="2" fill="none" /></svg></div><div style="position:relative;z-index:10;display:flex;flex-wrap:nowrap;justify-content:space-between;align-items:center;gap:0.5rem;"><div style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:0.5rem;">${data.photo && data.photo.trim() !== "" ? `<img src="${data.photo}" alt="Profile" style="width:4rem;height:4rem;border-radius:9999px;object-fit:cover;border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.05);">` : ""}<div><h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.05rem;font-family:${styles.fontFamily};word-wrap:break-word;line-height:1.1;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:0.875rem;font-weight:500;opacity:0.9;font-family:${styles.fontFamily};word-wrap:break-word;margin-top:0.075rem;line-height:1.1;">${cleanText(data.jobTitle)}</p>` : ''}</div></div><div style="font-size:0.75rem;text-align:right;flex:0 0 auto;min-width:180px;font-family:${styles.fontFamily};white-space:nowrap;"><p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">${cleanText(data.email) || "email@example.com"}</p><p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">${data.phone || "+1 (555) 123-4567"}</p><p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">${cleanText(data.address) || "123 Street, City, Country"}</p>${data.linkedin ? `<p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;"><a href="${cleanText(data.linkedin)}" style="color:white;text-decoration:underline;">${cleanText(data.linkedin)}</a></p>` : ""}${data.dateOfBirth ? `<p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">DOB: ${data.dateOfBirth}</p>` : ""}${data.gender ? `<p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">${data.gender}</p>` : ""}${data.maritalStatus ? `<p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">${data.maritalStatus}</p>` : ""}${data.portfolio ? `<p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;"><a href="${cleanText(data.portfolio)}" style="color:white;text-decoration:underline;">${cleanText(data.portfolio)}</a></p>` : ""}</div></div></header>`;
    }
  };

  const renderLayout = () => {
    const header = renderHeader();
    // No watermark needed - all users have paid plans
    const watermark = "";

    // Use the same path as ResumePreview component: preferences?.layout?.customSectionOrder
    const customSectionOrder = preferences?.layout?.customSectionOrder;

    // Determine sections order based on custom ordering (if any)
    let sectionsOrder;
    let sidebarSections = layout.sidebarSections || [];
    let mainSections = layout.mainSections || [];
    let columns = layout.columns;

    if (customSectionOrder) {
      if (customSectionOrder.layout === 'single-column') {
        sectionsOrder = customSectionOrder.sectionsOrder || [...layout.sectionsOrder];
        columns = 1;
        sidebarSections = [];
        mainSections = sectionsOrder;
      } else if (customSectionOrder.layout === 'two-column') {
        sidebarSections = customSectionOrder.sidebarSections || [];
        mainSections = customSectionOrder.mainSections || [];
        columns = 2;
        // Combine for fallback sectionsOrder
        sectionsOrder = [...sidebarSections, ...mainSections];
      } else {
        // Legacy format or unknown layout
        sectionsOrder = [...layout.sectionsOrder];
      }
    } else {
      sectionsOrder = [...layout.sectionsOrder];
    }

    // Add achievements if it exists and isn't already included
    if (data.achievements && data.achievements.length > 0) {
      if (!sectionsOrder.includes("achievements")) {
        sectionsOrder.push("achievements");
      }
      if (columns === 2 && !sidebarSections.includes("achievements") && !mainSections.includes("achievements")) {
        mainSections = [...mainSections, "achievements"];
      }
    }

    // Add customSections if it exists and isn't already included
    if (data.customSections && data.customSections.length > 0) {
      if (!sectionsOrder.includes("customSections")) {
        sectionsOrder.push("customSections");
      }
      if (columns === 2 && !sidebarSections.includes("customSections") && !mainSections.includes("customSections")) {
        mainSections = [...mainSections, "customSections"];
      }
    }

    if (columns === 1) {
      const sections = sectionsOrder.map(section => renderSectionContent(section)).join("");
      return `<div class="resume-container" style="width:100%;padding:0.5rem;border-radius:0.75rem;background-color:${mergedColors.background};font-family:${styles.fontFamily};box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);position:relative;border:1px solid rgba(255,255,255,0.5);">${header}<div>${sections}</div>${watermark}</div>`;
    }
    if (columns === 2) {
      const sidebarContent = sidebarSections.map(section => renderSectionContent(section)).filter(Boolean).join("");
      const mainContent = mainSections.map(section => renderSectionContent(section)).filter(Boolean).join("");

      const sidebarBackground = typeof layout.sidebar === "string" ? layout.sidebar : mergedColors.background;
      // Special handling for timeline_professional template
      const isTimelineTemplate = template === 'timeline_professional' || layout.timelineStyle;
      const gridMarginTop = isTimelineTemplate ? '0.25rem' : '0.5rem';

      return `<div class="resume-container two-column" style="width:100%;padding:0.5rem;border-radius:0.75rem;background-color:${mergedColors.background};font-family:${styles.fontFamily};box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);position:relative;border:1px solid rgba(255,255,255,0.5);">${header}<div class="grid-container" style="display:grid;grid-template-columns:${layout.sidebarWidth || '25%'} ${100 - parseInt(layout.sidebarWidth || '25')}% ;gap:1.5rem;align-items:start;margin-top:${gridMarginTop};"><div class="sidebar-column" style="padding:0.75rem;background:${sidebarBackground};border-radius:0.375rem;font-family:${styles.fontFamily};overflow-wrap:break-word;border:1px solid rgba(255,255,255,0.5);">${sidebarContent}</div><div class="main-column" style="padding:0.75rem;background:white;border-radius:0.375rem;font-family:${styles.fontFamily};border:1px solid rgba(255,255,255,0.5);">${mainContent}</div></div>${watermark}</div>`;
    }
    // Fallback to single column
    const sections = sectionsOrder.map(section => renderSectionContent(section)).join("");
    return `<div class="resume-container" style="width:100%;padding:0.5rem;border-radius:0.75rem;background-color:${mergedColors.background};font-family:${styles.fontFamily};box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);position:relative;border:1px solid rgba(255,255,255,0.5);">${header}<div>${sections}</div>${watermark}</div>`;
  };

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>html{font-size:16px;}body{width:100%;min-height:0;margin:0 auto;padding:0;background-color:${mergedColors.background};color:${mergedColors.text};font-family:${styles.fontFamily},sans-serif;box-sizing:border-box;display:flex;justify-content:center;align-items:flex-start;word-break:keep-all;hyphens:manual;overflow-wrap:normal;white-space:normal;text-rendering:optimizeLegibility;-webkit-font-feature-settings:"liga" 1, "kern" 1;font-feature-settings:"liga" 1, "kern" 1;}@media print{body{width:100%;min-height:0;margin:0 auto;padding:0;background-color:${mergedColors.background};}p{orphans:2;widows:2;word-break:keep-all;hyphens:manual;overflow-wrap:normal;}section{orphans:1;widows:1;}div{orphans:1;widows:1;}@page{margin:0.1in 0.3in;size:${country === 'us' ? 'Letter' : 'A4'};}.experience-entry,.education-entry{break-inside:auto;page-break-inside:auto;}.experience-header,.education-header{break-inside:avoid;page-break-inside:avoid;}.experience-description,.education-description{break-inside:auto;page-break-inside:auto;}li{break-inside:avoid;page-break-inside:avoid;}h1,h2,h3{break-after:avoid;page-break-after:avoid;}}h1,h2,h3{font-weight:700;margin:0;word-break:keep-all;hyphens:manual;}p{margin:0;white-space:normal;word-break:keep-all;hyphens:manual;overflow-wrap:normal;}img{max-width:100%;height:auto;}svg{display:inline-block;vertical-align:middle;}header{break-after:auto;page-break-after:auto;}section{break-inside:auto;page-break-inside:auto;break-after:auto;page-break-after:auto;}section h2{break-after:avoid;page-break-after:avoid;}section > div{break-inside:auto;page-break-inside:auto;}div[style*="grid-template-columns"]{break-inside:auto;page-break-inside:auto;}.resume-container{break-inside:auto;page-break-inside:auto;}.resume-container.two-column{break-inside:auto;page-break-inside:auto;}.grid-container{break-inside:auto;page-break-inside:auto;break-before:auto;page-break-before:auto;}.sidebar-column,.main-column{break-inside:auto;page-break-inside:auto;}ul,ol{break-inside:auto;page-break-inside:auto;}li{break-inside:avoid;page-break-inside:avoid;}div[style*="position:absolute"]{break-inside:avoid;page-break-inside:avoid;}</style></head><body>${renderLayout()}</body></html>`;
}

function generateCoverLetterHTML(coverLetterData, coverLetterTemplate = "classic", customColors = {}, resumeData, country = "us") {
  const templateConfig = getCachedTemplate(coverLetterTemplate, "coverLetter");
  const custom = customColors?.[coverLetterTemplate] || customColors || {};

  const styles = {
    ...(templateConfig.styles || {}),
    colors: {
      ...(templateConfig.styles?.colors || {}),
      primary: custom.primary || templateConfig.styles?.colors?.primary || "#4B5EAA",
      secondary: custom.secondary || templateConfig.styles?.colors?.secondary || "#6B7280",
      text: custom.text || templateConfig.styles?.colors?.text || "#1F2937",
      accent: custom.accent || templateConfig.styles?.colors?.accent || "#9333EA",
      background: custom.background || templateConfig.styles?.colors?.background || "#FFFFFF",
    },
  };
  const layout = { headerStyle: templateConfig.layout?.headerStyle || "compact" };
  const mergedColors = { ...styles.colors };

  const getFieldValue = (field) => {
    const fieldMappings = {
      name: [coverLetterData.name, resumeData?.personal?.name, "Your Name"],
      email: [coverLetterData.email, resumeData?.personal?.email, "email@example.com"],
      phone: [coverLetterData.phone, resumeData?.personal?.phone, "123-456-7890"],
      location: [coverLetterData.location, resumeData?.personal?.location, "City, State"],
      jobTitle: [coverLetterData.jobTitle, resumeData?.experience?.[0]?.title, "[jobTitle]"],
      company: [coverLetterData.company, resumeData?.experience?.[0]?.company, "[company]"],
      recipient: [coverLetterData.recipient, "Dear Hiring Manager"],
      intro: [coverLetterData.intro, templateConfig.defaultData.intro],
      body: [coverLetterData.body, templateConfig.defaultData.body],
      closing: [coverLetterData.closing, templateConfig.defaultData.closing],
    };
    return fieldMappings[field].find((val) => val !== undefined && val !== "") || fieldMappings[field][fieldMappings[field].length - 1];
  };

  const replacePlaceholders = (text) => {
    // Ensure text is a string
    const textStr = String(text || '');

    // Helper function to safely get string values
    const safeString = (value) => String(value || '');

    return textStr
      .replace(/\[jobTitle\]/g, safeString(getFieldValue("jobTitle")))
      .replace(/\[company\]/g, safeString(getFieldValue("company")))
      .replace(/\[previousCompany\]/g, safeString(resumeData?.experience?.[0]?.company) || "[previousCompany]")
      .replace(/\[achievement\]/g, safeString(resumeData?.experience?.[0]?.description) || "[achievement]")
      .replace(/\[field\]/g, (resumeData?.summary ? safeString(resumeData.summary).split(" ").slice(0, 2).join(" ") : "[field]") || "[field]")
      .replace(/\[skill\]/g, safeString(resumeData?.skills?.[0]?.name) || "[skill]")
      .replace(/\[skill1\]/g, safeString(resumeData?.skills?.[0]?.name) || "[skill1]")
      .replace(/\[skill2\]/g, safeString(resumeData?.skills?.[1]?.name) || "[skill2]")
      .replace(/\[skill3\]/g, safeString(resumeData?.skills?.[2]?.name) || "[skill3]")
      .replace(/\[specificTechSkill\]/g, safeString(resumeData?.skills?.[0]?.name) || "[specificTechSkill]")
      .replace(/\[specificMarketingSkill\]/g, safeString(resumeData?.skills?.[0]?.name) || "[specificMarketingSkill]")
      .replace(/\[specificLeadershipSkill\]/g, safeString(resumeData?.skills?.[0]?.name) || "[specificLeadershipSkill]")
      .replace(/\[specificCreativeSkill\]/g, safeString(resumeData?.skills?.[0]?.name) || "[specificCreativeSkill]")
      .replace(/\[specificProject\]/g, safeString(resumeData?.customSections?.[0]?.title) || "[specificProject]")
      .replace(/\[specificCampaign\]/g, safeString(resumeData?.customSections?.[0]?.title) || "[specificCampaign]")
      .replace(/\[metric\]/g, "[metric]")
      .replace(/\[percentage\]/g, "[percentage]")
      .replace(/\[specificCompanyGoal\]/g, "[specificCompanyGoal]")
      .replace(/\[specificValue\]/g, "[specificValue]")
      .replace(/\[previousRole\]/g, safeString(resumeData?.experience?.[0]?.title) || "[previousRole]")
      .replace(/\[years\]/g, resumeData?.yearsOfExperience ? String(resumeData.yearsOfExperience) : (resumeData?.experience?.[0]?.endDate ? String(new Date().getFullYear() - new Date(resumeData.experience[0].startDate).getFullYear()) : "[years]"))
      .replace(/\[RecipientName\]/g, "[RecipientName]");
  };

  const iconMapCover = {
    Phone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    Mail: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    MapPin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  };

  const renderHeader = () => {
    const headerBaseStyle = `margin-bottom:0.5rem;padding:0.75rem;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%);color:white;border-radius:0.5rem;font-family:${styles.fontFamily};box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:1px solid rgba(255,255,255,0.5);`;

    if (layout.headerStyle === "compact") {
      return `<header style="${headerBaseStyle}text-align:center;"><h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.05rem;font-family:${styles.fontFamily};line-height:1.1;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:0.875rem;font-weight:500;opacity:0.9;margin-bottom:0.075rem;font-family:${styles.fontFamily};line-height:1.1;">${cleanText(data.jobTitle)}</p>` : ''}<div style="font-size:0.75rem;font-family:${styles.fontFamily};white-space:normal;word-wrap:break-word;"><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.email) || "email@example.com"}</p><p style="margin:0.075rem 0;line-height:1.1;">${data.phone || "+1 (555) 123-4567"}</p><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.address) || "123 Street, City, Country"}</p>${data.linkedin ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.linkedin)}" style="color:white;text-decoration:underline;">${cleanText(data.linkedin)}</a></p>` : ""}${data.dateOfBirth ? `<p style="margin:0.075rem 0;line-height:1.1;">DOB: ${data.dateOfBirth}</p>` : ""}${data.gender ? `<p style="margin:0.075rem 0;line-height:1.1;">${data.gender}</p>` : ""}${data.maritalStatus ? `<p style="margin:0.075rem 0;line-height:1.1;">${data.maritalStatus}</p>` : ""}${data.portfolio ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.portfolio)}" style="color:white;text-decoration:underline;">${cleanText(data.portfolio)}</a></p>` : ""}</div></header>`;
    } else if (layout.headerStyle === "full-width") {
      return `<header style="${headerBaseStyle}"><div style="display:flex;flex-wrap:nowrap;justify-content:space-between;align-items:center;gap:0.5rem;"><div style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:0.5rem;">${data.photo && data.photo.trim() !== "" ? `<img src="${data.photo}" alt="Profile" style="width:4rem;height:4rem;border-radius:9999px;object-fit:cover;border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.05);">` : ""}<div><h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.05rem;font-family:${styles.fontFamily};word-wrap:break-word;line-height:1.1;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:0.875rem;font-weight:500;opacity:0.9;font-family:${styles.fontFamily};word-wrap:break-word;margin-top:0.075rem;line-height:1.1;">${cleanText(data.jobTitle)}</p>` : ''}</div></div><div style="font-size:0.75rem;text-align:right;flex:0 0 auto;max-width:50%;overflow:hidden;text-overflow:ellipsis;font-family:${styles.fontFamily};white-space:normal;word-wrap:break-word;"><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.email) || "email@example.com"}</p><p style="margin:0.075rem 0;line-height:1.1;">${data.phone || "+1 (555) 123-4567"}</p><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.address) || "123 Street, City, Country"}</p>${data.linkedin ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.linkedin)}" style="color:white;text-decoration:underline;">${cleanText(data.linkedin)}</a></p>` : ""}${data.dateOfBirth ? `<p style="margin:0.075rem 0;line-height:1.1;">DOB: ${data.dateOfBirth}</p>` : ""}${data.gender ? `<p style="margin:0.075rem 0;line-height:1.1;">${data.gender}</p>` : ""}${data.maritalStatus ? `<p style="margin:0.075rem 0;line-height:1.1;">${data.maritalStatus}</p>` : ""}${data.portfolio ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.portfolio)}" style="color:white;text-decoration:underline;">${cleanText(data.portfolio)}</a></p>` : ""}</div></div></header>`;
    } else if (layout.headerStyle === "minimal" || layout.headerStyle === "minimal-header") {
      return `<header style="margin-bottom:1rem;border-bottom:3px solid ${mergedColors.primary};padding-bottom:0.75rem;text-align:center;font-family:${styles.fontFamily};"><h1 style="font-size:2rem;font-weight:300;letter-spacing:0.1em;margin-bottom:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.125rem;margin-bottom:0.75rem;color:${mergedColors.secondary};letter-spacing:0.05em;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};"><div style="display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;"><span>${cleanText(data.email) || "email@example.com"}</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>${cleanText(data.address)}</span>` : ""}</div>${(data.dateOfBirth || data.gender || data.maritalStatus) ? `<div style="display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;">${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ""}${data.gender ? `<span>${data.gender}</span>` : ""}${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ""}</div>` : ""}</div></header>`;
    } else if (layout.headerStyle === "creative-asymmetric") {
      return `<header style="margin-bottom:1.5rem;position:relative;border-radius:1rem;overflow:hidden;min-height:7.5rem;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.secondary} 60%,${mergedColors.accent} 100%);font-family:${styles.fontFamily};"><div style="position:absolute;top:1rem;right:1rem;width:4rem;height:4rem;border-radius:50%;opacity:0.1;background:radial-gradient(circle,${mergedColors.accent} 0%,transparent 70%);"></div><div style="position:absolute;top:1.5rem;left:1.5rem;width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.2);"></div><div style="position:absolute;top:2.5rem;left:1rem;width:0.25rem;height:0.25rem;border-radius:50%;background:rgba(255,255,255,0.3);"></div><div style="position:absolute;bottom:1.5rem;right:2.5rem;width:0.375rem;height:0.375rem;border-radius:50%;background:rgba(255,255,255,0.15);"></div><div style="position:relative;z-index:10;padding:1.5rem;color:white;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;"><div style="flex-shrink:0;"><h1 style="font-size:1.875rem;font-weight:700;line-height:1.2;margin-bottom:0.25rem;text-shadow:0 2px 8px rgba(0,0,0,0.3);color:white;font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.125rem;font-weight:500;opacity:0.9;text-shadow:0 1px 4px rgba(0,0,0,0.2);color:white;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}</div><div style="flex:1;display:flex;justify-content:center;"><div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;font-size:0.875rem;opacity:0.9;justify-content:center;"><div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;justify-content:center;"><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${cleanText(data.email) || "email@example.com"}</span></div><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${data.phone || "+1 (555) 123-4567"}</span></div>${data.address ? `<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${cleanText(data.address)}</span></div>` : ""}</div>${(data.dateOfBirth || data.gender || data.maritalStatus) ? `<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;justify-content:center;">${data.dateOfBirth ? `<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>DOB: ${data.dateOfBirth}</span></div>` : ""}${data.gender ? `<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${data.gender}</span></div>` : ""}${data.maritalStatus ? `<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${data.maritalStatus}</span></div>` : ""}</div>` : ""}</div></div><div style="flex-shrink:0;">${data.photo ? `<div style="position:relative;transform:rotate(2deg);"><img src="${data.photo}" alt="Profile" style="width:5rem;height:5rem;border-radius:0.75rem;object-fit:cover;box-shadow:0 8px 24px rgba(0,0,0,0.15);border:2px solid white;filter:contrast(1.05) saturate(1.05);"><div style="position:absolute;top:-0.25rem;right:-0.25rem;width:0.75rem;height:0.75rem;border-radius:50%;border:2px solid white;background:${mergedColors.accent};"></div></div>` : `<div style="position:relative;transform:rotate(1deg);width:5rem;height:5rem;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;color:white;font-size:1.125rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,0.15);border:2px solid white;background:linear-gradient(135deg,${mergedColors.accent} 0%,${mergedColors.secondary} 100%);">${(cleanText(data.name) || "YN").split(' ').map(n => n[0]).join('').slice(0, 2)}</div>`}</div></div></header>`;
    } else if (layout.headerStyle === "creative") {
      return `<header style="margin-bottom:1rem;padding:1.5rem;border-radius:1rem;position:relative;overflow:hidden;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%);color:white;font-family:${styles.fontFamily};"><div style="position:absolute;inset:0;opacity:0.2;pointer-events:none;"><svg viewBox="0 0 100 100" style="width:100%;height:100%;"><defs><pattern id="creative-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3"/></pattern></defs><rect width="100%" height="100%" fill="url(#creative-pattern)"/></svg></div><div style="position:relative;z-index:10;display:flex;align-items:center;gap:1.5rem;">${data.photo ? `<div style="flex-shrink:0;"><img src="${data.photo}" alt="Profile" style="width:5rem;height:5rem;border-radius:50%;object-fit:cover;border:4px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2);"></div>` : ""}<div style="flex:1;"><h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;background:linear-gradient(45deg,#fff,#f0f0f0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.25rem;font-weight:500;margin-bottom:0.75rem;opacity:0.9;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;font-size:0.875rem;opacity:0.85;"><div>${cleanText(data.email) || "email@example.com"}</div><div>${data.phone || "+1 (555) 123-4567"}</div>${data.address ? `<div style="grid-column:span 2;">${cleanText(data.address)}</div>` : ""}${data.dateOfBirth ? `<div>DOB: ${data.dateOfBirth}</div>` : ""}${data.gender ? `<div>${data.gender}</div>` : ""}${data.maritalStatus ? `<div>${data.maritalStatus}</div>` : ""}</div></div></div></div></header>`;
    } else if (layout.headerStyle === "elegant") {
      return `<header style="margin-bottom:1rem;border-bottom:4px solid #374151;padding-bottom:1rem;text-align:center;font-family:${styles.fontFamily};"><h1 style="font-size:2.25rem;font-family:'Playfair Display',serif;margin-bottom:0.25rem;color:${mergedColors.primary};font-weight:700;letter-spacing:-0.02em;">${cleanText(data.name) || "Your Name"}</h1><div style="width:6rem;height:0.25rem;margin:0 auto 0.75rem;background:${mergedColors.accent};"></div>${data.jobTitle ? `<p style="font-size:1.125rem;font-style:italic;margin-bottom:1rem;color:${mergedColors.secondary};font-family:'Playfair Display',serif;">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;font-size:0.875rem;font-weight:500;color:${mergedColors.text};font-family:${styles.fontFamily};"><div style="display:flex;justify-content:center;align-items:center;gap:1rem;flex-wrap:wrap;"><span>${cleanText(data.email) || "email@example.com"}</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>${cleanText(data.address)}</span>` : ""}</div>${(data.dateOfBirth || data.gender || data.maritalStatus) ? `<div style="display:flex;justify-content:center;align-items:center;gap:1rem;flex-wrap:wrap;">${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ""}${data.gender ? `<span>${data.gender}</span>` : ""}${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ""}</div>` : ""}</div></header>`;
    } else if (layout.headerStyle === "hero-banner") {
      return `<header style="margin-bottom:1rem;padding:1.5rem;border-radius:0.75rem;position:relative;background:${mergedColors.headerGradient || `linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%)`};color:white;min-height:7.5rem;font-family:${styles.fontFamily};"><div style="position:absolute;inset:0;background:rgba(0,0,0,0.1);border-radius:0.75rem;"></div><div style="position:relative;z-index:10;display:flex;align-items:center;justify-content:center;height:100%;"><div style="text-align:center;">${data.photo && data.photo.trim() !== "" ? `<img src="${data.photo}" alt="Profile" style="width:4rem;height:4rem;border-radius:50%;object-fit:cover;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2);margin:0 auto 0.75rem;display:block;">` : ""}<h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;text-shadow:0 2px 4px rgba(0,0,0,0.3);font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.125rem;font-weight:300;margin-bottom:1rem;opacity:0.95;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;font-size:0.875rem;"><div style="display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;"><span>${cleanText(data.email) || "email@example.com"}</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>${cleanText(data.address)}</span>` : ""}</div>${(data.dateOfBirth || data.gender || data.maritalStatus) ? `<div style="display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;">${data.dateOfBirth ? `<span>DOB: ${data.dateOfBirth}</span>` : ""}${data.gender ? `<span>${data.gender}</span>` : ""}${data.maritalStatus ? `<span>${data.maritalStatus}</span>` : ""}</div>` : ""}</div></div></div></header>`;
    } else if (layout.headerStyle === "portfolio-modern") {
      return `<header style="margin-bottom:1rem;position:relative;background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%);border-radius:0.75rem;overflow:hidden;font-family:${styles.fontFamily};"><div style="height:0.375rem;background:linear-gradient(90deg,${mergedColors.primary} 0%,${mergedColors.accent} 50%,${mergedColors.secondary} 100%);"></div><div style="padding:1.5rem;"><div style="display:flex;align-items:start;gap:1.5rem;"><div style="flex-shrink:0;">${data.photo ? `<div style="position:relative;"><img src="${data.photo}" alt="Profile" style="width:5rem;height:5rem;border-radius:0.75rem;object-fit:cover;box-shadow:0 4px 12px rgba(0,0,0,0.1);border:3px solid white;"></div>` : `<div style="width:5rem;height:5rem;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;color:white;font-size:1.25rem;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.1);border:3px solid white;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%);">${(cleanText(data.name) || "YN").split(' ').map(n => n[0]).join('').slice(0, 2)}</div>`}</div><div style="flex:1;"><h1 style="font-size:1.5rem;font-weight:600;margin-bottom:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};letter-spacing:-0.01em;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1rem;margin-bottom:1rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;flex-wrap:wrap;gap:0.75rem;font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};"><div style="display:flex;align-items:center;gap:0.375rem;"><div style="width:1rem;height:1rem;border-radius:0.375rem;background:${mergedColors.accent};display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 20 20" fill="white"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg></div><span>${cleanText(data.email) || "email@example.com"}</span></div><div style="display:flex;align-items:center;gap:0.375rem;"><div style="width:1rem;height:1rem;border-radius:0.375rem;background:${mergedColors.accent};display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 20 20" fill="white"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg></div><span>${data.phone || "+1 (555) 123-4567"}</span></div>${data.address ? `<div style="display:flex;align-items:center;gap:0.375rem;"><div style="width:1rem;height:1rem;border-radius:0.375rem;background:${mergedColors.accent};display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg></div><span>${cleanText(data.address)}</span></div>` : ""}</div></div></div></div></header>`;
    } else {
      return `<header style="${headerBaseStyle}position:relative;overflow:hidden;"><div style="position:absolute;inset:0;opacity:0.1;pointer-events:none;"><svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;"><path d="M0,0 Q50,50 100,0" stroke="${mergedColors.accent}" stroke-width="2" fill="none" /><path d="M0,100 Q50,50 100,100" stroke="${mergedColors.accent}" stroke-width="2" fill="none" /></svg></div><div style="position:relative;z-index:10;display:flex;flex-wrap:nowrap;justify-content:space-between;align-items:center;gap:0.5rem;"><div style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:0.5rem;">${data.photo && data.photo.trim() !== "" ? `<img src="${data.photo}" alt="Profile" style="width:4rem;height:4rem;border-radius:9999px;object-fit:cover;border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.05);">` : ""}<div><h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.05rem;font-family:${styles.fontFamily};word-wrap:break-word;line-height:1.1;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:0.875rem;font-weight:500;opacity:0.9;font-family:${styles.fontFamily};word-wrap:break-word;margin-top:0.075rem;line-height:1.1;">${cleanText(data.jobTitle)}</p>` : ''}</div></div><div style="font-size:0.75rem;text-align:right;flex:0 0 auto;min-width:180px;font-family:${styles.fontFamily};white-space:nowrap;"><p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">${cleanText(data.email) || "email@example.com"}</p><p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">${data.phone || "+1 (555) 123-4567"}</p><p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">${cleanText(data.address) || "123 Street, City, Country"}</p>${data.linkedin ? `<p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;"><a href="${cleanText(data.linkedin)}" style="color:white;text-decoration:underline;">${cleanText(data.linkedin)}</a></p>` : ""}${data.dateOfBirth ? `<p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">DOB: ${data.dateOfBirth}</p>` : ""}${data.gender ? `<p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">${data.gender}</p>` : ""}${data.maritalStatus ? `<p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;">${data.maritalStatus}</p>` : ""}${data.portfolio ? `<p style="margin:0.075rem 0;line-height:1.1;overflow:hidden;text-overflow:ellipsis;"><a href="${cleanText(data.portfolio)}" style="color:white;text-decoration:underline;">${cleanText(data.portfolio)}</a></p>` : ""}</div></div></header>`;
    }
  };

  const renderLayout = () => {
    const header = renderHeader();
    // No watermark needed - all users have paid plans
    const watermark = "";

    // Use the same path as ResumePreview component: preferences?.layout?.customSectionOrder
    const customSectionOrder = preferences?.layout?.customSectionOrder;

    // Determine sections order based on custom ordering (if any)
    let sectionsOrder;
    let sidebarSections = layout.sidebarSections || [];
    let mainSections = layout.mainSections || [];
    let columns = layout.columns;

    if (customSectionOrder) {
      if (customSectionOrder.layout === 'single-column') {
        sectionsOrder = customSectionOrder.sectionsOrder || [...layout.sectionsOrder];
        columns = 1;
        sidebarSections = [];
        mainSections = sectionsOrder;
      } else if (customSectionOrder.layout === 'two-column') {
        sidebarSections = customSectionOrder.sidebarSections || [];
        mainSections = customSectionOrder.mainSections || [];
        columns = 2;
        // Combine for fallback sectionsOrder
        sectionsOrder = [...sidebarSections, ...mainSections];
      } else {
        // Legacy format or unknown layout
        sectionsOrder = [...layout.sectionsOrder];
      }
    } else {
      sectionsOrder = [...layout.sectionsOrder];
    }

    // Add customSections if it exists and isn't already included
    if (data.customSections && data.customSections.length > 0) {
      if (!sectionsOrder.includes("customSections")) {
        sectionsOrder.push("customSections");
      }
      if (columns === 2 && !sidebarSections.includes("customSections") && !mainSections.includes("customSections")) {
        mainSections = [...mainSections, "customSections"];
      }
    }

    if (columns === 1) {
      const sections = sectionsOrder.map(section => renderSectionContent(section)).join("");
      return `<div style="width:100%;padding:0.5rem;border-radius:0.5rem;background-color:${mergedColors.background};font-family:${styles.fontFamily};box-shadow:0 1px 3px rgba(0,0,0,0.1);position:relative;border:1px solid rgba(255,255,255,0.5);">${header}${sections}${watermark}</div>`;
    }
    if (columns === 2) {
      const sidebarContent = sidebarSections.map(section => renderSectionContent(section)).filter(Boolean).join("");
      const mainContent = mainSections.map(section => renderSectionContent(section)).filter(Boolean).join("");

      const sidebarBackground = typeof layout.sidebar === "string" ? layout.sidebar : mergedColors.background;
      return `<div style="width:100%;padding:0.2rem;border-radius:0.5rem;background-color:${mergedColors.background};font-family:${styles.fontFamily};box-shadow:0 1px 3px rgba(0,0,0,0.1);position:relative;border:1px solid rgba(255,255,255,0.5);margin:0;">${header}<div style="display:grid;grid-template-columns:${layout.sidebarWidth || '25%'} ${100 - parseInt(layout.sidebarWidth || '25')}%;gap:0.3rem;align-items:start;margin:0;padding:0;"><div style="padding:0.4rem;background:${sidebarBackground};border-radius:0.375rem;font-family:${styles.fontFamily};overflow-wrap:break-word;border:1px solid rgba(255,255,255,0.5);margin:0;">${sidebarContent}</div><div style="padding:0.4rem;background:white;border-radius:0.375rem;font-family:${styles.fontFamily};border:1px solid rgba(255,255,255,0.5);margin:0;">${mainContent}</div></div>${watermark}</div>`;
    }
    // Fallback to single column
    console.log('🔍 Final sections order (fallback):', sectionsOrder);
    const sections = sectionsOrder.map(section => renderSectionContent(section)).join("");
    return `<div class="resume-container" style="width:100%;padding:0.2rem;border-radius:0.5rem;background-color:${mergedColors.background};font-family:${styles.fontFamily};box-shadow:0 1px 3px rgba(0,0,0,0.1);position:relative;border:1px solid rgba(255,255,255,0.5);margin:0;">${header}<div style="break-before:avoid;page-break-before:avoid;margin:0;padding:0;">${sections}</div>${watermark}</div>`;
  };

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;}html{font-size:16px;margin:0;padding:0;}body{width:740px;min-height:0;margin:0 auto;padding:0;background-color:${mergedColors.background};color:${mergedColors.text};font-family:${styles.fontFamily},sans-serif;}@media print{body{width:740px;margin:0 auto;padding:0;}@page{margin:0.1in 0.3in;size:${country === 'us' ? 'Letter' : 'A4'};}p{orphans:2;widows:2;}.experience-entry,.education-entry{break-inside:auto;page-break-inside:auto;}.experience-header,.education-header{break-inside:avoid;page-break-inside:avoid;}.experience-description,.education-description{break-inside:auto;page-break-inside:auto;}li{break-inside:avoid;page-break-inside:avoid;}h1,h2,h3{break-after:avoid;page-break-after:avoid;}}h1,h2,h3{font-weight:700;margin:0;}p{margin:0;white-space:normal;}header{break-after:avoid;page-break-after:avoid;margin:0 0 0.25rem 0;padding:0;}section{margin:0 0 0.25rem 0;padding:0;}section h2{break-after:avoid;page-break-after:avoid;margin:0 0 0.25rem 0;padding:0;}section > div{margin:0;padding:0;}section > div > div{margin:0;padding:0;}.resume-container{margin:0;padding:0.25rem;}ul,ol{margin:0.1rem 0 0 1rem;padding:0;}li{margin:0;padding:0;line-height:1.35;}</style></head><body>${renderLayout()}</body></html>`;
}

// HTTP method exports
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      data,
      template = "classic",
      customColors = {},
      language = "en",
      country = "us",
      isPremium = false,
      preferences = defaultConfig,
      type = "resume",
      coverLetterData,
      coverLetterTemplate = "classic",
      userId
    } = body;

    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Check removed as per request to move logic to client side
    // checks are now handled in ResumeBuilder.js

    let html;
    if (type === "coverLetter") {
      html = generateCoverLetterHTML(coverLetterData, coverLetterTemplate, customColors, data);
    } else {
      html = generateResumeHTML(data, template, customColors, language, country, isPremium, preferences);
    }

    let browser = null;
    let page = null;

    try {
      browser = await getBrowser();
      page = await browser.newPage();

      // Set page timeout
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      // Load fonts if specified
      if (preferences?.typography?.fontPair?.fontFamily) {
        const fontInfo = await loadFont(preferences.typography.fontPair.fontFamily);
        if (fontInfo.cssText) {
          await page.addStyleTag({ content: fontInfo.cssText });
        }
      }

      // Set page timeout (same as ATS PDF API)
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Wait for fonts to load (same as ATS PDF API)
      await page.evaluate(async () => {
        if (document.fonts) {
          await document.fonts.ready;
        }
      });

      const pdf = await page.pdf({
        format: country === 'us' ? 'Letter' : 'A4',
        printBackground: true,
        margin: {
          top: '0.1in',
          right: '0.3in',
          bottom: '0.3in',
          left: '0.3in'
        },
        timeout: 30000
      });

      return new NextResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${type === 'coverLetter' ? 'cover-letter' : 'resume'}.pdf"`,
        },
      });
    } catch (error) {
      console.error('PDF generation error:', error);

      // If it's a connection error, try to restart the browser
      if (error.message.includes('Protocol error') || error.message.includes('Connection closed')) {
        console.log('Connection error detected, restarting browser...');

        // Close existing browser instance
        if (browserInstance && browserInstance.isConnected()) {
          try {
            await browserInstance.close();
          } catch (e) {
            console.log('Error closing browser:', e);
          }
          browserInstance = null;
        }

        // Retry once
        try {
          browser = await getBrowser();
          page = await browser.newPage();

          page.setDefaultTimeout(30000);
          page.setDefaultNavigationTimeout(30000);

          if (preferences?.typography?.fontPair?.fontFamily) {
            const fontInfo = await loadFont(preferences.typography.fontPair.fontFamily);
            if (fontInfo.cssText) {
              await page.addStyleTag({ content: fontInfo.cssText });
            }
          }

          await page.setContent(html, { waitUntil: 'networkidle0' });

          await page.evaluate(async () => {
            if (document.fonts) {
              await document.fonts.ready;
            }
          });

          const pdf = await page.pdf({
            format: country === 'us' ? 'Letter' : 'A4',
            printBackground: true,
            margin: {
              top: '0.3in',
              right: '0.3in',
              bottom: '0.3in',
              left: '0.3in'
            },
            timeout: 30000
          });

          return new NextResponse(pdf, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${type === 'coverLetter' ? 'cover-letter' : 'resume'}.pdf"`,
            },
          });
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          return NextResponse.json({ error: "PDF generation service temporarily unavailable. Please try again in a moment." }, { status: 503 });
        }
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
      // Clean up
      if (page && !page.isClosed()) {
        try {
          await page.close();
        } catch (e) {
          console.log('Error closing page:', e);
        }
      }
    }

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}