
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// Helper to render text content safely
const renderTextContent = (content) => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'object') {
    return content.message || content.suggestion || content.text || content.keyword || content.recommendation || JSON.stringify(content);
  }
  return String(content);
};

// Helper to render array items as tags
const renderArrayItems = (items, color = 'blue') => {
  if (!Array.isArray(items) || items.length === 0) return '';
  const bg = color === 'green' ? 'bg-green-100 text-green-800' :
    color === 'red' ? 'bg-red-100 text-red-800' :
      color === 'blue' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800';

  return items.map(item => `<span class="inline-block px-2 py-1 rounded-full text-xs font-medium ${bg} mr-2 mb-2">${renderTextContent(item)}</span>`).join('');
};

// Generate HTML Content
const generateATSReportHTML = (data, resumeData) => {
  const { executiveSummary, detailedAnalysis, actionableRecommendations, overallScore } = data;
  const name = resumeData?.name || 'Candidate';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
        .score-circle {
           width: 100px; height: 100px; border-radius: 50%; 
           display: flex; align-items: center; justify-content: center;
           border: 8px solid #f3f4f6;
           position: relative;
        }
        section { break-inside: avoid; page-break-inside: avoid; }
        .avoid-break { break-inside: avoid; page-break-inside: avoid; }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body class="bg-white p-8 max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="flex justify-between items-center border-b pb-6 mb-8">
        <div>
           <h1 class="text-3xl font-bold text-gray-900">ATS Analysis Report</h1>
           <p class="text-gray-500 mt-1">Prepared for <span class="font-semibold text-gray-900">${name}</span> on ${date}</p>
        </div>
        <div class="text-right">
           <div class="text-4xl font-bold text-blue-600">${overallScore || 0}%</div>
           <p class="text-sm text-gray-500 uppercase tracking-wide font-semibold mt-1">Overall Score</p>
        </div>
      </div>

      <!-- Executive Summary -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">Executive Summary</h2>
        
        ${executiveSummary?.overallFit ? `
          <div class="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">Overall Fit</h3>
            <p class="text-sm text-gray-700 leading-relaxed">${renderTextContent(executiveSummary.overallFit)}</p>
          </div>
        ` : ''}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${executiveSummary?.keyStrengths?.length ? `
            <div class="bg-green-50 p-4 rounded-lg border border-green-200 avoid-break">
              <h3 class="font-semibold text-green-900 mb-3 flex items-center gap-2">
                ✅ Key Strengths
              </h3>
              <ul class="space-y-2">
                ${executiveSummary.keyStrengths.map(s => `
                  <li class="flex items-start gap-2 text-sm text-green-800">
                    <span class="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                    <span>${renderTextContent(s)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          ${executiveSummary?.primaryAreasForImprovement?.length ? `
            <div class="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 class="font-semibold text-red-900 mb-3 flex items-center gap-2">
                ⚠️ Areas for Improvement
              </h3>
              <ul class="space-y-2">
                ${executiveSummary.primaryAreasForImprovement.map(s => `
                  <li class="flex items-start gap-2 text-sm text-red-800">
                    <span class="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                    <span>${renderTextContent(s)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </section>

      <!-- Actionable Recommendations -->
      ${actionableRecommendations?.length ? `
        <section class="mb-8">
          <h2 class="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">Actionable Recommendations</h2>
          <div class="space-y-3">
            ${actionableRecommendations.map(rec => `
              <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm avoid-break">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-semibold text-gray-900 text-sm">${renderTextContent(rec.area)}</h4>
                  <span class="px-2 py-1 rounded-full text-xs font-medium ${rec.priority?.toLowerCase() === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
    }">${rec.priority || 'Medium'} Priority</span>
                </div>
                <p class="text-sm text-gray-700">${renderTextContent(rec.recommendation)}</p>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Detailed Analysis -->
      <h2 class="text-2xl font-bold text-gray-900 mb-6 mt-8">Detailed Analysis</h2>

      <!-- Keyword Analysis -->
      ${detailedAnalysis?.keywordAnalysis ? `
        <section class="mb-8 p-4 border rounded-xl bg-white shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
             🎯 Keyword Analysis
          </h3>
          
          ${detailedAnalysis.keywordAnalysis.matchedKeywords?.length ? `
            <div class="mb-4">
              <h4 class="text-sm font-semibold text-green-700 mb-2">Matched Keywords</h4>
              <div class="flex flex-wrap gap-2">
                ${detailedAnalysis.keywordAnalysis.matchedKeywords.map(k => `
                   <span class="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium border border-green-200">
                     ${k.keyword}
                   </span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${detailedAnalysis.keywordAnalysis.missingKeywords?.length ? `
            <div>
              <h4 class="text-sm font-semibold text-red-700 mb-2">Missing Keywords</h4>
               <div class="flex flex-wrap gap-2">
                ${detailedAnalysis.keywordAnalysis.missingKeywords.map(k => `
                   <span class="px-2 py-1 bg-red-50 text-red-800 rounded-md text-xs font-medium border border-red-100">
                     ${k.keyword} (${k.importance})
                   </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </section>
      ` : ''}

      <!-- Skills Analysis -->
      ${detailedAnalysis?.skillsAnalysis ? `
        <section class="mb-8 p-4 border rounded-xl bg-white shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
             ⚡ Skills Analysis
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${detailedAnalysis.skillsAnalysis.hardSkills ? `
              <div>
                <h4 class="font-semibold text-gray-800 mb-2 border-b pb-1">Hard Skills</h4>
                ${renderArrayItems(detailedAnalysis.skillsAnalysis.hardSkills.identified, 'green')}
                ${detailedAnalysis.skillsAnalysis.hardSkills.missing?.length ? `
                   <div class="mt-2 text-xs font-semibold text-red-600">Missing:</div>
                   ${renderArrayItems(detailedAnalysis.skillsAnalysis.hardSkills.missing, 'red')}
                ` : ''}
              </div>
            ` : ''}

            ${detailedAnalysis.skillsAnalysis.softSkills ? `
              <div>
                <h4 class="font-semibold text-gray-800 mb-2 border-b pb-1">Soft Skills</h4>
                ${renderArrayItems(detailedAnalysis.skillsAnalysis.softSkills.identified, 'blue')}
                ${detailedAnalysis.skillsAnalysis.softSkills.suggested?.length ? `
                   <div class="mt-2 text-xs font-semibold text-blue-600">Suggested:</div>
                   ${renderArrayItems(detailedAnalysis.skillsAnalysis.softSkills.suggested, 'blue')}
                ` : ''}
              </div>
            ` : ''}
          </div>
        </section>
      ` : ''}

      <!-- Formatting & Structure -->
      ${detailedAnalysis?.formattingAndStructure ? `
        <section class="mb-8 p-4 border rounded-xl bg-white shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
             📝 Formatting & Structure
          </h3>
          
          <div class="flex items-center gap-4 mb-4 bg-gray-50 p-3 rounded-lg">
             <div>
               <span class="text-sm text-gray-500">Parsing Risk</span>
               <div class="font-bold ${detailedAnalysis.formattingAndStructure.parsingRisk === 'High' ? 'text-red-600' : 'text-green-600'}">
                 ${detailedAnalysis.formattingAndStructure.parsingRisk}
               </div>
             </div>
             <div>
               <span class="text-sm text-gray-500">Formatting Score</span>
               <div class="font-bold text-gray-900">
                 ${detailedAnalysis.formattingAndStructure.overallFormattingScore}/100
               </div>
             </div>
          </div>

          ${detailedAnalysis.formattingAndStructure.issues?.length ? `
             <div class="mb-3">
               <h4 class="font-semibold text-red-700 text-sm mb-2">Issues Found</h4>
               <ul class="list-disc pl-5 space-y-1">
                 ${detailedAnalysis.formattingAndStructure.issues.map(i => `
                    <li class="text-sm text-red-800">${renderTextContent(i)}</li>
                 `).join('')}
               </ul>
             </div>
          ` : ''}

          ${detailedAnalysis.formattingAndStructure.spellingGrammarIssues?.length ? `
             <div class="mb-3">
               <h4 class="font-semibold text-purple-700 text-sm mb-2">Spelling & Grammar</h4>
               <ul class="list-disc pl-5 space-y-1">
                 ${detailedAnalysis.formattingAndStructure.spellingGrammarIssues.map(i => `
                    <li class="text-sm text-purple-800">${renderTextContent(i)}</li>
                 `).join('')}
               </ul>
             </div>
          ` : ''}
        </section>
      ` : ''}
      
      <div class="text-center text-xs text-gray-400 mt-12 border-t pt-4">
        Generated by ExpertResume • ${date}
      </div>
    </body>
    </html>
  `;
};

export async function POST(request) {
  try {
    const { analysisResult, resumeData } = await request.json();

    if (!analysisResult) {
      return NextResponse.json({ error: "Missing analysis data" }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    const htmlContent = generateATSReportHTML(analysisResult, resumeData);

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=ATS_Report.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("ATS Report Calculation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate report", details: error.message },
      { status: 500 }
    );
  }
}
