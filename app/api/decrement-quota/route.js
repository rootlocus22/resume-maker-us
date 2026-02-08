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
    const { userId, quotaType, amount = 1 } = await request.json();
    
    if (!userId || !quotaType) {
      return NextResponse.json({ error: "User ID and quota type required" }, { status: 400 });
    }
    
    console.log(`🔄 Decrementing ${quotaType} quota for user: ${userId} by ${amount}`);
    
    // Check if user is a team member - skip quota decrement
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const isTeamMember = userData.isTeamMember === true || 
                          userData.userType === "team_member" ||
                          userData.teamProfile?.role === "team_member" ||
                          userData.professionalProfile?.role === "team_member";
      
      if (isTeamMember) {
        console.log(`👥 User ${userId} is a team member - skipping quota decrement`);
        return NextResponse.json({ success: true, skipped: true, reason: "team_member" });
      }
    }
    
    // Update the quota document using Firebase Admin SDK
    const quotaRef = adminDb.collection(`users/${userId}/quotas`).doc('current');
    
    await quotaRef.update({
      [`usage.${quotaType}`]: FieldValue.increment(-amount), // Negative increment = decrement
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Verify the decrement worked
    const updatedDoc = await quotaRef.get();
    if (updatedDoc.exists) {
      const updatedData = updatedDoc.data();
      console.log(`✅ Quota decremented successfully. New ${quotaType} count:`, updatedData.usage[quotaType]);
    } else {
      console.error(`❌ Quota document not found for user ${userId}`);
    }
    
    console.log(`✅ Decremented ${quotaType} quota for user ${userId}`);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error decrementing quota:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
