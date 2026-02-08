// /api/feedback/all/route.js
// Fetch ALL feedback with full user data for dashboard
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 1000;
    const timeRange = searchParams.get("timeRange") || "all"; // all, daily, weekly, monthly, quarterly

    // Calculate time range filter
    let startDate = null;
    if (timeRange !== "all") {
      const now = new Date();
      const ranges = {
        daily: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        weekly: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        monthly: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        quarterly: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      };
      startDate = ranges[timeRange];
    }

    // Build query
    let query = adminDb.collection("feedback").orderBy("timestamp", "desc");
    
    if (startDate) {
      query = query.where("timestamp", ">=", startDate);
    }
    
    query = query.limit(limit);

    const feedbackSnapshot = await query.get();

    // Fetch full user data for each feedback
    const feedbackPromises = feedbackSnapshot.docs.map(async (doc) => {
      const feedbackData = doc.data();
      let userProfile = {};
      let userPlan = null;

      // Fetch full user profile by userId
      if (feedbackData.userId && feedbackData.userId !== "anonymous") {
        try {
          const userDoc = await adminDb.collection("users").doc(feedbackData.userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userProfile = {
              email: userData.email || feedbackData.email || null,
              displayName: userData.displayName || userData.name || null,
              jobTitle: userData.jobTitle || null,
              company: userData.company || null,
              phone: userData.phone || null,
              plan: userData.plan || null,
              premiumExpiry: userData.premium_expiry || null,
              createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt || null,
              lastLogin: userData.lastLogin?.toDate?.()?.toISOString() || userData.lastLogin || null,
            };
            userPlan = userData.plan || null;
          }
        } catch (error) {
          console.error(`Error fetching user ${feedbackData.userId}:`, error);
        }
      }

      return {
        id: doc.id,
        ...feedbackData,
        timestamp: feedbackData.timestamp?.toDate?.()?.toISOString() || feedbackData.timestamp || new Date().toISOString(),
        userProfile,
        userPlan,
      };
    });

    const feedback = await Promise.all(feedbackPromises);

    return NextResponse.json(
      { 
        success: true,
        feedback,
        count: feedback.length,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback", details: error.message },
      { status: 500 }
    );
  }
}
