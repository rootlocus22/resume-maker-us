import { NextResponse } from "next/server";
import { generateWithFallback } from "../../lib/geminiFallback";

export const maxDuration = 60; // 1 minute for faster response

export async function POST(request) {
  try {
    const { jobDescription, resumeData } = await request.json();

    // Validate required fields
    if (!jobDescription || !resumeData) {
      return NextResponse.json(
        { error: "Job description and resume data are required" },
        { status: 400 }
      );
    }

    // Validate Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("Analyzing job-resume match with Gemini AI");
    console.log("Job description length:", jobDescription.length);
    console.log("Resume data provided:", !!resumeData);

    // Create intelligent analysis prompt for Gemini
    const prompt = `You are an expert career counselor and recruitment specialist. Analyze the compatibility between this job description and candidate's resume. Focus on CORE JOB FUNCTIONS vs. mentioned technologies/tools.

## Job Description:
${jobDescription}

## Candidate Resume:
Name: ${resumeData.name || 'Not provided'}
Summary: ${resumeData.summary || 'Not provided'}
Experience: ${JSON.stringify(resumeData.experience || [], null, 2)}
Skills: ${JSON.stringify(resumeData.skills || [], null, 2)}
Education: ${JSON.stringify(resumeData.education || [], null, 2)}
Years of Experience: ${resumeData.yearsOfExperience || 'Not calculated'}

## Analysis Instructions:

1. **Primary Job Function Analysis**: What is the CORE role and industry? (e.g., Real Estate Project Management, Software Development, Marketing, Finance, etc.)

2. **Candidate Background Analysis**: What is the candidate's PRIMARY professional background and expertise area?

3. **Industry Alignment**: Are the core industries aligned? (Real Estate vs IT vs Finance vs Healthcare, etc.)

4. **Role Level Matching**: Does the candidate's seniority match the job requirements?

5. **Transferable Skills Assessment**: Which skills from the resume are genuinely relevant to the core job function?

6. **Critical Gaps Identification**: What essential skills/experience for the core role are missing?

## Important Distinction:
- A Real Estate Project Manager job that mentions "building management systems" is still fundamentally a REAL ESTATE role, not an IT role
- An IT job that mentions "budget management" is still fundamentally an IT role, not a Finance role
- Focus on the PRIMARY job function, not peripheral mentions

## Output Requirements:
Return a JSON object with this exact structure:

{
  "matchScore": number (0-100),
  "primaryJobFunction": "string (core role/industry)",
  "candidateBackground": "string (candidate's core background)",
  "industryAlignment": boolean,
  "roleAlignment": "string (aligned/partial/misaligned)",
  "criticalGaps": ["array of critical missing elements"],
  "matchedStrengths": ["array of relevant candidate strengths"],
  "recommendation": "string (proceed/caution/reconsider)",
  "warningMessage": "string (specific warning for user)",
  "experienceGap": number (years gap, negative if candidate exceeds requirement),
  "reasoning": "string (detailed explanation of the analysis)"
}

Be precise and honest. A 40% match means significant misalignment. 80%+ means strong alignment.

Return ONLY the JSON object, no additional text.`;

    // Use Gemini for intelligent analysis with more conservative settings
    console.log("Prompt length:", prompt.length, "characters");
    console.log("Using maxOutputTokens:", 4096);
    
    const result = await generateWithFallback(prompt, {
      maxOutputTokens: 4096, // Increased for complete JSON response
      temperature: 0.2, // Lower temperature for more consistent analysis
      timeout: 60000, // 60 second timeout for analysis
    });

    let analysisText = result.text.trim();
    
    // Check if response is empty or too short
    if (!analysisText || analysisText.length < 10) {
      console.error("Empty or invalid response from Gemini:", analysisText);
      console.error("Response length:", analysisText?.length || 0);
      
      // Fallback response for empty response
      return NextResponse.json({
        matchScore: 50,
        primaryJobFunction: "Unable to analyze - empty response",
        candidateBackground: "Unable to analyze - empty response", 
        industryAlignment: false,
        roleAlignment: "unknown",
        criticalGaps: ["Analysis failed - empty response from AI"],
        matchedStrengths: [],
        recommendation: "caution",
        warningMessage: "Unable to analyze compatibility due to AI service issue. Please review manually.",
        experienceGap: 0,
        reasoning: "AI service returned empty response. Please try again later."
      });
    }
    
    // Clean response
    if (analysisText.startsWith("```json")) {
      analysisText = analysisText.substring(7);
    } else if (analysisText.startsWith("```")) {
      analysisText = analysisText.substring(3);
    }
    
    if (analysisText.endsWith("```")) {
      analysisText = analysisText.substring(0, analysisText.length - 3);
    }

    analysisText = analysisText.trim();

    // Parse analysis result
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Failed to parse analysis JSON:", parseError);
      console.error("Raw response:", analysisText);
      console.error("Response length:", analysisText?.length || 0);
      
      // Try to fix truncated JSON by completing missing closing braces
      let fixedAnalysisText = analysisText;
      let braceCount = (analysisText.match(/\{/g) || []).length - (analysisText.match(/\}/g) || []).length;
      
      if (braceCount > 0) {
        console.log("Attempting to fix truncated JSON by adding", braceCount, "closing braces");
        fixedAnalysisText = analysisText + "}".repeat(braceCount);
        
        try {
          analysis = JSON.parse(fixedAnalysisText);
          console.log("Successfully fixed truncated JSON");
        } catch (secondParseError) {
          console.error("Failed to fix truncated JSON:", secondParseError);
        }
      }
      
      // If still can't parse, use fallback
      if (!analysis) {
        // Fallback response
        return NextResponse.json({
          matchScore: 50,
          primaryJobFunction: "Unable to analyze - parsing error",
          candidateBackground: "Unable to analyze - parsing error", 
          industryAlignment: false,
          roleAlignment: "unknown",
          criticalGaps: ["Analysis failed - invalid response format"],
          matchedStrengths: [],
          recommendation: "caution",
          warningMessage: "Unable to analyze compatibility due to response format issue. Please review manually.",
          experienceGap: 0,
          reasoning: "AI service returned invalid response format. Please try again later."
        });
      }
    }

    // Validate analysis structure
    const requiredFields = ['matchScore', 'primaryJobFunction', 'candidateBackground', 'recommendation'];
    const missingFields = requiredFields.filter(field => !analysis.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      console.error("Analysis missing required fields:", missingFields);
      return NextResponse.json(
        { error: "Invalid analysis response" },
        { status: 500 }
      );
    }

    console.log("Gemini analysis completed:", {
      model: result.model,
      matchScore: analysis.matchScore,
      recommendation: analysis.recommendation,
      industryAlignment: analysis.industryAlignment
    });

    return NextResponse.json(analysis, { status: 200 });

  } catch (error) {
    console.error("Job-resume analysis error:", error);
    
    return NextResponse.json({
      error: "Failed to analyze job-resume compatibility",
      details: error.message || "Unknown error occurred"
    }, { status: 500 });
  }
} 