import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import { NextResponse } from 'next/server';
import { premiumDesignTemplates } from "../../lib/premiumDesignTemplates";
import { parseRichTextForPDF } from "../../lib/richTextRenderer";
import { formatDateWithPreferences } from "../../lib/resumeUtils";

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

    console.log("Pemium Design PDF - Browser launched successfully");
    return browserInstance;
  } catch (error) {
    console.error("Failed to launch browser:", error);
    throw error;
  }
}


// ========== DATA HELPERS ==========

function normalizeSkill(skill) {
  if (typeof skill === 'string') return { name: skill.trim(), proficiency: null };
  if (typeof skill === 'object' && skill !== null) {
    return {
      name: (skill.name || skill.skill || skill.title || 'Unknown Skill').trim(),
      proficiency: skill.proficiency || skill.level || skill.rating || null
    };
  }
  return { name: 'Unknown Skill', proficiency: null };
}

function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills.map(normalizeSkill).filter(s => s.name && s.name.length > 0 && s.name !== 'Unknown Skill');
}

function normalizeExperienceData(experienceData) {
  if (!experienceData || !Array.isArray(experienceData)) return [];
  return experienceData.map(exp => ({
    ...exp,
    jobTitle: exp.jobTitle || exp.title || exp.position || "Job Title"
  }));
}

function normalizeCustomSections(customSections) {
  if (!customSections) return [];
  if (!Array.isArray(customSections)) return [];
  return customSections
    .map(section => {
      if (typeof section === 'string') {
        return { type: "project", title: section.trim(), description: "", date: "" };
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
      }
      return null;
    })
    .filter(section => section !== null && (section.title || section.description || section.name));
}

// Request-scoped context — set at the start of each generatePremiumDesignHTML call
const _ctx = { datePrefs: {}, lineHeight: '1.4' };

function fmtDate(date) {
  if (!date) return '';
  if (/present/i.test(date)) return 'Present';
  if (_ctx.datePrefs?.dateFormat) {
    const result = formatDateWithPreferences(date, _ctx.datePrefs);
    if (result) return result;
  }
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return date; }
}

function profToPercent(prof) {
  if (!prof) return 70;
  if (typeof prof === 'number') return Math.min(100, Math.max(0, prof));
  const m = { expert: 95, advanced: 85, intermediate: 65, beginner: 35, native: 100, fluent: 90, professional: 75, basic: 30, conversational: 50 };
  return m[String(prof).toLowerCase()] || 70;
}

function profToStars(prof) {
  return Math.ceil(profToPercent(prof) / 20);
}

