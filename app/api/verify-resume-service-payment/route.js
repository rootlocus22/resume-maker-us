import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";
import stripe from "../../lib/stripe";

export async function POST(request) {
  try {
    const { sessionId, bookingReference } = await request.json();

    if (!sessionId || !bookingReference) {
      return NextResponse.json(
        { error: "Missing required payment details" },
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: "Payment not completed", paymentStatus: session?.payment_status },
        { status: 400 }
      );
    }

    // Verify bookingReference matches
    if (session.metadata?.bookingReference !== bookingReference) {
      return NextResponse.json(
        { error: "Booking reference mismatch" },
        { status: 400 }
      );
    }

    // Find booking in Firestore
    const bookingsRef = adminDb.collection("resume_service_bookings");
    const querySnapshot = await bookingsRef
      .where("bookingReference", "==", bookingReference)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const bookingDoc = querySnapshot.docs[0];
    const bookingData = bookingDoc.data();
    const bookingId = bookingDoc.id;

    // Prevent duplicate processing
    if (bookingData.paymentStatus === 'paid' || bookingData.paymentStatus === 'completed') {
      return NextResponse.json(
        { error: "Payment already processed", bookingReference: bookingData.bookingReference },
        { status: 400 }
      );
    }

    const paidAmount = (session.amount_total || 0) / 100;

    // Update booking status
    await adminDb.collection("resume_service_bookings").doc(bookingId).update({
      paymentStatus: 'paid',
      status: 'payment_completed',
      stripeSessionId: sessionId,
      stripePaymentIntent: session.payment_intent,
      paymentDetails: {
        amount: paidAmount,
        currency: (session.currency || 'usd').toUpperCase(),
        status: 'paid',
        createdAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    });

    // Create notification for admin team
    const whatsappMessage = `Payment Successful!\n\n` +
      `Booking Reference: ${bookingData.bookingReference}\n` +
      `Service: ${bookingData.serviceName}\n` +
      `Advance Paid: $${paidAmount}\n` +
      `Remaining: $${bookingData.remainingAmount}\n\n` +
      `Our team will contact you within 24 hours.\n\n` +
      `If you have any questions, please reach out to support.\n\n` +
      `Thank you for choosing ExpertResume!`;

    const adminNotification = {
      bookingReference: bookingData.bookingReference,
      serviceType: bookingData.serviceType,
      serviceName: bookingData.serviceName,
      customerName: bookingData.name,
      phoneNumber: bookingData.phoneNumber,
      email: bookingData.email,
      advanceAmount: bookingData.advanceAmount,
      remainingAmount: bookingData.remainingAmount,
      totalAmount: bookingData.totalAmount,
      stripeSessionId: sessionId,
      createdAt: new Date().toISOString(),
      whatsappMessage,
      status: 'new_booking',
    };

    await adminDb.collection("resume_service_notifications").add(adminNotification);

    // Create service request for agent dashboard
    const serviceRequest = {
      bookingReference: bookingData.bookingReference,
      serviceType: bookingData.serviceType,
      serviceName: bookingData.serviceName,
      customerName: bookingData.name,
      phoneNumber: bookingData.phoneNumber,
      email: bookingData.email || null,
      totalAmount: bookingData.totalAmount,
      advanceAmount: bookingData.advanceAmount,
      remainingAmount: bookingData.remainingAmount,
      advancePaid: true,
      balancePaid: false,
      stripeSessionId: sessionId,
      status: 'new',
      priority: 'normal',
      assignedTo: null,
      templateSelected: null,
      resumeLink: null,
      feedbackCount: 0,
      revisionCount: 0,
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      expectedDeliveryDate: new Date(Date.now() + (bookingData.serviceType === 'template' ? 5 : 7) * 24 * 60 * 60 * 1000).toISOString(),
    };

    await adminDb.collection("service_requests").add(serviceRequest);

    // Log success
    await adminDb.collection("server_logs").add({
      endpoint: "/api/verify-resume-service-payment",
      status: "success",
      bookingReference: bookingData.bookingReference,
      stripeSessionId: sessionId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      bookingReference: bookingData.bookingReference,
      serviceType: bookingData.serviceType,
      serviceName: bookingData.serviceName,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    await adminDb.collection("server_logs").add({
      endpoint: "/api/verify-resume-service-payment",
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
