export function normalizeResumeData(data) {
  // Handle nested profile structure (legacy data format)
  // If data has a 'profile' object, flatten it to root level
  if (data?.profile && typeof data.profile === 'object') {
    const { profile, ...rest } = data;
    data = {
      ...profile,
      ...rest,
      // Ensure photo from profile or root level is preserved
      photo: profile.photo || rest.photo || data.photo || ""
    };
  }

  // Handle one-pager personal info structure
  // One-pager stores data in a nested 'personal' object
  if (data?.personal && typeof data.personal === 'object') {
    const { personal, ...rest } = data;

    // Flatten personal info to root level
    data = {
      ...rest,
      name: personal.name || data.name || "",
      jobTitle: personal.jobTitle || data.jobTitle || "",
      email: personal.email || data.email || "",
      phone: personal.phone || data.phone || "",
      // Map 'location' to 'address' for ResumeForm compatibility
      address: personal.location || personal.address || data.address || "",
      linkedin: personal.linkedin || data.linkedin || "",
      portfolio: personal.portfolio || data.portfolio || "",
      // IMPORTANT: Preserve photo field
      photo: personal.photo || data.photo || "",
    };
  }

  // Normalize experience entries (handle legacy field names)
  let experience = Array.isArray(data?.experience) ? data.experience : [];
  experience = experience.map(exp => {
    const normalized = { ...exp };
    // Map legacy field names to current schema
    if (!normalized.jobTitle) {
      normalized.jobTitle = exp.position || exp.title || exp.role || "";
    }
    if (!normalized.company) {
      normalized.company = exp.organization || exp.employer || "";
    }
    return normalized;
  });

  return {
    ...data,
    skills: Array.isArray(data?.skills) ? data.skills : [],
    certifications: Array.isArray(data?.certifications) ? data.certifications : [],
    languages: Array.isArray(data?.languages) ? data.languages : [],
    experience: experience,
    education: Array.isArray(data?.education) ? data.education : [],
    customSections: Array.isArray(data?.customSections) ? data.customSections : [],
    // Preserve photo field (don't override if it exists)
    photo: data.photo || "",
  };
}

