import { GoogleGenerativeAI } from "@google/generative-ai";

// FIXED: Use single consistent model for deterministic scoring
// Different models produce different scores even with identical inputs
const GEMINI_MODELS = [
  // "gemini-2.5-flash",      // Latest stable fast model
  // "gemini-2.5-pro",        // Latest stable high-intelligence model
  "gemini-2.0-flash"       // Previous stable generation fallback
];

// Error patterns that indicate model overload or unavailability
const OVERLOAD_ERRORS = [
  "model is overloaded",
  "503 service unavailable",
  "quota exceeded",
  "rate limit exceeded",
  "resource exhausted",
  "too many requests",
  "service temporarily unavailable",
  "model not found",
  "model unavailable",
  "invalid model",
  "model does not exist",
  "unsupported model",
  "model is not available"
];

/**
 * Attempts to generate content using multiple Gemini models with fallback
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Configuration options
 * @param {number} options.maxOutputTokens - Maximum output tokens
 * @param {number} options.temperature - Temperature for generation
 * @param {string} options.apiKey - Gemini API key
 * @returns {Promise<Object>} - Result with text and model used
 */
export async function generateWithFallback(prompt, options = {}) {
  const {
    maxOutputTokens = 250,
    temperature = 0.7,
    apiKey = process.env.GEMINI_API_KEY,
    timeout = 60000 // 60 second timeout
  } = options;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not provided");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;
  const attemptedModels = [];

  // Try each model in order
  for (const modelName of GEMINI_MODELS) {
    let modelAttempts = 0;
    const maxModelRetries = 3;

    while (modelAttempts < maxModelRetries) {
      modelAttempts++;

      try {
        if (modelAttempts > 1) {
          console.log(`[Gemini Fallback] 🔄 Retrying ${modelName} (Attempt ${modelAttempts}/${maxModelRetries})...`);
        } else {
          console.log(`[Gemini Fallback] Attempting to use model: ${modelName}`);
        }

        attemptedModels.push(modelName);

        console.log(`[Gemini Fallback] Model config:`, {
          model: modelName,
          maxOutputTokens,
          temperature,
          timeout
        });

        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            maxOutputTokens,
            temperature,
            topP: 1.0,
            topK: 1,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        });

        // Add timeout protection
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Request timeout for ${modelName}`)), timeout);
        });

        const generatePromise = model.generateContent(prompt);
        const result = await Promise.race([generatePromise, timeoutPromise]);
        const response = await result.response;
        const text = response.text();

        console.log(`[Gemini Fallback] Raw response from ${modelName}:`, text?.substring(0, 200) + (text?.length > 200 ? '...' : ''));

        // Validate response is not empty
        if (!text || text.trim().length < 10) {
          console.log(`[Gemini Fallback] ⚠️ Model ${modelName} returned empty/short response, trying next model...`);
          break; // Break inner loop to try next model
        }

        console.log(`[Gemini Fallback] ✅ Successfully generated content using ${modelName}`);
        console.log(`[Gemini Fallback] Response length: ${text.trim().length} characters`);

        return {
          text: text.trim(),
          model: modelName,
          success: true,
          attemptedModels
        };

      } catch (error) {
        lastError = error;
        const errorMessage = error.message?.toLowerCase() || '';

        console.log(`[Gemini Fallback] ❌ Model ${modelName} failed (Attempt ${modelAttempts}):`, errorMessage);
        console.log(`[Gemini Fallback] Full error object:`, error);

        // Check if this is an overload error
        const isOverloadError = OVERLOAD_ERRORS.some(pattern =>
          errorMessage.includes(pattern.toLowerCase())
        );

        if (isOverloadError) {
          if (modelAttempts < maxModelRetries) {
            const waitTime = 2000 * modelAttempts; // 2s, 4s, 6s
            console.log(`[Gemini Fallback] ⏳ Rate limit hit. Waiting ${waitTime / 1000}s before retrying ${modelName}...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry same model
          } else {
            console.log(`[Gemini Fallback] ⏭️ Max retries reached for ${modelName}. Moving to next model.`);
            break; // Break inner loop, move to next model
          }
        } else {
          // If it's not an overload error (e.g. 404 Not Found), don't retry this model
          console.log(`[Gemini Fallback] ⚠️ Non-retriable error for ${modelName} (e.g. 404). Moving to next model.`);
          break; // Break inner loop, move to next model
        }
      }
    }
  }

  // If all models failed, throw a comprehensive error
  console.error(`[Gemini Fallback] 💥 All Gemini models failed. Attempted models:`, attemptedModels);
  console.error(`[Gemini Fallback] 💥 Last error:`, lastError?.message);

  throw new Error("AI service is currently busy. Please try again in a few moments.");
}

/**
 * Enhanced version with retry logic for transient errors
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Number of retries per model
 * @param {number} options.retryDelay - Delay between retries in ms
 * @returns {Promise<Object>} - Result with text and model used
 */
export async function generateWithRetry(prompt, options = {}) {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    ...fallbackOptions
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Gemini Retry] Attempt ${attempt + 1}/${maxRetries + 1}`);
      return await generateWithFallback(prompt, fallbackOptions);
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        console.log(`[Gemini Retry] Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
    }
  }

  throw lastError;
}

/**
 * Simple wrapper for backward compatibility
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Generated text
 */
export async function generateContent(prompt, options = {}) {
  const result = await generateWithFallback(prompt, options);
  return result.text;
}

/**
 * Get the list of available models for debugging
 * @returns {Array<string>} - List of available models
 */
export function getAvailableModels() {
  return [...GEMINI_MODELS];
}

/**
 * Check if an error is an overload error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's an overload error
 */
export function isOverloadError(error) {
  const errorMessage = error.message?.toLowerCase() || '';
  return OVERLOAD_ERRORS.some(pattern => errorMessage.includes(pattern.toLowerCase()));
} 