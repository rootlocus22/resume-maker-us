import { NextResponse } from 'next/server';
import { generateWithFallback } from '../../lib/geminiFallback';
import { adminDb } from '../../lib/firebase';
export const maxDuration = 120; // 2 minutes

export async function POST(request) {
  try {
    const { resumeData, userPlan, userId, forceRegenerate = false } = await request.json();

    if (!resumeData || !userId) {
      return NextResponse.json(
        { error: 'Resume data and userId are required' },
        { status: 400 }
      );
    }

    // Check if we have a cached analysis (unless force regenerate)
    if (!forceRegenerate) {
      try {
        const careerAnalysisRef = adminDb.collection('users').doc(userId).collection('careerGrowthAnalysis');
        const snapshot = await careerAnalysisRef.orderBy('generatedAt', 'desc').limit(1).get();
        
        if (!snapshot.empty) {
          const cachedAnalysis = snapshot.docs[0].data();
          const cacheAge = Date.now() - new Date(cachedAnalysis.generatedAt).getTime();
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          
          // Return cached analysis if less than 30 days old
          if (cacheAge < thirtyDays) {
            console.log('✅ Returning cached career analysis (age:', Math.floor(cacheAge / (24 * 60 * 60 * 1000)), 'days)');
            return NextResponse.json({
              ...cachedAnalysis,
              cached: true,
              cacheAge: Math.floor(cacheAge / (24 * 60 * 60 * 1000))
            });
          }
        }
      } catch (cacheError) {
        console.error('Error checking cache:', cacheError);
        // Continue to generate new analysis if cache check fails
      }
    }

    const prompt = `You are an expert career coach and career development strategist. Analyze the following resume data and create a comprehensive, personalized 3-6 month career development plan.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Please provide a detailed career development plan in the following JSON format:

{
  "careerSummary": {
    "currentLevel": "string (e.g., Junior, Mid-level, Senior)",
    "yearsOfExperience": number,
    "primarySkills": ["skill1", "skill2", ...],
    "industryFocus": "string",
    "careerTrajectory": "string (brief assessment of career progression)"
  },
  "strengths": [
    {
      "area": "string",
      "description": "string",
      "impact": "string"
    }
  ],
  "improvementAreas": [
    {
      "area": "string",
      "currentLevel": "string",
      "targetLevel": "string",
      "priority": "High|Medium|Low",
      "reasoning": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "provider": "string",
      "duration": "string",
      "cost": "string",
      "priority": "High|Medium|Low",
      "reasoning": "string",
      "expectedOutcome": "string",
      "timeline": "Month 1-2|Month 3-4|Month 5-6"
    }
  ],
  "skillDevelopment": [
    {
      "skill": "string",
      "currentLevel": "Beginner|Intermediate|Advanced",
      "targetLevel": "Intermediate|Advanced|Expert",
      "learningPath": ["step1", "step2", ...],
      "resources": ["resource1", "resource2", ...],
      "practiceProjects": ["project1", "project2", ...],
      "timeline": "Month 1-2|Month 3-4|Month 5-6",
      "priority": "High|Medium|Low"
    }
  ],
  "companyTargets": [
    {
      "companyType": "string (e.g., Startups, Mid-size Tech, FAANG, Enterprise)",
      "examples": ["company1", "company2", ...],
      "whyGoodFit": "string",
      "preparationNeeded": ["item1", "item2", ...],
      "applicationStrategy": "string"
    }
  ],
  "linkedInOptimization": {
    "headline": {
      "current": "string (inferred from resume)",
      "suggested": "string",
      "reasoning": "string"
    },
    "summary": {
      "keyPoints": ["point1", "point2", ...],
      "tone": "string",
      "callToAction": "string"
    },
    "skills": {
      "topSkillsToHighlight": ["skill1", "skill2", ...],
      "skillsToAdd": ["skill1", "skill2", ...],
      "skillsToRemove": ["skill1", "skill2", ...]
    },
    "content": {
      "postFrequency": "string",
      "contentThemes": ["theme1", "theme2", ...],
      "engagementStrategy": "string"
    },
    "networking": {
      "targetConnections": ["type1", "type2", ...],
      "outreachStrategy": "string",
      "communityInvolvement": ["activity1", "activity2", ...]
    }
  },
  "interviewPreparation": {
    "technicalTopics": [
      {
        "topic": "string",
        "subtopics": ["subtopic1", "subtopic2", ...],
        "studyResources": ["resource1", "resource2", ...],
        "practiceQuestions": ["question1", "question2", ...],
        "timeline": "Week 1-2|Week 3-4|Week 5-6|Week 7-8",
        "difficulty": "Easy|Medium|Hard",
        "priority": "High|Medium|Low"
      }
    ],
    "behavioralTopics": [
      {
        "category": "string (e.g., Leadership, Conflict Resolution)",
        "situations": ["situation1", "situation2", ...],
        "starMethod": {
          "situation": "string",
          "task": "string",
          "action": "string",
          "result": "string"
        },
        "practiceQuestions": ["question1", "question2", ...],
        "timeline": "Week 1-2|Week 3-4|Week 5-6|Week 7-8"
      }
    ],
    "systemDesign": {
      "relevance": "string",
      "topics": ["topic1", "topic2", ...],
      "resources": ["resource1", "resource2", ...],
      "timeline": "string"
    },
    "mockInterviews": {
      "frequency": "string",
      "platforms": ["platform1", "platform2", ...],
      "focus": ["area1", "area2", ...]
    }
  },
  "monthlyRoadmap": [
    {
      "month": "Month 1|Month 2|Month 3|Month 4|Month 5|Month 6",
      "focus": "string",
      "goals": ["goal1", "goal2", ...],
      "activities": [
        {
          "activity": "string",
          "time": "string",
          "priority": "High|Medium|Low",
          "completed": false
        }
      ],
      "milestones": ["milestone1", "milestone2", ...],
      "metrics": {
        "skillsImproved": ["skill1", "skill2", ...],
        "certificationsCompleted": number,
        "projectsBuilt": number,
        "connectionsGrown": number
      }
    }
  ],
  "quickWins": [
    {
      "action": "string",
      "impact": "string",
      "timeRequired": "string",
      "difficulty": "Easy|Medium|Hard"
    }
  ],
  "longTermVision": {
    "6MonthGoal": "string",
    "1YearGoal": "string",
    "3YearGoal": "string",
    "careerPath": "string"
  }
}

Important guidelines:
1. Be specific and actionable - provide exact certification names, specific skills, and concrete steps
2. Tailor everything to the candidate's current level and experience
3. Provide realistic timelines based on their background
4. Include both technical and soft skills development
5. Consider current market trends and demands
6. Be encouraging but honest about areas needing improvement
7. Prioritize high-impact activities that align with their career goals
8. Include diverse learning resources (free and paid)
9. Make the LinkedIn optimization specific to their industry
10. Structure interview prep from basics to advanced topics

Return ONLY the JSON object, no additional text.`;

    // Use generateWithFallback for better reliability
    const result = await generateWithFallback(prompt, {
      maxOutputTokens: 8000, // Large token limit for comprehensive plan
      temperature: 0.7,
      apiKey: process.env.GEMINI_API_KEY,
      timeout: 120000 // 2 minute timeout for complex analysis
    });

    let text = result.text;

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    let careerPlan;
    try {
      careerPlan = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Response text:', text);
      return NextResponse.json(
        { error: 'Failed to parse career plan', details: text },
        { status: 500 }
      );
    }

    // Add metadata
    const timestamp = new Date().toISOString();
    careerPlan.generatedAt = timestamp;
    careerPlan.userPlan = userPlan;
    careerPlan.isPartial = userPlan === 'free' || userPlan === 'anonymous';
    careerPlan.cached = false;

    // Save to Firestore for future use
    try {
      const careerAnalysisRef = adminDb.collection('users').doc(userId).collection('careerGrowthAnalysis');
      await careerAnalysisRef.add({
        ...careerPlan,
        resumeDataHash: JSON.stringify(resumeData).substring(0, 100), // Store snippet for reference
        createdAt: timestamp,
        updatedAt: timestamp
      });
      console.log('✅ Career analysis saved to Firestore');
    } catch (saveError) {
      console.error('Error saving career analysis:', saveError);
      // Don't fail the request if save fails, just return the analysis
    }

    return NextResponse.json(careerPlan);

  } catch (error) {
    console.error('Error generating career plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate career plan', details: error.message },
      { status: 500 }
    );
  }
}

