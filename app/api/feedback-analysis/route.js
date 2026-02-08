// /api/feedback-analysis/route.js
import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function GET() {
  try {
    // Fetch ALL feedback (not just positive)
    const feedbackSnapshot = await adminDb
      .collection("feedback")
      .orderBy("timestamp", "desc")
      .limit(1000) // Get last 1000 feedback entries
      .get();

    const allFeedback = feedbackSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate statistics
    const totalFeedback = allFeedback.length;
    const ratings = allFeedback.map((f) => f.rating || 0);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / totalFeedback || 0;
    
    const ratingDistribution = {
      5: ratings.filter((r) => r === 5).length,
      4: ratings.filter((r) => r === 4).length,
      3: ratings.filter((r) => r === 3).length,
      2: ratings.filter((r) => r === 2).length,
      1: ratings.filter((r) => r === 1).length,
    };

    // Analyze comments for common themes
    const comments = allFeedback
      .filter((f) => f.comment && f.comment.trim() !== "No comment provided")
      .map((f) => f.comment.toLowerCase());

    // Common pain points and feature requests
    const painPoints = {
      pdf: comments.filter((c) => c.includes("pdf") || c.includes("download")).length,
      template: comments.filter((c) => c.includes("template") || c.includes("design")).length,
      slow: comments.filter((c) => c.includes("slow") || c.includes("loading") || c.includes("lag")).length,
      bug: comments.filter((c) => c.includes("bug") || c.includes("error") || c.includes("broken") || c.includes("not working")).length,
      pricing: comments.filter((c) => c.includes("price") || c.includes("expensive") || c.includes("cost")).length,
      features: comments.filter((c) => c.includes("feature") || c.includes("add") || c.includes("missing") || c.includes("need")).length,
      ats: comments.filter((c) => c.includes("ats") || c.includes("score") || c.includes("parsing")).length,
      export: comments.filter((c) => c.includes("export") || c.includes("save") || c.includes("download")).length,
      ui: comments.filter((c) => c.includes("interface") || c.includes("ui") || c.includes("ux") || c.includes("design") || c.includes("layout")).length,
      mobile: comments.filter((c) => c.includes("mobile") || c.includes("phone") || c.includes("responsive")).length,
    };

    // Extract negative feedback (rating <= 3)
    const negativeFeedback = allFeedback.filter((f) => (f.rating || 0) <= 3);
    const negativeComments = negativeFeedback
      .filter((f) => f.comment && f.comment.trim() !== "No comment provided")
      .map((f) => ({
        rating: f.rating,
        comment: f.comment,
        timestamp: f.timestamp,
        name: f.name || "Anonymous",
        email: f.email || null,
        userId: f.userId || null,
        context: f.context || null,
        feedbackType: f.feedbackType || null,
        pageUrl: f.pageUrl || null,
        userAgent: f.userAgent || null,
        // Include all feedback data for full context
        ...f,
      }));

    // Extract positive feedback with specific suggestions
    const positiveFeedback = allFeedback.filter((f) => (f.rating || 0) >= 4);
    const suggestions = positiveFeedback
      .filter((f) => f.comment && f.comment.trim() !== "No comment provided")
      .filter((f) => {
        const comment = f.comment.toLowerCase();
        return (
          comment.includes("could") ||
          comment.includes("would") ||
          comment.includes("suggest") ||
          comment.includes("add") ||
          comment.includes("improve") ||
          comment.includes("better")
        );
      })
      .map((f) => ({
        rating: f.rating,
        comment: f.comment,
        timestamp: f.timestamp,
        name: f.name || "Anonymous",
        email: f.email || null,
        userId: f.userId || null,
        context: f.context || null,
        feedbackType: f.feedbackType || null,
        pageUrl: f.pageUrl || null,
        // Include all feedback data for full context
        ...f,
      }));

    // Recent feedback trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentFeedback = allFeedback.filter((f) => {
      const timestamp = f.timestamp?.toDate ? f.timestamp.toDate() : new Date(f.timestamp);
      return timestamp >= thirtyDaysAgo;
    });

    const recentAvgRating =
      recentFeedback.length > 0
        ? recentFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / recentFeedback.length
        : 0;

    // Identify most common words in negative feedback
    const negativeWords = negativeComments
      .flatMap((f) => f.comment.split(/\s+/))
      .filter((word) => word.length > 4)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});

    const topNegativeWords = Object.entries(negativeWords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Feature request patterns
    const featureRequests = comments
      .filter((c) => {
        const lower = c.toLowerCase();
        return (
          lower.includes("add") ||
          lower.includes("feature") ||
          lower.includes("should have") ||
          lower.includes("would like") ||
          lower.includes("need") ||
          lower.includes("want")
        );
      })
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      analysis: {
        overview: {
          totalFeedback,
          avgRating: parseFloat(avgRating.toFixed(2)),
          recentAvgRating: parseFloat(recentAvgRating.toFixed(2)),
          recentFeedbackCount: recentFeedback.length,
          ratingDistribution,
        },
        painPoints,
        negativeFeedback: {
          count: negativeFeedback.length,
          percentage: parseFloat(((negativeFeedback.length / totalFeedback) * 100).toFixed(2)),
          comments: negativeComments.slice(0, 50), // Top 50 negative comments
        },
        suggestions: suggestions.slice(0, 30), // Top 30 suggestions
        topNegativeWords,
        featureRequests: featureRequests.slice(0, 20),
        recommendations: generateRecommendations(painPoints, negativeFeedback, avgRating, recentAvgRating),
      },
    });
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze feedback" },
      { status: 500 }
    );
  }
}

