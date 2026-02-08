import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

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
    const {
      userId,
      referralCode,
      referralLink,
      friendEmail,
      friendPhone,
      friendName,
      referrerName
    } = await request.json();

    if (!userId || !referralCode || !referralLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!friendEmail && !friendPhone) {
      return NextResponse.json(
        { error: "At least email or phone number is required" },
        { status: 400 }
      );
    }

    // Create referral record
    const referralData = {
      referrerId: userId,
      referralCode,
      friendName: friendName || "Friend",
      email: friendEmail || null,
      phone: friendPhone || null,
      status: "invited", // invited -> registered -> paid
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      convertedAt: null,
      earnings: 0,
      planPurchased: null
    };

    // Save referral to Firestore
    const referralRef = await adminDb.collection("referrals").add(referralData);

    // Update user's referral stats
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const currentStats = userData.referralStats || {
        totalReferrals: 0,
        registeredReferrals: 0,
        paidReferrals: 0,
        totalEarnings: 0
      };

      await userRef.update({
        "referralStats.totalReferrals": (currentStats.totalReferrals || 0) + 1,
        updatedAt: new Date().toISOString()
      });
    }

    // Send email invitation if email is provided
    if (friendEmail) {
      try {
        // Check if email is unsubscribed
        const unsubscribeRef = adminDb.collection("unsubscribed_emails").doc(friendEmail);
        const unsubscribeDoc = await unsubscribeRef.get();
        
        if (!unsubscribeDoc.exists) {
          const emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Join ExpertResume</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                    <img src="https://expertresume.us/expertresumeLogo/resume gyani final logo-07.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
                    <h1 style="color: #ffffff; font-size: 24px; margin-top: 15px; font-weight: bold;">You're Invited! 🎉</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 30px 20px;">
                    <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Hi ${friendName},</p>
                    <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">
                      <strong>${referrerName}</strong> recently used ExpertResume and wanted to share it with you!
                    </p>
                    <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">
                      They found it helpful for creating a professional, ATS-optimized resume using AI, and thought you might find it useful too.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
                      <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">🎁 Personal Referral Benefit</h3>
                      <p style="color: #374151; font-size: 15px; margin: 0;">
                        Get <strong style="color: #1e3a8a;">15% OFF</strong> when you sign up using this link
                      </p>
                    </div>

                    <div style="margin: 25px 0;">
                      <h3 style="color: #1f2937; font-size: 17px; margin-bottom: 15px;">What you can do with ExpertResume:</h3>
                      <ul style="color: #5f6368; font-size: 15px; line-height: 1.8; padding-left: 20px;">
                        <li>Upload your existing resume and let AI reorganize it professionally</li>
                        <li>Create ATS-optimized resumes that pass applicant tracking systems</li>
                        <li>Use the Job Description Resume Builder to tailor your resume for specific job postings</li>
                        <li>Chat with Resume GPT - an AI assistant that answers all your resume questions</li>
                        <li>Get AI-powered suggestions to improve your content</li>
                        <li>Choose from professional templates that look clean and modern</li>
                        <li>Build matching cover letters quickly</li>
                      </ul>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${referralLink}" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        Try ExpertResume (15% OFF)
                      </a>
                    </div>

                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0;">
                        Your personal referral code: <strong style="color: #1e3a8a; font-size: 15px;">${referralCode}</strong>
                      </p>
                    </div>

                    <p style="color: #5f6368; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                      No pressure - just sharing in case you're job hunting or updating your resume!
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      ExpertResume - Build Your Career, One Resume at a Time
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                      <a href="https://expertresume.us" style="color: #3b82f6; text-decoration: none;">Visit Website</a> | 
                      <a href="https://expertresume.us/contact-us" style="color: #3b82f6; text-decoration: none;">Contact Us</a>
                    </p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;

          const emailText = `
Hi ${friendName},

${referrerName} recently used ExpertResume and wanted to share it with you!

They found it helpful for creating a professional, ATS-optimized resume using AI, and thought you might find it useful too.

🎁 Personal Referral Benefit: Get 15% OFF when you sign up using this link

What you can do with ExpertResume:
• Upload your existing resume and let AI reorganize it professionally
• Create ATS-optimized resumes that pass applicant tracking systems
• Use the Job Description Resume Builder to tailor your resume for specific job postings
• Chat with Resume GPT - an AI assistant that answers all your resume questions
• Get AI-powered suggestions to improve your content
• Choose from professional templates that look clean and modern
• Build matching cover letters quickly

Try it here: ${referralLink}

Your personal referral code: ${referralCode}

No pressure - just sharing in case you're job hunting or updating your resume!

Best regards,
Team ExpertResume
          `;

          const command = new SendEmailCommand({
            Destination: { ToAddresses: [friendEmail] },
            Message: {
              Body: {
                Html: { Charset: "UTF-8", Data: emailHtml },
                Text: { Charset: "UTF-8", Data: emailText },
              },
              Subject: {
                Charset: "UTF-8",
                Data: `${referrerName} wants to share ExpertResume with you`,
              },
            },
            Source: '"ExpertResume" <support@vendaxsystemlabs.com>',
            ReplyToAddresses: ["support@vendaxsystemlabs.com"],
            Tags: [
              { Name: "template", Value: "referral_invite" },
              { Name: "referrer_id", Value: userId },
            ],
          });

          await sesClient.send(command);

          // Log email sending
          await adminDb.collection("email_logs").add({
            userId,
            recipientEmail: friendEmail,
            templateId: "referral_invite",
            status: "sent",
            referralCode,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the entire request if email fails
      }
    }

    // Note about WhatsApp: User can share via WhatsApp button on frontend
    // For automated WhatsApp, you would need WhatsApp Business API integration

    return NextResponse.json({
      message: friendEmail 
        ? "Invitation sent successfully via email!" 
        : "Referral created! Share the link via WhatsApp.",
      referralId: referralRef.id,
      success: true
    });

  } catch (error) {
    console.error("Error sending referral invite:", error);
    return NextResponse.json(
      { error: "Failed to send referral invite", details: error.message },
      { status: 500 }
    );
  }
}

