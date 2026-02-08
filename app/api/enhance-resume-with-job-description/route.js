import { NextResponse } from "next/server";
import { generateWithFallback } from "../../lib/geminiFallback";
import { adminDb } from "../../lib/firebase";
import { createHash } from "crypto";

export const maxDuration = 180; // 3 minutes

export async function POST(request) {
  try {
    const { jobDescription, resumeData, userId, enhancementType, bypassCache, timestamp, noCache, requestId } = await request.json();

    // Validate required fields
    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    console.log("Enhancement request details:", {
      userId,
      enhancementType: enhancementType || (resumeData ? 'enhance_existing' : 'create_new'),
      jobDescriptionLength: jobDescription.length,
      hasResumeData: !!resumeData,
      resumeDataStructure: resumeData ? {
        hasName: !!resumeData.name,
        hasExperience: resumeData.experience?.length > 0,
        hasSkills: resumeData.skills?.length > 0,
        hasEducation: resumeData.education?.length > 0
      } : null
    });

    // Enhanced validation for resume data structure
    if (resumeData) {
      console.log("Processing existing resume enhancement");
      
      // Validate and clean resume data
      const requiredArrays = ['experience', 'education', 'skills', 'certifications', 'languages', 'customSections'];
      requiredArrays.forEach(key => {
        if (!Array.isArray(resumeData[key])) {
          resumeData[key] = [];
        }
      });
      
      // Normalize skills to handle different formats
      if (Array.isArray(resumeData.skills)) {
        resumeData.skills = resumeData.skills.map(skill => {
          if (typeof skill === 'string') return skill;
          if (typeof skill === 'object' && skill.name) return skill.name;
          if (typeof skill === 'object' && skill.skill) return skill.skill;
          return String(skill);
        }).filter(Boolean);
      }
      
      console.log("Resume validation completed:", {
        yearsOfExperience: resumeData.yearsOfExperience || 'Not calculated',
        experienceEntries: resumeData.experience.length,
        skillsCount: resumeData.skills.length,
        educationEntries: resumeData.education.length
      });
    } else {
      console.log("Creating new resume template from job description");
    }

    // Validate Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not set in environment");
      return NextResponse.json(
        { error: "Server configuration error: GEMINI_API_KEY not set" },
        { status: 500 }
      );
    }

    // Create cache key from job description and resume data structure
    const resumeFingerprint = resumeData ? {
      hasName: !!resumeData.name,
      experienceCount: resumeData.experience?.length || 0,
      skillsCount: resumeData.skills?.length || 0,
      educationCount: resumeData.education?.length || 0,
      // Include key identifiers for cache differentiation
      nameHash: resumeData.name ? createHash("md5").update(resumeData.name).digest("hex").substring(0, 8) : null
    } : null;
    
    // Always bypass cache for job-description-resume-builder
    const forceNoCache = bypassCache || noCache;
    const cacheInput = forceNoCache 
      ? `${jobDescription.trim()}:${resumeFingerprint ? JSON.stringify(resumeFingerprint) : 'template-creation'}:${enhancementType || 'default'}:${timestamp || Date.now()}:${requestId || Math.random()}`
      : `${jobDescription.trim()}:${resumeFingerprint ? JSON.stringify(resumeFingerprint) : 'template-creation'}:${enhancementType || 'default'}`;
    const cacheKey = createHash("sha256").update(cacheInput).digest("hex");
    console.log("Generated cache key:", cacheKey, "for enhancement type:", enhancementType || 'default', forceNoCache ? "(FORCED NO CACHE)" : "");

    // Always bypass cache for job-description-resume-builder
    if (forceNoCache) {
      console.log("FORCED NO CACHE - proceeding with fresh enhancement");
    } else {
      // Check cache only if not forced to bypass
      const cacheRef = adminDb.collection("cache").doc(cacheKey);
      const cacheDoc = await cacheRef.get();
      if (cacheDoc.exists) {
        const cachedData = cacheDoc.data();
        console.log("Cache hit - returning cached enhanced resume");
        return NextResponse.json({ 
          enhancedResume: cachedData.enhancedResume,
          enhancementSummary: cachedData.enhancementSummary || {}
        }, { status: 200 });
      }
    }

    console.log("Cache miss - proceeding with Gemini enhancement");

    // Create comprehensive prompt for resume enhancement
    const prompt = `You are an expert resume writer and ATS optimization specialist with deep knowledge of recruitment patterns and industry standards. Your task is to ${resumeData ? 'intelligently enhance an existing resume' : 'create a professional resume template'} to perfectly align with a specific job description while maintaining authenticity and professional standards.

## Job Description Analysis Required:
${jobDescription}

${resumeData ? `## Existing Resume to Enhance:
${JSON.stringify(resumeData, null, 2)}

## CRITICAL ENHANCEMENT INSTRUCTIONS:

⚠️ **CRITICAL COMPANY INFORMATION SEGREGATION RULES** ⚠️

🚨 **ABSOLUTE RULE #1: PRESERVE ALL FACTUAL INFORMATION** 🚨

When enhancing an EXISTING resume, you are ONLY allowed to:
✅ Enhance and rewrite job DESCRIPTIONS and ACHIEVEMENTS
✅ Improve the SUMMARY and professional positioning
✅ Optimize SKILLS presentation and ordering
✅ Enhance the WORDING and IMPACT of existing content

You are ABSOLUTELY FORBIDDEN from:
❌ Changing the candidate's NAME
❌ Changing COMPANY NAMES where they worked
❌ Changing JOB TITLES they held
❌ Changing EMPLOYMENT DATES (start/end dates)
❌ Changing EDUCATION institutions they attended
❌ Adding NEW companies or positions they never held
❌ Removing existing experience entries
❌ Inventing employment history

🚨 **ABSOLUTE RULE #2: NEVER USE TARGET COMPANY AS EMPLOYER** 🚨

**CRITICAL UNDERSTANDING:**
- The job description is for a TARGET COMPANY the candidate is APPLYING TO
- The candidate has NOT worked at this company - they are a JOB SEEKER
- NEVER, EVER use the hiring company's name as the candidate's employer
- The job description represents a FUTURE OPPORTUNITY, not past experience

**EXAMPLES OF CRITICAL ERRORS TO AVOID:**
❌ Job Description from "PayPal" → DO NOT write "Frontend Engineer at PayPal"
❌ Job Description from "Google" → DO NOT write "Software Engineer at Google"  
❌ Job Description from "Amazon" → DO NOT write "DevOps Engineer at Amazon"
❌ Job Description from "Microsoft" → DO NOT write "Cloud Architect at Microsoft"
❌ Job Description from "Netflix" → DO NOT write "Senior Developer at Netflix"

**CORRECT APPROACH:**
✅ ONLY use company names from the candidate's ACTUAL resume data
✅ Keep every company name EXACTLY as provided in original resume
✅ Keep every job title EXACTLY as provided in original resume
✅ Keep every date EXACTLY as provided in original resume
✅ ONLY enhance the descriptions and achievements within those roles

### PHASE 1: Comprehensive Job Analysis & Content Mapping

IMPORTANT: You must also return a detailed "enhancementSummary" object that tracks all changes made for user transparency.

1. **Exhaustive Keyword & Terminology Extraction**:
   - **Technical Terms**: Extract ALL technical keywords (ALM, LCM, CI/CD, frameworks, methodologies, platforms, tools)
   - **Industry Terminology**: Banking, healthcare, fintech, compliance terms (regulations, standards, policies)
   - **Leadership Competencies**: "create urgency", "weigh risks", "impactful decisions", "strategy vs operations"
   - **Soft Skills Phrases**: "communicate complex matters clearly", "embraces change", "vision and courage"
   - **Process & Management Terms**: roadmap, backlog, scalability, resilience, modernization, technical debt
   - **Acronyms & Abbreviations**: Identify and expand all acronyms with their full context
   - **Action Verbs**: "define", "monitor", "collaborate", "stimulate", "ensure", "translate"

2. **Role Context & Seniority Analysis**:
   - **Leadership Level**: Individual contributor vs team lead vs senior management
   - **Scope of Responsibility**: Team size, budget, strategic vs tactical focus
   - **Industry Context**: Banking/finance compliance, 24/7 operations, security requirements
   - **Stakeholder Complexity**: Business leads, architects, cross-functional teams

3. **Requirements Categorization**:
   - **Must-Have Technical Skills**: Core technologies and methodologies
   - **Leadership Requirements**: Team development, decision-making, risk management
   - **Domain Expertise**: Industry-specific knowledge and compliance understanding
   - **Cultural Fit Indicators**: Change management, innovation mindset, collaboration style

4. **Resume Content Deep Analysis** (if provided):
   - **Experience Years Preservation**: ALWAYS use the actual years of experience from the uploaded resume (yearsOfExperience field), never infer from job description
   - **Skills Mapping**: Match existing skills to job requirements with relevance scoring
   - **Experience Relevance**: Identify which roles/projects align with job context
   - **Leadership Evidence**: Find examples of team management, strategic thinking, decision-making
   - **Technical Depth**: Assess technical experience against job's technology stack
   - **Gap Identification**: Note missing skills that need to be addressed or de-emphasized

### PHASE 2: Strategic Enhancement & Keyword Integration

5. **Professional Summary Transformation**:
   - **Opening Statement**: Lead with the exact role title and seniority level from job description
   - **Core Competencies**: Integrate 3-4 critical keywords from Phase 1 analysis (ALM, LCM, technical roadmap, etc.)
   - **Leadership Positioning**: Address leadership requirements (team development, strategic thinking, decision-making)
   - **Industry Context**: Include domain-specific terms (banking compliance, 24/7 operations, security)
   - **Value Proposition**: Connect candidate's background to specific job outcomes

6. **Skills Section Strategic Optimization**:
   - **Primary Skills Tier**: Lead with exact job description terminology (ALM, LCM, roadmap development, risk assessment)
   - **Technical Skills Grouping**: Organize by categories mentioned in job (technical resilience, modernization, security)
   - **Leadership Skills**: Include soft skills phrases from job ("create urgency", "strategic vs operational")
   - **Industry Knowledge**: Add domain expertise (banking regulations, compliance frameworks, 24/7 operations)
   - **Methodology Skills**: Include process terms (continuous improvement, knowledge sharing, standardization)

7. **Experience Section Comprehensive Enhancement**:
   - 🚨 **MANDATORY FACTUAL DATA PRESERVATION**:
     * Keep COMPANY NAME exactly as provided (e.g., if resume says "Bengaluru Metro" - keep it as "Bengaluru Metro")
     * Keep JOB TITLE exactly as provided (e.g., if resume says "Station Assistant" - keep it as "Station Assistant")
     * Keep DATES exactly as provided (e.g., if resume says "01/2021 - Present" - keep those exact dates)
     * Keep LOCATION exactly as provided (e.g., if resume says "Bengaluru, India" - keep it)
     * NEVER add companies or positions that don't exist in the original resume
     * NEVER remove companies or positions from the original resume
   
   - ✅ **WHAT YOU CAN ENHANCE** (Only the descriptions):
     * COMPLETELY REWRITE job descriptions to align with target role requirements
     * Add realistic, quantified achievements that demonstrate relevant skills
     * Integrate job description keywords naturally throughout descriptions
     * Transform generic bullets into powerful, achievement-focused statements
     * Highlight relevant skills and accomplishments for the target position
     * Add metrics and impact statements (e.g., "managed 50+ passengers daily")
     * Frame existing work in terms relevant to the target job's industry and requirements
   
   - **Content Enhancement Strategy**:
     * **Keyword Integration**: Naturally weave in ALL identified keywords from job description
     * **Achievement Manufacturing**: Create realistic accomplishments within the existing roles
     * **Leadership Evidence**: Highlight decision-making, team collaboration, problem-solving
     * **Technical Alignment**: Reframe technical work to emphasize job-relevant skills
     * **Industry Context**: Use terminology and framing relevant to target role
     * **Action Verb Alignment**: Use powerful action verbs from job description
     * **Quantified Impact**: Add specific metrics and numbers where realistic
     * **Content Quality**: Transform weak bullets into compelling achievement statements
   
   - ❌ **WHAT YOU MUST NEVER CHANGE**:
     * Company names (these are FACTS about where they worked)
     * Job titles (these are FACTS about their roles)
     * Employment dates (these are FACTS about when they worked)
     * Number of positions (don't add or remove jobs)

8. **Education & Certifications Strategic Positioning**:
   - **Education Relevance**: Highlight education that supports the role (engineering, business, management)
   - **Certification Priorities**: Emphasize certifications relevant to job requirements (PMP, ITIL, security certs)
   - **Professional Development**: Include training in leadership, change management, or industry-specific areas
   - **Industry Credentials**: Add relevant professional memberships or continuing education

### PHASE 3: Comprehensive ATS & Quality Optimization

9. **Advanced ATS Optimization**:
   - **Keyword Density**: Ensure 2-3% keyword density for primary terms (ALM, LCM, roadmap, etc.)
   - **Synonym Integration**: Include variations of key terms (Application Lifecycle Management = ALM)
   - **Section Header Optimization**: Use job-description language in section headers when appropriate
   - **Skill Context**: Place keywords in context rather than isolated lists
   - **Acronym Strategy**: Include both acronym and full form (ALM - Application Lifecycle Management)

10. **Industry-Specific Optimization**:
    - **Compliance Language**: Integrate regulatory and compliance terminology naturally
    - **Security Focus**: Emphasize security mindset and 24/7 operational awareness
    - **Financial Services Context**: Include banking-specific terminology and requirements
    - **Leadership Terminology**: Use exact leadership phrases from job description

11. **Narrative Flow & Impact Maximization**:
    - **Leadership Progression**: Show clear growth from individual contributor to leadership roles
    - **Strategic vs Operational Balance**: Demonstrate ability to work at both levels
    - **Change Management**: Highlight examples of driving transformation and innovation
    - **Risk & Decision Making**: Include examples of risk assessment and impactful decision-making
    - **Cross-Functional Collaboration**: Emphasize stakeholder management and communication skills` : `## Task: Create Professional Resume Template
No existing resume provided - creating a tailored template from scratch.

IMPORTANT: You must also return a detailed "enhancementSummary" object explaining what you created.

## TEMPLATE CREATION INSTRUCTIONS:

⚠️ **CRITICAL COMPANY INFORMATION SEGREGATION RULES** ⚠️

**NEVER** use the hiring company from the job description as the candidate's employer in the template:
- The job description is from a TARGET COMPANY the candidate is APPLYING TO
- The candidate has NOT worked there - this is a job they are seeking
- Use REALISTIC but GENERIC company names (e.g., "Tech Solutions Inc", "Digital Innovations Corp", "Enterprise Systems Ltd")
- DO NOT use the actual company name from the job description header or body

**EXAMPLE OF WHAT NOT TO DO:**
- Job Description from "PayPal" → ❌ DO NOT create "Frontend Engineer at PayPal"
- Job Description from "Google" → ❌ DO NOT create "Software Engineer at Google"
- Job Description from "Microsoft" → ❌ DO NOT create "Cloud Engineer at Microsoft"

**CORRECT APPROACH:**
- Job Description from "PayPal" → ✅ Create "Frontend Engineer at FinTech Solutions Inc"
- Job Description from "Google" → ✅ Create "Software Engineer at Tech Innovations Corp"
- Job Description from "Microsoft" → ✅ Create "Cloud Engineer at Cloud Systems Ltd"

### PHASE 1: Comprehensive Job Analysis for Template Creation

1. **Exhaustive Keyword & Terminology Extraction**:
   - **Technical Terms**: Extract ALL technical keywords (ALM, LCM, CI/CD, frameworks, methodologies)
   - **Industry Terminology**: Banking, compliance, regulatory terms, security requirements
   - **Leadership Competencies**: "create urgency", "weigh risks", "strategic vs operational thinking"
   - **Soft Skills Phrases**: "communicate complex matters", "embraces change", "vision and courage"
   - **Process Terms**: roadmap, backlog, scalability, resilience, modernization, technical debt
   - **Role-Specific Actions**: define, monitor, collaborate, stimulate, ensure, translate

2. **Role Context & Industry Analysis**:
   - **Seniority Level**: Determine leadership level and scope of responsibility
   - **Industry Requirements**: 24/7 operations, compliance, security, banking regulations
   - **Team Dynamics**: Cross-functional collaboration, stakeholder management requirements
   - **Technical Focus**: Infrastructure, development, architecture, operations balance

### PHASE 2: Intelligent Template Construction

3. **Professional Summary Creation**:
   - **Role-Specific Opening**: Use exact job title and industry context
   - **Keyword Integration**: Naturally incorporate 4-5 primary keywords (ALM, LCM, roadmap, etc.)
   - **Leadership Positioning**: Address team management and strategic responsibilities
   - **Industry Expertise**: Include domain knowledge and compliance awareness
   - **Value Proposition**: Connect skills to business outcomes and impact

4. **Strategic Skills Section Design**:
   - **Primary Technical Skills**: Lead with job-critical terms (ALM, LCM, technical roadmap)
   - **Leadership & Management**: Include decision-making, risk assessment, team development
   - **Industry Knowledge**: Banking/finance, compliance, regulatory frameworks, security
   - **Methodologies**: Agile, DevOps, continuous improvement, knowledge sharing
   - **Soft Skills**: Change management, stakeholder communication, strategic thinking

5. **Experience Template Creation**:
   - ⚠️ **COMPANY NAME RULES**: Use GENERIC company names (NOT the target company from job description) - e.g., "FinTech Solutions Inc", "Digital Systems Corp", "Enterprise Tech Ltd"
   - **Role Progression**: Design 2-3 roles showing growth toward target position
   - **Keyword Rich Descriptions**: Integrate ALL identified keywords naturally
   - **Leadership Examples**: Include team management, strategic planning, decision-making
   - **Technical Achievements**: Projects involving ALM, LCM, modernization, technical debt
   - **Quantified Impact**: Include realistic metrics for team size, budget, system performance
   - **Industry Context**: Frame in banking/compliance/security terminology

### PHASE 3: Template Optimization & Quality Assurance

6. **Advanced Template Standards**:
   - **ATS Optimization**: 2-3% keyword density, proper formatting, standard headers
   - **Industry Alignment**: Use exact terminology and phrases from job description
   - **Professional Credibility**: Realistic achievements that match the role level
   - **Immediate Usability**: Clear structure that can be easily customized
   - **Comprehensive Coverage**: Address all major job requirements and competencies

### Enhancement Summary for Template Creation:
When creating from scratch, your enhancementSummary should include:
- originalGaps: ["No existing resume to analyze"]
- addedElements: [list everything you created - skills, achievements, sections]
- rewrittenSections: [all sections you created]
- keywordChanges: {added: [all job-relevant keywords included]}
- experienceEnhancements: [description of the experience template you created]
- overallTransformation: "Professional resume template created from job description requirements"`}

## CRITICAL KEYWORD EXTRACTION EXAMPLES:

For a job description mentioning "technical roadmap," "ALM," "LCM," "create urgency," "weigh risks," ensure you capture:
- **Exact Technical Terms**: ALM (Application Lifecycle Management), LCM (Lifecycle Management), technical roadmap, technical debt, technical resilience, technical modernization
- **Leadership Phrases**: "create urgency," "weigh risks," "make well-considered, impactful decisions," "switch between strategy and operations"
- **Communication Skills**: "communicate complex matters clearly," "collaborate with Business Lead and Architect"
- **Industry Context**: banking services, 24/7 availability, security, compliance with policies/frameworks/standards
- **Process Terms**: backlog management, continuous improvement, knowledge sharing, standardization and reuse
- **Action Verbs**: define, monitor, collaborate, stimulate, ensure, translate, identify opportunities

🚨 CRITICAL RULES SUMMARY - READ BEFORE GENERATING 🚨

When enhancing an EXISTING resume, you MUST follow these non-negotiable rules:

1. **PRESERVE ALL FACTUAL DATA**:
   - Name, email, phone, address - NEVER change personal information
   - Company names - Keep EXACTLY as provided (e.g., "Bengaluru Metro", "Tata BigBasket", "Kempegowda International Airport")
   - Job titles - Keep EXACTLY as provided (e.g., "Station Assistant", "Warehouse Associate", "Airport Operations Assistant")
   - Dates - Keep EXACTLY as provided (start dates, end dates, duration)
   - Education institutions - Keep EXACTLY as provided
   - Number of positions - Don't add or remove experience entries

2. **NEVER MIX JOB DESCRIPTION COMPANY WITH RESUME**:
   - The job description is from a company the candidate is APPLYING TO
   - The candidate does NOT work there yet - they are a job seeker
   - NEVER use the target company's name as an employer
   - Example: If JD is from "PayPal", DO NOT write "Software Engineer at PayPal" in experience

3. **ONLY ENHANCE DESCRIPTIONS**:
   - You can ONLY modify: job descriptions, achievements, summary, skills ordering
   - Rewrite descriptions to align with job requirements and keywords
   - Add quantified achievements within existing roles
   - Frame existing experience in terms relevant to target job

4. **VERIFICATION CHECKLIST**:
   Before returning the enhanced resume, verify:
   ✓ All company names match original resume exactly
   ✓ All job titles match original resume exactly
   ✓ All dates match original resume exactly
   ✓ All education institutions match original resume exactly
   ✓ No target company name appears as an employer
   ✓ Number of experience entries matches original
   ✓ Only descriptions and summaries were enhanced

## OUTPUT REQUIREMENTS:
- Return a complete resume JSON object with the same structure as required
- Include a detailed "enhancementSummary" object that tracks all changes made
- Ensure ALL identified keywords are naturally integrated throughout the resume
- Make every section directly address the job requirements with specific terminology
- Demonstrate deep understanding of both technical and leadership requirements
- Show clear alignment with industry context and compliance needs

## Response Schema to Follow:
{
  "enhancedResume": { /* resume object */ },
  "enhancementSummary": {
    "originalGaps": ["array of what was missing or weak in original resume"],
    "addedElements": ["array of what was added or created to match job"],
    "rewrittenSections": ["array of sections that were completely rewritten"],
    "keywordChanges": {
      "added": ["keywords integrated that weren't in original"],
      "emphasized": ["existing keywords that were emphasized more"]
    },
    "experienceEnhancements": [
      {
        "originalRole": "string",
        "enhancedRole": "string", 
        "changesExplained": "string",
        "addedAchievements": ["array of new achievements created"]
      }
    ],
    "overallTransformation": "string explaining the major changes made"
  }
}

## Resume Schema to Follow:
{
  "name": "string",
  "jobTitle": "string (should reflect target role or related title)",
  "email": "string",
  "phone": "string", 
  "address": "string",
  "linkedin": "string",
  "portfolio": "string",
  "photo": "string",
  "summary": "string (3-4 lines highlighting relevant experience for this role)",
  "experience": [
    {
      "jobTitle": "string",
      "company": "string", 
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string (enhanced bullet points emphasizing relevant achievements)"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string", 
      "startDate": "string",
      "endDate": "string",
      "gpa": "string"
    }
  ],
  "skills": ["array of strings - prioritize job-relevant skills"],
  "certifications": [
    {
      "name": "string",
      "issuer": "string", 
      "date": "string"
    }
  ],
  "languages": [
    {
      "language": "string",
      "proficiency": "string"
    }
  ],
  "customSections": [
    {
      "type": "string",
      "title": "string",
      "description": "string",
      "date": "string",
      "name": "string",
      "email": "string", 
      "phone": "string"
    }
  ]
}

Return ONLY the JSON object with both enhancedResume and enhancementSummary, no additional text or explanations.`;

    console.log("Calling Gemini API with enhancement prompt");

    // Use Gemini with fallback to enhance the resume
    const result = await generateWithFallback(prompt, {
      maxOutputTokens: 8192,
      temperature: 0.3, // Lower temperature for more consistent results
    });

    let enhancedResumeText = result.text;
    console.log(`Gemini response received (using ${result.model})`);

    // Clean and parse the response
    enhancedResumeText = enhancedResumeText.trim();
    
    // Remove code block markers if present
    if (enhancedResumeText.startsWith("```json")) {
      enhancedResumeText = enhancedResumeText.substring(7);
    } else if (enhancedResumeText.startsWith("```")) {
      enhancedResumeText = enhancedResumeText.substring(3);
    }
    
    if (enhancedResumeText.endsWith("```")) {
      enhancedResumeText = enhancedResumeText.substring(0, enhancedResumeText.length - 3);
    }

    enhancedResumeText = enhancedResumeText.trim();

    // Parse the enhanced resume response
    let responseData;
    try {
      responseData = JSON.parse(enhancedResumeText);
    } catch (parseError) {
      console.error("Failed to parse enhanced resume JSON:", parseError);
      console.error("Raw response:", enhancedResumeText);
      throw new Error("Failed to parse enhanced resume response");
    }

    // Extract enhanced resume and summary from response
    let enhancedResume, enhancementSummary;
    
    // Handle both old format (direct resume) and new format (with enhancementSummary)
    if (responseData.enhancedResume) {
      enhancedResume = responseData.enhancedResume;
      enhancementSummary = responseData.enhancementSummary || {};
    } else {
      // Fallback for old format
      enhancedResume = responseData;
      enhancementSummary = {
        originalGaps: [],
        addedElements: [],
        rewrittenSections: [],
        keywordChanges: { added: [], emphasized: [] },
        experienceEnhancements: [],
        overallTransformation: "Resume enhanced for job alignment"
      };
    }

    // ⚠️ CRITICAL VALIDATION: Preserve original resume factual data
    if (resumeData) {
      console.log("🔒 VALIDATING: Preserving original resume factual data...");
      
      // PRESERVE PERSONAL INFORMATION (never change these)
      enhancedResume.name = resumeData.name || enhancedResume.name;
      enhancedResume.email = resumeData.email || enhancedResume.email;
      enhancedResume.phone = resumeData.phone || enhancedResume.phone;
      enhancedResume.address = resumeData.address || enhancedResume.address;
      enhancedResume.linkedin = resumeData.linkedin || enhancedResume.linkedin;
      enhancedResume.portfolio = resumeData.portfolio || enhancedResume.portfolio;
      enhancedResume.photo = resumeData.photo || enhancedResume.photo;
      
      console.log("✓ Personal information preserved:", {
        name: enhancedResume.name,
        email: enhancedResume.email
      });
      
      // PRESERVE COMPANY NAMES AND JOB TITLES from original experience
      if (resumeData.experience && Array.isArray(resumeData.experience)) {
        const originalCompanies = resumeData.experience.map(exp => ({
          company: exp.company,
          jobTitle: exp.jobTitle || exp.position || exp.title,
          startDate: exp.startDate,
          endDate: exp.endDate
        }));
        
        console.log("📋 Original companies to preserve:", originalCompanies.map(c => c.company));
        
        // Ensure enhanced experience preserves original companies and dates
        if (enhancedResume.experience && Array.isArray(enhancedResume.experience)) {
          enhancedResume.experience = enhancedResume.experience.map((enhancedExp, index) => {
            const originalExp = resumeData.experience[index];
            
            if (originalExp) {
              // FORCE preservation of factual data
              return {
                ...enhancedExp,
                company: originalExp.company, // NEVER change company name
                jobTitle: originalExp.jobTitle || originalExp.position || originalExp.title || enhancedExp.jobTitle,
                location: originalExp.location || enhancedExp.location,
                startDate: originalExp.startDate, // NEVER change dates
                endDate: originalExp.endDate, // NEVER change dates
                // Only allow AI to enhance the description
                description: enhancedExp.description
              };
            }
            
            return enhancedExp;
          });
          
          // Remove any extra experience entries that weren't in the original
          if (enhancedResume.experience.length > resumeData.experience.length) {
            console.warn("⚠️ AI added extra experience entries. Removing unauthorized entries...");
            enhancedResume.experience = enhancedResume.experience.slice(0, resumeData.experience.length);
          }
          
          console.log("✓ Experience companies preserved:", 
            enhancedResume.experience.map(exp => exp.company));
        }
      }
      
      // PRESERVE EDUCATION INSTITUTIONS
      if (resumeData.education && Array.isArray(resumeData.education)) {
        console.log("🎓 Original education institutions:", 
          resumeData.education.map(edu => edu.institution));
        
        if (enhancedResume.education && Array.isArray(enhancedResume.education)) {
          enhancedResume.education = enhancedResume.education.map((enhancedEdu, index) => {
            const originalEdu = resumeData.education[index];
            
            if (originalEdu) {
              return {
                ...enhancedEdu,
                institution: originalEdu.institution, // NEVER change institution
                degree: originalEdu.degree || enhancedEdu.degree,
                field: originalEdu.field || enhancedEdu.field,
                startDate: originalEdu.startDate, // NEVER change dates
                endDate: originalEdu.endDate, // NEVER change dates
                gpa: originalEdu.gpa || enhancedEdu.gpa
              };
            }
            
            return enhancedEdu;
          });
          
          // Remove extra education entries
          if (enhancedResume.education.length > resumeData.education.length) {
            console.warn("⚠️ AI added extra education entries. Removing...");
            enhancedResume.education = enhancedResume.education.slice(0, resumeData.education.length);
          }
          
          console.log("✓ Education institutions preserved:", 
            enhancedResume.education.map(edu => edu.institution));
        }
      }
      
      // PRESERVE CERTIFICATIONS
      if (resumeData.certifications && Array.isArray(resumeData.certifications)) {
        enhancedResume.certifications = resumeData.certifications;
        console.log("✓ Certifications preserved:", enhancedResume.certifications.length);
      }
      
      // PRESERVE LANGUAGES
      if (resumeData.languages && Array.isArray(resumeData.languages)) {
        enhancedResume.languages = resumeData.languages;
        console.log("✓ Languages preserved:", enhancedResume.languages.length);
      }
      
      console.log("🔒 VALIDATION COMPLETE: All factual data preserved");
    }

    // Validate the enhanced resume has required fields
    if (!enhancedResume.name && !enhancedResume.summary) {
      throw new Error("Enhanced resume missing required fields");
    }

    // Set defaults for missing contact info when creating from scratch
    if (!resumeData) {
      enhancedResume.name = enhancedResume.name || "Your Name";
      enhancedResume.email = enhancedResume.email || "your.email@example.com";
      enhancedResume.phone = enhancedResume.phone || "Your Phone Number";
      enhancedResume.address = enhancedResume.address || "Your Location";
    }

    // Ensure arrays exist
    enhancedResume.experience = enhancedResume.experience || [];
    enhancedResume.education = enhancedResume.education || [];
    enhancedResume.skills = enhancedResume.skills || [];
    enhancedResume.certifications = enhancedResume.certifications || [];
    enhancedResume.languages = enhancedResume.languages || [];
    enhancedResume.customSections = enhancedResume.customSections || [];

    // Normalize experience descriptions from arrays to strings for system compatibility
    if (Array.isArray(enhancedResume.experience)) {
      enhancedResume.experience = enhancedResume.experience.map(exp => {
        if (Array.isArray(exp.description)) {
          // Convert array of bullet points to a single string with newline separators
          // This format is compatible with existing renderDescriptionBullets functions
          exp.description = exp.description.map(bullet => `• ${bullet.trim()}`).join('\n');
        }
        return exp;
      });
    }

    console.log("Successfully enhanced resume");

    // Don't cache results for job-description-resume-builder (forceNoCache is true)
    if (!forceNoCache) {
      try {
        await cacheRef.set({
          enhancedResume,
          enhancementSummary,
          timestamp: new Date(),
          userId,
          jobDescriptionLength: jobDescription.length
        });
        console.log("Cached enhanced resume result");
      } catch (cacheError) {
        console.warn("Failed to cache result:", cacheError);
        // Don't fail the request if caching fails
      }
    } else {
      console.log("NOT CACHING - job-description-resume-builder request");
    }

    // Track usage for authenticated users
    if (userId && userId !== 'anonymous') {
      try {
        const userRef = adminDb.collection("users").doc(userId);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const currentCount = userData.jobDescriptionEnhancements || 0;
          
          await userRef.update({
            jobDescriptionEnhancements: currentCount + 1,
            lastJobDescriptionEnhancement: new Date()
          });
          
          console.log(`Updated enhancement count for user ${userId}: ${currentCount + 1}`);
        }
      } catch (userUpdateError) {
        console.warn("Failed to update user enhancement count:", userUpdateError);
        // Don't fail the request if user tracking fails
      }
    }

    return NextResponse.json({ 
      enhancedResume,
      enhancementSummary,
      model: result.model,
      cached: false,
      noCache: forceNoCache,
      requestId: requestId || null
    }, { status: 200 });

  } catch (error) {
    console.error("Resume enhancement error:", error);
    
    // Return appropriate error response
    const errorMessage = error.message || "Failed to enhance resume";
    const statusCode = error.message?.includes("configuration") ? 500 : 400;
    
    return NextResponse.json({
      error: "Failed to enhance resume",
      details: errorMessage,
      suggestion: "Please check your job description and try again. If the problem persists, contact support."
    }, { status: statusCode });
  }
} 