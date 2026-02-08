const fs = require('fs');
const path = require('path');

const INDIA_ROLES_PATH = path.join(process.cwd(), 'app/data/job_roles.json');
const US_ROLES_PATH = path.join(process.cwd(), 'data/global/us_roles.json');

const indiaRoles = JSON.parse(fs.readFileSync(INDIA_ROLES_PATH, 'utf-8'));
let usRoles = [];

if (fs.existsSync(US_ROLES_PATH)) {
    usRoles = JSON.parse(fs.readFileSync(US_ROLES_PATH, 'utf-8'));
}

// Helper to convert salary roughly (INR LPA -> USD k)
// 10 LPA ~ $12k (direct) but PPP is higher.
// Let's us standardized US ranges for tech roles.
const US_SALARY_DEFAULTS = {
    "Entry-Level": { min: 60000, max: 90000, median: 75000 },
    "Entry-Mid": { min: 80000, max: 130000, median: 105000 },
    "Mid-Senior": { min: 110000, max: 180000, median: 145000 },
    "Senior": { min: 150000, max: 250000, median: 190000 }
};

const BLACKLIST_SLUGS = [
    "resume-format-for-government-job",
    "resume-format-for-infosys",
    "chartered-accountant-fresher-resume" // CA is specific, handle separately if needed
];

function convertToUS(indiaRole) {
    if (BLACKLIST_SLUGS.includes(indiaRole.slug)) return null;

    // 1. Slug
    let newSlug = indiaRole.slug.replace("-india", "-usa");
    if (!newSlug.endsWith("-usa")) newSlug += "-usa";
    // Check if distinct from existing US roles
    // The current us_roles.json has slugs like "software-engineer-resume-usa"
    // We want to avoid duplicates.

    // 2. Text Replacements
    let summary = indiaRole.summary_text
        .replace(/India/g, "the US")
        .replace(/US/g, "US")
        .replace(/Rupees/g, "Dollars")
        .replace(/LPA/g, "per year")
        .replace(/TCS|Infosys|Wipro/g, "Top Tech Companies")
        .replace(/Flipkart|Paytm|Zomato/g, "Silicon Valley Startups");

    // 3. Salary
    const level = indiaRole.experience_level || "Entry-Mid";
    const salary = US_SALARY_DEFAULTS[level] || US_SALARY_DEFAULTS["Entry-Mid"];

    // 4. Industry Context
    let contextText = indiaRole.industry_context;
    if (typeof contextText === 'string') {
        contextText = contextText
            .replace(/India/g, "the US")
            .replace(/US/g, "American")
            .replace(/₹[0-9]+L/g, "$100k+");
    }

    // 5. SEO Title & Desc
    const seoTitle = indiaRole.seo_title
        .replace(/India/g, "USA")
        .replace(/\(2026\)/, "(2025)"); // consistent year

    const metaDesc = indiaRole.meta_description
        .replace(/India/g, "USA")
        .replace(/TCS|Infosys/g, "Google, Amazon");

    return {
        slug: newSlug,
        job_title: indiaRole.job_title,
        country: "us",
        experience_level: level,
        salary_data: {
            ...salary,
            currency: "$",
            period: "yr"
        },
        hero_headline: `Professional ${indiaRole.job_title} Resume for the US Market`,
        summary_text: summary,
        hard_skills: indiaRole.hard_skills.map(s => typeof s === 'string' ? { name: s, icon: "Code" } : s), // Normalize format
        soft_skills: indiaRole.soft_skills,
        common_mistakes: typeof indiaRole.common_mistakes === 'string' ? [indiaRole.common_mistakes] : indiaRole.common_mistakes,
        seo_title: seoTitle,
        meta_description: metaDesc,
        keywords: indiaRole.keywords.map(k => k.replace(/india/g, "usa")),
        industry_context: {
            text: contextText,
            companies: ["Google", "Microsoft", "Amazon", "Netflix"]
        },
        ats_tips: indiaRole.ats_tips,
        day_in_life: indiaRole.day_in_life || "A typical day involves standups, coding, and design reviews.",
        career_path: indiaRole.career_path || [
            `Junior ${indiaRole.job_title}`,
            `Senior ${indiaRole.job_title}`,
            `Lead ${indiaRole.job_title}`
        ],
        faqs: indiaRole.faqs.map(f => ({
            q: f.q.replace(/India/g, "the US"),
            a: f.a.replace(/India/g, "the US").replace(/US/g, "US")
        }))
    };
}

let count = 0;
indiaRoles.forEach(role => {
    const converted = convertToUS(role);
    if (converted) {
        // Check duplication
        const exists = usRoles.find(r => r.slug === converted.slug || r.job_title === converted.job_title);
        if (!exists) {
            usRoles.push(converted);
            count++;
        }
    }
});

console.log(`Added ${count} new roles to US list.`);
fs.writeFileSync(US_ROLES_PATH, JSON.stringify(usRoles, null, 2));
