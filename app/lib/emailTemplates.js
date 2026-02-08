// lib/emailTemplates.js
// Pricing logic from Pricing.js
import { getEffectivePricing } from './globalPricing';

const getCurrencyAndPriceByCountry = (currency) => {
  // Get device-specific pricing
  const devicePricing = getEffectivePricing(currency, false);

  const currencyData = {
    USD: {
      currency: "USD",
      annualPrice: 30000, // $300
      monthlyPrice: devicePricing.monthly,
      quarterlyPrice: devicePricing.quarterly,
      sixMonthPrice: devicePricing.sixMonth,
      basicPrice: devicePricing.basic,
      oneDayPrice: devicePricing.oneDay,
      professionalPrice: 10000, // $100
      trialPrice: 500, // $5
      annualBasePrice: 30000,
      monthlyBasePrice: 3000,
      basicBasePrice: 500,
      professionalBasePrice: 10000,
      trialBasePrice: 500,
      annualGST: 0,
      monthlyGST: 0,
      basicGST: 0,
      professionalGST: 0,
      trialGST: 0,
    },
    INR: {
      currency: "INR",
      annualPrice: 319900,
      monthlyPrice: devicePricing.monthly,
      quarterlyPrice: devicePricing.quarterly,
      sixMonthPrice: devicePricing.sixMonth,
      basicPrice: devicePricing.basic,
      oneDayPrice: devicePricing.oneDay,
      professionalPrice: 99900,
      trialPrice: 4900,
      annualBasePrice: 254100,
      monthlyBasePrice: 25300,
      basicBasePrice: 8389,
      professionalBasePrice: 84662,
      trialBasePrice: 4150,
      annualGST: 45800,
      monthlyGST: 4600,
      basicGST: 1511,
      professionalGST: 15238,
      trialGST: 750,
    },
  };
  return currencyData[currency] || currencyData["USD"];
};

const formatPrice = (price, currency) => {
  const symbols = { INR: "₹", USD: "$" };
  if (currency === "USD") {
    return `${symbols[currency]}${(price / 100).toFixed(2)}`;
  }
  return `${symbols[currency] || '$'}${Math.floor(price / 100).toLocaleString("en-US")}`;
};

