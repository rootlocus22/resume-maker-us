import React, { useEffect, useRef, memo } from 'react';
import { parseRichText } from '../lib/richTextRenderer';
import { renderSkillName, renderSkillWithProficiency } from "../lib/skillUtils";
import { formatDateWithPreferences } from '../lib/resumeUtils';

// Add a helper to render description as bullets if needed
function renderDescriptionBullets(description, forceATS = true, excludeTexts = []) {
  if (!description) return null;

  // Handle both string and array descriptions
  let lines;
  if (Array.isArray(description)) {
    // If it's already an array, use it directly after trimming
    lines = description.map(l => String(l).trim()).filter(Boolean);
  } else {
    // If it's a string, split into lines, trim, and filter empty
    lines = String(description).split('\n').map(l => l.trim()).filter(Boolean);
  }

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

  const shouldRenderAsBullets = forceATS ? lines.length > 1 : bulletLines.length >= Math.max(2, lines.length / 2);

  if (shouldRenderAsBullets) {
    return (
      <ul className="list-disc ml-5 space-y-1">
        {lines.map((line, idx) => (
          <li key={idx} dangerouslySetInnerHTML={{ __html: parseRichText(line.replace(/^[-•*]\s*/, "")) }} />
        ))}
      </ul>
    );
  }
  // Otherwise, render as paragraphs inside a div
  return <div>{lines.map((line, idx) => <p key={idx} dangerouslySetInnerHTML={{ __html: parseRichText(line) }} />)}</div>;
}

