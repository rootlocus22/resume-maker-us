// app/lib/firebase-admin.js
// Server-side only Firebase Admin SDK initialization

let adminDb;
let adminAuth;

// Only initialize on server-side
if (typeof window === "undefined") {
  try {
    const { initializeApp, getApps, cert } = require("firebase-admin/app");
    const { getFirestore } = require("firebase-admin/firestore");
    const { getAuth } = require("firebase-admin/auth");

    // Check if Firebase Admin is already initialized
    if (getApps().length === 0) {
      // Initialize with service account credentials
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

      // Initialize the app
      const app = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://resumemaker-b590f.firebaseio.com",
      });

      adminDb = getFirestore(app);
      adminAuth = getAuth(app);
    } else {
      // Use existing app
      adminDb = getFirestore();
      adminAuth = getAuth();
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    // Fallback: try to initialize without credentials (for development)
    try {
      const { initializeApp, getApps } = require("firebase-admin/app");
      const { getFirestore } = require("firebase-admin/firestore");
      const { getAuth } = require("firebase-admin/auth");
      
      if (getApps().length === 0) {
        const app = initializeApp({
          projectId: "resumemaker-b590f",
        });
        adminDb = getFirestore(app);
        adminAuth = getAuth(app);
      } else {
        adminDb = getFirestore();
        adminAuth = getAuth();
      }
    } catch (fallbackError) {
      console.error("Firebase Admin fallback initialization error:", fallbackError);
      throw fallbackError;
    }
  }
}

export { adminDb, adminAuth };