export function rankResume(data, jobDescription = "") {
  // ⚠️ WARNING: This is a hardcoded scoring system that may cause inconsistencies
  console.warn('⚠️ Using hardcoded rankResume function - should migrate to AI-based scoring for consistency');

  // Defensive normalization to prevent TypeErrors
  data = normalizeResumeData(data);
  let score = 0;
  const maxScore = 100;

  // Define all available fields
  const allFields = {
    personal: ["name", "email", "phone", "address", "linkedin", "portfolio", "photo"],
    summary: ["summary"],
    experience: ["jobTitle", "company", "location", "startDate", "endDate", "description"],
    education: ["institution", "degree", "field", "startDate", "endDate", "gpa"],
    skills: ["name", "proficiency"],
    certifications: ["name", "issuer", "date"],
    languages: ["language", "proficiency"],
    references: ["name", "company", "email", "phone"],
  };

  // Helper: Extract text for analysis
  const text = JSON.stringify(data || {}).toLowerCase();
  const jobDescText = (jobDescription || '').toLowerCase();

  // ATS scoring criteria and weights (matching the new framework)
  const ATS_CRITERIA = {
    keywords: { weight: 0.25, maxScore: 100 },
    formatting: { weight: 0.20, maxScore: 100 },
    structure: { weight: 0.20, maxScore: 100 },
    content: { weight: 0.20, maxScore: 100 },
    compatibility: { weight: 0.15, maxScore: 100 }
  };

  // Industry keywords for better keyword analysis
  const INDUSTRY_KEYWORDS = {
    technology: [
      "JavaScript", "Python", "React", "Node.js", "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "Git",
      "REST API", "Microservices", "DevOps", "CI/CD", "Agile", "Scrum", "Machine Learning", "AI", "Data Science"
    ],
    marketing: [
      "Digital Marketing", "SEO", "SEM", "Google Analytics", "Facebook Ads", "Content Marketing", "Email Marketing",
      "Social Media", "Brand Management", "Campaign Management", "ROI", "Conversion Rate", "Lead Generation"
    ],
    finance: [
      "Financial Analysis", "Excel", "VBA", "Bloomberg", "Risk Management", "Portfolio Management", "Accounting",
      "Financial Modeling", "Valuation", "M&A", "Investment Banking", "CFA", "CPA", "GAAP", "IFRS"
    ],
    healthcare: [
      "Patient Care", "Clinical", "HIPAA", "Electronic Health Records", "Medical Terminology", "Nursing",
      "Pharmaceutical", "FDA", "Clinical Trials", "Healthcare Administration", "Medical Billing", "ICD-10"
    ],
    sales: [
      "Sales Management", "CRM", "Salesforce", "Lead Generation", "Pipeline Management", "Revenue Growth",
      "Account Management", "Business Development", "Client Relations", "Sales Strategy", "KPI", "Quota"
    ]
  };

  // 1. KEYWORD ANALYSIS (25% weight)
  const keywordAnalysis = analyzeKeywords(data, jobDescText, INDUSTRY_KEYWORDS);
  const keywordScore = keywordAnalysis.score;

  // 2. FORMATTING ANALYSIS (20% weight)
  const formattingAnalysis = analyzeFormatting(data);
  const formattingScore = formattingAnalysis.score;

  // 3. STRUCTURE ANALYSIS (20% weight)
  const structureAnalysis = analyzeStructure(data);
  const structureScore = structureAnalysis.score;

  // 4. CONTENT ANALYSIS (20% weight)
  const contentAnalysis = analyzeContent(data);
  const contentScore = contentAnalysis.score;

  // 5. COMPATIBILITY ANALYSIS (15% weight)
  const compatibilityAnalysis = analyzeCompatibility(data, jobDescText);
  const compatibilityScore = compatibilityAnalysis.score;

  // Calculate overall score using weighted criteria
  score = Math.round(
    (keywordScore * ATS_CRITERIA.keywords.weight) +
    (formattingScore * ATS_CRITERIA.formatting.weight) +
    (structureScore * ATS_CRITERIA.structure.weight) +
    (contentScore * ATS_CRITERIA.content.weight) +
    (compatibilityScore * ATS_CRITERIA.compatibility.weight)
  );

  // Cap the score
  score = Math.min(score, maxScore);

  // Generate detailed tips based on analysis
  const tips = generatePersonalizedTips(data, keywordAnalysis, formattingAnalysis, structureAnalysis, contentAnalysis, compatibilityAnalysis);

  // Tier and ranking
  let tier = "";
  let ranking = "";
  if (score >= 90) {
    tier = "Excellent";
    ranking = "Top 5% of resumes";
  } else if (score >= 80) {
    tier = "Good";
    ranking = "Top 15% of resumes";
  } else if (score >= 70) {
    tier = "Fair";
    ranking = "Top 30% of resumes";
  } else if (score >= 50) {
    tier = "Needs Work";
    ranking = "Top 50% of resumes";
  } else {
    tier = "Poor";
    ranking = "Bottom 25% of resumes";
  }

  return {
    score,
    tier,
    ranking,
    breakdown: {
      keywords: {
        score: Math.round(keywordScore),
        max: 100,
        feedback: keywordAnalysis.feedback,
        foundKeywords: keywordAnalysis.foundKeywords,
        missingKeywords: keywordAnalysis.missingKeywords,
        industry: keywordAnalysis.industry
      },
      formatting: {
        score: Math.round(formattingScore),
        max: 100,
        feedback: formattingAnalysis.feedback,
        issues: formattingAnalysis.issues
      },
      structure: {
        score: Math.round(structureScore),
        max: 100,
        feedback: structureAnalysis.feedback,
        issues: structureAnalysis.issues
      },
      content: {
        score: Math.round(contentScore),
        max: 100,
        feedback: contentAnalysis.feedback,
        issues: contentAnalysis.issues
      },
      compatibility: {
        score: Math.round(compatibilityScore),
        max: 100,
        feedback: compatibilityAnalysis.feedback,
        issues: compatibilityAnalysis.issues
      }
    },
    tips: tips,
    industry: keywordAnalysis.industry,
    keywordAnalysis: keywordAnalysis
  };
}

