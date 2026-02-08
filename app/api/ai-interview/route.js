import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "../../lib/firebase";
import { PLAN_CONFIG } from "../../lib/planConfig";

export const maxDuration = 60;
export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
    try {
        const {
            action,
            jobRole,
            experienceLevel,
            country,
            interviewType,
            question,
            answer,
            resumeText,
            fullSession,
            userId,
            sessionId,
            answerCount,
            questionCount
        } = await request.json();

        let effectiveUserId = userId;

        // If no userId provided, treat as a guest session using sessionId
        if (!effectiveUserId || effectiveUserId === 'null' || effectiveUserId === 'undefined') {
            effectiveUserId = `guest_${sessionId || 'unknown'}`;
        }

        // 1. Fetch User Data to get Plan
        let userData = { plan: "free" };
        if (!effectiveUserId.startsWith('guest_')) {
            const userDoc = await adminDb.collection("users").doc(effectiveUserId).get();
            userData = userDoc.exists ? userDoc.data() : { plan: "free" };
        }

        const planKey = userData.plan || "free";
        const interviewPlan = userData.interview_plan || "anonymous";
        const hasInterviewKit = userData.hasInterviewKit || false;

        // Determine if user has premium interview access (Matches AuthContext logic)
        // Premium includes: sixMonth, quarterly, premium plans, or users with interview kit
        const isPremiumInterview =
            planKey === "sixMonth" ||
            planKey === "quarterly" ||
            planKey === "premium" ||
            planKey === "monthly" || // Monthly plan also has premium interview access
            interviewPlan === "pro" ||
            interviewPlan === "interview_gyani" ||
            hasInterviewKit;

        // Log for debugging (remove in production if needed)
        if (process.env.NODE_ENV === 'development') {
            console.log('Interview Premium Check:', {
                userId: effectiveUserId,
                planKey,
                interviewPlan,
                hasInterviewKit,
                isPremiumInterview
            });
        }

        // 2. Usage Tracking Logic (for analytics only)
        const now = new Date();
        const monthId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const usageRef = adminDb.collection("usage_stats").doc(`${effectiveUserId}_${monthId}`);
        const usageDoc = await usageRef.get();
        const usageData = usageDoc.exists ? usageDoc.data() : { sessions: {}, totalSessions: 0 };

        // Rate limiting: Only apply to non-premium users
        if (!isPremiumInterview) {
            // Use the highest limits available to the user
            let limits = { sessionsPerMonth: 1, questionsPerSession: 2 }; // Free default

            if (planKey === "monthly") {
                limits = PLAN_CONFIG.monthly.interviewLimits;
            } else if (planKey === "basic") {
                limits = PLAN_CONFIG.basic.interviewLimits;
            }

            // Check Monthly Session Limit (only for non-premium)
            if (action === "generate_question" && !usageData.sessions?.[sessionId]) {
                if (usageData.totalSessions >= limits.sessionsPerMonth) {
                    return NextResponse.json({
                        error: "Monthly limit reached",
                        code: "MONTHLY_LIMIT_REACHED",
                        limit: limits.sessionsPerMonth
                    }, { status: 429 });
                }
            }

            // Check Question Limit in Current Session (only for non-premium)
            const sessionData = usageData.sessions?.[sessionId] || { questions: 0 };
            if (action === "evaluate_answer") {
                if (sessionData.questions >= limits.questionsPerSession) {
                    return NextResponse.json({
                        error: "Session limit reached",
                        code: "SESSION_LIMIT_REACHED",
                        limit: limits.questionsPerSession
                    }, { status: 429 });
                }
            }
        }
        
        // For premium users, get session data for tracking (no limits)
        const sessionData = usageData.sessions?.[sessionId] || { questions: 0 };

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite",
            generationConfig: {
                response_mime_type: "application/json",
            }
        });

        if (action === "generate_question") {
            let prompt = "";

            if (resumeText && Math.random() > 0.5) {
                // Differentiator Prompt: Resume-Aware
                prompt = `
        You have access to the candidate’s resume below.
        
        Resume Summary:
        ${resumeText}
        
        Generate the NEXT interview question that:
        - References something specific from the resume
        - Tests depth, not surface-level claims
        - Is commonly asked by interviewers when a resume mentions this experience
        
        Return the result in this JSON format:
        {
          "question": "The question text"
        }
        `;
            } else {
                // Standard Question Generation
                prompt = `
        Generate a realistic interview question for the following candidate:
        
        Role: ${jobRole}
        Experience Level: ${experienceLevel}
        Country Hiring Standard: ${country}
        Interview Type: ${interviewType}
        
        Guidelines:
        - Ask questions commonly used by real interviewers
        - Avoid generic textbook questions
        - Prefer situational, behavioral, or experience-based questions
        - Difficulty should match experience level
        - Question should take 2–3 minutes to answer
        
        Return the result in this JSON format:
        {
          "question": "The question text"
        }
        `;
            }

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Increment usage counters
            try {
                const updateData = {};
                if (action === "generate_question" && !usageData.sessions?.[sessionId]) {
                    updateData.totalSessions = (usageData.totalSessions || 0) + 1;
                    updateData[`sessions.${sessionId}`] = { startedAt: new Date().toISOString(), questions: 0 };
                } else if (action === "evaluate_answer") {
                    updateData[`sessions.${sessionId}.questions`] = (sessionData.questions || 0) + 1;
                    updateData[`sessions.${sessionId}.lastUpdatedAt`] = new Date().toISOString();
                }

                if (Object.keys(updateData).length > 0) {
                    await usageRef.set(updateData, { merge: true });
                }
            } catch (usageError) {
                console.error("Failed to log usage:", usageError);
            }

            return NextResponse.json(JSON.parse(responseText));
        }

        if (action === "get_answer_guidance") {
            const prompt = `
      You are a real-time interview coach helping a candidate improve their answer as they type.
      
      Candidate Context:
      Role: ${jobRole}
      Experience Level: ${experienceLevel}
      Country: ${country}
      
      Interview Question:
      ${question}
      
      Current Answer (in progress):
      ${answer}
      
      Provide real-time guidance to help them improve their answer. Focus on:
      1. What's missing from their current answer
      2. Specific suggestions to strengthen their response
      3. Structure and clarity improvements
      4. Keywords or skills they should mention
      
      Output format EXCLUSIVELY as JSON:
      {
        "suggestion": "A brief, actionable suggestion (1-2 sentences)",
        "tips": ["tip 1", "tip 2", "tip 3"]
      }
      
      Keep suggestions concise, encouraging, and actionable. Don't be critical, be helpful.
      `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            return NextResponse.json(JSON.parse(responseText));
        }

        if (action === "evaluate_answer") {
            const prompt = `
      You are evaluating an interview answer as a professional interviewer.
      
      Candidate Context:
      Role: ${jobRole}
      Experience Level: ${experienceLevel}
      Country: ${country}
      
      Interview Question:
      ${question}
      
      Candidate Answer:
      ${answer}
      
      Evaluate on the following dimensions:
      1. Clarity & Structure - Is the answer well-organized and easy to follow?
      2. Depth of Experience - Does it show real experience or just surface knowledge?
      3. Relevance to Role - How well does it connect to the job requirements?
      4. Confidence Signals - Does the candidate sound confident and prepared?
      5. Keyword & Skill Alignment - Are relevant skills and keywords mentioned?
      6. Specificity - Are there concrete examples, numbers, or outcomes?
      
      Output format EXCLUSIVELY as JSON:
      {
        "score": number (out of 100),
        "strengths": ["specific point 1", "specific point 2", "specific point 3"],
        "weaknesses": ["specific gap 1", "specific gap 2", "specific gap 3"],
        "advice": "Actionable advice on how to improve for next time (2-3 sentences)",
        "improvedSampleAnswer": "A complete, stronger version of the answer that demonstrates best practices",
        "nextQuestion": "The next question to ask",
        "actionableSteps": ["step 1 to improve", "step 2 to improve", "step 3 to improve"]
      }
      
      Make all feedback specific, actionable, and constructive. Focus on what they can do better.
      `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Increment usage counters
            try {
                const updateData = {};
                if (action === "evaluate_answer") {
                    updateData[`sessions.${sessionId}.questions`] = (sessionData.questions || 0) + 1;
                    updateData[`sessions.${sessionId}.lastUpdatedAt`] = new Date().toISOString();
                }

                if (Object.keys(updateData).length > 0) {
                    await usageRef.set(updateData, { merge: true });
                }
            } catch (usageError) {
                console.error("Failed to log usage:", usageError);
            }

            return NextResponse.json(JSON.parse(responseText));
        }

        if (action === "generate_summary") {
            // Validate session data - answerCount and questionCount are already destructured above
            const actualAnswerCount = answerCount || 0;
            const actualQuestionCount = questionCount || 0;
            
            // Check if session has actual answers
            const hasAnswers = fullSession && fullSession.includes('Candidate:') && 
                              fullSession.split('Candidate:').length > 1 &&
                              fullSession.split('Candidate:').some(part => part.trim().length > 10);
            
            if (!hasAnswers || actualAnswerCount === 0) {
                // Return error response for incomplete sessions
                return NextResponse.json({
                    error: "INCOMPLETE_SESSION",
                    message: "Cannot generate report: No answers were provided during the session.",
                    readinessScore: 0,
                    verdict: "Incomplete Session",
                    summary: "You didn't provide any answers during this interview session. Please complete at least one question to generate a readiness report.",
                    strengthAreas: [],
                    weakAreas: ["No answers were provided to evaluate"],
                    keyImprovements: ["Complete an interview session by answering at least one question"]
                }, { status: 400 });
            }

            const prompt = `
      CRITICAL: You are generating an Interview Readiness Report based on ACTUAL interview performance.
      
      IMPORTANT VALIDATION RULES:
      1. If the session contains ONLY questions with NO answers from the candidate, return readinessScore: 0
      2. If there are answers, evaluate them honestly - do NOT inflate scores
      3. Base the score ONLY on actual answers provided, not on assumptions
      4. If answers are incomplete or very brief, reflect that in a lower score
      5. Never generate a score above 50 if the candidate provided fewer answers than questions asked
      
      Context:
      Role: ${jobRole}
      Country: ${country}
      Questions Asked: ${actualQuestionCount}
      Answers Provided: ${actualAnswerCount}
      
      Questions & Answers:
      ${fullSession}
      
      CRITICAL SCORING GUIDELINES:
      - If actualAnswerCount is 0 or no actual answers exist: readinessScore MUST be 0
      - If actualAnswerCount < actualQuestionCount: Score should reflect incomplete participation (typically 0-40)
      - If answers are very brief or incomplete: Score should be low (0-30)
      - Only provide higher scores (50+) if there are substantial, complete answers
      - Be honest and accurate - false high scores mislead candidates
      
      Generate a JSON report with this structure:
      {
        "readinessScore": number (0-100, MUST be 0 if no answers provided),
        "strengthAreas": ["strength 1", "strength 2", "strength 3"] (empty array if no answers),
        "weakAreas": ["weakness 1", "weakness 2", "weakness 3"],
        "keyImprovements": ["improvement 1", "improvement 2"],
        "verdict": "Verdict string (High Chance / Needs Practice / High Risk / Incomplete Session)",
        "summary": "Professional summary of the performance (or explanation if session incomplete)"
      }
      
      REMEMBER: If no answers were provided, readinessScore MUST be 0 and verdict should indicate incomplete session.
      `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const parsedData = JSON.parse(responseText);

            // Double-check: If no answers, force score to 0
            if (actualAnswerCount === 0 || !hasAnswers) {
                parsedData.readinessScore = 0;
                parsedData.verdict = "Incomplete Session";
                parsedData.summary = "No answers were provided during this session. Please complete at least one question to get a proper evaluation.";
                parsedData.strengthAreas = [];
                parsedData.weakAreas = ["No answers were provided to evaluate"];
                parsedData.keyImprovements = ["Complete an interview session by answering at least one question"];
            }

            // Validate score is reasonable based on answer count
            if (actualAnswerCount > 0 && actualAnswerCount < actualQuestionCount && parsedData.readinessScore > 50) {
                // If incomplete session but score is high, cap it
                parsedData.readinessScore = Math.min(parsedData.readinessScore, 40);
                parsedData.verdict = "Needs Practice";
            }

            return NextResponse.json(parsedData);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("AI Interview API Error:", error);
        return NextResponse.json({ error: "Failed to process interview request" }, { status: 500 });
    }
}
