import UploadResumeWrapper from "./UploadResumeWrapper";

export const metadata = {
  title: "ATS-Friendly Resume Builder - Optimize Your Resume for Job Applications",
  description:
    "Create an ATS-friendly resume with our AI-powered resume builder. Optimize keywords, formatting, and content to pass applicant tracking systems and boost your job application success.",
  keywords:
    "ATS-friendly resume, resume builder, ATS resume checker, resume optimization, applicant tracking system, ATS resume, job application, resume keywords, AI resume tool, resume enhancer",
  robots: "index, follow",
  alternates: {
    canonical: "https://expertresume.us/upload-resume",
  },
  openGraph: {
    title: "ATS Resume Builder - Craft Your Perfect Resume",
    description:
      "Build an ATS-optimized resume with AI enhancements. Ensure compatibility with applicant tracking systems and improve your job search results.",
    url: "https://expertresume.us/upload-resume",
    type: "website",
    images: [
      {
        url: "https://expertresume.us/ExpertResume.png",
        width: 1200,
        height: 630,
        alt: "ATS Resume Builder - Professional Resume Editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATS Resume Builder - Craft Your Perfect Resume",
    description: "Build an ATS-optimized resume with AI enhancements. Ensure compatibility with applicant tracking systems.",
    images: ["https://expertresume.us/images/resume-editor.jpg"],
  },
};

export default function ResumeBuilderPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-[#F8FAFC] flex flex-col items-center p-4 md:p-8 relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#00C4B3]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-20 w-40 h-40 bg-[#0B1F3B]/5 rounded-full blur-3xl" />
        </div>

        <UploadResumeWrapper />
      </div>
    </div>
  );
}