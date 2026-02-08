
import { NextResponse } from "next/server";
export const maxDuration = 240;

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
    yearsOfExperience: 0,
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

const customSectionOptions = [
    { value: "project", label: "Project" },
    { value: "achievements", label: "Achievements" },
    { value: "volunteer", label: "Volunteer Work" },
    { value: "publication", label: "Publication" },
    { value: "reference", label: "Reference" },
    { value: "award", label: "Award" },
    { value: "hobby", label: "Hobby" },
];

function getPromptText() {
    return `
You are an AI designed to parse resume text and extract structured data for people from all career backgrounds. Below is the text content of a resume. Your task is to analyze it and return a JSON object compatible with the following schema:

IMPORTANT: Pay special attention to project information extraction. Look for:
1. Dedicated project sections
2. Project details within job descriptions
3. Individual projects listed with costs, scopes, completion dates
4. Construction/engineering projects with specific metrics
5. Each distinct project should be captured as a separate entry in customSections with type "project"

${JSON.stringify({ ...resumeSchema, isFresher: false, fresherAnalysis: "" }, null, 2)}

Rules:
- Fill in as many fields as possible based on the text provided.
- If a field can't be determined, leave it as an empty string or an empty array.
- For arrays, create multiple entries if appropriate.
- Infer reasonable defaults where applicable.
- Parse dates into a consistent format (YYYY-MM or YYYY).
- Do not invent data that isn't present.
- Ensure the output is valid JSON.

IMPORTANT: Ensure ALL sections are properly parsed:
- Personal Information
- Summary/Objective
- Experience
- Education
- Skills
- Certifications
- Languages
- Custom Sections (project, achievements, volunteer, publication, reference, award, hobby)

Critical Instructions for yearsOfExperience calculation:
- Calculate the TOTAL YEARS OF PROFESSIONAL EXPERIENCE by analyzing all experience entries.
- Handle overlapping employment periods intelligently.
- Consider part-time vs full-time work.
- Be precise (e.g., 2.5 years).

Critical Instructions for Fresher Detection (isFresher and fresherAnalysis):
- Analyze the resume to determine if the person is a FRESHER.
- Set isFresher to TRUE if total experience is 0-1 years or only internships/projects.
- Set isFresher to FALSE for experienced professionals.
- Provide a brief analysis.

Special Instructions for customSections:
- Categorize into: ${customSectionOptions.map((opt) => opt.value).join(", ")}.
- Identify type based on keywords (e.g., "Project", "Volunteer", "Award").

Special Instructions for Certifications:
- Extract name, issuer, date.

Special Instructions for Languages:
- Extract language and proficiency.

- Return ONLY the JSON string, without any additional text.
`;
}

// Helper to normalize date strings
function normalizeDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;
    if (/^\d{4}$/.test(trimmed)) return trimmed;
    const parts = trimmed.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
    if (parts) return `${parts[1]}-${parts[2]}-${parts[3]}`;
    const ym = trimmed.match(/^(\d{4})[\/-](\d{2})$/);
    if (ym) return `${ym[1]}-${ym[2]}`;
    const monthMap = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const mmyyyy = trimmed.match(/^([A-Za-z]{3,9})[ .,-]+(\d{4})$/);
    if (mmyyyy) {
        const month = monthMap[mmyyyy[1].slice(0, 3)];
        if (month) return `${mmyyyy[2]}-${month}`;
    }
    if (/^\d{4}$/.test(trimmed)) return trimmed;
    return trimmed;
}

function normalizeCertifications(certifications) {
    if (!certifications || !Array.isArray(certifications)) return [];
    return certifications.map(cert => {
        if (typeof cert === 'string') {
            return { name: cert.trim(), issuer: '', date: '' };
        } else if (typeof cert === 'object' && cert.name) {
            return {
                name: cert.name || '',
                issuer: cert.issuer || '',
                date: normalizeDate(cert.date) || ''
            };
        }
        return null;
    }).filter(Boolean);
}

function normalizeLanguages(languages) {
    if (!languages || !Array.isArray(languages)) return [];
    return languages.map(lang => {
        if (typeof lang === 'string') {
            const match = lang.match(/^(.+?)\s*\((.+?)\)$/);
            if (match) {
                return { language: match[1].trim(), proficiency: match[2].trim() };
            } else {
                return { language: lang.trim(), proficiency: '' };
            }
        } else if (typeof lang === 'object' && lang.language) {
            return { language: lang.language || '', proficiency: lang.proficiency || '' };
        }
        return null;
    }).filter(Boolean);
}

export async function POST(req) {
    try {
        const { text } = await req.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        // Validation: Length Limits to prevent abuse
        const MIN_LENGTH = 100; // Require at least enough text for a resume
        const MAX_LENGTH = 25000; // Cap at reasonable size to prevent token limits/abuse

        if (text.trim().length < MIN_LENGTH) {
            return NextResponse.json({ error: `Text is too short. Please provide at least ${MIN_LENGTH} characters.` }, { status: 400 });
        }

        if (text.length > MAX_LENGTH) {
            return NextResponse.json({ error: `Text is too long (${text.length} chars). Maximum allowed is ${MAX_LENGTH}.` }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Server configuration error: GEMINI_API_KEY is not set" }, { status: 500 });
        }

        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Try multiple models for reliability (same strategy as original route)
        const models = ["gemini-2.0-flash-lite-001", "gemini-2.0-flash-lite", "gemini-2.0-flash"];
        let lastError = null;

        for (const modelName of models) {
            try {
                console.log(`Attempting to parse text with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const content = [
                    { text: getPromptText() },
                    { text: `\n\nHere is the resume content to parse:\n\n${text}` }
                ];

                const result = await model.generateContent({
                    contents: [{ role: "user", parts: content }],
                    generationConfig: {
                        temperature: 0.1,
                        responseMimeType: "application/json",
                    },
                });

                const generatedJsonString = result.response.text();
                console.log(`Successfully parsed resume text using ${modelName}`);

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
                    console.error("JSON parsing failed, trying next model or falling back");
                    throw new Error("Failed to parse JSON response");
                }

                const normalizedData = {
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
                    customSections: parsedResume.customSections?.filter(
                        (cs) =>
                            customSectionOptions.some((opt) => opt.value === cs.type) &&
                            (cs.title || cs.description || cs.name)
                    ).map(cs => ({
                        ...cs,
                        date: normalizeDate(cs.date),
                    })) || [],
                };

                return NextResponse.json(normalizedData);
            } catch (error) {
                lastError = error;
                console.log(`Model ${modelName} failed:`, error.message);
                continue;
            }
        }

        throw new Error(`All models failed. Last error: ${lastError?.message}`);

    } catch (error) {
        console.error("Error in text parsing:", error);
        return NextResponse.json(
            { error: "Failed to parse resume text. Please try again or use the standard form." },
            { status: 500 }
        );
    }
}
