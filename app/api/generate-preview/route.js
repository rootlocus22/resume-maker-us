// Use Node.js runtime for headless Chrome
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import { templates } from "../../lib/templates.js";
import { jobSpecificTemplates } from "../../lib/jobSpecificTemplate";
import { defaultConfig } from "../../lib/templates.js";
import { formatDateWithPreferences, tryParseDate, cleanText } from "../../lib/resumeUtils";

// Increase max duration to allow for complex image generation
export const maxDuration = 30;

// Rich sample data for preview generation - using the exact same structure as PDF API expects
const sampleData = {
  personal: {
    name: "Alexandra Chen",
    email: "alexandra.chen@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    address: "San Francisco, CA", // Both location and address for compatibility
    linkedin: "linkedin.com/in/alexandrachen", 
    portfolio: "alexandrachen.dev",
    photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNmM2Y0ZjYiLz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMCwgMjUpIj4KICAgIDxlbGxpcHNlIGN4PSIzMCIgY3k9IjI1IiByeD0iMTgiIHJ5PSIyMiIgZmlsbD0iIzRiNTU2MyIvPgogICAgPHJlY3QgeD0iMjYiIHk9IjQ1IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjNGI1NTYzIi8+CiAgICA8cGF0aCBkPSJNMTUgNTMgTDE4IDU4IEwyMCA2NSBMNDAgNjUgTDQyIDU4IEw0NSA1MyBMNTAgNzAgTDEwIDcwIFoiIGZpbGw9IiMxZjI5MzciLz4KICAgIDxwYXRoIGQ9Ik0yMCA1MyBMMjQgNTggTDMwIDU1IEwzNiA1OCBMNDAgNTMgTDQyIDU4IEwzOCA2MiBMMzAgNjAgTDIyIDYyIEwxOCA1OCBaIiBmaWxsPSIjMzc0MTUxIi8+CiAgICA8cmVjdCB4PSIyOCIgeT0iNTUiIHdpZHRoPSI0IiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmZmZmIi8+CiAgICA8cG9seWdvbiBwb2ludHM9IjI5LDU4IDMxLDU4IDMyLDY4IDI4LDY4IiBmaWxsPSIjM2I4MmY2Ii8+CiAgPC9nPgogIDxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjU4IiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWU3ZWIiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4="
  },
  name: "Alexandra Chen", // Top-level for compatibility
  email: "alexandra.chen@email.com",
  phone: "+1 (555) 123-4567", 
  address: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexandrachen",
  portfolio: "alexandrachen.dev",
  photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNmM2Y0ZjYiLz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMCwgMjUpIj4KICAgIDxlbGxpcHNlIGN4PSIzMCIgY3k9IjI1IiByeD0iMTgiIHJ5PSIyMiIgZmlsbD0iIzRiNTU2MyIvPgogICAgPHJlY3QgeD0iMjYiIHk9IjQ1IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjNGI1NTYzIi8+CiAgICA8cGF0aCBkPSJNMTUgNTMgTDE4IDU4IEwyMCA2NSBMNDAgNjUgTDQyIDU4IEw0NSA1MyBMNTAgNzAgTDEwIDcwIFoiIGZpbGw9IiMxZjI5MzciLz4KICAgIDxwYXRoIGQ9Ik0yMCA1MyBMMjQgNTggTDMwIDU1IEwzNiA1OCBMNDAgNTMgTDQyIDU4IEwzOCA2MiBMMzAgNjAgTDIyIDYyIEwxOCA1OCBaIiBmaWxsPSIjMzc0MTUxIi8+CiAgICA8cmVjdCB4PSIyOCIgeT0iNTUiIHdpZHRoPSI0IiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmZmZmIi8+CiAgICA8cG9seWdvbiBwb2ludHM9IjI5LDU4IDMxLDU4IDMyLDY4IDI4LDY4IiBmaWxsPSIjM2I4MmY2Ii8+CiAgPC9nPgogIDxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjU4IiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWU3ZWIiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=",
  jobTitle: "Senior Product Manager & Full-Stack Developer",
  title: "Senior Product Manager & Full-Stack Developer", // Both for compatibility
  summary: "Innovative Product Manager and Full-Stack Developer with 8+ years of experience leading cross-functional teams to deliver scalable digital products. Proven track record of increasing user engagement by 65% and revenue by $4.2M through data-driven product strategies, technical excellence, and user-centric design. Expert in agile methodologies, system architecture, and stakeholder management.",
  
  experience: [
    {
      jobTitle: "Senior Product Manager",
      company: "TechFlow Solutions",
      location: "San Francisco, CA",
      startDate: "2022-01-01",
      endDate: "Present",
      description: "• Lead product strategy for SaaS platform serving 100K+ users across 15 countries, resulting in 45% increase in user retention\n• Spearhead development of AI-powered analytics dashboard, improving decision-making speed by 60% for enterprise clients\n• Collaborate with engineering, design, and data science teams to ship 18 major features, improving user satisfaction scores by 35%"
    },
    {
      jobTitle: "Full-Stack Developer & Product Owner",
      company: "Innovate Digital Labs",
      location: "San Francisco, CA",
      startDate: "2019-06-01",
      endDate: "2021-12-01",
      description: "• Architected and developed cloud-native microservices using React, Node.js, and AWS, supporting 50K concurrent users\n• Led technical implementation of mobile-first responsive web application achieving 150K+ downloads in first 8 months\n• Implemented CI/CD pipelines and DevOps practices, reducing deployment time by 70% and increasing code quality"
    },
    {
      jobTitle: "Software Engineer",
      company: "StartupX Technologies",
      location: "Palo Alto, CA",
      startDate: "2017-08-01",
      endDate: "2019-05-01",
      description: "• Developed and maintained RESTful APIs serving 25M+ requests per day with 99.9% uptime using Python, Django, and Redis\n• Built responsive React components and integrated with backend services, improving user experience metrics by 40%\n• Implemented real-time data processing pipeline using Apache Kafka and Elasticsearch for analytics platform"
    }
  ],
  
  education: [
    {
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      startDate: "2014-09-01",
      endDate: "2016-06-01",
      gpa: "3.9",
      percentage: "95%"
    },
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Electrical Engineering & Computer Science",
      startDate: "2010-08-01",
      endDate: "2014-05-01",
      gpa: "3.7",
      percentage: "88%"
    }
  ],
  
  skills: [
    { name: "Product Strategy", proficiency: "Expert" },
    { name: "JavaScript/TypeScript", proficiency: "Expert" },
    { name: "React/Vue.js", proficiency: "Expert" },
    { name: "Node.js", proficiency: "Advanced" },
    { name: "Python", proficiency: "Advanced" },
    { name: "AWS/Azure", proficiency: "Advanced" },
    { name: "Docker/Kubernetes", proficiency: "Advanced" },
    { name: "SQL/NoSQL", proficiency: "Advanced" },
    { name: "Data Analysis", proficiency: "Advanced" },
    { name: "Agile/Scrum", proficiency: "Expert" },
    { name: "User Research", proficiency: "Advanced" },
    { name: "Machine Learning", proficiency: "Intermediate" }
  ],
  
  certifications: [
    {
      name: "Certified Scrum Product Owner (CSPO)",
      issuer: "Scrum Alliance",
      date: "2023-03-01"
    },
    {
      name: "AWS Solutions Architect Professional",
      issuer: "Amazon Web Services",
      date: "2022-11-01"
    },
    {
      name: "Google Analytics Individual Qualification",
      issuer: "Google",
      date: "2022-08-01"
    },
    {
      name: "Product Management Certificate",
      issuer: "UC Berkeley Extension",
      date: "2021-12-01"
    }
  ],
  
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Mandarin Chinese", proficiency: "Fluent" },
    { language: "Spanish", proficiency: "Conversational" },
    { language: "French", proficiency: "Basic" }
  ],
  
  customSections: [
    {
      type: "project",
      title: "AI-Powered E-commerce Recommendation Engine",
      description: "Led development of machine learning-based product recommendation system increasing conversion rates by 42% and average order value by $28. Implemented using Python, TensorFlow, and deployed on AWS infrastructure serving 2M+ daily requests.",
      technologies: "Python, TensorFlow, AWS SageMaker, React, PostgreSQL",
      date: "2023-01-01"
    },
    {
      type: "project",
      title: "Real-time Analytics Dashboard",
      description: "Architected and built comprehensive analytics platform providing real-time insights to 500+ business users. Features include custom KPI tracking, automated reporting, and predictive analytics capabilities.",
      technologies: "React, D3.js, Node.js, Apache Kafka, ClickHouse",
      date: "2022-06-01"
    },
    {
      type: "award",
      title: "Product Innovation Award 2023",
      description: "Recognized for leading breakthrough product feature that generated $1.2M additional annual revenue and improved customer satisfaction by 28%",
      date: "2023-11-01"
    },
    {
      type: "volunteer",
      title: "Mentor - Girls Who Code",
      description: "Volunteer mentor for aspiring female software engineers, providing technical guidance and career coaching to 15+ mentees over 3 years. Organized workshops on web development and product management.",
      date: "2020-01-01"
    }
  ]
};