function escHTML(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function richText(text) {
  return parseRichTextForPDF(text) || '';
}


// ========== SVG DECORATIVE ELEMENTS (HTML strings) ==========

function svgDiagonalClip(color, height = 60) {
  return `<div style="position:absolute;bottom:-1px;left:0;right:0;height:${height}px;overflow:hidden">
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style="width:100%;height:100%;display:block">
      <polygon points="0,60 1200,0 1200,60" fill="${color}"/>
    </svg>
  </div>`;
}

function svgWaveClip(color, height = 50) {
  return `<div style="position:absolute;bottom:-1px;left:0;right:0;height:${height}px;overflow:hidden">
    <svg viewBox="0 0 1200 50" preserveAspectRatio="none" style="width:100%;height:100%;display:block">
      <path d="M0,25 C300,50 600,0 900,25 C1050,37.5 1150,50 1200,50 L1200,50 L0,50 Z" fill="${color}"/>
    </svg>
  </div>`;
}

function svgCircleDecor(color, opacity = 0.08, size = 200, pos = {}) {
  const styles = [`position:absolute`, `width:${size}px`, `height:${size}px`, `border-radius:50%`, `background:${color}`, `opacity:${opacity}`, `pointer-events:none`];
  if (pos.top !== undefined) styles.push(`top:${pos.top}`);
  if (pos.right !== undefined) styles.push(`right:${pos.right}`);
  if (pos.left !== undefined) styles.push(`left:${pos.left}`);
  if (pos.bottom !== undefined) styles.push(`bottom:${pos.bottom}`);
  return `<div style="${styles.join(';')}"></div>`;
}

function svgDotsPattern(color = 'rgba(255,255,255,0.1)', rows = 4, cols = 6) {
  const dots = Array.from({ length: rows * cols }).map(() =>
    `<div style="width:4px;height:4px;border-radius:50%;background:${color}"></div>`
  ).join('');
  return `<div style="position:absolute;top:10px;right:10px;display:grid;grid-template-columns:repeat(${cols},6px);gap:6px;opacity:0.4">${dots}</div>`;
}

function svgCircularSkill(name, percent, color = '#3b82f6', size = 44, textColor = '#334155') {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
    <svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="4"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
        stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
    </svg>
    <span style="font-size:0.65em;color:${textColor};text-align:center;line-height:1.2;max-width:${size + 10}px">${escHTML(name)}</span>
  </div>`;
}

function svgTimelineDot(color = '#3b82f6', isLast = false) {
  return `<div style="display:flex;flex-direction:column;align-items:center;position:relative;width:20px;flex-shrink:0">
    <div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid ${color};z-index:1;flex-shrink:0"></div>
    ${!isLast ? `<div style="width:2px;flex:1;background:${color}30;margin-top:2px"></div>` : ''}
  </div>`;
}

function svgStarRating(level, maxStars = 5, color = '#f59e0b', size = 12) {
  const stars = Array.from({ length: maxStars }).map((_, i) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${i < level ? color : '#e5e7eb'}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  ).join('');
  return `<div style="display:flex;gap:2px">${stars}</div>`;
}


// ========== CONTACT RENDERERS ==========

function contactRowHTML(data, color = '#64748b', separator = '|') {
  const items = [data.email, data.phone, data.address, data.linkedin, data.portfolio].filter(Boolean);
  return `<div style="display:flex;flex-wrap:wrap;gap:0.3em;font-size:0.78em;color:${color};align-items:center">
    ${items.map((item, i) =>
      `${i > 0 ? `<span style="opacity:0.4;margin:0 0.2em">${separator}</span>` : ''}<span style="word-break:break-all">${escHTML(item)}</span>`
    ).join('')}
  </div>`;
}

function contactColumnHTML(data, color = '#e2e8f0', iconColor = 'rgba(255,255,255,0.6)') {
  const icons = [
    { path: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', val: data.email },
    { path: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', val: data.phone },
    { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', val: data.address },
    { path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', val: data.linkedin },
    { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', val: data.portfolio },
  ].filter(i => i.val);

  return `<div style="display:flex;flex-direction:column;gap:0.55em">
    ${icons.map(({ path, val }) =>
      `<div style="display:flex;align-items:flex-start;gap:0.5em;font-size:0.75em;color:${color}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="${iconColor}" style="flex-shrink:0;margin-top:2px"><path d="${path}"/></svg>
        <span style="word-break:break-all;line-height:1.35">${escHTML(val)}</span>
      </div>`
    ).join('')}
  </div>`;
}


// ========== SECTION TITLE STYLES ==========

function sectionTitleHTML(title, variant = 'default', color = '#1e293b', accent = '#3b82f6') {
  if (variant === 'gradient-underline') {
    return `<div style="margin-bottom:0.7em">
      <h3 style="font-size:0.85em;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.1em;margin:0">${escHTML(title)}</h3>
      <div style="height:3px;background:linear-gradient(90deg,${accent},${accent}40);margin-top:4px;width:3em;border-radius:2px"></div>
    </div>`;
  }
  if (variant === 'border-left') {
    return `<h3 style="font-size:0.85em;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.08em;margin:0 0 0.6em;border-left:3px solid ${accent};padding-left:0.6em">${escHTML(title)}</h3>`;
  }
  if (variant === 'ribbon') {
    return `<div style="background:${accent};color:#fff;padding:0.3em 1.2em;margin:0 -1.2em 0.7em;display:inline-block;font-size:0.8em;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">${escHTML(title)}</div>`;
  }
  if (variant === 'center-line') {
    return `<div style="display:flex;align-items:center;gap:0.6em;margin-bottom:0.7em">
      <div style="flex:1;height:1px;background:${accent}40"></div>
      <h3 style="font-size:0.8em;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.12em;margin:0;white-space:nowrap">${escHTML(title)}</h3>
      <div style="flex:1;height:1px;background:${accent}40"></div>
    </div>`;
  }
  if (variant === 'bold-caps') {
    return `<h3 style="font-size:1em;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:0.15em;margin:0 0 0.7em;border-bottom:2px solid ${accent};padding-bottom:0.3em">${escHTML(title)}</h3>`;
  }
  if (variant === 'dot-accent') {
    return `<div style="display:flex;align-items:center;gap:0.5em;margin-bottom:0.6em">
      <div style="width:8px;height:8px;border-radius:50%;background:${accent};flex-shrink:0"></div>
      <h3 style="font-size:0.85em;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.08em;margin:0">${escHTML(title)}</h3>
    </div>`;
  }
  // default
  return `<h3 style="font-size:0.85em;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.08em;margin:0 0 0.6em">${escHTML(title)}</h3>`;
}


// ========== BULLET RENDERER ==========

function renderBulletsHTML(description, textColor = '#334155', fontSize = '0.8em') {
  if (!description) return '';
  let lines;
  if (Array.isArray(description)) {
    lines = description.map(l => String(l).trim()).filter(Boolean);
  } else {
    lines = String(description).split(/[\n\r]+|•\s*/).map(l => l.trim()).filter(Boolean);
  }
  if (lines.length === 0) return '';
  if (lines.length > 1) {
    return `<ul style="list-style-type:none;padding:0;margin:0.35em 0 0 0">
      ${lines.map(line => `<li style="font-size:${fontSize};line-height:${_ctx.lineHeight};color:${textColor};margin-bottom:3px;padding-left:1em;position:relative">
        <span style="position:absolute;left:0;top:0.5em;width:4px;height:4px;border-radius:50%;background:${textColor};opacity:0.4"></span>
        <span>${richText(line.replace(/^[-•*]\s*/, ''))}</span>
      </li>`).join('')}
    </ul>`;
  }
  return `<p style="margin:0.3em 0 0 0;color:${textColor};font-size:${fontSize};line-height:${_ctx.lineHeight}">${richText(lines[0])}</p>`;
}


// ========== SECTION RENDERERS (HTML) ==========

function summaryHTML(data, { textColor, titleColor, accent, titleStyle }) {
  if (!data?.summary) return '';
  return `<div>
    ${sectionTitleHTML('Professional Summary', titleStyle, titleColor, accent)}
    <p style="font-size:0.82em;line-height:${_ctx.lineHeight};color:${textColor};margin:0">${richText(data.summary)}</p>
  </div>`;
}

function experienceHTML(data, { textColor, dateColor, titleColor, accent, titleStyle, showTimeline = false }) {
  if (!data?.experience?.length) return '';
  const items = data.experience.map((exp, i) => {
    const isLast = i === data.experience.length - 1;
    const content = `<div style="flex:1;margin-bottom:${isLast ? '0' : '0.85em'}">
      <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:0.3em">
        <h4 style="font-size:0.88em;font-weight:700;color:${textColor};margin:0">${escHTML(exp.jobTitle || exp.position || exp.title)}</h4>
        <span style="font-size:0.72em;color:${dateColor};white-space:nowrap;font-weight:500">${fmtDate(exp.startDate)} — ${fmtDate(exp.endDate)}</span>
      </div>
      <div style="font-size:0.78em;color:${accent};font-weight:600;margin-top:2px">${escHTML(exp.company)}${exp.location ? ` · ${escHTML(exp.location)}` : ''}</div>
      ${renderBulletsHTML(exp.description, textColor, '0.78em')}
    </div>`;
    if (showTimeline) {
      return `<div style="display:flex;gap:0.6em">${svgTimelineDot(accent, isLast)}${content}</div>`;
    }
    return `<div>${content}</div>`;
  }).join('');
  return `<div>${sectionTitleHTML('Experience', titleStyle, titleColor, accent)}${items}</div>`;
}

function educationHTML(data, { textColor, dateColor, titleColor, accent, titleStyle, preferences }) {
  if (!data?.education?.length) return '';
  const items = data.education.map((edu, i) =>
    `<div style="margin-bottom:${i < data.education.length - 1 ? '0.6em' : '0'}">
      <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap">
        <h4 style="font-size:0.85em;font-weight:700;color:${textColor};margin:0">${escHTML(edu.degree)}${edu.field ? ` in ${escHTML(edu.field)}` : ''}</h4>
        <span style="font-size:0.72em;color:${dateColor};white-space:nowrap">${fmtDate(edu.startDate)} — ${fmtDate(edu.endDate)}</span>
      </div>
      <div style="font-size:0.78em;color:${dateColor};margin-top:2px">${escHTML(edu.institution)}</div>
      ${edu.gpa && preferences?.education?.showGPA !== false ? `<div style="font-size:0.72em;color:${dateColor};margin-top:2px">GPA: ${escHTML(edu.gpa)}</div>` : ''}
    </div>`
  ).join('');
  return `<div>${sectionTitleHTML('Education', titleStyle, titleColor, accent)}${items}</div>`;
}

function skillsHTML(data, { textColor, titleColor, accent, titleStyle, variant = 'tags' }) {
  const skills = normalizeSkills(data?.skills);
  if (!skills.length) return '';

  if (variant === 'circular') {
    const circles = skills.slice(0, 12).map(s =>
      svgCircularSkill(s.name, profToPercent(s.proficiency), accent, 46, textColor)
    ).join('');
    return `<div>${sectionTitleHTML('Skills', titleStyle, titleColor, accent)}
      <div style="display:flex;flex-wrap:wrap;gap:0.6em;justify-content:center">${circles}</div></div>`;
  }

  if (variant === 'stars') {
    const items = skills.map(s =>
      `<div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:0.78em;color:${textColor}">${escHTML(s.name)}</span>
        ${svgStarRating(profToStars(s.proficiency), 5, accent, 10)}
      </div>`
    ).join('');
    return `<div>${sectionTitleHTML('Skills', titleStyle, titleColor, accent)}
      <div style="display:flex;flex-direction:column;gap:0.4em">${items}</div></div>`;
  }

  if (variant === 'gradient-bars') {
    const items = skills.map(s =>
      `<div>
        <div style="display:flex;justify-content:space-between;font-size:0.76em;color:${textColor};margin-bottom:2px">
          <span style="font-weight:500">${escHTML(s.name)}</span>
        </div>
        <div style="height:5px;background:rgba(0,0,0,0.06);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${profToPercent(s.proficiency)}%;background:linear-gradient(90deg,${accent},${accent}90);border-radius:3px"></div>
        </div>
      </div>`
    ).join('');
    return `<div>${sectionTitleHTML('Skills', titleStyle, titleColor, accent)}
      <div style="display:flex;flex-direction:column;gap:0.45em">${items}</div></div>`;
  }

  if (variant === 'dots') {
    const items = skills.map(s => {
      const dotsHtml = [1, 2, 3, 4, 5].map(lv =>
        `<div style="width:7px;height:7px;border-radius:50%;background:${lv <= profToStars(s.proficiency) ? accent : 'rgba(0,0,0,0.1)'}"></div>`
      ).join('');
      return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.78em;color:${textColor}">
        <span>${escHTML(s.name)}</span>
        <div style="display:flex;gap:3px">${dotsHtml}</div>
      </div>`;
    }).join('');
    return `<div>${sectionTitleHTML('Skills', titleStyle, titleColor, accent)}
      <div style="display:flex;flex-direction:column;gap:0.35em">${items}</div></div>`;
  }

  if (variant === 'pills') {
    const tags = skills.map(s =>
      `<span style="font-size:0.73em;padding:0.2em 0.6em;border-radius:100px;background:${accent}15;color:${accent};font-weight:500;border:1px solid ${accent}25">${escHTML(s.name)}</span>`
    ).join('');
    return `<div>${sectionTitleHTML('Skills', titleStyle, titleColor, accent)}
      <div style="display:flex;flex-wrap:wrap;gap:0.3em">${tags}</div></div>`;
  }

  // default: tags
  const tags = skills.map(s =>
    `<span style="font-size:0.73em;padding:0.2em 0.55em;border-radius:3px;background:${accent}12;color:${textColor};border:1px solid ${accent}20">${escHTML(s.name)}</span>`
  ).join('');
  return `<div>${sectionTitleHTML('Skills', titleStyle, titleColor, accent)}
    <div style="display:flex;flex-wrap:wrap;gap:0.3em">${tags}</div></div>`;
}

