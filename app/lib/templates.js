//import { jobSpecificTemplates } from "./jobSpecificTemplate"; // Corrected typo in import path
import { diverseTemplates } from "./realTemplates.js"; // Import the diverse templates
import { atsFriendlyTemplates } from "./atsFriendlyTemplates.js"; // Import ATS-friendly templates
import { visualAppealTemplates } from "./visualAppealTemplates.js"; // Import Visual Appeal templates
import { onePagerTemplates } from "./onePagerTemplates.js"; // Import One-Pager templates
import { premiumDesignTemplates } from "./premiumDesignTemplates.js"; // Import Premium Design templates

// Configuration options for date formats and section settings
export const defaultConfig = {
  dateFormat: {
    monthDisplay: "short", // "short" (Jan), "long" (January), "numeric" (01)
    yearDisplay: "full", // "full" (2026), "short" (25)
    separator: " ", // space, dot, slash etc
    format: "MMM yyyy" // Default format
  },
  education: {
    showFieldOfStudy: {
      degree: true,
      highSchool: false // Don't show for 10th and 12th
    },
    showStartDate: {
      degree: true,
      highSchool: false // Don't show for 10th and 12th
    },
    showGPA: true,
    showPercentage: true,
    gradeFormat: "both" // "gpa", "percentage", or "both"
  },
  skills: {
    showProficiency: false,
    proficiencyScale: "1-5", // "1-5", "beginner-expert", "percentage"
    groupByCategory: true,
    allowReordering: true,
    displayStyle: "tags" // "list", "grid", "tag"
  },
  typography: {
    fontPair: { id: 'modern', label: 'Modern', fontFamily: "'Inter', sans-serif" },
  },
  sections: {
    reorderEnabled: true,
    collapsible: true,
    customSectionTypes: ["Projects", "Volunteering", "Awards", "Publications"]
  }
};

