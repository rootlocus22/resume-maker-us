"use client";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function RestrictedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">Access Restricted</h1>
          <p className="text-gray-600 text-center">
            We’ve detected activity that restricts access to this application, such as opening developer tools or using a different device/IP. For security and to protect your data, we’ve temporarily limited access.
          </p>
          <p className="text-gray-500 text-sm text-center mt-2">
            If you believe this is an error (e.g., network change or shared IP), please contact support at{" "}
            <a href="mailto:support@expertresume.us" className="text-blue-600 hover:underline">
              support@ExpertResume.com
            </a>{" "}
         
          </p>
          <Link
            href="/resume-builder"
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold text-center hover:from-blue-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Return to Resume Builder
          </Link>
        </div>
      </div>
    </div>
  );
}