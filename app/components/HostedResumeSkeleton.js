
export default function HostedResumeSkeleton() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Left Sidebar Skeleton (Desktop) */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse mb-6"></div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 p-4 md:p-8 flex justify-center">
                <div className="w-full max-w-[210mm] aspect-[210/297] bg-white shadow-xl rounded-sm animate-pulse p-8 space-y-6">

                    {/* Resume Header */}
                    <div className="flex items-center gap-6 border-b-2 border-gray-100 pb-8">
                        <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                        <div className="space-y-3 flex-1">
                            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="flex gap-4 pt-2">
                                <div className="h-4 bg-gray-100 rounded w-20"></div>
                                <div className="h-4 bg-gray-100 rounded w-20"></div>
                            </div>
                        </div>
                    </div>

                    {/* Resume Sections */}
                    {[1, 2, 3].map(section => (
                        <div key={section} className="space-y-4 pt-4">
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}
