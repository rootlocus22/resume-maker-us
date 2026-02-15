"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, ChevronRight, X, TrendingUp, Filter } from "lucide-react";

export default function ClientJobDirectory({ initialJobs = [] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [visibleCount, setVisibleCount] = useState(24);
    const [selectedRole, setSelectedRole] = useState(null); // For Modal

    // 1. Group Raw Data by Role (Aggregate Locations)
    // Input: [{ role: "Java Dev", location: "Bangalore", category: "Tech" }, ...]
    // Output: { "Java Dev": { roleName: "Java Dev", category: "Tech", locations: [...] } }
    const groupedRoles = useMemo(() => {
        const rolesMap = new Map();

        initialJobs.forEach(job => {
            if (!rolesMap.has(job.role)) {
                rolesMap.set(job.role, {
                    roleName: job.role,
                    category: job.category || "General",
                    description: job.meta_description,
                    locations: [],
                    count: 0
                });
            }
            const roleData = rolesMap.get(job.role);
            roleData.locations.push({ location: job.location, slug: job.slug });
            roleData.count++;
        });

        return Array.from(rolesMap.values());
    }, [initialJobs]);

    // 2. Derive Categories & Counts
    const { categories } = useMemo(() => {
        const catsMap = { "All": 0 };

        groupedRoles.forEach(role => {
            catsMap["All"]++;
            if (!catsMap[role.category]) catsMap[role.category] = 0;
            catsMap[role.category]++;
        });

        // Convert to array for Sidebar
        const catsArray = Object.entries(catsMap).map(([label, count]) => ({
            id: label === "All" ? "All" : label,
            label: label === "All" ? "All Roles" : label,
            count
        }));

        // Sort: All first, then by count descending
        catsArray.sort((a, b) => {
            if (a.id === "All") return -1;
            if (b.id === "All") return 1;
            return b.count - a.count;
        });

        return { categories: catsArray };
    }, [groupedRoles]);


    // Debounced Search Handler
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 3. Filtering Logic uses debounced term
    const filteredRoles = useMemo(() => {
        let results = groupedRoles;

        // Search
        if (debouncedSearchTerm) {
            const lower = debouncedSearchTerm.toLowerCase();
            results = results.filter(r => r.roleName.toLowerCase().includes(lower));
        }

        // Category
        if (activeCategory !== "All") {
            results = results.filter(r => r.category === activeCategory);
        }

        return results;
    }, [groupedRoles, debouncedSearchTerm, activeCategory]);

    const displayedRoles = filteredRoles.slice(0, visibleCount);

    return (
        <div>
            {/* Search Bar - Matching AllRolesDirectory style */}
            <div className="bg-white rounded-lg shadow-lg p-2 mb-8 flex items-center border border-gray-100 sticky top-20 z-30">
                <div className="flex-1 relative flex items-center">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by job role (e.g., Data Scientist)..."
                        className="w-full pl-12 pr-4 py-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-slate-900 text-white px-8 py-3 rounded-md font-medium hover:bg-slate-800 transition-colors hidden sm:block shadow-md">
                    Find Jobs
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Sidebar - Mobile: Horizontal Scroll, Desktop: Vertical Sticky */}
                <aside className="w-full lg:w-64 flex-shrink-0 mb-6 lg:mb-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24 lg:top-4 overflow-hidden">
                        <div className="p-3 lg:p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-sm lg:text-base flex items-center justify-between">
                                Categories
                                <span className="text-xs font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full border border-accent-100">
                                    {categories.length - 1}
                                </span>
                            </h3>
                        </div>
                        {/* Mobile: Horizontal Scroll Container */}
                        <div className="p-2 overflow-x-auto flex lg:block gap-2 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        setVisibleCount(24);
                                        if (window.innerWidth < 1024) {
                                            document.getElementById('roles-grid')?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className={`flex-shrink-0 lg:w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-all duration-200 whitespace-nowrap ${activeCategory === cat.id
                                        ? 'bg-accent text-white shadow-md'
                                        : 'text-gray-600 bg-gray-50 lg:bg-transparent hover:bg-accent-50 hover:text-accent-700'
                                        }`}
                                >
                                    <span className="font-medium mr-2">{cat.label}</span>
                                    {activeCategory !== cat.id && (
                                        <span className="text-xs opacity-70 bg-black/5 px-1.5 rounded-full">{cat.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Grid */}
                <div className="flex-1 min-w-0" id="roles-grid">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-accent-600" />
                            {activeCategory === "All" ? "All Role Guides" : `${activeCategory} Jobs`}
                        </h2>
                        <span className="text-sm text-gray-500">
                            Showing {displayedRoles.length} of {filteredRoles.length} roles
                        </span>
                    </div>

                    {filteredRoles.length === 0 ? (
                        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
                            <button onClick={() => { setSearchTerm(""); setActiveCategory("All"); }} className="text-accent-600 mt-2">
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedRoles.map((role) => (
                                <button
                                    key={role.roleName}
                                    onClick={() => setSelectedRole(role)}
                                    className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-accent-300 transition-all duration-200 group overflow-hidden text-left"
                                >
                                    <div className="p-5 flex-1 flex flex-col w-full">
                                        <div className="mb-3 flex justify-between items-start">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-50 text-accent-700 border border-accent-100 truncate max-w-[70%]">
                                                {role.category}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-accent-600 transition-colors line-clamp-2">
                                            {role.roleName}
                                        </h3>

                                        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center w-full">
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{role.count} Locations</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-accent" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {visibleCount < filteredRoles.length && (
                        <div className="mt-10 text-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 24)}
                                className="px-8 py-3 bg-white border border-gray-300 shadow-sm rounded-lg text-gray-700 hover:bg-gray-50 hover:text-accent-600 font-medium transition-all"
                            >
                                Load More Roles
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Location Selector Modal */}
            {selectedRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setSelectedRole(null)}>
                    <div
                        className="bg-white w-full max-w-4xl rounded-xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slideUp"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{selectedRole.roleName} Jobs</h3>
                                <p className="text-gray-500 text-sm mt-1">Select a location to view the specialized guide</p>
                            </div>
                            <button onClick={() => setSelectedRole(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {selectedRole.locations.map((loc) => (
                                    <Link
                                        key={loc.slug}
                                        href={`/jobs?location=${encodeURIComponent(loc.slug)}`}
                                        className="group flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-accent-400 hover:bg-accent-50 transition-all"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary">
                                            {loc.location}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
