"use client";
import dynamic from "next/dynamic";
import ATSCheckerSkeleton from "../components/ATSCheckerSkeleton";

const ATSScoreCheckerClient = dynamic(() => import("./ATSScoreCheckerClient"), {
    // ssr: false removed to improve LCP
    loading: () => <ATSCheckerSkeleton />
});

export default function ATSCheckerWrapper() {
    return <ATSScoreCheckerClient />;
}
