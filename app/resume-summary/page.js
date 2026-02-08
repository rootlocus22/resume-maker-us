import Link from "next/link";
import { BASE_URL, BRAND_NAME } from "../lib/appConfig";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  Zap,
  HelpCircle,
  ChevronRight,
  Star,
  Target,
  Code,
  Heart,
  DollarSign,
  Megaphone,
  TrendingUp,
  Users,
  Award,
  Briefcase,
  Shield,
  Lightbulb,
  BarChart3,
  GraduationCap,
  Building2,
  Wrench,
} from "lucide-react";

export const metadata = {
  title: `Professional Resume Summary Examples: 60+ for Every Job (2026) | ${BRAND_NAME}`,
  description:
    "Browse 60+ professional resume summary examples organized by experience level and industry. Learn the formula for writing a powerful summary that gets interviews in 2026.",
  alternates: {
    canonical: `${BASE_URL}/resume-summary`,
  },
  openGraph: {
    title: `Professional Resume Summary Examples: 60+ for Every Job (2026) | ${BRAND_NAME}`,
    description:
      "60+ resume summary examples by experience level and industry. Copy, customize, and land more interviews.",
    url: `${BASE_URL}/resume-summary`,
    type: "website",
  },
  keywords: [
    "resume summary",
    "resume summary examples",
    "professional summary for resume",
    "resume summary statement",
    "how to write a resume summary",
    "career summary examples",
    "resume profile",
    "executive summary resume",
    "resume summary 2026",
    "best resume summary",
  ],
};

