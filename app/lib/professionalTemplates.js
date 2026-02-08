// Extended Resume Templates - Batch 3: Professional & Corporate
// Inspired by Canva's business and corporate design patterns

export const professionalCorporateTemplates = {
  // EXECUTIVE SERIES (5 templates)
  executive_luxury_gold: {
    name: "Executive Luxury Gold",
    previewImage: "/templates/previews/executive_luxury_gold.png",
    category: "Executive",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "leadership", "experience", "achievements", "education", "skills", "languages", "customSections"],
      sidebarSections: ["personal", "skills", "achievements"],
      mainSections: ["summary", "leadership", "experience", "education"],
      showIcons: true,
      columns: 2,
      luxuryStyle: true,
      sidebarWidth: "30%",
      headerStyle: "executive"
    },
    styles: {
      fontFamily: "'Playfair Display', 'Times New Roman', serif",
      fontSize: "11.5pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1a1a1a",
        secondary: "#b8860b",
        accent: "#daa520",
        text: "#2c2c2c",
        background: "#ffffff",
        luxury: "#f5f5dc",
        gold: "#ffd700"
      },
      effects: {
        goldAccent: true,
        elegantBorders: true,
        premiumShadow: "0 4px 20px rgba(218, 165, 32, 0.15)"
      }
    }
  },

  executive_navy_platinum: {
    name: "Executive Navy Platinum",
    previewImage: "/templates/previews/executive_navy_platinum.png",
    category: "Executive",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "leadership", "experience", "achievements", "education", "board"],
      sidebarSections: ["personal", "achievements", "board"],
      mainSections: ["summary", "leadership", "experience", "education"],
      showIcons: true,
      columns: 2,
      executiveLayout: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Minion Pro', 'Georgia', serif",
      colors: {
        primary: "#1e3a8a",
        secondary: "#1e40af",
        accent: "#c0c0c0",
        text: "#1f2937",
        background: "#ffffff",
        navy: "#1e3a8a",
        platinum: "#e5e7eb"
      }
    }
  },

  executive_charcoal_silver: {
    name: "Executive Charcoal Silver",
    previewImage: "/templates/previews/executive_charcoal_silver.png",
    category: "Executive",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "leadership", "education", "achievements", "directorships"],
      sidebarSections: ["personal", "achievements", "directorships"],
      mainSections: ["summary", "experience", "leadership", "education"],
      showIcons: true,
      columns: 2,
      premiumLayout: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Garamond', 'Times', serif",
      colors: {
        primary: "#36454f",
        secondary: "#708090",
        accent: "#c0c0c0",
        text: "#2d2d2d",
        charcoal: "#36454f",
        silver: "#c0c0c0"
      }
    }
  },

  executive_burgundy_cream: {
    name: "Executive Burgundy Cream",
    previewImage: "/templates/previews/executive_burgundy_cream.png",
    category: "Executive", 
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "achievements", "education", "leadership", "advisory"],
      sidebarSections: ["personal", "leadership", "advisory"],
      mainSections: ["summary", "experience", "achievements", "education"],
      showIcons: true,
      columns: 2,
      aristocraticStyle: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Caslon', 'Book Antiqua', serif",
      colors: {
        primary: "#800020",
        secondary: "#a0522d",
        accent: "#f5f5dc",
        text: "#2c1810",
        burgundy: "#800020",
        cream: "#f5f5dc"
      }
    }
  },

  executive_black_gold: {
    name: "Executive Black Gold",
    previewImage: "/templates/previews/executive_black_gold.png",
    category: "Executive",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "achievements", "education", "skills", "honors"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "achievements", "education", "skills", "honors"],
      showIcons: true,
      columns: 1,
      blackGoldTheme: true,
      headerStyle: "prestigious"
    },
    styles: {
      fontFamily: "'Optima', 'Calibri', sans-serif",
      colors: {
        primary: "#000000",
        secondary: "#1a1a1a",
        accent: "#ffd700",
        text: "#2c2c2c",
        background: "#ffffff",
        black: "#000000",
        gold: "#ffd700"
      }
    }
  },

  // CORPORATE BLUE SERIES (5 templates)
  corporate_blue_classic: {
    name: "Corporate Blue Classic",
    previewImage: "/templates/previews/corporate_blue_classic.png",
    category: "Corporate",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications", "languages", "customSections"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      corporateStyle: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      colors: {
        primary: "#003f7f",
        secondary: "#0066cc",
        accent: "#4d94ff",
        text: "#333333",
        corporate: "#f0f8ff",
        blue: "#0066cc"
      }
    }
  },

  corporate_blue_modern: {
    name: "Corporate Blue Modern", 
    previewImage: "/templates/previews/corporate_blue_modern.png",
    category: "Corporate",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "achievements", "education", "skills", "languages", "customSections"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "achievements", "education"],
      showIcons: true,
      columns: 2,
      modernCorporate: true,
      sidebarWidth: "25%"
    },
    styles: {
      fontFamily: "'Segoe UI', 'Tahoma', sans-serif",
      colors: {
        primary: "#1e40af",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        text: "#1f2937",
        modern: "#eff6ff"
      }
    }
  },

  corporate_blue_sleek: {
    name: "Corporate Blue Sleek",
    previewImage: "/templates/previews/corporate_blue_sleek.png",
    category: "Corporate",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "projects", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "skills", "education", "projects"],
      showIcons: true,
      columns: 1,
      sleekDesign: true,
      headerStyle: "streamlined"
    },
    styles: {
      fontFamily: "'Avenir', 'Century Gothic', sans-serif",
      colors: {
        primary: "#2563eb",
        secondary: "#3b82f6",
        accent: "#93c5fd",
        text: "#374151",
        sleek: "#f8fafc"
      }
    }
  },

  corporate_blue_professional: {
    name: "Corporate Blue Professional",
    previewImage: "/templates/previews/corporate_blue_professional.png",
    category: "Corporate",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "memberships"],
      sidebarSections: ["personal", "skills", "certifications", "memberships"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      traditionalCorporate: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Verdana', 'Geneva', sans-serif",
      colors: {
        primary: "#1d4ed8",
        secondary: "#2563eb",
        accent: "#dbeafe",
        text: "#1e293b",
        traditional: "#f1f5f9"
      }
    }
  },

  corporate_blue_tech: {
    name: "Corporate Blue Tech",
    previewImage: "/templates/previews/corporate_blue_tech.png",
    category: "Corporate",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "technical", "education", "certifications"],
      sidebarSections: ["personal", "technical", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      techCorporate: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Roboto', 'Open Sans', sans-serif",
      colors: {
        primary: "#1e3a8a",
        secondary: "#1d4ed8",
        accent: "#3b82f6",
        text: "#1f2937",
        tech: "#eff6ff"
      }
    }
  },

  // FINANCE & BANKING SERIES (5 templates)
  finance_traditional: {
    name: "Finance Traditional",
    previewImage: "/templates/previews/finance_traditional.png",
    category: "Finance",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "certifications", "skills", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "certifications", "skills"],
      showIcons: false,
      columns: 1,
      conservativeStyle: true,
      headerStyle: "traditional"
    },
    styles: {
      fontFamily: "'Times New Roman', 'Times', serif",
      fontSize: "11.5pt",
      colors: {
        primary: "#1a365d",
        secondary: "#2d3748",
        accent: "#4a5568",
        text: "#2d3748",
        conservative: "#f7fafc"
      }
    }
  },

  finance_investment: {
    name: "Finance Investment",
    previewImage: "/templates/previews/finance_investment.png",
    category: "Finance",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "achievements", "education", "licenses", "languages", "customSections"],
      sidebarSections: ["personal", "achievements", "licenses"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      investmentStyle: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Minion Pro', 'Palatino', serif",
      colors: {
        primary: "#0f172a",
        secondary: "#1e293b",
        accent: "#059669",
        text: "#334155",
        investment: "#f0fdf4"
      }
    }
  },

  finance_consulting: {
    name: "Finance Consulting",
    previewImage: "/templates/previews/finance_consulting.png",
    category: "Finance",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "projects", "languages", "customSections"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education", "projects"],
      showIcons: true,
      columns: 2,
      consultingStyle: true,
      sidebarWidth: "25%"
    },
    styles: {
      fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
      colors: {
        primary: "#1e40af",
        secondary: "#3730a3",
        accent: "#6366f1",
        text: "#1e293b",
        consulting: "#f8fafc"
      }
    }
  },

  finance_analyst: {
    name: "Finance Analyst",
    previewImage: "/templates/previews/finance_analyst.png",
    category: "Finance",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "technical", "education", "certifications"],
      sidebarSections: ["personal", "technical", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      analyticalStyle: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Calibri', 'Trebuchet MS', sans-serif",
      colors: {
        primary: "#065f46",
        secondary: "#059669",
        accent: "#10b981",
        text: "#064e3b",
        analytical: "#f0fdf4"
      }
    }
  },

  finance_risk: {
    name: "Finance Risk Management",
    previewImage: "/templates/previews/finance_risk.png",
    category: "Finance",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "risk_expertise", "education", "certifications"],
      sidebarSections: ["personal", "risk_expertise", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      riskStyle: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Garamond', 'Book Antiqua', serif",
      colors: {
        primary: "#7c2d12",
        secondary: "#dc2626",
        accent: "#f87171",
        text: "#7c2d12",
        risk: "#fef2f2"
      }
    }
  },

  // CONSULTING SERIES (5 templates)
  consulting_mckinsey: {
    name: "Consulting McKinsey Style",
    previewImage: "/templates/previews/consulting_mckinsey.png",
    category: "Consulting",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "case_studies", "education", "skills", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "case_studies", "education", "skills"],
      showIcons: false,
      columns: 1,
      mckinsey_style: true,
      headerStyle: "consulting"
    },
    styles: {
      fontFamily: "'Calibri', 'Arial', sans-serif",
      fontSize: "11pt",
      colors: {
        primary: "#000080",
        secondary: "#4169e1",
        accent: "#87ceeb",
        text: "#2f4f4f",
        mckinsey: "#f0f8ff"
      }
    }
  },

  consulting_bcg: {
    name: "Consulting BCG Style",
    previewImage: "/templates/previews/consulting_bcg.png",
    category: "Consulting",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "frameworks", "education", "achievements"],
      sidebarSections: ["personal", "frameworks", "achievements"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      bcg_style: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Verdana', 'Tahoma', sans-serif",
      colors: {
        primary: "#006400",
        secondary: "#228b22",
        accent: "#90ee90",
        text: "#2e8b57",
        bcg: "#f0fff0"
      }
    }
  },

  consulting_bain: {
    name: "Consulting Bain Style",
    previewImage: "/templates/previews/consulting_bain.png",
    category: "Consulting",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "impact", "education", "leadership"],
      sidebarSections: ["personal", "impact", "leadership"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      bain_style: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Times New Roman', 'Georgia', serif",
      colors: {
        primary: "#8b0000",
        secondary: "#dc143c",
        accent: "#ff6347",
        text: "#8b0000",
        bain: "#fff0f5"
      }
    }
  },

  consulting_strategy: {
    name: "Consulting Strategy",
    previewImage: "/templates/previews/consulting_strategy.png",
    category: "Consulting",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "methodology", "education", "publications"],
      sidebarSections: ["personal", "methodology", "publications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      strategyStyle: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Segoe UI', 'Arial', sans-serif",
      colors: {
        primary: "#483d8b",
        secondary: "#6a5acd",
        accent: "#9370db",
        text: "#2f2f2f",
        strategy: "#f8f8ff"
      }
    }
  },

  consulting_operations: {
    name: "Consulting Operations",
    previewImage: "/templates/previews/consulting_operations.png",
    category: "Consulting",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "process_improvement", "education", "tools"],
      sidebarSections: ["personal", "process_improvement", "tools"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      operationsStyle: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Roboto', 'Open Sans', sans-serif",
      colors: {
        primary: "#2f4f4f",
        secondary: "#708090",
        accent: "#b0c4de",
        text: "#2f4f4f",
        operations: "#f5f5f5"
      }
    }
  },

  // LAW & LEGAL SERIES (5 templates)
  legal_traditional: {
    name: "Legal Traditional",
    previewImage: "/templates/previews/legal_traditional.png",
    category: "Legal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "bar_admissions", "publications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "bar_admissions", "publications"],
      showIcons: false,
      columns: 1,
      legalTraditional: true,
      headerStyle: "legal"
    },
    styles: {
      fontFamily: "'Times New Roman', 'Times', serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1a202c",
        secondary: "#2d3748",
        accent: "#4a5568",
        text: "#2d3748",
        legal: "#f7fafc"
      }
    }
  },

  legal_corporate: {
    name: "Legal Corporate",
    previewImage: "/templates/previews/legal_corporate.png",
    category: "Legal",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "specializations", "education", "deals"],
      sidebarSections: ["personal", "specializations", "deals"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      corporateLegal: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Minion Pro', 'Palatino', serif",
      colors: {
        primary: "#1e3a8a",
        secondary: "#1d4ed8",
        accent: "#3b82f6",
        text: "#1e293b",
        corporate: "#eff6ff"
      }
    }
  },

  legal_litigation: {
    name: "Legal Litigation",
    previewImage: "/templates/previews/legal_litigation.png",
    category: "Legal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "trial_experience", "education", "victories", "languages", "customSections"],
      sidebarSections: ["personal", "victories"],
      mainSections: ["summary", "experience", "trial_experience", "education"],
      showIcons: true,
      columns: 2,
      litigationStyle: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Garamond', 'Book Antiqua', serif",
      colors: {
        primary: "#7c2d12",
        secondary: "#dc2626",
        accent: "#ef4444",
        text: "#7c2d12",
        litigation: "#fef2f2"
      }
    }
  },

  legal_intellectual: {
    name: "Legal Intellectual Property",
    previewImage: "/templates/previews/legal_intellectual.png",
    category: "Legal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "patents", "education", "technology", "languages", "customSections"],
      sidebarSections: ["personal", "patents", "technology"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      ipStyle: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Calibri', 'Trebuchet MS', sans-serif",
      colors: {
        primary: "#0f766e",
        secondary: "#0d9488",
        accent: "#14b8a6",
        text: "#134e4a",
        ip: "#f0fdfa"
      }
    }
  },

  legal_compliance: {
    name: "Legal Compliance",
    previewImage: "/templates/previews/legal_compliance.png",
    category: "Legal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "regulations", "education", "certifications", "languages", "customSections"],
      sidebarSections: ["personal", "regulations", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      complianceStyle: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Verdana', 'Geneva', sans-serif",
      colors: {
        primary: "#7c3aed",
        secondary: "#8b5cf6",
        accent: "#a78bfa",
        text: "#581c87",
        compliance: "#f5f3ff"
      }
    }
  }
};

export default professionalCorporateTemplates; 