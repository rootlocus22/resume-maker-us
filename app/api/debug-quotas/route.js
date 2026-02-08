import { NextResponse } from "next/server";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { initializeUserQuotas } from "../../lib/enterpriseQuotas";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }
    
    console.log(`🔍 Debugging quotas for user: ${userId}`);
    
    // 1. Check user profile
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const userData = userDoc.data();
    const professionalProfile = userData.professionalProfile || {};
    
    // 2. Check quotas
    const quotasRef = doc(db, "users", userId, "quotas", "current");
    const quotasDoc = await getDoc(quotasRef);
    
    const quotas = quotasDoc.exists() ? quotasDoc.data() : null;
    
    // 3. Test quota logic
    let quotaTest = null;
    if (quotas) {
      const currentCount = quotas.usage.clients || 0;
      const planId = quotas.planId;
      const limit = quotas.limits.maxClients;
      const canCreate = limit === -1 || currentCount < limit;
      
      quotaTest = {
        planId,
        currentCount,
        limit,
        canCreate,
        formula: `${currentCount} < ${limit} = ${currentCount < limit}`
      };
    }
    
    return NextResponse.json({
      userId,
      userProfile: {
        planType: professionalProfile.planType,
        role: professionalProfile.role,
        isPremium: professionalProfile.isPremium,
        isEnterpriseUser: professionalProfile.isEnterpriseUser,
        category: professionalProfile.category,
        userType: professionalProfile.userType
      },
      quotas: quotas,
      quotaTest: quotaTest,
      needsFix: !quotas || professionalProfile.planType !== "free_trial"
    });
    
  } catch (error) {
    console.error("Error debugging quotas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }
    
    console.log(`🔧 Fixing quotas for user: ${userId}`);
    
    // Initialize quotas
    const quotaData = await initializeUserQuotas(userId, "free_trial");
    
    return NextResponse.json({
      success: true,
      message: "Quotas initialized successfully",
      quotaData
    });
    
  } catch (error) {
    console.error("Error fixing quotas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
