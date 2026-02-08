"use client";
import Portal from "./Portal";
import { useEffect, useRef } from "react";

export default function Modal({ children, onClose, isLoading }) {
  const modalRef = useRef(null);

  // Handle clicks outside to close the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <Portal>
      <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-[9999] p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Content */}
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-transform duration-300 scale-100"
        >
          {isLoading ? (
            // Loading Spinner (Updated to match ExpertResume theme)
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#0B1F3B]" />
            </div>
          ) : (
            <>
              {/* Scrollable Content with Mobile Adjustments */}
              <div className="overflow-y-auto p-6 h-full">
                {children}
              </div>

              {/* Footer with Buttons (Updated to match ExpertResume theme) */}
        
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}