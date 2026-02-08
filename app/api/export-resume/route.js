import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { v4 as uuidv4 } from 'uuid';
import { cleanResumeDataForFirebase } from '../../lib/utils';

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
    let { 
      resumeData, 
      template, 
      customColors, 
      language, 
      country, 
      preferences, 
      resumeName, 
      resumeId,
      paymentAmount,
      paymentCurrency
    } = await request.json();
    
    // Fix: If resumeData has a nested resumeData field, flatten it before saving
    if (resumeData && resumeData.resumeData && typeof resumeData.resumeData === 'object') {
      console.log('⚠️ Detected nested resumeData in export request, flattening...');
      resumeData = resumeData.resumeData;
    }
    
    // Clean resume data to remove undefined values and handle large base64 images
    console.log('🧹 Cleaning resume data before export...');
    resumeData = cleanResumeDataForFirebase(resumeData);
    
    // Check if user is admin (rahuldubey220890@gmail.com)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user data
    let user;
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      user = decodedToken;
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        { error: "Invalid authentication token." },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminEmails = ['rahuldubey220890@gmail.com', 'ebupthaan601@gmail.com', 'shilesh.50025@gmail.com', 'gopipandey.dev@gmail.com'];
    if (!adminEmails.includes(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Normalize payment amount and currency
    let normalizedPaymentAmount = 0;
    if (typeof paymentAmount === 'string' && paymentAmount.trim() !== '') {
      normalizedPaymentAmount = parseFloat(paymentAmount);
    } else if (typeof paymentAmount === 'number') {
      normalizedPaymentAmount = paymentAmount;
    }

    if (Number.isNaN(normalizedPaymentAmount) || normalizedPaymentAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount provided.' },
        { status: 400 }
      );
    }

    normalizedPaymentAmount = Number(normalizedPaymentAmount.toFixed(2));
    const normalizedPaymentCurrency = (paymentCurrency || 'INR').toUpperCase();
    
    // Generate unique ID for hosted resume or reuse existing if updating
    const hostedId = uuidv4();
    
    // Clean customColors and preferences to remove undefined values
    const cleanedCustomColors = cleanResumeDataForFirebase(customColors || {});
    const cleanedPreferences = cleanResumeDataForFirebase(preferences || {});
    
    // Prepare the hosted resume data with source reference
    const hostedResumeData = {
      // Source resume reference for dynamic updates
      sourceResumeId: resumeId || null,
      sourceUserId: resumeData.userId || user.uid || null,
      
      // Metadata for template/preferences
      template: template || 'modern_professional',
      customColors: cleanedCustomColors,
      language: language || 'en',
      country: country || 'in',
      preferences: cleanedPreferences,
      resumeName: resumeName || 'Resume',
      
      // Optional static snapshot (fallback if source is deleted)
      // Store pure resume data with template settings, but don't override resume fields
      snapshotData: cleanResumeDataForFirebase({
        ...resumeData,
        template: template || resumeData.template || 'modern_professional',
        customColors: cleanedCustomColors,
        language: language || resumeData.language || 'en',
        country: country || resumeData.country || 'in',
        preferences: cleanedPreferences
        // Note: Do NOT override name, summary, or other resume content fields
      }),
      
      // Settings
      downloadEnabled: normalizedPaymentAmount === 0,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now as ISO string
      originalUserId: resumeData.userId || user.uid || null,
      isActive: true,
      useDynamicData: true, // Always fetch latest from source
      paymentAmount: normalizedPaymentAmount,
      paymentCurrency: normalizedPaymentCurrency,
      paymentStatus: normalizedPaymentAmount > 0 ? 'pending' : 'not_required',
      latestPaymentOrder: null,
      locked: false
    };

    console.log('📤 Exporting hosted resume:', {
      hostedId,
      sourceResumeId: resumeId,
      sourceUserId: hostedResumeData.sourceUserId,
      resumeName
    });

    // Save to Firestore using Admin SDK
    const hostedResumeRef = adminDb.collection('hostedResumes').doc(hostedId);
    await hostedResumeRef.set(hostedResumeData);

    // Return the hosted URL
    const hostedUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/hosted-resume/${hostedId}`;

    return NextResponse.json({
      success: true,
      hostedId,
      hostedUrl,
      message: 'Resume exported successfully'
    });

  } catch (error) {
    console.error('Error exporting resume:', error);
    return NextResponse.json(
      { error: 'Failed to export resume' },
      { status: 500 }
    );
  }
}
