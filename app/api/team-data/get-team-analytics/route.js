import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import "../../../lib/firebase-admin"; // ensure admin is initialized server-side

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUserId = searchParams.get("adminUserId");
    if (!adminUserId) {
      return NextResponse.json({ error: "adminUserId is required" }, { status: 400 });
    }

    const db = getFirestore();

    // Find team members for this admin
    const usersSnap = await db
      .collection("users")
      .where("teamProfile.adminUserId", "==", adminUserId)
      .get();

    const members = [];

    for (const docSnap of usersSnap.docs) {
      const memberId = docSnap.id;
      const memberData = docSnap.data();

      // Count subcollections
      const counts = {
        clients: 0,
        resumes: 0,
        uploads: 0,
        atsChecks: 0,
        jdResumes: 0,
        activities: 0,
      };

      // Helper to count collection size
      const countCollection = async (pathParts) => {
        const ref = db.collection(pathParts.join("/"));
        const snap = await ref.get();
        return snap.size;
      };

      counts.clients = await countCollection(["users", memberId, "clients"]);
      counts.resumes = await countCollection(["users", memberId, "resumes"]);
      counts.uploads = await countCollection(["users", memberId, "uploadHistory"]);
      counts.atsChecks = await countCollection(["users", memberId, "atsCheckerHistory"]);
      counts.jdResumes = await countCollection(["users", memberId, "jdResumeHistory"]);
      counts.activities = await countCollection(["users", memberId, "activity"]);

      // Get last 5 activities (if createdAt present)
      let recentActivities = [];
      try {
        const actRef = db
          .collection("users")
          .doc(memberId)
          .collection("activity")
          .orderBy("createdAt", "desc")
          .limit(5);
        const actSnap = await actRef.get();
        recentActivities = actSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (_) {}

      members.push({
        id: memberId,
        name: memberData?.teamProfile?.displayName || memberData?.displayName || memberData?.email || "Team Member",
        email: memberData?.teamProfile?.email || memberData?.email || null,
        counts,
        recentActivities,
      });
    }

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error("get-team-analytics error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}


