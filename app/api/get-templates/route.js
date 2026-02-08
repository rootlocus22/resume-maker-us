import { NextResponse } from "next/server";
import { templates } from "../../lib/templates.js";

export async function GET() {
  try {
    // Return templates in order: regular templates first, job-specific templates last
    // (the templates object already has the correct ordering from templates.js)
    const templateList = Object.entries(templates).map(([id, config]) => ({
      id,
      name: config.name,
      category: config.category || 'Job-Specific',
      premium: config.premium,
      previewImage: config.previewImage
    }));

    return NextResponse.json({
      templates: templateList,
      count: templateList.length
    });

  } catch (error) {
    console.error('Error getting templates:', error);
    return NextResponse.json(
      { error: 'Failed to get templates', details: error.message },
      { status: 500 }
    );
  }
} 