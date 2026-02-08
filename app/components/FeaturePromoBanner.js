'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, Briefcase, TrendingUp, GraduationCap, ChevronRight, ChevronLeft } from 'lucide-react';

const features = [
    {
        id: 'jd-builder',
        title: 'JD-Based Resume Builder',
        description: 'Tailor your resume to any job description in minutes with AI',
        benefit: 'Get 3x more interview calls by matching job requirements perfectly',
        icon: FileText,
        href: '/job-description-resume-builder',
        gradient: 'from-blue-500 to-indigo-600',
        bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
        id: 'expertresume-gpt',
        title: 'ExpertResume GPT',
        description: 'AI-powered assistant to answer all your career questions instantly',
        benefit: 'Get expert advice on resume, career, and job search 24/7',
        icon: MessageSquare,
        href: '/expertresume-gpt',
        gradient: 'from-purple-500 to-pink-600',
        bgGradient: 'from-purple-50 to-pink-50'
    },
    {
        id: 'interview-coach',
        title: 'Interview Coach',
        description: 'Practice real interview questions with AI feedback',
        benefit: 'Master interviews and increase your offer conversion rate',
        icon: Briefcase,
        href: '/interview-prep-kit',
        gradient: 'from-green-500 to-emerald-600',
        bgGradient: 'from-green-50 to-emerald-50'
    },
    {
        id: 'job-search',
        title: 'AI Job Search',
        description: 'Smart job matching and application tracking in one place',
        benefit: 'Find relevant jobs faster and track your applications effortlessly',
        icon: TrendingUp,
        href: '/jobs-nearby',
        gradient: 'from-orange-500 to-red-600',
        bgGradient: 'from-orange-50 to-red-50'
    },
    {
        id: 'career-coach',
        title: 'Career Coach',
        description: 'Get personalized 6-month career roadmap and guidance',
        benefit: 'Plan your career growth with AI-powered strategic advice',
        icon: TrendingUp,
        href: '/career-coach',
        gradient: 'from-indigo-500 to-blue-600',
        bgGradient: 'from-indigo-50 to-blue-50'
    },
    {
        id: 'english-gyani',
        title: 'EnglishGyani',
        description: 'Master spoken English for job interviews and workplace',
        benefit: 'Speak confidently in interviews and meetings - impress employers',
        icon: GraduationCap,
        href: 'https://www.englishgyani.com/?source=expertresume&medium=promo_banner&campaign=feature_rotation',
        gradient: 'from-teal-500 to-cyan-600',
        bgGradient: 'from-teal-50 to-cyan-50',
        external: true
    },
    {
        id: 'ats-checker',
        title: 'Free ATS Checker',
        description: 'Check your resume score for US ATS systems',
        benefit: 'Fix parsing errors and get 3x more interview calls',
        icon: FileText, // Reusing FileText as ShieldCheck is not imported
        href: '/ats-score-checker',
        gradient: 'from-orange-500 to-red-600',
        bgGradient: 'from-orange-50 to-red-50'
    }
];

export default function FeaturePromoBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        // Change banner every 5 seconds (5000ms) for better readability
        const interval = setInterval(() => {
            setIsTransitioning(true);

            // Wait for fade out animation
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
                setIsTransitioning(false);
            }, 300); // 300ms fade out duration
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handlePrevious = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
            setIsTransitioning(false);
        }, 300);
    };

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
            setIsTransitioning(false);
        }, 300);
    };

    const currentFeature = features[currentIndex];
    const Icon = currentFeature.icon;

    return (
        <div className={`w-full mb-6 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
            <Link
                href={currentFeature.href}
                {...(currentFeature.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="block"
            >
                <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm">
                    <div className="relative p-6 flex items-center justify-between">
                        {/* Icon and Content */}
                        <div className="flex items-start gap-4 flex-1">
                            {/* Icon */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <Icon className="w-6 h-6 text-blue-600" />
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {currentFeature.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-700 mb-2 line-clamp-1">
                                    {currentFeature.description}
                                </p>
                                <p className="text-xs font-medium text-gray-500">
                                    {currentFeature.benefit}
                                </p>
                            </div>
                        </div>


                    </div>

                    {/* Progress Indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                        <div
                            className="h-full bg-blue-500/60 transition-all ease-linear"
                            style={{
                                animation: isTransitioning ? 'none' : 'progress 5s linear',
                                width: isTransitioning ? '100%' : '0%'
                            }}
                        ></div>
                    </div>
                </div>
            </Link>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none">
                <button
                    onClick={handlePrevious}
                    className="pointer-events-auto w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 group"
                    aria-label="Previous feature"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                </button>
                <button
                    onClick={handleNext}
                    className="pointer-events-auto w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 group"
                    aria-label="Next feature"
                >
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
                {features.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setIsTransitioning(true);
                            setTimeout(() => {
                                setCurrentIndex(index);
                                setIsTransitioning(false);
                            }, 300);
                        }}
                        className={`transition-all duration-300 rounded-full ${index === currentIndex
                            ? 'w-6 h-1.5 bg-blue-600'
                            : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                            }`}
                        aria-label={`Go to feature ${index + 1}`}
                    />
                ))}
            </div>

            <style jsx>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
}
