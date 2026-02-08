import { NextResponse } from "next/server";
//import puppeteer from "puppeteer";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import { coverLetterTemplates } from "../../lib/coverLetterTemplate";

// Inline SVG icons for Phone, Mail, and MapPin (from lucide-react)
const iconMap = {
  Phone: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  `,
  Mail: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  `,
  MapPin: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  `,
};

function generateCoverLetterHTML(data, template = "classic", customColors = {}, resumeData = {}, isPremium = false) {
  const templateConfig = coverLetterTemplates[template] || coverLetterTemplates["classic"];
  const baseStyles = templateConfig.styles;
  const styles = {
    ...baseStyles,
    colors: {
      ...baseStyles.colors,
      ...(customColors[template] || {}),
    },
  };
  const layout = { headerStyle: templateConfig.layout?.headerStyle || "compact" };
  const mergedColors = styles.colors;

  // Helper to extract string value from potential object
  const getString = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (Array.isArray(val)) return val.map(getString).join(', ');
    if (typeof val === 'object') {
      return val.value || val.name || val.label || val.content || val.title || val.skill || val.item || String(val);
    }
    return String(val);
  };

  const getFieldValue = (field) => {
    const fieldMappings = {
      name: [data.name, resumeData?.personal?.name, "Your Name"],
      email: [data.email, resumeData?.personal?.email, "email@example.com"],
      phone: [data.phone, resumeData?.personal?.phone, "123-456-7890"],
      location: [data.location, resumeData?.personal?.location, "City, State"],
      jobTitle: [data.jobTitle, resumeData?.experience?.[0]?.title, "[jobTitle]"],
      company: [data.company, resumeData?.experience?.[0]?.company, "[company]"],
      recipient: [data.recipient, "Dear Hiring Manager"],
      intro: [data.intro, templateConfig.defaultData.intro],
      body: [data.body, templateConfig.defaultData.body],
      closing: [data.closing, templateConfig.defaultData.closing],
    };
    const rawVal = fieldMappings[field].find((val) => val !== undefined && val !== "") || fieldMappings[field][fieldMappings[field].length - 1];
    return getString(rawVal);
  };

  const renderHeader = () => {
    // Classic compact header - center aligned with separator
    if (layout.headerStyle === "compact") {
      return `
        <header style="text-align: center; padding: 48px 48px 24px 48px; margin-bottom: 32px; border-bottom: 2px solid #d1d5db; font-family: ${styles.fontFamily};">
          <h1 style="font-size: 28px; font-weight: 700; letter-spacing: -0.025em; color: #111827; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 12px;">
            ${getFieldValue("name")}
          </h1>
          <p style="font-size: 16px; color: #4b5563; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 16px;">
            ${getFieldValue("jobTitle")}
          </p>
          <div style="font-size: 13px; color: #6b7280; font-family: ${styles.fontFamily}; display: flex; justify-content: center; flex-wrap: wrap; gap: 24px;">
            <span>${getFieldValue("email")}</span>
            <span>•</span>
            <span>${getFieldValue("phone")}</span>
            <span>•</span>
            <span>${getFieldValue("location")}</span>
          </div>
        </header>
      `;
    } else if (layout.headerStyle === "full-width") {
      // Modern Professional header - clean border with navy accent
      return `
        <header style="border-bottom: 2px solid #1e3a8a; padding: 48px 48px 24px 48px; margin-bottom: 32px; font-family: ${styles.fontFamily};">
          <div style="display: flex; align-items: flex-start; justify-content: space-between;">
            <div style="flex: 1;">
              <h1 style="font-size: 30px; font-weight: 700; letter-spacing: -0.025em; color: #111827; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 8px;">
                ${getFieldValue("name")}
              </h1>
              <p style="font-size: 18px; color: #1e3a8a; font-weight: 600; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 16px;">
                ${getFieldValue("jobTitle")}
              </p>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 24px; font-size: 13px; color: #4b5563; margin-top: 16px;">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.Mail}</span>
              ${getFieldValue("email")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.Phone}</span>
              ${getFieldValue("phone")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.MapPin}</span>
              ${getFieldValue("location")}
            </span>
          </div>
        </header>
      `;
    } else if (layout.headerStyle === "executive") {
      // Executive header - bold center aligned with thick border
      return `
        <header style="border-bottom: 4px solid #111827; padding: 48px 48px 24px 48px; margin-bottom: 32px; text-align: center; font-family: ${styles.fontFamily};">
          <h1 style="font-size: 36px; font-weight: 700; letter-spacing: -0.025em; color: #111827; font-family: Georgia, serif; margin: 0; margin-bottom: 12px;">
            ${getFieldValue("name")}
          </h1>
          <div style="width: 80px; height: 2px; background: #111827; margin: 0 auto 16px auto;"></div>
          <p style="font-size: 18px; color: #374151; font-weight: 600; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 24px;">
            ${getFieldValue("jobTitle")}
          </p>
          <div style="display: flex; justify-content: center; gap: 32px; font-size: 13px; color: #6b7280;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #111827;">${iconMap.Mail}</span>
              <span>${getFieldValue("email")}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #111827;">${iconMap.Phone}</span>
              <span>${getFieldValue("phone")}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #111827;">${iconMap.MapPin}</span>
              <span>${getFieldValue("location")}</span>
            </div>
          </div>
        </header>
      `;
    } else if (layout.headerStyle === "minimal") {
      // Minimalist header - left border accent
      return `
        <header style="border-left: 4px solid #1f2937; padding: 48px 48px 0 72px; margin-bottom: 32px; font-family: ${styles.fontFamily};">
          <h1 style="font-size: 30px; font-weight: 300; letter-spacing: 0.025em; color: #111827; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 8px;">
            ${getFieldValue("name")}
          </h1>
          <p style="font-size: 18px; color: #4b5563; font-weight: 300; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 16px;">
            ${getFieldValue("jobTitle")}
          </p>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #6b7280;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="display: inline-block; vertical-align: middle; color: #1f2937;">${iconMap.Mail}</span>
              <span>${getFieldValue("email")}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="display: inline-block; vertical-align: middle; color: #1f2937;">${iconMap.Phone}</span>
              <span>${getFieldValue("phone")}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="display: inline-block; vertical-align: middle; color: #1f2937;">${iconMap.MapPin}</span>
              <span>${getFieldValue("location")}</span>
            </div>
          </div>
        </header>
      `;
    } else if (layout.headerStyle === "modern") {
      // Modern/Startup/Healthcare - clean professional
      return `
        <header style="border-bottom: 2px solid #1e3a8a; padding: 48px 48px 24px 48px; margin-bottom: 32px; font-family: ${styles.fontFamily};">
          <h1 style="font-size: 30px; font-weight: 700; letter-spacing: -0.025em; color: #111827; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 8px;">
            ${getFieldValue("name")}
          </h1>
          <p style="font-size: 18px; color: #1e3a8a; font-weight: 600; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 16px;">
            ${getFieldValue("jobTitle")}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 24px; font-size: 13px; color: #4b5563;">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.Mail}</span>
              ${getFieldValue("email")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.Phone}</span>
              ${getFieldValue("phone")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.MapPin}</span>
              ${getFieldValue("location")}
            </span>
          </div>
        </header>
      `;
    } else if (layout.headerStyle === "startup") {
      // Startup - same as modern
      return `
        <header style="border-bottom: 2px solid #1e3a8a; padding: 48px 48px 24px 48px; margin-bottom: 32px; font-family: ${styles.fontFamily};">
          <h1 style="font-size: 30px; font-weight: 700; letter-spacing: -0.025em; color: #111827; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 8px;">
            ${getFieldValue("name")}
          </h1>
          <p style="font-size: 18px; color: #1e3a8a; font-weight: 600; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 16px;">
            ${getFieldValue("jobTitle")}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 24px; font-size: 13px; color: #4b5563;">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.Mail}</span>
              ${getFieldValue("email")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.Phone}</span>
              ${getFieldValue("phone")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.MapPin}</span>
              ${getFieldValue("location")}
            </span>
          </div>
        </header>
      `;
    } else if (layout.headerStyle === "healthcare") {
      // Healthcare - clean professional
      return `
        <header style="border-bottom: 2px solid #1e3a8a; padding: 48px 48px 24px 48px; margin-bottom: 32px; font-family: ${styles.fontFamily};">
          <h1 style="font-size: 30px; font-weight: 700; letter-spacing: -0.025em; color: #111827; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 8px;">
            ${getFieldValue("name")}
          </h1>
          <p style="font-size: 18px; color: #1e3a8a; font-weight: 600; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 16px;">
            ${getFieldValue("jobTitle")}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 24px; font-size: 13px; color: #4b5563;">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.Mail}</span>
              ${getFieldValue("email")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.Phone}</span>
              ${getFieldValue("phone")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1e3a8a;">${iconMap.MapPin}</span>
              ${getFieldValue("location")}
            </span>
          </div>
        </header>
      `;
    } else if (layout.headerStyle === "innovate") {
      // Tech Professional - clean border design
      return `
        <header style="border-bottom: 2px solid #1f2937; padding: 48px 48px 24px 48px; margin-bottom: 32px; font-family: ${styles.fontFamily};">
          <h1 style="font-size: 30px; font-weight: 600; letter-spacing: -0.025em; color: #111827; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 8px;">
            ${getFieldValue("name")}
          </h1>
          <p style="font-size: 18px; color: #374151; font-weight: 500; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 16px;">
            ${getFieldValue("jobTitle")}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 24px; font-size: 13px; color: #6b7280;">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1f2937;">${iconMap.Mail}</span>
              ${getFieldValue("email")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1f2937;">${iconMap.Phone}</span>
              ${getFieldValue("phone")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1f2937;">${iconMap.MapPin}</span>
              ${getFieldValue("location")}
            </span>
          </div>
        </header>
      `;
    } else {
      // Default/Creative - left border accent
      return `
        <header style="border-left: 4px solid #1f2937; padding: 48px 48px 0 72px; margin-bottom: 32px; font-family: ${styles.fontFamily};">
          <h1 style="font-size: 30px; font-weight: 700; letter-spacing: -0.025em; color: #111827; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 8px;">
            ${getFieldValue("name")}
          </h1>
          <p style="font-size: 18px; color: #374151; font-weight: 600; font-family: ${styles.fontFamily}; margin: 0; margin-bottom: 16px;">
            ${getFieldValue("jobTitle")}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 24px; font-size: 13px; color: #6b7280;">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1f2937;">${iconMap.Mail}</span>
              ${getFieldValue("email")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1f2937;">${iconMap.Phone}</span>
              ${getFieldValue("phone")}
            </span>
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; vertical-align: middle; color: #1f2937;">${iconMap.MapPin}</span>
              ${getFieldValue("location")}
            </span>
          </div>
        </header>
      `;
    }
  };

  const renderFooterDecoration = () => {
    if (layout.headerStyle === "modern" || layout.headerStyle === "startup") {
      return `<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: #1e3a8a;"></div>`;
    } else if (layout.headerStyle === "executive") {
      return `<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: #111827;"></div>`;
    } else if (layout.headerStyle === "creative" || layout.headerStyle === "default" || layout.headerStyle === "innovate") {
      return `<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: #1f2937;"></div>`;
    }
    return "";
  };

  const content = `
    <div style="position: relative; font-family: ${styles.fontFamily}; background: #ffffff; width: 100%; max-width: 210mm; min-height: 297mm; margin: 0 auto;">
      ${renderHeader()}
      <div style="padding: 32px 48px; display: flex; flex-direction: column;">
        <div style="margin-bottom: 24px;">
          <p style="font-size: 13px; color: #6b7280; margin: 0 0 12px 0;">
            ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 4px 0;">
            ${getFieldValue("recipient")}
          </p>
          <p style="font-size: 14px; color: #374151; margin: 0;">
            ${getFieldValue("company")}
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <p style="font-size: 15px; line-height: 1.6; color: #1f2937; margin: 0; text-align: justify;">
            ${getFieldValue("intro")}
          </p>

          <p style="font-size: 15px; line-height: 1.6; color: #1f2937; margin: 0; text-align: justify;">
            ${getFieldValue("body")}
          </p>

          <p style="font-size: 15px; line-height: 1.6; color: #1f2937; margin: 0; text-align: justify;">
            ${getFieldValue("closing")}
          </p>

          <div style="margin-top: 32px;">
            <p style="font-size: 14px; color: #374151; margin: 0 0 12px 0;">Sincerely,</p>
            <div style="width: 160px; height: 2px; background: #d1d5db; margin-bottom: 8px;"></div>
            <p style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 4px 0;">
              ${getFieldValue("name")}
            </p>
            <p style="font-size: 13px; color: #6b7280; margin: 0;">
              ${getFieldValue("jobTitle")}
            </p>
          </div>
        </div>
      </div>
      
      ${renderFooterDecoration()}
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #1f2937;
            font-family: ${styles.fontFamily}, sans-serif;
            font-size: 15px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @media print {
            body { margin: 0; padding: 0; }
          }
          svg { 
            display: inline-block; 
            vertical-align: middle; 
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}

export async function POST(request) {
  try {
    const { data, template, customColors, resumeData, isPremium } = await request.json();

    if (!data) {
      return NextResponse.json({ error: "Missing data in request body" }, { status: 400 });
    }

    const availableTemplates = Object.keys(coverLetterTemplates);
    const normalizedTemplate = template?.toLowerCase() || "classic";
    if (!availableTemplates.some((t) => t.toLowerCase() === normalizedTemplate)) {
      return NextResponse.json({ error: `Template "${template}" not found. Available templates: ${availableTemplates.join(", ")}` }, { status: 400 });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const browser = await puppeteer.launch({
      args: [
        ...(isProduction ? chromium.args : []),
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--font-render-hinting=none",
        "--disable-gpu",
      ],
      defaultViewport: { width: 794, height: 1123 },
      executablePath: isProduction ? await chromium.executablePath() : undefined,
      headless: "new",
    });

    const page = await browser.newPage();
    const htmlContent = generateCoverLetterHTML(data, normalizedTemplate, customColors, resumeData, isPremium);
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cover-letter.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};