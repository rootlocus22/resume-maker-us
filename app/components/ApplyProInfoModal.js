import React from 'react';
import { X, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApplyProInfoModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-6 sm:p-8">
                        <h3 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2 pr-8">
                            <Zap className="fill-indigo-600 text-indigo-600" />
                            Why do I need the Apply Pro Engine?
                        </h3>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-indigo-800 mb-2">The "Application Black Hole"</h4>
                                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                    70% of online applications are never read. Without a system to track and follow up, your resume gets lost in the pile.
                                </p>
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <p className="text-xs font-semibold text-indigo-900">
                                        💡 Fact: Candidates who follow up within 48 hours are 3x more likely to get an interview.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-indigo-800 mb-2">Switching Careers is Hard</h4>
                                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                    Recruiters spend 6 seconds on a resume. If you're pivoting, you need to apply to more roles and organize your story perfectly.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        AI Fit Score prevents wasted applications
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        Auto-generated follow-up emails
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
