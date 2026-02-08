//import { jobSpecificTemplates } from "./jobSpecificTemplate"; // Corrected typo in import path
import { diverseTemplates } from "./realTemplates.js"; // Import the diverse templates
import { atsFriendlyTemplates } from "./atsFriendlyTemplates.js"; // Import ATS-friendly templates
import { visualAppealTemplates } from "./visualAppealTemplates.js"; // Import Visual Appeal templates
import { onePagerTemplates } from "./onePagerTemplates.js"; // Import One-Pager templates

// Configuration options for date formats and section settings
export const defaultConfig = {
  dateFormat: {
    monthDisplay: "short", // "short" (Jan), "long" (January), "numeric" (01)
    yearDisplay: "full", // "full" (2026), "short" (25)
    separator: " ", // space, dot, slash etc
    format: "MMM yyyy" // Default format
  },
  education: {
    showFieldOfStudy: {
      degree: true,
      highSchool: false // Don't show for 10th and 12th
    },
    showStartDate: {
      degree: true,
      highSchool: false // Don't show for 10th and 12th
    },
    showGPA: true,
    showPercentage: true,
    gradeFormat: "both" // "gpa", "percentage", or "both"
  },
  skills: {
    showProficiency: false,
    proficiencyScale: "1-5", // "1-5", "beginner-expert", "percentage"
    groupByCategory: true,
    allowReordering: true,
    displayStyle: "tags" // "list", "grid", "tag"
  },
  typography: {
    fontPair: { id: 'modern', label: 'Modern', fontFamily: "'Inter', sans-serif" },
  },
  sections: {
    reorderEnabled: true,
    collapsible: true,
    customSectionTypes: ["Projects", "Volunteering", "Awards", "Publications"]
  }
};

