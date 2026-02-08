const { adminDb } = require('./app/lib/firebase-admin');
async function check() {
    const slug = 'accountant-fresher-resume-uk';
    const countryCode = 'uk';
    const docId = `${countryCode}_${slug}`;
    const docSnap = await adminDb.collection("global_roles").doc(docId).get();
    if (docSnap.exists) {
        console.log(JSON.stringify(docSnap.data(), null, 2));
    } else {
        console.log("Document not found");
    }
    process.exit(0);
}
check();