// Helper functions for detailed analysis
function analyzeKeywords(data, jobDescText, industryKeywords) {
  const analysis = {
    score: 0,
    foundKeywords: [],
    missingKeywords: [],
    industry: 'general',
    feedback: '',
    keywordDensity: {}
  };

  // Detect industry based on content
  const text = JSON.stringify(data || {}).toLowerCase();
  const jobTitles = Array.isArray(data?.experience) ? data.experience.map(exp => exp.jobTitle?.toLowerCase()).filter(Boolean) : [];
  const skills = Array.isArray(data?.skills) ? data.skills.map(skill => skill.name?.toLowerCase()).filter(Boolean) : [];

  // Industry detection logic
  const techKeywords = ['developer', 'engineer', 'programmer', 'software', 'coding', 'javascript', 'python', 'react'];
  const marketingKeywords = ['marketing', 'seo', 'sem', 'analytics', 'campaign', 'brand', 'social media'];
  const financeKeywords = ['finance', 'accounting', 'financial', 'investment', 'banking', 'cfa', 'cpa'];
  const healthcareKeywords = ['healthcare', 'medical', 'nursing', 'patient', 'clinical', 'pharmaceutical'];
  const salesKeywords = ['sales', 'account', 'business development', 'crm', 'pipeline', 'revenue'];

  const industryScores = {
    technology: 0,
    marketing: 0,
    finance: 0,
    healthcare: 0,
    sales: 0
  };

  // Score based on job titles and skills
  [...jobTitles, ...skills].forEach(item => {
    techKeywords.forEach(keyword => { if (item.includes(keyword)) industryScores.technology += 3; });
    marketingKeywords.forEach(keyword => { if (item.includes(keyword)) industryScores.marketing += 3; });
    financeKeywords.forEach(keyword => { if (item.includes(keyword)) industryScores.finance += 3; });
    healthcareKeywords.forEach(keyword => { if (item.includes(keyword)) industryScores.healthcare += 3; });
    salesKeywords.forEach(keyword => { if (item.includes(keyword)) industryScores.sales += 3; });
  });

  // Get detected industry
  analysis.industry = Object.entries(industryScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  // Get relevant keywords for detected industry
  const relevantKeywords = industryKeywords[analysis.industry] || [];

  // Analyze keyword presence
  const foundKeywords = [];
  const missingKeywords = [];

  relevantKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    if (text.includes(keywordLower)) {
      foundKeywords.push(keyword);
      // Calculate keyword density
      const regex = new RegExp(keywordLower, 'gi');
      const matches = text.match(regex);
      analysis.keywordDensity[keyword] = matches ? matches.length : 0;
    } else {
      missingKeywords.push(keyword);
    }
  });

  analysis.foundKeywords = foundKeywords;
  analysis.missingKeywords = missingKeywords;

  // Calculate keyword score
  const keywordScore = Math.min(100, (foundKeywords.length / Math.max(relevantKeywords.length, 1)) * 100);

  // Bonus for job description alignment
  let alignmentBonus = 0;
  if (jobDescText) {
    const jobKeywords = jobDescText.split(/\s+/).filter(word => word.length > 3);
    const jobKeywordMatches = jobKeywords.filter(keyword => text.includes(keyword.toLowerCase())).length;
    alignmentBonus = Math.min(20, (jobKeywordMatches / Math.max(jobKeywords.length, 1)) * 20);
  }

  analysis.score = Math.round(keywordScore + alignmentBonus);

  // Generate feedback
  if (analysis.score >= 80) {
    analysis.feedback = `Excellent keyword optimization for ${analysis.industry} industry!`;
  } else if (analysis.score >= 60) {
    analysis.feedback = `Good keyword usage. Consider adding more ${analysis.industry} industry terms.`;
  } else {
    analysis.feedback = `Add more ${analysis.industry} keywords to improve ATS matching.`;
  }

  return analysis;
}

