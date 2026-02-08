export function WhyChooseSkeleton() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-3xl mb-16 space-y-4">
                    <div className="h-10 sm:h-12 bg-gray-100 rounded-lg w-3/4 mx-auto animate-pulse" />
                    <div className="h-20 bg-gray-100 rounded-lg w-full mx-auto animate-pulse" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-8 rounded-2xl border border-gray-100 h-[300px] animate-pulse bg-gray-50">
                            <div className="w-14 h-14 bg-gray-200 rounded-xl mb-6" />
                            <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
                            <div className="h-20 bg-gray-200 rounded w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SkillsSkeleton() {
    return (
        <div className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-3xl mb-16 space-y-4">
                    <div className="h-10 bg-gray-200 rounded-lg w-3/4 mx-auto animate-pulse" />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
