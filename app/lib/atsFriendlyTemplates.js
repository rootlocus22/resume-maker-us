// ATS-FRIENDLY TEMPLATES - Industry Standard Resume Templates
// These templates are designed to achieve 80+ ATS scores with clean formatting,
// proper structure, and industry-standard layouts

export const atsFriendlyTemplates = {
  // ============================
  // 1. CLASSIC ATS OPTIMIZED
  // ============================
  ats_two_column_executive: {
    name: "ATS Two-Column Executive",
    previewImage: "/templates/previews/ats_two_column_executive.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications", "projects", "customSections"],
      sidebarSections: ["education", "skills", "languages", "certifications"],
      mainSections: ["summary", "experience", "projects", "customSections"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "executive-two-column",
      spacing: "executive",
      atsOptimized: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top"
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#8B4513",
        secondary: "#2F2F2F",
        accent: "#D2B48C",
        text: "#2F2F2F",
        background: "#FFFFFF",
        sidebarBackground: "#F5F5DC"
      },
      spacing: {
        sectionGap: "1.5rem",
        paragraphGap: "0.75rem",
        headerGap: "1rem"
      }
    },
    atsFeatures: {
      cleanLayout: true,
      standardFonts: true,
      properSpacing: true,
      clearSectionHeaders: true,
      optimizedKeywords: true,
      professionalFormat: true,
      twoColumnOptimized: true
    }
  },

  /*  ats_professional_profile: {
     name: "ATS Professional Profile",
     previewImage: "/templates/previews/ats_professional_profile.png",
     category: "ATS-Optimized",
     premium: false,
     layout: {
       sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications", "projects", "awards", "customSections"],
       sidebarSections: [],
       mainSections: ["personal", "summary", "experience", "education", "skills", "languages", "certifications", "projects", "awards", "customSections"],
       showIcons: false,
       columns: 1,
       headerStyle: "profile-left",
       spacing: "professional",
       atsOptimized: true,
       showProfilePicture: true,
       profilePicturePosition: "left"
     },
     styles: {
       fontFamily: "'Arial', 'Helvetica', sans-serif",
       fontSize: "11pt",
       lineHeight: "1.4",
       colors: {
         primary: "#1e40af",
         secondary: "#374151",
         accent: "#6b7280",
         text: "#111827",
         background: "#ffffff"
       },
       spacing: {
         sectionGap: "1.5rem",
         paragraphGap: "0.75rem",
         headerGap: "1rem"
       }
     },
     atsFeatures: {
       cleanLayout: true,
       standardFonts: true,
       properSpacing: true,
       clearSectionHeaders: true,
       optimizedKeywords: true,
       professionalFormat: true
     }
   }, */

  ats_tech_engineer: {
    name: "ATS Tech Engineer",
    previewImage: "/templates/previews/ats_tech_engineer.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "32%",
      headerStyle: "tech",
      spacing: "tech",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
      fontSize: "10pt",
      lineHeight: "1.3",
      colors: {
        primary: "#1e40af",
        secondary: "#1e3a8a",
        accent: "#3b82f6",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#f1f5f9"
      },
      spacing: {
        sectionGap: "1.25rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      techOptimized: true
    }
  },

  ats_classic_standard: {
    name: "ATS Classic Standard",
    previewImage: "/templates/previews/ats_classic_standard.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "standard",
      spacing: "standard",
      atsOptimized: true,
      skillsLayout: "multi-column", // Enable multi-column skills layout
      maxSkillsPerColumn: 5 // Maximum skills per column
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.5rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true
    }
  },

  ats_classic_professional: {
    name: "ATS Classic Professional",
    previewImage: "/templates/previews/ats_classic_professional.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "skills", "experience", "education", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "professional",
      spacing: "comfortable",
      atsOptimized: true,
      skillsLayout: "multi-column", // Enable multi-column skills layout
      maxSkillsPerColumn: 5 // Maximum skills per column
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#000000",
        secondary: "#444444",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true
    }
  },

  ats_entry_level_standard: {
    name: "ATS Entry Level Standard",
    previewImage: "/templates/previews/ats_entry_level_standard.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "education", "skills", "experience", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "education", "skills", "experience", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "entry-level",
      spacing: "entry-level",
      atsOptimized: true,
      skillsLayout: "multi-column", // Enable multi-column skills layout
      maxSkillsPerColumn: 5 // Maximum skills per column
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.5rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      entryLevelOptimized: true
    }
  },

  // ============================
  // 2. MODERN ATS OPTIMIZED
  // ============================
  ats_modern_clean: {
    name: "ATS Modern Clean",
    previewImage: "/templates/previews/ats_modern_clean.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "modern",
      spacing: "modern",
      atsOptimized: true,
      skillsLayout: "multi-column", // Enable multi-column skills layout
      maxSkillsPerColumn: 5 // Maximum skills per column
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#2c3e50",
        secondary: "#34495e",
        accent: "#2c3e50",
        text: "#2c3e50",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.25rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true
    }
  },

  ats_modern_executive: {
    name: "ATS Modern Executive",
    previewImage: "/templates/previews/ats_modern_executive.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "executive",
      spacing: "executive",
      atsOptimized: true,
      skillsLayout: "multi-column", // Enable multi-column skills layout
      maxSkillsPerColumn: 5 // Maximum skills per column
    },
    styles: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1a1a1a",
        secondary: "#404040",
        accent: "#1a1a1a",
        text: "#1a1a1a",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "2rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true
    }
  },

  // ============================
  // 3. TWO-COLUMN ATS OPTIMIZED
  // ============================
  ats_two_column_standard: {
    name: "ATS Two-Column Standard",
    previewImage: "/templates/previews/ats_two_column_standard.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "standard",
      spacing: "standard",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.5rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true
    }
  },

  ats_two_column_professional: {
    name: "ATS Two-Column Professional",
    previewImage: "/templates/previews/ats_two_column_professional.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "professional",
      spacing: "comfortable",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#000000",
        secondary: "#444444",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true
    }
  },


  // ============================
  // 4. INDUSTRY-SPECIFIC ATS
  // ============================

  ats_finance_analyst: {
    name: "ATS Finance Analyst",
    previewImage: "/templates/previews/ats_finance_analyst.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "finance",
      spacing: "finance",
      atsOptimized: true,
      skillsLayout: "multi-column", // Enable multi-column skills layout
      maxSkillsPerColumn: 5 // Maximum skills per column
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1f2937",
        secondary: "#374151",
        accent: "#059669",
        text: "#1f2937",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.5rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      financeOptimized: true
    }
  },

  ats_healthcare_professional: {
    name: "ATS Healthcare Professional",
    previewImage: "/templates/previews/ats_healthcare_professional.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "healthcare",
      spacing: "healthcare",
      atsOptimized: true,
      skillsLayout: "multi-column", // Enable multi-column skills layout
      maxSkillsPerColumn: 5 // Maximum skills per column
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#059669",
        secondary: "#047857",
        accent: "#10b981",
        text: "#1f2937",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.5rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      healthcareOptimized: true
    }
  },

  ats_marketing_specialist: {
    name: "ATS Marketing Specialist",
    previewImage: "/templates/previews/ats_marketing_specialist.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "marketing",
      spacing: "marketing",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#7c3aed",
        secondary: "#6d28d9",
        accent: "#a855f7",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#faf5ff"
      },
      spacing: {
        sectionGap: "1.25rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      marketingOptimized: true
    }
  },

  // ============================
  // 5. ENTRY-LEVEL ATS OPTIMIZED
  // ============================

  // ============================
  // 6. EXECUTIVE ATS OPTIMIZED
  // ============================
  ats_c_level_executive: {
    name: "ATS C-Level Executive",
    previewImage: "/templates/previews/ats_c_level_executive.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "c-level",
      spacing: "c-level",
      atsOptimized: true,
      skillsLayout: "multi-column", // Enable multi-column skills layout
      maxSkillsPerColumn: 5 // Maximum skills per column
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#000000",
        text: "#000000",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "2.25rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      cLevelOptimized: true
    }
  },

  // ============================
  // 7. SPECIALIZED ATS OPTIMIZED
  // ============================
  // ============================
  // 8. NEW INDUSTRY-SPECIFIC ATS TEMPLATES
  // ============================
  ats_mechanical_engineer: {
    name: "ATS Mechanical Engineer",
    previewImage: "/templates/previews/ats_mechanical_engineer.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "mechanical",
      spacing: "mechanical",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#dc2626",
        secondary: "#b91c1c",
        accent: "#ef4444",
        text: "#1f2937",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.25rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      engineeringOptimized: true
    }
  },

  ats_sales_professional: {
    name: "ATS Sales Professional",
    previewImage: "/templates/previews/ats_sales_professional.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "28%",
      headerStyle: "sales",
      spacing: "sales",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#dc2626", // RED for sales
        secondary: "#b91c1c", // Darker red
        accent: "#ef4444", // Lighter red
        text: "#1f2937",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.25rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      salesOptimized: true
    }
  },

  ats_hr_specialist: {
    name: "ATS HR Specialist",
    previewImage: "/templates/previews/ats_hr_specialist.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "hr",
      spacing: "hr",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#059669",
        secondary: "#047857",
        accent: "#10b981",
        text: "#1f2937",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.5rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      hrOptimized: true
    }
  },

  ats_data_scientist: {
    name: "ATS Data Scientist",
    previewImage: "/templates/previews/ats_data_scientist.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications", "customSections"],
      sidebarSections: ["skills", "languages", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "data-scientist",
      spacing: "modern",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#059669",
        secondary: "#047857",
        accent: "#10b981",
        text: "#1f2937",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.25rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      dataScienceOptimized: true
    }
  },

  ats_creative_designer: {
    name: "ATS Creative Designer",
    previewImage: "/templates/previews/ats_creative_designer.png",
    category: "ATS-Optimized",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications", "projects", "awards", "customSections"],
      sidebarSections: ["skills", "languages", "certifications", "projects"],
      mainSections: ["personal", "summary", "experience", "education", "awards", "customSections"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "creative",
      spacing: "creative",
      atsOptimized: true
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#ec4899",
        text: "#1f2937",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "1.25rem",
        contentPadding: "0"
      }
    },
    atsFeatures: {
      cleanFormatting: true,
      standardFonts: true,
      properHeadings: true,
      keywordOptimized: true,
      scanFriendly: true,
      creativeOptimized: true
    }
  },

  // ============================
  // ONE-PAGER TEMPLATES - TRUE ONE-PAGE DESIGNS
  // ============================


};