function analyzeFormatting(data) {
  const analysis = {
    score: 100,
    issues: [],
    feedback: ''
  };

  // Check for essential formatting elements
  const hasSkills = Array.isArray(data.skills) && data.skills.length >= 5;
  const hasCertifications = Array.isArray(data.certifications) && data.certifications.length > 0;
  const hasClearSections = ["experience", "education", "skills"].every(
    (section) => Array.isArray(data[section]) && data[section].length > 0
  );
  const hasContactInfo = ["name", "email", "phone"].every((field) => data[field]?.trim());

  // Deduct points for missing elements
  if (!hasSkills) {
    analysis.score -= 20;
    analysis.issues.push("Insufficient skills listed (need at least 5)");
  }
  if (!hasCertifications) {
    analysis.score -= 10;
    analysis.issues.push("No certifications found");
  }
  if (!hasClearSections) {
    analysis.score -= 15;
    analysis.issues.push("Missing essential sections");
  }
  if (!hasContactInfo) {
    analysis.score -= 15;
    analysis.issues.push("Incomplete contact information");
  }

  // Check for proper formatting
  const text = JSON.stringify(data);
  const hasSpecialChars = /[^\w\s\-\.\,\;\:\!\?\(\)\[\]\{\}\/\+\=\&\@\#\$\%\*]/.test(text);
  if (hasSpecialChars) {
    analysis.score -= 10;
    analysis.issues.push("Special characters detected that may confuse ATS");
  }

  analysis.score = Math.max(0, analysis.score);

  // Generate feedback
  if (analysis.score >= 80) {
    analysis.feedback = "Excellent ATS-friendly formatting!";
  } else if (analysis.score >= 60) {
    analysis.feedback = "Good formatting with room for improvement.";
  } else {
    analysis.feedback = "Formatting needs significant improvement for ATS compatibility.";
  }

  return analysis;
}

function analyzeStructure(data) {
  const analysis = {
    score: 100,
    issues: [],
    feedback: ''
  };

  // Check core section completeness
  const coreSections = ["name", "email", "experience", "education"];
  const filledCoreSections = coreSections.filter((field) => {
    if (field === "experience" || field === "education") {
      return data[field] && data[field].length > 0;
    }
    return data[field] && data[field].trim().length > 0;
  });

  const completenessScore = (filledCoreSections.length / coreSections.length) * 100;
  analysis.score = Math.round(completenessScore);

  // Check for structural issues
  if (!data.experience || data.experience.length === 0) {
    analysis.issues.push("No work experience found");
  }
  if (!data.education || data.education.length === 0) {
    analysis.issues.push("No education information found");
  }
  if (!data.summary || data.summary.trim().length < 50) {
    analysis.issues.push("Summary is too brief or missing");
  }

  // Generate feedback
  if (analysis.score >= 80) {
    analysis.feedback = "Strong resume structure with all essential sections!";
  } else if (analysis.score >= 60) {
    analysis.feedback = "Good structure, but some sections need completion.";
  } else {
    analysis.feedback = "Resume structure needs significant improvement.";
  }

  return analysis;
}

function analyzeContent(data) {
  const analysis = {
    score: 0,
    issues: [],
    feedback: ''
  };

  const text = JSON.stringify(data);
  const totalWordCount = text.split(/\s+/).filter(Boolean).length;

  // Content depth scoring
  if (totalWordCount >= 400) {
    analysis.score += 40;
  } else if (totalWordCount >= 250) {
    analysis.score += 30;
  } else if (totalWordCount >= 150) {
    analysis.score += 20;
  } else {
    analysis.score += 10;
  }

  // Check for quantifiable achievements
  const hasAchievements = data.experience?.some((exp) => {
    // Handle both string and array descriptions
    let description = exp.description;
    if (Array.isArray(description)) {
      description = description.join(' ');
    }
    return description?.match(/\b(increased|reduced|improved|saved|generated|managed|led|delivered)\b.*(\d+%|\$\d+|\d+ people|\d+ team)/i);
  });
  if (hasAchievements) {
    analysis.score += 30;
  } else {
    analysis.issues.push("No quantifiable achievements found");
  }

  // Check for action verbs
  const actionVerbs = ['spearheaded', 'optimized', 'delivered', 'enhanced', 'streamlined', 'accelerated', 'implemented', 'managed', 'developed', 'executed'];
  const hasActionVerbs = actionVerbs.some(verb => text.toLowerCase().includes(verb));
  if (hasActionVerbs) {
    analysis.score += 20;
  } else {
    analysis.issues.push("Limited use of strong action verbs");
  }

  // Check for professional language
  const professionalTerms = ['collaborated', 'strategic', 'initiative', 'optimization', 'efficiency', 'results', 'performance'];
  const hasProfessionalLanguage = professionalTerms.some(term => text.toLowerCase().includes(term));
  if (hasProfessionalLanguage) {
    analysis.score += 10;
  } else {
    analysis.issues.push("Could use more professional terminology");
  }

  analysis.score = Math.min(100, analysis.score);

  // Generate feedback
  if (analysis.score >= 80) {
    analysis.feedback = "Excellent content with strong achievements and professional language!";
  } else if (analysis.score >= 60) {
    analysis.feedback = "Good content with room for improvement in achievements and language.";
  } else {
    analysis.feedback = "Content needs significant enhancement for better impact.";
  }

  return analysis;
}

function analyzeCompatibility(data, jobDescText) {
  const analysis = {
    score: 100,
    issues: [],
    feedback: ''
  };

  // Check for ATS compatibility issues
  const text = JSON.stringify(data);

  // Check for excessive formatting
  const hasExcessiveFormatting = /(\*\*.*?\*\*|__.*?__)/g.test(text);
  if (hasExcessiveFormatting) {
    analysis.score -= 20;
    analysis.issues.push("Excessive formatting detected");
  }

  // Check for tables or complex layouts
  const hasTables = /\|.*\|/g.test(text);
  if (hasTables) {
    analysis.score -= 25;
    analysis.issues.push("Table formatting detected - convert to bullet points");
  }

  // Check for images or graphics
  const hasImages = /\.(jpg|jpeg|png|gif|svg)/i.test(text);
  if (hasImages) {
    analysis.score -= 15;
    analysis.issues.push("Images detected - ATS systems may not parse them");
  }

  // Check for job description alignment
  if (jobDescText) {
    const resumeWords = new Set(text.toLowerCase().split(/\s+/).filter(Boolean));
    const jdWords = new Set(jobDescText.toLowerCase().split(/\s+/).filter(Boolean));
    const commonWords = [...resumeWords].filter((word) => jdWords.has(word));
    const overlapRatio = commonWords.length / Math.min(resumeWords.size, jdWords.size);

    if (overlapRatio < 0.1) {
      analysis.score -= 20;
      analysis.issues.push("Low alignment with job description");
    } else if (overlapRatio >= 0.2) {
      analysis.score += 10; // Bonus for good alignment
    }
  }

  analysis.score = Math.max(0, analysis.score);

  // Generate feedback
  if (analysis.score >= 80) {
    analysis.feedback = "Excellent ATS compatibility!";
  } else if (analysis.score >= 60) {
    analysis.feedback = "Good compatibility with minor issues.";
  } else {
    analysis.feedback = "Significant ATS compatibility issues need addressing.";
  }

  return analysis;
}

function generatePersonalizedTips(data, keywordAnalysis, formattingAnalysis, structureAnalysis, contentAnalysis, compatibilityAnalysis) {
  const tips = [];

  // Keyword tips
  if (keywordAnalysis.score < 70) {
    if (keywordAnalysis.missingKeywords.length > 0) {
      tips.push(`Add ${keywordAnalysis.industry} keywords: ${keywordAnalysis.missingKeywords.slice(0, 3).join(', ')}`);
    }
    tips.push(`Incorporate more industry-specific terminology for ${keywordAnalysis.industry} roles`);
  }

  // Formatting tips
  if (formattingAnalysis.score < 70) {
    if (!data.skills || data.skills.length < 5) {
      tips.push("Add at least 5 relevant skills to improve ATS matching");
    }
    if (!data.certifications || data.certifications.length === 0) {
      tips.push("Include relevant certifications to enhance credibility");
    }
  }

  // Structure tips
  if (structureAnalysis.score < 70) {
    if (!data.experience || data.experience.length === 0) {
      tips.push("Add work experience to strengthen your resume");
    }
    if (!data.summary || data.summary.trim().length < 50) {
      tips.push("Expand your summary to 50+ words for better impact");
    }
  }

  // Content tips
  if (contentAnalysis.score < 70) {
    tips.push("Add quantifiable achievements (e.g., 'Increased sales by 20%')");
    tips.push("Use strong action verbs like 'spearheaded', 'optimized', 'delivered'");
  }

  // Compatibility tips
  if (compatibilityAnalysis.score < 70) {
    if (compatibilityAnalysis.issues.some(issue => issue.includes('formatting'))) {
      tips.push("Use simple, clean formatting for better ATS compatibility");
    }
    if (compatibilityAnalysis.issues.some(issue => issue.includes('table'))) {
      tips.push("Convert tables to bullet points for ATS-friendly format");
    }
  }

  // Limit to 5 most important tips
  return tips.slice(0, 5);
}

export function cleanText(text) {
  return typeof text === "string" ? text.trim() : "";
}

// Helper to parse all resume date formats robustly
export function parseResumeDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && dateStr.trim().toLowerCase() === 'present') return 'Present';
  // yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  // yyyy-MM
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [y, m] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, 1);
  }
  // yyyy
  if (/^\d{4}$/.test(dateStr)) {
    return new Date(Number(dateStr), 0, 1);
  }
  // yyyyMMdd
  if (/^\d{8}$/.test(dateStr)) {
    return new Date(Number(dateStr.slice(0, 4)), Number(dateStr.slice(4, 6)) - 1, Number(dateStr.slice(6, 8)));
  }
  // yyyyMM
  if (/^\d{6}$/.test(dateStr)) {
    return new Date(Number(dateStr.slice(0, 4)), Number(dateStr.slice(4, 6)) - 1, 1);
  }
  // Try parsing with date-fns for common formats
  try {
    const { parse, isValid } = require('date-fns');
    const COMMON_FORMATS = [
      'yyyy-MM-dd', 'yyyy/MM/dd', 'dd/MM/yyyy', 'dd-MM-yyyy',
      'yyyy-MM', 'yyyy/MM', 'MMM yyyy', 'MMMM yyyy', 'yyyy',
      'MMM dd, yyyy', 'MMMM dd, yyyy', 'dd MMM yyyy'
    ];
    for (const fmt of COMMON_FORMATS) {
      const parsed = parse(dateStr, fmt, new Date());
      if (isValid(parsed)) return parsed;
    }
  } catch { }
  return null;
}

