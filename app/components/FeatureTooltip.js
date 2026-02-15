// app/components/FeatureTooltip.js
// Reusable tooltip component for explaining features
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function FeatureTooltip({ 
  content, 
  title = null,
  position = 'top', // 'top', 'bottom', 'left', 'right'
  className = '',
  iconSize = 14,
  maxWidth = 280
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isMobile = viewportWidth < 768;
        const TOOLTIP_WIDTH = Math.min(maxWidth, viewportWidth - 24);
        const PADDING = 12;
        const ARROW_SIZE = 8;

        let top = 0;
        let left = 0;
        let arrowTop = 0;
        let arrowLeft = 0;

        switch (position) {
          case 'top':
            top = rect.top - 8; // Position above
            left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
            arrowTop = 'auto';
            arrowLeft = TOOLTIP_WIDTH / 2 - ARROW_SIZE;
            break;
          case 'bottom':
            top = rect.bottom + ARROW_SIZE + 8;
            left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
            arrowTop = -ARROW_SIZE;
            arrowLeft = TOOLTIP_WIDTH / 2 - ARROW_SIZE;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - TOOLTIP_WIDTH - ARROW_SIZE - 8;
            arrowTop = -ARROW_SIZE;
            arrowLeft = TOOLTIP_WIDTH - ARROW_SIZE;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + ARROW_SIZE + 8;
            arrowTop = -ARROW_SIZE;
            arrowLeft = -ARROW_SIZE;
            break;
        }

        // Clamp to viewport
        left = Math.max(PADDING, Math.min(left, viewportWidth - TOOLTIP_WIDTH - PADDING));
        top = Math.max(PADDING, Math.min(top, viewportHeight - TOOLTIP_WIDTH - PADDING));

        setTooltipPosition({ top, left });
        setArrowPosition({ top: arrowTop, left: arrowLeft });
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, position, maxWidth]);

  const toggleTooltip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (e) => {
    if (buttonRef.current && !buttonRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <span className={`relative inline-block ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleTooltip}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="text-accent hover:text-accent-700 transition-colors inline-flex items-center justify-center focus:outline-none"
          aria-label="More information"
        >
          <Info size={iconSize} className="stroke-2" />
        </button>
      </span>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: 'fixed',
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                transform: position === 'top' ? 'translateY(-100%)' : 'none',
                zIndex: 9999,
                width: `${maxWidth}px`,
                maxWidth: 'calc(100vw - 24px)',
                pointerEvents: 'auto',
              }}
              className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 text-sm text-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="font-semibold text-gray-900 mb-1">{title}</div>
              )}
              <div>{content}</div>
              
              {/* Arrow */}
              <div
                style={{
                  position: 'absolute',
                  top: position === 'top' ? '100%' : position === 'bottom' ? '-8px' : '50%',
                  left: position === 'left' || position === 'right' ? (position === 'left' ? '100%' : '-8px') : '50%',
                  width: '8px',
                  height: '8px',
                  transform: position === 'top' 
                    ? 'rotate(45deg) translateX(-50%)' 
                    : position === 'bottom'
                    ? 'rotate(45deg) translateX(-50%)'
                    : position === 'left'
                    ? 'rotate(45deg) translateY(-50%)'
                    : 'rotate(45deg) translateY(-50%)',
                  backgroundColor: 'white',
                  borderRight: position === 'top' ? '1px solid #e5e7eb' : 'none',
                  borderBottom: position === 'top' ? '1px solid #e5e7eb' : 'none',
                  borderTop: position === 'bottom' ? '1px solid #e5e7eb' : 'none',
                  borderLeft: position === 'bottom' ? '1px solid #e5e7eb' : 'none',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
