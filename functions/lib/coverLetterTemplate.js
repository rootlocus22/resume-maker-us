export const coverLetterTemplates = {
  // Classic Professional Design
  classic: {
    name: "Classic",
    category: "General",
    premium: false,
    description: "A timeless, professional design perfect for any industry.",
    defaultData: {
      enabled: true,
      name: "",
      email: "",
      phone: "",
      location: "",
      recipient: "Dear Hiring Manager",
      jobTitle: "",
      company: "",
      intro:
        "I am excited to apply for the [jobTitle] position at [company]. With my background in [field], I am confident in my ability to contribute to your team and help achieve [specificCompanyGoal].",
      body: "In my previous role at [previousCompany], I successfully [achievement], leveraging [skill1] and [skill2] to drive [specificOutcome]. I am eager to bring this expertise to [company] and support your mission of [specificCompanyGoal].",
      closing:
        "Thank you for considering my application. I would welcome the opportunity to discuss how my skills and experiences align with [company]’s goals. I look forward to hearing from you.",
    },
    styles: {
      fontFamily: "'Arial', sans-serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      letterSpacing: "0.1px",
      maxWidth: "800px",
      padding: "40px",
      border: "none",
      borderRadius: "0",
      boxShadow: "none",
      divider: "1px solid #e5e7eb",
      useIcons: false,
      colors: {
        primary: "#2c3e50", // Matches resume classic
        secondary: "#7f8c8d",
        accent: "#3498db",
        text: "#34495e",
        background: "#ffffff",
      },
    },
    layout: { headerStyle: "compact" },
  },

  // Modern Minimalist Design
  sleek: {
    name: "Sleek",
    category: "General",
    premium: false,
    description: "A clean, modern design ideal for tech and creative roles.",
    defaultData: {
      enabled: true,
      name: "",
      email: "",
      phone: "",
      location: "",
      recipient: "Dear [RecipientName]",
      jobTitle: "",
      company: "",
      intro:
        "I am writing to express my interest in the [jobTitle] position at [company]. My experience in [field] has equipped me with the skills to deliver impactful results for your team.",
      body: "At [previousCompany], I led [specificProject], achieving [achievement] through the use of [skill1] and [skill2]. I am excited to bring this expertise to [company] and contribute to [specificCompanyGoal].",
      closing:
        "Thank you for your time and consideration. I’d be delighted to discuss how I can contribute to [company]’s success. Please feel free to contact me at your convenience.",
    },
    styles: {
      fontFamily: "'Roboto', sans-serif",
      fontSize: "11pt",
      lineHeight: "1.7",
      letterSpacing: "0.2px",
      maxWidth: "780px",
      padding: "35px",
      border: "none",
      borderRadius: "8px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      divider: "1px solid #e5e7eb",
      useIcons: true,
      colors: {
        primary: "#1e3a8a", // Matches modern_professional
        secondary: "#64748b",
        accent: "#3b82f6",
        text: "#1f2937",
        background: "#ffffff", // Main background
      },
    },
    layout: { headerStyle: "full-width" },
  },

  // Tech-Focused Design
  innovate: {
    name: "Innovate",
    category: "Technology",
    premium: true,
    description: "A tech-forward design tailored for developers and engineers.",
    defaultData: {
      enabled: true,
      name: "",
      email: "",
      phone: "",
      location: "",
      recipient: "Dear [RecipientName] or Technology Team",
      jobTitle: "",
      company: "",
      intro:
        "I am eager to apply for the [jobTitle] position at [company], where I can leverage my expertise in [specificTechSkill] to drive innovative solutions.",
      body: "At [previousCompany], I developed [specificProject], improving [metric] by [percentage] using [skill1] and [skill2]. I am excited to bring this experience to [company] and contribute to [specificCompanyGoal].",
      closing:
        "Thank you for reviewing my application. I’d be thrilled to discuss how my technical skills can benefit [company]. I look forward to the possibility of connecting soon.",
    },
    styles: {
      fontFamily: "'Fira Code', monospace",
      fontSize: "10pt",
      lineHeight: "1.65",
      letterSpacing: "0.3px",
      maxWidth: "820px",
      padding: "40px",
      border: "none",
      borderRadius: "10px",
      boxShadow: "0 6px 25px rgba(0, 0, 0, 0.06)",
      divider: "1px solid #dbeafe",
      useIcons: true,
      colors: {
        primary: "#2f4f4f", // Matches polished_teal
        secondary: "#5f7f7f",
        accent: "#4ecdc4",
        text: "#1f1f1f",
        background: "#ffffff",
      },
    },
    layout: { headerStyle: "full-width" },
  },

  // Creative Professional Design
  inspire: {
    name: "Inspire",
    category: "Creative",
    premium: true,
    description: "A vibrant, creative design for artists and designers.",
    defaultData: {
      enabled: true,
      name: "",
      email: "",
      phone: "",
      location: "",
      recipient: "Dear [RecipientName] or Creative Team",
      jobTitle: "",
      company: "",
      intro:
        "I am excited to apply for the [jobTitle] role at [company]. My passion for [specificCreativeSkill] drives me to create work that inspires and engages audiences.",
      body: "At [previousCompany], I designed [specificProject], resulting in [achievement] by combining [skill1] with [skill2]. I am eager to bring my creativity to [company] and contribute to [specificCompanyGoal].",
      closing:
        "Thank you for considering my application. I’d love the chance to discuss how my creative perspective can elevate [company]. I hope to hear from you soon.",
    },
    styles: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "11pt",
      lineHeight: "1.8",
      letterSpacing: "0.15px",
      maxWidth: "800px",
      padding: "45px",
      border: "none",
      borderRadius: "12px",
      boxShadow: "0 5px 22px rgba(0, 0, 0, 0.04)",
      divider: "1px dashed #b76e79", // Matches accent
      useIcons: true,
      colors: {
        primary: "#4b2e39", // Matches elegant
        secondary: "#6b4e56",
        accent: "#b76e79",
        text: "#333333",
        background: "linear-gradient(180deg, #fdfdfd 0%, #f5f5f5 100%)", // Matches elegant background
      },
    },
    layout: { headerStyle: "default" },
  },

  // Leadership-Oriented Design
  summit: {
    name: "Summit",
    category: "Leadership",
    premium: true,
    description: "A bold, authoritative design for executives and managers.",
    defaultData: {
      enabled: true,
      name: "",
      email: "",
      phone: "",
      location: "",
      recipient: "Dear [RecipientName] or Leadership Team",
      jobTitle: "",
      company: "",
      intro:
        "I am applying for the [jobTitle] position at [company], bringing [years] years of leadership experience in [field] to drive your team toward success.",
      body: "As [previousRole] at [previousCompany], I led [specificProject], achieving [achievement] through [specificLeadershipSkill]. I am ready to guide [company] toward [specificCompanyGoal] with strategic vision and measurable outcomes.",
      closing:
        "Thank you for your consideration. I am enthusiastic about the opportunity to discuss how my leadership can advance [company]’s objectives. I look forward to speaking with you.",
    },
    styles: {
      fontFamily: "'Lora', serif",
      fontSize: "11.5pt",
      lineHeight: "1.75",
      letterSpacing: "0.25px",
      maxWidth: "850px",
      padding: "50px",
      border: "none",
      borderRadius: "0",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
      divider: "2px solid #718096", // Matches secondary
      useIcons: false,
      colors: {
        primary: "#2d3748", // Matches timeline_professional
        secondary: "#718096",
        accent: "#3182ce",
        text: "#1a202c",
        background: "#ffffff",
      },
    },
    layout: { headerStyle: "full-width" },
  },
};