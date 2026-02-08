import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import { getAdminId, logActivity, ACTIVITY_TYPES } from "../../../lib/teamManagementServer";
import { cleanResumeDataForFirebase } from "../../../lib/utils";

export async function POST(request) {
  try {
    const { userId, resumeData } = await request.json();

    if (!userId || !resumeData) {
      return NextResponse.json(
        { error: "User ID and resume data are required" },
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

    // Create resume under admin's collection
    const resumeRef = adminDb.collection("users").doc(adminId).collection("resumes").doc();
    
    // Clean nested resumeData if it exists
    const cleanedData = resumeData.resumeData 
      ? { ...resumeData, resumeData: cleanResumeDataForFirebase(resumeData.resumeData) }
      : resumeData;
    
    const newResume = {
      ...cleanedData,
      id: resumeRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      updatedBy: userId,
    };

    await resumeRef.set(newResume);

    // Log activity
    try {
      await logActivity(adminId, userId, ACTIVITY_TYPES.RESUME_CREATED, {
        resumeId: resumeRef.id,
        resumeName: resumeData.resumeName || "Untitled Resume",
        template: resumeData.template || "classic",
      });
    } catch (activityError) {
      console.error("Error logging activity:", activityError);
    }

    return NextResponse.json({
      success: true,
      resume: newResume,
    });
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
}
