"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mic, Play, Square, Volume2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveDemoWidget({ role, country }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [step, setStep] = useState('idle'); // idle, listening, analyzing, result

    const handleStart = () => {
        setStep('listening');
        // Simulate listening
        setTimeout(() => {
            setStep('analyzing');
        }, 3000);
        // Simulate result
        setTimeout(() => {
            setStep('result');
        }, 5000);
    };

    const handleReset = () => {
        setStep('idle');
    };

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 relative min-h-[300px] flex flex-col overflow-hidden shadow-2xl">
            {/* Dynamic Header */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-slate-400 font-mono text-sm uppercase tracking-wider">Live AI Simulation</span>
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-blue-900/30 text-blue-400 text-xs border border-blue-500/20">{country} Mode</span>
                    <span className="px-2 py-1 rounded bg-purple-900/30 text-purple-400 text-xs border border-purple-500/20">{role}</span>
                </div>
            </div>

            {/* Interactive Area */}
            <div className="flex-1 flex flex-col justify-center items-center relative z-10">
                <AnimatePresence mode='wait'>
                    {/* Direct CTA State */}
                    <motion.div
                        key="cta"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <Link href="/interview-gyani/setup">
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/40 cursor-pointer hover:scale-110 transition-transform group relative">
                                <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></span>
                                <Mic className="w-10 h-10 text-white group-hover:rotate-12 transition-transform" />
                            </div>
                        </Link>
                        <h3 className="text-2xl text-white font-bold mb-3">Start Real Practice</h3>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                            Don't just watch a demo. Experience the full AI interview tailored for
                            <span className="text-blue-400 font-semibold mx-1">{country}</span>
                            employers.
                        </p>

                        <Link
                            href="/interview-gyani/setup"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-900 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                        >
                            Launch Interview Interface <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