// Job-specific sample data for preview generation
const jobSpecificSampleData = {
  personal: {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "(415) 555-0192",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexjohnson",
    github: "github.com/alexjohnson",
    photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNmM2Y0ZjYiLz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMCwgMjUpIj4KICAgIDxlbGxpcHNlIGN4PSIzMCIgY3k9IjI1IiByeD0iMTgiIHJ5PSIyMiIgZmlsbD0iIzRiNTU2MyIvPgogICAgPHJlY3QgeD0iMjYiIHk9IjQ1IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjNGI1NTYzIi8+CiAgICA8cGF0aCBkPSJNMTUgNTMgTDE4IDU4IEwyMCA2NSBMNDAgNjUgTDQyIDU4IEw0NSA1MyBMNTAgNzAgTDEwIDcwIFoiIGZpbGw9IiMxZjI5MzciLz4KICAgIDxwYXRoIGQ9Ik0yMCA1MyBMMjQgNTggTDMwIDU1IEwzNiA1OCBMNDAgNTMgTDQyIDU4IEwzOCA2MiBMMzAgNjAgTDIyIDYyIEwxOCA1OCBaIiBmaWxsPSIjMzc0MTUxIi8+CiAgICA8cmVjdCB4PSIyOCIgeT0iNTUiIHdpZHRoPSI0IiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmZmZmIi8+CiAgICA8cG9seWdvbiBwb2ludHM9IjI5LDU4IDMxLDU4IDMyLDY4IDI4LDY4IiBmaWxsPSIjM2I4MmY2Ii8+CiAgPC9nPgogIDxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjU4IiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWU3ZWIiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4="
  },
  summary: "Passionate software developer with 3+ years of experience in full-stack development, seeking opportunities to contribute to innovative technology solutions and grow expertise in modern development frameworks.",
  skills: [
    "JavaScript", "Python", "React", "Node.js", "SQL", "Git", "AWS", "Docker", 
    "MongoDB", "Express.js", "HTML/CSS", "RESTful APIs", "Agile Development", "Problem Solving"
  ],
  experience: [
    {
      title: "Software Developer",
      company: "TechStart Solutions",
      startDate: "Jan 2022",
      endDate: "Present",
      description: "Developed and maintained web applications using React and Node.js, collaborated with cross-functional teams, implemented automated testing reducing bugs by 30%."
    },
    {
      title: "Junior Developer",
      company: "Digital Innovations",
      startDate: "Jun 2021",
      endDate: "Dec 2021",
      description: "Built responsive web interfaces, worked with RESTful APIs, participated in code reviews and agile development processes."
    }
  ],
  education: [
    {
      degree: "B.S. in Computer Science",
      institution: "UC Berkeley",
      startDate: "2017",
      endDate: "2021",
      grade: "CGPA: 8.5/10"
    }
  ],
  projects: [
    {
      title: "E-commerce Web Application",
      description: "Built a full-stack e-commerce platform using MERN stack, implemented payment gateway integration and user authentication.",
      technologies: "React, Node.js, MongoDB, Express",
      startDate: "Mar 2021",
      endDate: "May 2021"
    }
  ],
  certifications: [
    { title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "Jan 2023" },
    { title: "React Developer Certification", issuer: "Meta", date: "Sep 2022" }
  ],
  languages: ["English (Fluent)", "Hindi (Native)", "Kannada (Intermediate)"],
  achievements: ["Winner, College Hackathon 2020", "Top 5% in Competitive Programming Contest"]
};

// Template cache for better performance  
const templateCache = new Map();

function getCachedTemplate(templateName, type = "resume") {
  const key = `${type}_${templateName}`;
  if (!templateCache.has(key)) {
    const template = templates[templateName];
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }
    templateCache.set(key, template);
  }
  return templateCache.get(key);
}

// Pre-rendered SVG icons
const iconMap = {
  Bookmark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
  Briefcase: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
  GraduationCap: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
  Award: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
  Wrench: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 21.5l6-6"></path><path d="M18.5 5.5a6 6 0 0 0-8.5 8.5l-5 5a2 2 0 0 0 2.83 2.83l5-5a6 6 0 0 0 8.5-8.5z"></path></svg>`,
  Languages: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10z"></path><path d="M2 12h20"></path><path d="M12 2v20"></path></svg>`,
  User: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  Project: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9h18M9 21V9"></path></svg>`,
  Volunteer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 12 10z"></path></svg>`,
  Publication: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  Reference: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  Hobby: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%ACCENT%" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>`,
};

const sectionIconMap = {
  summary: "Bookmark",
  experience: "Briefcase",
  education: "GraduationCap",
  skills: "Wrench",
  certifications: "Award",
  languages: "Languages",
  personal: "User",
  project: "Project",
  volunteer: "Volunteer",
  publication: "Publication",
  reference: "Reference",
  award: "Award",
  hobby: "Hobby",
};

const translations = {
  en: { summary: "Profile", experience: "Employment History", education: "Education", skills: "Skills", certifications: "Certifications", languages: "Languages", project: "Projects", volunteer: "Volunteer Work", publication: "Publications", reference: "References", award: "Awards", hobby: "Interests" },
  es: { summary: "Perfil", experience: "Historial de Empleo", education: "Educación", skills: "Habilidades", certifications: "Certificaciones", languages: "Idiomas", project: "Proyectos", volunteer: "Trabajo Voluntario", publication: "Publicaciones", reference: "Referencias", award: "Premios", hobby: "Intereses" },
  fr: { summary: "Profil", experience: "Historique d'Emploi", education: "Éducation", skills: "Compétences", certifications: "Certifications", languages: "Langues", project: "Projets", volunteer: "Travail Bénévole", publication: "Publications", reference: "Références", award: "Prix", hobby: "Centres d'Intérêt" },
};

// Extract achievements from customSections if they exist there
function extractAchievementsFromCustomSections(customSections) {
  if (!customSections || !Array.isArray(customSections)) return [];
  const achievementSections = customSections.filter(section => 
    section && typeof section === 'object' && section.type === 'achievements'
  );
  
  const achievements = [];
  achievementSections.forEach(section => {
    if (section.description) {
      // If description is a string with newlines, split it
      if (typeof section.description === 'string') {
        const lines = section.description.split('\n').map(l => l.trim()).filter(Boolean);
        achievements.push(...lines);
      } else if (Array.isArray(section.description)) {
        achievements.push(...section.description.map(d => String(d).trim()).filter(Boolean));
      }
    }
  });
  return achievements;
}

