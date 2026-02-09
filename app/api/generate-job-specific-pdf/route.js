import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
//import puppeteer from "puppeteer-core";
import { getChromiumLaunchOptions } from "../../lib/puppeteerChromium";
import { jobSpecificTemplates } from "../../lib/jobSpecificTemplate";
import { coverLetterTemplates } from "../../lib/coverLetterTemplate";


export const maxDuration = 30;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const getPhotoUrl = (photo) => {
  if (photo && typeof photo === "string" && photo.startsWith("data:image")) return photo; // Base64 data URL only
  return null; // No default photo
};

const renderSection = (sectionKey, mergedData, styles, config, isPremium) => {
  const sectionData = sectionKey === "personal.photo" ? mergedData.personal.photo : mergedData[sectionKey];
  if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) return "";

  const headerType = config.layout?.headerType || "picture-top";
  const hasHeader = headerType === "banner" || headerType === "picture-left" || headerType === "picture-top";

  // Skip personal.photo and personal sections if header is present
  if (sectionKey === "personal.photo" && hasHeader) return "";
  if (sectionKey === "personal" && hasHeader) return "";

  if (sectionKey === "personal" && !config.layout.sidebarSections.includes("personal.photo") && !hasHeader) {
    return `
      <div class="mb-6 text-center border-b section-block" style="border-color: ${styles.colors.primary};">
        <h1 style="font-size: 16pt; font-weight: bold; color: ${styles.colors.primary};">${sectionData.name || "Name"}</h1>
        <p style="font-size: 9pt; color: ${styles.colors.secondary};">${[
          sectionData.email,
          sectionData.phone,
          sectionData.location,
        ]
          .filter(Boolean)
          .join(" | ") || "Email | Phone | Location"}</p>
      </div>
    `;
  }

  if (sectionKey === "personal.photo" && sectionData) {
    const photoUrl = getPhotoUrl(sectionData);
    if (!photoUrl) return "";
    return `
      <div class="mb-4 text-center section-block">
        <img
          src="${photoUrl}"
          alt="Profile"
          style="width: ${styles.photo?.size || "100px"}; height: ${styles.photo?.size || "100px"}; border-radius: ${
      styles.photo?.shape === "circle" ? "50%" : "8px"
    }; border: ${styles.photo?.border || "none"}; object-fit: cover; box-shadow: ${
      styles.photo?.shadow || "0 2px 8px rgba(0,0,0,0.1)"
    }; margin: 0 auto;"
        />
      </div>
    `;
  }

  if (sectionKey === "personal") {
    return `
      <div class="mb-6 text-center border-b section-block" style="border-color: ${styles.colors.primary};">
        <h1 style="font-size: 16pt; font-weight: bold; color: ${styles.colors.primary};">${sectionData.name || "Name"}</h1>
        <p style="font-size: 9pt; color: ${styles.colors.secondary};">${[
          sectionData.email,
          sectionData.phone,
          sectionData.location,
        ]
          .filter(Boolean)
          .join(" | ") || "Email | Phone | Location"}</p>
      </div>
    `;
  }

  // Enhanced section rendering with icons and better styling
  const sectionIcon = styles.icons?.[sectionKey] || "";
  const sectionTitle = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace("_", " ");

  let html = `
    <div class="mb-4 section-block">
      <h2 style="color: ${styles.colors.primary}; font-size: 13pt; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; letter-spacing: -0.2px;">
        ${sectionIcon ? `<span style="font-size: 14pt;">${sectionIcon}</span>` : ''}${sectionTitle}
      </h2>
  `;

  // Enhanced skills section rendering
  if (sectionKey === "skills" && Array.isArray(sectionData)) {
    html += `
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
        ${sectionData.slice(0, 12).map(skill => `
          <span style="background: ${styles.colors.cardBg || '#f8fafc'}; color: ${styles.colors.primary}; padding: 4px 8px; border-radius: 6px; font-size: 9pt; font-weight: 500; border: 1px solid ${styles.colors.border || '#e2e8f0'}; white-space: nowrap;">${skill}</span>
        `).join('')}
      </div>
    `;
  } else if (Array.isArray(sectionData)) {
    html += sectionData
      .map((item, idx) => {
        let itemHtml = `<div class="mb-3 item-block" style="padding: ${config.layout?.sectionCard ? '8px 0' : '4px 0'}; ${idx < sectionData.length - 1 ? `border-bottom: 1px solid ${styles.colors.border || '#f0f0f0'};` : ''}">`;
        
        if (typeof item === "string") {
          itemHtml += `
            <p style="color: ${styles.colors.text}; font-size: 10pt; line-height: 1.4;">${item}</p>
          `;
        } else {
          // Enhanced rendering for different item types
          if (item.title) {
            itemHtml += `
              <h3 style="color: ${styles.colors.text}; font-size: 11pt; font-weight: 600; margin-bottom: 2px; line-height: 1.3;">${item.title}</h3>
            `;
          }
          if (item.company) {
            itemHtml += `
              <p style="color: ${styles.colors.secondary}; font-size: 10pt; font-weight: 500; margin-bottom: 2px;">${item.company}</p>
            `;
          }
          if (item.institution) {
            itemHtml += `
              <p style="color: ${styles.colors.secondary}; font-size: 10pt; font-weight: 500; margin-bottom: 2px;">${item.institution}</p>
            `;
          }
          if (item.startDate || item.endDate) {
            itemHtml += `
              <p style="color: ${styles.colors.accent}; font-size: 9pt; font-weight: 500; margin-bottom: 4px;">${[item.startDate, item.endDate].filter(Boolean).join(' - ')}</p>
            `;
          }
          if (item.description) {
            itemHtml += `
              <p style="color: ${styles.colors.text}; font-size: 10pt; line-height: 1.4; margin-bottom: 4px;">${item.description}</p>
            `;
          }
          if (item.technologies) {
            itemHtml += `
              <p style="color: ${styles.colors.secondary}; font-size: 9pt; font-style: italic; margin-top: 4px;"><strong>Technologies:</strong> ${item.technologies}</p>
            `;
          }
          
          // Render other fields
          Object.entries(item)
            .filter(([key]) => !["title", "company", "institution", "startDate", "endDate", "description", "technologies"].includes(key))
            .forEach(([key, value]) => {
              if (value) {
                itemHtml += `
                  <p style="color: ${styles.colors.secondary}; font-size: 10pt; margin-bottom: 2px;"><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>
                `;
              }
            });
        }
        itemHtml += "</div>";
        return itemHtml;
      })
      .join("");
  } else {
    html += `<p style="color: ${styles.colors.text}; font-size: 10pt; line-height: 1.5; margin-bottom: 8px;">${sectionData}</p>`;
  }
  html += "</div>";
  return html;
};