const ATSResumeRenderer = memo(({ data: rawData, template, isCompact = false, isPremium = false, preferences = {} }) => {

  // Check if template is a string (template name) and needs to be looked up
  if (typeof template === 'string') {
    console.error('ATSResumeRenderer - Template is a string, expected object:', template);
    return (
      <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Template Error</h2>
        <p>Template is a string instead of an object. This indicates a configuration issue.</p>
        <p className="text-sm mt-2">Template string: {template}</p>
        <p className="text-sm">Template type: {typeof template}</p>
      </div>
    );
  }

  // Validate template structure
  if (!template || !template.layout || !template.styles) {
    console.error('ATSResumeRenderer - Invalid template structure:', template);
    return (
      <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Template Error</h2>
        <p>Invalid template structure. Please select a different template.</p>
        <p className="text-sm mt-2">Template: {template ? typeof template : 'undefined'}</p>
        <p className="text-sm">Template keys: {template ? Object.keys(template).join(', ') : 'none'}</p>
        <pre className="text-xs mt-2 bg-white p-2 rounded border">
          {JSON.stringify(template, null, 2)}
        </pre>
      </div>
    );
  }

  // Additional validation to ensure we have the correct template
  if (template.name && template.layout?.headerStyle) {
    // Debug logging disabled to prevent console flooding
    // console.log('ATSResumeRenderer - Rendering template:', {
    //   name: template.name,
    //   headerStyle: template.layout.headerStyle,
    //   expectedHeaderStyle: template.name.includes('Project Manager') ? 'project-manager' :
    //                        template.name.includes('Data Scientist') ? 'data-scientist' : 'unknown'
    // });
  }

  const { layout } = template;
  const styles = { ...template.styles };

  // ─── Apply preferences ───
  const vis = preferences?.visibility || {};

  // Filter data by visibility preferences
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

  // Apply typography preferences
  const fontPref = preferences?.typography?.fontPair?.fontFamily;
  if (fontPref) styles.fontFamily = fontPref;

  const fontSizePref = preferences?.typography?.fontSize;
  if (fontSizePref === 'small') styles.fontSize = '9pt';
  else if (fontSizePref === 'large') styles.fontSize = '11.5pt';

  const lineHeightPref = preferences?.typography?.lineHeight;
  if (lineHeightPref === 'compact') styles.lineHeight = '1.25';
  else if (lineHeightPref === 'relaxed') styles.lineHeight = '1.6';

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

  // Normalize experience data to ensure jobTitle is always present
  const normalizeExperienceData = (experienceData) => {
    if (!experienceData || !Array.isArray(experienceData)) return [];

    return experienceData.map(exp => ({
      ...exp,
      jobTitle: exp.jobTitle || exp.title || exp.position || "Job Title"
    }));
  };

  // Normalize the data
  const normalizedData = {
    ...data,
    experience: normalizeExperienceData(data.experience)
  };

  // Validate template styles
  if (!styles.fontFamily || !styles.fontSize) {
    console.error('ATSResumeRenderer - Missing typography styles:', styles);
    return (
      <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Typography Error</h2>
        <p>Template is missing required typography styles.</p>
        <p className="text-sm mt-2">Font Family: {styles.fontFamily || 'Missing'}</p>
        <p className="text-sm">Font Size: {styles.fontSize || 'Missing'}</p>
        <p className="text-sm">Line Height: {styles.lineHeight || 'Missing'}</p>
      </div>
    );
  }

  // Create a consistent typography style object for all text elements
  const textStyle = {
    fontFamily: styles.fontFamily || "Arial, sans-serif",
    fontSize: styles.fontSize || "11pt",
    lineHeight: styles.lineHeight || "1.4"
  };

  // Create header-specific typography that overrides template sizes
  const headerTextStyle = {
    fontFamily: styles.fontFamily || "Arial, sans-serif",
    lineHeight: styles.lineHeight || "1.4"
    // Note: fontSize is NOT included here - we'll set it explicitly for each header element
  };

  // Merge colors with defaults - ensuring black and white theme
  const mergedColors = {
    primary: styles?.colors?.primary || "#000000",
    secondary: styles?.colors?.secondary || "#333333",
    accent: styles?.colors?.accent || "#666666",
    text: styles?.colors?.text || "#000000",
    background: styles?.colors?.background || "#ffffff",
    sidebarBackground: styles?.colors?.sidebarBackground || "#f8fafc"
  };

  // Create a base style object that ensures template styles are applied
  const baseStyle = {
    fontFamily: styles.fontFamily || "Arial, sans-serif",
    fontSize: styles.fontSize || "11pt",
    lineHeight: styles.lineHeight || "1.4",
    color: mergedColors.text
  };

  // Debug logging disabled to prevent console flooding
  // console.log('ATSResumeRenderer - Template Styles:', {
  //   templateName: template.name,
  //   fontFamily: styles.fontFamily,
  //   fontSize: styles.fontSize,
  //   lineHeight: styles.lineHeight,
  //   baseStyle,
  //   mergedColors
  // });

  // Store first resume reference for non-premium users (similar to ResumeBuilder functionality)
  const hasStoredReference = useRef(false);

  useEffect(() => {
    const storeFirstResumeReference = async () => {
      // Only store for non-premium users and when we have valid data
      if (isPremium || !data || hasStoredReference.current) return;

      const name = data.name || "";
      const email = data.email || "";
      const phone = data.phone || "";

      // Only store if user has entered real data (not default sample data)
      const hasRealData = (
        name && name !== "John Doe" &&
        email && email !== "john.doe@example.com" &&
        phone && phone !== "+1 (123) 456-7890"
      );

      if (hasRealData) {
        hasStoredReference.current = true; // Mark as stored to prevent duplicate calls

        try {
          // Try to get user ID from localStorage or other sources
          const userId = localStorage.getItem('userId') || 'anonymous';

          const { storeFirstResumeReference } = await import("../lib/firstResumeReference");
          const response = await storeFirstResumeReference(
            userId,
            {
              name,
              email,
              phone
            },
            "ats_template_preview"
          );

          if (response.stored) {
            console.log("First resume reference stored from ATS template preview");
          } else {
            console.log("First resume reference not stored:", response.message);
          }
        } catch (error) {
          console.error("Error storing first resume reference:", error);
          // Don't show error to user as this is background functionality
        }
      }
    };

    storeFirstResumeReference();
  }, [data, isPremium]);



  // Render header based on header style
  const renderHeader = () => {
    if (layout.headerStyle === "executive-two-column") {
      return (
        <header className="mb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1
                className="font-bold mb-2 uppercase tracking-wide"
                style={{
                  color: mergedColors.primary,
                  fontSize: "2.5rem",
                  fontWeight: "700",
                  letterSpacing: "0.05em"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p
                className="font-semibold mb-3 uppercase tracking-wide"
                style={{
                  color: mergedColors.secondary,
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  letterSpacing: "0.03em"
                }}
              >
                {data.jobTitle || ""}
              </p>
            </div>

            {/* Contact Details on Right Side */}
            <div className="flex-shrink-0 text-right" style={{ color: mergedColors.accent, fontSize: "0.875rem" }}>
              {data.email && (
                <div className="mb-1">
                  <span className="font-semibold">Email:</span> {data.email}
                </div>
              )}
              {data.phone && (
                <div className="mb-1">
                  <span className="font-semibold">Phone:</span> {data.phone}
                </div>
              )}
              {data.address && (
                <div className="mb-1">
                  <span className="font-semibold">Address:</span> {data.address}
                </div>
              )}
              {data.dateOfBirth && (
                <div className="mb-1">
                  <span className="font-semibold">DOB:</span> {data.dateOfBirth}
                </div>
              )}
              {data.gender && (
                <div className="mb-1">
                  <span className="font-semibold">Gender:</span> {data.gender}
                </div>
              )}
              {data.maritalStatus && (
                <div className="mb-1">
                  <span className="font-semibold">Status:</span> {data.maritalStatus}
                </div>
              )}
              {data.linkedin && (
                <div className="mb-1">
                  <span className="font-semibold">LinkedIn:</span> {data.linkedin}
                </div>
              )}
              {data.portfolio && (
                <div className="mb-1">
                  <span className="font-semibold">Portfolio:</span> {data.portfolio}
                </div>
              )}
            </div>
          </div>
        </header>
      );
    }

    if (layout.headerStyle === "profile-left") {
      return (
        <header className="mb-8 pb-6 border-b-2" style={{ borderColor: mergedColors.accent }}>
          <div className="p-6">
            <div className="flex items-start gap-6">
              {/* Main Content and Contact Info */}
              <div className="flex-1">
                <h1
                  className="font-bold mb-3"
                  style={{
                    color: mergedColors.primary,
                    fontWeight: "700",
                    fontSize: "2.5rem",
                    letterSpacing: "0.02em"
                  }}
                >
                  {data.name || "Your Name"}
                </h1>
                <p
                  className="font-medium mb-4"
                  style={{
                    color: mergedColors.secondary,
                    fontWeight: "500",
                    fontSize: "1.25rem"
                  }}
                >
                  {data.jobTitle || ""}
                </p>

                {/* Enhanced Contact Information */}
                <div className="flex gap-8 mt-3">
                  {/* Basic Contact Column */}
                  <div className="flex flex-col gap-2 flex-1">
                    {data.address && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: mergedColors.accent }} />
                        <span className="text-sm font-medium" style={{ color: mergedColors.text }}>
                          {data.address}
                        </span>
                      </div>
                    )}
                    {data.phone && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: mergedColors.accent }} />
                        <span className="text-sm font-medium" style={{ color: mergedColors.text }}>
                          {data.phone}
                        </span>
                      </div>
                    )}
                    {data.email && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: mergedColors.accent }} />
                        <span className="text-sm font-medium" style={{ color: mergedColors.text }}>
                          {data.email}
                        </span>
                      </div>
                    )}
                    {data.dateOfBirth && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: mergedColors.accent }} />
                        <span className="text-sm font-medium" style={{ color: mergedColors.text }}>
                          DOB: {data.dateOfBirth}
                        </span>
                      </div>
                    )}
                    {data.gender && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: mergedColors.accent }} />
                        <span className="text-sm font-medium" style={{ color: mergedColors.text }}>
                          {data.gender}
                        </span>
                      </div>
                    )}
                    {data.maritalStatus && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: mergedColors.accent }} />
                        <span className="text-sm font-medium" style={{ color: mergedColors.text }}>
                          {data.maritalStatus}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Web Presence Column */}
                  {(data.portfolio || data.website || data.linkedin) && (
                    <div className="flex flex-col gap-2 flex-1">
                      {(data.portfolio || data.website) && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: mergedColors.accent }} />
                          <span className="text-sm font-medium break-all" style={{ color: mergedColors.text }}>
                            {data.portfolio || data.website}
                          </span>
                        </div>
                      )}
                      {data.linkedin && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: mergedColors.accent }} />
                          <span className="text-sm font-medium break-all" style={{ color: mergedColors.text }}>
                            {data.linkedin}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Profile Picture */}
              <div className="flex-shrink-0">
                {data.photo ? (
                  <img
                    src={data.photo}
                    alt="Profile"
                    className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gray-100 border-2 border-gray-200 shadow-lg flex items-center justify-center">
                    <span className="text-5xl text-gray-400">👤</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      );
    }

    if (layout.headerStyle === "creative") {
      return (
        <header className="mb-6 pb-4 border-b-2 text-center" style={{ borderColor: mergedColors.accent, ...textStyle }}>
          <h1
            className="font-bold mb-2"
            style={{
              color: mergedColors.primary,
              ...textStyle,
              fontWeight: "700",
              fontSize: "2.5rem" // Large, prominent name
            }}
          >
            {data.name || "Your Name"}
          </h1>
          <p
            className="font-medium mb-3"
            style={{
              color: mergedColors.secondary,
              ...textStyle,
              fontWeight: "500",
              fontSize: "1.25rem" // Prominent job title
            }}
          >
            {data.jobTitle || ""}
          </p>
          <div className="flex justify-center items-center space-x-4" style={{ color: mergedColors.accent, ...textStyle, fontSize: "0.875rem" }}>
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.address && <span>{data.address}</span>}
          </div>
          {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
            <div className="flex justify-center items-center space-x-4 mt-2" style={{ color: mergedColors.accent, ...textStyle, fontSize: "0.875rem" }}>
              {data.dateOfBirth && <span>DOB: {data.dateOfBirth}</span>}
              {data.gender && <span>{data.gender}</span>}
              {data.maritalStatus && <span>{data.maritalStatus}</span>}
              {data.linkedin && <span>{data.linkedin}</span>}
              {data.portfolio && <span>{data.portfolio}</span>}
            </div>
          )}
        </header>
      );
    }

    if (layout.headerStyle === "sales") {
      return (
        <header className="mb-6 pb-4 border-b-2 text-center" style={{ borderColor: mergedColors.accent, ...textStyle }}>
          <h1
            className="font-bold mb-2"
            style={{
              color: mergedColors.primary,
              ...textStyle,
              fontWeight: "700",
              fontSize: "2.5rem" // Large, prominent name
            }}
          >
            {data.name || "Your Name"}
          </h1>
          <p
            className="font-medium mb-3"
            style={{
              color: mergedColors.secondary,
              ...textStyle,
              fontWeight: "500",
              fontSize: "1.25rem" // Prominent job title
            }}
          >
            {data.jobTitle || ""}
          </p>
          <div className="flex justify-center items-center space-x-4" style={{ color: mergedColors.accent, ...textStyle, fontSize: "0.875rem" }}>
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.address && <span>{data.address}</span>}
          </div>
          {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
            <div className="flex justify-center items-center space-x-4 mt-2" style={{ color: mergedColors.accent, ...textStyle, fontSize: "0.875rem" }}>
              {data.dateOfBirth && <span>DOB: {data.dateOfBirth}</span>}
              {data.gender && <span>{data.gender}</span>}
              {data.maritalStatus && <span>{data.maritalStatus}</span>}
              {data.linkedin && <span>{data.linkedin}</span>}
              {data.portfolio && <span>{data.portfolio}</span>}
            </div>
          )}
        </header>
      );
    }

    if (layout.headerStyle === "standard") {
      return (
        <header className="mb-6 pb-4 border-b-2 text-center" style={{ borderColor: mergedColors.accent, ...headerTextStyle }}>
          <h1
            className="font-bold mb-2"
            style={{
              color: mergedColors.primary,
              ...headerTextStyle,
              fontWeight: "700",
              fontSize: "2rem" // Large, prominent name - balanced size
            }}
          >
            {data.name || "Your Name"}
          </h1>
          <p
            className="font-medium mb-3"
            style={{
              color: mergedColors.secondary,
              ...headerTextStyle,
              fontWeight: "500",
              fontSize: "1.375rem" // Prominent job title - matches image template
            }}
          >
            {data.jobTitle || ""}
          </p>
          <div className="flex flex-col items-center space-y-1" style={{ color: mergedColors.accent, ...headerTextStyle, fontSize: "0.875rem" }}>
            {/* Primary contact info */}
            <div className="flex justify-center items-center space-x-4">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.address && <span>{data.address}</span>}
            </div>
            {/* Personal details and web presence */}
            {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
              <div className="flex justify-center items-center space-x-4">
                {data.dateOfBirth && <span>DOB: {data.dateOfBirth}</span>}
                {data.gender && <span>{data.gender}</span>}
                {data.maritalStatus && <span>{data.maritalStatus}</span>}
                {data.linkedin && <span>{data.linkedin}</span>}
                {data.portfolio && <span>{data.portfolio}</span>}
              </div>
            )}
          </div>
        </header>
      );
    }

    if (layout.headerStyle === "professional") {
      return (
        <header className="mb-6 pb-4 border-b-2 text-center" style={{ borderColor: mergedColors.accent, ...headerTextStyle }}>
          <h1
            className="font-bold mb-2"
            style={{
              color: mergedColors.primary,
              ...headerTextStyle,
              fontWeight: "700",
              fontSize: "2rem" // Large, prominent name - balanced size
            }}
          >
            {data.name || "Your Name"}
          </h1>
          <p
            className="font-medium mb-3"
            style={{
              color: mergedColors.secondary,
              ...headerTextStyle,
              fontWeight: "500",
              fontSize: "1.375rem" // Prominent job title - matches image template
            }}
          >
            {data.jobTitle || ""}
          </p>
          <div className="flex flex-col items-center space-y-1" style={{ color: mergedColors.accent, ...headerTextStyle, fontSize: "0.875rem" }}>
            {/* Primary contact info */}
            <div className="flex justify-center items-center space-x-4">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.address && <span>{data.address}</span>}
            </div>
            {/* Personal details and web presence */}
            {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
              <div className="flex justify-center items-center space-x-4">
                {data.dateOfBirth && <span>DOB: {data.dateOfBirth}</span>}
                {data.gender && <span>{data.gender}</span>}
                {data.maritalStatus && <span>{data.maritalStatus}</span>}
                {data.linkedin && <span>{data.linkedin}</span>}
                {data.portfolio && <span>{data.portfolio}</span>}
              </div>
            )}
          </div>
        </header>
      );
    }

    if (layout.headerStyle === "modern") {
      return (
        <header className="mb-6 pb-4 border-b-2 text-center" style={{ borderColor: mergedColors.accent, ...headerTextStyle }}>
          <h1
            className="font-bold mb-2"
            style={{
              color: mergedColors.primary,
              ...headerTextStyle,
              fontWeight: "700",
              fontSize: "2rem" // Large, prominent name - balanced size
            }}
          >
            {data.name || "Your Name"}
          </h1>
          <p
            className="font-medium mb-3"
            style={{
              color: mergedColors.secondary,
              ...headerTextStyle,
              fontWeight: "500",
              fontSize: "1.375rem" // Prominent job title - matches image template
            }}
          >
            {data.jobTitle || ""}
          </p>
          <div className="flex flex-col items-center space-y-1" style={{ color: mergedColors.accent, ...headerTextStyle, fontSize: "0.875rem" }}>
            {/* Primary contact info */}
            <div className="flex justify-center items-center space-x-4">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.address && <span>{data.address}</span>}
            </div>
            {/* Personal details and web presence */}
            {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
              <div className="flex justify-center items-center space-x-4">
                {data.dateOfBirth && <span>DOB: {data.dateOfBirth}</span>}
                {data.gender && <span>{data.gender}</span>}
                {data.maritalStatus && <span>{data.maritalStatus}</span>}
                {data.linkedin && <span>{data.linkedin}</span>}
                {data.portfolio && <span>{data.portfolio}</span>}
              </div>
            )}
          </div>
        </header>
      );
    }

    if (layout.headerStyle === "executive") {
      return (
        <header className="mb-6 pb-4 border-b-2 text-center" style={{ borderColor: mergedColors.accent, ...textStyle }}>
          <h1
            className="font-bold mb-2"
            style={{
              color: mergedColors.primary,
              ...textStyle,
              fontWeight: "700",
              fontSize: "2.5rem" // Large, prominent name
            }}
          >
            {data.name || "Your Name"}
          </h1>
          <p
            className="font-medium mb-3"
            style={{
              color: mergedColors.secondary,
              ...textStyle,
              fontWeight: "500",
              fontSize: "1.25rem" // Prominent job title
            }}
          >
            {data.jobTitle || ""}
          </p>
          <div className="flex flex-col items-center space-y-1" style={{ color: mergedColors.accent, ...textStyle, fontSize: "0.875rem" }}>
            {/* Primary contact info */}
            <div className="flex justify-center items-center space-x-4">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.address && <span>{data.address}</span>}
            </div>
            {/* Personal details and web presence */}
            {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
              <div className="flex justify-center items-center space-x-4">
                {data.dateOfBirth && <span>DOB: {data.dateOfBirth}</span>}
                {data.gender && <span>{data.gender}</span>}
                {data.maritalStatus && <span>{data.maritalStatus}</span>}
                {data.linkedin && <span>{data.linkedin}</span>}
                {data.portfolio && <span>{data.portfolio}</span>}
              </div>
            )}
          </div>
        </header>
      );
    }

    // Default header - clean and simple
    return (
      <header className="mb-6 pb-4 border-b-2 text-center" style={{ borderColor: mergedColors.accent }}>
        <h1
          className="font-bold mb-2"
          style={{
            color: mergedColors.primary,
            fontWeight: "700",
            fontSize: "2rem"
          }}
        >
          {data.name || "Your Name"}
        </h1>
        <p
          className="font-medium mb-3"
          style={{
            color: mergedColors.secondary,
            fontWeight: "500",
            fontSize: "1.375rem"
          }}
        >
          {data.jobTitle || ""}
        </p>
        <div className="flex flex-col items-center space-y-1" style={{ color: mergedColors.accent, fontSize: "0.875rem" }}>
          {/* Primary contact info */}
          <div className="flex justify-center items-center space-x-4">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.address && <span>{data.address}</span>}
          </div>
          {/* Personal details and web presence */}
          {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
            <div className="flex justify-center items-center space-x-4">
              {data.dateOfBirth && <span>DOB: {data.dateOfBirth}</span>}
              {data.gender && <span>{data.gender}</span>}
              {data.maritalStatus && <span>{data.maritalStatus}</span>}
              {data.linkedin && <span>{data.linkedin}</span>}
              {data.portfolio && <span>{data.portfolio}</span>}
            </div>
          )}
        </div>
      </header>
    );
  };

  // Helper to format date range conditionally (uses preferences)
  const formatDateRange = (startDate, endDate) => {
    const start = startDate ? fmtDate(startDate) : '';
    const end = endDate ? fmtDate(endDate) : '';

    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    if (end) return end;
    return null;
  };

  // Render section header - clean and simple
  const renderSectionHeader = (title) => (
    <h2
      className="text-xl font-bold mb-3 pb-2 tracking-wide"
      style={{
        color: mergedColors.primary,
        borderBottom: `1px solid ${mergedColors.accent}`,
        fontWeight: "700"
      }}
    >
      {title}
    </h2>
  );

  // Render personal section for sidebar
  const renderPersonalSection = () => (
    <div className="mb-4" style={textStyle}>
      {renderSectionHeader("CONTACT")}
      <div className="space-y-2 text-xs" style={textStyle}>
        {data.address && (
          <div className="flex items-start gap-1">
            <span
              style={{ color: mergedColors.text, ...textStyle }}
              className="break-words leading-tight text-xs"
            >
              {data.address}
            </span>
          </div>
        )}
        {data.phone && (
          <div className="flex items-start gap-1">
            <span
              style={{ color: mergedColors.text, ...textStyle }}
              className="break-words leading-tight text-xs"
            >
              {data.phone}
            </span>
          </div>
        )}
        {data.email && (
          <div className="flex items-start gap-1">
            <span
              style={{ color: mergedColors.text, ...textStyle }}
              className="break-words leading-tight text-xs"
            >
              {data.email}
            </span>
          </div>
        )}
        {data.website && (
          <div className="flex items-start gap-1">
            <span
              style={{ color: mergedColors.text, ...textStyle }}
              className="break-words leading-tight text-xs"
            >
              {data.website}
            </span>
          </div>
        )}
        {data.linkedin && (
          <div className="flex items-start gap-1">
            <span
              style={{ color: mergedColors.text, ...textStyle }}
              className="break-words leading-tight text-xs"
            >
              {data.linkedin}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Render education section with enhanced visual hierarchy
  const renderEducationSection = () => (
    <div className="mb-6">
      {renderSectionHeader("Education")}
      <div className="space-y-4">
        {data.education?.map((edu, index) => (
          <div key={index} className="relative">
            <div className="flex justify-between items-start mb-2">
              <h3
                className="font-semibold text-base"
                style={{
                  color: mergedColors.primary,
                  fontWeight: "600"
                }}
              >
                {edu.degree}
              </h3>
              <span
                className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100"
                style={{
                  color: mergedColors.accent,
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }}
              >
                {formatDateRange(edu.startDate, edu.endDate)}
              </span>
            </div>
            <p
              className="font-medium text-sm mb-1"
              style={{
                color: mergedColors.secondary,
                fontWeight: "500"
              }}
            >
              {edu.institution || edu.school}
            </p>
            {edu.field && (
              <p
                className="text-sm"
                style={{
                  color: mergedColors.text,
                  fontStyle: 'italic'
                }}
              >
                {edu.field}
              </p>
            )}
            {edu.description && (
              <p
                className="text-sm leading-relaxed mt-2"
                style={{
                  color: mergedColors.text
                }}
              >
                {edu.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render skills section with enhanced visual appeal - ROW-WISE GRID LAYOUT
  const renderSkillsSection = () => {
    // Check if this is an ATS template with single column layout
    if (layout.columns === 1) {
      // Use grid layout that fills rows left-to-right (horizontal distribution)
      return (
        <div className="mb-6">
          {renderSectionHeader("Skills")}
          <div className="grid gap-2" style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            minWidth: '100%',
            overflow: 'hidden'
          }}>
            {data.skills?.map((skill, index) => (
              <div
                key={index}
                className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
              >
                <div
                  className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: mergedColors.accent }}
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: mergedColors.text,
                    wordBreak: 'break-word'
                  }}
                >
                  {renderSkillName(skill)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // Enhanced single-column skills layout (for sidebar)
      return (
        <div className="mb-6">
          {renderSectionHeader("Skills")}
          <div className="space-y-2">
            {data.skills?.map((skill, index) => (
              <div
                key={index}
                className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
              >
                <div
                  className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: mergedColors.accent }}
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: mergedColors.text,
                    wordBreak: 'break-word'
                  }}
                >
                  {renderSkillName(skill)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  // Render languages section with enhanced visual appeal
  const renderLanguagesSection = () => (
    <div className="mb-6">
      {renderSectionHeader("Languages")}
      <div className="space-y-2">
        {data.languages?.map((lang, index) => (
          <div
            key={index}
            className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors"
            style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
          >
            <div
              className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: mergedColors.accent }}
            />
            <span
              className="text-sm font-medium"
              style={{
                color: mergedColors.text
              }}
            >
              {typeof lang === 'string' ? lang : (lang.language || lang.name || 'Language')}
              {(typeof lang === 'object' && lang.proficiency) && (
                <span className="text-gray-600 ml-1">({lang.proficiency})</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Render custom sections (grouped by type)
  const renderCustomSections = () => {
    if (!data.customSections || data.customSections.length === 0) return null;

    // Group custom sections by type
    const groups = data.customSections.reduce((acc, current) => {
      const type = (current.type || "custom").toLowerCase();
      if (!acc[type]) acc[type] = [];
      acc[type].push(current);
      return acc;
    }, {});

    return Object.entries(groups).map(([type, items], groupIdx) => {
      // Create a generic pluralized header for the group
      const sectionTitle = (type.charAt(0).toUpperCase() + type.slice(1) + (type.endsWith('s') ? '' : 's'));

      return (
        <div key={groupIdx} className="mb-6">
          {renderSectionHeader(sectionTitle)}
          <div className="space-y-6">
            {items.map((section, index) => {
              const itemTitle = section.name || section.title || "";
              return (
                <div key={index} className="space-y-3">
                  {/* Individual item title as a sub-header */}
                  {itemTitle && (
                    <h3
                      className="font-semibold text-sm leading-tight mb-1"
                      style={{
                        color: mergedColors.primary,
                        fontWeight: "600"
                      }}
                    >
                      {itemTitle}
                    </h3>
                  )}

                  {/* Date (if present) */}
                  {section.date && (
                    <p className="text-sm mb-2" style={{ color: mergedColors.accent, fontFamily: styles.fontFamily, fontWeight: "600" }}>
                      {fmtDate(section.date)}
                    </p>
                  )}

                  {/* Description */}
                  {section.description && (
                    <div className="text-sm leading-relaxed" style={{ color: mergedColors.text, fontFamily: styles.fontFamily, lineHeight: styles.lineHeight || "1.4" }}>
                      {renderDescriptionBullets(section.description, true, [sectionTitle, itemTitle])}
                    </div>
                  )}

                  {/* Key Achievements (for internships) */}
                  {section.achievements && (
                    <div className="mt-3">
                      <h4
                        className="font-medium mb-2 text-sm"
                        style={{
                          color: mergedColors.primary,
                          fontFamily: styles.fontFamily,
                          fontWeight: "500"
                        }}
                      >
                        Key Achievements:
                      </h4>
                      <div
                        className="text-sm leading-relaxed"
                        style={{
                          color: mergedColors.text,
                          fontFamily: styles.fontFamily,
                          lineHeight: styles.lineHeight || "1.4"
                        }}
                      >
                        {renderDescriptionBullets(section.achievements)}
                      </div>
                    </div>
                  )}

                  {/* Technologies */}
                  {section.technologies && (
                    <div className="mt-3">
                      <h4
                        className="font-medium mb-2 text-sm"
                        style={{
                          color: mergedColors.primary,
                          fontFamily: styles.fontFamily,
                          fontWeight: "500"
                        }}
                      >
                        Technologies Used:
                      </h4>
                      <p
                        className="text-sm"
                        style={{
                          color: mergedColors.text,
                          fontFamily: styles.fontFamily
                        }}
                      >
                        {section.technologies}
                      </p>
                    </div>
                  )}

                  {/* Reference Information */}
                  {(section.email || section.phone) && !section.description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h4
                        className="font-medium mb-2 text-sm"
                        style={{
                          color: mergedColors.primary,
                          fontFamily: styles.fontFamily,
                          fontWeight: "500"
                        }}
                      >
                        Reference Details:
                      </h4>
                      <div className="space-y-1 text-sm">
                        {section.name && (
                          <div className="flex items-center gap-2">
                            <span style={{ color: mergedColors.text, fontFamily: styles.fontFamily }}>
                              {section.name}
                            </span>
                          </div>
                        )}
                        {section.email && (
                          <div className="flex items-center gap-2">
                            <span style={{ color: mergedColors.text, fontFamily: styles.fontFamily }}>
                              {section.email}
                            </span>
                          </div>
                        )}
                        {section.phone && (
                          <div className="flex items-center gap-2">
                            <span style={{ color: mergedColors.text, fontFamily: styles.fontFamily }}>
                              {section.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  // Render summary section with enhanced visual appeal
  const renderSummarySection = () => (
    <div className="mb-6" style={textStyle}>
      {renderSectionHeader("Summary")}
      <div
        className="p-4 rounded-lg border-l-4"
        style={{
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderLeftColor: mergedColors.accent
        }}
      >
        <div
          className="text-sm leading-relaxed"
          style={{
            color: mergedColors.text,
            lineHeight: '1.6',
            whiteSpace: 'pre-line'
          }}
          dangerouslySetInnerHTML={{
            __html: parseRichText(data.summary || "Experienced professional with a proven track record of delivering results...")
          }}
        />
      </div>
    </div>
  );

  // Render experience section with enhanced visual appeal
  const renderExperienceSection = () => {
    return (
      <div className="mb-6" style={textStyle}>
        {renderSectionHeader("Work Experience")}
        <div className="space-y-6">
          {normalizedData.experience?.map((exp, index) => (
            <div key={index} className="relative">
              <div className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="font-semibold text-base"
                    style={{
                      color: mergedColors.primary,
                      fontWeight: "600"
                    }}
                  >
                    {exp.jobTitle}
                  </h3>
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100"
                    style={{
                      color: mergedColors.accent,
                      backgroundColor: 'rgba(0,0,0,0.05)'
                    }}
                  >
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </span>
                </div>

                <p
                  className="font-medium text-sm mb-3"
                  style={{
                    color: mergedColors.secondary,
                    fontWeight: "500"
                  }}
                >
                  {exp.company}
                </p>

                <div
                  className="text-sm leading-relaxed"
                  style={{
                    color: mergedColors.text
                  }}
                >
                  {renderDescriptionBullets(exp.description)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render certifications section with enhanced visual organization
  const renderCertificationsSection = () => (
    <div className="mb-6">
      {renderSectionHeader("Certifications")}
      <div className="space-y-3">
        {data.certifications?.map((cert, index) => (
          <div key={index} className="relative">
            <div className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <div
                className="w-3 h-3 rounded-full mr-3 mt-1 flex-shrink-0"
                style={{ backgroundColor: mergedColors.accent }}
              />
              <div className="flex-1 min-w-0">
                {/* Certification name with larger, bolder font */}
                <h3
                  className="font-semibold text-sm leading-tight mb-1"
                  style={{
                    color: mergedColors.primary,
                    fontWeight: "600"
                  }}
                >
                  {cert.name}
                </h3>
                {/* Issuer and Date on the same line with proper spacing */}
                <p
                  className="text-sm leading-tight"
                  style={{
                    color: mergedColors.text,
                    fontWeight: "400"
                  }}
                >

                  {cert.issuer || ''}{cert.issuer && cert.date && cert.date.trim() !== '' && cert.date.toLowerCase() !== 'ongoing' && cert.date.toLowerCase() !== 'undefined' && <span style={{ color: mergedColors.accent, fontWeight: "600" }}> • </span>}{cert.date && cert.date.trim() !== '' && cert.date.toLowerCase() !== 'ongoing' && cert.date.toLowerCase() !== 'undefined' ? fmtDate(cert.date) : ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render projects section with enhanced visual appeal
  const renderProjectsSection = () => (
    <div className="mb-6">
      {renderSectionHeader("Projects")}
      <div className="space-y-4">
        {data.projects?.map((project, index) => (
          <div key={index} className="relative p-4 rounded-lg hover:bg-gray-50 transition-colors" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <div className="flex items-start">
              <div
                className="w-3 h-3 rounded-full mr-3 mt-1 flex-shrink-0"
                style={{ backgroundColor: mergedColors.accent }}
              />
              <div className="flex-1">
                <h3
                  className="font-semibold mb-2 text-base"
                  style={{
                    color: mergedColors.primary,
                    fontWeight: "600"
                  }}
                >
                  {project.title}
                </h3>
                <p
                  className="text-sm font-medium mb-2 px-2 py-1 rounded-full inline-block"
                  style={{
                    color: mergedColors.secondary,
                    backgroundColor: 'rgba(0,0,0,0.05)'
                  }}
                >
                  {project.technologies}
                </p>
                {project.description && (
                  <div
                    className="text-sm leading-relaxed"
                    style={{
                      color: mergedColors.text
                    }}
                  >
                    {renderDescriptionBullets(project.description)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render awards section with enhanced visual appeal
  const renderAwardsSection = () => (
    <div className="mb-6">
      {renderSectionHeader("Awards & Achievements")}
      <div className="space-y-3">
        {data.awards?.map((award, index) => (
          <div
            key={index}
            className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
          >
            <div
              className="w-2 h-2 rounded-full mr-3 mt-1.5 flex-shrink-0"
              style={{ backgroundColor: mergedColors.accent }}
            />
            <span
              className="text-sm font-medium"
              style={{
                color: mergedColors.text
              }}
            >
              {typeof award === 'string' ? award : `${award.title || award.name || 'Award'} - ${award.issuer || 'Issuer'} (${award.date ? fmtDate(award.date) : 'Date'})`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Helper function to check if a section has data
  const hasSectionData = (section) => {
    switch (section) {
      case 'personal':
        return true; // Always show personal info
      case 'summary':
        return data.summary && data.summary.trim() !== '';
      case 'experience':
        return normalizedData.experience && normalizedData.experience.length > 0;
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
      case 'customSections':
        return data.customSections && data.customSections.length > 0;
      default:
        return false;
    }
  };

  // Render single column layout
  const renderSingleColumn = () => (
    <div className="space-y-6" style={textStyle}>
      {renderHeader()}
      {layout.sectionsOrder.map((section, index) => {
        // Only render sections that have data
        if (!hasSectionData(section)) {
          return null;
        }

        switch (section) {
          case 'personal':
            return null; // Already handled in header
          case 'summary':
            return <div key={`summary-${index}`}>{renderSummarySection()}</div>;
          case 'experience':
            return <div key={`experience-${index}`}>{renderExperienceSection()}</div>;
          case 'education':
            return <div key={`education-${index}`}>{renderEducationSection()}</div>;
          case 'skills':
            return <div key={`skills-${index}`}>{renderSkillsSection()}</div>;
          case 'certifications':
            return <div key={`certifications-${index}`}>{renderCertificationsSection()}</div>;
          case 'languages':
            return <div key={`languages-${index}`}>{renderLanguagesSection()}</div>;
          case 'projects':
            return <div key={`projects-${index}`}>{renderProjectsSection()}</div>;
          case 'awards':
            return <div key={`awards-${index}`}>{renderAwardsSection()}</div>;
          case 'customSections':
            return <div key={`customSections-${index}`}>{renderCustomSections()}</div>;
          default:
            return null;
        }
      })}
    </div>
  );

  // Render two column layout
  const renderTwoColumn = () => {
    const sidebarWidth = layout.sidebarWidth || "30%";
    const mainWidth = `${100 - parseInt(sidebarWidth)}%`;

    return (
      <div className="space-y-6" style={textStyle}>
        {renderHeader()}
        <div
          className="grid gap-6 items-start"
          style={{
            gridTemplateColumns: `${sidebarWidth} ${mainWidth}`,
            ...textStyle
          }}
        >
          {/* Sidebar */}
          <div
            className="space-y-3 p-3 rounded-lg border border-gray-200"
            style={{
              backgroundColor: mergedColors.sidebarBackground,
              ...textStyle
            }}
          >
            {/* Profile Picture */}
            {layout.showProfilePicture && (
              <div className="text-center mb-4">
                {data.photo ? (
                  <img
                    src={data.photo}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm mx-auto"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 shadow-sm mx-auto flex items-center justify-center">
                    <span className="text-2xl text-gray-500 font-bold">👤</span>
                  </div>
                )}
              </div>
            )}

            {layout.sidebarSections?.map((section, index) => {
              // Only render sidebar sections that have data
              if (!hasSectionData(section)) {
                return null;
              }

              switch (section) {
                case 'personal':
                  return <div key={`sidebar-personal-${index}`}>{renderPersonalSection()}</div>;
                case 'education':
                  return <div key={`sidebar-education-${index}`}>{renderEducationSection()}</div>;
                case 'skills':
                  return <div key={`sidebar-skills-${index}`}>{renderSkillsSection()}</div>;
                case 'languages':
                  return <div key={`sidebar-languages-${index}`}>{renderLanguagesSection()}</div>;
                case 'certifications':
                  return <div key={`sidebar-certifications-${index}`}>{renderCertificationsSection()}</div>;
                case 'projects':
                  return <div key={`sidebar-projects-${index}`}>{renderProjectsSection()}</div>;
                case 'awards':
                  return <div key={`sidebar-awards-${index}`}>{renderAwardsSection()}</div>;
                case 'customSections':
                  return <div key={`sidebar-customSections-${index}`}>{renderCustomSections()}</div>;
                default:
                  return null;
              }
            })}
          </div>

          {/* Main Content */}
          <div className="space-y-6 pr-6" style={textStyle}>
            {layout.mainSections?.map((section, index) => {
              // Only render main sections that have data
              if (!hasSectionData(section)) {
                return null;
              }

              switch (section) {
                case 'summary':
                  return <div key={`main-summary-${index}`}>{renderSummarySection()}</div>;
                case 'experience':
                  return <div key={`main-experience-${index}`}>{renderExperienceSection()}</div>;
                case 'education':
                  return <div key={`main-education-${index}`}>{renderEducationSection()}</div>;
                case 'skills':
                  return <div key={`main-skills-${index}`}>{renderSkillsSection()}</div>;
                case 'certifications':
                  return <div key={`main-certifications-${index}`}>{renderCertificationsSection()}</div>;
                case 'languages':
                  return <div key={`main-languages-${index}`}>{renderLanguagesSection()}</div>;
                case 'projects':
                  return <div key={`main-projects-${index}`}>{renderProjectsSection()}</div>;
                case 'awards':
                  return <div key={`main-awards-${index}`}>{renderAwardsSection()}</div>;
                case 'customSections':
                  return <div key={`main-customSections-${index}`}>{renderCustomSections()}</div>;
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
    );
  };

  // Debug logging removed to prevent hydration issues

  return (
    <div
      className="resume-preview ats-resume-override shadow-lg border border-gray-200 rounded-lg overflow-hidden min-h-screen relative"
      style={{
        ...baseStyle,
        backgroundColor: mergedColors.background,
        '--ats-font-family': styles.fontFamily || "Arial, sans-serif",
        '--ats-font-size': styles.fontSize || "11pt",
        '--ats-line-height': styles.lineHeight || "1.4"
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
            color: "rgba(0, 0, 0, 0.15)",
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

      <div className="p-3" style={baseStyle}>
        {layout.columns === 2 ? renderTwoColumn() : renderSingleColumn()}
      </div>
    </div>
  );
});

export default ATSResumeRenderer;
