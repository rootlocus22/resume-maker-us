"use client";
import React from 'react';

// Advanced Resume Renderer - Handles Multiple Layout Types
export const AdvancedResumeRenderer = ({
  data,
  templateConfig,
  mergedColors,
  translations,
  iconMap,
  sectionIconMap,
  formatDate,
  cleanText,
  preferences
}) => {
  const { layout, styles } = templateConfig;

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

  // Render different header styles
  const renderHeader = () => {
    const baseHeaderStyles = {
      fontFamily: styles.fontFamily,
      color: mergedColors.primary
    };

    switch (layout.headerStyle) {
      case "traditional":
        return (
          <header className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: mergedColors.accent }}>
            <h1 className="text-3xl font-bold mb-2" style={baseHeaderStyles}>
              {data.name || "Your Name"}
            </h1>
            <p className="text-lg text-gray-600 mb-2">{data.jobTitle || ""}</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>{data.email} • {data.phone}</p>
              <p>{data.address}</p>
              {data.linkedin && <p>LinkedIn: {data.linkedin}</p>}
            </div>
          </header>
        );

      case "split-header":
        return (
          <header className="flex justify-between items-start mb-6 p-4 rounded-lg" style={{ backgroundColor: mergedColors.background }}>
            <div>
              <h1 className="text-2xl font-bold" style={baseHeaderStyles}>{data.name || "Your Name"}</h1>
              <p className="text-lg" style={{ color: mergedColors.secondary }}>{data.jobTitle || ""}</p>
            </div>
            <div className="text-right text-sm" style={{ color: mergedColors.text }}>
              <p>{data.email}</p>
              <p>{data.phone}</p>
              <p>{data.address}</p>
            </div>
          </header>
        );

      case "hero-banner":
        return (
          <header
            className="text-center text-white p-8 mb-6 rounded-lg relative overflow-hidden"
            style={{
              background: mergedColors.headerGradient || `linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%)`,
              minHeight: layout.headerHeight || "200px"
            }}
          >
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">{data.name || "Your Name"}</h1>
              <p className="text-xl mb-4">{data.jobTitle || ""}</p>
              <div className="text-sm opacity-90">
                <p>{data.email} • {data.phone}</p>
                {data.linkedin && <p>{data.linkedin}</p>}
              </div>
            </div>
          </header>
        );

      case "diagonal-split":
        return (
          <header className="relative mb-6 h-32 overflow-hidden rounded-lg">
            <div
              className="absolute inset-0 transform skew-y-2"
              style={{ background: `linear-gradient(45deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%)` }}
            ></div>
            <div className="relative z-10 p-6 text-white">
              <h1 className="text-2xl font-bold">{data.name || "Your Name"}</h1>
              <p className="text-lg">{data.jobTitle || ""}</p>
            </div>
            <div className="absolute bottom-2 right-4 text-white text-sm opacity-90">
              <p>{data.email}</p>
              <p>{data.phone}</p>
            </div>
          </header>
        );

      case "minimal-header":
        return (
          <header className="mb-8">
            <h1 className="text-3xl font-light mb-1" style={baseHeaderStyles}>
              {data.name || "Your Name"}
            </h1>
            <p className="text-sm uppercase tracking-wider mb-4" style={{ color: mergedColors.secondary }}>
              {data.jobTitle || ""}
            </p>
            <div className="text-xs" style={{ color: mergedColors.secondary }}>
              {data.email} • {data.phone} • {data.address}
            </div>
          </header>
        );

      case "infographic-header":
        return (
          <header className="text-center mb-6 p-6 rounded-lg relative" style={{ backgroundColor: mergedColors.charts }}>
            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: mergedColors.accent }}></div>
            <h1 className="text-3xl font-bold mb-2" style={baseHeaderStyles}>{data.name || "Your Name"}</h1>
            <p className="text-lg mb-4" style={{ color: mergedColors.secondary }}>{data.jobTitle || ""}</p>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-xl" style={{ color: mergedColors.accent }}>
                  {data.experience?.length || 0}
                </div>
                <div>Jobs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl" style={{ color: mergedColors.accent }}>
                  {data.skills?.length || 0}
                </div>
                <div>Skills</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl" style={{ color: mergedColors.accent }}>
                  {data.education?.length || 0}
                </div>
                <div>Degrees</div>
              </div>
            </div>
          </header>
        );

      default:
        return (
          <header className="mb-6">
            <h1 className="text-2xl font-bold mb-2" style={baseHeaderStyles}>
              {data.name || "Your Name"}
            </h1>
            <p className="text-lg mb-2" style={{ color: mergedColors.secondary }}>
              {data.jobTitle || ""}
            </p>
            <div className="text-sm" style={{ color: mergedColors.text }}>
              {data.email} • {data.phone} • {data.address}
            </div>
          </header>
        );
    }
  };

  // Render section content based on section type
  const renderSectionContent = (section, sectionData) => {
    switch (section) {
      case "summary":
        return (
          <p className="leading-relaxed" style={{
            color: mergedColors.text,
            fontFamily: styles.fontFamily,
            lineHeight: styles.lineHeight
          }}>
            {cleanText(data.summary) || "Your professional summary goes here."}
          </p>
        );

      case "experience":
        return (
          <div className="space-y-4">
            {normalizedData.experience?.map((exp, index) => (
              <div key={index} className="relative">
                {layout.timelineStyle === "vertical-line" && (
                  <div className="absolute left-0 top-0 bottom-0 w-px" style={{ backgroundColor: mergedColors.timeline }}>
                    <div
                      className="absolute top-2 -left-1.5 w-3 h-3 rounded-full"
                      style={{ backgroundColor: mergedColors.accent }}
                    ></div>
                  </div>
                )}
                <div className={layout.timelineStyle === "vertical-line" ? "pl-6" : ""}>
                  <h3 className="font-semibold text-lg" style={{ color: mergedColors.primary }}>
                    {cleanText(exp.jobTitle)}
                  </h3>
                  <p className="font-medium" style={{ color: mergedColors.secondary }}>
                    {cleanText(exp.company) || "Company Name"}
                  </p>
                  <p className="text-sm mb-2" style={{ color: mergedColors.secondary }}>
                    {formatDate(exp.startDate, preferences)} - {formatDate(exp.endDate, preferences)} • {exp.location}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: mergedColors.text }}>
                    {cleanText(exp.description) || "Job description and achievements."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case "skills":
        if (layout.type === "infographic" || layout.progressBars) {
          return (
            <div className="space-y-3">
              {data.skills?.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: mergedColors.text }}>
                      {skill.name}
                    </span>
                    <span className="text-xs" style={{ color: mergedColors.secondary }}>
                      {skill.proficiency}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: mergedColors.accent,
                        width: `${(parseInt(skill.proficiency) || 50)}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          );
        } else if (layout.type === "grid-masonry" || layout.type === "grid-cards") {
          return (
            <div className="grid grid-cols-2 gap-2">
              {data.skills?.map((skill, index) => (
                <div
                  key={index}
                  className="p-2 rounded text-center text-sm"
                  style={{ backgroundColor: mergedColors.cards || mergedColors.background }}
                >
                  {skill.name}
                </div>
              ))}
            </div>
          );
        } else {
          return (
            <div className="flex flex-wrap gap-2">
              {data.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: mergedColors.accent + "20",
                    color: mergedColors.accent
                  }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          );
        }

      case "education":
        return (
          <div className="space-y-3">
            {data.education?.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold" style={{ color: mergedColors.primary }}>
                    {cleanText(edu.institution) || "Institution Name"}
                  </h3>
                  <span className="text-sm" style={{ color: mergedColors.secondary }}>
                    {formatDate(edu.startDate, preferences)} - {formatDate(edu.endDate, preferences)}
                  </span>
                </div>
                <p style={{ color: mergedColors.text }}>
                  {cleanText(edu.degree)} in {cleanText(edu.field)}
                </p>
                {edu.gpa && (
                  <p className="text-sm" style={{ color: mergedColors.text }}>GPA: {edu.gpa}</p>
                )}
              </div>
            ))}
          </div>
        );

      case "certifications":
        return (
          <div className="space-y-2">
            {data.certifications?.map((cert, index) => (
              <div key={index}>
                <h3 className="font-medium" style={{ color: mergedColors.primary }}>
                  {cert.name}
                </h3>
                <p className="text-sm" style={{ color: mergedColors.secondary }}>
                  {cert.issuer || ''}{cert.issuer && cert.date && cert.date.trim() !== '' && cert.date.toLowerCase() !== 'ongoing' && cert.date.toLowerCase() !== 'undefined' && ' • '}{cert.date && cert.date.trim() !== '' && cert.date.toLowerCase() !== 'ongoing' && cert.date.toLowerCase() !== 'undefined' ? cert.date : ''}
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return <p>Section content for {section}</p>;
    }
  };

  // Render individual section with title and content
  const renderSection = (section, isInSidebar = false) => {
    if (!data[section]?.length && section !== "summary") return null;

    const sectionStyle = isInSidebar ? "mb-4" : "mb-6";
    const titleSize = isInSidebar ? "text-sm" : "text-base";

    return (
      <section key={section} className={sectionStyle}>
        <h2
          className={`font-bold mb-2 flex items-center gap-2 ${titleSize}`}
          style={{ color: mergedColors.primary, fontFamily: styles.fontFamily }}
        >
          {layout.showIcons && (
            <span className="w-4 h-4">
              {iconMap[sectionIconMap[section]]}
            </span>
          )}
          {translations[section]}
        </h2>
        {renderSectionContent(section, data[section])}
      </section>
    );
  };

  // Main layout renderer
  const renderLayout = () => {
    const { type } = layout;

    switch (type) {
      case "sidebar-left":
        return (
          <div className="flex gap-6">
            <aside
              className="rounded-lg p-4"
              style={{
                width: layout.sidebarWidth,
                backgroundColor: mergedColors.sidebarBg || mergedColors.background
              }}
            >
              {layout.sidebarSections.map(section => renderSection(section, true))}
            </aside>
            <main style={{ width: layout.mainWidth }}>
              {layout.mainSections.map(section => renderSection(section))}
            </main>
          </div>
        );

      case "sidebar-right":
        return (
          <div className="flex gap-6">
            <main style={{ width: layout.mainWidth }}>
              {layout.mainSections.map(section => renderSection(section))}
            </main>
            <aside
              className="rounded-lg p-4"
              style={{
                width: layout.sidebarWidth,
                backgroundColor: mergedColors.sidebarBg || mergedColors.background
              }}
            >
              {layout.sidebarSections.map(section => renderSection(section, true))}
            </aside>
          </div>
        );

      case "asymmetric":
        return (
          <div className="flex gap-6">
            <div
              className="relative"
              style={{ width: layout.leftWidth }}
            >
              {layout.accentShapes && (
                <div
                  className="absolute top-0 right-0 w-12 h-12 rounded-full opacity-20"
                  style={{ backgroundColor: mergedColors.shapes }}
                ></div>
              )}
              {layout.leftSections.map(section => renderSection(section))}
            </div>
            <div style={{ width: layout.rightWidth }}>
              {layout.rightSections.map(section => renderSection(section))}
            </div>
          </div>
        );

      case "grid-masonry":
        return (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
              gap: layout.gridGap
            }}
          >
            {layout.sectionsOrder.map(section => (
              <div
                key={section}
                className={`p-4 rounded-lg ${layout.cardBorders ? 'border' : ''}`}
                style={{
                  backgroundColor: mergedColors.cards || mergedColors.background,
                  borderColor: mergedColors.accent + "20"
                }}
              >
                {renderSection(section)}
              </div>
            ))}
          </div>
        );

      case "grid-cards":
        return (
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${layout.columns}, 1fr)` }}
          >
            {layout.sectionsOrder.map(section => (
              <div
                key={section}
                className={`p-6 rounded-lg shadow-md ${layout.shadowDepth === 'medium' ? 'shadow-md' : 'shadow-sm'}`}
                style={{ backgroundColor: mergedColors.cards || mergedColors.background }}
              >
                {renderSection(section)}
              </div>
            ))}
          </div>
        );

      case "timeline-vertical":
        return (
          <div className="relative">
            {layout.sectionsOrder.map(section => renderSection(section))}
          </div>
        );

      case "header-hero":
        return (
          <div>
            {layout.sectionsOrder.map(section => (
              <div
                key={section}
                className={`mb-6 ${layout.cardStyle ? 'p-4 rounded-lg shadow-sm' : ''}`}
                style={{
                  backgroundColor: layout.cardStyle ? mergedColors.background : 'transparent'
                }}
              >
                {renderSection(section)}
              </div>
            ))}
          </div>
        );

      default:
        // Single column layout
        return (
          <div>
            {layout.sectionsOrder.map(section => renderSection(section))}
          </div>
        );
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg"
      style={{
        fontFamily: styles.fontFamily,
        backgroundColor: mergedColors.background,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight
      }}
    >
      {renderHeader()}
      {renderLayout()}
    </div>
  );
}; 