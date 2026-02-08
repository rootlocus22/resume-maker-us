// lib/firebase.js
import { initializeApp as initializeClientApp, getApps as getClientApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Client-side Firebase Config (for InterviewTrainer)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const clientApp = getClientApps().length === 0 ? initializeClientApp(firebaseConfig) : getClientApps()[0];
export const auth = getAuth(clientApp);
export const db = getFirestore(clientApp);
export const storage = getStorage(clientApp);

// Admin SDK export (for API routes)
let adminDb, adminStorage;
if (typeof window === "undefined") { // Ensure this runs only server-side
  const { initializeApp, getApps, cert } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");
  const { getStorage } = require("firebase-admin/storage");

  let adminApp;
  if (!getApps().length) {
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket: storageBucket
    });
  } else {
    adminApp = getApps()[0];
  }
  adminDb = getFirestore(adminApp);
  adminStorage = getStorage(adminApp);
}

export { adminDb, adminStorage };