const fs = require('fs');
const path = require('path');

// --- 1. Combinatorial Data Sources ---

const levels = [
    "Junior", "Associate", "Mid-Level", "Senior", "Lead", "Principal", "Chief", "Staff", "Executive"
];

const techSkills = [
    "Java", "Python", "React", "Node.js", "Angular", "Vue.js", "JavaScript", "TypeScript", "Go", "Rust",
    "Kotlin", "Swift", "C++", "C#", "PHP", "Ruby", "Scala", "Perl", "Haskell", "Elixir",
    "AWS", "Azure", "Google Cloud", "DevOps", "Cybersecurity", "Blockchain", "AI", "Machine Learning",
    "Data Science", "Big Data", "Full Stack", "MERN Stack", "MEAN Stack", "Android", "iOS",
    "Flutter", "React Native", "Salesforce", "SAP", "Oracle", "SQL", "NoSQL", "MongoDB", "PostgreSQL",
    "Kubernetes", "Docker", "Terraform", "Ansible", "Jenkins", "Linux"
];

const techRoles = [
    "Developer", "Engineer", "Architect", "Consultant", "Specialist", "Analyst", "Programmer", "Administrator"
];

const nonTechDomains = [
    "Digital Marketing", "SEO", "Content", "Social Media", "Sales", "Business Development",
    "Product", "Project", "Program", "Human Resources", "Recruitment", "Talent Acquisition",
    "Finance", "Accounting", "Auditing", "Taxation", "Banking", "Investment",
    "Operations", "Supply Chain", "Logistics", "Procurement", "Customer Service", "BPO",
    "Legal", "Corporate Law", "Medical", "Nursing", "Pharmaceutical", "Teaching", "Education",
    "Graphic Design", "UI/UX", "Product Design", "Interior Design", "Fashion Design"
];

const nonTechRoles = [
    "Manager", "Executive", "Specialist", "Officer", "Director", "Coordinator", "Associate", "Consultant", "Analyst"
];

const locations = [
    "India", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Gurgaon", "Noida"
];

// Helper to pick random item
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- 2. Advanced Content Generators (Thick Content) ---

// Basic Summary Templates (Expanded)
const generateSummary = (title, level, category) => {
    const templates = [
        `Highly skilled ${title} with experience in ${category === 'tech' ? 'designing and implementing robust software solutions' : 'driving strategic initiatives and operational excellence'}. Proven track record of delivering results in fast-paced environments.`,
        `Results-driven ${title} dedicated to continuous improvement and innovation. Expertise in ${category === 'tech' ? 'modern technology stacks and best practices' : 'stakeholder management and process optimization'}.`,
        `Passionate ${title} seeking to leverage extensive background in ${category === 'tech' ? 'building scalable systems' : 'enhancing business performance'} to contribute to organizational success.`,
        `Experienced ${title} with a focus on quality and efficiency. adept at ${category === 'tech' ? 'troubleshooting complex technical issues' : 'collaborating with cross-functional teams'} to meet project deadlines.`,
        `Dynamic ${title} with a strong foundation in ${category === 'tech' ? 'technical problem solving' : 'strategic planning'}. Committed to professional growth and delivering value.`,
        `Forward-thinking ${title} with a knack for ${category === 'tech' ? 'innovative engineering' : 'creative problem solving'}. Eager to join a growth-oriented team and make a tangible impact.`,
        `Detail-oriented ${title} known for delivering high-quality work on time and within budget. leveraging deep knowledge of ${category === 'tech' ? 'software architecture' : 'business dynamics'}.`
    ];
    return pick(templates);
};

const generateDayInLife = (title, category) => {
    const techActivities = [
        "reviewing code", "debugging complex issues", "designing system architecture", "attending sprint planning",
        "optimizing database queries", "collaborating with the frontend team", "deploying updates to production",
        "writing unit tests", "mentoring junior developers"
    ];
    const mgmtActivities = [
        "conducting team meetings", "analyzing performance metrics", "meeting with stakeholders",
        "planning project timelines", "resolving team conflicts", "reviewing budget reports",
        "developing strategic roadmaps", "interviewing candidates"
    ];

    const activities = category === 'tech' ? techActivities : mgmtActivities;

    return `A typical day as a ${title} is dynamic and engaging. You start by ${pick(activities)} to set the tone for the day. Mid-day often involves ${pick(activities)} and ${pick(activities)}, ensuring alignment with team goals. In the afternoon, you focus on ${pick(activities)}, which is critical for project success. The day wraps up with ${pick(activities)} to prepare for the next day's challenges.`;
};

const generateCareerPath = (title, level) => {
    // Basic logic to generate a path "around" the current level
    const steps = [];
    if (level.includes("Junior") || level.includes("Entry") || level.includes("Associate")) {
        steps.push(`Trainee ${title.split(' ').slice(1).join(' ')}`);
        steps.push(title);
        steps.push(`Senior ${title.split(' ').slice(1).join(' ')}`);
    } else if (level.includes("Senior")) {
        steps.push(title);
        steps.push(`Lead ${title.split(' ').slice(1).join(' ')}`);
        steps.push(`Principal ${title.split(' ').slice(1).join(' ')}`);
    } else {
        steps.push(`Junior ${title.split(' ').slice(1).join(' ')}`);
        steps.push(title);
        steps.push(`Senior ${title.split(' ').slice(1).join(' ')}`);
        steps.push(`Lead ${title.split(' ').slice(1).join(' ')}`);
    }
    return steps;
};


