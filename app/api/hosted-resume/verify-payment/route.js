import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import stripe from '../../../lib/stripe';

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
      sessionId,
      customerName,
      customerEmail,
      customerContact,
    } = await request.json();

    if (!hostedId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required payment details.' },
        { status: 400 }
      );
    }

    const hostedRef = adminDb.collection('hostedResumes').doc(hostedId);
    const hostedSnap = await hostedRef.get();

    if (!hostedSnap.exists) {
      return NextResponse.json({ error: 'Hosted resume not found.' }, { status: 404 });
    }

    const hostedData = hostedSnap.data();

    if (hostedData.paymentStatus === 'paid' && hostedData.downloadEnabled) {
      return NextResponse.json({
        success: true,
        message: 'Payment already processed.',
      });
    }

    // Retrieve Stripe session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed.', paymentStatus: session?.payment_status },
        { status: 400 }
      );
    }

    // Verify hostedId matches
    if (session.metadata?.hostedId !== hostedId) {
      return NextResponse.json(
        { error: 'Payment does not match this resume.' },
        { status: 400 }
      );
    }

    const paidAmount = (session.amount_total || 0) / 100;
    const currencyUpper = (session.currency || 'usd').toUpperCase();

    // Verify amount matches
    if (hostedData.paymentAmount && Math.abs(paidAmount - hostedData.paymentAmount) > 0.5) {
      return NextResponse.json(
        { error: 'Paid amount does not match expected amount.' },
        { status: 400 }
      );
    }

    await hostedRef.update({
      downloadEnabled: true,
      paymentStatus: 'paid',
      locked: false,
      latestPaymentOrder: {
        ...(hostedData.latestPaymentOrder || {}),
        sessionId: sessionId,
        paymentIntent: session.payment_intent,
        status: 'paid',
        paidAt: FieldValue.serverTimestamp(),
      },
      paymentDetails: {
        sessionId: sessionId,
        paymentIntent: session.payment_intent,
        amount: paidAmount,
        currency: currencyUpper,
        status: 'paid',
        email: customerEmail || session.customer_email || null,
        contact: customerContact || null,
        createdAt: new Date().toISOString(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Log payment
    try {
      await adminDb.collection('payment_logs').add({
        userId: hostedData.sourceUserId || 'anonymous',
        userInfo: {
          name: customerName || 'Unknown',
          email: customerEmail || session.customer_email || null,
          phone: customerContact || null,
        },
        type: 'hosted_resume_service',
        hostedId,
        resumeName: hostedData.resumeName || 'Untitled Resume',
        currency: currencyUpper,
        amount: paidAmount,
        status: 'success',
        stripeSessionId: sessionId,
        stripePaymentIntent: session.payment_intent,
        timestamp: FieldValue.serverTimestamp(),
      });
    } catch (logError) {
      console.error('Failed to log payment:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully.',
    });
  } catch (error) {
    console.error('Error verifying hosted resume payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment.' },
      { status: 500 }
    );
  }
}