// ORIGINAL USER TEMPLATES - Restored exactly as they were
const originalUserTemplates = {
  executive_professional: {
    name: "Executive Professional",
    previewImage: "/templates/previews/executive_professional.png",
    category: "Professional",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "achievements", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "achievements", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebar: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      sidebarWidth: "30%",
      headerStyle: "elegant" // New header style for executive look
    },
    styles: {
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontSize: "11.5pt",
      lineHeight: "1.6",
      colors: {
        primary: "#1a365d",    // Deep navy blue
        secondary: "#4a5568",  // Professional gray
        accent: "#2b6cb0",     // Royal blue
        text: "#2d3748",       // Dark gray
        background: "#ffffff",
        headings: "#1a365d"    // Matching primary for consistency
      },
      sectionTitleStyle: "uppercase",
      sectionSpacing: "1.8rem",
      headerStyle: {
        nameFontSize: "24pt",
        titleSpacing: "0.8rem",
        underlineColor: "#2b6cb0"
      }
    },
    defaultData: {
      personal: {
        name: "",
        jobTitle: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        linkedin: "",
        portfolio: "",
        photo: ""
      },
      summary: "",
      achievements: [],
      skills: [
        {
          category: "Leadership",
          items: []
        },
        {
          category: "Technical",
          items: []
        },
        {
          category: "Business",
          items: []
        }
      ],
      experience: [],
      education: [],
      certifications: []
    }
  },

  minimalist_professional: {
    name: "Minimalist Professional",
    previewImage: "/templates/previews/minimalist_professional.png",
    category: "Professional",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications"],
      showIcons: false,
      columns: 1,
      contentWidth: "90%",
      headerStyle: "minimal",
      sectionStyle: "clean"
    },
    styles: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#111827",    // Near black
        secondary: "#6b7280",  // Medium gray
        accent: "#3b82f6",     // Blue
        text: "#374151",       // Dark gray
        background: "#ffffff",
        subtle: "#f3f4f6"      // Light gray for subtle elements
      },
      spacing: {
        sectionGap: "2rem",
        itemGap: "1.5rem",
        contentPadding: "0.75rem"
      },
      typography: {
        headerName: {
          fontSize: "24pt",
          fontWeight: "600",
          letterSpacing: "-0.02em"
        },
        sectionTitle: {
          fontSize: "14pt",
          fontWeight: "500",
          letterSpacing: "0.02em",
          transform: "none"
        },
        subsectionTitle: {
          fontSize: "12pt",
          fontWeight: "500"
        }
      },
      borders: {
        separator: "1px solid #e5e7eb",
        radius: "0px"
      }
    },
    defaultData: {
      personal: {
        name: "",
        jobTitle: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        portfolio: "",
        photo: ""
      },
      summary: "",
      experience: [],
      education: [],
      skills: [
        {
          category: "Core Competencies",
          items: []
        },
        {
          category: "Technical Skills",
          items: []
        }
      ],
      certifications: []
    }
  },
  // Classic Category (Universal Appeal)
  classic: {
    name: "Classic",
    previewImage: "/templates/previews/classic.png",
    category: "Classic",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications", "languages"],
      showIcons: false,
      columns: 1,
      headerStyle: "modern", // Explicitly set to use the centered gradient header
    },
    styles: {
      fontFamily: "'Arial', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#2c3e50",
        secondary: "#7f8c8d",
        accent: "#3498db",
        text: "#34495e",
        background: "#ffffff",
      },
    },
    defaultData: {
      personal: {
        name: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        linkedin: "",
        portfolio: "",
        photo: ""
      },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      languages: [],
    },
  },
  classic_with_icons: {
    name: "Classic with Icons",
    previewImage: "/templates/previews/classic_with_icons.png",
    category: "Classic",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications", "languages"],
      showIcons: true,
      columns: 1,
      headerStyle: "modern", //
    },
    styles: {
      fontFamily: "'Arial', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#2c3e50",
        secondary: "#7f8c8d",
        accent: "#3498db",
        text: "#34495e",
        background: "#ffffff",
      },
    },
    defaultData: {
      personal: {
        name: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        linkedin: "",
        portfolio: "",
        photo: ""
      },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      languages: [],
    },
  },

  modern_professional: {
    name: "Modern Professional",
    previewImage: "/templates/previews/modern_professional.png",
    category: "Professional",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      sidebar: "linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 20%)",
      sidebarWidth: "30%",
      headerStyle: "modern",
      spacing: {
        sectionGap: "1.75rem",
        contentPadding: "1.25rem"
      }
    },
    styles: {
      fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1e3a8a",
        secondary: "#64748b",
        accent: "#3b82f6",
        text: "#1f2937",
        background: "#ffffff",
        headings: "#1e3a8a"
      },
      typography: {
        headerName: {
          fontSize: "22pt",
          fontWeight: "600",
          letterSpacing: "-0.01em"
        },
        headerTitle: {
          fontSize: "13pt",
          fontWeight: "400",
          letterSpacing: "0.02em",
          color: "secondary"
        },
        sectionTitle: {
          fontSize: "13pt",
          fontWeight: "500",
          letterSpacing: "0.01em",
          marginBottom: "1rem"
        }
      },
      iconStyle: {
        size: "1.2rem",
        color: "accent",
        marginRight: "0.5rem"
      },
    },
    defaultData: {
      personal: { name: "", email: "", phone: "", address: "", dateOfBirth: "", gender: "", maritalStatus: "", linkedin: "", portfolio: "", photo: "" },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    },
  },
  timeline_professional: {
    name: "Timeline Professional",
    previewImage: "/templates/previews/timeline_professional.png",
    category: "Professional",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications", "languages", "customSections"],
      sidebarSections: ["skills", "certifications"],
      mainSections: ["personal", "summary", "experience", "education"],
      showIcons: true,
      columns: 2,
      timelineStyle: true,
      sidebar: "#f7fafc",
      sidebarWidth: "35%",
      headerStyle: "full-width", // Changed from "compact" to match modern_professional
    },
    styles: {
      fontFamily: "'Roboto', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.5",
      colors: {
        primary: "#2d3748",
        secondary: "#718096",
        accent: "#3182ce",
        text: "#1a202c",
        background: "#ffffff",
      },
    },
    defaultData: {
      personal: { name: "", email: "", phone: "", address: "", dateOfBirth: "", gender: "", maritalStatus: "", linkedin: "", portfolio: "", photo: "" },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    },
  },



  // ATS Category (Optimized for Applicant Tracking Systems)
  ats_optimized: {
    name: "ATS Optimized",
    previewImage: "/templates/previews/ats_optimized.png",
    category: "Professional",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "skills", "experience", "education", "certifications"],
      showIcons: false,
      columns: 1,
      maxWidth: "850px",
      contentMargin: "auto",
      headerStyle: "standard",
      sectionStyle: "clear",
      skillsLayout: "multi-column", // Special skills layout for ATS templates
      maxSkillsPerColumn: 5 // Maximum skills per column
    },
    styles: {
      fontFamily: "'Arial', 'Helvetica', sans-serif", // Standard fonts for maximum compatibility
      fontSize: "11.5pt",
      lineHeight: "1.4",
      colors: {
        primary: "#000000",    // Pure black for maximum contrast
        secondary: "#444444",  // Dark gray
        accent: "#2563eb",     // Standard blue
        text: "#1f2937",       // Dark gray for body text
        background: "#ffffff",
        sectionTitles: "#000000"
      },
      spacing: {
        sectionGap: "1.5rem",
        paragraphSpacing: "0.75rem",
        listSpacing: "0.5rem"
      },
      typography: {
        headers: {
          fontWeight: "bold",
          transform: "none",    // No text transformation for better ATS parsing
          marginBottom: "1rem"
        },
        body: {
          fontWeight: "normal",
          letterSpacing: "normal"
        }
      },
      lists: {
        bulletStyle: "standard", // Simple bullet points for compatibility
        indentation: "1.5rem"
      }
    },
    defaultData: {
      personal: {
        name: "",
        jobTitle: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        linkedin: "",
        portfolio: "",
        photo: ""
      },
      summary: "",
      skills: {
        technical: [],
        soft: [],
        tools: []
      },
      experience: [],
      education: [],
      certifications: []
    }
  },

  /*
    creative_professional: {
      name: "Creative Professional",
      previewImage: "/templates/previews/creative_professional.png",
      category: "Professional",
      premium: false,
      layout: {
        sectionsOrder: ["personal", "summary", "experience", "skills", "projects", "education", "certifications", "languages", "customSections"],
        sidebarSections: ["skills", "certifications"],
        mainSections: ["personal", "summary", "experience", "projects", "education"],
        showIcons: true,
        columns: 2,
        sidebar: "left",
        sidebarWidth: "35%",
        sidebarStyle: "accent-background",
        headerStyle: "creative"
      },
      styles: {
        fontFamily: "'Poppins', 'SF Pro Display', system-ui, sans-serif",
        fontSize: "11pt",
        lineHeight: "1.6",
        colors: {
          primary: "#312e81",      // Deep indigo
          secondary: "#6366f1",    // Bright indigo
          accent: "#818cf8",       // Light indigo
          text: "#1f2937",         // Dark gray
          background: "#ffffff",
          sidebarBg: "#eef2ff",   // Light indigo background
          gradient: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)"
        },
        spacing: {
          sectionGap: "2rem",
          elementGap: "1.25rem",
          contentPadding: "1.5rem"
        },
        typography: {
          name: {
            fontSize: "26pt",
            fontWeight: "600",
            backgroundClip: "text",
            gradient: true
          },
          sectionTitles: {
            fontSize: "14pt",
            fontWeight: "500",
            letterSpacing: "0.03em",
            transform: "none"
          }
        },
        effects: {
          shadowDepth: "sm",
          transitions: "all 0.3s ease",
          hover: {
            scale: "1.02",
            shadow: "md"
          }
        }
      },
      defaultData: {
        personal: {
          name: "",
          jobTitle: "",
          email: "",
          phone: "",
          address: "",
          dateOfBirth: "",
          gender: "",
          maritalStatus: "",
          portfolio: "",
          linkedin: "",
          github: ""
        },
        summary: "",
        experience: [],
        skills: [
          {
            category: "Design",
            items: []
          },
          {
            category: "Technical",
            items: []
          },
          {
            category: "Software",
            items: []
          }
        ],
        projects: [],
        education: [],
        certifications: []
      }
    }, */

  // Freshers Single Column - Clean and Professional Design
  freshers: {
    name: "Freshers Single",
    previewImage: "/templates/previews/freshers_single.png",
    category: "Freshers",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "education", "projects", "skills", "achievements", "languages", "customSections"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "education", "projects", "skills", "achievements", "languages"],
      showIcons: false,
      columns: 1,
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      colors: {
        primary: "#1f2937", // Professional dark blue-gray
        secondary: "#6b7280",
        accent: "#3b82f6", // Blue accent
        text: "#111827",
        background: "#ffffff",
        headerBg: "#f8fafc",
        borderColor: "#e5e7eb",
      },
    },
    defaultData: {
      personal: {
        name: "Your Name",
        jobTitle: "Recent Graduate",
        email: "your.email@example.com",
        phone: "+91 98765 43210",
        address: "City, State",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        linkedin: "https://linkedin.com/in/yourprofile",
        github: "https://github.com/yourusername"
      },
      summary: "Recent graduate with strong academic foundation and hands-on project experience. Seeking opportunities to apply technical skills and contribute to innovative projects in a collaborative environment.",
      education: [
        {
          institution: "University Name",
          degree: "Bachelor of Technology in Computer Science",
          fieldOfStudy: "Computer Science & Engineering",
          startDate: "2021-08",
          endDate: "2025-05",
          gpa: "8.5",
          percentage: "85%"
        }
      ],
      projects: [
        {
          title: "E-Commerce Platform",
          description: "Developed a full-stack e-commerce website with user authentication, product catalog, shopping cart, and payment integration using modern web technologies.",
          technologies: ["React.js", "Node.js", "MongoDB", "Express.js", "Stripe API"],
          startDate: "2024-01",
          endDate: "2024-04",
          url: "https://github.com/yourusername/ecommerce-project"
        },
        {
          title: "Task Management App",
          description: "Built a collaborative task management application with real-time updates, user roles, and progress tracking features.",
          technologies: ["React Native", "Firebase", "Redux", "TypeScript"],
          startDate: "2023-09",
          endDate: "2023-12"
        }
      ],
      skills: [
        {
          category: "Programming Languages",
          items: ["JavaScript (ES6+)", "Python", "Java", "C++"]
        },
        {
          category: "Web Technologies",
          items: ["React.js", "Node.js", "HTML5", "CSS3", "Express.js"]
        },
        {
          category: "Databases",
          items: ["MongoDB", "MySQL", "PostgreSQL"]
        },
        {
          category: "Tools & Platforms",
          items: ["Git", "Docker", "AWS", "VS Code", "Postman"]
        },
        {
          category: "Soft Skills",
          items: ["Problem Solving", "Communication", "Teamwork", "Time Management"]
        }
      ],
      achievements: [
        "Dean's List for 3 consecutive semesters (2022-2025)",
        "1st place in University Coding Competition 2024",
        "Final year project selected for Department Showcase",
        "Member of University Programming Club",
        "Completed 50+ LeetCode problems"
      ],
      languages: [
        {
          language: "English",
          proficiency: "Fluent"
        },
        {
          language: "Hindi",
          proficiency: "Native"
        }
      ]
    },
  },

  // Freshers Double Column - Modern Two-Column Layout
  freshers_simple: {
    name: "Freshers Double",
    previewImage: "/templates/previews/freshers_double.png",
    category: "Freshers",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "education", "projects", "skills", "achievements", "languages", "customSections"],
      sidebarSections: ["personal", "skills", "languages", "achievements"],
      mainSections: ["summary", "education", "projects"],
      showIcons: false,
      columns: 2,
    },
    styles: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#1e40af", // Modern blue
        secondary: "#64748b",
        accent: "#3b82f6",
        text: "#1e293b",
        background: "#ffffff",
        headerBg: "#f1f5f9",
        borderColor: "#cbd5e1",
      },
    },
    defaultData: {
      personal: {
        name: "Your Name",
        jobTitle: "Software Engineer",
        email: "your.email@example.com",
        phone: "+91 98765 43210",
        address: "Bangalore, Karnataka",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        linkedin: "https://linkedin.com/in/yourprofile",
        github: "https://github.com/yourusername",
        portfolio: "https://yourportfolio.com"
      },
      summary: "Passionate software engineer with strong foundation in computer science and hands-on experience in full-stack development. Proven ability to learn quickly and work effectively in collaborative environments. Seeking opportunities to contribute to innovative projects and grow professionally.",
      education: [
        {
          institution: "US Institute of Technology",
          degree: "B.Tech in Computer Science",
          fieldOfStudy: "Computer Science & Engineering",
          startDate: "2021-08",
          endDate: "2025-05",
          gpa: "8.7",
          percentage: "87%"
        }
      ],

      projects: [
        {
          title: "AI-Powered Resume Parser",
          description: "Built an intelligent resume parsing system using Python and machine learning. Implemented NLP algorithms to extract key information and classify skills automatically.",
          technologies: ["Python", "NLTK", "Scikit-learn", "Flask", "React"],
          startDate: "2024-01",
          endDate: "2024-05",
          url: "https://github.com/yourusername/resume-parser"
        },
        {
          title: "Real-time Chat Application",
          description: "Developed a real-time chat application with features like user authentication, message encryption, and file sharing. Implemented using WebSocket for instant messaging.",
          technologies: ["Node.js", "Socket.io", "MongoDB", "React", "JWT"],
          startDate: "2023-09",
          endDate: "2023-12"
        }
      ],
      skills: [
        {
          category: "Programming",
          items: ["JavaScript", "Python", "Java", "C++", "TypeScript"]
        },
        {
          category: "Frontend",
          items: ["React", "Vue.js", "HTML5", "CSS3", "Tailwind CSS"]
        },
        {
          category: "Backend",
          items: ["Node.js", "Express.js", "Django", "Spring Boot"]
        },
        {
          category: "Database",
          items: ["MongoDB", "PostgreSQL", "Redis", "MySQL"]
        },
        {
          category: "DevOps",
          items: ["Docker", "AWS", "Git", "CI/CD", "Kubernetes"]
        },
        {
          category: "Tools",
          items: ["VS Code", "Postman", "Figma", "Jira", "Docker Desktop"]
        }
      ],
      achievements: [
        "Google Developer Student Clubs Lead (2024-2025)",
        "Microsoft Student Partner (2023-2024)",
        "Hackathon Winner - Smart India Hackathon 2024",
        "Dean's List - All 8 semesters",
        "Published research paper in IEEE conference",
        "Mentored 20+ junior students in programming"
      ],
      languages: [
        {
          language: "English",
          proficiency: "Professional"
        },
        {
          language: "Hindi",
          proficiency: "Native"
        },
        {
          language: "Kannada",
          proficiency: "Conversational"
        }
      ]
    },
  },
};



