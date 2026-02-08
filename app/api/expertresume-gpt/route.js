import { NextResponse } from "next/server";
import { generateWithFallback } from "../../lib/geminiFallback";
import { adminDb } from "../../lib/firebase";
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; // Removed in favor of direct Gemini upload
import mammoth from "mammoth";

export const runtime = "nodejs";
export const maxDuration = 60;

// Career coach system prompt
const CAREER_COACH_SYSTEM_PROMPT = `You are ExpertResume GPT, an expert career coach and resume advisor with deep knowledge in:

**Core Expertise:**
- Resume writing and optimization
- Career development and transitions
- Interview preparation and techniques
- Job search strategies
- Salary negotiation
- Professional networking
- Skills development
- Industry insights across tech, business, creative, healthcare, and more

**Your Personality:**
- Supportive and encouraging
- Professional yet approachable
- Data-driven with practical advice
- Honest and constructive
- Motivating and inspiring

**Communication Style:**
- Use clear, actionable advice
- Provide specific examples when relevant
- Break down complex topics into digestible steps
- Use bullet points for clarity when appropriate
- Include relevant statistics or best practices when helpful
- For coding/technical problems, use proper code formatting
- For mathematical concepts, use LaTeX notation when needed

**Guidelines:**
- Always tailor advice to the user's specific situation
- Ask clarifying questions when needed
- Provide both short-term and long-term strategies
- Acknowledge challenges while focusing on solutions
- Cite best practices from career experts when relevant
- For resume advice, consider ATS optimization
- For interview prep, include behavioral and technical aspects
- For coding problems, provide clear explanations with examples

**CROSS-SELL & UP-SELL PROTOCOLS (STRICT):**
You must actively promote our paid add-ons and products based on user queries. Follow these rules:

1. **Job Search Queries**: If the user asks about finding jobs, searching for roles nearby, or general job search help, tell them to purchase the "AI Job Search Add-on". Mention they can find this on the "My Jobs" and "Jobs Nearby" pages.
2. **Job Tracking & Application Management**: If the user asks how to track their applications, manage interviews, or organize their job hunt, direct them to use "Apply Pro". Explain that "Apply Pro" is designed specifically to help them track and manage their jobs and interviews in one place.
3. **Interview Preparation**: If the user asks for specific interview answers, mock practice, or how to prepare for an interview, DO NOT provide the answers directly. Instead, inform them that for expert interview preparation, they should purchase "InterviewGyani" directly or use the "ExpertResume Add-Ons". Highlight that "InterviewGyani" is our specialized product for mastering interviews.

**LaTeX Usage:**
- Use inline LaTeX with \\( ... \\) for formulas
- Use block LaTeX with \\[ ... \\] for equations
- Example: Time complexity \\(O(n \\log n)\\)

**Code Formatting:**
- Use markdown code blocks with language specification
- Example: \`\`\`python for Python code

Remember: You're here to help users advance their careers and land their dream jobs!`;

/**
 * Fetch user's resume data for contextual responses
 */
