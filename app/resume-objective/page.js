import Link from "next/link";
import { BASE_URL, BRAND_NAME } from "../lib/appConfig";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle,
  Zap,
  HelpCircle,
  ChevronRight,
  Star,
  Target,
  GraduationCap,
  Shuffle,
  Code,
  Heart,
  DollarSign,
  Megaphone,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Users,
} from "lucide-react";

export const metadata = {
  title: `Resume Objective Examples: 50+ Samples for Every Job (2026) | ${BRAND_NAME}`,
  description:
    "Browse 50+ resume objective examples for every career situation. Perfect for entry-level candidates, students, and career changers. Copy, customize, and land more interviews.",
  alternates: {
    canonical: `${BASE_URL}/resume-objective`,
  },
  openGraph: {
    title: `Resume Objective Examples: 50+ Samples for Every Job (2026) | ${BRAND_NAME}`,
    description:
      "50+ resume objective examples organized by industry and career stage. Copy, customize, and get hired faster.",
    url: `${BASE_URL}/resume-objective`,
    type: "website",
  },
  keywords: [
    "resume objective",
    "resume objective examples",
    "career objective for resume",
    "resume objective for freshers",
    "entry level resume objective",
    "career change resume objective",
    "professional objective for resume",
    "resume objective statement",
    "good resume objectives",
    "resume objective 2026",
  ],
};

