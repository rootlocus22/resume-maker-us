import { NextResponse } from "next/server";
import { generateWithFallback } from "../../lib/geminiFallback";

export const maxDuration = 60; // 1 minute

export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json({ error: "Please provide a longer text for bullet generation." }, { status: 400 });
    }

    const prompt = `Rewrite the following text as a set of 3-7 concise, impactful, and well-formatted resume bullet points. Each bullet should:
- Start with a strong action verb
- Be clear, specific, and achievement-oriented
- Avoid repetition and generic statements
- Be ready to copy-paste into a resume
- Use proper grammar, spelling, and punctuation

Text:
"""
${text}
"""

Return ONLY the bullet points, each on a new line, with no extra commentary or explanation.`;

    const aiResult = await generateWithFallback(prompt, { maxTokens: 512 });
    console.log("AI raw result:", aiResult);
    const aiText = aiResult && typeof aiResult === "object" && aiResult.text ? aiResult.text : aiResult;
    if (!aiText || typeof aiText !== "string") {
      return NextResponse.json({ error: "Failed to generate bullet points." }, { status: 500 });
    }

    // Split into bullets (lines starting with •, -, or *)
    const bullets = aiText
      .split(/\n+/)
      .map(line => line.replace(/^[-•*]\s*/, "").trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/\s+/g, " ").trim()); // Normalize whitespace but preserve hyphens

    if (bullets.length === 0) {
      return NextResponse.json({ error: "No bullet points generated." }, { status: 500 });
    }

    return NextResponse.json({ bullets });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 });
  }
} 