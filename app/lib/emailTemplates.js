// lib/emailTemplates.js
// Pricing logic from Pricing.js
import { getEffectivePricing } from './globalPricing';

const getCurrencyAndPriceByCountry = (currency) => {
  // Get device-specific pricing
  const devicePricing = getEffectivePricing(currency, false); // Default to non-Android for this function

  const currencyData = {
    INR: {
      currency: "INR",
      annualPrice: 319900, // ₹3,199
      monthlyPrice: devicePricing.monthly, // Dynamic pricing - ₹499 or discounted
      quarterlyPrice: devicePricing.quarterly, // Dynamic pricing - ₹699 or discounted
      sixMonthPrice: devicePricing.sixMonth, // Dynamic pricing - ₹899 or discounted
      basicPrice: devicePricing.basic, // Dynamic pricing based on device
      oneDayPrice: devicePricing.oneDay, // Dynamic pricing - ₹49 or discounted
      professionalPrice: 99900, // ₹999 (new professional tier)
      trialPrice: 4900, // ₹49 (reduced trial price)
      annualBasePrice: 254100, // ₹2,541
      monthlyBasePrice: 25300, // ₹253
      basicBasePrice: 8389, // ₹83.89
      professionalBasePrice: 84662, // ₹846.62
      trialBasePrice: 4150, // ₹41.50
      annualGST: 45800, // ₹458
      monthlyGST: 4600, // ₹46
      basicGST: 1511, // ₹15.11
      professionalGST: 15238, // ₹152.38
      trialGST: 750, // ₹7.50
    },
    USD: {
      currency: "USD",
      annualPrice: 30000, // $300
      monthlyPrice: devicePricing.monthly, // Dynamic pricing - $5 or discounted
      quarterlyPrice: devicePricing.quarterly, // Dynamic pricing - $14 or discounted
      sixMonthPrice: devicePricing.sixMonth, // Dynamic pricing - $18 or discounted
      basicPrice: devicePricing.basic, // $2 (weekly plan - valid for 1 week)
      oneDayPrice: devicePricing.oneDay, // Dynamic pricing - $0.50 or discounted
      professionalPrice: 10000, // $100
      trialPrice: 500, // $5
      annualBasePrice: 30000, // $300 (no GST)
      monthlyBasePrice: 3000, // $30
      basicBasePrice: 500, // $5
      professionalBasePrice: 10000, // $100
      trialBasePrice: 500, // $5
      annualGST: 0, // No GST
      monthlyGST: 0,
      basicGST: 0,
      professionalGST: 0,
      trialGST: 0,
    },
  };
  return currencyData[currency] || currencyData["INR"];
};

const formatPrice = (price, currency) => {
  const symbols = { INR: "₹", USD: "$" };
  if (currency === "USD") {
    return `${symbols[currency]}${(price / 100).toFixed(2)}`;
  }
  return `${symbols[currency]}${Math.floor(price / 100).toLocaleString("en-IN")}`;
};

