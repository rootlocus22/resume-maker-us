// app/api/feedback/feature-request/route.js
// Handle feature request voting and submission
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 50;

    // Fetch feature requests sorted by votes
    const featureRequestsSnapshot = await adminDb
      .collection("feature_requests")
      .orderBy("votes", "desc")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const featureRequests = featureRequestsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return NextResponse.json({ success: true, featureRequests });
  } catch (error) {
    console.error("Error fetching feature requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feature requests" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { title, description, userId, userName, userEmail } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Check if similar feature request already exists
    const existingRequests = await adminDb
      .collection("feature_requests")
      .where("title", "==", title)
      .limit(1)
      .get();

    if (!existingRequests.empty) {
      const existing = existingRequests.docs[0];
      return NextResponse.json({
        success: true,
        featureRequestId: existing.id,
        message: "Similar feature request already exists",
        existing: true,
      });
    }

    // Create new feature request
    const featureRequestRef = await adminDb.collection("feature_requests").add({
      title,
      description,
      userId: userId || "anonymous",
      userName: userName || "Anonymous",
      userEmail: userEmail || null,
      votes: 1, // Creator automatically votes
      voters: userId ? [userId] : [],
      status: "under_review",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      featureRequestId: featureRequestRef.id,
      message: "Feature request submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting feature request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit feature request" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { featureRequestId, userId, action } = await request.json();

    if (!featureRequestId || !userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const featureRequestRef = adminDb.collection("feature_requests").doc(featureRequestId);
    const featureRequestDoc = await featureRequestRef.get();

    if (!featureRequestDoc.exists) {
      return NextResponse.json(
        { error: "Feature request not found" },
        { status: 404 }
      );
    }

    const featureRequest = featureRequestDoc.data();
    const voters = featureRequest.voters || [];
    const currentVotes = featureRequest.votes || 0;

    if (action === "vote") {
      if (voters.includes(userId)) {
        return NextResponse.json(
          { error: "You have already voted for this feature" },
          { status: 400 }
        );
      }
      await featureRequestRef.update({
        votes: currentVotes + 1,
        voters: [...voters, userId],
        updatedAt: new Date(),
      });
    } else if (action === "unvote") {
      if (!voters.includes(userId)) {
        return NextResponse.json(
          { error: "You haven't voted for this feature" },
          { status: 400 }
        );
      }
      await featureRequestRef.update({
        votes: Math.max(0, currentVotes - 1),
        voters: voters.filter((id) => id !== userId),
        updatedAt: new Date(),
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Feature request ${action === "vote" ? "voted" : "unvoted"} successfully`,
    });
  } catch (error) {
    console.error("Error voting on feature request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to vote on feature request" },
      { status: 500 }
    );
  }
}
