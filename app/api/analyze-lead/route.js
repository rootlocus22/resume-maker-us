import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const leadData = await req.json();
    
    if (!leadData || !leadData.profile) {
      return NextResponse.json(
        { error: "Lead data is required" },
        { status: 400 }
      );
    }

    const { profile, experience, education, skills, entryPoint, createdAt } = leadData;

    // Create analysis prompt for Gemini
    const analysisPrompt = `
You are an expert sales consultant analyzing leads for a premium resume service (ExpertResume) that costs ₹499/month. 

LEAD PROFILE:
- Name: ${profile.name || 'Unknown'}
- Job Title: ${profile.jobTitle || 'Not specified'}
- Experience: ${profile.yearsOfExperience || 0} years
- Email: ${profile.email || 'Not provided'}
- Phone: ${profile.phone || 'Not provided'}
- Location: ${profile.address || 'Not specified'}
- Entry Point: ${entryPoint || 'Unknown'}
- Lead Age: ${createdAt ? Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60)) + ' hours' : 'Unknown'}

PROFESSIONAL BACKGROUND:
Experience: ${experience ? experience.map(exp => `${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate})`).join(', ') : 'No experience data'}

Education: ${education ? education.map(edu => `${edu.degree} from ${edu.institution}`).join(', ') : 'No education data'}

Skills: ${skills ? skills.map(skill => skill.name).join(', ') : 'No skills data'}

ANALYSIS REQUIREMENTS:
1. Assess if this is a HIGH, MEDIUM, or LOW priority lead for conversion
2. Provide a confidence score (1-10) for successful conversion
3. Identify key pain points this person likely faces
4. Suggest conversation topics and value propositions
5. Generate a personalized call script

Respond in the following JSON format:
{
  "recommendation": "HIGH/MEDIUM/LOW",
  "confidenceScore": 8,
  "reasoning": "Detailed explanation of why this lead should or shouldn't be called",
  "painPoints": ["pain point 1", "pain point 2"],
  "valueProposition": "Main value prop to focus on",
  "conversationTopics": ["topic 1", "topic 2", "topic 3"],
  "callScript": {
    "opening": "Hi [Name], this is [Agent] from ExpertResume...",
    "painPointDiscovery": "I noticed you're a [Job Title] with [X] years of experience...",
    "valuePresentation": "Based on your background, our premium service can help you...",
    "objectionHandling": "If they say it's expensive: 'I understand the investment concern...'",
    "closing": "Would you be interested in a quick 15-minute call to discuss..."
  },
  "bestTimeToCall": "Based on their profile, suggest best time",
  "followUpStrategy": "If they don't answer or aren't interested"
}

Make the analysis practical and actionable for a sales agent.
`;

    console.log('🤖 Analyzing lead with Gemini...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const analysisText = response.text();

    console.log('🤖 Raw Gemini response:', analysisText.substring(0, 200) + '...');

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from the response (remove markdown formatting if present)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError);
      // Fallback analysis
      analysis = {
        recommendation: "MEDIUM",
        confidenceScore: 5,
        reasoning: "Unable to perform detailed analysis due to parsing error. Manual review recommended.",
        painPoints: ["Resume optimization needed", "Career advancement challenges"],
        valueProposition: "Professional resume enhancement for better job opportunities",
        conversationTopics: ["Current job search status", "Resume challenges", "Career goals"],
        callScript: {
          opening: `Hi ${profile.name || '[Name]'}, this is [Agent Name] from ExpertResume. I noticed you recently used our resume analysis tool.`,
          painPointDiscovery: `As a ${profile.jobTitle || 'professional'} with ${profile.yearsOfExperience || 'your'} experience, you might be looking to enhance your resume for better opportunities.`,
          valuePresentation: "Our premium service helps professionals like you create ATS-optimized resumes that get noticed by recruiters.",
          objectionHandling: "I understand budget is a consideration. For just ₹499, you get unlimited resume updates for a full month - that's less than what most people spend on coffee!",
          closing: "Would you be interested in a quick 10-minute call to see how we can help boost your resume's effectiveness?"
        },
        bestTimeToCall: "Weekday evenings (6-8 PM) or weekend mornings",
        followUpStrategy: "Send personalized email with resume tips, follow up in 2-3 days"
      };
    }

    // Add metadata
    analysis.analyzedAt = new Date().toISOString();
    analysis.leadId = leadData.id;
    analysis.agentNotes = `Lead from ${entryPoint} - ${profile.yearsOfExperience || 0}y experience in ${profile.jobTitle || 'unspecified role'}`;

    console.log('✅ Lead analysis completed:', {
      recommendation: analysis.recommendation,
      confidence: analysis.confidenceScore,
      leadName: profile.name
    });

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error("❌ Error analyzing lead:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze lead", 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
