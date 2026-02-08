"use client";
import dynamic from "next/dynamic";
import UploadResumeSkeleton from "../components/UploadResumeSkeleton";

const UploadResumeContainerClient = dynamic(() => import("./UploadResumeContainerClient"), {
    // ssr: false was causing high LCP. Enabling SSR (default) to improve initial paint.
    loading: () => <UploadResumeSkeleton />
});

export default function UploadResumeWrapper() {
    return <UploadResumeContainerClient />;
}
