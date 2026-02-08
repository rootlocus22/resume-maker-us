import { NextResponse } from "next/server";
import { generateWithRetry } from "../../lib/geminiFallback";
import { adminDb } from "../../lib/firebase";
export const maxDuration = 240;
export async function POST(req) {
  try {
    const { jobDescription, resumeData, userId } = await req.json();

    if (!jobDescription || !userId) {
      return NextResponse.json(
        { error: "Job description and user ID are required" },
        { status: 400 }
      );
    }

    // Check user's cheatsheet access
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const cheatsheetsRemaining = userData.interviewCheatsheetsRemaining || 0;
    const hasUnlimitedAccess = userData.unlimitedInterviewCheatsheets || false;

    // Check for subscription-based plan (Interview Kit)
    const hasActiveSubscription = userData.hasInterviewKit === true &&
      userData.interviewKitExpiry &&
      new Date(userData.interviewKitExpiry) > new Date();

    const DAILY_LIMIT = 20;

    // Check daily limit for subscribers
    if (hasActiveSubscription) {
      const today = new Date().toISOString().split('T')[0];
      const usageStats = userData.interviewUsageStats || { date: today, count: 0 };

      // Reset count if it's a new day
      if (usageStats.date !== today) {
        usageStats.date = today;
        usageStats.count = 0;
      }

      if (usageStats.count >= DAILY_LIMIT) {
        return NextResponse.json(
          { error: `Daily limit of ${DAILY_LIMIT} generations reached. Please try again tomorrow.` },
          { status: 403 }
        );
      }
    }

    if (!hasUnlimitedAccess && !hasActiveSubscription && cheatsheetsRemaining <= 0) {
      return NextResponse.json(
        { error: "No interview prep kit credits remaining. Please purchase more." },
        { status: 403 }
      );
    }

    // Generate the interview cheatsheet using AI with fallback

    const prompt = `You are an expert interview coach and career advisor. Analyze this job description and generate EXACTLY 20 interview questions that the interviewer will most likely ask, along with perfect answers.

Job Description:
${jobDescription}

${resumeData && Object.keys(resumeData).length > 0 ? `
Candidate's Resume Data:
${JSON.stringify(resumeData, null, 2)}

IMPORTANT: Use the candidate's actual experience, skills, and achievements from their resume to craft personalized, authentic answers. Reference specific projects, accomplishments, and technologies they've worked with.
` : `
Note: No resume data provided. Generate generic but strong answers based on best practices for this role.
`}

Generate EXACTLY 20 questions covering these categories:
1. Technical/Role-specific questions (6-8 questions)
2. Behavioral questions (5-6 questions)
3. Situational questions (3-4 questions)
4. Company/Role fit questions (2-3 questions)
5. Career goals and motivation (2-3 questions)

For each question, provide:
- The question itself
- A comprehensive, impressive answer (150-250 words)
- The question category
- 2-3 pro tips for delivering the answer

Format your response as a valid JSON object with this EXACT structure:
{
  "jobTitle": "extracted job title from description",
  "questions": [
    {
      "question": "Question text here",
      "answer": "Detailed answer here that references specific experience from the resume if available",
      "category": "Technical/Behavioral/Situational/Company Fit/Career Goals",
      "tips": [
        "Tip 1",
        "Tip 2",
        "Tip 3"
      ]
    }
  ]
}

CRITICAL REQUIREMENTS:
- Generate EXACTLY 20 questions, no more, no less
- Make answers specific and personalized using resume data when available
- Each answer should be 150-250 words
- Include concrete examples and metrics where possible
- Make answers sound natural and confident, not robotic
- Cover the most likely questions for this specific role
- Return ONLY valid JSON, no markdown formatting, no additional text
- Do not use markdown code blocks, just return the raw JSON`;

    // Use fallback mechanism with retry for better reliability
    const result = await generateWithRetry(prompt, {
      maxOutputTokens: 8000, // Large output for 20 questions
      temperature: 0.7,
      maxRetries: 2,
      retryDelay: 1000,
    });

    const responseText = result.text;
    console.log(`✅ Interview cheatsheet generated using model: ${result.model}`);

    // Clean and parse the response
    let cleanedResponse = responseText.trim();

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
    }

    const cheatsheetData = JSON.parse(cleanedResponse);

    // Validate the response
    if (!cheatsheetData.questions || !Array.isArray(cheatsheetData.questions)) {
      throw new Error("Invalid cheatsheet format");
    }

    // Ensure exactly 20 questions
    if (cheatsheetData.questions.length < 20) {
      // If less than 20, this is an error - should regenerate
      console.warn(`Generated only ${cheatsheetData.questions.length} questions instead of 20`);
    } else if (cheatsheetData.questions.length > 20) {
      // If more than 20, trim to 20
      cheatsheetData.questions = cheatsheetData.questions.slice(0, 20);
    }

    // Handle credit deduction or usage tracking
    const updates = {};

    if (hasActiveSubscription) {
      // Track usage for subscribers
      const today = new Date().toISOString().split('T')[0];
      const currentStats = userData.interviewUsageStats || { date: today, count: 0 };

      // Handle day rollover if not handled above (redundant safety) or increment
      if (currentStats.date !== today) {
        updates.interviewUsageStats = { date: today, count: 1 };
      } else {
        updates.interviewUsageStats = { date: today, count: currentStats.count + 1 };
      }
    } else if (!hasUnlimitedAccess) {
      // Deduct credit for non-subscribers
      updates.interviewCheatsheetsRemaining = cheatsheetsRemaining - 1;
    }

    if (Object.keys(updates).length > 0) {
      await userRef.update(updates);
    }

    // Log the usage
    await adminDb.collection("interview_cheatsheet_usage").add({
      userId,
      timestamp: new Date().toISOString(),
      questionsGenerated: cheatsheetData.questions.length,
      jobTitle: cheatsheetData.jobTitle || "Not specified",
      hasResumeData: !!resumeData && Object.keys(resumeData).length > 0,
      modelUsed: result.model,
    });

    console.log(`✅ Interview cheatsheet generated for user ${userId}: ${cheatsheetData.questions.length} questions using ${result.model}`);

    return NextResponse.json(cheatsheetData);
  } catch (error) {
    console.error("Error generating interview prep kit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate interview prep kit" },
      { status: 500 }
    );
  }
}

