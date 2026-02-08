require('dotenv').config({ path: '.env.local' });
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (Reuse logic)
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || "resumemaker-b590f",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function checkRole() {
    const slug = 'junior-java-developer-resume-india';
    console.log(`Checking Firestore for: ${slug}`);

    const doc = await db.collection('generated_job_roles').doc(slug).get();

    if (!doc.exists) {
        console.log("❌ Role not found in Firestore.");
    } else {
        const data = doc.data();
        console.log("✅ Role found.");
        console.log("--- Fields ---");
        console.log(`Job Title: ${data.job_title}`);
        console.log(`Day in Life: ${data.day_in_life ? (data.day_in_life.substring(0, 50) + '...') : 'MISSING'}`);
        console.log(`Career Path: ${data.career_path ? JSON.stringify(data.career_path) : 'MISSING'}`);
        console.log(`Salary: ${data.salary_breakdown ? JSON.stringify(data.salary_breakdown) : 'MISSING'}`);
        console.log(`Tech Stack: ${data.tech_stack_breakdown ? JSON.stringify(data.tech_stack_breakdown) : 'MISSING'}`);
    }
}

checkRole();
