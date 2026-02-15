"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AuthProtection({ children, fallback = null }) {
  const { user, loading } = useAuth(); // Use loading from AuthContext
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect if auth is ready (not loading) and user is not authenticated
    if (!loading && !user && !hasRedirected) {
      setHasRedirected(true);
      
      // Store the current URL (where user wanted to go) before redirecting to login
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentPath);
        console.log(`🔒 Storing redirect intent: ${currentPath}`);
      }
      
      router.push('/login');
    }
  }, [user, loading, router, hasRedirected, pathname]);

  // Show loading while checking authentication with better UX
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-50 via-white to-primary-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-accent-50 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Preparing Your Workspace</h3>
          <p className="text-sm text-gray-600">Just a moment...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show a message while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-50 via-white to-primary-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-accent-50 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Authentication Required</h3>
          <p className="text-sm text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render the children
  return children;
}
