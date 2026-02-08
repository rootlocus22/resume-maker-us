import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

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
const adminAuth = getAuth();

export async function GET(request) {
  try {
    // Check if user is admin (rahuldubey220890@gmail.com)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the Firebase ID token
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check if user is admin by checking agent_admin attribute in Firestore
    try {
      const userRef = adminDb.collection('users').doc(decodedToken.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const userData = userDoc.data();
      const isAgentAdmin = userData.agent_admin === true;

      console.log('🔍 Admin API Check:', {
        userEmail: decodedToken.email,
        agent_admin: userData.agent_admin,
        isAgentAdmin
      });

      if (!isAgentAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }

    // Get all hosted resumes using Admin SDK
    const hostedResumesRef = adminDb.collection('hostedResumes');
    const querySnapshot = await hostedResumesRef.orderBy('createdAt', 'desc').get();

    // Get payment logs for hosted resume service payments
    const paymentLogsSnapshot = await adminDb
      .collection('payment_logs')
      .where('type', '==', 'hosted_resume_service')
      .get();

    // Create a map of hostedId -> payment info
    const paymentMap = new Map();
    paymentLogsSnapshot.forEach((doc) => {
      const paymentData = doc.data();
      const hostedId = paymentData.hostedId;
      if (hostedId) {
        if (!paymentMap.has(hostedId)) {
          paymentMap.set(hostedId, []);
        }
        const timestamp = paymentData.timestamp?.toDate?.() || paymentData.timestamp || new Date();
        paymentMap.get(hostedId).push({
          ...paymentData,
          timestamp: timestamp instanceof Date ? timestamp.toISOString() : timestamp,
        });
      }
    });

    // Sort payment logs by timestamp (most recent first) for each hosted resume
    paymentMap.forEach((payments, hostedId) => {
      payments.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
    });

    const hostedResumes = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Support both old format (data.name) and new format (resumeName)
      const resumeName = data.resumeName || data.data?.name || data.snapshotData?.name || 'Untitled Resume';

      // Convert Firestore Timestamp to ISO string for proper JSON serialization
      let createdAt = null;
      if (data.createdAt) {
        if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
          // Firestore Timestamp
          createdAt = data.createdAt.toDate().toISOString();
        } else if (data.createdAt instanceof Date) {
          createdAt = data.createdAt.toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAt = data.createdAt;
        } else {
          // Try to parse as date
          try {
            createdAt = new Date(data.createdAt).toISOString();
          } catch (e) {
            createdAt = null;
          }
        }
      }

      // Get payment information for this hosted resume from payment_logs collection
      const payments = paymentMap.get(doc.id) || [];
      const latestPayment = payments.length > 0 ? payments[0] : null;
      const successfulPayment = payments.find(p => p.status === 'success') || null;
      const pendingPayment = payments.find(p => p.status === 'pending') || null;
      const failedPayment = payments.find(p => p.status === 'failed') || null;
      const cancelledPayment = payments.find(p => p.status === 'cancelled') || null;

      // Extract payment details from hosted resume data (real data from Firestore only)
      const paymentDetails = data.paymentDetails || null;
      // Only use paymentAmount if it exists in Firestore, don't default to 0
      const paymentAmount = data.paymentAmount !== undefined && data.paymentAmount !== null ? data.paymentAmount : null;
      // Only use paymentCurrency if it exists in Firestore
      const paymentCurrency = data.paymentCurrency || null;
      // Only use paymentStatus if it exists in Firestore, don't default to 'pending'
      const paymentStatus = data.paymentStatus || null;

      // Determine if this is a one-pager resume
      const isOnePager =
        data.resumeType === 'one-pager' ||
        data.isOnePager === true ||
        data.builderType === 'one-pager-builder' ||
        (data.metadata && data.metadata.createdBy === 'one-pager-builder');

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const hostedUrl = isOnePager
        ? `${baseUrl}/hosted-one-pager/${doc.id}`
        : `${baseUrl}/hosted-resume/${doc.id}`;

      hostedResumes.push({
        hostedId: doc.id,
        resumeName: resumeName,
        downloadEnabled: data.downloadEnabled || false,
        locked: data.locked || false,
        editEnabled: data.editEnabled || false,
        sourceUserId: data.sourceUserId || null,
        createdAt: createdAt,
        expiresAt: data.expiresAt,
        isActive: data.isActive,
        sourceResumeId: data.sourceResumeId || null,
        useDynamicData: data.useDynamicData || false,
        hostedUrl: hostedUrl,
        // Payment information
        paymentAmount: paymentAmount,
        paymentCurrency: paymentCurrency,
        paymentStatus: paymentStatus,
        paymentDetails: paymentDetails,
        paymentLogs: payments,
        latestPayment: latestPayment,
        successfulPayment: successfulPayment,
        pendingPayment: pendingPayment,
        failedPayment: failedPayment,
        cancelledPayment: cancelledPayment,
      });
    });

    return NextResponse.json({
      success: true,
      hostedResumes
    });

  } catch (error) {
    console.error('Error fetching hosted resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hosted resumes' },
      { status: 500 }
    );
  }
}
