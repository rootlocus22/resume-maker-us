import Link from 'next/link';
import { adminDb } from '../../lib/firebase-admin';

export const metadata = {
    title: 'Interview & Role Directory | AI Interview Pro',
    description: 'Browse thousands of interview guides, mock interviews, and role-specific preparation materials across US, UK, Canada, and Australia.',
};

// 1. Fetch All Roles from Firestore (Cached for performance mainly via Nextjs default dedupe)
async function getAllRoles() {
    try {
        const snapshot = await adminDb.collection('interview_roles').orderBy('title').get(); // ordering by title for A-Z
        const roles = snapshot.docs.map(doc => ({
            slug: doc.id,
            ...doc.data()
        }));
        return roles;
    } catch (error) {
        console.error("Failed to fetch roles:", error);
        return [];
    }
}

export default async function InterviewDirectory() {
    const roles = await getAllRoles();

    // Grouping for better UX (A-Z)
    const groupedRoles = roles.reduce((acc, role) => {
        const char = role.title.charAt(0).toUpperCase();
        if (!acc[char]) acc[char] = [];
        acc[char].push(role);
        return acc;
    }, {});

    const sortedGroups = Object.keys(groupedRoles).sort();

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-slate-900 py-16 text-center">
                <h1 className="text-4xl font-extrabold text-white mb-4">Interview Directory</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Explore our comprehensive database of {roles.length} interview guides.
                    Practice with AI-driven mock interviews for any role.
                </p>
                <div className="mt-8 flex justify-center gap-4 text-sm text-slate-500">
                    <span>🇺🇸 USA</span>
                    <span>🇬🇧 UK</span>
                    <span>🇨🇦 Canada</span>
                    <span>🇦🇺 Australia</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar / Quick Jump */}
                    <div className="hidden md:block col-span-1">
                        <div className="sticky top-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4">Browse by Letter</h3>
                            <div className="flex flex-wrap gap-2">
                                {sortedGroups.map(char => (
                                    <a
                                        key={char}
                                        href={`#group-${char}`}
                                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded hover:bg-blue-600 hover:text-white transition-colors text-sm font-medium text-slate-700"
                                    >
                                        {char}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main List */}
                    <div className="col-span-1 md:col-span-3">
                        {sortedGroups.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">
                                Loading directory or no roles found...
                            </div>
                        ) : (
                            sortedGroups.map(char => (
                                <div key={char} id={`group-${char}`} className="mb-12 scroll-mt-24">
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2 className="text-3xl font-bold text-slate-900">{char}</h2>
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                                        {groupedRoles[char].map(role => (
                                            <div key={role.slug} className="group">
                                                <Link
                                                    href={`/ai-interview/us/${role.slug}/interview-questions`}
                                                    className="font-medium text-slate-700 hover:text-blue-600 transition-colors block text-lg mb-1"
                                                >
                                                    {role.title}
                                                </Link>
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex gap-1.5">
                                                        <span className="text-slate-500 font-bold uppercase text-[9px]">USA:</span>
                                                        <Link href={`/ai-interview/us/${role.slug}/interview-questions`} className="hover:text-blue-600">Questions</Link>
                                                        <Link href={`/ai-interview/us/${role.slug}/mock-interview`} className="hover:text-blue-600">Mock</Link>
                                                        <Link href={`/ai-interview/us/${role.slug}/interview-feedback`} className="hover:text-blue-600">Feedback</Link>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <span className="text-slate-500 font-bold uppercase text-[9px]">UK:</span>
                                                        <Link href={`/ai-interview/uk/${role.slug}/interview-questions`} className="hover:text-blue-600">Questions</Link>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <span className="text-slate-500 font-bold uppercase text-[9px]">CA:</span>
                                                        <Link href={`/ai-interview/ca/${role.slug}/interview-questions`} className="hover:text-blue-600">Questions</Link>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <span className="text-slate-500 font-bold uppercase text-[9px]">AU:</span>
                                                        <Link href={`/ai-interview/au/${role.slug}/interview-questions`} className="hover:text-blue-600">Questions</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