export default function ResumeObjectivePage() {
  const faqData = [
    {
      question: "What is a resume objective?",
      answer:
        "A resume objective is a 1-3 sentence statement at the top of your resume that explains who you are, what role you're targeting, and what value you bring. It's most useful for entry-level candidates, career changers, or anyone who needs to quickly explain their candidacy to the recruiter.",
    },
    {
      question: "Should I use an objective or summary on my resume?",
      answer:
        "Use an objective if you're entry-level, a recent graduate, or changing careers — situations where your work history doesn't obviously align with the target role. Use a professional summary if you have 3+ years of relevant experience, as it highlights your achievements and expertise more effectively.",
    },
    {
      question: "How long should a resume objective be?",
      answer:
        "A resume objective should be 1-3 sentences (30-50 words). Keep it concise and specific. Avoid vague statements and focus on the exact role, your key skills, and the value you offer the employer. Every word should earn its place.",
    },
    {
      question: "Are resume objectives outdated?",
      answer:
        "Generic objectives like 'Seeking a challenging position...' are outdated. However, targeted, specific objectives that name the company, role, and your relevant skills are still effective — especially for candidates without extensive experience. The key is personalization and specificity.",
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
        name: "Resume Objective Examples",
        item: `${BASE_URL}/resume-objective`,
      },
    ],
  };

  const entryLevelObjectives = [
    "Recent Computer Science graduate from UCLA with strong foundations in Python, Java, and SQL. Seeking a Junior Software Developer role at [Company] to apply full-stack development skills and contribute to scalable web applications.",
    "Detail-oriented Marketing graduate with hands-on internship experience in social media management and content creation. Eager to join [Company] as a Marketing Coordinator to drive engagement and brand awareness.",
    "Motivated Business Administration student with a 3.8 GPA and leadership experience as Student Government VP. Seeking an entry-level Business Analyst position to leverage analytical and communication skills.",
    "Aspiring Data Analyst with academic training in statistics, R, and Tableau. Completed a capstone project analyzing 100K+ customer records. Looking to contribute data-driven insights at [Company].",
    "Recent Nursing graduate (BSN) with 600+ clinical hours across ER and ICU rotations. Seeking a Registered Nurse position at [Hospital] to deliver compassionate, evidence-based patient care.",
    "Enthusiastic Graphic Design graduate skilled in Adobe Creative Suite, Figma, and brand identity development. Seeking a Junior Designer role to create compelling visual communications for [Company].",
    "Customer-focused Hospitality Management graduate with 2 years of part-time hotel front desk experience. Seeking a Guest Relations role at [Hotel] to deliver exceptional guest experiences.",
    "Recent Finance graduate with CFA Level I passed and internship experience at a regional investment firm. Seeking a Financial Analyst role to apply valuation and modeling skills at [Company].",
    "Energetic Communications graduate with a portfolio of published articles and podcast production experience. Seeking a Content Coordinator role to create engaging content strategies at [Company].",
    "Driven Mechanical Engineering graduate with hands-on experience in CAD modeling and 3D printing prototypes. Seeking an entry-level engineering role at [Company] to contribute to product development.",
  ];

  const careerChangerObjectives = [
    "Former high school teacher with 8 years of experience in curriculum design and student engagement transitioning to Instructional Design. Skilled in creating training materials, LMS administration, and performance assessment.",
    "Experienced retail manager with 6 years of team leadership and P&L management seeking a transition to Human Resources. Bringing strong interpersonal skills, conflict resolution expertise, and a SHRM-CP certification in progress.",
    "Military veteran (US Army, 10 years) with extensive logistics and operations experience transitioning to Supply Chain Management. Expert in resource allocation, team coordination, and high-pressure decision making.",
    "Professional chef with 12 years in fast-paced kitchen environments seeking a transition to Food Science & Quality Assurance. Bringing deep knowledge of food safety, recipe development, and vendor management.",
    "Seasoned journalist with 7 years of research, writing, and deadline-driven work seeking a transition to Content Marketing. Skilled in storytelling, SEO writing, and audience analysis with a portfolio of 500+ published pieces.",
    "Accomplished sales professional with $3M+ annual quota achievement seeking a career change to Customer Success Management. Passionate about building long-term client relationships and driving product adoption.",
    "Licensed physical therapist with 5 years of clinical experience transitioning to Health Tech product management. Combining clinical insights with UX research skills to build patient-centered digital health solutions.",
    "Former paralegal with 6 years in corporate law transitioning to Compliance & Risk Management. Skilled in regulatory research, contract analysis, and stakeholder communication. Currently pursuing CRCM certification.",
    "Experienced graphic designer transitioning to UX/UI Design after completing Google UX Design Certificate. Bringing 8 years of visual design expertise, user empathy, and cross-functional collaboration skills.",
    "Professional musician and music educator with 10 years of performance and teaching experience seeking a role in Audio Engineering. Skilled in Pro Tools, Logic Pro, and live sound production.",
  ];

  const industryObjectives = {
    "Technology": [
      "Results-driven computer science graduate with expertise in React, Node.js, and AWS. Seeking a Software Engineer position at [Company] to build high-performance web applications and contribute to agile development teams.",
      "Aspiring cybersecurity professional with CompTIA Security+ certification and hands-on experience in penetration testing. Seeking a Security Analyst role to help protect [Company]'s digital infrastructure.",
      "Recent Data Science bootcamp graduate with strong skills in Python, TensorFlow, and data visualization. Seeking a Junior Data Scientist role to turn complex datasets into actionable business intelligence.",
      "Passionate about accessible technology, seeking a QA Engineer role at [Company]. Bringing strong attention to detail, test automation skills (Selenium, Cypress), and a commitment to quality user experiences.",
      "Full-stack developer with a portfolio of 5 deployed applications and expertise in TypeScript, PostgreSQL, and Docker. Seeking a developer role to build scalable solutions for [Company]'s growing user base.",
    ],
    "Healthcare": [
      "Compassionate Certified Nursing Assistant with 500+ hours of clinical experience in long-term care. Seeking a CNA position at [Facility] to provide dignified, patient-centered care to residents.",
      "Pre-med student with EMT certification and volunteer experience at community health clinics. Seeking a Medical Assistant role to support patient care while preparing for medical school.",
      "Licensed Pharmacy Technician (CPhT) with 1 year of retail pharmacy experience. Seeking a hospital pharmacy position at [Hospital] to expand clinical knowledge in acute care medication management.",
      "Health Information Management graduate with RHIT certification. Seeking a Health Data Analyst role to improve clinical outcomes through data-driven EHR optimization at [Organization].",
      "Bilingual (English/Spanish) public health graduate seeking a Community Health Worker role to reduce health disparities in underserved populations through education and outreach programs.",
    ],
    "Finance": [
      "Recent Economics graduate with strong analytical skills and advanced Excel proficiency. Seeking a Financial Analyst position at [Company] to support budgeting, forecasting, and data-driven decision making.",
      "Detail-oriented accounting graduate with internship experience in audit and tax preparation. Pursuing CPA certification while seeking a Staff Accountant role at [Firm] to build a career in public accounting.",
      "Quantitative finance enthusiast with Python programming and statistical modeling skills. Seeking a Risk Analyst role at [Bank] to contribute to portfolio risk assessment and regulatory compliance.",
      "Business graduate with a concentration in corporate finance and experience in financial modeling competitions. Seeking an Investment Banking Analyst role to support M&A advisory and capital markets transactions.",
      "Personal finance advocate and recent Finance graduate seeking a Financial Advisor role to help clients achieve long-term wealth goals through personalized financial planning at [Company].",
    ],
    "Marketing": [
      "Creative and data-driven marketing graduate with internship experience in social media and email campaigns. Seeking a Digital Marketing Coordinator role at [Company] to grow brand awareness and engagement.",
      "Content creator with 10K+ social media following and expertise in short-form video production. Seeking a Social Media Manager role to develop viral content strategies for [Company]'s brand.",
      "SEO-focused marketing professional with Google Analytics certification and keyword research experience. Seeking a Content Marketing Specialist role to drive organic traffic growth at [Company].",
      "Recent Communications graduate with PR internship experience at a top-50 agency. Seeking a Public Relations Coordinator role to manage media relations and brand storytelling for [Company].",
      "Enthusiastic marketing graduate with a concentration in consumer behavior and market research. Seeking a Market Research Analyst role to uncover actionable insights that drive product strategy at [Company].",
    ],
    "Education": [
      "Passionate early childhood educator with state teaching certification and 2 years of student teaching experience. Seeking a Kindergarten Teacher position at [School] to nurture young learners' growth.",
      "Experienced tutor with 3 years of one-on-one instruction in math and science. Seeking a Middle School Math Teacher role to make STEM education engaging and accessible for all students.",
      "Education Technology enthusiast with an M.Ed. in Instructional Design. Seeking a role as an EdTech Coordinator to integrate digital tools that improve learning outcomes at [School District].",
      "Bilingual educator (English/Mandarin) with experience teaching ESL students. Seeking an ESL Teacher position at [School] to help non-native speakers develop English fluency and academic confidence.",
      "Special education advocate with a degree in Psychology and volunteer experience at inclusive learning centers. Seeking a Special Education Aide role to support individualized learning plans at [School].",
    ],
  };

  const mistakes = [
    {
      bad: "Seeking a challenging position where I can use my skills and grow professionally.",
      why: "Too vague. Doesn't mention the role, company, or specific skills. Could apply to any job.",
      good: "Recent CS graduate with Python and React expertise seeking a Junior Developer role at Stripe to build payment infrastructure used by millions of businesses.",
    },
    {
      bad: "Looking for a job in marketing.",
      why: "No specificity, no value proposition. Tells the employer nothing about what you bring.",
      good: "Data-driven marketing graduate with Google Analytics certification and 15K+ social media following seeking a Digital Marketing Coordinator role at HubSpot.",
    },
    {
      bad: "Hardworking and dedicated professional seeking a position that offers good salary and benefits.",
      why: "Focuses on what YOU want, not what you offer. Employers want to know your value.",
      good: "Operations professional with 5 years of experience in process optimization and $2M+ in cost savings seeking a Supply Chain Manager role at Amazon.",
    },
    {
      bad: "To obtain a position at your company.",
      why: "Doesn't even name the company or role. Shows zero research or effort.",
      good: "Certified Financial Planner with expertise in retirement planning seeking a Senior Financial Advisor role at Vanguard to help clients achieve long-term financial security.",
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
          <li className="text-primary font-medium">Resume Objective Examples</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-12 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,196,179,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
              <Target size={16} />
              <span>50+ Ready-to-Use Examples</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
              <span className="text-accent">Resume Objective</span> Examples for Every Job
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A strong resume objective tells employers exactly who you are and why you&apos;re the right fit — in just 1-3 sentences. Browse 50+ examples for entry-level candidates, career changers, and every major industry.
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
                href="/resume-summary"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all border border-gray-200"
              >
                <FileText size={20} />
                See Summary Examples Instead
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Objective vs Summary */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Resume Objective vs. Professional Summary
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Not sure which to use? Here&apos;s the key difference and when each works best.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-accent-50 to-white rounded-2xl p-8 border border-accent-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                  <Target size={24} className="text-accent-700" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">Resume Objective</h3>
                  <p className="text-sm text-gray-500">Focus: Your goals + what you offer</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                A forward-looking statement that tells the employer what role you&apos;re targeting and what skills or education you bring to the table.
              </p>
              <div className="mb-4">
                <p className="text-sm font-semibold text-primary mb-2">Best for:</p>
                <ul className="space-y-2">
                  {[
                    "Entry-level candidates",
                    "Recent graduates",
                    "Career changers",
                    "Returning to work after a long gap",
                    "First-time job seekers",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-4 border border-accent-100">
                <p className="text-xs font-semibold text-accent-700 mb-1">Example:</p>
                <p className="text-sm text-gray-700 italic">
                  &quot;Recent Marketing graduate with internship experience in social media management seeking a Digital Marketing Coordinator role at HubSpot to drive brand engagement and content strategy.&quot;
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 border border-primary-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Star size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">Professional Summary</h3>
                  <p className="text-sm text-gray-500">Focus: Your achievements + expertise</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                A backward-looking statement that highlights your years of experience, key achievements, and core expertise to prove you&apos;re qualified.
              </p>
              <div className="mb-4">
                <p className="text-sm font-semibold text-primary mb-2">Best for:</p>
                <ul className="space-y-2">
                  {[
                    "Professionals with 3+ years of experience",
                    "Those staying in the same field",
                    "Senior-level candidates",
                    "Anyone with strong, relevant achievements",
                    "Industry experts with specialized skills",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-4 border border-primary-100">
                <p className="text-xs font-semibold text-primary-400 mb-1">Example:</p>
                <p className="text-sm text-gray-700 italic">
                  &quot;Results-driven Marketing Manager with 8+ years of experience in digital campaigns, growing organic traffic by 200% and managing $3M+ ad budgets for Fortune 500 clients.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Objective Formula */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              The Perfect Resume Objective Formula
            </h2>
            <p className="text-lg text-gray-600">
              Use this proven structure to write an objective that gets results.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
            <div className="flex flex-wrap items-center justify-center gap-3 text-lg mb-8">
              <span className="px-4 py-2 bg-accent-50 text-accent-700 rounded-lg font-semibold border border-accent-200">[Your Title/Education]</span>
              <span className="text-gray-400">+</span>
              <span className="px-4 py-2 bg-primary-50 text-primary rounded-lg font-semibold border border-primary-200">[Key Skills/Qualifications]</span>
              <span className="text-gray-400">+</span>
              <span className="px-4 py-2 bg-accent-50 text-accent-700 rounded-lg font-semibold border border-accent-200">[Target Role at Company]</span>
              <span className="text-gray-400">+</span>
              <span className="px-4 py-2 bg-primary-50 text-primary rounded-lg font-semibold border border-primary-200">[Value You Offer]</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-sm font-semibold text-primary mb-3">Filled-In Example:</p>
              <p className="text-gray-700 text-lg">
                <span className="bg-accent-50 text-accent-700 px-1 rounded">Recent Computer Science graduate</span> with{" "}
                <span className="bg-primary-50 text-primary px-1 rounded">expertise in React, Node.js, and PostgreSQL</span> seeking a{" "}
                <span className="bg-accent-50 text-accent-700 px-1 rounded">Junior Full-Stack Developer role at Stripe</span> to{" "}
                <span className="bg-primary-50 text-primary px-1 rounded">build scalable payment solutions used by millions of businesses worldwide</span>.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <Lightbulb size={24} className="text-accent mx-auto mb-3" />
              <p className="font-semibold text-primary text-sm mb-1">Be Specific</p>
              <p className="text-gray-500 text-xs">Name the exact role and company. Generic objectives get ignored.</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <Target size={24} className="text-accent mx-auto mb-3" />
              <p className="font-semibold text-primary text-sm mb-1">Show Value</p>
              <p className="text-gray-500 text-xs">Focus on what you offer the employer, not what you want.</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <Zap size={24} className="text-accent mx-auto mb-3" />
              <p className="font-semibold text-primary text-sm mb-1">Keep it Short</p>
              <p className="text-gray-500 text-xs">1-3 sentences max. Recruiters spend 6-7 seconds per resume.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Entry-Level / Student Objectives */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center">
              <GraduationCap size={24} className="text-accent" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">Entry-Level &amp; Student Objectives</h2>
              <p className="text-gray-500">Perfect for recent graduates, interns, and first-time job seekers</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {entryLevelObjectives.map((objective, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-accent-200 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed">{objective}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Changer Objectives */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Shuffle size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">Career Changer Objectives</h2>
              <p className="text-gray-500">For professionals transitioning to a new field or industry</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {careerChangerObjectives.map((objective, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 hover:border-accent-200 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed">{objective}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* By Industry Objectives */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Resume Objectives by Industry
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Industry-specific objectives that use the right terminology and highlight what hiring managers in each field look for.
            </p>
          </div>

          {Object.entries(industryObjectives).map(([industry, objectives], idx) => {
            const icons = {
              "Technology": <Code size={24} className="text-accent" />,
              "Healthcare": <Heart size={24} className="text-accent" />,
              "Finance": <DollarSign size={24} className="text-accent" />,
              "Marketing": <Megaphone size={24} className="text-accent" />,
              "Education": <BookOpen size={24} className="text-accent" />,
            };

            return (
              <div key={idx} className="mb-10 last:mb-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
                    {icons[industry]}
                  </div>
                  <h3 className="text-xl font-bold text-primary">{industry}</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {objectives.map((objective, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-accent-200 transition-colors">
                      <p className="text-gray-700 text-sm leading-relaxed">{objective}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mid-page CTA */}
      <section className="py-12 bg-gradient-to-r from-accent to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Let AI Write Your Resume Objective
          </h2>
          <p className="text-lg text-white/80 mb-6">
            Our AI resume builder generates personalized objectives based on your experience and target role.
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

      {/* Common Mistakes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Common Resume Objective Mistakes to Avoid
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These common errors can make your objective work against you. See what&apos;s wrong and how to fix it.
            </p>
          </div>

          <div className="space-y-6">
            {mistakes.map((mistake, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle size={20} className="text-red-500" />
                      <p className="font-semibold text-red-600 text-sm uppercase tracking-wide">Bad Objective</p>
                    </div>
                    <p className="text-gray-700 bg-red-50 rounded-lg p-4 border border-red-100 text-sm italic mb-3">
                      &quot;{mistake.bad}&quot;
                    </p>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-500">{mistake.why}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={20} className="text-accent" />
                      <p className="font-semibold text-accent-600 text-sm uppercase tracking-wide">Better Version</p>
                    </div>
                    <p className="text-gray-700 bg-accent-50 rounded-lg p-4 border border-accent-100 text-sm italic">
                      &quot;{mistake.good}&quot;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Write a Winning Resume Objective?
          </h2>
          <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto">
            Use our AI-powered resume builder to generate a tailored objective, format your resume, and check your ATS score — all in one place.
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
              href="/ats-score-checker"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Check Your ATS Score
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Frequently Asked Questions About Resume Objectives
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
