import { adminDb } from "./firebase-admin";

export async function getRoleBySlug(slug) {
    // 1. Try fetching from Firestore (Generated Roles)
    try {
        const docRef = adminDb.collection('generated_job_roles').doc(slug);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { ...docSnap.data(), source: 'firestore' };
        }
    } catch (error) {
        console.error(`Error fetching role ${slug} from Firestore:`, error);
    }

    // 2. If not in Firestore, return null (Consumer will fallback to static JSONs)
    return null;
}
