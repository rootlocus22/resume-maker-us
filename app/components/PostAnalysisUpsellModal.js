"use client";

import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { getEffectivePricing, formatPrice, getPricingConfigByCurrency } from "../lib/globalPricing";
import { useLocation } from "../context/LocationContext";

export default function PostAnalysisUpsellModal({ isOpen, onClose, onUpgrade }) {
    const { currency: locationCurrency } = useLocation();
    const currency = locationCurrency || 'USD';
    const planKey = currency === 'USD' ? 'basic' : 'oneDay';
    const [pricing, setPricing] = useState({ basic: 1399, currency: 'USD' });
    const [anchorPrice, setAnchorPrice] = useState(null);

    useEffect(() => {
        const prices = getEffectivePricing(currency);
        setPricing(prices);

        const config = getPricingConfigByCurrency(prices.currency);
        const plan = config?.plans?.[planKey];
        if (plan?.anchorPrice) {
            setAnchorPrice(plan.anchorPrice);
        }
    }, [currency, planKey]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
                {/* Header - Urgency Driver */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-md border border-white/30 animate-pulse">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Fix Your ATS Score?</h2>
                        <p className="text-red-100 font-medium">Don't get rejected by the bot.</p>
                    </div>
                </div>

                {/* Body - The "Quick Fix" Offer */}
                <div className="p-6 md:p-8">
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-1 rounded-full mt-0.5">
                                <Check className="w-4 h-4 text-green-700" />
                            </div>
                            <div>
                                <span className="font-bold text-gray-900">Unlock Resume Download</span>
                                <p className="text-xs text-gray-500">Get the PDF instantly</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-1 rounded-full mt-0.5">
                                <Check className="w-4 h-4 text-green-700" />
                            </div>
                            <div>
                                <span className="font-bold text-gray-900">Fix Formatting Errors</span>
                                <p className="text-xs text-gray-500">Auto-align for ATS parsing</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-1 rounded-full mt-0.5">
                                <Check className="w-4 h-4 text-green-700" />
                            </div>
                            <div>
                                <span className="font-bold text-gray-900">Add Missing Keywords</span>
                                <p className="text-xs text-gray-500">Manual edit access enabled</p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Action */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center mb-6">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Limited Time Quick-Fix Offer</p>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            {anchorPrice && anchorPrice > (pricing[planKey] / 100) && (
                                <span className="text-gray-400 line-through text-sm">{formatPrice(anchorPrice * 100, pricing.currency)}</span>
                            )}
                            <span className="text-3xl font-black text-slate-900">{formatPrice(pricing[planKey], pricing.currency)}</span>
                        </div>
                        {anchorPrice && anchorPrice > (pricing[planKey] / 100) && (
                            <p className="text-xs text-green-600 font-bold">Save {Math.round(((anchorPrice - (pricing[planKey] / 100)) / anchorPrice) * 100)}%</p>
                        )}
                    </div>

                    <button
                        onClick={() => onUpgrade(planKey)}
                        className="w-full bg-accent hover:bg-accent-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Fix My Resume Now</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full mt-3 py-2 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
                    >
                        No, I'll take the risk
                    </button>
                </div>
            </div>
        </div>
    );
}
