import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase-admin";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";

export async function POST(request) {
  try {
    const { token, name, email, password } = await request.json();

    if (!token || !name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify invitation token
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

    // Check if user already exists in Firestore
    const existingUserQuery = await adminDb
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingUserQuery.empty) {
      console.log("User already exists in Firestore:", email);
      const existingUser = existingUserQuery.docs[0].data();
      
      // Check if this user is already part of the admin's team
      if (existingUser.professionalProfile?.adminUserId === invitation.adminUserId) {
        return NextResponse.json(
          { error: "You are already part of this team. Please log in to access your account." },
          { status: 400 }
        );
      }
      
      // Check if user is already part of another team
      if (existingUser.professionalProfile?.adminUserId) {
        return NextResponse.json(
          { error: "This email is already associated with another team. Please use a different email or contact support." },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: "User with this email already exists. Please log in to accept the invitation." },
        { status: 400 }
      );
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Update user profile
    await updateProfile(userCredential.user, {
      displayName: name,
    });

    // Create minimal team member user document in Firestore
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.set({
      email: email,
      displayName: name,
      plan: "free",
      premium_expiry: null,
      preview_count: 0,
      template_change_count: 0,
      pdf_download_count: 0,
      jobDescriptionEnhancements: 0,
      lastJobDescriptionEnhancement: null,
      userType: "team_member", // Changed from "professional"
      currentProfile: "team_member", // Changed from "professional"
      category: "TeamMember", // Changed from "ResumeWriter"
      currency: "INR",
      isEnterpriseUser: false, // Team members are not enterprise users
      isTeamMember: true, // New flag to identify team members
      teamProfile: { // New minimal team profile instead of professionalProfile
        displayName: name,
        email: email,
        role: "team_member",
        adminUserId: invitation.adminUserId,
        status: "active",
        isTeamMember: true,
        isPremium: false,
        planType: "team_member", // New plan type for team members
        userType: "team_member",
        category: "TeamMember",
        updatedAt: new Date().toISOString(),
      },
      // Remove professionalProfile for team members - they only need teamProfile
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update invitation status
    await invitationRef.update({
      status: "accepted",
      acceptedBy: userId,
      acceptedAt: new Date().toISOString(),
    });

    // Update team member record
    const teamMembersQuery = await adminDb
      .collection("users")
      .doc(invitation.adminUserId)
      .collection("team")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!teamMembersQuery.empty) {
      const teamMemberDoc = teamMembersQuery.docs[0];
      await teamMemberDoc.ref.update({
        userId: userId,
        status: "active",
        acceptedAt: new Date().toISOString(),
      });
    }

    // Log activity
    try {
      await adminDb.collection("users").doc(invitation.adminUserId).collection("activity").add({
        userId: userId,
        activityType: "user_accepted_invite",
        metadata: {
          memberName: name,
          memberEmail: email,
        },
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    } catch (activityError) {
      console.error("Error logging activity:", activityError);
      // Don't fail the whole process for activity logging
    }

    return NextResponse.json({
      success: true,
      userId: userId,
      message: "Team member account created successfully",
    });

  } catch (error) {
    console.error("Error creating team member:", error);
    
    // Handle specific Firebase Auth errors
    if (error.code === "auth/email-already-in-use") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }
    
    if (error.code === "auth/weak-password") {
      return NextResponse.json(
        { error: "Password should be at least 6 characters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create team member account" },
      { status: 500 }
    );
  }
}
