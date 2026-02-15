
import { Loader2 } from 'lucide-react';

export default function OnePagerSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Skeleton */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-3">
                    <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex p-6 gap-6 overflow-hidden">
                {/* Left Panel - Editor Skeleton */}
                <div className="w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 overflow-y-auto animate-pulse">

                    {/* Section Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-24 h-10 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        ))}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-12 bg-gray-100 rounded"></div>
                            <div className="h-12 bg-gray-100 rounded"></div>
                        </div>
                        <div className="h-12 bg-gray-100 rounded"></div>

                        <div className="h-4 bg-gray-200 rounded w-1/3 mt-6"></div>
                        <div className="h-24 bg-gray-100 rounded"></div>
                    </div>
                </div>

                {/* Right Panel - Preview Skeleton */}
                <div className="w-1/2 bg-gray-200/50 rounded-xl flex items-center justify-center p-4">
                    <div className="w-full max-w-[210mm] aspect-[210/297] bg-white shadow-lg rounded animate-pulse flex flex-col p-8 space-y-4">
                        {/* Resume Header */}
                        <div className="flex items-center gap-4 border-b pb-6 mb-2">
                            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>

                        {/* Resume Body */}
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay (Optional, for transitions) */}
            <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <span className="text-sm font-medium text-gray-600">Loading Builder...</span>
                </div>
            </div>
        </div>
    );
}
