const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Sample resume data for realistic previews
const sampleResumeData = {
  name: "Sarah Johnson",
  jobTitle: "Senior Software Engineer",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  address: "San Francisco, CA",
  linkedin: "linkedin.com/in/sarahjohnson",
  portfolio: "sarahjohnson.dev",
  summary: "Experienced software engineer with 8+ years developing scalable web applications. Specialized in React, Node.js, and cloud technologies. Led teams of 5-8 developers and delivered projects worth $2M+ annually.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      startDate: "2021",
      endDate: "Present",
      description: "Lead development of microservices architecture serving 1M+ users. Mentored 5 junior developers and improved code quality by 40%."
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      startDate: "2019",
      endDate: "2021",
      description: "Built full-stack web applications using React and Node.js. Collaborated with product team to deliver features ahead of schedule."
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      location: "Berkeley, CA",
      startDate: "2015",
      endDate: "2019",
      gpa: "3.8/4.0"
    }
  ],
  skills: [
    "JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "Kubernetes", "MongoDB", "PostgreSQL", "Git", "CI/CD", "Agile"
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2022"
    },
    {
      name: "Certified Scrum Master",
      issuer: "Scrum Alliance",
      date: "2021"
    }
  ],
  achievements: [
    "Led team that won company hackathon 2023",
    "Reduced API response time by 60%",
    "Implemented automated testing reducing bugs by 35%"
  ]
};