// Combine all templates: Original User Templates FIRST, then Diverse Templates, then Job-Specific LAST
function injectCustomSections(templateObj) {
  const addCustomAndLanguages = (arr, isMainSection = false, templateKey = null, template = null) => {
    if (!arr) return isMainSection ? ["languages", "customSections"] : [];
    let out = [...arr];

    // Only add languages and customSections to mainSections, not sidebarSections
    // Exception: Don't add languages to mainSections for ATS executive template (it should only be in sidebar)
    if (isMainSection) {
      if (!out.includes("customSections")) out.push("customSections");

      // Check if languages are already in sidebar sections - if so, don't add to main sections
      const hasLanguagesInSidebar = template?.layout?.sidebarSections?.includes("languages");

      // Only add languages if:
      // 1. It's not the ATS executive template
      // 2. Languages are not already in sidebar sections
      if (!out.includes("languages") &&
        templateKey !== "ats_two_column_executive" &&
        !hasLanguagesInSidebar) {
        out.push("languages");
      }
    }

    return out;
  };

  const out = {};
  for (const [key, template] of Object.entries(templateObj)) {
    if (!template.layout) {
      out[key] = template;
      continue;
    }
    out[key] = {
      ...template,
      layout: {
        ...template.layout,
        sectionsOrder: addCustomAndLanguages(template.layout.sectionsOrder, true, key, template),
        sidebarSections: template.layout.sidebarSections ? addCustomAndLanguages(template.layout.sidebarSections, false, key, template) : undefined,
        mainSections: template.layout.mainSections ? addCustomAndLanguages(template.layout.mainSections, true, key, template) : undefined,
      }
    };
  }
  return out;
}

