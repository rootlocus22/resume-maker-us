import { NextResponse } from "next/server";
//import puppeteer from "puppeteer";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { templates } from "../../lib/templates";
import { coverLetterTemplates } from "../../lib/coverLetterTemplate";

// Generate Resume HTML
function generateResumeHTML(data, template = "classic", customColors = {}, language = "en", country = "us", isPremium = false) {
  const availableTemplates = Object.keys(templates);
  const normalizedTemplate = template.toLowerCase();
  const matchingTemplate = availableTemplates.find((t) => t.toLowerCase() === normalizedTemplate);
  if (!matchingTemplate) {
    throw new Error(`Template "${template}" not found. Available templates: ${availableTemplates.join(", ")}`);
  }

  const templateConfig = templates[matchingTemplate];
  const { layout } = templateConfig;
  const mergedColors = { ...templateConfig.styles.colors, ...(customColors[matchingTemplate] || customColors) };

  const iconMap = {
    Bookmark: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
    Briefcase: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    GraduationCap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
    Award: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
    Wrench: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><path d="M5.5 21.5l6-6"></path><path d="M18.5 5.5a6 6 0 0 0-8.5 8.5l-5 5a2 2 0 0 0 2.83 2.83l5-5a6 6 0 0 0 8.5-8.5z"></path></svg>`,
    Languages: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10z"></path><path d="M2 12h20"></path><path d="M12 2v20"></path></svg>`,
    Project: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9h18M9 21V9"></path></svg>`,
    Volunteer: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 12 10z"></path></svg>`,
    Publication: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    Reference: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><path d="M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    Hobby: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${mergedColors.accent}" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>`,
  };

  const sectionIconMap = {
    summary: "Bookmark",
    experience: "Briefcase",
    education: "GraduationCap",
    skills: "Wrench",
    certifications: "Award",
    languages: "Languages",
    project: "Project",
    volunteer: "Volunteer",
    publication: "Publication",
    reference: "Reference",
    award: "Award",
    hobby: "Hobby",
  };

  const translations = {
    en: { summary: "Profile", experience: "Employment History", education: "Education", skills: "Skills", certifications: "Certifications", languages: "Languages", project: "Project", volunteer: "Volunteer Work", publication: "Publication", reference: "References", award: "Award", hobby: "Hobby" },
    es: { summary: "Perfil", experience: "Historial de Empleo", education: "Educación", skills: "Habilidades", certifications: "Certificaciones", languages: "Idiomas", project: "Proyecto", volunteer: "Trabajo Voluntario", publication: "Publicación", reference: "Referencias", award: "Premio", hobby: "Pasatiempo" },
    fr: { summary: "Profil", experience: "Historique d’Emploi", education: "Éducation", skills: "Compétences", certifications: "Certifications", languages: "Langues", project: "Projet", volunteer: "Travail Bénévole", publication: "Publication", reference: "Références", award: "Prix", hobby: "Passe-Temps" },
  };

  const t = translations[language] || translations.en;

  const cleanText = (text) => {
    if (!text) return "";
    return text.replace(/\s+/g, " ").trim();
  };

  const renderSections = () => {
    const allSections = [...layout.sectionsOrder, "customSections"].filter((section, index, self) => self.indexOf(section) === index);
    return allSections.map((section) => {
      if ((Array.isArray(data[section]) && !data[section].length) && section !== "summary" && section !== "customSections") return "";
      const sectionStyle = `padding: 0.5rem; margin-bottom: ${templateConfig.styles.spacing === "compact" ? "0.25rem" : templateConfig.styles.spacing === "comfortable" ? "0.5rem" : "0.75rem"}; break-inside: avoid; border-radius: 8px; background-color: ${mergedColors.background === "#ffffff" ? "#f9f9f9" : mergedColors.background};`;
      const renderWithIcons = layout.showIcons ? `<span style="width: 18px; height: 18px; margin-right: 0.5rem; display: inline-block; vertical-align: middle;">${iconMap[sectionIconMap[section]] || '<span style="display: inline-block; width: 18px; height: 18px; color: ${mergedColors.accent}; font-size: 12px; text-align: center; line-height: 18px;">?</span>'}</span>` : "";
      switch (section) {
        case "summary": return `<section style="${sectionStyle}"><h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">${renderWithIcons}<span style="color: ${mergedColors.primary}; flex: 1;">${t.summary}</span></h2><p style="color: ${mergedColors.text}; font-size: 0.875rem; line-height: 1.4;">${cleanText(data.summary) || "Your professional profile goes here."}</p></section>`;
        case "experience": return `<section style="${sectionStyle}"><h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">${renderWithIcons}<span style="color: ${mergedColors.primary}; flex: 1;">${t.experience}</span></h2>${data.experience.map(exp => `<div style="margin-bottom: 0.25rem;"><div style="display: flex; flex-direction: column; gap: 0.125rem;"><div><h3 style="font-weight: 600; font-size: 1rem; color: ${mergedColors.primary};">${cleanText(exp.jobTitle) || "Job Title"}, ${cleanText(exp.company) || "Company Name"}</h3><p style="font-weight: 500; font-size: 0.75rem; color: ${mergedColors.secondary};">${cleanText(exp.startDate) || "Start"} - ${cleanText(exp.endDate) || "Present"} | ${cleanText(exp.location) || "Location"}</p></div></div><p style="color: ${mergedColors.text}; font-size: 0.875rem; line-height: 1.4; margin-top: 0.125rem;">${cleanText(exp.description) || "Description of responsibilities and achievements."}</p></div>`).join("")}</section>`;
        case "education": return `<section style="${sectionStyle}"><h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">${renderWithIcons}<span style="color: ${mergedColors.primary}; flex: 1;">${t.education}</span></h2>${data.education.map(edu => `<div style="margin-bottom: 0.25rem;"><div style="display: flex; flex-direction: column; gap: 0.125rem;"><div><h3 style="font-weight: 600; font-size: 1rem; color: ${mergedColors.primary};">${cleanText(edu.institution) || "Institution Name"}</h3><p style="font-size: 0.875rem; color: ${mergedColors.text};">${cleanText(edu.degree) || "Degree"} in ${cleanText(edu.field) || "Field of Study"}</p></div><p style="font-size: 0.75rem; color: ${mergedColors.secondary};">${cleanText(edu.startDate) || "Start"} - ${cleanText(edu.endDate) || "Present"}</p></div>${country === "us" && edu.gpa ? `<p style="font-size: 0.75rem; color: ${mergedColors.text}; margin-top: 0.125rem;">GPA: ${cleanText(edu.gpa)}</p>` : ""}</div>`).join("")}</section>`;
        case "skills": return `<section style="${sectionStyle}"><h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">${renderWithIcons}<span style="color: ${mergedColors.primary}; flex: 1;">${t.skills}</span></h2><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.25rem;">${data.skills.map(skill => `<div style="display: flex; justify-content: space-between; align-items: center;"><span style="font-size: 0.875rem; color: ${mergedColors.text};">${cleanText(skill.name) || "Skill"}</span><span style="font-size: 0.75rem; color: ${mergedColors.secondary};">(${cleanText(skill.proficiency) || "Proficiency"})</span></div>`).join("")}</div></section>`;
        case "certifications": return `<section style="${sectionStyle}"><h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">${renderWithIcons}<span style="color: ${mergedColors.primary}; flex: 1;">${t.certifications}</span></h2>${data.certifications.map(cert => `<div style="margin-bottom: 0.25rem;"><h3 style="font-weight: 600; font-size: 1rem; color: ${mergedColors.primary};">${cleanText(cert.name) || "Certification Name"}</h3><p style="font-size: 0.75rem; color: ${mergedColors.secondary};">${cleanText(cert.issuer) || "Issuer"} • ${cleanText(cert.date) || "Date"}</p></div>`).join("")}</section>`;
        case "languages": return `<section style="${sectionStyle}"><h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">${renderWithIcons}<span style="color: ${mergedColors.primary}; flex: 1;">${t.languages}</span></h2><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.25rem;">${data.languages.map(lang => `<div style="display: flex; justify-content: space-between; align-items: center;"><span style="font-size: 0.875rem; color: ${mergedColors.text};">${cleanText(lang.language) || "Language"}</span><span style="font-size: 0.75rem; color: ${mergedColors.secondary};">(${cleanText(lang.proficiency) || "Proficiency"})</span></div>`).join("")}</div></section>`;
        case "customSections": const customSectionsData = data.customSections || []; return customSectionsData.length > 0 ? customSectionsData.map(customSection => { const renderWithIcons = layout.showIcons ? `<span style="width: 18px; height: 18px; margin-right: 0.5rem; display: inline-block; vertical-align: middle;">${iconMap[sectionIconMap[customSection.type]] || '<span style="display: inline-block; width: 18px; height: 18px; color: ${mergedColors.accent}; font-size: 12px; text-align: center; line-height: 18px;">?</span>'}</span>` : ""; return `<section style="${sectionStyle}"><h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">${renderWithIcons}<span style="color: ${mergedColors.primary}; flex: 1;">${t[customSection.type] || "Additional Section"}</span></h2><h3 style="font-weight: 600; font-size: 1rem; color: ${mergedColors.primary};">${cleanText(customSection.title) || ""}</h3><p style="color: ${mergedColors.text}; font-size: 0.875rem; line-height: 1.4; margin-top: 0.125rem;">${cleanText(customSection.description) || ""}</p>${customSection.date ? `<p style="font-size: 0.75rem; color: ${mergedColors.secondary}; margin-top: 0.125rem;">${cleanText(customSection.date)}</p>` : ""}${customSection.type === "reference" && customSection.name ? `<div style="margin-top: 0.125rem;"><p style="color: ${mergedColors.text}; font-size: 0.875rem; line-height: 1.4;">Reference: ${cleanText(customSection.name)}</p>${customSection.email ? `<p style="font-size: 0.75rem; color: ${mergedColors.secondary};">Email: ${cleanText(customSection.email)}</p>` : ""}${customSection.phone ? `<p style="font-size: 0.75rem; color: ${mergedColors.secondary};">Phone: ${cleanText(customSection.phone)}</p>` : ""}</div>` : ""}</section>`; }).join("") : "";
        default: return "";
      }
    }).join("");
  };

  const renderLayout = () => {
    const sections = renderSections();
    const spacingClass = templateConfig.styles.spacing === "compact" ? "space-y-2" : templateConfig.styles.spacing === "comfortable" ? "space-y-3" : "space-y-4";
    const header = `
      <header style="margin-bottom: 0.5rem; padding: 0.75rem 1rem; background: linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%); color: white; border-radius: 12px; break-after: avoid;">
        <div style="display: flex; flex-wrap: nowrap; justify-content: space-between; align-items: center; gap: 0.75rem;">
          <div style="flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: 0.75rem;">
            ${data.photo ? `<img src="${data.photo}" alt="Profile" style="width: 3.5rem; height: 3.5rem; border-radius: 9999px; object-fit: cover; border: 2px solid white;">` : ""}
            <div>
              <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">${cleanText(data.name) || "Your Name"}</h1>
              ${data.jobTitle ? `<p style="font-size: 1rem; font-weight: 500; opacity: 0.9;">${cleanText(data.jobTitle)}</p>` : ''}
            </div>
          </div>
          <div style="font-size: 0.75rem; text-align: right; flex: 0 0 auto; padding-right: 1rem; max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <p>${cleanText(data.email) || "email@example.com"}</p>
            <p>${cleanText(data.phone) || "+1 (555) 123-4567"}</p>
            <p>${cleanText(data.address) || "123 Street, City, Country"}</p>
            ${data.linkedin ? `<p><a href="${cleanText(data.linkedin)}" style="color: white; text-decoration: underline;">${cleanText(data.linkedin)}</a></p>` : ""}
            ${data.portfolio ? `<p><a href="${cleanText(data.portfolio)}" style="color: white; text-decoration: underline;">${cleanText(data.portfolio)}</a></p>` : ""}
          </div>
        </div>
      </header>
    `;
    // No watermark needed - all users have paid plans
    const watermark = "";

    if (layout.columns === 1) {
      return `
        <div class="${spacingClass}" style="width: 100%; padding: 0.5rem; border-radius: 12px; background-color: ${mergedColors.background};">
          ${header}
          ${sections}
          ${watermark}
        </div>
      `;
    }
    if (layout.columns === 2) {
      const sectionsArray = sections.split("</section>").filter(Boolean).map(s => `${s}</section>`);
      const totalContentLength = sectionsArray.reduce((sum, s) => sum + s.length, 0);
      let leftColumnLength = 0;
      let splitIndex = 0;

      // Dynamic split based on content length (30% left, 70% right)
      for (let i = 0; i < sectionsArray.length; i++) {
        leftColumnLength += sectionsArray[i].length;
        if (leftColumnLength >= totalContentLength * 0.3) {
          splitIndex = i + 1;
          break;
        }
      }
      if (splitIndex === 0 || splitIndex === sectionsArray.length) splitIndex = Math.ceil(sectionsArray.length / 2); // Fallback to even split

      const leftColumn = sectionsArray.slice(0, splitIndex).join("");
      const rightColumn = sectionsArray.slice(splitIndex).join("");
      const sidebarBackground = typeof layout.sidebar === "string" ? layout.sidebar : mergedColors.background;

      return `
        <div style="width: 100%; padding: 0.5rem; border-radius: 12px; background-color: ${mergedColors.background};">
          ${header}
          <div style="display: grid; grid-template-columns: 30% 70%; gap: 0.5rem; align-items: stretch;">
            <div class="${spacingClass}" style="padding: 0.5rem; background: ${sidebarBackground}; border-radius: 8px;">${leftColumn}</div>
            <div class="${spacingClass}" style="padding: 0.5rem; background: white; border-radius: 8px;">${rightColumn}</div>
          </div>
          ${watermark}
        </div>
      `;
    }
    return `
      <div class="${spacingClass}" style="width: 100%; padding: 0.5rem; border-radius: 12px; background-color: ${mergedColors.background};">
        ${header}
        ${sections}
        ${watermark}
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          html { font-size: 16px; }
          body {
            width: 794px;
            height: auto; /* Dynamic height */
            margin: 0;
            padding: 40px 40px 0 40px; /* No bottom padding to reduce trailing space */
            background-color: ${mergedColors.background};
            color: ${mergedColors.text};
            font-family: ${templateConfig.styles.fontFamily}, sans-serif;
            font-size: 16px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .space-y-3 > * + * { margin-top: 0.75rem; }
          .space-y-4 > * + * { margin-top: 1rem; }
          @media print {
            body { margin: 0; padding: 40px 40px 0 40px; width: 794px; height: auto; }
            section { break-inside: avoid; break-before: auto; }
            @page { margin: 0; size: A4; }
          }
          h1, h2, h3 { font-weight: 700; margin: 0; }
          p { margin: 0; white-space: normal; }
          img { max-width: 100%; height: auto; }
          svg { display: block; vertical-align: middle; }
        </style>
      </head>
      <body>
        ${renderLayout()}
      </body>
    </html>
  `;
}
// Generate Cover Letter HTML
function generateCoverLetterHTML(coverLetterData, coverLetterTemplate = "classic", customColors = {}, resumeData) {
  const templateConfig = coverLetterTemplates[coverLetterTemplate] || coverLetterTemplates["classic"];
  const styles = {
    ...templateConfig.styles,
    colors: {
      ...templateConfig.styles.colors,
      ...(customColors[coverLetterTemplate] || customColors),
    },
  };
  const layout = { headerStyle: templateConfig.layout?.headerStyle || "compact" };
  const mergedColors = styles.colors;

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
    return text
      .replace(/\[jobTitle\]/g, getFieldValue("jobTitle"))
      .replace(/\[company\]/g, getFieldValue("company"))
      .replace(/\[previousCompany\]/g, resumeData?.experience?.[0]?.company || "[previousCompany]")
      .replace(/\[achievement\]/g, resumeData?.experience?.[0]?.description || "[achievement]")
      .replace(/\[field\]/g, resumeData?.summary?.split(" ").slice(0, 2).join(" ") || "[field]")
      .replace(/\[skill\]/g, resumeData?.skills?.[0] || "[skill]")
      .replace(/\[skill1\]/g, resumeData?.skills?.[0] || "[skill1]")
      .replace(/\[skill2\]/g, resumeData?.skills?.[1] || "[skill2]")
      .replace(/\[skill3\]/g, resumeData?.skills?.[2] || "[skill3]")
      .replace(/\[specificTechSkill\]/g, resumeData?.skills?.[0] || "[specificTechSkill]")
      .replace(/\[specificMarketingSkill\]/g, resumeData?.skills?.[0] || "[specificMarketingSkill]")
      .replace(/\[specificLeadershipSkill\]/g, resumeData?.skills?.[0] || "[specificLeadershipSkill]")
      .replace(/\[specificCreativeSkill\]/g, resumeData?.skills?.[0] || "[specificCreativeSkill]")
      .replace(/\[specificProject\]/g, resumeData?.projects?.[0]?.title || "[specificProject]")
      .replace(/\[specificCampaign\]/g, resumeData?.projects?.[0]?.title || "[specificCampaign]")
      .replace(/\[metric\]/g, "[metric]")
      .replace(/\[percentage\]/g, "[percentage]")
      .replace(/\[specificCompanyGoal\]/g, "[specificCompanyGoal]")
      .replace(/\[specificValue\]/g, "[specificValue]")
      .replace(/\[previousRole\]/g, resumeData?.experience?.[0]?.title || "[previousRole]")
      .replace(/\[years\]/g, resumeData?.yearsOfExperience ? `${resumeData.yearsOfExperience}` : (resumeData?.experience?.[0]?.endDate ? `${new Date().getFullYear() - new Date(resumeData.experience[0].startDate).getFullYear()}` : "[years]"))
      .replace(/\[RecipientName\]/g, "[RecipientName]");
  };

  const iconMap = {
    Phone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    Mail: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    MapPin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  };

  const renderHeader = () => {
    const headerBaseStyle = `
      background: linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%);
      font-family: ${styles.fontFamily};
      padding: ${layout.headerStyle === "default" ? "12px 20px" : "16px 24px"};
      color: #ffffff;
      border-top-left-radius: ${styles.borderRadius};
      border-top-right-radius: ${styles.borderRadius};
    `;

    if (layout.headerStyle === "compact") {
      return `
        <header style="${headerBaseStyle} text-align: center;">
          <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.025em; color: #ffffff; font-family: ${styles.fontFamily}; margin: 0;">
            ${getFieldValue("name")}
          </h1>
          <p style="font-size: 14px; margin-top: 2px; opacity: 0.9; color: #ffffff; font-family: ${styles.fontFamily}; margin-bottom: 4px;">
            ${getFieldValue("jobTitle")}
          </p>
          <div style="font-size: 12px; color: #ffffff; font-family: ${styles.fontFamily}; white-space: normal; word-break: break-word;">
            <p style="display: flex; justify-content: center; align-items: center; gap: 6px; margin: 2px 0;">
              ${styles.useIcons ? `<span style="display: inline-block; vertical-align: middle;">${iconMap.Mail}</span>` : ""}
              ${getFieldValue("email")}
            </p>
            <p style="display: flex; justify-content: center; align-items: center; gap: 6px; margin: 2px 0;">
              ${styles.useIcons ? `<span style="display: inline-block; vertical-align: middle;">${iconMap.Phone}</span>` : ""}
              ${getFieldValue("phone")}
            </p>
            <p style="display: flex; justify-content: center; align-items: center; gap: 6px; margin: 2px 0;">
              ${styles.useIcons ? `<span style="display: inline-block; vertical-align: middle;">${iconMap.MapPin}</span>` : ""}
              ${getFieldValue("location")}
            </p>
          </div>
        </header>
      `;
    } else if (layout.headerStyle === "full-width") {
      return `
        <header style="${headerBaseStyle} display: flex; align-items: center; justify-content: space-between; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            ${resumeData?.personal?.photo ? `
              <img src="${resumeData.personal.photo}" alt="Profile" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255, 255, 255, 0.9); margin: 0;">
            ` : ""}
            <div>
              <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.025em; color: #ffffff; font-family: ${styles.fontFamily}; margin: 0;">
                ${getFieldValue("name")}
              </h1>
              <p style="font-size: 14px; margin-top: 2px; opacity: 0.9; color: #ffffff; font-family: ${styles.fontFamily}; margin-bottom: 0;">
                ${getFieldValue("jobTitle")}
              </p>
            </div>
          </div>
          <div style="font-size: 12px; color: #ffffff; font-family: ${styles.fontFamily}; white-space: normal; word-break: break-word; text-align: right;">
            <p style="display: flex; justify-content: flex-end; align-items: center; gap: 6px; margin: 2px 0;">
              ${styles.useIcons ? `<span style="display: inline-block; vertical-align: middle;">${iconMap.Mail}</span>` : ""}
              ${getFieldValue("email")}
            </p>
            <p style="display: flex; justify-content: flex-end; align-items: center; gap: 6px; margin: 2px 0;">
              ${styles.useIcons ? `<span style="display: inline-block; vertical-align: middle;">${iconMap.Phone}</span>` : ""}
              ${getFieldValue("phone")}
            </p>
            <p style="display: flex; justify-content: flex-end; align-items: center; gap: 6px; margin: 2px 0;">
              ${styles.useIcons ? `<span style="display: inline-block; vertical-align: middle;">${iconMap.MapPin}</span>` : ""}
              ${getFieldValue("location")}
            </p>
          </div>
        </header>
      `;
    } else {
      return `
        <header style="${headerBaseStyle} position: relative; overflow: hidden;">
          <div style="position: absolute; inset: 0; opacity: 0.1; pointer-events: none;">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 100%;">
              <path d="M0,0 Q50,50 100,0" stroke="${mergedColors.accent}" stroke-width="1.5" fill="none" />
              <path d="M0,100 Q50,50 100,100" stroke="${mergedColors.accent}" stroke-width="1.5" fill="none" />
            </svg>
          </div>
          <div style="position: relative; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              ${resumeData?.personal?.photo ? `
                <img src="${resumeData.personal.photo}" alt="Profile" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255, 255, 255, 0.9); margin: 0;">
              ` : ""}
              <div>
                <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.025em; color: #ffffff; font-family: ${styles.fontFamily}; margin: 0;">
                  ${getFieldValue("name")}
                </h1>
                <p style="font-size: 14px; margin-top: 2px; opacity: 0.9; color: #ffffff; font-family: ${styles.fontFamily}; margin-bottom: 0;">
                  ${getFieldValue("jobTitle")}
                </p>
              </div>
            </div>
            <div style="font-size: 12px; color: #ffffff; font-family: ${styles.fontFamily}; white-space: normal; word-break: break-word; text-align: right;">
              <p style="display: flex; justify-content: flex-end; align-items: center; gap: 6px; margin: 2px 0;">
                ${styles.useIcons ? `<span style="display: inline-block; vertical-align: middle;">${iconMap.Mail}</span>` : ""}
                ${getFieldValue("email")}
              </p>
              <p style="display: flex; justify-content: flex-end; align-items: center; gap: 6px; margin: 2px 0;">
                ${styles.useIcons ? `<span style="display: inline-block; vertical-align: middle;">${iconMap.Phone}</span>` : ""}
                ${getFieldValue("phone")}
              </p>
              <p style="display: flex; justify-content: flex-end; align-items: center; gap: 6px; margin: 2px 0;">
                ${styles.useIcons ? `<span style="display: inline-block; vertical-align: middle;">${iconMap.MapPin}</span>` : ""}
                ${getFieldValue("location")}
              </p>
            </div>
          </div>
        </header>
      `;
    }
  };

  const content = `
    <div style="font-family: ${styles.fontFamily}; font-size: ${styles.fontSize}; color: ${mergedColors.text}; background: ${mergedColors.background}; max-width: 714px; width: 100%; border: ${styles.border}; border-radius: ${styles.borderRadius}; box-shadow: ${styles.boxShadow}; padding: 0; line-height: ${styles.lineHeight}; letter-spacing: ${styles.letterSpacing};">
      ${renderHeader()}
      <div style="padding: 32px 32px 24px; display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <p style="font-size: 14px; font-weight: 500; color: ${mergedColors.accent}; margin: 0;">
            ${replacePlaceholders(getFieldValue("recipient"))}
          </p>
          <p style="font-size: 12px; opacity: 0.8; color: ${mergedColors.secondary}; margin: 0;">
            ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <p style="font-size: 16px; line-height: 26px; color: ${mergedColors.text}; margin: 0;">
            ${replacePlaceholders(getFieldValue("intro"))}
          </p>
          <div style="border-bottom: ${styles.divider}; margin: 16px 0;"></div>
          <p style="font-size: 16px; line-height: 26px; color: ${mergedColors.text}; margin: 0;">
            ${replacePlaceholders(getFieldValue("body"))}
          </p>
          <div style="border-bottom: ${styles.divider}; margin: 16px 0;"></div>
          <p style="font-size: 16px; line-height: 26px; color: ${mergedColors.text}; margin: 0;">
            ${replacePlaceholders(getFieldValue("closing"))}
          </p>
        </div>
        <footer style="margin-top: 40px;">
          <p style="font-size: 14px; opacity: 0.8; color: ${mergedColors.secondary}; margin: 0;">
            Sincerely,
          </p>
          <p style="font-size: 18px; font-weight: 600; margin-top: 8px; color: ${mergedColors.primary}; margin-bottom: 0;">
            ${getFieldValue("name")}
          </p>
        </footer>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            width: 794px;
            height: 1123px;
            margin: 0;
            padding: 40px;
            background-color: ${mergedColors.background};
            color: ${mergedColors.text};
            font-family: ${styles.fontFamily}, sans-serif;
            font-size: 16px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            page-break-after: always;
          }
          @media print {
            body { margin: 0; padding: 40px; width: 794px; height: 1123px; }
          }
          svg { display: inline-block; vertical-align: middle; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, template, customColors, language = "en", country = "us", isPremium = false, coverLetter, coverLetterTemplate } = body;

    if (!data) {
      return NextResponse.json({ error: "Missing data in request body" }, { status: 400 });
    }

    const availableTemplates = Object.keys(templates);
    const normalizedTemplate = template.toLowerCase();
    if (!availableTemplates.some((t) => t.toLowerCase() === normalizedTemplate)) {
      return NextResponse.json({ error: `Template "${template}" not found. Available templates: ${availableTemplates.join(", ")}` }, { status: 400 });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const browser = await puppeteer.launch({
      args: [
        ...(isProduction ? chromium.args : []),
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--font-render-hinting=none",
        "--disable-gpu",
      ],
      defaultViewport: { width: 794, height: 1123 },
      executablePath: isProduction ? await chromium.executablePath() : undefined,
      headless: "new",
    });

    const page = await browser.newPage();

    const resumeHtml = generateResumeHTML(data, template, customColors, language, country, isPremium);
    let fullHtml = resumeHtml;
    let filename = "resume.pdf";

    if (coverLetter) {
      const coverLetterHtml = generateCoverLetterHTML(coverLetter, coverLetterTemplate, customColors, data);
      fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                margin: 0;
                padding: 0;
                width: 794px;
                height: auto;
              }
              .page-cover, .page-resume {
                width: 794px;
                min-height: 1123px;
                page-break-after: always;
                position: relative;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                box-sizing: border-box;
                padding-top: 40px;
              }
              @media print {
                body { margin: 0; padding: 0; }
                .page-cover, .page-resume { break-after: page; width: 794px; min-height: 1123px; }
                section { break-inside: avoid; }
                @page { margin: 0; size: A4; }
              }
            </style>
          </head>
          <body>
            <div class="page-cover">${coverLetterHtml.replace(/<!DOCTYPE html>|<html>|<\/html>|<head>.*<\/head>|<body>|<\/body>/gis, "").trim()}</div>
            <div class="page-resume">${resumeHtml.replace(/<!DOCTYPE html>|<html>|<\/html>|<head>.*<\/head>|<body>|<\/body>/gis, "").trim()}</div>
          </body>
        </html>
      `;
      filename = "cover_letter_and_resume.pdf";
    }

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    // No watermark needed - all users have paid plans

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
} 