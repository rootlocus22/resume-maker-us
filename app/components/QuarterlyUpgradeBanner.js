"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles, Target, Zap } from "lucide-react";
import Image from "next/image";
import { getPlanPrice, formatPrice } from "../lib/globalPricing";

const QuarterlyUpgradeBanner = ({ className = "", currency = "INR" }) => {
    // Get prices from global pricing config (already in smallest units - paise/cents)
    const monthlyPrice = getPlanPrice("monthly", currency);
    const quarterlyPrice = getPlanPrice("quarterly", currency);

    // Format prices for display
    const formattedMonthlyPrice = formatPrice(monthlyPrice, currency);
    const formattedQuarterlyPrice = formatPrice(quarterlyPrice, currency);

    return (
        <div className={`relative overflow-hidden rounded-2xl shadow-lg border border-indigo-100 group ${className}`}>
            {/* Background with Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/career-success-banner.png"
                    alt="Career Success Background"
                    fill
                    className="object-cover object-right opacity-90 group-hover:scale-105 transition-transform duration-700"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-900/80 to-indigo-900/60" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6">
                {/* Left Content */}
                <div className="flex-1 text-white max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-xs font-semibold text-indigo-100 mb-4 animate-fade-in-up">
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Recommended Upgrade</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                        Land Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-100">Dream Job</span> Faster
                    </h2>

                    <p className="text-indigo-100 text-sm md:text-base mb-6 opacity-90 leading-relaxed max-w-lg">
                        Don't let download limits slow you down. Unlock the full power of ExpertResume to accelerate your career growth.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                            <div className="bg-green-500/20 p-1 rounded-full">
                                <CheckCircle size={16} className="text-green-400" />
                            </div>
                            Unlimited Downloads
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                            <div className="bg-blue-500/20 p-1 rounded-full">
                                <Target size={16} className="text-blue-400" />
                            </div>
                            AI Job Search
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                            <div className="bg-purple-500/20 p-1 rounded-full">
                                <Zap size={16} className="text-purple-400" />
                            </div>
                            Career Roadmap
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                            <div className="bg-indigo-500/20 p-1 rounded-full">
                                <Sparkles size={16} className="text-indigo-400" />
                            </div>
                            Interview Gyani
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                            <div className="bg-amber-500/20 p-1 rounded-full">
                                <Zap size={16} className="text-amber-400" />
                            </div>
                            Apply Pro
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                            <div className="bg-rose-500/20 p-1 rounded-full">
                                <Target size={16} className="text-rose-400" />
                            </div>
                            Interview Prep Kit
                        </div>
                    </div>
                </div>

                {/* Right CTAs - Improved Design */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto md:min-w-[420px]">
                    {/* Monthly CTA - Refined Design */}
                    <Link href={`/checkout?billingCycle=monthly&currency=${currency}`} className="flex-1">
                        <button className="w-full group/btn relative overflow-hidden bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-4 px-4 rounded-xl border border-white/20 transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1">
                            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">Quick Start</span>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-2xl font-bold">{formattedMonthlyPrice}</span>
                                <span className="text-xs opacity-60">/ month</span>
                            </div>
                            <ArrowRight size={16} className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                        </button>
                    </Link>

                    {/* Quarterly CTA - Premium Design */}
                    <Link href={`/checkout?billingCycle=quarterly&currency=${currency}`} className="flex-1">
                        <button className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1">
                            <span className="text-xs uppercase tracking-wider font-semibold text-amber-100">Best Value 🔥</span>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-2xl font-bold">{formattedQuarterlyPrice}</span>
                                <span className="text-xs opacity-80">/ 3 months</span>
                            </div>
                            <ArrowRight size={16} className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        </button>
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default QuarterlyUpgradeBanner;
