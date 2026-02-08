import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { adminDb } from '../../lib/firebase';
import { generateWithFallback } from '../../lib/geminiFallback';
import { detectSupportedFileType, extractResumeWithGemini } from '../gemini-parse-resume/route';

export const maxDuration = 240; // 4 minutes

// Extract text from different file types
async function extractTextFromFile(fileBuffer, fileType) {
  if (fileType === 'PDF') {
    // For PDF files, we'll rely on the parsing API
    return '';
  } else if (fileType === 'DOCX' || fileType === 'DOC') {
    // For Word documents, extract text content
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.default.extractRawText({ buffer: fileBuffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from Word document:', error);
      return '';
    }
  }
  return '';
}

// Main ATS analysis function
async function analyzeATSCompatibility(resumeText, parsedData, fileType, jobDescription = "") {
  try {
    console.log('Starting ATS analysis...');
    console.log('Resume text length:', resumeText.length);
    console.log('Parsed data keys:', Object.keys(parsedData));
    console.log('Job description length:', jobDescription.length);

    // Debug parsed data content
    console.log('📊 PARSED DATA CONTENT:');
    console.log('- Contact:', parsedData.contact);
    console.log('- Experience count:', parsedData.experience?.length || 0);
    console.log('- Education count:', parsedData.education?.length || 0);
    console.log('- Skills count:', parsedData.skills?.length || 0);
    console.log('- Projects count:', parsedData.projects?.length || 0);
    console.log('- Awards count:', parsedData.awards?.length || 0);
    console.log('- Certifications count:', parsedData.certifications?.length || 0);
    console.log('- Summary:', parsedData.summary?.substring(0, 100) + '...');

    // Create comprehensive analysis prompt
    const analysisPrompt = createAnalysisPrompt(resumeText, parsedData, jobDescription);
    console.log('Created analysis prompt, length:', analysisPrompt.length);

    // Call AI for analysis
    const aiResponse = await callAIForAnalysis(analysisPrompt);

    // Parse and structure the response
    const structuredAnalysis = parseAIResponse(aiResponse, jobDescription, parsedData);

    // Add model information for debugging consistency
    structuredAnalysis.model = aiResponse.model;
    structuredAnalysis.contentLength = resumeText.length;

    console.log('Analysis completed successfully');
    return structuredAnalysis;
  } catch (error) {
    console.error('Error in ATS analysis:', error);
    // Return error response instead of hardcoded fallback
    return {
      error: true,
      message: "Failed to analyze resume. Please try again.",
      details: error.message,
      overallScore: 0,
      analysisType: "GENERAL",
      executiveSummary: {
        overallFit: "Analysis failed due to technical error.",
        keyStrengths: [],
        primaryAreasForImprovement: []
      },
      detailedAnalysis: {},
      actionableRecommendations: []
    };
  }
}

// Create the analysis prompt based on whether job description is provided
function createAnalysisPrompt(resumeText, parsedData, jobDescription) {
  // Extract key information from parsed data for better AI analysis
  const resumeInfo = {
    contact: parsedData.contact || {},
    experience: parsedData.experience || [],
    education: parsedData.education || [],
    skills: parsedData.skills || [],
    projects: parsedData.projects || [],
    awards: parsedData.awards || [],
    certifications: parsedData.certifications || [],
    summary: parsedData.summary || '',
    rawText: resumeText
  };

  // Create comprehensive resume content combining raw text and parsed data
  const comprehensiveResumeContent = `
RAW RESUME TEXT:
${resumeText}

PARSED RESUME DATA:
Contact Information: ${JSON.stringify(parsedData.contact || {}, null, 2)}
Experience: ${JSON.stringify(parsedData.experience || [], null, 2)}
Education: ${JSON.stringify(parsedData.education || [], null, 2)}
Skills: ${JSON.stringify(parsedData.skills || [], null, 2)}
Projects: ${JSON.stringify(parsedData.projects || [], null, 2)}
Awards: ${JSON.stringify(parsedData.awards || [], null, 2)}
Certifications: ${JSON.stringify(parsedData.certifications || [], null, 2)}
Summary: ${parsedData.summary || ''}
Profile: ${parsedData.profile || ''}
Objective: ${parsedData.objective || ''}
  `.trim();

  // Debug the comprehensive content being sent to AI
  console.log('📊 COMPREHENSIVE RESUME CONTENT DEBUG:');
  console.log('- Raw text length:', resumeText.length);
  console.log('- Raw text preview:', resumeText.substring(0, 200) + '...');
  console.log('- Parsed data keys:', Object.keys(parsedData));
  console.log('- Profile section:', parsedData.profile || 'NOT FOUND');
  console.log('- Summary section:', parsedData.summary || 'NOT FOUND');
  console.log('- Skills count:', parsedData.skills?.length || 0);
  console.log('- Experience count:', parsedData.experience?.length || 0);
  console.log('- Comprehensive content length:', comprehensiveResumeContent.length);

  if (jobDescription) {
    // Job-specific analysis prompt with strict ATS guidelines
    const jobSpecificPrompt = `CRITICAL: You must be 100% deterministic. IDENTICAL inputs must produce IDENTICAL outputs every time.

You are an expert ATS compliance analyst. Analyze resume against job description.

CRITICAL SCORING REQUIREMENTS:
- You MUST calculate a REAL score based on actual analysis, NOT return a default score
- Score ranges: 80-100 (excellent match), 60-79 (good match), 40-59 (poor match), 0-39 (very poor match)
- Calculate score based on: keyword match (40%), skills alignment (30%), experience relevance (20%), formatting (10%)
- If resume has excellent keyword match, good skills alignment, relevant experience, and good formatting = score 80-100
- If resume has good keyword match, decent skills alignment, somewhat relevant experience, acceptable formatting = score 60-79
- If resume has poor keyword match, missing skills, irrelevant experience, poor formatting = score 40-59
- If resume has very poor keyword match, major skill gaps, irrelevant experience, very poor formatting = score 0-39

- If resume has very poor keyword match, major skill gaps, irrelevant experience, very poor formatting = score 0-39

CRITICAL DATA FORMATTING:
- JSON keys and string values must NOT contain actual newline characters. Use \\n instead.
- Escape all special characters in strings.
- Ensure the output is strictly valid standard JSON.

CRITICAL REQUIREMENTS FOR CONSISTENT SCORING:
- Calculate scores using EXACT mathematical formulas provided above
- IDENTICAL resume content must ALWAYS produce IDENTICAL scores
- Count keywords precisely - same keywords = same count = same score
- Use deterministic analysis - no randomness in evaluation
- Extract ALL technical skills, tools, technologies from job description
- Compare against resume skills and identify missing ones systematically
- Provide detailed formatting analysis including layout issues, icons, tables, special characters
- Check for repetitive words and phrases that reduce impact
- Identify areas where impact should be quantified with specific metrics
- Check for spelling and grammar errors throughout the resume
- Give specific, actionable recommendations with clear priorities
- ANALYZE BOTH raw text and parsed data to ensure no content is missed
- THOROUGHLY CHECK ALL SECTIONS: Profile, Summary, Objective, Experience, Skills, Education, Projects, Awards, Certifications
- Pay special attention to Profile and Summary sections which often contain important keywords
- Apply scoring formulas consistently - same content characteristics = same score components
- Return ONLY valid JSON, no other text

Inputs:
Resume Content (Raw + Parsed): ${comprehensiveResumeContent}
Job Description: ${jobDescription}

Required JSON output:
{
  "overallAtsScore": "number // CRITICAL: Calculate EXACT score based on CONSISTENT criteria. Use this formula: (keyword_match_percentage * 0.4) + (skills_alignment_percentage * 0.3) + (experience_relevance_percentage * 0.2) + (formatting_score * 0.1). NEVER return default values like 75. Same resume content MUST always get same score.",
  "industry": "string // DETECT from resume content",
  "seniorityLevel": "string // DETECT from resume content", 
  "roleType": "string // DETECT from resume content",
  "selectedRole": "string // EXTRACT from job description",
  "analysisType": "COMPARATIVE",
  "executiveSummary": {
    "overallFit": "string // 2-3 sentence summary focusing on ATS compatibility and job match",
    "keyStrengths": ["string // top 3-5 ATS-friendly strengths relevant to the job"],
    "primaryImprovements": ["string // 3-5 most critical ATS compliance issues that need immediate attention"]
  },
  "detailedAnalysis": {
    "keywordAnalysis": {
      "matchedKeywords": [{"keyword": "string", "context": "string // specify exact section where found (Profile, Summary, Experience, Skills, etc.)"}],
      "missingKeywords": [{"keyword": "string", "importance": "High/Medium/Low"}]
    },
    "skillsAnalysis": {
      "hardSkills": {
        "identified": ["string // skills found in resume that match job requirements"],
        "missing": ["string // skills required by job but missing from resume"]
      },
      "softSkills": {
        "identified": ["string // soft skills from resume matching job"],
        "suggested": ["string // soft skills suggested based on job requirements"]
      }
    },
    "experienceMatch": {
      "seniorityAlignment": {"isAligned": "boolean", "comment": "string"},
      "educationMatch": {"meetsRequirements": "boolean", "comment": "string"}
    },
    "formattingAndStructure": {
      "parsingRisk": "Low/Medium/High",
      "issues": ["string // specific formatting issues like icons, tables, layout problems, special characters, personal info"],
      "repetitiveWords": ["string // list of words that are repeated too frequently (e.g., 'developed', 'managed', 'implemented')"],
      "quantificationIssues": ["string // specific areas where impact should be quantified with metrics (e.g., 'increased efficiency' should specify percentage)"],
      "spellingGrammarIssues": ["string // spelling and grammar errors found in the resume"],
      "overallFormattingScore": "number // 0-100 score for formatting quality based on all checks"
    }
  },
  "actionableRecommendations": [
    {"priority": "High/Medium/Low", "area": "string", "recommendation": "string // specific actionable instruction"}
  ]
}`;

    return jobSpecificPrompt;
  } else {
    // General ATS analysis prompt (no job description) with strict industry standards
    const generalPrompt = `CRITICAL: You must be 100% deterministic. IDENTICAL inputs must produce IDENTICAL outputs every time.

You are an expert ATS compliance analyst. Analyze resume against industry standards.

CRITICAL SCORING REQUIREMENTS:
- You MUST calculate a REAL score based on actual analysis, NOT return a default score
- Score ranges: 80-100 (excellent ATS compliance), 60-79 (good compliance), 40-59 (poor compliance), 0-39 (very poor compliance)
- Calculate score based on: content completeness (35%), keyword density (25%), formatting (25%), skills (15%)
- If resume has excellent content completeness, high keyword density, good formatting, clear skills = score 80-100
- If resume has good content completeness, decent keyword density, acceptable formatting, clear skills = score 60-79
- If resume has poor content completeness, low keyword density, poor formatting, unclear skills = score 40-59
- If resume has very poor content completeness, very low keyword density, very poor formatting, unclear skills = score 0-39

- If resume has very poor content completeness, very low keyword density, very poor formatting, unclear skills = score 0-39

CRITICAL DATA FORMATTING:
- JSON keys and string values must NOT contain actual newline characters. Use \\n instead.
- Escape all special characters in strings.
- Ensure the output is strictly valid standard JSON.

CRITICAL REQUIREMENTS FOR CONSISTENT SCORING:
- Calculate scores using EXACT mathematical formulas provided above
- IDENTICAL resume content must ALWAYS produce IDENTICAL scores
- Use deterministic analysis - no randomness in evaluation
- Count sections, keywords, skills systematically for consistent results
- Provide detailed formatting analysis including layout issues, icons, tables, special characters
- Check for repetitive words and phrases that reduce impact
- Identify areas where impact should be quantified with specific metrics
- Check for spelling and grammar errors throughout the resume
- Give specific, actionable recommendations with clear priorities
- Analyze all sections: contact info, experience, education, skills, achievements
- ANALYZE BOTH raw text and parsed data to ensure no content is missed
- THOROUGHLY CHECK ALL SECTIONS: Profile, Summary, Objective, Experience, Skills, Education, Projects, Awards, Certifications
- Pay special attention to Profile and Summary sections which often contain important keywords
- Apply scoring formulas consistently - same content characteristics = same score components
- Return ONLY valid JSON, no other text

Inputs:
Resume Content (Raw + Parsed): ${comprehensiveResumeContent}

Required JSON output:
{
  "overallAtsScore": "number // CRITICAL: Calculate EXACT score using CONSISTENT methodology. For general analysis: (content_completeness_percentage * 0.35) + (keyword_density_percentage * 0.25) + (formatting_compliance_percentage * 0.25) + (skills_presentation_percentage * 0.15). NEVER use default scores. Same resume MUST get same score every time.",
  "industry": "string // DETECT from resume content",
  "seniorityLevel": "string // DETECT from resume content",
  "roleType": "string // DETECT from resume content", 
  "selectedRole": "string // DETECT most recent role from resume",
  "analysisType": "GENERAL",
  "executiveSummary": {
    "overallFit": "string // 2-3 sentence summary focusing on ATS compliance and industry standards",
    "keyStrengths": ["string // top 3-5 ATS-friendly strengths that make this resume compliant"],
    "primaryImprovements": ["string // 3-5 most critical ATS compliance issues that need immediate attention"]
  },
  "detailedAnalysis": {
    "keywordAnalysis": {
      "matchedKeywords": [{"keyword": "string", "context": "string // specify exact section where found (Profile, Summary, Experience, Skills, etc.)"}],
      "missingKeywords": [{"keyword": "string", "importance": "High/Medium/Low"}]
    },
    "skillsAnalysis": {
      "hardSkills": {
        "identified": ["string // technical skills meeting industry standards"],
        "missing": ["string // industry-standard skills missing"]
      },
      "softSkills": {
        "identified": ["string // soft skills meeting industry standards"],
        "suggested": ["string // industry-standard soft skills suggested"]
      }
    },
    "experienceMatch": {
      "seniorityAlignment": {"isAligned": "boolean", "comment": "string"},
      "educationMatch": {"meetsRequirements": "boolean", "comment": "string"}
    },
    "formattingAndStructure": {
      "parsingRisk": "Low/Medium/High",
      "issues": ["string // specific formatting issues like icons, tables, layout problems, special characters, personal info"],
      "repetitiveWords": ["string // list of words that are repeated too frequently (e.g., 'developed', 'managed', 'implemented')"],
      "quantificationIssues": ["string // specific areas where impact should be quantified with metrics (e.g., 'increased efficiency' should specify percentage)"],
      "spellingGrammarIssues": ["string // spelling and grammar errors found in the resume"],
      "overallFormattingScore": "number // 0-100 score for formatting quality based on all checks"
    }
  },
  "actionableRecommendations": [
    {"priority": "High/Medium/Low", "area": "string", "recommendation": "string // specific actionable instruction"}
  ]
}`;

    return generalPrompt;
  }
}

// Call AI for analysis
async function callAIForAnalysis(prompt) {
  try {
    console.log('Calling AI with prompt length:', prompt.length);
    console.log('Prompt preview (first 500 chars):', prompt.substring(0, 500));
    console.log('Prompt preview (last 500 chars):', prompt.substring(prompt.length - 500));

    // Calculate estimated tokens for cost tracking
    const estimatedInputTokens = Math.ceil(prompt.length / 4); // Rough estimate
    console.log('💰 Estimated input tokens:', estimatedInputTokens);

    // Use the existing Gemini fallback service with increased tokens
    const result = await generateWithFallback(prompt, {
      maxOutputTokens: 32768, // Increased from 16384 to 32768
      temperature: 0.0 // Set to 0 for fully deterministic results
    });

    console.log('AI response received, length:', result.text.length);
    console.log('Used model:', result.model);
    console.log('Response preview (first 500 chars):', result.text.substring(0, 500));
    console.log('Response preview (last 500 chars):', result.text.substring(result.text.length - 500));

    // Calculate estimated output tokens for cost tracking
    const estimatedOutputTokens = Math.ceil(result.text.length / 4); // Rough estimate
    console.log('💰 Estimated output tokens:', estimatedOutputTokens);

    // Log cost estimates based on model used
    const costEstimates = {
      'gemini-2.5-flash': { input: 0.15, output: 0.60 },
      'gemini-2.5-pro': { input: 7.00, output: 21.00 },
      'gemini-2.0-flash': { input: 0.15, output: 0.60 },
      'gemini-2.0-pro': { input: 7.00, output: 21.00 },
      'gemini-2.0-flash-lite': { input: 0.075, output: 0.30 },
      'gemini-2.0-flash': { input: 3.50, output: 10.50 },
      'gemini-pro': { input: 3.50, output: 10.50 }
    };

    const modelCosts = costEstimates[result.model] || costEstimates['gemini-2.0-flash-lite'];
    const estimatedCost = (estimatedInputTokens / 1000000) * modelCosts.input +
      (estimatedOutputTokens / 1000000) * modelCosts.output;

    console.log('💰 Estimated cost for this analysis:', `$${estimatedCost.toFixed(6)}`);
    console.log('💰 Model used:', result.model, `($${modelCosts.input}/1M input, $${modelCosts.output}/1M output)`);

    // Check if response seems truncated
    if (result.text.length < 1000) {
      console.warn('⚠️ AI response seems very short, might be truncated');
    }

    // Check if response contains the expected JSON structure
    if (!result.text.includes('"overallAtsScore"') && !result.text.includes('"overallScore"')) {
      console.warn('⚠️ AI response does not contain expected score field');
    }

    return result.text;
  } catch (error) {
    console.error('Error calling AI:', error);
    throw error; // Don't fallback, let the error propagate
  }
}

// Parse AI response into structured format
function parseAIResponse(aiResponse, jobDescription, resumeData) {
  try {
    console.log('Parsing AI response, length:', aiResponse.length);

    // Clean the response to extract JSON
    let jsonStart = aiResponse.indexOf('{');
    let jsonEnd = aiResponse.lastIndexOf('}') + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      console.error('No JSON found in AI response');
      throw new Error('No JSON found in AI response');
    }

    let jsonString = aiResponse.substring(jsonStart, jsonEnd);
    console.log('Extracted JSON string length:', jsonString.length);

    // Robust JSON cleanup and parsing
    const cleanAndParse = (str) => {
      // 1. Remove any markdown code blocks if still present (handled by substring but good to be safe)
      // 2. Fix bad control characters (newlines/tabs in strings)
      // detailed regex to find unescaped control characters
      const cleanStr = str.replace(/[\u0000-\u001F]+/g, (match) => {
        switch (match) {
          case '\b': return '\\b';
          case '\f': return '\\f';
          case '\n': return '\\n';
          case '\r': return '\\r';
          case '\t': return '\\t';
          default: return '';
        }
      });

      // This cleaning is aggressive and breaks structure if it replaces structural newlines.
      // Instead, let's try standard parse first, then a fallback repair
      try {
        return JSON.parse(str);
      } catch (e1) {
        console.warn('Standard parse failed, attempting strict repair:', e1.message);
        try {
          // Common issue: Unescaped newlines in strings.
          // Strategy: Replace newlines with \n, but this breaks structure.
          // Alternative: Use a regex to remove non-printable characters
          const stripped = str.replace(/[\u0000-\u0019]+/g, "");
          return JSON.parse(stripped);
        } catch (e2) {
          console.warn('Strip repair failed, attempting line-break escape:', e2.message);
          // Last resort: If the error is specific to control characters, 
          // we might just have to fail or try a very aggressive cleaning that might lose formatting
          throw e1;
        }
      }
    };

    // Use the robust parser
    const analysis = cleanAndParse(jsonString);
    console.log('Successfully parsed JSON, keys:', Object.keys(analysis));

    // Debug the keyword analysis specifically
    console.log('🔍 KEYWORD ANALYSIS DEBUG:');
    console.log('- Matched keywords count:', analysis.detailedAnalysis?.keywordAnalysis?.matchedKeywords?.length || 0);
    console.log('- Missing keywords count:', analysis.detailedAnalysis?.keywordAnalysis?.missingKeywords?.length || 0);
    console.log('- Matched keywords:', analysis.detailedAnalysis?.keywordAnalysis?.matchedKeywords || []);
    console.log('- Missing keywords:', analysis.detailedAnalysis?.keywordAnalysis?.missingKeywords || []);

    // Debug the score specifically
    console.log('🔍 SCORE DEBUG:');
    console.log('- AI returned score:', analysis.overallAtsScore || analysis.overallScore);
    console.log('- Score type:', typeof (analysis.overallAtsScore || analysis.overallScore));
    console.log('- Is score 75?', (analysis.overallAtsScore || analysis.overallScore) === 75);
    console.log('- Is score default?', (analysis.overallAtsScore || analysis.overallScore) === 75 || (analysis.overallAtsScore || analysis.overallScore) === 0);

    // Validate score is not invalid (but allow legitimate 75 scores with detailed analysis)
    const score = analysis.overallAtsScore || analysis.overallScore;
    const hasDetailedAnalysis = analysis.detailedAnalysis &&
      analysis.detailedAnalysis.keywordAnalysis &&
      analysis.detailedAnalysis.keywordAnalysis.matchedKeywords &&
      analysis.detailedAnalysis.keywordAnalysis.matchedKeywords.length > 0;

    if (score === 0 || !score || (score === 75 && !hasDetailedAnalysis)) {
      console.warn('⚠️ WARNING: AI returned invalid score or default 75 without analysis. Regenerating...');
      throw new Error('AI returned invalid score, forcing regeneration');
    }

    // If score is 75 but has detailed analysis, it's legitimate
    if (score === 75 && hasDetailedAnalysis) {
      console.log('✅ Score 75 accepted - has detailed analysis with', analysis.detailedAnalysis.keywordAnalysis.matchedKeywords.length, 'matched keywords');
    }

    // Validate and ensure all required fields exist
    return validateAndStructureAnalysis(analysis, jobDescription, resumeData);
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('AI Response was:', aiResponse.substring(0, 500) + '...');
    throw error; // Don't fallback, let the error propagate
  }
}

