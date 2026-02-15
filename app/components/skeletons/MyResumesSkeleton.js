import React from 'react';

export default function MyResumesSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-slate-100/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="h-7 sm:h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-48 bg-gray-100 rounded mt-2 animate-pulse" />
              </div>
              <div className="h-12 w-full sm:w-36 bg-accent/20 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Toolbar Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 h-10 bg-gray-50 border border-gray-200 rounded-lg animate-pulse" />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-36 bg-gray-50 border border-gray-200 rounded-lg animate-pulse" />
              <div className="hidden sm:flex h-10 w-20 bg-gray-50 border border-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 pb-0">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-5 pt-3 pb-4 sm:pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-50 rounded-md animate-pulse" />
                </div>
              </div>
              <div className="px-4 sm:px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                <div className="h-7 w-16 bg-accent/20 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
