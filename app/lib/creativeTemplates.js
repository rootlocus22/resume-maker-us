// Extended Resume Templates - Batch 2: Creative & Artistic
// Inspired by Canva's creative design patterns and artistic layouts

export const creativeArtisticTemplates = {
  // ARTISTIC PORTFOLIO SERIES (5 templates)
  creative_portfolio_magazine: {
    name: "Creative Portfolio Magazine",
    previewImage: "/templates/previews/creative_portfolio_magazine.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "portfolio", "experience", "skills", "education"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "portfolio", "experience", "skills", "education"],
      showIcons: true,
      columns: 1,
      magazineLayout: true,
      headerStyle: "artistic"
    },
    styles: {
      fontFamily: "'Playfair Display', 'Georgia', serif",
      fontSize: "11pt",
      lineHeight: "1.7",
      colors: {
        primary: "#2c1810",
        secondary: "#8b4513",
        accent: "#daa520",
        text: "#2f2f2f",
        background: "#fffef7",
        highlight: "#f4e4bc"
      },
      effects: {
        dropCap: true,
        ornaments: true,
        textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
      }
    }
  },

  creative_portfolio_gallery: {
    name: "Creative Portfolio Gallery",
    previewImage: "/templates/previews/creative_portfolio_gallery.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "portfolio", "summary", "experience", "skills", "education"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["portfolio", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      galleryLayout: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Montserrat', 'Helvetica Neue', sans-serif",
      colors: {
        primary: "#1a1a1a",
        secondary: "#666666",
        accent: "#ff6b6b",
        text: "#333333",
        background: "#ffffff",
        gallery: "#f8f8f8"
      }
    }
  },

  creative_portfolio_collage: {
    name: "Creative Portfolio Collage",
    previewImage: "/templates/previews/creative_portfolio_collage.png",
    category: "Creative",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "portfolio", "experience", "skills", "education"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "portfolio", "experience", "skills", "education"],
      showIcons: false,
      columns: 1,
      collageStyle: true,
      asymmetricLayout: true
    },
    styles: {
      fontFamily: "'Oswald', 'Impact', sans-serif",
      colors: {
        primary: "#e74c3c",
        secondary: "#34495e",
        accent: "#f39c12",
        text: "#2c3e50",
        collage: "#ecf0f1"
      }
    }
  },

  creative_portfolio_minimal: {
    name: "Creative Portfolio Minimal",
    previewImage: "/templates/previews/creative_portfolio_minimal.png", 
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "portfolio", "summary", "experience", "skills", "education"],
      sidebarSections: ["personal", "portfolio"],
      mainSections: ["summary", "experience", "skills", "education"],
      showIcons: false,
      columns: 2,
      minimalCreative: true,
      sidebarWidth: "40%"
    },
    styles: {
      fontFamily: "'Lato', 'Helvetica', sans-serif",
      colors: {
        primary: "#2c3e50",
        secondary: "#95a5a6",
        accent: "#e67e22",
        text: "#34495e",
        background: "#ffffff"
      }
    }
  },

  creative_portfolio_bold: {
    name: "Creative Portfolio Bold",
    previewImage: "/templates/previews/creative_portfolio_bold.png",
    category: "Creative",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "portfolio", "experience", "skills", "education"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "portfolio", "experience", "skills", "education"],
      showIcons: true,
      columns: 1,
      boldDesign: true,
      headerStyle: "statement"
    },
    styles: {
      fontFamily: "'Bebas Neue', 'Anton', sans-serif",
      colors: {
        primary: "#ffffff",
        secondary: "#ff4757",
        accent: "#ffa502",
        text: "#2f3542",
        background: "#1e272e",
        bold: "#ff6348"
      }
    }
  },

  // INFOGRAPHIC SERIES (5 templates)
  creative_infographic_timeline: {
    name: "Creative Infographic Timeline",
    previewImage: "/templates/previews/creative_infographic_timeline.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "achievements"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education", "achievements"],
      showIcons: true,
      columns: 2,
      infographicStyle: true,
      timelineGraphic: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Nunito Sans', system-ui, sans-serif",
      colors: {
        primary: "#4834d4",
        secondary: "#686de0",
        accent: "#130f40",
        text: "#2f3542",
        infographic: "#ddd6fe",
        timeline: "#c4b5fd"
      }
    }
  },

  creative_infographic_chart: {
    name: "Creative Infographic Chart",
    previewImage: "/templates/previews/creative_infographic_chart.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "achievements"],
      sidebarSections: ["personal", "skills", "achievements"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      chartElements: true,
      dataVisualization: true,
      sidebarWidth: "40%"
    },
    styles: {
      fontFamily: "'Source Sans Pro', system-ui, sans-serif",
      colors: {
        primary: "#0abde3",
        secondary: "#006ba6",
        accent: "#f0932b",
        text: "#2f3542",
        chart: "#e8f4f8",
        data: "#48cae4"
      }
    }
  },

  creative_infographic_process: {
    name: "Creative Infographic Process",
    previewImage: "/templates/previews/creative_infographic_process.png",
    category: "Creative",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "process"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "skills", "education", "process"],
      showIcons: true,
      columns: 1,
      processFlow: true,
      diagramStyle: true
    },
    styles: {
      fontFamily: "'Roboto', system-ui, sans-serif",
      colors: {
        primary: "#e55039",
        secondary: "#fa7f72",
        accent: "#3c6382",
        text: "#2f3542",
        process: "#f8f9fa",
        flow: "#dee2e6"
      }
    }
  },

  creative_infographic_stats: {
    name: "Creative Infographic Stats",
    previewImage: "/templates/previews/creative_infographic_stats.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "achievements", "experience", "skills", "education"],
      sidebarSections: ["personal", "achievements", "skills"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      statisticsDisplay: true,
      numberHighlights: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Poppins', system-ui, sans-serif",
      colors: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
        accent: "#45b7d1",
        text: "#2c2c54",
        stats: "#f7f1e3",
        numbers: "#ff9ff3"
      }
    }
  },

  creative_infographic_icons: {
    name: "Creative Infographic Icons",
    previewImage: "/templates/previews/creative_infographic_icons.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "hobbies"],
      sidebarSections: ["personal", "skills", "hobbies"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      iconHeavy: true,
      visualElements: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Open Sans', system-ui, sans-serif",
      colors: {
        primary: "#5f27cd",
        secondary: "#a55eea",
        accent: "#26de81",
        text: "#2f3640",
        icons: "#d63031",
        visual: "#ffeaa7"
      }
    }
  },

  // ARTISTIC COLORFUL SERIES (5 templates)
  creative_colorful_rainbow: {
    name: "Creative Colorful Rainbow",
    previewImage: "/templates/previews/creative_colorful_rainbow.png",
    category: "Creative",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "interests"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "skills", "education", "interests"],
      showIcons: true,
      columns: 1,
      colorfulAccents: true,
      rainbowElements: true
    },
    styles: {
      fontFamily: "'Quicksand', system-ui, sans-serif",
      colors: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
        accent: "#45b7d1",
        text: "#2c2c54",
        rainbow: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd"],
        background: "#ffffff"
      }
    }
  },

  creative_colorful_sunset: {
    name: "Creative Colorful Sunset",
    previewImage: "/templates/previews/creative_colorful_sunset.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "achievements"],
      sidebarSections: ["personal", "skills", "achievements"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sunsetGradient: true,
      warmColors: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Raleway', system-ui, sans-serif",
      colors: {
        primary: "#ff7675",
        secondary: "#fd79a8",
        accent: "#fdcb6e",
        text: "#2d3436",
        sunset: "linear-gradient(135deg, #ff7675 0%, #fd79a8 50%, #fdcb6e 100%)"
      }
    }
  },

  creative_colorful_ocean: {
    name: "Creative Colorful Ocean",
    previewImage: "/templates/previews/creative_colorful_ocean.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      oceanTheme: true,
      waveElements: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Lora', serif",
      colors: {
        primary: "#0984e3",
        secondary: "#74b9ff",
        accent: "#00cec9",
        text: "#2d3436",
        ocean: "#ddd6fe",
        waves: "#a29bfe"
      }
    }
  },

  creative_colorful_forest: {
    name: "Creative Colorful Forest",
    previewImage: "/templates/previews/creative_colorful_forest.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "volunteer"],
      sidebarSections: ["personal", "skills", "volunteer"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      forestTheme: true,
      naturalElements: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Merriweather', serif",
      colors: {
        primary: "#00b894",
        secondary: "#55efc4",
        accent: "#a29bfe",
        text: "#2d3436",
        forest: "#d5f4e6",
        nature: "#81ecec"
      }
    }
  },

  creative_colorful_cosmic: {
    name: "Creative Colorful Cosmic",
    previewImage: "/templates/previews/creative_colorful_cosmic.png",
    category: "Creative",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "projects"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "skills", "education", "projects"],
      showIcons: true,
      columns: 1,
      cosmicTheme: true,
      galaxyElements: true,
      starField: true
    },
    styles: {
      fontFamily: "'Orbitron', 'Exo 2', sans-serif",
      colors: {
        primary: "#6c5ce7",
        secondary: "#a29bfe",
        accent: "#fd79a8",
        text: "#2d3436",
        cosmic: "#0c0c0c",
        galaxy: "#1a1a2e",
        stars: "#ffeaa7"
      }
    }
  },

  // DESIGNER SHOWCASE SERIES (5 templates)
  creative_designer_modern: {
    name: "Creative Designer Modern",
    previewImage: "/templates/previews/creative_designer_modern.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "portfolio", "experience", "skills", "education"],
      sidebarSections: ["personal", "portfolio", "skills"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      designerLayout: true,
      portfolioFocus: true,
      sidebarWidth: "40%"
    },
    styles: {
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      colors: {
        primary: "#2d3436",
        secondary: "#636e72",
        accent: "#00b894",
        text: "#2d3436",
        designer: "#f1f2f6",
        portfolio: "#ffffff"
      }
    }
  },

  creative_designer_vintage: {
    name: "Creative Designer Vintage",
    previewImage: "/templates/previews/creative_designer_vintage.png",
    category: "Creative",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "portfolio", "skills", "education"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "portfolio", "skills", "education"],
      showIcons: false,
      columns: 1,
      vintageStyle: true,
      ornateElements: true
    },
    styles: {
      fontFamily: "'Playfair Display', 'Times New Roman', serif",
      colors: {
        primary: "#8b4513",
        secondary: "#a0522d",
        accent: "#daa520",
        text: "#2f1b14",
        vintage: "#f5f5dc",
        ornate: "#cd853f"
      }
    }
  },

  creative_designer_brutalist: {
    name: "Creative Designer Brutalist",
    previewImage: "/templates/previews/creative_designer_brutalist.png",
    category: "Creative",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "manifesto"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "skills", "education", "manifesto"],
      showIcons: false,
      columns: 1,
      brutalistStyle: true,
      boldTypography: true
    },
    styles: {
      fontFamily: "'Helvetica Neue', 'Arial Black', sans-serif",
      colors: {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#ff0000",
        text: "#000000",
        brutalist: "#ffff00",
        bold: "#ff00ff"
      }
    }
  },

  creative_designer_swiss: {
    name: "Creative Designer Swiss",
    previewImage: "/templates/previews/creative_designer_swiss.png",
    category: "Creative",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "philosophy"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education", "philosophy"],
      showIcons: false,
      columns: 2,
      swissStyle: true,
      gridSystem: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Helvetica Neue', 'Helvetica', sans-serif",
      colors: {
        primary: "#000000",
        secondary: "#666666",
        accent: "#ff0000",
        text: "#000000",
        swiss: "#ffffff",
        grid: "#e0e0e0"
      }
    }
  },

  creative_designer_bauhaus: {
    name: "Creative Designer Bauhaus",
    previewImage: "/templates/previews/creative_designer_bauhaus.png",
    category: "Creative",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "principles"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "skills", "education", "principles"],
      showIcons: false,
      columns: 1,
      bauhausStyle: true,
      geometricShapes: true
    },
    styles: {
      fontFamily: "'Futura', 'Avant Garde', sans-serif",
      colors: {
        primary: "#000000",
        secondary: "#ff0000",
        accent: "#0000ff",
        text: "#000000",
        bauhaus: "#ffff00",
        geometric: "#ffffff"
      }
    }
  }
};

export default creativeArtisticTemplates; 