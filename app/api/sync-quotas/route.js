import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

const adminDb = getFirestore();

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }
    
    console.log(`🔄 Manually syncing quotas for user: ${userId}`);
    
    // Count actual documents in collections
    const [clientsSnapshot, uploadHistorySnapshot, atsCheckerHistorySnapshot, jdResumeHistorySnapshot] = await Promise.all([
      adminDb.collection(`users/${userId}/clients`).get(),
      adminDb.collection(`users/${userId}/uploadHistory`).get(),
      adminDb.collection(`users/${userId}/atsCheckerHistory`).get(),
      adminDb.collection(`users/${userId}/jdResumeHistory`).get()
    ]);
    
    const realCounts = {
      clients: clientsSnapshot.size,
      resumeUploads: uploadHistorySnapshot.size,
      atsChecks: atsCheckerHistorySnapshot.size,
      jdResumes: jdResumeHistorySnapshot.size
      // teamMembers removed - only available for Enterprise Pro plans
    };
    
    console.log("📊 Real counts from collections:", realCounts);
    
    // Update quota document with real counts
    await adminDb.collection(`users/${userId}/quotas`).doc('current').update({
      usage: realCounts,
      updatedAt: FieldValue.serverTimestamp()
    });
    
    console.log("✅ Quotas synced successfully");
    
    return NextResponse.json({
      success: true,
      message: "Quotas synced successfully",
      realCounts
    });
    
  } catch (error) {
    console.error("Error syncing quotas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
