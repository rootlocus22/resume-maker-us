/**
 * Advanced Template Search Utility
 * Provides fuzzy search and relevance scoring for templates
 * Enhanced with job title and designation mapping
 */

// Job title and designation mappings to template categories and keywords
const JOB_TITLE_MAPPINGS = {
  // Software & Technology
  'software engineer': ['technology', 'tech', 'developer', 'programming', 'coding'],
  'software developer': ['technology', 'tech', 'developer', 'programming', 'coding'],
  'full stack developer': ['technology', 'tech', 'developer', 'programming', 'full-stack'],
  'frontend developer': ['technology', 'tech', 'developer', 'frontend', 'web'],
  'backend developer': ['technology', 'tech', 'developer', 'backend', 'server'],
  'web developer': ['technology', 'tech', 'developer', 'web', 'frontend'],
  'mobile developer': ['technology', 'tech', 'developer', 'mobile', 'app'],
  'devops engineer': ['technology', 'tech', 'devops', 'infrastructure', 'cloud'],
  'data scientist': ['technology', 'tech', 'data', 'analytics', 'machine learning'],
  'data analyst': ['technology', 'tech', 'data', 'analytics', 'business intelligence'],
  'data engineer': ['technology', 'tech', 'data', 'engineering', 'pipeline'],
  'machine learning engineer': ['technology', 'tech', 'ml', 'ai', 'machine learning'],
  'ai engineer': ['technology', 'tech', 'ai', 'artificial intelligence', 'machine learning'],
  'cybersecurity': ['technology', 'tech', 'security', 'cyber', 'information security'],
  'cloud engineer': ['technology', 'tech', 'cloud', 'aws', 'azure', 'gcp'],
  'system administrator': ['technology', 'tech', 'system', 'admin', 'infrastructure'],
  'database administrator': ['technology', 'tech', 'database', 'dba', 'sql'],
  'qa engineer': ['technology', 'tech', 'testing', 'qa', 'quality assurance'],
  'test engineer': ['technology', 'tech', 'testing', 'qa', 'quality assurance'],
  'product manager': ['technology', 'tech', 'product', 'management', 'strategy'],
  'technical lead': ['technology', 'tech', 'lead', 'senior', 'architect'],
  'tech lead': ['technology', 'tech', 'lead', 'senior', 'architect'],
  'solution architect': ['technology', 'tech', 'architect', 'solution', 'design'],
  'software architect': ['technology', 'tech', 'architect', 'software', 'design'],
  
  // Business & Management
  'business analyst': ['business', 'analyst', 'strategy', 'consulting', 'finance'],
  'project manager': ['management', 'project', 'pm', 'leadership', 'strategy'],
  'product manager': ['management', 'product', 'strategy', 'business', 'marketing'],
  'operations manager': ['management', 'operations', 'ops', 'business', 'strategy'],
  'general manager': ['management', 'executive', 'leadership', 'strategy', 'business'],
  'ceo': ['executive', 'leadership', 'strategy', 'business', 'management'],
  'cto': ['executive', 'technology', 'tech', 'leadership', 'strategy'],
  'cfo': ['executive', 'finance', 'financial', 'leadership', 'strategy'],
  'coo': ['executive', 'operations', 'leadership', 'strategy', 'business'],
  'vp': ['executive', 'vice president', 'leadership', 'strategy', 'management'],
  'director': ['executive', 'director', 'leadership', 'strategy', 'management'],
  'senior manager': ['management', 'senior', 'leadership', 'strategy', 'business'],
  'manager': ['management', 'leadership', 'strategy', 'business', 'team'],
  'team lead': ['management', 'lead', 'leadership', 'team', 'supervision'],
  'team leader': ['management', 'lead', 'leadership', 'team', 'supervision'],
  
  // Marketing & Sales
  'marketing manager': ['marketing', 'creative', 'brand', 'digital', 'strategy'],
  'digital marketing': ['marketing', 'digital', 'online', 'social media', 'seo'],
  'social media manager': ['marketing', 'social media', 'digital', 'content', 'creative'],
  'content manager': ['marketing', 'content', 'creative', 'digital', 'writing'],
  'brand manager': ['marketing', 'brand', 'creative', 'strategy', 'business'],
  'sales manager': ['sales', 'business', 'revenue', 'client', 'relationship'],
  'sales executive': ['sales', 'business', 'client', 'relationship', 'revenue'],
  'account manager': ['sales', 'client', 'relationship', 'business', 'account'],
  'business development': ['business', 'development', 'strategy', 'growth', 'sales'],
  'partnership manager': ['business', 'partnership', 'relationship', 'strategy', 'collaboration'],
  'customer success': ['customer', 'success', 'support', 'relationship', 'retention'],
  'account executive': ['sales', 'account', 'client', 'relationship', 'business'],
  
  // Finance & Accounting
  'financial analyst': ['finance', 'financial', 'analyst', 'accounting', 'business'],
  'accountant': ['finance', 'accounting', 'financial', 'bookkeeping', 'tax'],
  'financial advisor': ['finance', 'financial', 'advisor', 'investment', 'wealth'],
  'investment banker': ['finance', 'investment', 'banking', 'financial', 'capital'],
  'risk manager': ['finance', 'risk', 'management', 'compliance', 'financial'],
  'treasury manager': ['finance', 'treasury', 'cash', 'financial', 'management'],
  'audit manager': ['finance', 'audit', 'compliance', 'accounting', 'financial'],
  'tax manager': ['finance', 'tax', 'accounting', 'compliance', 'financial'],
  'controller': ['finance', 'controller', 'accounting', 'financial', 'management'],
  'finance manager': ['finance', 'financial', 'management', 'accounting', 'business'],
  
  // Healthcare & Medical
  'doctor': ['healthcare', 'medical', 'physician', 'clinical', 'health'],
  'nurse': ['healthcare', 'medical', 'nursing', 'clinical', 'health'],
  'pharmacist': ['healthcare', 'medical', 'pharmacy', 'clinical', 'health'],
  'therapist': ['healthcare', 'medical', 'therapy', 'clinical', 'health'],
  'dentist': ['healthcare', 'medical', 'dental', 'clinical', 'health'],
  'veterinarian': ['healthcare', 'medical', 'veterinary', 'animal', 'health'],
  'medical researcher': ['healthcare', 'medical', 'research', 'clinical', 'health'],
  'healthcare administrator': ['healthcare', 'medical', 'administration', 'management', 'health'],
  
  // Education & Training
  'teacher': ['education', 'teaching', 'academic', 'learning', 'training'],
  'professor': ['education', 'academic', 'teaching', 'research', 'university'],
  'trainer': ['education', 'training', 'learning', 'development', 'teaching'],
  'education coordinator': ['education', 'coordination', 'academic', 'learning', 'management'],
  'curriculum developer': ['education', 'curriculum', 'development', 'academic', 'learning'],
  'academic advisor': ['education', 'academic', 'advising', 'student', 'guidance'],
  
  // Creative & Design
  'graphic designer': ['creative', 'design', 'graphic', 'visual', 'art'],
  'ui designer': ['creative', 'design', 'ui', 'ux', 'user interface'],
  'ux designer': ['creative', 'design', 'ux', 'user experience', 'interface'],
  'web designer': ['creative', 'design', 'web', 'frontend', 'visual'],
  'interior designer': ['creative', 'design', 'interior', 'space', 'architecture'],
  'fashion designer': ['creative', 'design', 'fashion', 'style', 'clothing'],
  'photographer': ['creative', 'photography', 'visual', 'art', 'media'],
  'video editor': ['creative', 'video', 'editing', 'media', 'production'],
  'content creator': ['creative', 'content', 'writing', 'media', 'digital'],
  'copywriter': ['creative', 'writing', 'content', 'marketing', 'advertising'],
  
  // Human Resources
  'hr manager': ['hr', 'human resources', 'management', 'recruitment', 'employee'],
  'recruiter': ['hr', 'human resources', 'recruitment', 'talent', 'hiring'],
  'talent acquisition': ['hr', 'human resources', 'recruitment', 'talent', 'hiring'],
  'hr business partner': ['hr', 'human resources', 'business', 'strategy', 'employee'],
  'compensation analyst': ['hr', 'human resources', 'compensation', 'payroll', 'benefits'],
  'training manager': ['hr', 'human resources', 'training', 'development', 'learning'],
  
  // Operations & Supply Chain
  'operations analyst': ['operations', 'supply chain', 'logistics', 'business', 'process'],
  'supply chain manager': ['operations', 'supply chain', 'logistics', 'procurement', 'management'],
  'logistics coordinator': ['operations', 'logistics', 'supply chain', 'coordination', 'transport'],
  'procurement manager': ['operations', 'procurement', 'purchasing', 'supply chain', 'management'],
  'warehouse manager': ['operations', 'warehouse', 'logistics', 'inventory', 'management'],
  'quality manager': ['operations', 'quality', 'assurance', 'compliance', 'management'],
  
  // Legal & Compliance
  'lawyer': ['legal', 'law', 'attorney', 'counsel', 'litigation'],
  'attorney': ['legal', 'law', 'lawyer', 'counsel', 'litigation'],
  'legal counsel': ['legal', 'law', 'counsel', 'compliance', 'advisory'],
  'compliance officer': ['legal', 'compliance', 'regulatory', 'risk', 'governance'],
  'paralegal': ['legal', 'law', 'paralegal', 'support', 'assistance'],
  'legal assistant': ['legal', 'law', 'assistant', 'support', 'administrative'],
  
  // Consulting & Advisory
  'consultant': ['consulting', 'advisory', 'strategy', 'business', 'expert'],
  'management consultant': ['consulting', 'management', 'strategy', 'business', 'advisory'],
  'strategy consultant': ['consulting', 'strategy', 'business', 'advisory', 'planning'],
  'business consultant': ['consulting', 'business', 'strategy', 'advisory', 'expert'],
  'financial consultant': ['consulting', 'finance', 'financial', 'advisory', 'investment'],
  
  // Customer Service & Support
  'customer service': ['customer service', 'support', 'client', 'help', 'assistance'],
  'customer support': ['customer service', 'support', 'client', 'help', 'assistance'],
  'help desk': ['customer service', 'support', 'technical', 'help', 'it'],
  'technical support': ['customer service', 'support', 'technical', 'it', 'help'],
  'call center': ['customer service', 'support', 'call center', 'phone', 'client'],
  
  // Research & Development
  'research scientist': ['research', 'science', 'development', 'innovation', 'laboratory'],
  'research analyst': ['research', 'analyst', 'data', 'market', 'business'],
  'market researcher': ['research', 'market', 'analyst', 'data', 'business'],
  'lab technician': ['research', 'laboratory', 'technical', 'science', 'testing'],
  'research coordinator': ['research', 'coordination', 'management', 'academic', 'science'],
  
  // Real Estate & Construction
  'real estate agent': ['real estate', 'property', 'sales', 'client', 'business'],
  'property manager': ['real estate', 'property', 'management', 'leasing', 'maintenance'],
  'construction manager': ['construction', 'project', 'management', 'building', 'engineering'],
  'architect': ['architecture', 'design', 'construction', 'building', 'planning'],
  'civil engineer': ['engineering', 'civil', 'construction', 'infrastructure', 'project'],
  
  // Hospitality & Tourism
  'hotel manager': ['hospitality', 'hotel', 'management', 'service', 'tourism'],
  'restaurant manager': ['hospitality', 'restaurant', 'food service', 'management', 'service'],
  'event coordinator': ['hospitality', 'events', 'coordination', 'planning', 'management'],
  'travel agent': ['hospitality', 'travel', 'tourism', 'booking', 'service'],
  'tour guide': ['hospitality', 'tourism', 'guide', 'service', 'travel'],
  
  // Media & Communications
  'journalist': ['media', 'journalism', 'writing', 'news', 'communication'],
  'reporter': ['media', 'journalism', 'news', 'writing', 'communication'],
  'editor': ['media', 'writing', 'editing', 'content', 'publishing'],
  'public relations': ['media', 'pr', 'communication', 'marketing', 'brand'],
  'communications manager': ['media', 'communication', 'pr', 'marketing', 'brand'],
  
  // Non-profit & Social Work
  'social worker': ['non-profit', 'social work', 'community', 'help', 'support'],
  'program coordinator': ['non-profit', 'program', 'coordination', 'community', 'management'],
  'fundraising': ['non-profit', 'fundraising', 'development', 'charity', 'community'],
  'volunteer coordinator': ['non-profit', 'volunteer', 'coordination', 'community', 'management'],
  'community organizer': ['non-profit', 'community', 'organizing', 'activism', 'social'],
  
  // Government & Public Service
  'government official': ['government', 'public service', 'policy', 'administration', 'civic'],
  'policy analyst': ['government', 'policy', 'analysis', 'research', 'public service'],
  'public administrator': ['government', 'administration', 'public service', 'management', 'policy'],
  'diplomat': ['government', 'diplomacy', 'international', 'foreign service', 'policy'],
  'military officer': ['government', 'military', 'defense', 'leadership', 'service'],
  
  // Freelance & Entrepreneurship
  'freelancer': ['freelance', 'independent', 'contractor', 'consultant', 'entrepreneur'],
  'entrepreneur': ['entrepreneur', 'startup', 'business', 'founder', 'innovation'],
  'startup founder': ['entrepreneur', 'startup', 'founder', 'business', 'innovation'],
  'business owner': ['entrepreneur', 'business', 'owner', 'management', 'leadership'],
  'contractor': ['freelance', 'contractor', 'independent', 'project', 'consulting']
};

