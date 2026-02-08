"use client";
import { useRef, useState, useEffect } from "react";
import { jobSpecificTemplates } from "../lib/jobSpecificTemplate";

export default function JobSpecificResumePreview({
  data,
  template,
  customColors,
  language,
  country,
  isPremium,
}) {
  const previewRef = useRef(null);
  const config = jobSpecificTemplates[template] || jobSpecificTemplates["government_job"];
  const styles = {
    ...config.styles,
    colors: { ...config.styles.colors, ...(customColors[template] || {}) },
  };

  const [scale, setScale] = useState(1);

  // Helper booleans derived from layout config
  const useSectionCards = config.layout?.sectionCard || false;
  const showSectionDividers =
    config.layout?.sectionDividers !== undefined ? config.layout.sectionDividers : true;
  const headerType = config.layout?.headerType || "picture-top";
  const hasHeader = headerType === "banner" || headerType === "picture-left" || headerType === "picture-top" || 
                    headerType === "modern-tech" || headerType === "executive-banner" || headerType === "creative-hero" ||
                    headerType === "medical-banner" || headerType === "tech-banner" || headerType === "official-header";

  useEffect(() => {
    const updateScale = () => {
      const containerWidth = 794; // A4 width in pixels at 96 DPI
      const screenWidth = window.innerWidth;
      const newScale = Math.min(1, screenWidth / containerWidth);
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const mergedData = {
    ...config.defaultData,
    ...data,
    personal: { ...config.defaultData.personal, ...data.personal },
    summary: data.summary || config.defaultData.summary,
    skills: data.skills && data.skills.length > 0 ? data.skills : config.defaultData.skills,
    projects: data.projects && data.projects.length > 0 ? data.projects : config.defaultData.projects || [],
    experience: data.experience && data.experience.length > 0 ? data.experience : config.defaultData.experience || [],
    education: data.education && data.education.length > 0 ? data.education : config.defaultData.education,
    certifications:
      data.certifications && data.certifications.length > 0
        ? data.certifications
        : config.defaultData.certifications || [],
    languages: data.languages && data.languages.length > 0 ? data.languages : config.defaultData.languages || [],
    achievements:
      data.achievements && data.achievements.length > 0 ? data.achievements : config.defaultData.achievements || [],
    references: data.references && data.references.length > 0 ? data.references : config.defaultData.references || [],
    portfolio: data.portfolio && data.portfolio.length > 0 ? data.portfolio : config.defaultData.portfolio || [],
  };

  const getPhotoUrl = (photo) => {
    if (photo && photo.startsWith("data:image")) return photo; // Base64 data URL only
    return null; // No default photo
  };

  // Only show photo in header if hasHeader is true
  const shouldShowPhotoInHeader = hasHeader;

  const renderSection = (sectionKey) => {
    const sectionData = sectionKey === "personal.photo" ? mergedData.personal.photo : mergedData[sectionKey];
    if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) return null;

    // Do not render personal.photo section if header is present
    if (sectionKey === "personal.photo" && shouldShowPhotoInHeader) return null;

    // Do not render personal section if header is present
    if (sectionKey === "personal" && hasHeader) return null;

    if (sectionKey === "personal" && !config.layout.sidebarSections.includes("personal.photo") && !hasHeader) {
      return (
        <div key={sectionKey} className="mb-6 text-center border-b" style={{ borderColor: styles.colors.primary }}>
          <h1 style={{ fontSize: "16pt", fontWeight: "bold", color: styles.colors.primary }}>
            {sectionData.name || "Name"}
          </h1>
          <p style={{ fontSize: "9pt", color: styles.colors.secondary }}>
            {[sectionData.email, sectionData.phone, sectionData.location].filter(Boolean).join(" | ") ||
              "Email | Phone | Location"}
          </p>
        </div>
      );
    }

    if (sectionKey === "personal.photo" && sectionData) {
      const photoUrl = getPhotoUrl(sectionData);
      if (!photoUrl) return null;
      return (
        <div key={sectionKey} className="mb-4 text-center">
          <img
            src={photoUrl}
            alt="Profile"
            style={{
              width: styles.photo?.size || "100px",
              height: styles.photo?.size || "100px",
              borderRadius: styles.photo?.shape === "circle" ? "50%" : "8px",
              border: styles.photo?.border || "none",
              objectFit: "cover",
              boxShadow: styles.photo?.shadow || "0 2px 8px rgba(0,0,0,0.1)",
              margin: "0 auto",
            }}
          />
        </div>
      );
    }

    if (sectionKey === "personal") {
      return (
        <div key={sectionKey} className="mb-6 text-center border-b" style={{ borderColor: styles.colors.primary }}>
          <h1 style={{ fontSize: "18pt", fontWeight: "bold", color: styles.colors.primary }}>
            {sectionData.name || "Name"}
          </h1>
          <p style={{ fontSize: "10pt", color: styles.colors.secondary }}>
            {[sectionData.email, sectionData.phone, sectionData.location].filter(Boolean).join(" | ") ||
              "Email | Phone | Location"}
          </p>
        </div>
      );
    }

    // Enhanced section rendering with icons and better styling
    const sectionIcon = styles.icons?.[sectionKey] || "";
    const sectionTitle = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace("_", " ");

    return (
      <div key={sectionKey} className="mb-4">
        <h2 style={{ 
          color: styles.colors.primary, 
          fontSize: "13pt", 
          fontWeight: "700", 
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          letterSpacing: "-0.2px"
        }}>
          {sectionIcon && <span style={{ fontSize: "14pt" }}>{sectionIcon}</span>}
          {sectionTitle}
        </h2>
        
        {/* Skills section with enhanced styling */}
        {sectionKey === "skills" && Array.isArray(sectionData) ? (
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "6px",
            marginBottom: "8px"
          }}>
            {sectionData.slice(0, 12).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  background: styles.colors.cardBg || "#f8fafc",
                  color: styles.colors.primary,
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "9pt",
                  fontWeight: "500",
                  border: `1px solid ${styles.colors.border || "#e2e8f0"}`,
                  whiteSpace: "nowrap"
                }}
              >
                {typeof skill === 'string' ? skill : (skill.name || skill)}
              </span>
            ))}
          </div>
        ) : Array.isArray(sectionData) ? (
          sectionData.map((item, idx) => (
            <div key={idx} className="mb-3" style={{
              padding: config.layout?.sectionCard ? "8px 0" : "4px 0",
              borderBottom: idx < sectionData.length - 1 ? `1px solid ${styles.colors.border || "#f0f0f0"}` : "none"
            }}>
              {typeof item === "string" ? (
                <p style={{ color: styles.colors.text, fontSize: "10pt", lineHeight: "1.4" }}>
                  {item}
                </p>
              ) : (
                <div>
                  {/* Enhanced rendering for different item types */}
                  {item.title && (
                    <h3 style={{
                      color: styles.colors.text,
                      fontSize: "11pt",
                      fontWeight: "600",
                      marginBottom: "2px",
                      lineHeight: "1.3"
                    }}>
                      {item.title}
                    </h3>
                  )}
                  {item.company && (
                    <p style={{
                      color: styles.colors.secondary,
                      fontSize: "10pt",
                      fontWeight: "500",
                      marginBottom: "2px"
                    }}>
                      {item.company}
                    </p>
                  )}
                  {item.institution && (
                    <p style={{
                      color: styles.colors.secondary,
                      fontSize: "10pt",
                      fontWeight: "500",
                      marginBottom: "2px"
                    }}>
                      {item.institution}
                    </p>
                  )}
                  {(item.startDate || item.endDate) && (
                    <p style={{
                      color: styles.colors.accent,
                      fontSize: "9pt",
                      fontWeight: "500",
                      marginBottom: "4px"
                    }}>
                      {[item.startDate, item.endDate].filter(Boolean).join(" - ")}
                    </p>
                  )}
                  {item.description && (
                    <p style={{
                      color: styles.colors.text,
                      fontSize: "10pt",
                      lineHeight: "1.4",
                      marginBottom: "4px"
                    }}>
                      {item.description}
                    </p>
                  )}
                  {item.technologies && (
                    <p style={{
                      color: styles.colors.secondary,
                      fontSize: "9pt",
                      fontStyle: "italic",
                      marginTop: "4px"
                    }}>
                      <strong>Technologies:</strong> {item.technologies}
                    </p>
                  )}
                  {/* Render other fields */}
                  {Object.entries(item)
                    .filter(([key]) => !["title", "company", "institution", "startDate", "endDate", "description", "technologies"].includes(key))
                    .map(([key, value]) =>
                      value ? (
                        <p
                          key={key}
                          style={{
                            color: styles.colors.secondary,
                            fontSize: "10pt",
                            marginBottom: "2px"
                          }}
                        >
                          <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {typeof value === 'object' && value !== null ? JSON.stringify(value) : value}
                        </p>
                      ) : null
                    )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={{ 
            color: styles.colors.text, 
            fontSize: "10pt", 
            lineHeight: "1.5",
            marginBottom: "8px"
          }}>
            {typeof sectionData === 'object' && sectionData !== null ? JSON.stringify(sectionData) : sectionData}
          </p>
        )}
      </div>
    );
  };

  const allSections = [
    ...new Set([
      ...config.layout.sectionsOrder,
      ...Object.keys(mergedData).filter((key) => key !== "personal" && !config.layout.sectionsOrder.includes(key)),
    ]),
  ];
  const sidebarSections = config.layout.sidebarSections || [];
  const mainSections = allSections.filter((section) => !sidebarSections.includes(section));
  const sidebarDirection = config.layout.sidebar || "left";

  const cleanedMainSections = hasHeader
    ? mainSections.filter((s) => s !== "personal")
    : mainSections;

  const renderSectionWithWrapper = (sectionKey, idx, arr) => {
    const sectionContent = renderSection(sectionKey);
    if (!sectionContent) return null;

    const wrapperStyle = useSectionCards
      ? {
          background: styles.colors.sidebar || "#f9fafb",
          border: `1px solid ${styles.colors.secondary}30`,
          borderRadius: 8,
          padding: "16px 20px", // Added horizontal padding
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          marginBottom: "16px", // Consistent section spacing
        }
      : {
          marginBottom: "16px", // Consistent section spacing for non-card style
        };

    return (
      <div key={sectionKey} style={wrapperStyle}>
        {sectionContent}
        {showSectionDividers && !useSectionCards && idx < arr.length - 1 && (
          <div
            style={{
              borderBottom: `1px solid ${styles.colors.secondary}20`, // Lighter divider
              margin: "12px 0", // Consistent divider spacing
            }}
          />
        )}
      </div>
    );
  };

  const renderHeaderBlock = () => {
    if (!hasHeader) return null;
    const photoUrl = getPhotoUrl(mergedData.personal.photo);
    
    // Template-specific header rendering
    if (headerType === "modern-tech") {
      return (
        <div style={{
          background: styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`,
          color: "#ffffff",
          borderRadius: "15px 15px 0 0",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "100px",
            height: "100px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            transform: "translate(30px, -30px)"
          }} />
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Profile"
              style={{
                width: styles.photo?.size || "80px",
                height: styles.photo?.size || "80px",
                borderRadius: styles.photo?.shape === "circle" ? "50%" : "12px",
                objectFit: "cover",
                border: styles.photo?.border || "3px solid rgba(255,255,255,0.3)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "20pt", fontWeight: "700", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              {mergedData.personal.name || "Your Name"}
            </h1>
            <p style={{ fontSize: "12pt", opacity: 0.9, margin: "0 0 4px", fontWeight: "500" }}>
              Software Developer & Tech Enthusiast
            </p>
            <p style={{ fontSize: "10pt", opacity: 0.8, margin: 0 }}>
              {[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location]
                .filter(Boolean)
                .join(" • ")}
            </p>
          </div>
        </div>
      );
    }

    if (headerType === "executive-banner") {
      return (
        <div style={{
          background: styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`,
          color: "#ffffff",
          padding: "20px 24px",
          textAlign: "center",
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            height: "4px",
            background: styles.colors.accent
          }} />
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Profile"
              style={{
                width: styles.photo?.size || "70px",
                height: styles.photo?.size || "70px",
                borderRadius: styles.photo?.shape === "circle" ? "50%" : "8px",
                objectFit: "cover",
                border: "3px solid rgba(255,255,255,0.9)",
                margin: "0 auto 12px",
                display: "block"
              }}
            />
          )}
          <h1 style={{ fontSize: "18pt", fontWeight: "600", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
            {mergedData.personal.name || "Your Name"}
          </h1>
          <p style={{ fontSize: "11pt", opacity: 0.9, margin: "0 0 8px", fontWeight: "500" }}>
            Banking & Finance Professional
          </p>
          <p style={{ fontSize: "9pt", opacity: 0.8, margin: 0 }}>
            {[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location]
              .filter(Boolean)
              .join(" • ")}
          </p>
        </div>
      );
    }

    if (headerType === "creative-hero") {
      return (
        <div style={{
          background: styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`,
          color: "#ffffff",
          borderRadius: "20px 20px 0 0",
          padding: "28px 24px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "150px",
            height: "150px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%"
          }} />
          <div style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "100px",
            height: "100px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "50%"
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: "20px", position: "relative", zIndex: 1 }}>
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Profile"
                style={{
                  width: styles.photo?.size || "90px",
                  height: styles.photo?.size || "90px",
                  borderRadius: "15px",
                  objectFit: "cover",
                  border: "4px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "22pt", fontWeight: "700", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
                {mergedData.personal.name || "Your Name"}
              </h1>
              <p style={{ fontSize: "13pt", opacity: 0.9, margin: "0 0 6px", fontWeight: "500" }}>
                Creative Designer & Visual Artist
              </p>
              <p style={{ fontSize: "10pt", opacity: 0.8, margin: 0 }}>
                {[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (headerType === "medical-banner") {
      return (
        <div style={{
          background: styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`,
          color: "#ffffff",
          borderRadius: "12px 12px 0 0",
          padding: "24px",
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "60px",
            height: "60px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%"
          }} />
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Profile"
              style={{
                width: styles.photo?.size || "80px",
                height: styles.photo?.size || "80px",
                borderRadius: styles.photo?.shape === "circle" ? "50%" : "10px",
                objectFit: "cover",
                border: "3px solid rgba(255,255,255,0.9)",
                margin: "0 auto 12px",
                display: "block"
              }}
            />
          )}
          <h1 style={{ fontSize: "18pt", fontWeight: "600", margin: "0 0 6px", textAlign: "center" }}>
            {mergedData.personal.name || "Your Name"}
          </h1>
          <p style={{ fontSize: "12pt", opacity: 0.9, margin: "0 0 8px", fontWeight: "500", textAlign: "center" }}>
            Healthcare Professional
          </p>
          <p style={{ fontSize: "10pt", opacity: 0.8, margin: 0, textAlign: "center" }}>
            {[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location]
              .filter(Boolean)
              .join(" • ")}
          </p>
        </div>
      );
    }

    if (headerType === "tech-banner") {
      return (
        <div style={{
          background: styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`,
          color: "#ffffff",
          borderRadius: "8px 8px 0 0",
          padding: "20px 24px",
          position: "relative",
          fontFamily: "monospace"
        }}>
          <div style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            height: "3px",
            background: `linear-gradient(90deg, ${styles.colors.accent} 0%, ${styles.colors.secondary} 100%)`
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Profile"
                style={{
                  width: styles.photo?.size || "70px",
                  height: styles.photo?.size || "70px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.8)"
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "20pt", fontWeight: "700", margin: "0 0 6px", fontFamily: "monospace" }}>
                {mergedData.personal.name || "Your Name"}
              </h1>
              <p style={{ fontSize: "12pt", opacity: 0.9, margin: "0 0 4px", fontWeight: "500", fontFamily: "monospace" }}>
                Data Scientist & ML Engineer
              </p>
              <p style={{ fontSize: "9pt", opacity: 0.8, margin: 0, fontFamily: "monospace" }}>
                {[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (headerType === "official-header") {
      return (
        <div style={{
          background: styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`,
          color: "#ffffff",
          padding: "16px 24px",
          textAlign: "center",
          borderBottom: `4px solid ${styles.colors.accent}`
        }}>
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Profile"
              style={{
                width: styles.photo?.size || "60px",
                height: styles.photo?.size || "60px", 
                borderRadius: "6px",
                objectFit: "cover",
                border: "2px solid rgba(255,255,255,0.9)",
                margin: "0 auto 10px",
                display: "block"
              }}
            />
          )}
          <h1 style={{ fontSize: "16pt", fontWeight: "600", margin: "0 0 4px" }}>
            {mergedData.personal.name || "Your Name"}
          </h1>
          <p style={{ fontSize: "11pt", opacity: 0.9, margin: "0 0 6px", fontWeight: "500" }}>
            Government Service Professional
          </p>
          <p style={{ fontSize: "9pt", opacity: 0.8, margin: 0 }}>
            {[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location]
              .filter(Boolean)
              .join(" • ")}
          </p>
        </div>
      );
    }

    // Default header styles
    const baseStyle = {
      background: styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`,
      color: "#ffffff",
      borderRadius: "12px 12px 0 0",
      padding: "32px 24px",
      minHeight: "120px",
      display: "flex",
      alignItems: "center",
    };

    if (headerType === "banner") {
      return (
        <div style={{ ...baseStyle, textAlign: "center" }}>
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Profile"
              style={{
                width: styles.photo?.size || "56px",
                height: styles.photo?.size || "56px",
                borderRadius: styles.photo?.shape === "circle" ? "50%" : "8px",
                objectFit: "cover",
                border: styles.photo?.border || `2px solid ${styles.colors.accent}`,
                boxShadow: styles.photo?.shadow || "0 2px 8px rgba(0,0,0,0.10)",
                margin: "0 auto 6px",
              }}
            />
          )}
          <h1 style={{ fontSize: "16pt", fontWeight: "bold", margin: "0 0 6px" }}>
            {mergedData.personal.name || "Your Name"}
          </h1>
          <p style={{ fontSize: "10pt", opacity: 0.9, margin: 0, letterSpacing: "0.02em" }}>
            {[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location]
              .filter(Boolean)
              .join(" • ")}
          </p>
        </div>
      );
    }

    if (headerType === "picture-left") {
      return (
        <div
          style={{
            ...baseStyle,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Profile"
              style={{
                width: styles.photo?.size || "44px",
                height: styles.photo?.size || "44px",
                borderRadius: styles.photo?.shape === "circle" ? "50%" : "8px",
                objectFit: "cover",
                border: styles.photo?.border || `2px solid ${styles.colors.accent}`,
                boxShadow: styles.photo?.shadow || "0 2px 8px rgba(0,0,0,0.10)",
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "16pt", fontWeight: "bold", margin: "0 0 6px" }}>
              {mergedData.personal.name || "Your Name"}
            </h1>
            <p style={{ fontSize: "10pt", opacity: 0.9, margin: 0, letterSpacing: "0.02em" }}>
              {[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location]
                .filter(Boolean)
                .join(" • ")}
            </p>
          </div>
        </div>
      );
    }

    if (headerType === "picture-top") {
      return (
        <div style={{ ...baseStyle, textAlign: "left", padding: "12px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Profile"
                style={{
                  width: styles.photo?.size || "48px",
                  height: styles.photo?.size || "48px",
                  borderRadius: styles.photo?.shape === "circle" ? "50%" : "8px",
                  objectFit: "cover",
                  border: styles.photo?.border || `2px solid ${styles.colors.accent}`,
                  boxShadow: styles.photo?.shadow || "0 2px 8px rgba(0,0,0,0.10)",
                }}
              />
            )}
            <div>
              <h1 style={{ fontSize: "16pt", fontWeight: "bold", margin: "0 0 6px" }}>
                {mergedData.personal.name || "Your Name"}
              </h1>
              <p style={{ fontSize: "10pt", opacity: 0.9, margin: 0, letterSpacing: "0.02em" }}>
                {[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="resume-preview"
      style={{
        width: "660px",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        margin: "0 auto",
        overflow: "visible",
        wordBreak: "keep-all",
        hyphens: "manual",
        overflowWrap: "normal",
        whiteSpace: "normal",
        textRendering: "optimizeLegibility",
        WebkitFontFeatureSettings: '"liga" 1, "kern" 1',
        fontFeatureSettings: '"liga" 1, "kern" 1',
      }}
      ref={previewRef}
    >
      <div
        className="w-full relative"
        style={{
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
          backgroundColor: styles.colors.background,
          color: styles.colors.text,
        }}
      >
        {renderHeaderBlock()}
        <div
          className={`flex flex-row gap-6 ${
            sidebarDirection === "right" && sidebarSections.length > 0 ? "flex-row-reverse" : ""
          }`}
          style={{ padding: "0" }} // Remove padding between header and content
        >
          {sidebarSections.length > 0 && (
            <div
              style={{
                width: config.layout.sidebarWidth ? `${config.layout.sidebarWidth}` : "280px",
                background: styles.colors.sidebar || styles.colors.background,
                padding: "20px",
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {sidebarSections.map((sectionKey, idx) =>
                renderSectionWithWrapper(sectionKey, idx, sidebarSections)
              )}
            </div>
          )}
          <div
            style={{
              width: sidebarSections.length > 0 ? `calc(794px - ${config.layout.sidebarWidth || "280px"} - 24px)` : "794px",
              padding: "20px 12px",
            }}
          >
            {cleanedMainSections.map((sectionKey, idx) =>
              renderSectionWithWrapper(sectionKey, idx, cleanedMainSections)
            )}
          </div>
        </div>
        {!isPremium && (
          <div
            className="watermark"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-45deg)",
              fontSize: "1.5rem",
              color: "rgba(0, 0, 0, 0.4)",
              fontFamily: styles.fontFamily,
              pointerEvents: "none",
              zIndex: 1000,
              textAlign: "center",
              whiteSpace: "nowrap",
              fontWeight: "bold",
            }}
          >
            Generated by ExpertResume
          </div>
        )}
      </div>
    </div>
  );
}