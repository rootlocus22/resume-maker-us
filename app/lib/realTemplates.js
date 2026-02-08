// REAL TEMPLATE COLLECTION - DIVERSE LAYOUTS LIKE CANVA
// Cleaned up collection with only high-quality, working templates

// Diverse layout templates with genuinely different structures
export const diverseTemplates = {
   // ============================
   infographic_professional: {
    name: "Professional Infographic",
    previewImage: "/templates/previews/infographic_professional.png",
    category: "Infographic",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "skills", "experience", "education", "certifications"],
      showIcons: true,
      columns: 1,
      headerStyle: "minimal",
      visualElements: true,
      progressBars: true,
      spacing: "comfortable"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "14px",  
      lineHeight: "1.6",
      colors: {
        primary: "#1f2937",
        secondary: "#6b7280",
        accent: "#3b82f6", 
        text: "#374151",
        background: "#ffffff",
        charts: "#f8fafc"
      }
    }
  },

  // ============================
  // 5. MINIMAL DESIGNS
  // ============================
  minimal_clean: {
    name: "Clean Minimal",
    previewImage: "/templates/previews/minimal_clean.png",
    category: "Minimal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      headerStyle: "minimal",
      spacing: "minimal"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "14px",
      lineHeight: "1.7",
      colors: {
        primary: "#1f2937",
        secondary: "#6b7280",
        accent: "#3b82f6",
        text: "#374151",
        background: "#ffffff"
      }
    }
  },

  minimal_swiss: {
    name: "Swiss Typography",
    previewImage: "/templates/previews/minimal_swiss.png",
    category: "Minimal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      headerStyle: "minimal",
      spacing: "swiss"
    },
    styles: {
      fontFamily: "'Helvetica Neue', sans-serif",
      fontSize: "14px",
      lineHeight: "1.5",
      colors: {
        primary: "#000000",
        secondary: "#4b5563",
        accent: "#ef4444",
        text: "#1f2937",
        background: "#ffffff"
      }
    }
  },
  timeline_vertical: {
    name: "Vertical Timeline", 
    previewImage: "/templates/previews/timeline_vertical.png",
    category: "Timeline",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "minimal",
      timelineStyle: true,
      spacing: "comfortable"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "14px",
      lineHeight: "1.6",
      colors: {
        primary: "#1f2937",
        secondary: "#6b7280",
        accent: "#3b82f6",
        text: "#374151",
        background: "#ffffff",
        timeline: "#e5e7eb"
      }
    }
  },

  // ============================
  // 6. EXECUTIVE PROFESSIONAL
  // ============================
  executive_luxury: {
    name: "Executive Luxury",
    previewImage: "/templates/previews/executive_luxury.png",
    category: "Executive",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      headerStyle: "elegant",
      showIcons: false,
      columns: 1,
      spacing: "luxury"
    },
    styles: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "15px",
      lineHeight: "1.7",
      colors: {
        primary: "#1a1a1a",
        secondary: "#4a4a4a",
        accent: "#d97706",
        text: "#2d2d2d",
        background: "#ffffff"
      }
    }
  },

  executive_corporate: {
    name: "Corporate Executive",
    previewImage: "/templates/previews/executive_corporate.png",
    category: "Executive", 
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills"],
      headerStyle: "elegant",
      showIcons: false,
      columns: 1,
      spacing: "corporate"
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "14px",
      lineHeight: "1.5",
      colors: {
        primary: "#1e3a8a",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        text: "#1f2937",
        background: "#ffffff"
      }
    }
  },

  // ============================
  // 7. PORTFOLIO - SIMPLIFIED
  // ============================
  portfolio_professional: {
    name: "Professional Portfolio",
    previewImage: "/templates/previews/portfolio_professional.png",
    category: "Portfolio",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education"],
      sidebarSections: ["skills"],
      mainSections: ["personal", "summary", "experience", "education"],
      headerStyle: "portfolio-modern",
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      spacing: "modern"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1e40af",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        text: "#374151",
        background: "#ffffff",
        sidebarBg: "#f8fafc"
      }
    }
  },
  // ============================
  // 1. MODERN SIDEBAR LAYOUTS
  // ============================
  modern_sidebar_left: {
    name: "Modern Left Sidebar",
    previewImage: "/templates/previews/modern_sidebar_left.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "full-width",
      sidebar: "#f8f9fa",
      spacing: "compact"
    },
    styles: {
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
      lineHeight: "1.4",
      colors: {
        primary: "#1a202c",
        secondary: "#4a5568",
        accent: "#667eea",
        text: "#2d3748",
        background: "#ffffff",
        sidebarBg: "#f8f9fa"
      }
    }
  },

  modern_sidebar_right: {
    name: "Modern Right Sidebar",
    previewImage: "/templates/previews/modern_sidebar_right.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "full-width",
      sidebar: "#f7fafc",
      spacing: "comfortable"
    },
    styles: {
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      lineHeight: "1.5",
      colors: {
        primary: "#2b6cb0",
        secondary: "#4299e1",
        accent: "#63b3ed",
        text: "#2d3748",
        background: "#ffffff",
        sidebarBg: "#f7fafc"
      }
    }
  },

  // ============================
  // 2. CLEAN CREATIVE LAYOUTS
  // ============================
  creative_header_hero: {
    name: "Creative Header Hero",
    previewImage: "/templates/previews/creative_header_hero.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "skills", "education", "certifications"],
      showIcons: true,
      columns: 1,
      headerStyle: "hero-banner",
      spacing: "comfortable"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "14px",
      lineHeight: "1.6",
      colors: {
        primary: "#1e40af",
        secondary: "#3b82f6", 
        accent: "#60a5fa",
        text: "#1f2937",
        background: "#ffffff",
        headerGradient: "linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)"
      }
    }
  },

  creative_asymmetric: {
    name: "Creative Asymmetric",
    previewImage: "/templates/previews/creative_asymmetric.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "languages", "experience", "education", "certifications"],
      sidebarSections: ["skills", "certifications"],  // Compact sections go LEFT
      mainSections: ["personal", "summary", "experience", "education"], // Experience goes RIGHT
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "creative-asymmetric",
      spacing: "modern"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "13px",
      lineHeight: "1.5",
      colors: {
        primary: "#7c3aed",
        secondary: "#a855f7",
        accent: "#c084fc",
        text: "#374151",
        background: "#ffffff",
        sidebarBg: "#faf5ff"
      }
    }
  },

  // ============================
  // 3. TIMELINE - CLEANED UP
  // ============================
 

  // ============================
  // 4. INFOGRAPHIC - FIXED
 

  // ============================
  // 8. TECH/DEVELOPER - SIMPLIFIED
  // ============================
  tech_professional: {
    name: "Professional Tech",
    previewImage: "/templates/previews/tech_professional.png",
    category: "Tech",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education"],
      sidebarSections: ["skills"],
      mainSections: ["personal", "summary", "experience", "education"],
      headerStyle: "tech-header",
      showIcons: false,
      columns: 2,
      sidebarWidth: "30%",
      spacing: "tech"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "13px",
      lineHeight: "1.5",
      colors: {
        primary: "#1f2937",
        secondary: "#4b5563",
        accent: "#3b82f6",
        text: "#374151",
        background: "#ffffff",
        code: "#f9fafb"
      }
    }
  },

  tech_modern: {
    name: "Modern Tech",
    previewImage: "/templates/previews/tech_modern.png",
    category: "Tech",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education"],
      sidebarSections: ["skills"],
      mainSections: ["personal", "summary", "experience", "education"],
      headerStyle: "full-width",
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      spacing: "modern"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "13px",
      lineHeight: "1.6",
      colors: {
        primary: "#1f2937",
        secondary: "#4b5563",
        accent: "#06b6d4",
        text: "#374151",
        background: "#ffffff",
        sidebarBg: "#f0f9ff"
      }
    }
  }
};

