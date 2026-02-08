import { NextResponse } from "next/server";
import { db } from "../../lib/firebase";
import { doc, getDoc, collection, getDocs, writeBatch, deleteDoc, setDoc } from "firebase/firestore";
import { sendEmail } from "../../lib/sendEmail";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user information before deletion
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userEmail = userData.email;

    // Create a deletion request record for audit purposes
    const deletionRequest = {
      userId: userId,
      email: userEmail,
      requestedAt: new Date().toISOString(),
      status: "pending",
      type: "account_deletion",
      reason: "User requested account deletion via CCPA rights",
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown"
    };

    // Store the deletion request
    const deletionRef = doc(collection(db, "deletionRequests"));
    await setDoc(deletionRef, deletionRequest);

    // Send confirmation email to user
    try {
      const confirmationEmail = generateDeletionConfirmationEmail(userEmail, deletionRef.id);
      await sendEmail({
        to: userEmail,
        subject: "Account Deletion Request Received",
        html: confirmationEmail
      });
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }

    // Send notification to admin
    try {
      const adminEmail = generateAdminDeletionNotification(userEmail, userId, deletionRef.id);
      await sendEmail({
        to: "support@expertresume.us",
        subject: `Account Deletion Request - ${deletionRef.id}`,
        html: adminEmail
      });
    } catch (error) {
      console.error("Error sending admin notification:", error);
    }

    // Note: Actual deletion should be done manually or through a separate admin process
    // to ensure proper verification and compliance with data retention requirements

    return NextResponse.json({
      success: true,
      requestId: deletionRef.id,
      message: "Account deletion request submitted successfully. You will receive a confirmation email shortly."
    });

  } catch (error) {
    console.error("Error processing account deletion request:", error);
    return NextResponse.json(
      { error: "Failed to process account deletion request" },
      { status: 500 }
    );
  }
}

// Helper function to actually delete user data (should be called by admin after verification)
async function deleteUserData(userId) {
  const batch = writeBatch(db);

  try {
    // Delete user document
    batch.delete(doc(db, "users", userId));

    // Delete user subcollections
    const subcollections = ["resumes", "coverLetters", "settings", "dataRequests", "profile"];

    for (const subcollection of subcollections) {
      const subRef = collection(db, "users", userId, subcollection);
      const subSnapshot = await getDocs(subRef);

      subSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    }

    // Commit the batch
    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
}

function generateDeletionConfirmationEmail(email, requestId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Account Deletion Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .footer { margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 4px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account Deletion Request Received</h1>
          <p>We have received your request to delete your account</p>
        </div>
        
        <div class="content">
          <p>Dear User,</p>
          
          <p>We have received your request to permanently delete your ExpertResume account and all associated data. This request is being processed in accordance with the California Consumer Privacy Act (CCPA).</p>
          
          <div class="info">
            <strong>Request Details:</strong><br>
            <strong>Request ID:</strong> ${requestId}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Submitted:</strong> ${new Date().toLocaleString()}<br>
            <strong>Status:</strong> Pending Verification
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This action is permanent and cannot be undone. Once your account is deleted:
            <ul>
              <li>All your resumes and cover letters will be permanently deleted</li>
              <li>Your account settings and preferences will be removed</li>
              <li>You will lose access to any premium features</li>
              <li>Your payment history will be retained for legal compliance (7 years)</li>
            </ul>
          </div>
          
          <h3>What happens next?</h3>
          <ol>
            <li><strong>Verification (1-3 business days):</strong> We will verify your identity and the deletion request</li>
            <li><strong>Grace Period (7 days):</strong> You have 7 days to cancel this request if you change your mind</li>
            <li><strong>Deletion (within 30 days):</strong> Your account and data will be permanently deleted</li>
            <li><strong>Confirmation:</strong> You will receive a final confirmation email when deletion is complete</li>
          </ol>
          
          <h3>To cancel this request:</h3>
          <p>If you change your mind, please contact us immediately at:</p>
          <ul>
            <li>Email: <a href="mailto:support@expertresume.us">support@expertresume.us</a></li>
            <li>Vendax Systems LLC, 28 Geary St STE 650 Suite #500, San Francisco, CA 94108, USA</li>
            <li>Reference your Request ID: ${requestId}</li>
          </ul>
          
          <h3>Data Retention:</h3>
          <p>Some data may be retained for legal compliance purposes:</p>
          <ul>
            <li>Payment records (7 years for tax compliance)</li>
            <li>Legal documents and communications</li>
            <li>Anonymized usage statistics</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This is an automated message from ExpertResume Privacy Team.</p>
          <p>If you did not request this deletion, please contact us immediately.</p>
          <p>© ${new Date().getFullYear()} Vendax Systems LLC. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminDeletionNotification(email, userId, requestId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Account Deletion Request</title>
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
          <h1>🚨 Account Deletion Request</h1>
          <p>Action Required: User Account Deletion</p>
        </div>
        
        <div class="content">
          <div class="urgent">
            <strong>⏰ Action Required:</strong> This account deletion request must be processed within 30 days as per CCPA requirements.
          </div>
          
          <div class="info-box">
            <h3>Request Details:</h3>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> Pending Verification</p>
          </div>
          
          <div class="info-box">
            <h3>Required Actions:</h3>
            <ol>
              <li><strong>Verify Identity:</strong> Confirm the request is legitimate</li>
              <li><strong>Check Dependencies:</strong> Review any legal holds or compliance requirements</li>
              <li><strong>Grace Period:</strong> Wait 7 days for potential cancellation</li>
              <li><strong>Execute Deletion:</strong> Permanently delete user data</li>
              <li><strong>Retain Records:</strong> Keep payment data for 7 years (tax compliance)</li>
              <li><strong>Confirm Completion:</strong> Send final confirmation to user</li>
            </ol>
          </div>
          
          <div class="info-box">
            <h3>Data to Delete:</h3>
            <ul>
              <li>User account and profile information</li>
              <li>All resumes and cover letters</li>
              <li>Settings and preferences</li>
              <li>Usage logs and analytics data</li>
              <li>Marketing preferences and communications</li>
            </ul>
          </div>
          
          <div class="info-box">
            <h3>Data to Retain:</h3>
            <ul>
              <li>Payment records (7 years for tax compliance)</li>
              <li>Legal documents and agreements</li>
              <li>Fraud prevention records</li>
              <li>Anonymized usage statistics</li>
            </ul>
          </div>
          
          <p><strong>Firebase Paths:</strong></p>
          <ul>
            <li>/users/${userId}</li>
            <li>/users/${userId}/resumes</li>
            <li>/users/${userId}/coverLetters</li>
            <li>/users/${userId}/settings</li>
            <li>/users/${userId}/profile</li>
            <li>/deletionRequests/${requestId}</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;
} 