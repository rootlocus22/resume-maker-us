import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import { getAdminId, logActivity, ACTIVITY_TYPES } from "../../../lib/teamManagementServer";
import { checkQuota, incrementQuota, QUOTA_TYPES } from "../../../lib/enterpriseQuotas";

export async function POST(request) {
  try {
    const { userId, clientData } = await request.json();

    if (!userId || !clientData) {
      return NextResponse.json(
        { error: "User ID and client data are required" },
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

    // Check quota before creating client
    console.log(`🔍 Checking client quota for admin: ${adminId}`);
    const quotaCheck = await checkQuota(adminId, QUOTA_TYPES.CLIENTS);
    console.log(`📊 Client quota check result:`, quotaCheck);
    
    if (!quotaCheck.allowed) {
      console.log(`❌ Client quota limit reached for admin ${adminId}`);
      return NextResponse.json(
        { 
          error: "Client quota limit reached", 
          quotaInfo: {
            currentCount: quotaCheck.currentCount,
            limit: quotaCheck.limit,
            remaining: quotaCheck.remaining,
            needsUpgrade: quotaCheck.needsUpgrade
          }
        },
        { status: 429 }
      );
    }
    
    console.log(`✅ Client quota check passed for admin ${adminId}`);

    // Create client under admin's collection
    const clientRef = adminDb.collection("users").doc(adminId).collection("clients").doc();
    
    const newClient = {
      ...clientData,
      id: clientRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      updatedBy: userId,
    };

    await clientRef.set(newClient);

    // Log activity
    try {
      await logActivity(adminId, userId, ACTIVITY_TYPES.CLIENT_CREATED, {
        clientId: clientRef.id,
        clientName: clientData.name,
        company: clientData.company || "",
      });
    } catch (activityError) {
      console.error("Error logging activity:", activityError);
    }

    // Increment quota after successful client creation
    try {
      console.log(`⬆️ Attempting to increment client quota for admin: ${adminId}`);
      await incrementQuota(adminId, QUOTA_TYPES.CLIENTS);
      console.log(`✅ Client quota incremented successfully for admin ${adminId}`);
    } catch (quotaError) {
      console.error("❌ Error incrementing client quota:", quotaError);
      // Don't fail the request if quota increment fails
    }

    return NextResponse.json({
      success: true,
      client: newClient,
    });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
