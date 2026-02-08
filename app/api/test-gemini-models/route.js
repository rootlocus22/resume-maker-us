import { NextResponse } from "next/server";
import { generateWithFallback } from "../../lib/geminiFallback";

export async function GET() {
  try {
    console.log("Testing Gemini models...");
    
    const testPrompt = "Say 'Hello World' and return this JSON: {\"test\": \"success\"}";
    
    const result = await generateWithFallback(testPrompt, {
      maxOutputTokens: 100,
      temperature: 0.1,
      timeout: 30000,
    });
    
    console.log("Test result:", {
      model: result.model,
      text: result.text,
      success: result.success,
      attemptedModels: result.attemptedModels
    });
    
    return NextResponse.json({
      success: true,
      model: result.model,
      response: result.text,
      attemptedModels: result.attemptedModels
    });
    
  } catch (error) {
    console.error("Test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      attemptedModels: error.attemptedModels || []
    }, { status: 500 });
  }
} 