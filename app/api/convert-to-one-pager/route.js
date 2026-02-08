import { NextResponse } from 'next/server';
import { generateWithFallback } from '../../lib/geminiFallback';
import pdf from 'pdf-parse/lib/pdf-parse.js';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Character limits for one-pager - Optimized for better page utilization
const CHARACTER_LIMITS = {
  name: 50,
  jobTitle: 70,
  email: 50,
  phone: 20,
  location: 100,
  linkedin: 100,
  portfolio: 100,
  summary: 500, // Increased for fuller utilization
  skills: 350, // Increased to show more skills
  experienceTitle: 70,
  experienceCompany: 70,
  experienceDescription: 280, // Significantly increased for better content
  educationDegree: 100,
  educationInstitution: 100,
  educationDescription: 150, // Increased for more detail
  certificationName: 100,
  certificationOrganization: 80,
  projectName: 80,
  projectDescription: 200 // Increased for meaningful project descriptions
};

// Import the existing Gemini parse resume function
async function parseResumeWithGemini(documentBuffer, fileType = 'PDF') {
  try {
    // Call the existing gemini-parse-resume API internally
    const formData = new FormData();
    const blob = new Blob([documentBuffer], { 
      type: fileType === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    formData.append('file', blob, `resume.${fileType.toLowerCase()}`);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/gemini-parse-resume`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to parse resume with Gemini');
    }

    return await response.json();
  } catch (error) {
    console.error('[Gemini Parse Error]', error);
    // Fallback to text extraction
    return null;
  }
}

async function extractTextFromPDF(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF');
  }
}

async function trimContentWithAI(text) {
  // STEP 1: Analyze the resume to count positions
  const analysisPrompt = `
Analyze this resume and count the following:
1. Number of work experience positions
2. Number of education entries
3. Number of projects
4. Number of certifications

Resume:
${text}

Return ONLY a JSON object with counts:
{"experienceCount": X, "educationCount": X, "projectsCount": X, "certificationsCount": X}`;

  let counts = { experienceCount: 3, educationCount: 1, projectsCount: 0, certificationsCount: 0 };
  
  try {
    const analysisResult = await generateWithFallback(analysisPrompt, {
      maxOutputTokens: 200,
      temperature: 0.3,
      apiKey: process.env.GEMINI_API_KEY
    });
    
    const cleanJson = analysisResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    counts = JSON.parse(cleanJson);
    console.log('[One-Pager AI] Content analysis:', counts);
  } catch (error) {
    console.error('[One-Pager AI] Analysis failed, using defaults:', error);
  }

  // STEP 2: Calculate dynamic character limits based on content volume
  const experienceCount = Math.max(1, counts.experienceCount || 3);
  const hasProjects = (counts.projectsCount || 0) > 0;
  const hasCertifications = (counts.certificationsCount || 0) > 0;

  // Smart allocation: More positions = shorter descriptions, but ensure good page utilization
  let experienceDescLimit;
  if (experienceCount <= 2) {
    experienceDescLimit = 320; // Very detailed for senior folks with long tenures
  } else if (experienceCount <= 3) {
    experienceDescLimit = 280; // Plenty of space, detailed descriptions
  } else if (experienceCount <= 5) {
    experienceDescLimit = 240; // Moderate space, good descriptions
  } else if (experienceCount <= 7) {
    experienceDescLimit = 200; // Still substantial content
  } else {
    experienceDescLimit = 160; // Many positions, focused on key achievements
  }

  // Adjust summary based on available space - but keep it substantial
  let summaryLimit = 500;
  if (experienceCount > 5) {
    summaryLimit = 420; // Still generous for context
  } else if (experienceCount > 7) {
    summaryLimit = 360; // Reduce only for many positions
  }

  // Adjust skills based on available space - show comprehensive skills
  let skillsLimit = 350;
  if (experienceCount > 6) {
    skillsLimit = 300; // Still show good range
  } else if (experienceCount > 8) {
    skillsLimit = 250; // Reduce only for very long work history
  }

  console.log(`[One-Pager AI] Dynamic limits - Experience: ${experienceDescLimit} chars (${experienceCount} positions), Summary: ${summaryLimit}, Skills: ${skillsLimit}`);

  const prompt = `
You are a professional resume optimizer. Extract and optimize the following resume content to fit a one-page format.

**CRITICAL: INCLUDE ALL CONTENT**
- Extract EVERY SINGLE work experience position (all ${experienceCount} positions)
- Extract ALL education entries
- Extract ALL certifications if present
- Extract ALL languages if present
- Extract ALL awards/honors if present
- Extract projects if space allows

**STRICT CHARACTER LIMITS - DO NOT EXCEED THESE**:
- Name: MAXIMUM ${CHARACTER_LIMITS.name} characters
- Job Title: MAXIMUM ${CHARACTER_LIMITS.jobTitle} characters
- Summary: MAXIMUM ${summaryLimit} characters (complete sentences only)
- Each Experience Description: MAXIMUM ${experienceDescLimit} characters (complete sentences only)
- Skills Combined: MAXIMUM ${skillsLimit} characters total
- Each Education Description: MAXIMUM ${CHARACTER_LIMITS.educationDescription} characters
- Each Project Description: MAXIMUM ${CHARACTER_LIMITS.projectDescription} characters
- Each Certification Name: MAXIMUM ${CHARACTER_LIMITS.certificationName} characters
- Each Certification Organization: MAXIMUM ${CHARACTER_LIMITS.certificationOrganization} characters

**ABSOLUTELY CRITICAL RULES**:
1. NEVER exceed the character limits specified above
2. NEVER use "..." or ellipsis - this is FORBIDDEN
3. ALWAYS write complete sentences with proper endings
4. If a description can't fit completely, write FEWER complete sentences
5. Better to have 2 complete sentences than 3 incomplete ones
6. End every field at a natural stopping point (sentence end, comma, or period)
7. Count characters as you write - stay UNDER the limit
8. Prioritize quality and completeness over quantity

**INSTRUCTIONS FOR ${experienceCount} WORK POSITIONS**:
1. Include EVERY SINGLE job from the resume (no exceptions)
2. For each position: MAXIMUM ${experienceDescLimit} characters
3. Use bullet points: • Led... • Built... • Achieved...
4. Focus on metrics and measurable results (numbers, %, $)
5. Remove all fluff words and unnecessary adjectives
6. Each bullet point must be a complete thought
7. If space is tight:
   - Fewer bullets with complete thoughts > more bullets with incomplete thoughts
   - Focus on most impressive achievements
   - Use action verbs + metric + result format
8. Example good bullet: "• Built API serving 2M+ daily requests, reducing latency 40%"
9. Example bad bullet: "• Built scalable microservices architecture for enterprise applications which..."

**GENERAL WRITING RULES**:
- Write within limits from the start - don't write long and expect truncation
- Be concise but professional
- Every sentence must have a subject, verb, and complete thought
- Use active voice and strong action verbs
- Include specific numbers and metrics whenever possible
- NO ellipsis ("...") ANYWHERE - this is your #1 priority

**HOW TO ENSURE YOU STAY WITHIN LIMITS**:
1. Before writing each field, note its character limit
2. As you write, mentally count characters
3. Stop writing BEFORE you hit the limit
4. End at a natural stopping point (period, comma, or complete phrase)
5. Review: Does this field have "..."? If YES, remove it and end properly
6. Better to write 80% of limit with complete sentences than 100% with truncation

**Resume Content**:
${text}

**REMINDER: No "..." anywhere. All sentences must be complete. Stay UNDER the limits.**

Return ONLY a valid JSON object with this EXACT structure (no markdown, no explanations):
{
  "personal": {
    "name": "Full Name",
    "jobTitle": "Current Role/Title",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "portfolio": "portfolio-url.com"
  },
  "summary": "Brief professional summary with complete sentences (max ${CHARACTER_LIMITS.summary} chars)",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "description": "2-3 key achievements with metrics (max ${CHARACTER_LIMITS.experienceDescription} chars)"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "location": "Location",
      "graduationDate": "MM/YYYY",
      "gpa": "3.8/4.0",
      "description": "Honors, relevant coursework (max ${CHARACTER_LIMITS.educationDescription} chars)"
    }
  ],
  "skills": ["Skill1", "Skill2", "Skill3"],
  "projects": [
    {
      "name": "Project Name",
      "technologies": "Tech stack",
      "description": "Brief description with impact (max ${CHARACTER_LIMITS.projectDescription} chars)",
      "link": "project-url.com"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "MM/YYYY",
      "link": "credential-url.com"
    }
  ],
  "languages": [
    {
      "language": "Language Name",
      "proficiency": "Native/Professional/Conversational/Basic"
    }
  ],
  "awards": [
    {
      "title": "Award Title",
      "issuer": "Issuing Organization",
      "date": "MM/YYYY",
      "description": "Brief description (optional, max 150 chars)"
    }
  ]
}`;

  try {
    const result = await generateWithFallback(prompt, {
      maxOutputTokens: 2000,
      temperature: 0.7,
      apiKey: process.env.GEMINI_API_KEY
    });
    
    let jsonText = result.text;
    
    // Clean up the response
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsedData = JSON.parse(jsonText);
    
    // Log what AI returned for debugging
    console.log('[One-Pager AI] Summary length:', parsedData.summary?.length, '/ limit:', summaryLimit);
    if (parsedData.experience) {
      parsedData.experience.forEach((exp, i) => {
        console.log(`[One-Pager AI] Experience ${i+1} description length:`, exp.description?.length, '/ limit:', experienceDescLimit);
      });
    }
    console.log('[One-Pager AI] Skills combined length:', parsedData.skills?.join(', ').length, '/ limit:', skillsLimit);
    
    // Validate and enforce character limits with dynamic values
    return enforceCharacterLimits(parsedData, {
      summaryLimit,
      experienceDescLimit,
      skillsLimit
    });
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error('Failed to process resume content');
  }
}

function enforceCharacterLimits(data, dynamicLimits = {}) {
  const { 
    summaryLimit = CHARACTER_LIMITS.summary,
    experienceDescLimit = CHARACTER_LIMITS.experienceDescription,
    skillsLimit = CHARACTER_LIMITS.skills
  } = dynamicLimits;
  
  console.log('[Enforce Limits] Using dynamic limits:', { summaryLimit, experienceDescLimit, skillsLimit });
  
  // Helper function to intelligently trim text with logical closure
  const trim = (text, limit) => {
    if (!text) return '';
    if (text.length <= limit) return text;
    
    const originalLength = text.length;
    console.log(`[Trim] Trimming text from ${originalLength} to ${limit} chars`);
    
    // Try to end at a sentence boundary
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    let result = '';
    
    for (const sentence of sentences) {
      if ((result + sentence).length <= limit) {
        result += sentence;
      } else {
        break;
      }
    }
    
    // If we have complete sentences, return them
    if (result.length > limit * 0.6) {
      const trimmed = result.trim();
      console.log(`[Trim] Result (sentence boundary): ${trimmed.length} chars`);
      return trimmed;
    }
    
    // Otherwise, try to end at a word boundary
    const truncated = text.substring(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > limit * 0.8) {
      const trimmed = truncated.substring(0, lastSpace).trim();
      console.log(`[Trim] Result (word boundary): ${trimmed.length} chars`);
      return trimmed;
    }
    
    // Last resort: clean cut at limit
    const trimmed = truncated.trim();
    console.log(`[Trim] Result (clean cut): ${trimmed.length} chars`);
    return trimmed;
  };

  // Enforce personal info limits
  if (data.personal) {
    data.personal.name = trim(data.personal.name, CHARACTER_LIMITS.name);
    data.personal.jobTitle = trim(data.personal.jobTitle, CHARACTER_LIMITS.jobTitle);
    data.personal.email = trim(data.personal.email, CHARACTER_LIMITS.email);
    data.personal.phone = trim(data.personal.phone, CHARACTER_LIMITS.phone);
    data.personal.location = trim(data.personal.location, CHARACTER_LIMITS.location);
    data.personal.linkedin = trim(data.personal.linkedin, CHARACTER_LIMITS.linkedin);
    data.personal.portfolio = trim(data.personal.portfolio, CHARACTER_LIMITS.portfolio);
  }

  // Enforce summary limit (use dynamic limit)
  data.summary = trim(data.summary, summaryLimit);

  // Enforce experience limits (keep only top 4, use dynamic description limit)
  if (data.experience && Array.isArray(data.experience)) {
    data.experience = data.experience.slice(0, 4).map(exp => ({
      ...exp,
      title: trim(exp.title, CHARACTER_LIMITS.experienceTitle),
      company: trim(exp.company, CHARACTER_LIMITS.experienceCompany),
      description: trim(exp.description, experienceDescLimit)
    }));
  }

  // Enforce education limits (keep only top 2)
  if (data.education && Array.isArray(data.education)) {
    data.education = data.education.slice(0, 2).map(edu => ({
      ...edu,
      degree: trim(edu.degree, CHARACTER_LIMITS.educationDegree),
      institution: trim(edu.institution, CHARACTER_LIMITS.educationInstitution),
      description: trim(edu.description || '', CHARACTER_LIMITS.educationDescription)
    }));
  }

  // Enforce skills limit (keep only top 20 skills, use dynamic limit)
  if (data.skills && Array.isArray(data.skills)) {
    data.skills = data.skills.slice(0, 20);
    const skillsText = data.skills.join(', ');
    if (skillsText.length > skillsLimit) {
      // Trim skills to fit within dynamic limit
      let trimmedSkills = [];
      let currentLength = 0;
      for (const skill of data.skills) {
        if (currentLength + skill.length + 2 <= skillsLimit) {
          trimmedSkills.push(skill);
          currentLength += skill.length + 2;
        } else {
          break;
        }
      }
      data.skills = trimmedSkills;
    }
  }

  // Enforce project limits (keep only top 3)
  if (data.projects && Array.isArray(data.projects)) {
    data.projects = data.projects.slice(0, 3).map(proj => ({
      ...proj,
      name: trim(proj.name, CHARACTER_LIMITS.projectName),
      description: trim(proj.description, CHARACTER_LIMITS.projectDescription)
    }));
  }

  // Enforce certification limits (keep only top 4)
  if (data.certifications && Array.isArray(data.certifications)) {
    data.certifications = data.certifications.slice(0, 4).map(cert => ({
      ...cert,
      name: trim(cert.name, CHARACTER_LIMITS.certificationName),
      issuer: trim(cert.issuer || cert.organization, CHARACTER_LIMITS.certificationOrganization)
    }));
  }

  // Enforce language limits (keep only top 5)
  if (data.languages && Array.isArray(data.languages)) {
    data.languages = data.languages.slice(0, 5).map(lang => ({
      language: typeof lang === 'string' ? lang : (lang.language || ''),
      proficiency: typeof lang === 'object' ? (lang.proficiency || 'Professional') : 'Professional'
    }));
  }

  // Enforce awards limits (keep only top 3)
  if (data.awards && Array.isArray(data.awards)) {
    data.awards = data.awards.slice(0, 3).map(award => ({
      ...award,
      title: trim(award.title || '', 100),
      issuer: trim(award.issuer || '', 80),
      description: trim(award.description || '', 150)
    }));
  }

  return data;
}

// Smart conversion function that uses parsed data directly
async function convertParsedDataToOnePager(parsedData) {
  const experienceCount = (parsedData.experience || []).length;
  
  // Calculate dynamic limits - optimized for better page utilization
  let experienceDescLimit;
  if (experienceCount <= 2) {
    experienceDescLimit = 320; // Very detailed for senior folks
  } else if (experienceCount <= 3) {
    experienceDescLimit = 280; // Detailed descriptions
  } else if (experienceCount <= 5) {
    experienceDescLimit = 240; // Good descriptions
  } else if (experienceCount <= 7) {
    experienceDescLimit = 200; // Substantial content
  } else {
    experienceDescLimit = 160; // Focused achievements
  }

  let summaryLimit = 500;
  if (experienceCount > 5) {
    summaryLimit = 420;
  } else if (experienceCount > 7) {
    summaryLimit = 360;
  }
  
  let skillsLimit = 350;
  if (experienceCount > 6) {
    skillsLimit = 300;
  } else if (experienceCount > 8) {
    skillsLimit = 250;
  }

  console.log(`[One-Pager Conversion] ${experienceCount} positions detected, using ${experienceDescLimit} chars per position`);

  // Helper to intelligently trim text with logical closure - more generous thresholds
  const trim = (text, limit) => {
    if (!text) return '';
    if (text.length <= limit) return text;
    
    // Try to end at a sentence boundary
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    let result = '';
    
    for (const sentence of sentences) {
      if ((result + sentence).length <= limit) {
        result += sentence;
      } else {
        break;
      }
    }
    
    // If we have complete sentences and they're reasonably substantial, return them
    if (result.length > limit * 0.5) { // Lowered from 0.6 to 0.5 for more content
      return result.trim();
    }
    
    // Otherwise, try to end at a word boundary with more generous threshold
    const truncated = text.substring(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > limit * 0.7) { // Lowered from 0.8 to 0.7 for more content
      return truncated.substring(0, lastSpace).trim();
    }
    
    // Last resort: clean cut at limit
    return truncated.trim();
  };

  // Convert to one-pager format
  return {
    personal: {
      name: trim(parsedData.name || '', 50),
      jobTitle: trim(parsedData.jobTitle || '', 60),
      email: trim(parsedData.email || '', 50),
      phone: trim(parsedData.phone || '', 20),
      location: trim(parsedData.address || '', 80),
      linkedin: trim(parsedData.linkedin || '', 100),
      portfolio: trim(parsedData.portfolio || '', 100)
    },
    summary: trim(parsedData.summary || '', summaryLimit),
    experience: (parsedData.experience || []).map(exp => ({
      title: trim(exp.jobTitle || '', 60),
      company: trim(exp.company || '', 60),
      location: trim(exp.location || '', 60),
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: trim(exp.description || '', experienceDescLimit)
    })),
    education: (parsedData.education || []).slice(0, 3).map(edu => ({
      degree: trim(edu.degree || '', 100),
      institution: trim(edu.institution || '', 100),
      location: trim(edu.location || '', 60),
      graduationDate: edu.endDate || '',
      gpa: edu.gpa || '',
      description: trim(edu.field || edu.description || '', 150)
    })),
    skills: (() => {
      const skills = (parsedData.skills || []).map(s => typeof s === 'string' ? s : s.name).filter(Boolean);
      const skillsText = skills.join(', ');
      if (skillsText.length <= skillsLimit) return skills;
      
      // Trim to fit limit
      let trimmedSkills = [];
      let currentLength = 0;
      for (const skill of skills) {
        if (currentLength + skill.length + 2 <= skillsLimit) {
          trimmedSkills.push(skill);
          currentLength += skill.length + 2;
        } else {
          break;
        }
      }
      return trimmedSkills;
    })(),
    projects: (parsedData.customSections || [])
      .filter(cs => cs.type === 'project')
      .slice(0, 4) // Increased from 3 to 4
      .map(proj => ({
        name: trim(proj.title || proj.name || '', 80),
        technologies: '',
        description: trim(proj.description || '', 200),
        link: ''
      })),
    certifications: (parsedData.certifications || []).slice(0, 4).map(cert => ({ // Increased from 3 to 4
      name: trim(typeof cert === 'string' ? cert : (cert.name || ''), 100),
      issuer: trim(typeof cert === 'object' ? (cert.issuer || cert.organization || '') : '', 80),
      date: typeof cert === 'object' ? (cert.date || '') : '',
      link: ''
    })),
    languages: (parsedData.languages || []).slice(0, 5).map(lang => ({
      language: typeof lang === 'string' ? lang : (lang.language || lang.name || ''),
      proficiency: typeof lang === 'object' ? (lang.proficiency || 'Professional') : 'Professional'
    })),
    awards: (parsedData.customSections || [])
      .filter(cs => cs.type === 'award' || cs.type === 'achievement')
      .slice(0, 3)
      .map(award => ({
        title: trim(award.title || award.name || '', 100),
        issuer: trim(award.description || award.organization || '', 80),
        date: award.date || '',
        description: trim(award.description || '', 150)
      })),
    metadata: {
      processedAt: new Date().toISOString(),
      version: '2.0-smart',
      experienceCount,
      dynamicLimits: {
        experienceDesc: experienceDescLimit,
        summary: summaryLimit,
        skills: skillsLimit
      },
      source: 'gemini-parse'
    }
  };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Detect file type
    const fileType = file.type === 'application/pdf' ? 'PDF' : 
                     file.type.includes('wordprocessingml') ? 'DOCX' : 'PDF';

    console.log('[One-Pager Convert] Starting conversion with file type:', fileType);

    // STEP 1: Try to use existing Gemini parse for accurate data (PRIMARY METHOD)
    let parsedData = await parseResumeWithGemini(buffer, fileType);

    if (parsedData && parsedData.experience && parsedData.experience.length > 0) {
      console.log('[One-Pager Convert] ✅ Using Gemini parsed data (accurate)');
      console.log(`[One-Pager Convert] Found ${parsedData.experience.length} work experiences - ALL will be included!`);
      
      // Convert parsed data to one-pager format with smart limits
      const onePagerData = await convertParsedDataToOnePager(parsedData);
      return NextResponse.json(onePagerData);
    }

    // STEP 2: Fallback to text extraction + AI trimming (FALLBACK METHOD)
    console.log('[One-Pager Convert] ⚠️ Falling back to text extraction + AI trimming');
    
    let extractedText;
    if (fileType === 'PDF') {
      extractedText = await extractTextFromPDF(buffer);
    } else {
      return NextResponse.json(
        { error: 'Word documents require Gemini parse. Please try again or use PDF.' },
        { status: 400 }
      );
    }

    // Process with AI to trim content
    const optimizedData = await trimContentWithAI(extractedText);

    // Add metadata
    optimizedData.metadata = {
      processedAt: new Date().toISOString(),
      characterLimits: CHARACTER_LIMITS,
      source: 'upload-fallback',
      method: 'ai-trimming'
    };

    return NextResponse.json(optimizedData);
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert resume' },
      { status: 500 }
    );
  }
}
