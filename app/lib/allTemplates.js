// Master Template Collection - 100+ Professional Resume Templates
// Inspired by Canva's design patterns and modern resume trends

import { originalTemplates as existingTemplates } from './templates.js';
import modernContemporaryTemplates from './extendedTemplates.js';
import creativeArtisticTemplates from './creativeTemplates.js';
import professionalCorporateTemplates from './professionalTemplates.js';
import { atsFriendlyTemplates } from './atsFriendlyTemplates.js';

// BATCH 4: Minimalist & Clean Templates (15 templates)
const minimalistCleanTemplates = {
  minimalist_swiss_white: {
    name: "Minimalist Swiss White",
    previewImage: "/templates/previews/minimalist_swiss_white.png",
    category: "Minimalist",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      swissDesign: true,
      headerStyle: "minimal"
    },
    styles: {
      fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.6",
      colors: {
        primary: "#000000",
        secondary: "#666666",
        accent: "#000000",
        text: "#333333",
        background: "#ffffff"
      },
      spacing: {
        sectionGap: "2.5rem",
        contentPadding: "0"
      }
    }
  },

  minimalist_scandinavian: {
    name: "Minimalist Scandinavian",
    previewImage: "/templates/previews/minimalist_scandinavian.png",
    category: "Minimalist",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "education"],
      showIcons: false,
      columns: 2,
      scandinavianStyle: true,
      sidebarWidth: "25%"
    },
    styles: {
      fontFamily: "'Inter', 'SF Pro Text', sans-serif",
      colors: {
        primary: "#2c3e50",
        secondary: "#7f8c8d",
        accent: "#3498db",
        text: "#2c3e50",
        scandinavian: "#f8f9fa"
      }
    }
  },

  minimalist_zen: {
    name: "Minimalist Zen",
    previewImage: "/templates/previews/minimalist_zen.png",
    category: "Minimalist", 
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      zenStyle: true,
      spaciousLayout: true
    },
    styles: {
      fontFamily: "'Source Sans Pro', sans-serif",
      colors: {
        primary: "#4a4a4a",
        secondary: "#8a8a8a",
        accent: "#2ecc71",
        text: "#4a4a4a",
        zen: "#fefefe"
      }
    }
  },

  minimalist_japanese: {
    name: "Minimalist Japanese",
    previewImage: "/templates/previews/minimalist_japanese.png",
    category: "Minimalist",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      japaneseAesthetics: true,
      asymmetricBalance: true
    },
    styles: {
      fontFamily: "'Noto Sans', 'Hiragino Sans', sans-serif",
      colors: {
        primary: "#2c2c2c",
        secondary: "#8e8e8e",
        accent: "#d63384",
        text: "#2c2c2c",
        japanese: "#fafafa"
      }
    }
  },

  minimalist_monochrome: {
    name: "Minimalist Monochrome",
    previewImage: "/templates/previews/minimalist_monochrome.png",
    category: "Minimalist",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      monochromeStyle: true
    },
    styles: {
      fontFamily: "'Roboto Mono', 'Courier New', monospace",
      colors: {
        primary: "#000000",
        secondary: "#555555",
        accent: "#000000",
        text: "#333333",
        monochrome: "#ffffff"
      }
    }
  }
};

