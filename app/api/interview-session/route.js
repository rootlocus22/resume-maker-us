import { streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { adminDb } from "../../lib/firebase";
import { Readable } from "stream";

export async function POST(req) {
  try {
    const { userId, prompt } = await req.json();

    console.log("Received payload:", JSON.stringify({ userId, prompt }, null, 2));

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
    }

    const userDocRef = adminDb.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Check if user has a premium interview plan or the kit active
    const isPremium = userData.interview_plan === "interview_gyani" ||
      userData.interview_plan === "pro" ||
      userData.plan === "premium" ||
      userData.hasInterviewKit === true;

    if (!isPremium && (await getSessionCount(userId)) >= 5) {
      return new Response(
        JSON.stringify({
          error: "Free question limit reached",
          message: "You’ve used your 5 free questions. Upgrade to premium for unlimited access!",
          showPremiumNudge: true,
        }),
        { status: 403 }
      );
    }

    // Fetch user details for personalization using Admin SDK
    const profileDocRef = adminDb.collection("users").doc(userId).collection("profile").doc("details");
    const profileDoc = await profileDocRef.get();
    const userDetails = profileDoc.exists ? profileDoc.data() : { name: "Candidate", role: "Unknown" };
    const { name, role } = userDetails;

    const fullPrompt = `
      You’re an interview coach helping ${name} prepare for a ${role} role. Your job is to:
      1. Ask realistic interview questions (behavioral or technical, based on the role).
      2. Provide friendly, constructive feedback on their answers when they respond.
      3. Keep the conversation flowing with follow-up questions to deepen their practice.
      If they ask you to "become my interviewer" or similar, fully commit to that role and start asking questions immediately. Don’t change topics unless they explicitly ask you to. Here’s the chat so far:\n${prompt}
    `;
    console.log("Constructed fullPrompt:", fullPrompt);

    const result = await streamText({
      model: xai("grok-2-1212", { apiKey: process.env.XAI_API_KEY }),
      prompt: fullPrompt,
      maxTokens: 600,
    });

    console.log("Returning baseStream:", result.baseStream instanceof ReadableStream);

    const textStream = result.baseStream.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          console.log("Raw chunk:", chunk);
          if (chunk.part && chunk.part.type === "error") {
            controller.error(new Error(`xAI API error: ${chunk.part.error.message}`));
          } else if (chunk.part && chunk.part.type === "text-delta") {
            const text = chunk.part.textDelta;
            controller.enqueue(new TextEncoder().encode(text));
          }
        },
      })
    );

    return new Response(textStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error in interview-session:", error);
    return new Response(JSON.stringify({ error: "Failed to process request", details: error.message }), {
      status: 500,
    });
  }
}

async function getSessionCount(userId) {
  const userDoc = await adminDb.collection("users").doc(userId).get();
  return userDoc.exists ? userDoc.data().questionCount || 0 : 0;
}