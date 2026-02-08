"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Lock, Crown, Sparkles, Zap, Target } from "lucide-react";
import { ADDON_CONFIG, formatUSPrice, getDiscountedPrice } from "../lib/planConfig";
import { useAuth } from "../context/AuthContext";
import { getEffectivePricing, formatPrice } from "../lib/globalPricing";
import { useLocation } from "../context/LocationContext";
import AddonInfoTooltip from "./AddonInfoTooltip";

// Enhanced with compact mode and tooltips (using Reusable Component)
export default function AddonUpsellCard({ addonId, title, description, variant = "default", location = "dashboard", compact = false, actionLink, actionText, icon: IconProp }) {
    const { user, userData, isQuarterlyPlan, isSixMonthPlan } = useAuth();
    const { currency } = useLocation();

    // Check if user already has this feature (via plan or addon)
    const hasAddon = React.useMemo(() => {
        if (!userData) return false;

        // Map addon IDs to specific user flags
        if (addonId === 'job_search') return !!userData.hasJobTrackerFeature || isQuarterlyPlan || isSixMonthPlan;
        if (addonId === 'interview_kit') return !!userData.hasInterviewKit || isSixMonthPlan;
        if (addonId === 'apply_pro') return !!userData.hasApplyPro || isSixMonthPlan;
        if (addonId === 'interview_gyani') return userData.interview_plan === 'interview_gyani' || isSixMonthPlan;

        // Fallback to generic addons object/array
        if (userData?.addons) {
            if (Array.isArray(userData.addons)) {
                return userData.addons.includes(addonId);
            }
            return !!userData.addons[addonId];
        }
        return false;
    }, [userData, addonId, isQuarterlyPlan, isSixMonthPlan]);

    if (hasAddon) return null;

    // Features can now be bundled, so we look for config in ADDON_CONFIG or defined below
    const addonConfig = ADDON_CONFIG[addonId] || {
        name: title || (addonId === 'job_search' ? "AI Job Search" : addonId === 'interview_kit' ? "Interview Prep Kit" : addonId === 'apply_pro' ? "Apply Pro Engine" : "Premium Feature"),
        description: description || "Unlock advanced career tools.",
        features: ["Premium Access", "Priority Results", "AI Powered"],
        price: { INR: 0, USD: 0 } // Bundled price is effectively 0 in the card display as we upsell to plans
    };

    // Get pricing - if bundled, we show "Included in Pro"
    const effectiveCurrency = currency || "INR";
    const price = addonConfig.price[effectiveCurrency];
    const displayPrice = typeof price === 'object' ? price.monthly || price.quarterly : price;
    const formattedPrice = formatPrice(displayPrice, effectiveCurrency);

    // Styling
    const styles = {
        default: "bg-white border-gray-200 shadow-sm",
        premium: "bg-gradient-to-br from-gray-900 to-gray-800 text-white border-gray-700 shadow-xl",
        highlight: "bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-200 shadow-md",
        emerald: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-md",
        purple: "bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200 shadow-md"
    };

    const buttonStyles = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        premium: "bg-white text-gray-900 hover:bg-gray-100",
        highlight: "bg-blue-600 text-white hover:bg-blue-700",
        emerald: "bg-emerald-600 text-white hover:bg-emerald-700",
        purple: "bg-purple-600 text-white hover:bg-purple-700"
    };

    const Icon = IconProp || {
        job_search: Target,
        interview_kit: Zap,
        apply_pro: Sparkles,
        interview_gyani: Brain
    }[addonId] || Crown;

    const fomoMessage = {
        job_search: "🚀 Get Ahead: While others search manually, you'll be applying to hidden roles they never see.",
        interview_kit: "⚡ Winning Edge: Most candidates fail tailored questions. You won't.",
        apply_pro: "🔥 Competitive Advantage: Generic resumes get ignored. Tailored applications get read."
    }[addonId];

    // Determine target link for bundled features
    const targetLink = actionLink || (
        addonId === 'job_search' ? '/checkout?billingCycle=quarterly&step=1' :
            ['interview_kit', 'apply_pro', 'interview_gyani'].includes(addonId) ? '/checkout?billingCycle=sixMonth&step=1' :
                `/checkout?addon=${addonId}`
    );

    return (
        <div className={`group relative rounded-xl border flex flex-col justify-between h-full transition-all duration-300 hover:scale-[1.02] ${styles[variant]} ${compact ? 'p-3' : 'p-5'}`}>

            <div>
                <div className={`flex items-center gap-3 ${compact ? 'mb-2' : 'mb-3'}`}>
                    <div className={`p-2 rounded-lg ${variant === 'premium' ? 'bg-gray-700/50' : 'bg-white/60 shadow-sm'}`}>
                        <Icon size={compact ? 16 : 20} className={variant === 'premium' ? 'text-yellow-400' : 'text-blue-600'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <h3 className={`font-bold ${compact ? 'text-sm' : 'text-base'} ${variant === 'premium' ? 'text-white' : 'text-gray-900'}`}>
                                {title || addonConfig.name}
                            </h3>
                            {compact && (
                                <AddonInfoTooltip
                                    title={title || addonConfig.name}
                                    description={description || addonConfig.description}
                                    benefits={addonConfig.features}
                                    fomoMessage={fomoMessage}
                                />
                            )}
                        </div>
                        {/* In compact mode, show price next to title or just simple tag */}
                        {compact && (
                            <div className={`text-[10px] font-bold mt-0.5 ${variant === 'premium' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                Included in {addonId === 'job_search' ? 'Quarterly' : '6-Month'}
                            </div>
                        )}
                    </div>
                </div>

                {!compact && (
                    <>
                        <p className={`text-sm mb-4 ${variant === 'premium' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {description || addonConfig.description}
                        </p>
                        <ul className="space-y-2 mb-5">
                            {(addonConfig.features || []).slice(0, 3).map((feature, i) => (
                                <li key={i} className={`text-xs flex items-start gap-2 ${variant === 'premium' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <CheckCircle size={14} className={`shrink-0 ${variant === 'premium' ? 'text-green-400' : 'text-green-500'}`} />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            <div className="mt-auto">
                {!compact && (
                    <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs uppercase font-bold tracking-wider ${variant === 'premium' ? 'text-gray-400' : 'text-gray-400'}`}>
                            Now Included
                        </span>
                        <span className={`text-xs font-bold ${variant === 'premium' ? 'text-white' : 'text-gray-900'}`}>
                            with {addonId === 'job_search' ? 'Pro Quarterly' : 'Pro 6-Month'}
                        </span>
                    </div>
                )}

                <Link href={targetLink} className="block">
                    <button className={`w-full ${compact ? 'py-1.5 text-xs' : 'py-2.5 text-sm'} rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${buttonStyles[variant]}`}>
                        {actionText || (compact ? 'Unlock' : 'Get Started')} <ArrowRight size={compact ? 12 : 16} />
                    </button>
                </Link>
            </div>
        </div>
    );
}
