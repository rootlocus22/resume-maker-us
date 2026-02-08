"use client";
import { useEffect, Suspense } from "react";
import JobDescriptionResumeBuilder from "../../components/JobDescriptionResumeBuilder";
import { useExtension } from "../context/ExtensionContext";
import { useSearchParams } from "next/navigation";

function ExtensionBuilderContent() {
    const { currentJob } = useExtension();
    const searchParams = useSearchParams(); // Properly used inside Suspense

    return (
        <div className="pb-10">
            <JobDescriptionResumeBuilder
                quickAccessMode={true}
            />
        </div>
    );
}

export default function ExtensionBuilderPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading builder...</div>}>
            <ExtensionBuilderContent />
        </Suspense>
    );
}
