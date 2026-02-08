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
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAdminId } from "./teamManagement";

/**
 * Shared Data Access Helper
 * 
 * This module ensures team members store data under admin's collections
 * so admin has full visibility and access to all team data.
 */

// Get the effective storage user ID (admin ID for team members, own ID for admin)
export async function getStorageUserId(userId) {
  try {
    const adminId = await getAdminId(userId);
    // Returns admin ID if user is team member, or own ID if admin
    return adminId || userId;
  } catch (error) {
    console.error("Error getting storage user ID:", error);
    return userId; // Fallback to own ID
  }
}

// Get user info for tracking who created/modified data
export async function getUserInfo(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return { id: userId, name: "Unknown User" };
    
    const userData = userDoc.data();
    return {
      id: userId,
      name: userData.professionalProfile?.displayName || userData.displayName || userData.email || "Unknown User",
      email: userData.email,
      role: userData.professionalProfile?.role || userData.role || "admin",
    };
  } catch (error) {
    console.error("Error getting user info:", error);
    return { id: userId, name: "Unknown User" };
  }
}

// CLIENT OPERATIONS

export async function createClient(userId, clientData) {
  try {
    const response = await fetch("/api/team-data/create-client", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        clientData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle quota limit errors specially
      if (response.status === 429) {
        const quotaError = new Error(errorData.error || "Client quota limit reached");
        quotaError.isQuotaError = true;
        quotaError.quotaInfo = errorData.quotaInfo;
        throw quotaError;
      }
      
      throw new Error(errorData.error || "Failed to create client");
    }

    const result = await response.json();
    return result.client;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
}

export async function updateClient(userId, clientId, updates) {
  try {
    const response = await fetch("/api/team-data/update-client", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        clientId: clientId,
        clientData: updates,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update client");
    }

    return true;
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
}

export async function deleteClient(userId, clientId) {
  try {
    const response = await fetch(`/api/team-data/delete-client?userId=${userId}&clientId=${clientId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete client");
    }

    return true;
  } catch (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
}

export async function getClients(userId, filters = {}) {
  try {
    const response = await fetch(`/api/team-data/get-clients?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch clients");
    }

    const result = await response.json();
    return result.clients;
  } catch (error) {
    console.error("Error getting clients:", error);
    return [];
  }
}

// RESUME OPERATIONS

export async function createResume(userId, resumeData) {
  try {
    const response = await fetch("/api/team-data/create-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        resumeData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create resume");
    }

    const result = await response.json();
    return result.resume;
  } catch (error) {
    console.error("Error creating resume:", error);
    throw error;
  }
}

export async function updateResume(userId, resumeId, updates) {
  try {
    const response = await fetch("/api/team-data/update-resume", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        resumeId: resumeId,
        resumeData: updates,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update resume");
    }

    return true;
  } catch (error) {
    console.error("Error updating resume:", error);
    throw error;
  }
}

export async function deleteResume(userId, resumeId) {
  try {
    const storageUserId = await getStorageUserId(userId);
    const resumeRef = doc(db, "users", storageUserId, "resumes", resumeId);
    
    await deleteDoc(resumeRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw error;
  }
}

export async function getResumes(userId, filters = {}) {
  try {
    const storageUserId = await getStorageUserId(userId);
    const resumesRef = collection(db, "users", storageUserId, "resumes");
    
    let q = query(resumesRef, orderBy("updatedAt", "desc"));
    
    // Apply filters if needed
    if (filters.createdBy) {
      q = query(resumesRef, where("createdBy", "==", filters.createdBy), orderBy("updatedAt", "desc"));
    }
    if (filters.clientId) {
      q = query(resumesRef, where("clientId", "==", filters.clientId), orderBy("updatedAt", "desc"));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting resumes:", error);
    return [];
  }
}

// ATS CHECKER OPERATIONS

export async function saveATSCheck(userId, checkData) {
  try {
    const storageUserId = await getStorageUserId(userId);
    const userInfo = await getUserInfo(userId);
    
    const atsRef = collection(db, "users", storageUserId, "atsCheckerHistory");
    
    const atsDoc = {
      ...checkData,
      performedBy: userId,
      performedByName: userInfo.name,
      performedByEmail: userInfo.email,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    };
    
    await addDoc(atsRef, atsDoc);
    
    return true;
  } catch (error) {
    console.error("Error saving ATS check:", error);
    throw error;
  }
}

export async function getATSHistory(userId, filters = {}) {
  try {
    const storageUserId = await getStorageUserId(userId);
    const atsRef = collection(db, "users", storageUserId, "atsCheckerHistory");
    
    let q = query(atsRef, orderBy("timestamp", "desc"));
    
    // Apply filters if needed
    if (filters.performedBy) {
      q = query(atsRef, where("performedBy", "==", filters.performedBy), orderBy("timestamp", "desc"));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting ATS history:", error);
    return [];
  }
}

// UPLOAD HISTORY

export async function saveUploadHistory(userId, uploadData) {
  try {
    const storageUserId = await getStorageUserId(userId);
    const userInfo = await getUserInfo(userId);
    
    const uploadRef = collection(db, "users", storageUserId, "uploadHistory");
    
    const uploadDoc = {
      ...uploadData,
      uploadedBy: userId,
      uploadedByName: userInfo.name,
      uploadedByEmail: userInfo.email,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    };
    
    await addDoc(uploadRef, uploadDoc);
    
    return true;
  } catch (error) {
    console.error("Error saving upload history:", error);
    throw error;
  }
}

export async function getUploadHistory(userId, filters = {}) {
  try {
    const storageUserId = await getStorageUserId(userId);
    const uploadRef = collection(db, "users", storageUserId, "uploadHistory");
    
    let q = query(uploadRef, orderBy("timestamp", "desc"));
    
    // Apply filters if needed
    if (filters.uploadedBy) {
      q = query(uploadRef, where("uploadedBy", "==", filters.uploadedBy), orderBy("timestamp", "desc"));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting upload history:", error);
    return [];
  }
}

// ANALYTICS - Get team member statistics

export async function getTeamMemberStats(adminUserId, teamMemberId = null) {
  try {
    const filters = teamMemberId ? { createdBy: teamMemberId } : {};
    
    // Get all data
    const [clients, resumes, atsHistory, uploadHistory] = await Promise.all([
      getClients(adminUserId, filters),
      getResumes(adminUserId, filters),
      getATSHistory(adminUserId, teamMemberId ? { performedBy: teamMemberId } : {}),
      getUploadHistory(adminUserId, teamMemberId ? { uploadedBy: teamMemberId } : {}),
    ]);
    
    // Aggregate by team member
    const memberStats = {};
    
    // Count clients by creator
    clients.forEach(client => {
      const creatorId = client.createdBy || adminUserId;
      if (!memberStats[creatorId]) {
        memberStats[creatorId] = {
          userId: creatorId,
          name: client.createdByName || "Admin",
          clientsCreated: 0,
          resumesCreated: 0,
          atsChecks: 0,
          uploads: 0,
        };
      }
      memberStats[creatorId].clientsCreated++;
    });
    
    // Count resumes by creator
    resumes.forEach(resume => {
      const creatorId = resume.createdBy || adminUserId;
      if (!memberStats[creatorId]) {
        memberStats[creatorId] = {
          userId: creatorId,
          name: resume.createdByName || "Admin",
          clientsCreated: 0,
          resumesCreated: 0,
          atsChecks: 0,
          uploads: 0,
        };
      }
      memberStats[creatorId].resumesCreated++;
    });
    
    // Count ATS checks by performer
    atsHistory.forEach(check => {
      const performerId = check.performedBy || adminUserId;
      if (!memberStats[performerId]) {
        memberStats[performerId] = {
          userId: performerId,
          name: check.performedByName || "Admin",
          clientsCreated: 0,
          resumesCreated: 0,
          atsChecks: 0,
          uploads: 0,
        };
      }
      memberStats[performerId].atsChecks++;
    });
    
    // Count uploads by uploader
    uploadHistory.forEach(upload => {
      const uploaderId = upload.uploadedBy || adminUserId;
      if (!memberStats[uploaderId]) {
        memberStats[uploaderId] = {
          userId: uploaderId,
          name: upload.uploadedByName || "Admin",
          clientsCreated: 0,
          resumesCreated: 0,
          atsChecks: 0,
          uploads: 0,
        };
      }
      memberStats[uploaderId].uploads++;
    });
    
    return {
      totalClients: clients.length,
      totalResumes: resumes.length,
      totalATSChecks: atsHistory.length,
      totalUploads: uploadHistory.length,
      memberStats: Object.values(memberStats),
    };
  } catch (error) {
    console.error("Error getting team member stats:", error);
    return {
      totalClients: 0,
      totalResumes: 0,
      totalATSChecks: 0,
      totalUploads: 0,
      memberStats: [],
    };
  }
}

// Check if user can access specific data
export async function canAccessData(userId, dataOwnerId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    const role = userData.professionalProfile?.role || userData.role || "admin";
    
    // Admins can access their own data and their team's data
    if (role === "admin") {
      return userId === dataOwnerId;
    }
    
    // Team members can only access data stored under their admin
    const adminId = userData.professionalProfile?.adminUserId;
    return adminId === dataOwnerId;
  } catch (error) {
    console.error("Error checking data access:", error);
    return false;
  }
}

