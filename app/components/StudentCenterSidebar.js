import Link from "next/link";
import { GraduationCap, ArrowRight, BookOpen } from "lucide-react";

export default function StudentCenterSidebar() {
    const universityLinks = [
        { title: "Resume Builder", href: "/resume-builder" },
        { title: "Templates", href: "/resume-templates" },
        { title: "JD-Based Builder", href: "/job-description-resume-builder" },
        { title: "One Page", href: "/one-page-resume-builder" },
        { title: "AI Resume", href: "/free-ai-resume-builder" },
    ];

    const fresherLinks = [
        { title: "Resume Builder", href: "/resume-builder" },
        { title: "Templates", href: "/resume-templates" },
        { title: "Cover Letter", href: "/cover-letter-builder" },
        { title: "ATS Checker", href: "/ats-score-checker" },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden mb-8">
            <div className="bg-blue-600 px-5 py-4 flex items-center gap-2">
                <GraduationCap className="text-white w-5 h-5" />
                <h3 className="text-white font-bold text-lg">Student Center</h3>
            </div>

            <div className="p-5">
                <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Top University Formats</h4>
                    <ul className="space-y-2">
                        {universityLinks.map((link, idx) => (
                            <li key={idx}>
                                <Link href={link.href} className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors group">
                                    <span className="text-sm font-medium">{link.title}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Stream-Wise Formats</h4>
                    <ul className="space-y-2">
                        {fresherLinks.map((link, idx) => (
                            <li key={idx}>
                                <Link href={link.href} className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors group">
                                    <span className="text-sm font-medium">{link.title}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-blue-50 p-4 border-t border-blue-100">
                <Link href="/resume-builder" className="flex items-center justify-center gap-2 text-sm font-bold text-blue-700 hover:underline">
                    <BookOpen className="w-4 h-4" />
                    View All Student Guides
                </Link>
            </div>
        </div>
    );
}
