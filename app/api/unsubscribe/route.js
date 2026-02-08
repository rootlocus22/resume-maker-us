// /api/unsubscribe/route.js
import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

// Handle GET requests to unsubscribe
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Check if the email is already unsubscribed
    const unsubscribeRef = adminDb.collection("unsubscribed_emails").doc(email);
    const unsubscribeDoc = await unsubscribeRef.get();

    if (unsubscribeDoc.exists) {
      return NextResponse.json({ message: "You are already unsubscribed." }, { status: 200 });
    }

    // Add the email to the unsubscribed_emails collection
    await unsubscribeRef.set({
      email,
      unsubscribedAt: new Date().toISOString(),
    });

    // Log the unsubscribe event
    await adminDb.collection("email_logs").add({
      email,
      action: "unsubscribe",
      status: "success",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ message: "You have successfully unsubscribed from ExpertResume emails." }, { status: 200 });
  } catch (error) {
    console.error("Failed to unsubscribe:", error);

    // Log the error
    await adminDb.collection("email_logs").add({
      email: request.url?.searchParams?.get("email") || "unknown",
      action: "unsubscribe",
      status: "failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Failed to unsubscribe", details: error.message },
      { status: 500 }
    );
  }
}