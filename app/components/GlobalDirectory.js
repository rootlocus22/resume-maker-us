"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Briefcase, TrendingUp } from 'lucide-react';

export default function GlobalDirectory({ roles, countryCode }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [visibleCount, setVisibleCount] = useState(24);

    // Initial Data Processing (Memoized)
    const { allRoles, categories } = useMemo(() => {
        // Ensure roles is an array
        const roleList = Array.isArray(roles) ? roles : [];

        // Define Category Logic
        const cats = [
            { id: "All", label: "All Roles", count: roleList.length },
            { id: "Technology", label: "Technology & IT", keywords: ["developer", "engineer", "programmer", "architect", "data", "cyber", "network", "system", "tech"] },
            { id: "Management", label: "Management", keywords: ["manager", "director", "executive", "lead", "head of", "chief", "owner", "partner"] },
            { id: "Business", label: "Business & Finance", keywords: ["analyst", "business", "finance", "accountant", "marketing", "sales", "hr", "consultant", "operations", "admin"] },
            { id: "Healthcare", label: "Healthcare", keywords: ["nurse", "medical", "doctor", "health", "clinical", "pharmacy", "therapist", "dental"] },
            { id: "Education", label: "Education", keywords: ["teacher", "professor", "tutor", "academic", "instructor", "lecturer"] },
            { id: "Creative", label: "Creative & Design", keywords: ["designer", "artist", "writer", "editor", "photographer", "content", "creative"] },
            { id: "Services", label: "Services", keywords: ["technician", "mechanic", "cook", "chef", "driver", "security", "retail", "customer"] },
            { id: "Entry Level", label: "Entry Level", keywords: ["fresher", "intern", "trainee", "entry level", "junior"] }
        ];

        // Calculate counts for each category
        cats.forEach(cat => {
            if (cat.id === "All") return;
            cat.count = roleList.filter(role => {
                const title = role.job_title?.toLowerCase() || "";
                const level = role.experience_level?.toLowerCase() || "";
                return cat.keywords.some(k => title.includes(k)) || (cat.id === "Entry Level" && level.includes("fresher"));
            }).length;
        });

        return { allRoles: roleList, categories: cats };
    }, [roles]);


    // Filter Logic
    const filteredRoles = useMemo(() => {
        let results = allRoles;

        // 1. Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            results = results.filter(role => role.job_title?.toLowerCase().includes(lowerTerm));
        }

        // 2. Category Filter
        if (activeCategory !== "All") {
            const cat = categories.find(c => c.id === activeCategory);
            if (cat) {
                results = results.filter(role => {
                    const title = role.job_title?.toLowerCase() || "";
                    const level = role.experience_level?.toLowerCase() || "";
                    return cat.keywords.some(k => title.includes(k)) || (cat.id === "Entry Level" && level.includes("fresher"));
                });
            }
        }

        return results;
    }, [allRoles, searchTerm, activeCategory, categories]);

    const displayedRoles = filteredRoles.slice(0, visibleCount);

    return (
        <div>
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-lg p-2 mb-8 flex items-center border border-gray-100">
                <div className="flex-1 relative flex items-center">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by job title, skill, or industry..."
                        className="w-full pl-12 pr-4 py-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent text-base"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setVisibleCount(24);
                        }}
                    />
                </div>
                <button className="bg-slate-900 text-white px-8 py-3 rounded-md font-medium hover:bg-slate-800 transition-colors hidden sm:block shadow-md">
                    Search
                </button>
            </div>

            {/* Layout: Sidebar + Grid */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
                            <h3 className="font-bold text-gray-900 flex items-center justify-between">
                                Categories
                                <span className="text-xs font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full border border-accent-100">
                                    {allRoles.length}
                                </span>
                            </h3>
                        </div>
                        <div className="p-2">
                            <div className="space-y-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            setVisibleCount(24);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-all duration-200 ${activeCategory === cat.id
                                            ? 'bg-accent text-white shadow-md'
                                            : 'text-gray-600 hover:bg-accent-50 hover:text-accent-700'
                                            }`}
                                    >
                                        <span className="font-medium">{cat.label}</span>
                                        {activeCategory !== cat.id && (
                                            <span className="text-xs text-gray-400 group-hover:text-accent">{cat.count}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Grid Area */}
                <div className="flex-1 min-w-0" id="roles-grid">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-accent-600" />
                            {activeCategory === "All" ? "All Resume Formats" : `${categories.find(c => c.id === activeCategory)?.label} Formats`}
                        </h2>
                        <span className="text-sm text-gray-500">
                            Showing {Math.min(visibleCount, filteredRoles.length)} of {filteredRoles.length} results
                        </span>
                    </div>

                    {filteredRoles.length === 0 ? (
                        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setActiveCategory("All");
                                }}
                                className="mt-4 text-accent-600 font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedRoles.map((role) => (
                                <RoleCard
                                    key={role.slug}
                                    role={role}
                                    countryCode={countryCode}
                                    category={getCategoryForRole(role, categories)}
                                />
                            ))}
                        </div>
                    )}

                    {visibleCount < filteredRoles.length && (
                        <div className="mt-10 text-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 24)}
                                className="px-8 py-3 bg-white border border-gray-300 shadow-sm rounded-lg text-gray-700 hover:bg-gray-50 hover:text-accent-600 font-medium transition-all"
                            >
                                Load More Formats
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getCategoryForRole(role, categories) {
    const title = role.job_title?.toLowerCase() || "";
    // Simplified category matching
    const cat = categories.find(c => {
        if (c.id === "All") return false;
        return c.keywords?.some(k => title.includes(k));
    });
    return cat ? cat.label : "General";
}

import Image from 'next/image';

function RoleCard({ role, countryCode, category }) {
    // Construct link based on country code
    const href = "/resume-builder";

    return (
        <Link
            href={href}
            className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-accent-300 transition-all duration-200 group overflow-hidden"
        >
            {/* Template Preview Image */}
            <div className="relative h-48 w-full bg-gray-100 border-b border-gray-100 overflow-hidden">
                <Image
                    src={role.hero_image || "/templates/onepager-previews/bold.png"}
                    alt={`${role.job_title} Resume Template`}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/20 backdrop-blur-md border border-white/30 text-white">
                        {category}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-accent-600 transition-colors line-clamp-2">
                    {role.job_title}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                    {role.meta_description || "Detailed resume format and guide."}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-400 pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                        <span>{role.experience_level || "Any Exp"}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