function generateResumeHTML(data, template = "classic", customColors = {}, language = "en", country = "us", isPremium = false, preferences = defaultConfig) {
  // Extract achievements from customSections and combine with data.achievements
  const achievementsFromCustomSections = extractAchievementsFromCustomSections(data.customSections);
  const allAchievements = [
    ...(Array.isArray(data.achievements) ? data.achievements : []),
    ...achievementsFromCustomSections
  ].filter(Boolean);
  
  // Update data to include combined achievements and filter achievements from customSections
  data = {
    ...data,
    achievements: allAchievements.length > 0 ? allAchievements : data.achievements,
    customSections: (data.customSections || []).filter(section => 
      !(section && typeof section === 'object' && section.type === 'achievements')
    )
  };

  const templateConfig = getCachedTemplate(template, "resume");
  const { layout, styles } = templateConfig;

  // Typography override from preferences - but respect ATS template fonts
  const isATSTemplate = template && template.startsWith('ats_');
  if (!isATSTemplate) {
    // Only override font family for non-ATS templates
    styles.fontFamily = preferences?.typography?.fontPair?.fontFamily || styles.fontFamily;
  }
  // For ATS templates, keep the original template font family for maximum compatibility

  // Support both top-level customColors or customColors keyed by template
  const custom = customColors?.[template] || customColors || {};

  const mergedColors = {
    ...((styles && styles.colors) || {}),
    ...custom,
    primary: custom.primary || styles.colors?.primary || "#4B5EAA",
    secondary: custom.secondary || styles.colors?.secondary || "#6B7280",
    text: custom.text || styles.colors?.text || "#1F2937",
    accent: custom.accent || styles.colors?.accent || "#9333EA",
    background: custom.background || styles.colors?.background || "#FFFFFF",
  };

  // Pre-render icons with accent color
  const renderedIcons = Object.fromEntries(
    Object.entries(iconMap).map(([key, svg]) => [key, svg.replace("%ACCENT%", mergedColors.accent)])
  );

  const t = translations[language] || translations.en;

  const formatDate = (date) => formatDateWithPreferences(date, preferences);

  // Helper function to render bullet points properly
  const renderBulletPoints = (text) => {
    if (!text) return '';
    
    // Split by bullet points and filter out empty lines
    const lines = text.split('•').filter(line => line.trim());
    
    if (lines.length === 0) return cleanText(text);
    
    // If there are bullet points, render them as a proper list
    if (lines.length > 1) {
      return lines.map(line => 
        `<div style="display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:0.25rem;">
          <span style="color:${mergedColors.accent};font-size:0.75rem;flex-shrink:0;margin-top:0.125rem;">•</span>
          <span style="flex:1;color:${mergedColors.text};font-family:${styles.fontFamily};line-height:1.4;">${cleanText(line.trim())}</span>
        </div>`
      ).join('');
    }
    
    // If no bullet points, return as regular text
    return cleanText(text);
  };

  const renderSectionContent = (section) => {
    if ((Array.isArray(data[section]) && !data[section].length) && section !== "summary" && section !== "customSections") return "";
    const sectionStyle = `padding-left:0.5rem;margin-bottom:1rem;`;
    const renderWithIcons = layout.showIcons ? `<span style="width:1rem;height:1rem;margin-right:0.25rem;display:inline-block;vertical-align:middle;">${renderedIcons[sectionIconMap[section]] || `<span style="display:inline-block;width:1rem;height:1rem;color:${mergedColors.accent};font-size:0.625rem;text-align:center;line-height:1rem;">?</span>`}</span>` : "";
    switch (section) {
      case "summary":
        return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.summary}</h2><p style="color:${mergedColors.text};font-size:0.875rem;line-height:1.5;font-family:${styles.fontFamily};word-wrap:break-word;margin-top:0.075rem;">${cleanText(data.summary) || "Your professional profile goes here."}</p></section>`;
      case "experience":
        return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.experience}</h2><div style="display:flex;flex-direction:column;gap:0.25rem;">${data.experience.map(exp => `<div style="background:white;padding:${layout.timelineStyle ? '0.5rem 0.5rem 0.5rem 1.5rem' : '0.5rem'};border:1px solid rgba(255,255,255,0.5);border-radius:0.375rem;position:relative;">${layout.timelineStyle ? `<div style="position:absolute;left:0;top:0;height:100%;width:0.25rem;background:${mergedColors.accent};"><span style="position:absolute;top:0.5rem;left:-0.375rem;width:0.75rem;height:0.75rem;background:${mergedColors.accent};border-radius:9999px;"></span></div>` : ''}<div style="display:flex;flex-direction:column;"><div style="margin-bottom:0;"><h3 style="font-weight:600;font-size:0.875rem;color:${mergedColors.primary};font-family:${styles.fontFamily};word-wrap:break-word;margin-bottom:0.05rem;line-height:1.1;">${cleanText(exp.jobTitle) || "Job Title"}, ${cleanText(exp.company) || "Company Name"}</h3><p style="font-size:0.75rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};word-wrap:break-word;margin:0;line-height:1.1;">${formatDate(exp.startDate) || "Start"} - ${formatDate(exp.endDate) || "Present"} | ${cleanText(exp.location) || "Location"}</p></div><div style="margin-top:0.5rem;">${renderBulletPoints(exp.description) || "Description of responsibilities and achievements."}</div></div></div>`).join("")}</div></section>`;
      case "education":
        return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.education}</h2><div style="display:flex;flex-direction:column;gap:0.25rem;">${data.education.map(edu => {
          const showGPA = preferences?.education?.showGPA !== false && edu.gpa;
          const showPercentage = preferences?.education?.showPercentage !== false && edu.percentage;
          const gradeFormat = preferences?.education?.gradeFormat || "both"; // gpa | percentage | both
          let gradeStr = "";
          if (showGPA && (gradeFormat === "gpa" || gradeFormat === "both")) {
            gradeStr += `GPA: ${cleanText(edu.gpa)}`;
          }
          if (showPercentage && (gradeFormat === "percentage" || gradeFormat === "both")) {
            gradeStr += `${gradeStr ? " | " : ""}Percentage: ${cleanText(edu.percentage)}`;
          }
          return `<div style="background:white;padding:${layout.timelineStyle ? '0.5rem 0.5rem 0.5rem 1.5rem' : '0.5rem'};border:1px solid rgba(255,255,255,0.5);border-radius:0.375rem;position:relative;">${layout.timelineStyle ? `<div style=\"position:absolute;left:0;top:0;height:100%;width:0.25rem;background:${mergedColors.accent};\"><span style=\"position:absolute;top:0.5rem;left:-0.375rem;width:0.75rem;height:0.75rem;background:${mergedColors.accent};border-radius:9999px;\"></span></div>` : ''}<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;"><div><h3 style="font-weight:600;font-size:0.875rem;color:${mergedColors.primary};font-family:${styles.fontFamily};word-wrap:break-word;margin-bottom:0.05rem;line-height:1.1;">${cleanText(edu.institution) || "Institution Name"}</h3><p style="font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};word-wrap:break-word;margin-top:0.075rem;line-height:1.5;">${cleanText(edu.degree) || "Degree"}${edu.field ? ` in ${cleanText(edu.field)}` : ""}</p>${gradeStr ? `<p style=\"font-size:0.75rem;color:${mergedColors.text};margin-top:0.05rem;font-family:${styles.fontFamily};line-height:1.1;\">${gradeStr}</p>` : ""}</div><p style="font-size:0.75rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};white-space:nowrap;text-align:right;margin-top:0.075rem;line-height:1.1;">${formatDate(edu.startDate) || "Start"} - ${formatDate(edu.endDate) || "Present"}</p></div></div>`;}).join("")}</div></section>`;
      case "skills":
        // Check if this is an ATS template with single column layout
        if (layout.columns === 1) {
          const totalSkills = data.skills?.length || 0;
          const fixedColumns = 3; // Always use 3 columns for ATS templates
          const skillsPerColumn = Math.ceil(totalSkills / fixedColumns);
          
          let skillsHTML = '';
          for (let i = 0; i < fixedColumns; i++) {
            const startIdx = i * skillsPerColumn;
            const endIdx = Math.min(startIdx + skillsPerColumn, totalSkills);
            const columnSkills = data.skills?.slice(startIdx, endIdx) || [];
            
            skillsHTML += `
              <div style="flex:1;min-width:0;overflow:hidden;">
                <div style="display:flex;flex-direction:column;gap:0.25rem;">
                  ${columnSkills.map(skill => `
                    <div style="font-size:0.75rem;color:${mergedColors.text};font-family:${styles.fontFamily};line-height:1.2;word-break:break-word;overflow-wrap:break-word;">
                      • ${cleanText(skill.name)}
                      ${preferences?.skills?.showProficiency && skill.proficiency ? ` (${cleanText(skill.proficiency)})` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }
          
          return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.skills}</h2><div style="display:grid;gap:1rem;grid-template-columns:repeat(3,1fr);min-width:100%;overflow:hidden;">${skillsHTML}</div></section>`;
        } else {
          // Default skills rendering based on preferences
          const skillDisplay = preferences?.skills?.display || layout.skillsDisplay || "tags"; // list | grid | tags | bars
          const showProf = preferences?.skills?.showProficiency && data.skills.some(s=>s.proficiency);
          if (skillDisplay === "tags") {
            return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.skills}</h2><div style="display:flex;flex-wrap:wrap;gap:0.25rem;">${data.skills.map(skill => `<span style=\"background:#E0E7FF;color:#3730A3;font-size:0.75rem;padding:0.25rem 0.5rem;border-radius:0.375rem;font-family:${styles.fontFamily};\">${cleanText(skill.name)}${showProf && skill.proficiency ? ` (${cleanText(skill.proficiency)})` : ''}</span>`).join("")}</div></section>`;
          } else if (skillDisplay === "grid") {
            const columns = preferences?.skills?.columns || 2;
            return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.skills}</h2><div style="display:grid;grid-template-columns:repeat(${columns},1fr);gap:0.5rem;">${data.skills.map(skill => `<div style=\"background:white;padding:0.25rem;border:1px solid rgba(255,255,255,0.5);border-radius:0.375rem;font-family:${styles.fontFamily};\"><span style=\"font-size:0.875rem;color:${mergedColors.text};line-height:1.5;\">${cleanText(skill.name)}${showProf && skill.proficiency ? ` (${cleanText(skill.proficiency)})` : ''}</span></div>`).join("")}</div></section>`;
          } else if (skillDisplay === "bars") {
            const scale = preferences?.skills?.proficiencyScale || "1-5";
            const calcPercent = (prof) => {
              if (!prof) return 0;
              if (scale === "percentage") return Math.min(100, parseInt(prof, 10));
              if (scale === "beginner-expert") {
                const levels = ["beginner","intermediate","advanced","expert"];
                const idx = levels.findIndex(l=>l.toLowerCase()===String(prof).toLowerCase());
                return idx>=0 ? ((idx+1)/levels.length)*100 : 0;
              }
              // 1-5 numeric
              return Math.min(100, (parseInt(prof,10)||0)*20);
            };
            return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.skills}</h2><div style="display:flex;flex-direction:column;gap:0.25rem;">${data.skills.map(skill=>{
              const percent=calcPercent(skill.proficiency);
              return `<div style=\"display:flex;flex-direction:column;gap:0.1rem;font-family:${styles.fontFamily};\"><div style=\"display:flex;justify-content:space-between;font-size:0.75rem;color:${mergedColors.text};\"><span>${cleanText(skill.name)}</span>${showProf && skill.proficiency ? `<span style=\"color:${mergedColors.secondary};\">${cleanText(skill.proficiency)}</span>` : ''}</div><div style=\"width:100%;height:0.375rem;background:#E5E7EB;border-radius:0.25rem;overflow:hidden;\"><div style=\"width:${percent}%;height:100%;background:${mergedColors.accent};border-radius:0.25rem;\"></div></div></div>`;
            }).join("")}</div></section>`;
          } else {
            // list
            return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.skills}</h2><ul style="margin:0;padding-left:1.25rem;list-style:disc;">${data.skills.map(skill => `<li style=\"font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};line-height:1.5;\">${cleanText(skill.name)}${showProf && skill.proficiency ? ` (${cleanText(skill.proficiency)})` : ''}</li>`).join("")}</ul></section>`;
          }
        }
      case "certifications":
        // Check if this is an ATS template with 2-column layout for cleaner rendering
        if (template && template.startsWith('ats_') && layout.columns === 2) {
          return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.certifications}</h2><div style="display:flex;flex-direction:column;gap:0.5rem;">${data.certifications.map(cert => `<div style="display:flex;align-items:flex-start;gap:0.5rem;"><span style="color:${mergedColors.accent};font-size:0.75rem;flex-shrink:0;margin-top:0.125rem;">•</span><div style="flex:1;min-width:0;"><h3 style="font-weight:600;font-size:0.875rem;color:${mergedColors.primary};font-family:${styles.fontFamily};margin:0 0 0.25rem 0;line-height:1.2;">${cleanText(cert.name) || "Certification Name"}</h3><p style="font-size:0.75rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};margin:0;line-height:1.2;">${cleanText(cert.issuer) || "Issuer"} • ${formatDate(cert.date) || "Date"}</p></div></div>`).join("")}</div></section>`;
        } else {
          return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.certifications}</h2><div style="display:flex;flex-direction:column;gap:0.25rem;">${data.certifications.map(cert => `<div style="background:white;padding:${layout.timelineStyle ? '0.25rem 0.25rem 0.25rem 1.25rem' : '0.25rem'};border:1px solid rgba(255,255,255,0.5);border-radius:0.375rem;position:relative;">${layout.timelineStyle ? `<div style=\"position:absolute;left:0;top:0;height:100%;width:0.25rem;background:${mergedColors.accent};\"><span style=\"position:absolute;top:0.4rem;left:-0.375rem;width:0.75rem;height:0.75rem;border-radius:9999px;background:${mergedColors.accent};\"></span></div>` : ''}<div style="padding-left:${layout.timelineStyle ? '0' : '0'};display:flex;flex-direction:column;gap:0.125rem;"> <h3 style="font-weight:600;font-size:0.875rem;color:${mergedColors.primary};font-family:${styles.fontFamily};word-wrap:break-word;margin:0;line-height:1.2;">${cleanText(cert.name) || "Certification Name"}</h3><p style="font-size:0.75rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};margin:0;line-height:1.2;">${cleanText(cert.issuer) || "Issuer"} • ${formatDate(cert.date) || "Date"}</p></div></div>`).join("")}</div></section>`;
        }
      case "languages":
        return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.languages}</h2><div style="display:grid;grid-template-columns:${layout.columns === 2 ? '1fr' : 'repeat(2,1fr)'};gap:0.5rem;">${data.languages.map(lang => `<div style="background:white;padding:0.25rem;border:1px solid rgba(255,255,255,0.5);border-radius:0.375rem;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};word-wrap:break-word;line-height:1.5;">${cleanText(lang.language) || "Language"} ${lang.proficiency ? `(${cleanText(lang.proficiency)})` : ""}</span></div>`).join("")}</div></section>`;
      case "achievements":
        if (!data.achievements || !Array.isArray(data.achievements) || data.achievements.length === 0) return "";
        return `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${renderWithIcons}${t.achievements || "Achievements"}</h2><ul style="margin:0;padding-left:1.25rem;list-style:disc;">${data.achievements.map(achievement => `<li style="font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};line-height:1.5;margin-bottom:0.25rem;">${cleanText(achievement)}</li>`).join("")}</ul></section>`;
      case "personal":
        return ""; // Personal info is already in header, skip rendering as section
      case "customSections":
        if (!data.customSections || data.customSections.length === 0) return "";
        
        // Render custom sections in their original order (preserve order from UI)
        // Don't group by type - maintain the exact order as provided
        let sectionsHtml = "";
        data.customSections.forEach((cs, index) => {
          const type = (cs.type || "project").toLowerCase();
          const sectionTitle = cs.title || (t[type] || type.charAt(0).toUpperCase() + type.slice(1));
          const customRenderWithIcons = layout.showIcons && sectionIconMap[type] ? `<span style="width:1rem;height:1rem;margin-right:0.25rem;display:inline-block;vertical-align:middle;">${renderedIcons[sectionIconMap[type]] || `<span style="display:inline-block;width:1rem;height:1rem;color:${mergedColors.accent};font-size:0.625rem;text-align:center;line-height:1rem;">?</span>`}</span>` : "";
          
          // Render each custom section individually with its own title
          sectionsHtml += `<section style="${sectionStyle}"><h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};line-height:1.1;">${customRenderWithIcons}${sectionTitle}</h2><div style="display:flex;flex-direction:column;gap:0.25rem;"><div style="background:white;padding:0.25rem;border:1px solid rgba(255,255,255,0.5);border-radius:0.375rem;"><h3 style="font-weight:600;font-size:0.875rem;color:${mergedColors.primary};font-family:${styles.fontFamily};word-wrap:break-word;margin-bottom:0.05rem;line-height:1.1;">${cleanText(cs.title) || ""}</h3><div style="margin-top:0.5rem;">${renderBulletPoints(cs.description) || "Description not provided."}</div>${cs.technologies ? `<p style="color:${mergedColors.text};font-size:0.875rem;line-height:1.5;margin-top:0.075rem;font-family:${styles.fontFamily};word-wrap:break-word;">Technology Used: ${cleanText(cs.technologies)}</p>` : ""}${cs.date ? `<p style="font-size:0.75rem;color:${mergedColors.secondary};margin-top:0.075rem;font-family:${styles.fontFamily};word-wrap:break-word;line-height:1.1;">${formatDate(cs.date)}</p>` : ""}${cs.type === "reference" && cs.name ? `<div style="margin-top:0.075rem;"><p style="font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};word-wrap:break-word;margin-bottom:0.05rem;">Reference: ${cleanText(cs.name)}</p>${cs.email ? `<p style="font-size:0.75rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};word-wrap:break-word;margin-top:0.075rem;line-height:1.1;">Email: ${cleanText(cs.email)}</p>` : ""}${cs.phone ? `<p style="font-size:0.75rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};word-wrap:break-word;margin-top:0.075rem;line-height:1.1;">Phone: ${cleanText(cs.phone)}</p>` : ""}</div>` : ""}</div></div></section>`;
        });
        
        return sectionsHtml;
      default:
        return "";
    }
  };

  const renderHeader = () => {
    const headerBaseStyle = `margin-bottom:0.5rem;padding:0.75rem;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%);color:white;border-radius:0.5rem;font-family:${styles.fontFamily};box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:1px solid rgba(255,255,255,0.5);`;
    
    if (layout.headerStyle === "compact") {
      return `<header style="${headerBaseStyle}text-align:center;"><h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.05rem;font-family:${styles.fontFamily};line-height:1.1;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:0.875rem;font-weight:500;opacity:0.9;margin-bottom:0.075rem;font-family:${styles.fontFamily};line-height:1.1;">${cleanText(data.jobTitle)}</p>` : ''}<div style="font-size:0.75rem;font-family:${styles.fontFamily};white-space:normal;word-wrap:break-word;"><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.email) || "email@example.com"}</p><p style="margin:0.075rem 0;line-height:1.1;">${data.phone || "+1 (555) 123-4567"}</p><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.address) || "123 Street, City, Country"}</p>${data.linkedin ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.linkedin)}" style="color:white;text-decoration:underline;">${cleanText(data.linkedin)}</a></p>` : ""}${data.portfolio ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.portfolio)}" style="color:white;text-decoration:underline;">${cleanText(data.portfolio)}</a></p>` : ""}</div></header>`;
    } else if (layout.headerStyle === "full-width") {
      return `<header style="${headerBaseStyle}"><div style="display:flex;flex-wrap:nowrap;justify-content:space-between;align-items:center;gap:0.5rem;"><div style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:0.5rem;">${data.photo ? `<img src="${data.photo}" alt="Profile" style="width:4rem;height:4rem;border-radius:9999px;object-fit:cover;border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.05);">` : ""}<div><h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.05rem;font-family:${styles.fontFamily};word-wrap:break-word;line-height:1.1;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:0.875rem;font-weight:500;opacity:0.9;font-family:${styles.fontFamily};word-wrap:break-word;margin-top:0.075rem;line-height:1.1;">${cleanText(data.jobTitle)}</p>` : ''}</div></div><div style="font-size:0.75rem;text-align:right;flex:0 0 auto;max-width:50%;overflow:hidden;text-overflow:ellipsis;font-family:${styles.fontFamily};white-space:normal;word-wrap:break-word;"><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.email) || "email@example.com"}</p><p style="margin:0.075rem 0;line-height:1.1;">${data.phone || "+1 (555) 123-4567"}</p><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.address) || "123 Street, City, Country"}</p>${data.linkedin ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.linkedin)}" style="color:white;text-decoration:underline;">${cleanText(data.linkedin)}</a></p>` : ""}${data.portfolio ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.portfolio)}" style="color:white;text-decoration:underline;">${cleanText(data.portfolio)}</a></p>` : ""}</div></div></header>`;
    } else if (layout.headerStyle === "minimal" || layout.headerStyle === "minimal-header") {
      return `<header style="margin-bottom:1rem;border-bottom:3px solid ${mergedColors.primary};padding-bottom:0.75rem;text-align:center;font-family:${styles.fontFamily};"><h1 style="font-size:2rem;font-weight:300;letter-spacing:0.1em;margin-bottom:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.125rem;margin-bottom:0.75rem;color:${mergedColors.secondary};letter-spacing:0.05em;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;justify-content:center;gap:1.5rem;font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};"><span>${cleanText(data.email) || "email@example.com"}</span><span>•</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>•</span><span>${cleanText(data.address)}</span>` : ""}</div></header>`;
    } else if (layout.headerStyle === "creative-asymmetric") {
      return `<header style="margin-bottom:1.5rem;position:relative;border-radius:1rem;overflow:hidden;min-height:7.5rem;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.secondary} 60%,${mergedColors.accent} 100%);font-family:${styles.fontFamily};"><div style="position:absolute;top:1rem;right:1rem;width:4rem;height:4rem;border-radius:50%;opacity:0.1;background:radial-gradient(circle,${mergedColors.accent} 0%,transparent 70%);"></div><div style="position:absolute;top:1.5rem;left:1.5rem;width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.2);"></div><div style="position:absolute;top:2.5rem;left:1rem;width:0.25rem;height:0.25rem;border-radius:50%;background:rgba(255,255,255,0.3);"></div><div style="position:absolute;bottom:1.5rem;right:2.5rem;width:0.375rem;height:0.375rem;border-radius:50%;background:rgba(255,255,255,0.15);"></div><div style="position:relative;z-index:10;padding:1.5rem;color:white;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;"><div style="flex-shrink:0;"><h1 style="font-size:1.875rem;font-weight:700;line-height:1.2;margin-bottom:0.25rem;text-shadow:0 2px 8px rgba(0,0,0,0.3);color:white;font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.125rem;font-weight:500;opacity:0.9;text-shadow:0 1px 4px rgba(0,0,0,0.2);color:white;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}</div><div style="flex:1;display:flex;justify-content:center;"><div style="display:flex;align-items:center;gap:1rem;font-size:0.875rem;opacity:0.9;flex-wrap:wrap;justify-content:center;"><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${cleanText(data.email) || "email@example.com"}</span></div><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${data.phone || "+1 (555) 123-4567"}</span></div>${data.address ? `<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:0.5rem;height:0.5rem;border-radius:50%;background:rgba(255,255,255,0.6);"></div><span>${cleanText(data.address)}</span></div>` : ""}</div></div><div style="flex-shrink:0;">${data.photo ? `<div style="position:relative;transform:rotate(2deg);"><img src="${data.photo}" alt="Profile" style="width:5rem;height:5rem;border-radius:0.75rem;object-fit:cover;box-shadow:0 8px 24px rgba(0,0,0,0.15);border:2px solid white;filter:contrast(1.05) saturate(1.05);"><div style="position:absolute;top:-0.25rem;right:-0.25rem;width:0.75rem;height:0.75rem;border-radius:50%;border:2px solid white;background:${mergedColors.accent};"></div></div>` : `<div style="position:relative;transform:rotate(1deg);width:5rem;height:5rem;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;color:white;font-size:1.125rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,0.15);border:2px solid white;background:linear-gradient(135deg,${mergedColors.accent} 0%,${mergedColors.secondary} 100%);">${(cleanText(data.name) || "YN").split(' ').map(n => n[0]).join('').slice(0, 2)}</div>`}</div></div></header>`;
    } else if (layout.headerStyle === "creative") {
      return `<header style="margin-bottom:1rem;padding:1.5rem;border-radius:1rem;position:relative;overflow:hidden;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%);color:white;font-family:${styles.fontFamily};"><div style="position:absolute;inset:0;opacity:0.2;pointer-events:none;"><svg viewBox="0 0 100 100" style="width:100%;height:100%;"><defs><pattern id="creative-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3"/></pattern></defs><rect width="100%" height="100%" fill="url(#creative-pattern)"/></svg></div><div style="position:relative;z-index:10;display:flex;align-items:center;gap:1.5rem;">${data.photo ? `<div style="flex-shrink:0;"><img src="${data.photo}" alt="Profile" style="width:5rem;height:5rem;border-radius:50%;object-fit:cover;border:4px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2);"></div>` : ""}<div style="flex:1;"><h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;background:linear-gradient(45deg,#fff,#f0f0f0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.25rem;font-weight:500;margin-bottom:0.75rem;opacity:0.9;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;font-size:0.875rem;opacity:0.85;"><div>${cleanText(data.email) || "email@example.com"}</div><div>${data.phone || "+1 (555) 123-4567"}</div>${data.address ? `<div style="grid-column:span 2;">${cleanText(data.address)}</div>` : ""}</div></div></div></header>`;
    } else if (layout.headerStyle === "elegant") {
      return `<header style="margin-bottom:1rem;border-bottom:4px solid #374151;padding-bottom:1rem;text-align:center;font-family:${styles.fontFamily};"><h1 style="font-size:2.25rem;font-family:'Playfair Display',serif;margin-bottom:0.25rem;color:${mergedColors.primary};font-weight:700;letter-spacing:-0.02em;">${cleanText(data.name) || "Your Name"}</h1><div style="width:6rem;height:0.25rem;margin:0 auto 0.75rem;background:${mergedColors.accent};"></div>${data.jobTitle ? `<p style="font-size:1.125rem;font-style:italic;margin-bottom:1rem;color:${mergedColors.secondary};font-family:'Playfair Display',serif;">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;font-weight:500;color:${mergedColors.text};font-family:${styles.fontFamily};"><span>${cleanText(data.email) || "email@example.com"}</span><div style="width:0.25rem;height:0.25rem;border-radius:50%;background:#9ca3af;"></div><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<div style="width:0.25rem;height:0.25rem;border-radius:50%;background:#9ca3af;"></div><span>${cleanText(data.address)}</span>` : ""}</div></header>`;
    } else if (layout.headerStyle === "hero-banner") {
      return `<header style="margin-bottom:1rem;padding:1.5rem;border-radius:0.75rem;position:relative;background:${mergedColors.headerGradient || `linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%)`};color:white;min-height:7.5rem;font-family:${styles.fontFamily};"><div style="position:absolute;inset:0;background:rgba(0,0,0,0.1);border-radius:0.75rem;"></div><div style="position:relative;z-index:10;display:flex;align-items:center;justify-content:center;height:100%;"><div style="text-align:center;">${data.photo ? `<img src="${data.photo}" alt="Profile" style="width:4rem;height:4rem;border-radius:50%;object-fit:cover;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2);margin:0 auto 0.75rem;display:block;">` : ""}<h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;text-shadow:0 2px 4px rgba(0,0,0,0.3);font-family:${styles.fontFamily};">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1.125rem;font-weight:300;margin-bottom:1rem;opacity:0.95;font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;justify-content:center;gap:1.5rem;font-size:0.875rem;"><span>${cleanText(data.email) || "email@example.com"}</span><span>•</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>•</span><span>${cleanText(data.address)}</span>` : ""}</div></div></div></header>`;
    } else if (layout.headerStyle === "portfolio-modern") {
      return `<header style="margin-bottom:1rem;position:relative;background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%);border-radius:0.75rem;overflow:hidden;font-family:${styles.fontFamily};"><div style="height:0.375rem;background:linear-gradient(90deg,${mergedColors.primary} 0%,${mergedColors.accent} 50%,${mergedColors.secondary} 100%);"></div><div style="padding:1.5rem;"><div style="display:flex;align-items:start;gap:1.5rem;"><div style="flex-shrink:0;">${data.photo ? `<div style="position:relative;"><img src="${data.photo}" alt="Profile" style="width:5rem;height:5rem;border-radius:0.75rem;object-fit:cover;box-shadow:0 4px 12px rgba(0,0,0,0.1);border:3px solid white;"></div>` : `<div style="width:5rem;height:5rem;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;color:white;font-size:1.25rem;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.1);border:3px solid white;background:linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%);">${(cleanText(data.name) || "YN").split(' ').map(n => n[0]).join('').slice(0, 2)}</div>`}</div><div style="flex:1;"><h1 style="font-size:1.5rem;font-weight:600;margin-bottom:0.5rem;color:${mergedColors.primary};font-family:${styles.fontFamily};letter-spacing:-0.01em;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:1rem;margin-bottom:1rem;color:${mergedColors.secondary};font-family:${styles.fontFamily};">${cleanText(data.jobTitle)}</p>` : ''}<div style="display:flex;flex-wrap:wrap;gap:0.75rem;font-size:0.875rem;color:${mergedColors.text};font-family:${styles.fontFamily};"><div style="display:flex;align-items:center;gap:0.375rem;"><div style="width:1rem;height:1rem;border-radius:0.375rem;background:${mergedColors.accent};display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 20 20" fill="white"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg></div><span>${cleanText(data.email) || "email@example.com"}</span></div><div style="display:flex;align-items:center;gap:0.375rem;"><div style="width:1rem;height:1rem;border-radius:0.375rem;background:${mergedColors.accent};display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 20 20" fill="white"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg></div><span>${data.phone || "+1 (555) 123-4567"}</span></div>${data.address ? `<div style="display:flex;align-items:center;gap:0.375rem;"><div style="width:1rem;height:1rem;border-radius:0.375rem;background:${mergedColors.accent};display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg></div><span>${cleanText(data.address)}</span></div>` : ""}</div></div></div></div></header>`;
    } else {
      return `<header style="${headerBaseStyle}position:relative;overflow:hidden;"><div style="position:absolute;inset:0;opacity:0.1;pointer-events:none;"><svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;"><path d="M0,0 Q50,50 100,0" stroke="${mergedColors.accent}" stroke-width="2" fill="none" /><path d="M0,100 Q50,50 100,100" stroke="${mergedColors.accent}" stroke-width="2" fill="none" /></svg></div><div style="position:relative;z-index:10;display:flex;flex-wrap:nowrap;justify-content:space-between;align-items:center;gap:0.5rem;"><div style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:0.5rem;">${data.photo ? `<img src="${data.photo}" alt="Profile" style="width:4rem;height:4rem;border-radius:9999px;object-fit:cover;border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.05);">` : ""}<div><h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.05rem;font-family:${styles.fontFamily};word-wrap:break-word;line-height:1.1;">${cleanText(data.name) || "Your Name"}</h1>${data.jobTitle ? `<p style="font-size:0.875rem;font-weight:500;opacity:0.9;font-family:${styles.fontFamily};word-wrap:break-word;margin-top:0.075rem;line-height:1.1;">${cleanText(data.jobTitle)}</p>` : ''}</div></div><div style="font-size:0.75rem;text-align:right;flex:0 0 auto;max-width:50%;overflow:hidden;text-overflow:ellipsis;font-family:${styles.fontFamily};white-space:normal;word-wrap:break-word;"><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.email) || "email@example.com"}</p><p style="margin:0.075rem 0;line-height:1.1;">${data.phone || "+1 (555) 123-4567"}</p><p style="margin:0.075rem 0;line-height:1.1;">${cleanText(data.address) || "123 Street, City, Country"}</p>${data.linkedin ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.linkedin)}" style="color:white;text-decoration:underline;">${cleanText(data.linkedin)}</a></p>` : ""}${data.portfolio ? `<p style="margin:0.075rem 0;line-height:1.1;"><a href="${cleanText(data.portfolio)}" style="color:white;text-decoration:underline;">${cleanText(data.portfolio)}</a></p>` : ""}</div></div></header>`;
    }
  };

  // Use exact same layout rendering logic
  const renderLayout = () => {
    const header = renderHeader();
    
    const customSectionOrder = preferences?.layout?.customSectionOrder;
    
    let sectionsOrder;
    let sidebarSections = layout.sidebarSections || [];
    let mainSections = layout.mainSections || [];
    let columns = layout.columns;
    
    if (customSectionOrder) {
      if (customSectionOrder.layout === 'single-column') {
        sectionsOrder = customSectionOrder.sectionsOrder || [...layout.sectionsOrder];
        columns = 1;
        sidebarSections = [];
        mainSections = sectionsOrder;
      } else if (customSectionOrder.layout === 'two-column') {
        sidebarSections = customSectionOrder.sidebarSections || [];
        mainSections = customSectionOrder.mainSections || [];
        columns = 2;
        sectionsOrder = [...sidebarSections, ...mainSections];
      } else {
        sectionsOrder = [...layout.sectionsOrder];
      }
    } else {
      sectionsOrder = [...layout.sectionsOrder];
    }
    
    // Always ensure customSections are included if they exist
    if (data.customSections && data.customSections.length > 0) {
      console.log('Found customSections, adding to sectionsOrder');
      if (!sectionsOrder.includes("customSections")) {
        sectionsOrder.push("customSections");
        console.log('Added customSections to sectionsOrder');
      }
      if (columns === 2) {
        if (!sidebarSections.includes("customSections") && !mainSections.includes("customSections")) {
          mainSections = [...mainSections, "customSections"];
          console.log('Added customSections to mainSections for 2-column layout');
        }
      }
      console.log('Final sectionsOrder:', sectionsOrder);
      console.log('Final mainSections:', mainSections);
    }

    if (columns === 1) {
      console.log('Rendering single column layout with sections:', sectionsOrder);
      const sections = sectionsOrder.map(section => {
        console.log('Rendering section:', section);
        const content = renderSectionContent(section);
        console.log('Section content length:', content ? content.length : 0);
        return content;
      }).join("");
      return `<div style="width:100%;padding:0.5rem;border-radius:0.5rem;background-color:${mergedColors.background};font-family:${styles.fontFamily};box-shadow:0 1px 3px rgba(0,0,0,0.1);position:relative;border:1px solid rgba(255,255,255,0.5);">${header}${sections}</div>`;
    }
    
    if (columns === 2) {
      console.log('Rendering 2-column layout');
      console.log('Sidebar sections:', sidebarSections);
      console.log('Main sections:', mainSections);
      
      const sidebarContent = sidebarSections.map(section => {
        console.log('Rendering sidebar section:', section);
        const content = renderSectionContent(section);
        console.log('Sidebar section content length:', content ? content.length : 0);
        return content;
      }).filter(Boolean).join("");
      
      const mainContent = mainSections.map(section => {
        console.log('Rendering main section:', section);
        const content = renderSectionContent(section);
        console.log('Main section content length:', content ? content.length : 0);
        return content;
      }).filter(Boolean).join("");
      
      const sidebarBackground = typeof layout.sidebar === "string" ? layout.sidebar : mergedColors.background;
      return `<div style="width:100%;padding:0.5rem;border-radius:0.5rem;background-color:${mergedColors.background};font-family:${styles.fontFamily};box-shadow:0 1px 3px rgba(0,0,0,0.1);position:relative;border:1px solid rgba(255,255,255,0.5);">${header}<div style="display:grid;grid-template-columns:${layout.sidebarWidth || '25%'} ${100 - parseInt(layout.sidebarWidth || '25')}% ;gap:0.5rem;align-items:stretch;"><div style="padding:0.75rem;background:${sidebarBackground};border-radius:0.375rem;font-family:${styles.fontFamily};overflow-wrap:break-word;border:1px solid rgba(255,255,255,0.5);">${sidebarContent}</div><div style="padding:0.75rem;background:white;border-radius:0.375rem;font-family:${styles.fontFamily};border:1px solid rgba(255,255,255,0.5);">${mainContent}</div></div></div>`;
    }
    
    const sections = sectionsOrder.map(section => renderSectionContent(section)).join("");
    return `<div style="width:100%;padding:0.5rem;border-radius:0.5rem;background-color:${mergedColors.background};font-family:${styles.fontFamily};box-shadow:0 1px 3px rgba(0,0,0,0.1);position:relative;border:1px solid rgba(255,255,255,0.5);">${header}${sections}</div>`;
  };

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>html{font-size:16px;}body{width:660px;min-height:0;margin:0 auto;padding:0;background-color:${mergedColors.background};color:${mergedColors.text};font-family:${styles.fontFamily},sans-serif;box-sizing:border-box;display:flex;justify-content:center;align-items:flex-start;word-break:keep-all;hyphens:manual;overflow-wrap:normal;white-space:normal;text-rendering:optimizeLegibility;-webkit-font-feature-settings:"liga" 1, "kern" 1;font-feature-settings:"liga" 1, "kern" 1;}h1,h2,h3{font-weight:700;margin:0;word-break:keep-all;hyphens:manual;}p{margin:0;white-space:normal;word-break:keep-all;hyphens:manual;overflow-wrap:normal;}img{max-width:100%;height:auto;}svg{display:inline-block;vertical-align:middle;}</style></head><body>${renderLayout()}</body></html>`;
}

