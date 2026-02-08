import React from 'react';

export default function MyResumesSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-32 bg-[#0B1F3B]/10 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Toolbar Skeleton */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                    <div className="flex-1 max-w-md h-10 bg-white border border-gray-200 rounded-xl animate-pulse" />
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-36 bg-white border border-gray-200 rounded-xl animate-pulse" />
                        <div className="hidden sm:flex h-10 w-20 bg-white border border-gray-200 rounded-xl animate-pulse" />
                    </div>
                </div>

                {/* Card Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Preview Area */}
                            <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-gray-100 flex items-center justify-center">
                                <div className="w-20 space-y-1.5 opacity-20">
                                    <div className="h-2.5 bg-gray-400 rounded-sm w-full animate-pulse" />
                                    <div className="h-1.5 bg-gray-300 rounded-sm w-3/4 animate-pulse" />
                                    <div className="h-1 bg-gray-300 rounded-sm w-full animate-pulse" />
                                    <div className="h-1 bg-gray-300 rounded-sm w-5/6 animate-pulse" />
                                    <div className="h-1 bg-gray-300 rounded-sm w-full animate-pulse" />
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                    <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                                    <div className="flex items-center gap-1">
                                        <div className="h-7 w-16 bg-gray-200 rounded-lg animate-pulse" />
                                        <div className="h-7 w-7 bg-gray-100 rounded-lg animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
