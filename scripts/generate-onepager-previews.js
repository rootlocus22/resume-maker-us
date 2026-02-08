const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { OnePagerTemplates } = require('../app/lib/onePagerTemplatesServer');

// Sample resume data matching the one-pager structure - Using Alexander Chan data
const sampleOnePagerData = {
  personal: {
    name: "Alexander Chan",
    jobTitle: "Senior Product Manager & UX Strategist",
    email: "alexander.chan@email.com",
    phone: "+1 (555) 987-6543",
    location: "San Francisco, CA 94105",
    linkedin: "linkedin.com/in/alexanderchan",
    portfolio: "alexanderchan.design"
  },
  summary: "Innovative product manager and UX strategist with 10+ years of experience driving digital transformation across Fortune 500 companies. Proven track record of leading cross-functional teams to deliver user-centered products that achieve 40%+ growth in user engagement and revenue. Expertise in agile methodologies, design thinking, and data-driven decision making. Led product that achieved $50M ARR milestone in Q3 2023.",
  experience: [
    {
      title: "Senior Product Manager & UX Strategist",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      startDate: "Jan 2020",
      endDate: "Present",
      description: "Led product strategy for flagship SaaS platform serving 100K+ enterprise users. Increased user engagement by 40% and revenue by 35% through data-driven optimization. Managed cross-functional team of 12 engineers, designers, and analysts. Spearheaded mobile-first redesign resulting in 60% increase in mobile adoption. Established KPIs and analytics frameworks for measuring product success."
    },
    {
      title: "Senior Product Manager",
      company: "InnovateTech Solutions",
      location: "San Francisco, CA",
      startDate: "Mar 2018",
      endDate: "Dec 2019",
      description: "Launched 3 major product features resulting in 25% revenue growth. Collaborated with engineering teams to deliver products on time and budget. Conducted user research and A/B testing to optimize conversion rates by 30%. Established KPIs and analytics frameworks for product success measurement. Worked with design teams to improve user experience and satisfaction scores."
    },
    {
      title: "Product Manager",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      startDate: "Jun 2016",
      endDate: "Feb 2018",
      description: "Developed go-to-market strategy for new product launch, achieving 10K users in first quarter. Led user experience research and usability testing with 200+ participants. Worked with design and development teams on scalable product solutions. Implemented agile methodologies to improve team velocity by 40%. Created product roadmap aligned with business objectives."
    },
    {
      title: "UX Designer & Product Analyst",
      company: "Digital Agency Pro",
      location: "San Francisco, CA",
      startDate: "Jan 2015",
      endDate: "May 2016",
      description: "Designed user interfaces for web and mobile applications serving 50K+ users. Conducted user interviews and usability testing to identify pain points and opportunities. Created wireframes and design specifications for development teams. Collaborated with stakeholders to define product requirements. Improved user satisfaction scores by 35% through iterative design improvements."
    }
  ],
  education: [
    {
      degree: "MBA in Product Management & Innovation",
      institution: "Stanford Graduate School of Business",
      location: "Stanford, CA",
      graduationDate: "2018",
      gpa: "3.8/4.0",
      description: "Concentration in Product Management and Innovation. Magna Cum Laude. Member of Product Management Club and Tech Ventures Society."
    },
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California, Berkeley",
      location: "Berkeley, CA",
      graduationDate: "2016",
      gpa: "3.7/4.0",
      description: "Dean's List, Phi Beta Kappa. Focus on Human-Computer Interaction and Software Engineering. President of Tech Innovation Club."
    }
  ],
  skills: [
    "Product Strategy", "Agile Development", "User Research", "Data Analysis", "Team Leadership", "Stakeholder Management", "Design Thinking", "A/B Testing", "Market Research", "Project Management", "UX Design", "Figma", "Jira", "SQL", "Analytics", "Scrum", "Product Marketing", "User Testing"
  ],
  projects: [
    {
      name: "Enterprise Mobile Platform Redesign",
      description: "Led complete UX overhaul of mobile platform resulting in 60% increase in user engagement and 4.8/5 star rating. Implemented design system used across 15+ products. Conducted user research with 500+ participants to validate design decisions.",
      technologies: "React Native, Figma, Analytics",
      link: "alexanderchan.design/mobile-redesign"
    },
    {
      name: "AI-Powered Recommendation Engine",
      description: "Developed machine learning algorithms that improved conversion rates by 25% and generated $8M in additional revenue. Collaborated with data science team to implement personalization features. Achieved 95% accuracy in user preference prediction.",
      technologies: "Python, TensorFlow, A/B Testing",
      link: "alexanderchan.design/ai-recommendations"
    },
    {
      name: "Cross-Platform Design System",
      description: "Created comprehensive design system used across 15+ products and applications, reducing design time by 40%. Established design tokens and component library. Trained 20+ designers and developers on implementation best practices.",
      technologies: "Design Tokens, Figma, Storybook",
      link: "alexanderchan.design/design-system"
    }
  ],
  certifications: [
    {
      name: "Certified Scrum Product Owner (CSPO)",
      issuer: "Scrum Alliance",
      organization: "Scrum Alliance",
      date: "2023"
    },
    {
      name: "Google Analytics Certified",
      issuer: "Google",
      organization: "Google",
      date: "2022"
    },
    {
      name: "Project Management Professional (PMP)",
      issuer: "PMI",
      organization: "Project Management Institute",
      date: "2021"
    },
    {
      name: "Certified User Experience Designer (CUXD)",
      issuer: "UX Design Institute",
      organization: "UX Design Institute",
      date: "2020"
    }
  ],
  languages: [
    {
      language: "English",
      proficiency: "Native"
    },
    {
      language: "Mandarin Chinese",
      proficiency: "Professional Working"
    },
    {
      language: "Spanish",
      proficiency: "Conversational"
    }
  ],
  awards: [
    {
      title: "Top 40 Under 40 Product Leaders",
      issuer: "ProductHunt",
      date: "2023",
      description: "Recognized as one of the top product leaders in the technology industry"
    },
    {
      title: "Product Excellence Award",
      issuer: "TechCorp Inc.",
      date: "2022",
      description: "Led product that achieved $50M ARR milestone and 40% growth in user engagement"
    },
    {
      title: "Innovation in Design Award",
      issuer: "UX Design Awards",
      date: "2021",
      description: "Honored for mobile-first redesign that achieved 60% increase in adoption"
    }
  ]
};