export function formatDate(date, preferences = {}) {
  if (!date) return '';
  if (typeof date === 'string' && date.trim().toLowerCase() === 'present') return 'Present';
  let dateObj = typeof date === 'string' ? parseResumeDate(date) : date;
  if (dateObj === 'Present') return 'Present';
  if (!dateObj || isNaN(dateObj.getTime())) {
    // fallback: show raw string if not parseable
    return typeof date === 'string' ? date : '';
  }
  // Determine format
  let fmt = 'MMM yyyy';
  if (preferences?.dateFormat?.format) fmt = preferences.dateFormat.format;
  // If year only
  if (dateObj.getDate() === 1 && dateObj.getMonth() === 0 && dateObj.getFullYear() && (!date.includes('-') || /^\d{4}$/.test(date))) {
    fmt = 'yyyy';
  }
  // If year and month only
  if (dateObj.getDate() === 1 && dateObj.getMonth() >= 0 && dateObj.getFullYear() && (/^\d{4}-\d{2}$/.test(date) || /^\d{6}$/.test(date))) {
    fmt = 'MMM yyyy';
  }
  // If full date
  if ((/^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{8}$/.test(date)) && dateObj.getDate() > 1) {
    fmt = 'dd MMM yyyy';
  }
  try {
    const { format } = require('date-fns');
    return format(dateObj, fmt);
  } catch {
    return typeof date === 'string' ? date : '';
  }
}

