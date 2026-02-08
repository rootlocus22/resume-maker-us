// Script to manually trigger referral conversion tracking
// Usage: node scripts/fix-referral-conversion.js

const REFEREE_USER_ID = "PASTE_SYS_USER_ID_HERE"; // The user who paid (sys@gmail.com)
const PLAN_PURCHASED = "monthly"; // monthly, quarterly, or sixMonth

async function fixReferralConversion() {
  try {
    console.log(`Triggering referral conversion for user: ${REFEREE_USER_ID}`);
    
    const response = await fetch('http://localhost:3000/api/track-referral-conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REFEREE_USER_ID,
        planPurchased: PLAN_PURCHASED,
        amount: 49900 // Amount in paise
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Successfully tracked referral conversion!');
      console.log(`Earnings: ₹${data.earnings}`);
      console.log(`Total Earnings: ₹${data.totalEarnings}`);
      console.log(`Paid Referrals: ${data.paidReferrals}`);
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixReferralConversion();

