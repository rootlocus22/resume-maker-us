import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";

export async function POST(req) {
  try {
    const { userId, jobDescription, source, jobTitle, company } = await req.json();

    if (!userId || !jobDescription) {
      return NextResponse.json(
        { error: "User ID and job description are required" },
        { status: 400 }
      );
    }

    // Extract job title and company from JD if not provided
    let extractedTitle = jobTitle || "Job Position";
    let extractedCompany = company || "";

    if (!jobTitle) {
      // Try to extract from first few lines
      const lines = jobDescription.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        extractedTitle = lines[0].substring(0, 100);
      }
    }

    // Save the JD
    const jdData = {
      userId,
      jobDescription,
      jobTitle: extractedTitle,
      company: extractedCompany,
      source: source || "manual", // "ats_checker", "jd_builder", or "manual"
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("saved_job_descriptions").add(jdData);

    console.log(`✅ Job description saved: ${docRef.id} for user ${userId}`);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      jobTitle: extractedTitle,
    });
  } catch (error) {
    console.error("Error saving job description:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save job description" },
      { status: 500 }
    );
  }
}

