#!/usr/bin/env node
/**
 * Check Enhancement Status & Process Remaining Documents
 * Verifies how many docs are enhanced and processes any stragglers
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

if (admin.apps.length === 0) {
    const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID || "resumemaker-b590f",
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://resumemaker-b590f.firebaseio.com",
    });
}

const db = admin.firestore();

async function checkStatus() {
    console.log('🔍 Checking Enhancement Status...\n');

    try {
        // Count total documents
        const allSnapshot = await db.collection('generated_job_roles').count().get();
        const total = allSnapshot.data().count;

        // Count enhanced documents
        const enhancedSnapshot = await db.collection('generated_job_roles')
            .where('content_enhanced', '==', true)
            .count()
            .get();
        const enhanced = enhancedSnapshot.data().count;

        const remaining = total - enhanced;
        const percentComplete = ((enhanced / total) * 100).toFixed(1);

        console.log('📊 Status Report:');
        console.log(`   Total documents: ${total}`);
        console.log(`   Enhanced: ${enhanced}`);
        console.log(`   Remaining: ${remaining}`);
        console.log(`   Progress: ${percentComplete}%\n`);

        if (remaining > 0) {
            console.log(`🔧 Finding remaining documents...\n`);

            // Get list of remaining docs
            const remainingDocs = await db.collection('generated_job_roles')
                .where('content_enhanced', '!=', true)
                .limit(100)
                .get();

            console.log(`📋 Sample of ${Math.min(remainingDocs.size, 10)} remaining documents:`);
            remainingDocs.docs.slice(0, 10).forEach((doc, i) => {
                console.log(`   ${i + 1}. ${doc.id}`);
            });
            console.log();

            return { total, enhanced, remaining, remainingDocs: remainingDocs.docs };
        } else {
            console.log('✅ All documents enhanced!\n');
            return { total, enhanced, remaining: 0, remainingDocs: [] };
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

async function enhanceRemaining(docs) {
    if (docs.length === 0) {
        console.log('✅ No documents to enhance\n');
        return 0;
    }

    console.log(`🚀 Enhancing ${docs.length} remaining documents...\n`);

    const { enhanceDocument } = require('./enhance-job-roles.js');
    let count = 0;

    for (const doc of docs) {
        try {
            const data = doc.data();
            await enhanceDocument(doc.ref, data);
            count++;

            if (count % 10 === 0) {
                console.log(`   ✓ Enhanced ${count}/${docs.length}`);
            }
        } catch (error) {
            console.error(`   ❌ Error enhancing ${doc.id}:`, error.message);
        }
    }

    console.log(`\n✅ Enhanced ${count} documents\n`);
    return count;
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ENHANCEMENT STATUS CHECK & CLEANUP');
    console.log('═══════════════════════════════════════════════════════════\n');

    const status = await checkStatus();

    if (status.remaining > 0) {
        console.log(`🔧 Processing ${status.remainingDocs.length} remaining documents...\n`);
        await enhanceRemaining(status.remainingDocs);

        // Check again
        console.log('🔄 Verifying final status...\n');
        await checkStatus();
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ✅ STATUS CHECK COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
