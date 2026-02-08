"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const ExtensionContext = createContext();

export function ExtensionProvider({ children }) {
    const [currentJob, setCurrentJob] = useState(null);
    const lastJobUrlRef = useRef(null);

    useEffect(() => {
        // Global listener for the extension layout
        const handleMessage = (event) => {
            // In production, verify origin matches extension ID
            if (event.data && event.data.type === 'EXTENSION_JOB_DATA') {
                const payload = event.data.payload;
                if (payload && payload.title) {
                    // Check if it's a new job to avoid toast spam
                    if (lastJobUrlRef.current !== payload.url) {
                        // Defer state update to avoid "Cannot update during render" errors
                        setTimeout(() => {
                            console.log("New Job Detected:", payload.title);
                            lastJobUrlRef.current = payload.url;
                            setCurrentJob(payload);
                        }, 100);
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);

        // Also check for initial LocalStorage payload if message was missed
        const storedContext = localStorage.getItem('extension_job_context');
        if (storedContext) {
            try {
                const data = JSON.parse(storedContext);
                if (data.title) {
                    setCurrentJob(data);
                    // Optional: clear it? Maybe keep it for reference.
                }
            } catch (e) { }
        }

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <ExtensionContext.Provider value={{ currentJob, setCurrentJob }}>
            {children}
        </ExtensionContext.Provider>
    );
}

export function useExtension() {
    return useContext(ExtensionContext);
}
