import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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
    console.error('Firebase Admin initialization error:', error);
  }
}

const adminDb = getFirestore();

export async function POST(request) {
  try {
    const {
      hostedId,
      status, // 'initiated', 'cancelled', 'failed'
      orderId,
      paymentId,
      error,
      customerName,
      customerEmail,
      customerContact,
      amount,
      currency,
    } = await request.json();

    if (!hostedId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: hostedId and status' },
        { status: 400 }
      );
    }

    // Get hosted resume data
    const hostedRef = adminDb.collection('hostedResumes').doc(hostedId);
    const hostedSnap = await hostedRef.get();

    if (!hostedSnap.exists) {
      return NextResponse.json({ error: 'Hosted resume not found.' }, { status: 404 });
    }

    const hostedData = hostedSnap.data();

    // Log payment attempt to payment_logs collection
    const paymentLogData = {
      userId: hostedData.sourceUserId || 'anonymous',
      userInfo: {
        name: customerName || 'Unknown',
        email: customerEmail || null,
        phone: customerContact || null,
      },
      type: 'hosted_resume_service',
      hostedId: hostedId,
      resumeName: hostedData.resumeName || 'Untitled Resume',
      currency: currency || hostedData.paymentCurrency || 'INR',
      amount: amount || hostedData.paymentAmount || 0,
      baseAmount: amount || hostedData.paymentAmount || 0,
      status: status === 'initiated' ? 'pending' : status === 'cancelled' ? 'cancelled' : 'failed',
      orderId: orderId || 'Not created',
      paymentId: paymentId || 'Not available',
      signature: 'Not available',
      error: error || null,
      cancellationReason: status === 'cancelled' ? 'User cancelled payment modal' : null,
      timestamp: FieldValue.serverTimestamp(),
    };

    await adminDb.collection('payment_logs').add(paymentLogData);

    return NextResponse.json({
      success: true,
      message: 'Payment attempt logged successfully.',
    });
  } catch (error) {
    console.error('Error logging payment attempt:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log payment attempt.' },
      { status: 500 }
    );
  }
}

