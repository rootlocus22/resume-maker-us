import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;
export const runtime = "nodejs";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { userId, userResponse, conversationHistory, sessionId } = await request.json();

    if (!userId || !userResponse) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create context from conversation history
    const context = conversationHistory.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    // Enhanced prompt for AI analysis and follow-up
    const prompt = `
You are an expert interviewer conducting a professional interview. The candidate has just provided this response:

CANDIDATE RESPONSE: "${userResponse}"

CONVERSATION HISTORY:
${context}

Your task is to:
1. Provide encouraging, constructive feedback on their response
2. Ask a relevant follow-up question that builds on their answer
3. Keep the conversation flowing naturally
4. Be supportive while maintaining professional standards

Guidelines:
- Acknowledge their response positively
- Provide 1-2 specific observations about their answer
- Ask a follow-up question that digs deeper or explores related areas
- Keep your response conversational and not too long
- If they seem nervous, be encouraging
- If they give a strong answer, challenge them with a deeper question

Generate a JSON response with this structure:
{
  "response": "Your complete response including feedback and follow-up question",
  "feedback": "Brief feedback on their answer",
  "followUpQuestion": "Your follow-up question",
  "tone": "encouraging|challenging|clarifying"
}

Make it feel like a real conversation with a supportive interviewer.
`;

    try {
      // Call Gemini AI
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      let parsedData;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        // Fallback response
        parsedData = {
          response: `Thank you for that detailed response! I can see you've thought through this carefully. Your approach shows good problem-solving skills. 

Now, let me ask you a follow-up question: Can you tell me about a time when you had to adapt your approach based on feedback or changing circumstances?`,
          feedback: "Good detailed response with clear examples",
          followUpQuestion: "Can you tell me about a time when you had to adapt your approach based on feedback or changing circumstances?",
          tone: "encouraging"
        };
      }

      return NextResponse.json({
        response: parsedData.response,
        feedback: parsedData.feedback,
        followUpQuestion: parsedData.followUpQuestion,
        tone: parsedData.tone,
        sessionId,
        timestamp: new Date().toISOString()
      });

    } catch (aiError) {
      console.error("AI generation error:", aiError);
      // Fallback response when AI fails
      return NextResponse.json({
        response: `Thank you for sharing that! It's great to hear about your experience. 

I'd like to know more about how you handle challenges. Can you tell me about a time when you had to think on your feet to solve a problem?`,
        feedback: "Good response, showing experience",
        followUpQuestion: "Can you tell me about a time when you had to think on your feet to solve a problem?",
        tone: "encouraging",
        sessionId,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error analyzing interview response:", error);
    return NextResponse.json(
      { error: "Failed to analyze response" },
      { status: 500 }
    );
  }
} 