function certificationsHTML(data, { textColor, dateColor, titleColor, accent, titleStyle }) {
  if (!data?.certifications?.length) return '';
  const items = data.certifications.map(c =>
    `<div style="margin-bottom:0.35em;font-size:0.78em">
      <span style="font-weight:600;color:${textColor}">${escHTML(c.name)}</span>
      ${c.issuer ? `<span style="color:${dateColor}"> — ${escHTML(c.issuer)}</span>` : ''}
      ${c.date ? `<span style="color:${dateColor};font-size:0.72em"> (${fmtDate(c.date)})</span>` : ''}
    </div>`
  ).join('');
  return `<div>${sectionTitleHTML('Certifications', titleStyle, titleColor, accent)}${items}</div>`;
}

function languagesHTML(data, { textColor, titleColor, accent, titleStyle, variant = 'inline' }) {
  if (!data?.languages?.length) return '';
  if (variant === 'bars') {
    const items = data.languages.map(l =>
      `<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.78em;color:${textColor}">
        <span style="font-weight:500">${escHTML(l.language)}</span>
        <span style="font-size:0.7em;color:${accent};opacity:0.8">${escHTML(l.proficiency)}</span>
      </div>`
    ).join('');
    return `<div>${sectionTitleHTML('Languages', titleStyle, titleColor, accent)}
      <div style="display:flex;flex-direction:column;gap:0.35em">${items}</div></div>`;
  }
  const items = data.languages.map(l =>
    `<span style="color:${textColor}"><strong>${escHTML(l.language)}</strong>${l.proficiency ? ` (${escHTML(l.proficiency)})` : ''}</span>`
  ).join('');
  return `<div>${sectionTitleHTML('Languages', titleStyle, titleColor, accent)}
    <div style="display:flex;flex-wrap:wrap;gap:0.3em 0.8em;font-size:0.78em">${items}</div></div>`;
}

function projectsHTML(data, { textColor, dateColor, titleColor, accent, titleStyle }) {
  const projects = normalizeCustomSections(data?.customSections)?.filter(s => s.type === 'project') || [];
  if (!projects.length) return '';
  const items = projects.map(p =>
    `<div style="margin-bottom:0.5em">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <h4 style="font-size:0.83em;font-weight:700;color:${textColor};margin:0">${escHTML(p.title)}</h4>
        ${p.date ? `<span style="font-size:0.72em;color:${dateColor}">${fmtDate(p.date)}</span>` : ''}
      </div>
      ${renderBulletsHTML(p.description, textColor, '0.78em')}
    </div>`
  ).join('');
  return `<div>${sectionTitleHTML('Projects', titleStyle, titleColor, accent)}${items}</div>`;
}

function achievementsHTML(data, { textColor, titleColor, accent, titleStyle }) {
  const achievements = normalizeCustomSections(data?.customSections)?.filter(s => s.type === 'achievements' || s.type === 'award') || [];
  if (!achievements.length) return '';
  const items = achievements.map(a =>
    `<div style="margin-bottom:0.3em;font-size:0.78em;color:${textColor};display:flex;gap:0.4em;align-items:flex-start">
      <span style="color:${accent};font-size:0.9em;line-height:1;flex-shrink:0">★</span>
      <span><strong>${escHTML(a.title)}</strong>${a.description ? ` — ${escHTML(a.description)}` : ''}</span>
    </div>`
  ).join('');
  return `<div>${sectionTitleHTML('Achievements', titleStyle, titleColor, accent)}${items}</div>`;
}


// ========== SECTION DISPATCHER ==========

