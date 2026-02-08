// Utility to explode base roles into variants
import { ROLES } from './data.js';

const SENIORITY_PREFIXES = [
    "Junior",
    "Entry-Level",
    "Senior",
    "Lead",
    "Staff",
    "Principal",
    "Head of",
    "Director of",
    "Intern",
    "Associate",
    "Graduate",
    "Vice President of"
];

// Combine with "Remote" intent? Or just distinct roles?
// Let's create distinct roles for specific high-value permutations
const INDUSTRY_SUFFIXES = [
    "for Startups",
    "for FinTech",
    "for HealthTech",
    "for E-commerce",
    "for SaaS Companies",
    "for EdTech",
    "for Agencies",
    "for Consulting Firms",
    "for Banks",
    "for Media",
    "for Non-Profits"
];

// --- ENRICHMENT LOGIC (Thick Content) ---
const enrichVariant = (baseRole, type, modifier) => {
    let enriched = JSON.parse(JSON.stringify(baseRole)); // Deep copy

    // 1. Seniority Enrichment
    if (type === "seniority") {
        const isLeader = ["Head of", "Director of", "Vice President of", "Lead", "Principal", "Manager"].some(t => modifier.includes(t));
        const isJunior = ["Junior", "Entry-Level", "Intern", "Graduate"].some(t => modifier.includes(t));

        if (isLeader) {
            enriched.keywords.unshift("Team Leadership", "Strategic Planning", "Stakeholder Management", "Mentorship");
            enriched.common_failures.push("Failing to delegate", "Getting stuck in weeds/execution", "Not aligning tech with business goals");
            enriched.sample_qa.push({
                q: "How do you handle a low-performing team member?",
                a: "I start with a candid 1:1 to identify the root cause (skill vs will). I set a PIP with clear, measurable goals and weekly check-ins. If no improvement, I make the hard decision for the team's health."
            });
        } else if (isJunior) {
            enriched.keywords.unshift("Eagerness to Learn", "Coachability", "Fundamentals");
            enriched.common_failures.push("Not asking for help when stuck", "Pretending to know answers", "Lack of attention to detail");
            enriched.sample_qa.push({
                q: "What do you do if you don't know the answer?",
                a: "I admit it honestly but explain how I would find it. 'I haven't used that specific tool, but I would read the docs and check StackOverflow. I'm quick to learn.'"
            });
        }
    }

    // 2. Startup Enrichment
    if (type === "startup") {
        enriched.keywords.unshift("Ownership", "Agility", "Wearing Multiple Hats", "Execution Speed");
        enriched.common_failures.push("Waiting for permission/instructions", "Over-engineering MVP", "Not caring about burn rate");
        enriched.sample_qa.push({
            q: "How do you prioritize in a chaotic startup?",
            a: "I focus on the 'One Metric That Matters'. If a feature doesn't directly drive growth or retention this week, it goes to the backlog. Speed is survival."
        });
    }

    // 3. Remote Enrichment
    if (type === "remote") {
        enriched.keywords.unshift("Async Communication", "Self-Discipline", "Written Clarity", "Time Management");
        enriched.common_failures.push("Going dark/unresponsive", "Poor written updates", "Overworking (burnout)");
        enriched.sample_qa.push({
            q: "How do you stay visible while remote?",
            a: "I over-communicate. I post daily updates in Slack, document all decisions in Notion, and ensure my output speaks for itself. "
        });
    }

    // 4. Enterprise Enrichment
    if (type === "enterprise") {
        enriched.keywords.unshift("Compliance", "Scalability", "Legacy Systems", "Cross-team Collaboration");
        enriched.common_failures.push("Ignoring security/compliance", "Moving fast and breaking things (bad in enterprise)", "Politics avoidance");
    }

    return enriched;
};