// Industry-specific keywords
const INDUSTRY_KEYWORDS = {
  'technology': ['tech', 'software', 'it', 'digital', 'computer', 'programming', 'coding', 'development'],
  'finance': ['financial', 'banking', 'investment', 'accounting', 'trading', 'wealth', 'capital'],
  'healthcare': ['medical', 'health', 'clinical', 'hospital', 'pharmacy', 'therapy', 'nursing'],
  'education': ['academic', 'teaching', 'learning', 'university', 'school', 'training', 'research'],
  'marketing': ['brand', 'advertising', 'promotion', 'digital', 'social media', 'content', 'creative'],
  'sales': ['revenue', 'client', 'customer', 'business development', 'account', 'relationship'],
  'operations': ['logistics', 'supply chain', 'procurement', 'warehouse', 'quality', 'process'],
  'legal': ['law', 'attorney', 'counsel', 'litigation', 'compliance', 'regulatory', 'legal'],
  'consulting': ['advisory', 'strategy', 'business', 'management', 'expert', 'professional'],
  'creative': ['design', 'art', 'visual', 'graphic', 'creative', 'media', 'content'],
  'hr': ['human resources', 'recruitment', 'talent', 'employee', 'workforce', 'benefits'],
  'government': ['public service', 'policy', 'administration', 'civic', 'public sector'],
  'non-profit': ['charity', 'community', 'social work', 'volunteer', 'fundraising', 'advocacy']
};

