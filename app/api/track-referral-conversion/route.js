import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function POST(request) {
  try {
    const { userId, planPurchased, amount } = await request.json();
    
    console.log(`[Referral Conversion] Starting conversion tracking for user: ${userId}, plan: ${planPurchased}`);

    if (!userId || !planPurchased) {
      console.log(`[Referral Conversion] Missing required fields`);
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user data to check if they were referred
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`[Referral Conversion] User ${userId} not found in database`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    console.log(`[Referral Conversion] User data:`, {
      userId,
      email: userData.email,
      referredBy: userData.referredBy,
      referredByCode: userData.referredByCode
    });

    // AUTO-FIX: If referredByCode exists but referredBy is null, fix it now!
    if (!userData.referredBy && userData.referredByCode) {
      console.log(`[Referral Conversion] ⚠️ FAILSAFE TRIGGERED: referredByCode exists but referredBy is null. Auto-fixing...`);
      
      try {
        // Find referrer by code
        const referrerQuery = await adminDb
          .collection("users")
          .where("referralCode", "==", userData.referredByCode.toUpperCase())
          .limit(1)
          .get();
        
        if (!referrerQuery.empty) {
          const referrerId = referrerQuery.docs[0].id;
          console.log(`[Referral Conversion] Found referrer ${referrerId}, fixing referredBy field...`);
          
          // Fix the referredBy field
          await userRef.update({
            referredBy: referrerId,
            updatedAt: new Date().toISOString()
          });
          
          // Update userData for the rest of the function
          userData.referredBy = referrerId;
          
          console.log(`[Referral Conversion] ✅ Auto-fixed referredBy field!`);
        } else {
          console.log(`[Referral Conversion] ❌ Could not find referrer with code: ${userData.referredByCode}`);
          return NextResponse.json({
            message: "Referral code invalid",
            success: false
          });
        }
      } catch (fixError) {
        console.error(`[Referral Conversion] Error auto-fixing referredBy:`, fixError);
      }
    }

    // Check if user was referred
    if (!userData.referredBy) {
      console.log(`[Referral Conversion] User ${userId} was not referred by anyone`);
      return NextResponse.json({
        message: "User was not referred",
        success: true
      });
    }

    const referrerId = userData.referredBy;
    const referralCode = userData.referredByCode;

    // Find the referral record
    const referralQuery = await adminDb
      .collection("referrals")
      .where("referrerId", "==", referrerId)
      .where("refereeId", "==", userId)
      .limit(1)
      .get();

    if (referralQuery.empty) {
      console.log(`No referral record found for user ${userId} and referrer ${referrerId}`);
      return NextResponse.json({
        message: "Referral record not found",
        success: false
      });
    }

    const referralDoc = referralQuery.docs[0];
    const referralData = referralDoc.data();

    // Don't process if already marked as paid
    if (referralData.status === "paid") {
      console.log(`Referral already marked as paid for user ${userId}`);
      return NextResponse.json({
        message: "Referral already converted",
        success: true
      });
    }

    // Update referral record (no individual earnings, calculated based on total)
    await adminDb.collection("referrals").doc(referralDoc.id).update({
      status: "paid",
      convertedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      planPurchased,
      paymentAmount: amount || 0
    });

    // Update referrer's stats and credits
    const referrerRef = adminDb.collection("users").doc(referrerId);
    const referrerDoc = await referrerRef.get();

    // Initialize variables with default values
    let earningsToAdd = 0;
    let newTotalEarnings = 0;
    let newPaidReferrals = 0;

    if (referrerDoc.exists) {
      const referrerData = referrerDoc.data();
      const currentStats = referrerData.referralStats || {
        totalReferrals: 0,
        registeredReferrals: 0,
        paidReferrals: 0,
        totalEarnings: 0
      };
      
      const currentRewards = referrerData.referralRewards || {
        availableCredits: 0,
        redeemedCredits: 0
      };

      // Calculate new paid referrals count
      newPaidReferrals = (currentStats.paidReferrals || 0) + 1;
      
      // Earning logic: ₹100 for every complete set of 3 paid referrals
      // Formula: Math.floor(paidReferrals / 3) * 100
      // 3 referrals = ₹100, 6 = ₹200, 9 = ₹300, 10 = ₹300 (not ₹333)
      const oldTotalEarnings = currentStats.totalEarnings || 0;
      newTotalEarnings = Math.floor(newPaidReferrals / 3) * 100;
      earningsToAdd = newTotalEarnings - oldTotalEarnings;

      // Update stats and add credits
      await referrerRef.update({
        "referralStats.paidReferrals": newPaidReferrals,
        "referralStats.totalEarnings": newTotalEarnings,
        "referralRewards.availableCredits": (currentRewards.availableCredits || 0) + earningsToAdd,
        updatedAt: new Date().toISOString()
      });

      // Send notification email to referrer only if they earned something
      if (earningsToAdd > 0) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://expertresume.us'}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              templateId: 'referral_conversion',
              userId: referrerId,
              data: {
                earnings: earningsToAdd,
                refereeName: userData.displayName || userData.email || "Your friend",
                totalEarnings: newTotalEarnings,
                paidReferrals: newPaidReferrals
              }
            })
          });
        } catch (emailError) {
          console.error('Error sending referral conversion email:', emailError);
        }
      }

      console.log(`Successfully tracked referral conversion: Referrer ${referrerId} earned ₹${earningsToAdd} (Total: ₹${newTotalEarnings} from ${newPaidReferrals} paid referrals)`);
    } else {
      console.error(`Referrer document not found for referrerId: ${referrerId}`);
      return NextResponse.json({
        error: "Referrer not found",
        success: false
      }, { status: 404 });
    }

    return NextResponse.json({
      message: "Referral conversion tracked successfully",
      earnings: earningsToAdd,
      totalEarnings: newTotalEarnings,
      paidReferrals: newPaidReferrals,
      success: true
    });

  } catch (error) {
    console.error("Error tracking referral conversion:", error);
    return NextResponse.json(
      { error: "Failed to track referral conversion", details: error.message },
      { status: 500 }
    );
  }
}

