import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function POST(request) {
  try {
    const { userId, resumeData, source = "first_upload" } = await request.json();

    console.log('API: store-first-resume-reference called with:', {
      userId,
      resumeData,
      source
    });

    if (!userId || !resumeData) {
      return NextResponse.json({ error: "User ID and resume data are required" }, { status: 400 });
    }

    // Validate that we have name (required for light check)
    if (!resumeData.name || !resumeData.name.trim()) {
      console.log(`User ${userId} has no name, skipping reference storage`);
      return NextResponse.json({
        message: "Name is required for profile identification",
        stored: false
      });
    }

    // Check if user already has a first resume reference
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();

      // Determine max profiles allowed
      const maxProfiles = 1 + parseInt(userData.profileSlots || 0, 10);

      // Current references (normalize to array)
      let currentRefs = [];
      if (userData.firstResumeReference) {
        if (Array.isArray(userData.firstResumeReference)) {
          currentRefs = userData.firstResumeReference;
        } else {
          currentRefs = [userData.firstResumeReference];
        }
      }

      // Check if this new resume is already in the list (deduplication)
      // LIGHT CHECK: Only check name to prevent duplicate profiles
      const normalize = (str) => String(str || "").toLowerCase().trim();
      const newName = normalize(resumeData.name);

      const alreadyExists = currentRefs.some(ref => {
        const rName = normalize(ref.name);
        
        // NAME-ONLY CHECK: Simple name match (case-insensitive, trimmed)
        if (newName && rName && newName === rName) {
          return true;
        }

        return false;
      });

      if (alreadyExists) {
        console.log(`Reference for ${resumeData.name || 'user'} already exists in profile list`);
        return NextResponse.json({
          message: "Reference already exists",
          stored: false,
          alreadyExists: true
        });
      }

      // Check limit
      if (currentRefs.length >= maxProfiles) {
        console.log(`User ${userId} reached profile limit (${currentRefs.length}/${maxProfiles})`);
        return NextResponse.json({
          message: "Profile limit reached",
          stored: false,
          limitReached: true
        });
      }

      // Add new reference
      const newReference = {
        name: resumeData.name || "",
        email: resumeData.email || "",
        phone: resumeData.phone || "",
        storedAt: new Date().toISOString(),
        source: source
      };

      const updatedRefs = [...currentRefs, newReference];

      // Update Firestore
      await userRef.update({
        firstResumeReference: updatedRefs
      });

    } else {
      // User doesn't exist, create with array
      await userRef.set({
        email: "anonymous",
        plan: "anonymous",
        premium_expiry: null,
        preview_count: 0,
        template_change_count: 0,
        name: "",
        phone: "",
        firstResumeReference: [{
          name: resumeData.name || "",
          email: resumeData.email || "",
          phone: resumeData.phone || "",
          storedAt: new Date().toISOString(),
          source: source
        }]
      });
    }

    console.log(`Stored first resume reference for user ${userId} from source: ${source}`);

    return NextResponse.json({
      message: "First resume reference stored successfully",
      stored: true
    });

  } catch (error) {
    console.error("Error storing first resume reference:", error);
    return NextResponse.json({
      error: "Failed to store first resume reference",
      details: error.message
    }, { status: 500 });
  }
} 