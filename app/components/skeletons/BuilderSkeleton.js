import React from 'react';

export default function BuilderSkeleton() {
    return (
        // Root container matching ResumeBuilder: "min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex flex-col items-center justify-center p-2 sm:p-4 md:p-4 lg:p-6"
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex flex-col items-center justify-center p-2 sm:p-4 md:p-4 lg:p-6">

            {/* Desktop Layout Wrapper: "hidden md:flex flex-1 w-full mx-auto space-x-3" */}
            <div className="hidden md:flex flex-1 w-full mx-auto space-x-3">

                {/* Main Content Area: "flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">

                    {/* Header: "border-b border-gray-200 bg-gray-50/50 px-6 py-4" */}
                    <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 h-[73px] flex items-center justify-between shrink-0">
                        {/* Left Actions */}
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="h-8 w-px bg-gray-300" />
                            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                        {/* Right Actions */}
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="h-8 w-px bg-gray-300" />
                            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                    </div>

                    {/* Content Grid: "grid grid-cols-2 gap-0 h-[calc(100vh-14rem)]" */}
                    {/* Note: h-[calc(100vh-14rem)] is approx 100vh - 224px. We'll use flex-1 to fill the parent which is set by the page layout */}
                    <div className="grid grid-cols-2 gap-0 flex-1 overflow-hidden">

                        {/* Left Panel - Form: "bg-gray-50 border-r border-gray-200 overflow-y-auto" */}
                        <div className="bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
                            <div className="max-w-2xl mx-auto space-y-8">
                                <div className="space-y-4">
                                    <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
                                    <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-10 w-full bg-white border border-gray-200 rounded-lg animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Preview: "bg-white overflow-y-auto" */}
                        <div className="bg-white overflow-y-auto p-8 flex justify-center">
                            <div className="w-[210mm] h-[297mm] bg-white shadow-lg border border-gray-100 transform scale-[0.6] origin-top animate-pulse">
                                <div className="p-12 space-y-6">
                                    <div className="flex gap-6 border-b pb-8">
                                        <div className="h-20 w-20 bg-gray-100 rounded-full" />
                                        <div className="space-y-3 flex-1">
                                            <div className="h-8 w-2/3 bg-gray-100 rounded" />
                                            <div className="h-4 w-1/3 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="h-5 w-1/4 bg-gray-100 rounded" />
                                            <div className="h-20 w-full bg-gray-50 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Mobile Layout Skeleton (fallback for small screens) */}
            <div className="flex flex-col min-h-screen w-full max-w-md mx-auto md:hidden bg-white">
                {/* Header Row 1: Main Actions */}
                <div className="h-14 border-b border-gray-200 px-3 flex items-center justify-between sticky top-0 bg-white z-30">
                    <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
                </div>
                {/* Header Row 2: Tabs (Crucial for CLS) */}
                <div className="h-12 border-b border-gray-200 px-3 flex items-center gap-2 sticky top-[56px] bg-white z-20">
                    <div className="h-8 flex-1 bg-gray-100 rounded animate-pulse" />
                </div>

                <div className="p-4 space-y-6">
                    <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 w-full bg-gray-50 rounded-lg animate-pulse border border-gray-100" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
