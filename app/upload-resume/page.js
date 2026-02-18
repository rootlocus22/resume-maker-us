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
      <div className="flex-1 bg-bg flex flex-col items-center p-4 md:p-8 relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <UploadResumeWrapper />

        {/* SEO Depth for Indexation */}
        <section className="mt-16 w-full max-w-4xl text-left border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-extrabold text-primary mb-6">Master the US Job Market with an ATS-Optimized Resume</h2>
          <div className="grid md:grid-cols-2 gap-8 text-gray-600 leading-relaxed">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">What is an ATS and why does it matter?</h3>
              <p className="text-sm">
                Most US companies use an **Applicant Tracking System (ATS)** like Workday, Greenhouse, or Lever to screen resumes.
                If your resume isn't formatted correctly or lacks keywords, it might never reach a human recruiter.
                Our tool ensures your resume is parseable and optimized for these systems.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">How to enhance your existing resume</h3>
              <p className="text-sm">
                Just upload your PDF or Word document. Our AI analyzes your job title and identifies missing high-impact keywords.
                We help you restructure your bullet points using the **Action Verb + Result** formula, which is the gold standard for American hiring.
              </p>
            </div>
          </div>
          <div className="mt-12 bg-accent/5 p-8 rounded-2xl border border-accent/10">
            <h3 className="text-lg font-bold text-accent-700 mb-4">Key Features of our AI Enhancer</h3>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm font-medium text-slate-700">
              <li className="flex items-center gap-2">✅ Instant ATS Compatibility Check</li>
              <li className="flex items-center gap-2">✅ Intelligent Keyword Injection</li>
              <li className="flex items-center gap-2">✅ Professional Template Migration</li>
              <li className="flex items-center gap-2">✅ Multi-page Support (US/Global formats)</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}