const renderHeaderBlock = (mergedData, styles, config) => {
  const headerType = config.layout?.headerType || "picture-top";
  const hasHeader = headerType === "banner" || headerType === "picture-left" || headerType === "picture-top" || 
                    headerType === "modern-tech" || headerType === "executive-banner" || headerType === "creative-hero" ||
                    headerType === "medical-banner" || headerType === "tech-banner" || headerType === "official-header";
  if (!hasHeader) return "";
  const photoUrl = getPhotoUrl(mergedData.personal.photo);

  // Template-specific header rendering
  if (headerType === "modern-tech") {
    return `
      <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; border-radius: 15px 15px 0 0; padding: 24px; display: flex; align-items: center; gap: 16px; position: relative; overflow: hidden;" class="section-block">
        <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(30px, -30px);"></div>
        ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '80px'}; height: ${styles.photo?.size || '80px'}; border-radius: ${styles.photo?.shape === 'circle' ? '50%' : '12px'}; object-fit: cover; border: ${styles.photo?.border || '3px solid rgba(255,255,255,0.3)'}; box-shadow: 0 8px 24px rgba(0,0,0,0.2);" />` : ''}
        <div style="flex: 1;">
          <h1 style="font-size: 20pt; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px;">${mergedData.personal.name || 'Your Name'}</h1>
          <p style="font-size: 12pt; opacity: 0.9; margin: 0 0 4px; font-weight: 500;">Software Developer & Tech Enthusiast</p>
          <p style="font-size: 10pt; opacity: 0.8; margin: 0;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
        </div>
      </div>
    `;
  }

  if (headerType === "executive-banner") {
    return `
      <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; padding: 20px 24px; text-align: center; position: relative;" class="section-block">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: ${styles.colors.accent};"></div>
        ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '70px'}; height: ${styles.photo?.size || '70px'}; border-radius: ${styles.photo?.shape === 'circle' ? '50%' : '8px'}; object-fit: cover; border: 3px solid rgba(255,255,255,0.9); margin: 0 auto 12px; display: block;" />` : ''}
        <h1 style="font-size: 18pt; font-weight: 600; margin: 0 0 6px; letter-spacing: -0.3px;">${mergedData.personal.name || 'Your Name'}</h1>
        <p style="font-size: 11pt; opacity: 0.9; margin: 0 0 8px; font-weight: 500;">Banking & Finance Professional</p>
        <p style="font-size: 9pt; opacity: 0.8; margin: 0;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
      </div>
    `;
  }

  if (headerType === "creative-hero") {
    return `
      <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; border-radius: 20px 20px 0 0; padding: 28px 24px; position: relative; overflow: hidden;" class="section-block">
        <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
        <div style="display: flex; align-items: center; gap: 20px; position: relative; z-index: 1;">
          ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '90px'}; height: ${styles.photo?.size || '90px'}; border-radius: 15px; object-fit: cover; border: 4px solid rgba(255,255,255,0.9); box-shadow: 0 10px 30px rgba(0,0,0,0.3);" />` : ''}
          <div style="flex: 1;">
            <h1 style="font-size: 22pt; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px;">${mergedData.personal.name || 'Your Name'}</h1>
            <p style="font-size: 13pt; opacity: 0.9; margin: 0 0 6px; font-weight: 500;">Creative Designer & Visual Artist</p>
            <p style="font-size: 10pt; opacity: 0.8; margin: 0;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
          </div>
        </div>
      </div>
    `;
  }

  if (headerType === "medical-banner") {
    return `
      <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; border-radius: 12px 12px 0 0; padding: 24px; position: relative;" class="section-block">
        <div style="position: absolute; top: 10px; right: 10px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
        ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '80px'}; height: ${styles.photo?.size || '80px'}; border-radius: ${styles.photo?.shape === 'circle' ? '50%' : '10px'}; object-fit: cover; border: 3px solid rgba(255,255,255,0.9); margin: 0 auto 12px; display: block;" />` : ''}
        <h1 style="font-size: 18pt; font-weight: 600; margin: 0 0 6px; text-align: center;">${mergedData.personal.name || 'Your Name'}</h1>
        <p style="font-size: 12pt; opacity: 0.9; margin: 0 0 8px; font-weight: 500; text-align: center;">Healthcare Professional</p>
        <p style="font-size: 10pt; opacity: 0.8; margin: 0; text-align: center;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
      </div>
    `;
  }

  if (headerType === "tech-banner") {
    return `
      <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; border-radius: 8px 8px 0 0; padding: 20px 24px; position: relative; font-family: monospace;" class="section-block">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, ${styles.colors.accent} 0%, ${styles.colors.secondary} 100%);"></div>
        <div style="display: flex; align-items: center; gap: 16px;">
          ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '70px'}; height: ${styles.photo?.size || '70px'}; border-radius: 8px; object-fit: cover; border: 2px solid rgba(255,255,255,0.8);" />` : ''}
          <div style="flex: 1;">
            <h1 style="font-size: 20pt; font-weight: 700; margin: 0 0 6px; font-family: monospace;">${mergedData.personal.name || 'Your Name'}</h1>
            <p style="font-size: 12pt; opacity: 0.9; margin: 0 0 4px; font-weight: 500; font-family: monospace;">Data Scientist & ML Engineer</p>
            <p style="font-size: 9pt; opacity: 0.8; margin: 0; font-family: monospace;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
          </div>
        </div>
      </div>
    `;
  }

  if (headerType === "official-header") {
    return `
      <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; padding: 16px 24px; text-align: center; border-bottom: 4px solid ${styles.colors.accent};" class="section-block">
        ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '60px'}; height: ${styles.photo?.size || '60px'}; border-radius: 6px; object-fit: cover; border: 2px solid rgba(255,255,255,0.9); margin: 0 auto 10px; display: block;" />` : ''}
        <h1 style="font-size: 16pt; font-weight: 600; margin: 0 0 4px;">${mergedData.personal.name || 'Your Name'}</h1>
        <p style="font-size: 11pt; opacity: 0.9; margin: 0 0 6px; font-weight: 500;">Government Service Professional</p>
        <p style="font-size: 9pt; opacity: 0.8; margin: 0;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
      </div>
    `;
  }

  // Default header styles
  const baseStyle = `
    background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`};
    color: #ffffff;
    border-radius: 12px 12px 0 0;
    padding: 32px 24px;
    min-height: 120px;
    display: flex;
    align-items: center;
    margin: 0;
  `;
  if (headerType === "banner") {
    return `
      <div style="${baseStyle} text-align: center;" class="section-block">
        ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '56px'}; height: ${styles.photo?.size || '56px'}; border-radius: ${styles.photo?.shape === 'circle' ? '50%' : '8px'}; object-fit: cover; border: ${styles.photo?.border || `2px solid ${styles.colors.accent}`}; box-shadow: ${styles.photo?.shadow || '0 2px 8px rgba(0,0,0,0.10)'}; margin: 0 auto 6px;" />` : ''}
        <h1 style="font-size: 16pt; font-weight: bold; margin: 0 0 6px;">${mergedData.personal.name || 'Your Name'}</h1>
        <p style="font-size: 10pt; opacity: 0.9; margin: 0; letter-spacing: 0.02em;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
      </div>
    `;
  }
  if (headerType === "picture-left") {
    return `
      <div style="${baseStyle} display: flex; align-items: center; gap: 10px;" class="section-block">
        ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '44px'}; height: ${styles.photo?.size || '44px'}; border-radius: ${styles.photo?.shape === 'circle' ? '50%' : '8px'}; object-fit: cover; border: ${styles.photo?.border || `2px solid ${styles.colors.accent}`}; box-shadow: ${styles.photo?.shadow || '0 2px 8px rgba(0,0,0,0.10)'};" />` : ''}
        <div style="flex: 1;">
          <h1 style="font-size: 16pt; font-weight: bold; margin: 0 0 6px;">${mergedData.personal.name || 'Your Name'}</h1>
          <p style="font-size: 10pt; opacity: 0.9; margin: 0; letter-spacing: 0.02em;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
        </div>
      </div>
    `;
  }
  if (headerType === "picture-top") {
    return `
      <div style="${baseStyle} text-align: left; padding: 12px 10px;" class="section-block">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '48px'}; height: ${styles.photo?.size || '48px'}; border-radius: ${styles.photo?.shape === 'circle' ? '50%' : '8px'}; object-fit: cover; border: ${styles.photo?.border || `2px solid ${styles.colors.accent}`}; box-shadow: ${styles.photo?.shadow || '0 2px 8px rgba(0,0,0,0.10)'};" />` : ''}
          <div>
            <h1 style="font-size: 16pt; font-weight: bold; margin: 0 0 6px;">${mergedData.personal.name || 'Your Name'}</h1>
            <p style="font-size: 10pt; opacity: 0.9; margin: 0; letter-spacing: 0.02em;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
          </div>
        </div>
      </div>
    `;
  }
  return "";
};

const renderCoverLetter = (coverLetterData, coverLetterTemplate, styles, resumeData) => {
  const templateConfig = coverLetterTemplates[coverLetterTemplate] || coverLetterTemplates["classic"];
  const coverStyles = {
    ...templateConfig.styles,
    colors: { ...templateConfig.styles.colors, ...(styles?.colors || {}) },
  };
  const layout = { headerStyle: templateConfig.layout?.headerStyle || "compact" };
  const mergedColors = coverStyles.colors;

  const getFieldValue = (field) => {
    const fieldMappings = {
      name: [resumeData.personal?.name, coverLetterData.name, "Your Name"],
      email: [resumeData.personal?.email, coverLetterData.email, "email@example.com"],
      phone: [resumeData.personal?.phone, coverLetterData.phone, "123-456-7890"],
      location: [resumeData.personal?.location, coverLetterData.location, "City, State"],
      jobTitle: [coverLetterData.jobTitle, "[jobTitle]"],
      company: [coverLetterData.company, "[company]"],
      recipient: [coverLetterData.recipient, "Dear Hiring Manager"],
      intro: [coverLetterData.intro, templateConfig.defaultData.intro],
      body: [coverLetterData.body, templateConfig.defaultData.body],
      closing: [coverLetterData.closing, templateConfig.defaultData.closing],
    };
    return (
      fieldMappings[field].find((val) => val !== undefined && val !== "") ||
      fieldMappings[field][fieldMappings[field].length - 1]
    );
  };

  const replacePlaceholders = (text) => {
    return text
      .replace(/\[jobTitle\]/g, getFieldValue("jobTitle"))
      .replace(/\[company\]/g, getFieldValue("company"))
      .replace(/\[previousCompany\]/g, "[previousCompany]")
      .replace(/\[achievement\]/g, "[achievement]")
      .replace(/\[field\]/g, "[field]")
      .replace(/\[skill\]/g, "[skill]")
      .replace(/\[skill1\]/g, "[skill1]")
      .replace(/\[skill2\]/g, "[skill2]")
      .replace(/\[skill3\]/g, "[skill3]")
      .replace(/\[specificTechSkill\]/g, "[specificTechSkill]")
      .replace(/\[specificMarketingSkill\]/g, "[specificMarketingSkill]")
      .replace(/\[specificLeadershipSkill\]/g, "[specificLeadershipSkill]")
      .replace(/\[specificCreativeSkill\]/g, "[specificCreativeSkill]")
      .replace(/\[specificProject\]/g, "[specificProject]")
      .replace(/\[specificCampaign\]/g, "[specificCampaign]")
      .replace(/\[metric\]/g, "[metric]")
      .replace(/\[percentage\]/g, "[percentage]")
      .replace(/\[specificCompanyGoal\]/g, "[specificCompanyGoal]")
      .replace(/\[specificValue\]/g, "[specificValue]")
      .replace(/\[previousRole\]/g, "[previousRole]")
      .replace(/\[years\]/g, "[years]")
      .replace(/\[RecipientName\]/g, "[RecipientName]");
  };

  const renderHeader = () => {
    const headerBaseStyle = `
      background: linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%);
      font-family: ${coverStyles.fontFamily};
      padding: ${layout.headerStyle === "default" ? "12px 20px" : "16px 20px"};
      color: #ffffff;
      border-top-left-radius: ${coverStyles.borderRadius};
      border-top-right-radius: ${coverStyles.borderRadius};
    `;
    const photoUrl = getPhotoUrl(resumeData?.personal?.photo);
    return `
      <header style="${headerBaseStyle} text-align: center;" class="section-block">
        <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.025em; color: #ffffff; font-family: ${coverStyles.fontFamily}; margin: 0;">
          ${getFieldValue("name")}
        </h1>
        <p style="font-size: 14px; margin-top: 2px; opacity: 0.9; color: #ffffff; font-family: ${coverStyles.fontFamily}; margin-bottom: 4px;">
          ${getFieldValue("jobTitle")}
        </p>
        <div style="font-size: 12px; color: #ffffff; font-family: ${coverStyles.fontFamily}; white-space: normal; word-break: break-word;">
          <p style="display: flex; justify-content: center; align-items: center; gap: 6px; margin: 2px 0;">
            ${getFieldValue("email")}
          </p>
          <p style="display: flex; justify-content: center; align-items: center; gap: 6px; margin: 2px 0;">
            ${getFieldValue("phone")}
          </p>
          <p style="display: flex; justify-content: center; align-items: center; gap: 6px; margin: 2px 0;">
            ${getFieldValue("location")}
          </p>
        </div>
      </header>
    `;
  };

  const content = `
    <div class="content-wrapper section-block" style="position: relative; font-family: ${coverStyles.fontFamily}; font-size: ${coverStyles.fontSize}; color: ${mergedColors.text}; background: ${mergedColors.background}; max-width: 694px; margin: 0 auto; border: ${coverStyles.border}; border-radius: ${coverStyles.borderRadius}; box-shadow: ${coverStyles.boxShadow}; padding: 20px; line-height: ${coverStyles.lineHeight}; letter-spacing: ${coverStyles.letterSpacing};">
      ${renderHeader()}
      <div style="padding: 20px; display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <p style="font-size: 14px; font-weight: 500; color: ${mergedColors.accent}; margin: 0;">
            ${replacePlaceholders(getFieldValue("recipient"))}
          </p>
          <p style="font-size: 12px; opacity: 0.8; color: ${mergedColors.secondary}; margin: 0;">
            ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <p style="font-size: 16px; line-height: 26px; color: ${mergedColors.text}; margin: 0;" class="item-block">
            ${replacePlaceholders(getFieldValue("intro"))}
          </p>
          <div style="border-bottom: ${coverStyles.divider}; margin: 12px 0;"></div>
          <p style="font-size: 16px; line-height: 26px; color: ${mergedColors.text}; margin: 0;" class="item-block">
            ${replacePlaceholders(getFieldValue("body"))}
          </p>
          <div style="border-bottom: ${coverStyles.divider}; margin: 12px 0;"></div>
          <p style="font-size: 16px; line-height: 26px; color: ${mergedColors.text}; margin: 0;" class="item-block">
            ${replacePlaceholders(getFieldValue("closing"))}
          </p>
        </div>
        <footer style="margin-top: 32px;">
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
    <div class="page w-full" style="background-color: ${mergedColors.background}; width: 794px; min-height: 1123px; padding: 20px; box-sizing: border-box; page-break-after: always;">
      ${content}
    </div>
  `;
};

const getGoogleFontsLink = (fontFamily) => {
  if (!fontFamily) return '';
  // Remove quotes and get the first font
  const cleanFont = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
  // Map common fonts to Google Fonts names
  const fontMap = {
    Roboto: 'Roboto',
    Poppins: 'Poppins',
    'Times New Roman': 'Times+New+Roman',
    Arial: 'Arial',
    Inter: 'Inter',
    Lato: 'Lato',
    Montserrat: 'Montserrat',
    'Open Sans': 'Open+Sans',
  };
  const googleFont = fontMap[cleanFont] || cleanFont.replace(/ /g, '+');
  // Only add if it's a Google Font
  if (["Roboto","Poppins","Inter","Lato","Montserrat","Open Sans"].includes(cleanFont)) {
    return `<link href="https://fonts.googleapis.com/css2?family=${googleFont}:wght@400;500;700&display=swap" rel="stylesheet">`;
  }
  return '';
};

const generateHTML = (mergedData, template, customColors, isPremium, coverLetterData, coverLetterTemplate, resumeData, preferences) => {
  const config = jobSpecificTemplates[template] || jobSpecificTemplates["government_job"];
  const styles = {
    ...config.styles,
    colors: { ...config.styles.colors, ...(customColors[template] || {}) },
  };

  const useSectionCards = config.layout?.sectionCard || false;
  const showSectionDividers = config.layout?.sectionDividers !== undefined ? config.layout.sectionDividers : true;
  const headerType = config.layout?.headerType || "picture-top";
  const hasHeader = headerType === "banner" || headerType === "picture-left" || headerType === "picture-top";

  const allSections = [
    ...new Set([
      ...config.layout.sectionsOrder,
      ...Object.keys(mergedData).filter((key) => key !== "personal" && !config.layout.sectionsOrder.includes(key)),
    ]),
  ];
  const sidebarSections = config.layout.sidebarSections || [];
  const mainSections = allSections.filter((section) => !sidebarSections.includes(section));
  const sidebarDirection = config.layout.sidebar || "left";
  const cleanedMainSections = hasHeader ? mainSections.filter((s) => s !== "personal") : mainSections;

  const wrapSection = (html, idx, arr) => {
    if (!html) return "";
    let wrapped = `<div style="margin-bottom: 20px;${useSectionCards ? ` background: ${styles.colors.sidebar || '#f9fafb'}; border: 1px solid ${styles.colors.secondary}30; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);` : ''}" class="section-block">${html}</div>`;
    if (showSectionDividers && !useSectionCards && idx < arr.length - 1) {
      wrapped += `<div style="border-bottom: 1px solid ${styles.colors.secondary}30; margin: 12px 0;"></div>`;
    }
    return wrapped;
  };

  const sidebarHTML = sidebarSections
    .map((section, idx) => wrapSection(renderSection(section, mergedData, styles, config, isPremium), idx, sidebarSections))
    .join("");

  const mainHTML = cleanedMainSections
    .map((section, idx) => wrapSection(renderSection(section, mergedData, styles, config, isPremium), idx, cleanedMainSections))
    .join("");

  const googleFontsLink = getGoogleFontsLink(styles.fontFamily);

  // No watermark needed - all users have paid plans
  const watermark = "";

  const resumeContent = `
    <div class="page" style="background-color: ${styles.colors.background}; color: ${styles.colors.text}; font-family: ${styles.fontFamily}, sans-serif; width: 794px; min-height: 1123px; box-sizing: border-box; padding: 12px; margin: 0; display: flex; flex-direction: column; gap: 0;">
      ${renderHeaderBlock(mergedData, styles, config)}
      <div class="content-wrapper" style="flex: 1; display: flex; ${sidebarDirection === "right" && sidebarSections.length > 0 ? 'flex-direction: row-reverse;' : 'flex-direction: row;'} gap: 24px; margin: 0; padding: 0;">
        ${sidebarSections.length > 0 ? `
          <div class="sidebar" style="width: ${config.layout.sidebarWidth || '280px'}; background: ${styles.colors.sidebar || styles.colors.background}; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="padding: 12px;">
              ${sidebarHTML}
            </div>
          </div>
        ` : ''}
        <div class="main-content" style="flex: 1; ${!sidebarSections.length ? 'width: 100%;' : ''} padding: 12px 12px 0 12px;">
          ${mainHTML}
        </div>
      </div>
    </div>
  `;

  const coverLetterContent = coverLetterData && coverLetterTemplate ? renderCoverLetter(coverLetterData, coverLetterTemplate, styles, resumeData) : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        ${googleFontsLink}
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html { font-size: 16px; }
          body { 
            width: 794px; 
            margin: 0; 
            padding: 0; 
            background-color: ${styles.colors.background}; 
            color: ${styles.colors.text}; 
            font-family: ${styles.fontFamily}, sans-serif; 
            font-size: ${styles.fontSize}; 
            line-height: ${styles.lineHeight}; 
            word-break: keep-all;
            hyphens: manual;
            overflow-wrap: normal;
            white-space: normal;
            text-rendering: optimizeLegibility;
            -webkit-font-feature-settings: "liga" 1, "kern" 1;
            font-feature-settings: "liga" 1, "kern" 1;
          }
          .page { 
            width: 794px; 
            min-height: 1123px; 
            position: relative; 
            break-after: page; 
            box-sizing: border-box; 
          }

          .section-block {
            margin: 0;
            break-inside: avoid;
            page-break-inside: avoid;
            word-break: keep-all;
            hyphens: manual;
            overflow-wrap: normal;
          }

          h1 { font-size: 13pt; line-height: 1.2; margin-bottom: 2px; word-break: keep-all; hyphens: manual; }
          h2 { font-size: 14pt; line-height: 1.3; margin-bottom: 8px; word-break: keep-all; hyphens: manual; }
          p { font-size: 11pt; line-height: 1.4; margin-bottom: 4px; word-break: keep-all; hyphens: manual; }
          .header-text { font-size: 8pt; opacity: 0.9; margin: 0; word-break: keep-all; hyphens: manual; }

          .content-wrapper {
            break-before: avoid;
            page-break-before: avoid;
          }

          .item-block { 
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 8px;
            word-break: keep-all;
            hyphens: manual;
            overflow-wrap: normal;
          }
          
          p { 
            orphans: 3; 
            widows: 3; 
            word-break: keep-all;
            hyphens: manual;
            overflow-wrap: normal;
          }

          @media print {
            html { font-size: 16px; }
            body { margin: 0; padding: 0; }
            .page { 
              margin: 0;
              padding: 0;
              break-after: page; 
              min-height: 1123px; 
            }
            .section-block {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${coverLetterContent}
        ${resumeContent}
      </body>
    </html>
  `;
};

