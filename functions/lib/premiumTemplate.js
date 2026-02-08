// ../lib/premiumTemplates.js
export const premiumTemplates = {
    it_fresher: {
      name: "IT Fresher",
      previewImage: "/templates/previews/it_fresher.jpg",
      category: "Job-Specific",
      premium: true,
      layout: {
        sectionsOrder: ["summary", "skills", "projects", "education", "certifications", "languages"],
        sidebarSections: ["skills", "languages"],
        mainSections: ["summary", "projects", "education", "certifications"],
        showIcons: true,
      },
      styles: {
        fontFamily: "'Roboto', sans-serif",
        fontSize: "11pt",
        lineHeight: "1.4",
        colors: {
          primary: "#004080",
          secondary: "#6688cc",
          accent: "#00b7eb",
          text: "#1a1a1a",
          background: "#ffffff",
          sidebar: "#e6f0fa",
        },
      },
    },
    bank_po: {
      name: "Bank PO",
      previewImage: "/templates/previews/bank_po.jpg",
      category: "Job-Specific",
      premium: true,
      layout: {
        sectionsOrder: ["summary", "experience", "education", "skills", "certifications", "achievements"],
        sidebarSections: [],
        mainSections: ["summary", "experience", "education", "skills", "certifications", "achievements"],
        showIcons: false,
      },
      styles: {
        fontFamily: "'Times New Roman', serif",
        fontSize: "12pt",
        lineHeight: "1.5",
        colors: {
          primary: "#1e3a8a",
          secondary: "#64748b",
          accent: "#d97706",
          text: "#1f2937",
          background: "#f8fafc",
        },
      },
    },
    government_job: {
      name: "Government Job",
      previewImage: "/templates/previews/government_job.jpg",
      category: "Job-Specific",
      premium: true,
      layout: {
        sectionsOrder: ["summary", "experience", "education", "skills", "certifications", "references"],
        sidebarSections: [],
        mainSections: ["summary", "experience", "education", "skills", "certifications", "references"],
        showIcons: false,
      },
      styles: {
        fontFamily: "'Arial', sans-serif",
        fontSize: "12pt",
        lineHeight: "1.5",
        colors: {
          primary: "#172554",
          secondary: "#475569",
          accent: "#dc2626",
          text: "#111827",
          background: "#ffffff",
        },
      },
    },
  };