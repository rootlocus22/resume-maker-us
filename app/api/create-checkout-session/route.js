import { adminDb } from "../../lib/firebase";
import stripe from "../../lib/stripe";
import { getSupportedCurrencies, getEffectivePricing } from "../../lib/globalPricing";
import { PLAN_CONFIG, ADDON_CONFIG, COUPON_OPTIONS } from "../../lib/planConfig";

export async function POST(request) {
  try {
    const {
      amount,
      currency,
      planId,
      couponCode,
      addons = [],
      userId,
      paymentDetails = {},
      // Metadata for fulfillment
      billingCycle,
      planToSet,
      includeJobTracker,
      includeInterviewKit,
      includeApplyPro,
      referralCode,
      referralDiscountApplied,
      selectedDiscount,
      isStandaloneAddon,
      addonParam,
      isJobTrackerOnly,
      jobTrackerDuration,
      // For profile slot auto-add
      profileName,
      profileEmail,
      profilePhone,
      // Origin for redirect URLs
      origin,
      // Referrer / acquisition data (gclid, campaign, etc.) for success log attribution
      referrerData,
    } = await request.json();

    // 1. Basic Validation
    if (!amount || !currency) {
      return new Response(JSON.stringify({ error: "Amount and currency are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Currency Validation
    const supportedCurrencies = Object.keys(getSupportedCurrencies());
    if (!supportedCurrencies.includes(currency)) {
      return new Response(JSON.stringify({ error: `Invalid currency. Supported: ${supportedCurrencies.join(", ")}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. SERVER-SIDE PRICE VALIDATION (CRITICAL SECURITY)
    let calculatedAmount = 0;

    // A. Start with base plan price
    if (planId && PLAN_CONFIG[planId]) {
      const pricing = getEffectivePricing(currency);
      calculatedAmount = pricing[planId] || 0;
    } else if (addons.length === 0 && !planId && !isStandaloneAddon) {
      return new Response(JSON.stringify({ error: "No plan or addon selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // B. Add standalone addons
    for (const addonId of addons) {
      const addon = ADDON_CONFIG[addonId];
      if (addon && addon.price[currency]) {
        calculatedAmount += addon.price[currency];
      }
    }

    // C. Apply Coupon Discount
    if (couponCode) {
      const coupon = COUPON_OPTIONS.find(c => c.code === couponCode.toUpperCase());
      if (coupon) {
        const discountAmount = Math.round(calculatedAmount * coupon.value);
        calculatedAmount = calculatedAmount - discountAmount;
      }
    }

    // D. Final Rounding
    calculatedAmount = Math.round(calculatedAmount / 100) * 100;

    // E. Compare with provided amount
    const parsedAmount = parseFloat(amount);
    const amountDifference = Math.abs(parsedAmount - calculatedAmount);

    if (amountDifference > 1) {
      console.error(`⚠️ Security Alert: Price manipulation detected. Expected: ${calculatedAmount}, Provided: ${parsedAmount}`);

      await adminDb.collection("security_logs").add({
        type: "PRICE_MANIPULATION",
        providedAmount: parsedAmount,
        expectedAmount: calculatedAmount,
        currency,
        planId,
        couponCode,
        addons,
        timestamp: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ error: "Invalid payment amount detected.", code: "SECURITY_ERROR" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build description
    const planDescriptions = {
      sixMonth: "6 Month Access - Complete Success Kit",
      quarterly: "3 Month Access - Career Growth Bundle",
      monthly: "30 Day Access - Pro Job Seeker",
      basic: "7 Day Access - Starter Plan",
      oneDay: "3 Day Access - Quick Start",
      interview_gyani: "30 Day Interview Pro Access",
    };
    const addonNames = {
      profile_slot: "Additional Profile Slot",
      one_time_download: "One-Time Resume Download",
    };

    let productName = "ExpertResume";
    let productDescription = "Resume Builder Premium Access";

    if (isStandaloneAddon && addonParam) {
      productName = addonNames[addonParam] || "ExpertResume Add-on";
      productDescription = ADDON_CONFIG[addonParam]?.description || "Add-on purchase";
    } else if (billingCycle) {
      productName = `ExpertResume ${PLAN_CONFIG[billingCycle]?.name || "Premium"}`;
      productDescription = planDescriptions[billingCycle] || "Premium Access";
    }

    // Build success/cancel URLs
    const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout?billingCycle=${billingCycle || ''}&cancelled=true`;

    // Map currency for Stripe (lowercase)
    const stripeCurrency = currency.toLowerCase();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: paymentDetails.email || undefined,
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: calculatedAmount, // Already in cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Store ALL fulfillment data in metadata (max 50 keys, 500 chars each)
      metadata: {
        userId,
        billingCycle: billingCycle || '',
        planToSet: planToSet || '',
        couponCode: couponCode || '',
        selectedDiscount: String(selectedDiscount || 0),
        includeJobTracker: String(!!includeJobTracker),
        includeInterviewKit: String(!!includeInterviewKit),
        includeApplyPro: String(!!includeApplyPro),
        referralCode: referralCode || '',
        referralDiscountApplied: String(!!referralDiscountApplied),
        isStandaloneAddon: String(!!isStandaloneAddon),
        addonParam: addonParam || '',
        isJobTrackerOnly: String(!!isJobTrackerOnly),
        jobTrackerDuration: jobTrackerDuration || '',
        paymentName: (paymentDetails.name || '').slice(0, 500),
        paymentEmail: (paymentDetails.email || '').slice(0, 500),
        paymentPhone: (paymentDetails.phone || '').slice(0, 500),
        effectiveCurrency: currency,
        finalAmount: String(calculatedAmount),
        profileName: (profileName || '').slice(0, 500),
        profileEmail: (profileEmail || '').slice(0, 500),
        profilePhone: (profilePhone || '').slice(0, 500),
        gclid: (referrerData?.gclid || '').slice(0, 200),
        fbclid: (referrerData?.fbclid || '').slice(0, 200),
        acqSource: (referrerData?.source || '').slice(0, 100),
        acqMedium: (referrerData?.medium || '').slice(0, 100),
        acqCampaign: (referrerData?.campaign || '').slice(0, 200),
        acqTerm: (referrerData?.term || '').slice(0, 200),
        acqContent: (referrerData?.content || '').slice(0, 200),
      },
    });

    // Log session creation
    await adminDb.collection("server_logs").add({
      endpoint: "/api/create-checkout-session",
      status: "session_created",
      sessionId: session.id,
      amount: calculatedAmount,
      currency,
      planId,
      userId,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Stripe session creation error:", error);

    try {
      await adminDb.collection("server_logs").add({
        endpoint: "/api/create-checkout-session",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } catch (logErr) {
      console.error("Failed to log error:", logErr);
    }

    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
