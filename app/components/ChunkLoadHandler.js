"use client";

import { useEffect } from "react";

export default function ChunkLoadHandler() {
    useEffect(() => {
        // Handler for global error events
        const handleError = (event) => {
            const errorMsg = event.message || "";
            const isChunkError =
                errorMsg.includes("Loading chunk") ||
                errorMsg.includes("ChunkLoadError") ||
                (event.target && event.target.nodeName === "SCRIPT" && event.target.src.includes("_next/static/chunks"));

            if (isChunkError) {
                console.warn("⚠️ ChunkLoadError detected. Attempting to recover by reloading...", event);

                // Prevent infinite reload loops: Check if we just reloaded for this reason
                const lastReload = sessionStorage.getItem("chunk_reload_ts");
                const now = Date.now();

                if (!lastReload || (now - parseInt(lastReload)) > 10000) {
                    // If no reload in last 10 seconds, reload now
                    sessionStorage.setItem("chunk_reload_ts", now.toString());
                    window.location.reload(true);
                } else {
                    console.error("⚠️ Massive ChunkLoadError loop detected. Not reloading again.");
                }
            }
        };

        // Note: 'error' event on window captures script loading errors (capturing phase for script tags is tricky, but bubbling global error usually catches the runtime exception "Loading chunk failed" thrown by webpack)
        window.addEventListener("error", handleError);

        // Also listen for unhandled rejections if webpack load fails asynchronously
        window.addEventListener("unhandledrejection", (event) => {
            const str = String(event.reason);
            if (str.includes("Loading chunk") || str.includes("ChunkLoadError")) {
                handleError({ message: str });
            }
        });

        return () => {
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleError);
        };
    }, []);

    return null; // This component handles side-effects only, renders nothing
}
