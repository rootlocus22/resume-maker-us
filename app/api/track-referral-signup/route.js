import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function POST(request) {
  try {
    const { userId, referralCode, email } = await request.json();
    
    console.log(`[Referral Signup] Tracking signup for user: ${userId}, code: ${referralCode}, email: ${email}`);

    if (!userId || !referralCode) {
      console.log(`[Referral Signup] Missing required fields`);
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the referrer by referral code
    const usersSnapshot = await adminDb
      .collection("users")
      .where("referralCode", "==", referralCode.toUpperCase())
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log(`[Referral Signup] Invalid referral code: ${referralCode}`);
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    const referrerDoc = usersSnapshot.docs[0];
    const referrerId = referrerDoc.id;
    const referrerData = referrerDoc.data();
    
    console.log(`[Referral Signup] Found referrer: ${referrerId}, email: ${referrerData.email}`);

    // Check if this user was invited via email/phone
    const existingReferralQuery = await adminDb
      .collection("referrals")
      .where("referrerId", "==", referrerId)
      .where("email", "==", email)
      .limit(1)
      .get();

    let referralId;
    
    if (!existingReferralQuery.empty) {
      // Update existing referral record
      const existingReferralDoc = existingReferralQuery.docs[0];
      referralId = existingReferralDoc.id;
      
      console.log(`[Referral Signup] Updating existing referral record: ${referralId}`);
      
      await adminDb.collection("referrals").doc(referralId).update({
        refereeId: userId,
        status: "registered",
        updatedAt: new Date().toISOString(),
        registeredAt: new Date().toISOString()
      });
    } else {
      // Create new referral record for direct link usage
      console.log(`[Referral Signup] Creating new referral record for direct signup`);
      
      const newReferral = await adminDb.collection("referrals").add({
        referrerId,
        refereeId: userId,
        referralCode: referralCode.toUpperCase(),
        friendName: "Direct Signup",
        email: email || null,
        phone: null,
        status: "registered",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
        convertedAt: null,
        planPurchased: null
      });
      referralId = newReferral.id;
      console.log(`[Referral Signup] Created referral record: ${referralId}`);
    }

    // Update referrer's stats
    const currentStats = referrerData.referralStats || {
      totalReferrals: 0,
      registeredReferrals: 0,
      paidReferrals: 0,
      totalEarnings: 0
    };

    await adminDb.collection("users").doc(referrerId).update({
      "referralStats.registeredReferrals": (currentStats.registeredReferrals || 0) + 1,
      updatedAt: new Date().toISOString()
    });

    // Save referral info to the new user's document
    console.log(`[Referral Signup] Saving referral info to user document: ${userId}`);
    
    await adminDb.collection("users").doc(userId).set({
      referredBy: referrerId,
      referredByCode: referralCode.toUpperCase(),
      referralDiscount: 15, // 15% discount for referred users
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // VERIFY: Check if the fields were actually saved (failsafe)
    const verifyDoc = await adminDb.collection("users").doc(userId).get();
    const verifyData = verifyDoc.data();
    
    if (!verifyData.referredBy) {
      console.log(`[Referral Signup] ⚠️ WARNING: referredBy field is null after save! Retrying...`);
      
      // Retry one more time with a slight delay
      await new Promise(resolve => setTimeout(resolve, 500));
      await adminDb.collection("users").doc(userId).update({
        referredBy: referrerId,
        referredByCode: referralCode.toUpperCase(),
        updatedAt: new Date().toISOString()
      });
      
      console.log(`[Referral Signup] Retried setting referredBy field`);
    }

    console.log(`[Referral Signup] ✅ Successfully tracked referral signup: ${userId} referred by ${referrerId}`);

    return NextResponse.json({
      message: "Referral tracked successfully",
      referralId,
      discount: 15,
      success: true
    });

  } catch (error) {
    console.error("Error tracking referral signup:", error);
    return NextResponse.json(
      { error: "Failed to track referral signup", details: error.message },
      { status: 500 }
    );
  }
}

