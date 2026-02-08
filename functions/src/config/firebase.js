// functions/src/config/firebase.js
const admin = require("firebase-admin");

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://resumemaker-b590f.firebaseio.com",
  });
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
  if (!admin.apps.length) throw error;
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

module.exports = { db, FieldValue };