// Extended Resume Templates - Batch 1: Modern & Contemporary
// Inspired by Canva's design patterns and modern resume trends

export const modernContemporaryTemplates = {
  // MODERN GRADIENT SERIES (5 templates)
  modern_gradient_blue: {
    name: "Modern Gradient Blue",
    previewImage: "/templates/previews/modern_gradient_blue.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebar: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      sidebarWidth: "35%",
      headerStyle: "gradient"
    },
    styles: {
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      fontSize: "11pt",
      lineHeight: "1.6",
      colors: {
        primary: "#667eea",
        secondary: "#764ba2", 
        accent: "#4f46e5",
        text: "#1f2937",
        background: "#ffffff",
        sidebarText: "#ffffff"
      },
      effects: {
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        shadow: "0 10px 25px rgba(102, 126, 234, 0.15)",
        borderRadius: "12px"
      }
    }
  },

  modern_gradient_sunset: {
    name: "Modern Gradient Sunset",
    previewImage: "/templates/previews/modern_gradient_sunset.png", 
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebar: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
      sidebarWidth: "35%",
      headerStyle: "gradient"
    },
    styles: {
      fontFamily: "'Poppins', system-ui, sans-serif",
      fontSize: "11pt", 
      lineHeight: "1.6",
      colors: {
        primary: "#ff6b6b",
        secondary: "#ee5a6f",
        accent: "#ff8e53", 
        text: "#2d3436",
        background: "#ffffff",
        sidebarText: "#ffffff"
      }
    }
  },

  modern_gradient_ocean: {
    name: "Modern Gradient Ocean",
    previewImage: "/templates/previews/modern_gradient_ocean.png",
    category: "Modern", 
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebar: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Nunito Sans', system-ui, sans-serif",
      fontSize: "11pt",
      colors: {
        primary: "#0077be",
        secondary: "#00a8cc", 
        accent: "#40e0d0",
        text: "#2c3e50"
      }
    }
  },

  modern_gradient_forest: {
    name: "Modern Gradient Forest", 
    previewImage: "/templates/previews/modern_gradient_forest.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"], 
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebar: "linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)",
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Open Sans', system-ui, sans-serif",
      colors: {
        primary: "#27ae60",
        secondary: "#2ecc71",
        accent: "#58d68d", 
        text: "#2c3e50"
      }
    }
  },

  modern_gradient_royal: {
    name: "Modern Gradient Royal",
    previewImage: "/templates/previews/modern_gradient_royal.png",
    category: "Modern",
    premium: false, 
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebar: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Montserrat', system-ui, sans-serif",
      colors: {
        primary: "#6c5ce7",
        secondary: "#a29bfe",
        accent: "#fd79a8",
        text: "#2d3436"
      }
    }
  },

  // CONTEMPORARY CARDS SERIES (5 templates)
  contemporary_cards_shadow: {
    name: "Contemporary Cards Shadow",
    previewImage: "/templates/previews/contemporary_cards_shadow.png", 
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: true,
      columns: 1,
      cardStyle: true,
      headerStyle: "card"
    },
    styles: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: "11pt",
      colors: {
        primary: "#1e40af",
        secondary: "#3b82f6", 
        accent: "#60a5fa",
        text: "#1f2937",
        cardBg: "#ffffff"
      },
      effects: {
        cardShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        borderRadius: "8px",
        spacing: "1.5rem"
      }
    }
  },

  contemporary_cards_border: {
    name: "Contemporary Cards Border",
    previewImage: "/templates/previews/contemporary_cards_border.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"], 
      showIcons: true,
      columns: 1,
      cardStyle: true,
      borderStyle: "accent"
    },
    styles: {
      fontFamily: "'Roboto', system-ui, sans-serif",
      colors: {
        primary: "#059669",
        secondary: "#10b981",
        accent: "#34d399",
        text: "#111827",
        border: "#d1fae5"
      }
    }
  },

  contemporary_split_layout: {
    name: "Contemporary Split Layout", 
    previewImage: "/templates/previews/contemporary_split_layout.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "40%",
      splitStyle: "diagonal"
    },
    styles: {
      fontFamily: "'Source Sans Pro', system-ui, sans-serif",
      colors: {
        primary: "#7c3aed",
        secondary: "#a855f7", 
        accent: "#c084fc",
        text: "#1f2937"
      }
    }
  },

  contemporary_timeline: {
    name: "Contemporary Timeline",
    previewImage: "/templates/previews/contemporary_timeline.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      timelineStyle: "modern",
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Lato', system-ui, sans-serif",
      colors: {
        primary: "#dc2626",
        secondary: "#ef4444",
        accent: "#f87171", 
        text: "#1f2937",
        timeline: "#fca5a5"
      }
    }
  },

  contemporary_geometric: {
    name: "Contemporary Geometric",
    previewImage: "/templates/previews/contemporary_geometric.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      geometricElements: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Fira Sans', system-ui, sans-serif", 
      colors: {
        primary: "#0891b2",
        secondary: "#06b6d4",
        accent: "#67e8f9",
        text: "#0f172a",
        geometric: "#cffafe"
      }
    }
  },

  // CONTEMPORARY MINIMAL SERIES (5 templates)
  contemporary_minimal_lines: {
    name: "Contemporary Minimal Lines",
    previewImage: "/templates/previews/contemporary_minimal_lines.png",
    category: "Modern", 
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      lineAccents: true,
      headerStyle: "minimal"
    },
    styles: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: "11pt",
      colors: {
        primary: "#374151",
        secondary: "#6b7280",
        accent: "#3b82f6",
        text: "#1f2937",
        lines: "#e5e7eb"
      },
      spacing: {
        sectionGap: "2rem",
        lineHeight: "1.6"
      }
    }
  },

  contemporary_minimal_dots: {
    name: "Contemporary Minimal Dots",
    previewImage: "/templates/previews/contemporary_minimal_dots.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      dotAccents: true
    },
    styles: {
      fontFamily: "'Nunito Sans', system-ui, sans-serif",
      colors: {
        primary: "#1f2937",
        secondary: "#4b5563", 
        accent: "#059669",
        text: "#374151",
        dots: "#d1d5db"
      }
    }
  },

  contemporary_sidebar_accent: {
    name: "Contemporary Sidebar Accent",
    previewImage: "/templates/previews/contemporary_sidebar_accent.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebarWidth: "30%",
      accentBar: true
    },
    styles: {
      fontFamily: "'Roboto', system-ui, sans-serif",
      colors: {
        primary: "#7c2d12",
        secondary: "#ea580c",
        accent: "#fb923c",
        text: "#1c1917",
        sidebarAccent: "#fed7aa"
      }
    }
  },

  contemporary_header_focus: {
    name: "Contemporary Header Focus", 
    previewImage: "/templates/previews/contemporary_header_focus.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: true,
      columns: 1,
      headerStyle: "prominent",
      headerHeight: "large"
    },
    styles: {
      fontFamily: "'Open Sans', system-ui, sans-serif",
      colors: {
        primary: "#1e1b4b",
        secondary: "#3730a3",
        accent: "#6366f1",
        text: "#1f2937"
      }
    }
  },

  contemporary_two_tone: {
    name: "Contemporary Two Tone",
    previewImage: "/templates/previews/contemporary_two_tone.png",
    category: "Modern",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      twoToneStyle: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Montserrat', system-ui, sans-serif",
      colors: {
        primary: "#0f172a",
        secondary: "#475569",
        accent: "#0ea5e9",
        text: "#1e293b",
        tone1: "#f8fafc",
        tone2: "#e2e8f0"
      }
    }
  },

  // MODERN TECH SERIES (5 templates)
  modern_tech_grid: {
    name: "Modern Tech Grid",
    previewImage: "/templates/previews/modern_tech_grid.png",
    category: "Modern",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      gridLayout: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "10.5pt",
      colors: {
        primary: "#0d1117",
        secondary: "#21262d",
        accent: "#58a6ff",
        text: "#f0f6fc",
        background: "#010409",
        grid: "#30363d"
      },
      effects: {
        neonGlow: "0 0 5px rgba(88, 166, 255, 0.5)",
        borderRadius: "4px"
      }
    }
  },

  modern_tech_terminal: {
    name: "Modern Tech Terminal",
    previewImage: "/templates/previews/modern_tech_terminal.png", 
    category: "Modern",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "skills", "education", "certifications"],
      showIcons: false,
      columns: 1,
      terminalStyle: true
    },
    styles: {
      fontFamily: "'Source Code Pro', 'Courier New', monospace",
      colors: {
        primary: "#00ff00",
        secondary: "#00cc00",
        accent: "#ffff00",
        text: "#00ff00",
        background: "#000000",
        prompt: "#ffffff"
      }
    }
  },

  modern_tech_circuit: {
    name: "Modern Tech Circuit",
    previewImage: "/templates/previews/modern_tech_circuit.png",
    category: "Modern",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      circuitPattern: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Orbitron', 'Exo 2', sans-serif",
      colors: {
        primary: "#00d4aa",
        secondary: "#00a693",
        accent: "#00ffd4",
        text: "#ffffff",
        background: "#0a0e27",
        circuit: "#1a1f3a"
      }
    }
  },

  modern_tech_neon: {
    name: "Modern Tech Neon",
    previewImage: "/templates/previews/modern_tech_neon.png",
    category: "Modern", 
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "skills", "education", "certifications"],
      showIcons: true,
      columns: 1,
      neonEffects: true
    },
    styles: {
      fontFamily: "'Audiowide', 'Play', sans-serif",
      colors: {
        primary: "#ff0080",
        secondary: "#00ffff", 
        accent: "#ffff00",
        text: "#ffffff",
        background: "#1a0033",
        neon: "#ff00ff"
      },
      effects: {
        textShadow: "0 0 10px currentColor",
        boxShadow: "0 0 20px rgba(255, 0, 128, 0.5)"
      }
    }
  },

  modern_tech_glass: {
    name: "Modern Tech Glass",
    previewImage: "/templates/previews/modern_tech_glass.png",
    category: "Modern",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education", "certifications"],
      showIcons: true,
      columns: 2,
      glassmorphism: true,
      sidebarWidth: "35%" 
    },
    styles: {
      fontFamily: "'Inter', system-ui, sans-serif",
      colors: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#a855f7",
        text: "#1f2937",
        glass: "rgba(255, 255, 255, 0.1)",
        backdrop: "blur(10px)"
      },
      effects: {
        backdropFilter: "blur(10px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.125)",
        borderRadius: "12px"
      }
    }
  }
};

export default modernContemporaryTemplates; 