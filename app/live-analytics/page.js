'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LiveAnalyticsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to agent dashboard by default
    // In a real app, you'd check user role here
    router.push('/dashboard');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
