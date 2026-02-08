const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const SERVICE_ACCOUNT_KEY = process.env.FIREBASE_PRIVATE_KEY
    ? {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
    : null;

if (!SERVICE_ACCOUNT_KEY) {
    console.error("❌ Fatal: Missing Firebase credentials in .env.local");
    process.exit(1);
}

if (getApps().length === 0) {
    initializeApp({
        credential: cert(SERVICE_ACCOUNT_KEY),
    });
}

const db = getFirestore();

async function migrateRoles(countryCode, filePath) {
    console.log(`🚀 Starting migration for [${countryCode}] from ${filePath}...`);

    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const roles = JSON.parse(rawData);

        console.log(`📋 Found ${roles.length} roles to migrate.`);

        const batch = db.batch();
        let count = 0;

        for (const role of roles) {
            // Create a unique document ID: {country}_{slug}
            // e.g., us_software-engineer-resume-usa
            const docId = `${countryCode}_${role.slug}`;
            const docRef = db.collection('global_roles').doc(docId);

            // Ensure country code is set correctly in data
            const roleData = {
                ...role,
                country: countryCode,
                updated_at: new Date().toISOString(),
                migration_source: 'script_v1'
            };

            batch.set(docRef, roleData);
            console.log(`   - Staging: ${docId}`);
            count++;
        }

        // Commit batch
        await batch.commit();
        console.log(`✅ Successfully migrated ${count} roles to 'global_roles' collection.`);

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

// Execute
// Execute
const DATA_DIR = path.join(process.cwd(), 'data/global');

async function runAllMigrations() {
    const migrations = [
        { code: 'us', file: 'us_roles.json' },
        { code: 'uk', file: 'uk_roles.json' },
        { code: 'ca', file: 'ca_roles.json' },
        { code: 'au', file: 'au_roles.json' }
    ];

    for (const m of migrations) {
        const filePath = path.join(DATA_DIR, m.file);
        if (fs.existsSync(filePath)) {
            await migrateRoles(m.code, filePath);
        } else {
            console.warn(`⚠️ Skipped ${m.code}: File not found at ${filePath}`);
        }
    }
}

runAllMigrations();
