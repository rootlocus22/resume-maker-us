import { NextResponse } from "next/server";
import { ENTERPRISE_PLANS } from "../../lib/enterprisePricing";
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }
    
    console.log(`🔍 Getting quota usage for user: ${userId}`);
    
    try {
      // Get quota data from the quotas/current document
      const quotaDoc = await adminDb.collection(`users/${userId}/quotas`).doc('current').get();
      
      if (!quotaDoc.exists) {
        throw new Error("Quota document not found");
      }
      
      const quotaData = quotaDoc.data();
      
      // Count actual documents in collections to ensure accuracy
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
      console.log("📊 Quota document counts:", quotaData.usage);
      
      // Sync quota document with real counts if they don't match
      const needsSync = Object.keys(realCounts).some(key => 
        realCounts[key] !== (quotaData.usage?.[key] || 0)
      );
      
      if (needsSync) {
        console.log("🔄 Syncing quota document with real counts");
        await adminDb.collection(`users/${userId}/quotas`).doc('current').update({
          usage: realCounts,
          updatedAt: FieldValue.serverTimestamp()
        });
        console.log("✅ Quota document synced with real counts");
      }
      
      const actualCounts = realCounts;
      
      // Use the plan data from the quota document
      const planId = quotaData.planId || 'free_trial';
      const plan = ENTERPRISE_PLANS[planId.toUpperCase()] || ENTERPRISE_PLANS.FREE_TRIAL;
      
      const quotaSummary = {
        plan: {
          id: quotaData.planId || plan.id,
          name: quotaData.planName || plan.name,
          price: plan.price,
          description: plan.description
        },
        quotas: {
          clients: {
            used: actualCounts.clients,
            limit: quotaData.limits?.maxClients || plan.limits.maxClients,
            remaining: (quotaData.limits?.maxClients || plan.limits.maxClients) === -1 ? "Unlimited" : Math.max(0, (quotaData.limits?.maxClients || plan.limits.maxClients) - actualCounts.clients)
          },
          resumeUploads: {
            used: actualCounts.resumeUploads,
            limit: quotaData.limits?.maxResumeUploads || plan.limits.maxResumeUploads,
            remaining: (quotaData.limits?.maxResumeUploads || plan.limits.maxResumeUploads) === -1 ? "Unlimited" : Math.max(0, (quotaData.limits?.maxResumeUploads || plan.limits.maxResumeUploads) - actualCounts.resumeUploads)
          },
          atsChecks: {
            used: actualCounts.atsChecks,
            limit: quotaData.limits?.maxAtsChecks || plan.limits.maxAtsChecks,
            remaining: (quotaData.limits?.maxAtsChecks || plan.limits.maxAtsChecks) === -1 ? "Unlimited" : Math.max(0, (quotaData.limits?.maxAtsChecks || plan.limits.maxAtsChecks) - actualCounts.atsChecks)
          },
          jdResumes: {
            used: actualCounts.jdResumes,
            limit: quotaData.limits?.maxJdResumes || plan.limits.maxJdResumes,
            remaining: (quotaData.limits?.maxJdResumes || plan.limits.maxJdResumes) === -1 ? "Unlimited" : Math.max(0, (quotaData.limits?.maxJdResumes || plan.limits.maxJdResumes) - actualCounts.jdResumes)
          }
          // teamMembers removed - only available for Enterprise Pro plans
        },
        resetDate: quotaData.resetDate?.toDate?.()?.toISOString()?.split('T')[0] || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      console.log("📊 Returning real-time quota summary:", quotaSummary);
      return NextResponse.json(quotaSummary);
      
    } catch (firebaseError) {
      console.error("Firebase Admin error, using fallback:", firebaseError);
      
      // Fallback to hardcoded data if Firebase Admin fails
      const plan = ENTERPRISE_PLANS.FREE_TRIAL;
      
      const quotaSummary = {
        plan: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          description: plan.description
        },
        quotas: {
          clients: {
            used: 1, // Fallback: assume 1 client
            limit: plan.limits.maxClients,
            remaining: Math.max(0, plan.limits.maxClients - 1)
          },
          resumeUploads: {
            used: 0, // Fallback: assume 0 resume uploads
            limit: plan.limits.maxResumeUploads,
            remaining: plan.limits.maxResumeUploads
          },
          atsChecks: {
            used: 1, // Fallback: assume 1 ATS check
            limit: plan.limits.maxAtsChecks,
            remaining: Math.max(0, plan.limits.maxAtsChecks - 1)
          },
          jdResumes: {
            used: 1, // Fallback: assume 1 JD resume
            limit: plan.limits.maxJdResumes,
            remaining: Math.max(0, plan.limits.maxJdResumes - 1)
          },
          teamMembers: {
            used: 0, // Fallback: assume 0 team members
            limit: plan.limits.maxTeamMembers,
            remaining: plan.limits.maxTeamMembers
          }
        },
        resetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      console.log("📊 Returning fallback quota summary:", quotaSummary);
      return NextResponse.json(quotaSummary);
    }
    
  } catch (error) {
    console.error("Error getting quota usage:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
