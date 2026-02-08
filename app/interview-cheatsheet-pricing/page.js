"use client";
import { useRouter } from "next/navigation";
import { Brain, CheckCircle, MessageCircle, Target, Crown, Zap, Shield, TrendingUp } from "lucide-react";

export default function InterviewCheatsheetPricing() {
    const router = useRouter();

    const handleGetStarted = (duration) => {
        router.push(`/checkout?billingCycle=monthly&includeInterviewKit=true&duration=${duration}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Interview Prep Kit</h1>
                </div>
            </div>

            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        <Crown className="w-4 h-4" />
                        Crack Your First Round with AI
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Ace Every Interview with <span className="text-blue-600">AI-Powered Prep</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Get personalized interview questions, winning answers, and expert tips tailored to your resume and job description
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">AI Question Generator</h3>
                        <p className="text-sm text-gray-600">Get realistic interview questions based on your role and experience</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <MessageCircle className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Perfect Answers</h3>
                        <p className="text-sm text-gray-600">AI-crafted responses that highlight your strengths effectively</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <Target className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Job-Specific Prep</h3>
                        <p className="text-sm text-gray-600">Tailored to match exact job description requirements</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Confidence Boost</h3>
                        <p className="text-sm text-gray-600">Walk into interviews prepared and confident</p>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {/* 1 Month */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-all">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Starter</h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-gray-900">$4.99</span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Perfect for single interview prep</p>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>Unlimited cheatsheet generations</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>AI-powered Q&A</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>PDF downloads</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>30-day access</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleGetStarted('1month')}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-all"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* 3 Months - Popular */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl border-2 border-blue-500 transform scale-105 relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                            MOST POPULAR
                        </div>
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-white">$9.99</span>
                                <span className="text-blue-100">/3 months</span>
                            </div>
                            <p className="text-sm text-blue-100 mt-2">Best value for job seekers</p>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-sm text-white">
                                <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                <span>Everything in Starter</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-white">
                                <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                <span>Priority AI processing</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-white">
                                <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                <span>90-day access</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-white">
                                <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                <span>Prep for multiple roles</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleGetStarted('3months')}
                            className="w-full bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 rounded-xl transition-all"
                        >
                            Get Started - Best Value
                        </button>
                    </div>

                    {/* 6 Months */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-all">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium</h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-gray-900">$14.99</span>
                                <span className="text-gray-500">/6 months</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Save $5 • Maximum value</p>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>Everything in Pro</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>180-day access</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>Extended job search support</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>Best price guarantee</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleGetStarted('6months')}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-all"
                        >
                            Get Started
                        </button>
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
                    <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">How It Works</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-blue-600">1</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Upload Your Resume</h4>
                            <p className="text-sm text-gray-600">Paste your resume and job description</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-purple-600">2</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">AI Generates Questions</h4>
                            <p className="text-sm text-gray-600">Get personalized interview prep instantly</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">3</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Practice & Ace</h4>
                            <p className="text-sm text-gray-600">Master your answers and land the offer</p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
                    <h3 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h3>
                    <p className="text-xl text-blue-100 mb-8">Join thousands of job seekers who landed their dream jobs</p>
                    <button
                        onClick={() => handleGetStarted('3months')}
                        className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg"
                    >
                        Get Started Now
                    </button>
                </div>
            </div>
        </div>
    );
}
