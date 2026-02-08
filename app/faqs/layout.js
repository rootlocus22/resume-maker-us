export const metadata = {
  title: "FAQs - Frequently Asked Questions | ExpertResume",
  description:
    "Find answers to common questions about ExpertResume's AI resume builder, ATS checker, pricing plans, and features. Get help with resume building, cover letters, and job search tools.",
  keywords: [
    "resume builder FAQ",
    "resume maker questions",
    "ATS checker FAQ",
    "resume builder help",
    "resume builder support",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/faqs",
  },
  openGraph: {
    title: "FAQs - Frequently Asked Questions | ExpertResume",
    description:
      "Find answers to common questions about ExpertResume's AI resume builder, ATS checker, and features.",
    url: "https://expertresume.us/faqs",
    siteName: "ExpertResume",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "ExpertResume FAQs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQs - Frequently Asked Questions | ExpertResume",
    description: "Find answers to common questions about ExpertResume's features and services.",
    images: ["https://expertresume.us/ExpertResume.png"],
  },
};

export default function FAQsLayout({ children }) {
  return children;
}

