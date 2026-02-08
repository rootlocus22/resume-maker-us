/**
 * Logic for Job Search Intelligence Layer
 */

/**
 * Calculates a rule-based fit score between a job and a user's resume
 */
export function calculateFitScore(job, userProfile) {
    if (!job || !userProfile) return 0;

    let score = 0;
    const title = (job.title || "").toLowerCase();
    const userRole = (userProfile.role || "").toLowerCase();

    // 1. Title Match (Max 40 points)
    if (title && userRole) {
        if (title.includes(userRole) || userRole.includes(title)) {
            score += 40;
        } else {
            // Partial match
            const titleWords = title.split(' ');
            const roleWords = userRole.split(' ');
            const commonWords = titleWords.filter(w => w.length > 3 && roleWords.includes(w));
            score += (commonWords.length > 0) ? 20 : 0;
        }
    }

    // 2. Location Match (Max 20 points)
    const jobLoc = (job.location || "").toLowerCase();
    const userLoc = (userProfile.location || "").toLowerCase();
    if (jobLoc && userLoc && (jobLoc.includes(userLoc) || userLoc.includes(jobLoc) || jobLoc.includes('remote'))) {
        score += 20;
    } else if (jobLoc.includes('remote')) {
        score += 20;
    }

    // 3. Status/Recency (Max 20 points)
    // Preference for fresher jobs
    const ageInDays = (new Date() - new Date(job.createdAt || Date.now())) / (1000 * 60 * 60 * 24);
    if (ageInDays < 3) score += 20;
    else if (ageInDays < 7) score += 10;

    return Math.min(98, score);
}

/**
 * Determines if a job application needs a follow-up
 */
export function shouldFollowUp(job) {
    if (job.status !== 'applied' || !job.appliedAt) return false;

    const appliedDays = (new Date() - new Date(job.appliedAt)) / (1000 * 60 * 60 * 24);
    const lastUpdatedDays = (new Date() - new Date(job.updatedAt || job.appliedAt)) / (1000 * 60 * 60 * 24);

    // Follow up if applied > 7 days ago and no update in last 7 days
    return appliedDays >= 7 && lastUpdatedDays >= 7;
}

/**
 * Generates actionable daily tasks from job list
 */
export function generateDailyTasks(jobs = []) {
    const tasks = [];

    // 1. Follow ups
    const followUps = jobs.filter(shouldFollowUp);
    followUps.slice(0, 2).forEach(job => {
        tasks.push({
            id: `follow-up-${job.id}`,
            type: 'follow-up',
            priority: 'high',
            text: `Send follow-up for ${job.title} at ${job.company}`,
            subtext: "Applied 7+ days ago with no response",
            jobId: job.id
        });
    });

    // 2. Apply to saved
    const saved = jobs.filter(j => j.status === 'saved');
    if (saved.length > 0) {
        tasks.push({
            id: 'apply-saved',
            type: 'apply',
            priority: 'medium',
            text: `Submit applications for ${saved.length} saved roles`,
            subtext: "Converting saved jobs to applications increases hire rate by 2x",
            count: saved.length
        });
    }

    // 3. AI Analysis
    const needsAi = jobs.filter(j => !j.aiScore && (j.status === 'saved' || j.status === 'applied'));
    if (needsAi.length > 0) {
        tasks.push({
            id: 'ai-analyze',
            type: 'ai',
            priority: 'low',
            text: `Deep analyze ${needsAi.length} jobs with Gemini AI`,
            subtext: "Get verified fit scores and critical gap analysis",
            count: needsAi.length
        });
    }

    // 4. Default habit
    if (tasks.length < 3) {
        tasks.push({
            id: 'search-new',
            type: 'search',
            priority: 'low',
            text: "Explore 5 new high-match opportunities",
            subtext: "Fresh listings get 4x more replies",
        });
    }

    return tasks;
}

/**
 * Calls the AI matching API to get a deep analysis
 */
export async function fetchAiFitScore(job, rawResumeData) {
    try {
        // Normalize resume data if it's a full document
        const resumeData = rawResumeData.resumeData ? mapResumeToAiFormat(rawResumeData) : rawResumeData;

        const response = await fetch('/api/analyze-job-resume-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jobDescription: `Title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nNotes: ${job.notes || ''}`,
                resumeData
            })
        });

        if (!response.ok) throw new Error('AI analysis failed');

        const result = await response.json();
        return {
            aiScore: result.matchScore,
            aiReasoning: result.reasoning,
            aiMatchedStrengths: result.matchedStrengths,
            aiCriticalGaps: result.criticalGaps
        };
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return null;
    }
}

/**
 * Normalizes varied resume document structures into a standard format for AI matching
 */
export function mapResumeToAiFormat(resumeDoc) {
    if (!resumeDoc) return null;

    // Resume data can be at root or under .resumeData depending on the builder source
    const data = resumeDoc.resumeData || resumeDoc || {};

    // Extract personal info from various possible paths
    const personal = data.personal || data.personalInfo || data.basicInfo || {};

    return {
        name: resumeDoc.name || personal.name || personal.fullName || '',
        summary: personal.summary || data.summary || data.objective || '',
        experience: data.experience || data.workExperience || data.work_experience || [],
        skills: data.skills || [],
        education: data.education || [],
        yearsOfExperience: calculateYearsOfExperience(data.experience || data.workExperience || [])
    };
}

/**
 * Basic helper to estimate total years of experience from experience array
 */
function calculateYearsOfExperience(experience = []) {
    if (!Array.isArray(experience) || experience.length === 0) return 0;

    let totalMonths = 0;
    experience.forEach(exp => {
        try {
            const start = new Date(exp.startDate || exp.start_date || exp.from);
            const end = exp.endDate || exp.end_date || exp.to ? new Date(exp.endDate || exp.end_date || exp.to) : new Date();

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const diff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                if (diff > 0) totalMonths += diff;
            }
        } catch (e) {
            // Skip invalid dates
        }
    });

    return Math.round(totalMonths / 12) || 0;
}


