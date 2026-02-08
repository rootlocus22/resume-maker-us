import { NextResponse } from "next/server";
import { generateWithFallback } from "../../lib/geminiFallback";
import { adminDb } from "../../lib/firebase";
import { createHash } from "crypto";
import { normalizeResumeDates } from "../../lib/storage";

export const maxDuration = 120; // 2 minutes

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const AUTH_USER_LIMIT = 20; // 20 requests per minute for logged-in users
const ANON_USER_LIMIT = 5; // 5 requests per minute for anonymous users

// Rate limiting helper function
async function checkRateLimit(identifier, isAnonymous) {
  try {
    const limit = isAnonymous ? ANON_USER_LIMIT : AUTH_USER_LIMIT;
    const type = isAnonymous ? "ip" : "user";
    const docId = `ratelimit_ai_${type}_${createHash("md5").update(identifier).digest("hex")}`;

    const docRef = adminDb.collection("rateLimits").doc(docId);

    // Transaction to ensure atomic updates
    return await adminDb.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      const now = Date.now();

      let data;
      if (!doc.exists) {
        data = {
          count: 1,
          windowStart: now,
          lastRequest: now
        };
      } else {
        data = doc.data();

        // Reset window if it's been more than a minute
        if (now - data.windowStart > RATE_LIMIT_WINDOW) {
          data = {
            count: 1,
            windowStart: now,
            lastRequest: now
          };
        } else {
          // Check limit
          if (data.count >= limit) {
            return { allowed: false, resetIn: Math.ceil((data.windowStart + RATE_LIMIT_WINDOW - now) / 1000) };
          }

          data.count += 1;
          data.lastRequest = now;
        }
      }

      t.set(docRef, data);
      return { allowed: true };
    });
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail open (allow request) if rate limit check fails to avoid blocking users due to DB errors
    return { allowed: true };
  }
}

