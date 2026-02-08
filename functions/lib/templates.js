// functions/lib/templates.js
const { jobSpecificTemplates } = require("./jobSpecificTemplate");

const templates = {
  // Classic Category (Universal Appeal)
  classic: {
    name: "Classic",
    previewImage: "/templates/previews/classic_noicons.jpg",
    category: "Classic",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications", "languages"],
      showIcons: false,
      columns: 1,
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
        location: "",
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
    previewImage: "/templates/previews/classic_with_icons.jpg",
    category: "Classic",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications", "languages"],
      sidebarSections: [],
      mainSections: ["personal", "summary", "experience", "education", "skills", "certifications", "languages"],
      showIcons: true,
      columns: 1,
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
        location: "",
      },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      languages: [],
    },
  },

  // Professional Category
  modern_professional: {
    name: "Modern Professional",
    previewImage: "/templates/previews/modern_professional_with_icons.jpg",
    category: "Professional",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: ["skills"],
      mainSections: ["personal", "summary", "experience", "education", "certifications"],
      showIcons: true,
      columns: 2,
      sidebar: "linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 20%)",
      sidebarWidth: "30%",
      columnSplitAfter: 2,
    },
    styles: {
      fontFamily: "'Roboto', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.4",
      colors: {
        primary: "#1e3a8a",
        secondary: "#64748b",
        accent: "#3b82f6",
        text: "#1f2937",
        background: "#ffffff",
      },
    },
    defaultData: {
      personal: {
        name: "",
        email: "",
        phone: "",
        location: "",
      },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    },
  },
  timeline_professional: {
    name: "Timeline Professional",
    previewImage: "/templates/previews/modern-professional_no_icons.jpg",
    category: "Professional",
    premium: false,
    layout: {
      sectionsOrder: ["personal", "summary", "skills", "experience", "education", "certifications"],
      sidebarSections: ["skills"],
      mainSections: ["personal", "summary", "experience", "education", "certifications"],
      showIcons: true,
      columns: 2,
      timelineStyle: true,
      sidebar: "#f7fafc",
      sidebarWidth: "35%",
      columnSplitAfter: 2,
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
      personal: {
        name: "",
        email: "",
        phone: "",
        location: "",
      },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    },
  },
};

// Combine all templates into a single lookup object
const allTemplates = {
  ...templates, // Classic and professional templates
  ...jobSpecificTemplates, // Job-specific templates from jobSpecificTemplate.js
};

module.exports = { templates, allTemplates };