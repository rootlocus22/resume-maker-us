/**
 * US Content Augmentor
 * Enriches role data fetched from generic sources with US-specific details.
 */

const US_SALARY_BUNDLES = {
    'software': '$85k - $165k',
    'medical': '$70k - $150k',
    'finance': '$75k - $140k',
    'admin': '$45k - $90k',
    'retail': '$35k - $75k',
    'education': '$50k - $110k',
    'marketing': '$65k - $130k'
};

const US_INTERVIEW_QUESTIONS = [
    {
        question: "Can you tell me about a time you had to deal with a difficult colleague in a [Job Title] role?",
        answer: "I approach workplace conflicts by focusing on professional objectives and open communication. I prioritize empathy and active listening to find common ground, ensuring that project goals remain the priority.",
        difficulty: "Medium",
        category: "Behavioural"
    },
    {
        question: "How do you handle high-pressure environments typical in the US [Job Title] market?",
        answer: "I manage high-pressure situations through disciplined time management and prioritization. I focus on task breakdown and maintaining a clear perspective on delivery timelines, which allows me to stay productive and calm.",
        difficulty: "Medium",
        category: "Behavioural"
    }
];

export function augmentRoleForUS(role) {
    if (!role) return null;

    const slug = role.slug?.toLowerCase() || '';
    const rawJobTitle = role.job_title || 'Professional';

    // Helper for safe string conversion
    const ensureString = (val, fallback = "") => {
        if (typeof val === 'string') return val;
        if (!val) return fallback;
        if (typeof val === 'object') {
            return val.description || val.title || JSON.stringify(val);
        }
        return String(val);
    };

    const jobTitle = ensureString(rawJobTitle);

    // 1. Localize Salary
    let salaryLabel = '$60k - $120k'; // Default US fallback
    if (slug.includes('software') || slug.includes('developer') || slug.includes('engineer')) {
        salaryLabel = US_SALARY_BUNDLES.software;
    } else if (slug.includes('nurse') || slug.includes('doctor') || slug.includes('health')) {
        salaryLabel = US_SALARY_BUNDLES.medical;
    } else if (slug.includes('accountant') || slug.includes('analyst') || slug.includes('finance')) {
        salaryLabel = US_SALARY_BUNDLES.finance;
    } else if (slug.includes('manager') || slug.includes('marketing')) {
        salaryLabel = US_SALARY_BUNDLES.marketing;
    }

    // 2. Add US-specific fields
    const augmentedRole = {
        ...role,
        region: 'us',
        avg_salary_us: salaryLabel,
        salary_data: role.salary_data ? {
            ...role.salary_data,
            india_average: null, // Clear India data
            us_average: {
                "0-2_years": salaryLabel.split(' - ')[0],
                "2-5_years": "$95k - $125k",
                "5-10_years": "$130k - $160k",
                "10+_years": "$180k+"
            },
            updated: "January 2026"
        } : {
            us_average: {
                "0-2_years": salaryLabel.split(' - ')[0],
                "2-5_years": "$95k - $125k",
                "5-10_years": "$130k - $160k",
                "10+_years": "$180k+"
            },
            updated: "January 2026"
        },
        // Ensure India/UK references are replaced
        summary_text: ensureString(role.summary_text).replace(/India/g, 'USA').replace(/UK/g, 'USA').replace(/US/g, 'American') || ensureString(role.summary_text),
        industry_context: (typeof role.industry_context === 'string')
            ? role.industry_context.replace(/India/g, 'the USA').replace(/US/g, 'US-based')
            : (role.industry_context ? ensureString(role.industry_context) : `The US market for ${jobTitle} professionals remains highly competitive. Recruiters look for candidates who can demonstrate measurable impact and possess relevant US-centric certifications.`),

        // Ensure hard_skills exists
        hard_skills: Array.isArray(role.hard_skills) && role.hard_skills.length > 0 ? role.hard_skills : ['Professional Communication', 'Data Entry', 'Microsoft Office', 'Project Management'],
        soft_skills: Array.isArray(role.soft_skills) && role.soft_skills.length > 0 ? role.soft_skills : ['Leadership', 'Strategic Thinking', 'Problem Solving', 'Adaptability'],

        // Add Interview Questions if missing
        interview_questions: (role.interview_questions && role.interview_questions.length > 0)
            ? role.interview_questions.map(q => ({
                ...q,
                question: ensureString(q.question).replace(/India/g, 'USA').replace(/UK/g, 'USA'),
                answer: ensureString(q.answer).replace(/India/g, 'USA').replace(/UK/g, 'USA')
            }))
            : US_INTERVIEW_QUESTIONS.map(q => ({
                ...q,
                question: q.question.replace('[Job Title]', jobTitle)
            })),

        // US Specific FAQs
        faqs: [
            {
                q: `What is the standard resume length in the US for ${jobTitle}?`,
                a: "In the United States, a one-page resume is the gold standard for anyone with less than 10 years of experience. For senior executives, two pages are acceptable, but conciseness is highly valued."
            },
            {
                q: `Should I include a photo on my ${jobTitle} resume?`,
                a: "No. Never include a photo on a US resume. US companies strictly follow anti-discrimination laws (EEOC), and including a photo can lead to your resume being rejected immediately to avoid bias."
            },
            ...(role.faqs || []).map(f => ({
                q: ensureString(f.q).replace(/India/g, 'USA').replace(/UK/g, 'USA'),
                a: ensureString(f.a).replace(/India/g, 'USA').replace(/UK/g, 'USA')
            }))
        ]
    };

    return augmentedRole;
}
