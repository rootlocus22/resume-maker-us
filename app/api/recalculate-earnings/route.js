import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

// API endpoint to recalculate all referral earnings with corrected formula
// Call this once after changing from proportional to milestone-based earnings

export async function POST(request) {
  try {
    console.log('🔄 Starting earnings recalculation...\n');

    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();
    let updatedCount = 0;
    let errorCount = 0;
    const updates = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Check if user has referral stats
      if (userData.referralStats && userData.referralStats.paidReferrals > 0) {
        const paidReferrals = userData.referralStats.paidReferrals;
        const oldEarnings = userData.referralStats.totalEarnings || 0;
        
        // New calculation: ₹100 for every complete set of 3 paid referrals
        const newEarnings = Math.floor(paidReferrals / 3) * 100;
        
        if (oldEarnings !== newEarnings) {
          console.log(`👤 User: ${userData.email || userId}`);
          console.log(`   Paid Referrals: ${paidReferrals}`);
          console.log(`   Old Earnings: ₹${oldEarnings}`);
          console.log(`   New Earnings: ₹${newEarnings}`);
          console.log(`   Difference: ₹${newEarnings - oldEarnings}\n`);

          try {
            // Update total earnings
            await adminDb.collection('users').doc(userId).update({
              'referralStats.totalEarnings': newEarnings,
              updatedAt: new Date().toISOString()
            });

            // Also update available credits if they exist
            if (userData.referralRewards && userData.referralRewards.availableCredits !== undefined) {
              const creditsDiff = newEarnings - oldEarnings;
              const newCredits = Math.max(0, (userData.referralRewards.availableCredits || 0) + creditsDiff);
              
              await adminDb.collection('users').doc(userId).update({
                'referralRewards.availableCredits': newCredits
              });
              
              console.log(`   ✅ Updated credits to: ₹${newCredits}\n`);
            }

            updates.push({
              email: userData.email || userId,
              paidReferrals,
              oldEarnings,
              newEarnings,
              difference: newEarnings - oldEarnings
            });

            updatedCount++;
          } catch (error) {
            console.error(`   ❌ Error updating user ${userId}:`, error.message);
            errorCount++;
          }
        }
      }
    }

    console.log('\n🎉 Recalculation complete!');
    console.log(`✅ Updated: ${updatedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);

    return NextResponse.json({
      success: true,
      message: "Earnings recalculated successfully",
      updatedCount,
      errorCount,
      updates
    });
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    return NextResponse.json(
      { error: "Failed to recalculate earnings", details: error.message },
      { status: 500 }
    );
  }
}

