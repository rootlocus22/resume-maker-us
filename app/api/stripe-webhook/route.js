import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";
import stripe from "../../lib/stripe";
import { FieldValue } from "firebase-admin/firestore";

// Disable body parsing - we need the raw body for webhook verification
export const dynamic = "force-dynamic";

// Helper: Fulfill a checkout session (idempotent)
async function fulfillCheckoutSession(session) {
  const meta = session.metadata || {};
  const userId = meta.userId;

  if (!userId) {
    console.error("Webhook: No userId in session metadata");
    return;
  }

  // Check if already fulfilled (idempotent)
  const orderRef = adminDb.collection("stripe_orders").doc(session.id);
  const orderDoc = await orderRef.get();
  if (orderDoc.exists && orderDoc.data().fulfilled) {
    console.log(`Webhook: Session ${session.id} already fulfilled, skipping`);
    return;
  }

  const billingCycle = meta.billingCycle;
  const planToSet = meta.planToSet;
  const includeJobTracker = meta.includeJobTracker === "true";
  const includeInterviewKit = meta.includeInterviewKit === "true";
  const includeApplyPro = meta.includeApplyPro === "true";
  const referralCode = meta.referralCode;
  const referralDiscountApplied = meta.referralDiscountApplied === "true";
  const selectedDiscount = parseFloat(meta.selectedDiscount) || 0;
  const isStandaloneAddon = meta.isStandaloneAddon === "true";
  const addonParam = meta.addonParam;
  const isJobTrackerOnly = meta.isJobTrackerOnly === "true";
  const jobTrackerDuration = meta.jobTrackerDuration;
  const effectiveCurrency = meta.effectiveCurrency || "USD";
  const finalAmount = parseInt(meta.finalAmount) || session.amount_total;
  const paymentName = meta.paymentName;
  const paymentEmail = meta.paymentEmail;
  const paymentPhone = meta.paymentPhone;
  const profileName = meta.profileName;
  const profileEmail = meta.profileEmail;
  const profilePhone = meta.profilePhone;

  const userRef = adminDb.collection("users").doc(userId);

  // --- Job Tracker Only Purchase ---
  if (isJobTrackerOnly && jobTrackerDuration) {
    const jobTrackerExpiryDate = new Date();
    if (jobTrackerDuration === "6months") {
      jobTrackerExpiryDate.setMonth(jobTrackerExpiryDate.getMonth() + 6);
    } else if (jobTrackerDuration === "3months") {
      jobTrackerExpiryDate.setMonth(jobTrackerExpiryDate.getMonth() + 3);
    } else if (jobTrackerDuration === "1month") {
      jobTrackerExpiryDate.setMonth(jobTrackerExpiryDate.getMonth() + 1);
    }

    await userRef.update({
      hasJobTrackerFeature: true,
      jobTrackerExpiry: jobTrackerExpiryDate.toISOString(),
      jobTrackerPlan: jobTrackerDuration,
      currency: effectiveCurrency,
    });

    console.log(`✅ Job Search addon activated for ${jobTrackerDuration} (user: ${userId})`);

  } else if (isStandaloneAddon && addonParam === "profile_slot") {
    // --- Profile Slot Purchase ---
    await userRef.update({
      profileSlots: FieldValue.increment(1),
    });
    console.log(`✅ Profile slot added for user ${userId}`);

    // Auto-add profile if data provided
    if (profileName || profileEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
        await fetch(`${baseUrl}/api/store-first-resume-reference`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            resumeData: { name: profileName, email: profileEmail, phone: profilePhone },
            source: "profile_slot_purchase_auto_add",
          }),
        });
      } catch (err) {
        console.error("Failed to auto-add profile:", err);
      }
    }

  } else {
    // --- Regular Plan Purchase ---
    const expiryDate = new Date();
    if (billingCycle === "sixMonth") {
      expiryDate.setMonth(expiryDate.getMonth() + 6);
    } else if (billingCycle === "quarterly") {
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    } else if (billingCycle === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (billingCycle === "basic") {
      expiryDate.setDate(expiryDate.getDate() + 7);
    } else if (billingCycle === "oneDay") {
      expiryDate.setDate(expiryDate.getDate() + 3);
    } else if (billingCycle === "interview_gyani") {
      expiryDate.setDate(expiryDate.getDate() + 30);
    }

    const updateData = {
      currency: effectiveCurrency,
      referredBy: referralCode || null,
      referralDiscount: referralDiscountApplied ? selectedDiscount : 0,
    };

    if (billingCycle === "interview_gyani") {
      updateData.interview_plan = "interview_gyani";
      updateData.interview_premium_expiry = expiryDate.toISOString();
    } else {
      updateData.plan = planToSet;
      updateData.premium_expiry = expiryDate.toISOString();
      updateData.preview_count = 0;
      updateData.template_change_count = 0;
      updateData.pdf_download_count = 0;
    }

    // Add Job Tracker addon
    if (includeJobTracker && ["monthly", "quarterly", "sixMonth"].includes(billingCycle)) {
      updateData.hasJobTrackerFeature = true;
      updateData.jobTrackerExpiry = expiryDate.toISOString();
      updateData.jobTrackerPlan = billingCycle;
    }

    // Add Interview Kit addon
    if (includeInterviewKit && ["monthly", "quarterly", "sixMonth"].includes(billingCycle)) {
      updateData.hasInterviewKit = true;
      updateData.interviewKitExpiry = expiryDate.toISOString();
      updateData.interviewKitPlan = billingCycle;
    }

    // Add Apply Pro addon
    if (includeApplyPro && ["quarterly", "sixMonth"].includes(billingCycle)) {
      updateData.hasApplyPro = true;
      const applyProExpiry = new Date();
      applyProExpiry.setDate(applyProExpiry.getDate() + 180);
      updateData.apply_pro_expiry = applyProExpiry.toISOString();
    }

    await userRef.update(updateData);
    console.log(`✅ Plan ${planToSet} activated for user ${userId} (cycle: ${billingCycle})`);
  }

  // Track referral conversion
  if (referralCode && ["monthly", "quarterly", "sixMonth"].includes(billingCycle)) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
      await fetch(`${baseUrl}/api/track-referral-conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planPurchased: billingCycle, amount: finalAmount }),
      });
    } catch (refError) {
      console.error("Error tracking referral:", refError);
    }
  }

  // Send emails via existing email API
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const isProfileSlotPurchase = isStandaloneAddon && addonParam === "profile_slot";

    // Payment complete email
    if (!isProfileSlotPurchase) {
      await fetch(`${baseUrl}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: "paymentComplete",
          userId,
          data: {
            amount: finalAmount,
            plan: planToSet,
            firstName: paymentName || "Friend",
            email: paymentEmail || "",
            isUSDomain: effectiveCurrency === "USD",
            hasJobSearch: includeJobTracker,
            hasInterviewKit: includeInterviewKit,
            currency: effectiveCurrency,
            billingCycle,
          },
        }),
      });
    }

    // Invoice email
    await fetch(`${baseUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: "invoice",
        userId,
        data: {
          amount: finalAmount,
          finalAmount,
          plan: planToSet,
          planName: isProfileSlotPurchase
            ? "Profile Slot Add-on"
            : {
                oneDay: "Quick Start Pass",
                basic: "Starter Plan",
                monthly: "Pro Monthly Plan",
                quarterly: "Pro Quarterly Plan",
                sixMonth: "Pro 6-Month Plan",
                interview_gyani: "AI Interview Pro",
              }[billingCycle] || "Premium",
          billingCycle: isProfileSlotPurchase ? "Lifetime" : billingCycle,
          hasJobSearch: includeJobTracker,
          hasInterviewKit: includeInterviewKit,
          hasApplyPro: includeApplyPro,
          firstName: paymentName || "Customer",
          email: paymentEmail || "",
          currency: effectiveCurrency,
          isUSDomain: effectiveCurrency === "USD",
        },
      }),
    });

    // Profile slot specific email
    if (isProfileSlotPurchase) {
      await fetch(`${baseUrl}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: "profile_slot_purchased",
          userId,
          data: {
            firstName: paymentName || "Friend",
            email: paymentEmail || "",
            isUSDomain: effectiveCurrency === "USD",
            amount: finalAmount,
          },
        }),
      });
    }
  } catch (emailErr) {
    console.error("Failed to send email:", emailErr);
    // Don't fail fulfillment for email errors
  }

  const collectionName = process.env.NODE_ENV === "development" ? "payment_logs_test" : "payment_logs";
  await adminDb.collection(collectionName).add({
    userId,
    userInfo: {
      name: paymentName || "",
      email: paymentEmail || "",
      phone: paymentPhone || "",
    },
    type: isStandaloneAddon ? `addon_${addonParam}` : "plan_purchase",
    plan: planToSet,
    billingCycle,
    amount: finalAmount,
    baseAmount: finalAmount,
    currency: effectiveCurrency,
    orderId: session.id,
    paymentId: session.payment_intent || "N/A",
    signature: "Stripe",
    couponCode: meta.couponCode || null,
    discount: selectedDiscount,
    includeJobTracker,
    includeInterviewKit,
    includeApplyPro,
    status: "success",
    error: null,
    cancellationReason: null,
    acquisitionSource: meta.acqSource || "direct",
    acquisitionMedium: meta.acqMedium || "none",
    acquisitionCampaign: meta.acqCampaign || null,
    acquisitionTerm: meta.acqTerm || null,
    acquisitionContent: meta.acqContent || null,
    gclid: meta.gclid || null,
    fbclid: meta.fbclid || null,
    timestamp: new Date(),
    createdAt: new Date().toISOString(),
  });

  // Mark as fulfilled (idempotency key)
  await orderRef.set({
    sessionId: session.id,
    userId,
    planToSet,
    billingCycle,
    amount: finalAmount,
    currency: effectiveCurrency,
    fulfilled: true,
    fulfilledAt: new Date().toISOString(),
  });

  console.log(`✅ Checkout session ${session.id} fully fulfilled for user ${userId}`);
}

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(`🔔 Checkout session completed: ${session.id}`);

        if (session.payment_status === "paid") {
          await fulfillCheckoutSession(session);
        }
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        console.log(`🔔 Async payment succeeded: ${session.id}`);
        await fulfillCheckoutSession(session);
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        console.log(`🔔 Async payment failed: ${session.id}`);
        await adminDb.collection("payment_logs").add({
          type: "async_payment_failed",
          sessionId: session.id,
          userId: session.metadata?.userId,
          timestamp: new Date().toISOString(),
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
