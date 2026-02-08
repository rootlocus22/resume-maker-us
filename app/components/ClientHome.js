"use client";

import dynamic from 'next/dynamic';

// Dynamically import the Home component with no SSR
const HomeContent = dynamic(() => import('./Home'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
  ssr: false
});

export default function ClientHome() {
  return <HomeContent />;
} 