// Validate and structure the analysis
function validateAndStructureAnalysis(analysis, jobDescription, resumeData) {
  // Helper function to detect industry from resume data
  const detectIndustry = (resumeData) => {
    if (analysis.industry && analysis.industry !== 'Unknown') return analysis.industry;

    const skills = resumeData?.skills || [];
    const experience = resumeData?.experience || [];
    const companies = experience.map(exp => exp.company || '').join(' ').toLowerCase();
    const titles = experience.map(exp => exp.title || '').join(' ').toLowerCase();
    const allText = [...skills, companies, titles].join(' ').toLowerCase();

    if (allText.includes('software') || allText.includes('developer') || allText.includes('engineer') || allText.includes('tech')) return 'Technology';
    if (allText.includes('health') || allText.includes('medical') || allText.includes('nurse') || allText.includes('doctor')) return 'Healthcare';
    if (allText.includes('finance') || allText.includes('bank') || allText.includes('accounting') || allText.includes('investment')) return 'Finance';
    if (allText.includes('education') || allText.includes('teacher') || allText.includes('professor') || allText.includes('school')) return 'Education';
    if (allText.includes('manufacturing') || allText.includes('production') || allText.includes('factory')) return 'Manufacturing';
    if (allText.includes('consulting') || allText.includes('consultant')) return 'Consulting';
    if (allText.includes('marketing') || allText.includes('advertising') || allText.includes('brand')) return 'Marketing';
    if (allText.includes('sales') || allText.includes('account manager')) return 'Sales';
    if (allText.includes('design') || allText.includes('creative') || allText.includes('art')) return 'Design';
    if (allText.includes('research') || allText.includes('scientist') || allText.includes('phd')) return 'Research';
    if (allText.includes('government') || allText.includes('public') || allText.includes('policy')) return 'Government';
    if (allText.includes('non-profit') || allText.includes('charity') || allText.includes('foundation')) return 'Non-profit';

    return 'General';
  };

  // Helper function to detect seniority level from resume data
  const detectSeniorityLevel = (resumeData) => {
    if (analysis.seniorityLevel && analysis.seniorityLevel !== 'Unknown') return analysis.seniorityLevel;

    const experience = resumeData?.experience || [];
    const titles = experience.map(exp => exp.title || '').join(' ').toLowerCase();
    const years = experience.length;

    if (titles.includes('ceo') || titles.includes('chief') || titles.includes('president') || titles.includes('executive')) return 'Executive';
    if (titles.includes('director') || titles.includes('head of') || titles.includes('vp')) return 'Director';
    if (titles.includes('manager') || titles.includes('lead') || titles.includes('supervisor')) return 'Manager';
    if (titles.includes('senior') || years > 5) return 'Senior';
    if (titles.includes('junior') || years <= 2) return 'Junior';
    if (years === 0) return 'Entry';

    return 'Mid';
  };

  // Helper function to detect role type from resume data
  const detectRoleType = (resumeData) => {
    if (analysis.roleType && analysis.roleType !== 'Unknown') return analysis.roleType;

    const skills = resumeData?.skills || [];
    const experience = resumeData?.experience || [];
    const titles = experience.map(exp => exp.title || '').join(' ').toLowerCase();
    const allText = [...skills, titles].join(' ').toLowerCase();

    if (allText.includes('software') || allText.includes('developer') || allText.includes('engineer') || allText.includes('programming')) return 'Technical';
    if (allText.includes('manager') || allText.includes('director') || allText.includes('lead') || allText.includes('supervisor')) return 'Management';
    if (allText.includes('sales') || allText.includes('account') || allText.includes('business development')) return 'Sales';
    if (allText.includes('marketing') || allText.includes('brand') || allText.includes('advertising')) return 'Marketing';
    if (allText.includes('design') || allText.includes('creative') || allText.includes('art')) return 'Creative';
    if (allText.includes('analyst') || allText.includes('data') || allText.includes('research')) return 'Analytical';
    if (allText.includes('admin') || allText.includes('coordinator') || allText.includes('assistant')) return 'Administrative';
    if (allText.includes('customer') || allText.includes('support') || allText.includes('service')) return 'Customer Service';
    if (allText.includes('research') || allText.includes('scientist') || allText.includes('phd')) return 'Research';
    if (allText.includes('consulting') || allText.includes('consultant')) return 'Consulting';
    if (allText.includes('operations') || allText.includes('logistics') || allText.includes('supply chain')) return 'Operations';

    return 'General';
  };

  // Return the exact Gemini structure without any UI transformations
  const result = {
    overallScore: analysis.overallAtsScore || analysis.overallScore || 0,
    analysisType: analysis.analysisType || (jobDescription ? 'COMPARATIVE' : 'GENERAL'),
    hasJobDescription: !!jobDescription, // Add this field for UI
    jobDescription: jobDescription || null, // Add this for UI fallback
    executiveSummary: {
      overallFit: analysis.executiveSummary?.overallFit || 'Analysis not available',
      keyStrengths: analysis.executiveSummary?.keyStrengths || [],
      primaryAreasForImprovement: analysis.executiveSummary?.primaryImprovements || analysis.executiveSummary?.primaryAreasForImprovement || []
    },
    detailedAnalysis: analysis.detailedAnalysis || {},
    actionableRecommendations: analysis.actionableRecommendations || []
  };

  // Check if AI returned an invalid score and recalculate if necessary (but allow legitimate 75 scores)
  const originalScore = analysis.overallAtsScore || analysis.overallScore;
  const hasDetailedAnalysis = analysis.detailedAnalysis &&
    analysis.detailedAnalysis.keywordAnalysis &&
    analysis.detailedAnalysis.keywordAnalysis.matchedKeywords &&
    analysis.detailedAnalysis.keywordAnalysis.matchedKeywords.length > 0;

  if (originalScore === 0 || !originalScore || originalScore < 10 || originalScore > 100 || (originalScore === 75 && !hasDetailedAnalysis)) {
    console.log('🔄 Recalculating score due to invalid value:', originalScore);

    // Calculate score based on actual analysis data
    let recalculatedScore = 0;

    if (jobDescription) {
      // Job-specific scoring
      const keywordMatch = (analysis.detailedAnalysis?.keywordAnalysis?.matchedKeywords?.length || 0) /
        ((analysis.detailedAnalysis?.keywordAnalysis?.matchedKeywords?.length || 0) +
          (analysis.detailedAnalysis?.keywordAnalysis?.missingKeywords?.length || 0)) * 100;
      const skillsAlignment = (analysis.detailedAnalysis?.skillsAnalysis?.hardSkills?.identified?.length || 0) /
        ((analysis.detailedAnalysis?.skillsAnalysis?.hardSkills?.identified?.length || 0) +
          (analysis.detailedAnalysis?.skillsAnalysis?.hardSkills?.missing?.length || 0)) * 100;
      const experienceRelevance = analysis.detailedAnalysis?.experienceMatch?.seniorityAlignment?.isAligned ? 90 : 40;
      const formattingCompliance = analysis.detailedAnalysis?.formattingAndStructure?.parsingRisk === 'Low' ? 90 :
        analysis.detailedAnalysis?.formattingAndStructure?.parsingRisk === 'Medium' ? 60 : 30;

      recalculatedScore = (keywordMatch * 0.4) + (skillsAlignment * 0.3) + (experienceRelevance * 0.2) + (formattingCompliance * 0.1);
    } else {
      // General ATS scoring
      const contentCompleteness = Object.keys(analysis.detailedAnalysis || {}).length > 3 ? 85 : 60;
      const keywordDensity = (analysis.detailedAnalysis?.keywordAnalysis?.matchedKeywords?.length || 0) > 5 ? 80 : 50;
      const formattingCompliance = analysis.detailedAnalysis?.formattingAndStructure?.parsingRisk === 'Low' ? 90 :
        analysis.detailedAnalysis?.formattingAndStructure?.parsingRisk === 'Medium' ? 60 : 30;
      const skillsPresentation = (analysis.detailedAnalysis?.skillsAnalysis?.hardSkills?.identified?.length || 0) > 3 ? 85 : 60;

      recalculatedScore = (contentCompleteness * 0.35) + (keywordDensity * 0.25) + (formattingCompliance * 0.25) + (skillsPresentation * 0.15);
    }

    result.overallScore = Math.round(recalculatedScore);
    console.log('✅ Recalculated score:', result.overallScore);
  } else {
    // Score is valid, keep the AI-generated score
    console.log('✅ Accepted AI score:', originalScore, hasDetailedAnalysis ? 'with detailed analysis' : '');
  }

  return result;
}

