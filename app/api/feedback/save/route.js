// API endpoint to save feedback (server-side, bypasses Firestore security rules)
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.comment && !body.rating) {
      return NextResponse.json(
        { success: false, error: "Rating or comment is required" },
        { status: 400 }
      );
    }

    // Prepare feedback data
    const feedbackData = {
      userId: body.userId || 'anonymous',
      name: body.name || 'Anonymous',
      email: body.email || null,
      rating: body.rating || null,
      comment: body.comment?.trim() || 'No comment provided',
      feedbackType: body.feedbackType || 'general',
      context: body.context || 'general',
      source: body.source || 'api',
      timestamp: new Date(),
      // Additional metadata
      userAgent: body.userAgent || null,
      pageUrl: body.pageUrl || null,
      referrer: body.referrer || null,
      screenResolution: body.screenResolution || null,
      timezone: body.timezone || null,
      language: body.language || null,
      platform: body.platform || null,
      // Additional fields from different sources
      downloadSuccess: body.downloadSuccess || null,
      resumeName: body.resumeName || null,
    };

    // Save to Firestore using admin SDK (bypasses security rules)
    const docRef = await adminDb.collection("feedback").add(feedbackData);

    return NextResponse.json({
      success: true,
      message: "Feedback saved successfully",
      id: docRef.id
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
}
