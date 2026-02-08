"use client";
import React from "react";
import { Zap, Clock } from "lucide-react";
import Link from "next/link";
import { useFlashSaleTimer } from "../hooks/useFlashSaleTimer";

const FlashSaleBanner = ({ className = "", compact = false }) => {
    const { timeLeft, formatFlashSaleTime } = useFlashSaleTimer();

    if (compact) {
        return (
            <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                    <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700 hidden sm:block">
                        <Clock size={16} />
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-sm font-bold text-amber-900 flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="flex items-center gap-1 justify-center sm:justify-start">
                                <Zap size={14} className="fill-amber-500 text-amber-600" />
                                Flash Sale Active
                            </span>
                            <span className="hidden sm:inline text-amber-300">|</span>
                            <span className="font-normal text-amber-800">
                                Offers expire in <span className="font-bold tabular-nums bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">{formatFlashSaleTime(timeLeft)}</span>
                            </span>
                        </p>
                    </div>
                </div>
                <Link
                    href="/checkout?planId=monthly"
                    className="text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-sm whitespace-nowrap w-full sm:w-auto text-center"
                >
                    Grab Deal
                </Link>
            </div>
        );
    }

    return (
        <div className={`bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-6 mb-8 max-w-3xl mx-auto shadow-sm relative overflow-hidden group ${className}`}>
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={80} className="text-amber-500" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-3 rounded-xl shadow-lg animate-pulse">
                    <Clock size={24} />
                </div>
                <div className="text-center sm:text-left">
                    <h4 className="text-lg sm:text-xl font-bold text-amber-900 flex items-center justify-center sm:justify-start gap-2">
                        ⚡ 48-Hour Flash Sale: Lowest Prices of the Year!
                    </h4>
                    <p className="text-sm text-amber-800 font-medium">
                        Don't miss out! Get Premium access at our special "Sachet" rates before prices increase in <span className="font-bold underline">{formatFlashSaleTime(timeLeft)}</span>.
                    </p>
                </div>
                <div className="ml-auto flex flex-col items-center sm:items-end">
                    <span className="text-[10px] uppercase tracking-widest font-black text-amber-500 mb-1">Status: Active</span>
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">Limited Slots</span>
                </div>
            </div>
        </div>
    );
};

export default FlashSaleBanner;
