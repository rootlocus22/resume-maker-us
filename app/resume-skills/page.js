import Link from "next/link";
import { BASE_URL, BRAND_NAME } from "../lib/appConfig";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  Zap,
  HelpCircle,
  ChevronRight,
  Code,
  Heart,
  DollarSign,
  Megaphone,
  Settings,
  Star,
  Target,
  Lightbulb,
  BookOpen,
  Search,
  Shield,
  Users,
  BarChart3,
  Wrench,
} from "lucide-react";

export const metadata = {
  title: `200+ Best Skills to Put on a Resume (2026 Guide) | ${BRAND_NAME}`,
  description:
    "Discover the best hard and soft skills to include on your resume in 2026. Browse skills by industry with ATS optimization tips, examples, and expert advice.",
  alternates: {
    canonical: `${BASE_URL}/resume-skills`,
    languages: {
      'en-US': `${BASE_URL}/resume-skills`,
      'en-IN': `https://www.expertresume.us/resume-skills`,
      'x-default': `${BASE_URL}/resume-skills`,
    },
  },
  openGraph: {
    title: `200+ Best Skills to Put on a Resume (2026 Guide) | ${BRAND_NAME}`,
    description:
      "Complete guide to the best resume skills for 2026. Hard skills, soft skills, and industry-specific lists with ATS tips.",
    url: `${BASE_URL}/resume-skills`,
    type: "website",
  },
  keywords: [
    "resume skills",
    "skills to put on a resume",
    "best resume skills",
    "hard skills for resume",
    "soft skills for resume",
    "resume skills examples",
    "technical skills resume",
    "ATS resume skills",
    "skills section resume",
    "top skills for resume 2026",
  ],
};