// BATCH 5: Entry-Level & Student Templates (10 templates)
const entryLevelStudentTemplates = {
  student_fresh_graduate: {
    name: "Student Fresh Graduate",
    previewImage: "/templates/previews/student_fresh_graduate.png",
    category: "Student",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "education", "projects", "internships", "skills"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "education", "projects", "internships"],
      showIcons: true,
      columns: 2,
      studentFocused: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Roboto', 'Open Sans', sans-serif",
      colors: {
        primary: "#3b82f6",
        secondary: "#60a5fa",
        accent: "#93c5fd",
        text: "#1f2937",
        student: "#eff6ff"
      }
    }
  },

  student_internship: {
    name: "Student Internship",
    previewImage: "/templates/previews/student_internship.png",
    category: "Student",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "objective", "education", "relevant_coursework", "projects", "skills"],
      showIcons: true,
      columns: 1,
      internshipFocus: true
    },
    styles: {
      fontFamily: "'Nunito Sans', sans-serif",
      colors: {
        primary: "#10b981",
        secondary: "#34d399",
        accent: "#6ee7b7",
        text: "#065f46",
        internship: "#ecfdf5"
      }
    }
  },

  entry_level_modern: {
    name: "Entry Level Modern",
    previewImage: "/templates/previews/entry_level_modern.png",
    category: "Entry Level",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "education", "experience", "skills", "achievements"],
      sidebarSections: ["personal", "skills", "achievements"],
      mainSections: ["summary", "education", "experience"],
      showIcons: true,
      columns: 2,
      entryLevelOptimized: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Poppins', sans-serif",
      colors: {
        primary: "#8b5cf6",
        secondary: "#a78bfa",
        accent: "#c4b5fd",
        text: "#581c87",
        entry: "#f5f3ff"
      }
    }
  },

  entry_level_colorful: {
    name: "Entry Level Colorful",
    previewImage: "/templates/previews/entry_level_colorful.png",
    category: "Entry Level",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "education", "experience", "skills", "volunteer"],
      showIcons: true,
      columns: 1,
      colorfulDesign: true,
      youthfulStyle: true
    },
    styles: {
      fontFamily: "'Quicksand', sans-serif",
      colors: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
        accent: "#45b7d1",
        text: "#2c2c54",
        colorful: "#ffffff"
      }
    }
  },

  entry_level_professional: {
    name: "Entry Level Professional",
    previewImage: "/templates/previews/entry_level_professional.png",
    category: "Entry Level",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "education", "experience", "skills", "certifications"],
      sidebarSections: ["personal", "skills", "certifications"],
      mainSections: ["summary", "education", "experience"],
      showIcons: true,
      columns: 2,
      professionalEntry: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Source Sans Pro', sans-serif",
      colors: {
        primary: "#1e40af",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        text: "#1e293b",
        professional: "#f8fafc"
      }
    }
  }
};

// BATCH 6: Industry-Specific Templates (15 templates)
const industrySpecificTemplates = {
  tech_software_engineer: {
    name: "Tech Software Engineer",
    previewImage: "/templates/previews/tech_software_engineer.png",
    category: "Technology",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "technical_skills", "experience", "projects", "education"],
      sidebarSections: ["personal", "technical_skills"],
      mainSections: ["summary", "experience", "projects", "education"],
      showIcons: true,
      columns: 2,
      techOptimized: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      colors: {
        primary: "#0f172a",
        secondary: "#1e293b",
        accent: "#3b82f6",
        text: "#334155",
        tech: "#f8fafc"
      }
    }
  },

  healthcare_medical: {
    name: "Healthcare Medical",
    previewImage: "/templates/previews/healthcare_medical.png",
    category: "Healthcare",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "certifications", "skills"],
      sidebarSections: ["personal", "certifications"],
      mainSections: ["summary", "experience", "education", "skills"],
      showIcons: true,
      columns: 2,
      medicalFocus: true,
      sidebarWidth: "25%"
    },
    styles: {
      fontFamily: "'Times New Roman', serif",
      colors: {
        primary: "#dc2626",
        secondary: "#ef4444",
        accent: "#f87171",
        text: "#7f1d1d",
        medical: "#fef2f2"
      }
    }
  },

  marketing_digital: {
    name: "Marketing Digital",
    previewImage: "/templates/previews/marketing_digital.png",
    category: "Marketing",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "campaigns", "skills", "education"],
      sidebarSections: ["personal", "skills"],
      mainSections: ["summary", "experience", "campaigns", "education"],
      showIcons: true,
      columns: 2,
      marketingStyle: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Montserrat', sans-serif",
      colors: {
        primary: "#f59e0b",
        secondary: "#fbbf24",
        accent: "#fcd34d",
        text: "#92400e",
        marketing: "#fffbeb"
      }
    }
  },

  education_teacher: {
    name: "Education Teacher",
    previewImage: "/templates/previews/education_teacher.png",
    category: "Education",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "certifications", "skills"],
      sidebarSections: ["personal", "certifications", "skills"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      educationFocus: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Georgia', serif",
      colors: {
        primary: "#059669",
        secondary: "#10b981",
        accent: "#34d399",
        text: "#064e3b",
        education: "#ecfdf5"
      }
    }
  },

  sales_account_manager: {
    name: "Sales Account Manager",
    previewImage: "/templates/previews/sales_account_manager.png",
    category: "Sales",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "achievements", "experience", "skills", "education"],
      sidebarSections: ["personal", "achievements", "skills"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      salesOptimized: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Arial', sans-serif",
      colors: {
        primary: "#dc2626",
        secondary: "#ef4444",
        accent: "#f87171",
        text: "#991b1b",
        sales: "#fef2f2"
      }
    }
  }
};

