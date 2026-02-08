import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import { generateWithFallback } from '../../../lib/geminiFallback';

// Revalidate time for incremental static regeneration if needed (not applicable to API, but good practice to keep in mind)
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set max duration for serverless function (if platform allows)

export async function GET(request) {
    if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const slug = searchParams.get('slug');

        console.log(`Auditing. Slug: ${slug}, Limit: ${limit}`);

        let query = adminDb.collection('global_roles').where('country', '==', 'us');

        if (slug) {
            query = query.where('slug', '==', slug);
        } else {
            query = query.limit(limit);
        }

        const snapshot = await query.get();

        const roles = [];
        const thinPages = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const isThin = checkIsThin(data);

            const roleSummary = {
                id: doc.id,
                slug: data.slug,
                title: data.title || data.slug,
                isThin,
                missingFields: getMissingFields(data),
                _debug_has_job_description: !!data.job_description,
                _debug_len: data.job_description ? data.job_description.length : 0,
                _debug_has_salary: !!data.salary_data,
                _debug_has_mistakes: !!data.common_mistakes
            };

            roles.push(roleSummary);
            if (isThin) thinPages.push(roleSummary);
        });

        return NextResponse.json({
            totalScanned: roles.length,
            thinCount: thinPages.length,
            thinPages,
            allRoles: roles // Return all scanned for inspection
        });

    } catch (error) {
        console.error('Audit failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const batchSize = body.batchSize || 5; // Process 5 at a time to avoid timeout

        // Fetch US roles
        const snapshot = await adminDb.collection('global_roles')
            .where('country', '==', 'us')
            // .where('isThin', '==', true) // Ideally we'd have a flag, but we check manually
            .limit(1000) // Fetch more to find thins deep in the list (past the ones we just fixed)
            .get();

        const thinDocs = [];
        snapshot.forEach(doc => {
            if (checkIsThin(doc.data())) {
                thinDocs.push(doc);
            }
        });

        // Process a batch
        const docsToProcess = thinDocs.slice(0, batchSize);
        const results = [];

        for (const doc of docsToProcess) {
            try {
                const enhancedData = await enhanceContent(doc.data());
                if (enhancedData) {
                    await doc.ref.update({
                        ...enhancedData,
                        lastEnhancedAt: new Date().toISOString(),
                        isThin: false
                    });
                    results.push({ id: doc.id, status: 'updated', title: enhancedData.hero_headline });
                } else {
                    results.push({ id: doc.id, status: 'failed_generation' });
                }
            } catch (err) {
                console.error(`Failed to enhance ${doc.id}:`, err);
                results.push({ id: doc.id, status: 'error', message: err.message });
            }
        }

        return NextResponse.json({
            processed: results.length,
            remainingThin: thinDocs.length - results.length,
            results
        });

    } catch (error) {
        console.error('Enhancement failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function checkIsThin(data) {
    // STRICT SAFETY + RICH CONTENT CHECK:

    // 1. Basic Content Check
    if (!data.job_description || data.job_description.length < 50) return true;

    // 2. Rich Data Check (New Requirement)
    // Even if it has text, if it's missing new schema fields, it needs an upgrade.
    if (!data.salary_data) return true;
    if (!data.common_mistakes || data.common_mistakes.length === 0) return true;
    if (!data.industry_context) return true;

    return false;
}

function getMissingFields(data) {
    const missing = [];
    if (!data.hero_headline) missing.push('hero_headline');
    if (!data.summary_text) missing.push('summary_text');
    if (!data.job_description) missing.push('job_description');
    if (!data.skills_matrix) missing.push('skills_matrix');
    if (!data.interview_questions) missing.push('interview_questions');
    if (!data.faqs) missing.push('faqs');
    return missing;
}

async function enhanceContent(data) {
    const prompt = `
    You are an expert career consultant and SEO copywriter.
    I need you to enhance the content for a job role page.
    
    Role: ${data.slug.replace(/-/g, ' ')}
    Country: United States
    Current Data Context: ${JSON.stringify({
        title: data.title,
        skills: data.skills || data.skills_matrix
    })}

    Please generate a highly detailed, SEO-optimized JSON object with the following fields.
    Make the content "thick", "dense", and extremely valuable for a job seeker.

    Fields required (must match this JSON structure exactly):
    {
      "hero_headline": "Catchy H1 headline (5-10 words)",
      "summary_text": "Compelling intro (2-3 sentences)",
      "job_description": "Comprehensive guide (responsibilities, outlook) in Markdown. At least 400 words.",
      "salary_data": {
        "median": 0, // number
        "min": 0, // number
        "max": 0, // number
        "currency": "$",
        "period": "per year"
      },
      "industry_context": {
        "companies": ["Company A", "Company B", "Company C", "Company D", "Company E"] // Top 5 US employers for this role
      },
      "day_in_life": "A rich, narrative paragraph describing a typical day. At least 150 words.",
      "skills_matrix": {
        "must_have": [{"name": "Skill 1"}, {"name": "Skill 2"}], // Top 5 non-negotiable skills
        "technical": [{"name": "Tech 1"}, {"name": "Tech 2"}] // Top 5 technical tools/skills
      },
      "common_mistakes": ["Mistake 1", "Mistake 2", "Mistake 3", "Mistake 4", "Mistake 5"], // 5 common resume errors for this specific role
      "career_path": ["Junior Role", "Senior Role", "Manager Role", "Director Role"], // Typical progression steps
      "interview_questions": [
        { "question": "Q1", "answer": "Detailed STAR method answer", "difficulty": "Easy/Medium/Hard" }
        // ... 6-8 questions total
      ],
      "faqs": [
        { "q": "Question", "a": "Answer" }
        // ... 6-8 FAQs
      ],
      "meta_title": "SEO title tag (under 60 chars)",
      "meta_description": "SEO meta description (under 160 chars)"
    }

    Return ONLY the raw JSON object. Do not include markdown formatting like \`\`\`json.
  `;

    try {
        const result = await generateWithFallback(prompt, {
            maxOutputTokens: 6000, // Increased for denser content
            temperature: 0.7
        });

        if (!result || !result.text) return null;

        let jsonStr = result.text.trim();
        // Cleanup simple markdown if present
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '');

        const enhanced = JSON.parse(jsonStr);

        // Safety check for critical fields
        if (!enhanced.job_description || !enhanced.interview_questions) {
            console.error("Enhancement returned incomplete JSON");
            return null;
        }

        return enhanced;

    } catch (e) {
        console.error("AI Generation error:", e);
        return null;
    }
}
