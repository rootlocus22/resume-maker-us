import { streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { adminDb } from "../../lib/firebase";

export async function POST(req) {
  try {
    const { userId, prompt } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
    }

    const userDocRef = adminDb.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    const isPremium = userDoc.exists && userDoc.data().plan === "premium";

    if (!isPremium && (await getProblemCount(userId)) >= 1) {
      return new Response(
        JSON.stringify({
          error: "Problem solving limit reached",
          message: "Get unlimited problem solving starting ₹199 (7 days)!",
          showPremiumNudge: true,
          upgradeUrl: "/checkout?billingCycle=basic"
        }),
        { status: 403 }
      );
    }

    // Stream the response with a higher token limit
    const result = await streamText({
      model: xai("grok-2-1212", { apiKey: process.env.XAI_API_KEY }),
      prompt,
      maxTokens: 2048, // Increased from 600 to 2048 for longer responses
      temperature: 0.7, // Optional: adjust for consistency
    });

    console.log("Returning baseStream:", result.baseStream instanceof ReadableStream);

    // Create a transform stream to process chunks and ensure full delivery
    const textStream = result.baseStream.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          console.log("Raw chunk:", chunk); // Log raw chunk for debugging
          if (chunk.part && chunk.part.type === "error") {
            controller.error(new Error(`xAI API error: ${chunk.part.error.message}`));
          } else if (chunk.part && chunk.part.type === "text-delta") {
            const text = chunk.part.textDelta;
            console.log("Text delta:", text); // Log each text chunk
            controller.enqueue(new TextEncoder().encode(text));
          }
        },
        flush(controller) {
          console.log("Stream flush: End of response"); // Log when stream ends
          controller.terminate(); // Ensure stream closure
        },
      })
    );

    return new Response(textStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error in solve-problem-session:", error);
    return new Response(JSON.stringify({ error: "Failed to process request", details: error.message }), {
      status: 500,
    });
  }
}

async function getProblemCount(userId) {
  const userDoc = await adminDb.collection("users").doc(userId).get();
  return userDoc.exists ? userDoc.data().problemCount || 0 : 0;
}