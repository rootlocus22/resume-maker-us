import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getChromiumLaunchOptions } from '../../lib/puppeteerChromium';
import { OnePagerTemplates } from '../../lib/onePagerTemplatesServer';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request) {
  let browser = null;

  try {
    const body = await request.json();
    const { data, template = 'classic' } = body;

    if (!data) {
      console.error('Missing data in request body:', body);
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    console.log('One Pager Request Data (Partial):', JSON.stringify({
      skills: data.skills,
      experience: data.experience?.slice(0, 1)
    }, null, 2));

    // Validate template exists
    const validTemplates = ['classic', 'modern', 'compact', 'executive', 'tech', 'creative', 'timeline', 'grid', 'elegant', 'bold', 'magazine', 'modern_tech', 'creative_bold', 'professional_serif', 'graceful_elegance'];
    if (!validTemplates.includes(template)) {
      return NextResponse.json(
        { error: `Invalid template. Must be one of: ${validTemplates.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`[One-Pager Download] Generating PDF with template: ${template}`);

    // Get the template HTML
    // Verify template existence
    const templateFunc = OnePagerTemplates[template];
    if (!templateFunc) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 400 }
      );
    }

    // Helper to extract string value from potential object
    const getString = (val) => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) return val.map(getString).join(', '); // Handle nested arrays
      if (typeof val === 'object') {
        // Comprehensive check for possible keys
        return val.value || val.name || val.label || val.content || val.title || val.skill || val.item || '';
      }
      return String(val);
    };

    // Normalize Data to prevent [object Object]
    const normalizedData = {
      ...data,
      personal: {
        name: getString(data.personal?.name || data.name),
        jobTitle: getString(data.personal?.jobTitle || data.jobTitle || data.title),
        email: getString(data.personal?.email || data.email),
        phone: getString(data.personal?.phone || data.phone),
        location: getString(data.personal?.location || data.address || data.location),
        linkedin: getString(data.personal?.linkedin || data.linkedin),
        portfolio: getString(data.personal?.portfolio || data.portfolio || data.website),
      },
      summary: getString(data.summary || data.personal?.summary),
      experience: (Array.isArray(data.experience) ? data.experience : []).map(exp => ({
        ...exp,
        title: getString(exp.title || exp.jobTitle || exp.position),
        company: getString(exp.company || exp.employer),
        startDate: getString(exp.startDate),
        endDate: getString(exp.endDate),
        location: getString(exp.location),
        description: getString(exp.description)
      })),
      education: (Array.isArray(data.education) ? data.education : []).map(edu => ({
        ...edu,
        degree: getString(edu.degree),
        institution: getString(edu.institution || edu.school),
        graduationDate: getString(edu.graduationDate || edu.date),
        location: getString(edu.location),
        description: getString(edu.description)
      })),
      // Robust skills normalization
      skills: (Array.isArray(data.skills) ? data.skills : []).map(skill => {
        const str = getString(skill);
        return str === '[object Object]' ? '' : str;
      }).filter(s => s && s.trim() !== ''),

      projects: (Array.isArray(data.projects) ? data.projects : []).map(proj => ({
        ...proj,
        name: getString(proj.name || proj.title),
        description: getString(proj.description),
        technologies: getString(proj.technologies || proj.tech),
        link: getString(proj.link || proj.url)
      })),
      certifications: (Array.isArray(data.certifications) ? data.certifications : []).map(cert => ({
        ...cert,
        name: getString(cert.name || cert.title),
        organization: getString(cert.organization || cert.issuer),
        date: getString(cert.date),
        url: getString(cert.url || cert.link),
        description: getString(cert.description)
      })),
      languages: (Array.isArray(data.languages) ? data.languages : []).map(lang => ({
        language: getString(lang.language || lang.name),
        proficiency: getString(lang.proficiency || lang.level)
      }))
    };

    const htmlContent = templateFunc(normalizedData);

    // Wrap in full HTML document with exact same styling as preview
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume - ${data.personal?.name || 'One-Pager'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 100%; /* Let @page handle dimensions */
            margin: 0;
            padding: 0;
            background: white;
          }
          
          @page {
            size: 8.5in 11in;
            margin: 0;
          }
          
          @media print {
            html, body {
              width: 8.5in;
              height: 11in;
              margin: 0;
              padding: 0;
            }
          }
          
          /* Prevent page breaks inside elements */
          /* Avoid breaking headers from their content */
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
          }
          /* Allow images to stay intact */
          img {
            page-break-inside: avoid;
          }
          /* Allow everything else to break naturally */
          p, li, span, div {
             orphans: 2;
             widows: 2;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    console.log('[One-Pager Download] Launching Puppeteer...');

    const isProduction = process.env.NODE_ENV === "production";
    const { executablePath, args: chromiumArgs } = await getChromiumLaunchOptions();

    // Launch Puppeteer with Chromium for serverless environments
    browser = await puppeteer.launch({
      args: [
        ...chromiumArgs,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--font-render-hinting=none",
        "--enable-font-antialiasing",
        "--force-color-profile=srgb",
      ],
      defaultViewport: { width: 816, height: 1056 },
      executablePath: isProduction ? executablePath : undefined,
      headless: "new",
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Set exact viewport to match Letter size (8.5in x 11in = 816px x 1056px at 96 DPI)
    await page.setViewport({
      width: 816,  // 8.5 inches at 96 DPI
      height: 1056, // 11 inches at 96 DPI
      deviceScaleFactor: 1  // Changed from 2 to 1 for exact rendering
    });

    console.log('[One-Pager Download] Setting page content...');
    await page.setContent(fullHtml, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    });

    // Wait for any fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Wait a bit more for rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF with multi-page support
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true, // Use @page rules for margins and size
      displayHeaderFooter: false
    });

    await browser.close();
    browser = null;

    console.log('[One-Pager Download] PDF generated successfully');

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Resume_${data.personal?.name?.replace(/\s+/g, '_') || 'OnePager'}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('[One-Pager Download] Error:', error);

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('[One-Pager Download] Error closing browser:', closeError);
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error.message
      },
      { status: 500 }
    );
  }
}
