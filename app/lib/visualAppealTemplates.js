// VISUAL APPEAL TEMPLATES - World-Class Resume Templates with Photos
// These templates are designed to beat any Canva designs with stunning visuals,
// modern layouts, and professional photo integration

export const visualAppealTemplates = {
  // ============================
  // 1. MODERN PROFESSIONAL SERIES
  // ============================
  visual_modern_executive: {
    name: "Modern Executive with Photo",
    previewImage: "/templates/previews/visual_modern_executive.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: ["personal", "skills", "certifications", "languages"],
      mainSections: ["summary", "experience", "education", "projects", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "no-header",
      spacing: "executive",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top-large",
      photoStyle: "circular-large",
      layoutType: "dark-sidebar-with-timeline"
    },
    styles: {
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1e40af",
        secondary: "#475569",
        accent: "#3b82f6",
        text: "#1e293b",
        background: "#ffffff",
        sidebarBackground: "#1e40af",
        sidebarText: "#ffffff",
        accentLight: "#dbeafe",
        gradientStart: "#1e40af",
        gradientEnd: "#3b82f6"
      },
      spacing: {
        sectionGap: "2rem",
        contentPadding: "1.5rem",
        headerPadding: "2rem"
      },
      visualEffects: {
        sidebarGradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        cardShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        photoShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        sectionBorder: "2px solid #e2e8f0"
      }
    },
    visualFeatures: {
      modernLayout: true,
      photoIntegration: true,
      gradientSidebar: true,
      cardDesign: true,
      iconIntegration: true,
      professionalStyle: true
    }
  },

  visual_creative_designer: {
    name: "Creative Designer with Photo",
    previewImage: "/templates/previews/visual_creative_designer.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "projects", "achievements", "languages"],
      sidebarSections: ["personal", "skills", "languages"],
      mainSections: ["summary", "experience", "education", "projects", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "colored-banner-with-photo",
      spacing: "creative",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "header-overlay-embedded",
      photoStyle: "circular-embedded",
      layoutType: "banner-photo-overlay",
      headerHeight: "120px"
    },
    styles: {
      fontFamily: "'Poppins', 'Inter', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.6",
      colors: {
        primary: "#7c3aed",
        secondary: "#6b7280",
        accent: "#a855f7",
        text: "#374151",
        background: "#ffffff",
        sidebarBackground: "#f8fafc",
        sidebarText: "#1f2937",
        accentLight: "#ede9fe",
        gradientStart: "#7c3aed",
        gradientEnd: "#a855f7",
        creativeAccent: "#f59e0b"
      },
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "1.25rem",
        headerPadding: "1.5rem"
      },
      visualEffects: {
        headerGradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
        cardShadow: "0 8px 25px -5px rgba(124, 58, 237, 0.1), 0 4px 6px -2px rgba(124, 58, 237, 0.05)",
        photoBorder: "4px solid #ffffff",
        sectionDivider: "1px solid #e5e7eb"
      }
    },
    visualFeatures: {
      creativeLayout: true,
      photoOverlay: true,
      gradientHeader: true,
      modernCards: true,
      colorAccents: true,
      designerStyle: true
    }
  },

  visual_tech_innovator: {
    name: "Tech Innovator with Photo",
    previewImage: "/templates/previews/visual_tech_innovator.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "projects", "languages", "customSections"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education", "projects"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "32%",
      headerStyle: "clean-two-column",
      spacing: "tech",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-prominent",
      photoStyle: "circular-prominent",
      layoutType: "clean-sidebar-photo",
      sidebarBackground: "light-accent"
    },
    styles: {
      fontFamily: "'JetBrains Mono', 'Consolas', monospace",
      fontSize: "10pt",
      lineHeight: "1.4",
      colors: {
        primary: "#059669",
        secondary: "#374151",
        accent: "#10b981",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#f0fdf4",
        sidebarText: "#064e3b",
        accentLight: "#d1fae5",
        gradientStart: "#059669",
        gradientEnd: "#10b981",
        techAccent: "#06b6d4"
      },
      spacing: {
        sectionGap: "1.5rem",
        contentPadding: "1rem",
        headerPadding: "1.25rem"
      },
      visualEffects: {
        sidebarGradient: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
        codeShadow: "0 4px 14px 0 rgba(5, 150, 105, 0.1)",
        photoGlow: "0 0 20px rgba(16, 185, 129, 0.2)",
        sectionBorder: "1px solid #d1fae5"
      }
    },
    visualFeatures: {
      techLayout: true,
      codeStyle: true,
      modernSidebar: true,
      accentColors: true,
      professionalPhoto: true,
      innovationStyle: true
    }
  },

  // ============================
  // 2. ELEGANT PROFESSIONAL SERIES
  // ============================
  visual_elegant_executive: {
    name: "Elegant Executive with Photo",
    previewImage: "/templates/previews/visual_elegant_executive.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "38%",
      headerStyle: "elegant-executive",
      spacing: "elegant",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "elegant-circle"
    },
    styles: {
      fontFamily: "'Playfair Display', 'Georgia', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1f2937",
        secondary: "#4b5563",
        accent: "#d97706",
        text: "#374151",
        background: "#ffffff",
        sidebarBackground: "#1f2937",
        sidebarText: "#ffffff",
        accentLight: "#fef3c7",
        gradientStart: "#1f2937",
        gradientEnd: "#374151",
        elegantGold: "#d97706"
      },
      spacing: {
        sectionGap: "2.25rem",
        contentPadding: "1.75rem",
        headerPadding: "2rem"
      },
      visualEffects: {
        sidebarGradient: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
        elegantShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        goldAccent: "2px solid #d97706",
        photoFrame: "3px solid #ffffff"
      }
    },
    visualFeatures: {
      elegantLayout: true,
      luxuryDesign: true,
      goldAccents: true,
      serifTypography: true,
      executiveStyle: true,
      premiumFeel: true
    }
  },

  visual_minimalist_modern: {
    name: "Minimalist Modern with Photo",
    previewImage: "/templates/previews/visual_minimalist_modern.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "languages", "customSections"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education"],
      showIcons: false,
      columns: 1,
      sidebarWidth: "0%",
      headerStyle: "single-column-header-photo",
      spacing: "minimal",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "header-left",
      photoStyle: "circular-header",
      layoutType: "single-column-with-header-photo",
      headerLayout: "photo-name-title"
    },
    styles: {
      fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#000000",
        secondary: "#666666",
        accent: "#0066cc",
        text: "#333333",
        background: "#ffffff",
        sidebarBackground: "#f8f9fa",
        sidebarText: "#000000",
        accentLight: "#e6f3ff",
        gradientStart: "#f8f9fa",
        gradientEnd: "#ffffff",
        minimalAccent: "#0066cc"
      },
      spacing: {
        sectionGap: "2rem",
        contentPadding: "1.5rem",
        headerPadding: "1.75rem"
      },
      visualEffects: {
        cleanShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        minimalBorder: "1px solid #e5e5e5",
        photoShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      }
    },
    visualFeatures: {
      minimalLayout: true,
      cleanDesign: true,
      subtleShadows: true,
      modernTypography: true,
      professionalMinimalism: true,
      focusOnContent: true
    }
  },

  // ============================
  // 3. CREATIVE INDUSTRY SERIES
  // ============================
  visual_creative_artist: {
    name: "Creative Artist with Photo",
    previewImage: "/templates/previews/visual_creative_artist.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "portfolio", "languages", "customSections"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education", "portfolio"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "timeline-professional",
      spacing: "artistic",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "circular-timeline",
      layoutType: "timeline-with-sidebar",
      timelineStyle: true,
      showTimelineMarkers: true
    },
    styles: {
      fontFamily: "'Montserrat', 'Helvetica Neue', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.6",
      colors: {
        primary: "#e11d48",
        secondary: "#64748b",
        accent: "#f97316",
        text: "#1e293b",
        background: "#ffffff",
        sidebarBackground: "#fef2f2",
        sidebarText: "#1e293b",
        accentLight: "#fed7d7",
        gradientStart: "#e11d48",
        gradientEnd: "#f97316",
        artisticAccent: "#8b5cf6"
      },
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "1.25rem",
        headerPadding: "1.5rem"
      },
      visualEffects: {
        artisticGradient: "linear-gradient(135deg, #e11d48 0%, #f97316 100%)",
        creativeShadow: "0 10px 30px rgba(225, 29, 72, 0.15)",
        photoArtistic: "0 0 30px rgba(225, 29, 72, 0.2)",
        sectionDivider: "2px solid #fed7d7"
      }
    },
    visualFeatures: {
      artisticLayout: true,
      boldColors: true,
      creativeTypography: true,
      photoIntegration: true,
      portfolioStyle: true,
      expressiveDesign: true
    }
  },

  visual_fashion_designer: {
    name: "Fashion Designer with Photo",
    previewImage: "/templates/previews/visual_fashion_designer.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "awards", "languages", "customSections"],
      sidebarSections: ["personal", "skills", "awards"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "fashion-luxury-sidebar",
      spacing: "fashion",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "fashion-elegant",
      layoutType: "luxury-sidebar-with-awards",
      showAwardsSection: true
    },
    styles: {
      fontFamily: "'Cormorant Garamond', 'Georgia', serif",
      fontSize: "12pt",
      lineHeight: "1.7",
      colors: {
        primary: "#7c2d12",
        secondary: "#92400e",
        accent: "#fbbf24",
        text: "#451a03",
        background: "#ffffff",
        sidebarBackground: "#7c2d12",
        sidebarText: "#ffffff",
        accentLight: "#fef3c7",
        gradientStart: "#7c2d12",
        gradientEnd: "#92400e",
        fashionGold: "#fbbf24"
      },
      spacing: {
        sectionGap: "1rem",
        contentPadding: "1rem",
        headerPadding: "1.5rem"
      },
      visualEffects: {
        luxuryGradient: "linear-gradient(135deg, #7c2d12 0%, #92400e 100%)",
        fashionShadow: "0 15px 35px rgba(124, 45, 18, 0.2)",
        goldAccent: "3px solid #fbbf24",
        photoElegant: "0 5px 20px rgba(0, 0, 0, 0.15)"
      }
    },
    visualFeatures: {
      luxuryLayout: true,
      fashionStyle: true,
      elegantTypography: true,
      goldAccents: true,
      sophisticatedDesign: true,
      highEndFeel: true
    }
  },

  // ============================
  // 4. TECH & INNOVATION SERIES
  // ============================
  visual_startup_founder: {
    name: "Startup Founder with Photo",
    previewImage: "/templates/previews/visual_startup_founder.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "achievements", "languages", "customSections"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "32%",
      headerStyle: "startup-modern",
      spacing: "startup",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "startup-professional"
    },
    styles: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#0f172a",
        secondary: "#475569",
        accent: "#06b6d4",
        text: "#1e293b",
        background: "#ffffff",
        sidebarBackground: "#0f172a",
        sidebarText: "#ffffff",
        accentLight: "#cffafe",
        gradientStart: "#0f172a",
        gradientEnd: "#1e293b",
        startupAccent: "#06b6d4"
      },
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "1.25rem",
        headerPadding: "1.5rem"
      },
      visualEffects: {
        startupGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        modernShadow: "0 8px 25px rgba(15, 23, 42, 0.15)",
        cyanAccent: "2px solid #06b6d4",
        photoGlow: "0 0 25px rgba(6, 182, 212, 0.2)"
      }
    },
    visualFeatures: {
      startupLayout: true,
      modernDesign: true,
      techAccents: true,
      professionalPhoto: true,
      innovationStyle: true,
      founderVibe: true
    }
  },

  visual_data_scientist: {
    name: "Data Scientist with Photo",
    previewImage: "/templates/previews/visual_data_scientist.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "projects", "languages", "customSections"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education", "projects"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "33%",
      headerStyle: "data-modern",
      spacing: "data",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "data-professional"
    },
    styles: {
      fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#1e40af",
        secondary: "#475569",
        accent: "#8b5cf6",
        text: "#1e293b",
        background: "#ffffff",
        sidebarBackground: "#f8fafc",
        sidebarText: "#1e293b",
        accentLight: "#ede9fe",
        gradientStart: "#1e40af",
        gradientEnd: "#8b5cf6",
        dataAccent: "#10b981"
      },
      spacing: {
        sectionGap: "1.5rem",
        contentPadding: "1rem",
        headerPadding: "1.25rem"
      },
      visualEffects: {
        dataGradient: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
        chartShadow: "0 4px 12px rgba(30, 64, 175, 0.1)",
        purpleAccent: "2px solid #8b5cf6",
        photoData: "0 2px 10px rgba(139, 92, 246, 0.15)"
      }
    },
    visualFeatures: {
      dataLayout: true,
      chartInspired: true,
      purpleAccents: true,
      cleanDesign: true,
      professionalStyle: true,
      analyticsVibe: true
    }
  },

  // ============================
  // 5. HEALTHCARE & EDUCATION SERIES
  // ============================
  visual_medical_professional: {
    name: "Medical Professional with Photo",
    previewImage: "/templates/previews/visual_medical_professional.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "medical-clean",
      spacing: "medical",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "medical-professional"
    },
    styles: {
      fontFamily: "'Source Sans Pro', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#059669",
        secondary: "#374151",
        accent: "#10b981",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#ecfdf5",
        sidebarText: "#064e3b",
        accentLight: "#d1fae5",
        gradientStart: "#059669",
        gradientEnd: "#10b981",
        medicalAccent: "#0891b2"
      },
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "1.25rem",
        headerPadding: "1.5rem"
      },
      visualEffects: {
        medicalGradient: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
        cleanShadow: "0 2px 8px rgba(5, 150, 105, 0.1)",
        greenAccent: "2px solid #10b981",
        photoMedical: "0 1px 6px rgba(5, 150, 105, 0.1)"
      }
    },
    visualFeatures: {
      medicalLayout: true,
      cleanDesign: true,
      greenAccents: true,
      professionalPhoto: true,
      trustworthyStyle: true,
      healthcareVibe: true
    }
  },

  visual_academic_professor: {
    name: "Academic Professor with Photo",
    previewImage: "/templates/previews/visual_academic_professor.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "publications", "awards", "languages", "customSections"],
      sidebarSections: ["personal", "publications"],
      mainSections: ["summary", "experience", "education", "awards"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "33%",
      headerStyle: "academic-traditional",
      spacing: "academic",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "academic-scholarly"
    },
    styles: {
      fontFamily: "'Times New Roman', 'Georgia', serif",
      fontSize: "12pt",
      lineHeight: "1.6",
      colors: {
        primary: "#7c2d12",
        secondary: "#451a03",
        accent: "#dc2626",
        text: "#374151",
        background: "#ffffff",
        sidebarBackground: "#fef7ed",
        sidebarText: "#7c2d12",
        accentLight: "#fed7aa",
        gradientStart: "#7c2d12",
        gradientEnd: "#dc2626",
        academicAccent: "#dc2626"
      },
      spacing: {
        sectionGap: "2rem",
        contentPadding: "1.5rem",
        headerPadding: "1.75rem"
      },
      visualEffects: {
        academicGradient: "linear-gradient(135deg, #fef7ed 0%, #ffffff 100%)",
        scholarlyShadow: "0 4px 12px rgba(124, 45, 18, 0.1)",
        redAccent: "2px solid #dc2626",
        photoAcademic: "0 2px 8px rgba(124, 45, 18, 0.1)"
      }
    },
    visualFeatures: {
      academicLayout: true,
      traditionalStyle: true,
      serifTypography: true,
      scholarlyDesign: true,
      publicationFocus: true,
      institutionalFeel: true
    }
  },

  // ============================
  // 6. BUSINESS & FINANCE SERIES
  // ============================
  visual_finance_executive: {
    name: "Finance Executive with Photo",
    previewImage: "/templates/previews/visual_finance_executive.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "finance-luxury",
      spacing: "finance",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "finance-executive"
    },
    styles: {
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1f2937",
        secondary: "#4b5563",
        accent: "#059669",
        text: "#374151",
        background: "#ffffff",
        sidebarBackground: "#1f2937",
        sidebarText: "#ffffff",
        accentLight: "#d1fae5",
        gradientStart: "#1f2937",
        gradientEnd: "#374151",
        financeGreen: "#059669"
      },
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "1.25rem",
        headerPadding: "1.5rem"
      },
      visualEffects: {
        financeGradient: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
        executiveShadow: "0 8px 25px rgba(31, 41, 55, 0.15)",
        greenAccent: "2px solid #059669",
        photoExecutive: "0 3px 12px rgba(31, 41, 55, 0.1)"
      }
    },
    visualFeatures: {
      financeLayout: true,
      executiveStyle: true,
      professionalPhoto: true,
      greenAccents: true,
      luxuryDesign: true,
      corporateFeel: true
    }
  },

  visual_marketing_manager: {
    name: "Marketing Manager with Photo",
    previewImage: "/templates/previews/visual_marketing_manager.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "achievements", "languages", "customSections"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "32%",
      headerStyle: "marketing-creative",
      spacing: "marketing",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "marketing-modern"
    },
    styles: {
      fontFamily: "'Open Sans', 'Helvetica Neue', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#dc2626",
        secondary: "#7f1d1d",
        accent: "#f59e0b",
        text: "#374151",
        background: "#ffffff",
        sidebarBackground: "#fef2f2",
        sidebarText: "#991b1b",
        accentLight: "#fed7aa",
        gradientStart: "#dc2626",
        gradientEnd: "#f59e0b",
        marketingAccent: "#f59e0b"
      },
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "1.25rem",
        headerPadding: "1.5rem"
      },
      visualEffects: {
        marketingGradient: "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
        creativeShadow: "0 6px 20px rgba(220, 38, 38, 0.1)",
        orangeAccent: "2px solid #f59e0b",
        photoMarketing: "0 2px 10px rgba(220, 38, 38, 0.1)"
      }
    },
    visualFeatures: {
      marketingLayout: true,
      creativeDesign: true,
      boldColors: true,
      modernPhoto: true,
      energeticStyle: true,
      campaignVibe: true
    }
  },

  // ============================
  // 7. ENTREPRENEUR & CONSULTANT SERIES
  // ============================
  visual_entrepreneur: {
    name: "Entrepreneur with Photo",
    previewImage: "/templates/previews/visual_entrepreneur.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "achievements", "languages", "customSections"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "33%",
      headerStyle: "entrepreneur-bold",
      spacing: "entrepreneur",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "entrepreneur-dynamic"
    },
    styles: {
      fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#7c3aed",
        secondary: "#5b21b6",
        accent: "#f59e0b",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#7c3aed",
        sidebarText: "#ffffff",
        accentLight: "#fef3c7",
        gradientStart: "#7c3aed",
        gradientEnd: "#5b21b6",
        entrepreneurAccent: "#f59e0b"
      },
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "1.25rem",
        headerPadding: "1.5rem"
      },
      visualEffects: {
        entrepreneurGradient: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
        boldShadow: "0 10px 30px rgba(124, 58, 237, 0.2)",
        orangeAccent: "3px solid #f59e0b",
        photoDynamic: "0 0 25px rgba(124, 58, 237, 0.2)"
      }
    },
    visualFeatures: {
      entrepreneurLayout: true,
      boldDesign: true,
      dynamicColors: true,
      modernPhoto: true,
      innovativeStyle: true,
      leadershipVibe: true
    }
  },

  visual_consultant_professional: {
    name: "Consultant Professional with Photo",
    previewImage: "/templates/previews/visual_consultant_professional.png",
    category: "Visual Appeal",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "consultant-sophisticated",
      spacing: "consultant",
      visualAppeal: true,
      showProfilePicture: true,
      profilePicturePosition: "sidebar-top",
      photoStyle: "consultant-refined",
      layoutType: "card-based-professional"
    },
    styles: {
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1f2937",
        secondary: "#6b7280",
        accent: "#059669",
        text: "#374151",
        background: "#ffffff",
        sidebarBackground: "#f9fafb",
        sidebarText: "#1f2937",
        accentLight: "#d1fae5",
        gradientStart: "#1f2937",
        gradientEnd: "#059669"
      },
      spacing: {
        sectionGap: "2rem",
        contentPadding: "1.5rem",
        headerPadding: "2rem"
      },
      visualEffects: {
        cardShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        sectionBorder: "1px solid #e5e7eb"
      }
    },
    visualFeatures: {
      modernLayout: true,
      photoIntegration: true,
      cardDesign: true,
      professionalStyle: true
    }
  },

};

export default visualAppealTemplates;
