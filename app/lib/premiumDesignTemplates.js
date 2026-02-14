// PREMIUM DESIGN TEMPLATES - 20 World-Class Resume Templates
// Inspired by Zety, Canva, and EnhanceCV's best layouts
// Each template has a unique layoutType that the PremiumDesignRenderer switches on

export const premiumDesignTemplates = {

  // ===== 1. CASCADE =====
  // Zety-inspired: Full-width colored header with initials badge, 2-column body, cascading section headers
  premium_cascade: {
    name: "Cascade",
    previewImage: "/templates/previews/premium_cascade.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: ["skills", "certifications", "languages"],
      mainSections: ["summary", "experience", "education", "projects", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "32%",
      headerStyle: "cascade",
      spacing: "comfortable",
      layoutType: "cascade",
      showProfilePicture: false,
      sidebarPosition: "left"
    },
    styles: {
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      fontSize: "10.5pt",
      lineHeight: "1.5",
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#3b82f6",
        text: "#1e293b",
        background: "#ffffff",
        sidebarBackground: "#f1f5f9",
        sidebarText: "#334155",
        headerBackground: "#2563eb",
        headerText: "#ffffff",
        sectionTitle: "#2563eb",
        divider: "#e2e8f0"
      },
      spacing: { sectionGap: "1.2rem", contentPadding: "1.5rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 2. ICONIC =====
  // Icon-heavy design, each section with prominent icon, clean grid layout
  premium_iconic: {
    name: "Iconic",
    previewImage: "/templates/previews/premium_iconic.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      showIcons: true,
      columns: 1,
      headerStyle: "iconic",
      spacing: "standard",
      layoutType: "iconic",
      showProfilePicture: false
    },
    styles: {
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      fontSize: "10.5pt",
      lineHeight: "1.55",
      colors: {
        primary: "#0f172a",
        secondary: "#64748b",
        accent: "#6366f1",
        text: "#334155",
        background: "#ffffff",
        headerBackground: "#0f172a",
        headerText: "#ffffff",
        sectionTitle: "#0f172a",
        iconColor: "#6366f1",
        divider: "#e2e8f0"
      },
      spacing: { sectionGap: "1rem", contentPadding: "2rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 3. PRIMO =====
  // Bold name, accent underline, elegant executive feel, 1-column with subtle left border accents
  premium_primo: {
    name: "Primo",
    previewImage: "/templates/previews/premium_primo.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      showIcons: false,
      columns: 1,
      headerStyle: "primo",
      spacing: "executive",
      layoutType: "primo",
      showProfilePicture: false
    },
    styles: {
      fontFamily: "'Libre Baskerville', 'Georgia', serif",
      fontSize: "10.5pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1a1a2e",
        secondary: "#6b7280",
        accent: "#c9a96e",
        text: "#374151",
        background: "#ffffff",
        headerBackground: "#ffffff",
        headerText: "#1a1a2e",
        sectionTitle: "#1a1a2e",
        divider: "#c9a96e"
      },
      spacing: { sectionGap: "1.3rem", contentPadding: "2rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 4. SPLIT =====
  // 50-50 vertical split: dark left with personal info + skills, light right with experience + education
  premium_split: {
    name: "Split",
    previewImage: "/templates/previews/premium_split.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "languages", "certifications", "experience", "education", "projects", "achievements"],
      sidebarSections: ["personal", "summary", "skills", "languages", "certifications"],
      mainSections: ["experience", "education", "projects", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "40%",
      headerStyle: "split",
      spacing: "comfortable",
      layoutType: "split",
      showProfilePicture: true,
      photoStyle: "circular-large",
      sidebarPosition: "left"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "10pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1e293b",
        secondary: "#94a3b8",
        accent: "#38bdf8",
        text: "#334155",
        background: "#ffffff",
        sidebarBackground: "#1e293b",
        sidebarText: "#e2e8f0",
        headerBackground: "#1e293b",
        headerText: "#ffffff",
        sectionTitle: "#1e293b",
        divider: "#334155"
      },
      spacing: { sectionGap: "1.2rem", contentPadding: "1.5rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 5. BERLIN =====
  // Bold colored top bar, compact info-dense layout, 2-column body
  premium_berlin: {
    name: "Berlin",
    previewImage: "/templates/previews/premium_berlin.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: ["skills", "languages", "certifications"],
      mainSections: ["summary", "experience", "education", "projects", "achievements"],
      showIcons: false,
      columns: 2,
      sidebarWidth: "30%",
      headerStyle: "berlin",
      spacing: "compact",
      layoutType: "berlin",
      showProfilePicture: false,
      sidebarPosition: "right"
    },
    styles: {
      fontFamily: "'DM Sans', 'Inter', sans-serif",
      fontSize: "10pt",
      lineHeight: "1.45",
      colors: {
        primary: "#dc2626",
        secondary: "#6b7280",
        accent: "#dc2626",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#fef2f2",
        sidebarText: "#1f2937",
        headerBackground: "#dc2626",
        headerText: "#ffffff",
        sectionTitle: "#dc2626",
        divider: "#fca5a5"
      },
      spacing: { sectionGap: "0.8rem", contentPadding: "1.25rem", headerPadding: "1rem" }
    }
  },

  // ===== 6. STOCKHOLM =====
  // Scandinavian minimal: tons of whitespace, thin lines, elegant typography
  premium_stockholm: {
    name: "Stockholm",
    previewImage: "/templates/previews/premium_stockholm.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      showIcons: false,
      columns: 1,
      headerStyle: "stockholm",
      spacing: "spacious",
      layoutType: "stockholm",
      showProfilePicture: false
    },
    styles: {
      fontFamily: "'Outfit', 'Inter', sans-serif",
      fontSize: "10.5pt",
      lineHeight: "1.65",
      colors: {
        primary: "#18181b",
        secondary: "#a1a1aa",
        accent: "#18181b",
        text: "#3f3f46",
        background: "#ffffff",
        headerBackground: "#ffffff",
        headerText: "#18181b",
        sectionTitle: "#18181b",
        divider: "#e4e4e7"
      },
      spacing: { sectionGap: "1.5rem", contentPadding: "2.5rem", headerPadding: "2rem" }
    }
  },

  // ===== 7. TOKYO =====
  // Tech-forward: monospace accents, code-inspired grid, dark header, skill bars
  premium_tokyo: {
    name: "Tokyo",
    previewImage: "/templates/previews/premium_tokyo.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "projects", "certifications", "languages", "achievements"],
      sidebarSections: ["skills", "certifications", "languages"],
      mainSections: ["summary", "experience", "education", "projects", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "33%",
      headerStyle: "tokyo",
      spacing: "standard",
      layoutType: "tokyo",
      showProfilePicture: false,
      sidebarPosition: "left"
    },
    styles: {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "9.5pt",
      lineHeight: "1.5",
      colors: {
        primary: "#10b981",
        secondary: "#6b7280",
        accent: "#10b981",
        text: "#d1d5db",
        background: "#111827",
        sidebarBackground: "#0f172a",
        sidebarText: "#e2e8f0",
        headerBackground: "#111827",
        headerText: "#10b981",
        sectionTitle: "#10b981",
        divider: "#1f2937"
      },
      spacing: { sectionGap: "1rem", contentPadding: "1.5rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 8. MILAN =====
  // Fashion/design: asymmetric layout, editorial feel, large typography, thin accent lines
  premium_milan: {
    name: "Milan",
    previewImage: "/templates/previews/premium_milan.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "projects", "certifications", "languages", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "education", "skills", "projects", "certifications", "languages", "achievements"],
      showIcons: false,
      columns: 1,
      headerStyle: "milan",
      spacing: "editorial",
      layoutType: "milan",
      showProfilePicture: true,
      photoStyle: "rectangular"
    },
    styles: {
      fontFamily: "'Playfair Display', 'Georgia', serif",
      fontSize: "10.5pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1a1a1a",
        secondary: "#999999",
        accent: "#e11d48",
        text: "#333333",
        background: "#ffffff",
        headerBackground: "#ffffff",
        headerText: "#1a1a1a",
        sectionTitle: "#1a1a1a",
        divider: "#e5e5e5"
      },
      spacing: { sectionGap: "1.4rem", contentPadding: "2rem", headerPadding: "2rem" }
    }
  },

  // ===== 9. DUBAI =====
  // Luxurious: gold accents, premium feel, dark sidebar, elegant typography
  premium_dubai: {
    name: "Dubai",
    previewImage: "/templates/previews/premium_dubai.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: ["personal", "skills", "languages", "certifications"],
      mainSections: ["summary", "experience", "education", "projects", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "dubai",
      spacing: "executive",
      layoutType: "dubai",
      showProfilePicture: true,
      photoStyle: "circular-bordered",
      sidebarPosition: "left"
    },
    styles: {
      fontFamily: "'Cormorant Garamond', 'Georgia', serif",
      fontSize: "10.5pt",
      lineHeight: "1.55",
      colors: {
        primary: "#b8860b",
        secondary: "#8b7355",
        accent: "#daa520",
        text: "#2d2d2d",
        background: "#ffffff",
        sidebarBackground: "#1a1a2e",
        sidebarText: "#e8e8e8",
        headerBackground: "#1a1a2e",
        headerText: "#daa520",
        sectionTitle: "#1a1a2e",
        divider: "#daa520"
      },
      spacing: { sectionGap: "1.2rem", contentPadding: "1.5rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 10. SYDNEY =====
  // Fresh and colorful: gradient header, rounded elements, casual professional
  premium_sydney: {
    name: "Sydney",
    previewImage: "/templates/previews/premium_sydney.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "projects", "certifications", "languages", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "education", "skills", "projects", "certifications", "languages", "achievements"],
      showIcons: true,
      columns: 1,
      headerStyle: "sydney",
      spacing: "comfortable",
      layoutType: "sydney",
      showProfilePicture: true,
      photoStyle: "rounded-square"
    },
    styles: {
      fontFamily: "'Nunito', 'Inter', sans-serif",
      fontSize: "10.5pt",
      lineHeight: "1.55",
      colors: {
        primary: "#7c3aed",
        secondary: "#a78bfa",
        accent: "#7c3aed",
        text: "#374151",
        background: "#ffffff",
        headerBackground: "linear-gradient(135deg, #7c3aed, #a78bfa)",
        headerText: "#ffffff",
        sectionTitle: "#7c3aed",
        divider: "#ede9fe",
        cardBackground: "#faf5ff"
      },
      spacing: { sectionGap: "1.2rem", contentPadding: "1.8rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 11. TORONTO =====
  // Balanced professional: clean 2-column with photo, blue tones, recruiter-friendly
  premium_toronto: {
    name: "Toronto",
    previewImage: "/templates/previews/premium_toronto.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: ["personal", "skills", "certifications", "languages"],
      mainSections: ["summary", "experience", "education", "projects", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "33%",
      headerStyle: "toronto",
      spacing: "standard",
      layoutType: "toronto",
      showProfilePicture: true,
      photoStyle: "circular-medium",
      sidebarPosition: "left"
    },
    styles: {
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      fontSize: "10pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1d4ed8",
        secondary: "#6b7280",
        accent: "#3b82f6",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#1d4ed8",
        sidebarText: "#ffffff",
        headerBackground: "#1d4ed8",
        headerText: "#ffffff",
        sectionTitle: "#1d4ed8",
        divider: "#bfdbfe"
      },
      spacing: { sectionGap: "1rem", contentPadding: "1.25rem", headerPadding: "1.25rem" }
    }
  },

  // ===== 12. ATHENS =====
  // Classical: serif fonts, thin double borders, elegant proportions, 1-column
  premium_athens: {
    name: "Athens",
    previewImage: "/templates/previews/premium_athens.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      showIcons: false,
      columns: 1,
      headerStyle: "athens",
      spacing: "elegant",
      layoutType: "athens",
      showProfilePicture: false
    },
    styles: {
      fontFamily: "'EB Garamond', 'Times New Roman', serif",
      fontSize: "11pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1c1917",
        secondary: "#78716c",
        accent: "#292524",
        text: "#44403c",
        background: "#fffbf5",
        headerBackground: "#fffbf5",
        headerText: "#1c1917",
        sectionTitle: "#1c1917",
        divider: "#d6d3d1"
      },
      spacing: { sectionGap: "1.3rem", contentPadding: "2.5rem", headerPadding: "2rem" }
    }
  },

  // ===== 13. VIBES =====
  // Modern gradient: gradient header, progress bars for skills, card-based sections
  premium_vibes: {
    name: "Vibes",
    previewImage: "/templates/previews/premium_vibes.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "projects", "certifications", "languages", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "skills", "education", "projects", "certifications", "languages", "achievements"],
      showIcons: true,
      columns: 1,
      headerStyle: "vibes",
      spacing: "standard",
      layoutType: "vibes",
      showProfilePicture: true,
      photoStyle: "circular-medium"
    },
    styles: {
      fontFamily: "'Poppins', 'Inter', sans-serif",
      fontSize: "10pt",
      lineHeight: "1.5",
      colors: {
        primary: "#ec4899",
        secondary: "#f472b6",
        accent: "#ec4899",
        text: "#374151",
        background: "#ffffff",
        headerBackground: "linear-gradient(135deg, #ec4899, #8b5cf6)",
        headerText: "#ffffff",
        sectionTitle: "#ec4899",
        divider: "#fce7f3",
        cardBackground: "#fdf2f8",
        progressBar: "linear-gradient(90deg, #ec4899, #8b5cf6)"
      },
      spacing: { sectionGap: "1.2rem", contentPadding: "1.8rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 14. NANICA =====
  // Ultra-minimal: bold oversized name, minimal lines, maximum whitespace
  premium_nanica: {
    name: "Nanica",
    previewImage: "/templates/previews/premium_nanica.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      showIcons: false,
      columns: 1,
      headerStyle: "nanica",
      spacing: "generous",
      layoutType: "nanica",
      showProfilePicture: false
    },
    styles: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontSize: "10pt",
      lineHeight: "1.6",
      colors: {
        primary: "#0a0a0a",
        secondary: "#737373",
        accent: "#0a0a0a",
        text: "#404040",
        background: "#ffffff",
        headerBackground: "#ffffff",
        headerText: "#0a0a0a",
        sectionTitle: "#0a0a0a",
        divider: "#e5e5e5"
      },
      spacing: { sectionGap: "1.8rem", contentPadding: "2.5rem", headerPadding: "2.5rem" }
    }
  },

  // ===== 15. CARDS =====
  // Each section as a floating card with shadow, clean grid feel
  premium_cards: {
    name: "Cards",
    previewImage: "/templates/previews/premium_cards.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "projects", "certifications", "languages", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "education", "skills", "projects", "certifications", "languages", "achievements"],
      showIcons: true,
      columns: 1,
      headerStyle: "cards",
      spacing: "standard",
      layoutType: "cards",
      showProfilePicture: false
    },
    styles: {
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      fontSize: "10pt",
      lineHeight: "1.5",
      colors: {
        primary: "#0284c7",
        secondary: "#64748b",
        accent: "#0ea5e9",
        text: "#334155",
        background: "#f8fafc",
        headerBackground: "#0284c7",
        headerText: "#ffffff",
        sectionTitle: "#0284c7",
        divider: "#e2e8f0",
        cardBackground: "#ffffff",
        cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)"
      },
      spacing: { sectionGap: "1rem", contentPadding: "1.5rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 16. RIBBON =====
  // Colored ribbon/band header for each section, clean body
  premium_ribbon: {
    name: "Ribbon",
    previewImage: "/templates/previews/premium_ribbon.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      showIcons: true,
      columns: 1,
      headerStyle: "ribbon",
      spacing: "standard",
      layoutType: "ribbon",
      showProfilePicture: false
    },
    styles: {
      fontFamily: "'Manrope', 'Inter', sans-serif",
      fontSize: "10.5pt",
      lineHeight: "1.55",
      colors: {
        primary: "#059669",
        secondary: "#6b7280",
        accent: "#10b981",
        text: "#1f2937",
        background: "#ffffff",
        headerBackground: "#059669",
        headerText: "#ffffff",
        sectionTitle: "#ffffff",
        ribbonBackground: "#059669",
        divider: "#d1fae5"
      },
      spacing: { sectionGap: "1.2rem", contentPadding: "1.8rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 17. ACCENT LINE =====
  // Thin colored accent bar on left, elegant body, 1-column
  premium_accent_line: {
    name: "Accent Line",
    previewImage: "/templates/previews/premium_accent_line.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: [],
      mainSections: ["summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      showIcons: false,
      columns: 1,
      headerStyle: "accent-line",
      spacing: "standard",
      layoutType: "accent-line",
      showProfilePicture: false
    },
    styles: {
      fontFamily: "'Source Sans 3', 'Inter', sans-serif",
      fontSize: "10.5pt",
      lineHeight: "1.55",
      colors: {
        primary: "#7c3aed",
        secondary: "#6b7280",
        accent: "#7c3aed",
        text: "#374151",
        background: "#ffffff",
        headerBackground: "#ffffff",
        headerText: "#111827",
        sectionTitle: "#111827",
        accentLine: "#7c3aed",
        divider: "#e5e7eb"
      },
      spacing: { sectionGap: "1.2rem", contentPadding: "2rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 18. DUOTONE =====
  // Two-tone background: colored top half, white bottom half, 2-column
  premium_duotone: {
    name: "Duotone",
    previewImage: "/templates/previews/premium_duotone.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "projects", "achievements"],
      sidebarSections: ["skills", "certifications", "languages"],
      mainSections: ["summary", "experience", "education", "projects", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "32%",
      headerStyle: "duotone",
      spacing: "standard",
      layoutType: "duotone",
      showProfilePicture: true,
      photoStyle: "circular-medium",
      sidebarPosition: "right"
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "10pt",
      lineHeight: "1.5",
      colors: {
        primary: "#4f46e5",
        secondary: "#818cf8",
        accent: "#4f46e5",
        text: "#1f2937",
        background: "#ffffff",
        topBackground: "#4f46e5",
        sidebarBackground: "#f5f3ff",
        sidebarText: "#1f2937",
        headerBackground: "#4f46e5",
        headerText: "#ffffff",
        sectionTitle: "#4f46e5",
        divider: "#c7d2fe"
      },
      spacing: { sectionGap: "1rem", contentPadding: "1.5rem", headerPadding: "1.5rem" }
    }
  },

  // ===== 19. METRO =====
  // Windows Metro-inspired: colored tile headers, grid layout, flat design, 2-column
  premium_metro: {
    name: "Metro",
    previewImage: "/templates/previews/premium_metro.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "projects", "certifications", "languages", "achievements"],
      sidebarSections: ["skills", "languages", "certifications"],
      mainSections: ["summary", "experience", "education", "projects", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "33%",
      headerStyle: "metro",
      spacing: "compact",
      layoutType: "metro",
      showProfilePicture: false,
      sidebarPosition: "left"
    },
    styles: {
      fontFamily: "'Segoe UI', 'Inter', sans-serif",
      fontSize: "10pt",
      lineHeight: "1.45",
      colors: {
        primary: "#0078d4",
        secondary: "#605e5c",
        accent: "#0078d4",
        text: "#323130",
        background: "#ffffff",
        sidebarBackground: "#faf9f8",
        sidebarText: "#323130",
        headerBackground: "#0078d4",
        headerText: "#ffffff",
        sectionTitle: "#0078d4",
        tileColors: ["#0078d4", "#00a4ef", "#7fba00", "#f25022", "#ffb900"],
        divider: "#edebe9"
      },
      spacing: { sectionGap: "0.8rem", contentPadding: "1.25rem", headerPadding: "1rem" }
    }
  },

  // ===== 20. INFOGRAPHIC =====
  // Data visualization: progress bars, circular charts for skills, timeline for experience
  premium_infographic: {
    name: "Infographic",
    previewImage: "/templates/previews/premium_infographic.png",
    category: "Premium Design",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "projects", "certifications", "languages", "achievements"],
      sidebarSections: ["personal", "skills", "languages", "certifications"],
      mainSections: ["summary", "experience", "education", "projects", "achievements"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "35%",
      headerStyle: "infographic",
      spacing: "standard",
      layoutType: "infographic",
      showProfilePicture: true,
      photoStyle: "circular-large",
      sidebarPosition: "left"
    },
    styles: {
      fontFamily: "'Rubik', 'Inter', sans-serif",
      fontSize: "10pt",
      lineHeight: "1.5",
      colors: {
        primary: "#f59e0b",
        secondary: "#6b7280",
        accent: "#f59e0b",
        text: "#1f2937",
        background: "#ffffff",
        sidebarBackground: "#fffbeb",
        sidebarText: "#1f2937",
        headerBackground: "#f59e0b",
        headerText: "#ffffff",
        sectionTitle: "#92400e",
        divider: "#fde68a",
        progressBar: "#f59e0b",
        progressBackground: "#fef3c7"
      },
      spacing: { sectionGap: "1rem", contentPadding: "1.5rem", headerPadding: "1.5rem" }
    }
  }
};
