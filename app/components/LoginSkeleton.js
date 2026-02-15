
export default function LoginSkeleton() {
    return (
        <div className="min-h-screen flex">
            {/* Left Side Skeleton (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 bg-accent p-12 flex-col justify-between relative overflow-hidden">
                <div className="space-y-6 animate-pulse">
                    <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
                    <div className="space-y-4 pt-12">
                        <div className="h-12 bg-white/20 rounded-lg w-3/4"></div>
                        <div className="h-4 bg-white/20 rounded w-full"></div>
                        <div className="h-4 bg-white/20 rounded w-5/6"></div>
                    </div>
                    <div className="space-y-6 pt-12">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
                                <div className="space-y-2 flex-1 pt-2">
                                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                                    <div className="h-3 bg-white/20 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side Skeleton (Form) */}
            <div className="flex-1 lg:w-1/2 bg-white flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md space-y-8 animate-pulse">
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </div>

                    <div className="h-12 bg-gray-100 rounded-2xl"></div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-12 bg-gray-100 rounded-2xl"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-12 bg-gray-100 rounded-2xl"></div>
                        </div>
                        <div className="h-12 bg-accent-50 rounded-2xl mt-8"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