function generateRecommendations(painPoints, negativeFeedback, avgRating, recentAvgRating) {
  const recommendations = [];

  // Rating trend analysis
  if (recentAvgRating < avgRating) {
    recommendations.push({
      priority: "high",
      category: "Quality",
      issue: "Rating trend is declining",
      action: "Investigate recent negative feedback and address common issues immediately",
    });
  }

  // High pain point areas
  if (painPoints.bug > 10) {
    recommendations.push({
      priority: "high",
      category: "Bugs",
      issue: `${painPoints.bug} users reported bugs/errors`,
      action: "Prioritize bug fixes and improve error handling",
    });
  }

  if (painPoints.slow > 10) {
    recommendations.push({
      priority: "high",
      category: "Performance",
      issue: `${painPoints.slow} users reported slow loading/performance issues`,
      action: "Optimize page load times, implement lazy loading, and improve server response times",
    });
  }

  if (painPoints.pdf > 15) {
    recommendations.push({
      priority: "medium",
      category: "PDF Generation",
      issue: `${painPoints.pdf} users mentioned PDF-related issues`,
      action: "Review PDF generation quality, page breaks, and download experience",
    });
  }

  if (painPoints.template > 15) {
    recommendations.push({
      priority: "medium",
      category: "Templates",
      issue: `${painPoints.template} users mentioned template/design issues`,
      action: "Add more templates, improve template quality, and ensure preview matches PDF",
    });
  }

  if (painPoints.mobile > 10) {
    recommendations.push({
      priority: "medium",
      category: "Mobile Experience",
      issue: `${painPoints.mobile} users mentioned mobile/responsive issues`,
      action: "Improve mobile UI/UX, test on various devices, and optimize touch interactions",
    });
  }

  if (painPoints.features > 20) {
    recommendations.push({
      priority: "low",
      category: "Feature Requests",
      issue: `${painPoints.features} users requested new features`,
      action: "Review feature requests and prioritize based on user value and feasibility",
    });
  }

  if (painPoints.pricing > 5) {
    recommendations.push({
      priority: "low",
      category: "Pricing",
      issue: `${painPoints.pricing} users mentioned pricing concerns`,
      action: "Review pricing strategy and consider offering more value or flexible plans",
    });
  }

  // Negative feedback percentage
  const negativePercentage = (negativeFeedback.length / (negativeFeedback.length + 50)) * 100;
  if (negativePercentage > 15) {
    recommendations.push({
      priority: "high",
      category: "Overall Satisfaction",
      issue: `${negativePercentage.toFixed(1)}% of feedback is negative (rating <= 3)`,
      action: "Conduct user interviews with negative feedback users to understand root causes",
    });
  }

  return recommendations;
}
