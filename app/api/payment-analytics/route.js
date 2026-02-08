import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFilter = searchParams.get("timeFilter") || "24h";
    
    // Calculate time range
    const now = new Date();
    let startTime;
    
    switch (timeFilter) {
      case "1h":
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get today's date for specific today filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch payment logs
    const paymentLogsSnapshot = await adminDb
      .collection("payment_logs")
      .where("timestamp", ">=", startTime)
      .get();

    const paymentLogs = paymentLogsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp),
    }));

    // Filter today's data
    const todayPayments = paymentLogs.filter(payment => 
      payment.timestamp >= today && payment.timestamp < tomorrow
    );

    // Calculate analytics
    const analytics = {
      // Overall stats for the time period
      totalPayments: paymentLogs.length,
      successfulPayments: paymentLogs.filter(p => p.status === "success").length,
      failedPayments: paymentLogs.filter(p => p.status === "failed").length,
      cancelledPayments: paymentLogs.filter(p => p.status === "cancelled").length,
      pendingPayments: paymentLogs.filter(p => p.status === "pending").length,
      
      // Today's specific stats
      todayTotal: todayPayments.length,
      todaySuccessful: todayPayments.filter(p => p.status === "success").length,
      todayFailed: todayPayments.filter(p => p.status === "failed").length,
      todayCancelled: todayPayments.filter(p => p.status === "cancelled").length,
      todayPending: todayPayments.filter(p => p.status === "pending").length,
      
      // Revenue analysis
      totalRevenue: paymentLogs
        .filter(p => p.status === "success")
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      todayRevenue: todayPayments
        .filter(p => p.status === "success")
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      
      // Coupon code distribution
      couponUsage: {},
      todayCouponUsage: {},
      
      // Billing cycle distribution
      billingCycleDistribution: {},
      todayBillingCycleDistribution: {},
      
      // Currency distribution
      currencyDistribution: {},
      todayCurrencyDistribution: {},
      
      // Error analysis
      commonErrors: {},
      todayCommonErrors: {},
      
      // Recent activity
      recentPayments: paymentLogs
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          status: p.status,
          amount: p.amount,
          currency: p.currency,
          billingCycle: p.billingCycle,
          couponCode: p.couponCode,
          timestamp: p.timestamp,
          userEmail: p.userInfo?.email,
          error: p.error,
          cancellationReason: p.cancellationReason
        }))
    };

    // Calculate coupon usage distribution
    paymentLogs.forEach(payment => {
      if (payment.couponCode) {
        analytics.couponUsage[payment.couponCode] = (analytics.couponUsage[payment.couponCode] || 0) + 1;
      }
    });

    todayPayments.forEach(payment => {
      if (payment.couponCode) {
        analytics.todayCouponUsage[payment.couponCode] = (analytics.todayCouponUsage[payment.couponCode] || 0) + 1;
      }
    });

    // Calculate billing cycle distribution
    paymentLogs.forEach(payment => {
      analytics.billingCycleDistribution[payment.billingCycle] = (analytics.billingCycleDistribution[payment.billingCycle] || 0) + 1;
    });

    todayPayments.forEach(payment => {
      analytics.todayBillingCycleDistribution[payment.billingCycle] = (analytics.todayBillingCycleDistribution[payment.billingCycle] || 0) + 1;
    });

    // Calculate currency distribution
    paymentLogs.forEach(payment => {
      analytics.currencyDistribution[payment.currency] = (analytics.currencyDistribution[payment.currency] || 0) + 1;
    });

    todayPayments.forEach(payment => {
      analytics.todayCurrencyDistribution[payment.currency] = (analytics.todayCurrencyDistribution[payment.currency] || 0) + 1;
    });

    // Calculate error analysis
    paymentLogs.forEach(payment => {
      if (payment.error) {
        analytics.commonErrors[payment.error] = (analytics.commonErrors[payment.error] || 0) + 1;
      }
    });

    todayPayments.forEach(payment => {
      if (payment.error) {
        analytics.todayCommonErrors[payment.error] = (analytics.todayCommonErrors[payment.error] || 0) + 1;
      }
    });

    // Convert coupon usage to sorted arrays for easier consumption
    analytics.couponUsageArray = Object.entries(analytics.couponUsage)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);

    analytics.todayCouponUsageArray = Object.entries(analytics.todayCouponUsage)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate conversion rates
    analytics.conversionRate = analytics.totalPayments > 0 
      ? ((analytics.successfulPayments / analytics.totalPayments) * 100).toFixed(1)
      : 0;
    
    analytics.todayConversionRate = analytics.todayTotal > 0
      ? ((analytics.todaySuccessful / analytics.todayTotal) * 100).toFixed(1)
      : 0;

    return NextResponse.json({ 
      success: true, 
      data: analytics,
      timeFilter,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching payment analytics:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch payment analytics" 
    }, { status: 500 });
  }
}
