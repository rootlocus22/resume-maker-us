// app/api/send-pdf-email/route.js
// API endpoint to email PDF resume to user
import { NextResponse } from "next/server";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import * as admin from 'firebase-admin';
import nodemailer from "nodemailer";

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
    const { pdfBlob, email, filename, userId, resumeName } = await request.json();

    if (!pdfBlob || !email) {
      return NextResponse.json(
        { error: "PDF blob and email are required" },
        { status: 400 }
      );
    }

    // Convert base64 blob to buffer
    const pdfBuffer = Buffer.from(pdfBlob, 'base64');

    // Prepare email
    const mailOptions = {
      from: '"ExpertResume" <support@expertresume.us>',
      to: email,
      bcc: "support@expertresume.us",
      subject: `Your Resume: ${resumeName || filename || 'Resume'}`,
      text: `Hi,\n\nYour resume PDF is attached. We hope this helps you land your dream job!\n\nBest regards,\nExpertResume Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Your Resume is Ready! 📄</h2>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Your resume PDF is attached to this email. We hope this helps you land your dream job!</p>
              <p>If you have any questions or need help, feel free to reach out to us.</p>
              <p>Best of luck with your job search!</p>
              <p>Best regards,<br><strong>ExpertResume Team</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent from ExpertResume. If you didn't request this, please ignore.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: filename || 'resume.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Generate raw MIME message
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });

    const info = await transporter.sendMail(mailOptions);
    const rawMessageBuffer = info.message;

    // Send via AWS SES
    const command = new SendRawEmailCommand({
      RawMessage: { Data: rawMessageBuffer },
    });

    const sesResponse = await sesClient.send(command);

    // Log email send
    await db.collection("email_logs").add({
      userId: userId || "unknown",
      recipientEmail: email,
      templateId: "pdf_delivery",
      status: "sent",
      sesMessageId: sesResponse.MessageId,
      hasAttachment: true,
      filename: filename || 'resume.pdf',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `PDF sent successfully to ${email}`,
      sesMessageId: sesResponse.MessageId,
    });

  } catch (error) {
    console.error("❌ Failed to send PDF email:", error);
    
    // Log error
    try {
      await db.collection("email_logs").add({
        recipientEmail: email || "unknown",
        templateId: "pdf_delivery",
        status: "failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return NextResponse.json(
      { error: "Failed to send PDF email", details: error.message },
      { status: 500 }
    );
  }
}
