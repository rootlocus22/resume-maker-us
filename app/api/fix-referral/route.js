import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

// Manual API to fix referral tracking issues
// Use this when a referral was not properly tracked during signup/payment

export async function POST(request) {
  try {
    const { refereeUserId, refereeEmail, referrerEmail } = await request.json();
    
    console.log(`[Fix Referral] Attempting to fix referral for referee: ${refereeUserId || refereeEmail}, referrer: ${referrerEmail}`);

    if ((!refereeUserId && !refereeEmail) || !referrerEmail) {
      return NextResponse.json(
        { error: "Missing referee identifier (userId or email) or referrerEmail" },
        { status: 400 }
      );
    }

    // Find the referrer by email
    const referrerQuery = await adminDb
      .collection("users")
      .where("email", "==", referrerEmail)
      .limit(1)
      .get();

    if (referrerQuery.empty) {
      console.log(`[Fix Referral] Referrer not found with email: ${referrerEmail}`);
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      );
    }

    const referrerDoc = referrerQuery.docs[0];
    const referrerId = referrerDoc.id;
    const referrerData = referrerDoc.data();
    const referralCode = referrerData.referralCode;
    
    console.log(`[Fix Referral] Found referrer: ${referrerId}, code: ${referralCode}`);

    // Get referee data - either by userId or email
    let refereeDoc;
    let actualRefereeUserId;

    if (refereeUserId) {
      refereeDoc = await adminDb.collection("users").doc(refereeUserId).get();
      actualRefereeUserId = refereeUserId;
    } else {
      // Look up by email
      const refereeQuery = await adminDb
        .collection("users")
        .where("email", "==", refereeEmail)
        .limit(1)
        .get();
      
      if (refereeQuery.empty) {
        console.log(`[Fix Referral] Referee not found with email: ${refereeEmail}`);
        return NextResponse.json(
          { error: "Referee user not found" },
          { status: 404 }
        );
      }
      
      refereeDoc = refereeQuery.docs[0];
      actualRefereeUserId = refereeDoc.id;
    }
    
    if (!refereeDoc.exists) {
      return NextResponse.json(
        { error: "Referee user not found" },
        { status: 404 }
      );
    }

    const refereeData = refereeDoc.data();
    console.log(`[Fix Referral] Referee data:`, {
      userId: actualRefereeUserId,
      email: refereeData.email,
      plan: refereeData.plan,
      currentReferredBy: refereeData.referredBy
    });

    // Update referee's referredBy field
    await adminDb.collection("users").doc(actualRefereeUserId).set({
      referredBy: referrerId,
      referredByCode: referralCode || "UNKNOWN",
      referralDiscount: 15,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`[Fix Referral] Updated referee's referredBy field`);

    // Check if referral record exists
    const existingReferralQuery = await adminDb
      .collection("referrals")
      .where("referrerId", "==", referrerId)
      .where("refereeId", "==", actualRefereeUserId)
      .limit(1)
      .get();

    let referralId;

    if (existingReferralQuery.empty) {
      // Create new referral record
      console.log(`[Fix Referral] Creating new referral record`);
      
      const isPaid = refereeData.plan === "premium" || refereeData.plan === "monthly" || refereeData.plan === "sixMonth";
      
      const newReferral = await adminDb.collection("referrals").add({
        referrerId,
        refereeId: actualRefereeUserId,
        referralCode: referralCode || "UNKNOWN",
        friendName: refereeData.displayName || "Fixed Referral",
        email: refereeData.email || null,
        phone: null,
        status: isPaid ? "paid" : "registered",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
        convertedAt: isPaid ? new Date().toISOString() : null,
        planPurchased: isPaid ? "monthly" : null
      });
      
      referralId = newReferral.id;
      console.log(`[Fix Referral] Created referral record: ${referralId}`);
    } else {
      referralId = existingReferralQuery.docs[0].id;
      console.log(`[Fix Referral] Referral record already exists: ${referralId}`);
    }

    // Update referrer's stats
    const currentStats = referrerData.referralStats || {
      totalReferrals: 0,
      registeredReferrals: 0,
      paidReferrals: 0,
      totalEarnings: 0
    };

    const isPaid = refereeData.plan === "premium" || refereeData.plan === "monthly" || refereeData.plan === "sixMonth";
    
    if (isPaid) {
      // Calculate earnings: ₹100 for every complete set of 3 paid referrals
      const newPaidReferrals = (currentStats.paidReferrals || 0) + 1;
      const newTotalEarnings = Math.floor(newPaidReferrals / 3) * 100;
      const oldTotalEarnings = currentStats.totalEarnings || 0;
      const earningsToAdd = newTotalEarnings - oldTotalEarnings;

      await adminDb.collection("users").doc(referrerId).update({
        "referralStats.registeredReferrals": Math.max(currentStats.registeredReferrals || 0, 1),
        "referralStats.paidReferrals": newPaidReferrals,
        "referralStats.totalEarnings": newTotalEarnings,
        "referralRewards.availableCredits": (referrerData.referralRewards?.availableCredits || 0) + earningsToAdd,
        updatedAt: new Date().toISOString()
      });

      // Update referral status to paid
      await adminDb.collection("referrals").doc(referralId).update({
        status: "paid",
        convertedAt: new Date().toISOString(),
        planPurchased: "monthly"
      });

      console.log(`[Fix Referral] ✅ Successfully fixed paid referral! Referrer earned ₹${earningsToAdd}`);

      return NextResponse.json({
        success: true,
        message: "Referral fixed successfully",
        referralId,
        earnings: earningsToAdd,
        totalEarnings: newTotalEarnings,
        paidReferrals: newPaidReferrals
      });
    } else {
      await adminDb.collection("users").doc(referrerId).update({
        "referralStats.registeredReferrals": (currentStats.registeredReferrals || 0) + 1,
        updatedAt: new Date().toISOString()
      });

      console.log(`[Fix Referral] ✅ Successfully fixed registered referral!`);

      return NextResponse.json({
        success: true,
        message: "Referral fixed as registered (not paid yet)",
        referralId
      });
    }

  } catch (error) {
    console.error("[Fix Referral] Error:", error);
    return NextResponse.json(
      { error: "Failed to fix referral", details: error.message },
      { status: 500 }
    );
  }
}

