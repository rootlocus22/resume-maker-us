'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { logClientError } from '../actions/errorLogging';
import { usePathname } from 'next/navigation';

export default function ErrorFallback({
    error,
    reset,
    title = "Something went wrong",
    message = "We encountered an unexpected error. Please try again.",
    showHomeButton = true
}) {
    const pathname = usePathname();
    const hasLoggedRef = useRef(false);

    useEffect(() => {
        // Prevent double logging in React Strict Mode or fast re-renders
        if (error && !hasLoggedRef.current) {
            hasLoggedRef.current = true;

            const errorPayload = {
                message: error.message || 'Unknown Error',
                stack: error.stack,
                digest: error.digest, // Next.js specific error hash
                cause: error.cause,
                url: typeof window !== 'undefined' ? window.location.href : '',
                path: pathname,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                timestamp: new Date().toISOString()
            };

            logClientError(errorPayload).catch(err => {
                console.error("Failed to automatically log error:", err);
            });
        }
    }, [error, pathname]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center"
            >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {title}
                </h2>

                <p className="text-gray-600 mb-8">
                    {message}
                    {error?.digest && (
                        <span className="block mt-2 text-xs text-gray-400 font-mono">
                            Error ID: {error.digest}
                        </span>
                    )}
                    {process.env.NODE_ENV === 'development' && error?.message && (
                        <span className="block mt-2 text-xs font-mono bg-gray-50 p-2 rounded text-red-600 break-words text-left overflow-auto max-h-32">
                            {error.message}
                        </span>
                    )}
                </p>

                <div className="space-y-3">
                    <button
                        onClick={reset}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary-800 hover:to-accent-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <RefreshCcw size={18} />
                        Try Again
                    </button>

                    {showHomeButton && (
                        <Link
                            href="/"
                            className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all duration-200 border border-gray-200"
                        >
                            <Home size={18} />
                            Back to Home
                        </Link>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