export function getExpandedRoles() {
    let expandedRoles = [];

    ROLES.forEach(baseRole => {
        // 1. Add the Base Role itself
        expandedRoles.push(baseRole);

        // 2. Add Seniority Variants (only for relevant categories)
        if (["Tech", "Product", "Data", "Design", "Marketing", "Sales", "Business", "Finance", "HR"].includes(baseRole.category)) {
            SENIORITY_PREFIXES.forEach(prefix => {
                // Formatting: "Senior Software Engineer"
                // Skip illogical combos like "Junior Head of..."
                if ((prefix.includes("Head") || prefix.includes("Director") || prefix.includes("President")) && ["Junior", "Entry-Level", "Intern", "Associate"].includes(prefix)) return;

                // Don't add "Junior" to "VP" roles if likely
                if (baseRole.title.startsWith("VP") || baseRole.title.startsWith("Chief")) return;

                const newTitle = `${prefix} ${baseRole.title}`;
                const newSlug = `${prefix.toLowerCase().replace(/ /g, '-')}-${baseRole.slug}`;

                const enriched = enrichVariant(baseRole, "seniority", prefix);
                expandedRoles.push({
                    ...enriched,
                    title: newTitle,
                    slug: newSlug,
                    isVariant: true,
                    variantType: "seniority",
                    originalTitle: baseRole.title
                });
            });
        }

        // 3. Add Industry Variants (Selectively)
        // High value for generic roles like "Product Manager for FinTech"
        if (["Product Manager", "Software Engineer", "Marketing Manager", "Sales Executive", "Data Analyst", "Project Manager", "Consultant"].includes(baseRole.title)) {
            INDUSTRY_SUFFIXES.forEach(suffix => {
                const newTitle = `${baseRole.title} ${suffix}`;
                const newSlug = `${baseRole.slug}-${suffix.toLowerCase().replace(/ /g, '-')}`;

                const enriched = enrichVariant(baseRole, "industry", suffix);
                expandedRoles.push({
                    ...enriched,
                    title: newTitle,
                    slug: newSlug,
                    isVariant: true,
                    variantType: "industry",
                    originalTitle: baseRole.title
                });
            });
        }

        // 4. Add "Remote" Variants (High Potential)
        if (["Tech", "Product", "Design", "Marketing", "Sales", "Business", "Support", "HR"].includes(baseRole.category)) {
            const newTitle = `Remote ${baseRole.title}`;
            const newSlug = `remote-${baseRole.slug}`;

            const enriched = enrichVariant(baseRole, "remote", "Remote");
            expandedRoles.push({
                ...enriched,
                title: newTitle,
                slug: newSlug,
                isVariant: true,
                variantType: "remote",
                originalTitle: baseRole.title
            });
        }

        // 5. Add "Startup" Variants
        if (["Tech", "Product", "Design", "Marketing", "Sales"].includes(baseRole.category)) {
            const newTitle = `${baseRole.title} at a Startup`;
            const newSlug = `${baseRole.slug}-startup`;

            const enriched = enrichVariant(baseRole, "startup", "Startup");
            expandedRoles.push({
                ...enriched,
                title: newTitle,
                slug: newSlug,
                isVariant: true,
                variantType: "startup",
                originalTitle: baseRole.title
            });
        }

        // 6. Add "Enterprise" Variants
        if (["Tech", "Product", "Design", "Marketing", "Sales", "Business", "Finance"].includes(baseRole.category)) {
            const newTitle = `${baseRole.title} at Enterprise`;
            const newSlug = `${baseRole.slug}-enterprise`;

            const enriched = enrichVariant(baseRole, "enterprise", "Enterprise");
            expandedRoles.push({
                ...enriched,
                title: newTitle,
                slug: newSlug,
                isVariant: true,
                variantType: "enterprise",
                originalTitle: baseRole.title
            });
        }

        // 7. Add "Contract/Freelance" Variants
        if (["Tech", "Design", "Marketing", "Writing", "Legal", "Admin"].includes(baseRole.category)) {
            ["Freelance", "Contract", "Part-Time"].forEach(prefix => {
                const newTitle = `${prefix} ${baseRole.title}`;
                const newSlug = `${prefix.toLowerCase()}-${baseRole.slug}`;

                expandedRoles.push({
                    ...baseRole,
                    title: newTitle,
                    slug: newSlug,
                    isVariant: true,
                    variantType: "contract",
                    originalTitle: baseRole.title
                });
            });
        }
    });

    return expandedRoles;
}
