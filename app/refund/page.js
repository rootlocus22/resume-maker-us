import Link from "next/link";

export const metadata = {
  title: "Cancellation & Refund Policy - ExpertResume",
  description:
    "ExpertResume refund and cancellation policy. Create professional, ATS-friendly resumes. Operated by Vendax Systems LLC.",
  keywords: [
    "free resume builder",
    "professional resume maker",
    "ATS-friendly resume",
    "resume templates",
    "refund policy",
    "Vendax Systems",
  ],
  authors: [{ name: "Vendax Systems LLC" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/refund",
  },
  openGraph: {
    title: "Refund Policy - ExpertResume",
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

export default function RefundPage() {
  return (
    <>
      {/* Schema Markup for SEO */}
      <script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Cancellation & Refund Policy - ExpertResume",
            url: "https://expertresume.us/refund",
            description:
              "Vendax Systems LLC does not offer refunds or cancellations for ExpertResume digital services. Read our policy for more details.",
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-center bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent mb-4 sm:mb-6">
              Cancellation & Refund Policy
            </h1>
            <p className="text-center text-gray-500 text-sm mb-6">
              Last updated on Feb 26, 2026
            </p>

            {/* Trust Preamble */}
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-gray-700 text-sm sm:text-base font-medium">
                At <span className="font-semibold text-primary">ExpertResume</span>, operated by Vendax Systems LLC, we’re committed to providing you with exceptional tools to advance your career. Our policies are designed to be transparent and fair, ensuring you can trust us every step of the way.
              </p>
            </div>

            <div className="space-y-6 text-gray-700">
              {/* Policy Overview */}
              <div className="border-l-4 border-primary pl-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Our Commitment to You</h2>
                <p className="text-sm sm:text-base">
                  We strive to deliver high-quality digital services instantly accessible upon purchase. Due to the nature of our offerings, we maintain a <strong>no-refund and no-cancellation policy</strong>. Please review this policy carefully before proceeding with any purchase.
                </p>
              </div>

              {/* No Cancellations */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  No Cancellations After Purchase
                </h3>
                <p className="text-sm sm:text-base">
                  Once you purchase a <strong>premium ExpertResume service</strong> or subscription, <strong>cancellations are not permitted</strong>. We encourage you to try our <Link href="/" className="text-primary hover:underline">free version</Link> to explore features before committing to a paid plan.
                </p>
              </div>

              {/* No Refunds */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No Refunds Policy
                </h3>
                <p className="text-sm sm:text-base">
                  Due to the immediate delivery of digital services—including <strong>resume templates, tools, and premium features</strong>—we do not offer refunds. We’re confident in our product and invite you to test it thoroughly with our free tools before upgrading.
                </p>
              </div>

              {/* Contact Support */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Questions or Concerns?
                </h3>
                <p className="text-sm sm:text-base">
                  Our team is here to assist you. If you have any questions about our services or this policy, please reach out to us at{" "}
                  <a href="mailto:support@expertresume.us" className="text-primary hover:underline">support@expertresume.us</a>. We typically respond within 24-48 hours.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 text-center">
              <div className="flex justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-600">Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.761 0-5 2.239-5 5v1h10v-1c0-2.761-2.239-5-5-5zM5 5h14v14H5z" />
                  </svg>
                  <span className="text-sm text-gray-600">Trusted by 1,500+ Users</span>
                </div>
              </div>

              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-primary to-primary text-white px-6 py-3 rounded-full font-semibold text-lg hover:from-gray-900 hover:to-gray-900 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Back to Home
              </Link>
            </div>

            {/* Legal Disclaimer */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>
                Vendax Systems LLC reserves the right to update this policy at any time. Changes will be effective upon posting. For inquiries: <a href="mailto:support@expertresume.us" className="text-primary hover:underline">support@expertresume.us</a> | 28 Geary St STE 650 Suite #500, San Francisco, CA 94108, United States.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}