// ORIGINAL USER TEMPLATES - Restored exactly as they were
const originalUserTemplates = {
  executive_professional: {
    name: "Executive Professional",
    description: "Sophisticated serif design with accent-bar headings for senior roles",
    previewImage: "/templates/previews/executive_professional.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "achievements", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "achievements", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebar: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      sidebarWidth: "30%",
      headerStyle: "elegant",
      headingStyle: "accent-bar",
      entryStyle: "bordered"
    },
    styles: {
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontSize: "11.5pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1a365d",    // Deep navy blue
        secondary: "#4a5568",  // Professional gray
        accent: "#2b6cb0",     // Royal blue
        text: "#2d3748",       // Dark gray
        background: "#ffffff",
        headings: "#1a365d"    // Matching primary for consistency
      },
      sectionTitleStyle: "uppercase",
      sectionSpacing: "1.8rem",
      headerStyle: {
        nameFontSize: "24pt",
        titleSpacing: "0.8rem",
        underlineColor: "#2b6cb0"
      }
    },
    defaultData: {
      personal: {
        name: "",
        jobTitle: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        linkedin: "",
        portfolio: "",
        photo: ""
      },
      summary: "",
      achievements: [],
      skills: [
        {
          category: "Leadership",
          items: []
        },
        {
          category: "Technical",
          items: []
        },
        {
          category: "Business",
          items: []
        }
      ],
      experience: [],
      education: [],
      certifications: []
    }
  },

  minimalist_professional: {
    name: "Minimalist Professional",
    description: "Clean single-column design with minimal decoration for a polished look",
    previewImage: "/templates/previews/minimalist_professional.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      contentWidth: "90%",
      headerStyle: "minimal",
      sectionStyle: "clean",
      headingStyle: "simple",
      entryStyle: "flat"
    },
    styles: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#111827",    // Near black
        secondary: "#6b7280",  // Medium gray
        accent: "#3b82f6",     // Blue
        text: "#374151",       // Dark gray
        background: "#ffffff",
        subtle: "#f3f4f6"      // Light gray for subtle elements
      },
      spacing: {
        sectionGap: "2rem",
        itemGap: "1.5rem",
        contentPadding: "0.75rem"
      },
      typography: {
        headerName: {
          fontSize: "24pt",
          fontWeight: "600",
          letterSpacing: "-0.02em"
        },
        sectionTitle: {
          fontSize: "14pt",
          fontWeight: "500",
          letterSpacing: "0.02em",
          transform: "none"
        },
        subsectionTitle: {
          fontSize: "12pt",
          fontWeight: "500"
        }
      },
      borders: {
        separator: "1px solid #e5e7eb",
        radius: "0px"
      }
    },
    defaultData: {
      personal: {
        name: "",
        jobTitle: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        portfolio: "",
        photo: ""
      },
      summary: "",
      experience: [],
      education: [],
      skills: [
        {
          category: "Core Competencies",
          items: []
        },
        {
          category: "Technical Skills",
          items: []
        }
      ],
      certifications: []
    }
  },
  // Classic Category (Universal Appeal)
  classic: {
    name: "Classic",
    description: "Traditional layout with gradient header and clean bordered sections",
    previewImage: "/templates/previews/classic.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications", "languages"],
      showIcons: false,
      columns: 1,
      headerStyle: "modern",
      headingStyle: "underline",
      entryStyle: "bordered"
    },
    styles: {
      fontFamily: "'Arial', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#2c3e50",
        secondary: "#7f8c8d",
        accent: "#3498db",
        text: "#34495e",
        background: "#ffffff",
      },
    },
    defaultData: {
      personal: {
        name: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        linkedin: "",
        portfolio: "",
        photo: ""
      },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      languages: [],
    },
  },
  classic_with_icons: {
    name: "Classic with Icons",
    description: "Classic layout enhanced with section icons and card-style entries",
    previewImage: "/templates/previews/classic_with_icons.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications", "languages"],
      showIcons: true,
      columns: 1,
      headerStyle: "modern",
      headingStyle: "underline",
      entryStyle: "card"
    },
    styles: {
      fontFamily: "'Arial', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#2c3e50",
        secondary: "#7f8c8d",
        accent: "#3498db",
        text: "#34495e",
        background: "#ffffff",
      },
    },
    defaultData: {
      personal: {
        name: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        linkedin: "",
        portfolio: "",
        photo: ""
      },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      languages: [],
    },
  },

  modern_professional: {
    name: "Modern Professional",
    description: "Two-column layout with highlighted headings and a blue sidebar",
    previewImage: "/templates/previews/modern_professional.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebar: "linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 20%)",
      sidebarWidth: "30%",
      headerStyle: "modern",
      headingStyle: "highlight",
      entryStyle: "bordered",
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "1.25rem"
      }
    },
    styles: {
      fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1e3a8a",
        secondary: "#64748b",
        accent: "#3b82f6",
        text: "#1f2937",
        background: "#ffffff",
        headings: "#1e3a8a"
      },
      typography: {
        headerName: {
          fontSize: "22pt",
          fontWeight: "600",
          letterSpacing: "-0.01em"
        },
        headerTitle: {
          fontSize: "13pt",
          fontWeight: "400",
          letterSpacing: "0.02em",
          color: "secondary"
        },
        sectionTitle: {
          fontSize: "13pt",
          fontWeight: "500",
          letterSpacing: "0.01em",
          marginBottom: "1rem"
        }
      },
      iconStyle: {
        size: "1.2rem",
        color: "accent",
        marginRight: "0.5rem"
      },
    },
    defaultData: {
      personal: { name: "", email: "", phone: "", address: "", dateOfBirth: "", gender: "", maritalStatus: "", linkedin: "", portfolio: "", photo: "" },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    },
  },
  timeline_professional: {
    name: "Timeline Professional",
    description: "Visual timeline markers on entries with a two-column sidebar layout",
    previewImage: "/templates/previews/timeline_professional.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      timelineStyle: true,
      sidebar: "#f7fafc",
      sidebarWidth: "35%",
      headerStyle: "full-width",
      headingStyle: "accent-bar",
      entryStyle: "flat"
    },
    styles: {
      fontFamily: "'Roboto', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#2d3748",
        secondary: "#718096",
        accent: "#3182ce",
        text: "#1a202c",
        background: "#ffffff",
      },
    },
    defaultData: {
      personal: { name: "", email: "", phone: "", address: "", dateOfBirth: "", gender: "", maritalStatus: "", linkedin: "", portfolio: "", photo: "" },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    },
  },



  // standard_ats_optimized removed — ATS templates are in the dedicated ATS-Optimized category

  /*
    creative_professional: {
      name: "Creative Professional",
      previewImage: "/templates/previews/creative_professional.png",
      category: "Professional",
      premium: false,
      layout: {
        sectionsOrder: ["personal", "summary", "experience", "skills", "projects", "education", "certifications", "languages", "customSections"],
        sidebarSections: ["skills", "certifications"],
        mainSections: ["personal", "summary", "experience", "projects", "education"],
        showIcons: true,
        columns: 2,
        sidebar: "left",
        sidebarWidth: "35%",
        sidebarStyle: "accent-background",
        headerStyle: "creative"
      },
      styles: {
        fontFamily: "'Poppins', 'SF Pro Display', system-ui, sans-serif",
        fontSize: "11pt",
        lineHeight: "1.6",
        colors: {
          primary: "#312e81",      // Deep indigo
          secondary: "#6366f1",    // Bright indigo
          accent: "#818cf8",       // Light indigo
          text: "#1f2937",         // Dark gray
          background: "#ffffff",
          sidebarBg: "#eef2ff",   // Light indigo background
          gradient: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)"
        },
        spacing: {
          sectionGap: "2rem",
          elementGap: "1.25rem",
          contentPadding: "1.5rem"
        },
        typography: {
          name: {
            fontSize: "26pt",
            fontWeight: "600",
            backgroundClip: "text",
            gradient: true
          },
          sectionTitles: {
            fontSize: "14pt",
            fontWeight: "500",
            letterSpacing: "0.03em",
            transform: "none"
          }
        },
        effects: {
          shadowDepth: "sm",
          transitions: "all 0.3s ease",
          hover: {
            scale: "1.02",
            shadow: "md"
          }
        }
      },
      defaultData: {
        personal: {
          name: "",
          jobTitle: "",
          email: "",
          phone: "",
          address: "",
          dateOfBirth: "",
          gender: "",
          maritalStatus: "",
          portfolio: "",
          linkedin: "",
          github: ""
        },
        summary: "",
        experience: [],
        skills: [
          {
            category: "Design",
            items: []
          },
          {
            category: "Technical",
            items: []
          },
          {
            category: "Software",
            items: []
          }
        ],
        projects: [],
        education: [],
        certifications: []
      }
    }, */

  // freshers templates removed — redundant with other Standard templates
};