// All templates including one-pager templates
const allTemplates = [
  // Original ATS Templates
  {
    name: "ATS Classic Standard",
    key: "ats_classic_standard",
    layout: { headerStyle: "classic", sectionsOrder: ["personal", "summary", "experience", "education", "skills"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Classic Professional",
    key: "ats_classic_professional",
    layout: { headerStyle: "professional", sectionsOrder: ["personal", "summary", "experience", "education", "skills"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Modern Clean",
    key: "ats_modern_clean",
    layout: { headerStyle: "modern", sectionsOrder: ["personal", "summary", "experience", "education", "skills"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Modern Executive",
    key: "ats_modern_executive",
    layout: { headerStyle: "executive", sectionsOrder: ["personal", "summary", "experience", "education", "skills"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Two-Column Standard",
    key: "ats_two_column_standard",
    layout: { headerStyle: "two-column", sectionsOrder: ["personal", "summary", "experience", "education", "skills"], columns: 2, sidebarSections: ["personal", "skills"], mainSections: ["summary", "experience", "education"] },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Two-Column Professional",
    key: "ats_two_column_professional",
    layout: { headerStyle: "two-column", sectionsOrder: ["personal", "summary", "experience", "education", "skills"], columns: 2, sidebarSections: ["personal", "skills"], mainSections: ["summary", "experience", "education"] },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Tech Engineer",
    key: "ats_tech_engineer",
    layout: { headerStyle: "tech", sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Finance Analyst",
    key: "ats_finance_analyst",
    layout: { headerStyle: "finance", sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Healthcare Professional",
    key: "ats_healthcare_professional",
    layout: { headerStyle: "healthcare", sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Marketing Specialist",
    key: "ats_marketing_specialist",
    layout: { headerStyle: "marketing", sectionsOrder: ["personal", "summary", "experience", "education", "skills", "achievements"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Entry Level Standard",
    key: "ats_entry_level_standard",
    layout: { headerStyle: "entry-level", sectionsOrder: ["personal", "summary", "education", "skills", "achievements"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS C-Level Executive",
    key: "ats_c_level_executive",
    layout: { headerStyle: "c-level", sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"], columns: 1 },
    styles: { fontFamily: "'Times New Roman', serif", fontSize: "12pt", lineHeight: "1.6" }
  },
  {
    name: "ATS Data Scientist",
    key: "ats_data_scientist",
    layout: { headerStyle: "data-scientist", sectionsOrder: ["personal", "summary", "experience", "education", "skills", "certifications"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },
  {
    name: "ATS Creative Designer",
    key: "ats_creative_designer",
    layout: { headerStyle: "creative", sectionsOrder: ["personal", "summary", "experience", "education", "skills", "achievements"], columns: 1 },
    styles: { fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: "11pt", lineHeight: "1.4" }
  },

];

// Generate HTML for a resume template
function generateResumeHTML(template, data) {
  const { layout, styles } = template;

  const colors = {
    primary: "#000000",
    secondary: "#333333",
    accent: "#000000",
    text: "#000000",
    background: "#ffffff"
  };

  const renderHeader = () => {
    if (layout.headerStyle === "onepager-clean") {
      return `<header style="margin-bottom:1rem;border-bottom:1px solid #d1d5db;padding-bottom:1rem;text-align:center;font-family:${styles.fontFamily};"><h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1><p style="font-size:1rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle || ""}</p><div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.text};font-family:${styles.fontFamily};"><span>${data.email || "email@example.com"}</span><span>•</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>•</span><span>${data.address}</span>` : ""}</div></header>`;
    } else if (layout.headerStyle === "onepager-modern") {
      return `<header style="margin-bottom:1rem;padding:1rem;border-radius:0.5rem;background:${colors.primary};color:white;text-align:center;font-family:${styles.fontFamily};"><h1 style="font-size:1.5rem;font-weight:600;margin-bottom:0.5rem;font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1><p style="font-size:1rem;margin-bottom:0.75rem;opacity:0.9;font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle || ""}</p><div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;opacity:0.85;font-family:${styles.fontFamily};"><span>${data.email || "email@example.com"}</span><span>•</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>•</span><span>${data.address}</span>` : ""}</div></header>`;
    } else if (layout.headerStyle === "onepager-two-column") {
      return `<header style="margin-bottom:1rem;display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:center;font-family:${styles.fontFamily};"><div style="text-align:left;"><h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.25rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1><p style="font-size:1rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle || ""}</p></div><div style="text-align:right;font-size:0.875rem;color:${colors.text};font-family:${styles.fontFamily};"><div>${data.email || "email@example.com"}</div><div>${data.phone || "+1 (555) 123-4567"}</div>${data.address ? `<div>${data.address}</div>` : ""}</div></header>`;
    } else if (layout.headerStyle === "onepager-tech") {
      return `<header style="margin-bottom:1rem;padding:1rem;border-radius:0.5rem;background:linear-gradient(90deg,${colors.primary} 0%,${colors.accent} 100%);color:white;font-family:${styles.fontFamily};"><div style="display:flex;justify-content:space-between;align-items:center;"><div><h1 style="font-size:1.5rem;font-weight:600;margin-bottom:0.25rem;font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1><p style="font-size:1rem;opacity:0.9;font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle || ""}</p></div><div style="text-align:right;font-size:0.875rem;opacity:0.85;font-family:${styles.fontFamily};"><div>${data.email || "email@example.com"}</div><div>${data.phone || "+1 (555) 123-4567"}</div>${data.address ? `<div>${data.address}</div>` : ""}</div></div></header>`;
    } else if (layout.headerStyle === "onepager-sales") {
      return `<header style="margin-bottom:1rem;padding:1rem;border-left:4px solid ${colors.accent};background:#f8f9fa;font-family:${styles.fontFamily};"><div style="display:flex;justify-content:space-between;align-items:center;"><div><h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.25rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1><p style="font-size:1rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle || ""}</p></div><div style="text-align:right;font-size:0.875rem;color:${colors.text};font-family:${styles.fontFamily};"><div>${data.email || "email@example.com"}</div><div>${data.phone || "+1 (555) 123-4567"}</div>${data.address ? `<div>${data.address}</div>` : ""}</div></div></header>`;
    } else if (layout.headerStyle === "onepager-finance") {
      return `<header style="margin-bottom:1rem;padding:1rem;border:2px solid ${colors.primary};border-radius:0.25rem;text-align:center;font-family:${styles.fontFamily};"><h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1><p style="font-size:1rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle || ""}</p><div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.text};font-family:${styles.fontFamily};"><span>${data.email || "email@example.com"}</span><span>•</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>•</span><span>${data.address}</span>` : ""}</div></header>`;
    } else {
      // Default header for ATS templates
      return `<header style="margin-bottom:1rem;border-bottom:2px solid #374151;padding-bottom:1rem;text-align:center;font-family:${styles.fontFamily};"><h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;color:${colors.primary};font-family:${styles.fontFamily};line-height:1.1;">${data.name || "Your Name"}</h1><p style="font-size:1.125rem;margin-bottom:0.75rem;color:${colors.secondary};font-family:${styles.fontFamily};line-height:1.1;">${data.jobTitle || ""}</p><div style="display:flex;justify-content:center;align-items:center;gap:1rem;font-size:0.875rem;color:${colors.text};font-family:${styles.fontFamily};"><span>${data.email || "email@example.com"}</span><span>•</span><span>${data.phone || "+1 (555) 123-4567"}</span>${data.address ? `<span>•</span><span>${data.address}</span>` : ""}</div></header>`;
    }
  };

  const renderSection = (sectionName) => {
    switch (sectionName) {
      case "personal":
        return "";
      case "summary":
        return `<section style="margin-bottom:1.5rem;"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:2px solid ${colors.accent};padding-bottom:0.25rem;">Professional Summary</h2><p style="font-size:${styles.fontSize};line-height:${styles.lineHeight};color:${colors.text};font-family:${styles.fontFamily};margin:0;">${data.summary}</p></section>`;
      case "experience":
        return `<section style="margin-bottom:1.5rem;"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:2px solid ${colors.accent};padding-bottom:0.25rem;">Professional Experience</h2>${data.experience.map(exp => `<div style="margin-bottom:1rem;"><h3 style="font-size:1.125rem;font-weight:600;margin-bottom:0.25rem;color:${colors.primary};font-family:${styles.fontFamily};">${exp.title}</h3><p style="font-size:1rem;font-weight:500;margin-bottom:0.25rem;color:${colors.secondary};font-family:${styles.fontFamily};">${exp.company} | ${exp.location} | ${exp.startDate} - ${exp.endDate}</p><p style="font-size:${styles.fontSize};line-height:${styles.lineHeight};color:${colors.text};font-family:${styles.fontFamily};margin:0;">${exp.description}</p></div>`).join("")}</section>`;
      case "education":
        return `<section style="margin-bottom:1.5rem;"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:2px solid ${colors.accent};padding-bottom:0.25rem;">Education</h2>${data.education.map(edu => `<div style="margin-bottom:1rem;"><h3 style="font-size:1.125rem;font-weight:600;margin-bottom:0.25rem;color:${colors.primary};font-family:${styles.fontFamily};">${edu.degree}</h3><p style="font-size:1rem;font-weight:500;margin-bottom:0.25rem;color:${colors.secondary};font-family:${styles.fontFamily};">${edu.school} | ${edu.location} | ${edu.startDate} - ${edu.endDate}</p>${edu.gpa ? `<p style="font-size:${styles.fontSize};color:${colors.text};font-family:${styles.fontFamily};margin:0;">GPA: ${edu.gpa}</p>` : ""}</div>`).join("")}</section>`;
      case "skills":
        return `<section style="margin-bottom:1.5rem;"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:2px solid ${colors.accent};padding-bottom:0.25rem;">Technical Skills</h2><p style="font-size:${styles.fontSize};line-height:${styles.lineHeight};color:${colors.text};font-family:${styles.fontFamily};margin:0;">${data.skills.join(", ")}</p></section>`;
      case "certifications":
        return `<section style="margin-bottom:1.5rem;"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:2px solid ${colors.accent};padding-bottom:0.25rem;">Certifications</h2>${data.certifications.map(cert => `<div style="margin-bottom:0.5rem;"><h3 style="font-size:1rem;font-weight:600;margin-bottom:0.25rem;color:${colors.primary};font-family:${styles.fontFamily};">${cert.name}</h3><p style="font-size:${styles.fontSize};color:${colors.text};font-family:${styles.fontFamily};margin:0;">${cert.issuer} | ${cert.date}</p></div>`).join("")}</section>`;
      case "achievements":
        return `<section style="margin-bottom:1.5rem;"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:${colors.primary};font-family:${styles.fontFamily};border-bottom:2px solid ${colors.accent};padding-bottom:0.25rem;">Key Achievements</h2><ul style="font-size:${styles.fontSize};line-height:${styles.lineHeight};color:${colors.text};font-family:${styles.fontFamily};margin:0;padding-left:1.5rem;">${data.achievements.map(achievement => `<li style="margin-bottom:0.5rem;">${achievement}</li>`).join("")}</ul></section>`;
      default:
        return "";
    }
  };

  const renderLayout = () => {
    const header = renderHeader();

    if (layout.columns === 1) {
      const sections = layout.sectionsOrder.map(section => renderSection(section)).join("");
      return `<div style="width:100%;padding:1rem;background-color:${colors.background};font-family:${styles.fontFamily};">${header}${sections}</div>`;
    } else if (layout.columns === 2) {
      const sidebarSections = layout.sidebarSections || [];
      const mainSections = layout.mainSections || [];

      const sidebarContent = sidebarSections.map(section => renderSection(section)).join("");
      const mainContent = mainSections.map(section => renderSection(section)).join("");

      return `<div style="width:100%;padding:1rem;background-color:${colors.background};font-family:${styles.fontFamily};">${header}<div style="display:grid;grid-template-columns:30% 70%;gap:1rem;"><div style="padding:0.75rem;background:#f8f9fa;border-radius:0.375rem;">${sidebarContent}</div><div style="padding:0.75rem;">${mainContent}</div></div></div>`;
    }

    // Fallback to single column
    const sections = layout.sectionsOrder.map(section => renderSection(section)).join("");
    return `<div style="width:100%;padding:1rem;background-color:${colors.background};font-family:${styles.fontFamily};">${header}${sections}</div>`;
  };

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>html{font-size:16px;}body{width:800px;min-height:1000px;margin:0 auto;padding:0;background-color:${colors.background};color:${colors.text};font-family:${styles.fontFamily},sans-serif;box-sizing:border-box;}</style></head><body>${renderLayout()}</body></html>`;
}

async function generateAllPreviews() {
  console.log("🚀 Generating ALL Template Previews (28 templates)...\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log("🌐 Launching Puppeteer browser...");
  const page = await browser.newPage();

  // Set viewport for consistent sizing
  await page.setViewport({ width: 800, height: 1000, deviceScaleFactor: 2 });
  console.log("📱 Set viewport to 800x1000 with 2x device scale factor\n");

  let successCount = 0;
  const totalTemplates = allTemplates.length;

  for (const template of allTemplates) {
    console.log(`🔄 Generating preview for: ${template.name}...`);

    try {
      const html = generateResumeHTML(template, sampleResumeData);

      // Set content and wait for rendering
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Wait a bit for any dynamic content to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate filename
      const filename = `${template.key}.png`;
      const filepath = path.join(__dirname, '..', 'public', 'templates', 'previews', filename);

      // Take screenshot
      await page.screenshot({
        path: filepath,
        fullPage: true
      });

      console.log(`✅ Successfully generated: ${template.name}`);
      successCount++;

    } catch (error) {
      console.error(`❌ Error generating ${template.name}:`, error.message);
    }
  }

  await browser.close();
  console.log("\n🎉 Preview Generation Complete!");
  console.log(`✅ Successfully generated: ${successCount} realistic previews`);
  console.log(`📁 PNG files saved in: ${path.join(__dirname, '..', 'public', 'templates', 'previews')}`);
  console.log(`📊 Total templates processed: ${totalTemplates}`);
  console.log("🔒 Browser closed");
}

// Run the script
generateAllPreviews().catch(console.error);
