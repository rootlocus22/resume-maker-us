'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function CookieYesController() {
  const pathname = usePathname();

  useEffect(() => {
    // Function to hide/show CookieYes banner based on current page
    const controlCookieYesBanner = () => {
      const isHomepage = pathname === '/';
      
      // Set body attribute for CSS targeting
      if (typeof document !== 'undefined') {
        if (isHomepage) {
          document.body.setAttribute('data-homepage', 'true');
        } else {
          document.body.removeAttribute('data-homepage');
        }
      }
      
      // Use global function if available (set by homepage script)
      if (typeof window !== 'undefined' && window.controlCookieYesVisibility) {
        window.controlCookieYesVisibility(pathname);
      }
      
      // Always run our own hiding logic as well
      const hideAllCookieYesElements = () => {
        const selectors = [
          '#cookieyes-banner',
          '.cky-consent-container', 
          '.cky-banner',
          '.cky-modal',
          '[data-cky-tag="banner"]',
          '[data-cky-tag="detail-modal"]',
          '[id*="cookieyes"]',
          '[class*="cky-"]',
          '[data-cky-tag]'
        ];
        
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (!isHomepage) {
              element.style.display = 'none !important';
              element.style.visibility = 'hidden !important';
              element.style.opacity = '0 !important';
              element.style.pointerEvents = 'none !important';
              element.style.position = 'absolute !important';
              element.style.left = '-9999px !important';
              element.style.top = '-9999px !important';
              element.style.zIndex = '-1 !important';
            } else {
              element.style.display = '';
              element.style.visibility = '';
              element.style.opacity = '';
              element.style.pointerEvents = '';
              element.style.position = '';
              element.style.left = '';
              element.style.top = '';
              element.style.zIndex = '';
            }
          });
        });
      };
      
      // Run our hiding logic immediately
      hideAllCookieYesElements();
      
      // Additional fallback checks
      const checkAndHideBanner = () => {
        hideAllCookieYesElements();
        console.log(`CookieYes banner ${isHomepage ? 'enabled' : 'hidden'} on:`, pathname);
      };

      // Check immediately
      checkAndHideBanner();
      
      // Check after a delay in case CookieYes loads later
      setTimeout(checkAndHideBanner, 100);
      setTimeout(checkAndHideBanner, 500);
      setTimeout(checkAndHideBanner, 1000);
      
      // Use MutationObserver to catch dynamically added CookieYes elements
      const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              const element = node;
              if (element.id && element.id.includes('cookieyes') ||
                  (element.className && (typeof element.className === 'string' ? element.className.includes('cky-') : element.className.toString().includes('cky-'))) ||
                  element.getAttribute && element.getAttribute('data-cky-tag')) {
                shouldCheck = true;
              }
            }
          });
        });
        
        if (shouldCheck) {
          setTimeout(checkAndHideBanner, 50);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Cleanup observer on unmount
      return () => observer.disconnect();
    };

    // Control banner visibility
    const cleanup = controlCookieYesBanner();
    
    return cleanup;
  }, [pathname]);

  return null; // This component doesn't render anything
} 