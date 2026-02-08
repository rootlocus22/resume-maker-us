import { NextResponse } from "next/server";
import { generateWithFallback } from "../../../lib/geminiFallback";

export async function POST(req) {
    try {
        const rawBody = await req.text();
        console.log("[ExtensionAnalyze] Raw Body Preview:", rawBody.substring(0, 1000));

        let body;
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            console.error("[ExtensionAnalyze] JSON Parse Error:", e.message);
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { jd, resumeData, type } = body;



        if (!jd) {
            console.error("[ExtensionAnalyze] Failure: JD is missing");
            return NextResponse.json({ error: "Validation Failed: Job Description (JD) object is missing in request." }, { status: 400 });
        }
        if (!resumeData && type === 'match') {
            console.error("[ExtensionAnalyze] Failure: ResumeData is missing for match type");
            return NextResponse.json({ error: "Validation Failed: Resume Data is missing. Please ensure a resume is selected." }, { status: 400 });
        }
        if (!type || (type !== 'match' && type !== 'stand-out')) {
            console.error("[ExtensionAnalyze] Failure: Invalid type:", type);
            return NextResponse.json({ error: `Validation Failed: Invalid analysis type '${type}' provided.` }, { status: 400 });
        }

        // --- MATCH SCORE ANALYSIS ---
        if (type === 'match') {
            const prompt = `
        You are an elite Senior Tech Recruiter and ATS Expert.
        
        JOB DESCRIPTION:
        Title: ${jd.title}
        Company: ${jd.company}
        Details: ${jd.description.substring(0, 3000)}

        RESUME DATA:
        ${JSON.stringify(resumeData).substring(0, 5000)}

        TASK:
        Perform a "Premium Deep-Dive Analysis" of the resume against the job description.
        Be extremely specific, critical, yet constructive. Treat this as a paid coaching session.

        OUTPUT FORMAT (JSON ONLY):
        {
          "score": number (0-100),
          "scoreColor": "green" | "yellow" | "red",
          "recruiterSummary": "2-3 sentences summarizing exactly how a recruiter would perceive this candidate at first glance. Be honest about their fit.",
          "matchingKeywords": ["strong match 1", "strong match 2", ...],
          "missingKeywords": ["critical missing 1", "critical missing 2", ...],
          "criticalGaps": [
            "Gap 1: precise explanation of a major missing qualification",
            "Gap 2: ..."
          ],
          "quickWins": [
            "Quick Fix 1: simple change to improve score immediately",
            "Quick Fix 2: ..."
          ],
          "salaryInsights": "Estimate a salary range for this role based on the JD (e.g. '$120k - $150k') or 'Not specified' if impossible to guess."
        }
      `;

            try {
                const result = await generateWithFallback(prompt, {
                    temperature: 0.2,
                    maxOutputTokens: 1500 // Increased for premium detail
                });

                // Clean formatting
                let jsonStr = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
                const analysis = JSON.parse(jsonStr);

                return NextResponse.json(analysis);

            } catch (e) {
                console.error("Match Analysis Error:", e);
                // Fallback mock response if AI fails
                return NextResponse.json({
                    score: 50,
                    scoreColor: "yellow",
                    recruiterSummary: "Analysis could not be completed at this time due to high demand.",
                    matchingKeywords: [],
                    missingKeywords: ["Error analyzing"],
                    criticalGaps: ["Please try again later."],
                    quickWins: [],
                    salaryInsights: "N/A"
                });
            }
        }

        // --- STAND OUT / COLD EMAIL ---
        if (type === 'stand-out') {
            const prompt = `
        You are a Career Strategy Coach. help a candidate stand out for this role.

        JOB: ${jd.title} at ${jd.company}
        DESCRIPTION: ${jd.description.substring(0, 2000)}

        TASK:
        1. Provide 3 specific, actionable tips to stand out for this specific role.
        2. Write a short, punchy "Cold Email" to the hiring manager.

        OUTPUT FORMAT (JSON ONLY):
        {
          "tips": [
             {"title": "Tip 1 Title", "description": "Tip description..."},
             {"title": "Tip 2 Title", "description": "Tip description..."},
             {"title": "Tip 3 Title", "description": "Tip description..."}
          ],
          "coldEmail": {
             "subject": "Email Subject",
             "body": "Email Body text..."
          }
        }
      `;

            try {
                const result = await generateWithFallback(prompt, {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                });

                let jsonStr = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
                const output = JSON.parse(jsonStr);
                return NextResponse.json(output);

            } catch (e) {
                return NextResponse.json({ error: "Failed to generate tips" }, { status: 500 });
            }
        }

        return NextResponse.json({ error: `Unhandled analysis type: ${type}` }, { status: 400 });

    } catch (error) {
        console.error("Extension Analysis Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
