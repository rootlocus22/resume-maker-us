import { NextResponse } from "next/server";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import * as admin from 'firebase-admin';
import { getEmailContent } from "../../lib/emailTemplates";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer"; // Used ONLY for MIME construction

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

const db = admin.firestore();

// Configure AWS SES
const sesClient = new SESClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const { templateId, userId, email, data = {} } = await request.json();
    console.log('📨 Sending email:', { templateId, email, userId });

    if (!templateId) {
      return NextResponse.json({ error: "Missing templateId" }, { status: 400 });
    }

    // Fetch user data from Firestore if userId is provided
    let userData = {};
    if (userId) {
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        userData = userDoc.data();
      }
    }

    // Use provided email or fallback to userData email
    const recipientEmail = email || userData.email;
    if (!recipientEmail) {
      return NextResponse.json({ error: "Missing email address" }, { status: 400 });
    }

    // Check if the recipient has unsubscribed
    const unsubscribeRef = db.collection("unsubscribed_emails").doc(recipientEmail);
    const unsubscribeDoc = await unsubscribeRef.get();
    if (unsubscribeDoc.exists) {
      await db.collection("email_logs").add({
        userId: userId || "unknown",
        recipientEmail,
        templateId,
        status: "skipped",
        reason: "Recipient has unsubscribed",
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ message: "Email not sent: Recipient has unsubscribed" }, { status: 200 });
    }

    // Prepare email data
    const emailData = {
      firstName: userData?.name?.split(" ")[0] || "Friend",
      email: recipientEmail,
      ...userData,
      ...data,
    };

    // Get email content
    let { subject, html, text } = getEmailContent(templateId, emailData);

    // Prepare Nodemailer Message Options (for MIME building only)
    const mailOptions = {
      from: '"ExpertResume" <support@expertresume.us>',
      to: recipientEmail,
      bcc: "support@expertresume.us",
      subject: subject,
      text: text,
      html: html,
      attachments: []
    };

    // Check if we need to generate and attach a PDF Invoice
    if (templateId === "invoice") {
      console.log("📄 Generating PDF Invoice...");

      // Generate HTML specifically for PDF with solid logo
      const pdfEmailData = { ...emailData, isForPDF: true };
      const { html: pdfHtml } = getEmailContent(templateId, pdfEmailData);

      // Launch Puppeteer to generate PDF
      let browser = null;
      let pdfBuffer = null;

      try {
        const isProduction = process.env.NODE_ENV === "production";
        let chromium = null;

        // Dynamically import chromium for production environment
        if (isProduction) {
          try {
            chromium = require("@sparticuz/chromium");
          } catch (e) {
            console.error("Failed to load @sparticuz/chromium:", e);
          }
        }

        browser = await puppeteer.launch({
          args: [
            ...(isProduction && chromium ? chromium.args : []),
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ],
          defaultViewport: { width: 794, height: 1123 },
          executablePath: (isProduction && chromium) ? await chromium.executablePath() : undefined,
          headless: 'new'
        });

        const page = await browser.newPage();
        await page.setContent(pdfHtml, { waitUntil: "networkidle0" });
        pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
      } catch (error) {
        console.error("Error generating PDF:", error);
        // If PDF fails, we might still want to try sending the email without it? 
        // For now, let's allow it to throw so we know.
        throw error;
      } finally {
        if (browser) await browser.close();
      }

      console.log("✅ PDF Generated. Size:", pdfBuffer.length);

      const planName = data.planName || 'ExpertResume_Pro';
      const fileName = `Invoice_${planName.replace(/\s+/g, '_')}.pdf`;

      // Add attachment to Nodemailer options
      mailOptions.attachments.push({
        filename: fileName,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });

      // Regenerate HTML for email body with transparent logo
      const emailBodyData = { ...emailData, isForPDF: false };
      const { html: emailHtml } = getEmailContent(templateId, emailBodyData);
      mailOptions.html = emailHtml;
    }

    // GENERATE RAW MIME MESSAGE using Nodemailer
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });

    const info = await transporter.sendMail(mailOptions);
    const rawMessageBuffer = info.message;

    // Send via AWS SES Native Client
    const command = new SendRawEmailCommand({
      RawMessage: { Data: rawMessageBuffer },
    });

    const sesResponse = await sesClient.send(command);

    // Log success
    await db.collection("email_logs").add({
      userId: userId || "unknown",
      recipientEmail,
      templateId,
      status: "sent",
      sesMessageId: sesResponse.MessageId,
      hasAttachment: templateId === "invoice",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: `Email sent successfully to ${recipientEmail}`,
      sesMessageId: sesResponse.MessageId,
    });

  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}