function renderSectionsHTML(list, data, props, preferences) {
  // Merge preferences into props so section renderers (e.g. educationHTML) can access them
  const p = preferences ? { ...props, preferences } : props;
  return list.map(s => {
    switch (s) {
      case 'summary': return summaryHTML(data, p);
      case 'experience': return experienceHTML(data, p);
      case 'education': return educationHTML(data, p);
      case 'skills': return skillsHTML(data, p);
      case 'certifications': return certificationsHTML(data, p);
      case 'languages': return languagesHTML(data, p);
      case 'projects': return projectsHTML(data, p);
      case 'achievements': return achievementsHTML(data, props);
      default: return '';
    }
  }).filter(Boolean).join('');
}


// ========== 20 LAYOUT GENERATORS ==========

// 1. CASCADE
function cascadeHTML(data, t) {
  const c = t.styles.colors;
  const initials = (data.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const sidebarProps = { textColor: c.sidebarText || c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', variant: 'dots' };
  const mainProps = { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', showTimeline: true };
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="position:relative;background:${c.headerBackground};color:${c.headerText};padding:1.5em 2em 2.5em">
      ${svgDotsPattern()}
      ${svgCircleDecor('#ffffff', 0.06, 120, { top: '-30px', right: '-20px' })}
      <div style="position:relative;z-index:1;display:flex;align-items:center;gap:1.2em">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1.3em;font-weight:800;flex-shrink:0">${initials}</div>
        <div>
          <h1 style="font-size:1.6em;font-weight:800;margin:0;letter-spacing:0.01em">${escHTML(data.name)}</h1>
          ${data.jobTitle ? `<div style="font-size:0.88em;opacity:0.9;margin-top:3px;font-weight:400;letter-spacing:0.03em">${escHTML(data.jobTitle)}</div>` : ''}
          <div style="margin-top:0.5em">${contactRowHTML(data, 'rgba(255,255,255,0.85)', '·')}</div>
        </div>
      </div>
      ${svgDiagonalClip(c.background)}
    </div>
    <div style="display:flex;margin-top:-0.5em">
      <div style="width:${t.layout.sidebarWidth};background:${c.sidebarBackground};padding:1.2em;display:flex;flex-direction:column;gap:1em;border-right:1px solid ${c.divider}">
        ${renderSectionsHTML(t.layout.sidebarSections.filter(s => s !== 'personal'), data, sidebarProps, t._preferences)}
      </div>
      <div style="flex:1;padding:1.2em 1.5em;display:flex;flex-direction:column;gap:1.1em">
        ${renderSectionsHTML(t.layout.mainSections, data, mainProps, t._preferences)}
      </div>
    </div>
  </div>`;
}

// 2. ICONIC
function iconicHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="background:${c.headerBackground};color:${c.headerText};padding:1.8em 2.2em;position:relative">
      ${svgCircleDecor(c.iconColor || '#6366f1', 0.08, 180, { top: '-60px', right: '-40px' })}
      <h1 style="font-size:1.8em;font-weight:800;margin:0;position:relative;z-index:1">${escHTML(data.name)}</h1>
      ${data.jobTitle ? `<div style="font-size:0.9em;opacity:0.8;margin-top:4px;letter-spacing:0.06em;text-transform:uppercase;position:relative;z-index:1">${escHTML(data.jobTitle)}</div>` : ''}
      <div style="margin-top:0.7em;position:relative;z-index:1">${contactRowHTML(data, 'rgba(255,255,255,0.8)', '|')}</div>
      ${svgWaveClip(c.background)}
    </div>
    <div style="padding:1em 2.2em 1.5em;display:flex;flex-direction:column;gap:1.1em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.iconColor || c.accent, titleStyle: 'border-left', showTimeline: true }, t._preferences)}
    </div>
  </div>`;
}

// 3. PRIMO
function primoHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="padding:2.2em 2.5em 1.2em;text-align:center">
      <h1 style="font-size:2.2em;font-weight:600;margin:0;color:${c.headerText};letter-spacing:0.06em">${escHTML(data.name)}</h1>
      ${data.jobTitle ? `<div style="font-size:0.95em;color:${c.accent};margin-top:0.35em;font-style:italic;letter-spacing:0.04em">${escHTML(data.jobTitle)}</div>` : ''}
      <div style="width:60px;height:3px;background:${c.accent};margin:0.8em auto;border-radius:2px"></div>
      ${contactRowHTML(data, c.secondary, '·')}
    </div>
    <div style="height:1px;background:linear-gradient(90deg,transparent,${c.accent}60,transparent);margin:0 2.5em"></div>
    <div style="padding:1.5em 2.5em;display:flex;flex-direction:column;gap:1.2em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'center-line' }, t._preferences)}
    </div>
  </div>`;
}

// 4. SPLIT
function splitHTML(data, t) {
  const c = t.styles.colors;
  const sidebarProps = { textColor: c.sidebarText, dateColor: 'rgba(255,255,255,0.55)', titleColor: '#ffffff', accent: c.accent, titleStyle: 'gradient-underline', variant: 'gradient-bars' };
  const mainProps = { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'border-left', showTimeline: true };
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};display:flex">
    <div style="width:${t.layout.sidebarWidth};background:${c.sidebarBackground};color:${c.sidebarText};padding:1.8em 1.3em;display:flex;flex-direction:column;gap:1em;position:relative;overflow:hidden">
      ${svgCircleDecor(c.accent, 0.08, 160, { top: '-40px', left: '-50px' })}
      ${svgDotsPattern(`${c.accent}20`, 3, 4)}
      ${data.photo ? `<div style="text-align:center;position:relative;z-index:1"><img src="${data.photo}" alt="" style="width:95px;height:95px;border-radius:50%;object-fit:cover;border:3px solid ${c.accent};box-shadow:0 4px 15px ${c.accent}30"/></div>` : ''}
      <div style="text-align:center;position:relative;z-index:1">
        <h1 style="font-size:1.25em;font-weight:800;margin:0;color:#ffffff">${escHTML(data.name)}</h1>
        ${data.jobTitle ? `<div style="font-size:0.82em;color:${c.accent};margin-top:3px">${escHTML(data.jobTitle)}</div>` : ''}
      </div>
      <div style="position:relative;z-index:1">${contactColumnHTML(data, c.sidebarText, c.accent)}</div>
      <div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:1em">
        ${renderSectionsHTML(t.layout.sidebarSections.filter(s => s !== 'personal' && s !== 'summary'), data, sidebarProps)}
      </div>
    </div>
    <div style="flex:1;background:${c.background};padding:1.5em;display:flex;flex-direction:column;gap:1.1em">
      ${renderSectionsHTML(t.layout.mainSections, data, mainProps, t._preferences)}
    </div>
  </div>`;
}

// 5. BERLIN
function berlinHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="background:${c.headerBackground};color:${c.headerText};padding:1em 1.5em;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5em">
      <div>
        <h1 style="font-size:1.4em;font-weight:800;margin:0;letter-spacing:-0.01em">${escHTML(data.name)}</h1>
        ${data.jobTitle ? `<div style="font-size:0.82em;opacity:0.9;margin-top:2px">${escHTML(data.jobTitle)}</div>` : ''}
      </div>
      ${contactRowHTML(data, 'rgba(255,255,255,0.85)', '|')}
    </div>
    <div style="display:flex">
      <div style="flex:1;padding:1em 1.25em;display:flex;flex-direction:column;gap:0.9em">
        ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'dot-accent', showTimeline: false }, t._preferences)}
      </div>
      <div style="width:${t.layout.sidebarWidth};background:${c.sidebarBackground};padding:1em;display:flex;flex-direction:column;gap:0.9em;border-left:3px solid ${c.accent}">
        ${renderSectionsHTML(t.layout.sidebarSections, data, { textColor: c.sidebarText || c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'dot-accent', variant: 'dots' }, t._preferences)}
      </div>
    </div>
  </div>`;
}

// 6. STOCKHOLM
function stockholmHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text};padding:2.5em">
    <div style="text-align:center;margin-bottom:1.5em">
      <h1 style="font-size:2em;font-weight:300;margin:0;color:${c.headerText};letter-spacing:0.2em;text-transform:uppercase">${escHTML(data.name)}</h1>
      ${data.jobTitle ? `<div style="font-size:0.82em;color:${c.secondary};margin-top:0.5em;letter-spacing:0.12em;text-transform:uppercase">${escHTML(data.jobTitle)}</div>` : ''}
      <div style="width:40px;height:1px;background:${c.accent};margin:1em auto"></div>
      ${contactRowHTML(data, c.secondary, '·')}
    </div>
    <div style="display:flex;flex-direction:column;gap:1.4em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'center-line', variant: 'pills' }, t._preferences)}
    </div>
  </div>`;
}

