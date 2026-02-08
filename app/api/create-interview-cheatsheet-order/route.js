import { NextResponse } from "next/server";
import stripe from "../../lib/stripe";
import { adminDb } from "../../lib/firebase";

export async function POST(request) {
  try {
    const {
      planId,
      credits,
      amount,
      currency,
      userId,
      userEmail,
      userName,
      origin = '',
    } = await request.json();

    if (!planId || !credits || !amount || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: (currency || 'usd').toLowerCase(),
            product_data: {
              name: `Interview Cheatsheet - ${credits} Credits`,
              description: `${credits} interview cheatsheet generation credits`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=interview_cheatsheet`,
      cancel_url: `${baseUrl}/interview-prep-kit?cancelled=true`,
      metadata: {
        type: 'interview_cheatsheet',
        planId,
        credits: credits.toString(),
        userId,
        userEmail: userEmail || '',
        userName: userName || '',
      },
    });

    // Log order creation
    await adminDb.collection("interview_cheatsheet_orders").add({
      sessionId: session.id,
      planId,
      credits,
      amount,
      currency: currency || "USD",
      userId,
      userEmail,
      userName,
      status: "created",
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Interview cheatsheet checkout session created: ${session.id} for user ${userId}`);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      amount,
      currency: currency || "USD",
    });
  } catch (error) {
    console.error("Error creating interview cheatsheet checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
