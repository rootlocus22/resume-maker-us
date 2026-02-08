// app/components/DownloadFAQ.js
// FAQ component specifically for download and PDF concerns
"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DownloadFAQ({ className = '' }) {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Why can't I download my PDF?",
      answer: "If download fails, try: 1) Check your internet connection, 2) Allow downloads in browser settings, 3) Try the 'Email PDF' option as an alternative, 4) Clear browser cache and try again. If issues persist, contact support."
    },
    {
      question: "Can I get my PDF via email instead?",
      answer: "Yes! Click the 'Email' button next to the download button. We'll send your PDF directly to your registered email address. This is especially helpful if downloads aren't working on your device."
    },
    {
      question: "Why does my PDF have page breaks in wrong places?",
      answer: "We've recently improved page break logic to ensure content flows naturally. If you see issues, try: 1) Regenerate the PDF, 2) Check if content is too long for one page, 3) Contact support with a screenshot and we'll fix it."
    },
    {
      question: "Is the PDF preview the same as the downloaded file?",
      answer: "Yes! The preview matches the downloaded PDF exactly. What you see is what you get. We've ensured header sizes, spacing, and formatting are identical between preview and download."
    },
    {
      question: "What if my download keeps failing?",
      answer: "Our system automatically retries failed downloads up to 3 times. If it still fails: 1) Use the Email PDF option, 2) Try a different browser, 3) Check if popup blockers are enabled, 4) Contact support with error details."
    },
    {
      question: "Can I download multiple times?",
      answer: "Yes! Premium users get unlimited downloads. Basic plan users get a limited number of downloads. Check your plan details to see your download limit. You can always upgrade for unlimited downloads."
    },
    {
      question: "Why is my PDF file size large?",
      answer: "PDF file size depends on content length, images, and formatting. Our PDFs are optimized for quality and ATS compatibility. If size is a concern, try removing photos or shortening content."
    },
    {
      question: "Can I edit my resume after downloading?",
      answer: "Yes! You can always come back and edit your resume. Changes are saved automatically. Just regenerate and download a new PDF whenever you make updates."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Download & PDF Help</h3>
      </div>
      
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-left bg-white hover:bg-gray-50 focus:outline-none transition-colors"
              onClick={() => toggleFAQ(index)}
            >
              <span className="font-medium text-gray-800 text-sm pr-4">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 text-gray-600 bg-gray-50 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
