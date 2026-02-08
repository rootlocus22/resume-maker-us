import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import { getAdminId, logActivity, ACTIVITY_TYPES } from "../../../lib/teamManagementServer";
import { cleanResumeDataForFirebase } from "../../../lib/utils";

export async function PUT(request) {
  try {
    const { userId, resumeId, resumeData } = await request.json();

    if (!userId || !resumeId || !resumeData) {
      return NextResponse.json(
        { error: "User ID, resume ID, and resume data are required" },
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

    // Update resume in admin's collection
    const resumeRef = adminDb.collection("users").doc(adminId).collection("resumes").doc(resumeId);
    
    // Clean nested resumeData if it exists
    const cleanedData = resumeData.resumeData 
      ? { ...resumeData, resumeData: cleanResumeDataForFirebase(resumeData.resumeData) }
      : resumeData;
    
    const updateData = {
      ...cleanedData,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    await resumeRef.update(updateData);

    // Log activity
    try {
      await logActivity(adminId, userId, ACTIVITY_TYPES.RESUME_UPDATED, {
        resumeId: resumeId,
        resumeName: resumeData.resumeName || "Untitled Resume",
        template: resumeData.template || "classic",
      });
    } catch (activityError) {
      console.error("Error logging activity:", activityError);
    }

    return NextResponse.json({
      success: true,
      message: "Resume updated successfully",
    });
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
}
