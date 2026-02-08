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

// --- 1. THE DATA SOURCE (50 Common Roles) ---
const ROLES_LIST = [
    "Data Scientist", "Product Manager", "Marketing Manager", "Project Manager",
    "Graphic Designer", "Sales Associate", "Customer Service Representative",
    "Registered Nurse", "Accountant", "Business Analyst", "Web Developer",
    "UX Designer", "DevOps Engineer", "HR Specialist", "Operations Manager",
    "Financial Analyst", "Teacher", "Recruiter", "Administrative Assistant",
    "Construction Manager", "Civil Engineer", "Mechanical Engineer",
    "Electrical Engineer", "Network Engineer", "Cybersecurity Analyst",
    "Social Media Manager", "Content Writer", "Copywriter", "Video Editor",
    "Photographer", "Real Estate Agent", "Chef", "Bartender", "Server",
    "Retail Manager", "Store Manager", "Driver", "Truck Driver",
    "Warehouse Worker", "Electrician", "Plumber", "Carpenter",
    "Hair Stylist", "Makeup Artist", "Personal Trainer", "Yoga Instructor",
    "Tutor", "Nanny", "Caregiver", "Security Guard"
];

// --- 2. TEMPLATE GENERATOR ---
function generateRoleData(jobTitle) {
    const slug = `${jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-resume-usa`;

    // Dynamic Categorization (Simple heuristic)
    const isTech = /Developer|Engineer|Data|Cyber|UX|Web/i.test(jobTitle);
    const isCreative = /Designer|Writer|Editor|Photographer|Artist/i.test(jobTitle);
    const isBusiness = /Manager|Analyst|Accountant|HR|Recruiter/i.test(jobTitle);

    // Template Logic
    return {
        slug: slug,
        job_title: jobTitle,
        country: "us",
        avg_salary: isTech ? "$90k - $160k" : isBusiness ? "$60k - $110k" : "$40k - $80k",
        seo_title: `Best ${jobTitle} Resume Format for USA (2025) - Download Free`,
        meta_description: `Download the #1 ${jobTitle} Resume Template for the US market. Optimised for ATS and tailored for ${isTech ? 'Tech companies' : 'US employers'}.`,
        keywords: [
            `${jobTitle.toLowerCase()} resume usa`,
            `${jobTitle.toLowerCase()} resume template word`,
            `ats friendly ${jobTitle.toLowerCase()} resume`
        ],
        hero_headline: `${jobTitle} Resume Format (US Edition)`,
        summary_text: `The US job market for **${jobTitle}s** is highly competitive. Recruiters look for 'Action Verbs' and quantifiable achievements. This template is designed to pass ATS filters used by top US companies.`,

        // Visuals (One Pager Theme)
        hero_image: isCreative ? "/templates/onepager-previews/creative.png" :
            isTech ? "/templates/onepager-previews/tech.png" :
                "/templates/onepager-previews/executive.png",

        template_gallery: [
            { id: "modern", img: "/templates/onepager-previews/modern.png", name: "Modern One-Pager" },
            { id: "bold", img: "/templates/onepager-previews/bold.png", name: "Bold Impact" },
            { id: "classic", img: "/templates/onepager-previews/executive.png", name: "Executive Classic" }
        ],

        // "Ultimate Guide" Content
        day_in_life: `A typical day for a **${jobTitle}** in the US involves a mix of strategic planning and execution. \n\n**Morning:** \nReviewing priorities and checking emails. ${isTech ? 'Attending Stand-up meetings and reviewing Jira tickets.' : 'Coordinating with key stakeholders.'} \n\n**Afternoon:** \nDeep work sessions. ${isTech ? 'Coding or designing system architecture.' : isCreative ? 'Drafting concepts and iterating on designs.' : 'Analyzing reports and attending client meetings.'} \n\n**Wrap Up:** \nDocumenting progress and planning for the next day.`,

        career_path: [
            `Junior ${jobTitle} (Entry Level)`,
            `Associate ${jobTitle}`,
            `Senior ${jobTitle}`,
            `Lead ${jobTitle}`,
            `Manager / Principal`
        ],

        // Dynamic Questions
        interview_questions: [
            {
                question: `Tell me about a time you handled a difficult situation as a ${jobTitle}.`,
                answer: "Use the STAR method (Situation, Task, Action, Result). Focus on a specific instance where your intervention led to a positive outcome, quantifying the impact if possible (e.g., 'saved $10k', 'improved efficiency by 20%').",
                difficulty: "Medium",
                category: "Behavioral"
            },
            {
                question: isTech ? "How do you stay updated with new technologies?" : "How do you prioritize conflicting deadlines?",
                answer: isTech ? "I follow tech blogs (HackerNews), contribute to Open Source, and take courses on Udemy/Coursera." : "I use the Eisenhower Matrix to categorize tasks by urgency and importance, communicating proactively with stakeholders if timelines face risk.",
                difficulty: "Easy",
                category: "General"
            },
            {
                question: `What are your salary expectations for a ${jobTitle} role?`,
                answer: "Research the market rate for your location. Give a range rather than a specific number, e.g., '$85k - $100k', and mention you are flexible based on the total compensation package.",
                difficulty: "Medium",
                category: "HR"
            }
        ],

        faqs: [
            {
                q: "Should I include a photo?",
                a: "No. In the US, photos on resumes are generally discouraged to avoid bias issues."
            },
            {
                q: "How long should my resume be?",
                a: `For a **${jobTitle}**, aim for 1 page if you have less than 5-7 years of experience. If you are a Senior/Manager, 2 pages is standard.`
            },
            {
                q: "What format is best?",
                a: "Reverse-Chronological is the industry standard in the US. It highlights your most recent work experience first."
            }
        ],

        skills_matrix: {
            must_have: [
                { name: isTech ? "Problem Solving" : "Communication", importance: "High" },
                { name: isTech ? "Programming" : "Organization", importance: "High" }
            ],
            technical: [
                { name: isTech ? "Cloud Services" : "Microsoft Office", importance: "Medium" },
                { name: isTech ? "Database Management" : "Project Management", importance: "Medium" }
            ],
            soft_skills: [
                { name: "Teamwork", importance: "Critical" },
                { name: "Adaptability", importance: "High" }
            ]
        },

        industry_context: {
            text: `The **${jobTitle}** market in the US is projected to grow. Employers value candidates who can demonstrate 'Ownership' and 'Impact' early on.`,
            companies: isTech ? ["Google", "Amazon", "Meta"] : ["Fortune 500", "Startups", "Agencies"]
        },

        updated_at: new Date().toISOString(),
        migration_source: 'bulk_seed_v1'
    };
}

// --- 3. MAIN EXECUTION ---
async function seedBulk() {
    console.log(`🚀 Starting Bulk Seeding for ${ROLES_LIST.length} roles...`);
    const batch = db.batch();
    let count = 0;

    // Add the Manual "Gold Standard" Software Engineer role separately? 
    // No, assume that's already migrated. We won't overwrite it if we check existence, 
    // but batch set usually overwrites.
    // We will SKIP "Software Engineer" to preserve the manual edits.

    for (const title of ROLES_LIST) {
        if (title === "Software Engineer") continue;

        const data = generateRoleData(title);
        const docId = `us_${data.slug}`;
        const docRef = db.collection('global_roles').doc(docId);

        batch.set(docRef, data);
        console.log(`   + Staging: ${docId}`);
        count++;
    }

    try {
        await batch.commit();
        console.log(`✅ Successfully seeded ${count} roles to Firestore!`);
    } catch (e) {
        console.error("❌ Bulk Seed Failed:", e);
    }
}

seedBulk();