const emailTemplates = {
  welcome: {
    subject: (data) => `Welcome to ExpertResume, ${data.firstName || 'Friend'}!`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Welcome to ExpertResume</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: #ffffff; font-size: 24px; margin-top: 15px; font-weight: bold;">Welcome, ${data.firstName || 'Friend'}!</h1>
              <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0;">Let's Build Your Path to a Dream Job</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 30px 20px;">
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Hi ${data.firstName || 'Friend'},</p>
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Thank you for joining ExpertResume! We're here to help you create a standout resume and prepare for interviews with our AI-powered tools.</p>
              
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">🚀 Your Premium Features Include:</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h4 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 16px;">⚡ 1-Minute AI Resume Upload</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Upload any resume format and let AI extract & organize your information instantly</p>
                  </div>
                  <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h4 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 16px;">🎯 AI Boost Feature</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Enhance your resume with AI-powered suggestions and improvements</p>
                  </div>
                  <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h4 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 16px;">📋 JD-Based Resume Builder</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Create targeted resumes optimized for specific job descriptions</p>
                  </div>
                  <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h4 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 16px;">📊 Detailed ATS Checker Report</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Get comprehensive analysis of your resume's ATS compatibility</p>
                  </div>
                  <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h4 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 16px;">💰 Salary Analyzer Tool</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Research and negotiate better salaries with data-driven insights</p>
                  </div>
                  <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h4 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 16px;">🤖 AI Interview Tool</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Practice interviews with AI-powered mock sessions and feedback</p>
                  </div>
                </div>
                <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 15px;">
                  <h4 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 16px;">📄 One Pager Resume</h4>
                  <p style="color: #6b7280; margin: 0; font-size: 14px;">Create concise, impactful one-page resumes that grab attention</p>
                </div>
              </div>

              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;"><strong>Ready to get started?</strong></p>
              <ul style="color: #5f6368; font-size: 16px; line-height: 1.6; padding-left: 20px; margin: 10px 0;">
                <li>Upload your existing resume or start fresh at <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/resume-builder" style="color: #1e3a8a; text-decoration: none;">${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/resume-builder</a></li>
                <li>Try our <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/upload-resume" style="color: #1e3a8a; text-decoration: none;">1-minute AI resume upload</a> to get started instantly</li>
                <li>Explore our <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/ats-score-checker" style="color: #1e3a8a; text-decoration: none;">ATS checker</a> to optimize your resume</li>
              </ul>
              <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/resume-builder" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; font-size: 16px; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">Create Your Resume Now</a>
            </td>
          </tr>
          <!-- Footer -->
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `,
    text: (data) => `
      Welcome to ExpertResume, ${data.firstName || 'Friend'}!

      Hi ${data.firstName || 'Friend'},

      Thank you for joining ExpertResume! We're here to help you create a standout resume and prepare for interviews with our AI-powered tools.

      🚀 Your Premium Features Include:
      - ⚡ 1-Minute AI Resume Upload: Upload any resume format and let AI extract & organize your information instantly
      - 🎯 AI Boost Feature: Enhance your resume with AI-powered suggestions and improvements
      - 📋 JD-Based Resume Builder: Create targeted resumes optimized for specific job descriptions
      - 📊 Detailed ATS Checker Report: Get comprehensive analysis of your resume's ATS compatibility
      - 💰 Salary Analyzer Tool: Research and negotiate better salaries with data-driven insights
      - 🤖 AI Interview Tool: Practice interviews with AI-powered mock sessions and feedback
      - 📄 One Pager Resume: Create concise, impactful one-page resumes that grab attention

      Ready to get started?
      - Upload your existing resume or start fresh at https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/resume-builder
      - Try our 1-minute AI resume upload at https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/upload-resume
      - Explore our ATS checker at https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/ats-score-checker

      Create Your Resume Now: https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/resume-builder

      The ExpertResume Team
      Vendax Systems LLC
      28 Geary St STE 650 Suite #500, San Francisco, CA 94108, USA
      https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}

      Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(data.email || '')}
    `,
  },
  daily_job_digest: {
    subject: (data) => `Your daily job matches for ${data.query || "today"}`,
    html: (data) => {
      const jobs = Array.isArray(data.jobs) ? data.jobs.slice(0, 5) : [];
      const query = data.query || "your search";
      const jobsHtml = jobs.length
        ? jobs
          .map(
            (job) => `
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 10px; background: #ffffff;">
                <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #111827;">
                  ${job.job_title || "Role"}
                </p>
                <p style="margin: 0 0 6px; font-size: 13px; color: #4b5563;">
                  ${job.employer_name || "Company"} • ${job.job_city || ""} ${job.job_country || ""}
                </p>
                ${job.job_apply_link ? `
                  <a href="${job.job_apply_link}" style="display: inline-block; font-size: 12px; color: #1d4ed8; text-decoration: none;">
                    View job →
                  </a>
                ` : ""}
              </td>
            </tr>
          `
          )
          .join("")
        : `
          <tr>
            <td style="padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 10px; background: #ffffff;">
              <p style="margin: 0; font-size: 14px; color: #4b5563;">
                No fresh matches today. We'll keep looking and email you tomorrow.
              </p>
            </td>
          </tr>
        `;

      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Daily Job Digest</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff;">
            <tr>
              <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 26px; text-align: center;">
                <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}" style="text-decoration: none;">
                  <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="150" style="display: block; margin: 0 auto;">
                </a>
                <h1 style="color: #ffffff; font-size: 20px; margin-top: 14px; font-weight: bold;">Your Daily Job Digest</h1>
                <p style="color: #e0e7ff; font-size: 14px; margin: 8px 0 0;">Matches for “${query}”</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 20px;">
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                  Hi ${data.firstName || "there"}, here are the top matches we found in the last 3 days.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0 10px;">
                  ${jobsHtml}
                </table>
                <div style="margin-top: 20px;">
                  <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/jobs-nearby" style="display: inline-block; background: #1d4ed8; color: #ffffff; font-size: 14px; font-weight: bold; padding: 12px 20px; text-decoration: none; border-radius: 6px;">
                    View more matches
                  </a>
                </div>
              </td>
            </tr>
            ${footerTemplate(data)}
          </table>
        </body>
        </html>
      `;
    },
    text: (data) => {
      const jobs = Array.isArray(data.jobs) ? data.jobs.slice(0, 5) : [];
      const query = data.query || "your search";
      const jobLines = jobs.length
        ? jobs.map((job) => `- ${job.job_title || "Role"} at ${job.employer_name || "Company"} (${job.job_city || ""} ${job.job_country || ""})`).join("\n")
        : "- No fresh matches today. We'll try again tomorrow.";

      return `
        Your daily job matches for ${query}

        Hi ${data.firstName || "there"},
        Here are the top matches we found in the last 3 days:

        ${jobLines}

        View more matches: https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/jobs-nearby

        Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(data.email || '')}
      `;
    },
  },
  enterprise_welcome: {
    subject: (data) => `Welcome to ExpertResume Enterprise, ${data.name || 'Professional'}!`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Welcome to ExpertResume Enterprise</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <a href="https://expertresume.us/enterprise" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <div style="background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 15px;">
                <span style="color: #fbbf24; font-size: 14px; font-weight: bold;">👑 ENTERPRISE</span>
              </div>
              <h1 style="color: #ffffff; font-size: 24px; margin-top: 15px; font-weight: bold;">Welcome to Enterprise, ${data.name || 'Professional'}!</h1>
              <p style="color: #e0e7ff; font-size: 16px; margin: 10px 0 0;">Your Professional Resume Writing Business Starts Here</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 30px 20px;">
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Hi ${data.name || 'Professional'},</p>
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Congratulations on upgrading to <strong>ExpertResume Enterprise ${data.plan || 'Professional'}</strong>! Your payment of <strong>${data.amount || 'your selected amount'}</strong> has been processed successfully.</p>
              
              <div style="background: linear-gradient(to right, #f3f4f6, #e5e7eb); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
                <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">🎉 Your Enterprise Account is Now Active!</h3>
                <p style="color: #4b5563; margin: 0; font-size: 14px;">Business: <strong>${data.businessName || 'Your Business'}</strong></p>
                <p style="color: #4b5563; margin: 5px 0 0 0; font-size: 14px;">Plan: <strong>${data.plan || 'Professional'}</strong> (${data.billingCycle || 'Monthly'})</p>
              </div>

              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;"><strong>Here's what you can do now:</strong></p>
              <ul style="color: #5f6368; font-size: 16px; line-height: 1.8; padding-left: 20px; margin: 15px 0;">
                <li><strong>Manage Unlimited Clients:</strong> Add and organize all your client profiles</li>
                <li><strong>Create Professional Resumes:</strong> Use premium templates and AI enhancement</li>
                <li><strong>Track Your Business:</strong> Monitor analytics and client progress</li>
                <li><strong>White-label Solutions:</strong> Brand the platform with your business identity</li>
                <li><strong>Priority Support:</strong> Get dedicated assistance when you need it</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://expertresume.us/enterprise/dashboard/professional" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; font-size: 16px; font-weight: bold; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">Access Your Dashboard</a>
                <a href="https://expertresume.us/enterprise/my-resumes" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff; font-size: 16px; font-weight: bold; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">Start Creating Resumes</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `,
    text: (data) => `Welcome to ExpertResume Enterprise, ${data.name || 'Professional'}! ...`,
  },
  paymentIncomplete: {
    subject: (data) => `Complete Your Payment to Unlock ExpertResume Premium, ${data.firstName || 'Friend'}!`,
    html: (data) => {
      const currency = data.currency || 'INR';
      const billingCycle = data.billingCycle || 'monthly';
      const prices = getCurrencyAndPriceByCountry(currency);
      const price = billingCycle === 'trial' ? prices.trialPrice :
        billingCycle === 'yearly' ? prices.annualPrice :
          billingCycle === 'sixMonth' ? prices.sixMonthPrice :
            billingCycle === 'quarterly' ? prices.quarterlyPrice :
              billingCycle === 'oneDay' ? prices.oneDayPrice :
                billingCycle === 'basic' ? prices.basicPrice :
                  prices.monthlyPrice;
      return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Payment</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: #ffffff; font-size: 24px; margin-top: 15px; font-weight: bold;">Hey ${data.firstName || 'Friend'},</h1>
              <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0;">Your Premium Benefits Are Waiting!</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 30px 20px;">
               <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">It looks like you started upgrading to ExpertResume Premium. Your plan ${billingCycle === 'oneDay' ? 'Basic' : billingCycle} is reserved for a limited time.</p>
               <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">By confirming your payment, you will unlock:</p>
               <ul style="color: #5f6368; font-size: 16px; line-height: 1.6; padding-left: 20px;">
                 <li>Unlimited resume downloads</li>
                 <li>Advanced ATS optimization</li>
                 <li>AI-powered resume building</li>
                 <li>And much more!</li>
               </ul>
               <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/pricing" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; font-size: 16px; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Complete Your Payment</a>
            </td>
          </tr>
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `;
    },
    text: (data) => `Complete Your Payment to Unlock ExpertResume Premium...`,
  },
  paymentComplete: {
    subject: (data) => `You're Now a ExpertResume Premium Member, ${data.firstName || 'Friend'}!`,
    html: (data) => {
      const currency = data.currency || 'INR';
      const amount = data.amount ? formatPrice(data.amount, currency) : 'your selected plan';
      const billingCycle = data.billingCycle || 'monthly';

      const cycleMap = {
        'oneDay': 'Quick Start Pass',
        'basic': 'Starter Plan',
        'monthly': 'Pro Monthly Plan',
        'quarterly': 'Pro Quarterly Plan',
        'sixMonth': 'Pro 6-Month Plan',
        'interview_gyani': 'Interview Gyani Pro'
      };
      const planName = cycleMap[billingCycle] || 'Premium Plan';

      return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ExpertResume Elite</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="180" style="display: block; margin: 0 auto 20px;">
              <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">🎉 Welcome to ExpertResume Elite!</h1>
              <p style="color: #e0e7ff; font-size: 16px; margin: 10px 0 0; line-height: 1.5;">You've joined the elite! Experience the full power of AI-driven career success.</p>
            </td>
          </tr>

          <!-- Plan Info -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; text-align: center;">
                <h2 style="color: #0369a1; font-size: 20px; margin: 0 0 5px; font-weight: 700;">${planName}</h2>
                <p style="color: #0c4a6e; font-size: 14px; margin: 0;">
                  ✨ ${billingCycle === 'interview_gyani' ? 'Senior AI Interviewer • Real-time Feedback • Readiness Reports' : 'Elite access • Unlimited Downloads • Premium experience'}
                  ${data.hasJobSearch ? '<br>+ <strong>AI Job Search Add-on</strong>' : ''}
                  ${data.hasInterviewKit ? '<br>+ <strong>Interview Prep Kit</strong>' : ''}
                  ${data.hasApplyPro ? '<br>+ <strong>Apply Pro Engine</strong>' : ''}
                </p>
              </div>
            </td>
          </tr>

          <!-- Core Features -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="color: #111827; font-size: 18px; margin: 0 0 20px; font-weight: 700; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Your Complete Premium Toolkit:</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <!-- Feature 1 -->
                <div style="margin-bottom: 15px;">
                  <h4 style="color: #1e40af; font-size: 15px; margin: 0 0 4px; font-weight: 700;">50+ Templates</h4>
                  <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.4;">Industry-specific designs that wow recruiters</p>
                </div>
                <!-- Feature 2 -->
                <div style="margin-bottom: 15px;">
                  <h4 style="color: #1e40af; font-size: 15px; margin: 0 0 4px; font-weight: 700;">Unlimited Exports</h4>
                  <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.4;">Professional PDFs without watermarks</p>
                </div>
                <!-- Feature 3 -->
                <div style="margin-bottom: 15px;">
                  <h4 style="color: #1e40af; font-size: 15px; margin: 0 0 4px; font-weight: 700;">JD Matcher</h4>
                  <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.4;">Tailor resumes to job descriptions in seconds</p>
                </div>
                <!-- Feature 4 -->
                <div style="margin-bottom: 15px;">
                  <h4 style="color: #1e40af; font-size: 15px; margin: 0 0 4px; font-weight: 700;">ATS Optimizer</h4>
                  <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.4;">Beat applicant tracking systems with 95% success</p>
                </div>
                <!-- Feature 5 -->
                <div style="margin-bottom: 15px;">
                  <h4 style="color: #1e40af; font-size: 15px; margin: 0 0 4px; font-weight: 700;">One-Pager Pro</h4>
                  <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.4;">Create impactful single-page resumes</p>
                </div>
                <!-- Feature 6 -->
                <div style="margin-bottom: 15px;">
                  <h4 style="color: #1e40af; font-size: 15px; margin: 0 0 4px; font-weight: 700;">Salary Analyzer</h4>
                  <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.4;">Know your worth & negotiate 20% more</p>
                </div>
                <!-- Feature 7 -->
                <div style="margin-bottom: 15px;">
                  <h4 style="color: #1e40af; font-size: 15px; margin: 0 0 4px; font-weight: 700;">AI Career Coach</h4>
                  <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.4;">Personalized 6-month career roadmap</p>
                </div>
                <!-- Feature 8 -->
                <div style="margin-bottom: 15px;">
                  <h4 style="color: #1e40af; font-size: 15px; margin: 0 0 4px; font-weight: 700;">Score Booster</h4>
                  <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.4;">Optimize for ATS with real-time scoring</p>
                </div>
              </div>

              <!-- Add-ons Section -->
              ${(data.hasJobSearch || data.hasInterviewKit || data.hasApplyPro) ? `
              <div style="margin-top: 25px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px;">
                <h3 style="color: #065f46; font-size: 16px; margin: 0 0 15px; font-weight: 700;">🚀 Your Premium Add-ons</h3>
                ${data.hasJobSearch ? `
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                  <span style="background: #059669; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; height: fit-content; margin-top: 2px;">ACTIVE</span>
                  <div>
                    <h4 style="color: #065f46; font-size: 14px; margin: 0 0 2px; font-weight: 700;">AI Job Matching</h4>
                    <p style="color: #047857; font-size: 12px; margin: 0;">AI-powered job recommendations tailored to your profile + Real-time notifications</p>
                  </div>
                </div>` : ''}
                ${data.hasInterviewKit ? `
                <div style="display: flex; gap: 10px;">
                  <span style="background: #059669; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; height: fit-content; margin-top: 2px;">ACTIVE</span>
                  <div>
                    <h4 style="color: #065f46; font-size: 14px; margin: 0 0 2px; font-weight: 700;">Interview Gyani Pro</h4>
                    <p style="color: #047857; font-size: 12px; margin: 0;">Elite Mock interviews, Resume-Aware AI coaching, and Detailed Readiness reports.</p>
                  </div>
                </div>` : ''}
                ${data.hasApplyPro ? `
                <div style="display: flex; gap: 10px;">
                  <span style="background: #059669; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; height: fit-content; margin-top: 2px;">ACTIVE</span>
                  <div>
                    <h4 style="color: #065f46; font-size: 14px; margin: 0 0 2px; font-weight: 700;">Apply Pro Engine</h4>
                    <p style="color: #047857; font-size: 12px; margin: 0;">Automated job applications on 20+ platforms</p>
                  </div>
                </div>` : ''}
              </div>` : ''}

              ${billingCycle === 'interview_gyani' ? `
              <div style="margin-top: 25px; background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 20px;">
                <h3 style="color: #9a3412; font-size: 16px; margin: 0 0 15px; font-weight: 700;">🤖 Interview Simulation  Pro Features</h3>
                <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                  <div style="color: #c2410c; font-size: 14px;"><strong>✓ 20 Full Mock Sessions / Month</strong></div>
                  <div style="color: #c2410c; font-size: 14px;"><strong>✓ Resume-Aware AI Questioning</strong></div>
                  <div style="color: #c2410c; font-size: 14px;"><strong>✓ Senior-Level Performance Evaluation</strong></div>
                  <div style="color: #c2410c; font-size: 14px;"><strong>✓ Personalized Readiness Reports</strong></div>
                </div>
              </div>` : ''}

            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/resume-builder" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; font-size: 16px; font-weight: bold; padding: 16px 32px; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);">Start Building Your Resume</a>
              <p style="color: #9ca3af; font-size: 13px; margin: 20px 0 0;">✨ Welcome to the elite tier! Your career transformation starts now.</p>
            </td>
          </tr>

          <!-- Footer -->
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
      `;
    },
    text: (data) => {
      if (data.billingCycle === 'interview_gyani') {
        return `Welcome to Interview Simulation  Pro! You now have access to senior AI mock interviews, detailed readiness reports, and personalized feedback to crack your next job. Access your portal at ${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/interview-gyani`;
      }
      return `Welcome to ExpertResume Elite! ... (Check HTML version for full content)`;
    }
  },
  invoice: {
    subject: (data) => `Payment Receipt for your ExpertResume ${data.planName || 'Premium Plan'}`,
    html: (data) => {
      const currency = data.currency || 'INR';
      const isINR = currency === 'INR';

      const totalAmount = data.finalAmount || 0;

      // Use pre-calculated values if available, otherwise fallback (for safety)
      const baseAmount = data.baseAmount || 0;
      const jobSearchAmount = data.addonJobSearchAmount || 0;
      const interviewKitAmount = data.addonInterviewKitAmount || 0;
      const applyProAmount = data.addonApplyProAmount || 0;
      const subtotal = data.subtotal || totalAmount;
      const discountAmount = data.discountAmount || 0;
      const taxableAmount = data.taxableAmount || totalAmount;
      const gstAmount = data.gstAmount || 0;

      // Format prices
      const fmtTotal = formatPrice(totalAmount, currency);
      const fmtBase = formatPrice(baseAmount, currency);
      const fmtJobSearch = formatPrice(jobSearchAmount, currency);
      const fmtInterviewKit = formatPrice(interviewKitAmount, currency);
      const fmtApplyPro = formatPrice(applyProAmount, currency);
      const fmtSubtotal = formatPrice(subtotal, currency);
      const fmtDiscount = formatPrice(discountAmount, currency);
      const fmtTaxable = formatPrice(taxableAmount, currency);
      const fmtGST = formatPrice(gstAmount, currency);

      const invoiceDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

      return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; border-bottom: 2px solid #f3f4f6;">
              <table width="100%">
                <tr>
                  <td valign="top">
                    <img src="${'https://expertresume.us/ExpertResume.png'}" alt="ExpertResume" width="140" style="display: block;">
                    <p style="margin: 10px 0 0; color: #6b7280; font-size: 14px;">Vendax Systems LLC</p>
                    <p style="margin: 2px 0 0; color: #6b7280; font-size: 14px;">28 Geary St STE 650 Suite #500, San Francisco, CA 94108, USA</p>
                  </td>
                  <td valign="top" style="text-align: right;">
                    <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: bold;">INVOICE</h1>
                    <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">#${invoiceNumber}</p>
                    <p style="margin: 2px 0 0; color: #6b7280; font-size: 14px;">${invoiceDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Billing Info -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Billed To</p>
              <h3 style="margin: 8px 0 0; color: #111827; font-size: 18px;">${data.firstName || 'Customer'}</h3>
              <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">${data.email || ''}</p>
            </td>
          </tr>

          <!-- Invoice Items -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px 16px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600; border-radius: 6px 0 0 6px;">Description</th>
                    <th style="padding: 12px 16px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600; border-radius: 0 6px 6px 0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 16px; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      ${data.planName || 'ExpertResume Premium Plan'}
                      <div style="color: #6b7280; font-size: 12px; margin-top: 4px;">Subscription Period: ${data.billingCycle || 'Monthly'}</div>
                    </td>
                    <td style="padding: 16px; text-align: right; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      ${fmtBase}
                    </td>
                  </tr>
                  ${data.hasJobSearch ? `
                  <tr>
                    <td style="padding: 16px; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      AI Job Search Add-on
                    </td>
                    <td style="padding: 16px; text-align: right; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      ${fmtJobSearch}
                    </td>
                  </tr>` : ''}
                  ${data.hasInterviewKit ? `
                  <tr>
                    <td style="padding: 16px; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      Interview Prep Kit Add-on
                    </td>
                    <td style="padding: 16px; text-align: right; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      ${fmtInterviewKit}
                    </td>
                  </tr>` : ''}
                  ${data.hasApplyPro ? `
                  <tr>
                    <td style="padding: 16px; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      Apply Pro Engine Add-on
                    </td>
                    <td style="padding: 16px; text-align: right; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      ${fmtApplyPro}
                    </td>
                  </tr>` : ''}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="30%"></td>
                  <td width="70%">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                        <td style="padding: 6px 0; text-align: right; color: #111827; font-size: 14px; font-weight: 500;">${fmtSubtotal}</td>
                      </tr>
                      ${discountAmount > 0 ? `
                      <tr>
                        <td style="padding: 6px 0; color: #059669; font-size: 14px;">Discount</td>
                        <td style="padding: 6px 0; text-align: right; color: #059669; font-size: 14px; font-weight: 500;">-${fmtDiscount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Taxable Value</td>
                        <td style="padding: 6px 0; text-align: right; color: #111827; font-size: 14px; font-weight: 500;">${fmtTaxable}</td>
                      </tr>` : ''}
                      ${isINR ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Taxes</td>
                        <td style="padding: 6px 0; text-align: right; color: #111827; font-size: 14px; font-weight: 500;">Included</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 12px 0 0; color: #111827; font-size: 16px; font-weight: bold; border-top: 2px solid #f3f4f6;">Total Paid</td>
                        <td style="padding: 12px 0 0; text-align: right; color: #2563eb; font-size: 18px; font-weight: bold; border-top: 2px solid #f3f4f6;">${fmtTotal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Paid Stamp -->
              <div style="margin-top: 30px; text-align: center;">
                <div style="display: inline-block; border: 2px solid #059669; color: #059669; font-weight: bold; padding: 8px 30px; font-size: 18px; letter-spacing: 2px; transform: rotate(-3deg); border-radius: 4px; text-transform: uppercase;">
                  PAID
                </div>
              </div>

              <!-- Support Link -->
              <p style="margin: 30px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                If you have any questions about this invoice, please contact <a href="mailto:support@vendaxsystemlabs.com" style="color: #2563eb; text-decoration: none;">support@vendaxsystemlabs.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
      `;
    },
    text: (data) => {
      const currency = data.currency || 'INR';
      const amount = data.amount ? formatPrice(data.amount, currency) : 'your selected plan';
      return `
      PAYMENT RECEIPT

      Invoice Number: INV-${Date.now().toString().slice(-8)}
      Date: ${new Date().toLocaleDateString('en-IN')}

      Billed To:
      ${data.firstName || 'Customer'}
      ${data.email || ''}

      Description:
      ${data.planName || 'ExpertResume Premium Plan'}
      Subscription Period: ${data.billingCycle || 'Monthly'}
      ${data.hasJobSearch ? '+ AI Job Search Add-on (Included)' : ''}
      ${data.hasInterviewKit ? '+ Interview Prep Kit Add-on (Included)' : ''}
      ${data.hasApplyPro ? '+ Apply Pro Engine Add-on (Included)' : ''}

      Total Paid: ${data.finalAmount}

      Thank you for your business!
      
      Vendax Systems LLC
      28 Geary St STE 650 Suite #500, San Francisco, CA 94108, USA
      support@vendaxsystemlabs.com
      `;
    }
  },
  verification: {
    subject: (data) => `Verify your email for ExpertResume`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: #ffffff; font-size: 24px; margin-top: 15px; font-weight: bold;">Verify your email</h1>
              <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0;">Enter the code below to verify your email address</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Hi ${data.firstName || 'there'},</p>
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Your ExpertResume verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #1e3a8a; letter-spacing: 6px; margin: 24px 0;">${data.code}</div>
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Enter this code on the website to complete your verification.</p>
              <p style="color: #5f6368; font-size: 14px; margin-top: 32px;">If you did not request this, you can ignore this email.</p>
            </td>
          </tr>
          <!-- Footer -->
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `,
    text: (data) => `
      Verify your email for ExpertResume

      Hi ${data.firstName || 'there'},

      Your ExpertResume verification code is: ${data.code}

      Enter this code on the website to complete your verification.

      If you did not request this, you can ignore this email.

      The ExpertResume Team
      https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}
    `,
  },
  team_invitation: {
    subject: (data) => `You're invited to join ${data.businessName || 'a team'} on ExpertResume Enterprise`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Team Invitation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <a href="https://expertresume.us" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: #ffffff; font-size: 24px; margin-top: 15px; font-weight: bold;">Team Invitation</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">Hi ${data.memberName},</p>
              <p style="font-size: 16px; color: #333;">You have been invited to join <strong>${data.businessName}</strong> on ExpertResume Enterprise.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.invitationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accept Invitation</a>
              </div>
              <p style="font-size: 14px; color: #666;">This link will expire in 24 hours.</p>
            </td>
          </tr>
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `,
    text: (data) => `You are invited to join ${data.businessName}. Link: ${data.invitationLink}`,
  },
  referral_conversion: {
    subject: (data) => `🎉 You earned ₹${data.earnings}! Your referral just upgraded!`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Referral Earnings</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
              <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: #ffffff; font-size: 24px; margin-top: 15px; font-weight: bold;">Congratulations!</h1>
              <p style="color: #ffffff; font-size: 18px; margin: 10px 0 0;">You just earned ₹${data.earnings}!</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Hi ${data.firstName || 'Friend'},</p>
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Great news! Someone you referred just upgraded to a premium plan.</p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #166534; font-size: 18px; font-weight: bold; margin: 0;">You've earned ₹${data.earnings}</p>
                <p style="color: #166534; font-size: 14px; margin: 5px 0 0;">This amount has been added to your wallet.</p>
              </div>
              <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/referral" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 16px; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Your Earnings</a>
            </td>
          </tr>
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `,
    text: (data) => `Congratulations! You earned ₹${data.earnings}.`,
  },
  profile_slot_purchased: {
    subject: (data) => `Profile Slot Added Successfully - ExpertResume`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Profile Slot Added</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: #ffffff; font-size: 24px; margin-top: 15px; font-weight: bold;">Profile Slot Added!</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Hi ${data.firstName || 'Friend'},</p>
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">You have successfully purchased an additional profile slot.</p>
              
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #1e40af; font-size: 18px; font-weight: bold; margin: 0;">What you can do now:</p>
                <ul style="color: #1e3a8a; text-align: left; margin-top: 10px;">
                  <li>Create a new resume for a family member or friend</li>
                  <li>Manage their documents separately from your own</li>
                  <li>Enjoy unlimited downloads for this new profile</li>
                </ul>
              </div>

              <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}/resume-builder" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; font-size: 16px; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Go to Dashboard</a>
            </td>
          </tr>
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `,
    text: (data) => `You have successfully purchased an additional profile slot. Go to your dashboard to use it.`,
  },
  resetPassword: {
    subject: (data) => `Reset Your Password - ExpertResume`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: #ffffff; font-size: 24px; margin-top: 15px; font-weight: bold;">Password Reset Request</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">Hi ${data.firstName || 'there'},</p>
              <p style="color: #5f6368; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your ExpertResume account associated with ${data.email}.</p>
              
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="color: #1e40af; font-size: 14px; margin: 0 0 15px 0;">Click the button below to reset your password. This link will expire in 1 hour.</p>
                <a href="${data.resetLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-size: 16px; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.5);">Reset My Password</a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Or copy and paste this link into your browser:</p>
              <p style="color: #6b7280; font-size: 12px; word-break: break-all; margin-top: 5px;">${data.resetLink}</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </td>
          </tr>
          <!-- Footer -->
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `,
    text: (data) => `
      Reset Your Password

      Hi ${data.firstName || 'there'},

      We received a request to reset the password for your ExpertResume account.

      Click the link below to reset your password:
      ${data.resetLink}

      If you didn't request this, please ignore this email.

      The ExpertResume Team
    `,
  }
};

