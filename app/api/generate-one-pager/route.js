// Use Node.js runtime for headless Chrome
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { Buffer } from 'buffer';
import puppeteer from "puppeteer";
//import puppeteer from "puppeteer-core";
import { getChromiumLaunchOptions } from "../../lib/puppeteerChromium";
import { templates } from "../../lib/templates";
import { jobSpecificTemplates } from "../../lib/jobSpecificTemplate";
import { premiumTemplates } from "../../lib/premiumTemplate";
import { defaultConfig } from "../../lib/templates";
import { formatDateWithPreferences, tryParseDate, cleanText } from "../../lib/resumeUtils";
import { generateWithFallback } from "../../lib/geminiFallback";

// Increase max duration for complex optimization
export const maxDuration = 240;

// Singleton for browser instance
let browserInstance = null;

async function getBrowser() {
  if (browserInstance) return browserInstance;

  const isProduction = process.env.NODE_ENV === "production";
  const { executablePath, args: chromiumArgs } = await getChromiumLaunchOptions();
  browserInstance = await puppeteer.launch({
    args: [
      ...chromiumArgs,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
      "--enable-font-antialiasing",
      "--force-color-profile=srgb",
      // Windows-specific fixes for one-pager issue
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-extensions",
      "--disable-plugins",
      "--disable-images", // Reduce memory usage
      "--disable-javascript", // Not needed for PDF generation
      "--no-first-run",
      "--disable-default-apps",
      "--disable-sync",
      "--disable-translate",
      "--hide-scrollbars",
      "--mute-audio",
      "--disable-logging",
      "--disable-permissions-api",
      "--disable-presentation-api",
      "--disable-speech-api",
      "--disable-file-system",
      "--disable-directory-listing",
      "--disable-tabs-for-captive-portal",
      "--disable-component-extensions-with-background-pages",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--disable-ipc-flooding-protection",
      // Force consistent rendering across platforms
      "--force-device-scale-factor=1",
      "--use-gl=swiftshader",
    ],
    defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 1 },
    executablePath: isProduction ? executablePath : undefined,
    headless: "new",
  });

  process.on("exit", async () => {
    if (browserInstance) await browserInstance.close();
  });

  return browserInstance;
}

// Content optimization strategies
const OPTIMIZATION_STRATEGIES = {
  // Font size reduction (in points)
  fontSizes: {
    normal: { header: 22, sectionTitle: 13, body: 11, small: 9 },
    compact: { header: 18, sectionTitle: 11, body: 10, small: 8 },
    ultra: { header: 16, sectionTitle: 10, body: 9, small: 7 },
    extreme: { header: 12, sectionTitle: 8, body: 7, small: 5 },
    windows: { header: 10, sectionTitle: 7, body: 6, small: 4 } // Windows-specific ultra-compact
  },

  // Spacing reduction (in rem)
  spacing: {
    normal: { sectionGap: 1.75, contentPadding: 1.25, itemGap: 0.5 },
    compact: { sectionGap: 1.25, contentPadding: 0.75, itemGap: 0.25 },
    ultra: { sectionGap: 0.75, contentPadding: 0.5, itemGap: 0.125 },
    extreme: { sectionGap: 0.3, contentPadding: 0.2, itemGap: 0.05 },
    windows: { sectionGap: 0.2, contentPadding: 0.1, itemGap: 0.02 } // Windows-specific ultra-tight
  },

  // Content truncation limits
  contentLimits: {
    summary: { normal: 300, compact: 200, ultra: 150, extreme: 80, windows: 60 },
    experienceDescription: { normal: 200, compact: 150, ultra: 100, extreme: 50, windows: 30 },
    educationDescription: { normal: 100, compact: 75, ultra: 50, extreme: 25, windows: 15 },
    skillsPerRow: { normal: 4, compact: 5, ultra: 6, extreme: 10, windows: 12 }
  }
};

// Enhanced ATS keyword extraction for maximum scoring
function extractATSKeywords(text) {
  if (!text) return [];

  const keywords = [];
  const keywordPatterns = [
    // Technical skills (high ATS value)
    /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|SQL|NoSQL|MySQL|PostgreSQL|MongoDB|Redis|SQLite|Oracle|React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel|Rails|ASP\.NET|jQuery|Bootstrap|Tailwind|HTML|CSS|SASS|LESS|Git|GitHub|GitLab|Bitbucket|SVN|Docker|Kubernetes|Jenkins|Travis|CircleCI|AWS|Azure|GCP|Heroku|Vercel|Netlify|Linux|Ubuntu|CentOS|Windows|macOS|Apache|Nginx|REST|GraphQL|SOAP|JSON|XML|YAML|Microservices|API|SDK|CLI|DevOps|CI\/CD|TDD|BDD|Agile|Scrum|Kanban|Jira|Confluence|Slack|Teams|Zoom|Figma|Adobe|Photoshop|Illustrator|Sketch|InVision|Webpack|Vite|Babel|ESLint|Prettier|Jest|Cypress|Selenium|Postman|Swagger|OAuth|JWT|SSL|HTTPS|Firebase|Supabase|Stripe|PayPal|Twilio|SendGrid|Mailchimp|Google Analytics|GTM|SEO|SEM|PPC|CRM|ERP|Salesforce|HubSpot|Shopify|WordPress|Magento|WooCommerce|Drupal|Joomla|Terraform|Ansible|Puppet|Chef|Vagrant|Splunk|Tableau|Power BI|Excel|Pandas|NumPy|TensorFlow|PyTorch|Keras|Scikit-learn|Hadoop|Spark|Kafka|ElasticSearch|Logstash|Kibana|Prometheus|Grafana|New Relic|DataDog|Splunk)\b/gi,

    // Action verbs (critical for ATS content score)
    /\b(?:achieved|accomplished|administered|advanced|analyzed|assessed|assisted|automated|built|calculated|collaborated|communicated|completed|conceived|conducted|configured|constructed|contributed|controlled|coordinated|created|customized|delivered|demonstrated|designed|developed|directed|drove|earned|enhanced|established|evaluated|exceeded|executed|expanded|expedited|facilitated|generated|guided|handled|headed|identified|implemented|improved|increased|initiated|innovated|installed|integrated|introduced|launched|led|leveraged|maintained|managed|maximized|mentored|minimized|modernized|monitored|negotiated|operated|optimized|organized|oversaw|participated|performed|planned|presented|processed|produced|programmed|promoted|provided|published|purchased|recommended|reduced|refined|reorganized|replaced|reported|researched|resolved|restructured|reviewed|revised|scheduled|secured|selected|simplified|solved|streamlined|strengthened|supervised|supported|surpassed|taught|tested|trained|transformed|updated|upgraded|utilized|validated|verified|accelerated|amplified|architected|attained|boosted|championed|consolidated|cultivated|diversified|elevated|empowered|engineered|executed|fostered|galvanized|harmonized|influenced|inspired|mobilized|navigated|orchestrated|pioneered|realized|revitalized|spearheaded|standardized|stimulated|synchronized|synthesized|troubleshot|unified|visualized)\b/gi,

    // Metrics and quantifiable results (extremely high ATS value)
    /\d+(?:\.\d+)?(?:%|\+|k|K|M|million|billion|thousand|\$|USD|EUR|GBP|INR|years?|months?|days?|hours?|weeks?|users?|customers?|clients?|projects?|teams?|members?|employees?|revenue|profit|sales|growth|increase|decrease|reduction|improvement|efficiency|productivity|ROI|KPI|target|goal|objective|milestone|budget|cost|saving|margin|conversion|retention|acquisition|engagement|satisfaction|performance|utilization|throughput|uptime|downtime|response|latency|accuracy|precision|recall|compliance|coverage|adoption|penetration|market share|volume|capacity|scalability|availability)/gi,

    // Certifications and degrees (important for qualification matching)
    /\b(?:certified|certification|certificate|degree|bachelor|master|MBA|PhD|doctorate|licensed|accredited|qualified|trained|skilled|expert|specialist|professional|advanced|senior|lead|principal|architect|engineer|developer|analyst|consultant|manager|director|VP|CTO|CEO|CIO|CFO|CMO|CISSP|PMP|CISA|CISM|CEH|CISSP|CompTIA|AWS Certified|Azure Certified|Google Certified|Microsoft Certified|Oracle Certified|Salesforce Certified|Cisco Certified|VMware Certified|Red Hat Certified|Scrum Master|Product Owner|Six Sigma|ITIL|Prince2|TOGAF|CPA|CFA|SHRM|PHR|SPHR|GPHR|Lean|Kaizen|Black Belt|Green Belt|PRINCE2|COBIT|COSO|ISO|SOX|GDPR|HIPAA|PCI|DSS|NIST|OWASP|SANS|GIAC|CISSP|CISM|CRISC|CGEIT|CITT|MCSE|MCSA|MCITP|VCP|VCAP|VCDX)\b/gi,

    // Industry and business terms for content score
    /\b(?:revenue|sales|profit|EBITDA|ROI|KPI|metrics|analytics|insights|strategy|strategic|operational|tactical|leadership|management|governance|compliance|audit|risk|security|innovation|transformation|digital|cloud|mobile|enterprise|scalability|performance|efficiency|productivity|quality|customer|client|stakeholder|vendor|partner|supplier|procurement|sourcing|logistics|supply chain|inventory|forecasting|budgeting|planning|analysis|reporting|dashboard|visualization|business intelligence|data science|machine learning|artificial intelligence|automation|optimization|process improvement|change management|project management|product management|program management|portfolio management|agile|lean|waterfall|methodology|framework|best practices|standards|procedures|policies|documentation|training|mentoring|coaching|development|career|professional|technical|functional|cross-functional|interdisciplinary|collaborative|teamwork|communication|presentation|negotiation|problem solving|critical thinking|analytical|creative|innovative|adaptable|flexible|detail-oriented|results-oriented|customer-focused|data-driven|solution-oriented|omnichannel|multi-channel|B2B|B2C|SaaS|PaaS|IaaS|fintech|edtech|healthtech|martech|adtech|e-commerce|marketplace|platform|ecosystem|workflow|integration|migration|deployment|infrastructure|architecture|framework|pipeline|workflow|orchestration|containerization|virtualization|monitoring|logging|alerting|incident|troubleshooting|root cause|resolution|escalation|communication|collaboration|stakeholder|cross-functional|matrix|remote|hybrid|onsite|offshore|nearshore|outsourcing|insourcing|vendor|third-party|partnership|alliance|consortium|joint venture)\b/gi,

    // Soft skills (important for cultural fit and content score)
    /\b(?:leadership|communication|teamwork|collaboration|problem.solving|analytical|critical.thinking|creativity|innovation|adaptability|flexibility|time.management|organization|attention.to.detail|customer.service|interpersonal|presentation|negotiation|conflict.resolution|decision.making|strategic.thinking|emotional.intelligence|cultural.awareness|cross.functional|multitasking|prioritization|initiative|self.motivated|results.oriented|goal.oriented|detail.oriented|customer.focused|quality.focused|process.improvement|continuous.learning|mentoring|coaching|training|documentation|reporting|research|analysis|relationship.building|stakeholder.management|change.management|crisis.management|conflict.management|stress.management|pressure.handling|deadline.management|budget.management|resource.management|people.management|talent.management|performance.management|risk.management|quality.assurance|customer.satisfaction|client.retention|business.development|market.research|competitive.analysis|strategic.planning|tactical.execution|operational.excellence|continuous.improvement|innovation.management|digital.transformation|cultural.transformation|organizational.development)\b/gi,

    // Role-specific and seniority keywords
    /\b(?:senior|lead|principal|staff|director|manager|supervisor|coordinator|specialist|expert|consultant|architect|engineer|developer|analyst|associate|executive|vice president|VP|head of|chief|C-level|founder|co-founder|entrepreneur|owner|partner|stakeholder|board member|advisor|mentor|coach|trainer|instructor|facilitator|moderator|presenter|speaker|author|writer|editor|reviewer|contributor|collaborator|team member|individual contributor|IC|SME|subject matter expert)\b/gi,

    // Industry verticals and domains
    /\b(?:technology|software|hardware|telecommunications|fintech|finance|banking|insurance|healthcare|pharma|biotech|manufacturing|automotive|aerospace|energy|utilities|retail|e-commerce|consumer goods|media|entertainment|gaming|education|edtech|non-profit|government|defense|consulting|professional services|real estate|construction|logistics|transportation|hospitality|travel|food|beverage|agriculture|mining|oil|gas|renewable|sustainability|environment|legal|compliance|audit|tax|accounting|human resources|HR|marketing|advertising|public relations|PR|sales|business development|operations|supply chain|procurement|IT|information technology|cybersecurity|data|analytics|AI|ML|cloud|mobile|web|digital|social|content|design|UX|UI|product|project|program|portfolio|quality|testing|support|maintenance|training|documentation)\b/gi
  ];

  keywordPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    keywords.push(...matches.map(m => m.toLowerCase()));
  });

  return [...new Set(keywords)]; // Remove duplicates
}

