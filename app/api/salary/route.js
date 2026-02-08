import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "../../lib/firebase";

export const maxDuration = 60;
export const runtime = "nodejs";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { userId, jobTitle, industry, experience, location, currentSalary, skills = [], currency = "INR", countryCode = "IN" } = await request.json();
    console.log("Salary Analysis Request:", { userId, jobTitle, industry, experience, location, currentSalary, skills });

    // Validate required inputs
    if (!jobTitle || !industry || !experience || !location) {
      return NextResponse.json({ 
        error: "Missing required fields: jobTitle, industry, experience, location" 
      }, { status: 400 });
    }

    // Check user limits
    let isPremium = false;
    let salaryAnalysisCount = 0;

    if (userId && userId !== "anonymous") {
      try {
        const userRef = adminDb.collection("users").doc(userId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          isPremium = userData.plan === "premium";
          salaryAnalysisCount = userData.salary_analysis_count || 0;

          if (!isPremium && salaryAnalysisCount >= 1) {
            return NextResponse.json({
              error: "Free users are limited to 1 salary analysis. Upgrade to Premium for unlimited access.",
              limitReached: true
            }, { status: 403 });
          }
        }
      } catch (error) {
        console.error("Firebase error:", error);
      }
    }

    // Enhanced Gemini prompt for comprehensive salary analysis
    const prompt = `
You are an expert salary analyst specializing in global job markets. Provide comprehensive, accurate salary data and insights for the given role in ${countryCode === "IN" ? "India" : countryCode === "US" ? "United States" : countryCode === "GB" ? "United Kingdom" : countryCode === "CA" ? "Canada" : countryCode === "AU" ? "Australia" : countryCode === "DE" ? "Germany" : countryCode === "SG" ? "Singapore" : countryCode === "JP" ? "Japan" : "the specified country"}. All salary figures should be in ${currency} and reflect the local job market conditions.

JOB DETAILS:
- Position: ${jobTitle}
- Industry: ${industry}
- Experience Level: ${experience}
- Location: ${location}
- Country: ${countryCode}
- Currency: ${currency}
- Current Salary: ${currentSalary ? `${currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "CAD" ? "C$" : currency === "AUD" ? "A$" : currency === "JPY" ? "¥" : ""}${currentSalary}` : "Not provided"}
- Skills: ${skills.length > 0 ? skills.join(", ") : "Not specified"}

Provide a detailed JSON response with the following structure:

{
  "marketOverview": {
    "averageSalary": 1500000,
    "salaryRange": {
      "min": 1200000,
      "max": 2000000
    },
    "percentiles": {
      "p10": 1100000,
      "p25": 1300000,
      "p50": 1500000,
      "p75": 1700000,
      "p90": 1900000
    },
    "demandLevel": "High",
    "marketTrend": "Growing",
    "industryGrowth": "25%"
  },
  "locationAnalysis": {
    "cityPremium": 1.15,
    "costOfLiving": "High",
    "remoteWorkPremium": 1.08,
    "locationFactors": ["Tech hub", "High demand", "Competitive market"]
  },
  "experienceImpact": {
    "entryLevel": 1200000,
    "midLevel": 1500000,
    "seniorLevel": 2000000,
    "expertLevel": 2800000,
    "experienceMultipliers": {
      "0-2": 0.8,
      "3-5": 1.0,
      "6-8": 1.3,
      "9+": 1.6
    }
  },
  "companyInsights": {
    "startup": {
      "salaryMultiplier": 0.9,
      "benefits": ["Equity", "Growth opportunities"],
      "risks": ["Job security", "Work-life balance"]
    },
    "mnc": {
      "salaryMultiplier": 1.2,
      "benefits": ["Stability", "Good benefits"],
      "risks": ["Slower growth", "Bureaucracy"]
    },
    "consultancy": {
      "salaryMultiplier": 1.1,
      "benefits": ["Exposure", "Networking"],
      "risks": ["Travel", "Long hours"]
    }
  },
  "skillAnalysis": {
    "highValueSkills": [
      {"skill": "AWS", "premium": 1.25, "demand": "Very High"},
      {"skill": "Python", "premium": 1.20, "demand": "High"},
      {"skill": "React", "premium": 1.15, "demand": "High"}
    ],
    "emergingSkills": [
      {"skill": "AI/ML", "premium": 1.35, "trend": "Rising"},
      {"skill": "DevOps", "premium": 1.30, "trend": "Stable"}
    ]
  },
  "negotiationGuide": {
    "recommendedRange": {
      "min": 1600000,
      "max": 1800000
    },
    "anchoringStrategy": "Start 10-15% above target",
    "keyTalkingPoints": [
      "Market demand for your skills",
      "Industry growth rate",
      "Location premium",
      "Experience level"
    ],
    "timing": "Best during performance reviews or job changes",
    "redFlags": ["Below market rates", "No growth path", "Poor benefits"]
  },
  "comparison": {
    "currentSalary": "user_provided_salary_here",
    "percentile": "50th-75th",
    "difference": "calculated_difference",
    "percentage": "calculated_percentage",
    "position": "above_or_below",
    "recommendation": "negotiation_recommendation"
  },
  "marketInsights": {
    "genderPayGap": 0.87,
    "remoteWorkTrend": "Increasing",
    "benefits": ["Health insurance", "PF", "Gratuity", "Performance bonus"],
    "workCulture": "Hybrid work model gaining popularity",
    "careerGrowth": "Fast-track opportunities available"
  },
  "companyBenchmarks": {
    "topPayers": [
      {"company": "Google", "multiplier": 1.4, "note": "Best benefits"},
      {"company": "Microsoft", "multiplier": 1.3, "note": "Good work-life balance"},
      {"company": "Amazon", "multiplier": 1.25, "note": "High performance culture"}
    ],
    "midTier": [
      {"company": "TCS", "multiplier": 0.95, "note": "Stable career"},
      {"company": "Infosys", "multiplier": 1.0, "note": "Good learning"},
      {"company": "Wipro", "multiplier": 0.98, "note": "Diverse projects"}
    ]
  },
  "actionItems": [
    "Update your skills based on market demand",
    "Research company-specific compensation",
    "Prepare negotiation talking points",
    "Consider timing for salary discussions",
    "Evaluate total compensation package"
  ]
}

Use realistic data for the US market. Ensure all monetary values are in INR (annual). Provide specific, actionable insights that would help someone negotiate their salary effectively.

IMPORTANT: For the "comparison" section, if currentSalary is provided (${currentSalary ? currentSalary : 'not provided'}), calculate the actual values:
- Replace "user_provided_salary_here" with the actual current salary value
- Calculate "calculated_difference" as the difference between current salary and market average
- Calculate "calculated_percentage" as the percentage difference
- Set "position" to "above" or "below" based on comparison with market average
- Provide appropriate "negotiation_recommendation" based on the comparison

If no currentSalary is provided, set the comparison section to null.

CRITICAL: For the "skillAnalysis" section, focus ONLY on skills that are relevant to the ${industry} industry:
- For Finance: Focus on financial modeling, Excel, VBA, Python, R, SQL, Bloomberg Terminal, risk management, portfolio management, CFA, FRM, etc.
- For Healthcare: Focus on clinical research, medical coding, HIPAA, EMR systems, healthcare analytics, patient care, medical terminology, etc.
- For Education: Focus on curriculum development, student assessment, learning management systems, educational technology, etc.
- For Marketing: Focus on digital marketing, SEO, SEM, Google Analytics, content marketing, social media marketing, etc.
- For Engineering: Focus on AutoCAD, SolidWorks, MATLAB, ANSYS, 3D modeling, finite element analysis, etc.
- For Manufacturing: Focus on lean manufacturing, six sigma, quality control, process improvement, supply chain management, etc.
- For Retail: Focus on inventory management, point of sale systems, customer service, e-commerce, etc.
- For Consulting: Focus on strategy development, business analysis, project management, change management, etc.
- For Media: Focus on Adobe Creative Suite, video editing, content creation, social media management, etc.
- For Real Estate: Focus on property management, real estate law, market analysis, valuation, etc.
- For Transportation: Focus on logistics management, supply chain optimization, fleet management, etc.
- For Energy: Focus on power systems, renewable energy, energy management, sustainability, etc.
- For Government: Focus on policy analysis, public administration, regulatory compliance, etc.
- For Non-Profit: Focus on grant writing, fundraising, donor relations, program management, etc.

DO NOT include generic tech skills like JavaScript, Python, React, etc. unless they are specifically relevant to the ${industry} industry. Focus on industry-specific tools, methodologies, and competencies.
`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let parsedData;
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Fallback data
      parsedData = {
        marketOverview: {
          averageSalary: 1500000,
          salaryRange: { min: 1200000, max: 2000000 },
          percentiles: { p10: 1100000, p25: 1300000, p50: 1500000, p75: 1700000, p90: 1900000 },
          demandLevel: "High",
          marketTrend: "Growing",
          industryGrowth: "25%"
        },
        locationAnalysis: {
          cityPremium: 1.15,
          costOfLiving: "High",
          remoteWorkPremium: 1.08,
          locationFactors: ["Tech hub", "High demand"]
        },
        experienceImpact: {
          entryLevel: 1200000,
          midLevel: 1500000,
          seniorLevel: 2000000,
          expertLevel: 2800000
        },
        companyInsights: {
          startup: { salaryMultiplier: 0.9, benefits: ["Equity"], risks: ["Job security"] },
          mnc: { salaryMultiplier: 1.2, benefits: ["Stability"], risks: ["Slower growth"] },
          consultancy: { salaryMultiplier: 1.1, benefits: ["Exposure"], risks: ["Travel"] }
        },
        skillAnalysis: {
          highValueSkills: [
            { skill: "AWS", premium: 1.25, demand: "Very High" },
            { skill: "Python", premium: 1.20, demand: "High" }
          ]
        },
        negotiationGuide: {
          recommendedRange: { min: 1600000, max: 1800000 },
          anchoringStrategy: "Start 10-15% above target",
          keyTalkingPoints: ["Market demand", "Industry growth"],
          timing: "Best during performance reviews",
          redFlags: ["Below market rates"]
        },
        marketInsights: {
          genderPayGap: 0.87,
          remoteWorkTrend: "Increasing",
          benefits: ["Health insurance", "PF", "Gratuity"],
          workCulture: "Hybrid work model",
          careerGrowth: "Fast-track opportunities"
        },
        companyBenchmarks: {
          topPayers: [
            { company: "Google", multiplier: 1.4, note: "Best benefits" },
            { company: "Microsoft", multiplier: 1.3, note: "Good work-life balance" }
          ]
        },
        actionItems: [
          "Update your skills based on market demand",
          "Research company-specific compensation",
          "Prepare negotiation talking points"
        ]
      };

      if (currentSalary) {
        parsedData.comparison = {
          currentSalary: parseInt(currentSalary),
          percentile: "50th-75th",
          difference: parseInt(currentSalary) - 1500000,
          percentage: Math.round(((parseInt(currentSalary) - 1500000) / 1500000) * 100),
          position: parseInt(currentSalary) > 1500000 ? "above" : "below",
          recommendation: parseInt(currentSalary) < 1500000 ? "Consider negotiating for better compensation" : "Your salary is competitive"
        };
      }
    }

    // Update user analysis count
    if (userId && userId !== "anonymous" && !isPremium) {
      try {
        await adminDb.collection("users").doc(userId).update({
          salary_analysis_count: salaryAnalysisCount + 1
        });
      } catch (error) {
        console.error("Failed to update analysis count:", error);
      }
    }

    return NextResponse.json({ data: parsedData }, { status: 200 });

  } catch (error) {
    console.error("Salary Analyzer Error:", error);
    return NextResponse.json({
      error: "Failed to analyze salary data",
      details: error.message
    }, { status: 500 });
  }
}