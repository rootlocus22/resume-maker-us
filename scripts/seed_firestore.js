require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// --- 1. Initialize Firebase Admin ---
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || "resumemaker-b590f",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Check if keys are present (basic validation)
if (!serviceAccount.privateKey || !serviceAccount.clientEmail) {
    console.error("❌ Missing Firebase credentials. Please check .env.local");
    console.log("Expected: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL");
    process.exit(1);
}

const app = initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore(app);

// --- 2. Load Data ---
const dataPath = path.join(__dirname, '../app/data/generated_roles.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const roles = JSON.parse(rawData);

console.log(`Loaded ${roles.length} roles from JSON.`);

// --- 3. Batch Upload ---
const BATCH_SIZE = 400; // specific batch limit is 500
const COLLECTION_NAME = 'generated_job_roles';

async function uploadData() {
    const total = roles.length;
    let batchCount = 0;

    // We will extract slugs for the lightweight map
    const slugMap = [];

    for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = db.batch();
        const chunk = roles.slice(i, i + BATCH_SIZE);

        chunk.forEach(role => {
            const docRef = db.collection(COLLECTION_NAME).doc(role.slug);
            batch.set(docRef, role);

            // Add to slug map
            slugMap.push({
                slug: role.slug,
                lastModified: new Date().toISOString()
            });
        });

        await batch.commit();
        batchCount++;
        process.stdout.write(`\r✅ Uploaded batch ${batchCount}/${Math.ceil(total / BATCH_SIZE)} (${Math.min(i + BATCH_SIZE, total)}/${total})`);
    }

    console.log(`\n🎉 Successfully uploaded ${total} roles to Firestore '${COLLECTION_NAME}'`);

    // --- 4. Write Lightweight Sitemap Source ---
    const sitemapPath = path.join(__dirname, '../app/data/generated_slugs.json');
    fs.writeFileSync(sitemapPath, JSON.stringify(slugMap, null, 2));
    console.log(`📝 Created lightweight sitemap source: ${sitemapPath} (${(fs.statSync(sitemapPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

uploadData().catch(console.error);