// Generate fallback analysis if AI fails
function generateFallbackAnalysis() {
  return {
    error: true,
    message: "AI analysis failed. Please try again with a different resume or job description.",
    overallScore: 0,
    analysisType: "GENERAL",
    hasJobDescription: false, // Add this field
    jobDescription: null, // Add this field
    executiveSummary: {
      overallFit: "Unable to analyze resume due to technical error. Please ensure your resume is in ATS-friendly format with clear contact information, consistent formatting, and relevant keywords.",
      keyStrengths: [],
      primaryAreasForImprovement: [
        "Ensure resume is in ATS-friendly format (single-column layout, standard fonts)",
        "Include clear contact information and consistent date formatting",
        "Add relevant industry keywords and quantifiable achievements",
        "Verify education requirements are explicitly stated"
      ]
    },
    detailedAnalysis: {
      keywordAnalysis: {
        matchedKeywords: [],
        missingKeywords: []
      },
      skillsAnalysis: {
        hardSkills: {
          identified: [],
          missing: []
        },
        softSkills: {
          identified: [],
          suggested: []
        }
      },
      experienceMatch: {
        seniorityAlignment: {
          isAligned: false,
          comment: "Unable to determine seniority alignment due to analysis failure"
        },
        educationMatch: {
          meetsRequirements: false,
          comment: "Unable to verify education requirements due to analysis failure"
        }
      },
      formattingAndStructure: {
        parsingRisk: "High",
        issues: [
          "Analysis failed - unable to determine formatting compliance",
          "Please ensure resume is in ATS-friendly format"
        ]
      }
    },
    actionableRecommendations: [
      {
        priority: "High",
        area: "Technical Issue",
        recommendation: "Please try uploading your resume again. Ensure the file is not corrupted and is in a supported format (PDF, DOCX)."
      },
      {
        priority: "High",
        area: "ATS Compliance",
        recommendation: "Ensure your resume follows ATS guidelines: single-column layout, standard fonts, clear contact information, and consistent formatting."
      }
    ]
  };
}

