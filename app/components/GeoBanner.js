"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Globe, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const GeoBanner = () => {
    const [geo, setGeo] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Only trigger if user is NOT already on a US or UK path
        const isOnInternationalPath = pathname.startsWith('/us') || pathname.startsWith('/uk');

        const fetchGeo = async () => {
            try {
                const res = await fetch('/api/geo');
                const data = await res.json();
                setGeo(data);

                if (data.country === 'US' && !pathname.startsWith('/us')) {
                    setIsVisible(true);
                } else if (data.country === 'GB' && !pathname.startsWith('/uk')) {
                    setIsVisible(true);
                }
            } catch (err) {
                console.error('Failed to fetch geo data:', err);
            }
        };

        if (!isOnInternationalPath) {
            fetchGeo();
        }
    }, [pathname]);

    if (!isVisible || !geo) return null;

    const isUS = geo.country === 'US';

    return (
        <div className="bg-slate-900 text-white py-2.5 px-4 relative z-[100] border-b border-slate-800">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base">
                <div className="flex items-center gap-2 font-medium">
                    <Globe className="w-4 h-4 text-accent-400" />
                    <span>
                        {isUS
                            ? "Looking for US Standard Resume Examples?"
                            : "Applying for jobs in the UK?"}
                    </span>
                </div>

                <Link
                    href={isUS ? "/us/resume-examples" : "/uk/cv-examples"}
                    className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-600 text-white px-4 py-1 rounded-full text-sm font-bold transition-colors group"
                >
                    {isUS ? "Visit US Edition" : "Switch to UK CVs"}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-800 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>
        </div>
    );
};

export default GeoBanner;
