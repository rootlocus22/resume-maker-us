import { NextResponse } from "next/server";
import * as admin from 'firebase-admin';
import { sendEmail } from "../../lib/sendEmail";

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

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      requestType,
      firstName,
      lastName,
      email,
      phone,
      description,
      verificationMethod,
      timestamp
    } = body;

    // Validate required fields
    if (!requestType || !email) {
      return NextResponse.json(
        { error: "Request type and email are required" },
        { status: 400 }
      );
    }

    // Create the CCPA request document
    const requestData = {
      requestType,
      firstName: firstName || "",
      lastName: lastName || "",
      email,
      phone: phone || "",
      description: description || "",
      verificationMethod: verificationMethod || "email",
      status: "pending",
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      timestamp: timestamp || new Date().toISOString(),
      userId: userId || null,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown"
    };

    // Store the request in the main CCPA requests collection
    const requestRef = await db.collection("ccpaRequests").add(requestData);

    // If user is logged in, also store in their personal requests
    if (userId) {
      try {
        await db.collection("users").doc(userId).collection("dataRequests").add({
          ...requestData,
          ccpaRequestId: requestRef.id
        });
      } catch (error) {
        console.error("Error storing user-specific request:", error);
      }
    }

    // Send confirmation email to user
    try {
      const emailSubject = `CCPA ${requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request Received`;
      const emailBody = generateConfirmationEmail(requestType, firstName, lastName, requestRef.id);

      await sendEmail({
        to: email,
        subject: emailSubject,
        html: emailBody
      });
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      // Don't fail the request if email fails
    }

    // Send notification to admin
    try {
      const adminEmailBody = generateAdminNotificationEmail(requestType, email, firstName, lastName, requestRef.id, description);

      await sendEmail({
        to: "privacy@expertresume.us",
        subject: `New CCPA ${requestType} Request - ${requestRef.id}`,
        html: adminEmailBody
      });
    } catch (error) {
      console.error("Error sending admin notification:", error);
      // Don't fail the request if admin email fails
    }

    return NextResponse.json({
      success: true,
      requestId: requestRef.id,
      message: "CCPA request submitted successfully"
    });

  } catch (error) {
    console.error("Error processing CCPA request:", error);
    return NextResponse.json(
      { error: "Failed to process CCPA request" },
      { status: 500 }
    );
  }
}

function generateConfirmationEmail(requestType, firstName, lastName, requestId) {
  const name = firstName && lastName ? `${firstName} ${lastName}` : "User";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CCPA Request Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .footer { margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .status { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CCPA Request Confirmation</h1>
          <p>Your privacy request has been received</p>
        </div>
        
        <div class="content">
          <p>Dear ${name},</p>
          
          <p>We have received your California Consumer Privacy Act (CCPA) <strong>${requestType}</strong> request. Here are the details:</p>
          
          <div class="status">
            <strong>Request ID:</strong> ${requestId}<br>
            <strong>Request Type:</strong> ${requestType.charAt(0).toUpperCase() + requestType.slice(1)}<br>
            <strong>Status:</strong> Pending Review<br>
            <strong>Submitted:</strong> ${new Date().toLocaleString()}
          </div>
          
          <h3>What happens next?</h3>
          <ul>
            <li><strong>Verification (1-10 business days):</strong> We will verify your identity to protect your privacy</li>
            <li><strong>Processing (up to 45 days):</strong> We will process your request according to CCPA requirements</li>
            <li><strong>Completion:</strong> You will receive a final confirmation email when your request is completed</li>
          </ul>
          
          <h3>Important Information:</h3>
          <ul>
            <li>We may contact you for additional verification if needed</li>
            <li>You can contact us at any time about your request</li>
            <li>Your request is protected by California privacy laws</li>
          </ul>
          
          <p>If you have any questions about your request, please contact us:</p>
          <ul>
            <li>Email: <a href="mailto:privacy@expertresume.us">privacy@expertresume.us</a></li>
            <li>Email: <a href="mailto:support@expertresume.us">support@expertresume.us</a></li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This is an automated message from ExpertResume Privacy Team.</p>
          <p>© ${new Date().getFullYear()} Vendax Systems LLC. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminNotificationEmail(requestType, email, firstName, lastName, requestId, description) {
  const name = firstName && lastName ? `${firstName} ${lastName}` : "Unknown";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New CCPA Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .info-box { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0; }
        .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 New CCPA Request</h1>
          <p>Action Required: ${requestType.toUpperCase()} Request</p>
        </div>
        
        <div class="content">
          <div class="urgent">
            <strong>⏰ Response Required:</strong> This request must be processed within 45 days as per CCPA requirements.
          </div>
          
          <div class="info-box">
            <h3>Request Details:</h3>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Type:</strong> ${requestType.charAt(0).toUpperCase() + requestType.slice(1)}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>
          
          <div class="info-box">
            <h3>User Information:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${description ? `<p><strong>Additional Info:</strong> ${description}</p>` : ''}
          </div>
          
          <div class="info-box">
            <h3>Next Steps:</h3>
            <ol>
              <li>Verify the user's identity</li>
              <li>Process the ${requestType} request</li>
              <li>Update request status in Firebase</li>
              <li>Send completion notification to user</li>
            </ol>
          </div>
          
          <p><strong>Firebase Path:</strong> /ccpaRequests/${requestId}</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 