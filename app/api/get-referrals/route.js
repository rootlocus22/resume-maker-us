import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch all referrals for this user
    // Note: Removed orderBy to avoid needing composite index
    // We'll sort in JavaScript instead
    const referralsSnapshot = await adminDb
      .collection("referrals")
      .where("referrerId", "==", userId)
      .get();

    const referrals = [];
    referralsSnapshot.forEach((doc) => {
      referrals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by createdAt in descending order (newest first)
    referrals.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    // Calculate stats
    const stats = {
      totalReferrals: referrals.length,
      registeredReferrals: referrals.filter(r => r.status === "registered" || r.status === "paid").length,
      paidReferrals: referrals.filter(r => r.status === "paid").length,
      totalEarnings: referrals.reduce((sum, r) => sum + (r.earnings || 0), 0)
    };

    // Also get stats from user document for accuracy
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.referralStats) {
        // Use user document stats as they're the source of truth
        stats.registeredReferrals = userData.referralStats.registeredReferrals || stats.registeredReferrals;
        stats.paidReferrals = userData.referralStats.paidReferrals || stats.paidReferrals;
        stats.totalEarnings = userData.referralStats.totalEarnings || stats.totalEarnings;
      }
    }

    return NextResponse.json({
      referrals,
      stats,
      success: true
    });

  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals", details: error.message },
      { status: 500 }
    );
  }
}

