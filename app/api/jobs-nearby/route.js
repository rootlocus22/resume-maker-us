import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
export const maxDuration = 120;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { jobTitle, industry, location, isPremium, hasJobsFeature } = await request.json();

    if (!jobTitle || !location) {
      return NextResponse.json(
        { error: "Job title and location are required" },
        { status: 400 }
      );
    }

    // Create a structured prompt for Gemini to return JSON
    const prompt = `You are a professional job search assistant. Provide 20 REAL job opportunities for ${jobTitle} ${industry ? `in ${industry} industry` : ''} in ${location}.

CRITICAL INSTRUCTIONS:
🎯 Your goal is to help users find REAL jobs they can actually apply to
⚠️ NEVER generate fake job IDs, fake URLs, or placeholder links
✅ Direct users to REAL job platforms where these jobs can be found

Return your response as a valid JSON object with this EXACT structure:
{
  "jobs": [
    {
      "id": "unique_identifier",
      "title": "Exact Job Title",
      "company": "Real Company Name actively hiring",
      "location": "Specific location in ${location}",
      "type": "Full-Time/Part-Time/Contract/Internship",
      "salary": "Salary range if typically disclosed OR 'Competitive' OR 'Not Disclosed'",
      "experience": "Required experience (e.g., 2-5 years, Fresher)",
      "postedDate": "Recent/1 week ago/2 weeks ago",
      "description": "Clear 2-3 line description of role and key requirements",
      "applicationMethod": "Search on [Platform] for '[Company] [Job Title] ${location}' OR Apply on company website OR Email: [real email if public]",
      "link": "https://www.linkedin.com/jobs/search/?keywords=[Company]+[Job Title]+${location.replace(/ /g, '+')} OR https://www.naukri.com/[job-title]-jobs-in-${location.toLowerCase().replace(/ /g, '-')} OR https://www.indeed.co.in/jobs?q=[Company]+[Job Title]&l=${location}"
    }
  ],
  "summary": "Brief market insight for ${jobTitle} in ${location}"
}

HOW TO CREATE THE "link" FIELD (CRITICAL):
Instead of fake job URLs, create REAL search URLs that users can click to find these actual jobs:

For LinkedIn:
✅ "https://www.linkedin.com/jobs/search/?keywords=TCS+Software+Engineer+Bangalore"
✅ "https://www.linkedin.com/jobs/search/?keywords=Infosys+Java+Developer+Mumbai"

For Naukri.com:
✅ "https://www.naukri.com/software-engineer-jobs-in-bangalore?company=TCS"
✅ "https://www.naukri.com/java-developer-jobs-in-mumbai?company=Infosys"

For Indeed:
✅ "https://www.indeed.co.in/jobs?q=TCS+Software+Engineer&l=Bangalore"
✅ "https://www.indeed.co.in/jobs?q=Math+Teacher&l=Delhi"

For Glassdoor:
✅ "https://www.glassdoor.co.in/Job/bangalore-software-engineer-jobs-SRCH_IL.0,9_IC2940587_KO10,27.htm"

EXAMPLES - What to provide:

Example 1 (Tech Job):
{
  "title": "Senior Software Engineer - Java",
  "company": "TCS",
  "link": "https://www.linkedin.com/jobs/search/?keywords=TCS+Senior+Software+Engineer+Java+${location.replace(/ /g, '+')}",
  "applicationMethod": "Search 'TCS Senior Software Engineer Java' on LinkedIn Jobs or visit TCS careers portal"
}

Example 2 (Teaching Job):
{
  "title": "Mathematics Teacher",
  "company": "Delhi Public School",
  "link": "https://www.naukri.com/mathematics-teacher-jobs-in-${location.toLowerCase().replace(/ /g, '-')}?company=Delhi+Public+School",
  "applicationMethod": "Search 'Delhi Public School Mathematics Teacher' on Naukri.com or contact school directly"
}

REQUIREMENTS:
1. Provide REAL companies actively hiring in ${location}
2. Create search URLs (LinkedIn/Naukri/Indeed) that will show actual relevant jobs
3. Use actual job platforms - LinkedIn, Naukri.com, Indeed, Glassdoor, company career sites
4. Be specific about company name, job title, and location in the search URL
5. Include realistic salary ranges based on industry standards in India
6. Suggest multiple ways to find the job (platform search + direct company application)
7. For each job, the link should be a working search query on a real job platform
8. Return EXACTLY 20 diverse opportunities from different companies
9. MUST return ONLY valid JSON, no markdown code blocks

Companies to consider for ${location}:
- Tech: TCS, Infosys, Wipro, Accenture, Cognizant, HCL, Tech Mahindra, Capgemini, IBM, Amazon, Flipkart, Swiggy, Zomato, startups
- Education: VIBGYOR, DPS, Ryan Group, AAKASH, Vedantu, Byju's, Unacademy, Toppr, Simplilearn
- Others: HDFC, ICICI, Reliance, Tata Group, Mahindra, L&T

Search Context:
- Location: ${location}
- Job Title: ${jobTitle}
${industry ? `- Industry: ${industry}` : ''}
- Date: ${new Date().toLocaleDateString()}

Remember: Provide REAL, ACTIONABLE job search links. Users should be able to click the link and find the actual job posting on that platform.`;

    let jobsData;
    let modelUsed = "gemini-2.0-flash-exp";

    // Try with the latest model first
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up the response - remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      try {
        jobsData = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse response from gemini-2.0-flash-exp:", text.substring(0, 200));
        // Fallback: try to extract JSON from the text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jobsData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract valid JSON from gemini-2.0-flash-exp");
        }
      }

      // Validate the response quality - check for fake URLs or placeholder patterns
      if (jobsData.jobs && Array.isArray(jobsData.jobs)) {
        const hasFakeUrls = jobsData.jobs.some(job => {
          if (!job.link) return false;
          
          // Allow real job platform URLs
          const isRealPlatform = 
            job.link.includes('linkedin.com/jobs/search') ||
            job.link.includes('naukri.com/') ||
            job.link.includes('indeed.co.in/jobs') ||
            job.link.includes('indeed.com/jobs') ||
            job.link.includes('glassdoor.co.in') ||
            job.link.includes('glassdoor.com');
          
          if (isRealPlatform) return false;
          
          // Detect fake patterns
          return (
            job.link.includes('jobId=1234') || 
            job.link.includes('job/1234') ||
            /jobId=\d{10}/.test(job.link) ||
            /job-details\.html\?jobId=/.test(job.link) ||
            /\/job\/\d{10}/.test(job.link)
          );
        });
        
        if (hasFakeUrls) {
          console.warn("Detected fake job URLs in response, trying fallback model");
          throw new Error("Response contains fake job URLs");
        }
      }

    } catch (primaryError) {
      console.warn("Primary model failed, trying fallback model:", primaryError.message);
      modelUsed = "gemini-1.5-flash";

      // Fallback to stable Gemini 1.5 Flash model
      try {
        const fallbackModel = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 8000,
          }
        });

        const fallbackResult = await fallbackModel.generateContent(prompt);
        const fallbackResponse = await fallbackResult.response;
        let fallbackText = fallbackResponse.text();

        // Clean up the response
        fallbackText = fallbackText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        try {
          jobsData = JSON.parse(fallbackText);
        } catch (parseError) {
          console.error("Failed to parse response from fallback model:", fallbackText.substring(0, 200));
          const jsonMatch = fallbackText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jobsData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("Could not extract valid JSON from fallback model");
          }
        }
      } catch (fallbackError) {
        console.error("Both models failed:", fallbackError);
        throw new Error("Failed to generate job listings with both AI models");
      }
    }

    // Validate the structure
    if (!jobsData.jobs || !Array.isArray(jobsData.jobs)) {
      throw new Error("Invalid response structure - missing jobs array");
    }

    // Final validation: Clean up any remaining fake URLs while preserving real platform links
    jobsData.jobs = jobsData.jobs.map(job => {
      if (job.link) {
        // Check if it's a real job platform URL - keep these
        const isRealPlatform = 
          job.link.includes('linkedin.com/jobs/search') ||
          job.link.includes('naukri.com/') ||
          job.link.includes('indeed.co.in/jobs') ||
          job.link.includes('indeed.com/jobs') ||
          job.link.includes('glassdoor.co.in') ||
          job.link.includes('glassdoor.com');
        
        // If it's not a real platform, check for fake patterns
        if (!isRealPlatform && (
          job.link.includes('jobId=1234') || 
          job.link.includes('job/1234') ||
          /jobId=\d{10}/.test(job.link) ||
          /job\/\d{10}/.test(job.link) ||
          /job-details\.html\?jobId=/.test(job.link)
        )) {
          // Replace fake URL with LinkedIn search URL
          const companyEncoded = encodeURIComponent(job.company);
          const titleEncoded = encodeURIComponent(job.title);
          const locationEncoded = encodeURIComponent(job.location);
          job.link = `https://www.linkedin.com/jobs/search/?keywords=${companyEncoded}+${titleEncoded}&location=${locationEncoded}`;
          job.applicationMethod = `Search for "${job.title}" at ${job.company} on LinkedIn Jobs or Naukri.com`;
        }
      }
      return job;
    });

    console.log(`✅ Successfully generated ${jobsData.jobs.length} jobs using ${modelUsed}`);

    // If user is not premium or doesn't have jobs feature, return only 2 jobs
    const jobsToReturn = (isPremium && hasJobsFeature) 
      ? jobsData.jobs 
      : jobsData.jobs.slice(0, 2);

    return NextResponse.json({
      success: true,
      jobs: jobsToReturn,
      summary: jobsData.summary || `Found ${jobsData.jobs.length} opportunities for ${jobTitle} in ${location}`,
      totalAvailable: jobsData.jobs.length,
      isLimited: !isPremium || !hasJobsFeature,
      upgradeMessage: (!isPremium || !hasJobsFeature) 
        ? `Upgrade to Premium with AI Job Search to see all ${jobsData.jobs.length} opportunities and track your applications!`
        : null
    });

  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch jobs", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