// Export getPersonalizedTips for use in ATSScoreCheckerClient
export function getPersonalizedTips(parsedData) {
  if (!parsedData) return [
    "We couldn't extract enough information from your resume. Please try uploading a clearer or more detailed file."
  ];
  const tips = [];
  // Example: Skills
  if (parsedData.skills?.length < 5) {
    tips.push("Add more relevant skills to your resume to increase your ATS match rate.");
  } else {
    tips.push(`Great! You have listed ${parsedData.skills.length} skills. Make sure they match the jobs you want.`);
  }
  // Example: Experience
  if (!parsedData.experience || parsedData.experience.length === 0) {
    tips.push("Add at least one work experience section to improve your resume's impact.");
  } else {
    const recentExp = parsedData.experience[0];
    if (recentExp) {
      // Handle both string and array descriptions
      let description = recentExp.description;
      if (Array.isArray(description)) {
        description = description.join(' ');
      }
      if (!description || description.length < 40) {
        tips.push("Expand on your most recent job's responsibilities and achievements for more impact.");
      }
    }
  }
  // Example: Education
  if (!parsedData.education || parsedData.education.length === 0) {
    tips.push("Include your education details to help recruiters understand your background.");
  }
  // Example: Contact info
  if (!parsedData.email) {
    tips.push("Add a professional email address to your resume header.");
  }
  // Example: Customization
  if (parsedData.summary && parsedData.summary.length < 40) {
    tips.push("Expand your summary/objective to highlight your unique value.");
  }
  // Fallback
  if (tips.length === 0) {
    tips.push("Your resume looks strong! Consider tailoring it for each job for best results.");
  }
  return tips;
}

