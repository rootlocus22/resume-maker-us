//trigger build 2
"use client";
import { useAuth } from "./context/AuthContext";
import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";

import CookieYesController from "./components/CookieYesController";
import CCPABanner from "./components/CCPABanner";
import GeoBanner from "./components/GeoBanner";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";


export default function ClientLayout({ children }) {
  const { user, userType } = useAuth();
  const pathname = usePathname();



  // Pages where we don't want to show the header/footer
  const authPages = ['/login', '/signup'];
  const publicProfilePages = ['/public-profile'];
  const fullScreenPages = ['/expertresume-chat', '/interview-gyani/session'];

  const isExtensionPage = pathname.startsWith('/extension');
  const isPublicProfilePage = publicProfilePages.some(page => pathname.startsWith(page));
  const isFullScreenPage = fullScreenPages.some(page => pathname.startsWith(page));

  const showConsumerHeader = !authPages.includes(pathname) && !isPublicProfilePage && !isExtensionPage && !isFullScreenPage;
  const showConsumerFooter = !authPages.includes(pathname) && !isPublicProfilePage && !isExtensionPage && !isFullScreenPage;

  const safeCheck = () => {
    const handleContextMenu = (e) => e.preventDefault();
    // Disable copy/cut
    const handleCopyCut = (e) => e.preventDefault();
    // Disable PrintScreen
    const handleKeyDown = (e) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        // Optionally, clear clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText("");
        }
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }
  useEffect(() => {
    // Disable right-click in production
    if (process.env.NODE_ENV === "production") {
      safeCheck();
    }


  }, []);

  // Set body attributes for CookieYes control
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Set homepage attribute
      const isHomepage = pathname === '/';
      document.body.setAttribute('data-pathname', pathname);

      if (isHomepage) {
        document.body.setAttribute('data-homepage', 'true');
      } else {
        document.body.removeAttribute('data-homepage');
      }
    }
  }, [pathname]);

  // Extension page layout - minimal
  if (isExtensionPage) {
    return (
      <>
        <Toaster position="bottom-center" />
        <main className="min-h-screen bg-white">
          {children}
        </main>
        <Analytics />
      </>
    )
  }

  // Otherwise use consumer layout
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            maxWidth: '400px',
            fontSize: '14px',
          },
        }}
      />




      {/* Top Banner for Geo Redirection */}
      <GeoBanner />

      {/* Only show header when not on auth pages and not enterprise */}
      {showConsumerHeader && <Header />}
      <main className="flex-1 w-full overflow-y-auto min-h-screen relative">
        <div className="relative">
          {children}
        </div>
      </main>
      <Analytics />
      {/* Show Footer on all pages except enterprise, auth pages, live dashboard, and public profile pages */}
      {showConsumerFooter && <Footer />}

      {/* CookieYes Controller - Hide banner on non-homepage pages */}
      <CookieYesController />

      {/* CCPA Cookie Banner - Only for expertresume.com (US) */}
      <CCPABanner />
    </>
  );
}