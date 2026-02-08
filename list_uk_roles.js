const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();
db.collection('global_roles').where('country', '==', 'uk').get().then(s => {
    s.docs.forEach(doc => console.log(doc.id, doc.data().slug));
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
