import { generateWithFallback } from "../../lib/geminiFallback";
import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase"; // Ensure this references your admin exports
import { createHash } from "crypto";
import mammoth from "mammoth"; // For parsing Word documents
import { trackUploadResume } from "../../lib/liveAnalyticsTracker";

export const maxDuration = 240; // 2 minutes

// Define the resume schema. This will be used to guide the Gemini model's output.
const resumeSchema = {
  name: "",
  jobTitle: "",
  email: "",
  phone: "",
  address: "",
  linkedin: "",
  portfolio: "",
  photo: "",
  summary: "",
  yearsOfExperience: 0, // Total years of professional experience calculated intelligently
  experience: [
    { jobTitle: "", company: "", location: "", startDate: "", endDate: "", description: "" },
  ],
  education: [
    { institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" },
  ],
  skills: [{ name: "", proficiency: "" }],
  certifications: [{ name: "", issuer: "", date: "" }],
  languages: [{ language: "", proficiency: "" }],
  customSections: [
    { type: "", title: "", description: "", date: "", name: "", email: "", phone: "" },
  ],
};

// Define options for custom sections to help the AI categorize them accurately.
const customSectionOptions = [
  { value: "project", label: "Project" },
  { value: "achievements", label: "Achievements" },
  { value: "volunteer", label: "Volunteer Work" },
  { value: "publication", label: "Publication" },
  { value: "reference", label: "Reference" },
  { value: "award", label: "Award" },
  { value: "hobby", label: "Hobby" },
];

/**
 * Detects the file type based on file headers/magic numbers
 * @param {Buffer} headerSection - The first portion of the file buffer
 * @returns {string} - Detected file type
 */
function detectFileType(headerSection) {
  const headerHex = headerSection.subarray(0, 20).toString('hex').toUpperCase();
  const headerText = headerSection.toString('ascii', 0, 50).replace(/[^\x20-\x7E]/g, '.');

  // Common file signatures
  if (headerHex.startsWith('25504446')) return 'PDF';
  if (headerHex.startsWith('504B0304') || headerHex.startsWith('504B0506') || headerHex.startsWith('504B0708')) {
    // Check if it's a DOCX file (ZIP-based Office document)
    const zipContent = headerSection.toString('ascii', 0, 200);
    if (zipContent.includes('word/') || zipContent.includes('document.xml')) {
      return 'Microsoft Word Document (DOCX)';
    }
    return 'ZIP/Office Document (DOCX, XLSX, etc.)';
  }
  if (headerHex.startsWith('D0CF11E0A1B11AE1')) return 'Microsoft Word Document (DOC) - Legacy Format';
  if (headerHex.startsWith('FFD8FF')) return 'JPEG Image';
  if (headerHex.startsWith('89504E47')) return 'PNG Image';
  if (headerHex.startsWith('47494638')) return 'GIF Image';
  if (headerHex.startsWith('424D')) return 'BMP Image';
  if (headerHex.startsWith('52494646') && headerHex.includes('57454250')) return 'WebP Image';
  if (headerHex.startsWith('377ABCAF271C')) return '7-Zip Archive';
  if (headerHex.startsWith('1F8B08')) return 'GZIP Archive';
  if (headerHex.startsWith('526172211A0700') || headerHex.startsWith('526172211A070100')) return 'RAR Archive';
  if (headerText.startsWith('<!DOCTYPE') || headerText.startsWith('<html')) return 'HTML Document';
  if (headerText.startsWith('{') || headerText.trim().startsWith('{')) return 'JSON File';
  if (headerText.includes('<?xml')) return 'XML Document';
  if (headerHex.startsWith('EFBBBF') || /^[\x20-\x7E\s]*$/.test(headerText)) return 'Text File (possibly UTF-8)';

  return `Unknown (Hex: ${headerHex.substring(0, 20)}..., Text: "${headerText.substring(0, 20)}...")`;
}

/**
 * Detects whether a file is a supported document type (PDF or Word)
 * @param {Buffer} fileBuffer - The file content as a Buffer
 * @returns {Object} - { isSupported: boolean, fileType: string, mimeType: string }
 */
export function detectSupportedFileType(fileBuffer) {
  const headerSection = fileBuffer.subarray(0, Math.min(1024, fileBuffer.length));
  const headerHex = headerSection.subarray(0, 20).toString('hex').toUpperCase();
  const headerText = headerSection.toString('latin1');

  // PDF Detection
  if (headerHex.startsWith('25504446') || headerText.includes('%PDF-')) {
    return {
      isSupported: true,
      fileType: 'PDF',
      mimeType: 'application/pdf'
    };
  }

  // DOCX Detection (ZIP-based)
  if (headerHex.startsWith('504B0304') || headerHex.startsWith('504B0506') || headerHex.startsWith('504B0708')) {
    // Check larger section for DOCX signatures
    const zipContent = headerSection.toString('latin1');
    const zipContentAscii = headerSection.toString('ascii', 0, 1000);

    console.log(`[DOCX Detection] Checking ZIP content for Word signatures...`);
    console.log(`[DOCX Detection] ZIP content preview: ${zipContentAscii.substring(0, 200).replace(/[^\x20-\x7E]/g, '.')}`);

    // Multiple ways to detect DOCX
    const hasWordFolder = zipContent.includes('word/') || zipContentAscii.includes('word/');
    const hasDocumentXml = zipContent.includes('document.xml') || zipContentAscii.includes('document.xml');
    const hasWordProcessingML = zipContent.includes('wordprocessingml') || zipContentAscii.includes('wordprocessingml');
    const hasOfficeDocument = zipContent.includes('officeDocument') || zipContentAscii.includes('officeDocument');
    const hasContentTypes = zipContent.includes('[Content_Types].xml') || zipContentAscii.includes('[Content_Types].xml');

    console.log(`[DOCX Detection] hasWordFolder: ${hasWordFolder}`);
    console.log(`[DOCX Detection] hasDocumentXml: ${hasDocumentXml}`);
    console.log(`[DOCX Detection] hasWordProcessingML: ${hasWordProcessingML}`);
    console.log(`[DOCX Detection] hasOfficeDocument: ${hasOfficeDocument}`);
    console.log(`[DOCX Detection] hasContentTypes: ${hasContentTypes}`);

    if (hasWordFolder || hasDocumentXml || hasWordProcessingML || hasOfficeDocument) {
      console.log(`[DOCX Detection] ✅ Detected DOCX file`);
      return {
        isSupported: true,
        fileType: 'DOCX',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
    }

    // If it has Content_Types.xml but no Word-specific markers, it might still be DOCX
    // Let's be more permissive for Office documents
    if (hasContentTypes) {
      console.log(`[DOCX Detection] ⚠️ Found Content_Types.xml, assuming DOCX`);
      return {
        isSupported: true,
        fileType: 'DOCX',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
    }
  }

  // DOC Detection (Legacy format)
  if (headerHex.startsWith('D0CF11E0A1B11AE1')) {
    return {
      isSupported: true,
      fileType: 'DOC',
      mimeType: 'application/msword'
    };
  }

  return {
    isSupported: false,
    fileType: detectFileType(headerSection),
    mimeType: null
  };
}

/**
 * Extracts text content from Word documents (.docx and .doc files)
 * @param {Buffer} wordBuffer - The Word document content as a Buffer
 * @param {string} fileType - The detected file type ('DOCX' or 'DOC')
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromWord(wordBuffer, fileType) {
  try {
    console.log(`[Word Extraction] Processing ${fileType} file (${wordBuffer.length} bytes)`);

    if (fileType === 'DOCX') {
      // Use mammoth to extract text from DOCX
      const result = await mammoth.extractRawText({ buffer: wordBuffer });
      console.log(`[Word Extraction] Successfully extracted ${result.value.length} characters from DOCX`);

      if (result.messages && result.messages.length > 0) {
        console.log(`[Word Extraction] Mammoth messages:`, result.messages);
      }

      return result.value;
    } else if (fileType === 'DOC') {
      // For legacy DOC files, we'll try mammoth but it might not work perfectly
      try {
        const result = await mammoth.extractRawText({ buffer: wordBuffer });
        console.log(`[Word Extraction] Successfully extracted ${result.value.length} characters from DOC`);
        return result.value;
      } catch (docError) {
        console.error(`[Word Extraction] Legacy DOC extraction failed:`, docError);
        throw new Error("Legacy DOC format is not fully supported. Please save your document as DOCX format and try again.");
      }
    }

    throw new Error(`Unsupported Word document type: ${fileType}`);
  } catch (error) {
    console.error(`[Word Extraction Error] Failed to extract text from ${fileType}:`, error);
    throw error;
  }
}

/**
 * Gets the prompt text for Gemini AI
 * @returns {string} - The prompt text
 */
function getPromptText() {
  return `
You are an AI designed to parse resume documents (PDF or Word) and extract structured data for people from all career backgrounds, including but not limited to engineering, healthcare, education, arts, business, and more. Below is a document containing a resume. Your task is to analyze it and return a JSON object compatible with the following schema:

IMPORTANT: Pay special attention to project information extraction. Look for:
1. Dedicated project sections (e.g., "Synopses of Projects", "Projects ongoing/completed")
2. Project details within job descriptions
3. Individual projects listed with costs, scopes, completion dates
4. Construction/engineering projects with specific metrics (Crores, KM, MT, etc.)
5. Each distinct project should be captured as a separate entry in customSections with type "project"

${JSON.stringify({ ...resumeSchema, isFresher: false, fresherAnalysis: "" }, null, 2)}

Rules:
- Fill in as many fields as possible based on the document content.
- If a field can't be determined, leave it as an empty string or an empty array (e.g., [] for sections with no data).
- For arrays (experience, education, skills, certifications, languages, customSections), create multiple entries if the document indicates multiple items.
- Infer reasonable defaults where applicable (e.g., "Intermediate" for skill proficiency if not specified).
- Parse dates into a consistent format (e.g., "YYYY-MM" or "YYYY" if partial).
- Do not invent data that isn't present.
- Ensure the output is valid JSON with proper syntax, including closing all arrays and objects.

IMPORTANT: Ensure ALL sections are properly parsed:
- Personal Information (name, email, phone, address, linkedin, portfolio)
- Summary/Objective
- Experience (jobTitle, company, location, startDate, endDate, description)
- Education (institution, degree, field, startDate, endDate, gpa)
- Skills (name, proficiency)
- Certifications (name, issuer, date)
- Languages (language, proficiency)
- Custom Sections (type, title, description, date, name, email, phone)

Critical Instructions for yearsOfExperience calculation:
- Calculate the TOTAL YEARS OF PROFESSIONAL EXPERIENCE by analyzing all experience entries.
- Handle overlapping employment periods intelligently (don't double-count).
- Consider part-time vs full-time work (part-time counts as proportional time).
- Understand date formats like "Present", "Current", "Ongoing", "2020-Now", etc.
- Account for employment gaps and only count actual working time.
- For internships, count them but weight them appropriately (e.g., 6-month internship = 0.5 years).
- If experience shows "5+ years" or "10+ years" in descriptions, use that information.
- For consulting/contract work, add up the total duration.
- Be precise: use decimal values like 2.5 years, 7.8 years, etc.
- If unclear, make a reasonable estimate based on the available information.
- Example calculations:
  * Job 1: 2020-2023 (3 years) + Job 2: 2018-2020 (2 years) = 5.0 years total
  * Job 1: Jan 2020-Present (assuming 2024) = 4.0 years
  * Overlapping: Job 1: 2020-2022, Job 2: 2021-2023 = 3.0 years (not 4)
  * Part-time: 2019-2021 part-time (20 hrs/week) = 1.0 year equivalent

Critical Instructions for Fresher Detection (isFresher and fresherAnalysis):
- Analyze the resume to determine if the person is a FRESHER (recent graduate with minimal professional experience).
- Set isFresher to TRUE if ANY of these conditions apply:
  * Total professional experience is 0-1 years
  * Recent graduation (2023-2025) with no significant work experience
  * Only internships, part-time jobs, or projects (no full-time professional roles)
  * Resume shows clear signs of being entry-level or student
  * Job titles like "Intern", "Trainee", "Graduate", "Entry Level"
  * Education section shows recent completion (within 1-2 years)
- Set isFresher to FALSE for experienced professionals with:
  * 2+ years of full-time professional experience
  * Senior job titles (Manager, Lead, Senior, etc.)
  * Multiple full-time positions
  * Clear career progression
- In fresherAnalysis, provide a brief explanation (1-2 sentences) of why you classified them as fresher or professional.
- Examples:
  * isFresher: true, fresherAnalysis: "Recent 2024 graduate with only internship experience and 0.5 years total experience"
  * isFresher: false, fresherAnalysis: "Experienced professional with 5+ years in software development across multiple companies"

Special Instructions for customSections:
- The customSections array should only include entries that can be confidently categorized into one of these types: ${customSectionOptions.map((opt) => opt.value).join(", ")}.
- STRICTLY Categorize custom sections based on the section header in the original resume.
  * If a section is titled "Projects", "Key Projects", "Project Experience", etc., ALL items in it MUST be type "project".
  * If a section is titled "Achievements", "Accomplishments", etc., ALL items in it MUST be type "achievements".
  * If a section is titled "Volunteering", "Social Work", etc., ALL items in it MUST be type "volunteer".
- Identify the type based on keywords or context in the document, applicable to all professions:
  - "project": Look for terms like "Project", "Initiative", "Led", "Managed", "Created", "Synopses of Projects", "Projects ongoing/completed", "Project Cost/Scope", "Project Profile", "Job Profile", "Completed", "Commissioned", "Erected", "Fabricated", "Supervised", "Worked for", "Job is Profile", or specific work outcomes with project details, costs, scopes, and completion status.
  - "volunteer": Look for "Volunteer", "Community", "Charity", etc.
  - "publication": Look for "Published", "Article", "Research", etc.
  - "reference": Look for "Reference", "Referee", contact info.
  - "achievements": Look for "Achievements", "Key Achievements", "Major Accomplishments", "Notable Achievements", "Highlights", "Key Results", "Performance Highlights", "Success Metrics", "Quantified Results", "Impact", "Contributions", "Deliverables", "Outcomes", "Results", "Accomplishments", "Milestones", "Breakthroughs", "Innovations", "Improvements", "Efficiency Gains", "Cost Savings", "Revenue Growth", "Customer Satisfaction", "Team Leadership", "Process Optimization", etc.
  - "award": Look for "Award", "Honor", "Recognition", "Certificate", "Medal", "Trophy", "Prize", "Distinction", "Commendation", "Accolade", "Badge", "Credential", "Accreditation", "Licensure", "Qualification", etc.
  - "hobby": Look for "Hobby", "Interest", "Passion", "Personal Interest", "Recreational Activity", "Leisure Activity", "Side Project", "Personal Project", "Creative Pursuit", "Volunteer Interest", "Community Involvement", "Extracurricular", "Personal Development", etc.

SMART TITLE GENERATION RULES (CRITICAL):
- NEVER use generic section headers (like "Achievements", "Projects", "Hobbies", "Awards") as the title for an individual item.
- If an item does not have a clear specific title, GENERATE a smart, concise title (3-6 words) based on the item's content.
- Examples of Smart Titles:
  *   BAD: Title: "Achievements", Description: "Best Officer in Srirampur Area"
  *   GOOD: Title: "Best Officer Award", Description: "Recognized as Best Officer in Srirampur Area, SCCL."
  *   BAD: Title: "Achievements", Description: "Achieved 100% target..."
  *   GOOD: Title: "Production Target Achievement", Description: "Achieved 100% target of 3.5MTPA at SRP OCP..."
- For "achievements" type: If multiple achievements are listed without titles, create a separate entry for each with a generated smart title.

CRITICAL PROJECT DETECTION RULES:
- Look for dedicated project sections with titles like "Synopses of Projects", "Projects ongoing/completed", "Project Details", etc.
- Extract individual projects from numbered lists, bullet points, or table formats under project sections
- For table-formatted projects, extract each row as a separate project entry
- Capture project information including: project name, cost/scope, completion status, duration, and key achievements
- For construction/engineering resumes, look for project details with costs (Crores), scope (KM, MT, etc.), and completion dates
- Include projects mentioned in job descriptions that have specific deliverables, costs, or completion metrics
- Each distinct project should be a separate entry in customSections with type "project"
- When you see a project table with columns like "Name of Projects", "Project Cost/Scope", "Progress/Remarks", extract each row as a separate project

Special Instructions for Certifications:
- Look for dedicated certification sections with titles like "Certifications", "Certificates", "Professional Certifications", "Licenses", etc.
- Extract certification information including: certification name, issuing organization, and date
- Look for certifications mentioned in other sections (education, skills, etc.)
- Include professional licenses, training certificates, and industry-specific certifications
- For construction/engineering resumes, look for safety certifications, technical certifications, and professional licenses
- Return certifications as objects with properties: name (required), issuer (optional), date (optional)
- Example format: {"name": "Project Management Professional (PMP)", "issuer": "PMI", "date": "2020"}

Special Instructions for Languages:
- Look for dedicated language sections with titles like "Languages", "Language Skills", "Language Proficiency", etc.
- Extract language information including: language name and proficiency level
- Look for languages mentioned in other sections (personal info, skills, etc.)
- Include proficiency levels like "Native", "Fluent", "Professional", "Intermediate", "Basic", "Conversational"
- For international resumes, pay attention to language skills that might be mentioned in education or experience sections
- Common languages to look for: English, Hindi, Spanish, French, German, Chinese, Japanese, Arabic, etc.
- Return languages as objects with properties: language (required), proficiency (optional)
- Example format: {"language": "Hindi", "proficiency": "Native"}

- Return ONLY the JSON string, without any additional text.
`;
}

/**
 * Extracts structured resume data from a PDF or Word document buffer using the Gemini API.
 * @param {Buffer} documentBuffer - The document content as a Buffer.
 * @param {string} fileType - The file type ('PDF', 'DOCX', or 'DOC')
 * @returns {Promise<Object>} A JSON object containing the extracted resume data.
 * @throws {Error} If the GEMINI_API_KEY is not set, or if the Gemini extraction or parsing fails.
 */
export async function extractResumeWithGemini(documentBuffer, fileType = 'PDF') {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    // Return a structured error that can be caught and returned as JSON
    const error = new Error("Server configuration error: GEMINI_API_KEY is not set.");
    error.statusCode = 500;
    error.isConfigError = true;
    throw error;
  }

  console.log(`[Document Validation] Processing ${fileType} file (${documentBuffer.length} bytes)`);

  if (documentBuffer.length < 100) {
    const errorMsg = `File too small: ${documentBuffer.length} bytes (minimum 100 bytes required)`;
    console.error(`[Document Validation Error] ${errorMsg}`);
    throw new Error(`The uploaded file is too small to be a valid ${fileType}.`);
  }

  let content;

  if (fileType === 'PDF') {
    // Enhanced PDF validation with detailed error logging
    const headerSection = documentBuffer.subarray(0, Math.min(1024, documentBuffer.length));
    const headerText = headerSection.toString('latin1');
    const headerHex = headerSection.subarray(0, 50).toString('hex');
    const headerAscii = headerSection.subarray(0, 100).toString('ascii', 0, 100).replace(/[^\x20-\x7E]/g, '.');

    console.log(`[PDF Validation] Header (first 100 chars): "${headerAscii}"`);
    console.log(`[PDF Validation] Header (first 50 bytes hex): ${headerHex}`);
    console.log(`[PDF Validation] Looking for PDF markers in first ${headerSection.length} bytes`);

    const hasPdfHeader = headerText.includes('%PDF-');
    const hasGenericPdf = headerText.includes('PDF');

    console.log(`[PDF Validation] Found '%PDF-' header: ${hasPdfHeader}`);
    console.log(`[PDF Validation] Found 'PDF' text: ${hasGenericPdf}`);

    if (!hasPdfHeader && !hasGenericPdf) {
      const errorDetails = {
        fileSize: documentBuffer.length,
        headerPreview: headerAscii,
        headerHex: headerHex,
        searchedBytes: headerSection.length,
        foundPdfHeader: hasPdfHeader,
        foundPdfText: hasGenericPdf
      };

      console.error(`[PDF Validation Error] File rejected - not a valid PDF:`, errorDetails);
      console.error(`[PDF Validation Error] File appears to be: ${detectFileType(headerSection)}`);

      throw new Error("The uploaded file does not appear to be a valid PDF.");
    }

    console.log(`[PDF Validation] ✅ File passed PDF validation`);

    // For PDF, send the binary data directly
    const base64Document = documentBuffer.toString("base64");
    content = [
      { text: getPromptText() },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Document,
        },
      },
    ];
  } else {
    // For Word documents, extract text first then send as text
    console.log(`[Word Processing] Extracting text from ${fileType} document...`);
    const extractedText = await extractTextFromWord(documentBuffer, fileType);

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error(`Could not extract any text from the ${fileType} document. Please ensure the document contains readable text.`);
    }

    console.log(`[Word Processing] ✅ Extracted ${extractedText.length} characters from ${fileType}`);

    // Send extracted text to Gemini
    content = [
      { text: getPromptText() },
      { text: `\n\nHere is the resume content extracted from a ${fileType} document:\n\n${extractedText}` }
    ];
  }

  try {
    // For parse resume, we need to use the GoogleGenerativeAI directly since we're sending file content
    // But we'll implement fallback by trying different models
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Try different models in order
    const models = ["gemini-2.0-flash-lite-001", "gemini-2.0-flash-lite", "gemini-2.0-flash"];
    let lastError = null;

    for (const modelName of models) {
      try {
        console.log(`Attempting to parse resume with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent({
          contents: [{ role: "user", parts: content }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });

        const generatedJsonString = result.response.text();
        console.log(`Successfully parsed resume using ${modelName}`);

        // Parse the JSON response
        let parsedResume;
        try {
          let jsonString = generatedJsonString.trim();
          if (jsonString.startsWith("```json") && jsonString.endsWith("```")) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
          } else if (jsonString.startsWith("```") && jsonString.endsWith("```")) {
            jsonString = jsonString.substring(3, jsonString.length - 3).trim();
          }
          parsedResume = JSON.parse(jsonString);
        } catch (err) {
          console.error("Failed to parse Gemini response JSON:", generatedJsonString, err);
          throw new Error("Failed to parse Gemini response: " + err.message);
        }

        return {
          ...resumeSchema,
          ...parsedResume,
          experience: parsedResume.experience?.filter(
            (exp) => exp.jobTitle || exp.company || exp.description
          ).map(exp => ({
            ...exp,
            startDate: normalizeDate(exp.startDate),
            endDate: normalizeDate(exp.endDate),
          })) || [],
          education: parsedResume.education?.filter(
            (edu) => edu.institution || edu.degree
          ).map(edu => ({
            ...edu,
            startDate: normalizeDate(edu.startDate),
            endDate: normalizeDate(edu.endDate),
          })) || [],
          skills: parsedResume.skills?.filter((skill) => skill.name) || [],
          certifications: normalizeCertifications(parsedResume.certifications),
          languages: normalizeLanguages(parsedResume.languages),
          customSections:
            parsedResume.customSections?.filter(
              (cs) =>
                customSectionOptions.some((opt) => opt.value === cs.type) &&
                (cs.title || cs.description || cs.name)
            ).map(cs => ({
              ...cs,
              date: normalizeDate(cs.date),
            })) || [],
        };

      } catch (error) {
        lastError = error;
        const errorMessage = error.message?.toLowerCase() || '';

        // Check if this is an overload error
        const isOverloadError = [
          "model is overloaded",
          "503 service unavailable",
          "quota exceeded",
          "rate limit exceeded",
          "resource exhausted"
        ].some(pattern => errorMessage.includes(pattern));

        if (isOverloadError) {
          console.log(`Model ${modelName} is overloaded, trying next model...`);
          continue; // Try next model
        } else {
          console.log(`Model ${modelName} failed with non-overload error:`, errorMessage);
          continue; // Still try next model
        }
      }
    }

    // If all models failed, throw the last error
    console.error("All Gemini models failed for resume parsing. Last error:", lastError);

    // Check for specific error types
    const errorMessage = lastError?.message || 'Unknown error';
    const errorMessageLower = errorMessage.toLowerCase();

    // Handle 403/Permission Denied errors from Gemini API
    if (errorMessageLower.includes('403') ||
      errorMessageLower.includes('forbidden') ||
      errorMessageLower.includes('permission_denied') ||
      errorMessageLower.includes('permission denied')) {
      console.error("[Gemini API] 403 Forbidden error detected - API key may be invalid or quota exceeded");
      throw new Error(`API_PERMISSION_DENIED: ${errorMessage}`);
    }

    throw new Error(`All Gemini models are currently unavailable for resume parsing. Please try again later. Last error: ${errorMessage}`);

  } catch (err) {
    console.error(`[Gemini API Error] ${err.message}`);

    // Check for 403/Permission Denied errors first
    if (err.message && (
      err.message.toLowerCase().includes('403') ||
      err.message.toLowerCase().includes('forbidden') ||
      err.message.toLowerCase().includes('permission_denied') ||
      err.message.toLowerCase().includes('permission denied')
    )) {
      console.error("[Gemini API] 403 Forbidden/Permission Denied error detected");
      throw new Error(`API_PERMISSION_DENIED: ${err.message}`);
    }

    // Check for rate limiting, quota exceeded, or API overload errors
    if (err.message && (
      err.message.toLowerCase().includes('quota') ||
      err.message.toLowerCase().includes('rate limit') ||
      err.message.toLowerCase().includes('resource_exhausted') ||
      err.message.toLowerCase().includes('too_many_requests') ||
      err.message.toLowerCase().includes('service unavailable')
    )) {
      // Return 429 for rate limiting to trigger fallback
      console.error("[Gemini API] Rate limiting or quota error detected");
      throw new Error(`API_RATE_LIMIT: ${err.message}`);
    }

    // Check for server errors
    if (err.message && (
      err.message.toLowerCase().includes('internal_error') ||
      err.message.toLowerCase().includes('backend_error') ||
      err.message.toLowerCase().includes('server_error') ||
      err.message.toLowerCase().includes('service_error')
    )) {
      // Return 500 for server errors to trigger fallback
      console.error("[Gemini API] Server error detected");
      throw new Error(`API_SERVER_ERROR: ${err.message}`);
    }

    // For other errors, re-throw as-is
    throw err;
  }
}

// Add a helper to normalize certifications from string format to object format
function normalizeCertifications(certifications) {
  if (!certifications || !Array.isArray(certifications)) return [];

  return certifications.map(cert => {
    if (typeof cert === 'string') {
      // Parse string format like "Project Management Professional (PMP)" or "PMP from PMI"
      const name = cert.trim();
      return {
        name: name,
        issuer: '', // Default empty issuer
        date: '' // Default empty date
      };
    } else if (typeof cert === 'object' && cert.name) {
      // Already in object format
      return {
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: normalizeDate(cert.date) || ''
      };
    }
    return null;
  }).filter(Boolean);
}

// Add a helper to normalize languages from string format to object format
function normalizeLanguages(languages) {
  if (!languages || !Array.isArray(languages)) return [];

  return languages.map(lang => {
    if (typeof lang === 'string') {
      // Parse string format like "Hindi (Native)" or "English (Fluent)"
      const match = lang.match(/^(.+?)\s*\((.+?)\)$/);
      if (match) {
        return {
          language: match[1].trim(),
          proficiency: match[2].trim()
        };
      } else {
        // If no parentheses, treat the whole string as language name
        return {
          language: lang.trim(),
          proficiency: ''
        };
      }
    } else if (typeof lang === 'object' && lang.language) {
      // Already in object format
      return {
        language: lang.language || '',
        proficiency: lang.proficiency || ''
      };
    }
    return null;
  }).filter(Boolean);
}

// Add a helper to normalize date strings
function normalizeDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed; // yyyy-MM-dd
  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed; // yyyy-MM
  if (/^\d{4}$/.test(trimmed)) return trimmed; // yyyy
  // Try to parse common formats
  const parts = trimmed.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
  if (parts) return `${parts[1]}-${parts[2]}-${parts[3]}`;
  const ym = trimmed.match(/^(\d{4})[\/-](\d{2})$/);
  if (ym) return `${ym[1]}-${ym[2]}`;
  // Try to parse month names (e.g., Jan 2020, January 2020)
  const monthMap = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
  const mmyyyy = trimmed.match(/^([A-Za-z]{3,9})[ .,-]+(\d{4})$/);
  if (mmyyyy) {
    const month = monthMap[mmyyyy[1].slice(0, 3)];
    if (month) return `${mmyyyy[2]}-${month}`;
  }
  // If it's just a year
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  // Fallback: return as-is
  return trimmed;
}



// Ensure this route is always accessible and returns JSON
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    // Check if GEMINI_API_KEY is available first
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set.");
      return NextResponse.json({
        error: "Server configuration error: GEMINI_API_KEY is not set.",
        details: "Please contact support."
      }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const documentBuffer = Buffer.from(arrayBuffer);

    // Detect file type first
    const fileDetection = detectSupportedFileType(documentBuffer);
    console.log(`[File Detection] Detected file type: ${fileDetection.fileType} (supported: ${fileDetection.isSupported})`);

    if (!fileDetection.isSupported) {
      console.error(`[File Detection Error] Unsupported file type: ${fileDetection.fileType}`);
      return NextResponse.json({
        error: `Unsupported file type: ${fileDetection.fileType}. Please upload a PDF, DOCX, or DOC file.`,
        details: `Detected file type: ${fileDetection.fileType}`
      }, { status: 400 });
    }

    let resumeData;
    try {
      resumeData = await extractResumeWithGemini(documentBuffer, fileDetection.fileType);
    } catch (err) {
      console.error("Error during resume extraction:", err);

      // Handle configuration errors (should return 500, not 400)
      if (err.isConfigError || err.statusCode === 500) {
        return NextResponse.json(
          {
            error: "Server configuration error. Please contact support.",
            details: err.message
          },
          { status: 500 }
        );
      }

      // Map known Gemini errors to user-friendly messages
      let userMessage = `Resume extraction failed. Please try again with a different or clearer ${fileDetection.fileType}.`;
      const details = (err.message || "").toLowerCase();

      // Handle API permission denied errors (403)
      if (details.includes("api_permission_denied") || details.includes("403") || details.includes("forbidden")) {
        userMessage = "API access denied. Please check your API configuration or contact support.";
        return NextResponse.json(
          {
            error: userMessage,
            details: "The API key may be invalid, expired, or the service may be temporarily unavailable.",
            code: "API_PERMISSION_DENIED"
          },
          { status: 403 }
        );
      }

      if (details.includes("no pages")) {
        userMessage = `The uploaded file appears to be empty or not a valid ${fileDetection.fileType}. Please upload a valid resume file.`;
      } else if (details.includes("not appear to be a valid")) {
        userMessage = `The uploaded file is not a valid ${fileDetection.fileType}. Please upload a proper resume file.`;
      } else if (details.includes("quota") || details.includes("rate limit") || details.includes("api_rate_limit")) {
        userMessage = "The system is currently busy. Please wait a few minutes and try again.";
      } else if (details.includes("parse gemini response")) {
        userMessage = "We couldn't understand the resume content. Please try a different or simpler file.";
      } else if (details.includes("too small")) {
        userMessage = `The uploaded file is too small to be a valid ${fileDetection.fileType}. Please upload a proper resume file.`;
      } else if (details.includes("could not extract any text")) {
        userMessage = "Could not extract text from the Word document. Please ensure the document contains readable text and try again.";
      } else if (details.includes("legacy doc format")) {
        userMessage = "Legacy DOC format is not fully supported. Please save your document as DOCX format and try again.";
      }

      // Log as warning for user errors (400s) to keep error logs clean for actual crashes
      console.warn(`[Resume Extraction Warning] User Message: ${userMessage}`);
      console.warn(`[Resume Extraction Warning] Original Error: ${err.message}`);
      // Only log stack trace for non-validation errors
      if (!details.includes("legacy doc") && !details.includes("unsupported file")) {
        console.warn(`[Resume Extraction Warning] Error Stack:`, err.stack);
      }

      // Always return JSON, never plain text
      return NextResponse.json(
        { error: userMessage, details: err.message },
        { status: 400 }
      );
    }

    if (!resumeData || typeof resumeData !== "object") {
      return NextResponse.json({
        error: `We couldn't extract information from your resume. Please try a different or clearer ${fileDetection.fileType}.`
      }, { status: 400 });
    }

    // Track analytics for customer support - detect entry point from referrer
    try {
      // Debug all headers first
      const allHeaders = {};
      req.headers.forEach((value, key) => {
        allHeaders[key] = value;
      });


      const referrer = req.headers.get('referer') || req.headers.get('referrer') || '';
      const userAgent = req.headers.get('user-agent') || '';
      const origin = req.headers.get('origin') || '';
      const host = req.headers.get('host') || '';



      // Detect entry point from referrer URL with more specific matching
      let entryPoint = 'upload-resume'; // default
      let pageUrl = '/upload-resume'; // default



      // More specific referrer detection with multiple fallback methods
      let detectionMethod = 'default';

      if (referrer.includes('/ats-score-checker') ||
        referrer.includes('/ats-checker') ||
        referrer.includes('ats-score') ||
        referrer.includes('ats_score')) {
        entryPoint = 'ats-score-checker';
        pageUrl = '/ats-score-checker';
        detectionMethod = 'referrer';
        console.log(`🎯 Detected ATS Score Checker from referrer`);
      } else if (referrer.includes('/upload-resume') ||
        referrer.includes('upload_resume')) {
        entryPoint = 'upload-resume';
        pageUrl = '/upload-resume';
        detectionMethod = 'referrer';
        console.log(`🎯 Detected Upload Resume from referrer`);
      } else if (origin && host) {
        // Fallback 1: Check if origin + host suggests ATS checker
        console.log(`⚠️ No referrer, trying origin detection: ${origin} + ${host}`);

        // For now, keep default but log this scenario
        detectionMethod = 'origin_fallback';
      } else {
        // Fallback 2: Check User-Agent for any clues

        detectionMethod = 'user_agent_fallback';
      }



      // If still no referrer, let's add a custom header detection
      const customEntryPoint = req.headers.get('x-entry-point');
      if (customEntryPoint) {
        entryPoint = customEntryPoint;
        pageUrl = `/${customEntryPoint}`;
        detectionMethod = 'custom_header';
        console.log(`🎯 Using custom entry point header: ${customEntryPoint}`);
      }

      console.log(`🔍 Final detected entry point: ${entryPoint}`);

      // Validate resumeData before tracking
      if (!resumeData || typeof resumeData !== 'object') {
        console.error('❌ Resume data is invalid for analytics tracking:', resumeData);
        console.log('⚠️ Skipping analytics tracking due to invalid resume data');
        return NextResponse.json(resumeData);
      }

      console.log('📋 Resume data for tracking:', {
        name: resumeData.name,
        email: resumeData.email,
        hasData: !!resumeData,
        dataType: typeof resumeData,
        keys: Object.keys(resumeData)
      });

      // Wrap analytics in a timeout to prevent it from blocking/timing out the main request
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Analytics tracking timed out')), 5000);
        });

        const analyticsPromise = trackUploadResume(resumeData, {
          pageUrl,
          userAgent,
          sessionId: req.headers.get('x-session-id') || undefined,
          referrer,
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
          entryPoint,
        });

        const result = await Promise.race([analyticsPromise, timeoutPromise]);

        if (result && result.isDuplicate) {
          console.log(`⚠️ Duplicate analytics entry skipped for ${entryPoint}`);
        } else {
          console.log(`✅ Analytics tracked for ${entryPoint}`);
        }
      } catch (analyticsError) {
        // Just log and continue, don't fail the request
        console.warn(`⚠️ Analytics tracking failed or timed out: ${analyticsError.message}`);
      }
    } catch (setupError) {
      console.warn("Analytics setup error:", setupError);
    }

    // Cache the parsed resume data for future identical requests.
    // await cacheRef.set(resumeData); // This line is commented out
    console.log(`✅ Successfully parsed ${fileDetection.fileType} resume and cached result`);
    return NextResponse.json(resumeData);
  } catch (err) {
    console.error("Error in POST handler:", err);
    // Map known errors to user-friendly messages
    let userMessage = "Failed to process your resume. Please try again with a valid PDF or Word document.";
    const details = (err.message || "").toLowerCase();
    if (details.includes("no file uploaded")) {
      userMessage = "No file was uploaded. Please select a resume file to upload.";
    } else if (details.includes("unsupported file type")) {
      userMessage = "Unsupported file type. Please upload a PDF, DOCX, or DOC file.";
    } else if (details.includes("quota") || details.includes("rate limit")) {
      userMessage = "The system is currently busy. Please wait a few minutes and try again.";
    }

    // Log as warning if it's a known user error
    if (userMessage.includes("unsupported") || userMessage.includes("No file")) {
      console.warn(`[POST Handler Warning] ${userMessage}`);
      console.warn(`[POST Handler Warning] Original Error: ${err.message}`);
    } else {
      console.error(`[POST Handler Error] User Message: ${userMessage}`);
      console.error(`[POST Handler Error] Original Error: ${err.message}`);
      console.error(`[POST Handler Error] Error Stack:`, err.stack);
    }

    return NextResponse.json({ error: userMessage, details: err.message }, { status: 400 });
  }
}
