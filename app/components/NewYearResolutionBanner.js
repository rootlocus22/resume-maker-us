import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function NewYearResolutionBanner() {
    return (
        <div className="relative overflow-hidden mb-6 rounded-xl shadow-lg border border-primary-100/50">
            {/* Gentle Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-primary"></div>

            {/* Subtle Decorative Elements - Static */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative z-10 px-4 py-4 sm:px-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">

                {/* Left Side: Compact Content */}
                <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-yellow-200 text-[10px] font-bold uppercase tracking-wide border border-white/20">
                            <Sparkles className="w-3 h-3" />
                            2026 Resolution Offer
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
                        Excel Your Career <span className="text-yellow-300">in 2026!</span>
                    </h2>

                    <p className="text-sm text-primary-100 max-w-lg font-medium">
                        Bundle plans + addons and get <span className="text-white font-bold">upto 20% OFF</span>.
                    </p>
                </div>

                {/* Right Side: Simple CTA */}
                <div className="flex items-center gap-3">
                    <Link href="/checkout?billingCycle=sixMonth&step=1">
                        <button className="group px-5 py-2 bg-white text-primary rounded-full font-bold text-sm shadow-md hover:bg-yellow-50 transition-colors flex items-center gap-2">
                            Claim Offer
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
