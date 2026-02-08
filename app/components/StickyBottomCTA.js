"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import { useLocation } from "../context/LocationContext";

export default function StickyBottomCTA() {
    const [isVisible, setIsVisible] = useState(false);
    const { currency } = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden animate-slide-up">
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-3 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Free to Start</span>
                    <span className="text-sm font-bold text-gray-900">Build Your Resume</span>
                </div>
                <Link
                    href="/resume-builder"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                    <Rocket size={16} />
                    Start Now
                    <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
}
