import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;
export const runtime = "nodejs";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { userId, mode, userProfile } = await request.json();
    console.log("Interview Start Request:", { userId, mode, userProfile });

    // Validate required inputs
    if (!userId || !mode || !userProfile) {
      return NextResponse.json({ 
        error: "Missing required fields: userId, mode, userProfile" 
      }, { status: 400 });
    }

    // Enhanced Gemini prompt for natural conversation start
    const prompt = `
You are an expert interviewer conducting a ${mode} interview for ${userProfile.name}, who is a ${userProfile.experience} level professional in ${userProfile.field} looking for a ${userProfile.targetRole} position.

Your role is to conduct a natural, conversational interview that feels like talking to a real interviewer. You should:

1. Start with a warm, professional greeting
2. Ask an appropriate opening question based on the interview mode
3. Keep the conversation flowing naturally
4. Adapt your questions to the candidate's field and experience level
5. Be encouraging and supportive while maintaining professionalism

INTERVIEW MODE: ${mode}
CANDIDATE: ${userProfile.name}
FIELD: ${userProfile.field}
EXPERIENCE LEVEL: ${userProfile.experience}
TARGET ROLE: ${userProfile.targetRole}

For ${mode} interviews:
- BEHAVIORAL: Ask about past experiences and how they handled situations
- TECHNICAL: Ask field-specific technical questions appropriate to their level
- CASE STUDY: Present a relevant business problem or scenario
- GENERAL: Mix of behavioral and technical questions

Generate a JSON response with the following structure:

{
  "question": {
    "text": "Your opening question or greeting that starts the conversation naturally",
    "type": "${mode}",
    "context": "Why you're asking this question"
  }
}

Make the question conversational, relevant to their field and experience level, and something that would naturally start an interview conversation. Don't be too formal - make it feel like a real conversation.
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
        question: {
          text: `Hi ${userProfile.name}! Thanks for joining us today. I'd love to start by learning a bit more about your background in ${userProfile.field}. Can you tell me about a recent project or achievement that you're particularly proud of?`,
          type: mode,
          context: "Opening question to understand the candidate's background and recent work"
        }
      };
    }

    return NextResponse.json({ 
      question: parsedData.question
    }, { status: 200 });

  } catch (error) {
    console.error("Interview Pro Start Error:", error);
    return NextResponse.json({
      error: "Failed to start interview session",
      details: error.message
    }, { status: 500 });
  }
} 