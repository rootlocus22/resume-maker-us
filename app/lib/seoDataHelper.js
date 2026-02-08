import cityRoles from '../data/city_roles.json';
import healthcareRoles from '../data/healthcare_roles.json';
import jobRoles from '../data/job_roles.json';
import companyRoles from '../data/company_roles.json';
import fresherRoles from '../data/fresher_roles.json';
import governmentRoles from '../data/government_roles.json';

// Combine all sources
const allRoles = [
    ...cityRoles,
    ...healthcareRoles,
    ...jobRoles,
    ...companyRoles,
    ...fresherRoles,
    ...governmentRoles
];

export function getSEOData(identifier, type = 'slug') {
    if (!identifier) return null;
    const normalizedId = identifier.toLowerCase().trim();

    // Strategy 1: Exact Slug Match
    const exactMatch = allRoles.find(r => r.slug === normalizedId);
    if (exactMatch) return transformToPageData(exactMatch);

    // Strategy 2: Fuzzy Location Match (for resume-builder-[city])
    // The identifier here would be "hyderabad"
    if (type === 'location') {
        const cityMatch = cityRoles.find(r =>
            r.slug.includes(normalizedId) ||
            r.job_title.toLowerCase().includes(normalizedId)
        );
        if (cityMatch) return transformToPageData(cityMatch);
    }

    // Strategy 3: Fuzzy Role Match
    // The identifier would be "healthcare-administrator"
    const roleMatch = allRoles.find(r =>
        r.slug === normalizedId ||
        r.job_title.toLowerCase().replace(/ /g, '-') === normalizedId
    );
    if (roleMatch) return transformToPageData(roleMatch);

    return null;
}

function transformToPageData(roleEntry) {
    if (!roleEntry) return null;

    // Determine category based on checking source lists or properties
    // Defaulting to "job-role"
    let category = "job-role";
    if (roleEntry.slug.includes('resume-maker-in-')) category = "location";

    return {
        title: roleEntry.job_title.replace('Job Seeker in ', ''), // Clean up city titles
        h1: roleEntry.seo_title,
        metaDescription: roleEntry.meta_description,
        icon: getIconForRole(roleEntry.job_title),
        category: category,
        keywords: roleEntry.keywords || [],
        features: [
            `ATS-optimized template for ${roleEntry.job_title}`,
            `Pre-written summary for ${roleEntry.experience_level || 'all levels'}`,
            `Expert-approved skills for ${roleEntry.job_title}`,
            `Instant PDF Download in 1-Click`
        ],
        faqs: roleEntry.faqs || [],
        related: [], // Could implement logic to find related roles
        // Pass through rich data for the template to use
        summary: roleEntry.summary_text,
        hard_skills: roleEntry.hard_skills,
        soft_skills: roleEntry.soft_skills,
        industry_context: roleEntry.industry_context,
        ats_tips: roleEntry.ats_tips
    };
}

function getIconForRole(title) {
    const t = title.toLowerCase();
    if (t.includes('healthcare') || t.includes('nurse') || t.includes('doctor')) return '🏥';
    if (t.includes('engineer') || t.includes('developer')) return '💻';
    if (t.includes('sales') || t.includes('marketing')) return '📈';
    if (t.includes('student') || t.includes('fresher')) return '🎓';
    if (t.includes('manager') || t.includes('admin')) return 'briefcase';
    return '📄';
}
