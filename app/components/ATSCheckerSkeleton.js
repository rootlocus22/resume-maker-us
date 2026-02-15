
import { UploadCloud, CheckCircle, Star } from 'lucide-react';

export default function ATSCheckerSkeleton() {
    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
            <div className="p-8 md:p-12 text-center border-b border-gray-100">
                <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto mb-8"></div>

                <div className="bg-accent-50/50 border-2 border-dashed border-accent/20 rounded-xl p-10 flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
                    <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center">
                        <UploadCloud className="text-accent-400" size={32} />
                    </div>
                    <div className="space-y-3 w-full flex flex-col items-center">
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                    </div>
                    <div className="h-12 bg-accent-50 rounded-full w-48 mt-4"></div>
                </div>

                <div className="mt-8 flex justify-center gap-6 text-sm text-gray-400">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                            <div className="h-4 bg-gray-100 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-50 p-6 flex justify-center gap-8">
                <div className="h-12 w-32 bg-gray-200 rounded-lg"></div>
                <div className="h-12 w-32 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    );
}