// All one-pager templates
const onePagerTemplatesList = [
  { id: 'classic', name: 'Classic Professional' },
  { id: 'modern', name: 'Modern Two-Column' },
  { id: 'compact', name: 'Compact Minimal' },
  { id: 'executive', name: 'Executive' },
  { id: 'tech', name: 'Tech-Focused' },
  { id: 'creative', name: 'Creative' },
  { id: 'timeline', name: 'Timeline Journey' },
  { id: 'grid', name: 'Modern Grid' },
  { id: 'elegant', name: 'Elegant Serif' },
  { id: 'bold', name: 'Bold Impact' },
  { id: 'magazine', name: 'Magazine Editorial' },
  { id: 'modern_tech', name: 'Modern Tech' },
  { id: 'creative_bold', name: 'Creative Bold' },
  { id: 'professional_serif', name: 'Professional Serif' },
  { id: 'graceful_elegance', name: 'Graceful Elegance' }
];

async function generateOnePagerPreviews() {
  console.log("🚀 Generating One-Pager Template Previews (11 templates)...\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log("🌐 Launching Puppeteer browser...");
  const page = await browser.newPage();

  // Set viewport for consistent sizing - one-pager style
  await page.setViewport({ width: 800, height: 1100, deviceScaleFactor: 2 });
  console.log("📱 Set viewport to 800x1100 with 2x device scale factor\n");

  let successCount = 0;
  const totalTemplates = onePagerTemplatesList.length;

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '..', 'public', 'templates', 'onepager-previews');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}\n`);
  }

  for (const template of onePagerTemplatesList) {
    console.log(`🔄 Generating preview for: ${template.name}...`);

    try {
      // Get the template function
      const templateFunction = OnePagerTemplates[template.id];

      if (!templateFunction) {
        console.log(`⚠️  Template function not found for: ${template.id}`);
        continue;
      }

      // Generate HTML using the template function
      const resumeHTML = templateFunction(sampleOnePagerData);

      // Wrap in full HTML document
      const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 800px;
      margin: 0 auto;
      padding: 0;
      background-color: #ffffff;
    }
    @page {
      size: A4;
      margin: 0;
    }
  </style>
</head>
<body>
  ${resumeHTML}
</body>
</html>
      `;

      // Set content and wait for rendering
      await page.setContent(fullHTML, { waitUntil: 'networkidle0' });

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate filename
      const filename = `${template.id}.png`;
      const filepath = path.join(outputDir, filename);

      // Take screenshot
      await page.screenshot({
        path: filepath,
        fullPage: true
      });

      console.log(`✅ Successfully generated: ${template.name} → ${filename}`);
      successCount++;

    } catch (error) {
      console.error(`❌ Error generating ${template.name}:`, error.message);
    }
  }

  await browser.close();
  console.log("\n🎉 One-Pager Preview Generation Complete!");
  console.log(`✅ Successfully generated: ${successCount}/${totalTemplates} previews`);
  console.log(`📁 PNG files saved in: ${outputDir}`);
  console.log("🔒 Browser closed");
}

// Run the script
generateOnePagerPreviews().catch(console.error);

