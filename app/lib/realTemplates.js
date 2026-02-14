// REAL TEMPLATE COLLECTION - DIVERSE LAYOUTS LIKE CANVA
// Cleaned up collection with only high-quality, working templates

// Diverse layout templates with genuinely different structures
export const diverseTemplates = {
   // ============================
   infographic_professional: {
    name: "Professional Infographic",
    description: "Data-driven layout with visual progress bars and highlighted section headings",
    previewImage: "/templates/previews/infographic_professional.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "skills", "experience", "education", "certifications"],
      showIcons: true,
      columns: 1,
      headerStyle: "minimal",
      headingStyle: "highlight",
      entryStyle: "bordered",
      visualElements: true,
      progressBars: true,
      spacing: "comfortable"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "10.5pt",  
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
    description: "Ultra-clean design with zero decoration — pure content focus",
    previewImage: "/templates/previews/minimal_clean.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      headerStyle: "minimal",
      headingStyle: "simple",
      entryStyle: "flat",
      spacing: "minimal"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "10.5pt",
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
    description: "Helvetica-based Swiss design with uppercase spaced headings and red accents",
    previewImage: "/templates/previews/minimal_swiss.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      headerStyle: "minimal",
      headingStyle: "uppercase-spaced",
      entryStyle: "flat",
      spacing: "swiss"
    },
    styles: {
      fontFamily: "'Helvetica Neue', sans-serif",
      fontSize: "10.5pt",
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
    description: "Visual timeline markers connecting your career progression vertically",
    previewImage: "/templates/previews/timeline_vertical.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      headerStyle: "minimal",
      headingStyle: "underline",
      entryStyle: "flat",
      timelineStyle: true,
      spacing: "comfortable"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "10.5pt",
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
    description: "Elegant serif design with gold accent bars for C-suite professionals",
    previewImage: "/templates/previews/executive_luxury.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      headerStyle: "elegant",
      headingStyle: "accent-bar",
      entryStyle: "bordered",
      showIcons: false,
      columns: 1,
      spacing: "luxury"
    },
    styles: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "11pt",
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
    description: "Conservative Times New Roman layout with bordered sections for traditional industries",
    previewImage: "/templates/previews/executive_corporate.png",
    category: "Standard", 
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills"],
      headerStyle: "elegant",
      headingStyle: "uppercase-spaced",
      entryStyle: "flat",
      showIcons: false,
      columns: 1,
      spacing: "corporate"
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      fontSize: "10.5pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1e293b",
        secondary: "#475569",
        accent: "#1e40af",
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
    description: "Modern portfolio header with icon badges, two-column card layout",
    previewImage: "/templates/previews/portfolio_professional.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education"],
      sidebarSections: ["skills"],
      mainSections: ["personal", "summary", "experience", "education"],
      headerStyle: "portfolio-modern",
      headingStyle: "highlight",
      entryStyle: "card",
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
        primary: "#0f172a",
        secondary: "#475569",
        accent: "#6366f1",
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
    description: "Wide sidebar with accent-bar headings and bordered entries",
    previewImage: "/templates/previews/modern_sidebar_left.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "full-width",
      headingStyle: "accent-bar",
      entryStyle: "bordered",
      sidebar: "#f8f9fa",
      spacing: "compact"
    },
    styles: {
      fontFamily: "Inter, sans-serif",
      fontSize: "10pt",
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
    description: "Teal-themed layout with right sidebar and card-style experience entries",
    previewImage: "/templates/previews/modern_sidebar_right.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "full-width",
      headingStyle: "underline",
      entryStyle: "card",
      sidebar: "#f7fafc",
      spacing: "comfortable"
    },
    styles: {
      fontFamily: "Inter, sans-serif",
      fontSize: "10.5pt",
      lineHeight: "1.5",
      colors: {
        primary: "#0e7490",
        secondary: "#155e75",
        accent: "#06b6d4",
        text: "#2d3748",
        background: "#ffffff",
        sidebarBg: "#f0fdfa"
      }
    }
  },

  // ============================
  // 2. CLEAN CREATIVE LAYOUTS
  // ============================
  creative_header_hero: {
    name: "Creative Header Hero",
    description: "Bold emerald gradient hero banner with highlighted section headings",
    previewImage: "/templates/previews/creative_header_hero.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "skills", "education", "certifications"],
      showIcons: true,
      columns: 1,
      headerStyle: "hero-banner",
      headingStyle: "highlight",
      entryStyle: "bordered",
      spacing: "comfortable"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "10.5pt",
      lineHeight: "1.6",
      colors: {
        primary: "#065f46",
        secondary: "#047857",
        accent: "#10b981",
        text: "#1f2937",
        background: "#ffffff",
        headerGradient: "linear-gradient(135deg, #065f46 0%, #10b981 100%)"
      }
    }
  },

  creative_asymmetric: {
    name: "Creative Asymmetric",
    description: "Purple gradient header with asymmetric two-column layout and card entries",
    previewImage: "/templates/previews/creative_asymmetric.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "languages", "experience", "education", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "creative-asymmetric",
      headingStyle: "accent-bar",
      entryStyle: "card",
      spacing: "modern"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "10pt",
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
    description: "Developer-focused layout with amber accents and clean bordered entries",
    previewImage: "/templates/previews/tech_professional.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education"],
      sidebarSections: ["skills"],
      mainSections: ["personal", "summary", "experience", "education"],
      headerStyle: "tech-header",
      headingStyle: "simple",
      entryStyle: "bordered",
      showIcons: false,
      columns: 2,
      sidebarWidth: "30%",
      spacing: "tech"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "10pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1e293b",
        secondary: "#475569",
        accent: "#f59e0b",
        text: "#374151",
        background: "#ffffff",
        code: "#f9fafb"
      }
    }
  },

  tech_modern: {
    name: "Modern Tech",
    description: "Cyan-accented tech layout with underlined headings and card entries",
    previewImage: "/templates/previews/tech_modern.png",
    category: "Standard",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education"],
      sidebarSections: ["skills"],
      mainSections: ["personal", "summary", "experience", "education"],
      headerStyle: "full-width",
      headingStyle: "underline",
      entryStyle: "card",
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      spacing: "modern"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "10pt",
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
  "Standard": {
    name: "Standard",
    description: "Professional resume templates with diverse layouts and styles",
    count: Object.keys(diverseTemplates).length
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
