"use client";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function LazyCategoryList({ categories }) {
    if (!categories || Object.keys(categories).length === 0) return null;

    return (
        <>
            {Object.entries(categories).map(([categoryName, roles]) => {
                if (!roles || roles.length === 0) return null;

                return (
                    <div key={categoryName} className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-500">
                            {categoryName}
                            <span className="ml-3 text-lg font-normal text-gray-600">
                                ({roles.length} roles)
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roles.map((role) => (
                                <Link
                                    key={role.slug}
                                    href="/resume-builder"
                                    className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {role.job_title}
                                        </h3>
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                            <span className="font-semibold text-gray-900">{role.avg_salary_us || role.avg_salary_india}</span>
                                            <span className="text-gray-500">avg salary</span>
                                        </div>

                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {(role.meta_description ? String(role.meta_description) : `Professional resume format for ${role.job_title} with ATS optimization.`).substring(0, 120)}...
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {role.hard_skills.slice(0, 4).map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {role.hard_skills.length > 4 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                                    +{role.hard_skills.length - 4}
                                                </span>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-gray-100">
                                            <span className="text-xs text-gray-500">
                                                {role.experience_level || "All Levels"}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