async function getUserResumeContext(userId) {
  if (!userId) {
    console.log("⚠️ No userId provided to getUserResumeContext");
    return null;
  }

  console.log("🔍 Fetching resume context for userId:", userId);

  try {
    const context = {
      hasResumes: false,
      resumeCount: 0,
      latestResume: null,
      uploadHistory: [],
      userProfile: null
    };

    // Fetch user's resumes
    console.log("📄 Fetching resumes from:", `users/${userId}/resumes`);
    const resumesSnapshot = await adminDb.collection("users").doc(userId).collection("resumes").get();
    console.log("📄 Resumes found:", resumesSnapshot.size);

    if (!resumesSnapshot.empty) {
      context.hasResumes = true;
      context.resumeCount = resumesSnapshot.size;

      // Get the most recent resume
      const resumes = resumesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by updatedAt or createdAt (Admin SDK timestamps are already Date objects or have toDate())
      const sortedResumes = resumes.sort((a, b) => {
        const dateA = a.updatedAt?._seconds ? new Date(a.updatedAt._seconds * 1000) : (a.createdAt?._seconds ? new Date(a.createdAt._seconds * 1000) : new Date(0));
        const dateB = b.updatedAt?._seconds ? new Date(b.updatedAt._seconds * 1000) : (b.createdAt?._seconds ? new Date(b.createdAt._seconds * 1000) : new Date(0));
        return dateB - dateA;
      });

      if (sortedResumes.length > 0) {
        const latestResume = sortedResumes[0];

        // Extract key information
        context.latestResume = {
          name: latestResume.name || latestResume.profile?.name || "Unknown",
          jobTitle: latestResume.jobTitle || latestResume.profile?.jobTitle || null,
          email: latestResume.email || latestResume.profile?.email || null,
          phone: latestResume.phone || latestResume.profile?.phone || null,
          summary: latestResume.summary || latestResume.profile?.summary || null,
          experience: latestResume.experience || [],
          education: latestResume.education || [],
          skills: latestResume.skills || [],
          yearsOfExperience: latestResume.yearsOfExperience || latestResume.profile?.yearsOfExperience || null,
          templateId: latestResume.templateId || null,
          lastUpdated: latestResume.updatedAt?._seconds ? new Date(latestResume.updatedAt._seconds * 1000) : (latestResume.createdAt?._seconds ? new Date(latestResume.createdAt._seconds * 1000) : null)
        };
      }
    }

    // Fetch upload history
    console.log("📤 Fetching upload history from:", `users/${userId}/uploadHistory`);
    const uploadSnapshot = await adminDb.collection("users").doc(userId).collection("uploadHistory")
      .orderBy("uploadedAt", "desc")
      .limit(5)
      .get();
    console.log("📤 Uploads found:", uploadSnapshot.size);

    if (!uploadSnapshot.empty) {
      context.uploadHistory = uploadSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          fileName: data.fileName || "Unknown",
          uploadedAt: data.uploadedAt?._seconds ? new Date(data.uploadedAt._seconds * 1000) : null,
          atsScore: data.atsScore || null,
          extractedData: data.extractedData ? {
            name: data.extractedData.name || null,
            jobTitle: data.extractedData.jobTitle || null,
            experienceYears: data.extractedData.yearsOfExperience || null
          } : null
        };
      });
    }

    // Fetch user profile from live_analytics_data
    console.log("📊 Fetching analytics from:", `live_analytics_data/${userId}`);
    const analyticsDoc = await adminDb.collection("live_analytics_data").doc(userId).get();
    console.log("📊 Analytics exists:", analyticsDoc.exists);

    if (analyticsDoc.exists) {
      const data = analyticsDoc.data();
      context.userProfile = {
        entryPoint: data.entryPoint || null,
        planType: data.planType || null,
        location: data.location || null,
        deviceType: data.deviceType || null
      };
    }

    console.log("✅ Context built successfully:", {
      hasResumes: context.hasResumes,
      resumeCount: context.resumeCount,
      uploadCount: context.uploadHistory.length
    });

    return context;
  } catch (error) {
    console.error("❌ Error fetching user resume context:", error);
    console.error("Error details:", error.message, error.stack);
    return null;
  }
}

/**
 * Build contextual system prompt with user's resume data
 */
