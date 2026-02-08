import { NextResponse } from "next/server";
import { streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { adminDb } from "../../lib/firebase";
import { createHash } from "crypto";

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { text } = await request.json();


    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          error: "We couldn't read your resume text",
          details: "It looks like we couldn't extract text from your resume PDF. This might happen if the PDF is scanned, image-based, or corrupted. Please try again by uploading a text-based PDF (not a scanned image) or a different resume file."
        },
        { status: 400 }
      );
    }

    console.log("Received Text Length:", text.length);

    const cacheKey = createHash("sha256").update(text).digest("hex");
    console.log("Cache Key:", cacheKey);

    const cacheRef = adminDb.collection("cache").doc(cacheKey);
    const cacheDoc = await cacheRef.get();
    if (cacheDoc.exists) {
      const cachedData = cacheDoc.data();
      console.log("Cache Hit - Returning cached result for key:", cacheKey);
      return NextResponse.json(cachedData.parsedResume, { status: 200 });
    }
    console.log("Cache Miss - Proceeding with xAI call for key:", cacheKey);

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
      experience: [
        {
          jobTitle: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
      education: [
        {
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          gpa: "",
        },
      ],
      skills: [{ name: "", proficiency: "" }],
      certifications: [{ name: "", issuer: "", date: "" }],
      languages: [{ language: "", proficiency: "" }],
      customSections: [
        { type: "", title: "", description: "", date: "", name: "", email: "", phone: "" },
      ],
    };

    if (!process.env.XAI_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: XAI_API_KEY not set" },
        { status: 500 }
      );
    }

    const customSectionOptions = [
      { value: "project", label: "Project" },
      { value: "volunteer", label: "Volunteer Work" },
      { value: "publication", label: "Publication" },
      { value: "reference", label: "Reference" },
      { value: "award", label: "Award" },
      { value: "hobby", label: "Hobby" },
    ];

    const prompt = `
      You are an AI designed to parse resume text and extract structured data for people from all career backgrounds, including but not limited to engineering, healthcare, education, arts, business, and more. Below is the raw text extracted from a PDF resume. Your task is to analyze it and return a JSON object compatible with the following schema:

      ${JSON.stringify(resumeSchema, null, 2)}

      Rules:
      - Fill in as many fields as possible based on the text.
      - If a field can't be determined, leave it as an empty string or an empty array (e.g., [] for sections with no data).
      - For arrays (experience, education, etc.), create multiple entries if the text indicates multiple items.
      - Infer reasonable defaults where applicable (e.g., "Intermediate" for skill proficiency if not specified).
      - Parse dates into a consistent format (e.g., "YYYY-MM" or "YYYY" if partial).
      - Do not invent data that isn’t present.
      - Ensure the output is valid JSON with proper syntax, including closing all arrays and objects.

      Special Instructions for customSections:
      - The customSections array should only include entries that can be confidently categorized into one of these types: ${customSectionOptions
        .map((opt) => opt.value)
        .join(", ")}.
      - Identify the type based on keywords or context in the text, applicable to all professions:
        - "project": Look for terms like "Project", "Initiative", "Led", "Managed", "Created", or specific work outcomes (e.g., "Designed a marketing campaign", "Organized a fundraiser").
        - "volunteer": Look for "Volunteer", "Community", "Pro bono", "Charity", or unpaid contributions (e.g., "Volunteer Teacher", "Food Bank Organizer").
        - "publication": Look for "Published", "Article", "Book", "Research", or citations (e.g., "Authored a nursing journal article", "Wrote a business guide").
        - "reference": Look for "Reference", "Referee", names with contact info (e.g., email/phone), or phrases like "Available upon request".
        - "award": Look for "Award", "Honor", "Recognition", "Prize", or notable achievements (e.g., "Teacher of the Year", "Sales Excellence Award").
        - "hobby": Look for "Hobby", "Interest", "Activity", or personal pursuits (e.g., "Photography", "Marathon Running").
      - For each customSection entry, set the "type" to one of the above values and populate "title", "description", "date", "name", "email", "phone" as applicable.
      - If a section doesn’t clearly match one of these types, exclude it from customSections (do not use generic or empty types).
      - Examples:
        - "Designed a marketing campaign, Jun 2022" → { "type": "project", "title": "Marketing Campaign", "description": "Designed a marketing campaign", "date": "Jun 2022" }
        - "Volunteer Teacher, 2020" → { "type": "volunteer", "title": "Volunteer Teacher", "date": "2020" }
        - "Published Article on Nursing, 2021" → { "type": "publication", "title": "Article on Nursing", "description": "Published Article on Nursing", "date": "2021" }
        - "Jane Smith, jane.smith@company.com" → { "type": "reference", "name": "Jane Smith", "email": "jane.smith@company.com" }
        - "Teacher of the Year, Dec 2021" → { "type": "award", "title": "Teacher of the Year", "date": "Dec 2021" }
        - "Photography Enthusiast" → { "type": "hobby", "title": "Photography", "description": "Photography Enthusiast" }

      Return ONLY the JSON string, without any additional explanation or text outside the JSON. Ensure the JSON is complete and syntactically correct.

      Raw Resume Text:
      "${text}"
    `;

    const result = await streamText({
      model: xai("grok-2-1212", { apiKey: process.env.XAI_API_KEY }),
      prompt,
      maxTokens: 8192, // Increased to reduce truncation
    });

    let jsonString = "";
    try {
      for await (const chunk of result.textStream) {
        jsonString += chunk;
      }
    } catch (streamError) {
      console.error("Stream Error:", streamError);
      return NextResponse.json(
        { error: "Failed to stream AI response", details: streamError.message },
        { status: 500 }
      );
    }

    jsonString = jsonString.trim();
    console.log("Raw JSON String Length:", jsonString.length);
    console.log("Raw JSON String:", jsonString);

    const jsonStart = jsonString.indexOf("{");
    const jsonEnd = jsonString.lastIndexOf("}") + 1;
    if (jsonStart === -1 || jsonEnd === 0) {
      console.error("No valid JSON found in response:", jsonString);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }
    jsonString = jsonString.slice(jsonStart, jsonEnd);

    // Validate JSON syntax before parsing
    let parsedResume;
    try {
      // Quick syntax check
      if (!jsonString.endsWith("}")) {
        throw new SyntaxError("JSON string is incomplete, missing closing brace");
      }
      parsedResume = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw String:", jsonString);
      return NextResponse.json(
        { error: "Failed to parse AI response", details: parseError.message },
        { status: 500 }
      );
    }

    // Clean up empty array entries and ensure compatibility
    const cleanResume = {
      ...resumeSchema,
      ...parsedResume,
      experience: parsedResume.experience?.filter(
        (exp) => exp.jobTitle || exp.company || exp.description
      ) || [],
      education: parsedResume.education?.filter((edu) => edu.institution || edu.degree) || [],
      skills: parsedResume.skills?.filter((skill) => skill.name) || [],
      certifications: parsedResume.certifications?.filter((cert) => cert.name) || [],
      languages: parsedResume.languages?.filter((lang) => lang.language) || [],
      customSections:
        parsedResume.customSections?.filter(
          (cs) =>
            customSectionOptions.some((opt) => opt.value === cs.type) &&
            (cs.title || cs.description || cs.name)
        ) || [],
    };

    // Cache the result in Firestore with a timestamp
    await cacheRef.set({
      parsedResume: cleanResume,
      timestamp: Date.now(),
      text,
    });
    console.log("Cached result in Firestore for key:", cacheKey);

    return NextResponse.json(cleanResume, { status: 200 });
  } catch (error) {
    console.error("Error parsing resume text:", error);
    return NextResponse.json(
      { error: "Failed to parse resume", details: error.message },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";