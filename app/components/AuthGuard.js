"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AuthGuard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect logged-in users to /my-resumes
        if (!loading && user) {
            router.push("/my-resumes");
        }
    }, [user, loading, router]);

    return null; // Renders nothing, just handles side effect
}
