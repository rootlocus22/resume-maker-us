const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase
const SERVICE_ACCOUNT_KEY = process.env.FIREBASE_PRIVATE_KEY
    ? {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
    : null;

if (!SERVICE_ACCOUNT_KEY) {
    console.error("❌ Fatal: Missing Firebase credentials");
    process.exit(1);
}

if (getApps().length === 0) {
    initializeApp({ credential: cert(SERVICE_ACCOUNT_KEY) });
}

const db = getFirestore();

// --- 1. COMBINATORIAL INPUTS ---
const LEVELS = ["Entry-Level", "Junior", "Senior", "Lead", "Principal"];
const INDUSTRIES = [
    "Tech", "Healthcare", "Finance", "Education", "Retail",
    "Construction", "Marketing", "Legal", "Hospitality", "Manufacturing"
];
const ROLES = [
    "Software Engineer", "Product Manager", "Data Analyst", "Project Manager",
    "Accountant", "Nurse", "Graphic Designer", "Sales Representative",
    "Customer Service Specialist", "Operations Manager", "HR Generalist",
    "Civil Engineer", "Marketing Manager", "Business Analyst", "Web Developer",
    "Content Writer", "Teacher", "Administrative Assistant", "Recruiter",
    "Electrician", "Plumber", "Executive Assistant", "Financial Analyst",
    "Social Media Manager", "UX Designer", "Network Engineer", "Systems Administrator",
    "Data Scientist", "Mechanical Engineer", "Electrical Engineer", "Architect",
    "Real Estate Agent", "Chef", "Pharmacy Technician", "Medical Assistant",
    "Truck Driver", "Warehouse Associate", "Security Officer", "Event Planner",
    "Legal Assistant", "Paralegal", "Office Manager"
];

// --- 2. ENHANCED CONTENT GENERATORS ---

function getSalaryRange(level, industry) {
    let baseMin = 40;
    let baseMax = 70;

    // Level Multiplier
    if (level === "Junior") { baseMin += 10; baseMax += 15; }
    else if (level === "Senior") { baseMin += 40; baseMax += 60; }
    else if (level === "Lead") { baseMin += 60; baseMax += 90; }
    else if (level === "Principal") { baseMin += 100; baseMax += 150; }

    // Industry Multiplier
    if (industry === "Tech" || industry === "Finance") { baseMin *= 1.4; baseMax *= 1.5; }
    else if (industry === "Healthcare" || industry === "Legal") { baseMin *= 1.2; baseMax *= 1.3; }

    return `$${Math.floor(baseMin)}k - $${Math.floor(baseMax)}k`;
}

// ENHANCED: Much more detailed day-in-life
function getDayInLife(level, industry, role) {
    const timeBlocks = {
        "Entry-Level": {
            morning: `Begin your day at 9 AM by checking emails and reviewing yesterday's completed tasks. As an ${level} ${role}, you'll spend the first hour in daily stand-up meetings where your team coordinates priorities. In ${industry}, attention to detail from the start sets the tone for success.`,
            midday: `From 10 AM to 1 PM, you'll focus on core execution work - whether that's data entry, customer interactions, or supporting senior team members on ongoing projects. This is prime learning time where you absorb industry best practices and ${industry}-specific methodologies.`,
            afternoon: `Post-lunch (1-5 PM) involves collaborative sessions with peers, attending training workshops, and working on assigned project components. You'll use ${industry} industry-standard tools and regularly check in with your supervisor for feedback and guidance.`,
            evening: `End your day by documenting progress, updating task trackers, and preparing tomorrow's to-do list. ${industry} professionals at your level typically work 40-45 hour weeks, with occasional overtime during peak seasons.`
        },
        "Senior": {
            morning: `Arrive early (8:30 AM) to review your team's sprint board or operational dashboard. As a ${level} ${role}, you lead the daily stand-up at 9 AM, addressing blockers, resource allocation, and setting priorities for the ${industry} department.`,
            midday: `10 AM-1 PM is deep work time: architectural design sessions for Tech, patient care protocols for Healthcare, or strategic planning for ${industry}. You mentor 2-3 junior team members, conduct code/work reviews, and make critical decisions that impact project timelines.`,
            afternoon: `Afternoons (2-5 PM) involve stakeholder meetings, cross-departmental collaboration, and incident management. In ${industry}, you're the go-to expert for complex problem-solving and you approve major deliverables before they go to clients or production.`,
            evening: `You typically stay until 6-7 PM, preparing reports for leadership, reviewing next quarter's roadmap, and ensuring your team has what they need. Work-life balance improves at this level, though ${industry} may have occasional on-call duties.`
        }
    };

    const blocks = level === "Entry-Level" || level === "Junior" ? timeBlocks["Entry-Level"] : timeBlocks["Senior"];

    return `## A Day in the Life of a ${level} ${role} in ${industry}

${blocks.morning}

${blocks.midday}

${blocks.afternoon}

${blocks.evening}

**Key Success Metrics:** For ${level} ${role}s in the US ${industry} sector, success is measured by output quality, stakeholder satisfaction, and continuous upskilling.`;
}

// ENHANCED: Multiple detailed interview questions
function getInterviewQuestions(level, industry, role) {
    const questions = [
        {
            question: `Tell me about a time you handled a challenging situation as a ${role}.`,
            answer: `Use the STAR method: Situation (context in ${industry}), Task (your responsibility), Action (specific steps you took), Result (quantified outcome, e.g., '15% cost reduction' or 'resolved in 24 hours'). For ${level} roles, emphasize ownership and collaboration.`,
            difficulty: "Medium",
            category: "Behavioral"
        },
        {
            question: `What are your salary expectations for a ${level} ${role} in ${industry}?`,
            answer: `Based on industry benchmarks, ${level} ${role}s in the US ${industry} sector typically earn ${getSalaryRange(level, industry)}. I'm looking for a package in this range, but I'm flexible based on total compensation including benefits, PTO, and growth opportunities.`,
            difficulty: "Medium",
            category: "Compensation"
        }
    ];

    // Industry-specific technical questions
    if (industry === "Tech") {
        questions.push({
            question: `How do you stay updated with new technologies and best practices?`,
            answer: `I regularly read tech blogs (HackerNews, Dev.to), contribute to Open Source, attend conferences (React Conf, AWS re:Invent), and complete certifications on platforms like Coursera or Udemy. For ${role} specifically, I follow thought leaders on Twitter/LinkedIn and participate in local meetups.`,
            difficulty: "Easy",
            category: "Professional Development"
        });
        questions.push({
            question: level === "Senior" || level === "Lead" ? `Describe your approach to system design for a ${role} project.` : `How do you debug a complex issue in production?`,
            answer: level === "Senior" || level === "Lead" ? `I start with requirements gathering, define scalability needs, choose appropriate architecture patterns (microservices vs monolith), select tech stack based on team expertise and project constraints, design data models, and plan for monitoring/observability from day one.` : `I follow a systematic approach: reproduce the issue locally, check logs and error messages, isolate the component causing the failure, use debugging tools (Chrome DevTools, debugger statements), verify the fix in staging, and document the root cause for the team's knowledge base.`,
            difficulty: "Hard",
            category: "Technical"
        });
    } else if (industry === "Healthcare") {
        questions.push({
            question: `How do you ensure patient confidentiality and HIPAA compliance?`,
            answer: `I strictly adhere to HIPAA regulations by encrypting all patient data, discussing cases only in private settings, using secure communication channels, and completing annual HIPAA training. I never share patient identifiers on unsecured devices and report any potential breaches immediately to our compliance officer.`,
            difficulty: "Hard",
            category: "Compliance"
        });
        questions.push({
            question: `How do you handle high-stress situations with patients or families?`,
            answer: `I remain calm, listen actively to understand their concerns, validate their emotions, communicate clearly in layman's terms, involve appropriate support staff (social workers, chaplains), and document all interactions. Empathy is critical in ${industry}.`,
            difficulty: "Medium",
            category: "Soft Skills"
        });
    } else if (industry === "Finance") {
        questions.push({
            question: `Describe a time you identified a financial discrepancy or error.`,
            answer: `I use a double-verification process for all ledgers and reconciliations. Once, I noticed a 0.3% variance in quarterly reports that led to discovering a systematic invoicing error. I documented findings, escalated to management, corrected historical data, and implemented automated checks to prevent recurrence, saving the firm over $40K annually.`,
            difficulty: "Hard",
            category: "Technical"
        });
        questions.push({
            question: `How do you stay current with changing financial regulations?`,
            answer: `I subscribe to industry publications (WSJ, Bloomberg), attend webinars hosted by regulatory bodies (SEC, FINRA), participate in professional associations (CFA Institute), and work closely with our legal/compliance team to ensure all ${role} processes align with current laws.`,
            difficulty: "Medium",
            category: "Professional Development"
        });
    } else if (industry === "Marketing") {
        questions.push({
            question: `How do you measure ROI for marketing campaigns as a ${role}?`,
            answer: `I track metrics like Cost Per Acquisition (CPA), Customer Lifetime Value (CLV), conversion rates, click-through rates (CTR), and engagement metrics. I use tools like Google Analytics, HubSpot, or Salesforce to create comprehensive dashboards that show attribution and help optimize budget allocation across channels.`,
            difficulty: "Hard",
            category: "Technical"
        });
        questions.push({
            question: `Describe a successful campaign you managed.`,
            answer: `I led a multi-channel campaign targeting millennial consumers for a B2C product launch. We combined Instagram ads, influencer partnerships, and email nurture sequences. The campaign generated 10K leads in 30 days with a 12% conversion rate, 3x above industry average, resulting in $250K in new revenue.`,
            difficulty: "Medium",
            category: "Behavioral"
        });
    } else {
        questions.push({
            question: `How do you prioritize tasks when facing multiple deadlines in ${industry}?`,
            answer: `I use the Eisenhower Matrix to categorize tasks by urgency and importance. I communicate with stakeholders early if timelines are at risk, delegate when appropriate, and use project management tools (Asana, Trello) to track progress. In ${industry}, clear prioritization prevents burnout and ensures critical deliverables are met.`,
            difficulty: "Medium",
            category: "Time Management"
        });
    }

    // Leadership question for senior+ levels
    if (level === "Senior" || level === "Lead" || level === "Principal") {
        questions.push({
            question: `How do you mentor junior ${role}s and foster team growth?`,
            answer: `I schedule regular 1-on-1s, set clear expectations, provide constructive feedback in real-time, champion their wins publicly, and create opportunities for skill development through stretch assignments. I believe in servant leadership - my role is to unblock them and create an environment where they can excel.`,
            difficulty: "Medium",
            category: "Leadership"
        });
    }

    return questions;
}

// ENHANCED: Comprehensive FAQs
function getFAQs(level, industry, role) {
    return [
        {
            q: `What should be the ideal resume length for a ${level} ${role}?`,
            a: level === "Entry-Level" || level === "Junior"
                ? `For ${level} positions, keep your resume to 1 page. Recruiters spend an average of 6 seconds per resume, so concise is better. Focus on relevant coursework, internships, and projects.`
                : `As a ${level} ${role}, 2 pages is the industry standard in the US. Page 1 should cover your most recent and impactful roles, page 2 can include earlier career history, certifications, and detailed technical skills.`
        },
        {
            q: `Should I include a photo on my US ${industry} resume?`,
            a: `No. In the United States, including a photo is generally discouraged to avoid unconscious bias. US ${industry} recruiters prefer text-based resumes that focus on skills, experience, and accomplishments. Save headshots for LinkedIn.`
        },
        {
            q: `What's the best resume format for ${role} positions?`,
            a: `The Reverse-Chronological format is the gold standard for ${industry}. It lists your most recent experience first and is preferred by 90% of US recruiters because it's easy to scan and highlights career progression. Avoid functional formats unless you have significant employment gaps.`
        },
        {
            q: `Do I need a cover letter for ${level} ${role} applications?`,
            a: `Yes, 67% of US recruiters in ${industry} still expect a cover letter. For ${level} roles, use the cover letter to explain your motivation, highlight 2-3 key achievements relevant to the job description, and demonstrate cultural fit. Keep it to 3-4 concise paragraphs.`
        },
        {
            q: `How do I make my resume ATS-friendly for ${industry} companies?`,
            a: `Use standard section headings (Experience, Education, Skills), avoid tables/graphics/columns, save as .docx or .pdf, include keywords from the job description naturally, use simple fonts (Arial, Calibri), and avoid headers/footers. For ${role}, emphasize industry-specific skills and certifications.`
        },
        {
            q: `What are the most important sections for a ${role} resume?`,
            a: `1) Professional Summary (2-3 lines), 2) Experience (with quantified achievements), 3) Skills (both hard and soft skills relevant to ${industry}), 4) Education, 5) Certifications (if applicable). For ${level} roles, consider adding a 'Projects' or 'Publications' section to stand out.`
        },
        {
            q: `How far back should my work history go?`,
            a: level === "Entry-Level" || level === "Junior"
                ? `Include all relevant experience, even part-time jobs and internships. For ${level} candidates, showing any professional experience is valuable.`
                : `Generally, 10-15 years is sufficient. For ${level} ${role}s, focus heavily on the last 5-7 years. Older roles can be condensed into a single line: 'Earlier Career: ${role} at XYZ Corp (2005-2010)'.`
        },
        {
            q: `Should I tailor my resume for each ${industry} job application?`,
            a: `Absolutely. Generic resumes have a 10% response rate vs. 35% for tailored ones. Spend 15-20 minutes customizing your Professional Summary and bullet points to mirror the job description's language, especially for ATS systems common in ${industry}.`
        },
        {
            q: `What salary should I expect as a ${level} ${role} in the US?`,
            a: `Based on 2025-2026 data, ${level} ${role}s in the US ${industry} sector earn ${getSalaryRange(level, industry)} annually. This varies by location (SF/NYC pay 25-40% more than national average), company size, and your specific skill set. Use Glassdoor/Levels.fyi for precision.`
        },
        {
            q: `What are common mistakes on ${role} resumes?`,
            a: `Top mistakes: 1) Listing job duties instead of achievements, 2) Using passive language ('responsible for'), 3) Typos (instant rejection in ${industry}), 4) Inconsistent formatting, 5) Omitting keywords from the job description, 6) Not quantifying impact with numbers/percentages, 7) Including irrelevant hobbies instead of ${industry}-specific certifications.`
        }
    ];
}

// --- 3. MAIN GENERATOR ---

async function seedMassiveScale() {
    console.log(`🚀 Starting Enhanced Massive Scale Seed: ${LEVELS.length} Levels * ${INDUSTRIES.length} Industries * ${ROLES.length} Roles`);

    const batchSize = 400;
    let batch = db.batch();
    let operationCount = 0;
    let totalDocs = 0;

    for (const level of LEVELS) {
        for (const industry of INDUSTRIES) {
            for (const role of ROLES) {

                // Skip nonsense combinations
                if (industry === "Healthcare" && !["Nurse", "Medical Assistant", "Pharmacy Technician"].includes(role) && !role.includes("Analyst") && !role.includes("Manager")) continue;
                if (industry === "Tech" && ["Nurse", "Chef", "Driver"].includes(role)) continue;
                if (industry === "Construction" && ["Software Engineer", "Nurse"].includes(role)) continue;

                const fullTitle = `${level} ${industry} ${role}`;
                const slug = `${level}-${industry}-${role}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-resume-usa";

                const docRef = db.collection('global_roles').doc(`us_${slug}`);

                const roleData = {
                    slug: slug,
                    job_title: fullTitle,
                    country: "us",
                    avg_salary: getSalaryRange(level, industry),
                    seo_title: `${fullTitle} Resume Format (2025) - ATS-Optimized Template`,
                    meta_description: `Download the #1 ${fullTitle} resume template for the US market. Includes detailed interview prep, salary insights, and ATS-friendly formatting. Trusted by 1000+ ${industry} professionals.`,
                    keywords: [`${fullTitle.toLowerCase()} resume`, `${industry.toLowerCase()} resume templates`, `ats resume for ${role.toLowerCase()}`, `${level.toLowerCase()} ${role.toLowerCase()} resume example`],

                    hero_headline: `${fullTitle} Resume Format - ATS-Optimized for US ${industry}`,
                    summary_text: `Landing a ${fullTitle} role in the competitive US ${industry} market requires more than just listing your experience. This comprehensive guide provides ATS-optimized templates, real interview questions asked by top companies, and insider tips from ${industry} hiring managers. Whether you're targeting Fortune 500 firms or fast-growing startups, our format is tailored for ${level} candidates who want to stand out.`,

                    // BOLD TEMPLATE AS HERO IMAGE per user request
                    hero_image: "/templates/onepager-previews/bold.png",

                    template_gallery: [
                        { id: "bold", img: "/templates/onepager-previews/bold.png", name: "Bold Impact" },
                        { id: "modern", img: "/templates/onepager-previews/modern.png", name: "Modern ATS" },
                        { id: "executive", img: "/templates/onepager-previews/executive.png", name: "Executive" }
                    ],

                    day_in_life: getDayInLife(level, industry, role),

                    career_path: [
                        `${role} I (Entry Level)`,
                        `${role} II (Junior)`,
                        `Senior ${role}`,
                        `Lead ${role}`,
                        `${role} Manager / Director`
                    ],

                    interview_questions: getInterviewQuestions(level, industry, role),

                    faqs: getFAQs(level, industry, role),

                    skills_matrix: {
                        must_have: [
                            { name: industry === "Tech" ? "Problem Solving" : "Communication", importance: "Critical" },
                            { name: "Time Management", importance: "High" }
                        ],
                        technical: [
                            { name: industry === "Tech" ? "Programming/Cloud Services" : industry === "Finance" ? "Excel/Financial Software" : "Industry-Standard Tools", importance: "High" },
                            { name: "Data Analysis", importance: "Medium" }
                        ],
                        soft_skills: [
                            { name: "Teamwork", importance: "Critical" },
                            { name: "Adaptability", importance: "High" },
                            { name: "Leadership", importance: level === "Senior" || level === "Lead" ? "Critical" : "Medium" }
                        ]
                    },

                    industry_context: {
                        text: `The US ${industry} sector is experiencing ${industry === "Tech" ? "rapid growth with 8% YoY expansion" : industry === "Healthcare" ? "high demand due to aging population" : "steady growth"}. ${level} ${role}s are particularly sought after, with the Bureau of Labor Statistics projecting ${industry === "Tech" || industry === "Healthcare" ? "above-average" : "average"} job growth through 2030. Peak hiring occurs in Q1 (January-March) and Q3 (August-September).`,
                        companies: industry === "Tech" ? ["Google", "Amazon", "Microsoft", "Meta", "Startups"] :
                            industry === "Healthcare" ? ["Kaiser Permanente", "Mayo Clinic", "Cleveland Clinic", "Local Hospitals"] :
                                industry === "Finance" ? ["JP Morgan", "Goldman Sachs", "Fidelity", "FinTech Startups"] :
                                    ["Industry Leaders", "Regional Firms", "Fast-Growing Companies"]
                    },

                    common_mistakes: [
                        `Using a generic resume for all ${industry} applications instead of tailoring to each job description`,
                        `Listing job responsibilities instead of quantifiable achievements and impact metrics`,
                        `Ignoring ATS optimization by using fancy templates with graphics that get rejected by applicant tracking systems`,
                        level === "Entry-Level" ? `Focusing too much on coursework instead of highlighting internships, projects, and practical skills` : `Not demonstrating progression and increased responsibility across your ${role} career`,
                        `Omitting ${industry}-specific keywords and certifications that recruiters actively search for`
                    ],

                    ats_tips: [
                        `Use standard section headings: 'Professional Experience' not 'Where I've Worked'`,
                        `Include exact job title from the posting naturally in your resume`,
                        `Add a Skills section with ${industry}-relevant keywords from the job description`,
                        `Save as .docx or .pdf (check the application instructions)`,
                        `Avoid tables, text boxes, headers/footers, and images - these confuse ATS parsers`
                    ],

                    updated_at: new Date().toISOString(),
                    migration_source: 'massive_scale_enhanced_v2'
                };

                batch.set(docRef, roleData);
                operationCount++;
                totalDocs++;

                if (operationCount >= batchSize) {
                    await batch.commit();
                    console.log(`✅ Committed batch of ${operationCount} roles... (Total: ${totalDocs})`);
                    batch = db.batch();
                    operationCount = 0;
                }
            }
        }
    }

    if (operationCount > 0) {
        await batch.commit();
        console.log(`✅ Committed final batch of ${operationCount} roles.`);
    }

    console.log(`🎉 GRAND TOTAL: ${totalDocs} Enhanced Roles Seeded to Firestore!`);
}

seedMassiveScale();