function buildContextualPrompt(userContext) {
  if (!userContext) return CAREER_COACH_SYSTEM_PROMPT;

  let contextualInfo = "\n\n**USER CONTEXT:**\n";

  if (userContext.latestResume) {
    const resume = userContext.latestResume;
    contextualInfo += `\nThe user has ${userContext.resumeCount} resume(s) on ExpertResume.\n`;
    contextualInfo += `\n**Current Resume Profile:**\n`;
    contextualInfo += `- Name: ${resume.name}\n`;
    if (resume.jobTitle) contextualInfo += `- Current/Target Role: ${resume.jobTitle}\n`;
    if (resume.yearsOfExperience) contextualInfo += `- Years of Experience: ${resume.yearsOfExperience}\n`;
    if (resume.summary) contextualInfo += `- Professional Summary: ${resume.summary.substring(0, 200)}${resume.summary.length > 200 ? '...' : ''}\n`;

    if (resume.experience && resume.experience.length > 0) {
      contextualInfo += `\n**Work Experience:**\n`;
      resume.experience.slice(0, 3).forEach((exp, idx) => {
        contextualInfo += `${idx + 1}. ${exp.jobTitle || exp.position || 'Position'} at ${exp.company || 'Company'} (${exp.startDate || 'Start'} - ${exp.endDate || 'Present'})\n`;
      });
    }

    if (resume.education && resume.education.length > 0) {
      contextualInfo += `\n**Education:**\n`;
      resume.education.slice(0, 2).forEach((edu, idx) => {
        contextualInfo += `${idx + 1}. ${edu.degree || 'Degree'} from ${edu.institution || 'Institution'}\n`;
      });
    }

    if (resume.skills && resume.skills.length > 0) {
      const skillNames = resume.skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean);
      if (skillNames.length > 0) {
        contextualInfo += `\n**Skills:** ${skillNames.slice(0, 10).join(', ')}\n`;
      }
    }

    if (resume.lastUpdated) {
      const daysSinceUpdate = Math.floor((new Date() - resume.lastUpdated) / (1000 * 60 * 60 * 24));
      contextualInfo += `\n*Resume last updated ${daysSinceUpdate} day(s) ago*\n`;
    }
  } else {
    contextualInfo += `\nThe user hasn't created a resume on ExpertResume yet.\n`;
  }

  if (userContext.uploadHistory && userContext.uploadHistory.length > 0) {
    contextualInfo += `\n**Upload History:**\n`;
    contextualInfo += `The user has uploaded ${userContext.uploadHistory.length} resume(s) for analysis.\n`;
    const latestUpload = userContext.uploadHistory[0];
    if (latestUpload.atsScore) {
      contextualInfo += `Latest ATS Score: ${latestUpload.atsScore}/100\n`;
    }
  }

  if (userContext.userProfile) {
    if (userContext.userProfile.planType) {
      contextualInfo += `\n**Subscription:** ${userContext.userProfile.planType}\n`;
    }
    if (userContext.userProfile.entryPoint) {
      contextualInfo += `**Entry Point:** ${userContext.userProfile.entryPoint}\n`;
    }
  }

  contextualInfo += `\n**IMPORTANT:** Use this context to provide highly personalized advice. Reference their specific experience, skills, and career stage when relevant. If they ask about their resume, you have their actual data above.

**PRODUCT PROMOTION GUIDELINES:**
When relevant to the conversation, naturally mention ExpertResume's features to help users:

1. **Resume Building/Editing**: Suggest "You can update your resume directly in our Resume Builder" or "Try our AI-powered Resume Builder to make these changes"
2. **ATS Optimization**: Mention "Check your ATS score with our ATS Checker" or "Upload your resume to get an instant ATS compatibility score"
3. **Templates**: Recommend "Browse our 50+ professional templates" or "Try one of our ATS-optimized templates"
4. **Cover Letters**: Suggest "Create a matching cover letter with our Cover Letter Builder"
5. **Resume Upload**: Mention "Upload your existing resume and let our AI analyze it"

**How to promote:**
- Be natural and contextual (don't force it)
- Only mention features that genuinely help with their question
- Use phrases like "You can...", "Try our...", "Check out..."
- Keep it brief (1 sentence max)
- Place it at the end of your response or within relevant sections
\n`;

  return CAREER_COACH_SYSTEM_PROMPT + contextualInfo;
}

