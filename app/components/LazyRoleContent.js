"use client";
import Link from "next/link";
import {
    CheckCircle,
    AlertTriangle,
    FileText,
    Zap,
    Users,
    BarChart2,
    Briefcase,
    ArrowRight,
    Award,
    Clock,
    TrendingUp,
    Layers,
    Code,
} from "lucide-react";
import CopyButton from "./CopyButton";

export default function LazyRoleContent({ role, relatedRoles = [] }) {
    // relatedRoles is now passed from Server Component. Default to [] to prevent crash.
    const validRelatedRoles = relatedRoles || [];

    // Defensive rendering helper to prevent "Objects are not valid as a React child"
    // Use this for any field that might unexpectedly contain an object from Firestore.
    const renderSafe = (val) => {
        if (typeof val === 'string') return val;
        if (!val) return "";
        if (typeof val === 'object') {
            return val.description || val.title || JSON.stringify(val);
        }
        return String(val);
    };

    return (
        <>
            {/* Key Stats */}
            <section className="py-12 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {role.region === 'uk' ? renderSafe(role.avg_salary_uk) :
                                    role.region === 'us' ? renderSafe(role.avg_salary_us) : renderSafe(role.avg_salary_india)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Salary ({role.region === 'uk' ? 'UK' : role.region === 'us' ? 'USA' : 'India'})</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{renderSafe(role.experience_level)}</div>
                            <div className="text-sm text-gray-600">Experience Level</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{role.hard_skills ? role.hard_skills.length : 0}+</div>
                            <div className="text-sm text-gray-600">Key Skills</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">ATS</div>
                            <div className="text-sm text-gray-600">Optimized</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Professional Summary Section */}
            <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 border-2 border-primary-200">
                            <div className="flex items-start gap-4 mb-4">
                                <FileText className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                        Copy-Paste Professional Summary
                                    </h2>
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        Use this professional summary for your <strong>{renderSafe(role.job_title)}</strong> {role.region === 'uk' ? 'CV' : 'resume'}:
                                    </p>
                                    <div className="bg-white rounded-xl p-6 border-l-4 border-primary shadow-sm relative">
                                        <p className="text-gray-800 leading-relaxed italic">
                                            "{renderSafe(role.summary_text)}"
                                        </p>
                                    </div>
                                    <CopyButton text={renderSafe(role.summary_text)} />
                                    <p className="text-sm text-gray-600 mt-2">
                                        💡 <strong>Tip:</strong> Customize this summary with your specific achievements and years of experience.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Day in the Life Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl p-8 border-2 border-primary-100 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="bg-primary-100 p-3 rounded-full">
                                    <Clock className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                        A Day in the Life of a {renderSafe(role.job_title)}
                                    </h2>
                                    <p className="text-lg text-gray-700 leading-relaxed">
                                        {role.day_in_life ? renderSafe(role.day_in_life) : (
                                            <>
                                                A typical day as a <strong>{renderSafe(role.job_title)}</strong> is dynamic and fast-paced.
                                                You will start by prioritizing tasks that require your expertise in <strong>{renderSafe(role.hard_skills?.[0]) || 'core technical skills'}</strong>.
                                                Mid-day often involves collaborating with cross-functional teams and applying <strong>{renderSafe(role.hard_skills?.[1]) || 'problem-solving'}</strong> strategies to overcome challenges.
                                                {role.hard_skills?.[2] && ` You will also dedicate time to refining your ${renderSafe(role.hard_skills[2])} capabilities to drive better results.`}
                                                {' '}Towards the end of the day, the focus shifts to documentation and planning for upcoming sprints, leveraging your strong understanding of <strong>{renderSafe(role.hard_skills?.[3]) || 'industry best practices'}</strong>.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Career Roadmap Section */}
            {role.career_path && role.career_path.length > 0 && (
                <section className="py-16 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Career Roadmap
                            </h2>
                            <p className="text-xl text-gray-600">
                                Typical career progression for a {renderSafe(role.job_title)}
                            </p>
                        </div>
                        <div className="max-w-5xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-center relative">
                                {/* Connector Line (Desktop) */}
                                <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>

                                {role.career_path.map((step, index) => (
                                    <div key={index} className="flex flex-col items-center mb-8 md:mb-0 relative group">
                                        <div className="w-12 h-12 rounded-full bg-white border-4 border-primary flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center w-48 hover:shadow-md transition-shadow">
                                            <p className="font-bold text-gray-900">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}


            {/* Keyword Mapping Table - LLM Signal */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Role-Specific Keyword Mapping for {renderSafe(role.job_title)}
                        </h2>
                        <p className="text-lg text-gray-600">
                            Use these exact keywords to rank higher in ATS and AI screenings
                        </p>
                    </div>
                    <div className="max-w-4xl mx-auto overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended Keywords</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Why It Matters</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Core Tech</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {role.hard_skills ? role.hard_skills.slice(0, 4).map(s => renderSafe(s)).join(", ") : "Java, Python, SQL, React"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">Required for initial screening</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Soft Skills</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {role.soft_skills ? role.soft_skills.slice(0, 3).map(s => renderSafe(s)).join(", ") : "Leadership, Communication, Agile"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">Crucial for cultural fit & leadership</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Action Verbs</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">Spearheaded, Optimized, Architected, Deployed</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">Signals impact and ownership</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Key Skills Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Essential Skills for {renderSafe(role.job_title)}
                        </h2>
                        <p className="text-xl text-gray-600">
                            Google uses these entities to understand relevance. Make sure to include these in your resume.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Hard Skills */}
                        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 border-2 border-primary-200">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="w-8 h-8 text-primary" />
                                <h3 className="text-2xl font-bold text-gray-900">Hard Skills</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {role.hard_skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-white text-primary-700 px-4 py-2 rounded-full text-sm font-semibold border border-primary-200 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {renderSafe(skill)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Soft Skills */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="w-8 h-8 text-purple-600" />
                                <h3 className="text-2xl font-bold text-gray-900">Soft Skills</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {role.soft_skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-white text-purple-700 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {renderSafe(skill)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enhanced Salary Data Section */}
            {role.salary_data && (
                <section className="py-16 bg-gradient-to-b from-green-50 to-accent-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                💰 {renderSafe(role.job_title)} Salary in {role.region === 'uk' ? 'UK' : role.region === 'us' ? 'USA' : 'India'} (2026)
                            </h2>
                            <p className="text-xl text-gray-600">
                                Comprehensive salary breakdown by experience, location, and company
                            </p>
                        </div>

                        {/* By Experience */}
                        {(role.salary_data.india_average || role.salary_data.uk_average || role.salary_data.us_average) && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Salary by Experience Level</h3>
                                <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
                                    <div className="bg-white rounded-xl p-6 border-2 border-green-200 text-center hover:shadow-lg transition-shadow">
                                        <div className="text-sm font-semibold text-green-700 mb-2">Fresher</div>
                                        <div className="text-2xl font-bold text-green-900">
                                            {role.region === 'uk' ? role.salary_data.uk_average["0-2_years"] :
                                                role.region === 'us' ? role.salary_data.us_average["0-2_years"] : role.salary_data.india_average["0-2_years"]}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">0-2 Years</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 border-2 border-primary-300 text-center hover:shadow-lg transition-shadow">
                                        <div className="text-sm font-semibold text-primary-700 mb-2">Mid-Level</div>
                                        <div className="text-2xl font-bold text-primary-900">
                                            {role.region === 'uk' ? role.salary_data.uk_average["2-5_years"] :
                                                role.region === 'us' ? role.salary_data.us_average["2-5_years"] : role.salary_data.india_average["2-5_years"]}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">2-5 Years</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 border-2 border-purple-300 text-center hover:shadow-lg transition-shadow">
                                        <div className="text-sm font-semibold text-purple-700 mb-2">Senior</div>
                                        <div className="text-2xl font-bold text-purple-900">
                                            {role.region === 'uk' ? role.salary_data.uk_average["5-10_years"] :
                                                role.region === 'us' ? role.salary_data.us_average["5-10_years"] : role.salary_data.india_average["5-10_years"]}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">5-10 Years</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 border-2 border-orange-300 text-center hover:shadow-lg transition-shadow">
                                        <div className="text-sm font-semibold text-orange-700 mb-2">Lead/Architect</div>
                                        <div className="text-2xl font-bold text-orange-900">
                                            {role.region === 'uk' ? role.salary_data.uk_average["10+_years"] :
                                                role.region === 'us' ? role.salary_data.us_average["10+_years"] : role.salary_data.india_average["10+_years"]}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">10+ Years</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* By Location */}
                        {role.salary_data.location_specific && (
                            <div className="mb-12 bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-lg border border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">📍 Salary in {role.salary_data.location_specific.location}</h3>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary-900">{role.salary_data.location_specific.average}</div>
                                    <div className="text-sm text-gray-600 mt-2">Average across all experience levels</div>
                                </div>
                            </div>
                        )}

                        {/* By Company */}
                        {role.salary_data.top_companies && (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Top Companies Salary Ranges</h3>
                                <div className="grid md:grid-cols-5 gap-4 max-w-6xl mx-auto">
                                    {Object.entries(role.salary_data.top_companies).map(([company, salary]) => (
                                        <div key={company} className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-shadow">
                                            <div className="font-bold text-gray-900 uppercase text-sm mb-2">{company}</div>
                                            <div className="text-lg font-bold text-primary-900">{salary}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-4">Updated: {role.salary_data.updated}</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Fallback for old salary_breakdown */}
            {!role.salary_data && role.salary_breakdown && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Salary Insights
                            </h2>
                            <p className="text-xl text-gray-600">
                                Market standards for {renderSafe(role.job_title)} in the US
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <div className="bg-green-50 rounded-xl p-6 border border-green-200 text-center">
                                <div className="text-lg font-semibold text-green-800 mb-2">Entry Level</div>
                                <div className="text-3xl font-bold text-green-900">{role.salary_breakdown.entry}</div>
                                <div className="text-sm text-green-600 mt-2">0-2 Years</div>
                            </div>
                            <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary transform scale-105 shadow-lg text-center relative">
                                <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl-lg font-bold">AVG</div>
                                <div className="text-lg font-semibold text-primary-800 mb-2">Mid Level</div>
                                <div className="text-3xl font-bold text-primary-900">{role.salary_breakdown.mid}</div>
                                <div className="text-sm text-primary mt-2">3-8 Years</div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 text-center">
                                <div className="text-lg font-semibold text-purple-800 mb-2">Senior Level</div>
                                <div className="text-3xl font-bold text-purple-900">{role.salary_breakdown.senior}</div>
                                <div className="text-sm text-purple-600 mt-2">8+ Years</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Tech Stack Breakdown Section */}
            {role.tech_stack_breakdown && (
                <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Tech Stack We Recommend
                            </h2>
                            <p className="text-xl text-gray-600">
                                Tools you should master
                            </p>
                        </div>
                        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                            {Object.entries(role.tech_stack_breakdown)
                                .filter(([category]) => category !== "Domain Skills") // Skip Domain Skills as it has generic data
                                .map(([category, items]) => (
                                    <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                                            <Layers className="w-6 h-6 text-primary" />
                                            <h3 className="text-xl font-bold text-gray-800">{category}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {items.map((item, idx) => (
                                                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium">
                                                    {renderSafe(item)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Top Certifications Section */}
            {role.top_certifications && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-yellow-50 rounded-2xl p-8 border-2 border-yellow-200">
                                <div className="flex items-start gap-4">
                                    <Award className="w-10 h-10 text-yellow-600 flex-shrink-0" />
                                    <div className="w-full">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                            Top Certifications to Boost Your Profile
                                        </h2>
                                        <div className="grid gap-4">
                                            {role.top_certifications.map((cert, index) => (
                                                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100 flex items-center justify-between">
                                                    <span className="font-semibold text-gray-800">{renderSafe(cert)}</span>
                                                    <CheckCircle className="w-5 h-5 text-yellow-500" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Common Mistakes Section */}
            <section className="py-16 bg-gradient-to-b from-red-50 to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl p-8 border-2 border-red-200 shadow-lg">
                            <div className="flex items-start gap-4 mb-6">
                                <AlertTriangle className="w-10 h-10 text-red-600 flex-shrink-0" />
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                        Common mistakes ChatGPT sees in {renderSafe(role.job_title)} resumes
                                    </h2>
                                    <p className="text-lg text-gray-700 leading-relaxed">
                                        {role.common_mistakes || (
                                            <>
                                                Common mistakes for <strong>{role.job_title}</strong> resumes include using generic objectives instead of a summary, failing to highlight specific technical skills like <strong>{role.hard_skills?.[0] || 'core competencies'}</strong>, and not quantifying achievements with impactful metrics.
                                                Avoid spelling errors and ensure your contact information is up-to-date.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ATS Tips Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
                                <BarChart2 className="w-5 h-5" />
                                <span className="text-sm font-semibold">ATS Optimization Tips</span>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                How to Pass ATS Filters
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {(role.ats_tips && role.ats_tips.length > 0 ? role.ats_tips : [
                                `Use standard section headings like 'Experience' and 'Skills'.`,
                                `Include keywords from the job description, such as ${role.hard_skills?.[0] || 'relevant skills'}.`,
                                `Avoid using tables, columns, or graphics that can confuse ATS parsers.`,
                                `Save your resume as a standard PDF or DOCX format to ensure compatibility.`
                            ]).map((tip, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-green-50 to-accent-50 rounded-xl p-6 border-2 border-green-200"
                                >
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                        <p className="text-gray-800 leading-relaxed">{tip}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Industry Context */}
            <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-8 border-2 border-primary-200">
                            <div className="flex items-start gap-4">
                                <Briefcase className="w-10 h-10 text-primary flex-shrink-0" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                        Industry Context
                                    </h2>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        {role.industry_context ? renderSafe(role.industry_context) : (
                                            <>
                                                The demand for skilled <strong>{renderSafe(role.job_title)}</strong> professionals in {role.region === 'uk' ? 'the UK' : role.region === 'us' ? 'the USA' : 'the US'} is growing, driven by rapid digital transformation and industry expansion.
                                                Companies are actively looking for candidates who can demonstrate proficiency in <strong>{renderSafe(role.hard_skills?.[0]) || 'key areas'}</strong> and <strong>{renderSafe(role.hard_skills?.[1]) || 'modern tools'}</strong> to drive business success.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interview Questions Section */}
            {role.interview_questions && role.interview_questions.length > 0 && (
                <section className="py-16 bg-gradient-to-b from-primary-50 to-purple-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                🎯 Top {renderSafe(role.job_title)} Interview Questions (2026)
                            </h2>
                            <p className="text-xl text-gray-600">
                                Real questions asked by top companies + expert answers
                            </p>
                        </div>

                        <div className="space-y-6">
                            {role.interview_questions.map((qa, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-md border-l-4 border-primary">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 flex-1 pr-4">
                                            Q{index + 1}: {renderSafe(qa.question)}
                                        </h3>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${qa.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                qa.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {qa.difficulty}
                                            </span>
                                            {qa.category && (
                                                <span className="text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-semibold">
                                                    {qa.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                                        <div className="text-sm font-semibold text-primary-900 mb-2">💡 Expected Answer:</div>
                                        <p className="text-gray-700 leading-relaxed">{renderSafe(qa.answer)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <Link href="/ai-interview" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-600 transition-all">
                                Practice with AI Interview
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Skills Matrix Section */}
            {role.skills_matrix && (
                <section className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                📊 Skills You Need as {renderSafe(role.job_title)}
                            </h2>
                            <p className="text-xl text-gray-600">
                                Master these skills to succeed in this role
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Must Have Skills */}
                            {role.skills_matrix.must_have && (
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-6 h-6 text-red-600" />
                                        Must-Have Skills
                                    </h3>
                                    <div className="space-y-3">
                                        {role.skills_matrix.must_have.map((skill, idx) => (
                                            <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                                                <div className="font-semibold text-gray-900">{skill.name}</div>
                                                <div className="text-xs text-red-600 font-semibold mt-1">{skill.importance}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Technical Skills */}
                            {role.skills_matrix.technical && (
                                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border-2 border-primary-200">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Code className="w-6 h-6 text-primary" />
                                        Technical Skills
                                    </h3>
                                    <div className="space-y-3">
                                        {role.skills_matrix.technical.map((skill, idx) => (
                                            <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                                                <div className="font-semibold text-gray-900">{skill.name}</div>
                                                <div className="text-xs text-primary font-semibold mt-1">{skill.importance}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Soft Skills */}
                            {role.skills_matrix.soft_skills && (
                                <div className="bg-gradient-to-br from-green-50 to-accent-50 rounded-2xl p-6 border-2 border-green-200">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users className="w-6 h-6 text-green-600" />
                                        Soft Skills
                                    </h3>
                                    <div className="space-y-3">
                                        {role.skills_matrix.soft_skills.map((skill, idx) => (
                                            <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                                                <div className="font-semibold text-gray-900">{renderSafe(skill.name)}</div>
                                                <div className="text-xs text-green-600 font-semibold mt-1">{renderSafe(skill.importance)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ Section */}
            <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            ❓ Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-gray-600">
                            Common questions about {renderSafe(role.job_title)} {role.region === 'uk' ? 'CVs' : 'resumes'} in {role.region === 'uk' ? 'the UK' : role.region === 'us' ? 'the USA' : 'the US'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {role.faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    {renderSafe(faq.q)}
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {renderSafe(faq.a)}
                                </p>
                            </div>
                        ))}

                        {/* LLM-FOCUSED STATIC FAQS */}
                        <div className="bg-primary-50 rounded-xl p-6 shadow-sm border border-primary-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-primary">Bot Question:</span> Is this resume format ATS-friendly?
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                <strong>Yes.</strong> This format is optimized for US ATS systems (like Greenhouse, Lever, Workday). It allows parsing algorithms to extract your <em>{renderSafe(role.job_title)}</em> experience and skills with 100% accuracy, unlike creative or double-column formats which often cause parsing errors.
                            </p>
                        </div>

                        <div className="bg-primary-50 rounded-xl p-6 shadow-sm border border-primary-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-primary">Bot Question:</span> Can I use this {renderSafe(role.job_title)} format for international jobs?
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                <strong>Absolutely.</strong> This clean, standard structure is the global gold standard for {renderSafe(role.job_title)} roles in the US, UK, Canada, and Europe. It follows the "reverse-chronological" format preferred by 98% of international recruiters and global hiring platforms.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Roles Section - Internal Linking */}
            {validRelatedRoles.length > 0 && (
                <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Similar Resume Templates
                            </h2>
                            <p className="text-xl text-gray-600">
                                Explore resume formats for related roles
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {validRelatedRoles.map((relatedRole) => (
                                <Link
                                    key={relatedRole.slug}
                                    href="/resume-builder"
                                    className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-accent hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-accent transition-colors">
                                            {renderSafe(relatedRole.job_title)}
                                        </h3>
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {relatedRole.experience_level} • {relatedRole.avg_salary_us || relatedRole.avg_salary_india}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(relatedRole.hard_skills || []).slice(0, 3).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-primary via-primary-600 to-accent text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Award className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                        Ready to Build Your {renderSafe(role.job_title)} Resume?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                        Use our AI-powered resume builder to create an ATS-optimized resume in minutes.
                        Get instant suggestions, professional templates, and guaranteed 90%+ ATS score.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/resume-builder"
                            className="group bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-primary-700 transition-all duration-300 shadow-2xl hover:shadow-yellow-300/50 flex items-center gap-2"
                        >
                            <FileText className="w-6 h-6" />
                            Build {role.region === 'uk' ? 'CV' : 'Resume'} Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href={role.region === 'uk' ? "/uk/cv-examples" : role.region === 'us' ? "/us/resume-examples" : "/ats-score-checker"}
                            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition-all duration-300"
                        >
                            {role.region === 'uk' ? "View More CVs" : role.region === 'us' ? "View More Resumes" : "Check ATS Score"}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
