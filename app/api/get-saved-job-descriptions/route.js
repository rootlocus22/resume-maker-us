import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch saved JDs for this user, ordered by most recent
    const snapshot = await adminDb
      .collection("saved_job_descriptions")
      .where("userId", "==", userId)
      .orderBy("lastUsed", "desc")
      .limit(50) // Limit to last 50 JDs
      .get();

    const jobDescriptions = [];
    snapshot.forEach((doc) => {
      jobDescriptions.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`✅ Retrieved ${jobDescriptions.length} job descriptions for user ${userId}`);

    return NextResponse.json({
      success: true,
      jobDescriptions,
    });
  } catch (error) {
    console.error("Error fetching job descriptions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch job descriptions" },
      { status: 500 }
    );
  }
}

