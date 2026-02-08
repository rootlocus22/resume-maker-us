'use client';

import { useEffect } from 'react';
import { trackReferrer } from '../lib/referrerTracking';

/**
 * ReferrerTracker Component
 * Tracks and stores referrer information on initial page load
 * Should be included in the root layout
 */
export default function ReferrerTracker() {
  useEffect(() => {
    // Track referrer on mount (initial page load or navigation)
    trackReferrer();
  }, []); // Empty dependency array - only run once on mount

  // This component doesn't render anything
  return null;
}