// ATS Template Features and Benefits
export const atsTemplateFeatures = {
  cleanFormatting: "Clean, simple formatting that ATS systems can easily parse",
  standardFonts: "Uses standard fonts (Arial, Times New Roman, Calibri) for maximum compatibility",
  properHeadings: "Clear section headings that ATS systems can identify and categorize",
  keywordOptimized: "Layout optimized for keyword scanning and matching",
  scanFriendly: "Structure designed for easy ATS scanning and parsing",
  compactLayout: "Optimized spacing and layout to fit comprehensive content on a single page",
  ultraCompactLayout: "Ultra-compact spacing and layout designed to fit maximum content on a single page with minimal whitespace",
  techOptimized: "Specifically optimized for technology and engineering roles",
  financeOptimized: "Tailored for financial and accounting professionals",
  healthcareOptimized: "Designed for healthcare and medical professionals",
  marketingOptimized: "Optimized for marketing and communications roles",
  entryLevelOptimized: "Perfect for entry-level positions and recent graduates",
  studentOptimized: "Ideal for students and academic professionals",
  executiveOptimized: "Designed for senior-level and executive positions",
  cLevelOptimized: "Tailored for C-suite and board-level positions",
  legalOptimized: "Optimized for legal and compliance professionals",
  consultingOptimized: "Perfect for consulting and advisory roles",
  twoColumnOptimized: "Designed for two-column layouts with a sidebar"
};

// ATS Template Categories
export const atsTemplateCategories = {
  "ATS-Optimized": "Templates specifically designed to achieve 80+ ATS scores with clean formatting and proper structure",
  "One-Pager Templates": "Single-page, clean, professional resumes designed for quick, impactful presentation"
};

// Get ATS templates by category
export const getATSTemplatesByCategory = (category) => {
  return Object.entries(atsFriendlyTemplates)
    .filter(([key, template]) => template.category === category)
    .reduce((acc, [key, template]) => {
      acc[key] = template;
      return acc;
    }, {});
};

// Get all ATS templates
export const getAllATSTemplates = () => {
  return atsFriendlyTemplates;
};

// Get ATS template features
export const getATSTemplateFeatures = () => {
  return atsTemplateFeatures;
};

export default atsFriendlyTemplates;