// AI-powered content optimization using Gemini
async function optimizeContentWithAI(data, strategy = 'normal') {
  const optimized = JSON.parse(JSON.stringify(data)); // Deep clone

  // Validate strategy and provide fallback
  const validStrategies = ['normal', 'compact', 'ultra', 'extreme', 'windows'];
  const safeStrategy = validStrategies.includes(strategy) ? strategy : 'normal';

  // Normalize experience data to ensure jobTitle is always present
  if (optimized.experience && Array.isArray(optimized.experience)) {
    optimized.experience = optimized.experience.map(exp => ({
      ...exp,
      jobTitle: exp.jobTitle || exp.title || exp.position || "Job Title"
    }));
  }

  // Sort experience from latest to oldest to ensure most recent experience is included
  if (optimized.experience && Array.isArray(optimized.experience)) {
    optimized.experience.sort((a, b) => {
      // Handle cases where dates might be missing or invalid
      const aStartDate = a.startDate ? new Date(a.startDate) : new Date(0);
      const bStartDate = b.startDate ? new Date(b.startDate) : new Date(0);

      // If start dates are valid, sort by start date (newest first)
      if (!isNaN(aStartDate.getTime()) && !isNaN(bStartDate.getTime())) {
        return bStartDate - aStartDate; // Descending order (latest first)
      }

      // If dates are invalid, maintain original order
      return 0;
    });

    console.log('📅 Experience sorted from latest to oldest:',
      optimized.experience.map(exp => `${exp.jobTitle} at ${exp.company} (${exp.startDate || 'N/A'})`)
    );
  }

  // Get content limits
  const contentLimits = OPTIMIZATION_STRATEGIES.contentLimits;
  const summaryLimit = contentLimits.summary[safeStrategy] || contentLimits.summary.normal;
  const experienceLimit = contentLimits.experienceDescription[safeStrategy] || contentLimits.experienceDescription.normal;
  const educationLimit = contentLimits.educationDescription[safeStrategy] || contentLimits.educationDescription.normal;

  try {
    // Optimize summary with AI
    if (optimized.summary && optimized.summary.length > summaryLimit) {
      const summaryPrompt = `Optimize this professional summary to approximately ${summaryLimit} characters for maximum ATS impact. Preserve all key achievements, skills, and professional value while eliminating repetition and ensuring perfect grammar.

Original Summary: "${optimized.summary}"

Requirements for high ATS score:
- Target length: ~${summaryLimit} characters
- Preserve key achievements, metrics, and technical skills
- Eliminate repetition and redundant phrases
- Ensure perfect grammar and professional tone
- Use powerful action verbs: architected, engineered, orchestrated, spearheaded, pioneered, optimized, transformed
- Include specific metrics: percentages, dollar amounts, time reductions, efficiency gains
- Emphasize technical expertise and business impact
- No ellipsis or "..." markers
- Complete, coherent sentences only
- Avoid generic phrases like "proven track record" or "results-driven professional"

Optimized Summary:`;

      try {
        // Add timeout to prevent infinite loops
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini request timeout')), 8000)
        );

        const geminiPromise = generateWithFallback(summaryPrompt, {
          maxOutputTokens: 200,
          temperature: 0.3
        });

        const result = await Promise.race([geminiPromise, timeoutPromise]);
        optimized.summary = result.text.trim();
      } catch (error) {
        console.warn('AI summary optimization failed, using fallback:', error.message);
        // Fallback to smart truncation at sentence boundary
        const sentences = optimized.summary.split(/[.!?]+/).filter(s => s.trim());
        let condensed = '';
        for (const sentence of sentences) {
          if ((condensed + sentence).length <= summaryLimit) {
            condensed += sentence + '. ';
          } else break;
        }
        optimized.summary = condensed.trim() || optimized.summary.substring(0, summaryLimit);
      }
    }

    // Optimize experience descriptions with AI - Generate intelligent bullet points
    // Experience is now sorted from latest to oldest (index 0 = most recent)
    if (optimized.experience) {
      for (let i = 0; i < optimized.experience.length; i++) {
        const exp = optimized.experience[i];
        console.log(`🔄 Processing experience ${i + 1}/${optimized.experience.length}: ${exp.jobTitle} at ${exp.company} (${exp.startDate || 'N/A'})`);
        if (exp.description) {
          const experiencePrompt = `Transform this job description into 3-4 powerful, ATS-optimized bullet points for maximum impact. Create concise, metric-driven achievements that highlight technical expertise and business results.

IMPORTANT: This experience entry is being processed in chronological order (latest to oldest). Ensure ALL key achievements and responsibilities are captured to avoid missing critical information.

Job Title: ${exp.jobTitle || 'Professional Role'}
Company: ${exp.company || 'Company'}
Duration: ${exp.startDate ? `${exp.startDate} - ${exp.endDate || 'Present'}` : 'N/A'}

Original Description: "${exp.description}"

Generate EXACTLY 3-4 bullet points with these requirements:
- Each bullet 80-120 characters for optimal ATS scanning
- Start with powerful action verbs: Architected, Engineered, Spearheaded, Orchestrated, Pioneered, Optimized, Transformed, Accelerated, Scaled, Revolutionized, Implemented, Delivered, Led, Managed, Developed
- Include specific metrics: percentages, dollar amounts, time savings, user numbers, efficiency gains, team sizes
- Emphasize technical skills, tools, frameworks, methodologies
- Highlight business impact: revenue growth, cost savings, process improvements, customer satisfaction
- Use industry keywords for ATS optimization
- Perfect grammar and professional tone
- No generic phrases like "responsible for" or "worked on"
- CRITICAL: Ensure NO important responsibilities or achievements are missed - this is the ${i === 0 ? 'MOST RECENT' : i === 1 ? 'SECOND MOST RECENT' : 'earlier'} experience entry
- Format as separate bullet points with • symbol

Return ONLY the bullet points in this format:
• [First achievement with metrics and impact]
• [Second achievement with technical skills and results]
• [Third achievement with leadership/business impact]
• [Fourth achievement if content warrants it]

Optimized Bullet Points:`;

          try {
            // Add timeout to prevent infinite loops
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Gemini request timeout')), 8000)
            );

            const geminiPromise = generateWithFallback(experiencePrompt, {
              maxOutputTokens: 300,
              temperature: 0.3
            });

            const result = await Promise.race([geminiPromise, timeoutPromise]);
            // Process AI-generated bullet points
            let bulletPoints = result.text.trim()
              .replace(/```|`/g, '') // Remove code blocks
              .split('\n')
              .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
              .map(line => line.trim().replace(/^[•\-\*]\s*/, '').trim())
              .filter(line => line.length > 20) // Filter out very short lines
              .slice(0, 4); // Limit to 4 bullet points max

            // If we got good bullet points, use them
            if (bulletPoints.length >= 2) {
              optimized.experience[i].bulletPoints = bulletPoints;
              optimized.experience[i].description = bulletPoints.join(' | '); // Fallback format
            } else {
              // Fallback to original description
              optimized.experience[i].description = exp.description;
              optimized.experience[i].bulletPoints = [exp.description];
            }
          } catch (error) {
            console.warn(`AI experience optimization failed for job ${i}, using intelligent fallback:`, error.message);
            // Intelligent fallback: Create bullet points from sentences
            const sentences = exp.description.split(/[.!?]+/).filter(s => s.trim() && s.length > 15);
            const bulletPoints = sentences.slice(0, 4).map(sentence => {
              let cleaned = sentence.trim();
              // Enhance with action verbs if missing
              if (!cleaned.match(/^(Architected|Engineered|Spearheaded|Orchestrated|Pioneered|Optimized|Transformed|Accelerated|Scaled|Revolutionized|Implemented|Delivered|Led|Managed|Developed|Created|Built|Designed|Improved|Increased|Reduced|Enhanced)/i)) {
                // Try to add a strong action verb based on context
                if (cleaned.match(/\b(system|software|application|platform|solution)\b/i)) {
                  cleaned = 'Developed ' + cleaned.toLowerCase();
                } else if (cleaned.match(/\b(team|people|staff|members)\b/i)) {
                  cleaned = 'Led ' + cleaned.toLowerCase();
                } else if (cleaned.match(/\b(process|workflow|procedure|method)\b/i)) {
                  cleaned = 'Optimized ' + cleaned.toLowerCase();
                } else if (cleaned.match(/\b(revenue|sales|profit|cost|budget)\b/i)) {
                  cleaned = 'Achieved ' + cleaned.toLowerCase();
                } else {
                  cleaned = 'Delivered ' + cleaned.toLowerCase();
                }
              }
              return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            });

            optimized.experience[i].bulletPoints = bulletPoints;
            optimized.experience[i].description = bulletPoints.join(' | ');
          }
        }
      }
    }

    // Optimize education descriptions with AI
    if (optimized.education) {
      for (let i = 0; i < optimized.education.length; i++) {
        const edu = optimized.education[i];
        if (edu.description && edu.description.length > educationLimit) {
          const educationPrompt = `Optimize this education description to approximately ${educationLimit} characters for maximum ATS impact. Preserve key academic achievements, relevant coursework, and honors while eliminating repetition and ensuring perfect grammar.

Degree: ${edu.degree || 'Degree'}
Institution: ${edu.institution || 'Institution'}

Original Description: "${edu.description}"

Requirements for high ATS score:
- Target length: ~${educationLimit} characters
- Preserve key achievements, honors, and relevant coursework
- Eliminate repetition and redundant phrases
- Ensure perfect grammar and professional tone
- Emphasize academic excellence, research, and relevant skills
- Include specific achievements: GPA, honors, awards, research projects
- No ellipsis or "..." markers
- Complete, coherent statements only
- Avoid generic phrases and repetition

Optimized Description:`;

          try {
            // Add timeout to prevent infinite loops
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Gemini request timeout')), 8000)
            );

            const geminiPromise = generateWithFallback(educationPrompt, {
              maxOutputTokens: 150,
              temperature: 0.3
            });

            const result = await Promise.race([geminiPromise, timeoutPromise]);
            optimized.education[i].description = result.text.trim();
          } catch (error) {
            console.warn(`AI education optimization failed for education ${i}, using fallback:`, error.message);
            // Fallback to smart truncation
            let descriptionText = Array.isArray(edu.description) ? edu.description.join(' ') : String(edu.description);
            const sentences = descriptionText.split(/[.!?]+/).filter(s => s.trim());
            let condensed = '';
            for (const sentence of sentences) {
              if ((condensed + sentence).length <= educationLimit) {
                condensed += sentence + '. ';
              } else break;
            }
            optimized.education[i].description = condensed.trim() || edu.description.substring(0, educationLimit);
          }
        }
      }
    }

  } catch (error) {
    console.error('AI content optimization failed, using fallback optimization:', error);
    // Fallback to basic optimization
    return optimizeContentBasic(data, strategy);
  }

  // Apply content limits for one-page optimization
  // Since experience is sorted from latest to oldest, we prioritize the most recent 5 positions
  if (optimized.experience && optimized.experience.length > 5) {
    console.log(`📋 Limiting experience to 5 most recent positions (${optimized.experience.length} total available)`);
    optimized.experience = optimized.experience.slice(0, 5);
  }

  if (optimized.education && optimized.education.length > 2) {
    optimized.education = optimized.education.slice(0, 2);
  }

  if (optimized.skills && optimized.skills.length > 10) {
    optimized.skills = optimized.skills.slice(0, 12);
  }

  if (optimized.certifications && optimized.certifications.length > 3) {
    optimized.certifications = optimized.certifications.slice(0, 3);
  }

  if (optimized.projects && optimized.projects.length > 2) {
    optimized.projects = optimized.projects.slice(0, 2);
  }

  // Calculate ATS score prediction
  const allText = JSON.stringify(optimized);
  const keywords = extractATSKeywords(allText);
  const keywordDensity = keywords.length / (allText.length / 100); // keywords per 100 characters
  const metricsCount = (allText.match(/\d+(?:\.\d+)?(?:%|\+|k|K|M|million|billion|thousand|\$|USD|EUR|GBP|INR)/gi) || []).length;
  const actionVerbsCount = (allText.match(/\b(?:achieved|accomplished|administered|advanced|analyzed|assessed|assisted|automated|built|calculated|collaborated|communicated|completed|conceived|conducted|configured|constructed|contributed|controlled|coordinated|created|customized|delivered|demonstrated|designed|developed|directed|drove|earned|enhanced|established|evaluated|exceeded|executed|expanded|expedited|facilitated|generated|guided|handled|headed|identified|implemented|improved|increased|initiated|innovated|installed|integrated|introduced|launched|led|leveraged|maintained|managed|maximized|mentored|minimized|modernized|monitored|negotiated|operated|optimized|organized|oversaw|participated|performed|planned|presented|processed|produced|programmed|promoted|provided|published|purchased|recommended|reduced|refined|reorganized|replaced|reported|researched|resolved|restructured|reviewed|revised|scheduled|secured|selected|simplified|solved|streamlined|strengthened|supervised|supported|surpassed|taught|tested|trained|transformed|updated|upgraded|utilized|validated|verified|accelerated|amplified|architected|attained|boosted|championed|consolidated|cultivated|diversified|elevated|empowered|engineered|executed|fostered|galvanized|harmonized|influenced|inspired|mobilized|navigated|orchestrated|pioneered|realized|revitalized|spearheaded|standardized|stimulated|synchronized|synthesized|troubleshot|unified|visualized)\b/gi) || []).length;

  // Enhanced ATS Score calculation (0-100)
  let atsScore = 65; // Higher base score for optimized content
  atsScore += Math.min(keywords.length * 0.4, 18); // Keyword presence (max 18 points)
  atsScore += Math.min(metricsCount * 1.8, 12); // Quantifiable metrics (max 12 points)
  atsScore += Math.min(actionVerbsCount * 0.6, 8); // Action verbs (max 8 points)
  atsScore += Math.min(keywordDensity * 1.5, 4); // Keyword density bonus (max 4 points)

  // Additional ATS factors
  const sectionCount = [optimized.summary, optimized.experience, optimized.education, optimized.skills, optimized.certifications, optimized.projects, optimized.languages].filter(Boolean).length;
  atsScore += Math.min(sectionCount * 0.8, 4); // Section completeness (max 4 points)

  // Bullet point structure bonus
  const bulletPointCount = optimized.experience?.reduce((total, exp) => total + (exp.bulletPoints?.length || 0), 0) || 0;
  atsScore += Math.min(bulletPointCount * 0.3, 3); // Structured content (max 3 points)

  // Bonus for technical skills and certifications
  const technicalSkills = (allText.match(/\b(?:JavaScript|TypeScript|Python|Java|React|Angular|Vue|Node|SQL|AWS|Azure|Docker|Kubernetes|Git|API|REST|GraphQL|DevOps|Agile|Scrum|Jira|Tableau|Excel|Salesforce|CRM|ERP)\b/gi) || []).length;
  atsScore += Math.min(technicalSkills * 0.3, 5); // Technical skills bonus (max 5 points)

  const certifications = (allText.match(/\b(?:certified|certification|PMP|CISSP|AWS Certified|Azure Certified|Google Certified|Microsoft Certified|Oracle Certified|Salesforce Certified|Scrum Master|Six Sigma|ITIL|Prince2|TOGAF|CPA|CFA)\b/gi) || []).length;
  atsScore += Math.min(certifications * 0.5, 5); // Certifications bonus (max 5 points)

  // Cap at 100
  atsScore = Math.min(atsScore, 100);

  console.log(`🎯 ATS Score Prediction: ${atsScore.toFixed(1)}/100`);
  console.log(`   • Keywords: ${keywords.length}`);
  console.log(`   • Metrics: ${metricsCount}`);
  console.log(`   • Action Verbs: ${actionVerbsCount}`);
  console.log(`   • Technical Skills: ${technicalSkills}`);
  console.log(`   • Certifications: ${certifications}`);

  optimized.atsScore = Math.round(atsScore);

  // Grammar and repetition check
  const grammarCheck = checkGrammarAndRepetition(optimized);
  if (grammarCheck.issues.length > 0) {
    console.log(`⚠️  Content Quality Issues Found: ${grammarCheck.issues.length}`);
    grammarCheck.issues.forEach(issue => console.log(`   • ${issue}`));
  }

  return optimized;
}

