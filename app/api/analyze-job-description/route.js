import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    const { jobDescription, resumeData } = await request.json();

    if (!jobDescription) {
      return Response.json({ error: "Job description is required" }, { status: 400 });
    }

    const prompt = `
You are an expert job description analyzer. Analyze the following job description and extract key information to help create a compelling cover letter.

Job Description:
${jobDescription}

Resume Context (if available):
${resumeData ? `
- Name: ${resumeData.name || 'Not provided'}
- Experience: ${resumeData.experience ? resumeData.experience.map(exp => `${exp.title} at ${exp.company}`).join(', ') : 'Not provided'}
- Skills: ${resumeData.skills ? resumeData.skills.join(', ') : 'Not provided'}
- Education: ${resumeData.education ? resumeData.education.map(edu => `${edu.degree} from ${edu.institution}`).join(', ') : 'Not provided'}
` : 'Resume data not provided'}

Please analyze and provide:

1. **Suggested Job Title**: Extract the most accurate job title from the description
2. **Key Skills Required**: List the most important technical and soft skills mentioned
3. **Company Values**: Identify any company culture, values, or mission statements
4. **Experience Level**: Determine if it's entry-level, mid-level, senior, or executive
5. **Work Type**: Identify if it's remote, hybrid, or on-site
6. **Salary Hints**: Any salary range or compensation information mentioned
7. **Key Responsibilities**: Main duties and responsibilities
8. **Qualifications**: Required and preferred qualifications
9. **Company Industry**: What industry or sector the company operates in
10. **Growth Opportunities**: Any mention of career development or growth

Format your response as a JSON object with these exact keys:
{
  "suggestedJobTitle": "string",
  "keySkills": ["skill1", "skill2", "skill3"],
  "companyValues": ["value1", "value2"],
  "experienceLevel": "string",
  "workType": "string",
  "salaryHints": "string",
  "keyResponsibilities": ["responsibility1", "responsibility2"],
  "qualifications": ["qualification1", "qualification2"],
  "companyIndustry": "string",
  "growthOpportunities": "string"
}

Return only the JSON object without any additional text or formatting.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const analysisText = result.response.text().trim();

    // Try to parse the JSON response
    let analysis;
    try {
      // Remove any markdown formatting if present
      const cleanText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback to a structured response
      analysis = {
        suggestedJobTitle: "Software Engineer",
        keySkills: ["Problem solving", "Communication", "Teamwork"],
        companyValues: ["Innovation", "Excellence"],
        experienceLevel: "Mid-level",
        workType: "Hybrid",
        salaryHints: "Competitive salary",
        keyResponsibilities: ["Develop software", "Collaborate with team"],
        qualifications: ["Bachelor's degree", "Relevant experience"],
        companyIndustry: "Technology",
        growthOpportunities: "Career advancement opportunities"
      };
    }

    return Response.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error("Job Description Analysis Error:", error);
    return Response.json(
      { error: "Failed to analyze job description. Please try again." },
      { status: 500 }
    );
  }
}