/**
 * Calculate Levenshtein distance between two strings (for fuzzy matching)
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function similarityScore(str1, str2) {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Check if search term matches with fuzzy logic
 */
function fuzzyMatch(searchTerm, targetText, threshold = 0.7) {
  const search = searchTerm.toLowerCase();
  const target = targetText.toLowerCase();
  
  // Exact match
  if (target.includes(search)) {
    return { match: true, score: 1.0, type: 'exact' };
  }
  
  // Word boundary match
  const words = target.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(search)) {
      return { match: true, score: 0.9, type: 'prefix' };
    }
  }
  
  // Fuzzy match
  const similarity = similarityScore(search, target);
  if (similarity >= threshold) {
    return { match: true, score: similarity, type: 'fuzzy' };
  }
  
  // Check each word for fuzzy match
  for (const word of words) {
    const wordSimilarity = similarityScore(search, word);
    if (wordSimilarity >= threshold) {
      return { match: true, score: wordSimilarity * 0.8, type: 'word-fuzzy' };
    }
  }
  
  return { match: false, score: 0, type: 'none' };
}

/**
 * Get job title keywords for a search term
 */
function getJobTitleKeywords(searchTerm) {
  const search = searchTerm.toLowerCase().trim();
  
  // Direct job title match
  if (JOB_TITLE_MAPPINGS[search]) {
    return JOB_TITLE_MAPPINGS[search];
  }
  
  // Partial job title match
  for (const [jobTitle, keywords] of Object.entries(JOB_TITLE_MAPPINGS)) {
    if (jobTitle.includes(search) || search.includes(jobTitle)) {
      return keywords;
    }
  }
  
  // Industry keyword match
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (search.includes(industry) || keywords.some(keyword => search.includes(keyword))) {
      return keywords;
    }
  }
  
  return [];
}