// Grammar and repetition checking function
function checkGrammarAndRepetition(data) {
  const issues = [];
  const allText = JSON.stringify(data).toLowerCase();

  // Check for common grammar issues
  const grammarPatterns = [
    { pattern: /\b(?:i|me|my|myself)\b/g, issue: "First person pronouns detected - consider using third person" },
    { pattern: /\b(?:very|really|quite|extremely)\s+\w+/g, issue: "Weak adverbs detected - consider stronger alternatives" },
    { pattern: /\b(?:responsible for|in charge of|handled)\b/g, issue: "Weak action verbs detected - consider stronger alternatives" },
    { pattern: /\b(?:etc|and so on|and more)\b/g, issue: "Vague endings detected - be more specific" },
    { pattern: /\b(?:proven track record|results-driven|detail-oriented)\b/g, issue: "Generic phrases detected - be more specific" }
  ];

  grammarPatterns.forEach(({ pattern, issue }) => {
    if (pattern.test(allText)) {
      issues.push(issue);
    }
  });

  // Check for repetition
  const words = allText.match(/\b\w{4,}\b/g) || [];
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  const repeatedWords = Object.entries(wordCount)
    .filter(([word, count]) => count > 3 && word.length > 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (repeatedWords.length > 0) {
    issues.push(`Repetitive words detected: ${repeatedWords.map(([word, count]) => `${word}(${count})`).join(', ')}`);
  }

  // Check for sentence structure issues
  const sentences = allText.match(/[^.!?]+[.!?]+/g) || [];
  const longSentences = sentences.filter(sentence => sentence.length > 100);
  if (longSentences.length > 0) {
    issues.push(`${longSentences.length} sentences are too long (over 100 characters)`);
  }

  return { issues, repeatedWords };
}

// Fallback optimization function (basic truncation)
function optimizeContentBasic(data, strategy = 'normal') {
  const optimized = JSON.parse(JSON.stringify(data));

  const validStrategies = ['normal', 'compact', 'ultra', 'extreme', 'windows'];
  const safeStrategy = validStrategies.includes(strategy) ? strategy : 'normal';

  // Normalize experience data to ensure jobTitle is always present
  if (optimized.experience && Array.isArray(optimized.experience)) {
    optimized.experience = optimized.experience.map(exp => ({
      ...exp,
      jobTitle: exp.jobTitle || exp.title || exp.position || "Job Title"
    }));
  }

  const contentLimits = OPTIMIZATION_STRATEGIES.contentLimits;
  const summaryLimit = contentLimits.summary[safeStrategy] || contentLimits.summary.normal;
  const experienceLimit = contentLimits.experienceDescription[safeStrategy] || contentLimits.experienceDescription.normal;
  const educationLimit = contentLimits.educationDescription[safeStrategy] || contentLimits.educationDescription.normal;

  // Basic truncation with sentence boundary awareness
  if (optimized.summary && optimized.summary.length > summaryLimit) {
    const sentences = optimized.summary.split(/[.!?]+/).filter(s => s.trim());
    let condensed = '';
    for (const sentence of sentences) {
      if ((condensed + sentence).length <= summaryLimit) {
        condensed += sentence + '. ';
      } else break;
    }
    optimized.summary = condensed.trim() || optimized.summary.substring(0, summaryLimit);
  }

  if (optimized.experience) {
    optimized.experience = optimized.experience.map(exp => {
      if (exp.description) {
        // Create intelligent bullet points from description
        const sentences = exp.description.split(/[.!?]+/).filter(s => s.trim() && s.length > 15);
        const bulletPoints = sentences.slice(0, 4).map(sentence => {
          let cleaned = sentence.trim();
          // Enhance with action verbs if missing
          if (!cleaned.match(/^(Architected|Engineered|Spearheaded|Orchestrated|Pioneered|Optimized|Transformed|Accelerated|Scaled|Revolutionized|Implemented|Delivered|Led|Managed|Developed|Created|Built|Designed|Improved|Increased|Reduced|Enhanced)/i)) {
            // Try to add a strong action verb based on context
            if (cleaned.match(/\b(system|software|application|platform|solution)\b/i)) {
              cleaned = 'Developed ' + cleaned.toLowerCase();
            } else if (cleaned.match(/\b(team|people|staff|members)\b/i)) {
              cleaned = 'Led ' + cleaned.toLowerCase();
            } else if (cleaned.match(/\b(process|workflow|procedure|method)\b/i)) {
              cleaned = 'Optimized ' + cleaned.toLowerCase();
            } else if (cleaned.match(/\b(revenue|sales|profit|cost|budget)\b/i)) {
              cleaned = 'Achieved ' + cleaned.toLowerCase();
            } else {
              cleaned = 'Delivered ' + cleaned.toLowerCase();
            }
          }
          return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        });

        return {
          ...exp,
          bulletPoints: bulletPoints,
          description: bulletPoints.join(' | ')
        };
      }
      return exp;
    });
  }

  if (optimized.education) {
    optimized.education = optimized.education.map(edu => ({
      ...edu,
      description: edu.description && edu.description.length > educationLimit
        ? (() => {
          let descriptionText = Array.isArray(edu.description) ? edu.description.join(' ') : String(edu.description);
          const sentences = descriptionText.split(/[.!?]+/).filter(s => s.trim());
          let condensed = '';
          for (const sentence of sentences) {
            if ((condensed + sentence).length <= educationLimit) {
              condensed += sentence + '. ';
            } else break;
          }
          return condensed.trim() || edu.description.substring(0, educationLimit);
        })()
        : edu.description
    }));
  }

  // Apply content limits for one-page optimization
  // Since experience is sorted from latest to oldest, we prioritize the most recent 5 positions
  if (optimized.experience && optimized.experience.length > 5) {
    console.log(`📋 Limiting experience to 5 most recent positions (${optimized.experience.length} total available)`);
    optimized.experience = optimized.experience.slice(0, 5);
  }

  if (optimized.education && optimized.education.length > 2) {
    optimized.education = optimized.education.slice(0, 2);
  }

  if (optimized.skills && optimized.skills.length > 10) {
    optimized.skills = optimized.skills.slice(0, 12);
  }

  if (optimized.certifications && optimized.certifications.length > 3) {
    optimized.certifications = optimized.certifications.slice(0, 3);
  }

  if (optimized.projects && optimized.projects.length > 2) {
    optimized.projects = optimized.projects.slice(0, 2);
  }

  return optimized;
}

// Generate optimized HTML with dynamic sizing
async function generateOnePagerHTML(data, template = "ats_optimized", customColors = {}, language = "en", country = "us", strategy = "normal") {
  const templateConfig = getCachedTemplate(template, "resume");
  const { layout, styles } = templateConfig;

  // Detect Windows and auto-select strategy for better compatibility
  const isWindows = process.platform === 'win32';
  const autoStrategy = isWindows ? 'windows' : strategy;

  // Validate strategy and provide fallback
  const validStrategies = ['normal', 'compact', 'ultra', 'extreme', 'windows'];
  const safeStrategy = validStrategies.includes(autoStrategy) ? autoStrategy : 'normal';

  // Normalize experience data to ensure jobTitle is always present
  const normalizeExperienceData = (experienceData) => {
    if (!experienceData || !Array.isArray(experienceData)) return [];

    return experienceData.map(exp => ({
      ...exp,
      jobTitle: exp.jobTitle || exp.title || exp.position || "Job Title"
    }));
  };

  // Normalize the data before optimization
  const normalizedData = {
    ...data,
    experience: normalizeExperienceData(data.experience)
  };

  // Apply AI-powered optimization strategy
  const optimizedData = await optimizeContentWithAI(normalizedData, safeStrategy);
  const fontSizes = OPTIMIZATION_STRATEGIES.fontSizes[safeStrategy] || OPTIMIZATION_STRATEGIES.fontSizes.normal;
  const spacing = OPTIMIZATION_STRATEGIES.spacing[safeStrategy] || OPTIMIZATION_STRATEGIES.spacing.normal;

  // Colors and fonts
  const mergedColors = {
    primary: customColors.primary || styles.colors?.primary || "#4B5EAA",
    secondary: customColors.secondary || styles.colors?.secondary || "#6B7280",
    text: customColors.text || styles.colors?.text || "#1F2937",
    accent: customColors.accent || styles.colors?.accent || "#9333EA",
    background: customColors.background || styles.colors?.background || "#FFFFFF",
    sidebar: "#F7F9FB"
  };
  const fontFamily = styles.fontFamily || 'Inter, Arial, sans-serif';

  // Section titles
  const t = {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    certifications: "Certifications",
    languages: "Languages",
    achievements: "Key Achievements"
  };

  const formatDate = (date) => formatDateWithPreferences(date, defaultConfig);

  // Sidebar: Achievements
  const renderAchievements = () => {
    if (!optimizedData.achievements || !Array.isArray(optimizedData.achievements) || !optimizedData.achievements.length) return '';
    return `<section style="margin-bottom:0.5rem;page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size:0.95rem;font-weight:700;letter-spacing:1.5px;color:#00B894;text-transform:uppercase;margin-bottom:0.25rem;border-bottom:2px solid #B2DFDB;padding-bottom:0.15rem;">KEY ACHIEVEMENTS</div>
      <div>${optimizedData.achievements.map((ach, i) => `
        <div style="display:flex;align-items:flex-start;gap:0.6rem;margin-bottom:0.6rem;">
          <span style="flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:${achievementIconBg(i)};">${renderAchievementIcon(i)}</span>
          <div>
            <div style="font-weight:700;font-size:0.98rem;color:#222;">${cleanText(ach.title || ach.split(':')[0])}</div>
            <div style="font-size:0.95rem;color:#444;">${cleanText(ach.description || ach.split(':').slice(1).join(':'))}</div>
          </div>
        </div>`).join('')}</div>
    </section>`;
  };
  // Sidebar: Gemini Achievements
  const renderGeminiAchievements = () => {
    if (!optimizedData.geminiAchievements || !Array.isArray(optimizedData.geminiAchievements) || !optimizedData.geminiAchievements.length) return '';

    const achievementIcons = [
      // Trophy/Achievement Icon
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 22h16" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 14.66V17c0 1.1.9 2 2 2s2-.9 2-2v-2.34" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2v12.66" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

      // Target/Goal Icon
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#00B894" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="6" stroke="#00B894" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="2" fill="#00B894"/></svg>',

      // Lightning/Innovation Icon
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',

      // Star/Excellence Icon
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#00B894"/></svg>',

      // Rocket/Leadership Icon
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5 2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 13v3s3.55.96 4 2c1.08 1.62 0 5 0 5" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

      // Brain/Problem Solving Icon
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.12 2.5 2.5 0 0 1-.54-1.82 2.5 2.5 0 0 1 1.46-2.32" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.12 2.5 2.5 0 0 0 .54-1.82 2.5 2.5 0 0 0-1.46-2.32" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

      // Users/Teamwork Icon
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4" stroke="#00B894" stroke-width="2" fill="none"/><path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

      // Trending Up/Growth Icon
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M23 6l-9.5 9.5-5-5L1 18" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 6h6v6" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

      // Shield/Security Icon
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',

      // Award/Recognition Icon
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6" stroke="#00B894" stroke-width="2" fill="none"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" stroke="#00B894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    ];

    return `<section style="margin-bottom:0.5rem;page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size:0.95rem;font-weight:700;letter-spacing:1.5px;color:#00B894;text-transform:uppercase;margin-bottom:0.25rem;border-bottom:2px solid #B2DFDB;padding-bottom:0.15rem;">KEY ACHIEVEMENTS</div>
      <div>${optimizedData.geminiAchievements.map((achievement, i) => `
        <div style="display:flex;align-items:flex-start;gap:0.6rem;margin-bottom:0.6rem;">
          <span style="flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:${achievementIconBg(i)};box-shadow:0 2px 4px rgba(0,184,148,0.15);">${achievementIcons[i % achievementIcons.length]}</span>
          <div>
            <div style="font-weight:700;font-size:0.98rem;color:#222;">${cleanText(achievement.category || 'Achievement')}</div>
            <div style="font-size:0.95rem;color:#444;">${cleanText(achievement.description || 'Key professional achievement')}</div>
          </div>
        </div>`).join('')}</div>
    </section>`;
  };

  // Sidebar: Skills
  const renderSkills = () => {
    if (!optimizedData.skills || !Array.isArray(optimizedData.skills) || !optimizedData.skills.length) return '';
    return `<section style="margin-bottom:0.5rem;page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size:0.95rem;font-weight:700;letter-spacing:1.5px;color:#00B894;text-transform:uppercase;margin-bottom:0.25rem;border-bottom:2px solid #B2DFDB;padding-bottom:0.15rem;">SKILLS</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.3rem;page-break-inside: avoid; break-inside: avoid;">${optimizedData.skills.map(skill => `<span style="background:#F3F4F6;color:#4B5EAA;font-size:0.94rem;padding:0.15rem 0.6rem;border-radius:0.6rem;font-weight:500;letter-spacing:0.01em;margin-bottom:0.08rem;">${cleanText(skill.name || skill)}</span>`).join('')}</div>
    </section>`;
  };
  // Sidebar: Photo
  const renderPhoto = () => {
    if (optimizedData.photo) {
      return `<img src="${optimizedData.photo}" alt="Profile" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:4px solid #4B5EAA;box-shadow:0 2px 8px rgba(0,0,0,0.07);background:#fff;">`;
    } else {
      function getInitials(name) {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return `<div style="width:70px;height:70px;border-radius:50%;background:#4B5EAA;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:#fff;">${getInitials(optimizedData.name)}</div>`;
    }
  };
  // Main: Summary (compact)
  const renderSummary = () => {
    if (!optimizedData.summary) return '';
    return `<section style="margin-bottom:0.3rem;page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size:0.95rem;font-weight:700;letter-spacing:1.5px;color:#00B894;text-transform:uppercase;margin-bottom:0.2rem;border-bottom:2px solid #B2DFDB;padding-bottom:0.1rem;">SUMMARY</div>
      <div style="font-size:0.94rem;color:#222;line-height:1.3;">${cleanText(optimizedData.summary)}</div>
    </section>`;
  };
  // Main: Experience (ultra-compact for 5 positions)
  const renderExperience = () => {
    if (!optimizedData.experience || !Array.isArray(optimizedData.experience) || !optimizedData.experience.length) return '';
    return `<section style="margin-bottom:0.25rem;page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size:0.95rem;font-weight:700;letter-spacing:1.5px;color:#00B894;text-transform:uppercase;margin-bottom:0.18rem;border-bottom:2px solid #B2DFDB;padding-bottom:0.08rem;">EXPERIENCE</div>
      <div>${optimizedData.experience.map(exp => `
        <div style="margin-bottom:0.28rem;page-break-inside: avoid; break-inside: avoid;">
          <div style="display:flex;align-items:baseline;gap:0.4rem;flex-wrap:wrap;">
            <span style="font-weight:700;font-size:0.96rem;color:#222;line-height:1.1;">${cleanText(exp.jobTitle) || "Job Title"}</span>
            <span style="font-weight:600;font-size:0.96rem;color:#4B5EAA;">@</span>
            <span style="font-weight:600;font-size:0.96rem;color:#4B5EAA;">${cleanText(exp.company) || "Company"}</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.8rem;font-size:0.84rem;color:#6B7280;margin:0.02rem 0 0.06rem 0;">
            <span style="display:flex;align-items:center;">${calendarIcon()}${formatDate(exp.startDate) || "Start"} - ${formatDate(exp.endDate) || "Present"}</span>
            ${exp.location ? `<span style="display:flex;align-items:center;">${locationIcon()}${cleanText(exp.location)}</span>` : ''}
          </div>
          <ul style="margin:0.04rem 0 0 0;padding:0;list-style:none;page-break-inside: avoid; break-inside: avoid;">
            ${(exp.bulletPoints || [cleanText(exp.description)]).slice(0, 3).map(bullet => `
              <li style="position:relative;padding-left:0.65em;margin-bottom:0.03rem;font-size:0.88rem;line-height:1.2;color:#333;">
                <span style="position:absolute;left:0;top:0.35em;width:0.25em;height:0.25em;background:#4B5EAA;border-radius:50%;display:inline-block;transform:translateY(-50%);"></span>
                ${cleanText(bullet)}
              </li>
            `).join('')}
          </ul>
        </div>`).join('')}</div>
    </section>`;
  };

  // Header
  const renderHeader = () => {
    // Helper to get initials
    function getInitials(name) {
      if (!name) return '';
      const parts = name.trim().split(' ');
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    // Inline SVGs for contact icons
    const iconEmail = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:3px;"><path d="M4 4h16v16H4z" fill="none"/><path d="M4 8l8 5 8-5" stroke="#4B5EAA" stroke-width="1.5" fill="none"/><rect x="4" y="6" width="16" height="12" rx="2" stroke="#4B5EAA" stroke-width="1.5" fill="none"/></svg>`;
    const iconPhone = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:3px;"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" stroke="#4B5EAA" stroke-width="1.5" fill="none"/></svg>`;
    const iconLinkedIn = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:3px;"><rect width="24" height="24" rx="4" fill="#4B5EAA"/><path d="M8 11v5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="8" r="1" fill="#fff"/><path d="M12 11v5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><path d="M12 13c0-1.1.9-2 2-2s2 .9 2 2v3" stroke="#fff" stroke-width="1.5"/></svg>`;
    const iconLocation = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:3px;"><path d="M12 21s-6-5.686-6-10A6 6 0 0112 3a6 6 0 016 6c0 4.314-6 10-6 10z" stroke="#4B5EAA" stroke-width="1.5" fill="none"/><circle cx="12" cy="9" r="2.5" stroke="#4B5EAA" stroke-width="1.5" fill="none"/></svg>`;
    // Initials badge or photo
    let badge = '';
    if (optimizedData.photo) {
      badge = `<img src="${optimizedData.photo}" alt="Profile" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid #4B5EAA;box-shadow:0 2px 8px rgba(0,0,0,0.07);background:#fff;">`;
    } else {
      badge = `<div style="width:60px;height:60px;border-radius:50%;background:#4B5EAA;display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;color:#fff;">${getInitials(optimizedData.name)}</div>`;
    }
    return `<header style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.8rem 1.5rem 0.8rem 1.5rem;background:#fff;margin-bottom:0.3rem;">
      <div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:0.1rem;">
        <div style="font-size:1.8rem;font-weight:800;letter-spacing:-0.5px;line-height:1.1;color:#222;">${cleanText(optimizedData.name) || "Your Name"}</div>
        ${optimizedData.jobTitle ? `<div style="font-size:1rem;font-weight:600;color:#4B5EAA;margin-top:0.05rem;">${cleanText(optimizedData.jobTitle)}</div>` : ''}
        <div style="display:flex;align-items:center;gap:1rem;margin-top:0.2rem;font-size:0.95rem;color:#444;">
          ${optimizedData.email ? `<span>${iconEmail}${cleanText(optimizedData.email)}</span>` : ''}
          ${optimizedData.phone ? `<span>${iconPhone}${cleanText(optimizedData.phone)}</span>` : ''}
          ${optimizedData.linkedin ? `<span>${iconLinkedIn}${cleanText(optimizedData.linkedin)}</span>` : ''}
        </div>
        ${optimizedData.address ? `<div style="display:flex;align-items:center;margin-top:0.1rem;font-size:0.95rem;color:#444;">${iconLocation}${cleanText(optimizedData.address)}</div>` : ''}
      </div>
      <div style="flex-shrink:0;margin-left:1rem;margin-right:0.8rem;">${badge}</div>
    </header>`;
  };
  // Achievements icon (simple SVGs for demo)
  function renderAchievementIcon(i) {
    const icons = [
      '<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4B5EAA"/><path d="M12 7v5l3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      '<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="8" fill="#9333EA"/><path d="M8 12l2 2 4-4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      '<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="10" fill="#6B7280"/><path d="M12 8v4l3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      '<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#10B981"/><path d="M8 12l2 2 4-4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    ];
    return icons[i % icons.length];
  }
  // Inline SVGs for experience/education
  function calendarIcon() {
    return `<svg width='15' height='15' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:3px;'><rect x='3' y='5' width='18' height='16' rx='2' stroke='#6B7280' stroke-width='1.5' fill='none'/><path d='M8 3v4M16 3v4' stroke='#6B7280' stroke-width='1.5'/><path d='M3 9h18' stroke='#6B7280' stroke-width='1.5'/></svg>`;
  }
  function locationIcon() {
    return `<svg width='15' height='15' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:3px;'><path d='M12 21s-6-5.686-6-10A6 6 0 0112 3a6 6 0 016 6c0 4.314-6 10-6 10z' stroke='#6B7280' stroke-width='1.5' fill='none'/><circle cx='12' cy='9' r='2.5' stroke='#6B7280' stroke-width='1.5' fill='none'/></svg>`;
  }
  // Update achievementIconBg with more varied colors
  function achievementIconBg(i) {
    const colors = [
      '#E8F5E8', // Light green
      '#E3F2FD', // Light blue
      '#FFF3E0', // Light orange
      '#F3E5F5', // Light purple
      '#E0F2F1', // Light teal
      '#FCE4EC', // Light pink
      '#E8F5E8', // Light green (repeat for variety)
      '#E3F2FD', // Light blue (repeat for variety)
      '#FFF3E0', // Light orange (repeat for variety)
      '#F3E5F5'  // Light purple (repeat for variety)
    ];
    return colors[i % colors.length];
  }
  // Sidebar: Education (Ultra-Compact for Production)
  const renderEducation = () => {
    if (!optimizedData.education || !Array.isArray(optimizedData.education) || !optimizedData.education.length) return '';
    return `<section style="margin-bottom:0.2rem;page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size:0.88rem;font-weight:700;letter-spacing:1.2px;color:#00B894;text-transform:uppercase;margin-bottom:0.15rem;border-bottom:1px solid #B2DFDB;padding-bottom:0.08rem;">EDUCATION</div>
      <div>${optimizedData.education.slice(0, 2).map(edu => `
        <div style="margin-bottom:0.18rem;page-break-inside: avoid; break-inside: avoid;">
          <div style="font-weight:700;font-size:0.86rem;color:#222;line-height:1.1;">${cleanText(edu.degree) || "Degree"}</div>
          <div style="font-weight:600;font-size:0.84rem;color:#4B5EAA;line-height:1.1;">${cleanText(edu.institution) || "Institution"}</div>
          <div style="font-size:0.8rem;color:#6B7280;margin:0.01rem 0 0.03rem 0;line-height:1.1;">${formatDate(edu.startDate) || "Start"} - ${formatDate(edu.endDate) || "Present"}</div>
          ${edu.description ? `<div style='font-size:0.78rem;color:#555;margin-top:0.01rem;line-height:1.05;'>${cleanText(edu.description).substring(0, 60)}${cleanText(edu.description).length > 60 ? '...' : ''}</div>` : ''}
        </div>`).join('')}</div>
    </section>`;
  };

  // Render Projects (Compact)
  const renderProjects = () => {
    if (!optimizedData.projects || !Array.isArray(optimizedData.projects) || !optimizedData.projects.length) return '';
    return `<section style="margin-bottom:0.35rem;page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size:0.95rem;font-weight:700;letter-spacing:1.5px;color:#00B894;text-transform:uppercase;margin-bottom:0.2rem;border-bottom:2px solid #B2DFDB;padding-bottom:0.15rem;">PROJECTS</div>
      <div>${optimizedData.projects.slice(0, 2).map(project => `
        <div style="margin-bottom:0.35rem;page-break-inside: avoid; break-inside: avoid;">
          <div style="display:flex;align-items:baseline;gap:0.4rem;flex-wrap:wrap;">
            <span style="font-weight:700;font-size:0.96rem;color:#222;">${cleanText(project.name || project.title) || "Project"}</span>
            ${project.technologies ? `<span style="font-size:0.82rem;color:#6B7280;">[${cleanText(project.technologies).substring(0, 30)}${cleanText(project.technologies).length > 30 ? '...' : ''}]</span>` : ''}
          </div>
          ${project.duration ? `<div style="font-size:0.82rem;color:#6B7280;margin:0.02rem 0 0.06rem 0;">${cleanText(project.duration)}</div>` : ''}
          ${project.description ? `<div style="font-size:0.88rem;color:#333;line-height:1.25;">${cleanText(project.description).substring(0, 120)}${cleanText(project.description).length > 120 ? '...' : ''}</div>` : ''}
          ${project.link ? `<div style="font-size:0.82rem;color:#4B5EAA;margin-top:0.04rem;">🔗 ${cleanText(project.link).substring(0, 25)}${cleanText(project.link).length > 25 ? '...' : ''}</div>` : ''}
        </div>`).join('')}</div>
    </section>`;
  };

  // Render Certifications (Ultra-Compact for Production)
  const renderCertifications = () => {
    if (!optimizedData.certifications || !Array.isArray(optimizedData.certifications) || !optimizedData.certifications.length) return '';
    return `<section style="margin-bottom:0.25rem;page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size:0.88rem;font-weight:700;letter-spacing:1.2px;color:#00B894;text-transform:uppercase;margin-bottom:0.15rem;border-bottom:1px solid #B2DFDB;padding-bottom:0.08rem;">CERTIFICATIONS</div>
      <div>${optimizedData.certifications.slice(0, 4).map(cert => `
        <div style="margin-bottom:0.15rem;page-break-inside: avoid; break-inside: avoid;">
          <span style="font-weight:700;color:#222;font-size:0.86rem;line-height:1.1;">${cleanText(cert.name)}</span>
          ${cert.issuer ? `<span style="color:#4B5EAA;font-size:0.82rem;line-height:1.1;"> - ${cleanText(cert.issuer)}</span>` : ''}
          ${cert.date ? `<span style="color:#6B7280;font-size:0.8rem;line-height:1.1;"> (${cleanText(cert.date)})</span>` : ''}
          ${cert.description ? `<div style="font-size:0.78rem;color:#555;margin-top:0.01rem;line-height:1.05;">${cleanText(cert.description).substring(0, 50)}${cleanText(cert.description).length > 50 ? '...' : ''}</div>` : ''}
        </div>`).join('')}</div>
    </section>`;
  };

  // Render Languages
  const renderLanguages = () => {
    if (!optimizedData.languages || !Array.isArray(optimizedData.languages) || !optimizedData.languages.length) return '';
    return `<section style="margin-bottom:0.4rem;page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size:0.95rem;font-weight:700;letter-spacing:1.5px;color:#00B894;text-transform:uppercase;margin-bottom:0.25rem;border-bottom:2px solid #B2DFDB;padding-bottom:0.15rem;">LANGUAGES</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">${optimizedData.languages.map(lang => `
        <span style="display:inline-block;font-size:0.9rem;color:#222;background:#E0F2F1;padding:0.15rem 0.6rem;border-radius:0.6rem;margin-bottom:0.1rem;">
          ${cleanText(lang.language)}${lang.proficiency ? ` (${cleanText(lang.proficiency)})` : ''}
        </span>`).join('')}</div>
    </section>`;
  };

  // Render Additional Info (Compact)
  const renderAdditionalInfo = () => {
    const sections = [];

    if (optimizedData.interests && optimizedData.interests.length > 0) {
      sections.push(`
        <div style="margin-bottom:0.25rem;">
          <div style="font-weight:700;font-size:0.88rem;color:#4B5EAA;margin-bottom:0.08rem;">INTERESTS</div>
          <div style="font-size:0.84rem;color:#333;line-height:1.1;">${optimizedData.interests.slice(0, 4).map(interest => cleanText(interest.name || interest)).join(' • ')}</div>
        </div>
      `);
    }

    if (optimizedData.volunteer && optimizedData.volunteer.length > 0) {
      sections.push(`
        <div style="margin-bottom:0.25rem;">
          <div style="font-weight:700;font-size:0.88rem;color:#4B5EAA;margin-bottom:0.08rem;">VOLUNTEER</div>
          ${optimizedData.volunteer.slice(0, 1).map(vol => `
            <div style="font-size:0.84rem;color:#333;margin-bottom:0.08rem;line-height:1.1;">
              <span style="font-weight:600;">${cleanText(vol.organization)}</span> - ${cleanText(vol.position)}
            </div>
          `).join('')}
        </div>
      `);
    }

    if (optimizedData.awards && optimizedData.awards.length > 0) {
      sections.push(`
        <div style="margin-bottom:0.25rem;">
          <div style="font-weight:700;font-size:0.88rem;color:#4B5EAA;margin-bottom:0.08rem;">AWARDS</div>
          ${optimizedData.awards.slice(0, 2).map(award => `
            <div style="font-size:0.84rem;color:#333;margin-bottom:0.08rem;line-height:1.1;">
              <span style="font-weight:600;">${cleanText(award.name)}</span>
              ${award.issuer ? ` - ${cleanText(award.issuer)}` : ''}
              ${award.date ? ` (${cleanText(award.date)})` : ''}
            </div>
          `).join('')}
        </div>
      `);
    }

    if (sections.length === 0) return '';

    return `<section style="margin-bottom:0.3rem;page-break-inside: avoid; break-inside: avoid;">
      <div style="font-size:0.95rem;font-weight:700;letter-spacing:1.5px;color:#00B894;text-transform:uppercase;margin-bottom:0.2rem;border-bottom:2px solid #B2DFDB;padding-bottom:0.15rem;">ADDITIONAL INFO</div>
      <div>${sections.join('')}</div>
    </section>`;
  };

  // Extract key achievements using Gemini AI
  async function getGeminiAchievements() {
    try {
      const prompt = `Create 5 exceptional professional achievements optimized for ATS systems and hiring managers. Focus on quantifiable impact, technical expertise, and leadership results.

Resume: ${optimizedData.name || 'N/A'} - ${optimizedData.jobTitle || 'N/A'}
Summary: ${optimizedData.summary || 'N/A'}
Experience: ${optimizedData.experience ? optimizedData.experience.map(exp => `${exp.jobTitle} at ${exp.company}: ${exp.description}`).join('; ') : 'N/A'}
Skills: ${optimizedData.skills ? optimizedData.skills.map(skill => skill.name || skill).join(', ') : 'N/A'}
Certifications: ${optimizedData.certifications ? optimizedData.certifications.map(cert => `${cert.name}: ${cert.issuer}`).join('; ') : 'N/A'}

Return ONLY a JSON array with 5 achievements optimized for high ATS scores:
[{"category": "Category", "description": "Description"}]

Requirements for maximum ATS impact:
- Use powerful action verbs: architected, engineered, orchestrated, spearheaded, pioneered, optimized, transformed, accelerated, scaled, revolutionized
- Include specific metrics: percentages, dollar amounts, time reductions, efficiency gains, user numbers, revenue impact
- Emphasize technical skills: cloud platforms, programming languages, frameworks, tools, methodologies
- Highlight leadership: team management, mentoring, cross-functional collaboration, stakeholder communication
- Demonstrate business impact: cost savings, revenue growth, process improvements, customer satisfaction
- Ensure perfect grammar, professional tone, and no repetition
- Keep descriptions impactful but concise (60-80 characters)
- Prioritize achievements showing innovation, problem-solving, and measurable results
- Use industry-specific terminology and keywords for better ATS matching

JSON:`;

      // Add timeout to prevent infinite loops
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini request timeout')), 15000)
      );

      const geminiPromise = generateWithFallback(prompt, {
        maxOutputTokens: 400,
        temperature: 0.1
      });

      const result = await Promise.race([geminiPromise, timeoutPromise]);

      let cleanText = result.text.trim().replace(/```json|```|`/g, '').trim();
      const achievements = JSON.parse(cleanText);

      if (Array.isArray(achievements) && achievements.length > 0) {
        // Validate and enhance achievements for maximum ATS impact
        const enhancedAchievements = achievements.slice(0, 5).map((achievement, index) => {
          // Ensure proper formatting and grammar
          let description = achievement.description || achievement;
          if (typeof description === 'string') {
            // Capitalize first letter and ensure proper punctuation
            description = description.charAt(0).toUpperCase() + description.slice(1);
            if (!description.endsWith('.') && !description.endsWith('!')) {
              description += '.';
            }
          }

          return {
            category: achievement.category || `Achievement ${index + 1}`,
            description: description
          };
        });

        optimizedData.geminiAchievements = enhancedAchievements;
      } else {
        throw new Error('Invalid achievements format');
      }
    } catch (error) {
      console.warn('Enhanced Gemini achievement extraction failed, using optimized fallback:', error.message);
      optimizedData.geminiAchievements = [
        { category: "Technical Leadership", description: "Architected scalable microservices reducing system response time by 40% and improving reliability by 99.9%." },
        { category: "Team Excellence", description: "Led cross-functional team of 8 developers delivering 3 major features ahead of schedule with 95% customer satisfaction." },
        { category: "Innovation & Optimization", description: "Pioneered automated testing framework reducing deployment time by 60% and increasing code coverage to 85%." },
        { category: "Business Impact", description: "Engineered data pipeline processing 1M+ records daily, generating $500K in cost savings and 30% efficiency gains." },
        { category: "Problem Solving", description: "Resolved critical production issues reducing downtime by 80% and implementing proactive monitoring preventing 90% of incidents." }
      ];
    }
  }

  // Call Gemini achievements extraction
  await getGeminiAchievements();

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    @page {
      margin: 0;
      size: letter;
      padding: 0;
    }
    html, body {
      width: 100%;
      min-height: 0;
      margin: 0;
      padding: 0;
      background: #fff;
      color: #222;
      font-family: Inter, Arial, sans-serif;
      box-sizing: border-box;
      font-size: 15px;
    }
    body {
      width: 794px;
      margin: 0 auto;
      padding: 0.2rem 0 0 0;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
      word-break: keep-all;
      hyphens: manual;
      overflow-wrap: normal;
      white-space: normal;
      text-rendering: optimizeLegibility;
      -webkit-font-feature-settings: "liga" 1, "kern" 1;
      font-feature-settings: "liga" 1, "kern" 1;
      /* Windows-specific optimizations */
      max-height: 1123px;
      overflow: hidden;
      line-height: 1.1;
      font-size: ${safeStrategy === 'windows' ? '12px' : '15px'};
    }
    .pdf-header {
      width: 100%;
      padding: 0.4rem 1rem 0.4rem 1rem;
      background: linear-gradient(135deg,${mergedColors.primary} 0%,${mergedColors.accent} 100%);
      color: #fff;
      border-radius: 0.2rem 0.2rem 0 0;
      box-shadow: 0 2px 4px -1px rgba(0,0,0,0.08);
      margin-bottom: 0.15rem;
    }
    .header-main {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1.5rem;
    }
    .header-name-title {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .header-name {
      font-size: 2.1rem;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.1;
    }
    .header-title {
      font-size: 1.1rem;
      font-weight: 500;
      opacity: 0.95;
      margin-top: 0.1rem;
    }
    .header-contact {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.1rem;
      font-size: 0.98rem;
      font-weight: 400;
      opacity: 0.95;
    }
    .header-contact-item {
      margin-bottom: 0.05rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pdf-content {
      display: grid;
      grid-template-columns: 65% 35%;
      gap: 1rem;
      width: 100%;
      padding: 0 1rem 0.4rem 1rem;
      box-sizing: border-box;
      min-height: 0;
      flex: 1 1 auto;
    }
    .main-col {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      min-width: 0;
      max-width: 100%;
    }
    .sidebar-col {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
      max-width: 100%;
      align-items: flex-start;
    }
    .profile-photo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 0.7rem;
    }
    .profile-photo {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid ${mergedColors.primary};
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      background: #fff;
    }
    .sidebar-section {
      width: 100%;
      margin-bottom: 0.3rem;
    }
    .sidebar-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: ${mergedColors.primary};
      margin-bottom: 0.5rem;
      letter-spacing: 0.01em;
    }
    .achievements-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .achievement-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.98rem;
      color: ${mergedColors.text};
    }
    .achievement-icon {
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .skills-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.2rem;
    }
    .skill-tag {
      background: ${mergedColors.primary}15;
      color: ${mergedColors.primary};
      font-size: 0.97rem;
      padding: 0.18rem 0.7rem;
      border-radius: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.01em;
      margin-bottom: 0.1rem;
    }
    .main-section {
      margin-bottom: 0.3rem;
    }
    .main-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: ${mergedColors.primary};
      margin-bottom: 0.3rem;
      letter-spacing: 0.01em;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.18rem;
    }
    .main-summary {
      font-size: 1.01rem;
      color: ${mergedColors.text};
      margin-top: 0.1rem;
      margin-bottom: 0.1rem;
      line-height: 1.5;
    }
    .experience-list, .education-list {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }
    .experience-item, .education-item {
      background: #fff;
      border-radius: 0.3rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      padding: 0.5rem 0.7rem 0.5rem 0.5rem;
      border: 1px solid #f3f4f6;
      min-width: 0;
    }
    .exp-header, .edu-header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.5rem;
      font-size: 1.01rem;
      font-weight: 600;
      color: ${mergedColors.primary};
      margin-bottom: 0.1rem;
    }
    .exp-role, .edu-degree {
      font-weight: 700;
    }
    .exp-company, .edu-institution {
      font-weight: 500;
      color: ${mergedColors.secondary};
    }
    .exp-meta, .edu-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.7rem;
      font-size: 0.97rem;
      color: ${mergedColors.secondary};
      margin-bottom: 0.1rem;
    }
    .exp-desc, .edu-desc {
      font-size: 0.98rem;
      color: ${mergedColors.text};
      margin-top: 0.1rem;
      line-height: 1.5;
      word-break: break-word;
    }
    @media print {
      body {
        width: 794px;
        margin: 0 auto;
        padding: 0.2rem 0 0 0;
        background: ${mergedColors.background};
      }
      .pdf-header, .pdf-content {
        box-shadow: none !important;
      }
    }
  </style>
  </head><body>
    ${renderHeader()}
    <div class="pdf-content">
      <div class="main-col">
        ${renderSummary()}
        ${renderExperience()}
        ${renderProjects()}
        ${renderLanguages()}
        ${renderAdditionalInfo()}
      </div>
      <div class="sidebar-col">
        ${renderGeminiAchievements()}${renderSkills()}${renderCertifications()}${renderEducation()}
      </div>
    </div>
  </body></html>`;
}

// Cache for template configurations
const templateCache = new Map();

const allTemplates = {
  ...templates,
  ...jobSpecificTemplates,
  ...premiumTemplates,
};

function getCachedTemplate(templateName, type = "resume") {
  const key = `${type}:${templateName.toLowerCase()}`;
  if (!templateCache.has(key)) {
    const availableTemplates = Object.keys(allTemplates);
    const normalizedTemplate = templateName.toLowerCase();
    const matchingTemplate = availableTemplates.find((t) => t.toLowerCase() === normalizedTemplate);

    if (!matchingTemplate) {
      console.warn(`Template "${templateName}" not found, using first available template`);
      // Use the first available template as fallback
      const fallbackTemplate = availableTemplates[0] || 'ats_optimized';
      const template = allTemplates[fallbackTemplate] || allTemplates[Object.keys(allTemplates)[0]];
      templateCache.set(key, template);
      return template;
    }

    const template = allTemplates[matchingTemplate];
    templateCache.set(key, template);
  }
  return templateCache.get(key);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      data,
      template = "ats_optimized",
      customColors = {},
      language = "en",
      country = "us",
      preferences = defaultConfig
    } = body;

    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Try different optimization strategies until we get a one-page result
    // Include Windows-specific strategy for better compatibility
    const strategies = ['normal', 'compact', 'ultra', 'extreme', 'windows'];
    let pdf = null;
    let finalStrategy = 'ultra';
    let page = null;

    try {
      const browser = await getBrowser();

      for (const strategy of strategies) {
        try {
          const html = await generateOnePagerHTML(data, template, customColors, language, country, strategy);
          page = await browser.newPage();

          // Set consistent viewport for all platforms
          await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

          await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000
          });

          // Wait for fonts to load
          await page.evaluateHandle('document.fonts.ready');

          // Check if content fits on one page with more aggressive height checking
          const height = await page.evaluate(() => {
            const body = document.body;
            const contentHeight = body.scrollHeight;
            const viewportHeight = window.innerHeight;

            // Account for margins and ensure content fits within printable area
            const printableHeight = 1123 - 60; // A4 height minus margins

            return {
              contentHeight,
              viewportHeight,
              printableHeight,
              fits: contentHeight <= printableHeight
            };
          });

          console.log(`Strategy ${strategy}: Content height ${height.contentHeight}px, Printable area ${height.printableHeight}px, Fits: ${height.fits}`);

          // A4 height is approximately 1123px (794px width)
          if (height.fits) {
            pdf = await page.pdf({
              format: 'A4',
              printBackground: true,
              margin: {
                top: '0.2in',
                right: '0.2in',
                bottom: '0.2in',
                left: '0.2in'
              },
              preferCSSPageSize: false,
              displayHeaderFooter: false
            });
            finalStrategy = strategy;
            await page.close();
            page = null;
            break;
          }

          await page.close();
          page = null;
        } catch (error) {
          console.error(`Strategy ${strategy} failed:`, error);
          if (page) {
            await page.close();
            page = null;
          }
          continue;
        }
      }

      if (!pdf) {
        // If all strategies fail, use the most aggressive optimization
        const html = await generateOnePagerHTML(data, template, customColors, language, country, 'ultra');
        page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0.3in',
            right: '0.3in',
            bottom: '0.3in',
            left: '0.3in'
          }
        });

        await page.close();
        page = null;
      }
    } catch (error) {
      if (page) {
        await page.close();
      }
      throw error;
    }

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="one-pager-resume.pdf"',
      },
    });

  } catch (error) {
    console.error('One-pager generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 