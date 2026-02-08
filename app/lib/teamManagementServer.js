// app/lib/teamManagementServer.js
// Server-side version of team management functions using Firebase Admin SDK

import { adminDb } from "./firebase-admin";

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  TEAM_MEMBER: "team_member",
};

// Activity Types
export const ACTIVITY_TYPES = {
  // Resume Operations
  RESUME_CREATED: "resume_created",
  RESUME_EDITED: "resume_edited",
  RESUME_UPDATED: "resume_updated",
  RESUME_DELETED: "resume_deleted",
  PDF_DOWNLOADED: "pdf_downloaded",
  RESUME_UPLOADED: "resume_uploaded",
  RESUME_PARSED: "resume_parsed",
  
  // Client Operations
  CLIENT_ADDED: "client_added",
  CLIENT_CREATED: "client_created",
  CLIENT_EDITED: "client_edited",
  CLIENT_UPDATED: "client_updated",
  CLIENT_DELETED: "client_deleted",
  
  // ATS Checker
  ATS_CHECK: "ats_check",
  ATS_CHECK_PERFORMED: "ats_check_performed",
  
  // JD Builder
  JD_RESUME_CREATED: "jd_resume_created",
  JD_RESUME_UPDATED: "jd_resume_updated",
  
  // User Management
  USER_INVITED: "user_invited",
  USER_ACCEPTED_INVITE: "user_accepted_invite",
  USER_REMOVED: "user_removed",
  USER_UPDATED: "user_updated",
  
  // Session
  LOGIN: "login",
  LOGOUT: "logout",
  
  // Settings
  SETTINGS_UPDATED: "settings_updated",
  
  // Additional Detailed Tracking
  RESUME_VIEWED: "resume_viewed",
  RESUME_SHARED: "resume_shared",
  RESUME_DUPLICATED: "resume_duplicated",
  CLIENT_VIEWED: "client_viewed",
  CLIENT_CONTACTED: "client_contacted",
  ATS_SCORE_IMPROVED: "ats_score_improved",
  JD_ANALYZED: "jd_analyzed",
  TEMPLATE_CHANGED: "template_changed",
  TEMPLATE_PREVIEWED: "template_previewed",
  DASHBOARD_CUSTOMIZED: "dashboard_customized",
  FEATURE_USED: "feature_used",
  UPGRADE_ATTEMPTED: "upgrade_attempted",
  PAYMENT_MADE: "payment_made",
  SYSTEM_ERROR: "system_error",
};

// Check if user is admin of their organization (server-side)
export async function isAdmin(userId) {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) return false;
    
    const userData = userDoc.data();
    const role = userData.professionalProfile?.role || userData.role;
    return role === USER_ROLES.ADMIN;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Get admin ID for a user (returns own ID if admin, or admin's ID if team member) - server-side
export async function getAdminId(userId) {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
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

// Log activity (server-side)
export async function logActivity(adminUserId, actingUserId, activityType, metadata = {}) {
  try {
    const now = new Date();
    const activityData = {
      userId: actingUserId,
      activityType,
      metadata,
      timestamp: now, // Add timestamp field for proper ordering
      createdAt: now.toISOString(),
    };

    await adminDb
      .collection("users")
      .doc(adminUserId)
      .collection("activity")
      .add(activityData);

    return true;
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
}