// Shared footer template
const footerTemplate = (data) => {
  const emailForUnsubscribe = data.email || '';
  return `
    <tr>
      <td style="background-color: #f1f3f4; padding: 30px 20px; text-align: center;">
        
        <!-- Social Media Icons -->
        <div style="margin-bottom: 20px;">
          <a href="https://www.instagram.com/expertresume/" style="text-decoration: none; margin: 0 8px;">
            <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="24" height="24" style="border: 0;">
          </a>
          <a href="https://www.facebook.com/expertresume" style="text-decoration: none; margin: 0 8px;">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="24" height="24" style="border: 0;">
          </a>
          <a href="https://www.youtube.com/@ExpertResume" style="text-decoration: none; margin: 0 8px;">
            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" width="24" height="24" style="border: 0;">
          </a>
          <a href="https://www.linkedin.com/in/expertresume" style="text-decoration: none; margin: 0 8px;">
            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="24" height="24" style="border: 0;">
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
          <strong>ExpertResume</strong><br>
          <span style="font-size: 12px;">Powered by Vendax Systems LLC</span>
        </p>
        
        <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0;">
          <a href="https://${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}" style="color: #6b7280; text-decoration: none;">${data.isUSDomain ? 'expertresume.com' : 'expertresume.us'}</a>
          <span style="margin: 0 5px;">•</span>
          28 Geary St STE 650 Suite #500, San Francisco, CA 94108, USA
        </p>

        <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0;">
          You received this email because you signed up for ExpertResume.<br>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(emailForUnsubscribe)}" style="color: #4b5563; text-decoration: underline;">Unsubscribe</a>
        </p>
        
        <p style="color: #d1d5db; font-size: 11px; margin: 20px 0 0;">© ${new Date().getFullYear()} Vendax Systems LLC. All rights reserved.</p>
      </td>
    </tr>
  `;
};

export const getEmailContent = (templateId, data) => {
  const template = emailTemplates[templateId];
  if (!template) {
    throw new Error(`Template "${templateId}" not found`);
  }
  return {
    subject: template.subject(data),
    html: template.html(data),
    text: template.text(data),
  };
};

export default emailTemplates;