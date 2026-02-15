"use client";
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AddonInfoTooltip({ title, description, benefits = [], fomoMessage }) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [arrowLeft, setArrowLeft] = useState(0);
    const buttonRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Update position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const updatePosition = () => {
                const rect = buttonRef.current.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const isMobile = viewportWidth < 768;
                const TOOLTIP_WIDTH = isMobile ? 256 : 288; // w-64 vs w-72 matches tailwind
                const PADDING = 12; // Safety margin

                // Calculate icon center
                const iconCenter = rect.left + (rect.width / 2);

                // Calculate ideal left edge of tooltip (centered on icon)
                let idealLeft = iconCenter - (TOOLTIP_WIDTH / 2);

                // Clamp left edge to be within screen bounds
                const minLeft = PADDING;
                const maxLeft = viewportWidth - TOOLTIP_WIDTH - PADDING;

                // Final strictly clamped left position
                const finalLeft = Math.max(minLeft, Math.min(idealLeft, maxLeft));

                // Calculate arrow position based on where the tooltip ended up
                // Arrow needs to be at relative X = (Icon Center - Tooltip Left Edge)
                const arrowRelativeX = iconCenter - finalLeft;

                setPosition({
                    top: rect.top - 12, // 12px gap
                    left: finalLeft
                });
                setArrowLeft(arrowRelativeX);
            };

            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            const handleClickOutside = (event) => {
                if (buttonRef.current && !buttonRef.current.contains(event.target)) {
                    // Check if click is inside the tooltip content (which is portal) becomes tricky
                    // BUT our tooltip content has onClick={(e) => e.stopPropagation()}.
                    // So clicks inside tooltip won't bubble to window.
                    // Clicks outside (on window) will trigger this.
                    // EXCEPT: if click was on button, button handler runs.
                    setIsOpen(false);
                }
            };
            window.addEventListener('click', handleClickOutside);

            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('click', handleClickOutside);
            };
        }
    }, [isOpen]);

    const toggleTooltip = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div className="relative inline-block ml-1.5 focus:outline-none group/tooltip">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleTooltip}
                    className="text-accent bg-accent-50 hover:bg-accent-100 hover:text-accent-700 transition-all p-1 rounded-full shadow-sm focus:outline-none flex items-center justify-center border border-accent/10"
                >
                    <Info size={14} className="stroke-2" />
                </button>
            </div>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{
                                position: 'fixed',
                                top: position.top,
                                left: position.left,
                                transform: 'translateY(-100%)', // Only lift up, no X transform
                                zIndex: 9999,
                                width: window.innerWidth < 768 ? '256px' : '288px', // Enforce specific width
                                maxWidth: 'calc(100vw - 24px)' // Ultimate safety fallback
                            }}
                            className="mb-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-visible pointer-events-auto"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <div className="p-3 md:p-4 bg-gradient-to-br from-white to-gray-50 text-left overflow-hidden rounded-xl relative z-10">
                                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    {title}
                                </h4>
                                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                    {description}
                                </p>
                                {benefits.length > 0 && (
                                    <ul className="space-y-1.5 mb-2">
                                        {benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                                                <span className="text-green-500 font-bold mt-0.5">✓</span>
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {fomoMessage && (
                                    <div className="mt-2 pt-2 border-t border-purple-100 text-[10px] sm:text-xs font-semibold text-purple-700 flex items-start gap-1.5 bg-purple-50/50 -mx-3 sm:-mx-4 -mb-3 sm:-mb-4 p-3 rounded-b-xl">
                                        <Sparkles size={14} className="mt-0.5 flex-shrink-0 text-purple-600 fill-purple-100" />
                                        <span>{fomoMessage}</span>
                                    </div>
                                )}
                            </div>
                            {/* Arrow */}
                            <div
                                className="absolute -bottom-1.5 w-3 h-3 bg-gray-50 border-r border-b border-gray-200 rotate-45 z-20"
                                style={{
                                    left: arrowLeft, // Use absolute offset from left edge
                                    bottom: '-6px',
                                    transform: 'translateX(-50%) rotate(45deg)'
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
