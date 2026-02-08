import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import { getAdminId, logActivity, ACTIVITY_TYPES } from "../../../lib/teamManagementServer";

export async function PUT(request) {
  try {
    const { userId, clientId, clientData } = await request.json();

    if (!userId || !clientId || !clientData) {
      return NextResponse.json(
        { error: "User ID, client ID, and client data are required" },
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

    // Update client in admin's collection
    const clientRef = adminDb.collection("users").doc(adminId).collection("clients").doc(clientId);
    
    const updateData = {
      ...clientData,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    await clientRef.update(updateData);

    // Log activity
    try {
      await logActivity(adminId, userId, ACTIVITY_TYPES.CLIENT_UPDATED, {
        clientId: clientId,
        clientName: clientData.name,
        company: clientData.company || "",
      });
    } catch (activityError) {
      console.error("Error logging activity:", activityError);
    }

    return NextResponse.json({
      success: true,
      message: "Client updated successfully",
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}
