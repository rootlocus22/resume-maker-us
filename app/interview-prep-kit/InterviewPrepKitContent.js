"use client";
import InterviewCheatsheet from "../components/InterviewCheatsheet";
import AuthProtection from "../components/AuthProtection";

export default function InterviewPrepKitContent() {
    return (
        <AuthProtection>
            <InterviewCheatsheet standalone={true} />
        </AuthProtection>
    );
}
