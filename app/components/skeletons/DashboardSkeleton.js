import React from 'react';

export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header Skeleton */}
                <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse" />
                                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>

                {/* Quick Links Skeleton */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
                    <div className="h-6 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Feature Cards Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm h-64 p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="space-y-3 flex-1">
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
