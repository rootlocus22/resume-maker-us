import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";
import stripe from "../../lib/stripe";

export async function POST(request) {
  try {
    const {
      amount,
      currency,
      bookingReference,
      serviceType,
      serviceName,
      totalAmount,
      advanceAmount,
      phoneNumber,
      name,
      email,
      yearsOfExperience,
      origin = '',
    } = await request.json();

    // Validate required fields
    if (!amount || !currency || !bookingReference || !serviceType || !serviceName || !phoneNumber || !name) {
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
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Resume Service - ${serviceName}`,
              description: `Advance payment for ${serviceName}`,
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=resume_service&ref=${bookingReference}`,
      cancel_url: `${baseUrl}/resume-services?cancelled=true`,
      metadata: {
        type: 'resume_service',
        bookingReference,
        serviceType,
        serviceName,
        totalAmount: String(totalAmount),
        advanceAmount: String(advanceAmount),
        phoneNumber,
        customerName: name,
        customerEmail: email || '',
      },
    });

    // Save booking to Firestore
    const bookingData = {
      bookingReference,
      serviceType,
      serviceName,
      totalAmount,
      advanceAmount,
      remainingAmount: totalAmount - advanceAmount,
      phoneNumber,
      name,
      email: email || null,
      yearsOfExperience: yearsOfExperience || 0,
      stripeSessionId: session.id,
      status: 'pending_payment',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection("resume_service_bookings").add(bookingData);

    // Log the session creation
    await adminDb.collection("server_logs").add({
      endpoint: "/api/create-resume-service-order",
      status: "success",
      bookingReference,
      sessionId: session.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      bookingReference,
    });
  } catch (error) {
    console.error("Checkout session creation error:", error);

    await adminDb.collection("server_logs").add({
      endpoint: "/api/create-resume-service-order",
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
