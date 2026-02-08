// /api/feedback/route.js
import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

// In-memory cache to store feedback data
let cachedFeedback = null;
let cacheTimestamp = null;
const CACHE_DURATION_SECONDS = 86400; // 24 hours in seconds

export async function GET() {
  try {
    // Check if cached data exists and is still valid (within 24 hours)
    const now = Date.now();
    if (
      cachedFeedback &&
      cacheTimestamp &&
      (now - cacheTimestamp) / 1000 < CACHE_DURATION_SECONDS
    ) {
      return NextResponse.json(
        { feedback: cachedFeedback },
        {
          status: 200,
          headers: {
            "Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}, stale-while-revalidate=60`,
          },
        }
      );
    }

    // Fetch data from Firebase if cache is invalid or missing
    const feedbackSnapshot = await adminDb
      .collection("feedback")
      .where("rating", ">", 3)
      .limit(50) // Limit to 50 recent feedbacks to prevent massive N+1 fetches and timeouts
      .get();

    const feedbackPromises = feedbackSnapshot.docs.map(async (doc) => {
      const feedbackData = doc.data();
      let profileInfo = {};

      // Fetch user profile by userId
      if (feedbackData.userId) {
        const userDoc = await adminDb.collection("users").doc(feedbackData.userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          profileInfo = {
            jobTitle: userData.jobTitle || null,
            company: userData.company || null,
          };
        }
      }

      return {
        id: doc.id,
        ...feedbackData,
        timestamp: new Date(feedbackData.timestamp).toISOString(),
        profileInfo,
      };
    });

    const feedback = await Promise.all(feedbackPromises);

    // Update the cache
    cachedFeedback = feedback;
    cacheTimestamp = now;

    return NextResponse.json(
      { feedback },
      {
        status: 200,
        headers: {
          "Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}, stale-while-revalidate=60`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}