export async function POST(request) {
  try {
    const { messages: clientMessages, userId, attachment } = await request.json();

    if (!clientMessages || !Array.isArray(clientMessages) || clientMessages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Fetch user's resume context for personalized responses
    const userContext = await getUserResumeContext(userId);
    console.log("Fetched user context for userId:", userId, "Context:", JSON.stringify(userContext, null, 2));

    // Build contextual system prompt
    const systemPrompt = buildContextualPrompt(userContext);

    // Process attachment if present
    // Process attachment if present
    const requestParts = [];

    // 1. Handle extracted text from non-native supported formats (DOCX, TXT)
    let extractedTextContext = "";

    if (attachment) {
      console.log("📎 Processing attachment:", attachment.name, attachment.type);
      try {
        const buffer = Buffer.from(attachment.content, 'base64');

        if (attachment.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Parse DOCX locally since Gemini doesn't support it natively yet
          const result = await mammoth.extractRawText({ buffer: buffer });
          extractedTextContext = `\n\n[USER ATTACHMENT: ${attachment.name}]\n${result.value}\n[END ATTACHMENT]\n`;
        } else if (attachment.type === 'text/plain') {
          extractedTextContext = `\n\n[USER ATTACHMENT: ${attachment.name}]\n${buffer.toString('utf-8')}\n[END ATTACHMENT]\n`;
        }
        // PDF is handled later as inlineData
      } catch (err) {
        console.error("Error parsing attachment text:", err);
        extractedTextContext = `\n\n[System Note: User attempted to attach ${attachment.name} but parsing failed.]\n`;
      }
    }

    // Build conversation context
    const conversationMessages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...clientMessages.map((msg, index) => ({
        role: msg.role,
        content: msg.content + (index === clientMessages.length - 1 ? extractedTextContext : "")
      }))
    ];

    // Convert conversation to text prompt
    const conversationText = conversationMessages.map(msg => {
      if (msg.role === "system") {
        return `[SYSTEM INSTRUCTIONS]\n${msg.content}\n`;
      } else if (msg.role === "user") {
        return `[USER]\n${msg.content}\n`;
      } else {
        return `[ASSISTANT]\n${msg.content}\n`;
      }
    }).join("\n");

    const finalPromptText = `${conversationText}\n[ASSISTANT]\n`;

    // 2. Construct final parts for Gemini
    requestParts.push({ text: finalPromptText });

    // If PDF, add as inlineData
    if (attachment && attachment.type === 'application/pdf') {
      requestParts.push({
        inlineData: {
          data: attachment.content,
          mimeType: 'application/pdf'
        }
      });
    }

    // Use streaming for progressive response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate response with streaming
          // Note: generateWithFallback supports "prompt" being an array of parts
          const result = await generateWithFallback(requestParts, {
            temperature: 0.7,
            maxOutputTokens: 2048,
          });

          if (!result || !result.text || result.text.trim() === "") {
            throw new Error("Empty response from AI");
          }

          const responseText = result.text.trim();

          // Send response progressively in chunks
          // We send larger chunks for better network efficiency, frontend handles smoothing
          const words = responseText.split(' ');
          let accumulatedText = '';
          const chunkSize = 5; // Send 5 words at a time

          for (let i = 0; i < words.length; i += chunkSize) {
            const chunkWords = words.slice(i, i + chunkSize);
            const chunkContent = chunkWords.join(' ') + (i + chunkSize < words.length ? ' ' : '');
            accumulatedText += chunkContent;

            const chunk = JSON.stringify({
              type: 'chunk',
              content: chunkContent,
              accumulated: accumulatedText,
              progress: ((i + chunkWords.length) / words.length * 100).toFixed(1)
            }) + '\n';

            controller.enqueue(encoder.encode(chunk));
          }

          // Send final metadata
          const sources = extractSources(responseText);
          const finalChunk = JSON.stringify({
            type: 'complete',
            sources,
            timestamp: new Date().toISOString(),
            model: result.model || "gemini-pro",
            userContext: userContext ? {
              hasResumes: userContext.hasResumes,
              resumeCount: userContext.resumeCount,
              latestResumeJobTitle: userContext.latestResume?.jobTitle || null,
              latestResumeUpdated: userContext.latestResume?.lastUpdated || null,
              uploadCount: userContext.uploadHistory?.length || 0,
              latestAtsScore: userContext.uploadHistory?.[0]?.atsScore || null
            } : null
          }) + '\n';

          controller.enqueue(encoder.encode(finalChunk));
          controller.close();
        } catch (error) {
          const errorChunk = JSON.stringify({
            type: 'error',
            error: error.message
          }) + '\n';
          controller.enqueue(encoder.encode(errorChunk));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("ExpertResume GPT Error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error.message,
        fallback: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or rephrase your question."
      },
      { status: 500 }
    );
  }
}

/**
 * Extract potential sources or references from the response
 * This creates a Perplexity-like experience by identifying citations
 */
function extractSources(text) {
  const sources = [];

  // Look for patterns like "According to...", "Research shows...", "Studies indicate..."
  const patterns = [
    /according to ([^,\.]+)/gi,
    /research (?:shows|indicates|suggests) (?:that )?([^,\.]+)/gi,
    /studies (?:show|indicate|suggest) (?:that )?([^,\.]+)/gi,
    /experts (?:recommend|suggest|advise) (?:that )?([^,\.]+)/gi,
    /(?:industry|career) (?:experts|professionals) (?:say|recommend) (?:that )?([^,\.]+)/gi,
  ];

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && !sources.includes(match[1])) {
        sources.push(match[1].trim());
      }
    }
  });

  // Look for specific career-related references
  const careerKeywords = [
    "LinkedIn Career Expert",
    "Harvard Business Review",
    "Forbes Career",
    "Glassdoor",
    "Indeed Career Guide",
    "The Muse",
    "Career Contessa",
    "ATS systems",
    "Recruiter insights",
    "HR professionals"
  ];

  careerKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      sources.push(keyword);
    }
  });

  return sources.slice(0, 5); // Limit to 5 sources
}