// 7. TOKYO
function tokyoHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text};display:flex">
    <div style="width:${t.layout.sidebarWidth};background:${c.sidebarBackground};padding:1.5em;display:flex;flex-direction:column;gap:1em;border-right:1px solid ${c.divider}">
      <div>
        <div style="color:${c.accent};font-size:0.65em;opacity:0.6;font-family:monospace">&gt; whoami</div>
        <h1 style="font-size:1.15em;font-weight:700;margin:0.25em 0 0;color:${c.headerText}">${escHTML(data.name)}</h1>
        ${data.jobTitle ? `<div style="font-size:0.78em;color:${c.accent};margin-top:2px;opacity:0.9">${escHTML(data.jobTitle)}</div>` : ''}
      </div>
      <div style="height:1px;background:${c.divider}"></div>
      <div><div style="color:${c.accent};font-size:0.65em;opacity:0.6;font-family:monospace;margin-bottom:6px">&gt; contact --info</div>${contactColumnHTML(data, c.sidebarText, c.accent)}</div>
      <div style="height:1px;background:${c.divider}"></div>
      ${renderSectionsHTML(t.layout.sidebarSections.filter(s => s !== 'personal'), data, { textColor: c.sidebarText, dateColor: 'rgba(255,255,255,0.4)', titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'default', variant: 'gradient-bars' })}
    </div>
    <div style="flex:1;padding:1.5em;display:flex;flex-direction:column;gap:1.1em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: 'rgba(255,255,255,0.4, t._preferences)', titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'default', showTimeline: true })}
    </div>
  </div>`;
}

// 8. MILAN
function milanHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="padding:2em 2em 1.2em;display:flex;align-items:flex-end;gap:1.5em;border-bottom:1px solid ${c.divider}">
      ${data.photo ? `<img src="${data.photo}" alt="" style="width:80px;height:100px;object-fit:cover;filter:grayscale(30%);box-shadow:4px 4px 0 ${c.accent}"/>` : ''}
      <div style="flex:1">
        <h1 style="font-size:2.5em;font-weight:700;margin:0;color:${c.headerText};line-height:1;letter-spacing:-0.02em">${escHTML(data.name)}</h1>
        ${data.jobTitle ? `<div style="font-size:1em;color:${c.accent};margin-top:0.35em;font-style:italic">${escHTML(data.jobTitle)}</div>` : ''}
        <div style="margin-top:0.5em">${contactRowHTML(data, c.secondary, '/')}</div>
      </div>
    </div>
    <div style="padding:1.5em 2em;display:flex;flex-direction:column;gap:1.3em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'bold-caps', variant: 'pills' }, t._preferences)}
    </div>
  </div>`;
}

// 9. DUBAI
function dubaiHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};display:flex">
    <div style="width:${t.layout.sidebarWidth};background:${c.sidebarBackground};color:${c.sidebarText};padding:1.5em;display:flex;flex-direction:column;gap:1em;position:relative;overflow:hidden">
      ${svgCircleDecor(c.accent, 0.06, 140, { bottom: '-40px', right: '-30px' })}
      ${data.photo ? `<div style="text-align:center;position:relative;z-index:1"><div style="width:90px;height:90px;border-radius:50%;margin:0 auto;border:2px solid ${c.accent};padding:3px;box-shadow:0 4px 20px ${c.accent}20"><img src="${data.photo}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover"/></div></div>` : ''}
      <div style="text-align:center;position:relative;z-index:1">
        <h1 style="font-size:1.15em;font-weight:600;margin:0;color:${c.accent};letter-spacing:0.05em">${escHTML(data.name)}</h1>
        ${data.jobTitle ? `<div style="font-size:0.78em;color:${c.sidebarText};margin-top:3px;opacity:0.75">${escHTML(data.jobTitle)}</div>` : ''}
      </div>
      <div style="width:30px;height:1px;background:${c.accent};margin:0 auto;opacity:0.5"></div>
      ${contactColumnHTML(data, c.sidebarText, c.accent)}
      ${renderSectionsHTML(t.layout.sidebarSections.filter(s => s !== 'personal'), data, { textColor: c.sidebarText, dateColor: 'rgba(255,255,255,0.5)', titleColor: c.accent, accent: c.accent, titleStyle: 'gradient-underline', variant: 'stars' })}
    </div>
    <div style="flex:1;background:${c.background};padding:1.5em;display:flex;flex-direction:column;gap:1.1em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', showTimeline: true }, t._preferences)}
    </div>
  </div>`;
}

// 10. SYDNEY
function sydneyHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="background:${c.headerBackground};color:#ffffff;padding:1.6em 2em 2.5em;position:relative;overflow:hidden">
      ${svgCircleDecor('#ffffff', 0.08, 150, { top: '-40px', right: '10%' })}
      ${svgCircleDecor('#ffffff', 0.05, 80, { bottom: '10px', left: '5%' })}
      <div style="position:relative;z-index:1;display:flex;align-items:center;gap:1.2em">
        ${data.photo ? `<img src="${data.photo}" alt="" style="width:72px;height:72px;border-radius:14px;object-fit:cover;border:3px solid rgba(255,255,255,0.3);box-shadow:0 4px 12px rgba(0,0,0,0.15)"/>` : ''}
        <div>
          <h1 style="font-size:1.5em;font-weight:800;margin:0">${escHTML(data.name)}</h1>
          ${data.jobTitle ? `<div style="font-size:0.88em;opacity:0.9;margin-top:2px">${escHTML(data.jobTitle)}</div>` : ''}
          <div style="margin-top:0.5em">${contactRowHTML(data, 'rgba(255,255,255,0.85)', '·')}</div>
        </div>
      </div>
      ${svgWaveClip(c.background, 40)}
    </div>
    <div style="padding:0.5em 2em 1.5em;display:flex;flex-direction:column;gap:1.1em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', variant: 'pills', showTimeline: false }, t._preferences)}
    </div>
  </div>`;
}

