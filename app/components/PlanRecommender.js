"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Target, Rocket, Briefcase, Brain, Star, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '../lib/globalPricing';

import { PLAN_CONFIG, ADDON_CONFIG } from '../lib/planConfig';

export default function PlanRecommender({ onRecommend, currency = 'INR' }) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ needs: [] }); // Initialize needs as array
    const [recommendation, setRecommendation] = useState(null);

    const questions = [
        {
            id: 'intent',
            question: "What is your immediate goal?",
            options: [
                {
                    id: 'immediate',
                    text: "I need a resume for one specific application TODAY.",
                    icon: <Zap className="w-5 h-5 text-yellow-500" />,
                    desc: "Quick & Easy"
                },
                {
                    id: 'job_search',
                    text: "I am actively applying to many jobs.",
                    icon: <Target className="w-5 h-5 text-accent" />,
                    desc: "Best Value"
                },
                {
                    id: 'career_growth',
                    text: "I want a complete career transformation.",
                    icon: <Rocket className="w-5 h-5 text-purple-500" />,
                    desc: "Comprehensive"
                }
            ]
        },
        {
            id: 'needs',
            question: "What else do you need help with?",
            options: [
                {
                    id: 'resume_only',
                    text: "Just the resume, I can handle the rest.",
                    icon: <FileTextIcon className="w-5 h-5 text-gray-500" />,
                    desc: "Standard"
                },
                {
                    id: 'finding_jobs',
                    text: "Finding relevant jobs to apply to.",
                    icon: <Briefcase className="w-5 h-5 text-green-500" />,
                    desc: "Smart Search"
                },
                {
                    id: 'interview_prep',
                    text: "Preparing for interviews & salary negotiation.",
                    icon: <Brain className="w-5 h-5 text-primary" />,
                    desc: "Full Prep"
                }
            ]
        }
    ];

    // Helper for step 2 to filter options based on step 1
    const getCurrentQuestion = () => {
        // If they selected 'immediate', we might skip the second question or simplify it
        // For now, let's keep it simple standard flow
        return questions[step];
    };

    const handleAnswer = (optionId) => {
        const currentQ = questions[step];

        // Handle Multi-Select for 'needs' question
        if (currentQ.id === 'needs') {
            const currentNeeds = answers.needs || [];
            let newNeeds;

            if (currentNeeds.includes(optionId)) {
                newNeeds = currentNeeds.filter(id => id !== optionId);
            } else {
                newNeeds = [...currentNeeds, optionId];
            }

            setAnswers({ ...answers, needs: newNeeds });
            // Don't auto-advance for multi-select
            return;
        }

        // Standard Single-Select logic for Step 1
        const newAnswers = { ...answers, [currentQ.id]: optionId };
        setAnswers(newAnswers);

        if (currentQ.id === 'intent' && optionId === 'immediate') {
            // Immediate need skips step 2
            const result = calculateRecommendation({ ...newAnswers, needs: [] });
            setRecommendation(result);
        } else {
            setStep(step + 1);
        }
    };

    const handleNextStep = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            const result = calculateRecommendation(answers);
            setRecommendation(result);
        }
    };

    const calculateRecommendation = (finalAnswers) => {
        const { intent, needs } = finalAnswers;
        let basePlan = 'monthly';
        let billingCycle = 'monthly';
        let addons = [];
        let title = "Pro Monthly Plan";
        let reason = "Great for a focused month of applications.";
        let features = ["30 Days Access", "Unlimited Downloads", "Full AI Features"];

        // RECOMMENDATION LOGIC (Bundled)
        if (intent === 'immediate') {
            basePlan = 'basic';
            billingCycle = 'basic';
            title = "Starter Plan";
            reason = "Perfect for a specific application. Affordable & Fast.";
            features = ["7 Days Access", "5 Downloads", "AI Suggestions"];
        } else if (needs.includes('interview_prep') || intent === 'career_growth') {
            // Maximum needs or long term goal -> Six Month
            basePlan = 'sixMonth';
            billingCycle = 'sixMonth';
            title = "Ultimate Pro (6-Month)";
            reason = "Complete career package with Interview Simulation  & Job Search.";
            features = ["180 Days Access", "Unlimited Downloads", "AI Interview Prep", "Auto-Apply Engine", "Job Search Pro"];
            addons = ['jobTracker', 'interviewKit', 'applyPro'];
        } else if (needs.includes('finding_jobs') || intent === 'job_search') {
            // Active search but maybe not full interview module -> Quarterly
            basePlan = 'quarterly';
            billingCycle = 'quarterly';
            title = "Expert Pro (Quarterly)";
            reason = "Best balance for active job seekers.";
            features = ["90 Days Access", "Unlimited Downloads", "Job Search Pro", "AI Cover Letters"];
            addons = ['jobTracker'];
        }

        const totalPrice = PLAN_CONFIG[basePlan].price[currency];

        return {
            plan: basePlan,
            billingCycle,
            addons,
            title,
            price: formatPrice(totalPrice, currency),
            reason,
            features
        };
    };

    const handleProceed = () => {
        if (!recommendation) return;

        const params = new URLSearchParams();
        params.set('billingCycle', recommendation.billingCycle);

        if (recommendation.addons.includes('jobTracker')) {
            params.set('includeJobSearch', 'true');
        }
        if (recommendation.addons.includes('interviewKit')) {
            params.set('includeInterviewKit', 'true');
        }
        if (recommendation.addons.includes('applyPro')) {
            params.set('includeApplyPro', 'true');
        }

        router.push(`/checkout?${params.toString()}`);
    };

    // If we have a recommendation, show the result card
    if (recommendation) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-accent-100 overflow-hidden"
            >
                <div className="bg-gradient-to-r from-primary to-accent p-6 text-white text-center">
                    <h2 className="text-2xl font-bold mb-2">We Found Your Perfect Match!</h2>
                    <p className="opacity-90">Based on your goals, we recommend:</p>
                </div>

                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                <span className="text-sm font-semibold text-accent-600 uppercase tracking-wide">Recommended For You</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">{recommendation.title}</h3>
                            <p className="text-gray-600">{recommendation.reason}</p>
                        </div>
                        <div className="text-center bg-gray-50 p-4 rounded-xl min-w-[120px]">
                            <div className="text-sm text-gray-500 mb-1">Starting at</div>
                            <div className="text-3xl font-bold text-gray-900">{recommendation.price}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {recommendation.features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2 text-gray-700">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="font-medium">{feat}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleProceed}
                            className="flex-1 bg-accent hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            Get Started Now <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => { setRecommendation(null); setStep(0); setAnswers({ needs: [] }); }}
                            className="px-6 py-4 text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    const currentQ = questions[step];

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 w-full">
                    <motion.div
                        className="h-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                    />
                </div>

                <div className="p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <span className="inline-block px-3 py-1 bg-accent-50 text-accent-600 rounded-full text-xs font-bold tracking-wide mb-3">
                            STEP {step + 1} OF {questions.length}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{currentQ.question}</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {currentQ.options.map((option) => {
                            const isSelected = currentQ.id === 'needs'
                                ? (answers.needs || []).includes(option.id)
                                : answers[currentQ.id] === option.id;

                            return (
                                <motion.button
                                    key={option.id}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => handleAnswer(option.id)}
                                    className={`flex items-center p-4 border-2 rounded-xl text-left bg-white group transition-all
                                        ${isSelected ? 'border-accent bg-accent-50 ring-2 ring-accent-100' : 'border-gray-200 hover:border-accent-300'}
                                    `}
                                >
                                    <div className={`p-3 rounded-lg transition-colors mr-4 ${isSelected ? 'bg-white text-accent-600' : 'bg-gray-50 text-gray-600'}`}>
                                        {option.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-lg transition-colors ${isSelected ? 'text-accent-700' : 'text-gray-900'}`}>
                                            {option.text}
                                        </h3>
                                        <p className="text-sm text-gray-500">{option.desc}</p>
                                    </div>
                                    <div className={`ml-auto transition-opacity text-accent ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                                        {currentQ.id === 'needs' ? <CheckCircle2 className="w-6 h-6 fill-accent-100" /> : <ArrowRight className="w-6 h-6" />}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Show Continue button only for Multi-Select Step */}
                    {currentQ.id === 'needs' && (
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleNextStep}
                                className="bg-accent hover:bg-accent-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
                            >
                                See My Plan <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Icon component helper
function FileTextIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    );
}
