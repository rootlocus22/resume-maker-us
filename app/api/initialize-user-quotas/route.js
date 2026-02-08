import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: require('firebase-admin').credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = getFirestore();

export async function POST(request) {
  try {
    const { userId, planType, resetQuotas = false } = await request.json();

    if (!userId || !planType) {
      return NextResponse.json({ error: 'Missing userId or planType' }, { status: 400 });
    }

    console.log(`🔄 Initializing quotas for user ${userId} with plan ${planType}, reset: ${resetQuotas}`);

    // Get plan limits from enterprise pricing
    const { ENTERPRISE_PLANS } = await import('../../lib/enterprisePricing');
    
    // Map planType to correct key
    const planKeyMapping = {
      'starter_pro': 'STARTER_PRO',
      'business_pro': 'BUSINESS_PRO',
      'enterprise_pro': 'ENTERPRISE_PRO',
      'free_trial': 'FREE_TRIAL'
    };
    
    const planKey = planKeyMapping[planType] || planType;
    const plan = ENTERPRISE_PLANS[planKey];
    
    if (!plan) {
      return NextResponse.json({ error: `Plan ${planType} not found` }, { status: 400 });
    }

    // Count current usage from collections
    const [clientsSnapshot, uploadHistorySnapshot, atsCheckerHistorySnapshot, jdResumesSnapshot] = await Promise.all([
      adminDb.collection(`users/${userId}/clients`).get(),
      adminDb.collection(`users/${userId}/uploadHistory`).get(),
      adminDb.collection(`users/${userId}/atsCheckerHistory`).get(),
      adminDb.collection(`users/${userId}/jdResumes`).get()
    ]);

    const currentUsage = {
      clients: clientsSnapshot.size,
      resumeUploads: uploadHistorySnapshot.size,
      atsChecks: atsCheckerHistorySnapshot.size,
      jdResumes: jdResumesSnapshot.size
    };

    // If resetQuotas is true, reset usage to 0, otherwise keep current usage
    const usage = resetQuotas ? {
      clients: 0,
      resumeUploads: 0,
      atsChecks: 0,
      jdResumes: 0,
      teamMembers: 0
    } : {
      ...currentUsage,
      teamMembers: 0
    };

    // Calculate reset date (30 days from now)
    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + 30);

    // Create quota document
    const quotaData = {
      planId: plan.id,
      planName: plan.name,
      limits: {
        maxClients: plan.limits.maxClients,
        maxResumeUploads: plan.limits.maxResumeUploads,
        maxAtsChecks: plan.limits.maxAtsChecks,
        maxJdResumes: plan.limits.maxJdResumes,
        maxTeamMembers: plan.limits.maxTeamMembers
      },
      usage,
      resetDate: resetDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save quota document
    await adminDb.collection(`users/${userId}/quotas`).doc('current').set(quotaData);

    console.log(`✅ Quotas initialized for user ${userId}:`, quotaData);

    return NextResponse.json({ 
      success: true, 
      message: 'Quotas initialized successfully',
      quotaData 
    });

  } catch (error) {
    console.error('❌ Error initializing quotas:', error);
    return NextResponse.json({ 
      error: 'Failed to initialize quotas', 
      details: error.message 
    }, { status: 500 });
  }
}
