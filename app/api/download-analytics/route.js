// app/api/download-analytics/route.js
// Track download success/failure for analytics
import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function POST(request) {
  try {
    const data = await request.json();

    // Add server timestamp
    const logData = {
      ...data,
      serverTimestamp: new Date().toISOString(),
      createdAt: new Date(),
    };

    // Store in Firestore
    await adminDb.collection("download_analytics").add(logData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging download analytics:", error);
    return NextResponse.json(
      { error: "Failed to log analytics" },
      { status: 500 }
    );
  }
}
