import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import { getAdminId, logActivity, ACTIVITY_TYPES } from "../../../lib/teamManagementServer";
import { decrementQuota, QUOTA_TYPES } from "../../../lib/enterpriseQuotas";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const clientId = searchParams.get("clientId");

    if (!userId || !clientId) {
      return NextResponse.json(
        { error: "User ID and client ID are required" },
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

    // Get client data before deletion for logging
    const clientRef = adminDb.collection("users").doc(adminId).collection("clients").doc(clientId);
    const clientDoc = await clientRef.get();
    
    if (!clientDoc.exists) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const clientData = clientDoc.data();

    // Delete client from admin's collection
    await clientRef.delete();

    // Decrement client quota
    try {
      console.log(`🔄 Decrementing client quota for admin: ${adminId}`);
      await decrementQuota(adminId, QUOTA_TYPES.CLIENTS);
      console.log(`✅ Client quota decremented for admin ${adminId}`);
    } catch (quotaError) {
      console.error("Error decrementing client quota:", quotaError);
      // Don't fail the deletion if quota decrement fails
    }

    // Log activity
    try {
      await logActivity(adminId, userId, ACTIVITY_TYPES.CLIENT_DELETED, {
        clientId: clientId,
        clientName: clientData.name,
        company: clientData.company || "",
      });
    } catch (activityError) {
      console.error("Error logging activity:", activityError);
    }

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
