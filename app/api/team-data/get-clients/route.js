import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import { getAdminId } from "../../../lib/teamManagementServer";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the admin ID for this user
    let adminId = await getAdminId(userId);
    
    // If we can't determine admin ID, fall back to using the user's own ID
    // This handles cases where the user might be an admin or the system is not set up yet
    if (!adminId) {
      console.log("Could not determine admin ID, using user's own ID as fallback");
      adminId = userId;
    }

    // Get clients from admin's collection
    const clientsSnapshot = await adminDb
      .collection("users")
      .doc(adminId)
      .collection("clients")
      .orderBy("createdAt", "desc")
      .get();

    const clients = clientsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
