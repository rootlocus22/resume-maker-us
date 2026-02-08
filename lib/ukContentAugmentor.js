/**
 * UK Content Augmentor
 * Enriches role data fetched from generic sources with UK-specific details.
 */

const UK_SALARY_BUNDLES = {
    'software': '£35k - £85k',
    'medical': '£32k - £110k',
    'finance': '£40k - £95k',
    'admin': '£22k - £45k',
    'retail': '£18k - £35k',
    'education': '£28k - £60k',
    'marketing': '£30k - £75k'
};

const UK_INTERVIEW_QUESTIONS = [
    {
        question: "Can you tell us about your experience in a UK-based [Job Title] role?",
        answer: "I focus on delivering high-quality results while adhering to UK industry standards and regulatory requirements. I emphasize my ability to collaborate with diverse teams and my familiarity with standard UK business practices.",
        difficulty: "Medium",
        category: "Experience"
    },
    {
        question: "How do you handle diversity and inclusion in the workplace?",
        answer: "As per UK workplace standards and the Equality Act 2010, I prioritize creating an inclusive environment where all team members feel valued. I focus on objective merit and active collaboration.",
        difficulty: "Medium",
        category: "Behavioural"
    }
];

export function augmentRoleForUK(role) {
    if (!role) return null;

    const slug = role.slug?.toLowerCase() || '';
    const rawJobTitle = role.job_title || 'Professional';

    // Helper for safe string conversion
    const ensureString = (val, fallback = "") => {
        if (typeof val === 'string') return val;
        if (!val) return fallback;
        if (typeof val === 'object') {
            // If it's the {title, description} object we suspect, use description
            return val.description || val.title || JSON.stringify(val);
        }
        return String(val);
    };

    // Localize Job Title for UK context
    const jobTitle = ensureString(rawJobTitle)
        .replace(/fresher/gi, 'Graduate')
        .replace(/B\.Tech/gi, 'BSc/BEng')
        .replace(/resume/gi, 'CV');

    // 1. Localize Salary
    let salaryLabel = '£30k - £60k'; // Default UK fallback
    if (slug.includes('software') || slug.includes('developer') || slug.includes('engineer')) {
        salaryLabel = UK_SALARY_BUNDLES.software;
    } else if (slug.includes('nurse') || slug.includes('doctor') || slug.includes('health')) {
        salaryLabel = UK_SALARY_BUNDLES.medical;
    } else if (slug.includes('accountant') || slug.includes('analyst') || slug.includes('finance')) {
        salaryLabel = UK_SALARY_BUNDLES.finance;
    } else if (slug.includes('manager') || slug.includes('marketing')) {
        salaryLabel = UK_SALARY_BUNDLES.marketing;
    }

    // 2. Add UK-specific fields
    const augmentedRole = {
        ...role,
        job_title: jobTitle,
        region: 'uk',
        avg_salary_uk: salaryLabel,
        salary_data: role.salary_data ? {
            ...role.salary_data,
            india_average: null, // Clear India data
            uk_average: {
                "0-2_years": salaryLabel.split(' - ')[0],
                "2-5_years": "£45k - £65k",
                "5-10_years": "£65k - £85k",
                "10+_years": "£90k+"
            },
            updated: "January 2026"
        } : {
            uk_average: {
                "0-2_years": salaryLabel.split(' - ')[0],
                "2-5_years": "£45k - £65k",
                "5-10_years": "£65k - £85k",
                "10+_years": "£90k+"
            },
            updated: "January 2026"
        },
        // Replace India references in text
        summary_text: ensureString(role.summary_text).replace(/India/g, 'UK').replace(/US/g, 'British') || ensureString(role.summary_text),
        industry_context: (typeof role.industry_context === 'string')
            ? role.industry_context.replace(/India/g, 'the UK').replace(/US/g, 'UK-based')
            : (role.industry_context ? ensureString(role.industry_context) : `The demand for ${jobTitle} professionals in the UK is seeing steady growth, particularly in sectors driven by digital transformation and the evolving UK economic landscape. Recruiters prioritise candidates with strong regional experience and relevant UK certifications.`),

        // Ensure hard_skills exists
        hard_skills: Array.isArray(role.hard_skills) && role.hard_skills.length > 0 ? role.hard_skills : ['Professional Communication', 'Data Entry', 'Microsoft Office', 'Project Management'],
        soft_skills: Array.isArray(role.soft_skills) && role.soft_skills.length > 0 ? role.soft_skills : ['Teamwork', 'Communication', 'Problem Solving', 'Adaptability'],

        // Add Interview Questions if missing
        interview_questions: (role.interview_questions && role.interview_questions.length > 0)
            ? role.interview_questions.map(q => ({
                ...q,
                question: ensureString(q.question).replace(/India/g, 'UK'),
                answer: ensureString(q.answer).replace(/India/g, 'UK')
            }))
            : UK_INTERVIEW_QUESTIONS.map(q => ({
                ...q,
                question: q.question.replace('[Job Title]', jobTitle)
            })),

        // UK Specific FAQs
        faqs: [
            {
                q: `What is the standard length for a ${jobTitle} CV in the UK?`,
                a: "A standard UK CV should be exactly two pages of A4. For entry-level or graduate roles, one page is also acceptable, but never exceed two pages unless you are in academia or a very senior executive role."
            },
            {
                q: `Should I include my NI number or photo on my ${jobTitle} CV?`,
                a: "No. Under UK GDPR and Equality laws, you should never include your National Insurance (NI) number, photo, date of birth, or marital status. Focus purely on your skills and experience."
            },
            ...(role.faqs || []).map(f => ({
                q: ensureString(f.q).replace(/India/g, 'UK'),
                a: ensureString(f.a).replace(/India/g, 'UK')
            }))
        ]
    };

    return augmentedRole;
}
