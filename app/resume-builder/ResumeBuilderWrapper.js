"use client";

import dynamic from 'next/dynamic';
import BuilderSkeleton from '../components/skeletons/BuilderSkeleton';

// Dynamically import the heavy ResumeBuilder component
// ssr: false is allowed here because this is a Client Component
const ResumeBuilder = dynamic(
    () => import('../components/ResumeBuilder'),
    {
        // ssr: false removed to improve LCP
        loading: () => <BuilderSkeleton />
    }
);

export default function ResumeBuilderWrapper() {
    return <ResumeBuilder />;
}
