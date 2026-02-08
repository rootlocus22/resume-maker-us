// One-Pager Resume Templates for Marketing
// These templates are displayed on the home page and templates page
// Clicking them navigates to /one-pager-builder/editor

export const onePagerTemplates = {
  onepager_bold: {
    name: "One-Pager: Bold Impact",
    previewImage: "/templates/onepager-previews/bold.png",
    category: "One-Pager",
    premium: false,
    description: "Dramatic asymmetric design",
    templateId: "bold",
    layout: {
      headerStyle: "creative-asymmetric",
      sectionsOrder: ["summary", "experience", "education", "skills"],
      columns: 1,
      showIcons: true,
      spacing: "compact"
    },
    styles: {
      fontFamily: "Roboto, sans-serif",
      colors: {
        primary: "#1a365d", // Deep Blue
        secondary: "#2d3748", // Dark Gray
        accent: "#3182ce", // Bright Blue
        text: "#1a202c",
        background: "#ffffff"
      }
    }
  },
  onepager_creative: {
    name: "One-Pager: Creative",
    previewImage: "/templates/onepager-previews/creative.png",
    category: "One-Pager",
    premium: false,
    description: "Visual and modern design",
    templateId: "creative",
    layout: {
      headerStyle: "creative",
      sectionsOrder: ["summary", "skills", "experience", "education"],
      columns: 1,
      showIcons: true,
      spacing: "compact"
    },
    styles: {
      fontFamily: "Poppins, sans-serif",
      colors: {
        primary: "#805ad5", // Purple
        secondary: "#553c9a",
        accent: "#9f7aea",
        text: "#1a202c",
        background: "#ffffff"
      }
    }
  },
  onepager_modern: {
    name: "One-Pager: Modern Two-Column",
    previewImage: "/templates/onepager-previews/modern.png",
    category: "One-Pager",
    premium: false,
    description: "Elegant sidebar layout with modern styling",
    templateId: "modern",
    layout: {
      headerStyle: "onepager-modern",
      sectionsOrder: ["skills", "languages", "summary", "experience", "education"],
      sidebarSections: ["skills", "languages", "contact"],
      mainSections: ["summary", "experience", "education"],
      columns: 2,
      showIcons: true,
      spacing: "onepager-compact"
    },
    styles: {
      fontFamily: "Inter, sans-serif",
      colors: {
        primary: "#2b6cb0", // Strong Blue
        secondary: "#4a5568",
        accent: "#4299e1",
        text: "#2d3748",
        background: "#ffffff"
      }
    }
  },
  onepager_modern_tech: {
    name: "One-Pager: Modern Tech",
    previewImage: "/templates/onepager-previews/modern_tech.png",
    category: "One-Pager",
    premium: false,
    description: "Tech-focused double column with dark sidebar",
    templateId: "modern_tech",
    layout: {
      headerStyle: "tech-header",
      sectionsOrder: ["skills", "projects", "experience", "education"],
      sidebarSections: ["skills", "languages"],
      mainSections: ["summary", "experience", "projects", "education"],
      columns: 2,
      showIcons: true,
      spacing: "onepager-compact"
    },
    styles: {
      fontFamily: "JetBrains Mono, monospace",
      colors: {
        primary: "#0f172a", // Slate 900
        secondary: "#334155", // Slate 700
        accent: "#38bdf8", // Sky 400
        text: "#334155",
        background: "#ffffff"
      }
    }
  },
  onepager_graceful_elegance: {
    name: "One-Pager: Graceful Elegance",
    previewImage: "/templates/onepager-previews/graceful_elegance.png",
    category: "One-Pager",
    premium: false,
    description: "Highly eye-appealing, graceful and beautiful design",
    templateId: "graceful_elegance",
    layout: {
      headerStyle: "elegant",
      sectionsOrder: ["summary", "experience", "education", "skills"],
      columns: 1,
      showIcons: false,
      spacing: "standard"
    },
    styles: {
      fontFamily: "Playfair Display, serif",
      colors: {
        primary: "#702459", // Deep Pink/Purple
        secondary: "#97266d",
        accent: "#d53f8c",
        text: "#4a5568",
        background: "#fff5f7"
      }
    }
  },
  onepager_creative_bold: {
    name: "One-Pager: Creative Bold",
    previewImage: "/templates/onepager-previews/creative_bold.png",
    category: "One-Pager",
    premium: false,
    description: "Bold, artistic design with unique typography",
    templateId: "creative_bold",
    layout: {
      headerStyle: "creative",
      sectionsOrder: ["summary", "experience", "skills", "education"],
      columns: 1,
      showIcons: true,
      spacing: "compact"
    },
    styles: {
      fontFamily: "Oswald, sans-serif",
      colors: {
        primary: "#c53030", // Red
        secondary: "#9b2c2c",
        accent: "#fc8181",
        text: "#2d3748",
        background: "#fffafa"
      }
    }
  },
  onepager_magazine: {
    name: "One-Pager: Magazine Editorial",
    previewImage: "/templates/onepager-previews/magazine.png",
    category: "One-Pager",
    premium: false,
    description: "Multi-column newspaper style",
    templateId: "magazine",
    layout: {
      headerStyle: "split-header",
      sectionsOrder: ["summary", "experience", "projects", "education", "skills"],
      columns: 2, // Implies multi-column flow in some renderers, or specific magazine layout
      showIcons: false,
      spacing: "compact"
    },
    styles: {
      fontFamily: "Merriweather, serif",
      colors: {
        primary: "#000000",
        secondary: "#4a4a4a",
        accent: "#e53e3e",
        text: "#1a202c",
        background: "#ffffff"
      }
    }
  },
  onepager_timeline: {
    name: "One-Pager: Timeline Journey",
    previewImage: "/templates/onepager-previews/timeline.png",
    category: "One-Pager",
    premium: false,
    description: "Elegant timeline with visual markers",
    templateId: "timeline",
    layout: {
      headerStyle: "onepager-modern",
      sectionsOrder: ["experience", "education", "summary", "skills"],
      columns: 1,
      showIcons: true,
      timelineStyle: true,
      spacing: "standard"
    },
    styles: {
      fontFamily: "Lato, sans-serif",
      colors: {
        primary: "#2c5282",
        secondary: "#4a5568",
        accent: "#4299e1",
        text: "#2d3748",
        background: "#ffffff"
      }
    }
  },
  onepager_grid: {
    name: "One-Pager: Modern Grid",
    previewImage: "/templates/onepager-previews/grid.png",
    category: "One-Pager",
    premium: false,
    description: "Card-based box layout",
    templateId: "grid",
    layout: {
      headerStyle: "portfolio-modern",
      sectionsOrder: ["summary", "skills", "experience", "education"],
      columns: 2,
      gridStyle: true, // Custom flag that might need support or just implies 2-col
      showIcons: true,
      spacing: "compact"
    },
    styles: {
      fontFamily: "Montserrat, sans-serif",
      colors: {
        primary: "#276749", // Green
        secondary: "#2f855a",
        accent: "#48bb78",
        text: "#2d3748",
        background: "#f0fff4"
      }
    }
  },
  onepager_executive: {
    name: "One-Pager: Executive",
    previewImage: "/templates/onepager-previews/executive.png",
    category: "One-Pager",
    premium: false,
    description: "Professional accent for leadership roles",
    templateId: "executive",
    layout: {
      headerStyle: "onepager-sales", // Professional left-accent style
      sectionsOrder: ["summary", "experience", "education", "skills"],
      columns: 1,
      showIcons: false,
      spacing: "standard"
    },
    styles: {
      fontFamily: "Georgia, serif",
      colors: {
        primary: "#1a202c",
        secondary: "#4a5568",
        accent: "#d69e2e", // Gold
        text: "#2d3748",
        background: "#ffffff"
      }
    }
  },
  onepager_elegant: {
    name: "One-Pager: Elegant Serif",
    previewImage: "/templates/onepager-previews/elegant.png",
    category: "One-Pager",
    premium: false,
    description: "Minimalist with white space",
    templateId: "elegant",
    layout: {
      headerStyle: "onepager-clean",
      sectionsOrder: ["summary", "experience", "education", "skills"],
      columns: 1,
      showIcons: false,
      spacing: "standard"
    },
    styles: {
      fontFamily: "Lora, serif",
      colors: {
        primary: "#4a5568",
        secondary: "#718096",
        accent: "#718096",
        text: "#2d3748",
        background: "#ffffff"
      }
    }
  },
  onepager_professional_serif: {
    name: "One-Pager: Professional Serif",
    previewImage: "/templates/onepager-previews/professional_serif.png",
    category: "One-Pager",
    premium: false,
    description: "Elegant serif fonts for high readability",
    templateId: "professional_serif",
    layout: {
      headerStyle: "onepager-clean",
      sectionsOrder: ["summary", "experience", "education", "skills"],
      columns: 1,
      showIcons: false,
      spacing: "compact"
    },
    styles: {
      fontFamily: "Merriweather, serif",
      colors: {
        primary: "#2d3748",
        secondary: "#4a5568",
        accent: "#2c5282",
        text: "#1a202c",
        background: "#ffffff"
      }
    }
  },
  onepager_classic: {
    name: "One-Pager: Classic Professional",
    previewImage: "/templates/onepager-previews/classic.png",
    category: "One-Pager",
    premium: false,
    description: "Clean single column layout perfect for any profession",
    templateId: "classic",
    layout: {
      headerStyle: "onepager-clean",
      sectionsOrder: ["summary", "experience", "education", "skills"],
      columns: 1,
      showIcons: false,
      spacing: "compact"
    },
    styles: {
      fontFamily: "Arial, sans-serif",
      colors: {
        primary: "#2d3748",
        secondary: "#4a5568",
        accent: "#3182ce",
        text: "#2d3748",
        background: "#ffffff"
      }
    }
  },
  onepager_compact: {
    name: "One-Pager: Compact Minimal",
    previewImage: "/templates/onepager-previews/compact.png",
    category: "One-Pager",
    premium: false,
    description: "Maximizes space for more content",
    templateId: "compact",
    layout: {
      headerStyle: "onepager-clean",
      sectionsOrder: ["summary", "skills", "experience", "education"],
      columns: 1,
      showIcons: false,
      spacing: "onepager-ultra-compact"
    },
    styles: {
      fontFamily: "Open Sans, sans-serif",
      colors: {
        primary: "#1a202c",
        secondary: "#4a5568",
        accent: "#3182ce",
        text: "#2d3748",
        background: "#ffffff"
      }
    }
  },
  onepager_tech: {
    name: "One-Pager: Tech-Focused",
    previewImage: "/templates/onepager-previews/tech.png",
    category: "One-Pager",
    premium: false,
    description: "Developer style for tech professionals",
    templateId: "tech",
    layout: {
      headerStyle: "onepager-tech",
      sectionsOrder: ["skills", "experience", "projects", "education"],
      columns: 1,
      showIcons: true,
      spacing: "compact"
    },
    styles: {
      fontFamily: "Fira Code, monospace",
      colors: {
        primary: "#2d3748",
        secondary: "#4a5568",
        accent: "#38a169", // Green for tech
        text: "#1a202c",
        background: "#ffffff"
      }
    }
  }
};
