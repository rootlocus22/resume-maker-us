import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";
import stripe from "../../lib/stripe";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json({
        status: session.payment_status,
        error: "Payment not completed",
      }, { status: 400 });
    }

    // Check if already fulfilled by webhook
    const orderDoc = await adminDb.collection("stripe_orders").doc(sessionId).get();
    const fulfilled = orderDoc.exists && orderDoc.data()?.fulfilled;

    const meta = session.metadata || {};

    return NextResponse.json({
      status: "paid",
      fulfilled,
      sessionId: session.id,
      plan: meta.planToSet,
      billingCycle: meta.billingCycle,
      amount: session.amount_total,
      currency: (session.currency || "usd").toUpperCase(),
      customerEmail: session.customer_email || meta.paymentEmail,
      customerName: meta.paymentName,
      isStandaloneAddon: meta.isStandaloneAddon === "true",
      addonParam: meta.addonParam,
      isJobTrackerOnly: meta.isJobTrackerOnly === "true",
      includeJobTracker: meta.includeJobTracker === "true",
      includeInterviewKit: meta.includeInterviewKit === "true",
      includeApplyPro: meta.includeApplyPro === "true",
    });
  } catch (error) {
    console.error("Error verifying Stripe session:", error);
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    );
  }
}
