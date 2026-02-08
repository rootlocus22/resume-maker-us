import { adminDb } from "../app/lib/firebase-admin";
import jobRoles from "../app/data/job_roles.json";

// Internal blacklist for market isolation
const globalBlacklist = ['sarkari', 'naukri', 'india', 'biodata', 'bio-data', 'government job', 'freshers'];

// In-memory cache to avoid redundant fetches and sanitization during build
const cache = {
    roles: new Map(), // countryCode -> roles[]
    singleRoles: new Map() // `${countryCode}_${slug}` -> role
};

function deepSanitize(val, depth = 0, seen = new WeakSet()) {
    // Safety limits for build performance
    if (depth > 12) return "...";

    if (typeof val === 'string') return val;
    if (val === null || val === undefined) return "";

    if (Array.isArray(val)) {
        return val.map(v => deepSanitize(v, depth + 1, seen));
    }

    if (typeof val === 'object') {
        // Prevent circular references
        if (seen.has(val)) return "[Circular]";
        seen.add(val);

        // Check for specific "leaf" objects that should be strings
        // But ONLY if they don't have other structural keys we might need
        const hasStructuralKeys = val.median || val.currency || val.faqs || val.interview_questions || val.hard_skills || val.companies;

        if (!hasStructuralKeys) {
            if (val.description || val.title) return val.description || val.title;
            if (val.name && val.icon) return val.name;
        }

        // Otherwise, it's a structural object, sanitize its children
        const sanitized = {};
        for (const key in val) {
            sanitized[key] = deepSanitize(val[key], depth + 1, seen);
        }
        return sanitized;
    }

    return String(val);
}

function sanitizeRoles(roles) {
    return roles
        .filter(role => {
            const titleLower = (role.job_title || "").toLowerCase();
            const slugLower = (role.slug || "").toLowerCase();
            return !globalBlacklist.some(word => titleLower.includes(word) || slugLower.includes(word));
        })
        .map(role => deepSanitize(role));
}

// Fetch all roles for a country (used for generateStaticParams)
export async function getGlobalRoles(countryCode) {
    // Check cache
    if (cache.roles.has(countryCode)) {
        return cache.roles.get(countryCode);
    }

    // Fallback if DB not ready (Dev/Testing)
    if (!adminDb) {
        console.warn("⚠️ Firestore Admin not initialized, using static fallback");
        const res = sanitizeRoles(jobRoles).slice(0, 20);
        cache.roles.set(countryCode, res);
        return res;
    }

    try {
        const rolesSnap = await adminDb.collection("global_roles")
            .where("country", "==", countryCode)
            .get();

        if (rolesSnap.empty) {
            const res = sanitizeRoles(jobRoles).slice(0, 20);
            cache.roles.set(countryCode, res);
            return res;
        }

        const res = sanitizeRoles(rolesSnap.docs.map(doc => doc.data()));
        cache.roles.set(countryCode, res);
        return res;
    } catch (e) {
        console.error(`Error fetching global roles for ${countryCode}:`, e);
        const res = sanitizeRoles(jobRoles).slice(0, 20);
        cache.roles.set(countryCode, res);
        return res;
    }
}

// Fetch single role by slug (used for page data)
export async function getGlobalRoleBySlug(countryCode, slug) {
    const cacheKey = `${countryCode}_${slug}`;
    if (cache.singleRoles.has(cacheKey)) {
        return cache.singleRoles.get(cacheKey);
    }

    // Fallback if DB not ready (Dev/Testing)
    if (!adminDb) {
        console.warn("⚠️ Firestore Admin not initialized, using static fallback for", slug);
        const fallbackRole = jobRoles.find(r => r.slug === slug || r.slug.includes(slug)) || jobRoles[0];
        const res = deepSanitize(fallbackRole);
        cache.singleRoles.set(cacheKey, res);
        return res;
    }

    try {
        const docId = `${countryCode}_${slug}`;
        const docSnap = await adminDb.collection("global_roles").doc(docId).get();

        if (!docSnap.exists) {
            console.warn(`Role not found in DB: ${docId}, checking static fallback`);
            const fallbackRole = jobRoles.find(r => r.slug === slug || r.slug.includes(slug)) || jobRoles[0];
            const res = deepSanitize(fallbackRole);
            cache.singleRoles.set(cacheKey, res);
            return res;
        }

        const res = deepSanitize(docSnap.data());
        cache.singleRoles.set(cacheKey, res);
        return res;
    } catch (e) {
        console.error(`Error fetching role ${countryCode}/${slug}:`, e);
        const fallbackRole = jobRoles.find(r => r.slug === slug || r.slug.includes(slug)) || jobRoles[0];
        const res = deepSanitize(fallbackRole);
        cache.singleRoles.set(cacheKey, res);
        return res;
    }
}
