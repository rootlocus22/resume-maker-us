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

// --- 2. CONTENT GENERATORS ---

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

function getDayInLife(level, industry, role) {
    if (level === "Entry-Level" || level === "Junior") {
        return `As a **${level} ${role}** in the ${industry} sector, your day focuses on learning and execution. \n\n**Morning:** \nShadowing senior team members and handling routine tasks. In ${industry}, accuracy is key. \n\n**Afternoon:** \nCollaborating with the team on ongoing projects and building your core skills. \n\n**Goal:** \nBuild a strong foundation and verify standard operating procedures.`;
    } else if (level === "Senior" || level === "Lead") {
        return `As a **${level} ${role}**, you are a pillar of the ${industry} team. \n\n**Morning:** \nLeading stand-ups or briefing discussions. You set the technical or operational direction for the day. \n\n**Afternoon:** \nMentoring juniors and solving complex, escalated problems that require deep domain expertise. \n\n**Strategic Focus:** \nOptimizing workflows and ensuring compliance with US ${industry} standards.`;
    } else {
        return `As a **${level} ${role}**, you bridge the gap between strategy and execution. Your day involves high-level planning and cross-departmental coordination within the ${industry} division.`;
    }
}

function getInterviewQuestion(level, industry) {
    if (industry === "Tech") {
        return { q: "How do you handle technical debt?", a: "I balance new feature development with refactoring. I use the Boy Scout Rule: 'Leave the code better than you found it'." };
    } else if (industry === "Healthcare") {
        return { q: "How do you handle patient confidentiality (HIPAA)?", a: "I strictly adhere to HIPAA guidelines, ensuring data encryption and private environments for patient discussions." };
    } else if (industry === "Finance") {
        return { q: "Describe a time you detected a discrepancy.", a: "I use a double-verification method for all ledgers. Once, I found a 0.5% variance which saved the firm $20k in quarterly reporting." };
    } else {
        return { q: `How do you handle tight deadlines in ${industry}?`, a: "I prioritize tasks based on business impact and communicate early if blockers arise." };
    }
}

// --- 3. MAIN GENERATOR ---

async function seedMassiveScale() {
    console.log(`🚀 Starting Massive Scale Seed: ${LEVELS.length} Levels * ${INDUSTRIES.length} Industries * ${ROLES.length} Roles`);

    const batchSize = 400; // Firestore limit is 500 per batch
    let batch = db.batch();
    let operationCount = 0;
    let totalDocs = 0;

    for (const level of LEVELS) {
        for (const industry of INDUSTRIES) {
            for (const role of ROLES) {

                // Skip nonsense combinations (e.g. "Tech Nurse") - simple heuristic check
                if (industry === "Healthcare" && !["Nurse", "Medical Assistant", "Pharmacy Technician"].includes(role) && !role.includes("Analyst") && !role.includes("Manager")) continue;
                if (industry === "Tech" && ["Nurse", "Chef", "Driver"].includes(role)) continue;
                if (industry === "Construction" && ["Software Engineer", "Nurse"].includes(role)) continue;

                // Construct Title & Slug
                const fullTitle = `${level} ${industry} ${role}`; // e.g., "Senior Tech Product Manager"
                // Clean slug: remove spaces, lowercase
                const slug = `${level}-${industry}-${role}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-resume-usa";

                const docRef = db.collection('global_roles').doc(`us_${slug}`);

                const roleData = {
                    slug: slug,
                    job_title: fullTitle,
                    country: "us",
                    avg_salary: getSalaryRange(level, industry),
                    seo_title: `${fullTitle} Resume Format (2025) - Free Download`,
                    meta_description: `Download the #1 ${fullTitle} Resume Template. Specialized for the US ${industry} market. Includes ATS keywords for ${level} roles.`,
                    keywords: [`${fullTitle.toLowerCase()} resume`, `${industry.toLowerCase()} resume templates`, `ats resume for ${role.toLowerCase()}`],

                    hero_headline: `${fullTitle} Resume Format`,
                    summary_text: `The market for **${fullTitle}s** is competitive. This guide filters for the specific skills US ${industry} recruiters demand from ${level} candidates.`,

                    hero_image: level === "Principal" || level === "Lead" ? "/templates/onepager-previews/executive.png" : "/templates/onepager-previews/modern.png",

                    template_gallery: [
                        { id: "modern", img: "/templates/onepager-previews/modern.png", name: "Modern ATS" },
                        { id: "bold", img: "/templates/onepager-previews/bold.png", name: "Bold Impact" },
                        { id: "executive", img: "/templates/onepager-previews/executive.png", name: "Executive" }
                    ],

                    day_in_life: getDayInLife(level, industry, role),

                    interview_questions: [
                        {
                            question: `What is your biggest achievement as a ${level} ${role}?`,
                            answer: "Use metrics. 'I led a project that reduced costs by 15%...' or 'I managed a budget of $50k...'.",
                            difficulty: "Medium",
                            category: "Behavioral"
                        },
                        {
                            question: getInterviewQuestion(level, industry).q,
                            answer: getInterviewQuestion(level, industry).a,
                            difficulty: "Hard",
                            category: "Industry Specific"
                        }
                    ],

                    faqs: [
                        { q: "Resume Length?", a: level === "Senior" || level === "Principal" ? "2 pages is expected." : "Keep it to 1 page." },
                        { q: "Cover Letter?", a: "Yes, 60% of US recruiters still read them for this role." }
                    ],

                    skills_matrix: {
                        must_have: [{ name: "Core Domain Skill", importance: "High" }],
                        technical: [{ name: "Industry Software", importance: "Medium" }],
                        soft_skills: [{ name: "Leadership", importance: "Critical" }]
                    },

                    industry_context: {
                        text: `US ${industry} works in cycles. Q1 and Q3 are peak hiring seasons.`,
                        companies: ["Market Leaders", "Fast-Growth Firms"]
                    },

                    updated_at: new Date().toISOString(),
                    migration_source: 'massive_scale_v1'
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

    console.log(`🎉 GRAND TOTAL: ${totalDocs} Roles Seeded to Firestore!`);
}

seedMassiveScale();
