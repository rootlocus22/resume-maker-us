
import { UploadCloud } from 'lucide-react';

export default function UploadResumeSkeleton() {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row h-auto min-h-[600px] animate-pulse">
                {/* Left Side - Upload Area */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
                    <div className="h-10 bg-gray-200 rounded w-3/4 mb-4 mx-auto md:mx-0"></div>
                    <div className="h-4 bg-gray-100 rounded w-full mb-8 mx-auto md:mx-0"></div>

                    <div className="bg-accent-50/50 border-2 border-dashed border-accent/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center">
                            <UploadCloud className="text-accent-400" size={32} />
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                    </div>
                </div>

                {/* Right Side - Features/Info */}
                <div className="w-full md:w-1/2 bg-gray-50 p-8 md:p-12 flex flex-col justify-center">
                    <div className="space-y-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
                                <div className="space-y-3 flex-1 pt-1">
                                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
