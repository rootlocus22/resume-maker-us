// functions/src/utils/helpers.js
const { genkit } = require("genkit");
const { googleAI } = require("@genkit-ai/googleai");
const { db } = require("../config/firebase");

// Initialize Genkit AI
const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  enableTracing: true,
});

async function generateInitialQuestions(prompt) {
  const response = await ai.generate({
    model: "googleai/gemini-2.0-flash",
    prompt: `${prompt}\n\nProvide detailed, context-rich questions that encourage in-depth responses. Ensure each question is complete and well-formed.`,
    config: { maxOutputTokens: 1000 },
  });
  const text = response.message?.content?.[0]?.text || "Error: No questions generated";
  return text.split("\n").filter((q) => q.trim()).slice(0, 3);
}

async function analyzeAnswer(question, answer) {
  const response = await ai.generate({
    model: "googleai/gemini-2.0-flash",
    prompt: `Analyze this interview answer for the question "${question}": "${answer}". Provide detailed, encouraging feedback with specific observations about strengths and areas for improvement. Format with clear sections (e.g., Strengths:, Suggestions:). Ensure the response is complete.`,
    config: { maxOutputTokens: 1000 },
  });
  return response.message?.content?.[0]?.text || "Great effort! Keep practicing.";
}

async function generateImprovementTip(question, answer) {
  const response = await ai.generate({
    model: "googleai/gemini-2.0-flash",
    prompt: `Given the question "${question}" and answer "${answer}", provide a detailed tip to improve the response, including an example if applicable. Ensure the tip is complete and actionable.`,
    config: { maxOutputTokens: 500 },
  });
  return response.message?.content?.[0]?.text || "Try adding more detail!";
}

async function solveProblem(problem, part) {
  let prompt;
  switch (part) {
    case "initial":
      prompt = `Provide a comprehensive overview for designing a system to solve this job-related problem or query: "${problem}". Focus on the high-level goals and architecture, keeping it detailed but concise (around 200-300 words). End with an invitation for follow-up, like "Want me to dive into the components next?". Ensure the response is complete and not truncated.`;
      break;
    case "components":
      prompt = `For the system solving "${problem}", provide a detailed breakdown of the core components (around 200-300 words). Structure with clear sections (e.g., Components: followed by subsections like - Rider App, - Driver App, - Backend Services). End with "How about the key features next?". Ensure the response is complete.`;
      break;
    case "features":
      prompt = `For the system solving "${problem}", detail the key features (around 200-300 words). Structure with clear sections (e.g., Key Features: followed by subsections like - Geolocation, - Matching Algorithm). End with "Anything else you’d like to explore?". Ensure the response is complete.`;
      break;
    case "custom":
      prompt = `For the system solving "${problem}", respond to this follow-up: "${problem.split('\n\nFollow-up: ')[1]}". Provide a detailed, actionable answer (around 200-300 words) tailored to the follow-up. End with "What else can I help with?". Ensure the response is complete.`;
      break;
    default:
      prompt = problem;
  }

  const response = await ai.generate({
    model: "googleai/gemini-2.0-flash",
    prompt,
    config: { maxOutputTokens: 600 },
  });
  return response.message?.content?.[0]?.text || "Try rephrasing your question for a better answer!";
}

async function generateFollowUpQuestion(sessionData) {
  const lastQuestion = sessionData.questions[sessionData.currentIndex - 1];
  const lastAnswer = sessionData.answers[sessionData.answers.length - 1];
  const response = await ai.generate({
    model: "googleai/gemini-2.0-flash",
    prompt: `Based on the question "${lastQuestion}" and answer "${lastAnswer}", generate a detailed follow-up interview question that builds on the response and encourages a deeper answer. Ensure the question is complete and specific.`,
    config: { maxOutputTokens: 500 },
  });
  return response.message?.content?.[0]?.text || "Error: No follow-up question generated";
}

async function getResumeData(userId) {
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    console.log(`No user document found for userId: ${userId}`);
    return "No resume data available.";
  }

  const data = userDoc.data();
  const resumeData = data.resumeData || {};

  const experienceText = resumeData.experience?.length
    ? resumeData.experience
        .map((exp) => `${exp.jobTitle} at ${exp.company}: ${exp.description}`)
        .join(" ")
    : "";
  const skillsText = resumeData.skills?.length
    ? resumeData.skills.map((skill) => `Skill: ${skill.name} (${skill.proficiency})`).join(" ")
    : "";
  const educationText = resumeData.education?.length
    ? resumeData.education
        .map((edu) => `${edu.degree} in ${edu.field} from ${edu.institution}`)
        .join(" ")
    : "";
  const certificationsText = resumeData.certifications?.length
    ? resumeData.certifications.map((cert) => `${cert.name} from ${cert.issuer}`).join(" ")
    : "";
  const summaryText = resumeData.summary || "";
  const customSectionsText = resumeData.customSections?.length
    ? resumeData.customSections.map((section) => `${section.title}: ${section.description}`).join(" ")
    : "";

  const resumeText = [
    summaryText,
    experienceText,
    skillsText,
    educationText,
    certificationsText,
    customSectionsText,
    `Name: ${data.name || "Unknown"}`,
    `Location: ${data.address || "Unknown"}`,
  ]
    .filter(Boolean)
    .join(" ");

  return resumeText || "No resume data available.";
}

module.exports = {
  generateInitialQuestions,
  analyzeAnswer,
  generateImprovementTip,
  solveProblem,
  generateFollowUpQuestion,
  getResumeData,
  ai
};