// Brand color constants
const BRAND = {
  teal: '#0d9488',
  tealDark: '#0f766e',
  tealLight: '#14b8a6',
  tealBg: '#f0fdfa',
  tealBorder: '#99f6e4',
  gradientHeader: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
  gradientCTA: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
  greenSuccess: '#059669',
  greenSuccessLight: '#ecfdf5',
  greenSuccessBorder: '#a7f3d0',
  dark: '#111827',
  gray: '#6b7280',
  grayLight: '#9ca3af',
  grayBg: '#f9fafb',
  white: '#ffffff',
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
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${BRAND.gradientHeader}; padding: 40px 30px; text-align: center;">
              <a href="https://expertresume.us" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: ${BRAND.white}; font-size: 26px; margin-top: 18px; font-weight: 800; letter-spacing: -0.5px;">Welcome, ${data.firstName || 'Friend'}!</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0;">Let's Build Your Path to a Dream Job</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Hi ${data.firstName || 'Friend'},</p>
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Thank you for joining ExpertResume! We're here to help you create a standout resume and prepare for interviews with our AI-powered tools.</p>
              
              <div style="background: ${BRAND.tealBg}; padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid ${BRAND.teal};">
                <h3 style="color: ${BRAND.dark}; margin: 0 0 16px 0; font-size: 18px;">Your Premium Features Include:</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="padding: 6px 8px 6px 0; vertical-align: top;">
                      <div style="background: ${BRAND.white}; padding: 14px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4 style="color: ${BRAND.tealDark}; margin: 0 0 6px 0; font-size: 14px;">1-Minute AI Resume Upload</h4>
                        <p style="color: ${BRAND.gray}; margin: 0; font-size: 13px;">Upload any resume format and let AI extract & organize your info instantly</p>
                      </div>
                    </td>
                    <td width="50%" style="padding: 6px 0 6px 8px; vertical-align: top;">
                      <div style="background: ${BRAND.white}; padding: 14px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4 style="color: ${BRAND.tealDark}; margin: 0 0 6px 0; font-size: 14px;">AI Boost Feature</h4>
                        <p style="color: ${BRAND.gray}; margin: 0; font-size: 13px;">Enhance your resume with AI-powered suggestions and improvements</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding: 6px 8px 6px 0; vertical-align: top;">
                      <div style="background: ${BRAND.white}; padding: 14px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4 style="color: ${BRAND.tealDark}; margin: 0 0 6px 0; font-size: 14px;">JD-Based Resume Builder</h4>
                        <p style="color: ${BRAND.gray}; margin: 0; font-size: 13px;">Create targeted resumes optimized for specific job descriptions</p>
                      </div>
                    </td>
                    <td width="50%" style="padding: 6px 0 6px 8px; vertical-align: top;">
                      <div style="background: ${BRAND.white}; padding: 14px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4 style="color: ${BRAND.tealDark}; margin: 0 0 6px 0; font-size: 14px;">Detailed ATS Checker</h4>
                        <p style="color: ${BRAND.gray}; margin: 0; font-size: 13px;">Get comprehensive analysis of your resume's ATS compatibility</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding: 6px 8px 6px 0; vertical-align: top;">
                      <div style="background: ${BRAND.white}; padding: 14px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4 style="color: ${BRAND.tealDark}; margin: 0 0 6px 0; font-size: 14px;">Salary Analyzer Tool</h4>
                        <p style="color: ${BRAND.gray}; margin: 0; font-size: 13px;">Research and negotiate better salaries with data-driven insights</p>
                      </div>
                    </td>
                    <td width="50%" style="padding: 6px 0 6px 8px; vertical-align: top;">
                      <div style="background: ${BRAND.white}; padding: 14px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4 style="color: ${BRAND.tealDark}; margin: 0 0 6px 0; font-size: 14px;">AI Interview Trainer</h4>
                        <p style="color: ${BRAND.gray}; margin: 0; font-size: 13px;">Practice interviews with AI-powered mock sessions and feedback</p>
                      </div>
                    </td>
                  </tr>
                </table>
                <div style="background: ${BRAND.white}; padding: 14px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 12px;">
                  <h4 style="color: ${BRAND.tealDark}; margin: 0 0 6px 0; font-size: 14px;">One Pager Resume</h4>
                  <p style="color: ${BRAND.gray}; margin: 0; font-size: 13px;">Create concise, impactful one-page resumes that grab attention</p>
                </div>
              </div>

              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;"><strong>Ready to get started?</strong></p>
              <ul style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.8; padding-left: 20px; margin: 10px 0;">
                <li>Upload your existing resume or start fresh at <a href="https://expertresume.us/resume-builder" style="color: ${BRAND.teal}; text-decoration: none; font-weight: 600;">expertresume.us/resume-builder</a></li>
                <li>Try our <a href="https://expertresume.us/upload-resume" style="color: ${BRAND.teal}; text-decoration: none; font-weight: 600;">1-minute AI resume upload</a> to get started instantly</li>
                <li>Explore our <a href="https://expertresume.us/ats-score-checker" style="color: ${BRAND.teal}; text-decoration: none; font-weight: 600;">ATS checker</a> to optimize your resume</li>
              </ul>
              <div style="text-align: center; margin: 28px 0;">
                <a href="https://expertresume.us/resume-builder" style="display: inline-block; background: ${BRAND.gradientCTA}; color: ${BRAND.white}; font-size: 16px; font-weight: bold; padding: 14px 32px; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.4);">Create Your Resume Now</a>
              </div>
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

      Your Premium Features Include:
      - 1-Minute AI Resume Upload: Upload any resume format and let AI extract & organize your information instantly
      - AI Boost Feature: Enhance your resume with AI-powered suggestions and improvements
      - JD-Based Resume Builder: Create targeted resumes optimized for specific job descriptions
      - Detailed ATS Checker Report: Get comprehensive analysis of your resume's ATS compatibility
      - Salary Analyzer Tool: Research and negotiate better salaries with data-driven insights
      - AI Interview Trainer: Practice interviews with AI-powered mock sessions and feedback
      - One Pager Resume: Create concise, impactful one-page resumes that grab attention

      Ready to get started?
      - Upload your existing resume or start fresh at https://expertresume.us/resume-builder
      - Try our 1-minute AI resume upload at https://expertresume.us/upload-resume
      - Explore our ATS checker at https://expertresume.us/ats-score-checker

      Create Your Resume Now: https://expertresume.us/resume-builder

      The ExpertResume Team
      Vendax Systems LLC
      28 Geary St STE 650 Suite #500, San Francisco, CA 94108, USA
      https://expertresume.us

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
              <td style="padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 10px; background: ${BRAND.white};">
                <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: ${BRAND.dark};">
                  ${job.job_title || "Role"}
                </p>
                <p style="margin: 0 0 6px; font-size: 13px; color: #4b5563;">
                  ${job.employer_name || "Company"} • ${job.job_city || ""} ${job.job_country || ""}
                </p>
                ${job.job_apply_link ? `
                  <a href="${job.job_apply_link}" style="display: inline-block; font-size: 12px; color: ${BRAND.teal}; text-decoration: none; font-weight: 600;">
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
            <td style="padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 10px; background: ${BRAND.white};">
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
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <tr>
              <td style="background: ${BRAND.gradientHeader}; padding: 30px; text-align: center;">
                <a href="https://expertresume.us" style="text-decoration: none;">
                  <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="150" style="display: block; margin: 0 auto;">
                </a>
                <h1 style="color: ${BRAND.white}; font-size: 22px; margin-top: 14px; font-weight: bold;">Your Daily Job Digest</h1>
                <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0;">Matches for "${query}"</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 24px;">
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                  Hi ${data.firstName || "there"}, here are the top matches we found in the last 3 days.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0 10px;">
                  ${jobsHtml}
                </table>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="https://expertresume.us/jobs-nearby" style="display: inline-block; background: ${BRAND.gradientCTA}; color: ${BRAND.white}; font-size: 14px; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.3);">
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

        View more matches: https://expertresume.us/jobs-nearby

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
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${BRAND.gradientHeader}; padding: 40px 30px; text-align: center;">
              <a href="https://expertresume.us/enterprise" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <div style="background: rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 15px;">
                <span style="color: #fbbf24; font-size: 14px; font-weight: bold;">ENTERPRISE</span>
              </div>
              <h1 style="color: ${BRAND.white}; font-size: 26px; margin-top: 15px; font-weight: 800; letter-spacing: -0.5px;">Welcome to Enterprise, ${data.name || 'Professional'}!</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0;">Your Professional Resume Writing Business Starts Here</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Hi ${data.name || 'Professional'},</p>
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Congratulations on upgrading to <strong>ExpertResume Enterprise ${data.plan || 'Professional'}</strong>! Your payment of <strong>${data.amount || 'your selected amount'}</strong> has been processed successfully.</p>
              
              <div style="background: ${BRAND.tealBg}; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid ${BRAND.teal};">
                <h3 style="color: ${BRAND.dark}; margin: 0 0 10px 0; font-size: 18px;">Your Enterprise Account is Now Active!</h3>
                <p style="color: #4b5563; margin: 0; font-size: 14px;">Business: <strong>${data.businessName || 'Your Business'}</strong></p>
                <p style="color: #4b5563; margin: 5px 0 0 0; font-size: 14px;">Plan: <strong>${data.plan || 'Professional'}</strong> (${data.billingCycle || 'Monthly'})</p>
              </div>

              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;"><strong>Here's what you can do now:</strong></p>
              <ul style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.8; padding-left: 20px; margin: 15px 0;">
                <li><strong>Manage Unlimited Clients:</strong> Add and organize all your client profiles</li>
                <li><strong>Create Professional Resumes:</strong> Use premium templates and AI enhancement</li>
                <li><strong>Track Your Business:</strong> Monitor analytics and client progress</li>
                <li><strong>White-label Solutions:</strong> Brand the platform with your business identity</li>
                <li><strong>Priority Support:</strong> Get dedicated assistance when you need it</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://expertresume.us/enterprise/dashboard/professional" style="display: inline-block; background: ${BRAND.gradientCTA}; color: ${BRAND.white}; font-size: 16px; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 50px; margin: 6px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.4);">Access Your Dashboard</a>
                <a href="https://expertresume.us/enterprise/my-resumes" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.greenSuccess} 0%, #10b981 100%); color: ${BRAND.white}; font-size: 16px; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 50px; margin: 6px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.4);">Start Creating Resumes</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `,
    text: (data) => `Welcome to ExpertResume Enterprise, ${data.name || 'Professional'}! Your account is now active. Access your dashboard at https://expertresume.us/enterprise/dashboard/professional`,
  },
  paymentIncomplete: {
    subject: (data) => `Complete Your Payment to Unlock ExpertResume Premium, ${data.firstName || 'Friend'}!`,
    html: (data) => {
      const currency = data.currency || 'USD';
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
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${BRAND.gradientHeader}; padding: 40px 30px; text-align: center;">
              <a href="https://expertresume.us" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: ${BRAND.white}; font-size: 26px; margin-top: 18px; font-weight: 800;">Hey ${data.firstName || 'Friend'},</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0;">Your Premium Benefits Are Waiting!</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
               <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">It looks like you started upgrading to ExpertResume Premium. Your plan ${billingCycle === 'oneDay' ? 'Basic' : billingCycle} is reserved for a limited time.</p>
               <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">By confirming your payment, you will unlock:</p>
               <ul style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.8; padding-left: 20px;">
                 <li>Unlimited resume downloads</li>
                 <li>Advanced ATS optimization</li>
                 <li>AI-powered resume building</li>
                 <li>50+ professional templates</li>
                 <li>And much more!</li>
               </ul>
               <div style="text-align: center; margin: 28px 0;">
                 <a href="https://expertresume.us/pricing" style="display: inline-block; background: ${BRAND.gradientCTA}; color: ${BRAND.white}; font-size: 16px; font-weight: bold; padding: 14px 32px; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.4);">Complete Your Payment</a>
               </div>
            </td>
          </tr>
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `;
    },
    text: (data) => `Complete Your Payment to Unlock ExpertResume Premium. Visit https://expertresume.us/pricing to continue.`,
  },
  paymentComplete: {
    subject: (data) => `You're Now a ExpertResume Premium Member, ${data.firstName || 'Friend'}!`,
    html: (data) => {
      const currency = data.currency || 'USD';
      const amount = data.amount ? formatPrice(data.amount, currency) : 'your selected plan';
      const billingCycle = data.billingCycle || 'monthly';

      const cycleMap = {
        'oneDay': 'Quick Start Pass',
        'basic': 'Starter Plan',
        'monthly': 'Pro Monthly Plan',
        'quarterly': 'Pro Quarterly Plan',
        'sixMonth': 'Pro 6-Month Plan',
        'interview_gyani': 'AI Interview Pro'
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${BRAND.gradientHeader}; padding: 40px 30px; text-align: center;">
              <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="180" style="display: block; margin: 0 auto 20px;">
              <h1 style="color: ${BRAND.white}; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">Welcome to ExpertResume Elite!</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0; line-height: 1.5;">You've joined the elite! Experience the full power of AI-driven career success.</p>
            </td>
          </tr>

          <!-- Plan Info -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: ${BRAND.tealBg}; border: 1px solid ${BRAND.tealBorder}; border-radius: 10px; padding: 20px; text-align: center;">
                <h2 style="color: ${BRAND.tealDark}; font-size: 20px; margin: 0 0 5px; font-weight: 700;">${planName}</h2>
                <p style="color: ${BRAND.teal}; font-size: 14px; margin: 0;">
                  ${billingCycle === 'interview_gyani' ? 'Senior AI Interviewer • Real-time Feedback • Readiness Reports' : 'Elite access • Unlimited Downloads • Premium experience'}
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
              <h3 style="color: ${BRAND.dark}; font-size: 18px; margin: 0 0 20px; font-weight: 700; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Your Complete Premium Toolkit:</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 0 8px 15px 0; vertical-align: top;">
                    <h4 style="color: ${BRAND.tealDark}; font-size: 15px; margin: 0 0 4px; font-weight: 700;">50+ Templates</h4>
                    <p style="color: ${BRAND.gray}; font-size: 13px; margin: 0; line-height: 1.4;">Industry-specific designs that wow recruiters</p>
                  </td>
                  <td width="50%" style="padding: 0 0 15px 8px; vertical-align: top;">
                    <h4 style="color: ${BRAND.tealDark}; font-size: 15px; margin: 0 0 4px; font-weight: 700;">Unlimited Exports</h4>
                    <p style="color: ${BRAND.gray}; font-size: 13px; margin: 0; line-height: 1.4;">Professional PDFs without watermarks</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 0 8px 15px 0; vertical-align: top;">
                    <h4 style="color: ${BRAND.tealDark}; font-size: 15px; margin: 0 0 4px; font-weight: 700;">JD Matcher</h4>
                    <p style="color: ${BRAND.gray}; font-size: 13px; margin: 0; line-height: 1.4;">Tailor resumes to job descriptions in seconds</p>
                  </td>
                  <td width="50%" style="padding: 0 0 15px 8px; vertical-align: top;">
                    <h4 style="color: ${BRAND.tealDark}; font-size: 15px; margin: 0 0 4px; font-weight: 700;">ATS Optimizer</h4>
                    <p style="color: ${BRAND.gray}; font-size: 13px; margin: 0; line-height: 1.4;">Beat applicant tracking systems with 95% success</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 0 8px 15px 0; vertical-align: top;">
                    <h4 style="color: ${BRAND.tealDark}; font-size: 15px; margin: 0 0 4px; font-weight: 700;">One-Pager Pro</h4>
                    <p style="color: ${BRAND.gray}; font-size: 13px; margin: 0; line-height: 1.4;">Create impactful single-page resumes</p>
                  </td>
                  <td width="50%" style="padding: 0 0 15px 8px; vertical-align: top;">
                    <h4 style="color: ${BRAND.tealDark}; font-size: 15px; margin: 0 0 4px; font-weight: 700;">Salary Analyzer</h4>
                    <p style="color: ${BRAND.gray}; font-size: 13px; margin: 0; line-height: 1.4;">Know your worth & negotiate 20% more</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 0 8px 15px 0; vertical-align: top;">
                    <h4 style="color: ${BRAND.tealDark}; font-size: 15px; margin: 0 0 4px; font-weight: 700;">AI Career Coach</h4>
                    <p style="color: ${BRAND.gray}; font-size: 13px; margin: 0; line-height: 1.4;">Personalized career roadmap</p>
                  </td>
                  <td width="50%" style="padding: 0 0 15px 8px; vertical-align: top;">
                    <h4 style="color: ${BRAND.tealDark}; font-size: 15px; margin: 0 0 4px; font-weight: 700;">Score Booster</h4>
                    <p style="color: ${BRAND.gray}; font-size: 13px; margin: 0; line-height: 1.4;">Optimize for ATS with real-time scoring</p>
                  </td>
                </tr>
              </table>

              <!-- Add-ons Section -->
              ${(data.hasJobSearch || data.hasInterviewKit || data.hasApplyPro) ? `
              <div style="margin-top: 25px; background: ${BRAND.greenSuccessLight}; border: 1px solid ${BRAND.greenSuccessBorder}; border-radius: 10px; padding: 20px;">
                <h3 style="color: #065f46; font-size: 16px; margin: 0 0 15px; font-weight: 700;">Your Premium Add-ons</h3>
                ${data.hasJobSearch ? `
                <div style="margin-bottom: 15px;">
                  <span style="background: ${BRAND.greenSuccess}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">ACTIVE</span>
                  <h4 style="color: #065f46; font-size: 14px; margin: 4px 0 2px; font-weight: 700;">AI Job Matching</h4>
                  <p style="color: #047857; font-size: 12px; margin: 0;">AI-powered job recommendations tailored to your profile + Real-time notifications</p>
                </div>` : ''}
                ${data.hasInterviewKit ? `
                <div style="margin-bottom: 15px;">
                  <span style="background: ${BRAND.greenSuccess}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">ACTIVE</span>
                  <h4 style="color: #065f46; font-size: 14px; margin: 4px 0 2px; font-weight: 700;">AI Interview Pro</h4>
                  <p style="color: #047857; font-size: 12px; margin: 0;">Elite Mock interviews, Resume-Aware AI coaching, and Detailed Readiness reports.</p>
                </div>` : ''}
                ${data.hasApplyPro ? `
                <div>
                  <span style="background: ${BRAND.greenSuccess}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">ACTIVE</span>
                  <h4 style="color: #065f46; font-size: 14px; margin: 4px 0 2px; font-weight: 700;">Apply Pro Engine</h4>
                  <p style="color: #047857; font-size: 12px; margin: 0;">Automated job applications on 20+ platforms</p>
                </div>` : ''}
              </div>` : ''}

              ${billingCycle === 'interview_gyani' ? `
              <div style="margin-top: 25px; background: ${BRAND.tealBg}; border: 1px solid ${BRAND.tealBorder}; border-radius: 10px; padding: 20px;">
                <h3 style="color: ${BRAND.tealDark}; font-size: 16px; margin: 0 0 15px; font-weight: 700;">Interview Simulation Pro Features</h3>
                <p style="color: ${BRAND.teal}; font-size: 14px; margin: 0 0 6px;"><strong>&#10003; 20 Full Mock Sessions / Month</strong></p>
                <p style="color: ${BRAND.teal}; font-size: 14px; margin: 0 0 6px;"><strong>&#10003; Resume-Aware AI Questioning</strong></p>
                <p style="color: ${BRAND.teal}; font-size: 14px; margin: 0 0 6px;"><strong>&#10003; Senior-Level Performance Evaluation</strong></p>
                <p style="color: ${BRAND.teal}; font-size: 14px; margin: 0;"><strong>&#10003; Personalized Readiness Reports</strong></p>
              </div>` : ''}

            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="https://expertresume.us/resume-builder" style="display: inline-block; background: ${BRAND.gradientCTA}; color: ${BRAND.white}; font-size: 16px; font-weight: bold; padding: 16px 32px; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.4);">Start Building Your Resume</a>
              <p style="color: ${BRAND.grayLight}; font-size: 13px; margin: 20px 0 0;">Welcome to the elite tier! Your career transformation starts now.</p>
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
        return `Welcome to Interview Simulation Pro! You now have access to senior AI mock interviews, detailed readiness reports, and personalized feedback to crack your next job. Access your portal at expertresume.us/ai-interview`;
      }
      return `Welcome to ExpertResume Elite! You now have premium access. Start building at https://expertresume.us/resume-builder`;
    }
  },
  invoice: {
    subject: (data) => `Payment Receipt for your ExpertResume ${data.planName || 'Premium Plan'}`,
    html: (data) => {
      const currency = data.currency || 'USD';
      const isINR = currency === 'INR';

      const totalAmount = data.finalAmount || 0;

      const baseAmount = data.baseAmount || 0;
      const jobSearchAmount = data.addonJobSearchAmount || 0;
      const interviewKitAmount = data.addonInterviewKitAmount || 0;
      const applyProAmount = data.addonApplyProAmount || 0;
      const subtotal = data.subtotal || totalAmount;
      const discountAmount = data.discountAmount || 0;
      const taxableAmount = data.taxableAmount || totalAmount;
      const gstAmount = data.gstAmount || 0;

      const fmtTotal = formatPrice(totalAmount, currency);
      const fmtBase = formatPrice(baseAmount, currency);
      const fmtJobSearch = formatPrice(jobSearchAmount, currency);
      const fmtInterviewKit = formatPrice(interviewKitAmount, currency);
      const fmtApplyPro = formatPrice(applyProAmount, currency);
      const fmtSubtotal = formatPrice(subtotal, currency);
      const fmtDiscount = formatPrice(discountAmount, currency);
      const fmtTaxable = formatPrice(taxableAmount, currency);
      const fmtGST = formatPrice(gstAmount, currency);

      const invoiceDate = new Date().toLocaleDateString('en-US', {
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; border-bottom: 2px solid #f3f4f6;">
              <table width="100%">
                <tr>
                  <td valign="top">
                    <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume" width="140" style="display: block;">
                    <p style="margin: 10px 0 0; color: ${BRAND.gray}; font-size: 14px;">Vendax Systems LLC</p>
                    <p style="margin: 2px 0 0; color: ${BRAND.gray}; font-size: 14px;">28 Geary St STE 650 Suite #500, San Francisco, CA 94108, USA</p>
                  </td>
                  <td valign="top" style="text-align: right;">
                    <h1 style="margin: 0; color: ${BRAND.dark}; font-size: 24px; font-weight: bold;">INVOICE</h1>
                    <p style="margin: 5px 0 0; color: ${BRAND.gray}; font-size: 14px;">#${invoiceNumber}</p>
                    <p style="margin: 2px 0 0; color: ${BRAND.gray}; font-size: 14px;">${invoiceDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Billing Info -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Billed To</p>
              <h3 style="margin: 8px 0 0; color: ${BRAND.dark}; font-size: 18px;">${data.firstName || 'Customer'}</h3>
              <p style="margin: 4px 0 0; color: ${BRAND.gray}; font-size: 14px;">${data.email || ''}</p>
            </td>
          </tr>

          <!-- Invoice Items -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: ${BRAND.tealBg};">
                    <th style="padding: 12px 16px; text-align: left; color: ${BRAND.tealDark}; font-size: 12px; text-transform: uppercase; font-weight: 600; border-radius: 6px 0 0 6px;">Description</th>
                    <th style="padding: 12px 16px; text-align: right; color: ${BRAND.tealDark}; font-size: 12px; text-transform: uppercase; font-weight: 600; border-radius: 0 6px 6px 0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 16px; color: ${BRAND.dark}; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      ${data.planName || 'ExpertResume Premium Plan'}
                      <div style="color: ${BRAND.gray}; font-size: 12px; margin-top: 4px;">Subscription Period: ${data.billingCycle || 'Monthly'}</div>
                    </td>
                    <td style="padding: 16px; text-align: right; color: ${BRAND.dark}; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      ${fmtBase}
                    </td>
                  </tr>
                  ${data.hasJobSearch ? `
                  <tr>
                    <td style="padding: 16px; color: ${BRAND.dark}; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      AI Job Search Add-on
                    </td>
                    <td style="padding: 16px; text-align: right; color: ${BRAND.dark}; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      ${fmtJobSearch}
                    </td>
                  </tr>` : ''}
                  ${data.hasInterviewKit ? `
                  <tr>
                    <td style="padding: 16px; color: ${BRAND.dark}; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      Interview Prep Kit Add-on
                    </td>
                    <td style="padding: 16px; text-align: right; color: ${BRAND.dark}; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      ${fmtInterviewKit}
                    </td>
                  </tr>` : ''}
                  ${data.hasApplyPro ? `
                  <tr>
                    <td style="padding: 16px; color: ${BRAND.dark}; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
                      Apply Pro Engine Add-on
                    </td>
                    <td style="padding: 16px; text-align: right; color: ${BRAND.dark}; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">
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
                        <td style="padding: 6px 0; color: ${BRAND.gray}; font-size: 14px;">Subtotal</td>
                        <td style="padding: 6px 0; text-align: right; color: ${BRAND.dark}; font-size: 14px; font-weight: 500;">${fmtSubtotal}</td>
                      </tr>
                      ${discountAmount > 0 ? `
                      <tr>
                        <td style="padding: 6px 0; color: ${BRAND.greenSuccess}; font-size: 14px;">Discount</td>
                        <td style="padding: 6px 0; text-align: right; color: ${BRAND.greenSuccess}; font-size: 14px; font-weight: 500;">-${fmtDiscount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: ${BRAND.gray}; font-size: 14px;">Taxable Value</td>
                        <td style="padding: 6px 0; text-align: right; color: ${BRAND.dark}; font-size: 14px; font-weight: 500;">${fmtTaxable}</td>
                      </tr>` : ''}
                      ${isINR ? `
                      <tr>
                        <td style="padding: 6px 0; color: ${BRAND.gray}; font-size: 14px;">Taxes</td>
                        <td style="padding: 6px 0; text-align: right; color: ${BRAND.dark}; font-size: 14px; font-weight: 500;">Included</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 12px 0 0; color: ${BRAND.dark}; font-size: 16px; font-weight: bold; border-top: 2px solid #f3f4f6;">Total Paid</td>
                        <td style="padding: 12px 0 0; text-align: right; color: ${BRAND.teal}; font-size: 18px; font-weight: bold; border-top: 2px solid #f3f4f6;">${fmtTotal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Paid Stamp -->
              <div style="margin-top: 30px; text-align: center;">
                <div style="display: inline-block; border: 2px solid ${BRAND.greenSuccess}; color: ${BRAND.greenSuccess}; font-weight: bold; padding: 8px 30px; font-size: 18px; letter-spacing: 2px; border-radius: 4px; text-transform: uppercase;">
                  PAID
                </div>
              </div>

              <!-- Support Link -->
              <p style="margin: 30px 0 0; color: ${BRAND.grayLight}; font-size: 12px; text-align: center;">
                If you have any questions about this invoice, please contact <a href="mailto:support@expertresume.us" style="color: ${BRAND.teal}; text-decoration: none;">support@expertresume.us</a>
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
      const currency = data.currency || 'USD';
      const amount = data.amount ? formatPrice(data.amount, currency) : 'your selected plan';
      return `
      PAYMENT RECEIPT

      Invoice Number: INV-${Date.now().toString().slice(-8)}
      Date: ${new Date().toLocaleDateString('en-US')}

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
      support@expertresume.us
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
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${BRAND.gradientHeader}; padding: 40px 30px; text-align: center;">
              <a href="https://expertresume.us" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: ${BRAND.white}; font-size: 26px; margin-top: 18px; font-weight: 800;">Verify your email</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0;">Enter the code below to verify your email address</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Hi ${data.firstName || 'there'},</p>
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Your ExpertResume verification code is:</p>
              <div style="font-size: 36px; font-weight: bold; color: ${BRAND.tealDark}; letter-spacing: 8px; margin: 28px 0; background: ${BRAND.tealBg}; padding: 20px; border-radius: 12px; border: 2px dashed ${BRAND.tealBorder};">${data.code}</div>
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Enter this code on the website to complete your verification.</p>
              <p style="color: ${BRAND.grayLight}; font-size: 14px; margin-top: 32px;">If you did not request this, you can safely ignore this email.</p>
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
      https://expertresume.us
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
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${BRAND.gradientHeader}; padding: 40px 30px; text-align: center;">
              <a href="https://expertresume.us" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: ${BRAND.white}; font-size: 26px; margin-top: 18px; font-weight: 800;">Team Invitation</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="font-size: 16px; color: ${BRAND.gray};">Hi ${data.memberName},</p>
              <p style="font-size: 16px; color: ${BRAND.gray};">You have been invited to join <strong>${data.businessName}</strong> on ExpertResume Enterprise.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.invitationLink}" style="display: inline-block; background: ${BRAND.gradientCTA}; color: ${BRAND.white}; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.4);">Accept Invitation</a>
              </div>
              <p style="font-size: 14px; color: ${BRAND.grayLight}; text-align: center;">This link will expire in 24 hours.</p>
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
    subject: (data) => `You earned $${data.earnings}! Your referral just upgraded!`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Referral Earnings</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.greenSuccess} 0%, #10b981 100%); padding: 40px 30px; text-align: center;">
              <a href="https://expertresume.us" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: ${BRAND.white}; font-size: 26px; margin-top: 18px; font-weight: 800;">Congratulations!</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0;">You just earned $${data.earnings}!</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Hi ${data.firstName || 'Friend'},</p>
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Great news! Someone you referred just upgraded to a premium plan.</p>
              <div style="background-color: ${BRAND.greenSuccessLight}; border: 1px solid ${BRAND.greenSuccessBorder}; border-radius: 10px; padding: 24px; margin: 24px 0;">
                <p style="color: #166534; font-size: 20px; font-weight: bold; margin: 0;">You've earned $${data.earnings}</p>
                <p style="color: #166534; font-size: 14px; margin: 5px 0 0;">This amount has been added to your wallet.</p>
              </div>
              <a href="https://www.expertresume.us/refer-and-earn" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.greenSuccess} 0%, #10b981 100%); color: ${BRAND.white}; font-size: 16px; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 50px; margin-top: 10px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.4);">View Your Earnings</a>
            </td>
          </tr>
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `,
    text: (data) => `Congratulations! You earned $${data.earnings}. View your earnings at https://www.expertresume.us/refer-and-earn`,
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
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${BRAND.gradientHeader}; padding: 40px 30px; text-align: center;">
              <a href="https://expertresume.us" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: ${BRAND.white}; font-size: 26px; margin-top: 18px; font-weight: 800;">Profile Slot Added!</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Hi ${data.firstName || 'Friend'},</p>
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">You have successfully purchased an additional profile slot.</p>
              
              <div style="background-color: ${BRAND.tealBg}; border: 1px solid ${BRAND.tealBorder}; border-radius: 10px; padding: 24px; margin: 24px 0; text-align: left;">
                <p style="color: ${BRAND.tealDark}; font-size: 18px; font-weight: bold; margin: 0 0 12px;">What you can do now:</p>
                <ul style="color: ${BRAND.teal}; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Create a new resume for a family member or friend</li>
                  <li>Manage their documents separately from your own</li>
                  <li>Enjoy unlimited downloads for this new profile</li>
                </ul>
              </div>

              <a href="https://expertresume.us/resume-builder" style="display: inline-block; background: ${BRAND.gradientCTA}; color: ${BRAND.white}; font-size: 16px; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 50px; margin-top: 10px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.4);">Go to Dashboard</a>
            </td>
          </tr>
          ${footerTemplate(data)}
        </table>
      </body>
      </html>
    `,
    text: (data) => `You have successfully purchased an additional profile slot. Go to your dashboard at https://expertresume.us/resume-builder to use it.`,
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
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; border-collapse: collapse; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: ${BRAND.gradientHeader}; padding: 40px 30px; text-align: center;">
              <a href="https://expertresume.us" style="text-decoration: none;">
                <img src="https://expertresume.us/ExpertResume.png" alt="ExpertResume Logo" width="160" style="display: block; margin: 0 auto;">
              </a>
              <h1 style="color: ${BRAND.white}; font-size: 26px; margin-top: 18px; font-weight: 800;">Password Reset Request</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">Hi ${data.firstName || 'there'},</p>
              <p style="color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your ExpertResume account associated with ${data.email}.</p>
              
              <div style="background-color: ${BRAND.tealBg}; border: 1px solid ${BRAND.tealBorder}; border-radius: 10px; padding: 24px; margin: 28px 0;">
                <p style="color: ${BRAND.tealDark}; font-size: 14px; margin: 0 0 16px;">Click the button below to reset your password. This link will expire in 1 hour.</p>
                <a href="${data.resetLink}" style="display: inline-block; background: ${BRAND.gradientCTA}; color: ${BRAND.white}; font-size: 16px; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.4);">Reset My Password</a>
              </div>

              <p style="color: ${BRAND.gray}; font-size: 14px; margin-top: 20px;">Or copy and paste this link into your browser:</p>
              <p style="color: ${BRAND.gray}; font-size: 12px; word-break: break-all; margin-top: 5px;">${data.resetLink}</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: ${BRAND.grayLight}; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
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

// Shared footer template - teal branded
const footerTemplate = (data) => {
  const emailForUnsubscribe = data.email || '';
  return `
    <tr>
      <td style="background-color: #f0fdfa; padding: 30px 24px; text-align: center; border-top: 1px solid ${BRAND.tealBorder};">
        
        <p style="color: ${BRAND.tealDark}; font-size: 14px; margin: 0 0 10px;">
          <strong>ExpertResume</strong><br>
          <span style="font-size: 12px; color: ${BRAND.gray};">Powered by Vendax Systems LLC</span>
        </p>
        
        <p style="color: ${BRAND.grayLight}; font-size: 12px; margin: 15px 0 0;">
          <a href="https://expertresume.us" style="color: ${BRAND.teal}; text-decoration: none; font-weight: 600;">expertresume.us</a>
          <span style="margin: 0 5px;">·</span>
          28 Geary St STE 650 Suite #500, San Francisco, CA 94108, USA
        </p>

        <p style="color: ${BRAND.grayLight}; font-size: 12px; margin: 15px 0 0;">
          You received this email because you signed up for ExpertResume.<br>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(emailForUnsubscribe)}" style="color: ${BRAND.gray}; text-decoration: underline;">Unsubscribe</a>
        </p>
        
        <p style="color: #d1d5db; font-size: 11px; margin: 20px 0 0;">&copy; ${new Date().getFullYear()} Vendax Systems LLC. All rights reserved.</p>
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
