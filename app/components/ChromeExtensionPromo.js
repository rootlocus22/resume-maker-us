import Link from 'next/link';
import { Chrome, CheckCircle2, Star, Zap, Briefcase } from 'lucide-react';
import Image from 'next/image';

const features = [
    {
        icon: <Briefcase className="w-5 h-5 text-[#0B1F3B]" />,
        title: "Auto Job Detection",
        description: "Instantly captures job details from LinkedIn job pages."
    },
    {
        icon: <Zap className="w-5 h-5 text-yellow-500" />,
        title: "Instant Resume Tailoring",
        description: "Customize your resume to match the JD in one click."
    },
    {
        icon: <Star className="w-5 h-5 text-purple-600" />,
        title: "Match Score Analysis",
        description: "Get a detailed score & AI tips to improve your resume."
    },
    {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        title: "Cover Letter Generator",
        description: "Generate a personalized cover letter for every job."
    }
];

export default function ChromeExtensionPromo({ inBuilder = false, className = "" }) {
    const extensionUrl = "https://chromewebstore.google.com/detail/expertresume-ai/hhglapfcjimnjlobmmnohnlhndabanno";

    return (
        <section className={`relative overflow-hidden ${inBuilder ? 'my-4 sm:my-6 mx-0 sm:mx-4 rounded-xl border border-slate-200 shadow-sm' : 'py-12 md:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50'} ${className}`}>
            <div className={`container mx-auto px-4 ${inBuilder ? 'py-6' : ''}`}>
                <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-20">

                    {/* Content Side */}
                    <div className="lg:w-1/2 space-y-6 md:space-y-8 text-center lg:text-left">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B1F3B]/10 text-[#0B1F3B] font-semibold text-xs sm:text-sm">
                                <Chrome className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>New Browser Extension</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                Your AI Career Assistant
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] block mt-2">
                                    Right Inside Your Browser
                                </span>
                            </h2>

                            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Stop switching tabs! ExpertResume AI now lives in your browser side panel.
                                Automatically detect jobs on LinkedIn and generate tailored resumes instantly.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex gap-4 items-start p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{feature.title}</h3>
                                        <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                            <Link
                                href={extensionUrl}
                                target="_blank"
                                className="inline-flex items-center justify-center gap-3 bg-[#0B1F3B] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-[#071429] transition-all shadow-lg hover:shadow-teal-200 transform hover:-translate-y-1 w-full sm:w-auto"
                            >
                                <Chrome className="w-5 h-5 sm:w-6 sm:h-6" />
                                Add to Chrome - It's Free
                            </Link>
                            <div className="flex items-center justify-center gap-4 px-6 py-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm text-left">
                                    <span className="block font-bold text-gray-900">1000+ Users</span>
                                    <span className="text-blue-600 font-medium">★★★★★ 5.0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Side */}
                    <div className="lg:w-1/2 w-full relative mt-8 lg:mt-0">
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-white transform transition-transform hover:scale-[1.01] duration-500">
                            <Image
                                src="/images/extension/store-preview-clean.png"
                                alt="ExpertResume AI Extension Preview"
                                width={800}
                                height={500}
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 rounded-full blur-2xl opacity-20"></div>

                        {/* Floating Badge */}
                        <div className="absolute top-6 -left-4 sm:top-10 sm:-left-6 bg-white p-3 sm:p-4 rounded-xl shadow-xl border border-gray-100 hidden md:block animate-bounce duration-[3000ms]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-lg sm:text-xl">🎯</span>
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase">Match Score</p>
                                    <p className="text-base sm:text-lg font-black text-green-600">95% Match</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}
