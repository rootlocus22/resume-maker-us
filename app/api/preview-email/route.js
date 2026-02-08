import { NextResponse } from "next/server";
import { getEmailContent } from "../../lib/emailTemplates";

// GET /api/preview-email?template=welcome
// Preview any email template in the browser
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get('template') || 'welcome';

  const testData = {
    welcome: {
      firstName: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
    },
    paymentIncomplete: {
      firstName: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
      currency: 'USD',
      billingCycle: 'monthly',
    },
    paymentComplete: {
      firstName: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
      currency: 'USD',
      billingCycle: 'monthly',
      amount: 999,
      hasJobSearch: true,
      hasInterviewKit: false,
      hasApplyPro: false,
    },
    invoice: {
      firstName: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
      currency: 'USD',
      billingCycle: 'Monthly',
      planName: 'Pro Monthly Plan',
      baseAmount: 999,
      subtotal: 999,
      finalAmount: 999,
      discountAmount: 0,
      taxableAmount: 999,
      gstAmount: 0,
      hasJobSearch: false,
      hasInterviewKit: false,
      hasApplyPro: false,
    },
    verification: {
      firstName: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
      code: '847291',
    },
    resetPassword: {
      firstName: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
      resetLink: 'https://expertresume.us/reset-password?token=test-token-123',
    },
    referral_conversion: {
      firstName: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
      earnings: '5.00',
    },
    profile_slot_purchased: {
      firstName: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
    },
    enterprise_welcome: {
      name: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
      plan: 'Professional',
      amount: '$99/month',
      businessName: 'Acme Resumes LLC',
      billingCycle: 'Monthly',
    },
    team_invitation: {
      memberName: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
      businessName: 'Acme Resumes LLC',
      invitationLink: 'https://expertresume.us/enterprise/accept-invite?token=test-123',
    },
    daily_job_digest: {
      firstName: 'Rahul',
      email: 'rahuldubey220890@gmail.com',
      query: 'Software Engineer in San Francisco',
      jobs: [
        { job_title: 'Senior Software Engineer', employer_name: 'Google', job_city: 'San Francisco', job_country: 'US', job_apply_link: 'https://careers.google.com' },
        { job_title: 'Full Stack Developer', employer_name: 'Stripe', job_city: 'San Francisco', job_country: 'US', job_apply_link: 'https://stripe.com/jobs' },
        { job_title: 'Backend Engineer', employer_name: 'Airbnb', job_city: 'San Francisco', job_country: 'US', job_apply_link: 'https://careers.airbnb.com' },
      ]
    },
  };

  // If template is 'all', show an index page with links
  if (templateId === 'all') {
    const templateNames = Object.keys(testData);
    const linksHtml = templateNames.map(name => 
      `<a href="/api/preview-email?template=${name}" style="display:block; padding:12px 20px; margin:6px 0; background:#f0fdfa; border:1px solid #99f6e4; border-radius:8px; color:#0f766e; text-decoration:none; font-weight:600;">${name}</a>`
    ).join('');

    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head><title>Email Template Previews</title></head>
      <body style="font-family: Arial, sans-serif; max-width:500px; margin:40px auto; padding:20px;">
        <h1 style="color:#0f766e;">Email Template Previews</h1>
        <p style="color:#6b7280;">Click any template to preview it:</p>
        ${linksHtml}
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }

  const data = testData[templateId];
  if (!data) {
    return NextResponse.json({ error: `Unknown template: ${templateId}. Available: ${Object.keys(testData).join(', ')}` }, { status: 400 });
  }

  try {
    const { subject, html } = getEmailContent(templateId, data);
    
    // Wrap in a preview frame showing the subject
    const previewHtml = `
      <!DOCTYPE html>
      <html>
      <head><title>Preview: ${subject}</title></head>
      <body style="margin:0; padding:0; background:#e5e7eb;">
        <div style="background:#0f766e; color:white; padding:16px 24px; font-family:Arial,sans-serif;">
          <div style="max-width:600px; margin:0 auto;">
            <strong>Subject:</strong> ${subject}<br>
            <small>Template: ${templateId} | <a href="/api/preview-email?template=all" style="color:#99f6e4;">← All templates</a></small>
          </div>
        </div>
        ${html}
      </body>
      </html>
    `;

    return new NextResponse(previewHtml, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
