"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewTrainerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ai-interview');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-pulse text-blue-600 font-medium">
        Redirecting to AI Interview...
      </div>
    </div>
  );
}