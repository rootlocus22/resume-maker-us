import { adminDb } from "./firebase-admin";

export async function getJobSeoPage(slug) {
    try {
        if (!adminDb) return null;

        const docRef = adminDb.collection('job_seo_pages').doc(slug);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { ...docSnap.data(), id: docSnap.id };
        }
    } catch (error) {
        console.error(`Error fetching job SEO page ${slug}:`, error);
    }
    return null;
}

export async function getJobSeoPagesList(limitCount = 50) {
    try {
        if (!adminDb) return [];

        // Simple fetch of recent/top pages
        // Real implementation should probably support pagination or search
        const snapshot = await adminDb.collection('job_seo_pages')
            .select('role', 'location', 'h1_title', 'category', 'slug') // Optimization: Only fetch needed fields
            .limit(limitCount)
            .get();

        if (snapshot.empty) return [];

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                slug: doc.id,
                role: data.role,
                location: data.location,
                title: data.h1_title,
                category: data.category || "General" // Fetch category
            };
        });
    } catch (error) {
        console.error("Error listing job SEO pages:", error);
        return [];
    }
}

// Mock helper for related jobs (since we don't have a complex search engine yet)
// We will fetch a small batch and filter/randomize in memory for now, or use simple equality checks
export async function getRelatedJobs(category, currentSlug, limit = 6) {
    try {
        if (!adminDb) return [];
        const snapshot = await adminDb.collection('job_seo_pages')
            .where('category', '==', category)
            .select('role', 'location', 'slug')
            .limit(20) // Fetch a bit more to shuffle or filter
            .get();

        if (snapshot.empty) return [];

        let docs = snapshot.docs
            .map(doc => ({ ...doc.data(), slug: doc.id }))
            .filter(doc => doc.slug !== currentSlug);

        // Shuffle array to show different jobs
        return docs.sort(() => 0.5 - Math.random()).slice(0, limit);
    } catch (error) {
        console.error("Error fetching related jobs:", error);
        return [];
    }
}

export async function getSameRoleInOtherLocations(role, currentSlug, limit = 10) {
    try {
        if (!adminDb) return [];
        const snapshot = await adminDb.collection('job_seo_pages')
            .where('role', '==', role)
            .select('location', 'slug')
            .limit(20)
            .get();

        if (snapshot.empty) return [];

        let docs = snapshot.docs
            .map(doc => ({ ...doc.data(), slug: doc.id }))
            .filter(doc => doc.slug !== currentSlug);

        return docs.slice(0, limit);
    } catch (error) {
        console.error("Error fetching same role locations:", error);
        return [];
    }
}