const generateSalary = (level) => {
    let min, max;
    if (level.includes("Junior") || level.includes("Entry") || level.includes("Associate")) {
        min = 3; max = 8;
    } else if (level.includes("Senior") || level.includes("Lead")) {
        min = 15; max = 35;
    } else if (level.includes("Principal") || level.includes("Chief") || level.includes("Director")) {
        min = 30; max = 80;
    } else { // Mid
        min = 8; max = 18;
    }

    return {
        entry: `₹${Math.max(2, min - 2)}L - ₹${min}L`,
        mid: `₹${min}L - ₹${max}L`,
        senior: `₹${max}L - ₹${max + 15}L+`
    };
};

// --- 3. Main Generation Logic ---

const generatedData = [];
const usedSlugs = new Set(); // Prevent duplicates

// Helper to add role if unique
const addRole = (title, category, level) => {
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-resume-india`;
    if (usedSlugs.has(slug)) return;
    usedSlugs.add(slug);

    generatedData.push({
        slug: slug,
        job_title: title,
        experience_level: level,
        avg_salary_india: generateSalary(level).mid,
        summary_text: generateSummary(title, level, category),
        hard_skills: [`${title.split(' ')[0]} Expertise`, "Project Management", "Communication", "Problem Solving"], // Simplified
        soft_skills: ["Leadership", "Teamwork", "Adaptability", "Time Management", "Critical Thinking"],
        common_mistakes: `Using generic templates that don't highlight specific ${title} achievements. Failing to quantify results (e.g., 'improved efficiency by 20%').`,
        seo_title: `${title} Resume Format (2026) | Download Free Template`,
        meta_description: `Download professional ${title} resume format. Get salary insights, career path, and expert tips for ${title} jobs in India.`,
        keywords: [`${title} resume`, `${title} cv format`, `resume for ${title}`],
        faqs: [
            { q: `How do I write a resume for a ${title}?`, a: "Focus on your relevant experience and specific achievements. Use a reverse-chronological format." },
            { q: `What skills are required for a ${title}?`, a: "Key skills include technical proficiency in your domain, problem-solving, and communication." }
        ],
        industry_context: `The demand for ${title} professionals is growing rapidly in India's evolving market.`,
        ats_tips: ["Use standard fonts", "Include relevant keywords", "Save as PDF"],

        // THICK CONTENT
        day_in_life: generateDayInLife(title, category),
        career_path: generateCareerPath(title, level),
        salary_breakdown: generateSalary(level),
        top_certifications: [`Certified ${title.split(' ')[1] || title.split(' ')[0]} Professional`, "Project Management Professional (PMP)"],
        tech_stack_breakdown: {
            "Essential Tools": ["JIRA", "Slack", "Microsoft Office", "Zoom"],
            "Domain Skills": ["Core Competency A", "Core Competency B"]
        }
    });
};

// Generate Tech Roles
techSkills.forEach(skill => {
    levels.forEach(level => {
        techRoles.forEach(role => {
            // e.g. "Senior Java Developer"
            addRole(`${level} ${skill} ${role}`, 'tech', level);
            // e.g. "Java Developer" (without specific level, distinct entry)
            if (level === "Mid-Level") {
                addRole(`${skill} ${role}`, 'tech', "Mid-Senior");
            }
        });
    });
});

// Generate Non-Tech Roles
nonTechDomains.forEach(domain => {
    levels.forEach(level => {
        nonTechRoles.forEach(role => {
            // e.g. "Senior Digital Marketing Manager"
            addRole(`${level} ${domain} ${role}`, 'non-tech', level);
            if (level === "Mid-Level") {
                addRole(`${domain} ${role}`, 'non-tech', "Mid-Senior");
            }
        });
    });
});

// Combine with locations for some high-volume variants
const keyRoles = [
    { title: "Java Developer", cat: "tech" },
    { title: "Python Developer", cat: "tech" },
    { title: "Data Scientist", cat: "tech" },
    { title: "Accountant", cat: "non-tech" }, // Falls to default day-in-life
    { title: "Digital Marketing Manager", cat: "non-tech" }
];

keyRoles.forEach(roleObj => {
    locations.forEach(loc => {
        const title = `${roleObj.title} in ${loc}`;
        addRole(title, roleObj.cat, "Mid-Senior");
    });
});

// --- 4. Write to File ---
const outputPath = path.join(__dirname, '../app/data/generated_roles.json');
fs.writeFileSync(outputPath, JSON.stringify(generatedData, null, 2));

console.log(`Successfully generated ${generatedData.length} unique roles in ${outputPath}`);
