"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle } from "lucide-react";

// US names and cities for realistic social proof
const NAMES = ["Amit", "Priya", "Rahul", "Sneha", "Vikram", "Neha", "Arjun", "Pooja", "Karan", "Ananya", "Rohan", "Divya", "Aditya", "Shruti", "Manish"];
const CITIES = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Chandigarh", "Lucknow", "Indore", "Noida", "Gurgaon"];
const PLANS = ["Pro Quarterly", "Pro 6-Month", "Starter Plan"];

/**
 * SocialProofNotification - Shows "X from Y just upgraded to Z" notifications
 * Used on Checkout page to leverage Bandwagon Effect
 */
export default function SocialProofNotification({ enabled = true }) {
    const [notification, setNotification] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        const showNotification = () => {
            const name = NAMES[Math.floor(Math.random() * NAMES.length)];
            const city = CITIES[Math.floor(Math.random() * CITIES.length)];
            const plan = PLANS[Math.floor(Math.random() * PLANS.length)];
            const minutesAgo = Math.floor(Math.random() * 10) + 1;

            setNotification({ name, city, plan, minutesAgo });
            setIsVisible(true);

            // Hide after 5 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        };

        // First notification after 8-15 seconds
        const initialDelay = Math.floor(Math.random() * 7000) + 8000;
        const initialTimer = setTimeout(showNotification, initialDelay);

        // Subsequent notifications every 25-40 seconds
        const interval = setInterval(() => {
            const delay = Math.floor(Math.random() * 15000) + 25000;
            setTimeout(showNotification, delay);
        }, 40000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [enabled]);

    if (!enabled || !notification) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20, x: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-4 left-4 z-50 max-w-xs bg-white rounded-lg shadow-2xl border border-gray-200 p-3 flex items-start gap-3"
                >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                            {notification.name} from {notification.city}
                        </p>
                        <p className="text-xs text-gray-600">
                            Just upgraded to <span className="font-semibold text-indigo-600">{notification.plan}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {notification.minutesAgo} minute{notification.minutesAgo > 1 ? "s" : ""} ago
                        </p>
                    </div>
                    <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0 animate-pulse" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