// 11. TORONTO
function torontoHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};display:flex">
    <div style="width:${t.layout.sidebarWidth};background:${c.sidebarBackground};color:${c.sidebarText};padding:1.5em 1.2em;display:flex;flex-direction:column;gap:0.9em;position:relative;overflow:hidden">
      ${svgCircleDecor('#ffffff', 0.06, 100, { bottom: '-30px', left: '-30px' })}
      ${data.photo ? `<div style="text-align:center"><img src="${data.photo}" alt="" style="width:82px;height:82px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.25);box-shadow:0 3px 12px rgba(0,0,0,0.2)"/></div>` : ''}
      <div style="text-align:center">
        <h1 style="font-size:1.15em;font-weight:800;margin:0;word-break:break-word">${escHTML(data.name)}</h1>
        ${data.jobTitle ? `<div style="font-size:0.78em;margin-top:3px;opacity:0.85">${escHTML(data.jobTitle)}</div>` : ''}
      </div>
      <div style="height:1px;background:rgba(255,255,255,0.15)"></div>
      ${contactColumnHTML(data, c.sidebarText, 'rgba(255,255,255,0.6)')}
      <div style="height:1px;background:rgba(255,255,255,0.15)"></div>
      ${renderSectionsHTML(t.layout.sidebarSections.filter(s => s !== 'personal'), data, { textColor: c.sidebarText, dateColor: 'rgba(255,255,255,0.55)', titleColor: '#ffffff', accent: 'rgba(255,255,255,0.5)', titleStyle: 'gradient-underline', variant: 'dots' })}
    </div>
    <div style="flex:1;background:${c.background};padding:1.5em;display:flex;flex-direction:column;gap:1.1em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'border-left', showTimeline: true }, t._preferences)}
    </div>
  </div>`;
}

// 12. ATHENS
function athensHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text};padding:2.5em;border:1px solid ${c.divider}">
    <div style="text-align:center;margin-bottom:1em">
      <div style="height:2px;background:${c.divider};margin-bottom:6px"></div>
      <div style="height:1px;background:${c.divider};margin-bottom:0.8em"></div>
      <h1 style="font-size:2em;font-weight:400;margin:0;color:${c.headerText};letter-spacing:0.15em;text-transform:uppercase">${escHTML(data.name)}</h1>
      ${data.jobTitle ? `<div style="font-size:0.9em;color:${c.secondary};margin-top:0.3em;font-style:italic;letter-spacing:0.05em">${escHTML(data.jobTitle)}</div>` : ''}
      <div style="margin-top:0.5em">${contactRowHTML(data, c.secondary, '•')}</div>
      <div style="height:1px;background:${c.divider};margin-top:0.8em"></div>
      <div style="height:2px;background:${c.divider};margin-top:6px"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:1.2em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.divider, titleStyle: 'center-line', variant: 'tags' }, t._preferences)}
    </div>
  </div>`;
}

