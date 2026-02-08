import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../lib/firebase-admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const historyId = searchParams.get("historyId");

    if (!memberId || !historyId) {
      return NextResponse.json(
        { error: "memberId and historyId are required" },
        { status: 400 }
      );
    }

    // Verify the requesting user is authenticated
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const adminUserId = decodedToken.uid;

    // Verify admin has access to this team member
    const memberDoc = await adminDb.collection("users").doc(memberId).get();
    if (!memberDoc.exists) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    const memberData = memberDoc.data();
    const memberAdminId = memberData.professionalProfile?.adminUserId || 
                         memberData.teamProfile?.adminUserId;

    // Check if requesting user is the admin of this team member OR is the member themselves
    if (adminUserId !== memberAdminId && adminUserId !== memberId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Fetch the ATS history item
    const historyDoc = await adminDb
      .collection("users")
      .doc(memberId)
      .collection("atsCheckerHistory")
      .doc(historyId)
      .get();

    if (!historyDoc.exists) {
      return NextResponse.json(
        { error: "ATS history item not found" },
        { status: 404 }
      );
    }

    const historyData = historyDoc.data();

    // Also fetch client info if available
    let clientData = null;
    if (historyData.clientId) {
      const clientDoc = await adminDb
        .collection("users")
        .doc(memberId)
        .collection("clients")
        .doc(historyData.clientId)
        .get();

      if (clientDoc.exists) {
        clientData = { id: clientDoc.id, ...clientDoc.data() };
      }
    }

    return NextResponse.json({
      success: true,
      historyData,
      clientData,
    });
  } catch (error) {
    console.error("Error fetching ATS history:", error);
    return NextResponse.json(
      { error: "Failed to fetch ATS history", details: error.message },
      { status: 500 }
    );
  }
}

