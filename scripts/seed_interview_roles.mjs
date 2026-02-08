import { getExpandedRoles } from '../app/lib/ai-interview/roleExpander.js';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Service Account
const SERVICE_ACCOUNT_KEY = process.env.FIREBASE_PRIVATE_KEY
    ? {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
    : null;

if (!SERVICE_ACCOUNT_KEY) {
    console.error("❌ Missing Firebase credentials");
    process.exit(1);
}

if (getApps().length === 0) {
    initializeApp({ credential: cert(SERVICE_ACCOUNT_KEY) });
}

const db = getFirestore();

async function seed() {
    console.log("🚀 Starting Interview Roles Seeding...");

    // 1. Get Expanded & Enriched Roles
    const roles = getExpandedRoles();
    console.log(`📊 Found ${roles.length} roles to seed (Base + Variants).`);

    const batchSize = 400;
    let batch = db.batch();
    let count = 0;
    let total = 0;

    for (const role of roles) {
        // Doc ID = slug
        const docRef = db.collection('interview_roles').doc(role.slug);

        // Add timestamps
        const payload = {
            ...role,
            updatedAt: new Date().toISOString(),
            isProgrammatic: true
        };

        batch.set(docRef, payload, { merge: true });
        count++;
        total++;

        if (count >= batchSize) {
            await batch.commit();
            console.log(`💾 Committed batch of ${count} roles...`);
            batch = db.batch();
            count = 0;
        }
    }

    if (count > 0) {
        await batch.commit();
    }

    console.log(`✅ Successfully seeded ${total} interview roles!`);
    console.log("Verify in Dashboard: /admin/pseo");
    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
