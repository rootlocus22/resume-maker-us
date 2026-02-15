"use client";
import Link from "next/link";
import { ArrowRight, Briefcase, TrendingUp } from "lucide-react";
import jobRolesData from "../data/job_roles.json";

// Get popular/high-volume job roles for homepage display
function getPopularJobRoles() {
  // Select a mix of high-volume tech, fresher, and non-tech roles
  const popularSlugs = [
    "java-developer-resume-india",
    "python-developer-resume-india",
    "data-analyst-resume-india",
    "react-developer-resume-india",
    "full-stack-developer-resume-india",
    "software-engineer-fresher-resume-india",
    "btech-cs-fresher-resume-india",
    "mba-fresher-resume-india",
    "digital-marketing-manager-resume-india",
    "chartered-accountant-resume-india",
    "human-resources-manager-resume-india",
    "sales-manager-resume-india"
  ];

  return jobRolesData
    .filter(role => popularSlugs.includes(role.slug))
    .slice(0, 12); // Show 12 popular roles
}

export default function JobRoleResumeFormats() {
  const popularRoles = getPopularJobRoles();

  if (popularRoles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent-50 text-accent-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Briefcase className="w-4 h-4" />
            Job-Specific Resume Formats
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Resume Formats for Every Job Role
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get ATS-optimized resume templates, salary insights, and expert tips tailored for your specific role
          </p>
        </div>

        {/* Job Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {popularRoles.map((role) => (
            <Link
              key={role.slug}
              href="/resume-builder"
              className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-accent hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-accent-600 transition-colors">
                  {role.job_title}
                </h3>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-gray-900">{role.avg_salary_us || role.avg_salary_india}</span>
                  <span className="text-gray-500">avg salary</span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {role.meta_description.substring(0, 100)}...
                </p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {role.hard_skills.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-accent-50 text-accent-700 text-xs font-medium rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {role.hard_skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                      +{role.hard_skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Link
            href="/resume-builder"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors"
          >
            View All 70+ Resume Formats
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

