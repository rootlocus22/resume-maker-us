// Quick script to send test emails for each template
// Run: node scripts/send-test-emails.js

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'rahuldubey220890@gmail.com';

const templates = [
  {
    templateId: 'welcome',
    data: {
      firstName: 'Rahul',
      email: TEST_EMAIL,
    }
  },
  {
    templateId: 'paymentIncomplete',
    data: {
      firstName: 'Rahul',
      email: TEST_EMAIL,
      currency: 'USD',
      billingCycle: 'monthly',
    }
  },
  {
    templateId: 'paymentComplete',
    data: {
      firstName: 'Rahul',
      email: TEST_EMAIL,
      currency: 'USD',
      billingCycle: 'monthly',
      amount: 999,
      hasJobSearch: true,
      hasInterviewKit: false,
      hasApplyPro: false,
    }
  },
  {
    templateId: 'invoice',
    data: {
      firstName: 'Rahul',
      email: TEST_EMAIL,
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
    }
  },
  {
    templateId: 'verification',
    data: {
      firstName: 'Rahul',
      email: TEST_EMAIL,
      code: '847291',
    }
  },
  {
    templateId: 'resetPassword',
    data: {
      firstName: 'Rahul',
      email: TEST_EMAIL,
      resetLink: 'https://expertresume.us/reset-password?token=test-token-123',
    }
  },
  {
    templateId: 'referral_conversion',
    data: {
      firstName: 'Rahul',
      email: TEST_EMAIL,
      earnings: '5.00',
    }
  },
  {
    templateId: 'profile_slot_purchased',
    data: {
      firstName: 'Rahul',
      email: TEST_EMAIL,
    }
  },
  {
    templateId: 'enterprise_welcome',
    data: {
      name: 'Rahul',
      email: TEST_EMAIL,
      plan: 'Professional',
      amount: '$99/month',
      businessName: 'Acme Resumes LLC',
      billingCycle: 'Monthly',
    }
  },
  {
    templateId: 'team_invitation',
    data: {
      memberName: 'Rahul',
      email: TEST_EMAIL,
      businessName: 'Acme Resumes LLC',
      invitationLink: 'https://expertresume.us/enterprise/accept-invite?token=test-123',
    }
  },
  {
    templateId: 'daily_job_digest',
    data: {
      firstName: 'Rahul',
      email: TEST_EMAIL,
      query: 'Software Engineer in San Francisco',
      jobs: [
        { job_title: 'Senior Software Engineer', employer_name: 'Google', job_city: 'San Francisco', job_country: 'US', job_apply_link: 'https://careers.google.com' },
        { job_title: 'Full Stack Developer', employer_name: 'Stripe', job_city: 'San Francisco', job_country: 'US', job_apply_link: 'https://stripe.com/jobs' },
        { job_title: 'Backend Engineer', employer_name: 'Airbnb', job_city: 'San Francisco', job_country: 'US', job_apply_link: 'https://careers.airbnb.com' },
      ]
    }
  },
];

async function sendTestEmails() {
  console.log(`\n📧 Sending ${templates.length} test emails to ${TEST_EMAIL}\n`);
  console.log('─'.repeat(60));

  for (let i = 0; i < templates.length; i++) {
    const { templateId, data } = templates[i];
    console.log(`\n[${i + 1}/${templates.length}] Sending: ${templateId}...`);

    try {
      const res = await fetch(`${BASE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          email: TEST_EMAIL,
          data,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        console.log(`  ✅ Sent! (${result.sesMessageId || 'OK'})`);
      } else {
        console.log(`  ❌ Failed: ${result.error || result.message || JSON.stringify(result)}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }

    // Small delay between sends to avoid rate limiting
    if (i < templates.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`\n✅ Done! Check ${TEST_EMAIL} for all ${templates.length} emails.\n`);
}

sendTestEmails();
