"use client";
import { useState, useEffect } from "react";

export const useFlashSaleTimer = (initialDurationHours = 48) => {
    const [timeLeft, setTimeLeft] = useState(initialDurationHours * 60 * 60);

    useEffect(() => {
        // Check for existing end time or set a new one
        const FLASH_SALE_KEY = 'expertresume_flash_sale_end';
        let endTime = localStorage.getItem(FLASH_SALE_KEY);

        if (!endTime) {
            // Set end time to 48 hours from now
            endTime = Date.now() + (initialDurationHours * 60 * 60 * 1000);
            localStorage.setItem(FLASH_SALE_KEY, endTime.toString());
        } else {
            endTime = parseInt(endTime);
            // If the sale has already expired more than 24 hours ago, reset it (for testing/recycling)
            // Otherwise, keep it as is (once it hits 0, it stays 0 for that user session)
            if (Date.now() > endTime + (24 * 60 * 60 * 1000)) {
                endTime = Date.now() + (initialDurationHours * 60 * 60 * 1000);
                localStorage.setItem(FLASH_SALE_KEY, endTime.toString());
            }
        }

        const timer = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [initialDurationHours]);

    const formatFlashSaleTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return { timeLeft, formatFlashSaleTime };
};
