// Utility to fix existing user profiles and initialize quotas
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { initializeUserQuotas } from "./enterpriseQuotas";

export async function fixExistingUserProfile(userId) {
  try {
    console.log("🔧 Fixing existing user profile for:", userId);
    
    // 1. Check current user profile
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    console.log("📋 Current user data:", {
      planType: userData.professionalProfile?.planType,
      role: userData.professionalProfile?.role,
      isPremium: userData.professionalProfile?.isPremium
    });
    
    // 2. Update user profile if needed
    const needsUpdate = 
      !userData.professionalProfile?.role || 
      userData.professionalProfile?.planType === "free" ||
      userData.professionalProfile?.planType === "anonymous";
    
    if (needsUpdate) {
      await updateDoc(userRef, {
        "professionalProfile.role": "admin",
        "professionalProfile.planType": "free_trial",
        "professionalProfile.isPremium": false,
        "professionalProfile.isEnterpriseUser": true,
        updatedAt: new Date().toISOString()
      });
      console.log("✅ User profile updated");
    } else {
      console.log("ℹ️ User profile already up to date");
    }
    
    // 3. Initialize quotas if they don't exist
    const quotasRef = doc(db, "users", userId, "quotas", "current");
    const quotasDoc = await getDoc(quotasRef);
    
    if (!quotasDoc.exists()) {
      await initializeUserQuotas(userId, "free_trial");
      console.log("✅ Quotas initialized");
    } else {
      console.log("ℹ️ Quotas already exist");
    }
    
    // 4. Verify the fix
    const updatedUserDoc = await getDoc(userRef);
    const updatedUserData = updatedUserDoc.data();
    
    console.log("✅ Verification - Updated user data:", {
      planType: updatedUserData.professionalProfile?.planType,
      role: updatedUserData.professionalProfile?.role,
      isPremium: updatedUserData.professionalProfile?.isPremium,
      isEnterpriseUser: updatedUserData.professionalProfile?.isEnterpriseUser
    });
    
    return {
      success: true,
      userData: {
        planType: updatedUserData.professionalProfile?.planType,
        role: updatedUserData.professionalProfile?.role,
        isPremium: updatedUserData.professionalProfile?.isPremium,
        isEnterpriseUser: updatedUserData.professionalProfile?.isEnterpriseUser
      }
    };
    
  } catch (error) {
    console.error("❌ Error fixing user profile:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
