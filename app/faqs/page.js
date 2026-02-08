"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getEffectivePricing, formatPrice } from "../lib/globalPricing";

export default function FAQPage() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [pricing, setPricing] = useState({ monthly: 49900, yearly: 129900, currency: 'INR' });

  useEffect(() => {
    // Get pricing from globalPricing (default to non-Android for FAQ page)
    const devicePricing = getEffectivePricing('INR', false);
    setPricing(devicePricing);
  }, []);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What makes ExpertResume different from other resume builders?",
      answer:
        "ExpertResume is powered by advanced AI technology to provide instant, personalized suggestions for every section of your resume. We offer job-specific, ATS-optimized templates, real-time previews, and a seamless drag-and-drop editor—all designed to help you land your dream job faster.",
    },
    {
      question: "How does the AI help improve my resume?",
      answer:
        "Our AI analyzes your input and suggests impactful summaries, bullet points, and skills tailored to your industry and role. You can boost your entire resume or get suggestions for individual fields like experience, skills, or summary. Premium users get access to even more advanced AI features, including full resume optimization and interview coaching.",
    },
    {
      question: "Are your templates ATS-friendly?",
      answer:
        "Yes! All our templates are designed to be compatible with Applicant Tracking Systems (ATS), ensuring your resume passes automated screenings used by top employers.",
    },
    {
      question: "What is the difference between Free and Premium plans?",
      answer:
        "The Free plan gives you access to the core resume editor, real-time preview, custom colors, AI field suggestions, and a free ATS score checker. Premium unlocks job-specific templates, watermark-free PDF downloads, AI Interview Trainer, full-resume AI Boost, Salary Analyzer, and more. See our Pricing page for full details.",
    },
    {
      question: "Can I use ExpertResume without signing up?",
      answer:
        "Absolutely! You can start building and downloading your resume instantly—no signup required. To access premium features or save your progress across devices, you can create a free account.",
    },
    {
      question: "How do I download my resume as a PDF?",
      answer:
        "Just click the 'Download PDF' button in the editor. Premium users get watermark-free, high-quality PDFs. Free users can also download, but with a small watermark. If download fails, try the 'Email PDF' option - we'll send it directly to your inbox.",
    },
    {
      question: "Why can't I download my PDF?",
      answer:
        "If download fails, try: 1) Check your internet connection, 2) Allow downloads in browser settings, 3) Use the 'Email PDF' option as an alternative, 4) Clear browser cache and try again. Our system automatically retries failed downloads up to 3 times.",
    },
    {
      question: "Can I get my PDF via email instead?",
      answer:
        "Yes! Click the 'Email' button next to the download button. We'll send your PDF directly to your registered email address. This is especially helpful if downloads aren't working on your device or for mobile users.",
    },
    {
      question: "Why does my PDF have page breaks in wrong places?",
      answer:
        "We've recently improved page break logic to ensure content flows naturally. If you see issues, try: 1) Regenerate the PDF, 2) Check if content is too long for one page, 3) Contact support with a screenshot and we'll fix it immediately.",
    },
    {
      question: "Is the PDF preview the same as the downloaded file?",
      answer:
        "Yes! The preview matches the downloaded PDF exactly. What you see is what you get. We've ensured header sizes, spacing, and formatting are identical between preview and download.",
    },
    {
      question: "What if my download keeps failing?",
      answer:
        "Our system automatically retries failed downloads up to 3 times. If it still fails: 1) Use the Email PDF option, 2) Try a different browser, 3) Check if popup blockers are enabled, 4) Contact support with error details. We track all download issues to fix them quickly.",
    },
    {
      question: "What is the AI Interview Trainer?",
      answer:
        "The AI Interview Trainer simulates real interview scenarios, asking you role-specific questions and providing instant feedback. It's powered by advanced AI technology and is available to Premium users.",
    },
    {
      question: "How does the Salary Analyzer work?",
      answer:
        "Our AI-powered Salary Analyzer estimates your market value based on your role, experience, and location, helping you negotiate better offers. This feature is available to Premium users.",
    },
    {
      question: "Is my data private and secure?",
      answer:
        "Yes. We never share your data with third parties. Your resumes are stored securely, and you can delete your data at any time from your account settings.",
    },
    {
      question: "Can I customize the look of my resume?",
      answer:
        "Yes! You can personalize colors, fonts, and layouts to match your style. Premium users get access to even more customization options and exclusive templates.",
    },
    {
      question: "How do I get support if I have an issue?",
      answer:
        "You can reach out to our support team anytime via the Contact Us page. We're here to help you succeed!",
    },
    {
      question: "How much does Premium cost?",
      answer: `Premium is available for just ${formatPrice(pricing.monthly, pricing.currency)} (30 days), ${formatPrice(pricing.sixMonth, pricing.currency)} (6 months - save 10%), or ${formatPrice(pricing.yearly, pricing.currency)} (1 year - save 16% with annual billing). You can upgrade anytime from your dashboard.`,
    },
    {
      question: "Can I try Premium features before subscribing?",
      answer:
        "We occasionally offer free trials or demo access to Premium features. Check your dashboard or our homepage for current offers!",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards, UPI, and net banking for US users.",
    },
    {
      question: "Is ExpertResume really free?",
      answer:
        "Yes! You can use our core features for free, forever. Premium is optional and unlocks even more powerful tools.",
    },
    {
      question: "What is the best resume builder for US job seekers?",
      answer:
        "ExpertResume is specifically designed for US job seekers with templates optimized for Naukri, LinkedIn India, and Indeed India. Our AI understands US resume formats and job market requirements.",
    },
    {
      question: "How can I create a resume for freshers in India?",
      answer:
        "ExpertResume offers fresher-specific templates and AI suggestions. Simply select a fresher template, add your education, internships, projects, and skills. Our AI will suggest relevant content based on your field.",
    },
    {
      question: "Can I create a resume with photo for US jobs?",
      answer:
        "Yes! ExpertResume supports resume templates with photos, which are commonly preferred in India. Choose from modern templates with photo sections and upload your professional headshot.",
    },
    {
      question: "How does ExpertResume compare to Zety, Canva, or Resume.io?",
      answer:
        "Unlike international tools, ExpertResume is specifically built for the US job market with ₹ pricing, Naukri integration, free ATS checker, and AI suggestions. Our premium plans start at just ₹49 vs $29+ for others.",
    },
    {
      question: "What is ATS score and how can I check it for free?",
      answer:
        "ATS (Applicant Tracking System) score shows how well your resume performs with automated screening systems. ExpertResume offers a FREE ATS checker that analyzes your resume and provides actionable suggestions.",
    },
    {
      question: "Can I use ExpertResume for software engineer jobs?",
      answer:
        "Definitely! ExpertResume has specialized templates for software engineers, developers, data scientists, and IT professionals. Our AI understands technical skills and creates industry-optimized resumes.",
    },
    {
      question: "How long does it take to create a resume on ExpertResume?",
      answer:
        "Most users create a professional resume in just 5-10 minutes! Choose a template, fill in your details, customize with our drag-and-drop editor, and download. For faster results, upload an existing resume and our AI will enhance it.",
    },
    {
      question: "Does ExpertResume work on mobile phones?",
      answer:
        "Yes! ExpertResume is fully mobile-responsive. Create, edit, and download your resume from any device - smartphone, tablet, or desktop. Perfect for students and job seekers on the go.",
    },
    {
      question: "Can I download my resume as PDF without watermarks?",
      answer:
        "Yes! All users can download their resume as PDF. Free users get 3 downloads with basic templates. Premium users get unlimited downloads, no watermarks, 50+ premium templates, and AI-powered suggestions.",
    },
  ];

  return (
    <div className="min-h-screen py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] bg-clip-text text-transparent mb-8">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-center text-gray-700 mb-12">
          Find quick answers to common questions about ExpertResume.
        </p>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-lg font-medium text-gray-800 bg-white hover:bg-gray-100 focus:outline-none transition"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                {openFAQ === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openFAQ === index && (
                <div className="px-6 py-4 text-gray-600 bg-gray-50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back to Contact Page */}
        <div className="text-center mt-12">
          <Link
            href="/contact-us"
            className="inline-block bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base hover:from-[#0B1F3B]/90 hover:to-[#00C4B3]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
