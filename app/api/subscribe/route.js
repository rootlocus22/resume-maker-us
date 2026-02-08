// /api/subscribe/route.js
import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Check if the email is in the unsubscribed_emails collection
    const unsubscribeRef = adminDb.collection("unsubscribed_emails").doc(email);
    const unsubscribeDoc = await unsubscribeRef.get();

    if (!unsubscribeDoc.exists) {
      return NextResponse.json({ message: "You are already subscribed or were never unsubscribed." }, { status: 200 });
    }

    // Remove the email from the unsubscribed_emails collection
    await unsubscribeRef.delete();

    // Log the re-subscribe event
    await adminDb.collection("email_logs").add({
      email,
      action: "resubscribe",
      status: "success",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ message: "You have successfully re-subscribed to ExpertResume emails." }, { status: 200 });
  } catch (error) {
    console.error("Failed to re-subscribe:", error);

    // Log the error
    await adminDb.collection("email_logs").add({
      email: request.body?.email || "unknown",
      action: "resubscribe",
      status: "failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Failed to re-subscribe", details: error.message },
      { status: 500 }
    );
  }
}