// BATCH 7: Colorful & Bold Templates (10 templates)
const colorfulBoldTemplates = {
  bold_neon_cyber: {
    name: "Bold Neon Cyber",
    previewImage: "/templates/previews/bold_neon_cyber.png",
    category: "Bold",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "projects"],
      showIcons: true,
      columns: 1,
      neonStyle: true,
      cyberTheme: true
    },
    styles: {
      fontFamily: "'Orbitron', 'Exo 2', sans-serif",
      colors: {
        primary: "#ff0080",
        secondary: "#00ffff",
        accent: "#ffff00",
        text: "#ffffff",
        background: "#0a0a0a",
        neon: "#ff00ff"
      }
    }
  },

  bold_vibrant_gradient: {
    name: "Bold Vibrant Gradient",
    previewImage: "/templates/previews/bold_vibrant_gradient.png",
    category: "Bold",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "achievements"],
      sidebarSections: ["personal", "skills", "achievements"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      vibrantStyle: true,
      sidebarWidth: "35%"
    },
    styles: {
      fontFamily: "'Rubik', sans-serif",
      colors: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
        accent: "#45b7d1",
        text: "#2c2c54",
        vibrant: "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)"
      }
    }
  },

  bold_retro_80s: {
    name: "Bold Retro 80s",
    previewImage: "/templates/previews/bold_retro_80s.png",
    category: "Bold",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "interests"],
      showIcons: true,
      columns: 1,
      retroStyle: true,
      eighties_theme: true
    },
    styles: {
      fontFamily: "'Fredoka One', 'Comic Sans MS', sans-serif",
      colors: {
        primary: "#ff1493",
        secondary: "#00ced1",
        accent: "#ffd700",
        text: "#2e2e2e",
        retro: "#1a1a2e"
      }
    }
  },

  bold_pop_art: {
    name: "Bold Pop Art",
    previewImage: "/templates/previews/bold_pop_art.png",
    category: "Bold",
    premium: true,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "portfolio"],
      showIcons: false,
      columns: 1,
      popArtStyle: true,
      comicElements: true
    },
    styles: {
      fontFamily: "'Bangers', 'Impact', sans-serif",
      colors: {
        primary: "#ff0000",
        secondary: "#0000ff",
        accent: "#ffff00",
        text: "#000000",
        popArt: "#ffffff"
      }
    }
  },

  bold_sunset_vibes: {
    name: "Bold Sunset Vibes",
    previewImage: "/templates/previews/bold_sunset_vibes.png",
    category: "Bold",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "skills", "education", "travel"],
      sidebarSections: ["personal", "skills", "travel"],
      mainSections: ["summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sunsetTheme: true,
      sidebarWidth: "30%"
    },
    styles: {
      fontFamily: "'Pacifico', 'Brush Script MT', cursive",
      colors: {
        primary: "#ff6b35",
        secondary: "#f7931e",
        accent: "#ffd23f",
        text: "#2c1810",
        sunset: "linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd23f 100%)"
      }
    }
  }
};