export default function ResumeSkillsPage() {
  const faqData = [
    {
      question: "How many skills should I put on my resume?",
      answer:
        "Aim for 8-15 skills on your resume. Include a mix of hard (technical) and soft skills that are directly relevant to the job you're applying for. Quality matters more than quantity — every skill should match something in the job description or be essential for the role.",
    },
    {
      question: "Should I list soft skills on my resume?",
      answer:
        "Yes, but strategically. Instead of just listing generic soft skills like 'team player,' demonstrate them through your work experience bullet points. For example, 'Led a cross-functional team of 12 engineers through an Agile transition' shows leadership and collaboration better than listing them as standalone skills.",
    },
    {
      question: "How do I know which skills to include for a specific job?",
      answer:
        "Read the job description carefully and highlight every skill, tool, and qualification mentioned. Match your genuine skills to these requirements and use the same terminology. Use our ATS Score Checker to verify your resume includes the right keywords. Prioritize skills mentioned multiple times in the posting.",
    },
    {
      question: "Where should I place the skills section on my resume?",
      answer:
        "Place your skills section after your Professional Summary and before (or after) your Work Experience. If the role is highly technical, put skills right after the summary to catch the recruiter's eye. For senior roles where experience matters more, place skills after your work history.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Resume Skills Guide",
        item: `${BASE_URL}/resume-skills`,
      },
    ],
  };

  const industrySkills = [
    {
      name: "Technology",
      icon: <Code size={24} className="text-accent" />,
      color: "accent",
      hardSkills: [
        "Python", "JavaScript", "TypeScript", "React", "Node.js",
        "AWS / Azure / GCP", "Docker & Kubernetes", "SQL & NoSQL Databases",
        "CI/CD Pipelines", "REST & GraphQL APIs", "Git & Version Control",
        "Machine Learning / AI", "Cybersecurity Fundamentals", "Agile / Scrum",
        "System Design", "Data Structures & Algorithms", "Terraform / IaC",
        "Microservices Architecture",
      ],
      softSkills: [
        "Problem Solving", "Collaboration", "Analytical Thinking",
        "Adaptability", "Communication",
      ],
    },
    {
      name: "Healthcare",
      icon: <Heart size={24} className="text-accent" />,
      color: "accent",
      hardSkills: [
        "Patient Care & Assessment", "Electronic Health Records (EHR/EMR)",
        "HIPAA Compliance", "Medical Terminology", "Vital Signs Monitoring",
        "CPR / BLS / ACLS Certified", "Medication Administration",
        "Clinical Documentation", "Phlebotomy", "Infection Control",
        "Care Plan Development", "Lab Results Interpretation",
        "Patient Education", "Telehealth Platforms", "Medical Coding (ICD-10, CPT)",
        "Pharmacology", "Radiology Imaging",
      ],
      softSkills: [
        "Empathy", "Attention to Detail", "Crisis Management",
        "Team Collaboration", "Communication",
      ],
    },
    {
      name: "Finance",
      icon: <DollarSign size={24} className="text-accent" />,
      color: "accent",
      hardSkills: [
        "Financial Modeling & Forecasting", "Excel (Advanced: VBA, Pivot Tables)",
        "Bloomberg Terminal", "GAAP / IFRS Accounting", "Risk Assessment",
        "SQL / Data Analysis", "Python for Finance", "Budgeting & Variance Analysis",
        "Mergers & Acquisitions (M&A)", "Financial Statement Analysis",
        "Regulatory Compliance (SEC, SOX)", "Tax Preparation & Planning",
        "Auditing", "Portfolio Management", "SAP / Oracle Financials",
        "Accounts Payable / Receivable", "QuickBooks / Xero",
      ],
      softSkills: [
        "Analytical Thinking", "Integrity", "Decision Making",
        "Attention to Detail", "Communication",
      ],
    },
    {
      name: "Marketing",
      icon: <Megaphone size={24} className="text-accent" />,
      color: "accent",
      hardSkills: [
        "SEO / SEM", "Google Analytics 4 (GA4)", "Google Ads / Meta Ads",
        "Content Strategy & Copywriting", "Email Marketing (Mailchimp, Klaviyo)",
        "Social Media Management", "Marketing Automation (HubSpot, Marketo)",
        "A/B Testing & CRO", "CRM Management (Salesforce)", "Data Analysis",
        "Brand Strategy", "Video Marketing", "Influencer Marketing",
        "Public Relations", "Market Research", "WordPress / CMS Management",
        "Adobe Creative Suite",
      ],
      softSkills: [
        "Creativity", "Strategic Thinking", "Storytelling",
        "Adaptability", "Collaboration",
      ],
    },
    {
      name: "Engineering",
      icon: <Settings size={24} className="text-accent" />,
      color: "accent",
      hardSkills: [
        "AutoCAD / SolidWorks / CATIA", "MATLAB / Simulink",
        "Project Management (PMP)", "Structural Analysis", "Thermodynamics",
        "Quality Control & Six Sigma", "Lean Manufacturing",
        "FEA / CFD Simulation", "Process Optimization",
        "Technical Drawing & Blueprints", "Safety & Regulatory Compliance (OSHA)",
        "Supply Chain Management", "3D Printing / Additive Manufacturing",
        "PLC Programming", "Electrical Schematics", "Environmental Impact Assessment",
        "GIS / Geospatial Analysis",
      ],
      softSkills: [
        "Critical Thinking", "Precision", "Team Leadership",
        "Problem Solving", "Communication",
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          </li>
          <ChevronRight size={14} />
          <li className="text-primary font-medium">Resume Skills Guide</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-12 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,196,179,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
              <Star size={16} />
              <span>200+ Skills Covered</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
              Best <span className="text-accent">Skills to Put on a Resume</span> in 2026
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your skills section can make or break your resume. Learn which hard skills and soft skills to include, organized by industry, with ATS optimization tips to get past applicant tracking systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/resume-builder"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Zap size={20} />
                Build Your Resume Now
              </Link>
              <Link
                href="/ats-score-checker"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all border border-gray-200"
              >
                <Target size={20} />
                Check Your ATS Score
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hard Skills vs Soft Skills */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Hard Skills vs. Soft Skills: What&apos;s the Difference?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Both types of skills are essential on your resume, but they serve different purposes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Hard Skills */}
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 border border-primary-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Wrench size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">Hard Skills</h3>
                  <p className="text-sm text-gray-500">Technical &amp; teachable abilities</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Hard skills are specific, measurable abilities that you learn through education, training, or experience. They are often the keywords ATS systems scan for.
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-sm font-semibold text-primary">Characteristics:</p>
                <ul className="space-y-2">
                  {[
                    "Can be measured and tested",
                    "Learned through education or training",
                    "Specific to certain jobs or industries",
                    "Often listed in job requirements",
                    "ATS systems actively search for these",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-4 border border-primary-100">
                <p className="text-sm font-semibold text-primary mb-2">Examples:</p>
                <div className="flex flex-wrap gap-2">
                  {["Python", "Data Analysis", "Financial Modeling", "Adobe Photoshop", "SQL", "Project Management"].map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-50 text-primary rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Soft Skills */}
            <div className="bg-gradient-to-br from-accent-50 to-white rounded-2xl p-8 border border-accent-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                  <Users size={24} className="text-accent-700" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">Soft Skills</h3>
                  <p className="text-sm text-gray-500">Interpersonal &amp; transferable traits</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Soft skills are interpersonal qualities and work habits that determine how well you work with others. They&apos;re transferable across any job or industry.
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-sm font-semibold text-primary">Characteristics:</p>
                <ul className="space-y-2">
                  {[
                    "Harder to measure but equally valued",
                    "Developed through experience",
                    "Transferable across all industries",
                    "Best demonstrated through examples",
                    "Complement hard skills on a resume",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-4 border border-accent-100">
                <p className="text-sm font-semibold text-primary mb-2">Examples:</p>
                <div className="flex flex-wrap gap-2">
                  {["Leadership", "Communication", "Problem Solving", "Time Management", "Teamwork", "Adaptability"].map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-accent-50 text-accent-700 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Skills by Industry */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Top Resume Skills by Industry
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find the most in-demand skills for your industry. Each list includes both hard skills and essential soft skills that recruiters look for.
            </p>
          </div>

          <div className="space-y-8">
            {industrySkills.map((industry, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center">
                    {industry.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-primary">{industry.name}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                      <Wrench size={16} className="text-accent" />
                      Hard Skills ({industry.hardSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {industry.hardSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200 hover:border-accent-200 hover:bg-accent-50 transition-colors">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                      <Users size={16} className="text-accent" />
                      Essential Soft Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {industry.softSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 bg-accent-50 text-accent-700 rounded-lg text-sm border border-accent-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Identify the Right Skills */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              How to Identify the Right Skills for Your Resume
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don&apos;t guess which skills to include. Use this step-by-step process to find the perfect skill set for each application.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                icon: <Search size={24} className="text-accent" />,
                title: "Analyze the Job Description",
                description: "Read the posting carefully. Highlight every skill, tool, software, and qualification mentioned. Pay special attention to skills listed in 'Requirements' vs 'Nice to Have.'",
              },
              {
                step: "2",
                icon: <BarChart3 size={24} className="text-accent" />,
                title: "Match Your Skills",
                description: "Compare the job requirements with your actual skills. Only include skills you can confidently discuss in an interview. Use the exact terminology from the job posting.",
              },
              {
                step: "3",
                icon: <BookOpen size={24} className="text-accent" />,
                title: "Research the Industry",
                description: "Look at 3-5 similar job postings to identify common skills. Industry-standard tools and certifications should always be included if you have them.",
              },
              {
                step: "4",
                icon: <Target size={24} className="text-accent" />,
                title: "Prioritize & Organize",
                description: "Lead with your strongest and most relevant skills. Group them logically (e.g., 'Technical Skills' and 'Leadership Skills'). Keep the total to 8-15 skills.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 h-full">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to List Skills on Your Resume + ATS Tips */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              How to List Skills on Your Resume (ATS-Optimized)
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The way you format and present your skills matters just as much as which skills you choose. Follow these best practices for ATS compatibility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={20} className="text-accent" />
                  <h3 className="font-bold text-primary">Create a Dedicated Skills Section</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Label it &quot;Skills,&quot; &quot;Core Competencies,&quot; or &quot;Technical Skills.&quot; ATS systems look for these standard headings. Avoid creative names like &quot;My Toolbox&quot; or &quot;What I Bring.&quot;
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={20} className="text-accent" />
                  <h3 className="font-bold text-primary">Use a Simple List Format</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Bullet points or a comma-separated list work best for ATS. Avoid tables, columns, or graphics — they often break ATS parsing. Keep formatting clean and scannable.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={20} className="text-accent" />
                  <h3 className="font-bold text-primary">Mirror Job Description Keywords</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  If the job says &quot;Project Management,&quot; write &quot;Project Management&quot; — not &quot;PM&quot; or &quot;managing projects.&quot; ATS systems match exact phrases. Include both the acronym and full term when relevant.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={20} className="text-accent" />
                  <h3 className="font-bold text-primary">Weave Skills into Work Experience</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Don&apos;t just list skills — demonstrate them in your bullet points. &quot;Managed $1.2M budget using SAP&quot; proves both budgeting and SAP skills. This gives context and boosts ATS keyword density.
                </p>
              </div>
            </div>

            {/* Skills Section Example */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-accent" />
                Skills Section Example
              </h3>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="font-mono text-sm">
                  <p className="font-bold text-primary border-b border-gray-200 pb-2 mb-3">SKILLS</p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1">Technical Skills</p>
                      <p className="text-gray-700">Python, JavaScript, React, Node.js, PostgreSQL, MongoDB, AWS (EC2, S3, Lambda), Docker, Kubernetes, Git, CI/CD, REST APIs</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1">Tools &amp; Platforms</p>
                      <p className="text-gray-700">Jira, Confluence, GitHub, VS Code, Figma, Postman, Datadog, Terraform</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1">Leadership &amp; Methodology</p>
                      <p className="text-gray-700">Agile/Scrum, Cross-Functional Team Leadership, Code Review, Technical Mentoring, System Design</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-accent-50 rounded-xl p-4 border border-accent-100">
                <p className="text-sm font-semibold text-accent-700 mb-2 flex items-center gap-2">
                  <Shield size={16} />
                  ATS Pro Tips
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-accent mt-0.5 shrink-0" />
                    Include both &quot;JavaScript&quot; and &quot;JS&quot; — some systems search for either
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-accent mt-0.5 shrink-0" />
                    Spell out abbreviations at least once (e.g., &quot;Search Engine Optimization (SEO)&quot;)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-accent mt-0.5 shrink-0" />
                    Don&apos;t stuff keywords — only include skills you actually possess
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-accent mt-0.5 shrink-0" />
                    Repeat important skills in both the Skills section and Work Experience
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Build a Skills-Optimized Resume in Minutes
          </h2>
          <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto">
            Our AI resume builder automatically suggests the best skills for your target role and formats them for ATS compatibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/resume-builder"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Zap size={20} />
              Start Building — It&apos;s Free
            </Link>
            <Link
              href="/resume-examples"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              See Resume Examples
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Frequently Asked Questions About Resume Skills
            </h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-primary mb-3 flex items-start gap-3">
                  <HelpCircle size={22} className="text-accent shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-[34px]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">
            Explore More Resume Resources
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/resume-builder", label: "AI Resume Builder", description: "Build your resume with AI assistance" },
              { href: "/resume-templates", label: "Resume Templates", description: "Browse professional templates" },
              { href: "/resume-examples", label: "Resume Examples", description: "See real resume samples" },
              { href: "/ats-score-checker", label: "ATS Score Checker", description: "Check your resume's ATS score" },
              { href: "/resume-format", label: "Resume Format Guide", description: "Choose the right resume format" },
              { href: "/resume-objective", label: "Resume Objectives", description: "50+ objective examples" },
              { href: "/resume-summary", label: "Resume Summaries", description: "60+ summary examples" },
              { href: "/cover-letter-builder", label: "Cover Letter Builder", description: "Create matching cover letters" },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-accent-200 hover:shadow-md transition-all group"
              >
                <p className="font-semibold text-primary group-hover:text-accent transition-colors">{link.label}</p>
                <p className="text-sm text-gray-500 mt-1">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