/**
 * Enhanced template search with job title and designation support
 */
export function searchTemplates(templates, searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return templates.map(t => ({ ...t, relevanceScore: 0 }));
  }

  const search = searchTerm.trim().toLowerCase();
  const searchWords = search.split(/\s+/);
  
  // Get job title keywords for enhanced matching
  const jobTitleKeywords = getJobTitleKeywords(search);

  const scoredTemplates = templates.map(template => {
    let relevanceScore = 0;
    let matchDetails = [];

    // Job title keyword matching (highest priority - 50 points)
    if (jobTitleKeywords.length > 0) {
      const allTemplateText = [
        template.name,
        template.category,
        template.description,
        ...(template.tags || []),
        ...(template.keywords || [])
      ].join(' ').toLowerCase();

      let bestJobTitleMatch = { match: false, score: 0 };
      for (const keyword of jobTitleKeywords) {
        const keywordMatch = fuzzyMatch(keyword, allTemplateText);
        if (keywordMatch.match && keywordMatch.score > bestJobTitleMatch.score) {
          bestJobTitleMatch = keywordMatch;
        }
      }
      if (bestJobTitleMatch.match) {
        relevanceScore += bestJobTitleMatch.score * 50;
        matchDetails.push({ field: 'job_title', score: bestJobTitleMatch.score, type: bestJobTitleMatch.type });
      }
    }

    // Template name matching (40 points)
    const nameMatch = fuzzyMatch(search, template.name || '');
    if (nameMatch.match) {
      relevanceScore += nameMatch.score * 40;
      matchDetails.push({ field: 'name', score: nameMatch.score, type: nameMatch.type });
    }

    // Category matching (30 points)
    const categoryMatch = fuzzyMatch(search, template.category || '');
    if (categoryMatch.match) {
      relevanceScore += categoryMatch.score * 30;
      matchDetails.push({ field: 'category', score: categoryMatch.score, type: categoryMatch.type });
    }

    // Tags matching (20 points)
    if (template.tags && Array.isArray(template.tags)) {
      let bestTagMatch = { match: false, score: 0 };
      for (const tag of template.tags) {
        const tagMatch = fuzzyMatch(search, tag);
        if (tagMatch.match && tagMatch.score > bestTagMatch.score) {
          bestTagMatch = tagMatch;
        }
      }
      if (bestTagMatch.match) {
        relevanceScore += bestTagMatch.score * 20;
        matchDetails.push({ field: 'tags', score: bestTagMatch.score, type: bestTagMatch.type });
      }
    }

    // Keywords matching (15 points)
    if (template.keywords && Array.isArray(template.keywords)) {
      let bestKeywordMatch = { match: false, score: 0 };
      for (const keyword of template.keywords) {
        const keywordMatch = fuzzyMatch(search, keyword);
        if (keywordMatch.match && keywordMatch.score > bestKeywordMatch.score) {
          bestKeywordMatch = keywordMatch;
        }
      }
      if (bestKeywordMatch.match) {
        relevanceScore += bestKeywordMatch.score * 15;
        matchDetails.push({ field: 'keywords', score: bestKeywordMatch.score, type: bestKeywordMatch.type });
      }
    }

    // Description matching (10 points)
    if (template.description) {
      const descMatch = fuzzyMatch(search, template.description);
      if (descMatch.match) {
        relevanceScore += descMatch.score * 10;
        matchDetails.push({ field: 'description', score: descMatch.score, type: descMatch.type });
      }
    }

    // Multi-word search bonus (5 points per matching word)
    if (searchWords.length > 1) {
      const allText = [
        template.name,
        template.category,
        template.description,
        ...(template.tags || []),
        ...(template.keywords || [])
      ].join(' ').toLowerCase();

      let matchingWords = 0;
      for (const word of searchWords) {
        if (allText.includes(word)) {
          matchingWords++;
        }
      }
      relevanceScore += (matchingWords / searchWords.length) * 5;
    }

    // Bonus for popular templates (3 points)
    if (template.popular) {
      relevanceScore += 3;
    }

    // Bonus for high ATS score (2 points)
    if (template.atsScore && template.atsScore >= 90) {
      relevanceScore += 2;
    }

    return {
      ...template,
      relevanceScore: Math.round(relevanceScore * 100) / 100,
      matchDetails,
      hasMatch: relevanceScore > 0
    };
  });

  // Filter and sort by relevance
  return scoredTemplates
    .filter(t => t.hasMatch)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get search suggestions based on partial input
 */