export async function POST(req) {
  try {
    const { data, template, customColors, isPremium = false, coverLetter, coverLetterTemplate, preferences = {} } = await req.json();

    if (!data) {
      return NextResponse.json({ error: "Missing data in request body" }, { status: 400 });
    }

    const availableTemplates = Object.keys(jobSpecificTemplates);
    const normalizedTemplate = template.toLowerCase();
    if (!availableTemplates.some((t) => t.toLowerCase() === normalizedTemplate)) {
      return NextResponse.json({ error: `Template "${template}" not found. Available templates: ${availableTemplates.join(", ")}` }, { status: 400 });
    }

    if (coverLetter && !coverLetterTemplate) {
      return NextResponse.json({ error: "Cover letter template is required when cover letter data is provided" }, { status: 400 });
    }

    const config = jobSpecificTemplates[template] || jobSpecificTemplates["government_job"];
    const mergedData = {
      ...config.defaultData,
      ...data,
      personal: { ...config.defaultData?.personal, ...data.personal },
      summary: data.summary || config.defaultData.summary,
      skills: data.skills && data.skills.length > 0 ? data.skills : config.defaultData.skills,
      projects: data?.projects && data.projects.length > 0 ? data.projects : config.defaultData.projects || [],
      experience: data?.experience && data.experience.length > 0 ? data.experience : config.defaultData.experience || [],
      education: data?.education && data.education.length > 0 ? data.education : config.defaultData.education,
      certifications: data.certifications && data.certifications.length > 0 ? data.certifications : config.defaultData.certifications || [],
      languages: data?.languages && data.languages.length > 0 ? data.languages : config.defaultData.languages || [],
      achievements: data.achievements && data.achievements.length > 0 ? data.achievements : config.defaultData.achievements || [],
      references: data?.references && data.references.length > 0 ? data.references : config.defaultData.references || [],
      portfolio: data?.portfolio && data.portfolio.length > 0 ? data.portfolio : config.defaultData.portfolio || [],
    };

    const isProduction = process.env.NODE_ENV === "production";
    const { executablePath, args: chromiumArgs } = await getChromiumLaunchOptions();
    const browser = await puppeteer.launch({
      args: [
        ...chromiumArgs,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--font-render-hinting=none",
        "--disable-gpu",
      ],
      defaultViewport: { width: 794, height: 1123 },
      executablePath: isProduction ? executablePath : undefined,
      headless: "new",
    });

    const page = await browser.newPage();
    const htmlContent = generateHTML(
      mergedData,
      template,
      customColors,
      isPremium,
      coverLetter,
      coverLetterTemplate,
      data,
      preferences
    );
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    // Wait for fonts to load
    await page.evaluate(async () => { if (document.fonts) { await document.fonts.ready; } });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
      preferCSSPageSize: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error.message, error.stack);
    return NextResponse.json({ error: "Failed to generate PDF", details: error.message }, { status: 500 });
  }
}