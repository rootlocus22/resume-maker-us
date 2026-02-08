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

const currencyDecimalMap = {
  JPY: 1,
  KRW: 1,
  VND: 1,
};

export async function POST(request) {
  try {
    const { hostedId, customerName, customerEmail, customerContact, origin = '' } = await request.json();

    if (!hostedId) {
      return NextResponse.json({ error: 'Hosted resume ID is required.' }, { status: 400 });
    }

    const hostedRef = adminDb.collection('hostedResumes').doc(hostedId);
    const hostedSnap = await hostedRef.get();

    if (!hostedSnap.exists) {
      return NextResponse.json({ error: 'Hosted resume not found.' }, { status: 404 });
    }

    const hostedData = hostedSnap.data();

    if (hostedData.paymentStatus === 'paid' || hostedData.downloadEnabled === true) {
      return NextResponse.json(
        { error: 'Payment already completed for this resume.' },
        { status: 400 }
      );
    }

    const paymentAmount = hostedData.paymentAmount ?? 0;
    const paymentCurrency = (hostedData.paymentCurrency || 'USD').toUpperCase();

    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Payment is not required for this resume download.' },
        { status: 400 }
      );
    }

    const multiplier = currencyDecimalMap[paymentCurrency] || 100;
    const amountInSubunits = Math.round(paymentAmount * multiplier);

    if (amountInSubunits <= 0) {
      return NextResponse.json(
        { error: 'Calculated payment amount is invalid.' },
        { status: 400 }
      );
    }

    const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: paymentCurrency.toLowerCase(),
            product_data: {
              name: 'Resume Download',
              description: `Download: ${hostedData.resumeName || 'Resume'}`,
            },
            unit_amount: amountInSubunits,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/hosted-resume/${hostedId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/hosted-resume/${hostedId}?payment=cancelled`,
      metadata: {
        type: 'hosted_resume',
        hostedId,
        resumeName: hostedData.resumeName || '',
        customerName: customerName || '',
        customerEmail: customerEmail || '',
        customerContact: customerContact || '',
      },
    });

    await hostedRef.update({
      latestPaymentOrder: {
        sessionId: session.id,
        amount: amountInSubunits,
        currency: paymentCurrency,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerContact: customerContact || null,
      },
      paymentStatus: hostedData.paymentStatus === 'paid' ? 'paid' : 'pending',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      amount: amountInSubunits,
      currency: paymentCurrency,
    });
  } catch (error) {
    console.error('Error creating hosted resume checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
