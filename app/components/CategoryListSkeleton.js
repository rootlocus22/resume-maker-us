
export default function CategoryListSkeleton() {
    return (
        <div className="space-y-12 animate-pulse">
            {[1, 2, 3].map((categoryIndex) => (
                <div key={categoryIndex} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
                    {/* Category Header Skeleton */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>

                    {/* Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((itemIndex) => (
                            <div key={itemIndex} className="block group">
                                <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all duration-300 bg-gray-50 h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
