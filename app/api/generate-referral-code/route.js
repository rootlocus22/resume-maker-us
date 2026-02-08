import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

// Generate a unique referral code based on user name and ID
const generateReferralCode = (userName, userId) => {
  // Extract first 5 characters of name (uppercase)
  const namePrefix = (userName || "USER")
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 5)
    .toUpperCase();
  
  // Generate 4 random characters from userId hash
  const hash = userId.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude similar looking chars
  let suffix = "";
  let tempHash = hash;
  
  for (let i = 0; i < 4; i++) {
    suffix += chars[tempHash % chars.length];
    tempHash = Math.floor(tempHash / chars.length);
  }
  
  return `${namePrefix}${suffix}`;
};

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user already has a referral code
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // If user already has a referral code, return it
    if (userData.referralCode) {
      return NextResponse.json({
        referralCode: userData.referralCode,
        message: "Existing referral code retrieved"
      });
    }

    // Generate new referral code
    const userName = userData.displayName || userData.email?.split("@")[0] || "USER";
    let referralCode = generateReferralCode(userName, userId);
    let isUnique = false;
    let attempts = 0;

    // Ensure uniqueness
    while (!isUnique && attempts < 10) {
      const existingCodeQuery = await adminDb
        .collection("users")
        .where("referralCode", "==", referralCode)
        .limit(1)
        .get();

      if (existingCodeQuery.empty) {
        isUnique = true;
      } else {
        // Add random suffix if code exists
        referralCode = generateReferralCode(userName, userId + attempts);
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Failed to generate unique referral code" },
        { status: 500 }
      );
    }

    // Save referral code to user document
    await userRef.update({
      referralCode,
      referralStats: {
        totalReferrals: 0,
        registeredReferrals: 0,
        paidReferrals: 0,
        totalEarnings: 0
      },
      referralRewards: {
        availableCredits: 0,
        redeemedCredits: 0
      },
      referralCodeCreatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      referralCode,
      message: "Referral code generated successfully"
    });

  } catch (error) {
    console.error("Error generating referral code:", error);
    return NextResponse.json(
      { error: "Failed to generate referral code", details: error.message },
      { status: 500 }
    );
  }
}