// 13. VIBES
function vibesHTML(data, t) {
  const c = t.styles.colors;
  const sectionCards = t.layout.mainSections.map(section => {
    const props = { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', variant: section === 'skills' ? 'gradient-bars' : 'tags', preferences: t._preferences };
    let content;
    switch (section) {
      case 'summary': content = summaryHTML(data, props); break;
      case 'experience': content = experienceHTML(data, { ...props, showTimeline: true }); break;
      case 'education': content = educationHTML(data, props); break;
      case 'skills': content = skillsHTML(data, props); break;
      case 'certifications': content = certificationsHTML(data, props); break;
      case 'languages': content = languagesHTML(data, props); break;
      case 'projects': content = projectsHTML(data, props); break;
      case 'achievements': content = achievementsHTML(data, props); break;
      default: content = '';
    }
    if (!content) return '';
    return `<div style="background:${c.cardBackground || '#fff'};padding:1em 1.2em;border-radius:8px;border:1px solid ${c.divider};box-shadow:0 1px 4px rgba(0,0,0,0.04)">${content}</div>`;
  }).filter(Boolean).join('');

  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="background:${c.headerBackground};color:#ffffff;padding:1.5em 2em 2.5em;position:relative;overflow:hidden">
      ${svgCircleDecor('#ffffff', 0.1, 100, { top: '-20px', right: '5%' })}
      <div style="position:relative;z-index:1;display:flex;align-items:center;gap:1em">
        ${data.photo ? `<img src="${data.photo}" alt="" style="width:68px;height:68px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.35)"/>` : ''}
        <div>
          <h1 style="font-size:1.5em;font-weight:800;margin:0">${escHTML(data.name)}</h1>
          ${data.jobTitle ? `<div style="font-size:0.88em;opacity:0.9;margin-top:2px">${escHTML(data.jobTitle)}</div>` : ''}
          <div style="margin-top:0.5em">${contactRowHTML(data, 'rgba(255,255,255,0.85)', '·')}</div>
        </div>
      </div>
      ${svgDiagonalClip(c.background, 35)}
    </div>
    <div style="padding:0.5em 1.5em 1.5em;display:flex;flex-direction:column;gap:0.8em">
      ${sectionCards}
    </div>
  </div>`;
}

// 14. NANICA
function nanicaHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text};padding:2.5em">
    <div style="margin-bottom:2em">
      <h1 style="font-size:3em;font-weight:700;margin:0;color:${c.headerText};line-height:0.95;letter-spacing:-0.03em">${escHTML(data.name)}</h1>
      ${data.jobTitle ? `<div style="font-size:1em;color:${c.secondary};margin-top:0.6em;font-weight:400">${escHTML(data.jobTitle)}</div>` : ''}
      <div style="height:3px;background:${c.sectionTitle};width:3em;margin:1em 0;border-radius:2px"></div>
      ${contactRowHTML(data, c.secondary, '·')}
    </div>
    <div style="display:flex;flex-direction:column;gap:1.5em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'bold-caps', variant: 'pills' }, t._preferences)}
    </div>
  </div>`;
}

// 15. CARDS
function cardsHTML(data, t) {
  const c = t.styles.colors;
  const sectionCards = t.layout.mainSections.map(section => {
    const props = { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'dot-accent', preferences: t._preferences };
    let content;
    switch (section) {
      case 'summary': content = summaryHTML(data, props); break;
      case 'experience': content = experienceHTML(data, { ...props, showTimeline: true }); break;
      case 'education': content = educationHTML(data, props); break;
      case 'skills': content = skillsHTML(data, props); break;
      case 'certifications': content = certificationsHTML(data, props); break;
      case 'languages': content = languagesHTML(data, props); break;
      case 'projects': content = projectsHTML(data, props); break;
      case 'achievements': content = achievementsHTML(data, props); break;
      default: content = '';
    }
    if (!content) return '';
    return `<div style="background:${c.cardBackground || '#fff'};padding:1em 1.2em;border-radius:6px;box-shadow:${c.cardShadow || '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'}">${content}</div>`;
  }).filter(Boolean).join('');

  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="background:${c.headerBackground};color:#ffffff;padding:1.5em 2em;text-align:center;position:relative">
      ${svgCircleDecor('#ffffff', 0.07, 100, { top: '-30px', left: '10%' })}
      <h1 style="font-size:1.5em;font-weight:800;margin:0;position:relative;z-index:1">${escHTML(data.name)}</h1>
      ${data.jobTitle ? `<div style="font-size:0.88em;opacity:0.9;margin-top:2px;position:relative;z-index:1">${escHTML(data.jobTitle)}</div>` : ''}
      <div style="margin-top:0.5em;position:relative;z-index:1">${contactRowHTML(data, 'rgba(255,255,255,0.85)', '·')}</div>
    </div>
    <div style="padding:1em 1.5em;display:flex;flex-direction:column;gap:0.7em">
      ${sectionCards}
    </div>
  </div>`;
}

// 16. RIBBON
function ribbonHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="background:${c.headerBackground};color:#ffffff;padding:1.5em 2em;position:relative">
      ${svgDotsPattern('rgba(255,255,255,0.1)', 3, 5)}
      <h1 style="font-size:1.5em;font-weight:800;margin:0;position:relative;z-index:1">${escHTML(data.name)}</h1>
      ${data.jobTitle ? `<div style="font-size:0.88em;opacity:0.9;margin-top:2px;position:relative;z-index:1">${escHTML(data.jobTitle)}</div>` : ''}
      <div style="margin-top:0.5em;position:relative;z-index:1">${contactRowHTML(data, 'rgba(255,255,255,0.85)', '·')}</div>
    </div>
    <div style="padding:1.2em 1.2em;display:flex;flex-direction:column;gap:0.8em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: '#ffffff', accent: c.ribbonBackground || c.accent, titleStyle: 'ribbon', showTimeline: false }, t._preferences)}
    </div>
  </div>`;
}

// 17. ACCENT LINE
function accentLineHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text};display:flex">
    <div style="width:5px;background:linear-gradient(180deg,${c.accentLine || c.accent},${c.accentLine || c.accent}60);flex-shrink:0"></div>
    <div style="flex:1;padding:2em">
      <div style="margin-bottom:1.2em;padding-bottom:1em;border-bottom:1px solid ${c.divider}">
        <h1 style="font-size:1.7em;font-weight:700;margin:0;color:${c.headerText};letter-spacing:-0.01em">${escHTML(data.name)}</h1>
        ${data.jobTitle ? `<div style="font-size:0.88em;color:${c.accentLine || c.accent};margin-top:3px;font-weight:500">${escHTML(data.jobTitle)}</div>` : ''}
        <div style="margin-top:0.5em">${contactRowHTML(data, c.secondary, '·')}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:1.1em">
        ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accentLine || c.accent, titleStyle: 'border-left', showTimeline: true, variant: 'tags' }, t._preferences)}
      </div>
    </div>
  </div>`;
}

// 18. DUOTONE
function duotoneHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="background:${c.headerBackground || c.topBackground};color:#ffffff;padding:1.5em 2em;display:flex;align-items:center;gap:1em;position:relative;overflow:hidden">
      ${svgCircleDecor('#ffffff', 0.07, 120, { top: '-30px', right: '-20px' })}
      ${data.photo ? `<img src="${data.photo}" alt="" style="width:65px;height:65px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.25);position:relative;z-index:1"/>` : ''}
      <div style="position:relative;z-index:1">
        <h1 style="font-size:1.5em;font-weight:800;margin:0">${escHTML(data.name)}</h1>
        ${data.jobTitle ? `<div style="font-size:0.88em;opacity:0.9;margin-top:2px">${escHTML(data.jobTitle)}</div>` : ''}
        <div style="margin-top:0.5em">${contactRowHTML(data, 'rgba(255,255,255,0.8)', '·')}</div>
      </div>
    </div>
    <div style="display:flex">
      <div style="flex:1;padding:1.2em 1.5em;display:flex;flex-direction:column;gap:1.1em">
        ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', showTimeline: true }, t._preferences)}
      </div>
      <div style="width:${t.layout.sidebarWidth};background:${c.sidebarBackground};padding:1.2em;display:flex;flex-direction:column;gap:0.9em;border-left:1px solid ${c.divider}">
        ${renderSectionsHTML(t.layout.sidebarSections, data, { textColor: c.sidebarText || c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', variant: 'circular' }, t._preferences)}
      </div>
    </div>
  </div>`;
}

