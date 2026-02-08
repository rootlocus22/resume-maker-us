import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

const adminDb = getFirestore();

export async function POST(request) {
  try {
    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return Response.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    console.log("Authorization header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No authorization header or invalid format");
      return Response.json(
        { error: "Unauthorized. Please log in to access this feature." },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log("Extracted token:", token ? "Token present" : "No token");
    
    // Verify the token and get user data
    let user;
    try {
      console.log("Attempting to verify token...");
      const decodedToken = await getAuth().verifyIdToken(token);
      user = decodedToken;
      console.log("Token verified successfully for user:", user.uid);
    } catch (error) {
      console.error("Token verification failed:", error);
      return Response.json(
        { error: "Invalid authentication token." },
        { status: 401 }
      );
    }

    // Get user's plan information from Firestore using Admin SDK
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return Response.json(
        { error: "User data not found. Please contact support." },
        { status: 404 }
      );
    }

    // Check if user has a paid plan (oneDay, basic, monthly, sixMonth, quarterly, yearly)
    const allowedPlans = ['oneDay', 'basic', 'premium'];
    const userPlan = userData.plan;
    
    if (!allowedPlans.includes(userPlan)) {
      return Response.json(
        { 
          error: "Cover Letter AI generation is only available for paid plans. Please upgrade to access this feature.",
          requiresUpgrade: true
        },
        { status: 403 }
      );
    }

    // Check AI attempts for oneDay plan (2 attempts max)
    if (userPlan === 'oneDay') {
      const aiAttempts = userData.cover_letter_ai_attempts || 0;
      const maxAttempts = 2;
      
      if (aiAttempts >= maxAttempts) {
        return Response.json(
          { 
            error: `You've used all ${maxAttempts} AI suggestions for your Quick Start plan. Upgrade to Pro for unlimited AI content generation.`,
            requiresUpgrade: true,
            attemptsUsed: aiAttempts,
            maxAttempts: maxAttempts
          },
          { status: 403 }
        );
      }
    }

    const { section, jobTitle, company, resumeData, jobDescription, context } = await request.json();

    if (!section || !jobTitle || !company) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if generating all sections at once
    if (section === 'all') {
      const prompt = `
You are an expert cover letter writer. Generate a complete, professional cover letter with three distinct sections: introduction, body, and closing.

Job Title: ${jobTitle}
Company: ${company}
${jobDescription ? `Job Description: ${jobDescription}` : ''}

Resume Context:
${resumeData ? `
- Name: ${resumeData.personal?.name || resumeData.name || 'Not provided'}
- Experience: ${resumeData.experience ? resumeData.experience.map(exp => `${exp.title} at ${exp.company}`).join(', ') : 'Not provided'}
- Skills: ${resumeData.skills ? (Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : resumeData.skills) : 'Not provided'}
- Education: ${resumeData.education ? resumeData.education.map(edu => `${edu.degree} from ${edu.institution}`).join(', ') : 'Not provided'}
` : 'Resume data not provided'}

Generate a professional cover letter with these three sections:

1. INTRODUCTION (2-3 sentences):
- Start with a strong opening that shows enthusiasm for the position
- Mention the specific job title and company
- Briefly highlight your relevant background

2. BODY (3-4 sentences):
- Focus on your most relevant experience and achievements
- Use specific examples and quantifiable results when possible
- Connect your skills to the company's needs
- Show how you can contribute to their success

3. CLOSING (2-3 sentences):
- Express gratitude for consideration
- Reiterate your interest and enthusiasm
- Include a call to action for next steps

Requirements:
- Use professional, confident language
- Avoid generic phrases
- Make it specific to the job title and company
- Ensure each section flows naturally

Return the content in this exact JSON format:
{
  "intro": "introduction content here",
  "body": "body content here",
  "closing": "closing content here"
}

Return ONLY the JSON, no additional text or formatting.
`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Parse the JSON response
      let parsedContent;
      try {
        // Remove markdown code blocks if present
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedContent = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Failed to parse AI response:", responseText);
        throw new Error("Failed to parse AI response");
      }

      // Increment AI attempts for oneDay plan users
      if (userPlan === 'oneDay') {
        try {
          await adminDb.collection('users').doc(user.uid).update({
            cover_letter_ai_attempts: (userData.cover_letter_ai_attempts || 0) + 1
          });
        } catch (error) {
          console.error("Failed to update AI attempts:", error);
        }
      }

      return Response.json({
        success: true,
        intro: parsedContent.intro,
        body: parsedContent.body,
        closing: parsedContent.closing,
        attemptsRemaining: userPlan === 'oneDay' ? (2 - (userData.cover_letter_ai_attempts || 0) - 1) : 'unlimited'
      });
    }

    // Generate single section
    const prompt = `
You are an expert cover letter writer. Generate professional, compelling content for the ${section} section of a cover letter.

Job Title: ${jobTitle}
Company: ${company}
${jobDescription ? `Job Description: ${jobDescription}` : ''}

Resume Context:
${resumeData ? `
- Name: ${resumeData.personal?.name || resumeData.name || 'Not provided'}
- Experience: ${resumeData.experience ? resumeData.experience.map(exp => `${exp.title} at ${exp.company}`).join(', ') : 'Not provided'}
- Skills: ${resumeData.skills ? (Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : resumeData.skills) : 'Not provided'}
- Education: ${resumeData.education ? resumeData.education.map(edu => `${edu.degree} from ${edu.institution}`).join(', ') : 'Not provided'}
` : 'Resume data not provided'}

Requirements for ${section}:
${section === 'intro' ? `
- Start with a strong opening that shows enthusiasm for the position
- Mention the specific job title and company
- Briefly highlight your relevant background
- Keep it concise but compelling (2-3 sentences)
- Use professional, confident language
` : section === 'body' ? `
- Focus on your most relevant experience and achievements
- Use specific examples and quantifiable results when possible
- Connect your skills to the company's needs
- Show how you can contribute to their success
- Keep it focused and relevant (3-4 sentences)
` : section === 'closing' ? `
- Express gratitude for consideration
- Reiterate your interest and enthusiasm
- Include a call to action for next steps
- Provide contact information or availability
- Keep it professional and courteous (2-3 sentences)
` : ''}

Generate content that:
- Is specific to the job title and company
- Uses professional, confident language
- Avoids generic phrases
- Is tailored to the ${section} section
- Fits naturally in a cover letter
- Is approximately 2-4 sentences long

Return only the generated content without any additional formatting or explanations.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const generatedContent = result.response.text().trim();

    // Increment AI attempts for oneDay plan users
    if (userPlan === 'oneDay') {
      try {
        await adminDb.collection('users').doc(user.uid).update({
          cover_letter_ai_attempts: (userData.cover_letter_ai_attempts || 0) + 1
        });
      } catch (error) {
        console.error("Failed to update AI attempts:", error);
        // Don't fail the request if we can't update the counter
      }
    }

    return Response.json({
      success: true,
      content: generatedContent,
      section: section,
      attemptsRemaining: userPlan === 'oneDay' ? (2 - (userData.cover_letter_ai_attempts || 0) - 1) : 'unlimited'
    });

  } catch (error) {
    console.error("AI Content Generation Error:", error);
    return Response.json(
      { error: "Failed to generate content. Please try again." },
      { status: 500 }
    );
  }
}
