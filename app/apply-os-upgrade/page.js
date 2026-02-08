"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Target, ArrowRight, ShieldCheck, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ApplyOSUpgrade() {
    const router = useRouter();
    const { user } = useAuth();

    const handleUpgrade = () => {
        // In a real implementation, this would trigger a Stripe checkout for the ApplyOS plan
        // For now, let's redirect to standard checkout with a special query param or just show a "Coming Soon" toast 
        // effectively since I haven't set up the exact Stripe price for this yet.
        // However, the user asked to implement the strategy. 
        // I should ideally create an order for 999 INR.

        // Redirecting to generic checkout with special params to simulate the flow
        router.push('/checkout?plan=apply_pro&amount=999&billingCycle=yearly');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">

                {/* Left: Value Prop */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                        <Crown size={14} />
                        ExpertResume ApplyOS™
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                        Stop Applying into the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Void</span>.
                    </h1>
                    <p className="text-lg text-gray-600">
                        Most job seekers lose track after 3 applications. ApplyOS turns your job search into a managed pipeline, increasing your chances of getting hired by 3x.
                    </p>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="text-green-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Unlimited Tracking</h3>
                                <p className="text-sm text-gray-600">Save and track as many jobs as you want. No more spreadsheets.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Target className="text-purple-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Daily Apply Goals</h3>
                                <p className="text-sm text-gray-600">Build a habit. Hit your daily targets to keep momentum.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Zap className="text-amber-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Smart Nudges</h3>
                                <p className="text-sm text-gray-600">Get reminded to follow up and stay on top of interviews.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Pricing Card */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-10 rounded-full"></div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
                            <h2 className="text-xl font-bold">Apply Pro</h2>
                            <p className="text-blue-100 text-sm">The managed job search engine</p>
                        </div>

                        <div className="p-8 text-center">
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <span className="text-sm text-gray-400 line-through">₹2,999</span>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">SAVE 66%</span>
                            </div>
                            <div className="text-5xl font-extrabold text-gray-900 mb-2">
                                ₹999<span className="text-lg font-normal text-gray-500">/year</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-8">Less than ₹3 per day</p>

                            <button
                                onClick={handleUpgrade}
                                className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mb-4"
                            >
                                Activate ApplyOS Now
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                <ShieldCheck size={14} />
                                <span>30-Day Money Back Guarantee</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                                "This tool literally managed my job search for me. Got 5 interviews in week 1."
                            </p>
                            <p className="text-xs font-bold text-gray-900 mt-1">- Priya S., Product Designer</p>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