export async function POST(request) {
  try {
    // 1. Extract IP for anonymous rate limiting
    let ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    const body = await request.json();
    const { userId, field, input, sourceInput } = body;
    console.log("Request Body:", { userId, field, input, sourceInput });

    // 2. Determine Rate Limit Identifier
    const isAnonymous = !userId || userId === "anonymous";
    const identifier = isAnonymous ? ip : userId;

    console.log(`Checking rate limit for ${isAnonymous ? "IP" : "User"}: ${identifier}`);

    // 3. Check Rate Limit
    const rateLimitResult = await checkRateLimit(identifier, isAnonymous);

    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for ${isAnonymous ? "IP" : "User"}: ${identifier}`);
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rateLimitResult.resetIn} seconds.` },
        { status: 429 }
      );
    }

    if (!input) {
      console.error("Missing input in request");
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    // Validate Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not set in environment");
      return NextResponse.json(
        { error: "Server configuration error: GEMINI_API_KEY not set" },
        { status: 500 }
      );
    }

    // Use sourceInput if provided, otherwise fall back to input for cache key
    const cacheInput = sourceInput || input;
    const rawCacheInput = typeof cacheInput === "string" ? cacheInput : JSON.stringify(cacheInput);
    console.log("Raw Cache Input (pre-hash):", rawCacheInput);

    // Generate cache key from raw cache input
    const cacheKeyInput = `${field}:${rawCacheInput}`;
    console.log("Cache Key Input (pre-hash):", cacheKeyInput);
    const cacheKey = createHash("sha256").update(cacheKeyInput).digest("hex");
    console.log("Generated Cache Key:", cacheKey);

    // Check Firestore cache
    const cacheRef = adminDb.collection("cache").doc(cacheKey);
    // const cacheDoc = await cacheRef.get();
    // if (cacheDoc.exists) {
    //   const cachedData = cacheDoc.data();
    //   console.log("Cache Hit - Returning cached result for key:", cacheKey);
    //   return NextResponse.json({ suggestion: cachedData.suggestion }, { status: 200 });
    // }
    console.log("Cache Miss - Proceeding with Gemini call for key:", cacheKey);

    // Handle user limits with adminDb
    let isPremium = false;
    let aiSuggestionCount = 0;

    if (userId && userId !== "anonymous") {
      try {
        console.log("Checking user data for:", userId);
        const userRef = adminDb.collection("users").doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
          console.error("User not found in Firestore:", userId);
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userData = userDoc.data();
        console.log("User Data:", userData);
        isPremium = userData.plan === "premium";
        aiSuggestionCount = userData.ai_suggestion_count || 0;
      } catch (firebaseError) {
        console.error("Firebase Error:", firebaseError);
        if (firebaseError.code === "permission-denied") {
          return NextResponse.json(
            { error: "Permission denied to access user data" },
            { status: 403 }
          );
        }
        throw new Error(`Firebase error: ${firebaseError.message}`);
      }
    } else {
      console.log("Processing as anonymous user");
    }

    // Use the input for the Gemini call (enhanced or original)
    const rawInput = typeof input === "string" ? input : JSON.stringify(input);

    // Define comprehensive ATS-optimized prompts based on the 5-factor framework
    const prompt =
      field === "all"
        ? `
            You are an ATS optimization expert designed to transform resumes to achieve 85+ ATS scores. The resume ranking system evaluates based on 5 key factors:

            1. KEYWORD RELEVANCE (25% weight): Use industry-specific keywords, strong action verbs, quantifiable terms
            2. FORMATTING (20% weight): Clean, simple formatting, ATS-friendly structure, proper sections
            3. STRUCTURE (20% weight): Complete core sections, logical flow, professional language
            4. CONTENT QUALITY (20% weight): Rich content with achievements, metrics, professional terminology
            5. COMPATIBILITY (15% weight): ATS-friendly language, industry standards, professional tone

            CRITICAL INSTRUCTIONS:
            - Ensure perfect grammar and spelling throughout
            - Never join two words together; always use proper spacing
            - PRESERVE ALL HYPHENS in compound words (e.g., "results-oriented", "user-centric", "high-performing")
            - Avoid any formatting issues (no overlapping, no missing spaces, no run-on words)
            - Output should be ready to copy-paste into a resume with no further editing
            - Avoid repetitive content or redundant achievements
            - Use varied action verbs and diverse metrics
            - Ensure each section adds unique value
            - Vary sentence structures and avoid redundancy
            - Each bullet point should represent different skills or achievements

            Transform this resume JSON to maximize all 5 factors:

            CRITICAL REQUIREMENTS:
            - COMPLETENESS: Fill any missing core sections (name, email, experience, education)
            - KEYWORDS: Use power action verbs (spearheaded, optimized, delivered, enhanced, streamlined, accelerated, implemented, managed, developed, executed)
            - QUANTIFIABLE RESULTS: Add realistic metrics to ALL experience entries (increased X by Y%, reduced costs by $Z, managed team of N, handled budget of $X, processed Y transactions, improved efficiency by Z%)
            - SKILLS: Expand to 8-12 relevant, ATS-friendly skills based on job titles and industry
            - CONTENT: Ensure 400+ total words across all sections for content depth
            - CERTIFICATIONS: Add 1-3 relevant certifications based on career context
            - SUMMARY: 100-150 words, keyword-rich, role-specific

            SKILL PROFICIENCY RULES:
            - "Expert" for skills directly tied to current job title (max 3)
            - "Advanced" for core skills used in multiple roles (3-4 skills)
            - "Intermediate" for complementary/emerging skills (2-4 skills)
            
            INDUSTRY-SPECIFIC ENHANCEMENTS:
            - Tech: Add skills like "Agile", "API Development", "Cloud Computing", "Data Analysis", "DevOps", "CI/CD"
            - Management: Add "Leadership", "Strategic Planning", "Budget Management", "Team Development", "Project Management"
            - Marketing: Add "Digital Marketing", "Analytics", "Campaign Management", "Brand Strategy", "SEO/SEM"
            - Sales: Add "CRM", "Lead Generation", "Pipeline Management", "Client Relations", "Sales Strategy"

            Return ONLY the enhanced JSON object, no explanatory text.

            Resume JSON:
            ${rawInput}
          `
        : `
            You are an ATS optimization specialist. Enhance this "${field}" section to maximize resume ranking based on the comprehensive 5-factor framework:

            CRITICAL INSTRUCTIONS:
            - Ensure perfect grammar and spelling throughout
            - Never join two words together; always use proper spacing
            - PRESERVE ALL HYPHENS in compound words (e.g., "results-oriented", "user-centric", "high-performing")
            - Avoid any formatting issues (no overlapping, no missing spaces, no run-on words)
            - Output should be ready to copy-paste into a resume with no further editing
            - Avoid repetitive content or redundant information
            - Use varied action verbs and diverse metrics
            - Ensure each bullet point covers different aspects
            - Vary sentence structures and avoid redundancy
            - Each achievement should be distinct and valuable

            1. KEYWORD RELEVANCE (25% weight):
            - Include industry-relevant keywords and strong action verbs
            - Use current industry terminology and technical terms
            - Match job description keywords when available

            2. FORMATTING (20% weight):
            - Use clean, simple formatting without special characters
            - Ensure ATS-friendly structure and consistency
            - Avoid excessive formatting that may confuse ATS systems

            3. STRUCTURE (20% weight):
            - Clear, logical organization and flow
            - Professional language and tone throughout
            - Complete information presentation

            4. CONTENT QUALITY (20% weight):
            - Add specific metrics and measurable outcomes
            - Use results-oriented language showing impact
            - Include professional terminology and industry expertise
            - Ensure rich, detailed content for optimal scoring

            5. COMPATIBILITY (15% weight):
            - Use ATS-friendly language and terminology
            - Follow industry-standard formatting
            - Maintain professional tone that passes automated screening

            SPECIFIC REQUIREMENTS BY FIELD:
            
            For "skills": Return JSON array with 8-12 skills including:
            - Core technical skills for the role (avoid similar technologies)
            - In-demand soft skills (Leadership, Communication, Problem Solving, Strategic Planning)
            - Industry-specific tools/technologies (diverse categories)
            - Set realistic proficiency levels (Expert/Advanced/Intermediate)
            - Use current, ATS-recognized terminology
            - Ensure no duplicate or very similar skills
            
            For "summary": Create 100-150 words with:
            - Strong opening with years of experience
            - 3-4 distinct key skills/achievements with varied metrics
            - Industry keywords relevant to role
            - Clear value proposition
            - Professional, results-oriented language
            - Avoid repeating similar achievements or skills
            
            For "experience": Transform descriptions with:
            - Diverse power action verbs (spearheaded, optimized, delivered, enhanced, streamlined, accelerated, implemented, managed, developed, executed)
            - Varied specific metrics (percentages, dollar amounts, team sizes, timeframes, efficiency gains, cost savings)
            - Industry keywords and technical terms
            - Results-focused bullet points covering different aspects
            - Professional terminology and industry expertise
            - Each bullet should represent different responsibilities or achievements

            AUTHENTICITY REQUIREMENTS:
            - PRESERVE ORIGINAL ESSENCE: Keep the candidate's actual experience, skills, and achievements
            - DO NOT OVERPROMISE: Only enhance what's already present, don't fabricate new achievements
            - STAY IN DOMAIN: A construction manager should not get IT skills like "Agile" or "DevOps"
            - REALISTIC SKILLS: Only add skills that can be reasonably inferred from their actual experience
            - NO FABRICATED METRICS: Use the candidate's actual numbers, don't create new ones
            - MAINTAIN AUTHENTICITY: Stay true to the candidate's actual background and industry

            CERTIFICATION & LANGUAGE REQUIREMENTS:
            - CERTIFICATIONS: ONLY add certifications if EXPLICITLY mentioned in original resume, DO NOT FABRICATE ANY
            - CERTIFICATIONS: If no certifications mentioned in original, return empty array []
            - LANGUAGES: Add relevant languages with proficiency levels based on candidate's background
            - JSON FORMAT: Certifications must be objects: [{"name": "Cert Name", "issuer": "Issuer", "date": "Date"}]
            - JSON FORMAT: Languages must be objects: [{"language": "Language", "proficiency": "Level"}]
            - STRICT RULE: Never add certifications like "PMP", "CCM", "LEED" unless explicitly mentioned in original resume

            Input: "${rawInput}"

            Return ONLY the enhanced data (JSON array for skills, string for others), no extra text.
          `;

    // Use Gemini API with fallback
    console.log("Calling Gemini API with ATS-optimized prompt and fallback, length:", prompt.length);

    const result = await generateWithFallback(prompt, {
      maxOutputTokens: 8192,
      temperature: 0.7,
    });

    let suggestion = result.text;
    console.log(`Full Gemini Response (using ${result.model}):`, suggestion);

    // Clean up the response to extract valid JSON or string
    suggestion = suggestion.trim();

    // Remove asterisks and other unwanted special characters from all responses
    // BUT preserve hyphens and other important punctuation
    suggestion = suggestion
      .replace(/^\*\s*/, "") // Remove leading asterisk and space
      .replace(/\*\s*/g, "") // Remove any remaining asterisks
      .replace(/^[-•]\s*/gm, "") // Remove leading bullet points (only at start of lines)
      .trim();

    let jsonString = suggestion;

    // If it's an array (skills)
    if (field === "skills") {
      const arrayStart = suggestion.indexOf("[");
      const arrayEnd = suggestion.lastIndexOf("]") + 1;
      if (arrayStart === -1 || arrayEnd === 0) {
        console.error("No valid JSON array found in response:", suggestion);
        return NextResponse.json(
          { error: "Invalid Gemini response format for skills" },
          { status: 500 }
        );
      }
      jsonString = suggestion.slice(arrayStart, arrayEnd);
    }
    // If it's an object (all)
    else if (field === "all") {
      const jsonStart = suggestion.indexOf("{");
      const jsonEnd = suggestion.lastIndexOf("}") + 1;
      if (jsonStart === -1 || jsonEnd === 0) {
        console.error("No valid JSON found in response:", suggestion);
        return NextResponse.json(
          { error: "Invalid Gemini response format" },
          { status: 500 }
        );
      }
      jsonString = suggestion.slice(jsonStart, jsonEnd);
    }
    // For single strings (e.g., summary, description)
    else {
      jsonString = suggestion.replace(/^"|"$/g, "");
    }

    let parsedSuggestion;
    try {
      parsedSuggestion =
        field === "skills" || field === "all"
          ? JSON.parse(jsonString)
          : jsonString;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Cleaned String:", jsonString);
      if (field === "skills") {
        const lastValidArrayEnd = jsonString.lastIndexOf("]") + 1;
        if (lastValidArrayEnd > 1) {
          jsonString = jsonString.slice(0, lastValidArrayEnd);
          try {
            parsedSuggestion = JSON.parse(jsonString);
            console.log("Fallback parsing succeeded for skills");
          } catch (secondParseError) {
            console.error("Fallback Parse Error:", secondParseError);
            return NextResponse.json(
              { error: "Failed to parse Gemini response after fallback", details: secondParseError.message },
              { status: 500 }
            );
          }
        }
      } else if (field === "all") {
        const lastValidObjectEnd = jsonString.lastIndexOf("}") + 1;
        if (lastValidObjectEnd > 1) {
          jsonString = jsonString.slice(0, lastValidObjectEnd);
          try {
            parsedSuggestion = JSON.parse(jsonString);
            console.log("Fallback parsing succeeded for full resume");
          } catch (secondParseError) {
            console.error("Fallback Parse Error:", secondParseError);
            return NextResponse.json(
              { error: "Failed to parse Gemini response after fallback", details: secondParseError.message },
              { status: 500 }
            );
          }
        }
      } else {
        parsedSuggestion = jsonString;
      }
    }

    // Post-process to ensure proper format for certifications and languages
    if (field === "all" && parsedSuggestion && typeof parsedSuggestion === "object") {
      // Ensure certifications are in object format
      if (parsedSuggestion.certifications) {
        if (Array.isArray(parsedSuggestion.certifications)) {
          parsedSuggestion.certifications = parsedSuggestion.certifications.map(cert => {
            if (typeof cert === 'string') {
              return { name: cert, issuer: '', date: '' };
            } else if (typeof cert === 'object' && cert.name) {
              return { name: cert.name || '', issuer: cert.issuer || '', date: cert.date || '' };
            }
            return null;
          }).filter(Boolean);
        } else {
          parsedSuggestion.certifications = [];
        }
      }

      // Ensure languages are in object format
      if (parsedSuggestion.languages) {
        if (Array.isArray(parsedSuggestion.languages)) {
          parsedSuggestion.languages = parsedSuggestion.languages.map(lang => {
            if (typeof lang === 'string') {
              const match = lang.match(/^(.+?)\s*\((.+?)\)$/);
              if (match) {
                return { language: match[1].trim(), proficiency: match[2].trim() };
              } else {
                return { language: lang.trim(), proficiency: '' };
              }
            } else if (typeof lang === 'object' && lang.language) {
              return { language: lang.language || '', proficiency: lang.proficiency || '' };
            }
            return null;
          }).filter(Boolean);
        } else {
          parsedSuggestion.languages = [];
        }
      }
    }

    // Cache the result in Firestore with a timestamp
    // await cacheRef.set({
    //   suggestion: parsedSuggestion,
    //   timestamp: Date.now(),
    //   field,
    //   input: rawCacheInput, // Store the raw cache input for debugging
    // });
    // console.log("Cached ATS-optimized result in Firestore for key:", cacheKey);

    return NextResponse.json({ suggestion: normalizeResumeDates(parsedSuggestion) });
  } catch (error) {
    console.error("ATS-Optimized Gemini AI Suggestion Error:", error);
    return NextResponse.json(
      { error: "Failed to generate ATS-optimized suggestion with Gemini", details: error.message },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";