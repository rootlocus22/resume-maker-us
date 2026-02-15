"use client";
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Sparkles, Edit3, ChevronDown, Check } from 'lucide-react';
import { getFieldVersionHistory } from '../lib/versionHistory';

const InlineVersionSelector = ({ 
  userId, 
  resumeId, 
  fieldPath,
  currentValue,
  onSelectVersion 
}) => {
  const [versions, setVersions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load version history on mount and when dependencies change
  useEffect(() => {
    if (userId && fieldPath) {
      loadVersionHistory();
    }
  }, [userId, fieldPath]);

  // Refresh history when dropdown opens
  useEffect(() => {
    if (isOpen && userId && fieldPath) {
      loadVersionHistory();
    }
  }, [isOpen, userId, fieldPath]);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Responsive width based on screen size
      let dropdownWidth;
      if (viewportWidth < 640) {
        // Mobile: Full width minus padding
        dropdownWidth = Math.min(viewportWidth - 16, 320);
      } else {
        // Desktop: Standard width
        dropdownWidth = 384;
      }
      
      // Calculate left position (using fixed positioning relative to viewport)
      let leftPosition;
      if (viewportWidth < 640) {
        // Mobile: Center the dropdown
        leftPosition = (viewportWidth - dropdownWidth) / 2;
      } else {
        // Desktop: Right-align with button, but ensure it stays within viewport
        leftPosition = rect.right - dropdownWidth;
        
        // Prevent overflow on the left
        if (leftPosition < 8) {
          leftPosition = 8;
        }
        
        // Prevent overflow on the right
        if (leftPosition + dropdownWidth > viewportWidth - 8) {
          leftPosition = viewportWidth - dropdownWidth - 8;
        }
      }
      
      // Calculate top position (using fixed positioning relative to viewport)
      let topPosition = rect.bottom + 4;
      
      // Check if dropdown would overflow bottom of viewport
      const maxDropdownHeight = 400;
      if (rect.bottom + maxDropdownHeight > viewportHeight) {
        // Position above the button instead
        topPosition = rect.top - maxDropdownHeight - 4;
        
        // If still doesn't fit, position at top with some padding
        if (topPosition < 8) {
          topPosition = 8;
        }
      }
      
      setDropdownPosition({
        top: topPosition,
        left: leftPosition,
        width: dropdownWidth
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        return; // Don't close if clicking the button
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const loadVersionHistory = async () => {
    setIsLoading(true);
    try {
      const history = await getFieldVersionHistory(userId, resumeId, fieldPath, 20);
      
      // Remove duplicate consecutive versions (keep only distinct changes)
      const uniqueVersions = [];
      let lastValue = null;
      
      for (const version of history) {
        const currentValue = version.value?.trim();
        if (currentValue !== lastValue) {
          uniqueVersions.push(version);
          lastValue = currentValue;
        } else {
          console.log('Skipping duplicate version:', version.id);
        }
      }
      
      setVersions(uniqueVersions);
    } catch (error) {
      console.error('Error loading version history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'ai_rephrase':
        return <Sparkles size={12} className="text-purple-500" />;
      case 'ai_bullets':
        return <Sparkles size={12} className="text-accent" />;
      case 'manual_edit':
        return <Edit3 size={12} className="text-gray-500" />;
      default:
        return <Clock size={12} className="text-gray-400" />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'ai_rephrase':
        return 'AI Rephrase';
      case 'ai_bullets':
        return 'AI Bullets';
      case 'manual_edit':
        return 'Manual Edit';
      default:
        return 'Edit';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSelectVersion = (version, index) => {
    setSelectedIndex(index);
    onSelectVersion(version.value);
    setIsOpen(false);
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '(empty)';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Don't show if userId or fieldPath is missing
  if (!userId || !fieldPath) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors border ${
          versions.length > 0
            ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-gray-300'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-gray-200'
        }`}
        title={versions.length > 0 ? "View version history" : "No version history yet"}
      >
        <Clock size={14} />
        <span className="hidden sm:inline">
          {versions.length > 0 
            ? `${versions.length} version${versions.length !== 1 ? 's' : ''}`
            : 'History'
          }
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] flex flex-col"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxHeight: '400px'
          }}
        >
          {/* Header */}
          <div className="p-2 sm:p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock size={14} className="text-accent sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-semibold text-gray-900">Version History</span>
              </div>
              <button
                onClick={loadVersionHistory}
                disabled={isLoading}
                className="text-xs text-accent hover:text-accent-700 disabled:opacity-50 px-1 py-0.5"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Version List */}
          <div className="overflow-y-auto max-h-80">
            {versions.length === 0 ? (
              <div className="p-4 sm:p-6 text-center">
                <Clock size={32} className="mx-auto text-gray-300 mb-2 sm:mb-3 sm:w-10 sm:h-10" />
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">No Version History Yet</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Make edits to this field and your changes will be automatically tracked here.
                  <br />
                  <span className="text-gray-400 mt-1 inline-block">
                    • Changes save after 3 seconds
                    <br />
                    • AI changes save instantly
                  </span>
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {versions.map((version, index) => (
                  <button
                    key={version.id}
                    onClick={() => handleSelectVersion(version, index)}
                    className={`
                      w-full p-2 sm:p-3 text-left hover:bg-accent-50 active:bg-accent-100 transition-colors
                      ${selectedIndex === index ? 'bg-accent-50 border-l-2 border-accent' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1">
                      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                        {getActionIcon(version.action)}
                        <span className="text-xs font-medium text-gray-700 truncate">
                          {getActionLabel(version.action)}
                        </span>
                        {index === 0 && (
                          <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1 sm:px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                        {selectedIndex === index && (
                          <Check size={12} className="text-accent sm:w-3.5 sm:h-3.5" />
                        )}
                        <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                          {formatTimestamp(version.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-600 line-clamp-2 mb-0.5 sm:mb-1 leading-relaxed">
                      {truncateText(version.value, 100)}
                    </p>
                    <div className="text-[10px] sm:text-xs text-gray-400">
                      {version.value.length} chars
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {versions.length > 0 && (
            <div className="p-1.5 sm:p-2 border-t border-gray-200 bg-gray-50">
              <p className="text-[10px] sm:text-xs text-gray-500 text-center">
                Click any version to restore it
              </p>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default InlineVersionSelector;

