import { NextResponse } from 'next/server';
import { generateWithFallback } from '../../lib/geminiFallback';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const { field, currentText, context } = await request.json();

    if (!field) {
      return NextResponse.json(
        { error: 'Field is required' },
        { status: 400 }
      );
    }

    let prompt = '';
    let numSuggestions = 3;
    
    // No character limits - AI will optimize naturally for one-pager format
    
    // Normalize field names for array items (experience-0, project-1, etc.)
    const fieldType = field.includes('experience-') ? 'experienceDescription' 
                    : field.includes('project-') ? 'projectDescription'
                    : field;

    switch (fieldType) {
      case 'jobTitle':
        prompt = `Generate ${numSuggestions} professional job titles/headlines for a resume based on:
        - Current title: ${currentText || 'Not provided'}
        - Name: ${context.name || 'Professional'}
        - Experience: ${JSON.stringify(context.experience?.slice(0, 2) || [])}
        
        Requirements:
        - Professional and ATS-friendly
        - Action-oriented and impactful
        - Include seniority level and specialization
        - Concise but descriptive (one-pager optimized)
        
        Return ONLY a JSON array of ${numSuggestions} strings, nothing else.
        Example: ["Senior Full-Stack Developer | React & Node.js Expert", "Lead Software Engineer - Cloud Architecture", "Principal Engineer | DevOps & Scalability"]`;
        break;

      case 'summary':
        prompt = `Generate ${numSuggestions} professional resume summaries based on:
        - Current summary: ${currentText || 'Not provided'}
        - Job Title: ${context.jobTitle || 'Professional'}
        - Experience: ${JSON.stringify(context.experience?.slice(0, 2) || [])}
        - Skills: ${JSON.stringify(context.skills?.slice(0, 10) || [])}
        
        Requirements:
        - 3-4 concise sentences (one-pager optimized)
        - Focus on achievements with metrics when possible
        - Include years of experience
        - Highlight top skills
        - Use action words (Led, Built, Achieved, etc.)
        - Professional and impactful tone
        
        Return ONLY a JSON array of ${numSuggestions} strings, nothing else.`;
        break;

      case 'experienceDescription':
        prompt = `Generate ${numSuggestions} achievement-focused job descriptions for:
        - Title: ${context.title || 'Position'}
        - Company: ${context.company || 'Company'}
        - Current description: ${currentText || 'Not provided'}
        
        Requirements:
        - 2-3 bullet points (one-pager optimized, concise but complete)
        - Start with action verbs (Led, Built, Increased, Reduced, etc.)
        - Include specific metrics and numbers (%, $, users, etc.)
        - Focus on IMPACT and RESULTS, not duties
        - Quantify achievements whenever possible
        - Complete sentences with proper endings (no truncation)
        
        Return ONLY a JSON array of ${numSuggestions} strings (each string can have multiple lines for bullets), nothing else.
        Example format: ["• Led team of 5, increased productivity 40%\\n• Built API serving 1M+ requests/day\\n• Reduced costs by $50K annually"]`;
        break;

      case 'projectDescription':
        prompt = `Generate ${numSuggestions} impactful project descriptions for:
        - Project name: ${context.name || 'Project'}
        - Technologies: ${context.technologies || 'Various technologies'}
        - Current description: ${currentText || 'Not provided'}
        
        Requirements:
        - 2-3 concise sentences (one-pager optimized)
        - Focus on technical challenges solved
        - Include impact metrics (users, performance, revenue, etc.)
        - Mention scale and complexity
        - Highlight unique features or innovations
        - Complete thoughts with proper endings
        
        Return ONLY a JSON array of ${numSuggestions} strings, nothing else.`;
        break;

      case 'skills':
        prompt = `Generate ${numSuggestions} optimized skill lists based on:
        - Current skills: ${currentText || 'Not provided'}
        - Job Title: ${context.jobTitle || 'Professional'}
        - Experience: ${JSON.stringify(context.experience?.slice(0, 2) || [])}
        
        Requirements:
        - 15-20 top skills (one-pager optimized)
        - Mix of technical and soft skills
        - Prioritize in-demand, relevant skills
        - Include specific technologies/frameworks
        - ATS-friendly keywords
        - Comma-separated format
        
        Return ONLY a JSON array of ${numSuggestions} strings (each being a comma-separated skill list), nothing else.
        Example: ["JavaScript, React, Node.js, AWS, Docker, Git, Python, MongoDB, PostgreSQL, CI/CD, Agile, Leadership"]`;
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported field type: ${fieldType} (original: ${field})` },
          { status: 400 }
        );
    }

    console.log('[One-Pager AI Enhance] Generating suggestions for:', field, '(type:', fieldType, ')');

    const result = await generateWithFallback(prompt, {
      maxOutputTokens: 500,
      temperature: 0.8, // Higher temperature for more variety
      apiKey: process.env.GEMINI_API_KEY
    });

    let suggestions = [];
    try {
      // Clean up the response
      let jsonText = result.text.trim();
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      suggestions = JSON.parse(jsonText);

      // Validate it's an array
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }

      // Filter out empty suggestions
      suggestions = suggestions.filter(s => s && s.trim().length > 0);

      // Ensure we have at least 1 suggestion
      if (suggestions.length === 0) {
        throw new Error('No valid suggestions generated');
      }

      console.log(`[One-Pager AI Enhance] Generated ${suggestions.length} suggestions`);

    } catch (parseError) {
      console.error('[One-Pager AI Enhance] Parse error:', parseError);
      console.error('[One-Pager AI Enhance] Raw response:', result.text);
      
      // Fallback: try to extract suggestions from non-JSON response
      const lines = result.text.split('\n').filter(line => line.trim().length > 0);
      suggestions = lines.slice(0, numSuggestions);
      
      if (suggestions.length === 0) {
        throw new Error('Failed to parse AI response');
      }
    }

    return NextResponse.json({
      suggestions,
      field,
      model: result.model
    });

  } catch (error) {
    console.error('[One-Pager AI Enhance] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI suggestions',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
