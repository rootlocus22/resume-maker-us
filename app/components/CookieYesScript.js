'use client';

import Script from 'next/script';

export default function CookieYesScript() {
  const handleCookieYesLoad = () => {
    // Ensure CookieYes only shows on homepage
    if (typeof window !== 'undefined') {
      console.log('CookieYes script loaded on homepage');
      
      // Add a flag to identify homepage load
      window.cookieYesLoadedOnHomepage = true;
      
      // Immediately check if we're still on homepage
      const currentPath = window.location.pathname;
      const isHomepage = currentPath === '/';
      
      // If not on homepage, hide immediately
      if (!isHomepage) {
        hideAllCookieYesElements();
      }
      
      // Set up a global function to control visibility
      window.controlCookieYesVisibility = (pathname) => {
        const isHomepage = pathname === '/';
        if (!isHomepage) {
          hideAllCookieYesElements();
        } else {
          showAllCookieYesElements();
        }
      };
      
      // Override CookieYes functions to prevent showing on non-homepage
      const originalCkyShow = window.ckyShow;
      const originalCkyShowModal = window.ckyShowModal;
      
      window.ckyShow = function() {
        const currentPath = window.location.pathname;
        if (currentPath === '/') {
          if (originalCkyShow) originalCkyShow.apply(this, arguments);
        }
      };
      
      window.ckyShowModal = function() {
        const currentPath = window.location.pathname;
        if (currentPath === '/') {
          if (originalCkyShowModal) originalCkyShowModal.apply(this, arguments);
        }
      };
      
      // Add CSS to globally hide CookieYes on non-homepage
      addGlobalCSSRules();
    }
  };
  
  const hideAllCookieYesElements = () => {
    const elements = document.querySelectorAll('[id*="cookieyes"], [class*="cky-"], [data-cky-tag], #cky-banner, .cky-consent-container, .cky-banner, .cky-modal');
    elements.forEach(element => {
      element.style.display = 'none !important';
      element.style.visibility = 'hidden !important';
      element.style.opacity = '0 !important';
      element.style.pointerEvents = 'none !important';
      element.style.position = 'absolute !important';
      element.style.left = '-9999px !important';
      element.style.top = '-9999px !important';
    });
  };
  
  const showAllCookieYesElements = () => {
    const elements = document.querySelectorAll('[id*="cookieyes"], [class*="cky-"], [data-cky-tag], #cky-banner, .cky-consent-container, .cky-banner, .cky-modal');
    elements.forEach(element => {
      element.style.display = '';
      element.style.visibility = '';
      element.style.opacity = '';
      element.style.pointerEvents = '';
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';
    });
  };
  
  const addGlobalCSSRules = () => {
    // Add CSS that hides CookieYes on all pages except homepage
    let hideStyle = document.querySelector('#cookieyes-global-hide');
    if (!hideStyle) {
      hideStyle = document.createElement('style');
      hideStyle.id = 'cookieyes-global-hide';
      document.head.appendChild(hideStyle);
    }
    
    hideStyle.textContent = `
      /* Hide CookieYes on all pages by default */
      body:not([data-homepage="true"]) #cookieyes-banner,
      body:not([data-homepage="true"]) .cky-consent-container,
      body:not([data-homepage="true"]) .cky-banner,
      body:not([data-homepage="true"]) .cky-modal,
      body:not([data-homepage="true"]) [data-cky-tag="banner"],
      body:not([data-homepage="true"]) [data-cky-tag="detail-modal"],
      body:not([data-homepage="true"]) [id*="cookieyes"],
      body:not([data-homepage="true"]) [class*="cky-"],
      body:not([data-homepage="true"]) [data-cky-tag] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        z-index: -1 !important;
      }
    `;
    
    // Mark homepage in body attribute
    const currentPath = window.location.pathname;
    if (currentPath === '/') {
      document.body.setAttribute('data-homepage', 'true');
    } else {
      document.body.removeAttribute('data-homepage');
    }
  };

  return (
    <Script
      id="cookieyes"
      src="https://cdn-cookieyes.com/client_data/152840527248718f0d6a1e77/script.js"
      strategy="afterInteractive"
      onLoad={handleCookieYesLoad}
    />
  );
} 