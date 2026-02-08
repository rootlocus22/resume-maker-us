export const metadata = {
  title: "Resume Templates - 100+ Professional ATS-Optimized Templates | ExpertResume",
  description:
    "Browse 100+ professional, ATS-optimized resume templates. Choose from executive, modern, creative, and job-specific templates. Download free resume templates for all industries.",
  keywords: [
    "resume templates",
    "ATS resume templates",
    "professional resume templates",
    "free resume templates",
    "resume template download",
    "job-specific resume templates",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/templates",
  },
  openGraph: {
    title: "Resume Templates - 100+ Professional ATS-Optimized Templates | ExpertResume",
    description:
      "Browse 100+ professional, ATS-optimized resume templates for all industries and experience levels.",
    url: "https://expertresume.us/templates",
    siteName: "ExpertResume",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "Resume Templates - ExpertResume",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Templates - 100+ Professional ATS-Optimized Templates",
    description: "Browse professional resume templates for all industries and experience levels.",
    images: ["https://expertresume.us/ExpertResume.png"],
  },
};

export default function TemplatesLayout({ children }) {
  return children;
}

