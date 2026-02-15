"use client";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

const allResumes = [
  { href: "/resume-builder", title: "Software Engineer Resume", emoji: "💻", category: "tech" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "🎓", category: "fresher" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "🇺🇸", category: "specialized" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "📞", category: "industry" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "📈", category: "fresher" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "⚙️", category: "tech" },
  { href: "/one-page-resume-builder", title: "One Page Resume", emoji: "📄", category: "format" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "🎒", category: "fresher" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "💼", category: "tech" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "🌟", category: "fresher" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "🏠", category: "specialized" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "🔄", category: "specialized" },
  { href: "/ats-score-checker", title: "ATS Checker", emoji: "✅", category: "format" },
  { href: "/free-ai-resume-builder", title: "AI Resume Builder", emoji: "✨", category: "format" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "📝", category: "fresher" },
  { href: "/resume-templates", title: "Templates", emoji: "🔧", category: "tech" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "🎉", category: "fresher" },
  { href: "/resume-builder", title: "Resume Builder", emoji: "⚡", category: "format" },
];

export default function RelatedResumes({ currentPath, category = null, limit = 6 }) {
  // Filter out current page and get related resumes
  let related = allResumes.filter(resume => resume.href !== currentPath);
  
  // If category is provided, prioritize same category
  if (category) {
    const sameCategory = related.filter(r => r.category === category);
    const otherCategory = related.filter(r => r.category !== category);
    related = [...sameCategory, ...otherCategory];
  }
  
  // Limit the number of related resumes
  const displayResumes = related.slice(0, limit);
  
  if (displayResumes.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Related Resume Templates
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore more specialized resume formats tailored for different roles and industries
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayResumes.map((resume, index) => (
            <Link
              key={index}
              href={resume.href}
              className="group bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-accent hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{resume.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-accent-600 transition-colors mb-2 flex items-center justify-between">
                    {resume.title}
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-gray-600">
                    Build professional resume
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/resume-builder"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-bold hover:from-primary-800 hover:to-accent-600 transition-all shadow-lg hover:shadow-xl"
          >
            <FileText size={20} />
            Build Your Resume Now
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}

