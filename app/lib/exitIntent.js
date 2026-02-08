"use client";

import { useState, useEffect, useRef } from 'react';

export class ExitIntentDetector {
  constructor(options = {}) {
    this.options = {
      threshold: 20,
      maxDisplays: 1,
      delay: 1000, // Reduced to 1 second
      sensitivity: 15,
      ...options
    };
    
    this.displayed = false;
    this.startTime = Date.now();
    this.callbacks = [];
    this.mouseY = 0;
    this.isEnabled = true;
    this.navigationBlocked = false;
    
    const shown = sessionStorage.getItem('exitIntentShown');
    if (shown && parseInt(shown) >= this.options.maxDisplays) {
      this.isEnabled = false;
      return;
    }
    
    this.init();
  }
  
  init() {
    if (!this.isEnabled) return;
    
    // Primary exit detection methods
    document.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    // Mobile specific events
    this.addMobileEvents();
    
    // Navigation blocking and detection
    this.addNavigationBlocking();
    
    // Tab/window events
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  addMobileEvents() {
    let lastTouchY = 0;
    let touchStartTime = 0;
    
    document.addEventListener('touchstart', (e) => {
      lastTouchY = e.touches[0].clientY;
      touchStartTime = Date.now();
    });
    
    document.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - lastTouchY;
      const timeDelta = Date.now() - touchStartTime;
      
      // Fast upward swipe near top (pull-to-refresh gesture or trying to reach address bar)
      if (deltaY < -40 && currentY < 80 && timeDelta < 300) {
        this.triggerExitIntent('mobile_fast_swipe_up');
      }
      
      lastTouchY = currentY;
    });
    
    // Orientation change might indicate app switching
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.triggerExitIntent('orientation_change'), 300);
    });
  }
  
  addNavigationBlocking() {
    // Block all navigation attempts and show exit intent
    const blockNavigation = (e) => {
      if (this.displayed || !this.isEnabled) return;
      
      const target = e.target.closest('a[href], button[onclick], [data-href]');
      if (target) {
        const href = target.getAttribute('href') || target.getAttribute('data-href') || '#';
        
        // Don't block form submissions or same-page anchors
        if (href.startsWith('#') || target.type === 'submit') return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Store the intended destination
        sessionStorage.setItem('pendingNavigation', href);
        
        this.triggerExitIntent('navigation_attempt');
        return false;
      }
    };
    
    // Use capture phase to catch events early
    document.addEventListener('click', blockNavigation, true);
    
    // Block browser navigation
    window.addEventListener('popstate', (e) => {
      if (this.displayed || !this.isEnabled) return;
      
      e.preventDefault();
      history.pushState(null, '', window.location.href);
      this.triggerExitIntent('back_button');
    });
    
    // Push state to detect back button
    history.pushState(null, '', window.location.href);
  }
  
  handleMouseLeave(e) {
    // Only trigger if mouse leaves from the top (towards address bar/close button)
    if (e.clientY <= this.options.threshold) {
      this.triggerExitIntent('mouse_leave_top');
    }
  }
  
  handleMouseMove(e) {
    this.mouseY = e.clientY;
    
    // Detect rapid upward movement towards browser controls
    if (e.clientY <= this.options.threshold && e.movementY < -this.options.sensitivity) {
      this.triggerExitIntent('rapid_upward_movement');
    }
  }
  
  handleVisibilityChange() {
    if (document.hidden) {
      this.triggerExitIntent('tab_hidden');
    }
  }
  
  handleKeyDown(e) {
    // Common exit keyboard shortcuts
    const exitKeys = [
      { key: 'w', ctrl: true }, // Ctrl+W
      { key: 't', ctrl: true }, // Ctrl+T  
      { key: 'l', ctrl: true }, // Ctrl+L
      { key: 'F4', alt: true }, // Alt+F4
      { key: 'r', ctrl: true }, // Ctrl+R (refresh)
    ];
    
    const isExitKey = exitKeys.some(combo => 
      e.key.toLowerCase() === combo.key.toLowerCase() && 
      e.ctrlKey === !!combo.ctrl && 
      e.altKey === !!combo.alt
    );
    
    if (isExitKey) {
      e.preventDefault();
      this.triggerExitIntent('keyboard_shortcut');
    }
    
    // ESC key
    if (e.key === 'Escape') {
      this.triggerExitIntent('escape_key');
    }
    
    // Tab switching (Alt+Tab, Cmd+Tab)
    if ((e.altKey && e.key === 'Tab') || (e.metaKey && e.key === 'Tab')) {
      e.preventDefault();
      this.triggerExitIntent('tab_switch');
    }
  }
  
  handleBeforeUnload(e) {
    this.triggerExitIntent('before_unload');
  }
  
  handleWindowBlur() {
    // Only trigger if user has been on page for minimum time
    const timeOnPage = Date.now() - this.startTime;
    if (timeOnPage > this.options.delay) {
      this.triggerExitIntent('window_blur');
    }
  }
  
  triggerExitIntent(trigger) {
    if (!this.isEnabled || this.displayed) return;
    
    // Check minimum time on page
    const timeOnPage = Date.now() - this.startTime;
    if (timeOnPage < this.options.delay) return;
    
    console.log(`Exit intent triggered by: ${trigger}`);
    
    this.displayed = true;
    this.isEnabled = false;
    
    // Update session storage
    const currentCount = parseInt(sessionStorage.getItem('exitIntentShown') || '0');
    sessionStorage.setItem('exitIntentShown', (currentCount + 1).toString());
    
    // Track analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_triggered', {
        event_category: 'Conversion',
        event_label: trigger,
        custom_parameters: {
          time_on_page: timeOnPage,
          trigger_type: trigger
        }
      });
    }
    
    // Execute callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(trigger, timeOnPage);
      } catch (error) {
        console.error('Exit intent callback error:', error);
      }
    });
  }
  
  onExitIntent(callback) {
    this.callbacks.push(callback);
  }
  
  destroy() {
    this.isEnabled = false;
    document.removeEventListener('mouseleave', this.handleMouseLeave);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('blur', this.handleWindowBlur);
  }
  
  manualTrigger() {
    this.triggerExitIntent('manual_test');
  }
}

export const hasShownExitIntent = () => {
  if (typeof window === 'undefined') return true;
  return parseInt(sessionStorage.getItem('exitIntentShown') || '0') > 0;
};

export const resetExitIntent = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('exitIntentShown');
};

export const useExitIntent = (options = {}) => {
  const [triggered, setTriggered] = useState(false);
  const [triggerInfo, setTriggerInfo] = useState(null);
  const detectorRef = useRef(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const detector = new ExitIntentDetector(options);
    detectorRef.current = detector;
    
    detector.onExitIntent((trigger, timeOnPage) => {
      setTriggered(true);
      setTriggerInfo({ trigger, timeOnPage });
    });
    
    return () => {
      detector.destroy();
    };
  }, []);
  
  const manualTrigger = () => {
    if (detectorRef.current) {
      detectorRef.current.manualTrigger();
    }
  };
  
  return { triggered, triggerInfo, manualTrigger };
}; 