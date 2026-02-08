"use client";
import CoverLetterBuilder from "../../components/CoverLetterBuilder";
import { useExtension } from "../context/ExtensionContext";
import { useEffect, useState, Suspense } from "react";

function ExtensionCoverLetterContent() {
    const { currentJob } = useExtension();
    const [initialData, setInitialData] = useState({});

    useEffect(() => {
        // Check localStorage fallback if context is empty (reload case)
        if (!currentJob) {
            const stored = localStorage.getItem('extension_job_context');
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    setInitialData({
                        jobTitle: data.title || "",
                        company: data.company || "",
                        jobDescription: data.description || ""
                    });
                } catch (e) { }
            }
        } else {
            setInitialData({
                jobTitle: currentJob.title || "",
                company: currentJob.company || "",
                jobDescription: currentJob.description || ""
            });
        }
    }, [currentJob]);

    // Wrapper to inject data
    // CoverLetterBuilder is complex, we pass initialData to it
    // We key it by company to force re-mount if job changes
    return (
        <div className="pb-20">
            <CoverLetterBuilder
                key={initialData.company || 'new'}
                initialData={initialData}
            />
        </div>
    );
}

export default function ExtensionCoverLetterPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading builder...</div>}>
            <ExtensionCoverLetterContent />
        </Suspense>
    );
}
