import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";
import WhatsAppButton from "../components/WhatsAppButton";

export const metadata = {
title: "Contact Us - ExpertResume | AI Resume Builder for US Jobs",
  description:
    "Contact ExpertResume support. Get help with resume building and job applications. Operated by Vendax Systems LLC.",
  keywords: [
    "resume builder support",
    "ExpertResume contact",
    "Vendax Systems",
  ],
  authors: [{ name: "Vendax Systems LLC" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/contact-us",
  },
  openGraph: {
    title: "Free Resume Builder | ATS-Friendly Resume Maker & CV Generator",
    description:
      "Create a professional resume for free with ExpertResume. Use ATS-friendly resume templates, download your resume as a PDF, and build a job-ready CV in minutes—no signup required!",
    url: "https://expertresume.us",
    siteName: "ExpertResume",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "Create Your Resume for Free - ExpertResume",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@expertresume",
    title: "Free Resume Builder | ATS-Friendly Resume Maker & CV Generator",
    description:
      "Build your resume in minutes with ExpertResume. Use ATS-friendly resume templates, create a professional CV, and download your resume as a PDF instantly.",
    images: ["https://expertresume.us/free-resume-maker.webp"],
  },
};

export default function ContactPage() {
  return (
    <>
      <div className="min-h-screen py-12 sm:py-16 lg:py-20 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          {/* Header */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-[#0F172A] mb-8">
            Contact Us
          </h1>
          <p className="text-lg text-center text-gray-700 mb-12">
            Need assistance? Get in touch with us!
          </p>

          {/* Contact Information */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E7EB]">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Reach Out to Us
            </h2>
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#2563EB]" />
                </div>
                <div>
                  <p className="font-medium text-[#020617]">Email Support</p>
                  <a
                    href="mailto:support@expertresume.us"
                    className="text-[#2563EB] hover:text-[#1d4ed8] font-medium"
                  >
                    support@expertresume.us
                  </a>
                </div>
              </div>

              {/* Corporate Address */}
              <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <div className="w-12 h-12 bg-[#0D9488]/10 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Corporate Address</p>
                  <p className="text-gray-700 text-sm">Vendax Systems LLC<br />28 Geary St STE 650 Suite #500<br />San Francisco, California 94108<br />United States</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <div className="w-12 h-12 bg-[#0D9488]/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">WhatsApp Chat</p>
                  <p className="text-sm text-gray-600 mb-2">Get instant help via WhatsApp</p>
                  <WhatsAppButton />
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Redirect */}
          <div className="text-center mt-12">
            <Link
              href="/faqs"
              className="inline-block bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base hover:from-[#071429] hover:to-[#071429] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View FAQs
            </Link>
          </div>

          {/* Back to Resume Builder */}
          <div className="text-center mt-6">
            <Link
              href="/resume-builder"
              className="text-[#0B1F3B] hover:underline text-lg font-semibold"
            >
              ← Back to Resume Builder
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
