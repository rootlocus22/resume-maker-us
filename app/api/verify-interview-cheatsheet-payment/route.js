import { NextResponse } from "next/server";
import stripe from "../../lib/stripe";
import { adminDb } from "../../lib/firebase";

export async function POST(request) {
  try {
    const { sessionId, userId, credits } = await request.json();

    if (!sessionId || !userId || !credits) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Verify metadata matches
    if (session.metadata?.userId !== userId) {
      return NextResponse.json(
        { error: "User mismatch" },
        { status: 400 }
      );
    }

    // Update user's interview cheatsheet credits
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const currentCredits = userDoc.data().interviewCheatsheetsRemaining || 0;
    const newCredits = currentCredits + credits;

    await userRef.update({
      interviewCheatsheetsRemaining: newCredits,
      lastInterviewCheatsheetPurchase: new Date().toISOString(),
    });

    // Log the payment
    await adminDb.collection("payment_logs").add({
      userId,
      productType: "interview_cheatsheet",
      credits,
      stripeSessionId: sessionId,
      stripePaymentIntent: session.payment_intent,
      status: "success",
      timestamp: new Date().toISOString(),
    });

    // Update order status
    const orderQuery = await adminDb
      .collection("interview_cheatsheet_orders")
      .where("sessionId", "==", sessionId)
      .limit(1)
      .get();

    if (!orderQuery.empty) {
      await orderQuery.docs[0].ref.update({
        status: "completed",
        completedAt: new Date().toISOString(),
      });
    }

    console.log(`✅ Payment verified: ${credits} interview cheatsheet credits added to user ${userId}`);

    return NextResponse.json({
      success: true,
      creditsAdded: credits,
      totalCredits: newCredits,
    });
  } catch (error) {
    console.error("Error verifying interview cheatsheet payment:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