// Job-specific HTML generation function
function generateJobSpecificHTML(data, template = "it_fresher", customColors = {}, language = "en", country = "in", isPremium = false) {
  const config = jobSpecificTemplates[template] || jobSpecificTemplates["it_fresher"];
  const styles = {
    ...config.styles,
    colors: { ...config.styles.colors, ...(customColors[template] || {}) },
  };

  // Merge with default data
  const mergedData = {
    ...config.defaultData,
    ...data,
    personal: { ...config.defaultData.personal, ...data.personal },
    summary: data.summary || config.defaultData.summary,
    skills: data.skills && data.skills.length > 0 ? data.skills : config.defaultData.skills,
    projects: data.projects && data.projects.length > 0 ? data.projects : config.defaultData.projects || [],
    experience: data.experience && data.experience.length > 0 ? data.experience : config.defaultData.experience || [],
    education: data.education && data.education.length > 0 ? data.education : config.defaultData.education,
    certifications: data.certifications && data.certifications.length > 0 ? data.certifications : config.defaultData.certifications || [],
    languages: data.languages && data.languages.length > 0 ? data.languages : config.defaultData.languages || [],
    achievements: data.achievements && data.achievements.length > 0 ? data.achievements : config.defaultData.achievements || [],
    references: data.references && data.references.length > 0 ? data.references : config.defaultData.references || [],
    portfolio: data.portfolio && data.portfolio.length > 0 ? data.portfolio : config.defaultData.portfolio || [],
  };

  const getPhotoUrl = (photo) => {
    if (photo && photo.startsWith("data:image")) return photo;
    return null;
  };

  const headerType = config.layout?.headerType || "picture-top";
  const hasHeader = headerType === "banner" || headerType === "picture-left" || headerType === "picture-top" || 
                    headerType === "modern-tech" || headerType === "executive-banner" || headerType === "creative-hero" ||
                    headerType === "medical-banner" || headerType === "tech-banner" || headerType === "official-header";

  const renderHeaderBlock = () => {
    if (!hasHeader) return "";
    const photoUrl = getPhotoUrl(mergedData.personal.photo);

    // Template-specific header rendering
    if (headerType === "modern-tech") {
      return `
        <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; border-radius: 15px 15px 0 0; padding: 24px; display: flex; align-items: center; gap: 16px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(30px, -30px);"></div>
          ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '80px'}; height: ${styles.photo?.size || '80px'}; border-radius: ${styles.photo?.shape === 'circle' ? '50%' : '12px'}; object-fit: cover; border: ${styles.photo?.border || '3px solid rgba(255,255,255,0.3)'}; box-shadow: 0 8px 24px rgba(0,0,0,0.2);" />` : ''}
          <div style="flex: 1;">
            <h1 style="font-size: 20pt; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px;">${mergedData.personal.name || 'Your Name'}</h1>
            <p style="font-size: 12pt; opacity: 0.9; margin: 0 0 4px; font-weight: 500;">Software Developer & Tech Enthusiast</p>
            <p style="font-size: 10pt; opacity: 0.8; margin: 0;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
          </div>
        </div>
      `;
    }

    if (headerType === "executive-banner") {
      return `
        <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; padding: 20px 24px; text-align: center; position: relative;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: ${styles.colors.accent};"></div>
          ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '70px'}; height: ${styles.photo?.size || '70px'}; border-radius: ${styles.photo?.shape === 'circle' ? '50%' : '8px'}; object-fit: cover; border: 3px solid rgba(255,255,255,0.9); margin: 0 auto 12px; display: block;" />` : ''}
          <h1 style="font-size: 18pt; font-weight: 600; margin: 0 0 6px; letter-spacing: -0.3px;">${mergedData.personal.name || 'Your Name'}</h1>
          <p style="font-size: 11pt; opacity: 0.9; margin: 0 0 8px; font-weight: 500;">Banking & Finance Professional</p>
          <p style="font-size: 9pt; opacity: 0.8; margin: 0;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
        </div>
      `;
    }

    if (headerType === "creative-hero") {
      return `
        <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; border-radius: 20px 20px 0 0; padding: 28px 24px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
          <div style="display: flex; align-items: center; gap: 20px; position: relative; z-index: 1;">
            ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '90px'}; height: ${styles.photo?.size || '90px'}; border-radius: 15px; object-fit: cover; border: 4px solid rgba(255,255,255,0.9); box-shadow: 0 10px 30px rgba(0,0,0,0.3);" />` : ''}
            <div style="flex: 1;">
              <h1 style="font-size: 22pt; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px;">${mergedData.personal.name || 'Your Name'}</h1>
              <p style="font-size: 13pt; opacity: 0.9; margin: 0 0 6px; font-weight: 500;">Creative Designer & Visual Artist</p>
              <p style="font-size: 10pt; opacity: 0.8; margin: 0;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (headerType === "medical-banner") {
      return `
        <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; border-radius: 12px 12px 0 0; padding: 24px; position: relative;">
          <div style="position: absolute; top: 10px; right: 10px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
          ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '80px'}; height: ${styles.photo?.size || '80px'}; border-radius: ${styles.photo?.shape === 'circle' ? '50%' : '10px'}; object-fit: cover; border: 3px solid rgba(255,255,255,0.9); margin: 0 auto 12px; display: block;" />` : ''}
          <h1 style="font-size: 18pt; font-weight: 600; margin: 0 0 6px; text-align: center;">${mergedData.personal.name || 'Your Name'}</h1>
          <p style="font-size: 12pt; opacity: 0.9; margin: 0 0 8px; font-weight: 500; text-align: center;">Healthcare Professional</p>
          <p style="font-size: 10pt; opacity: 0.8; margin: 0; text-align: center;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
        </div>
      `;
    }

    if (headerType === "tech-banner") {
      return `
        <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; border-radius: 8px 8px 0 0; padding: 20px 24px; position: relative; font-family: monospace;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, ${styles.colors.accent} 0%, ${styles.colors.secondary} 100%);"></div>
          <div style="display: flex; align-items: center; gap: 16px;">
            ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '70px'}; height: ${styles.photo?.size || '70px'}; border-radius: 8px; object-fit: cover; border: 2px solid rgba(255,255,255,0.8);" />` : ''}
            <div style="flex: 1;">
              <h1 style="font-size: 20pt; font-weight: 700; margin: 0 0 6px; font-family: monospace;">${mergedData.personal.name || 'Your Name'}</h1>
              <p style="font-size: 12pt; opacity: 0.9; margin: 0 0 4px; font-weight: 500; font-family: monospace;">Data Scientist & ML Engineer</p>
              <p style="font-size: 9pt; opacity: 0.8; margin: 0; font-family: monospace;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (headerType === "official-header") {
      return `
        <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; padding: 16px 24px; text-align: center; border-bottom: 4px solid ${styles.colors.accent};">
          ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '60px'}; height: ${styles.photo?.size || '60px'}; border-radius: 6px; object-fit: cover; border: 2px solid rgba(255,255,255,0.9); margin: 0 auto 10px; display: block;" />` : ''}
          <h1 style="font-size: 16pt; font-weight: 600; margin: 0 0 4px;">${mergedData.personal.name || 'Your Name'}</h1>
          <p style="font-size: 11pt; opacity: 0.9; margin: 0 0 6px; font-weight: 500;">Government Service Professional</p>
          <p style="font-size: 9pt; opacity: 0.8; margin: 0;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
        </div>
      `;
    }

    // Default header
    return `
      <div style="background: ${styles.colors.headerGradient || `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.secondary} 100%)`}; color: #ffffff; border-radius: 12px 12px 0 0; padding: 32px 24px; min-height: 120px; display: flex; align-items: center;">
        ${photoUrl ? `<img src="${photoUrl}" alt="Profile" style="width: ${styles.photo?.size || '56px'}; height: ${styles.photo?.size || '56px'}; border-radius: ${styles.photo?.shape === 'circle' ? '50%' : '8px'}; object-fit: cover; border: ${styles.photo?.border || `2px solid ${styles.colors.accent}`}; box-shadow: ${styles.photo?.shadow || '0 2px 8px rgba(0,0,0,0.10)'}; margin: 0 auto 6px;" />` : ''}
        <div style="flex: 1; text-align: center;">
          <h1 style="font-size: 16pt; font-weight: bold; margin: 0 0 6px;">${mergedData.personal.name || 'Your Name'}</h1>
          <p style="font-size: 10pt; opacity: 0.9; margin: 0; letter-spacing: 0.02em;">${[mergedData.personal.email, mergedData.personal.phone, mergedData.personal.location].filter(Boolean).join(' • ')}</p>
        </div>
      </div>
    `;
  };

  const renderSection = (sectionKey) => {
    const sectionData = sectionKey === "personal.photo" ? mergedData.personal.photo : mergedData[sectionKey];
    if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) return "";

    // Skip personal.photo and personal sections if header is present
    if (sectionKey === "personal.photo" && hasHeader) return "";
    if (sectionKey === "personal" && hasHeader) return "";

    const sectionIcon = styles.icons?.[sectionKey] || "";
    const sectionTitle = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace("_", " ");

    // Skills section with enhanced styling
    if (sectionKey === "skills" && Array.isArray(sectionData)) {
      return `
        <div style="margin-bottom: 16px;">
          <h2 style="color: ${styles.colors.primary}; font-size: 13pt; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; letter-spacing: -0.2px;">
            ${sectionIcon ? `<span style="font-size: 14pt;">${sectionIcon}</span>` : ''}${sectionTitle}
          </h2>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
            ${sectionData.slice(0, 12).map(skill => `
              <span style="background: ${styles.colors.cardBg || '#f8fafc'}; color: ${styles.colors.primary}; padding: 4px 8px; border-radius: 6px; font-size: 9pt; font-weight: 500; border: 1px solid ${styles.colors.border || '#e2e8f0'}; white-space: nowrap;">${skill}</span>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Enhanced section rendering for other sections
    let html = `
      <div style="margin-bottom: 16px;">
        <h2 style="color: ${styles.colors.primary}; font-size: 13pt; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; letter-spacing: -0.2px;">
          ${sectionIcon ? `<span style="font-size: 14pt;">${sectionIcon}</span>` : ''}${sectionTitle}
        </h2>
    `;

    if (Array.isArray(sectionData)) {
      html += sectionData.map((item, idx) => {
        let itemHtml = `<div style="margin-bottom: 12px; padding: ${config.layout?.sectionCard ? '8px 0' : '4px 0'}; ${idx < sectionData.length - 1 ? `border-bottom: 1px solid ${styles.colors.border || '#f0f0f0'};` : ''}">`;
        
        if (typeof item === "string") {
          itemHtml += `<p style="color: ${styles.colors.text}; font-size: 10pt; line-height: 1.4;">${item}</p>`;
        } else {
          // Enhanced rendering for different item types
          if (item.title) {
            itemHtml += `<h3 style="color: ${styles.colors.text}; font-size: 11pt; font-weight: 600; margin-bottom: 2px; line-height: 1.3;">${item.title}</h3>`;
          }
          if (item.company) {
            itemHtml += `<p style="color: ${styles.colors.secondary}; font-size: 10pt; font-weight: 500; margin-bottom: 2px;">${item.company}</p>`;
          }
          if (item.institution) {
            itemHtml += `<p style="color: ${styles.colors.secondary}; font-size: 10pt; font-weight: 500; margin-bottom: 2px;">${item.institution}</p>`;
          }
          if (item.startDate || item.endDate) {
            itemHtml += `<p style="color: ${styles.colors.accent}; font-size: 9pt; font-weight: 500; margin-bottom: 4px;">${[item.startDate, item.endDate].filter(Boolean).join(' - ')}</p>`;
          }
          if (item.description) {
            itemHtml += `<p style="color: ${styles.colors.text}; font-size: 10pt; line-height: 1.4; margin-bottom: 4px;">${item.description}</p>`;
          }
          if (item.technologies) {
            itemHtml += `<p style="color: ${styles.colors.secondary}; font-size: 9pt; font-style: italic; margin-top: 4px;"><strong>Technologies:</strong> ${item.technologies}</p>`;
          }
        }
        
        itemHtml += "</div>";
        return itemHtml;
      }).join("");
    } else {
      html += `<p style="color: ${styles.colors.text}; font-size: 10pt; line-height: 1.5; margin-bottom: 8px;">${sectionData}</p>`;
    }
    
    html += "</div>";
    return html;
  };

  // Render layout
  const allSections = [
    ...new Set([
      ...config.layout.sectionsOrder,
      ...Object.keys(mergedData).filter((key) => key !== "personal" && !config.layout.sectionsOrder.includes(key)),
    ]),
  ];
  const sidebarSections = config.layout.sidebarSections || [];
  const mainSections = allSections.filter((section) => !sidebarSections.includes(section));
  const sidebarDirection = config.layout.sidebar || "left";
  const cleanedMainSections = hasHeader ? mainSections.filter((s) => s !== "personal") : mainSections;

  const sidebarHTML = sidebarSections.map(section => renderSection(section)).filter(Boolean).join("");
  const mainHTML = cleanedMainSections.map(section => renderSection(section)).filter(Boolean).join("");

  // No watermark needed - all users have paid plans
  const watermark = "";

  const layoutHTML = `
    <div style="width: 660px; background-color: ${styles.colors.background}; color: ${styles.colors.text}; font-family: ${styles.fontFamily}, sans-serif; position: relative;">
      ${renderHeaderBlock()}
      <div style="display: flex; ${sidebarDirection === "right" && sidebarSections.length > 0 ? 'flex-direction: row-reverse;' : 'flex-direction: row;'} gap: 24px; padding: 0;">
        ${sidebarSections.length > 0 ? `
          <div style="width: ${config.layout.sidebarWidth || '280px'}; background: ${styles.colors.sidebar || styles.colors.background}; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            ${sidebarHTML}
          </div>
        ` : ''}
        <div style="flex: 1; padding: 20px 12px;">
          ${mainHTML}
        </div>
      </div>
      ${watermark}
    </div>
  `;

  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          html { font-size: 16px; }
          body { 
            width: 660px; 
            margin: 0 auto; 
            padding: 0; 
            background-color: ${styles.colors.background}; 
            color: ${styles.colors.text}; 
            font-family: ${styles.fontFamily}, sans-serif; 
            box-sizing: border-box; 
            display: flex; 
            justify-content: center; 
            align-items: flex-start; 
          }
          h1, h2, h3 { font-weight: 700; margin: 0; }
          p { margin: 0; white-space: normal; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>${layoutHTML}</body>
    </html>`;
}

// Singleton for browser instance to reuse across requests
let browserInstance = null;

async function getBrowser() {
  if (browserInstance) return browserInstance;

  const isProduction = process.env.NODE_ENV === "production";
  browserInstance = await puppeteer.launch({
    args: [
      ...(isProduction ? chromium.args : []),
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
      "--enable-font-antialiasing",
      "--force-color-profile=srgb",
    ],
    defaultViewport: { width: 794, height: 1123 },
    executablePath: isProduction ? await chromium.executablePath() : undefined,
    headless: "new",
  });

  // Close browser on process exit
  process.on("exit", async () => {
    if (browserInstance) await browserInstance.close();
  });

  return browserInstance;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { templateKey = "classic", customColors = {}, width = 400, height = 566, isJobSpecific = false } = body;

    // Check if template exists in appropriate collection
    const isJobSpecificTemplate = isJobSpecific || jobSpecificTemplates[templateKey];
    const isMainTemplate = templates[templateKey];

    if (!isJobSpecificTemplate && !isMainTemplate) {
      return NextResponse.json({ error: `Template "${templateKey}" not found` }, { status: 400 });
    }

    const browser = await getBrowser();
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({ width: 660, height: 900, deviceScaleFactor: 2 });

    // Generate HTML using the appropriate generation function
    let html;
    if (isJobSpecificTemplate) {
      html = generateJobSpecificHTML(jobSpecificSampleData, templateKey, customColors, "en", "in", false);
    } else {
      html = generateResumeHTML(sampleData, templateKey, customColors, "en", "us", false, defaultConfig);
    }

    // Set HTML content
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PNG screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 660,
        height: 900
      },
      omitBackground: false
    });

    await page.close();

    return new NextResponse(screenshot, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });

  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview image', details: error.message },
      { status: 500 }
    );
  }
} 