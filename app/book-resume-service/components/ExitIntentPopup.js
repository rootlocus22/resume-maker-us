"use strict";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ExitIntentPopup({ isOpen, onClose, onWhatsAppClick }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-xl p-8 max-w-md w-full relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="text-center">
                            <div className="text-5xl mb-4">🎁</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Wait! Don't Miss Out</h3>
                            <p className="text-gray-600 mb-6">
                                Get <span className="font-bold text-blue-600">10% OFF</span> your first order + Free resume review worth ₹299
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={onWhatsAppClick}
                                    className="bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-6 py-3 rounded-lg transition-all"
                                >
                                    Claim Offer on WhatsApp
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-gray-600 hover:text-gray-900 text-sm"
                                >
                                    No thanks, I'll pay full price
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