// 19. METRO
function metroHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};background:${c.background};color:${c.text}">
    <div style="background:${c.headerBackground};color:#ffffff;padding:1em 1.5em;display:flex;justify-content:space-between;align-items:center">
      <div>
        <h1 style="font-size:1.35em;font-weight:700;margin:0;letter-spacing:0.01em">${escHTML(data.name)}</h1>
        ${data.jobTitle ? `<div style="font-size:0.82em;opacity:0.9">${escHTML(data.jobTitle)}</div>` : ''}
      </div>
    </div>
    <div style="padding:0.5em 1.25em 0.3em;border-bottom:1px solid ${c.divider}">
      ${contactRowHTML(data, c.text, '|')}
    </div>
    <div style="display:flex">
      <div style="width:${t.layout.sidebarWidth};background:${c.sidebarBackground};padding:0.8em;display:flex;flex-direction:column;gap:0.7em">
        ${renderSectionsHTML(t.layout.sidebarSections, data, { textColor: c.sidebarText || c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'dot-accent', variant: 'dots' }, t._preferences)}
      </div>
      <div style="flex:1;padding:0.8em 1.25em;display:flex;flex-direction:column;gap:0.9em">
        ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'dot-accent', showTimeline: false }, t._preferences)}
      </div>
    </div>
  </div>`;
}

// 20. INFOGRAPHIC
function infographicHTML(data, t) {
  const c = t.styles.colors;
  return `<div style="font-family:${t.styles.fontFamily};font-size:${t.styles.fontSize};line-height:${t.styles.lineHeight};display:flex;background:${c.background}">
    <div style="width:${t.layout.sidebarWidth};background:${c.sidebarBackground};padding:1.5em;display:flex;flex-direction:column;gap:1em">
      ${data.photo ? `<div style="text-align:center"><img src="${data.photo}" alt="" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid ${c.accent};box-shadow:0 3px 10px ${c.accent}20"/></div>` : ''}
      <div style="text-align:center">
        <h1 style="font-size:1.15em;font-weight:800;margin:0;color:${c.sectionTitle}">${escHTML(data.name)}</h1>
        ${data.jobTitle ? `<div style="font-size:0.8em;color:${c.accent};margin-top:3px;font-weight:500">${escHTML(data.jobTitle)}</div>` : ''}
      </div>
      <div style="height:2px;background:linear-gradient(90deg,${c.accent}60,transparent)"></div>
      ${contactColumnHTML(data, c.text, c.accent)}
      ${renderSectionsHTML(t.layout.sidebarSections.filter(s => s !== 'personal'), data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'gradient-underline', variant: 'circular' })}
    </div>
    <div style="flex:1;padding:1.5em;display:flex;flex-direction:column;gap:1.1em">
      ${renderSectionsHTML(t.layout.mainSections, data, { textColor: c.text, dateColor: c.secondary, titleColor: c.sectionTitle, accent: c.accent, titleStyle: 'border-left', showTimeline: true }, t._preferences)}
    </div>
  </div>`;
}


// ========== LAYOUT MAP ==========

const layoutGenerators = {
  'cascade': cascadeHTML,
  'iconic': iconicHTML,
  'primo': primoHTML,
  'split': splitHTML,
  'berlin': berlinHTML,
  'stockholm': stockholmHTML,
  'tokyo': tokyoHTML,
  'milan': milanHTML,
  'dubai': dubaiHTML,
  'sydney': sydneyHTML,
  'toronto': torontoHTML,
  'athens': athensHTML,
  'vibes': vibesHTML,
  'nanica': nanicaHTML,
  'cards': cardsHTML,
  'ribbon': ribbonHTML,
  'accent-line': accentLineHTML,
  'duotone': duotoneHTML,
  'metro': metroHTML,
  'infographic': infographicHTML,
};


// ========== FULL HTML DOCUMENT GENERATOR ==========

function generatePemiumDesignHTML(data, templateConfig, customColors = {}, preferences = {}) {
  // ─── Apply visibility preferences ───
  const vis = preferences?.visibility || {};
  const visData = {
    ...data,
    summary: vis.summary === false ? '' : data.summary,
    experience: vis.experience === false ? [] : data.experience,
    education: vis.education === false ? [] : data.education,
    skills: vis.skills === false ? [] : data.skills,
    certifications: vis.certifications === false ? [] : data.certifications,
    languages: vis.languages === false ? [] : data.languages,
    customSections: vis.customSections === false ? [] : data.customSections,
    photo: vis.photo === false ? '' : data.photo,
  };

  // Set date format preferences for fmtDate
  // Set request-scoped context for utility functions
  _ctx.datePrefs = preferences || {};
  _ctx.lineHeight = '1.4'; // will be overridden below after lineHeight preference is applied

  // Normalize data
  const normalizedData = {
    ...visData,
    experience: normalizeExperienceData(visData.experience),
    customSections: normalizeCustomSections(visData.customSections),
  };

  // Merge custom colors into template
  const template = JSON.parse(JSON.stringify(templateConfig));

  // ─── Apply font preferences ───
  const fontPref = preferences?.typography?.fontPair?.fontFamily;
  if (fontPref) template.styles.fontFamily = fontPref;

  const fontSizePref = preferences?.typography?.fontSize;
  if (fontSizePref === 'small') template.styles.fontSize = '9pt';
  else if (fontSizePref === 'large') template.styles.fontSize = '11.5pt';

  const lineHeightPref = preferences?.typography?.lineHeight;
  if (lineHeightPref === 'compact') template.styles.lineHeight = '1.25';
  else if (lineHeightPref === 'relaxed') template.styles.lineHeight = '1.6';

  // Update request context lineHeight for utility functions (summaryHTML, renderBulletsHTML etc.)
  _ctx.lineHeight = template.styles.lineHeight || '1.4';

  if (customColors && Object.keys(customColors).length > 0) {
    const baseColors = { ...template.styles.colors };
    if (customColors.primary) {
      baseColors.headerBackground = customColors.primary;
      baseColors.sidebarBackground = customColors.primary;
    }
    if (customColors.accent) baseColors.accent = customColors.accent;
    if (customColors.text) baseColors.text = customColors.text;
    if (customColors.background) baseColors.background = customColors.background;
    template.styles.colors = baseColors;
  }

  const layoutType = template.layout?.layoutType || 'cascade';
  const generator = layoutGenerators[layoutType] || cascadeHTML;
  // Attach preferences to template so layout generators can pass them to section renderers
  template._preferences = preferences;
  const bodyContent = generator(normalizedData, template);

  // Build Google Fonts link
  const fontFamily = template.styles.fontFamily || "'Inter', sans-serif";
  const fontMatch = fontFamily.match(/'([^']+)'/);
  const primaryFont = fontMatch ? fontMatch[1] : 'Inter';
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(primaryFont)}:wght@300;400;500;600;700;800&display=swap`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${googleFontUrl}" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 0.2in 0.15in;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 210mm;
      margin: 0;
      padding: 0;
      font-family: ${fontFamily};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body > div {
      width: 100%;
    }
    img {
      max-width: 100%;
    }
    /* Only avoid breaks inside small atomic elements, NOT divs/spans */
    h4, li {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    /* Allow natural content flow across pages */
    .section-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}


// ========== API HANDLER ==========

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

    console.log("Pemium Design PDF generation request:", {
      template: typeof template === 'string' ? template : template?.name,
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
      templateConfig = premiumDesignTemplates[template];
    } else if (typeof template === 'object' && template !== null) {
      templateConfig = template;
    }

    if (!templateConfig) {
      return NextResponse.json({ error: `Template "${typeof template === 'string' ? template : 'unknown'}" not found` }, { status: 400 });
    }

    // Generate HTML
    const html = generatePemiumDesignHTML(data, templateConfig, customColors, preferences);

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

      // Generate PDF — small top/bottom margins give breathing room at page breaks
      const pdfFormat = country === 'us' ? 'Letter' : 'A4';
      const pdfBuffer = await page.pdf({
        format: pdfFormat,
        printBackground: true,
        margin: {
          top: '0.2in',
          right: '0.15in',
          bottom: '0.2in',
          left: '0.15in'
        },
        timeout: 30000
      });

      console.log("Pemium Design PDF generated successfully, size:", pdfBuffer.length);

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="pemium-design-resume.pdf"`,
          'Cache-Control': 'no-cache'
        }
      });

    } finally {
      await page.close();
    }

  } catch (error) {
    console.error("Error generating Pemium Design PDF:", error);

    // Try to recover browser on connection errors
    if (error.message?.includes('Protocol error') || error.message?.includes('Target closed')) {
      browserInstance = null;
    }

    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
}