export const templates = {
  // USER'S ORIGINAL TEMPLATES COME FIRST
  ...injectCustomSections(diverseTemplates),
  ...injectCustomSections(originalUserTemplates),             // All the new diverse layout templates
  ...injectCustomSections(atsFriendlyTemplates),        // ATS-friendly templates for high scores
  ...injectCustomSections(visualAppealTemplates),       // Visual Appeal templates with photos
  ...onePagerTemplates,                                 // One-Pager templates (don't need custom sections injection)
  /*  ...injectCustomSections(jobSpecificTemplates),   */       // Job-specific templates COME LAST
};

// Export functions to get templates by category and type
export const getTemplatesByCategory = (category) => {
  return Object.entries(templates).filter(([key, template]) => template.category === category);
};

export const getFreeTemplates = () => {
  return Object.entries(templates).filter(([key, template]) => !template.premium);
};

export const getAllTemplateCategories = () => {
  const categories = new Set();
  Object.values(templates).forEach(template => {
    if (template.category) {
      categories.add(template.category);
    }
  });
  return Array.from(categories).sort();
};

export const getTemplateStats = () => {
  const allTemplates = Object.values(templates);
  const categories = getAllTemplateCategories();

  return {
    total: allTemplates.length,
    free: allTemplates.filter(t => !t.premium).length,
    premium: allTemplates.filter(t => t.premium).length,
    categories: categories.length,
    byCategory: categories.reduce((acc, category) => {
      acc[category] = allTemplates.filter(t => t.category === category).length;
      return acc;
    }, {})
  };
};

// Combine original templates into a single lookup object for switching (backward compatibility)
export const originalTemplates = {
  ...templates, // Include all templates
};

// Note: For the comprehensive template collection with 120+ templates,
// import directly from './allTemplates.js' instead of this file