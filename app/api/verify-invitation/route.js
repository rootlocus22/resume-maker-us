import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Missing invitation token" },
        { status: 400 }
      );
    }

    // Get invitation data
    const invitationRef = adminDb.collection("invitations").doc(token);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    const invitation = invitationDoc.data();

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Invitation has already been used" },
        { status: 400 }
      );
    }

    // Get admin/business info
    const adminRef = adminDb.collection("users").doc(invitation.adminUserId);
    const adminDoc = await adminRef.get();
    
    let businessName = "ExpertResume Enterprise";
    if (adminDoc.exists) {
      const adminData = adminDoc.data();
      businessName = adminData.professionalProfile?.businessName || 
                    adminData.businessName || 
                    "ExpertResume Enterprise";
    }

    return NextResponse.json({
      valid: true,
      name: invitation.name,
      email: invitation.email,
      businessName: businessName,
      invitedBy: invitation.invitedBy,
      expiresAt: invitation.expiresAt,
    });

  } catch (error) {
    console.error("Error verifying invitation:", error);
    return NextResponse.json(
      { error: "Failed to verify invitation" },
      { status: 500 }
    );
  }
}
