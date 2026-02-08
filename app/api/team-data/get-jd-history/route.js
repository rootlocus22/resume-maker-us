import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../lib/firebase-admin";

// Helper function to recursively convert Firestore Timestamps to ISO strings
function convertTimestamps(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (obj.toDate && typeof obj.toDate === 'function') {
    // This is a Firestore Timestamp
    return obj.toDate().toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestamps(item));
  }
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    converted[key] = convertTimestamps(value);
  }
  return converted;
}

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

    // Fetch the JD resume history item directly by historyId
    const historyDoc = await adminDb
      .collection("users")
      .doc(memberId)
      .collection("jdResumeHistory")
      .doc(historyId)
      .get();

    if (!historyDoc.exists) {
      console.log(`⚠️ JD history document not found: ${historyId} for member: ${memberId}`);
      return NextResponse.json(
        { error: "JD resume history item not found" },
        { status: 404 }
      );
    }

    const historyData = historyDoc.data();

    // Convert all Firestore Timestamps to ISO strings for JSON serialization
    const serializedHistoryData = {
      id: historyId,
      ...convertTimestamps(historyData),
    };

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
        const clientDataRaw = clientDoc.data();
        clientData = { 
          id: clientDoc.id, 
          ...convertTimestamps(clientDataRaw),
        };
      }
    }

    return NextResponse.json({
      success: true,
      historyData: serializedHistoryData,
      clientData,
    });
  } catch (error) {
    console.error("❌ Error fetching JD resume history:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: "Failed to fetch JD resume history", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