export default function ResumeSummaryPage() {
  const faqData = [
    {
      question: "What is a professional resume summary?",
      answer:
        "A professional resume summary is a 2-4 sentence statement at the top of your resume that highlights your years of experience, key skills, and most impressive achievements. It serves as your 'elevator pitch' that convinces the recruiter to keep reading. Unlike an objective, a summary focuses on what you've already accomplished.",
    },
    {
      question: "How long should a resume summary be?",
      answer:
        "A resume summary should be 2-4 sentences or 40-80 words. It needs to be long enough to showcase your value but short enough to be read in 6-7 seconds (the average time recruiters spend on initial resume scans). Every word should earn its place — no filler phrases.",
    },
    {
      question: "Should I use a summary or objective on my resume?",
      answer:
        "Use a professional summary if you have 3+ years of relevant experience — it highlights your achievements and expertise. Use an objective if you're entry-level, a recent graduate, or changing careers. When in doubt, a well-written summary is almost always the stronger choice for experienced professionals.",
    },
    {
      question: "How do I make my resume summary ATS-friendly?",
      answer:
        "Include keywords from the job description naturally in your summary. Use the exact job title, mention key technical skills, and include industry-specific terms. Avoid graphics, special characters, or unusual formatting. The summary is prime real estate for ATS keywords because it's at the top of your resume.",
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
        name: "Resume Summary Examples",
        item: `${BASE_URL}/resume-summary`,
      },
    ],
  };

  const experienceLevelSummaries = {
    "Entry-Level (0-2 Years)": {
      icon: <GraduationCap size={22} className="text-accent" />,
      summaries: [
        "Detail-oriented Computer Science graduate with internship experience in full-stack web development using React and Node.js. Built and deployed 3 web applications during academic projects, achieving a 98% user satisfaction score in usability testing. Eager to contribute technical skills and fresh perspectives to a growing engineering team.",
        "Recent Marketing graduate with hands-on experience managing social media accounts that grew to 12K+ followers organically. Google Analytics and HubSpot certified, with strong copywriting skills developed through managing a campus publication read by 5,000+ students monthly.",
        "Motivated Accounting graduate with a 3.9 GPA and internship experience at a Big 4 firm handling audit procedures and financial reconciliations. Proficient in QuickBooks, SAP, and advanced Excel. Pursuing CPA certification while seeking a Staff Accountant role.",
        "Customer-focused Business graduate with 2 years of part-time retail management experience leading a team of 8. Increased store conversion rate by 15% through improved visual merchandising and staff training. Skilled in POS systems, inventory management, and conflict resolution.",
        "Energetic Graphic Design graduate with a portfolio featuring brand identity projects for 6 small businesses. Proficient in Adobe Creative Suite, Figma, and motion graphics. Created designs that helped clients increase social engagement by an average of 40%.",
      ],
    },
    "Mid-Level (3-7 Years)": {
      icon: <Briefcase size={22} className="text-accent" />,
      summaries: [
        "Results-driven Software Engineer with 5 years of experience building scalable microservices and APIs processing 10M+ daily requests. Led migration from monolithic architecture to Kubernetes-based microservices, reducing deployment time by 75% and infrastructure costs by 40%. Proficient in Python, Go, AWS, and distributed systems.",
        "Strategic Digital Marketing Manager with 4 years of experience driving 180% organic traffic growth for B2B SaaS companies. Managed $500K+ annual ad budgets across Google, LinkedIn, and Meta, achieving consistent 5:1 ROAS. Expert in SEO, content strategy, and marketing automation.",
        "Experienced Project Manager (PMP) with 6 years of delivering enterprise software projects on time and under budget. Successfully managed 15+ cross-functional projects with budgets up to $2M. Skilled in Agile/Scrum, stakeholder management, and risk mitigation.",
        "Data Analyst with 4 years of experience transforming raw data into actionable insights for Fortune 500 clients. Built automated reporting dashboards in Tableau that saved 20+ hours per week for executive teams. Proficient in SQL, Python, and statistical modeling.",
        "Human Resources Business Partner with 5 years of experience supporting 500+ employees across multiple locations. Reduced employee turnover by 22% through targeted engagement programs and redesigned the onboarding process, cutting ramp-up time by 30%.",
      ],
    },
    "Senior-Level (8-15 Years)": {
      icon: <Award size={22} className="text-accent" />,
      summaries: [
        "Senior Software Engineering Manager with 12 years of experience leading high-performance teams at FAANG-level companies. Grew engineering team from 5 to 35 engineers while maintaining 99.99% uptime for services handling $50M+ in daily transactions. Expert in system design, team scaling, and engineering culture.",
        "Senior Marketing Director with 10 years of experience scaling B2B SaaS companies from startup to $100M+ ARR. Built and led marketing teams of 20+, drove 300% growth in marketing-qualified leads, and established thought leadership programs generating 50K+ monthly blog visits.",
        "Senior Financial Controller with 12 years of experience managing $500M+ P&L for multinational corporations. Led successful IPO preparation, implemented ERP migration saving $3M annually, and built finance teams across 4 countries. CPA with expertise in GAAP, IFRS, and SOX compliance.",
        "Senior Operations Director with 11 years of experience optimizing supply chains and logistics for Fortune 500 retail companies. Reduced operational costs by $12M through process automation and vendor renegotiation. Managed teams of 100+ across 8 distribution centers.",
        "Senior UX Director with 10 years of experience leading design for products used by 50M+ users. Built design systems from scratch, established user research practices that increased task completion rates by 35%, and mentored 15+ designers across their careers.",
      ],
    },
    "Executive (15+ Years)": {
      icon: <Building2 size={22} className="text-accent" />,
      summaries: [
        "Visionary Chief Technology Officer with 18 years of experience driving digital transformation for enterprise organizations. Led technology strategy for a $2B division, reduced infrastructure costs by $15M through cloud migration, and built engineering teams of 200+ across 3 continents. Board-level communicator with 5 successful product launches.",
        "Strategic Chief Marketing Officer with 20 years of experience building global brands and driving revenue growth. Scaled marketing-attributed revenue from $5M to $80M at a public SaaS company. Expert in brand strategy, demand generation, and building high-performance marketing organizations.",
        "Transformational Chief Financial Officer with 17 years of experience in corporate finance, M&A, and investor relations. Led 3 successful acquisitions totaling $500M+, managed IPO raising $200M, and implemented financial controls that improved EBITDA margins by 8 points across the organization.",
        "Accomplished Chief Operating Officer with 20 years of experience scaling operations for high-growth technology companies. Grew company from 50 to 2,000+ employees while maintaining operational excellence. Expert in organizational design, process optimization, and global expansion strategy.",
        "Dynamic VP of Sales with 15 years of experience building and leading enterprise sales organizations. Grew annual recurring revenue from $10M to $150M, built sales teams of 80+ across North America and Europe, and maintained 120%+ quota attainment across the organization for 5 consecutive years.",
      ],
    },
  };

  const industrySummaries = {
    "Technology": {
      icon: <Code size={24} className="text-accent" />,
      summaries: [
        "Full-stack developer with 6 years of experience building web applications serving 2M+ users. Expert in TypeScript, React, Node.js, and PostgreSQL with strong DevOps skills (AWS, Docker, CI/CD). Passionate about clean code, test-driven development, and accessible design.",
        "Cloud Solutions Architect with 8 years of experience designing and implementing multi-cloud infrastructure for enterprise clients. AWS and Azure certified, with expertise in serverless architecture, infrastructure as code (Terraform), and security compliance. Reduced cloud spending by 35% for a $1B financial services firm.",
        "Machine Learning Engineer with 5 years of experience building and deploying production ML models processing 50M+ predictions daily. Expert in Python, TensorFlow, PyTorch, and MLOps. Published 3 peer-reviewed papers on NLP and recommendation systems.",
        "Product Manager with 7 years of experience in B2B SaaS, driving products from concept to $30M+ ARR. Led cross-functional teams of 15+ across engineering, design, and data science. Expert in agile development, customer discovery, and data-driven product strategy.",
        "Cybersecurity Analyst with 5 years of experience protecting enterprise networks and responding to security incidents. CISSP certified with expertise in threat detection, penetration testing, and SIEM management. Led incident response that prevented a potential $5M data breach.",
      ],
    },
    "Healthcare": {
      icon: <Heart size={24} className="text-accent" />,
      summaries: [
        "Registered Nurse (BSN, RN) with 8 years of experience in acute care and emergency medicine. Managed patient loads of 6-8 in a Level 1 Trauma Center with 98% patient satisfaction scores. ACLS and PALS certified with expertise in critical care, triage, and electronic health records (Epic).",
        "Healthcare Administrator with 10 years of experience managing multi-specialty clinics with 50+ providers and $25M annual revenue. Improved patient throughput by 30% through workflow optimization and EHR implementation. Expert in regulatory compliance (HIPAA, CMS) and value-based care models.",
        "Physical Therapist (DPT) with 6 years of experience in orthopedic and sports rehabilitation. Achieved 95% patient goal attainment rate through evidence-based treatment plans. Specialized in post-surgical rehabilitation, manual therapy, and injury prevention programs for collegiate athletes.",
        "Clinical Research Coordinator with 5 years of experience managing Phase II-IV clinical trials in oncology. Managed enrollment of 500+ patients across 3 multi-site studies with 100% FDA audit compliance. Expert in GCP, IRB submissions, and clinical database management.",
        "Medical Laboratory Scientist (MLS) with 7 years of experience in high-volume hospital laboratory settings processing 1,000+ specimens daily. ASCP certified with expertise in hematology, chemistry, and microbiology. Implemented quality control protocols that reduced error rates by 60%.",
      ],
    },
    "Finance": {
      icon: <DollarSign size={24} className="text-accent" />,
      summaries: [
        "Financial Analyst with 5 years of experience in corporate finance and FP&A for Fortune 500 companies. Built financial models that supported $100M+ investment decisions and improved forecasting accuracy by 25%. Expert in Excel (VBA), SQL, Power BI, and SAP.",
        "Investment Banking Associate with 4 years of experience in M&A advisory and capital markets. Executed 8 transactions totaling $3B+ in deal value. Expert in financial modeling, valuation (DCF, LBO, comps), and client relationship management.",
        "Certified Public Accountant (CPA) with 7 years of experience in public accounting, specializing in audit and tax for mid-market companies. Managed audit teams of 5+ and maintained 100% compliance across 50+ client engagements. Expert in GAAP, SOX, and tax planning strategies.",
        "Risk Manager with 6 years of experience in financial risk assessment and regulatory compliance for banking institutions. Developed risk models that identified $50M+ in potential exposure, and led Basel III implementation across the organization. FRM certified.",
        "Wealth Management Advisor (CFP) with 10 years of experience managing $200M+ in client assets. Achieved average portfolio returns of 12% annually while maintaining client retention rate above 95%. Expert in retirement planning, estate planning, and tax-efficient investment strategies.",
      ],
    },
    "Marketing": {
      icon: <Megaphone size={24} className="text-accent" />,
      summaries: [
        "Content Marketing Manager with 5 years of experience building content strategies that drive 200K+ monthly organic visitors. Created editorial calendars, managed teams of 3 writers, and developed thought leadership programs for B2B SaaS companies. Expert in SEO, content distribution, and conversion optimization.",
        "Growth Marketing Lead with 6 years of experience scaling startups from seed to Series B. Achieved 10x user growth in 18 months through product-led growth strategies, viral loops, and data-driven experimentation. Expert in A/B testing, analytics, and cross-channel attribution.",
        "Brand Strategist with 8 years of experience building and repositioning consumer brands for Fortune 1000 companies. Led a rebrand that increased brand awareness by 45% and drove $20M in incremental revenue. Expert in brand architecture, consumer insights, and creative direction.",
        "Email Marketing Specialist with 4 years of experience managing email programs generating $5M+ annual revenue. Grew subscriber lists by 300% through lead magnets and optimization, achieving 45% open rates and 8% click-through rates. Expert in Klaviyo, segmentation, and lifecycle marketing.",
        "Social Media Director with 7 years of experience building communities of 500K+ followers for DTC brands. Developed influencer partnerships generating $2M+ in attributed revenue. Expert in TikTok, Instagram, YouTube strategy, and social commerce.",
      ],
    },
    "Sales": {
      icon: <TrendingUp size={24} className="text-accent" />,
      summaries: [
        "Enterprise Account Executive with 6 years of experience closing complex SaaS deals in the $100K-$1M range. Consistently exceeded quota by 130%+ with a 3.5-month average sales cycle. Expert in consultative selling, Salesforce, and multi-stakeholder negotiations.",
        "Sales Development Representative turned Sales Manager with 5 years of experience building and leading SDR teams of 10+. Grew pipeline generation by 200% through outbound playbooks and coaching frameworks. Expert in Outreach, Gong, and data-driven sales enablement.",
        "Regional Sales Director with 9 years of experience managing $20M+ territories across B2B manufacturing. Grew territory revenue by 40% through strategic account planning and new market penetration. Led teams of 8 field reps across 5 states.",
        "SaaS Account Manager with 4 years of experience managing $3M+ book of business with 95% net revenue retention. Drove 35% expansion revenue through strategic upselling and cross-selling. Expert in customer success, renewals, and stakeholder relationship management.",
        "Business Development Manager with 7 years of experience forging strategic partnerships that generated $15M+ in new revenue. Negotiated co-marketing and channel partnerships with Fortune 500 companies. Expert in partner programs, go-to-market strategy, and relationship building.",
      ],
    },
    "Engineering": {
      icon: <Wrench size={24} className="text-accent" />,
      summaries: [
        "Mechanical Engineer (PE) with 8 years of experience in product development and manufacturing optimization for automotive systems. Led design of components that reduced production costs by 20% while improving durability by 35%. Expert in SolidWorks, FEA analysis, and Six Sigma (Green Belt).",
        "Civil Engineer with 7 years of experience managing $50M+ infrastructure projects from design through construction. Delivered 12 projects on time and under budget with zero safety incidents. PE licensed with expertise in structural design, project management, and regulatory compliance.",
        "Electrical Engineer with 6 years of experience in embedded systems design for IoT and consumer electronics. Designed PCBs and firmware for products with 500K+ units shipped. Expert in circuit design, VHDL/Verilog, and rapid prototyping.",
        "Chemical Engineer with 5 years of experience in process optimization for pharmaceutical manufacturing. Improved batch yield by 15% and reduced production costs by $2M annually through process modeling and DOE. Expert in ASPEN, FDA GMP compliance, and scale-up.",
        "Environmental Engineer with 6 years of experience in sustainability and regulatory compliance for energy companies. Led environmental impact assessments for $200M+ projects and achieved 100% regulatory compliance. Expert in water treatment, emissions modeling, and ESG reporting.",
      ],
    },
    "Education": {
      icon: <GraduationCap size={24} className="text-accent" />,
      summaries: [
        "High School Science Teacher with 8 years of experience boosting AP Biology pass rates from 62% to 89%. Developed project-based curricula that increased student engagement by 40%. National Board Certified with expertise in differentiated instruction and STEM integration.",
        "Elementary School Principal with 12 years of combined teaching and administrative experience. Led a school of 500+ students to achieve a 20% improvement in state assessment scores. Expert in school culture, teacher development, and community engagement.",
        "Instructional Designer with 6 years of experience creating e-learning programs for corporate and higher education clients. Developed 50+ courses with average completion rates of 85% and satisfaction scores of 4.7/5. Expert in Articulate, Canvas LMS, and ADDIE methodology.",
        "School Counselor (M.Ed.) with 7 years of experience supporting 400+ students across academic, career, and social-emotional domains. Implemented a college readiness program that increased college application rates by 30%. Licensed in [State] with expertise in crisis intervention and SEL.",
        "ESL Instructor with 5 years of experience teaching English to adult learners from 30+ countries. Achieved 90% student retention rates and 85% level advancement rates. TESOL certified with expertise in communicative language teaching, curriculum design, and cultural competence.",
      ],
    },
  };

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
          <li className="text-primary font-medium">Resume Summary Examples</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-12 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,196,179,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
              <Star size={16} />
              <span>60+ Professional Examples</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
              Professional <span className="text-accent">Resume Summary</span> Examples
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your resume summary is the first thing recruiters read — and often the only section that determines whether they keep reading. Browse 60+ proven examples by experience level and industry, plus the exact formula for writing your own.
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
                href="/resume-objective"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all border border-gray-200"
              >
                <Target size={20} />
                See Objective Examples Instead
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is a Resume Summary + When to Use */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
                What Is a Resume Summary?
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                A professional resume summary is a concise 2-4 sentence statement at the top of your resume that highlights your most relevant experience, key skills, and standout achievements.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Think of it as your professional elevator pitch — it tells the recruiter <strong>who you are</strong>, <strong>what you&apos;ve accomplished</strong>, and <strong>why you&apos;re the right fit</strong> in under 10 seconds.
              </p>
              <div className="bg-accent-50 rounded-xl p-5 border border-accent-100">
                <p className="font-semibold text-accent-700 text-sm mb-2">When to use a resume summary:</p>
                <ul className="space-y-2">
                  {[
                    "You have 3+ years of relevant work experience",
                    "You're staying in the same field or industry",
                    "You have quantifiable achievements to highlight",
                    "You want to immediately showcase your expertise",
                    "The job description matches your background closely",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <p className="text-xs font-semibold text-accent-700 mb-3 uppercase tracking-wide">Strong Resume Summary Example</p>
              <div className="bg-white rounded-xl p-5 border border-gray-200 font-mono text-sm text-gray-700 leading-relaxed mb-4">
                <p className="font-bold text-primary mb-2">PROFESSIONAL SUMMARY</p>
                <p>
                  Results-driven Senior Product Manager with 8+ years of experience launching B2B SaaS products used by 500K+ professionals. Led cross-functional teams of 20+ to deliver features that grew annual recurring revenue from $5M to $35M. Expert in data-driven product strategy, user research, and agile development. Recognized as &quot;Top PM&quot; at ProductCon 2025.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">Opens with years of experience + job title</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">Includes quantified achievements ($, %, numbers)</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">Lists key technical skills for ATS matching</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">Ends with a credibility booster (award/recognition)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Summary Formula */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              The Proven Resume Summary Formula
            </h2>
            <p className="text-lg text-gray-600">
              Follow this structure to write a summary that grabs attention and passes ATS scans.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold shrink-0">1</div>
                <div className="flex-1 bg-accent-50 rounded-lg p-3 border border-accent-200">
                  <p className="font-semibold text-accent-700 text-sm">Years of Experience + Job Title</p>
                  <p className="text-xs text-gray-600">&quot;Senior Software Engineer with 8+ years of experience...&quot;</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold shrink-0">2</div>
                <div className="flex-1 bg-primary-50 rounded-lg p-3 border border-primary-200">
                  <p className="font-semibold text-primary text-sm">Top 2-3 Skills or Areas of Expertise</p>
                  <p className="text-xs text-gray-600">&quot;...specializing in distributed systems, cloud architecture, and team leadership.&quot;</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold shrink-0">3</div>
                <div className="flex-1 bg-accent-50 rounded-lg p-3 border border-accent-200">
                  <p className="font-semibold text-accent-700 text-sm">Key Achievement with Numbers</p>
                  <p className="text-xs text-gray-600">&quot;Led migration that reduced latency by 60% and saved $2M annually.&quot;</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold shrink-0">4</div>
                <div className="flex-1 bg-primary-50 rounded-lg p-3 border border-primary-200">
                  <p className="font-semibold text-primary text-sm">Credibility Booster (optional)</p>
                  <p className="text-xs text-gray-600">&quot;AWS Solutions Architect certified. Speaker at KubeCon 2025.&quot;</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-sm font-semibold text-primary mb-3">Filled-In Example:</p>
              <p className="text-gray-700">
                <span className="bg-accent-50 text-accent-700 px-1 rounded">Senior Software Engineer with 8+ years of experience</span>{" "}
                <span className="bg-primary-50 text-primary px-1 rounded">specializing in distributed systems, cloud architecture (AWS), and engineering team leadership</span>.{" "}
                <span className="bg-accent-50 text-accent-700 px-1 rounded">Led a platform migration that reduced API latency by 60% and saved $2M in annual infrastructure costs</span>.{" "}
                <span className="bg-primary-50 text-primary px-1 rounded">AWS Solutions Architect certified. Invited speaker at KubeCon 2025</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Summaries by Experience Level */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Resume Summary Examples by Experience Level
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Your summary should match your career stage. Here are examples tailored to every level, from new graduates to C-suite executives.
            </p>
          </div>

          <div className="space-y-10">
            {Object.entries(experienceLevelSummaries).map(([level, data], idx) => (
              <div key={idx}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
                    {data.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-primary">{level}</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.summaries.map((summary, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-accent-200 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page CTA */}
      <section className="py-12 bg-gradient-to-r from-accent to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Let AI Write Your Resume Summary
          </h2>
          <p className="text-lg text-white/80 mb-6">
            Our AI analyzes your experience and generates a personalized summary tailored to your target role. Try it free.
          </p>
          <Link
            href="/resume-builder"
            className="inline-flex items-center justify-center gap-2 bg-white text-accent px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg"
          >
            <Zap size={20} />
            Try the AI Resume Builder
          </Link>
        </div>
      </section>

      {/* Summaries by Industry */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Resume Summary Examples by Industry
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each industry has unique terminology, metrics, and expectations. These summaries use the right language for your field.
            </p>
          </div>

          <div className="space-y-10">
            {Object.entries(industrySummaries).map(([industry, data], idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center">
                    {data.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-primary">{industry}</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.summaries.map((summary, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-accent-200 transition-colors">
                      <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips for Writing a Strong Summary */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Tips for Writing a Powerful Resume Summary
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Follow these expert tips to make your summary stand out from the competition.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 size={24} className="text-accent" />,
                title: "Quantify Everything",
                description: "Use specific numbers: revenue generated, team size managed, percentage improvements, budget handled. 'Increased sales by 45%' beats 'Improved sales performance' every time.",
              },
              {
                icon: <Target size={24} className="text-accent" />,
                title: "Tailor to Each Job",
                description: "Customize your summary for each application. Mirror the job description's language and prioritize the skills they mention most. A generic summary is a wasted opportunity.",
              },
              {
                icon: <Lightbulb size={24} className="text-accent" />,
                title: "Lead with Your Strongest Selling Point",
                description: "Put your most impressive credential first — whether it's years of experience, a major achievement, or a prestigious certification. First impressions matter.",
              },
              {
                icon: <Shield size={24} className="text-accent" />,
                title: "Skip the Buzzwords",
                description: "Avoid vague terms like 'results-oriented,' 'synergy,' or 'go-getter.' Replace them with concrete achievements and specific skills that prove your value.",
              },
              {
                icon: <FileText size={24} className="text-accent" />,
                title: "Write it Last",
                description: "Complete the rest of your resume first, then distill your best accomplishments into the summary. This ensures you're highlighting your strongest material.",
              },
              {
                icon: <Star size={24} className="text-accent" />,
                title: "Include a Credibility Booster",
                description: "End with a certification, award, publication, or notable client/company name. It adds social proof and makes your summary memorable.",
              },
            ].map((tip, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-accent-200 transition-colors">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  {tip.icon}
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATS Optimization Tips */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              ATS Optimization Tips for Your Summary
            </h2>
            <p className="text-lg text-gray-600">
              Your summary is prime real estate for ATS keywords. Here&apos;s how to optimize it.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
            <div className="space-y-5">
              {[
                {
                  title: "Include the exact job title from the posting",
                  description: "If they're hiring a 'Senior Product Designer,' use 'Senior Product Designer' in your summary — not 'UX Lead' or 'Design Expert.' ATS matches exact terms.",
                },
                {
                  title: "Add 3-5 key skills from the job description",
                  description: "Naturally weave in the most important hard skills mentioned in the posting. Place them early in your summary for maximum ATS impact.",
                },
                {
                  title: "Use both full terms and acronyms",
                  description: "Write 'Search Engine Optimization (SEO)' to cover both search variations. Some ATS systems only match one version.",
                },
                {
                  title: "Avoid headers like 'About Me' or 'Profile'",
                  description: "Use standard labels: 'Professional Summary,' 'Summary,' or 'Career Summary.' ATS systems are trained to recognize these headings.",
                },
                {
                  title: "Don't use special characters or icons",
                  description: "Stick to plain text. Stars (★), bullets (●), and other symbols can cause parsing errors in many ATS platforms.",
                },
                {
                  title: "Keep it in paragraph form",
                  description: "Write your summary as flowing sentences, not bullet points. ATS systems parse paragraph text more reliably, and it reads better to human reviewers too.",
                },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1">{tip.title}</h3>
                    <p className="text-gray-600 text-sm">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-4">Want to check if your summary is ATS-optimized?</p>
              <Link
                href="/ats-score-checker"
                className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-600 transition-colors"
              >
                Run a free ATS score check <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Write a Winning Resume Summary?
          </h2>
          <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto">
            Use our AI-powered resume builder to generate a tailored summary, format your resume, and check your ATS score — all for free.
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
              href="/resume-templates"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Browse Resume Templates
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Frequently Asked Questions About Resume Summaries
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
              { href: "/resume-format", label: "Resume Format Guide", description: "Choose the right format" },
              { href: "/resume-skills", label: "Resume Skills Guide", description: "200+ skills by industry" },
              { href: "/resume-objective", label: "Resume Objectives", description: "50+ objective examples" },
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
