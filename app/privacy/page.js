import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - ExpertResume",
  description:
    "How ExpertResume and Vendax Systems LLC collect, use, and protect your data. CCPA and privacy rights.",
  keywords: [
    "ExpertResume privacy",
    "Vendax Systems",
    "resume builder privacy",
  ],
  authors: [{ name: "Vendax Systems LLC" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/privacy",
  },
  openGraph: {
    title: "Privacy Policy - ExpertResume | India's First AI Powered Resume Builder",
    description:
      "Read ExpertResume's privacy policy. Learn how we protect your data, comply with CCPA, and respect your privacy rights.",
    url: "https://expertresume.us/privacy",
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Privacy Policy - ExpertResume",
            url: "https://expertresume.us/privacy",
            description:
              "Privacy Policy of ExpertResume, operated by Vendax Systems LLC.",
          }),
        }}
      />
      <div className="min-h-screen py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-xl p-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-center bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] bg-clip-text text-transparent mb-4 sm:mb-6">
              Privacy Policy
            </h1>
            <p className="text-center text-gray-500 text-sm mb-6">
              Last updated on Feb 26th 2026
            </p>

            <div className="space-y-6 text-gray-700">
              <p>
                This privacy policy sets out how Vendax Systems LLC uses and protects any information that you give Vendax Systems LLC when you visit our website and/or agree to purchase from us.
              </p>

              <p>
                Vendax Systems LLC is committed to ensuring
                that your privacy is protected. Should we ask you to provide
                certain information by which you can be identified when using
                this website, then you can be assured that it will only be used
                in accordance with this privacy statement.
              </p>

              <p>
                Vendax Systems LLC may change this policy from
                time to time by updating this page. You should check this page
                from time to time to ensure that you adhere to these changes.
              </p>

              <h2 className="text-lg font-semibold text-gray-800 mt-6">
                Information We Collect
              </h2>
              <ul className="list-disc list-inside">
                <li>Name</li>
                <li>Contact information including email address</li>
                <li>
                  Demographic information such as postcode, preferences, and
                  interests, if required
                </li>
                <li>Other information relevant to customer surveys and/or offers</li>
              </ul>

              <h2 className="text-lg font-semibold text-gray-800 mt-6">
                What We Do with This Information
              </h2>
              <ul className="list-disc list-inside">
                <li>Internal record keeping.</li>
                <li>We may use the information to improve our products and services.</li>
                <li>
                  We may periodically send promotional emails about new
                  products, special offers, or other information which we think
                  you may find interesting using the email address you provided.
                </li>
                <li>
                  From time to time, we may also use your information to contact
                  you for market research purposes via email, phone, fax, or mail.
                </li>
                <li>We may use the information to customize the website according to your interests.</li>
              </ul>

              <h2 className="text-lg font-semibold text-gray-800 mt-6">
                Security
              </h2>
              <p>
                We are committed to ensuring that your information is secure. In
                order to prevent unauthorized access or disclosure, we have
                implemented suitable security measures.
              </p>

              <h2 className="text-lg font-semibold text-gray-800 mt-6">
                How We Use Cookies
              </h2>
              <p>
                A cookie is a small file which asks permission to be placed on
                your computer's hard drive. Once you agree, the file is added
                and the cookie helps analyze web traffic or lets you know when
                you visit a particular site. Cookies allow web applications to
                respond to you as an individual.
              </p>
              <p>
                We use traffic log cookies to identify which pages are being
                used. This helps us analyze data about webpage traffic and
                improve our website to tailor it to customer needs.
              </p>
              <p>
                Overall, cookies help us provide you with a better website, by
                enabling us to monitor which pages you find useful and which you
                do not. A cookie in no way gives us access to your computer or
                any information about you, other than the data you choose to
                share with us.
              </p>
              <p>
                You can choose to accept or decline cookies. Most web browsers
                automatically accept cookies, but you can usually modify your
                browser setting to decline cookies if you prefer. This may
                prevent you from taking full advantage of the website.
              </p>

              <h2 className="text-lg font-semibold text-gray-800 mt-6">
                Controlling Your Personal Information
              </h2>
              <p>
                You may choose to restrict the collection or use of your
                personal information in the following ways:
              </p>
              <ul className="list-disc list-inside">
                <li>
                  Whenever you are asked to fill in a form on the website, look
                  for the box that you can click to indicate that you do not
                  want the information to be used for direct marketing purposes.
                </li>
                <li>
                  If you have previously agreed to us using your personal
                  information for direct marketing purposes, you may change
                  your mind at any time by writing to or emailing us.
                </li>
              </ul>

              <h2 className="text-lg font-semibold text-gray-800 mt-6">
                California Consumer Privacy Act (CCPA) Rights
              </h2>
              <p>
                If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA).
                This section describes your CCPA rights and explains how to exercise these rights.
              </p>

              <h3 className="text-md font-semibold text-gray-800 mt-4">
                Your Rights Under CCPA
              </h3>
              <ul className="list-disc list-inside">
                <li><strong>Right to Know:</strong> You have the right to request that we disclose information about our collection and use of your personal information over the past 12 months.</li>
                <li><strong>Right to Delete:</strong> You have the right to request that we delete personal information that we collected from you.</li>
                <li><strong>Right to Opt-Out:</strong> You have the right to opt-out of the sale of your personal information.</li>
                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA rights.</li>
                <li><strong>Right to Data Portability:</strong> You have the right to receive your personal information in a portable format.</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mt-4">
                Categories of Personal Information We Collect
              </h3>
              <ul className="list-disc list-inside">
                <li><strong>Identifiers:</strong> Name, email address, phone number, IP address</li>
                <li><strong>Personal Information:</strong> Resume data, professional experience, education details</li>
                <li><strong>Commercial Information:</strong> Purchase history, billing information</li>
                <li><strong>Internet Activity:</strong> Browsing history, search history, interaction with our website</li>
                <li><strong>Geolocation Data:</strong> General location information based on IP address</li>
                <li><strong>Professional Information:</strong> Employment history, skills, certifications</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mt-4">
                Sources of Personal Information
              </h3>
              <ul className="list-disc list-inside">
                <li>Directly from you when you create an account or use our services</li>
                <li>From your use of our website and services</li>
                <li>From third-party services you connect to our platform</li>
                <li>From public sources and social media platforms</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mt-4">
                Business Purposes for Collecting Personal Information
              </h3>
              <ul className="list-disc list-inside">
                <li>Providing and maintaining our resume building services</li>
                <li>Processing payments and managing subscriptions</li>
                <li>Communicating with you about our services</li>
                <li>Improving our services and developing new features</li>
                <li>Ensuring security and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mt-4">
                Do Not Sell My Personal Information
              </h3>
              <p>
                We do not sell personal information to third parties. However, we may share certain information
                with service providers who help us operate our business. You have the right to opt-out of any
                future sales of your personal information.
              </p>
              <p>
                <a href="/ccpa-opt-out" className="text-[#0B1F3B] hover:text-[#071429] underline">
                  Click here to opt-out of the sale of your personal information
                </a>
              </p>

              <h3 className="text-md font-semibold text-gray-800 mt-4">
                How to Exercise Your CCPA Rights
              </h3>
              <p>
                To exercise your CCPA rights, you can:
              </p>
              <ul className="list-disc list-inside">
                <li>Submit a request through our <a href="/privacy-dashboard" className="text-[#0B1F3B] hover:text-[#071429] underline">Privacy Dashboard</a></li>
                <li>Email us at: <a href="mailto:privacy@expertresume.us" className="text-[#0B1F3B] hover:text-[#071429] underline">privacy@expertresume.us</a></li>
                <li>Contact us via email for fastest response</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mt-4">
                Verification Process
              </h3>
              <p>
                To protect your privacy, we will verify your identity before processing your request.
                We may ask you to provide additional information to verify your identity, such as:
              </p>
              <ul className="list-disc list-inside">
                <li>Email address associated with your account</li>
                <li>Phone number associated with your account</li>
                <li>Recent account activity information</li>
              </ul>

              <h3 className="text-md font-semibold text-gray-800 mt-4">
                Response Time
              </h3>
              <p>
                We will respond to your request within 45 days of receiving it. If we need more time,
                we will inform you of the reason and extension period in writing.
              </p>

              <h2 className="text-lg font-semibold text-gray-800 mt-6">
                Data Retention
              </h2>
              <p>
                We retain your personal information for as long as necessary to provide our services
                and comply with legal obligations. Specifically:
              </p>
              <ul className="list-disc list-inside">
                <li><strong>Account Information:</strong> Retained while your account is active</li>
                <li><strong>Resume Data:</strong> Retained for 3 years after account closure</li>
                <li><strong>Payment Information:</strong> Retained for 7 years for tax compliance</li>
                <li><strong>Usage Logs:</strong> Retained for 90 days for security purposes</li>
              </ul>

              <h2 className="text-lg font-semibold text-gray-800 mt-6">
                Third-Party Services
              </h2>
              <p>
                We may use third-party services to help us operate our business. These services
                may have access to your personal information only to perform specific tasks on our behalf:
              </p>
              <ul className="list-disc list-inside">
                <li><strong>Payment Processing:</strong> Stripe, PayPal for payment processing</li>
                <li><strong>Analytics:</strong> Google Analytics for website analytics</li>
                <li><strong>Email Services:</strong> AWS SES for transactional emails</li>
                <li><strong>Cloud Storage:</strong> Firebase for data storage</li>
              </ul>
              <p>
                We will not sell, distribute, or lease your personal information
                to third parties unless we have your permission or are required
                by law to do so. We may use your personal information to send
                you promotional information about third parties which we think
                you may find interesting if you tell us that you wish this to
                happen.
              </p>
              <p>
                If you believe that any information we are holding on you is
                incorrect or incomplete, please write to:
              </p>
              <address className="font-semibold">
                Ahad Excellencia H2 101 Choodasandra <br />
                Bengaluru, KARNATAKA 560035
              </address>
            </div>

            <div className="text-center mt-10">
              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-[#0B1F3B] to-[#0B1F3B] text-white px-6 py-3 rounded-full font-semibold text-lg hover:from-[#071429] hover:to-[#071429] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