export function getSearchSuggestions(templates, partialSearch) {
  if (!partialSearch || partialSearch.length < 2) {
    return [];
  }

  const search = partialSearch.toLowerCase();
  const suggestions = new Set();

  // Add job title suggestions
  Object.keys(JOB_TITLE_MAPPINGS).forEach(jobTitle => {
    if (jobTitle.includes(search)) {
      suggestions.add(jobTitle);
    }
  });

  // Add industry keyword suggestions
  Object.keys(INDUSTRY_KEYWORDS).forEach(industry => {
    if (industry.includes(search)) {
      suggestions.add(industry);
    }
  });

  templates.forEach(template => {
    // Check name
    if (template.name && template.name.toLowerCase().includes(search)) {
      suggestions.add(template.name);
    }

    // Check category
    if (template.category && template.category.toLowerCase().includes(search)) {
      suggestions.add(template.category);
    }

    // Check tags
    if (template.tags) {
      template.tags.forEach(tag => {
        if (tag.toLowerCase().includes(search)) {
          suggestions.add(tag);
        }
      });
    }

    // Check keywords
    if (template.keywords) {
      template.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(search)) {
          suggestions.add(keyword);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, 8);
}

/**
 * Get popular search terms from templates
 */
export function getPopularSearchTerms(templates) {
  const termCounts = {};

  // Add popular job titles with high frequency
  const popularJobTitles = [
    'software engineer', 'data scientist', 'marketing manager', 'business analyst',
    'project manager', 'sales manager', 'financial analyst', 'hr manager',
    'graphic designer', 'product manager', 'consultant', 'teacher'
  ];
  
  popularJobTitles.forEach(jobTitle => {
    termCounts[jobTitle] = 10; // High base frequency for job titles
  });

  templates.forEach(template => {
    // Count categories
    if (template.category) {
      termCounts[template.category.toLowerCase()] = (termCounts[template.category.toLowerCase()] || 0) + 1;
    }

    // Count popular tags
    if (template.tags) {
      template.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        termCounts[tagLower] = (termCounts[tagLower] || 0) + 1;
      });
    }
  });

  // Sort by frequency and return top terms
  return Object.entries(termCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([term]) => term);
}

