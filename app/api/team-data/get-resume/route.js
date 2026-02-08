import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../lib/firebase-admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const resumeId = searchParams.get("resumeId");

    if (!memberId || !resumeId) {
      return NextResponse.json(
        { error: "memberId and resumeId are required" },
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

    // Fetch the resume document
    const resumeDoc = await adminDb
      .collection("users")
      .doc(memberId)
      .collection("resumes")
      .doc(resumeId)
      .get();

    if (!resumeDoc.exists) {
      console.log(`⚠️ Resume document not found: ${resumeId} for member: ${memberId}`);
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    const resumeData = resumeDoc.data();

    // Convert all Firestore Timestamps to ISO strings for JSON serialization
    const serializedResumeData = {
      id: resumeId,
      ...resumeData,
      createdAt: resumeData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: resumeData.updatedAt?.toDate?.()?.toISOString() || null,
    };

    // Also fetch client info if available
    let clientData = null;
    if (resumeData.clientId) {
      const clientDoc = await adminDb
        .collection("users")
        .doc(memberId)
        .collection("clients")
        .doc(resumeData.clientId)
        .get();

      if (clientDoc.exists) {
        const clientDataRaw = clientDoc.data();
        clientData = { 
          id: clientDoc.id, 
          ...clientDataRaw,
          createdAt: clientDataRaw.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: clientDataRaw.updatedAt?.toDate?.()?.toISOString() || null,
        };
      }
    }

    return NextResponse.json({
      success: true,
      resumeData: serializedResumeData,
      clientData,
    });
  } catch (error) {
    console.error("❌ Error fetching resume:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: "Failed to fetch resume", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