// Combine all templates: Original User Templates FIRST, then Diverse Templates, then Job-Specific LAST
function injectCustomSections(templateObj) {
  const addCustomAndLanguages = (arr, isMainSection = false, templateKey = null, template = null) => {
    if (!arr) return isMainSection ? ["languages", "customSections"] : [];
    let out = [...arr];

    // Only add languages and customSections to mainSections, not sidebarSections
    // Exception: Don't add languages to mainSections for ATS executive template (it should only be in sidebar)
    if (isMainSection) {
      if (!out.includes("customSections")) out.push("customSections");

      // Check if languages are already in sidebar sections - if so, don't add to main sections
      const hasLanguagesInSidebar = template?.layout?.sidebarSections?.includes("languages");

      // Only add languages if:
      // 1. It's not the ATS executive template
      // 2. Languages are not already in sidebar sections
      if (!out.includes("languages") &&
        templateKey !== "ats_two_column_executive" &&
        !hasLanguagesInSidebar) {
        out.push("languages");
      }
    }

    return out;
  };

  const out = {};
  for (const [key, template] of Object.entries(templateObj)) {
    if (!template.layout) {
      out[key] = template;
      continue;
    }
    out[key] = {
      ...template,
      layout: {
        ...template.layout,
        sectionsOrder: addCustomAndLanguages(template.layout.sectionsOrder, true, key, template),
        sidebarSections: template.layout.sidebarSections ? addCustomAndLanguages(template.layout.sidebarSections, false, key, template) : undefined,
        mainSections: template.layout.mainSections ? addCustomAndLanguages(template.layout.mainSections, true, key, template) : undefined,
      }
    };
  }
  return out;
}

export const templates = {
  // PREMIUM DESIGN TEMPLATES FIRST — World-class layouts (Zety/EnhanceCV quality)
  ...injectCustomSections(premiumDesignTemplates),
  // VISUAL APPEAL TEMPLATES — Photo-friendly, eye-catching designs
  ...injectCustomSections(visualAppealTemplates),
  // ATS-FRIENDLY TEMPLATES — High ATS scores, recruiter-approved
  ...injectCustomSections(atsFriendlyTemplates),
  // CLASSIC & PROFESSIONAL TEMPLATES
  ...injectCustomSections(diverseTemplates),
  ...injectCustomSections(originalUserTemplates),
  // ONE-PAGER TEMPLATES (don't need custom sections injection)
  ...onePagerTemplates,
  /*  ...injectCustomSections(jobSpecificTemplates),   */
};

// Export functions to get templates by category and type
export const getTemplatesByCategory = (category) => {
  return Object.entries(templates).filter(([key, template]) => template.category === category);
};

export const getFreeTemplates = () => {
  return Object.entries(templates).filter(([key, template]) => !template.premium);
};

export const getAllTemplateCategories = () => {
  const categories = new Set();
  Object.values(templates).forEach(template => {
    if (template.category) {
      categories.add(template.category);
    }
  });
  return Array.from(categories).sort();
};

export const getTemplateStats = () => {
  const allTemplates = Object.values(templates);
  const categories = getAllTemplateCategories();

  return {
    total: allTemplates.length,
    free: allTemplates.filter(t => !t.premium).length,
    premium: allTemplates.filter(t => t.premium).length,
    categories: categories.length,
    byCategory: categories.reduce((acc, category) => {
      acc[category] = allTemplates.filter(t => t.category === category).length;
      return acc;
    }, {})
  };
};

// Combine original templates into a single lookup object for switching (backward compatibility)
export const originalTemplates = {
  ...templates, // Include all templates
};

// Note: For the comprehensive template collection with 120+ templates,
// import directly from './allTemplates.js' instead of this file