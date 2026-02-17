import React, { useEffect, useRef, memo } from 'react';
import { parseRichText } from '../lib/richTextRenderer';
import { formatDateWithPreferences } from '../lib/resumeUtils';
import { renderSkillWithProficiency } from '../lib/skillUtils';

// Helper function to render description as bullets if needed
function renderDescriptionBullets(description, isVisualAppeal = true, excludeTexts = [], textStyle = {}) {
  if (!description) return null;

  // Handle both string and array descriptions
  let lines;
  if (Array.isArray(description)) {
    lines = description.map(l => String(l).trim()).filter(Boolean);
  } else {
    // Split by various newline characters and bullet points
    const text = String(description);
    lines = text
      .split(/[\n\r]+|•\s*/) // Split by newlines or bullet points
      .map(l => l.trim())
      .filter(Boolean);
  }

  console.log('VisualAppealRenderer - renderDescriptionBullets:', {
    description,
    isArray: Array.isArray(description),
    lines,
    linesCount: lines.length
  });

  // For Visual Appeal, render as bullets if multiple lines or forced by layout
  let bulletLines = lines.filter(l => /^[-•*]/.test(l));

  // Deduplication logic: If the first line is redundant with any of excludeTexts, skip it
  // This prevents headers like "Achievements" from repeating inside the description
  if (lines.length > 0 && excludeTexts && excludeTexts.length > 0) {
    const firstLine = lines[0].toLowerCase();
    const isRedundant = excludeTexts.some(exclude => {
      if (!exclude) return false;
      const cleanExclude = exclude.trim().toLowerCase();
      // Use exact match or check if first line is just the exclude text (ignoring case)
      return firstLine === cleanExclude ||
        firstLine.includes(cleanExclude) ||
        cleanExclude.includes(firstLine);
    });

    if (isRedundant) {
      console.log('VisualAppealRenderer - Skipping redundant first line:', lines[0]);
      lines.shift();
      // Re-evaluate bulletLines after shifting
      bulletLines = lines.filter(l => /^[-•*]/.test(l));
    }
  }

  if (lines.length === 0) return null;

  // For visual appeal templates, always render as bullets if there are multiple lines
  const bulletStyle = { display: 'list-item', fontSize: textStyle.fontSize || '0.875rem', fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight };
  const paraStyle = { whiteSpace: 'pre-line', fontSize: textStyle.fontSize || '0.875rem', fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight };
  if (lines.length > 1) {
    return (
      <ul className="list-disc ml-5 space-y-1.5" style={{ listStyleType: 'disc', paddingLeft: '1.25rem' }}>
        {lines.map((line, idx) => (
          <li key={idx} className="leading-relaxed" style={bulletStyle} dangerouslySetInnerHTML={{ __html: parseRichText(line.replace(/^[-•*]\s*/, "")) }} />
        ))}
      </ul>
    );
  }

  // Single line - render as paragraph
  return <p className="leading-relaxed" style={paraStyle} dangerouslySetInnerHTML={{ __html: parseRichText(lines[0]) }} />;
}