// Template categories for organization
export const templateCategories = {
  "Modern": {
    name: "Modern",
    description: "Contemporary sidebar and split layouts",
    count: 2
  },
  "Creative": {
    name: "Creative",
    description: "Unique, artistic design approaches",
    count: 2
  },
  "Timeline": {
    name: "Timeline",
    description: "Visual timeline-based layouts",
    count: 1
  },
  "Infographic": {
    name: "Infographic",
    description: "Visual, chart-based presentations",
    count: 1
  },
  "Minimal": {
    name: "Minimal",
    description: "Clean, typography-focused designs",
    count: 2
  },
  "Executive": {
    name: "Executive",
    description: "High-level professional layouts",
    count: 2
  },
  "Portfolio": {
    name: "Portfolio",
    description: "Work showcase layouts",
    count: 1
  },
  "Tech": {
    name: "Tech",
    description: "Developer and tech-focused layouts",
    count: 2
  }
};

// Get templates by category
export const getTemplatesByCategory = (category) => {
  return Object.entries(diverseTemplates).filter(([key, template]) => template.category === category);
};

// Get all free templates (all are free)
export const getFreeTemplates = () => {
  return Object.entries(diverseTemplates).filter(([key, template]) => !template.premium);
};

// Template statistics
export const templateStats = {
  total: Object.keys(diverseTemplates).length,
  free: Object.values(diverseTemplates).filter(t => !t.premium).length,
  premium: Object.values(diverseTemplates).filter(t => t.premium).length,
  categories: Object.keys(templateCategories).length
};

// Export the diverse templates as the main export
export default diverseTemplates; 