// Utility to create a clean, complete resume data object from any input
export function createCleanResumeData(data = {}) {
  return {
    name: data.name || "",
    jobTitle: data.jobTitle || "",
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    linkedin: data.linkedin || "",
    portfolio: data.portfolio || "",
    photo: data.photo || "",
    summary: data.summary || "",
    experience: Array.isArray(data.experience) ? data.experience : [],
    education: Array.isArray(data.education) ? data.education : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    languages: Array.isArray(data.languages) ? data.languages : [],
    customSections: Array.isArray(data.customSections) ? data.customSections : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
  };
}

// Utility to clean resume data for Firebase (removes undefined values)
// Helper to check if photo should be saved to Firestore
const isFirebaseStorageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return (
    url.startsWith('https://storage.googleapis.com/') ||
    url.startsWith('https://firebasestorage.googleapis.com/')
  );
};

const isLargeBase64Image = (value) => {
  if (typeof value !== 'string') return false;
  // Firebase Storage URLs are fine - they're just URLs
  if (isFirebaseStorageUrl(value)) return false;
  // Only block base64 images
  if (!value.startsWith('data:image/')) return false;
  // Base64 images larger than 500KB can cause Firestore issues
  return value.length > 500000; // ~500KB
};

export function cleanResumeDataForFirebase(data) {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const cleanData = {};

  // Clean top-level fields
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      // Special handling for photo field
      if (key === 'photo') {
        // Allow Firebase Storage URLs (small, efficient)
        if (isFirebaseStorageUrl(value)) {
          cleanData[key] = value;
          return;
        }
        // Block large base64 images (>500KB)
        if (isLargeBase64Image(value)) {
          console.warn('⚠️ Skipping large base64 photo in Firestore save. Upload to Firebase Storage instead.');
          return; // Skip this field
        }
        // Allow small base64 or other URLs
        cleanData[key] = value;
        return;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively clean nested objects
        cleanData[key] = cleanResumeDataForFirebase(value);
      } else if (Array.isArray(value)) {
        // Clean arrays
        cleanData[key] = value.map(item =>
          typeof item === 'object' ? cleanResumeDataForFirebase(item) : item
        ).filter(item => item !== undefined && item !== null);
      } else {
        // Keep primitive values
        cleanData[key] = value;
      }
    }
  });

  // Special handling for photo field - ensure it's not undefined
  if (cleanData.photo === undefined) {
    delete cleanData.photo;
  }
  if (cleanData.personal && cleanData.personal.photo === undefined) {
    delete cleanData.personal.photo;
  }

  // Handle photo field structure mismatch
  // If photo exists at top level but personal object exists, move it to personal.photo
  if (cleanData.photo && cleanData.personal && !cleanData.personal.photo) {
    cleanData.personal.photo = cleanData.photo;
    delete cleanData.photo;
  }
  // If photo exists at top level but no personal object, create personal object
  else if (cleanData.photo && !cleanData.personal) {
    cleanData.personal = { photo: cleanData.photo };
    delete cleanData.photo;
  }

  return cleanData;
}

