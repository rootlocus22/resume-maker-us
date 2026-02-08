import { NextResponse } from "next/server";
import { generateWithFallback } from "../../lib/geminiFallback";
import { adminDb } from "../../lib/firebase";

export const maxDuration = 60; // 60 seconds (1 minute)

export async function POST(request) {
  try {
    // Validate HTTP method
    if (request.method !== "POST") {
      console.error("Method not allowed:", request.method);
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    // Parse request body
    const { userId, field, input } = await request.json();
    console.log("Request Body:", { userId, field, input });

    // Validate required fields
    if (!userId || !field) {
      console.error("Missing userId or field in request");
      return NextResponse.json({ error: "Missing userId or field" }, { status: 400 });
    }

    // Validate supported field types
    if (!["summary", "experience", "skills"].includes(field)) {
      console.error("Unsupported field:", field);
      return NextResponse.json({ error: "Unsupported field" }, { status: 400 });
    }

    // Validate Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not set in environment");
      return NextResponse.json(
        { error: "Server configuration error: GEMINI_API_KEY not set" },
        { status: 500 }
      );
    }

    // For authenticated users, verify user existence
    if (userId !== "anonymous") {
      const userRef = adminDb.collection("users").doc(userId);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        console.error("User not found in Firestore:", userId);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else {
      console.log("Processing as anonymous user");
    }

    // Define comprehensive ATS-optimized prompts based on the 5-factor framework
    let prompt;
    switch (field) {
      case "summary":
        prompt = `Generate an ATS-optimized professional summary (100-150 words) based on this input: "${input}". 

        CRITICAL INSTRUCTIONS:
        - Ensure perfect grammar and spelling throughout
        - Never join two words together; always use proper spacing
        - PRESERVE ALL HYPHENS in compound words (e.g., "results-oriented", "user-centric", "high-performing")
        - Avoid any formatting issues (no overlapping, no missing spaces, no run-on words)
        - Output should be ready to copy-paste into a resume with no further editing
        - Avoid repetitive phrases or redundant information
        - Use varied sentence structures and vocabulary
        - Ensure each sentence adds unique value
        - Be concise yet comprehensive

        Follow the comprehensive ATS scoring framework with these 5 key factors:

        1. KEYWORD RELEVANCE (25% weight):
        - Use industry-specific keywords and terminology
        - Include strong action verbs (spearheaded, optimized, delivered, enhanced, streamlined, accelerated, implemented, managed, developed, executed)
        - Incorporate quantifiable terms and metrics
        - Match job description keywords when available

        2. FORMATTING (20% weight):
        - Use clean, simple formatting
        - Avoid special characters or excessive formatting
        - Ensure ATS-friendly structure

        3. STRUCTURE (20% weight):
        - Clear, logical flow
        - Professional language and tone
        - Complete information presentation

        4. CONTENT QUALITY (20% weight):
        - Quantifiable achievements with specific metrics
        - Results-oriented language showing impact
        - Professional terminology and industry expertise
        - Rich, detailed content (aim for 100+ words)

        5. COMPATIBILITY (15% weight):
        - ATS-friendly language and terminology
        - Industry-standard formatting
        - Professional tone that passes automated screening

        CRITICAL REQUIREMENTS:
        - Start with years of experience and key role
        - Include 3-4 distinct achievements with varied metrics
        - Use industry-relevant keywords throughout
        - End with clear value proposition
        - Ensure 100-150 words for optimal content depth
        - Use professional, results-oriented language
        - Avoid repetition of ideas or phrases
        - Each bullet point should be distinct and valuable
        - Use diverse action verbs and varied impact measurements

        AUTHENTICITY REQUIREMENTS:
        - PRESERVE ORIGINAL ESSENCE: Keep the candidate's actual experience and achievements
        - DO NOT OVERPROMISE: Only enhance what's already present, don't fabricate new achievements
        - STAY IN DOMAIN: A construction manager should not get IT skills like "Agile" or "DevOps"
        - REALISTIC SKILLS: Only add skills that can be reasonably inferred from their actual experience
        - NO FABRICATED METRICS: Use the candidate's actual numbers, don't create new ones
        - MAINTAIN AUTHENTICITY: Stay true to the candidate's actual background and industry
        - STRICT RULE: Never add certifications unless explicitly mentioned in original resume

        Make it keyword-rich for better ATS compatibility while remaining natural and compelling.`;
        break;
        
      case "experience":
        prompt = `Generate an ATS-optimized experience description (80-120 words) based on this input: "${input}". 

        CRITICAL INSTRUCTIONS:
        - Ensure perfect grammar and spelling throughout
        - Never join two words together; always use proper spacing
        - PRESERVE ALL HYPHENS in compound words (e.g., "results-oriented", "user-centric", "high-performing")
        - Avoid any formatting issues (no overlapping, no missing spaces, no run-on words)
        - Output should be ready to copy-paste into a resume with no further editing
        - Avoid repetitive action verbs or similar achievements
        - Use diverse metrics and impact measurements
        - Ensure each bullet point covers different aspects of the role
        - Vary sentence structures and avoid redundancy

        Follow the comprehensive ATS scoring framework with these 5 key factors:

        1. KEYWORD RELEVANCE (25% weight):
        - Use industry-specific keywords and technical terms
        - Include strong action verbs at the start of each bullet
        - Incorporate job description keywords when available
        - Use current industry terminology

        2. FORMATTING (20% weight):
        - Use bullet points for ATS compatibility
        - Clean, simple formatting without special characters
        - Consistent structure across all bullet points

        3. STRUCTURE (20% weight):
        - Clear, logical organization
        - Professional language and tone
        - Complete information for each responsibility

        4. CONTENT QUALITY (20% weight):
        - Quantifiable achievements with specific metrics (percentages, dollar amounts, team sizes, timeframes)
        - Results-oriented language showing measurable impact
        - Professional terminology and industry expertise
        - Rich, detailed content (aim for 80+ words)

        5. COMPATIBILITY (15% weight):
        - ATS-friendly language and terminology
        - Industry-standard formatting
        - Professional tone that passes automated screening

        CRITICAL REQUIREMENTS:
        - Start each bullet with diverse strong action verbs (spearheaded, optimized, delivered, implemented, managed, developed, enhanced, streamlined, accelerated, executed, coordinated, facilitated, orchestrated, pioneered)
        - Include varied specific metrics: increased X by Y%, reduced costs by $Z, managed team of N people, handled budget of $X, processed Y transactions, improved efficiency by Z%, decreased time by A%, expanded reach by B%, optimized processes by C%
        - Use industry keywords and technical skills
        - Focus on results and measurable outcomes
        - Structure as 3-4 bullet points highlighting different responsibilities and achievements
        - Ensure 80+ words for optimal content depth
        - Avoid repeating similar achievements or metrics
        - Each bullet should represent a different skill or responsibility area
        - Use diverse impact measurements and varied success metrics

        AUTHENTICITY REQUIREMENTS:
        - PRESERVE ORIGINAL ESSENCE: Keep the candidate's actual experience and achievements
        - DO NOT OVERPROMISE: Only enhance what's already present, don't fabricate new achievements
        - STAY IN DOMAIN: A construction manager should not get IT skills like "Agile" or "DevOps"
        - REALISTIC SKILLS: Only add skills that can be reasonably inferred from their actual experience
        - NO FABRICATED METRICS: Use the candidate's actual numbers, don't create new ones
        - MAINTAIN AUTHENTICITY: Stay true to the candidate's actual background and industry
        - STRICT RULE: Never add certifications unless explicitly mentioned in original resume

        Structure as bullet points highlighting key responsibilities and measurable outcomes.`;
        break;
        
      case "skills":
        prompt = `Based on this resume context: "${input}", suggest exactly 8-12 ATS-optimized skills that would improve resume ranking.

        CRITICAL INSTRUCTIONS:
        - Ensure perfect grammar and spelling throughout
        - Never join two words together; always use proper spacing
        - PRESERVE ALL HYPHENS in compound words (e.g., "results-oriented", "user-centric", "high-performing")
        - Avoid any formatting issues (no overlapping, no missing spaces, no run-on words)
        - Output should be ready to copy-paste into a resume with no further editing
        - Avoid repetitive or similar skills
        - Ensure diverse skill categories (technical, soft skills, tools, methodologies)
        - Use varied proficiency levels appropriately
        - Each skill should be distinct and valuable

        Follow the comprehensive ATS scoring framework with these 5 key factors:

        1. KEYWORD RELEVANCE (25% weight):
        - High-demand skills relevant to the user's field/industry
        - Skills commonly found in job descriptions for their role
        - Modern, current terminology that ATS systems recognize
        - Industry-specific technical and soft skills

        2. FORMATTING (20% weight):
        - Clean, simple skill names without special characters
        - Consistent formatting across all skills
        - ATS-friendly terminology

        3. STRUCTURE (20% weight):
        - Logical grouping of related skills
        - Appropriate skill proficiency levels
        - Complete skill descriptions

        4. CONTENT QUALITY (20% weight):
        - Mix of technical and soft skills (if applicable)
        - Skills that complement existing experience
        - Relevant certifications and tools
        - Industry-standard skill names

        5. COMPATIBILITY (15% weight):
        - ATS-recognized skill terminology
        - Industry-standard formatting
        - Professional skill categorization

        CRITICAL REQUIREMENTS:
        - Return exactly 8-12 skills for optimal ATS scoring
        - Include core technical skills for the role
        - Add in-demand soft skills (Leadership, Communication, Problem Solving, Strategic Planning)
        - Include industry-specific tools/technologies
        - Use current, ATS-recognized terminology
        - Mix of Expert/Advanced/Intermediate proficiency levels
        - Skills that complement their existing experience

        SKILL PROFICIENCY RULES:
        - "Expert" for skills directly tied to current job title (max 3)
        - "Advanced" for core skills used in multiple roles (3-4 skills)
        - "Intermediate" for complementary/emerging skills (2-4 skills)

        INDUSTRY-SPECIFIC ENHANCEMENTS:
        - Tech: Add skills like "Agile", "API Development", "Cloud Computing", "Data Analysis", "DevOps", "CI/CD"
        - Management: Add "Leadership", "Strategic Planning", "Budget Management", "Team Development", "Project Management"
        - Marketing: Add "Digital Marketing", "Analytics", "Campaign Management", "Brand Strategy", "SEO/SEM"
        - Sales: Add "CRM", "Lead Generation", "Pipeline Management", "Client Relations", "Sales Strategy"

        AUTHENTICITY REQUIREMENTS:
        - PRESERVE ORIGINAL ESSENCE: Keep the candidate's actual experience and achievements
        - DO NOT OVERPROMISE: Only add skills that can be reasonably inferred from their actual experience
        - STAY IN DOMAIN: A construction manager should not get IT skills like "Agile" or "DevOps"
        - REALISTIC SKILLS: Only add skills that make sense for their actual background and industry
        - MAINTAIN AUTHENTICITY: Stay true to the candidate's actual background and industry
        - STRICT RULE: Never add certifications unless explicitly mentioned in original resume

        ONLY return a plain list, one skill per line, with no explanations or descriptions. Format as simple skill names (e.g., "Project Management", "Data Analysis", "Leadership").`;
        break;
    }

    // Call Gemini to generate the suggestion with fallback
    console.log("Calling Gemini API with comprehensive ATS-optimized prompt and fallback");
    
    const result = await generateWithFallback(prompt, {
      maxOutputTokens: field === "skills" ? 200 : 300,
      temperature: 0.7,
    });
    
    let suggestion = result.text;
    console.log(`Gemini Response (using ${result.model}):`, suggestion);

    // Clean up the response - remove asterisks and other special characters
    // BUT preserve hyphens and other important punctuation
    suggestion = suggestion
      .replace(/^\*\s*/, "") // Remove leading asterisk and space
      .replace(/\*\s*/g, "") // Remove any remaining asterisks
      .replace(/^[-•]\s*/gm, "") // Remove leading bullet points (only at start of lines)
      .trim();

    // Format the response based on the field
    let formattedSuggestion;
    if (field === "skills") {
      // Extract clean skill names from the response
      let suggestedSkills = suggestion
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => 
          s && 
          !s.toLowerCase().includes("based on") &&
          !s.toLowerCase().includes("here are") &&
          !s.toLowerCase().includes("skills:") &&
          !s.toLowerCase().includes("suggested") &&
          !s.toLowerCase().includes("critical") &&
          !s.toLowerCase().includes("requirements") &&
          s.length > 2
        )
        .map((s) => {
          // Clean up common prefixes and formatting
          return s
            .replace(/^\d+\.\s*/, "") // Remove numbering
            .replace(/^[-*•]\s*/, "") // Remove bullet points
            .replace(/^Skill:\s*/i, "") // Remove "Skill:" prefix
            .replace(/[^\w\s-+#]/g, "") // Keep only alphanumeric, spaces, hyphens, plus, hash
            .trim();
        })
        .filter((s) => s.length > 0 && s.length < 50); // Reasonable length limits

      // Remove duplicates with existing skills in input
      let inputSkills = [];
      try {
        const parsed = typeof input === 'string' ? JSON.parse(input) : input;
        if (Array.isArray(parsed)) {
          inputSkills = parsed.map(s => (s.name || s).toString().trim().toLowerCase());
        } else if (parsed && Array.isArray(parsed.skills)) {
          inputSkills = parsed.skills.map(s => (s.name || s).toString().trim().toLowerCase());
        }
      } catch {
        // If input parsing fails, extract skills from text
        const skillPattern = /(?:skills?|technologies?|tools?)[\s:]*([^.]+)/i;
        const match = input.match(skillPattern);
        if (match) {
          inputSkills = match[1].split(/[,;]/).map(s => s.trim().toLowerCase());
        }
      }
      
      suggestedSkills = suggestedSkills.filter(
        s => !inputSkills.includes(s.toLowerCase())
      );
      
      // Limit to 8-12 skills as requested for optimal ATS scoring
      formattedSuggestion = suggestedSkills.slice(0, 12);
    } else {
      formattedSuggestion = suggestion;
    }

    return NextResponse.json(
      { suggestion: formattedSuggestion },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating comprehensive ATS-optimized resume suggestions:", error);
    return NextResponse.json(
      {
        error: "Failed to generate comprehensive ATS-optimized resume suggestions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";