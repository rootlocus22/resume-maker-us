const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const SERVICE_ACCOUNT_KEY = process.env.FIREBASE_PRIVATE_KEY
    ? {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
    : null;

if (getApps().length === 0) {
    initializeApp({ credential: cert(SERVICE_ACCOUNT_KEY) });
}

const db = getFirestore();

async function listRoles() {
    console.log("🔍 Checking Firestore 'global_roles'...");
    const snap = await db.collection('global_roles').limit(10).get();

    if (snap.empty) {
        console.log("❌ No documents found!");
    } else {
        console.log(`✅ Found ${snap.size} docs. First 10 IDs:`);
        snap.forEach(doc => {
            console.log(` - ${doc.id}`);
        });
    }
}

listRoles();