// Utility to deeply sanitize data before JSON serialization
// Removes Functions, DOM nodes, Windows, circular references, etc.
export function sanitizeDataForDeepCloning(data, seen = new WeakSet()) {
  // 1. Handle primitives and null/undefined
  if (data === null || typeof data !== 'object') {
    if (typeof data === 'function') return undefined;
    if (typeof data === 'symbol') return undefined;
    return data;
  }

  // 2. Handle circular references
  if (seen.has(data)) {
    // console.warn('[Sanitize] Circular reference detected, skipping');
    return undefined;
  }
  seen.add(data);

  // 3. Handle Arrays
  if (Array.isArray(data)) {
    return data
      .map(item => sanitizeDataForDeepCloning(item, seen))
      .filter(item => item !== undefined);
  }

  // 4. Handle Dates
  if (data instanceof Date) {
    return data.toISOString();
  }

  // 5. Detect and block DOM nodes / Window objects
  // Checks for common DOM properties that might indicate a Window or Element
  if (
    (data.constructor && data.constructor.name === 'Window') ||
    (typeof window !== 'undefined' && data === window) ||
    (data.nodeType && (data.nodeName || data.tagName)) ||
    (data.hasOwnProperty && data.hasOwnProperty('toJSON') && typeof data.toJSON !== 'function') // Suspicious toJSON property
  ) {
    return undefined;
  }

  // 6. Handle Plain Objects
  const cleanObj = {};
  try {
    const keys = Object.keys(data);
    for (const key of keys) {
      // Skip React internal properties or event properties
      if (key.startsWith('_') || key.startsWith('react')) continue;

      const value = data[key];
      const sanitizedValue = sanitizeDataForDeepCloning(value, seen);

      if (sanitizedValue !== undefined) {
        cleanObj[key] = sanitizedValue;
      }
    }
  } catch (e) {
    console.warn('[Sanitize] Error processing object key:', e);
    return undefined;
  }

  return cleanObj;
}