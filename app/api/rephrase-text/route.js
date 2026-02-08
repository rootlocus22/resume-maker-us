import { NextResponse } from "next/server";
import { generateWithFallback } from "../../lib/geminiFallback";

export const maxDuration = 60; // 1 minute

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return NextResponse.json({ error: "Please provide valid text to rephrase." }, { status: 400 });
    }

    const prompt = `You are a professional resume writer. Rephrase the following text to make it more professional, impactful, and concise for a resume. Keep the core meaning but improve clarity, impact, and professionalism. Return only the rephrased text without any additional commentary, explanations, or quotes.

Original text:
"""
${text}
"""

Rephrased text:`;

    const aiResult = await generateWithFallback(prompt, { maxTokens: 1024 });
    console.log("AI Rephrase raw result:", aiResult);
    
    const rephrased = aiResult && typeof aiResult === "object" && aiResult.text ? aiResult.text : aiResult;
    
    if (!rephrased || typeof rephrased !== "string") {
      return NextResponse.json({ error: "Failed to rephrase text." }, { status: 500 });
    }

    // Clean up the rephrased text
    const cleanedText = rephrased.trim()
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (cleanedText.length === 0) {
      return NextResponse.json({ error: "No rephrased text generated." }, { status: 500 });
    }

    return NextResponse.json({ rephrased: cleanedText });
  } catch (error) {
    console.error("AI Rephrase error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to rephrase text" },
      { status: 500 }
    );
  }
}
