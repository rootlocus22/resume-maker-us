
export default function EditProfileSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
                {/* Header */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>

                {/* Profile Form Skeleton */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 space-y-8">
                        {/* Photo Upload Section */}
                        <div className="flex items-center space-x-6 mb-8 border-b pb-8">
                            <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
                            <div className="space-y-3 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                                <div className="h-10 bg-gray-100 rounded w-32"></div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="sm:col-span-3 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-10 bg-gray-100 rounded w-full"></div>
                                </div>
                            ))}

                            <div className="sm:col-span-6 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-32 bg-gray-100 rounded w-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end gap-3">
                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                        <div className="h-10 bg-[#0B1F3B]/10 rounded w-24"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
