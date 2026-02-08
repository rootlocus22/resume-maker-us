const fs = require('fs');
const path = require('path');

// 1. Load US Roles as Template
const usRolesPath = path.join(__dirname, '../data/global/us_roles.json');
const usRoles = JSON.parse(fs.readFileSync(usRolesPath, 'utf-8'));

console.log(`Loaded ${usRoles.length} base US roles.`);

// 2. Define Country Configs (using data patterns from app/lib/globalSalaryData.js)
const COUNTRY_CONFIGS = {
    'uk': {
        name: "United Kingdom",
        currency: "GBP",
        currencySymbol: "£",
        salaryMultiplier: 0.85,
        locations: [
            "London", "Manchester", "Birmingham", "Edinburgh", "Glasgow",
            "Bristol", "Leeds", "Liverpool", "Cardiff", "Belfast"
        ],
        cities_to_replace: ["New York", "San Francisco", "Seattle", "Austin", "USA", "US", "America"],
        context_replacements: {
            "IRS": "HMRC",
            "401(k)": "Pension Scheme",
            "CPA": "ACCA/CIMA",
            "GAAP": "IFRS",
            "FDA": "MHRA"
        }
    },
    'ca': {
        name: "Canada",
        currency: "CAD",
        currencySymbol: "C$",
        salaryMultiplier: 0.75, // Simplified conversion vs USD
        locations: [
            "Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa",
            "Edmonton", "Winnipeg"
        ],
        cities_to_replace: ["New York", "San Francisco", "Seattle", "Austin", "USA", "US", "America"],
        context_replacements: {
            "IRS": "CRA",
            "401(k)": "RRSP",
            "CPA": "CPA Canada",
            "FDA": "Health Canada"
        }
    },
    'au': {
        name: "Australia",
        currency: "AUD",
        currencySymbol: "A$",
        salaryMultiplier: 0.80,
        locations: [
            "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
            "Canberra", "Gold Coast"
        ],
        cities_to_replace: ["New York", "San Francisco", "Seattle", "Austin", "USA", "US", "America"],
        context_replacements: {
            "IRS": "ATO",
            "401(k)": "Superannuation",
            "CPA": "CPA Australia",
            "FDA": "TGA"
        }
    }
};

// 3. Helper to localize text
function localizeText(text, config) {
    if (!text) return text;
    let newText = text;

    // Replace Country Names
    newText = newText.replace(/United States/g, config.name);
    newText = newText.replace(/USA/g, config.name);
    newText = newText.replace(/\bUS\b/g, config.name); // Whole word US only

    // Replace Specific Terms
    Object.entries(config.context_replacements).forEach(([usTerm, localTerm]) => {
        const regex = new RegExp(`\\b${usTerm}\\b`, 'g');
        newText = newText.replace(regex, localTerm);
    });

    // Replace Cities (Simplified: Just pick a random local city if a known US city is found? 
    // Or just replace generic references. For now, let's just ensure country name is correct).

    return newText;
}

function localizeSalary(salaryStr, config) {
    // Expects formats like "$60k - $90k" or "$120,000"
    if (!salaryStr) return salaryStr;

    // Naive replacement: remove $, parse number, multiply, format with new symbol
    // This is complex to regex robustly, so we'll use a simplified approximation for now
    // assuming the input json has specific fields for min/max/median in numbers usually, 
    // but here us_roles.json might have string ranges. 

    // Strategy: Just replace currency symbol first
    let newSalary = salaryStr.replace(/\$/g, config.currencySymbol);

    // Optional: Adjust numbers if we want to be fancy, but simple symbol swap is often enough for v1
    // as pSEO often uses rough ranges.

    return newSalary;
}

// 4. Generate Roles
function generateForCountry(countryCode) {
    const config = COUNTRY_CONFIGS[countryCode];
    const generatedRoles = [];

    usRoles.forEach(role => {
        // Create new role object
        const newRole = JSON.parse(JSON.stringify(role)); // Deep clone

        // 1. Update Slug
        // us_software-engineer-resume-usa -> uk_software-engineer-resume-uk
        // resume-format-for-java-developer-resume-us -> java-developer-resume-uk (simplified)
        // Let's stick to a clean pattern: {slug}-resume-{countryCode}
        const baseSlug = role.slug.replace(/-resume-us$|-resume-usa$/, '').replace(/^us-/, ''); // clean up existing suffix/prefix
        const newSlug = `${baseSlug}-resume-${countryCode}`;
        newRole.slug = newSlug;

        // 2. Localize Content
        newRole.seo_title = localizeText(role.seo_title, config);
        newRole.meta_description = localizeText(role.meta_description, config);
        newRole.summary_text = localizeText(role.summary_text, config);
        newRole.job_title = localizeText(role.job_title, config); // e.g. "US Tax Accountant" -> "United Kingdom Tax Accountant"

        // 3. Localize Salary Data (if structured object exists)
        if (newRole.salary_data) {
            newRole.salary_data.currency = config.currency;
            newRole.salary_data.min = Math.round(newRole.salary_data.min * config.salaryMultiplier);
            newRole.salary_data.max = Math.round(newRole.salary_data.max * config.salaryMultiplier);
            newRole.salary_data.median = Math.round(newRole.salary_data.median * config.salaryMultiplier);
        }

        // 4. Localize Industry Context
        if (newRole.industry_context) {
            newRole.industry_context.description = localizeText(newRole.industry_context.description, config);
            // Replace companies? keeping same for now for global tech companies
        }

        // 5. Update FAQs
        if (newRole.faqs) {
            newRole.faqs = newRole.faqs.map(faq => ({
                q: localizeText(faq.q, config),
                a: localizeText(faq.a, config)
            }));
        }

        generatedRoles.push(newRole);
    });

    // Write to file
    const outputDir = path.join(__dirname, '../data/global');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${countryCode}_roles.json`);
    fs.writeFileSync(outputPath, JSON.stringify(generatedRoles, null, 2));
    console.log(`✅ Generated ${generatedRoles.length} roles for ${config.name} in ${outputPath}`);
}

// Run for all target countries
Object.keys(COUNTRY_CONFIGS).forEach(code => generateForCountry(code));
