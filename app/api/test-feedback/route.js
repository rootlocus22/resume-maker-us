// Test API to verify feedback saving and fetching
import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function GET(request) {
  try {
    // Fetch the most recent feedback entry
    const feedbackSnapshot = await adminDb
      .collection("feedback")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (feedbackSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: "No feedback found in database",
        count: 0
      });
    }

    const latestFeedback = feedbackSnapshot.docs[0].data();
    
    return NextResponse.json({
      success: true,
      message: "Latest feedback retrieved successfully",
      feedback: {
        id: feedbackSnapshot.docs[0].id,
        ...latestFeedback,
        timestamp: latestFeedback.timestamp?.toDate?.()?.toISOString() || latestFeedback.timestamp
      },
      count: feedbackSnapshot.size
    });
  } catch (error) {
    console.error("Error fetching test feedback:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Create a test feedback entry
    const testFeedback = {
      userId: body.userId || 'test_user',
      name: body.name || 'Test User',
      email: body.email || 'test@example.com',
      rating: body.rating || 5,
      comment: body.comment || 'Test feedback from API',
      feedbackType: body.feedbackType || 'general',
      context: body.context || 'test',
      source: 'test_api',
      timestamp: new Date(),
      pageUrl: body.pageUrl || 'http://localhost:3000/test',
      userAgent: body.userAgent || 'Test Agent',
      screenResolution: '1920x1080',
      timezone: 'UTC',
      language: 'en',
      platform: 'test'
    };

    // Save to Firestore
    const docRef = await adminDb.collection("feedback").add(testFeedback);

    // Fetch it back to verify
    const savedDoc = await adminDb.collection("feedback").doc(docRef.id).get();
    const savedData = savedDoc.data();

    return NextResponse.json({
      success: true,
      message: "Test feedback saved and verified",
      savedId: docRef.id,
      savedData: {
        ...savedData,
        timestamp: savedData.timestamp?.toDate?.()?.toISOString() || savedData.timestamp
      },
      original: testFeedback
    });
  } catch (error) {
    console.error("Error saving test feedback:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
