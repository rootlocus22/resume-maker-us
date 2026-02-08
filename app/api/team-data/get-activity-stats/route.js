import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import { getAdminId } from "../../../lib/teamManagementServer";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the admin ID for this user
    let adminId = await getAdminId(userId);
    
    // If we can't determine admin ID, fall back to using the user's own ID
    if (!adminId) {
      console.log("Could not determine admin ID, using user's own ID as fallback");
      adminId = userId;
    }

    // Build query
    let query = adminDb
      .collection("users")
      .doc(adminId)
      .collection("activity");

    // Apply date filters
    if (startDate) {
      query = query.where("timestamp", ">=", new Date(startDate));
    }
    if (endDate) {
      query = query.where("timestamp", "<=", new Date(endDate));
    }

    const snapshot = await query.get();
    const activities = snapshot.docs.map(doc => doc.data());

    // Calculate statistics
    const stats = {
      totalActivities: activities.length,
      activityCounts: {},
      userActivity: {},
    };

    // Count activities by type
    activities.forEach(activity => {
      const type = activity.activityType;
      stats.activityCounts[type] = (stats.activityCounts[type] || 0) + 1;

      // Count by user
      const userId = activity.userId;
      if (!stats.userActivity[userId]) {
        stats.userActivity[userId] = {
          total: 0,
          byType: {},
        };
      }
      stats.userActivity[userId].total++;
      stats.userActivity[userId].byType[type] = (stats.userActivity[userId].byType[type] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity stats" },
      { status: 500 }
    );
  }
}
