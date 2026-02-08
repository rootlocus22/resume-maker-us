import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  TEAM_MEMBER: "team_member",
};

// Activity Types - Simplified to focus on core business activities only
export const ACTIVITY_TYPES = {
  // Client Management
  CLIENT_CREATED: "client_created",
  CLIENT_UPDATED: "client_updated", 
  CLIENT_DELETED: "client_deleted",
  
  // Resume Activities
  RESUME_CREATED: "resume_created",
  RESUME_UPDATED: "resume_updated",
  RESUME_DELETED: "resume_deleted",
  RESUME_SAVED: "resume_saved",
  
  // Upload Activities
  RESUME_UPLOADED: "resume_uploaded",
  
  // ATS Activities
  ATS_CHECK_PERFORMED: "ats_check_performed",
  
  // JD Resume Builder Activities
  JD_RESUME_CREATED: "jd_resume_created",
  JD_RESUME_UPDATED: "jd_resume_updated",
  
  // PDF Activities
  PDF_DOWNLOADED: "pdf_downloaded",
};

// Check if user is admin of their organization
export async function isAdmin(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    const role = userData.professionalProfile?.role || userData.role;
    return role === USER_ROLES.ADMIN;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Get admin ID for a user (returns own ID if admin, or admin's ID if team member)
export async function getAdminId(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    const role = userData.professionalProfile?.role || userData.role;
    
    // If admin, return their own ID
    if (role === USER_ROLES.ADMIN) {
      return userId;
    }
    // If team member, return their admin's user ID
    return userData.professionalProfile?.adminUserId || userData.adminUserId || null;
  } catch (error) {
    console.error("Error getting admin ID:", error);
    return null;
  }
}

// Get all team members for an admin user
export async function getTeamMembers(adminUserId) {
  try {
    const membersRef = collection(db, "users", adminUserId, "team");
    const snapshot = await getDocs(query(membersRef, orderBy("createdAt", "desc")));
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting team members:", error);
    return [];
  }
}

// Add team member to admin's team subcollection
export async function addTeamMember(adminUserId, memberData) {
  try {
    const memberRef = doc(collection(db, "users", adminUserId, "team"));
    
    const teamMember = {
      ...memberData,
      status: "pending", // pending, active, suspended
      role: USER_ROLES.TEAM_MEMBER,
      adminUserId, // Reference to admin
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(memberRef, teamMember);
    
    // Log activity
    await logActivity(adminUserId, adminUserId, ACTIVITY_TYPES.USER_INVITED, {
      teamMemberId: memberRef.id,
      email: memberData.email,
      name: memberData.name,
    });
    
    return { id: memberRef.id, ...teamMember };
  } catch (error) {
    console.error("Error adding team member:", error);
    throw error;
  }
}

// Update team member
export async function updateTeamMember(adminUserId, memberId, updates) {
  try {
    const memberRef = doc(db, "users", adminUserId, "team", memberId);
    
    await updateDoc(memberRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error updating team member:", error);
    throw error;
  }
}

// Delete team member
export async function deleteTeamMember(adminUserId, memberId, actingUserId) {
  try {
    const memberRef = doc(db, "users", adminUserId, "team", memberId);
    const memberDoc = await getDoc(memberRef);
    
    if (memberDoc.exists()) {
      const memberData = memberDoc.data();
      
      // Log activity before deletion
      await logActivity(adminUserId, actingUserId, ACTIVITY_TYPES.USER_REMOVED, {
        teamMemberId: memberId,
        email: memberData.email,
        name: memberData.name,
      });
      
      // If the member has a userId (they accepted the invite), update their user document
      if (memberData.userId) {
        const teamMemberUserRef = doc(db, "users", memberData.userId);
        await updateDoc(teamMemberUserRef, {
          "professionalProfile.role": null,
          "professionalProfile.adminUserId": null,
          "professionalProfile.status": "removed",
        });
      }
      
      await deleteDoc(memberRef);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting team member:", error);
    throw error;
  }
}

// Log activity in admin's activity subcollection
export async function logActivity(adminUserId, actingUserId, activityType, metadata = {}) {
  try {
    // Validate required parameters
    if (!adminUserId || !actingUserId || !activityType) {
      console.warn('⚠️ logActivity called with missing parameters:', {
        adminUserId: !!adminUserId,
        actingUserId: !!actingUserId,
        activityType: !!activityType
      });
      return; // Skip logging if any required field is missing
    }
    
    const activityRef = collection(db, "users", adminUserId, "activity");
    
    await addDoc(activityRef, {
      userId: actingUserId,
      activityType,
      metadata: metadata || {},
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw - activity logging should not break the main flow
  }
}

// Get activities for admin user
export async function getActivities(adminUserId, filters = {}) {
  try {
    const activityRef = collection(db, "users", adminUserId, "activity");
    let q = query(activityRef, orderBy("timestamp", "desc"));
    
    // Apply filters
    if (filters.userId) {
      q = query(activityRef, where("userId", "==", filters.userId), orderBy("timestamp", "desc"));
    }
    if (filters.activityType) {
      q = query(activityRef, where("activityType", "==", filters.activityType), orderBy("timestamp", "desc"));
    }
    if (filters.startDate) {
      q = query(q, where("timestamp", ">=", filters.startDate));
    }
    if (filters.endDate) {
      q = query(q, where("timestamp", "<=", filters.endDate));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting activities:", error);
    return [];
  }
}

// Get activity statistics for admin user
export async function getActivityStats(adminUserId, startDate, endDate) {
  try {
    const activities = await getActivities(adminUserId, { startDate, endDate });
    
    // Count by activity type
    const activityCounts = {};
    const userActivity = {};
    
    activities.forEach((activity) => {
      // Count by type
      activityCounts[activity.activityType] = (activityCounts[activity.activityType] || 0) + 1;
      
      // Count by user
      if (!userActivity[activity.userId]) {
        userActivity[activity.userId] = {
          total: 0,
          byType: {},
        };
      }
      userActivity[activity.userId].total++;
      userActivity[activity.userId].byType[activity.activityType] = 
        (userActivity[activity.userId].byType[activity.activityType] || 0) + 1;
    });
    
    return {
      totalActivities: activities.length,
      activityCounts,
      userActivity,
      recentActivities: activities.slice(0, 20),
    };
  } catch (error) {
    console.error("Error getting activity stats:", error);
    return {
      totalActivities: 0,
      activityCounts: {},
      userActivity: {},
      recentActivities: [],
    };
  }
}

// Check user permissions
export async function hasPermission(userId, permission) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    const role = userData.professionalProfile?.role || userData.role;
    
    // Admin has all permissions
    if (role === USER_ROLES.ADMIN) return true;
    
    // Team members have limited permissions (no accounting access)
    const teamMemberPermissions = [
      "create_resume",
      "edit_resume",
      "delete_resume",
      "view_clients",
      "add_client",
      "edit_client",
      "download_pdf",
      "check_ats",
      "upload_resume",
      "jd_builder",
    ];
    
    return teamMemberPermissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

// Generate invitation token
export function generateInvitationToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create invitation and send email
export async function createInvitation(adminUserId, memberData, invitedBy, inviterDetails = {}) {
  try {
    // Only run on server-side
    if (typeof window !== "undefined") {
      throw new Error("createInvitation can only be called server-side");
    }
    
    const token = generateInvitationToken();
    
    // Use admin SDK to create invitation in the same database as API endpoints
    const { adminDb } = await import('./firebase-admin');
    
    if (!adminDb) {
      throw new Error("Firebase Admin not initialized");
    }
    
    const invitationRef = adminDb.collection("invitations").doc(token);
    
    await invitationRef.set({
      adminUserId, // The admin who invited
      invitedBy,
      email: memberData.email,
      name: memberData.name,
      role: USER_ROLES.TEAM_MEMBER,
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });
    
    // Send invitation email
    try {
      const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://expertresume.us'}/enterprise/accept-invite/${token}`;
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://expertresume.us';
      const emailResponse = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: 'team_invitation',
          email: memberData.email,
          data: {
            memberName: memberData.name,
            businessName: inviterDetails.businessName || 'ExpertResume Enterprise',
            invitedByName: inviterDetails.inviterName || 'Your manager',
            invitationLink: invitationLink,
            email: memberData.email,
          },
        }),
      });
      
      if (!emailResponse.ok) {
        console.error('Failed to send invitation email:', await emailResponse.text());
        // Don't throw error, invitation is already created
      } else {
        console.log('Invitation email sent successfully to:', memberData.email);
      }
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Don't throw error, invitation is already created
    }
    
    return token;
  } catch (error) {
    console.error("Error creating invitation:", error);
    throw error;
  }
}

// Accept invitation
export async function acceptInvitation(token, userId) {
  try {
    // Only run on server-side
    if (typeof window !== "undefined") {
      throw new Error("acceptInvitation can only be called server-side");
    }
    
    // Use admin SDK for consistency with API endpoints
    const { adminDb } = await import('./firebase-admin');
    
    if (!adminDb) {
      throw new Error("Firebase Admin not initialized");
    }
    
    const invitationRef = adminDb.collection("invitations").doc(token);
    const invitationDoc = await invitationRef.get();
    
    if (!invitationDoc.exists) {
      throw new Error("Invitation not found");
    }
    
    const invitation = invitationDoc.data();
    
    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      throw new Error("Invitation has expired");
    }
    
    if (invitation.status !== "pending") {
      throw new Error("Invitation has already been used");
    }
    
    const adminUserId = invitation.adminUserId;
    
    // Update user document with team member role and admin reference
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    const professionalProfile = userData.professionalProfile || {};
    
    await userRef.update({
      "professionalProfile.role": USER_ROLES.TEAM_MEMBER,
      "professionalProfile.adminUserId": adminUserId,
      "professionalProfile.status": "active",
      isEnterpriseUser: true,
      userType: "professional",
      category: "ResumeWriter",
    });
    
    // Update the team member record in admin's subcollection
    const teamQuery = await adminDb
      .collection("users")
      .doc(adminUserId)
      .collection("team")
      .where("email", "==", invitation.email)
      .limit(1)
      .get();
    
    if (!teamQuery.empty) {
      const teamMemberDoc = teamQuery.docs[0];
      await teamMemberDoc.ref.update({
        userId: userId,
        status: "active",
        acceptedAt: new Date().toISOString(),
      });
    }
    
    // Mark invitation as accepted
    await invitationRef.update({
      status: "accepted",
      acceptedBy: userId,
      acceptedAt: new Date().toISOString(),
    });
    
    // Log activity
    await logActivity(adminUserId, userId, ACTIVITY_TYPES.USER_ACCEPTED_INVITE, {
      invitationToken: token,
      email: invitation.email,
    });
    
    return adminUserId;
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
}