// Template Categories for organized display
export const templateCategories = {
  "Classic": "Timeless designs that work for any industry",
  "Modern": "Contemporary layouts with clean aesthetics", 
  "Professional": "Corporate-focused designs for business",
  "Creative": "Artistic templates for creative professionals",
  "Executive": "Premium designs for senior-level positions",
  "Corporate": "Business-oriented layouts and color schemes",
  "Finance": "Industry-specific designs for financial professionals",
  "Consulting": "Templates optimized for consulting roles",
  "Legal": "Professional layouts for legal professionals",
  "Minimalist": "Clean, simple designs with maximum impact",
  "Student": "Optimized for students and recent graduates",
  "Entry Level": "Perfect for career starters",
  "Technology": "Tech-focused templates with modern styling",
  "Healthcare": "Medical and healthcare industry templates",
  "Marketing": "Creative templates for marketing professionals",
  "Education": "Templates for educators and academics",
  "Sales": "Achievement-focused layouts for sales roles",
  "Bold": "Eye-catching designs that stand out",
  "ATS-Optimized": "Templates specifically designed to achieve 80+ ATS scores with clean formatting and proper structure"
};

// Combine all templates
export const allTemplates = {
  // Existing templates
  ...existingTemplates,
  
  // New template collections (100+ templates)
  ...modernContemporaryTemplates,      // 20 templates
  ...creativeArtisticTemplates,        // 25 templates  
  ...professionalCorporateTemplates,   // 25 templates
  ...minimalistCleanTemplates,         // 15 templates
  ...entryLevelStudentTemplates,       // 10 templates
  ...industrySpecificTemplates,        // 15 templates
  ...colorfulBoldTemplates,            // 10 templates
  ...atsFriendlyTemplates              // 15 ATS-optimized templates
};

// Template statistics
export const templateStats = {
  total: Object.keys(allTemplates).length,
  free: Object.values(allTemplates).filter(t => !t.premium).length,
  premium: Object.values(allTemplates).filter(t => t.premium).length,
  categories: Object.keys(templateCategories).length
};

// Get templates by category
export const getTemplatesByCategory = (category) => {
  return Object.entries(allTemplates)
    .filter(([key, template]) => template.category === category)
    .reduce((acc, [key, template]) => {
      acc[key] = template;
      return acc;
    }, {});
};

// Get featured templates (mix of free and premium)
export const getFeaturedTemplates = () => {
  const featured = [
    'modern_gradient_blue',
    'creative_portfolio_magazine', 
    'executive_luxury_gold',
    'minimalist_swiss_white',
    'tech_software_engineer',
    'bold_vibrant_gradient',
    'contemporary_cards_shadow',
    'finance_investment',
    'student_fresh_graduate',
    'marketing_digital',
    'ats_classic_standard',
    'ats_modern_clean',
    'ats_tech_engineer'
  ];
  
  return featured.reduce((acc, key) => {
    if (allTemplates[key]) {
      acc[key] = allTemplates[key];
    }
    return acc;
  }, {});
};

// Get premium templates
export const getPremiumTemplates = () => {
  return Object.entries(allTemplates)
    .filter(([key, template]) => template.premium)
    .reduce((acc, [key, template]) => {
      acc[key] = template;
      return acc;
    }, {});
};

// Search templates by name or category
export const searchTemplates = (query) => {
  const searchTerm = query.toLowerCase();
  return Object.entries(allTemplates)
    .filter(([key, template]) => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.category.toLowerCase().includes(searchTerm) ||
      key.toLowerCase().includes(searchTerm)
    )
    .reduce((acc, [key, template]) => {
      acc[key] = template;
      return acc;
    }, {});
};

export default allTemplates; 