// Main POST endpoint
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const bypassCache = formData.get("bypassCache") === "true";
    const jobDescription = formData.get("jobDescription") || "";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Check if this is JSON data from ResumeForm
    let parsedData;
    let resumeText = '';
    let fileType = 'JSON';

    try {
      // Try to parse as JSON first (for ResumeForm data)
      const jsonText = fileBuffer.toString('utf8');
      parsedData = JSON.parse(jsonText);
      resumeText = JSON.stringify(parsedData, null, 2);
      console.log("Processing JSON data from ResumeForm");
    } catch (jsonError) {
      // If not JSON, treat as regular file
      // Use internal functions instead of external fetch to bypass Vercel deployment protection
      const fileDetection = detectSupportedFileType(fileBuffer);
      if (!fileDetection.isSupported) {
        return NextResponse.json({
          error: `Unsupported file type: ${fileDetection.fileType}. Please upload a PDF, DOCX, or DOC file.`
        }, { status: 400 });
      }

      fileType = fileDetection.fileType;

      // Extract text content for Word documents if needed
      // (The extractResumeWithGemini function handles this internally for DOCX/DOC)

      // Parse resume using internal function
      try {
        parsedData = await extractResumeWithGemini(fileBuffer, fileType);
      } catch (parseError) {
        console.error("Internal parse error:", parseError);
        return NextResponse.json({ error: parseError.message || "Failed to parse resume" }, { status: 500 });
      }

      // Use the parsed data to create the text context
      resumeText = JSON.stringify(parsedData);
    }

    // Generate content hash for verification (include job description in hash if provided)
    const contentHash = jobDescription ?
      createHash("sha256").update(fileBuffer + jobDescription).digest("hex") :
      createHash("sha256").update(fileBuffer).digest("hex");
    const cacheRef = adminDb.collection("atsCache").doc(contentHash);

    // Log content hash for debugging consistency issues
    console.log('📋 Content Hash:', contentHash.substring(0, 12) + '...');
    console.log('🔍 This hash should be identical for the same resume content');

    // Check cache first to reduce costs
    if (!bypassCache) {
      try {
        const cachedResult = await cacheRef.get();
        if (cachedResult.exists) {
          const cachedData = cachedResult.data();
          const cacheAge = Date.now() - cachedData.timestamp;

          // Cache validity rules
          const isValidCache = jobDescription ?
            cacheAge < (7 * 24 * 60 * 60 * 1000) : // 7 days for job-specific analysis
            cacheAge < (24 * 60 * 60 * 1000); // 24 hours for general analysis

          if (isValidCache) {
            console.log("✅ Using cached ATS analysis (cost savings)");
            return NextResponse.json(cachedData.result);
          }
        }
      } catch (cacheError) {
        console.log("⚠️ Cache check failed, proceeding with fresh analysis:", cacheError.message);
      }
    }

    // Perform fresh ATS analysis with job description if provided
    const atsAnalysis = await analyzeATSCompatibility(resumeText, parsedData, fileType, jobDescription);

    // Check if analysis failed
    if (atsAnalysis.error) {
      return NextResponse.json({
        error: atsAnalysis.message || "Failed to analyze resume",
        details: atsAnalysis.details
      }, { status: 500 });
    }

    // Log analysis results for consistency debugging
    console.log('🎯 ATS Analysis Results:');
    console.log('- Content Hash:', contentHash.substring(0, 12) + '...');
    console.log('- Model Used:', atsAnalysis.model || 'unknown');
    console.log('- Score Returned:', atsAnalysis.overallScore);
    console.log('- Analysis Type:', atsAnalysis.analysisType);
    console.log('🔍 Same hash should always produce same score with same model');

    // Cache the result for cost savings
    try {
      await cacheRef.set({
        result: atsAnalysis,
        timestamp: Date.now(),
        jobDescription: !!jobDescription,
        model: atsAnalysis.model || 'unknown'
      });
      console.log("💾 Cached ATS analysis for future cost savings");
    } catch (cacheError) {
      console.log("⚠️ Failed to cache result:", cacheError.message);
    }

    // Analytics tracking is now handled by gemini-parse-resume API to avoid duplicates

    // Return fresh analysis results
    console.log("Returning fresh ATS analysis results");

    return NextResponse.json(atsAnalysis);

  } catch (error) {
    console.error("ATS Checker Error:", error);
    return NextResponse.json({
      error: error.message || "Failed to analyze resume for ATS compatibility. Please try again.",
      details: error.stack
    }, { status: 500 });
  }
}

// Clear cache endpoint
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cacheKey = searchParams.get('cacheKey');

    if (!cacheKey) {
      return NextResponse.json({ error: "Cache key required" }, { status: 400 });
    }

    const cacheRef = adminDb.collection("atsCache").doc(cacheKey);
    await cacheRef.delete();

    return NextResponse.json({ success: true, message: "Cache cleared successfully" });
  } catch (error) {
    console.error("Cache clear error:", error);
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 });
  }
} 