import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions - ExpertResume",
  description:
    "Terms & Conditions for ExpertResume, operated by Vendax Systems LLC. Create ATS-friendly resumes and use our career tools.",
  keywords: [
    "ExpertResume terms",
    "Vendax Systems",
    "resume builder terms",
  ],
  authors: [{ name: "Vendax Systems LLC" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/terms",
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

export default function TermsPage() {
  return (
    <>
      <script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Terms & Conditions - ExpertResume",
            url: "https://expertresume.us/terms",
            description:
              "Terms & Conditions of ExpertResume, operated by Vendax Systems LLC.",
            publisher: {
              "@type": "Organization",
              name: "Vendax Systems LLC",
              url: "https://vendaxsystemlabs.com",
              logo: "https://expertresume.us/ExpertResume.png",
            },
          }),
        }}
      />
      <div className="min-h-screen py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-center bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] bg-clip-text text-transparent mb-4 sm:mb-6">
              Terms & Conditions
            </h1>
            <p className="text-center text-gray-500 text-sm mb-6">
              Last updated on Jan 11th, 2026
            </p>

            {/* Trust Preamble */}
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-gray-700 text-sm sm:text-base font-medium">
                Welcome to <span className="font-semibold text-[#0B1F3B]">ExpertResume</span>, operated by Vendax Systems LLC. We’re dedicated to helping you succeed in your career with our free and premium resume-building tools. These Terms & Conditions outline your rights and responsibilities, ensuring a transparent and trustworthy experience.
              </p>
            </div>

            <div className="space-y-6 text-gray-700">
              {/* Definitions */}
              <div className="border-l-4 border-[#0B1F3B] pl-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Definitions</h2>
                <p className="text-sm sm:text-base">
                  In these Terms and Conditions, <strong>"we", "us", "our"</strong> refer to Vendax Systems LLC, 28 Geary St STE 650 Suite #500, San Francisco, California 94108, United States. <strong>"You", "your", "user", "visitor"</strong> refer to any individual or entity accessing our website or purchasing our services.
                </p>
              </div>

              {/* General Terms */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#0B1F3B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  General Terms
                </h3>
                <p className="text-sm sm:text-base">
                  Your use of ExpertResume and purchases from us are governed by the following terms:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-sm sm:text-base">
                  <li>The content on our website may change without prior notice to ensure continuous improvement.</li>
                  <li>
                    We strive for accuracy, but neither we nor third parties guarantee the completeness or suitability of information on this site. Any inaccuracies or errors are excluded from liability to the fullest extent permitted by law.
                  </li>
                  <li>
                    Use of our website and services is at your own risk. It’s your responsibility to ensure our offerings meet your needs. Test our <Link href="/" className="text-[#0B1F3B] hover:underline">free tools</Link> to confirm suitability.
                  </li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#0B1F3B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Intellectual Property
                </h3>
                <p className="text-sm sm:text-base">
                  All content on our website, including design, layout, and graphics, is owned by or licensed to Vendax Systems LLC. Reproduction is prohibited unless permitted by our copyright notice.
                </p>
                <p className="mt-2 text-sm sm:text-base">
                  Trademarks not owned by us are acknowledged on the site, ensuring fair use and transparency.
                </p>
              </div>

              {/* Unauthorized Use */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#0B1F3B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Unauthorized Use
                </h3>
                <p className="text-sm sm:text-base">
                  Unauthorized use of our content may result in claims for damages or legal action, protecting the integrity of our services and your experience.
                </p>
              </div>

              {/* External Links */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#0B1F3B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.473-1.473M10.172 13.828l4-4a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.473-1.473" />
                  </svg>
                  External Links
                </h3>
                <p className="text-sm sm:text-base">
                  We may include links to external websites for your convenience. These are not endorsements, and we’re not responsible for their content.
                </p>
                <p className="mt-2 text-sm sm:text-base">
                  Linking to our site requires prior written consent from Vendax Systems LLC to maintain control and trust in our brand.
                </p>
              </div>

              {/* AI Interview Simulation  Usage & Limits */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/30">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#0B1F3B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  AI Interview Simulation  Usage Policy
                </h3>
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-gray-700">
                    To ensure fair access to our high-performance AI computation resources, usage of the **AI Interview** is subject to tier-based limits:
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h4 className="text-[10px] font-black text-[#0B1F3B] uppercase tracking-widest mb-1 leading-none">FREE TRIAL</h4>
                      <p className="text-xs font-bold text-slate-800">1 Session / Month</p>
                      <p className="text-[9px] text-slate-400 font-medium italic">2 Questions per session</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1 leading-none">PRO PLANS</h4>
                      <p className="text-xs font-bold text-slate-800">10 Sessions / Month</p>
                      <p className="text-[9px] text-slate-400 font-medium italic">15 Questions per session</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-2 border-slate-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#0B1F3B] text-[7px] text-white font-black uppercase">MAX</div>
                      <h4 className="text-[10px] font-black text-[#0B1F3B] uppercase tracking-widest mb-1 leading-none">AI INTERVIEW PRO</h4>
                      <p className="text-xs font-bold text-slate-800">20 Sessions / Month</p>
                      <p className="text-[9px] text-slate-400 font-medium italic">15 Questions per session</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 italic mt-2">
                    *Usage is reset on the 1st of every calendar month. Unused sessions do not carry forward. Attempts to bypass these limits via multiple accounts result in immediate suspension.
                  </p>
                </div>
              </div>

              {/* Fair Usage Policy & Profile Slots */}
              <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50/30">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Fair Usage Policy & Profile Slots
                </h3>
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-gray-700">
                    To maintain service quality and prevent commercial abuse, we implement a <strong>Profile Guard</strong> system:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-gray-700">
                    <li>
                      <strong>Single Identity Policy:</strong> Subscriptions are strictly for individual use. Your account is linked to your <strong>Primary Profile</strong> (the first resume you create).
                    </li>
                    <li>
                      <strong>Unlimited Downloads:</strong> You can create, edit, and download <strong>unlimited</strong> variations of resumes for your Primary Profile.
                    </li>
                    <li>
                      <strong>Additional Profile Slots:</strong> To build resumes for others (e.g., family or friends), you must purchase additional <strong>Profile Slots</strong>.
                      <br />
                      <span className="text-sm font-semibold text-[#0B1F3B]">Price: See pricing page for additional profile options (Lifetime Validity)</span>
                    </li>
                    <li>
                      <strong>Restrictions:</strong> Downloading resumes for unauthorized profiles without an available slot is restricted. Sharing accounts to bypass this limit is a violation of our terms and may lead to account suspension.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Governing Law */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#0B1F3B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Governing Law
                </h3>
                <p className="text-sm sm:text-base">
                  Disputes arising from our website or services are governed by the laws of India, providing a clear legal framework for all users.
                </p>
              </div>

              {/* Payment Authorization */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#0B1F3B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Authorization
                </h3>
                <p className="text-sm sm:text-base">
                  We’re not liable for transaction declines due to cardholder limits set by our acquiring bank. For payment issues, contact{" "}
                  <a href="mailto:support@expertresume.us" className="text-[#0B1F3B] hover:underline">support@expertresume.us</a>.
                </p>
              </div>

              {/* Contact Support */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#0B1F3B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Need Assistance?
                </h3>
                <p className="text-sm sm:text-base">
                  We’re here to help! Contact us at{" "}
                  <a href="mailto:support@expertresume.us" className="text-[#0B1F3B] hover:underline">support@expertresume.us</a> with any questions. Expect a response within 24-48 hours.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 text-center">
              <div className="flex justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-[#0B1F3B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-600">Secure & Reliable Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-[#0B1F3B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.761 0-5 2.239-5 5v1h10v-1c0-2.761-2.239-5-5-5zM5 5h14v14H5z" />
                  </svg>
                  <span className="text-sm text-gray-600">Trusted by 1,500+ Job Seekers</span>
                </div>
              </div>

              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white px-6 py-3 rounded-full font-semibold text-lg hover:from-[#071429] hover:to-[#071429] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Back to Home
              </Link>
            </div>

            {/* Legal Disclaimer */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>
                Vendax Systems LLC reserves the right to modify these Terms & Conditions at any time. Updates are effective upon posting. For inquiries, reach us at{" "}
                <a href="mailto:support@expertresume.us" className="text-[#0B1F3B] hover:underline">support@expertresume.us</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}