const VisualAppealRenderer = memo(({ data: rawData, template, isCompact = false, isPremium = false, preferences = {}, customColors: userColors = {} }) => {

  // ─── Apply visibility preferences ───
  const vis = preferences?.visibility || {};
  const data = {
    ...rawData,
    summary: vis.summary === false ? '' : rawData.summary,
    jobTitle: vis.jobTitle === false ? '' : rawData.jobTitle,
    experience: vis.experience === false ? [] : rawData.experience,
    education: vis.education === false ? [] : rawData.education,
    skills: vis.skills === false ? [] : rawData.skills,
    certifications: vis.certifications === false ? [] : rawData.certifications,
    languages: vis.languages === false ? [] : rawData.languages,
    customSections: vis.customSections === false ? [] : rawData.customSections,
    photo: vis.photo === false ? '' : rawData.photo,
  };

  // Format dates using preferences
  const fmtDate = (date) => {
    if (!date) return '';
    if (/present/i.test(date)) return 'Present';
    if (preferences?.dateFormat) {
      const result = formatDateWithPreferences(date, preferences);
      if (result) return result;
    }
    return date;
  };

  // Normalize skills data to ensure they're always properly structured
  const normalizeSkills = (skills) => {
    if (!Array.isArray(skills)) return [];
    return skills
      .map(skill => {
        if (typeof skill === 'string') {
          return { name: skill.trim(), proficiency: null };
        } else if (typeof skill === 'object' && skill !== null) {
          const name = skill.name || skill.skill || '';
          return {
            name: typeof name === 'string' ? name.trim() : '',
            proficiency: skill.proficiency || skill.level || null
          };
        } else {
          return { name: '', proficiency: null };
        }
      })
      .filter(skill => skill.name && skill.name.length > 0); // Only keep skills with valid names
  };

  // Normalize custom sections data to ensure they're always properly structured
  const normalizeCustomSections = (customSections) => {
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
  };

  // Normalize experience data
  const normalizeExperienceData = (experienceData) => {
    if (!experienceData || !Array.isArray(experienceData)) return [];

    return experienceData.map(exp => ({
      ...exp,
      jobTitle: exp.jobTitle || exp.title || exp.position || "Job Title"
    }));
  };

  // Normalize the data to ensure all fields are properly structured
  const normalizedData = {
    ...data,
    skills: normalizeSkills(data.skills),
    customSections: normalizeCustomSections(data.customSections),
    experience: normalizeExperienceData(data.experience)
  };

  // Validate template structure
  if (!template || !template.layout || !template.styles) {
    console.error('VisualAppealRenderer - Invalid template structure:', template);
    return (
      <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Template Error</h2>
        <p>Invalid template structure. Please select a different template.</p>
      </div>
    );
  }

  const { layout } = template;
  // Apply typography preferences to styles (same as ATSResumeRenderer)
  const styles = { ...template.styles };
  const fontPref = preferences?.typography?.fontPair?.fontFamily;
  if (fontPref) styles.fontFamily = fontPref;
  const fontSizePref = preferences?.typography?.fontSize;
  if (fontSizePref === 'small') styles.fontSize = '9pt';
  else if (fontSizePref === 'large') styles.fontSize = '11.5pt';
  const lineHeightPref = preferences?.typography?.lineHeight;
  if (lineHeightPref === 'compact') styles.lineHeight = '1.25';
  else if (lineHeightPref === 'relaxed') styles.lineHeight = '1.6';

  // Show photo by default, only hide if explicitly deleted (empty string)
  const shouldShowPhoto = data.photo !== ""; // Only hide if explicitly deleted
  const photoUrl = shouldShowPhoto ? (data.photo || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE2MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE4MCAxNDBMMjAwIDEyMEwyMjAgMTQwTDIwMCAxNjBMMTgwIDE0MFoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiPkFkZCBQaG90bzwvdGV4dD4KPC9zdmc+") : null;

  // Create typography styles with preference-based scaling
  const baseFontSize = styles.fontSize || "11pt";
  const sectionTitleSize = baseFontSize === '9pt' ? '11pt' : baseFontSize === '11.5pt' ? '14pt' : '13pt';
  const smallSize = baseFontSize === '9pt' ? '8pt' : baseFontSize === '11.5pt' ? '10pt' : '9pt';
  const textStyle = {
    fontFamily: styles.fontFamily || "Inter, sans-serif",
    fontSize: baseFontSize,
    lineHeight: styles.lineHeight || "1.5",
    sectionTitleSize,
    smallSize
  };

  // Merge colors with enhanced visual appeal
  const mergedColors = {
    primary: userColors?.primary || styles?.colors?.primary || "#1e40af",
    secondary: userColors?.secondary || styles?.colors?.secondary || "#475569",
    accent: userColors?.accent || styles?.colors?.accent || "#3b82f6",
    text: userColors?.text || styles?.colors?.text || "#1f2937",
    background: userColors?.background || styles?.colors?.background || "#ffffff",
    sidebarBackground: userColors?.sidebarBackground || styles?.colors?.sidebarBackground || "#f8fafc",
    sidebarText: userColors?.sidebarText || styles?.colors?.sidebarText || "#1f2937",
    accentLight: userColors?.accentLight || styles?.colors?.accentLight || "#dbeafe",
    gradientStart: userColors?.gradientStart || styles?.colors?.gradientStart || "#1e40af",
    gradientEnd: userColors?.gradientEnd || styles?.colors?.gradientEnd || "#3b82f6"
  };

  // Get visual effects
  const visualEffects = styles?.visualEffects || {};
  const visualFeatures = template?.visualFeatures || {};

  // Store first resume reference for non-premium users
  const hasStoredReference = useRef(false);

  useEffect(() => {
    const storeFirstResumeReference = async () => {
      if (isPremium || !data || hasStoredReference.current) return;

      const name = data.name || "";
      const email = data.email || "";
      const phone = data.phone || "";

      const hasRealData = (
        name && name !== "John Doe" &&
        email && email !== "john.doe@example.com" &&
        phone && phone !== "+1 (123) 456-7890"
      );

      if (hasRealData) {
        hasStoredReference.current = true;

        try {
          const userId = localStorage.getItem('userId') || 'anonymous';

          const { storeFirstResumeReference } = await import("../lib/firstResumeReference");
          const response = await storeFirstResumeReference(
            userId,
            { name, email, phone },
            "visual_appeal_template_preview"
          );

          if (response.stored) {
            console.log("First resume reference stored from visual appeal template preview");
          }
        } catch (error) {
          console.error("Error storing first resume reference:", error);
        }
      }
    };

    storeFirstResumeReference();
  }, [data, isPremium]);

  // Enhanced header rendering with visual appeal
  const renderHeader = () => {
    if (layout.headerStyle === "dark-sidebar-executive") {
      return (
        <header className="mb-8">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h1
                className="font-bold mb-3 tracking-wide"
                style={{
                  color: mergedColors.primary,
                  fontSize: textStyle.sectionTitleSize,
                  fontFamily: textStyle.fontFamily,
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                  lineHeight: textStyle.lineHeight,
                  wordBreak: "break-word",
                  overflowWrap: "break-word"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              {data.jobTitle && (
              <p
                className="font-semibold mb-4 tracking-wide"
                style={{
                  color: mergedColors.secondary,
                  fontSize: textStyle.fontSize,
                  fontFamily: textStyle.fontFamily,
                  fontWeight: "600",
                  letterSpacing: "-0.01em",
                  lineHeight: textStyle.lineHeight,
                  wordBreak: "break-word",
                  overflowWrap: "break-word"
                }}
              >
                {data.jobTitle}
              </p>
              )}
            </div>

            {/* Contact Details on Right Side */}
            <div className="flex-shrink-0 text-right" style={{ color: mergedColors.accent, fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>
              {data.email && (
                <div className="mb-2 flex items-center justify-end gap-2">
                  <span className="text-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg></span>
                  <span className="break-all text-xs">{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="mb-2 flex items-center justify-end gap-2">
                  <span className="text-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></span>
                  <span>{data.phone}</span>
                </div>
              )}
              {data.address && (
                <div className="mb-2 flex items-center justify-end gap-2">
                  <span className="text-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></span>
                  <span>{data.address}</span>
                </div>
              )}
              {data.linkedin && (
                <div className="mb-2 flex items-center justify-end gap-2">
                  <span className="text-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></span>
                  <span>{data.linkedin}</span>
                </div>
              )}
            </div>
          </div>
        </header>
      );
    }

    if (layout.headerStyle === "colored-banner-with-photo") {
      return (
        <header
          className="relative mb-8 overflow-hidden rounded-2xl"
          style={{
            background: visualEffects.headerGradient || `linear-gradient(135deg, ${mergedColors.gradientStart} 0%, ${mergedColors.gradientEnd} 100%)`,
            padding: styles?.spacing?.headerPadding || "2.5rem",
            minHeight: layout.headerHeight || "180px",
            ...(visualEffects.creativeShadow && { boxShadow: visualEffects.creativeShadow })
          }}
        >
          <div className="relative z-10 flex items-center gap-10">
            {/* Profile Photo Overlay */}
            {shouldShowPhoto && (
              <div
                className="flex-shrink-0"
                style={{
                  ...(visualEffects.photoBorder && { border: visualEffects.photoBorder }),
                  ...(visualEffects.photoArtistic && { boxShadow: visualEffects.photoArtistic })
                }}
              >
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 text-white">
              <h1
                className="font-bold mb-3 tracking-wide"
                style={{
                  fontSize: textStyle.sectionTitleSize,
                  fontFamily: textStyle.fontFamily,
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                  lineHeight: textStyle.lineHeight
                }}
              >
                {data.name || "Your Name"}
              </h1>
              {data.jobTitle && (
              <p
                className="font-semibold mb-2 tracking-wide"
                style={{
                  fontSize: textStyle.fontSize,
                  fontFamily: textStyle.fontFamily,
                  fontWeight: "600",
                  letterSpacing: "-0.01em",
                  opacity: "0.95",
                  lineHeight: textStyle.lineHeight
                }}
              >
                {data.jobTitle}
              </p>
              )}
            </div>
          </div>
        </header>
      );
    }

    if (layout.headerStyle === "single-column-header-photo") {
      return (
        <header className="mb-8">
          <div className="flex items-center gap-6">
            {/* Profile Photo */}
            {shouldShowPhoto && (
              <div className="flex-shrink-0">
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                  style={{
                    ...(visualEffects.photoShadow && { boxShadow: visualEffects.photoShadow })
                  }}
                />
              </div>
            )}

            <div className="flex-1">
              <h1
                className="font-bold mb-2 tracking-wide"
                style={{
                  color: mergedColors.primary,
                  fontSize: textStyle.sectionTitleSize,
                  fontFamily: textStyle.fontFamily,
                  fontWeight: "700",
                  letterSpacing: "-0.01em",
                  lineHeight: textStyle.lineHeight
                }}
              >
                {data.name || "Your Name"}
              </h1>
              {data.jobTitle && (
              <p
                className="font-semibold mb-3 tracking-wide"
                style={{
                  color: mergedColors.secondary,
                  fontSize: textStyle.fontSize,
                  fontFamily: textStyle.fontFamily,
                  fontWeight: "600",
                  lineHeight: textStyle.lineHeight
                }}
              >
                {data.jobTitle}
              </p>
              )}

              {/* Contact Info */}
              <div className="flex gap-6 text-sm" style={{ color: mergedColors.accent, fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>
                {data.email && <span><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg> {data.email}</span>}
                {data.phone && <span><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg> {data.phone}</span>}
                {data.address && <span><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg> {data.address}</span>}
              </div>
            </div>
          </div>
        </header>
      );
    }

    if (layout.headerStyle === "modern-executive") {
      return (
        <header className="mb-8">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h1
                className="font-bold mb-3 tracking-wide"
                style={{
                  color: mergedColors.primary,
                  fontSize: textStyle.sectionTitleSize,
                  fontFamily: textStyle.fontFamily,
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                  lineHeight: textStyle.lineHeight
                }}
              >
                {data.name || "Your Name"}
              </h1>
              {data.jobTitle && (
              <p
                className="font-semibold mb-4 tracking-wide"
                style={{
                  color: mergedColors.secondary,
                  fontSize: textStyle.fontSize,
                  fontFamily: textStyle.fontFamily,
                  fontWeight: "600",
                  letterSpacing: "-0.01em",
                  lineHeight: textStyle.lineHeight
                }}
              >
                {data.jobTitle}
              </p>
              )}
            </div>

            {/* Contact Details on Right Side */}
            <div className="flex-shrink-0 text-right" style={{ color: mergedColors.accent, fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>
              {data.email && (
                <div className="mb-2 flex items-center justify-end gap-2">
                  <span className="text-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg></span>
                  <span className="break-all text-xs">{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="mb-2 flex items-center justify-end gap-2">
                  <span className="text-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></span>
                  <span>{data.phone}</span>
                </div>
              )}
              {data.address && (
                <div className="mb-2 flex items-center justify-end gap-2">
                  <span className="text-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></span>
                  <span>{data.address}</span>
                </div>
              )}
              {data.linkedin && (
                <div className="mb-2 flex items-center justify-end gap-2">
                  <span className="text-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></span>
                  <span>{data.linkedin}</span>
                </div>
              )}
            </div>
          </div>
        </header>
      );
    }

    if (layout.headerStyle === "creative-header") {
      return (
        <header
          className="relative mb-8 overflow-hidden rounded-2xl"
          style={{
            background: visualEffects.headerGradient || `linear-gradient(135deg, ${mergedColors.gradientStart} 0%, ${mergedColors.gradientEnd} 100%)`,
            padding: styles?.spacing?.headerPadding || "2rem",
            ...(visualEffects.creativeShadow && { boxShadow: visualEffects.creativeShadow })
          }}
        >
          <div className="relative z-10 flex items-center gap-8">
            {/* Profile Photo Overlay */}
            {shouldShowPhoto && (
              <div
                className="flex-shrink-0"
                style={{
                  ...(visualEffects.photoBorder && { border: visualEffects.photoBorder }),
                  ...(visualEffects.photoArtistic && { boxShadow: visualEffects.photoArtistic })
                }}
              >
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 text-white">
              <h1
                className="font-bold mb-2 tracking-wide"
                style={{
                  fontSize: textStyle.sectionTitleSize,
                  fontFamily: textStyle.fontFamily,
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                  lineHeight: textStyle.lineHeight
                }}
              >
                {data.name || "Your Name"}
              </h1>
              {data.jobTitle && (
              <p
                className="font-semibold mb-4 tracking-wide"
                style={{
                  fontSize: textStyle.fontSize,
                  fontFamily: textStyle.fontFamily,
                  fontWeight: "600",
                  letterSpacing: "-0.01em",
                  lineHeight: textStyle.lineHeight
                }}
              >
                {data.jobTitle}
              </p>
              )}
            </div>
          </div>
        </header>
      );
    }

    if (layout.headerStyle === "consultant-sophisticated") {
      return (
        <header className="mb-8">
          <div className="text-center">
            <h1
              className="font-bold mb-3 tracking-wide"
              style={{
                color: mergedColors.primary,
                fontSize: textStyle.sectionTitleSize,
                fontFamily: textStyle.fontFamily,
                fontWeight: "700",
                letterSpacing: "0.02em",
                lineHeight: textStyle.lineHeight
              }}
            >
              {data.name || "Your Name"}
            </h1>
            {data.jobTitle && (
            <p
              className="font-semibold mb-4 tracking-wide"
              style={{
                color: mergedColors.secondary,
                fontSize: textStyle.fontSize,
                fontFamily: textStyle.fontFamily,
                fontWeight: "600",
                lineHeight: textStyle.lineHeight
              }}
            >
              {data.jobTitle}
            </p>
            )}
          </div>
        </header>
      );
    }

    // Default header
    return (
      <header className="mb-8">
        <div className="text-center">
          <h1
            className="font-bold mb-3 tracking-wide"
            style={{
              color: mergedColors.primary,
              fontSize: textStyle.sectionTitleSize,
              fontFamily: textStyle.fontFamily,
              fontWeight: "700",
              letterSpacing: "0.02em",
              lineHeight: textStyle.lineHeight
            }}
          >
            {data.name || "Your Name"}
          </h1>
          {data.jobTitle && (
          <p
            className="font-semibold mb-4 tracking-wide"
            style={{
              color: mergedColors.secondary,
              fontSize: textStyle.fontSize,
              fontFamily: textStyle.fontFamily,
              fontWeight: "600",
              lineHeight: textStyle.lineHeight
            }}
          >
            {data.jobTitle}
          </p>
          )}
        </div>
      </header>
    );
  };

  // Enhanced section header with visual appeal
  const renderSectionHeader = (title, sectionType = 'default', isInSidebar = false) => {
    const textColor = isInSidebar ? mergedColors.sidebarText : mergedColors.primary;
    const accentColor = isInSidebar ? mergedColors.accent : mergedColors.accent;

    return (
      <h2
        className="font-bold mb-4  tracking-wide relative"
        style={{
          color: textColor,
          fontSize: textStyle.sectionTitleSize,
          fontFamily: textStyle.fontFamily,
          fontWeight: "700",
          letterSpacing: "0.05em",
          lineHeight: textStyle.lineHeight
        }}
      >
        {title}
        <div
          className="absolute bottom-0 left-0 h-1 rounded-full"
          style={{
            width: "60px",
            background: `linear-gradient(90deg, ${accentColor} 0%, ${mergedColors.gradientEnd} 100%)`,
            ...(visualEffects.sectionDivider && { borderBottom: visualEffects.sectionDivider })
          }}
        />
      </h2>
    );
  };

  // Enhanced profile photo rendering
  const renderProfilePhoto = () => {

    const photoStyle = layout.photoStyle || 'circular-modern';

    const getPhotoClasses = () => {
      switch (photoStyle) {
        case 'circular-modern':
          return 'w-40 h-40 rounded-full object-cover mx-auto mb-4';
        case 'circular-creative':
          return 'w-36 h-36 rounded-full object-cover mx-auto mb-4';
        case 'rounded-tech':
          return 'w-36 h-36 rounded-2xl object-cover mx-auto mb-4';
        case 'elegant-circle':
          return 'w-44 h-44 rounded-full object-cover mx-auto mb-6';
        case 'minimal-circle':
          return 'w-32 h-32 rounded-full object-cover mx-auto mb-4';
        default:
          return 'w-40 h-40 rounded-full object-cover mx-auto mb-4';
      }
    };

    if (!shouldShowPhoto) {
      return null; // Don't render anything if photo was explicitly deleted
    }

    return (
      <div
        className="flex justify-center"
        style={{
          ...(visualEffects.photoShadow && { boxShadow: visualEffects.photoShadow }),
          ...(visualEffects.photoGlow && { boxShadow: visualEffects.photoGlow }),
          ...(visualEffects.photoFrame && { border: visualEffects.photoFrame })
        }}
      >
        <img
          src={photoUrl}
          alt="Profile"
          className={getPhotoClasses()}
        />
      </div>
    );
  };

  // Enhanced sidebar rendering
  const renderSidebar = () => {
    if (layout.columns !== 2 || !layout.sidebarSections?.length) return null;

    // Different sidebar styles based on layout type
    const getSidebarStyle = () => {
      const baseStyle = {
        width: layout.sidebarWidth || "35%",
        padding: styles?.spacing?.contentPadding || "1.5rem",
      };

      switch (layout.layoutType) {
        case "dark-sidebar-with-timeline":
          return {
            ...baseStyle,
            background: mergedColors.sidebarBackground,
            color: mergedColors.sidebarText,
            borderRadius: "0 1rem 1rem 0",
            ...(visualEffects.elegantShadow && { boxShadow: visualEffects.elegantShadow })
          };
        case "clean-sidebar-photo":
          return {
            ...baseStyle,
            background: mergedColors.sidebarBackground,
            color: mergedColors.sidebarText,
            borderRight: `2px solid ${mergedColors.accentLight}`,
            borderRadius: "0 0.5rem 0.5rem 0"
          };
        case "timeline-with-sidebar":
          return {
            ...baseStyle,
            background: mergedColors.sidebarBackground,
            color: mergedColors.sidebarText,
            borderRight: `3px solid ${mergedColors.accent}`,
            ...(visualEffects.creativeShadow && { boxShadow: visualEffects.creativeShadow })
          };
        case "luxury-sidebar-with-awards":
          return {
            ...baseStyle,
            background: mergedColors.sidebarBackground,
            color: mergedColors.sidebarText,
            borderRight: `4px solid ${mergedColors.fashionGold || mergedColors.accent}`,
            borderRadius: "0 1rem 1rem 0",
            ...(visualEffects.fashionShadow && { boxShadow: visualEffects.fashionShadow })
          };
        case "card-based-professional":
          return {
            ...baseStyle,
            background: mergedColors.sidebarBackground,
            color: mergedColors.sidebarText,
            borderRight: `2px solid ${mergedColors.accent}`,
            borderRadius: "0 0.5rem 0.5rem 0",
            ...(visualEffects.cardShadow && { boxShadow: visualEffects.cardShadow })
          };
        default:
          return {
            ...baseStyle,
            background: visualEffects.sidebarGradient || mergedColors.sidebarBackground,
            color: mergedColors.sidebarText,
            borderRadius: visualFeatures.modernLayout ? "0 1rem 1rem 0" : "0",
            ...(visualEffects.elegantShadow && { boxShadow: visualEffects.elegantShadow })
          };
      }
    };

    return (
      <div
        className="flex-shrink-0 pr-8"
        style={getSidebarStyle()}
      >
        {/* Profile Photo */}
        {layout.showProfilePicture && layout.headerStyle !== "colored-banner-with-photo" && renderProfilePhoto()}

        {/* Name and Job Title for Two-Column Layouts */}
        {layout.columns === 2 && layout.headerStyle !== "colored-banner-with-photo" && (
          <div className="mb-6 text-center">
            <h1
              className="font-bold mb-2 tracking-wide"
              style={{
                color: mergedColors.sidebarText,
                fontSize: textStyle.fontSize,
                fontFamily: textStyle.fontFamily,
                fontWeight: "700",
                letterSpacing: "0.01em",
                lineHeight: textStyle.lineHeight,
                wordBreak: "break-word",
                overflowWrap: "break-word",
                hyphens: "auto"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            {data.jobTitle && (
            <p
              className="font-semibold tracking-wide"
              style={{
                color: mergedColors.sidebarText === "#ffffff" ? "#e2e8f0" : mergedColors.secondary,
                fontSize: textStyle.smallSize,
                fontFamily: textStyle.fontFamily,
                fontWeight: "600",
                lineHeight: textStyle.lineHeight,
                wordBreak: "break-word",
                overflowWrap: "break-word"
              }}
            >
              {data.jobTitle}
            </p>
            )}
          </div>
        )}

        {/* Contact Information */}
        {layout.sidebarSections.includes('personal') && (data.email || data.phone || data.address || data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
          <div className="mb-6">
            {renderSectionHeader("CONTACT", 'default', true)}
            <div className="space-y-3">
              {data.email && (
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg></span>
                  <span className="flex-1 min-w-0 text-xs leading-relaxed" style={{
                    color: mergedColors.sidebarText,
                    wordBreak: "break-word",
                    overflowWrap: "break-word"
                  }}>{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></span>
                  <span className="flex-1 min-w-0 text-xs" style={{ color: mergedColors.sidebarText }}>{data.phone}</span>
                </div>
              )}
              {data.address && (
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></span>
                  <span className="flex-1 min-w-0 text-xs leading-relaxed" style={{
                    color: mergedColors.sidebarText,
                    wordBreak: "break-word",
                    overflowWrap: "break-word"
                  }}>{data.address}</span>
                </div>
              )}
              {data.dateOfBirth && (
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" /></svg></span>
                  <span className="flex-1 min-w-0 text-xs" style={{ color: mergedColors.sidebarText }}>DOB: {data.dateOfBirth}</span>
                </div>
              )}
              {data.gender && (
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg></span>
                  <span className="flex-1 min-w-0 text-xs" style={{ color: mergedColors.sidebarText }}>{data.gender}</span>
                </div>
              )}
              {data.maritalStatus && (
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5l-.99-1.51A2.5 2.5 0 0 0 11.01 8H9.46a1.5 1.5 0 0 0-1.42 1.37L5.5 17H8v5h2v-6h2.5l1.5 6h2l1.5-6H20v6h2z" /></svg></span>
                  <span className="flex-1 min-w-0 text-xs" style={{ color: mergedColors.sidebarText }}>{data.maritalStatus}</span>
                </div>
              )}
              {data.linkedin && (
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></span>
                  <span className="flex-1 min-w-0 text-xs leading-relaxed" style={{
                    color: mergedColors.sidebarText,
                    wordBreak: "break-word",
                    overflowWrap: "break-word"
                  }}>{data.linkedin}</span>
                </div>
              )}
              {data.portfolio && (
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg></span>
                  <span className="flex-1 min-w-0 text-xs leading-relaxed" style={{
                    color: mergedColors.sidebarText,
                    wordBreak: "break-word",
                    overflowWrap: "break-word"
                  }}>{data.portfolio}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {layout.sidebarSections.includes('skills') && data.skills?.length > 0 && (
          <div className="mb-6">
            {renderSectionHeader("SKILLS", 'default', true)}
            <div className="space-y-2">
              {normalizedData.skills?.map((skill, index) => {
                // Since skills are already normalized, we can safely access the name property
                const skillName = skill?.name || '';

                // Skip rendering if skillName is empty or invalid
                if (!skillName || typeof skillName !== 'string') {
                  return null;
                }

                const skillText = renderSkillWithProficiency(skill, preferences?.skills?.showProficiency === true);
                return (
                  <div key={index} className="relative">
                    <div
                      className="px-2 py-1.5 rounded-lg font-medium w-full"
                      style={{
                        background: mergedColors.accentLight,
                        color: mergedColors.primary,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        fontSize: textStyle.smallSize,
                        fontFamily: textStyle.fontFamily,
                        lineHeight: textStyle.lineHeight
                      }}
                    >
                      {skillText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        {layout.sidebarSections.includes('certifications') && data.certifications?.length > 0 && (
          <div className="mb-6">
            {renderSectionHeader("CERTIFICATIONS", 'default', true)}
            <div className="space-y-2.5">
              {data.certifications.map((cert, index) => (
                <div key={index} className="relative">
                  <div className="text-xs" style={{ color: mergedColors.sidebarText }}>
                    <div className="font-semibold leading-tight mb-0.5" style={{
                      wordBreak: "break-word",
                      overflowWrap: "break-word"
                    }}>{cert.name}</div>
                    {cert.issuer && <div className="text-[10px] opacity-80 leading-tight">{cert.issuer}</div>}
                    {cert.date && <div className="text-[10px] opacity-70 leading-tight">{fmtDate(cert.date)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {layout.sidebarSections.includes('languages') && data.languages?.length > 0 && (
          <div className="mb-6">
            {renderSectionHeader("LANGUAGES", 'default', true)}
            <div className="space-y-1.5">
              {data.languages.map((lang, index) => (
                <div key={index} className="flex justify-between items-center gap-2">
                  <span className="text-xs font-medium flex-1 min-w-0" style={{
                    color: mergedColors.sidebarText,
                    wordBreak: "break-word",
                    overflowWrap: "break-word"
                  }}>
                    {lang.language}
                  </span>
                  <span className="text-[10px] opacity-80 flex-shrink-0" style={{ color: mergedColors.sidebarText }}>
                    {lang.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced main content rendering
  const renderMainContent = () => {
    const mainSections = layout.mainSections || [];
    console.log('VisualAppealRenderer - mainSections:', mainSections);
    console.log('VisualAppealRenderer - Original customSections:', data.customSections);
    console.log('VisualAppealRenderer - Normalized customSections:', normalizedData.customSections);

    return (
      <div className="flex-1" style={textStyle}>
        {mainSections.map((section, index) => {
          switch (section) {
            case 'summary':
              return data.summary ? (
                <div key={index} className="mb-6">
                  {renderSectionHeader("PROFESSIONAL SUMMARY")}
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: mergedColors.accentLight,
                      ...(visualEffects.cardShadow && { boxShadow: visualEffects.cardShadow })
                    }}
                  >
                    <div
                      className="leading-relaxed"
                      style={{ whiteSpace: 'pre-line', fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}
                      dangerouslySetInnerHTML={{ __html: parseRichText(data.summary) }}
                    />
                  </div>
                </div>
              ) : null;

            case 'experience':
              return normalizedData.experience?.length > 0 ? (
                <div key={index} className="mb-6">
                  {renderSectionHeader("WORK EXPERIENCE")}
                  <div className="space-y-6">
                    {normalizedData.experience?.map((exp, expIndex) => (
                      <div
                        key={expIndex}
                        className="relative"
                        style={{
                          ...(visualEffects.cardShadow && { boxShadow: visualEffects.cardShadow }),
                          padding: layout.timelineStyle ? "0" : "1.5rem",
                          borderRadius: layout.timelineStyle ? "0" : "0.75rem",
                          background: layout.timelineStyle ? "transparent" : "#ffffff",
                          border: "none",
                          ...(layout.timelineStyle && {
                            borderLeft: `3px solid ${mergedColors.accent}`,
                            paddingLeft: "1.5rem",
                            marginLeft: "1rem"
                          })
                        }}
                      >
                        {layout.timelineStyle && (
                          <div
                            className="absolute -left-2 top-0 w-4 h-4 rounded-full border-2"
                            style={{
                              background: mergedColors.accent,
                              borderColor: mergedColors.accent,
                              left: "-0.5rem"
                            }}
                          />
                        )}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3
                              className="font-bold"
                              style={{ color: mergedColors.primary, fontSize: textStyle.sectionTitleSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}
                            >
                              {exp.jobTitle}
                            </h3>
                            <div
                              className="font-semibold"
                              style={{ color: mergedColors.secondary, fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}
                            >
                              {exp.company}
                            </div>
                            {exp.location && (
                              <div className="opacity-80" style={{ fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>{exp.location}</div>
                            )}
                          </div>
                          <div className="text-right font-medium" style={{ fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>
                            {exp.startDate && exp.endDate && (
                              <div>{fmtDate(exp.startDate)} - {fmtDate(exp.endDate)}</div>
                            )}
                          </div>
                        </div>

                        {exp.description && (
                          <div className="mt-3">
                            {renderDescriptionBullets(exp.description, true, [], textStyle)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;

            case 'education':
              return data.education?.length > 0 ? (
                <div key={index} className="mb-6">
                  {renderSectionHeader("EDUCATION")}
                  <div className="space-y-4">
                    {data.education?.map((edu, eduIndex) => (
                      <div
                        key={eduIndex}
                        style={{
                          ...(visualEffects.cardShadow && { boxShadow: visualEffects.cardShadow }),
                          padding: "1.25rem",
                          borderRadius: "0.75rem",
                          background: "#ffffff",
                          border: "none"
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3
                              className="font-bold"
                              style={{ color: mergedColors.primary, fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}
                            >
                              {edu.degree}
                            </h3>
                            <div
                              className="font-semibold"
                              style={{ color: mergedColors.secondary, fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}
                            >
                              {edu.school}
                            </div>
                            {edu.location && (
                              <div className="opacity-80" style={{ fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>{edu.location}</div>
                            )}
                          </div>
                          <div className="text-right font-medium" style={{ fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>
                            {edu.startDate && edu.endDate && (
                              <div>{fmtDate(edu.startDate)} - {fmtDate(edu.endDate)}</div>
                            )}
                          </div>
                        </div>
                        {edu.gpa && preferences?.education?.showGPA !== false && (
                          <div style={{ fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>
                            <span className="font-medium">GPA: </span>
                            <span>{edu.gpa}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;

            case 'skills':
              return data.skills?.length > 0 ? (
                <div key={index} className="mb-6">
                  {renderSectionHeader("SKILLS")}
                  <div
                    className="grid grid-cols-3 gap-3"
                    style={{
                      ...(visualEffects.cardShadow && { boxShadow: visualEffects.cardShadow }),
                      padding: "1.25rem",
                      borderRadius: "0.75rem",
                      background: "#ffffff",
                      border: "none"
                    }}
                  >
                    {normalizedData.skills?.map((skill, skillIndex) => {
                      const skillName = skill?.name || '';
                      if (!skillName || typeof skillName !== 'string') return null;
                      const skillText = renderSkillWithProficiency(skill, preferences?.skills?.showProficiency === true);

                      return (
                        <div
                          key={skillIndex}
                          className="px-3 py-2 rounded-lg text-center font-medium"
                          style={{
                            background: mergedColors.accentLight,
                            color: mergedColors.primary,
                            fontSize: textStyle.fontSize,
                            fontFamily: textStyle.fontFamily,
                            lineHeight: textStyle.lineHeight
                          }}
                        >
                          {skillText}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null;

            case 'projects':
              return data.projects?.length > 0 ? (
                <div key={index} className="mb-6">
                  {renderSectionHeader("PROJECTS")}
                  <div className="space-y-4">
                    {data.projects?.map((project, projectIndex) => (
                      <div
                        key={projectIndex}
                        style={{
                          ...(visualEffects.cardShadow && { boxShadow: visualEffects.cardShadow }),
                          padding: "1.25rem",
                          borderRadius: "0.75rem",
                          background: "#ffffff",
                          border: "none"
                        }}
                      >
                        <h3
                          className="font-bold mb-2"
                          style={{ color: mergedColors.primary, fontSize: textStyle.sectionTitleSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}
                        >
                          {project.name || project.title}
                        </h3>
                        {project.description && (
                          <div className="mb-2">
                            {renderDescriptionBullets(project.description, true, [], textStyle)}
                          </div>
                        )}
                        {project.technologies && (
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(project.technologies)
                              ? project.technologies
                              : typeof project.technologies === 'string'
                                ? project.technologies.split(',')
                                : []
                            ).map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-2 py-1 rounded font-medium"
                                style={{
                                  background: mergedColors.accentLight,
                                  color: mergedColors.primary,
                                  fontSize: textStyle.smallSize,
                                  fontFamily: textStyle.fontFamily,
                                  lineHeight: textStyle.lineHeight
                                }}
                              >
                                {typeof tech === 'string' ? tech.trim() : tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                            style={{ fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;

            case 'achievements':
              return data.achievements?.length > 0 ? (
                <div key={index} className="mb-6">
                  {renderSectionHeader("ACHIEVEMENTS")}
                  <div
                    style={{
                      ...(visualEffects.cardShadow && { boxShadow: visualEffects.cardShadow }),
                      padding: "1.25rem",
                      borderRadius: "0.75rem",
                      background: "#ffffff",
                      border: "none"
                    }}
                  >
                    <ul className="space-y-2">
                      {data.achievements?.map((achievement, achievementIndex) => (
                        <li key={achievementIndex} className="flex items-start">
                          <span className="text-yellow-500 mr-2 mt-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V7C19 8.1 18.1 9 17 9H15V10.5C15 11.33 15.67 12 16.5 12S18 11.33 18 10.5V9H20C20.55 9 21 9.45 21 10S20.55 11 20 11H18V12C18 13.1 17.1 14 16 14H8C6.9 14 6 13.1 6 12V11H4C3.45 11 3 10.55 3 10S3.45 9 4 9H6V10.5C6 11.33 6.67 12 7.5 12S9 11.33 9 10.5V9H7C5.9 9 5 8.1 5 7V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7Z" /></svg></span>
                          <span style={{ fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null;

            case 'languages':
              return data.languages?.length > 0 ? (
                <div key={index} className="mb-6">
                  {renderSectionHeader("LANGUAGES")}
                  <div
                    style={{
                      ...(visualEffects.cardShadow && { boxShadow: visualEffects.cardShadow }),
                      padding: "1.25rem",
                      borderRadius: "0.75rem",
                      background: "#ffffff",
                      border: "none"
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {data.languages?.map((lang, langIndex) => (
                        <div key={langIndex} className="flex justify-between items-center" style={{ fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>
                          <span className="font-medium">{lang.language}</span>
                          <span className="opacity-80" style={{ fontSize: textStyle.smallSize }}>{lang.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null;

            case 'customSections':
              if (!normalizedData.customSections || normalizedData.customSections.length === 0) return null;

              // Group custom sections by type (Project, Volunteer, Reference, Hobby, etc.)
              const groupedSections = normalizedData.customSections.reduce((acc, current) => {
                const type = (current.type || "project").toLowerCase();
                if (!acc[type]) acc[type] = [];
                acc[type].push(current);
                return acc;
              }, {});

              return (
                <div key={index} className="mb-6">
                  {Object.entries(groupedSections).map(([type, items], groupIdx) => {
                    // Create a generic pluralized header for the group
                    const sectionTitle = (type.charAt(0).toUpperCase() + type.slice(1) + (type.endsWith('s') ? '' : 's'));

                    return (
                      <div key={groupIdx} className="mb-6 last:mb-0">
                        {renderSectionHeader(sectionTitle)}

                        {items.map((item, itemIdx) => {
                          const itemTitle = item.name || item.title || "";
                          return (
                            <div key={itemIdx} className="mb-4 last:mb-0">
                              <div
                                style={{
                                  ...(visualEffects.cardShadow && { boxShadow: visualEffects.cardShadow }),
                                  padding: "1.25rem",
                                  borderRadius: "0.75rem",
                                  background: "#ffffff",
                                  border: "none"
                                }}
                              >
                                {itemTitle && (
                                  <h3 className="font-bold mb-2" style={{ color: mergedColors.primary, fontSize: textStyle.sectionTitleSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>
                                    {itemTitle}
                                  </h3>
                                )}

                                {item.description && (
                                  <div className="mb-2 leading-relaxed" style={{ color: mergedColors.text, fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>
                                    {renderDescriptionBullets(item.description, true, [sectionTitle, itemTitle], textStyle)}
                                  </div>
                                )}

                                {item.date && (
                                  <p className="opacity-70 mt-1" style={{ fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>{fmtDate(item.date)}</p>
                                )}
                                {item.company && (
                                  <p className="font-semibold mt-1" style={{ color: mergedColors.secondary, fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>{item.company}</p>
                                )}
                                {item.position && (
                                  <p className="mt-0.5" style={{ fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>{item.position}</p>
                                )}
                                {item.location && (
                                  <p className="opacity-70 mt-0.5" style={{ fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>{item.location}</p>
                                )}
                                {item.name && type === 'reference' && (
                                  <div className="mt-2 p-3 bg-slate-50 rounded-lg border-l-4" style={{ borderColor: mergedColors.accent }}>
                                    <p className="font-semibold" style={{ fontSize: textStyle.fontSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>{item.name}</p>
                                    {item.email && <p className="text-slate-600 mt-1" style={{ fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>{item.email}</p>}
                                    {item.phone && <p className="text-slate-600 mt-0.5" style={{ fontSize: textStyle.smallSize, fontFamily: textStyle.fontFamily, lineHeight: textStyle.lineHeight }}>{item.phone}</p>}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    );
  };


  // Render layout
  const renderLayout = () => {
    if (layout.columns === 2) {
      // For two-column layouts, check if header should be rendered
      if (layout.headerStyle === "colored-banner-with-photo") {
        return (
          <div>
            {renderHeader()}
            <div className="flex gap-8 min-h-screen">
              {renderSidebar()}
              {renderMainContent()}
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex gap-8 min-h-screen">
            {renderSidebar()}
            {renderMainContent()}
          </div>
        );
      }
    } else {
      // For single-column layouts
      if (layout.headerStyle === "single-column-header-photo") {
        return (
          <div className="max-w-4xl mx-auto">
            {renderHeader()}
            {renderMainContent()}
          </div>
        );
      } else {
        return (
          <div className="max-w-4xl mx-auto">
            {renderMainContent()}
          </div>
        );
      }
    }
  };

  return (
    <div
      className="visual-appeal-resume shadow-2xl rounded-2xl overflow-hidden min-h-screen relative"
      style={{
        ...textStyle,
        backgroundColor: mergedColors.background,
        fontFamily: styles.fontFamily || "Inter, sans-serif"
      }}
    >
      {/* Watermark for non-premium users */}
      {!isPremium && (
        <div
          className="watermark"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-45deg)",
            fontSize: "2.5rem",
            color: "rgba(0, 0, 0, 0.08)",
            fontFamily: styles.fontFamily,
            pointerEvents: "none",
            zIndex: 1000,
            textAlign: "center",
            whiteSpace: "nowrap",
            fontWeight: "600",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
          }}
        >
          Generated by ExpertResume
        </div>
      )}

      <div className="p-6">
        {renderLayout()}
      </div>
    </div>
  );
});

export default VisualAppealRenderer;
